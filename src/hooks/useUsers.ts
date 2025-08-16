import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserWithRole {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string;
  email?: string;
  role: 'admin' | 'student';
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to include role
      const usersWithRole: UserWithRole[] = (data || []).map(profile => ({
        ...profile,
        role: (profile.user_roles as any)?.[0]?.role || 'student'
      }));

      return usersWithRole;
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'student' }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Sucesso!",
        description: "Role do usuário atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar role: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userId: string) => {
      // This will cascade delete the profile and user_roles due to foreign key constraints
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Sucesso!",
        description: "Usuário excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao excluir usuário: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}