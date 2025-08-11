// hooks/usePriceWebSocket.ts
import { useEffect } from 'react';
import { queryClient } from '../App';
import ReconnectingWebSocket from 'reconnecting-websocket';

const backendPort = 8000; // or whatever port Daphne is running on

export const usePriceWebSocket = () => {
  useEffect(() => {
    const socket = new ReconnectingWebSocket(
      `ws://localhost:${backendPort}/ws/prices/`
    );

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Update investments cache
      queryClient.setQueryData(['investments'], (old: any) => 
        old?.map((inv: any) => 
          inv.asset.id === data.asset_id
            ? { ...inv, current_value: inv.quantity * parseFloat(data.new_price) }
            : inv
        )
      );

      // Invalidate aggregate stats (fix the query key!)
      queryClient.invalidateQueries({ queryKey: ['overall-goal-stats'] });
    };

    return () => socket.close();
  }, []);
};