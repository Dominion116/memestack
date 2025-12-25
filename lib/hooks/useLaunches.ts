import { useEffect, useState } from 'react';
import { getCurrentLaunchId, getLaunch, getLaunchStats } from '@/lib/stacks/contract';
import type { Launch, LaunchStats, LaunchFilter, LaunchSortBy } from '@/lib/types';
import { LAUNCH_REFRESH_INTERVAL } from '@/lib/stacks/constants';

/**
 * Hook to fetch and manage launches
 */
export function useLaunches(filter: LaunchFilter = 'all', sortBy: LaunchSortBy = 'newest') {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLaunches();
    
    // Set up polling
    const interval = setInterval(fetchLaunches, LAUNCH_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [filter, sortBy]);

  async function fetchLaunches() {
    try {
      setIsLoading(true);
      
      // Get current launch ID
      const currentIdResult = await getCurrentLaunchId();
      if (!currentIdResult.success || !currentIdResult.data) {
        throw new Error('Failed to fetch launches');
      }

      const currentId = currentIdResult.data;
      const launchPromises: Promise<Launch | null>[] = [];

      // Fetch all launches
      for (let i = 1; i <= currentId; i++) {
        launchPromises.push(
          getLaunch(i).then((result) => (result.success ? result.data! : null))
        );
      }

      const allLaunches = (await Promise.all(launchPromises)).filter(
        (launch): launch is Launch => launch !== null
      );

      // Apply filters
      let filteredLaunches = filterLaunches(allLaunches, filter);
      
      // Apply sorting
      filteredLaunches = sortLaunches(filteredLaunches, sortBy);

      setLaunches(filteredLaunches);
      setError(null);
    } catch (err) {
      setError('Failed to load launches');
      console.error('Error fetching launches:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    launches,
    isLoading,
    error,
    refetch: fetchLaunches,
  };
}

/**
 * Hook to fetch a single launch
 */
export function useLaunch(launchId: number) {
  const [launch, setLaunch] = useState<Launch | null>(null);
  const [stats, setStats] = useState<LaunchStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!launchId) return;
    
    fetchLaunch();
    
    // Set up polling
    const interval = setInterval(fetchLaunch, LAUNCH_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [launchId]);

  async function fetchLaunch() {
    try {
      setIsLoading(true);
      
      const [launchResult, statsResult] = await Promise.all([
        getLaunch(launchId),
        getLaunchStats(launchId),
      ]);

      if (!launchResult.success) {
        throw new Error('Launch not found');
      }

      setLaunch(launchResult.data!);
      setStats(statsResult.success ? statsResult.data! : null);
      setError(null);
    } catch (err) {
      setError('Failed to load launch');
      console.error('Error fetching launch:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    launch,
    stats,
    isLoading,
    error,
    refetch: fetchLaunch,
  };
}

/**
 * Helper functions
 */

function filterLaunches(launches: Launch[], filter: LaunchFilter): Launch[] {
  const now = Date.now();
  
  switch (filter) {
    case 'active':
      return launches.filter((l) => !l.isFinalized && now >= l.startBlock && now <= l.endBlock);
    
    case 'ending-soon':
      const oneDayFromNow = now + 24 * 60 * 60 * 1000;
      return launches.filter(
        (l) => !l.isFinalized && now < l.endBlock && l.endBlock <= oneDayFromNow
      );
    
    case 'successful':
      return launches.filter((l) => l.isFinalized && l.isSuccessful);
    
    case 'failed':
      return launches.filter((l) => l.isFinalized && !l.isSuccessful);
    
    default:
      return launches;
  }
}

function sortLaunches(launches: Launch[], sortBy: LaunchSortBy): Launch[] {
  const sorted = [...launches];
  
  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => b.id - a.id);
    
    case 'most-raised':
      return sorted.sort((a, b) => Number(b.totalRaised - a.totalRaised));
    
    case 'ending-soon':
      return sorted.sort((a, b) => a.endBlock - b.endBlock);
    
    case 'progress':
      return sorted.sort((a, b) => {
        const progressA = Number(a.totalRaised) / Number(a.hardCap);
        const progressB = Number(b.totalRaised) / Number(b.hardCap);
        return progressB - progressA;
      });
    
    default:
      return sorted;
  }
}
