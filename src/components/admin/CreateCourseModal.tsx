import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateCourse, useUploadFile } from '@/hooks/useAdminCourses';
import { useCategories } from '@/hooks/useCategories';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';

interface CreateCourseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCourseModal({ open, onOpenChange }: CreateCourseModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor_name: '',
    duration: 0,
    duration_unit: 'hours' as 'hours' | 'minutes',
    category_id: '',
    is_published: false,
    course_type: 'free' as 'free' | 'private',
  });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createCourse = useCreateCourse();
  const uploadFile = useUploadFile();
  const { data: categories = [] } = useCategories();

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    try {
      let thumbnailUrl = null;

      // Upload thumbnail if selected
      if (thumbnail) {
        const timestamp = Date.now();
        const fileName = `${timestamp}-${thumbnail.name}`;
        const uploadResult = await uploadFile.mutateAsync({
          file: thumbnail,
          bucket: 'course-thumbnails',
          path: fileName,
        });
        thumbnailUrl = uploadResult.publicUrl;
      }

      // Convert duration to hours
      const durationInHours = formData.duration_unit === 'minutes' 
        ? Math.round(formData.duration) / 60 
        : formData.duration;

      await createCourse.mutateAsync({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        instructor_name: formData.instructor_name.trim() || undefined,
        duration_hours: durationInHours,
        category_id: formData.category_id || undefined,
        thumbnail_url: thumbnailUrl,
        is_published: formData.is_published,
        course_type: formData.course_type,
      });
      
      setFormData({
        title: '',
        description: '',
        instructor_name: '',
        duration: 0,
        duration_unit: 'hours',
        category_id: '',
        is_published: false,
        course_type: 'free',
      });
      removeThumbnail();
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the hooks
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      instructor_name: '',
      duration: 0,
      duration_unit: 'hours',
      category_id: '',
      is_published: false,
      course_type: 'free',
    });
    removeThumbnail();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Curso</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Thumbnail Upload */}
          <div className="space-y-3">
            <Label>Capa do Curso</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              {thumbnailPreview ? (
                <div className="relative">
                  <img 
                    src={thumbnailPreview} 
                    alt="Preview" 
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeThumbnail}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div 
                  className="text-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Clique para selecionar uma imagem de capa
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recomendado: 1280x720px, formato JPG ou PNG
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailSelect}
                className="hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Curso *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Digite o título do curso"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructor_name">Instrutor</Label>
              <Input
                id="instructor_name"
                value={formData.instructor_name}
                onChange={(e) => setFormData(prev => ({ ...prev, instructor_name: e.target.value }))}
                placeholder="Nome do instrutor"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duração do Curso</Label>
              <div className="flex gap-2">
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="flex-1"
                />
                <Select 
                  value={formData.duration_unit} 
                  onValueChange={(value: 'hours' | 'minutes') => 
                    setFormData(prev => ({ ...prev, duration_unit: value }))
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">Horas</SelectItem>
                    <SelectItem value="minutes">Minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição do curso"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course_type">Tipo do Curso</Label>
            <Select 
              value={formData.course_type} 
              onValueChange={(value: 'free' | 'private') => 
                setFormData(prev => ({ ...prev, course_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Livre (Acesso direto)</SelectItem>
                <SelectItem value="private">Privado (Requer aprovação)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="is_published">Publicar Curso</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, is_published: checked }))
                }
              />
              <span className="text-sm text-muted-foreground">
                {formData.is_published ? 'Publicado' : 'Rascunho'}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.title.trim() || createCourse.isPending || uploadFile.isPending}
              className="bg-gradient-primary hover:opacity-90"
            >
              {createCourse.isPending || uploadFile.isPending ? 'Criando...' : 'Criar Curso'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}