from rest_framework import serializers
from .models import InvestmentGoal, MonthlyInvestment, Asset
from django.contrib.auth import get_user_model

# --- Asset serializer ---
class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = [
            'id', 'name', 'ticker', 'asset_type', 'current_price', 'last_updated'
        ]
        extra_kwargs = {
            'current_price': {'required': False},  # For partial updates
            'last_updated': {'read_only': True},
        }


# --- InvestmentGoal serializer ---
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
    progress = serializers.SerializerMethodField(read_only=True)

    def get_progress(self, obj):
        return round(obj.progress, 2) if obj.progress is not None else 0
    
    # Include nested Asset info (read-only)
    asset = AssetSerializer(read_only=True)
    
    # Add writable asset_id field
    asset_id = serializers.PrimaryKeyRelatedField(
        queryset=Asset.objects.all(),
        write_only=True,
        source='asset'
    )

    class Meta:
        model = InvestmentGoal
        fields = [
            "id",
            "name",
            "investment_type",
            "asset",
            "asset_id", 
            "target_amount",
            "years_to_invest",
            "monthly_contribution",
            "created_at",
            "portfolio_roi",
            "progress",
            "total_invested",
            "current_portfolio_value",
            "net_gain_loss"
            # Exclude 'user' (it's auto-set in the view)
        ]
        extra_kwargs = {
            "user": {"read_only": True},  # Ensure user can't be modified via API
        }


# --- MonthlyInvestment serializer ---
class MonthlyInvestmentSerializer(serializers.ModelSerializer):
    total_cost = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
        read_only=True
    )
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

    # Include nested Asset info
    asset = AssetSerializer(read_only=True)

    goal = InvestmentGoalSerializer(read_only=True)

    # Optionally, if you POST/PUT, accept asset ID instead of nested asset
    asset_id = serializers.PrimaryKeyRelatedField(
        queryset=Asset.objects.all(),
        write_only=True,
        source='asset'
    )

    class Meta:
        model = MonthlyInvestment
        fields = [
            'id', 'goal', 'asset', 'asset_id', 'date', 'purchase_price', 'quantity',
            'notes', 'total_cost', 'current_value', 'gain_loss', 'roi', 'is_profitable'
        ]


# --- Login / JWT ---
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['is_data_admin'] = getattr(user, 'is_data_admin', False)

        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add extra response data
        data.update({
            'user_id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'is_data_admin': getattr(self.user, 'is_data_admin', False)
        })
        return data

# --- Register Serializer ---
class RegisterUserSerializer(serializers.ModelSerializer):
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
        user.is_data_admin = False  # Always regular user
        user.save()
        return user

class RegisterAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ('username', 'email', 'password', 'is_data_admin')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        is_data_admin = validated_data.pop('is_data_admin', False)
        user = get_user_model().objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        user.is_data_admin = is_data_admin
        user.save()
        return user
