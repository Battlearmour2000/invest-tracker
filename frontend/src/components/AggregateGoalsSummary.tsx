import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { currencyFormat } from '../components/layout/misc';

export default function AggregateGoalsSummary() {
  const { data: aggregate, isLoading: loadingAggregate } = useQuery({
    queryKey: ['overall-goal-stats'],
    queryFn: () => api.get('/overall-goal-stats/').then(res => res.data),
  });

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      <h2 className="text-xl font-bold mb-2">Overall Goals Summary</h2>
      {loadingAggregate ? (
        <div>Loading summary...</div>
      ) : aggregate ? (
        <div className="flex flex-wrap gap-8">
          <div>
            <div className="text-gray-500 text-sm">Total Target</div>
            <div className="font-mono text-lg">{currencyFormat(aggregate.total_target)}</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Total Invested</div>
            <div className="font-mono text-lg">{currencyFormat(aggregate.total_invested)}</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Overall Progress</div>
            <div className="font-mono text-lg">{aggregate.overall_progress.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Total Units Bought</div>
            <div className="font-mono text-lg">
              {aggregate.total_units_bought !== undefined
                ? aggregate.total_units_bought
                : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Total Current Value</div>
            <div className="font-mono text-lg">{currencyFormat(aggregate.total_current_value)}</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Total Gain/loss</div>
            <div className="font-mono text-lg">{currencyFormat(aggregate.total_gain_loss.toFixed(1))}</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Total Return</div>
            <div className="font-mono text-lg">{aggregate.total_return.toFixed(1)}%</div>
          </div>
        </div>
      ) : (
        <div>No aggregate data available.</div>
      )}
    </div>
  );
}