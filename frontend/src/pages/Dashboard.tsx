import GoalList from '../components/goals/GoalList';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Investment Goals</h1>
        <button className="btn-primary">
          + New Goal
        </button>
      </div>
      <GoalList />
    </div>
  );
}