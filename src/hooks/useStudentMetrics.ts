import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface StudentMetrics {
  enrolledCoursesCount: number;
  completedCoursesCount: number;
  totalLessonsCompleted: number;
  totalStudyTimeHours: number;
  certificatesEarned: number;
  currentStreak: number;
  weeklyGoalHours: number;
  weeklyStudiedHours: number;
  monthlyProgress: { month: string; hours: number }[];
  recentActivity: {
    id: string;
    type: 'course_enrolled' | 'lesson_completed' | 'course_completed' | 'certificate_earned';
    title: string;
    description: string;
    date: string;
  }[];
}

export function useStudentMetrics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['student-metrics', user?.id],
    queryFn: async (): Promise<StudentMetrics> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Get enrolled courses
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses!inner(*)
        `)
        .eq('user_id', user.id);

      if (enrollmentsError) throw enrollmentsError;

      // Get completed lessons
      const { data: lessonProgress, error: progressError } = await supabase
        .from('lesson_progress')
        .select(`
          *,
          lessons!inner(
            *,
            modules!inner(
              *,
              courses!inner(*)
            )
          )
        `)
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      // Calculate metrics
      const enrolledCoursesCount = enrollments?.length || 0;
      const completedCoursesCount = enrollments?.filter(e => e.completed_at)?.length || 0;
      const totalLessonsCompleted = lessonProgress?.length || 0;

      // Mock data for now - in a real app, you'd calculate these from actual data
      const totalStudyTimeHours = totalLessonsCompleted * 1.5; // Assuming 1.5 hours per lesson
      const certificatesEarned = completedCoursesCount;
      const currentStreak = Math.floor(Math.random() * 30) + 1;
      const weeklyGoalHours = 10;
      const weeklyStudiedHours = Math.floor(Math.random() * 12);

      // Generate monthly progress (last 6 months)
      const monthlyProgress = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return {
          month: date.toLocaleDateString('pt-BR', { month: 'short' }),
          hours: Math.floor(Math.random() * 40) + 10,
        };
      }).reverse();

      // Generate recent activity
      const recentActivity = [
        ...enrollments?.slice(0, 3).map(e => ({
          id: e.id,
          type: 'course_enrolled' as const,
          title: `Inscrição no curso`,
          description: e.courses?.title || 'Curso',
          date: e.enrolled_at,
        })) || [],
        ...lessonProgress?.slice(0, 3).map(p => ({
          id: p.id,
          type: 'lesson_completed' as const,
          title: `Aula concluída`,
          description: p.lessons?.title || 'Aula',
          date: p.completed_at,
        })) || [],
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

      return {
        enrolledCoursesCount,
        completedCoursesCount,
        totalLessonsCompleted,
        totalStudyTimeHours,
        certificatesEarned,
        currentStreak,
        weeklyGoalHours,
        weeklyStudiedHours,
        monthlyProgress,
        recentActivity,
      };
    },
    enabled: !!user?.id,
  });
}