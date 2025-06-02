import React from "react";

type Investment = {
  id: number;
  name: string;
  amount: number;
  date: string;
};

type InvestmentListProps = {
  investments: Investment[];
};

const InvestmentList: React.FC<InvestmentListProps> = ({ investments }) => {
  if (investments.length === 0) {
    return <div>No investments found.</div>;
  }

  return (
    <ul className="space-y-2">
      {investments.map((inv) => (
        <li key={inv.id} className="border rounded p-3 flex justify-between items-center">
          <div>
            <div className="font-semibold">{inv.name}</div>
            <div className="text-sm text-gray-500">{inv.date}</div>
          </div>
          <div className="font-bold">${inv.amount.toLocaleString()}</div>
        </li>
      ))}
    </ul>
  );
};

export default InvestmentList;