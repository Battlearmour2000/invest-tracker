import React from "react";
import { useForm, Controller } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { InvestmentGoal } from "../../types";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/client";

type AssetOption = {
  id: string;
  name: string;
  ticker: string;
  asset_type: string;
};

type GoalFormProps = {
  onSubmit: (data: InvestmentGoal) => void | Promise<void>;
  defaultValues?: Partial<InvestmentGoal>;
  assets: AssetOption[]; // <-- Add this line
};

const GoalForm: React.FC<GoalFormProps> = ({ onSubmit, defaultValues, assets: initialAssets }) => {
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<InvestmentGoal>({
    defaultValues,
  });

  const { data: assetsData, isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => api.get('/assets/').then(res => res.data),
  });

  // If paginated, use assetsData.results
  const assets = assetsData?.results || initialAssets;

  console.log("Assets in GoalForm:", assets);

  if (!assets) return null; // Don't render form if assets are not available

  return (
    <form
      onSubmit={handleSubmit((data) => {
        console.log("Goal form payload:", data); // <-- Add this line
        onSubmit(data);
      })}
      className="space-y-4"
    >
      {/* investment name & asset selection */}
      <div>
        <label className="block mb-1">Investment Asset</label>
        <Controller
          name="asset"
          control={control}
          rules={{ required: "Asset is required" }}
          render={({ field }) => (
            <select
              {...field}
              className="border rounded px-2 py-1 w-full"
              onChange={e => {
                field.onChange(e);
                const selectedAsset = assets.find((a: AssetOption) => String(a.id) === e.target.value);
                setValue("name", selectedAsset ? selectedAsset.name : "");
                setValue("investment_type", selectedAsset ? selectedAsset.asset_type : "");
              }}
            >
              <option value="">Select asset</option>
              {assets.length === 0 && (
                <option value="">No assets available</option>
              )}
              {assets.map((asset: AssetOption) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.ticker}) [{asset.asset_type === "STOCK" ? "Stock" : "Mutual Fund"}]
                </option>
              ))}
            </select>
          )}
        />
        {errors.asset && <span className="text-red-500">{errors.asset.message}</span>}
      </div>
      {/* investment name (auto-filled, hidden) */}
      <input
        type="hidden"
        {...register("name")}
      />
      <input
        type="hidden"
        {...register("investment_type")}
      />

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