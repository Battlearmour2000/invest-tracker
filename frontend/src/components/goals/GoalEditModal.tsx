import React from "react";
import GoalForm from "./GoalForm";
import { GoalWithStats } from "../../types";

type GoalEditModalProps = {
  goal: GoalWithStats;
  onClose: () => void;
  onSubmit: (data: any) => void;
  assets: any[]; // Add the assets prop here
};

const GoalEditModal: React.FC<GoalEditModalProps> = ({ goal, onClose, onSubmit, assets }) => (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        onClick={onClose}
      >
        &times;
      </button>
      <h2 className="text-lg font-semibold mb-4">Edit Goal</h2>
      <GoalForm
        onSubmit={onSubmit}
        defaultValues={{
          ...goal,
          id: String(goal.id),
          asset: String(goal.asset.id),
        }}
        assets={assets} // Use the assets prop here
      />
    </div>
  </div>
);

export default GoalEditModal;