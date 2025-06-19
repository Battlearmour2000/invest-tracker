from rest_framework import viewsets, permissions
from .models import InvestmentGoal, MonthlyInvestment
from .serializers import InvestmentGoalSerializer, MonthlyInvestmentSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Sum
from rest_framework.permissions import IsAuthenticated

class InvestmentGoalViewSet(viewsets.ModelViewSet):
    serializer_class = InvestmentGoalSerializer
    authentication_classes=[JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return InvestmentGoal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class MonthlyInvestmentViewSet(viewsets.ModelViewSet):
    serializer_class = MonthlyInvestmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MonthlyInvestment.objects.filter(goal__user=self.request.user)

    def perform_create(self, serializer):
        goal_id = self.request.data.get('goal')
        goal = InvestmentGoal.objects.get(id=goal_id, user=self.request.user)
        serializer.save(goal=goal)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class LoginAPIView(APIView):
    def post(self, request):
        serializer = CustomTokenObtainPairSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OverallGoalStats(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        goals = InvestmentGoal.objects.filter(user=request.user)
        total_target = goals.aggregate(Sum('target_amount'))['target_amount__sum'] or 0

        # Get all investments for this user's goals
        investments = MonthlyInvestment.objects.filter(goal__user=request.user)
        total_invested = sum(inv.total_cost for inv in investments)

        overall_progress = (total_invested / total_target * 100) if total_target else 0

        return Response({
            "total_target": total_target,
            "total_invested": total_invested,
            "overall_progress": overall_progress
        })