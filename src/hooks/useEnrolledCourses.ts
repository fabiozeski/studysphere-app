import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface EnrolledCourse {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at: string | null;
  courses: {
    id: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    instructor_name: string | null;
    duration_minutes: number | null;
    category_id: string | null;
    is_published: boolean;
    created_at: string;
    updated_at: string;
    categories?: {
      name: string;
      slug: string;
    } | null;
  };
  progress?: {
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
  };
}

export function useEnrolledCourses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['enrolled-courses', user?.id],
    queryFn: async (): Promise<EnrolledCourse[]> => {
      if (!user?.id) {
        return [];
      }

      // Get enrolled courses with course details
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses!inner(
            *,
            categories(name, slug)
          )
        `)
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (enrollmentsError) throw enrollmentsError;

      if (!enrollments) return [];

      // For each enrolled course, calculate progress
      const enrolledCoursesWithProgress = await Promise.all(
        enrollments.map(async (enrollment) => {
          // Get all modules for this course
          const { data: modules } = await supabase
            .from('modules')
            .select(`
              id,
              lessons(
                id,
                title
              )
            `)
            .eq('course_id', enrollment.course_id);

          // Get user's completed lessons for this course
          const lessonIds = modules?.flatMap(module => 
            module.lessons?.map(lesson => lesson.id) || []
          ) || [];

          let completedLessons = 0;
          if (lessonIds.length > 0) {
            const { data: completedLessonsData } = await supabase
              .from('lesson_progress')
              .select('lesson_id')
              .eq('user_id', user.id)
              .in('lesson_id', lessonIds);

            completedLessons = completedLessonsData?.length || 0;
          }

          const totalLessons = lessonIds.length;
          const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

          return {
            ...enrollment,
            progress: {
              totalLessons,
              completedLessons,
              progressPercentage: Math.round(progressPercentage),
            },
          };
        })
      );

      return enrolledCoursesWithProgress;
    },
    enabled: !!user?.id,
  });
}