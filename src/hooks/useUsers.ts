import { useState, useCallback, useEffect } from 'react';
import { userService } from '@/services/userService';
import { User, UserProfile } from '@/types/user';
import { toast } from '@/components/ui/use-toast';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const deactivateUser = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      await userService.deactivateUser(userId);
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_active: false } : user
      ));
      toast({
        title: 'Success',
        description: 'User deactivated successfully',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate user');
      toast({
        title: 'Error',
        description: 'Failed to deactivate user',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    deactivateUser,
  };
} 