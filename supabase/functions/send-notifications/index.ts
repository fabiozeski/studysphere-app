import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: 'single' | 'all';
  userId?: string;
  title: string;
  message: string;
  notificationType?: 'info' | 'success' | 'warning' | 'error';
  category?: 'general' | 'course' | 'module' | 'lesson' | 'achievement';
  relatedEntityId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type, userId, title, message, notificationType = 'info', category = 'general', relatedEntityId } = 
      await req.json() as NotificationRequest;

    console.log('Sending notification:', { type, userId, title, message });

    let result;

    if (type === 'single' && userId) {
      // Send notification to specific user
      const { data, error } = await supabase.rpc('send_notification', {
        p_user_id: userId,
        p_title: title,
        p_message: message,
        p_type: notificationType,
        p_category: category,
        p_related_entity_id: relatedEntityId || null
      });

      if (error) throw error;
      result = { notificationId: data, count: 1 };

    } else if (type === 'all') {
      // Send notification to all users
      const { data, error } = await supabase.rpc('send_notification_to_all', {
        p_title: title,
        p_message: message,
        p_type: notificationType,
        p_category: category,
        p_related_entity_id: relatedEntityId || null
      });

      if (error) throw error;
      result = { count: data };

    } else {
      throw new Error('Invalid notification type or missing userId for single notification');
    }

    console.log('Notification sent successfully:', result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent successfully',
        result 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error sending notification:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});