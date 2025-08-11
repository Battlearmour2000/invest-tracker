from rest_framework.decorators import action
from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend, FilterSet
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Sum
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django_filters import FilterSet, DateFromToRangeFilter, CharFilter, BooleanFilter
from django.db.models import F
from .models import InvestmentGoal, MonthlyInvestment, Asset
from .serializers import (
    InvestmentGoalSerializer,
    MonthlyInvestmentSerializer,
    AssetSerializer,
    CustomTokenObtainPairSerializer,
    RegisterUserSerializer,
    RegisterAdminSerializer,
)
from rest_framework.response import Response
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


# --- Custom permission for Asset editing ---
class IsDataAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and getattr(request.user, 'is_data_admin', False)


# --- InvestmentGoal viewset ---
class InvestmentGoalViewSet(viewsets.ModelViewSet):
    serializer_class = InvestmentGoalSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # Disable pagination

    def get_queryset(self):
        return InvestmentGoal.objects.filter(user=self.request.user)\
            .select_related('asset')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()


# --- MonthlyInvestment filters ---
class MonthlyInvestmentFilter(FilterSet):
    date_range = DateFromToRangeFilter(field_name="date")
    goal__name = CharFilter(field_name="goal__name", lookup_expr="icontains")
    profitable = BooleanFilter(method="filter_profitable")

    class Meta:
        model = MonthlyInvestment
        fields = {
            'goal__investment_type': ['exact'],
            'goal__name': ['icontains'],
            'date': ['exact'],
            'asset__ticker': ['exact', 'icontains'],
            # remove old current_price filter (now comes from Asset)
        }

    def filter_profitable(self, queryset, name, value):
        if value:
            return queryset.filter(
                asset__current_price__gt=F('purchase_price')
            )
        else:
            return queryset.filter(
                asset__current_price__lte=F('purchase_price')
            )


# --- MonthlyInvestment viewset ---
class MonthlyInvestmentViewSet(viewsets.ModelViewSet):
    serializer_class = MonthlyInvestmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = MonthlyInvestmentFilter

    def get_queryset(self):
        return MonthlyInvestment.objects.filter(goal__user=self.request.user)

    def perform_create(self, serializer):
        goal_id = self.request.data.get('goal')
        goal = InvestmentGoal.objects.get(id=goal_id, user=self.request.user)
        serializer.save(goal=goal)


# --- Asset viewset ---
class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'update_price']:
            return [IsAuthenticated(), IsDataAdmin()]
        return [permissions.AllowAny()]
    
    @action(detail=True, methods=['post'], permission_classes=[IsDataAdmin])
    def update_price(self, request, pk=None):
        asset = self.get_object()
        new_price = request.data.get('price')
        
        if not new_price:
            return Response({'error': 'Price is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            new_price = float(new_price)
        except (TypeError, ValueError):
            return Response({'error': 'Invalid price format'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update the asset price in database
        asset.current_price = new_price
        asset.last_updated = timezone.now()
        asset.save()
        
        # Broadcast the update to all connected clients
        self._broadcast_price_update(asset.id, new_price)
        
        return Response({
            'status': 'success',
            'new_price': new_price,
            'asset_id': asset.id,
            'timestamp': asset.last_updated
        })
    
    def _broadcast_price_update(self, asset_id, new_price):
        """Helper method to broadcast price updates"""
        channel_layer = get_channel_layer()
        try:
            async_to_sync(channel_layer.group_send)(
                "price_updates",
                {
                    "type": "price.update",  # This matches the method name in consumer
                    "asset_id": asset_id,
                    "new_price": str(new_price),
                    "timestamp": str(timezone.now())
                }
            )
        except Exception as e:
            # Log error but don't fail the request
            print(f"WebSocket broadcast failed: {str(e)}")

    # Add WebSocket support for regular updates too
    def perform_update(self, serializer):
        instance = serializer.save()
        if 'current_price' in serializer.validated_data:
            self._broadcast_price_update(
                instance.id,
                serializer.validated_data['current_price']
            )


# --- Registration API ---
class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ('username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = get_user_model().objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

@method_decorator(csrf_exempt, name='dispatch')
class RegisterUserAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterUserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Registration successful."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class RegisterAdminAPIView(APIView):
    permission_classes = [AllowAny]  # Only admins can create admin users

    def post(self, request):
        serializer = RegisterAdminSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"detail": "Admin registration successful."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# --- JWT auth ---
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CustomTokenObtainPairSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# --- Overall stats ---
class OverallGoalStats(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        goals = InvestmentGoal.objects.filter(user=request.user).select_related('asset')
        investments = MonthlyInvestment.objects.filter(
            goal__user=request.user
        ).select_related('asset', 'goal')

        # Calculate totals
        total_target = goals.aggregate(Sum('target_amount'))['target_amount__sum'] or 0
        total_invested = sum(inv.total_cost for inv in investments if inv.total_cost)
        total_units_bought = sum(inv.quantity for inv in investments if inv.quantity)

        # Current values now use live asset prices (updated via WebSocket)
        total_current_value = sum(
            inv.quantity * inv.asset.current_price 
            for inv in investments 
            if inv.asset and inv.asset.current_price
        )

        # ROI calculations
        total_gain_loss = total_current_value - total_invested
        total_return = (total_gain_loss / total_invested * 100) if total_invested else 0
        overall_progress = (total_invested / total_target * 100) if total_target else 0

        return Response({
            "total_target": total_target,
            "total_invested": total_invested,
            "overall_progress": overall_progress,
            "total_units_bought": total_units_bought,
            "total_current_value": total_current_value,  # Will reflect live prices
            "total_gain_loss": total_gain_loss,
            "total_return": total_return,
            "last_updated": timezone.now().isoformat(),  # Add timestamp
        })
