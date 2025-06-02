export interface InvestmentGoal {
  id: number;
  name: string;
  investment_type: string;
  target_amount: number;
  years_to_invest: number;
  monthly_contribution: number;
  created_at: string;
}

export interface GoalWithStats extends InvestmentGoal {
  total_invested: number;
  current_portfolio_value: number;
  net_gain_loss: number;
  portfolio_roi: number;
  progress: number;
}

export interface MonthlyInvestment {
  id: number;
  goal: number;
  date: string;
  purchase_price: number;
  quantity: number;
  current_price: number;
  notes: string;
  total_cost: number;
  current_value: number;
  gain_loss: number;
  roi: number;
  is_profitable: boolean;
}