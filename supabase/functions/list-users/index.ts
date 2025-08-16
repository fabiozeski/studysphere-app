import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    console.log('Fetching users...')

    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      throw profilesError
    }

    // Get all user roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')

    if (rolesError) {
      console.error('Error fetching user roles:', rolesError)
      throw rolesError
    }

    // Get auth users to fetch emails
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error fetching auth users:', authError)
      throw authError
    }

    // Transform data to include role and email
    const usersWithRole = (profiles || []).map(profile => {
      const authUser = authUsers?.users?.find((user: any) => user.id === profile.user_id)
      const userRole = userRoles?.find(role => role.user_id === profile.user_id)
      
      return {
        ...profile,
        email: authUser?.email || '',
        role: userRole?.role || 'student'
      }
    })

    console.log(`Found ${usersWithRole.length} users`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        users: usersWithRole 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in list-users function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to list users',
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})