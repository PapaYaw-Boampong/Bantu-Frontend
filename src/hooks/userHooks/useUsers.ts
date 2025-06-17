import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { User } from '@/types/user';
import { useToast } from '@/components/ui/use-toast';

export function useUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { 
    data: users = [], 
    isLoading,
    isError,
    error,
    refetch 
  } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getUsers,
  });

  const deactivateUserMutation = useMutation({
    mutationFn: (userId: string) => userService.deactivateUser(userId),
    onSuccess: (_, userId) => {
      // Update the users list in the cache
      queryClient.setQueryData(['users'], (oldData: User[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(user => 
          user.id === userId ? { ...user, is_active: false } : user
        );
      });

      toast({
        title: 'Success',
        description: 'User deactivated successfully',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.message || 'Failed to deactivate user',
        variant: 'destructive',
      });
      throw err;
    }
  });

  return {
    users,
    loading: isLoading,
    error: isError ? (error as Error).message || 'Failed to fetch users' : null,
    fetchUsers: refetch,
    deactivateUser: deactivateUserMutation.mutate,
  };
} 