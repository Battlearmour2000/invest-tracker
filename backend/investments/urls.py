from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    InvestmentGoalViewSet,
    MonthlyInvestmentViewSet,
    AssetViewSet,
    CustomTokenObtainPairView,
    LoginAPIView,
    OverallGoalStats,
    RegisterUserAPIView,
    RegisterAdminAPIView,
)

router = DefaultRouter()
router.register(r'goals', InvestmentGoalViewSet, basename='goal')
router.register(r'investments', MonthlyInvestmentViewSet, basename='investment')
router.register(r'assets', AssetViewSet, basename='asset')

urlpatterns = [
    path('', include(router.urls)),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('login/', LoginAPIView.as_view(), name='login'),
    path('register/', RegisterUserAPIView.as_view(), name='register'),
    path('register-admin/', RegisterAdminAPIView.as_view(), name='register-admin'),
    path('overall-goal-stats/', OverallGoalStats.as_view(), name='overall-goal-stats'),
]
