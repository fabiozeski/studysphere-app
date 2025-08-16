import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Users, 
  User,
  Bell,
  MessageSquare,
  CheckCircle
} from "lucide-react";
import { useSendNotification } from "@/hooks/useSendNotification";
import { useToast } from "@/hooks/use-toast";
import { useUsers } from "@/hooks/useUsers";

export function NotificationSender() {
  const { toast } = useToast();
  const { data: users = [] } = useUsers();
  const sendNotificationMutation = useSendNotification();
  
  const [formData, setFormData] = useState({
    type: 'all' as 'single' | 'all',
    userId: '',
    title: '',
    message: '',
    notificationType: 'info' as 'info' | 'success' | 'warning' | 'error',
    category: 'general' as 'general' | 'course' | 'module' | 'lesson' | 'achievement',
    relatedEntityId: '',
  });

  const handleSend = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e mensagem são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (formData.type === 'single' && !formData.userId) {
      toast({
        title: "Usuário obrigatório",
        description: "Selecione um usuário para notificação individual.",
        variant: "destructive",
      });
      return;
    }

    try {
      await sendNotificationMutation.mutateAsync(formData);
      
      toast({
        title: "Notificação enviada!",
        description: formData.type === 'all' 
          ? "Notificação enviada para todos os usuários."
          : "Notificação enviada para o usuário selecionado.",
      });

      // Reset form
      setFormData({
        type: 'all',
        userId: '',
        title: '',
        message: '',
        notificationType: 'info',
        category: 'general',
        relatedEntityId: '',
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar notificação",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'warning':
        return <Bell className="w-4 h-4 text-warning" />;
      case 'error':
        return <Bell className="w-4 h-4 text-destructive" />;
      default:
        return <MessageSquare className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Enviar Notificação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recipient Type */}
        <div className="space-y-3">
          <Label>Destinatário</Label>
          <RadioGroup
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value as 'single' | 'all' })}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="flex items-center gap-2 cursor-pointer">
                <Users className="w-4 h-4" />
                Todos os usuários
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="single" id="single" />
              <Label htmlFor="single" className="flex items-center gap-2 cursor-pointer">
                <User className="w-4 h-4" />
                Usuário específico
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* User Selection (if single) */}
        {formData.type === 'single' && (
          <div className="space-y-2">
            <Label htmlFor="userId">Selecionar Usuário</Label>
            <Select value={formData.userId} onValueChange={(value) => setFormData({ ...formData, userId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um usuário" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.user_id}>
                    {user.first_name} {user.last_name} ({user.profiles?.email || 'Email não disponível'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Notification Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="notificationType">Tipo</Label>
            <Select 
              value={formData.notificationType} 
              onValueChange={(value) => setFormData({ ...formData, notificationType: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">
                  <div className="flex items-center gap-2">
                    {getTypeIcon('info')}
                    Informação
                  </div>
                </SelectItem>
                <SelectItem value="success">
                  <div className="flex items-center gap-2">
                    {getTypeIcon('success')}
                    Sucesso
                  </div>
                </SelectItem>
                <SelectItem value="warning">
                  <div className="flex items-center gap-2">
                    {getTypeIcon('warning')}
                    Aviso
                  </div>
                </SelectItem>
                <SelectItem value="error">
                  <div className="flex items-center gap-2">
                    {getTypeIcon('error')}
                    Erro
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({ ...formData, category: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Geral</SelectItem>
                <SelectItem value="course">Curso</SelectItem>
                <SelectItem value="module">Módulo</SelectItem>
                <SelectItem value="lesson">Aula</SelectItem>
                <SelectItem value="achievement">Conquista</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Digite o título da notificação"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Mensagem</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Digite a mensagem da notificação"
            rows={4}
          />
        </div>

        {/* Preview */}
        {formData.title && formData.message && (
          <div className="p-4 border rounded-lg bg-accent/50">
            <Label className="text-sm font-medium mb-2 block">Preview da Notificação:</Label>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${
                formData.notificationType === 'success' ? 'bg-success/10' :
                formData.notificationType === 'warning' ? 'bg-warning/10' :
                formData.notificationType === 'error' ? 'bg-destructive/10' :
                'bg-primary/10'
              }`}>
                {getTypeIcon(formData.notificationType)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{formData.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{formData.message}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {formData.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">agora</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={handleSend} 
          disabled={sendNotificationMutation.isPending || !formData.title || !formData.message}
          className="w-full"
        >
          <Send className="w-4 h-4 mr-2" />
          {sendNotificationMutation.isPending ? 'Enviando...' : 'Enviar Notificação'}
        </Button>
      </CardContent>
    </Card>
  );
}