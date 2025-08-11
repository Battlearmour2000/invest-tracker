import React, { useState, useRef } from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import { currencyFormat } from '../layout/misc';
import { Investment, PaginatedInvestments } from "../../types";

interface InvestmentListProps {
  onEdit?: (investment: Investment) => void;
}

const InvestmentList: React.FC<InvestmentListProps> = ({ onEdit }) => {
  const [filters, setFilters] = useState({
    type: '',
    goalName: '',
    purchasePrice: '',
    quantity: '',
    currentPrice: '',
    dateFrom: '',
    dateTo: '',
    profitable: '',
  });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: investments, isLoading, isError } = useQuery<PaginatedInvestments>({
    queryKey: ['investments', ...Object.values(filters), page],
    queryFn: () =>
      api.get('/investments/', {
        params: {
          ...(filters.type && { 'goal__investment_type': filters.type }),
          ...(filters.goalName && { 'goal__name__icontains': filters.goalName }),
          ...(filters.currentPrice && { current_price: filters.currentPrice }),
          ...(filters.dateFrom && { 'date_range_after': filters.dateFrom }),
          ...(filters.dateTo && { 'date_range_before': filters.dateTo }),
          ...(filters.profitable && { profitable: filters.profitable }),
          page,
        },
      }).then(res => res.data),
  });

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await api.delete(`/investments/${id}/`);
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['overall-goal-stats'] });
    } catch (error) {
      alert("Failed to delete investment. Please try again.");
      console.error("Delete error:", error);
    }
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      goalName: '',
      purchasePrice: '',
      quantity: '',
      currentPrice: '',
      dateFrom: '',
      dateTo: '',
      profitable: '',
    });
    setPage(1);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  // Close menu on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };

    if (menuOpenId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpenId]);

  const handleEdit = (investment: Investment) => {
    if (onEdit) {
      onEdit(investment);
    }
    setMenuOpenId(null);
  };

  const investmentList = investments?.results || [];

  if (isError) {
    return (
      <div className="shadow-md rounded-lg bg-white p-4 text-red-500">
        Failed to load investments. Please try again later.
      </div>
    );
  }

  return (
    <div className="shadow-md rounded-lg bg-white p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Investment History</h2>
        <button
          className="p-2 rounded hover:bg-gray-100"
          onClick={() => setShowFilters(!showFilters)}
          aria-label={showFilters ? "Hide filters" : "Show filters"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 13.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 019 17v-3.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
        </button>
      </div>

      {/* Filter Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setShowFilters(false)} />
          <div className="relative bg-white w-80 max-w-full h-full shadow-lg p-6 overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
              onClick={() => setShowFilters(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-lg font-semibold mb-4">Filter Investments</h3>
            <div className="flex flex-col gap-4">
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="border rounded px-2 py-1"
              >
                <option value="">All Types</option>
                <option value="STOCK">Stock</option>
                <option value="MUTUAL_FUND">Mutual Fund</option>
              </select>
              <input
                type="text"
                name="goalName"
                value={filters.goalName}
                onChange={handleFilterChange}
                placeholder="Goal name"
                className="border rounded px-2 py-1"
              />
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                placeholder="From date"
                className="border rounded px-2 py-1"
              />
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                placeholder="To date"
                className="border rounded px-2 py-1"
              />
              <select
                name="profitable"
                value={filters.profitable}
                onChange={handleFilterChange}
                className="border rounded px-2 py-1"
              >
                <option value="">All</option>
                <option value="true">Profitable</option>
                <option value="false">Not Profitable</option>
              </select>
              <button
                className="border px-2 py-1 rounded"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : investmentList.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No investments found. {Object.values(filters).some(Boolean) && "Try adjusting your filters."}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Purchase</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Invested</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Live Price</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gain/Loss</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Return</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {investmentList.map((inv) => (
                  <InvestmentRow 
                    key={inv.id}
                    investment={inv}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    menuOpenId={menuOpenId}
                    setMenuOpenId={setMenuOpenId}
                    menuRef={menuRef}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {investmentList.map((inv) => (
              <InvestmentCard 
                key={inv.id}
                investment={inv}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              Showing {investmentList.length} of {investments?.count || 0} investments
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!investments?.previous || page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!investments?.next}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Sub-components for better organization
const InvestmentRow: React.FC<{
  investment: Investment;
  onEdit: (inv: Investment) => void;
  onDelete: (id: number) => void;
  menuOpenId: number | null;
  setMenuOpenId: (id: number | null) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}> = ({ investment: inv, onEdit, onDelete, menuOpenId, setMenuOpenId, menuRef }) => {
  const gainLoss = Number(inv.quantity) * (Number(inv.current_price ?? inv.purchase_price) - Number(inv.purchase_price));
  const returnPercent = Number(inv.purchase_price) > 0 
    ? ((Number(inv.current_price ?? inv.purchase_price) - Number(inv.purchase_price)) / Number(inv.purchase_price) * 100)
    : 0;

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate">
        {inv.goal?.name || inv.notes || "No Name"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell capitalize">
        {inv.goal?.investment_type?.toLowerCase() || "N/A"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        {Number(inv.quantity).toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right hidden md:table-cell">
        {currencyFormat(Number(inv.purchase_price))}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right hidden lg:table-cell">
        {new Date(inv.date).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right hidden xl:table-cell">
        {currencyFormat(Number(inv.quantity) * Number(inv.purchase_price))}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right hidden md:table-cell">
        {currencyFormat(Number(inv.current_price ?? inv.purchase_price))}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        {currencyFormat(Number(inv.quantity) * Number(inv.current_price ?? inv.purchase_price))}
      </td>
      <td className={`px-6 py-4 whitespace-nowrap text-right ${gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
        {currencyFormat(gainLoss)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <span className={`px-2 py-1 rounded ${
          returnPercent > 0.01 ? "bg-green-100 text-green-700" : 
          returnPercent < -0.01 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
        }`}>
          {returnPercent.toFixed(1)}%
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="relative inline-block">
          <button
            className="p-1 rounded-full hover:bg-gray-100"
            onClick={() => setMenuOpenId(menuOpenId === inv.id ? null : inv.id)}
            aria-label="Actions"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <circle cx="4" cy="10" r="2"/>
              <circle cx="10" cy="10" r="2"/>
              <circle cx="16" cy="10" r="2"/>
            </svg>
          </button>
          {menuOpenId === inv.id && (
            <div
              ref={menuRef}
              className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10"
            >
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => onEdit(inv)}
              >
                Edit
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                onClick={() => onDelete(inv.id)}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

const InvestmentCard: React.FC<{
  investment: Investment;
  onDelete: (id: number) => void;
}> = ({ investment: inv, onDelete }) => {
  const gainLoss = Number(inv.quantity) * (Number(inv.current_price ?? inv.purchase_price) - Number(inv.purchase_price));
  const returnPercent = Number(inv.purchase_price) > 0 
    ? ((Number(inv.current_price ?? inv.purchase_price) - Number(inv.purchase_price)) / Number(inv.purchase_price) * 100)
    : 0;

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-gray-50">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold">{inv.goal?.name || inv.notes || "No Name"}</div>
          <div className="text-xs text-gray-500 capitalize">
            {inv.goal?.investment_type?.toLowerCase() || "N/A"} • {new Date(inv.date).toLocaleDateString()}
          </div>
        </div>
        <button
          className="text-red-600 hover:text-red-800 text-sm"
          onClick={() => onDelete(inv.id)}
        >
          Delete
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
        <div>Units: <span className="font-mono">{Number(inv.quantity).toLocaleString()}</span></div>
        <div>Buy Price: <span className="font-mono">{currencyFormat(Number(inv.purchase_price))}</span></div>
        <div>Current: <span className="font-mono">{currencyFormat(Number(inv.current_price ?? inv.purchase_price))}</span></div>
        <div>Value: <span className="font-mono">{currencyFormat(Number(inv.quantity) * Number(inv.current_price ?? inv.purchase_price))}</span></div>
        <div className={gainLoss >= 0 ? "text-green-600" : "text-red-600"}>
          Gain/Loss: <span className="font-mono">{currencyFormat(gainLoss)}</span>
        </div>
        <div>
          Return: <span className={`px-2 py-1 rounded text-xs ${
            returnPercent > 0.01 ? "bg-green-100 text-green-700" : 
            returnPercent < -0.01 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
          }`}>
            {returnPercent.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default InvestmentList;