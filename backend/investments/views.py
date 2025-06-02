from rest_framework import viewsets, permissions
from .models import InvestmentGoal, MonthlyInvestment
from .serializers import InvestmentGoalSerializer, MonthlyInvestmentSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication

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