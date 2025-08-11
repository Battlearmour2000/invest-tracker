import React, { useState } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import AggregateGoalsSummary from '../components/AggregateGoalsSummary';
import GoalList from '../components/goals/GoalList';
import GoalForm from '../components/goals/GoalForm';
import InvestmentList from '../components/investments/InvestmentList';
import InvestmentForm from '../components/investments/InvestmentForm';
import api from '../api/client';
import { usePriceWebSocket } from '../hooks/usePriceWebSocket';

interface Goal {
  id: number;
  name: string;
  target_amount: number;
  monthly_contribution: number;
  years_to_invest: number;
  asset?: number;
}

interface Investment {
  id: number;
  goal: number;
  date: string;
  purchase_price: number;
  quantity: number;
  notes?: string;
}

interface Asset {
  id: number;
  name: string;
  ticker: string;
  asset_type: string;
  current_price: number;
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);
  const [showNewInvestmentForm, setShowNewInvestmentForm] = useState(false);

  // Initialize WebSocket for real-time updates
  usePriceWebSocket();

  // Fetch aggregate stats
  const { data: aggregate, isLoading: loadingAggregate } = useQuery({
    queryKey: ['overall-goal-stats'],
    queryFn: () => api.get('/overall-goal-stats/').then(res => res.data),
  });

  // Fetch assets
  const { data: assetsData } = useQuery<{ results: Asset[] }>({
    queryKey: ['assets'],
    queryFn: () => api.get('/assets/').then(res => res.data),
  });

  const assets = assetsData?.results || [];

  const handleAddNewGoalClick = () => setShowNewGoalForm(true);
  const handleCloseGoalForm = () => setShowNewGoalForm(false);

  const handleSaveNewGoal = async (newGoal: any) => {
    try {
      const cleanedGoal = {
        ...newGoal,
        id: newGoal.id ? Number(newGoal.id) : undefined,
        target_amount: Number(String(newGoal.target_amount).replace(/,/g, "")),
        monthly_contribution: Number(String(newGoal.monthly_contribution).replace(/,/g, "")),
        years_to_invest: Number(newGoal.years_to_invest),
        asset: newGoal.asset ? Number(newGoal.asset) : undefined,
      };
  
      await api.post('/goals/', cleanedGoal);
      queryClient.invalidateQueries({ 
        queryKey: ['goals', 'overall-goal-stats'] 
      });
      setShowNewGoalForm(false);
    } catch (error: any) {
      handleApiError(error);
    }
  };

  const handleAddNewInvestmentClick = () => setShowNewInvestmentForm(true);
  const handleCloseInvestmentForm = () => setShowNewInvestmentForm(false);

  const handleSaveNewInvestment = async (newInvestment: Investment) => {
    try {
      const cleanedInvestment = {
        ...newInvestment,
        purchase_price: Number(String(newInvestment.purchase_price).replace(/,/g, "")),
        quantity: Number(newInvestment.quantity),
      };

      await api.post('/investments/', cleanedInvestment);
      queryClient.invalidateQueries({ 
        queryKey: ['investments', 'goals', 'overall-goal-stats'] 
      });
      setShowNewInvestmentForm(false);
    } catch (error: any) {
      handleApiError(error);
    }
  };

  const handleApiError = (error: any) => {
    if (error.response) {
      console.error('API error:', error.response.data);
      const errorMessage = error.response.data.detail || 
        JSON.stringify(error.response.data, null, 2);
      alert(errorMessage);
    } else {
      console.error('Error:', error);
      alert('An unexpected error occurred');
    }
  };

  return (
    <div className="space-y-8 p-4">
      {/* Aggregate Goals Section */}
      {/* <AggregateGoalsSummary loading={loadingAggregate} data={aggregate} /> */}
      <AggregateGoalsSummary />

      {/* Investment Goals Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Your Investment Goals</h1>
          <button 
            className="btn-primary"
            onClick={handleAddNewGoalClick}
            disabled={loadingAggregate}
          >
            + New Goal
          </button>
        </div>
        <GoalList />
      </section>

      {/* Investments Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Your Investments</h1>
          <button 
            className="btn-primary"
            onClick={handleAddNewInvestmentClick}
            disabled={loadingAggregate}
          >
            + New Investment
          </button>
        </div>
        <InvestmentList />
      </section>

      {/* Modals */}
      {showNewInvestmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 relative w-full max-w-md">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
              onClick={handleCloseInvestmentForm}
              aria-label="Close"
            >
              &times;
            </button>
            <InvestmentForm 
              onSubmit={handleSaveNewInvestment} 
              //onCancel={handleCloseInvestmentForm}
            />
          </div>
        </div>
      )}

      {showNewGoalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 relative w-full max-w-md">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
              onClick={handleCloseGoalForm}
              aria-label="Close"
            >
              &times;
            </button>
            <GoalForm 
              onSubmit={handleSaveNewGoal} 
              //onCancel={handleCloseGoalForm}
              assets={assets.map(asset => ({
                ...asset,
                id: asset.id.toString(),
              }))}
            />
          </div>
        </div>
      )}
    </div>
  );
}