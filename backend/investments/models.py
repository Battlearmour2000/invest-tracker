from django.db import models
from django.contrib.auth.models import User

class InvestmentGoal(models.Model):
    INVESTMENT_TYPES = [
        ('STOCK', 'Stock'),
        ('MUTUAL_FUND', 'Mutual Fund'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)  # e.g., "Retirement Fund"
    investment_type = models.CharField(max_length=20, choices=INVESTMENT_TYPES)
    target_amount = models.DecimalField(max_digits=15, decimal_places=0)  # e.g., 1_000_000
    years_to_invest = models.PositiveIntegerField()  # e.g., 10
    monthly_contribution = models.DecimalField(max_digits=10, decimal_places=0)  # e.g., 1000
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.get_investment_type_display()})"

    @property
    def total_invested(self):
        """Sum of all purchase costs across investments"""
        return sum(
            inv.total_cost 
            for inv in self.investments.all() 
            if inv.total_cost is not None
        )

    @property
    def current_portfolio_value(self):
        """Sum of all current values across investments"""
        return sum(
            inv.current_value 
            for inv in self.investments.all() 
            if inv.current_value is not None
        )

    @property
    def net_gain_loss(self):
        """Net profit/loss across all investments"""
        if self.current_portfolio_value is None:
            return None
        return self.current_portfolio_value - self.total_invested

    @property
    def portfolio_roi(self):
        """Aggregate ROI for the entire goal"""
        if self.net_gain_loss is None or self.total_invested == 0:
            return None
        return (self.net_gain_loss / self.total_invested) * 100

class MonthlyInvestment(models.Model):
    goal = models.ForeignKey(InvestmentGoal, on_delete=models.CASCADE, related_name='investments')
    date = models.DateField()  # Date of purchase
    purchase_price = models.DecimalField(max_digits=10, decimal_places=0)  # Price per unit
    quantity = models.DecimalField(max_digits=10, decimal_places=4)  # e.g., 2.5 units
    current_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Manually updated
    notes = models.TextField(null=True, blank=True)  # Optional notes

    # Computed properties (no DB fields)
    class Meta:
        ordering = ['-date']
        verbose_name = "Monthly Investment"
        verbose_name_plural = "Monthly Investments"

    @property
    def total_cost(self):
        """Total amount spent to acquire this investment (quantity * buy price)"""
        return self.quantity * self.purchase_price

    @property
    def current_value(self):
        """Fall back to purchase price if current_price not set"""
        price = self.current_price if self.current_price is not None else self.purchase_price
        return self.quantity * price

    @property
    def gain_loss(self):
        """Always returns a value (0 if no price movement)"""
        return self.current_value - self.total_cost

    @property
    def roi(self):
        """Returns 0 if no price movement"""
        if self.total_cost == 0:
            return 0
        return (self.gain_loss / self.total_cost) * 100
    
    @property
    def is_profitable(self):
        """Boolean indicating whether the investment is in profit"""
        if self.gain_loss is None:
            return None
        return self.gain_loss >= 0
    
    def save(self, *args, **kwargs):
        """Set current_price = purchase_price if not provided"""
        if self.current_price == 0:
            self.current_price = self.purchase_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.goal.name} - {self.date.strftime('%b %Y')}"