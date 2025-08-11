import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { usePriceWebSocket } from '../hooks/usePriceWebSocket';
import Header from '../components/layout/Header';

type Asset = {
  id: number;
  name: string;
  ticker: string;
  asset_type: 'STOCK' | 'MUTUAL_FUND';
  current_price: string;
  last_updated?: string;
};

type AssetListResponse = {
  results: Asset[];
  count?: number;
};

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);

  // Initialize WebSocket for real-time price updates
  usePriceWebSocket();

  // Fetch all assets with proper typing
  const { data: assets, isLoading } = useQuery<AssetListResponse>({
    queryKey: ['assets'],
    queryFn: () => api.get('/assets/').then(res => res.data),
  });

  // Add asset mutation with error handling
  const addAssetMutation = useMutation({
    mutationFn: (newAsset: Omit<Asset, 'id'>) => api.post('/assets/', newAsset),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setShowAddForm(false);
    },
    onError: (error) => {
      console.error('Failed to add asset:', error);
      alert('Failed to add asset. Please try again.');
    }
  });

  // Edit asset mutation with optimistic updates
  const editAssetMutation = useMutation({
    mutationFn: ({ id, current_price }: { id: number; current_price: string }) =>
      api.patch(`/assets/${id}/`, { current_price }),
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['assets'] });

      // Snapshot the previous value
      const previousAssets = queryClient.getQueryData<AssetListResponse>(['assets']);

      // Optimistically update the cache
      if (previousAssets) {
        queryClient.setQueryData<AssetListResponse>(['assets'], {
          ...previousAssets,
          results: previousAssets.results.map(asset => 
            asset.id === variables.id 
              ? { ...asset, current_price: variables.current_price } 
              : asset
          ),
        });
      }

      return { previousAssets };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousAssets) {
        queryClient.setQueryData(['assets'], context.previousAssets);
      }
      alert('Failed to update price');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setEditAsset(null);
    }
  });

  // Form handlers with proper typing
  const handleAddAsset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addAssetMutation.mutate({
      name: formData.get('name') as string,
      ticker: formData.get('ticker') as string,
      asset_type: formData.get('asset_type') as 'STOCK' | 'MUTUAL_FUND',
      current_price: formData.get('current_price') as string,
    });
  };

  const handleEditAsset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editAsset) return;
    
    const formData = new FormData(e.currentTarget);
    editAssetMutation.mutate({
      id: editAsset.id,
      current_price: formData.get('current_price') as string,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
    
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p className="mb-6 text-gray-600">Manage stocks and mutual funds for all users.</p>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Asset Management</h2>
            <button
              className="btn-primary"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Cancel' : '+ Add New Asset'}
            </button>
          </div>

          {/* Add Asset Form */}
          {showAddForm && (
            <form onSubmit={handleAddAsset} className="mb-8 space-y-4 p-4 bg-gray-50 rounded">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input 
                    name="name" 
                    className="input-field w-full" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ticker Symbol</label>
                  <input 
                    name="ticker" 
                    className="input-field w-full" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select 
                    name="asset_type" 
                    className="input-field w-full" 
                    required
                    defaultValue="STOCK"
                  >
                    <option value="STOCK">Stock</option>
                    <option value="MUTUAL_FUND">Mutual Fund</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Price ($)</label>
                  <input 
                    name="current_price" 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    className="input-field w-full" 
                    required 
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={addAssetMutation.isPending}
                >
                  {addAssetMutation.isPending ? 'Adding...' : 'Add Asset'}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Asset List Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticker</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">Loading assets...</td>
                  </tr>
                ) : assets?.results?.length ? (
                  assets.results.map((asset) => (
                    <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{asset.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono">{asset.ticker}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          asset.asset_type === 'STOCK' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {asset.asset_type === 'STOCK' ? 'Stock' : 'Mutual Fund'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold">
                        Tshs {parseFloat(asset.current_price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {asset.last_updated ? new Date(asset.last_updated).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setEditAsset(asset)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Edit Price
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">No assets found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Price Modal */}
        {editAsset && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center border-b p-4">
                <h3 className="text-lg font-medium">
                  Edit Price: {editAsset.name} ({editAsset.ticker})
                </h3>
                <button 
                  onClick={() => setEditAsset(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleEditAsset} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Price (Tshs)</label>
                  <input
                    name="current_price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="input-field w-full"
                    defaultValue={editAsset.current_price}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setEditAsset(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary bg-red-600 hover:bg-red-700"
                    disabled={editAssetMutation.isPending}
                  >
                    {editAssetMutation.isPending ? 'Updating...' : 'Update Price'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}