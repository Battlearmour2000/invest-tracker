import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { GoalWithStats, InvestmentGoal } from '../../types';
import {currencyFormat, percentageCalculation }from '../layout/misc';

export default function GoalList() {
  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => api.get('/goals/').then(res => res.data),
    
  });
  console.log("Fetched goals:", goals);

  if (isLoading) return <div>Loading goals...wait a bit</div>;
  if (!goals || goals.length === 0) {
    return <div>No goals found.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {goals?.map((goal: GoalWithStats) => (
        <div key={goal.id} className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold">{goal.name}</h3>
          <div className="mt-4 space-y-2">
            <p>Target: {currencyFormat(goal.target_amount)}</p>
            <p>Invested: {currencyFormat(goal.total_invested)}</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full" 
                style={{ width: `${percentageCalculation(goal.total_invested, goal.target_amount)}` }}
                
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}