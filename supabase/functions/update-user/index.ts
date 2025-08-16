import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UpdateUserRequest {
  userId: string
  firstName: string
  lastName: string
  role: 'admin' | 'student'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { userId, firstName, lastName, role }: UpdateUserRequest = await req.json()

    console.log('Updating user:', { userId, firstName, lastName, role })

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
      })
      .eq('user_id', userId)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      throw profileError
    }

    // Update role
    const { error: roleError } = await supabase
      .from('user_roles')
      .update({ role })
      .eq('user_id', userId)

    if (roleError) {
      console.error('Error updating role:', roleError)
      throw roleError
    }

    console.log('User updated successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User updated successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in update-user function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to update user',
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})