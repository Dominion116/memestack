'use client';

import { useState, useMemo } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { LaunchCard } from '@/components/launch/LaunchCard';
import { LaunchFilters } from '@/components/launch/LaunchFilters';
import { useLaunches } from '@/lib/hooks/useLaunches';
import type { LaunchFilter, LaunchSortBy } from '@/lib/types';

function LaunchesPageContent() {
  const [filter, setFilter] = useState<LaunchFilter>('all');
  const [sortBy, setSortBy] = useState<LaunchSortBy>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  const { launches, isLoading, error } = useLaunches(filter, sortBy);

  // Client-side search filtering
  const filteredLaunches = useMemo(() => {
    if (!searchQuery) return launches;
    
    const query = searchQuery.toLowerCase();
    return launches.filter(
      (launch) =>
        launch.tokenName.toLowerCase().includes(query) ||
        launch.tokenSymbol.toLowerCase().includes(query)
    );
  }, [launches, searchQuery]);

  return (
    <div className="container py-6 sm:py-8 space-y-6 sm:space-y-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Browse Launches</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Discover and participate in token launches
          </p>
        </div>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Launch
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <LaunchFilters
        filter={filter}
        sortBy={sortBy}
        searchQuery={searchQuery}
        onFilterChange={setFilter}
        onSortChange={setSortBy}
        onSearchChange={setSearchQuery}
      />

      {/* Results Count */}
      {!isLoading && (
        <div className="text-sm text-muted-foreground">
          {filteredLaunches.length} {filteredLaunches.length === 1 ? 'launch' : 'launches'} found
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="flex flex-col h-full">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <Skeleton className="h-2 w-full" />
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Launch Grid */}
      {!isLoading && !error && filteredLaunches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLaunches.map((launch) => (
            <LaunchCard key={launch.id} launch={launch} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredLaunches.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
            <Loader2 className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No launches found</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {searchQuery
              ? `No launches match your search "${searchQuery}"`
              : 'Be the first to create a launch on Memestack!'}
          </p>
          <Button asChild>
            <Link href="/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Launch
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

// Import Card components for skeleton
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export default function LaunchesPage() {
  return (
    <ProtectedRoute>
      <LaunchesPageContent />
    </ProtectedRoute>
  );
}
