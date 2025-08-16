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
import { useUpdateModule, Module } from '@/hooks/useAdminCourses';
import { Loader2 } from 'lucide-react';

const moduleSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  order_index: z.number().min(0),
});

type ModuleFormData = z.infer<typeof moduleSchema>;

interface EditModuleModalProps {
  module: Module;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditModuleModal({ module, open, onOpenChange }: EditModuleModalProps) {
  const updateModule = useUpdateModule();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      title: module.title,
      description: module.description || '',
      order_index: module.order_index,
    },
  });

  const onSubmit = async (data: ModuleFormData) => {
    try {
      await updateModule.mutateAsync({
        id: module.id,
        ...data,
      });

      onOpenChange(false);
      reset();
    } catch (error) {
      console.error('Erro ao atualizar módulo:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Módulo</DialogTitle>
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
            <Label htmlFor="order_index">Ordem</Label>
            <Input
              id="order_index"
              type="number"
              min="0"
              {...register('order_index', { valueAsNumber: true })}
              className="mt-1"
            />
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