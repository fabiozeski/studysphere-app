import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAccessRequests, AccessRequest } from '@/hooks/useAccessRequests';
import { CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AccessRequestManagement() {
  const { requests, loading, updateRequestStatus } = useAccessRequests();
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [responseType, setResponseType] = useState<'approved' | 'rejected'>('approved');
  const [adminResponse, setAdminResponse] = useState('');

  const handleOpenResponseModal = (request: AccessRequest, type: 'approved' | 'rejected') => {
    setSelectedRequest(request);
    setResponseType(type);
    setAdminResponse('');
    setIsResponseModalOpen(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedRequest) return;

    await updateRequestStatus(selectedRequest.id, responseType, adminResponse);
    setIsResponseModalOpen(false);
    setSelectedRequest(null);
    setAdminResponse('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Aprovada</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600"><XCircle className="w-3 h-3 mr-1" />Rejeitada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando solicitações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Solicitações de Acesso</h1>
        <p className="text-muted-foreground">
          Gerencie as solicitações de acesso aos cursos privados
        </p>
      </div>

      {/* Solicitações Pendentes */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-yellow-600" />
          Pendentes ({pendingRequests.length})
        </h2>
        
        {pendingRequests.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Nenhuma solicitação pendente</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {request.user?.first_name} {request.user?.last_name}
                      </CardTitle>
                      <CardDescription>
                        Curso: {request.course?.title}
                      </CardDescription>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Solicitado em: {format(new Date(request.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    
                    {request.message && (
                      <div>
                        <Label className="text-sm font-medium flex items-center gap-1 mb-2">
                          <MessageSquare className="w-4 h-4" />
                          Mensagem do aluno:
                        </Label>
                        <p className="text-sm bg-muted p-3 rounded-md">{request.message}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleOpenResponseModal(request, 'approved')}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Aprovar
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleOpenResponseModal(request, 'rejected')}
                        className="flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Histórico */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          Histórico ({processedRequests.length})
        </h2>
        
        {processedRequests.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Nenhuma solicitação processada</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {processedRequests.map((request) => (
              <Card key={request.id} className="opacity-75">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {request.user?.first_name} {request.user?.last_name}
                      </CardTitle>
                      <CardDescription>
                        Curso: {request.course?.title}
                      </CardDescription>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Processado em: {format(new Date(request.updated_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    
                    {request.admin_response && (
                      <div>
                        <Label className="text-sm font-medium">Resposta do admin:</Label>
                        <p className="text-sm bg-muted p-3 rounded-md">{request.admin_response}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Resposta */}
      <Dialog open={isResponseModalOpen} onOpenChange={setIsResponseModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {responseType === 'approved' ? 'Aprovar' : 'Rejeitar'} Solicitação
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>
                  Aluno: {selectedRequest.user?.first_name} {selectedRequest.user?.last_name}<br />
                  Curso: {selectedRequest.course?.title}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-response">
                Mensagem {responseType === 'approved' ? '(opcional)' : '(recomendada)'}
              </Label>
              <Textarea
                id="admin-response"
                placeholder={
                  responseType === 'approved' 
                    ? "Parabéns! Sua solicitação foi aprovada..." 
                    : "Informe o motivo da rejeição..."
                }
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResponseModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitResponse}
              variant={responseType === 'approved' ? 'default' : 'destructive'}
            >
              {responseType === 'approved' ? 'Aprovar' : 'Rejeitar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}