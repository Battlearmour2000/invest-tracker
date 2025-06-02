from rest_framework import serializers
from .models import InvestmentGoal, MonthlyInvestment
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MonthlyInvestmentSerializer(serializers.ModelSerializer):
    total_cost = serializers.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        read_only=True
    )
    current_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False  # Make optional in API but handled in model
    )
    
    # All computed fields now never return null
    current_value = serializers.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        read_only=True
    )
    gain_loss = serializers.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        read_only=True
    )
    roi = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        read_only=True
    )
    is_profitable = serializers.BooleanField(read_only=True)

    class Meta:
        model = MonthlyInvestment
        fields = [
            'id', 'goal', 'date', 'purchase_price', 'quantity', 
            'current_price', 'notes', 'total_cost', 'current_value',
            'gain_loss', 'roi', 'is_profitable'
        ]

class InvestmentGoalSerializer(serializers.ModelSerializer):
    total_invested = serializers.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        read_only=True
    )
    current_portfolio_value = serializers.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        read_only=True,
        allow_null=True
    )
    net_gain_loss = serializers.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        read_only=True,
        allow_null=True
    )
    portfolio_roi = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = InvestmentGoal
        fields = [
            'id', 'name', 'investment_type', 'target_amount',
            'years_to_invest', 'monthly_contribution', 'created_at',
            'total_invested', 'current_portfolio_value', 'net_gain_loss',
            'portfolio_roi'
        ]


# login shit 
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email

        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add extra responses here
        data.update({
            'user_id': self.user.id,
            'username': self.user.username,
            'email': self.user.email
        })
        return data