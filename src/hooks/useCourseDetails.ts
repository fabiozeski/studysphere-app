import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  video_type: 'youtube' | 'upload';
  duration_minutes: number;
  order_index: number;
  materials: Array<{ name: string; url: string }>;
}

export interface Module {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  lessons: Lesson[];
}

export interface CourseDetails {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  instructor_name: string | null;
  duration_hours: number;
  modules: Module[];
}

export function useCourseDetails(courseId: string) {
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      checkEnrollment();
      fetchProgress();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;

      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select(`
          *,
          lessons(*)
        `)
        .eq('course_id', courseId)
        .order('order_index');

      if (modulesError) throw modulesError;

      const modules = modulesData?.map(module => ({
        ...module,
        lessons: module.lessons.sort((a: any, b: any) => a.order_index - b.order_index).map((lesson: any) => ({
          ...lesson,
          video_type: lesson.video_type as 'youtube' | 'upload',
          duration_minutes: lesson.duration_minutes || 0,
          materials: Array.isArray(lesson.materials) ? lesson.materials : []
        }))
      })) || [];

      setCourse({
        ...courseData,
        modules
      });

      // Set first lesson as current if none selected
      if (modules.length > 0 && modules[0].lessons.length > 0) {
        setCurrentLesson(modules[0].lessons[0]);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking enrollment:', error);
        return;
      }
      setIsEnrolled(!!data);
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const fetchProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setCompletedLessons(new Set(data?.map(p => p.lesson_id) || []));
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const enrollInCourse = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId
        });

      if (error) throw error;
      setIsEnrolled(true);
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId
        });

      if (error) throw error;
      setCompletedLessons(prev => new Set([...prev, lessonId]));
    } catch (error) {
      console.error('Error marking lesson as complete:', error);
    }
  };

  return {
    course,
    loading,
    isEnrolled,
    currentLesson,
    setCurrentLesson,
    completedLessons,
    enrollInCourse,
    markLessonComplete,
  };
}