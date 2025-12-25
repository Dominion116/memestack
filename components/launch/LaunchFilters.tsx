'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { LaunchFilter, LaunchSortBy } from '@/lib/types';

interface LaunchFiltersProps {
  filter: LaunchFilter;
  sortBy: LaunchSortBy;
  searchQuery: string;
  onFilterChange: (filter: LaunchFilter) => void;
  onSortChange: (sort: LaunchSortBy) => void;
  onSearchChange: (query: string) => void;
}

export function LaunchFilters({
  filter,
  sortBy,
  searchQuery,
  onFilterChange,
  onSortChange,
  onSearchChange,
}: LaunchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const clearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by token name or symbol..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button
          variant="outline"
          size="default"
          onClick={() => setShowFilters(!showFilters)}
          className="sm:w-auto"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {filter !== 'all' && (
            <Badge variant="secondary" className="ml-2">1</Badge>
          )}
        </Button>
      </div>

      {/* Filter Tabs & Sort */}
      {showFilters && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Tabs value={filter} onValueChange={(v) => onFilterChange(v as LaunchFilter)}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="ending-soon">Ending Soon</TabsTrigger>
                <TabsTrigger value="successful">Successful</TabsTrigger>
                <TabsTrigger value="failed">Failed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sort By</label>
            <Select value={sortBy} onValueChange={(v) => onSortChange(v as LaunchSortBy)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="most-raised">Most Raised</SelectItem>
                <SelectItem value="ending-soon">Ending Soon</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {(filter !== 'all' || searchQuery) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Status: {filter}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFilterChange('all')}
              />
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchQuery}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={clearSearch}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
