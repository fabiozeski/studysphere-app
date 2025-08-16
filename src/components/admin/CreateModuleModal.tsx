import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateModule } from '@/hooks/useAdminCourses';

interface CreateModuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  nextOrderIndex: number;
}

export function CreateModuleModal({ open, onOpenChange, courseId, nextOrderIndex }: CreateModuleModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const createModule = useCreateModule();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    try {
      await createModule.mutateAsync({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        course_id: courseId,
        order_index: nextOrderIndex,
      });
      
      setFormData({ title: '', description: '' });
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleClose = () => {
    setFormData({ title: '', description: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Módulo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Módulo *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Digite o título do módulo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição do módulo (opcional)"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.title.trim() || createModule.isPending}
              className="bg-gradient-primary hover:opacity-90"
            >
              {createModule.isPending ? 'Criando...' : 'Criar Módulo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}