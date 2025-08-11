import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { GoalWithStats, MonthlyInvestment } from "../../types";
import api from "../../api/client";
import { useQuery } from "@tanstack/react-query";

type InvestmentFormProps = {
  onSubmit: (data: MonthlyInvestment) => void | Promise<void>;
};

const InvestmentForm: React.FC<InvestmentFormProps> = ({ onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<MonthlyInvestment>();

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => api.get('/goals/').then(res => res.data),
  });
  console.log("Fetched goals:", goals)

  // Custom submit handler to inject asset_id from selected goal
  const handleFormSubmit: SubmitHandler<MonthlyInvestment> = (data) => {
    const selectedGoal = goals?.find((goal: any) => goal.id === Number(data.goal));
    console.log("Selected goal:", selectedGoal);

    if (!selectedGoal || !selectedGoal.asset || !selectedGoal.asset.id) {
      // handle error (e.g., show a message)
      alert("Selected goal does not have a valid asset.");
      return;
    }

    // Get the asset ID (handles both cases: raw ID or nested object)
    const assetId = typeof selectedGoal.asset === 'object' 
      ? selectedGoal.asset.id 
      : selectedGoal.asset;


    const payload = {
      ...data,
      asset_id: assetId,
      goal_id: selectedGoal.id // Use asset from the selected goal
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block mb-1">Investment Goal</label>
        <select
          {...register("goal", { required: "Investment goal is required" })}
          className="border rounded px-2 py-1 w-full"
        >
          <option value="">Select goal</option>
          {goals && goals.map((goal: any) => (
            <option key={goal.id} value={goal.id}>
              {goal.name}
            </option>
          ))}
        </select>
        {errors.goal && <span className="text-red-500">{errors.goal.message}</span>}
      </div>
      <div>
        {/* purchase price */}
        <label className="block mb-1">Purchase price</label>
        <input
          type="number"
          {...register("purchase_price", { required: "purchase_price is required", min: 1 })}
          className="border rounded px-2 py-1 w-full"
        />
        {errors.purchase_price && <span className="text-red-500">{errors.purchase_price.message}</span>}
      </div>
      <div>
        {/* quantity */}
        <label className="block mb-1">Quantity</label>
        <input
          type="number"
          {...register("quantity", { required: "Quantity is required", min: 1 })}
          className="border rounded px-2 py-1 w-full"
        />
        {errors.quantity && <span className="text-red-500">{errors.quantity.message}</span>}
      </div>
      <div>
        {/* date */}
        <label className="block mb-1">Date</label>
        <input
          type="date"
          {...register("date", { required: "Date is required" })}
          className="border rounded px-2 py-1 w-full"
        />
        {errors.date && <span className="text-red-500">{errors.date.message}</span>}
      </div>
      <div>
        {/* notes */}
        <label className="block mb-1">Notes</label>
        <input
          type="textbox"
          {...register("notes")}
          className="border rounded px-2 py-1 w-full"
        />
        {errors.notes && <span className="text-red-500">{errors.notes.message}</span>}
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Save Investment
      </button>
    </form>
  );
};

export default InvestmentForm;