import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import GoalList from '../components/goals/GoalList';
import GoalForm from '../components/goals/GoalForm';
import InvestmentList from '../components/investments/InvestmentList';
import InvestmentForm from '../components/investments/InvestmentForm';
import api from '../api/client';

export default function Dashboard() {

  //logic for saving goal
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);
  const queryClient = useQueryClient();

  const handleAddNewGoalClick = () => setShowNewGoalForm(true);
  const handleCloseForm = () => setShowNewGoalForm(false);

  const handleSaveNewGoal = async (newGoal: any) => {
    try {
      // cleans the number fields to ensure they are stored as numbers
      const cleanedGoal = {
        ...newGoal,
        target_amount: Number(String(newGoal.target_amount).replace(/,/g, "")),
        monthly_contribution: Number(String(newGoal.monthly_contribution).replace(/,/g, "")),
        years_to_invest: Number(newGoal.years_to_invest),
      };
      await api.post('/goals/', cleanedGoal);
      setShowNewGoalForm(false);
      // Refetch goals after sending new goal to the server
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    } catch (error: any) {
      if (error.response) {
        console.error('API error:', error.response.data);
        alert(JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('Error:', error);
      }
    }
  };

  //logic for saving investment
  const [showNewInvestmentForm, setShowNewInvestmentForm] = useState(false);
  const queryClient2 = useQueryClient();

  const handleAddNewInvestmentClick = () => setShowNewInvestmentForm(true);
  const handleCloseForm2 = () => setShowNewInvestmentForm(false);

  const handleSaveNewInvestment = async (newInvestment: any) => {
    try {
      // cleans the number fields to ensure they are stored as numbers
      const cleanedInvestment = {
        ...newInvestment,
        target_amount: Number(String(newInvestment.target_amount).replace(/,/g, "")),
        monthly_contribution: Number(String(newInvestment.monthly_contribution).replace(/,/g, "")),
        years_to_invest: Number(newInvestment.years_to_invest),
      };
      await api.post('/investments/', cleanedInvestment);
      setShowNewInvestmentForm(false);
      // Refetch investments after sending new investment to the server
      queryClient2.invalidateQueries({ queryKey: ['investments'] });
    } catch (error: any) {
      if (error.response) {
        console.error('API error:', error.response.data);
        alert(JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('Error:', error);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Investment Goals</h1>
        <button className="btn-primary" onClick={handleAddNewGoalClick}>
          + New Goal
        </button>
      </div>
      <GoalList />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold"></h1>
        <button className="btn-primary" onClick={handleAddNewInvestmentClick}>
          + New Investment
        </button>
      </div>
      <InvestmentList />

      {showNewGoalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 relative min-w-[350px]">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
              onClick={handleCloseForm}
              aria-label="Close"
            >
              &times;
            </button>
            <GoalForm onSubmit={handleSaveNewGoal} />
          </div>
        </div>
      )}

      {showNewInvestmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 relative min-w-[350px]">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
              onClick={handleCloseForm2}
              aria-label="Close"
            >
              &times;
            </button>
            <InvestmentForm onSubmit={handleSaveNewInvestment} />
          </div>
        </div>
      )}
    </div>
  );
}