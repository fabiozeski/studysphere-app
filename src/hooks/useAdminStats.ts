import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: totalCourses },
        { count: publishedCourses },
        { count: totalEnrollments },
        enrollmentsData
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('enrollments').select('*', { count: 'exact', head: true }),
        supabase
          .from('enrollments')
          .select(`
            enrolled_at,
            courses!inner(title)
          `)
          .order('enrolled_at', { ascending: false })
          .limit(7)
      ]);

      // Process enrollment data for chart (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const enrollmentsByDay = last7Days.map(date => {
        const count = enrollmentsData.data?.filter(enrollment => 
          enrollment.enrolled_at.split('T')[0] === date
        ).length || 0;
        return { date, enrollments: count };
      });

      return {
        totalUsers: totalUsers || 0,
        totalCourses: totalCourses || 0,
        publishedCourses: publishedCourses || 0,
        totalEnrollments: totalEnrollments || 0,
        enrollmentsByDay,
        recentEnrollments: enrollmentsData.data || []
      };
    },
  });
}