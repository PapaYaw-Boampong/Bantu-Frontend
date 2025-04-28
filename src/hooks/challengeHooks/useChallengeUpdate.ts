import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ChallengeUpdate } from '@/types/challenge';

/**
 * Hook to subscribe to and track challenge updates in real-time
 * Can be used to listen for changes made by other users or systems
 * 
 * @param id The challenge ID to track
 * @param onUpdate Optional callback when challenge data is updated
 */
export function useChallengeUpdate(id: string, onUpdate?: (data: ChallengeUpdate) => void) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!id) return;

    // This is where you would set up a WebSocket or SSE connection
    // to receive real-time updates about the challenge
    
    // Example with a polling mechanism as fallback
    const interval = setInterval(() => {
      // Refresh the challenge data every 30 seconds
      queryClient.invalidateQueries({ queryKey: ['challenge', id] });
    }, 30000); // 30 seconds

    return () => {
      clearInterval(interval);
      // Clean up any subscriptions here
    };
  }, [id, queryClient, onUpdate]);

  // Function to manually refresh challenge data
  const refreshChallenge = () => {
    if (id) {
      queryClient.invalidateQueries({ queryKey: ['challenge', id] });
    }
  };

  return { refreshChallenge };
}
