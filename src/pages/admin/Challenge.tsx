import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChallenges } from '@/hooks/challengeHooks/useChallenges';
import { AdminPageTitle } from '@/components/admin/admin-page-title';
import { ChallengesTable } from '@/components/admin/challenges-table';
import { ChallengesFilter } from '@/components/admin/challenges-filter';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Challenge, EventType } from '@/types/challenge';

export default function ChallengePage() {
  const navigate = useNavigate();
  const {
    data: challenges,
    isLoading,
    isError,
    error,
    refetch,
  } = useChallenges();
  
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    type: 'all',
    sortBy: 'newest'
  });


  useEffect(() => {
    if (!challenges) return;

    let result = [...challenges];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(challenge => 
        challenge.challenge_name.toLowerCase().includes(searchLower) || 
        (challenge.description && challenge.description.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      result = result.filter(challenge => 
        (filters.status === 'active' && challenge.status) ||
        (filters.status === 'upcoming' && challenge.status) ||
        (filters.status === 'ended' && !challenge.status)
      );
    }

    // Apply type filter
    if (filters.type !== 'all') {
      const typeNumber = Number(filters.type);
      result = result.filter(challenge => challenge.event_type === typeNumber);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'name-asc':
        result.sort((a, b) => a.challenge_name.localeCompare(b.challenge_name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.challenge_name.localeCompare(a.challenge_name));
        break;
      case 'participants':
        result.sort((a, b) => (b.participant_count || 0) - (a.participant_count || 0));
        break;
      default:
        break;
    }

    setFilteredChallenges(result);
  }, [challenges, filters]);

  const handleFilterChange = (newFilters: {
    search: string;
    status: string;
    type: string;
    sortBy: string;
  }) => {
    setFilters(newFilters);
  };

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading challenge: {error.message}</p>;

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <AdminPageTitle 
          title="Challenge Management" 
          description="Create, manage, and monitor challenges for users" 
        />
        <Button onClick={() => navigate('/user/create-challenge')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Challenge
        </Button>
      </div>
      
      <div className="space-y-6">
        <ChallengesFilter 
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        
        <ChallengesTable 
          challenges={filteredChallenges} 
          loading={isLoading} 
        />
      </div>
    </div>
  );
} 