"use client";

import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EventType } from '@/types/challenge';

interface ChallengesFilterProps {
  onFilterChange: (filters: {
    search: string;
    status: string;
    type: string;
    sortBy: string;
  }) => void;
  filters: {
    search: string;
    status: string;
    type: string;
    sortBy: string;
  };
}

export function ChallengesFilter({ onFilterChange, filters }: ChallengesFilterProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleStatusChange = (value: string) => {
    onFilterChange({ ...filters, status: value });
  };

  const handleTypeChange = (value: string) => {
    onFilterChange({ ...filters, type: value });
  };

  const handleSortChange = (value: string) => {
    onFilterChange({ ...filters, sortBy: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      status: 'all',
      type: 'all',
      sortBy: 'newest'
    });
  };

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search challenges..."
          className="pl-8"
          value={filters.search}
          onChange={handleSearchChange}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Select
          value={filters.status}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="ended">Ended</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        
        <Select
          value={filters.type}
          onValueChange={handleTypeChange}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Challenge Type</SelectLabel>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value={String(EventType.TRANSCRIPTION_CHALLENGE)}>Transcription</SelectItem>
              <SelectItem value={String(EventType.TRANSLATION_CHALLENGE)}>Translation</SelectItem>
              <SelectItem value={String(EventType.MIXED_CORRECTION)}>Mixed</SelectItem>
              <SelectItem value={String(EventType.Data_COLLECTION)}>Data Collection</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="sr-only">More filters</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => handleSortChange('newest')}>
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('oldest')}>
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('name-asc')}>
                Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('name-desc')}>
                Name (Z-A)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('participants')}>
                Most Participants
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={clearFilters} className="justify-center text-center">
              Clear Filters
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
} 