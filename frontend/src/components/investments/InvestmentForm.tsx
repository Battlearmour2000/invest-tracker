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

  // Fetch goals for the select dropdown
  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => api.get('/goals/').then(res => res.data),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block mb-1">Investment Goal</label>
        <select
          {...register("goal", { required: "Investment goal is required" })}
          className="border rounded px-2 py-1 w-full"
        >
          <option value="">Select goal</option>
          {goals && goals.map((goal: GoalWithStats) => (
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