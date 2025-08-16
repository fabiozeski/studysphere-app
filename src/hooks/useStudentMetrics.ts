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

      // Get completed lessons with duration
      const { data: lessonProgress, error: progressError } = await supabase
        .from('lesson_progress')
        .select(`
          *,
          lessons!inner(
            duration_minutes,
            title,
            modules!inner(
              title,
              courses!inner(
                title
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (progressError) throw progressError;

      // Calculate real metrics
      const enrolledCoursesCount = enrollments?.length || 0;
      const completedCoursesCount = enrollments?.filter(e => e.completed_at)?.length || 0;
      const totalLessonsCompleted = lessonProgress?.length || 0;

      // Calculate real study time from completed lessons
      const totalStudyTimeMinutes = lessonProgress?.reduce((total, progress) => {
        return total + (progress.lessons?.duration_minutes || 0);
      }, 0) || 0;
      const totalStudyTimeHours = totalStudyTimeMinutes / 60;

      const certificatesEarned = completedCoursesCount;

      // Calculate current streak (consecutive days with activity)
      const currentStreak = calculateStreak(lessonProgress || []);

      // Calculate weekly study time
      const weeklyGoalHours = 10;
      const weeklyStudiedHours = calculateWeeklyHours(lessonProgress || []);

      // Generate real monthly progress (last 6 months)
      const monthlyProgress = calculateMonthlyProgress(lessonProgress || []);

      // Generate recent activity from actual data
      const recentActivity = [
        ...enrollments?.slice(0, 2).map(e => ({
          id: e.id,
          type: 'course_enrolled' as const,
          title: `Inscrição no curso`,
          description: e.courses?.title || 'Curso',
          date: e.enrolled_at,
        })) || [],
        ...lessonProgress?.slice(0, 5).map(p => ({
          id: p.id,
          type: 'lesson_completed' as const,
          title: `Aula concluída`,
          description: `${p.lessons?.title} - ${p.lessons?.modules?.courses?.title}`,
          date: p.completed_at,
        })) || [],
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

      return {
        enrolledCoursesCount,
        completedCoursesCount,
        totalLessonsCompleted,
        totalStudyTimeHours: Math.round(totalStudyTimeHours * 10) / 10, // Round to 1 decimal
        certificatesEarned,
        currentStreak,
        weeklyGoalHours,
        weeklyStudiedHours: Math.round(weeklyStudiedHours * 10) / 10, // Round to 1 decimal
        monthlyProgress,
        recentActivity,
      };
    },
    enabled: !!user?.id,
  });
}

// Helper function to calculate current streak
function calculateStreak(lessonProgress: any[]): number {
  if (lessonProgress.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Group lessons by date
  const lessonsByDate: Record<string, number> = {};
  lessonProgress.forEach(lesson => {
    const date = new Date(lesson.completed_at);
    date.setHours(0, 0, 0, 0);
    const dateKey = date.toISOString().split('T')[0];
    lessonsByDate[dateKey] = (lessonsByDate[dateKey] || 0) + 1;
  });

  let streak = 0;
  let currentDate = new Date(today);

  // Check consecutive days backwards from today
  while (true) {
    const dateKey = currentDate.toISOString().split('T')[0];
    if (lessonsByDate[dateKey]) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // If today has no activity, check yesterday
      if (streak === 0 && currentDate.getTime() === today.getTime()) {
        currentDate.setDate(currentDate.getDate() - 1);
        continue;
      }
      break;
    }
  }

  return streak;
}

// Helper function to calculate weekly study hours
function calculateWeeklyHours(lessonProgress: any[]): number {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weeklyLessons = lessonProgress.filter(lesson => 
    new Date(lesson.completed_at) >= weekAgo
  );

  const weeklyMinutes = weeklyLessons.reduce((total, lesson) => {
    return total + (lesson.lessons?.duration_minutes || 0);
  }, 0);

  return weeklyMinutes / 60;
}

// Helper function to calculate monthly progress
function calculateMonthlyProgress(lessonProgress: any[]): { month: string; hours: number }[] {
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      date: date,
      month: date.toLocaleDateString('pt-BR', { month: 'short' }),
      year: date.getFullYear(),
      monthNum: date.getMonth()
    };
  }).reverse();

  return months.map(monthInfo => {
    const monthLessons = lessonProgress.filter(lesson => {
      const lessonDate = new Date(lesson.completed_at);
      return lessonDate.getMonth() === monthInfo.monthNum && 
             lessonDate.getFullYear() === monthInfo.year;
    });

    const monthlyMinutes = monthLessons.reduce((total, lesson) => {
      return total + (lesson.lessons?.duration_minutes || 0);
    }, 0);

    return {
      month: monthInfo.month,
      hours: Math.round((monthlyMinutes / 60) * 10) / 10 // Round to 1 decimal
    };
  });
}