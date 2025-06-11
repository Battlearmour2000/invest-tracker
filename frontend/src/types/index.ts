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

// types exporting
export type Investment = {
  id: number;
  goal: {
    id: number;
    name: string;
    investment_type: string;
  };
  date: string;
  purchase_price: number;
  quantity: string;
  current_price: number | null;
  notes: string;
  total_cost: string;
  current_value: string;
  gain_loss: string;
  roi: string;
  is_profitable: boolean;
};

export type Investment_Goal = {
  id: number;
  name: string;
  investment_type: string;
  target_amount: number;
  years_to_invest: number;
  monthly_contribution: number
};