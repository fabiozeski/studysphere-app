import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  instructor_name: string | null;
  duration_minutes: number;
  is_published: boolean;
  category_id: string | null;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface Module {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string | null;
  module_id: string;
  order_index: number;
  video_url: string | null;
  video_type: 'youtube' | 'upload';
  duration_minutes: number;
  materials: any[];
  created_at: string;
  updated_at: string;
}

interface CreateCourseData {
  title: string;
  description?: string;
  instructor_name?: string;
  duration_minutes?: number;
  category_id?: string;
  thumbnail_url?: string;
  is_published?: boolean;
  course_type?: 'free' | 'private';
}

interface UpdateCourseData {
  id: string;
  title?: string;
  description?: string;
  instructor_name?: string;
  duration_minutes?: number;
  category_id?: string;
  thumbnail_url?: string;
  is_published?: boolean;
  course_type?: 'free' | 'private';
}

interface CreateModuleData {
  title: string;
  description?: string;
  course_id: string;
  order_index: number;
}

interface CreateLessonData {
  title: string;
  description?: string;
  module_id: string;
  order_index: number;
  video_url?: string;
  video_type?: 'youtube' | 'upload';
  duration_minutes?: number;
  materials?: any[];
}

// Course hooks
export function useAdminCourses() {
  return useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          category:categories(id, name, slug)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Course[];
    },
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (courseData: CreateCourseData) => {
      const { data, error } = await supabase
        .from('courses')
        .insert({
          title: courseData.title,
          description: courseData.description || null,
          instructor_name: courseData.instructor_name || null,
          duration_minutes: courseData.duration_minutes || 0,
          category_id: courseData.category_id || null,
          thumbnail_url: courseData.thumbnail_url || null,
          is_published: courseData.is_published || false,
          course_type: courseData.course_type || 'free',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast({
        title: 'Curso criado',
        description: 'O curso foi criado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar curso',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (courseData: UpdateCourseData) => {
      const { id, ...updateData } = courseData;
      const { data, error } = await supabase
        .from('courses')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast({
        title: 'Curso atualizado',
        description: 'O curso foi atualizado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar curso',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast({
        title: 'Curso excluído',
        description: 'O curso foi excluído com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir curso',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
}

// Module hooks
export function useCourseModules(courseId: string) {
  return useQuery({
    queryKey: ['course-modules', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (error) throw error;
      return data as Module[];
    },
    enabled: !!courseId,
  });
}

export function useCreateModule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (moduleData: CreateModuleData) => {
      const { data, error } = await supabase
        .from('modules')
        .insert(moduleData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['course-modules', data.course_id] });
      toast({
        title: 'Módulo criado',
        description: 'O módulo foi criado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar módulo',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
}

// Lesson hooks
export function useModuleLessons(moduleId: string) {
  return useQuery({
    queryKey: ['module-lessons', moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index');

      if (error) throw error;
      return data as Lesson[];
    },
    enabled: !!moduleId,
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (lessonData: CreateLessonData) => {
      const { data, error } = await supabase
        .from('lessons')
        .insert(lessonData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['module-lessons', data.module_id] });
      toast({
        title: 'Aula criada',
        description: 'A aula foi criada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar aula',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateModule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Partial<Module>) => {
      const { data, error } = await supabase
        .from('modules')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['course-modules', data.course_id] });
      toast({
        title: 'Módulo atualizado',
        description: 'O módulo foi atualizado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar módulo',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Partial<Lesson>) => {
      const { data, error } = await supabase
        .from('lessons')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['module-lessons', data.module_id] });
      toast({
        title: 'Aula atualizada',
        description: 'A aula foi atualizada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar aula',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
}

// File upload hooks
export function useUploadFile() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ file, bucket, path }: { file: File; bucket: string; path: string }) => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          upsert: true,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return { ...data, publicUrl };
    },
    onError: (error: any) => {
      toast({
        title: 'Erro no upload',
        description: error.message || 'Erro ao fazer upload do arquivo.',
        variant: 'destructive',
      });
    },
  });
}