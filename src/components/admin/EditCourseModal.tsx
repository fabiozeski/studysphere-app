import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCategories } from '@/hooks/useCategories';
import { useUpdateCourse, useUploadFile, Course } from '@/hooks/useAdminCourses';
import { Loader2, Upload } from 'lucide-react';

const courseSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  instructor_name: z.string().optional(),
  duration_hours: z.number().min(0).optional(),
  category_id: z.string().optional(),
  is_published: z.boolean().optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface EditCourseModalProps {
  course: Course;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCourseModal({ course, open, onOpenChange }: EditCourseModalProps) {
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const { data: categories } = useCategories();
  const updateCourse = useUpdateCourse();
  const uploadFile = useUploadFile();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: course.title,
      description: course.description || '',
      instructor_name: course.instructor_name || '',
      duration_hours: course.duration_hours,
      category_id: course.category_id || '',
      is_published: course.is_published,
    },
  });

  const isPublished = watch('is_published');

  const onSubmit = async (data: CourseFormData) => {
    try {
      let thumbnailUrl = course.thumbnail_url;

      if (thumbnailFile) {
        const fileExt = thumbnailFile.name.split('.').pop();
        const fileName = `${course.id}.${fileExt}`;
        
        const uploadResult = await uploadFile.mutateAsync({
          file: thumbnailFile,
          bucket: 'course-thumbnails',
          path: fileName,
        });
        
        thumbnailUrl = uploadResult.publicUrl;
      }

      await updateCourse.mutateAsync({
        id: course.id,
        title: data.title,
        description: data.description,
        instructor_name: data.instructor_name,
        duration_hours: data.duration_hours,
        category_id: data.category_id || null,
        thumbnail_url: thumbnailUrl,
        is_published: data.is_published,
      });

      onOpenChange(false);
      reset();
      setThumbnailFile(null);
    } catch (error) {
      console.error('Erro ao atualizar curso:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Curso</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              {...register('title')}
              className="mt-1"
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register('description')}
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="instructor_name">Nome do Instrutor</Label>
            <Input
              id="instructor_name"
              {...register('instructor_name')}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="duration_hours">Duração (horas)</Label>
            <Input
              id="duration_hours"
              type="number"
              min="0"
              step="0.5"
              {...register('duration_hours', { valueAsNumber: true })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={watch('category_id') || 'none'}
              onValueChange={(value) => setValue('category_id', value === 'none' ? null : value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma categoria</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="thumbnail">Capa do Curso</Label>
            <div className="mt-1 flex items-center gap-2">
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="flex-1"
              />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
            {course.thumbnail_url && !thumbnailFile && (
              <p className="text-sm text-muted-foreground mt-1">
                Capa atual: {course.thumbnail_url.split('/').pop()}
              </p>
            )}
            {thumbnailFile && (
              <p className="text-sm text-muted-foreground mt-1">
                Nova capa: {thumbnailFile.name}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_published"
              checked={isPublished}
              onCheckedChange={(checked) => setValue('is_published', checked)}
            />
            <Label htmlFor="is_published">Curso publicado</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}