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
      // Use edge function to get users with all data
      const { data, error } = await supabase.functions.invoke('list-users');
      
      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to fetch users');

      return data.users as UserWithRole[];
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

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ firstName, lastName, email, password, role }: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role: 'admin' | 'student';
    }) => {
      // Use edge function to create user with admin privileges
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: { firstName, lastName, email, password, role }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to create user');

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Sucesso!",
        description: "Usuário criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao criar usuário: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, firstName, lastName, role }: {
      userId: string;
      firstName: string;
      lastName: string;
      role: 'admin' | 'student';
    }) => {
      // Use edge function to update user
      const { data, error } = await supabase.functions.invoke('update-user', {
        body: { userId, firstName, lastName, role }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to update user');

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Sucesso!",
        description: "Usuário atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar usuário: ${error.message}`,
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
      // Use edge function to delete user
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to delete user');

      return data;
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