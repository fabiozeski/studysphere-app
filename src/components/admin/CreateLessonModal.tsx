import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCreateLesson, useUploadFile } from '@/hooks/useAdminCourses';
import { Upload, X, FileText, Download, Youtube } from 'lucide-react';

interface CreateLessonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleId: string;
  nextOrderIndex: number;
}

export function CreateLessonModal({ open, onOpenChange, moduleId, nextOrderIndex }: CreateLessonModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    video_type: 'youtube' as 'youtube' | 'upload',
    duration_minutes: 0,
  });
  const [materials, setMaterials] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createLesson = useCreateLesson();
  const uploadFile = useUploadFile();

  const handleMaterialsSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMaterials(prev => [...prev, ...files]);
  };

  const removeMaterial = (index: number) => {
    setMaterials(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    try {
      // Upload materials
      const uploadedMaterials = [];
      for (const file of materials) {
        const timestamp = Date.now();
        const fileName = `${moduleId}/${timestamp}-${file.name}`;
        const uploadResult = await uploadFile.mutateAsync({
          file,
          bucket: 'course-materials',
          path: fileName,
        });
        
        uploadedMaterials.push({
          name: file.name,
          size: file.size,
          type: file.type,
          url: uploadResult.publicUrl,
          path: fileName,
        });
      }

      await createLesson.mutateAsync({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        module_id: moduleId,
        order_index: nextOrderIndex,
        video_url: formData.video_url.trim() || undefined,
        video_type: formData.video_type,
        duration_minutes: formData.duration_minutes,
        materials: uploadedMaterials,
      });
      
      setFormData({
        title: '',
        description: '',
        video_url: '',
        video_type: 'youtube',
        duration_minutes: 0,
      });
      setMaterials([]);
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the hooks
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      video_url: '',
      video_type: 'youtube',
      duration_minutes: 0,
    });
    setMaterials([]);
    onOpenChange(false);
  };

  const isUploading = uploadFile.isPending || createLesson.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Nova Aula</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-8rem)] pr-4">
        <form id="create-lesson-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título da Aula *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Digite o título da aula"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duração (minutos)</Label>
              <Input
                id="duration_minutes"
                type="number"
                min="0"
                value={formData.duration_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição da aula (opcional)"
              rows={3}
            />
          </div>

          {/* Video Section */}
          <div className="space-y-4">
            <Label>Vídeo da Aula</Label>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="video_type">Tipo de Vídeo</Label>
                <Select 
                  value={formData.video_type} 
                  onValueChange={(value: 'youtube' | 'upload') => setFormData(prev => ({ ...prev, video_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">
                      <div className="flex items-center gap-2">
                        <Youtube className="w-4 h-4 text-red-500" />
                        YouTube
                      </div>
                    </SelectItem>
                    <SelectItem value="upload">
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload de Arquivo
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="video_url">
                  {formData.video_type === 'youtube' ? 'URL do YouTube' : 'URL do Vídeo'}
                </Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                  placeholder={
                    formData.video_type === 'youtube' 
                      ? 'https://www.youtube.com/watch?v=...' 
                      : 'URL do arquivo de vídeo'
                  }
                />
              </div>
            </div>
          </div>

          {/* Materials Section */}
          <div className="space-y-4">
            <Label>Materiais para Download</Label>
            
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
              <div 
                className="text-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Clique para adicionar materiais de apoio
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDFs, documentos, imagens, etc.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleMaterialsSelect}
                className="hidden"
              />
            </div>

            {materials.length > 0 && (
              <div className="space-y-2">
                <Label>Arquivos Selecionados:</Label>
                <div className="space-y-2">
                  {materials.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMaterial(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </form>
        </ScrollArea>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            form="create-lesson-form"
            type="submit" 
            disabled={!formData.title.trim() || isUploading}
            className="bg-gradient-primary hover:opacity-90"
          >
            {isUploading ? 'Criando...' : 'Criar Aula'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}