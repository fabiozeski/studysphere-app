import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SendNotificationParams {
  type: 'single' | 'all';
  userId?: string;
  title: string;
  message: string;
  notificationType?: 'info' | 'success' | 'warning' | 'error';
  category?: 'general' | 'course' | 'module' | 'lesson' | 'achievement';
  relatedEntityId?: string;
}

export function useSendNotification() {
  return useMutation({
    mutationFn: async (params: SendNotificationParams) => {
      const { data, error } = await supabase.functions.invoke('send-notifications', {
        body: params
      });

      if (error) throw error;
      return data;
    },
  });
}