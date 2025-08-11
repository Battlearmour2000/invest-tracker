from django.db import models
from django.contrib.auth.models import AbstractUser

# --- 1. Custom user model ---
class CustomUser(AbstractUser):
    """
    Extends default user to add a data admin flag.
    """
    is_data_admin = models.BooleanField(default=False)

    def __str__(self):
        return self.username


# --- 2. Asset model: central list of stocks/mutual funds and their live prices ---
class Asset(models.Model):
    ASSET_TYPE_CHOICES = [
        ('STOCK', 'Stock'),
        ('MUTUAL_FUND', 'Mutual Fund'),
    ]

    name = models.CharField(max_length=100)                   # e.g., "Apple Inc."
    ticker = models.CharField(max_length=20, unique=True)     # e.g., "AAPL"
    asset_type = models.CharField(max_length=20, choices=ASSET_TYPE_CHOICES)
    current_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.ticker})"


# --- 3. Investment Goal: tracks user's overall saving or investing goal ---
class InvestmentGoal(models.Model):
    INVESTMENT_TYPES = [
        ('STOCK', 'Stock'),
        ('MUTUAL_FUND', 'Mutual Fund'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)  # e.g., "Retirement Fund"
    investment_type = models.CharField(max_length=20, choices=INVESTMENT_TYPES)
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='goals', null=True, blank=True)  # <-- Add this line
    target_amount = models.DecimalField(max_digits=15, decimal_places=0)  # e.g., 1_000_000
    years_to_invest = models.PositiveIntegerField()  # e.g., 10
    monthly_contribution = models.DecimalField(max_digits=10, decimal_places=0)  # e.g., 1000
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.get_investment_type_display()})"

    @property
    def total_invested(self):
        return sum(
            inv.total_cost
            for inv in self.investments.all()
            if inv.total_cost is not None
        )

    @property
    def current_portfolio_value(self):
        return sum(
            inv.current_value
            for inv in self.investments.all()
            if inv.current_value is not None
        )

    @property
    def net_gain_loss(self):
        if self.current_portfolio_value is None:
            return None
        return self.current_portfolio_value - self.total_invested

    @property
    def portfolio_roi(self):
        if self.net_gain_loss is None or self.total_invested == 0:
            return None
        return (self.net_gain_loss / self.total_invested) * 100

    @property
    def progress(self):
        if self.target_amount and self.target_amount > 0:
            return float(self.total_invested) / float(self.target_amount) * 100
        return 0


# --- 4. MonthlyInvestment: individual purchases under each goal ---
class MonthlyInvestment(models.Model):
    goal = models.ForeignKey(InvestmentGoal, on_delete=models.CASCADE, related_name='investments')
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='investments', null=True, blank=True)
    date = models.DateField()  # Date of purchase
    purchase_price = models.DecimalField(max_digits=10, decimal_places=0)  # Price per unit at purchase
    quantity = models.DecimalField(max_digits=10, decimal_places=4)  # Number of units bought
    notes = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ['-date']
        verbose_name = "Monthly Investment"
        verbose_name_plural = "Monthly Investments"

    @property
    def total_cost(self):
        """purchase_price × quantity"""
        return self.quantity * self.purchase_price

    @property
    def current_value(self):
        """
        Use current price from linked Asset;
        fallback to purchase_price if asset.current_price is missing.
        """
        price = self.asset.current_price if self.asset.current_price else self.purchase_price
        return self.quantity * price

    @property
    def gain_loss(self):
        return self.current_value - self.total_cost

    @property
    def roi(self):
        if self.total_cost == 0:
            return 0
        return (self.gain_loss / self.total_cost) * 100

    @property
    def is_profitable(self):
        return self.gain_loss >= 0

    def __str__(self):
        return f"{self.goal.name} - {self.asset.ticker} - {self.date.strftime('%b %Y')}"
