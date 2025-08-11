import React, { useRef, useEffect } from "react";
import { GoalWithStats } from "../../types";
import { currencyFormat } from "../layout/misc";

type GoalCardProps = {
  goal: GoalWithStats;
  menuOpenId: number | null;
  setMenuOpenId: (id: number | null) => void;
  onEdit: (goal: GoalWithStats) => void;
  onDelete: (id: number) => void;
};

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  menuOpenId,
  setMenuOpenId,
  onEdit,
  onDelete,
}) => {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpenId(null);
      }
    }
    if (menuOpenId === goal.id) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpenId, goal.id, setMenuOpenId]);

  return (
    <div className="bg-white rounded-lg shadow p-6 relative">
      {/* Three-dot menu button */}
      <button
        className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100"
        onClick={() => setMenuOpenId(menuOpenId === goal.id ? null : goal.id)}
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="4" cy="10" r="2"/>
          <circle cx="10" cy="10" r="2"/>
          <circle cx="16" cy="10" r="2"/>
        </svg>
      </button>
      {/* Dropdown menu */}
      {menuOpenId === goal.id && (
        <div
          ref={menuRef}
          className="absolute top-10 right-2 bg-white border rounded shadow-lg z-10 w-32"
        >
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={() => {
              onEdit(goal);
              setMenuOpenId(null);
            }}
          >
            Edit
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
            onClick={() => {
              onDelete(goal.id);
              setMenuOpenId(null);
            }}
          >
            Delete
          </button>
        </div>
      )}
      <h3 className="text-lg font-semibold">{goal.name}</h3>
      <div className="mt-4 space-y-2">
        <p>Target: {currencyFormat(goal.target_amount)}</p>
        <p>Invested: {currencyFormat(goal.total_invested)}</p>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-indigo-600 h-2.5 rounded-full" 
            style={{ width: `${goal.progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600">Progress: {goal.progress?.toFixed(1)}%</p>
      </div>
    </div>
  );
};

export default GoalCard;