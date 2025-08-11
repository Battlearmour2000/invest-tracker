import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import { GoalWithStats } from '../../types';
import React, { useState } from "react";
import GoalEditModal from './GoalEditModal';
import GoalCard from './GoalCard';

export default function GoalList() {
  const queryClient = useQueryClient();
  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => api.get('/goals/').then(res => res.data),
  });
  const { data: assetsData, isLoading: loadingAssets } = useQuery({
    queryKey: ['assets'],
    queryFn: () => api.get('/assets/').then(res => res.data),
  });
  const assets = assetsData?.results || [];
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [editingGoal, setEditingGoal] = useState<GoalWithStats | null>(null);

  const handleDeleteGoal = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this goal and all its transactions?")) return;
    try {
      await api.delete(`/goals/${id}/`);
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['overall-goal-stats'] });
    } catch (error) {
      alert("Failed to delete goal.");
      console.error(error);
    }
  };

  const handleUpdateGoal = async (data: any) => {
    if (!editingGoal) return;
    const patchData = {
      name: data.name,
      investment_type: data.investment_type,
      target_amount: Number(data.target_amount),
      years_to_invest: Number(data.years_to_invest),
      monthly_contribution: Number(data.monthly_contribution),
    };
    try {
      await api.patch(`/goals/${editingGoal.id}/`, patchData);
      setEditingGoal(null);
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    } catch (error) {
      if (typeof error === "object" && error !== null && "response" in error) {
        // @ts-expect-error: error.response is likely from axios
        alert(JSON.stringify(error.response.data, null, 2));
      }
      console.error(error);
    }
  };

  if (isLoading) return <div>Loading goals...wait a bit</div>;
  if (!goals || goals.length === 0) {
    return <div>No goals found.</div>;
  }

  return (
    <>
      {editingGoal && (
        <GoalEditModal
          goal={editingGoal}
          onClose={() => setEditingGoal(null)}
          onSubmit={handleUpdateGoal}
          assets={assets}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals?.map((goal: GoalWithStats) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            menuOpenId={menuOpenId}
            setMenuOpenId={setMenuOpenId}
            onEdit={setEditingGoal}
            onDelete={handleDeleteGoal}
          />
        ))}
      </div>
    </>
  );
}