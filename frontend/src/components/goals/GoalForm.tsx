import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";

type GoalFormInputs = {
  title: string;
  amount: number;
  deadline: string;
};

const GoalForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<GoalFormInputs>();

  const onSubmit: SubmitHandler<GoalFormInputs> = data => {
    // Handle form submission (e.g., send to API)
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block mb-1">Goal Title</label>
        <input
          {...register("title", { required: "Title is required" })}
          className="border rounded px-2 py-1 w-full"
        />
        {errors.title && <span className="text-red-500">{errors.title.message}</span>}
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
        <label className="block mb-1">Deadline</label>
        <input
          type="date"
          {...register("deadline", { required: "Deadline is required" })}
          className="border rounded px-2 py-1 w-full"
        />
        {errors.deadline && <span className="text-red-500">{errors.deadline.message}</span>}
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Save Goal
      </button>
    </form>
  );
};

export default GoalForm;