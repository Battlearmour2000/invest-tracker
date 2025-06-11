import React from "react";
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { currencyFormat } from '../layout/misc';
import { Investment } from "../../types";


const InvestmentList: React.FC = () => {
  const { data: investments, isLoading } = useQuery({
    queryKey: ['investments'],
    queryFn: () => api.get('/investments/').then(res => res.data),
  });

  if (isLoading) return <div>Loading investments...wait a bit</div>;
  if (!investments || investments.length === 0) {
    return <div>No investments found.</div>;
  }

  return (
    <div className="shadow-md rounded-lg bg-white p-4">
      <h2 className="text-lg font-semibold mb-4">Investment History</h2>
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="grid grid-cols-10 gap-2 font-semibold border-b pb-2 text-xs md:text-sm">
            <div>Name</div>
            <div className="hidden sm:block">Type</div>
            <div className="text-right">Units</div>
            <div className="text-right hidden md:block">Purchase Price</div>
            <div className="text-right hidden lg:block">Date</div>
            <div className="text-right hidden xl:block">Total Invested</div>
            <div className="text-right hidden md:block">Live Price</div>
            <div className="text-right">Current Value</div>
            <div className="text-right">Gain/Loss</div>
            <div className="text-right">Return %</div>
          </div>
          {investments.length === 0 ? (
            <div className="py-4 text-center text-muted-foreground col-span-10">
              No transactions yet. Add one to get started!
            </div>
          ) : (
            investments.map((inv: Investment) => {
              const units = Number(inv.quantity);
              const purchasePrice = Number(inv.purchase_price);
              const livePrice = inv.current_price !== null ? Number(inv.current_price) : purchasePrice;
              const totalInvested = units * purchasePrice;
              const currentValue = units * livePrice;
              const gainLossAmount = currentValue - totalInvested;
              const returnPercent = totalInvested > 0 ? (gainLossAmount / totalInvested) * 100 : 0;

              return (
                <div
                  key={inv.id}
                  className="grid grid-cols-10 gap-2 border-b py-2 items-center text-xs md:text-sm"
                >
                  <div className="truncate max-w-[120px] xl:max-w-xs">{inv.goal.name || "No Name"}</div>
                  <div className="hidden sm:block capitalize">{inv.goal.investment_type}</div>
                  <div className="text-right">{units.toLocaleString()}</div>
                  <div className="text-right hidden md:block">{currencyFormat(purchasePrice)}</div>
                  <div className="text-right hidden lg:block">{new Date(inv.date).toLocaleDateString()}</div>
                  <div className="text-right hidden xl:block">{currencyFormat(totalInvested)}</div>
                  <div className="text-right hidden md:block">{currencyFormat(livePrice)}</div>
                  <div className="text-right">{currencyFormat(currentValue)}</div>
                  <div className={`text-right ${gainLossAmount >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {currencyFormat(gainLossAmount)}
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded ${returnPercent > 0.01 ? "bg-green-100 text-green-700" : returnPercent < -0.01 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>
                      {returnPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestmentList;