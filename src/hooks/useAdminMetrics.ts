import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminMetrics {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  completedCourses: number;
  totalLessons: number;
  totalStudyHours: number;
  activeUsers: number;
  recentEnrollments: Array<{
    id: string;
    enrolled_at: string;
    user: {
      first_name: string;
      last_name: string;
    };
    course: {
      title: string;
    };
  }>;
  courseStats: Array<{
    course_id: string;
    course_title: string;
    enrollments_count: number;
    completion_rate: number;
    avg_progress: number;
  }>;
  userProgress: Array<{
    user_id: string;
    user_name: string;
    enrolled_courses: number;
    completed_courses: number;
    total_study_hours: number;
    progress_percentage: number;
  }>;
}

export function useAdminMetrics() {
  return useQuery({
    queryKey: ['admin-metrics'],
    queryFn: async (): Promise<AdminMetrics> => {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total courses
      const { count: totalCourses } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

      // Get total enrollments
      const { count: totalEnrollments } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true });

      // Get completed courses
      const { count: completedCourses } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .not('completed_at', 'is', null);

      // Get total lessons
      const { count: totalLessons } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true });

      // Calculate total study hours from completed lessons
      const { data: completedLessonsData } = await supabase
        .from('lesson_progress')
        .select(`
          lessons(duration_minutes)
        `);

      const totalStudyHours = Math.round(
        (completedLessonsData?.reduce((acc, item) => 
          acc + (item.lessons?.duration_minutes || 0), 0) || 0) / 60
      );

      // Get active users (users with lesson progress in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: activeUsersData } = await supabase
        .from('lesson_progress')
        .select('user_id')
        .gte('completed_at', thirtyDaysAgo.toISOString());

      const activeUsers = new Set(activeUsersData?.map(item => item.user_id) || []).size;

      // Get recent enrollments
      const { data: recentEnrollments } = await supabase
        .from('enrollments')
        .select(`
          id,
          enrolled_at,
          user_id,
          course_id
        `)
        .order('enrolled_at', { ascending: false })
        .limit(10);

      // Get user and course data separately
      const userIds = recentEnrollments?.map(e => e.user_id) || [];
      const courseIds = recentEnrollments?.map(e => e.course_id) || [];

      const { data: usersForEnrollments } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', userIds);

      const { data: coursesForEnrollments } = await supabase
        .from('courses')
        .select('id, title')
        .in('id', courseIds);

      const formattedRecentEnrollments = recentEnrollments?.map(enrollment => {
        const user = usersForEnrollments?.find(u => u.user_id === enrollment.user_id);
        const course = coursesForEnrollments?.find(c => c.id === enrollment.course_id);
        
        return {
          id: enrollment.id,
          enrolled_at: enrollment.enrolled_at,
          user: {
            first_name: user?.first_name || 'N/A',
            last_name: user?.last_name || 'N/A',
          },
          course: {
            title: course?.title || 'N/A',
          },
        };
      }) || [];

      // Get course statistics
      const { data: coursesData } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          enrollments(id, completed_at),
          modules(
            id,
            lessons(id)
          )
        `);

      const courseStats = coursesData?.map(course => {
        const enrollmentsCount = course.enrollments?.length || 0;
        const completedCount = course.enrollments?.filter(e => e.completed_at)?.length || 0;
        const completionRate = enrollmentsCount > 0 ? (completedCount / enrollmentsCount) * 100 : 0;

        return {
          course_id: course.id,
          course_title: course.title,
          enrollments_count: enrollmentsCount,
          completion_rate: Math.round(completionRate),
          avg_progress: Math.round(completionRate), // Simplified for now
        };
      }) || [];

      // Get user progress
      const { data: usersData } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name');

      const { data: enrollmentsData } = await supabase
        .from('enrollments')
        .select('user_id, completed_at');

      const { data: lessonProgressData } = await supabase
        .from('lesson_progress')
        .select(`
          user_id,
          lessons(duration_minutes)
        `);

      const userProgress = usersData?.map(user => {
        const userEnrollments = enrollmentsData?.filter(e => e.user_id === user.user_id) || [];
        const enrolledCourses = userEnrollments.length;
        const completedCourses = userEnrollments.filter(e => e.completed_at)?.length || 0;
        
        const userLessonProgress = lessonProgressData?.filter(lp => lp.user_id === user.user_id) || [];
        const totalMinutes = userLessonProgress.reduce((acc, item) => 
          acc + (item.lessons?.duration_minutes || 0), 0);
        const totalStudyHours = Math.round(totalMinutes / 60);
        const progressPercentage = enrolledCourses > 0 ? (completedCourses / enrolledCourses) * 100 : 0;

        return {
          user_id: user.user_id,
          user_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A',
          enrolled_courses: enrolledCourses,
          completed_courses: completedCourses,
          total_study_hours: totalStudyHours,
          progress_percentage: Math.round(progressPercentage),
        };
      }) || [];

      return {
        totalUsers: totalUsers || 0,
        totalCourses: totalCourses || 0,
        totalEnrollments: totalEnrollments || 0,
        completedCourses: completedCourses || 0,
        totalLessons: totalLessons || 0,
        totalStudyHours,
        activeUsers,
        recentEnrollments: formattedRecentEnrollments,
        courseStats,
        userProgress,
      };
    },
  });
}