import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AccessRequest {
  id: string;
  user_id: string;
  course_id: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string | null;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  };
  course?: {
    id: string;
    title: string;
  };
}

export function useAccessRequests() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRequests = async () => {
    try {
      // Fetch requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('access_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Fetch user profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name');

      if (profilesError) throw profilesError;

      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, title');

      if (coursesError) throw coursesError;

      // Combine data
      const formattedData = (requestsData || []).map(request => ({
        ...request,
        user: profilesData?.find(p => p.user_id === request.user_id) ? {
          id: profilesData.find(p => p.user_id === request.user_id)!.id,
          first_name: profilesData.find(p => p.user_id === request.user_id)!.first_name,
          last_name: profilesData.find(p => p.user_id === request.user_id)!.last_name,
        } : undefined,
        course: coursesData?.find(c => c.id === request.course_id) ? {
          id: coursesData.find(c => c.id === request.course_id)!.id,
          title: coursesData.find(c => c.id === request.course_id)!.title,
        } : undefined
      }));
      
      setRequests(formattedData as AccessRequest[]);
    } catch (error) {
      console.error('Error fetching access requests:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar solicitações de acesso",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateRequestStatus = async (
    requestId: string, 
    status: 'approved' | 'rejected', 
    adminResponse?: string
  ) => {
    try {
      const { error } = await supabase
        .from('access_requests')
        .update({ 
          status, 
          admin_response: adminResponse,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      // If approved, create enrollment
      if (status === 'approved') {
        const request = requests.find(r => r.id === requestId);
        if (request) {
          const { error: enrollError } = await supabase
            .from('enrollments')
            .insert({
              user_id: request.user_id,
              course_id: request.course_id
            });

          if (enrollError) throw enrollError;
        }
      }

      toast({
        title: "Sucesso",
        description: `Solicitação ${status === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso`,
      });

      fetchRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar solicitação",
        variant: "destructive",
      });
    }
  };

  return {
    requests,
    loading,
    refetch: fetchRequests,
    updateRequestStatus,
  };
}

export function useCreateAccessRequest() {
  const { toast } = useToast();

  const createRequest = async (courseId: string, message?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('access_requests')
        .insert({
          user_id: user.id,
          course_id: courseId,
          message,
        });

      if (error) {
        if (error.code === '23505') { // Unique violation
          toast({
            title: "Aviso",
            description: "Você já possui uma solicitação pendente para este curso",
            variant: "destructive",
          });
          return false;
        }
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Solicitação de acesso enviada com sucesso",
      });

      return true;
    } catch (error) {
      console.error('Error creating access request:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar solicitação",
        variant: "destructive",
      });
      return false;
    }
  };

  return { createRequest };
}