import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";

type InvestmentFormInputs = {
  name: string;
  amount: number;
  date: string;
};

const InvestmentForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<InvestmentFormInputs>();

  const onSubmit: SubmitHandler<InvestmentFormInputs> = data => {
    // Handle form submission (e.g., send to API)
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block mb-1">Investment Name</label>
        <input
          {...register("name", { required: "Name is required" })}
          className="border rounded px-2 py-1 w-full"
        />
        {errors.name && <span className="text-red-500">{errors.name.message}</span>}
      </div>
      <div>
        <label className="block mb-1">Amount</label>
        <input
          type="number"
          {...register("amount", { required: "Amount is required", min: 1 })}
          className="border rounded px-2 py-1 w-full"
        />
        {errors.amount && <span className="text-red-500">{errors.amount.message}</span>}
      </div>
      <div>
        <label className="block mb-1">Date</label>
        <input
          type="date"
          {...register("date", { required: "Date is required" })}
          className="border rounded px-2 py-1 w-full"
        />
        {errors.date && <span className="text-red-500">{errors.date.message}</span>}
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Save Investment
      </button>
    </form>
  );
};

export default InvestmentForm;