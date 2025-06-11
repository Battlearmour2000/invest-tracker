import React from "react";
import { useForm, Controller } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { Investment_Goal, InvestmentGoal } from "../../types";

type GoalFormProps = {
  onSubmit: (data: InvestmentGoal) => void | Promise<void>;
};

const GoalForm: React.FC<GoalFormProps> = ({ onSubmit }) => {
  const { register, handleSubmit, control, formState: { errors } } = useForm<InvestmentGoal>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* investment name */}
      <div>
        <label className="block mb-1">Investment name</label>
        <input
          {...register("name", { required: "Name is required" })}
          className="border rounded px-2 py-1 w-full"
        />
        {errors.name && <span className="text-red-500">{errors.name.message}</span>}
      </div>
      {/* investment type */}
      <div>
        <label className="block mb-1">Investment Type</label>
        <select
          {...register("investment_type", { required: "Investment type is required" })}
          className="border rounded px-2 py-1 w-full"
        >
          <option value="">Select type</option>
          <option value="STOCK">Stocks</option>
          <option value="MUTUAL_FUND">Mutual Funds</option>
        </select>
        {errors.investment_type && <span className="text-red-500">{errors.investment_type.message}</span>}
      </div>

      {/* target amount */}
      <div>
        <label className="block mb-1">Target amount</label>
        <Controller
          name="target_amount"
          control={control}
          rules={{ required: "Target amount is required" }}
          render={({ field }) => (
            <NumericFormat
              {...field}
              allowLeadingZeros
              thousandSeparator=","
              className="border rounded px-2 py-1 w-full"
              value={field.value ?? ""}
              onValueChange={values => field.onChange(values.floatValue)}
            />
          )}
        />
        {errors.target_amount && <span className="text-red-500">{errors.target_amount.message}</span>}
      </div>

      {/* years to invest */}
      <div>
        <label className="block mb-1">Years to invest</label>
        <Controller
          name="years_to_invest"
          control={control}
          rules={{ required: "Years to invest is required" }}
          render={({ field }) => (
            <NumericFormat
              {...field}
              allowLeadingZeros
              thousandSeparator=","
              className="border rounded px-2 py-1 w-full"
              value={field.value ?? ""}
              onValueChange={values => field.onChange(values.floatValue)}
            />
          )}
        />
        {errors.years_to_invest && <span className="text-red-500">{errors.years_to_invest.message}</span>}
      </div>

      {/* monthly contribution */}
      <div>
        <label className="block mb-1">Monthly Contribution</label>
        <Controller
          name="monthly_contribution"
          control={control}
          rules={{ required: "Monthly contribution is required" }}
          render={({ field }) => (
            <NumericFormat
              {...field}
              allowLeadingZeros
              thousandSeparator=","
              className="border rounded px-2 py-1 w-full"
              value={field.value ?? ""}
              onValueChange={values => field.onChange(values.floatValue)}
            />
          )}
        />
        {errors.monthly_contribution && <span className="text-red-500">{errors.monthly_contribution.message}</span>}
      </div>
      
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Save Goal
      </button>
    </form>
  );
};

export default GoalForm;