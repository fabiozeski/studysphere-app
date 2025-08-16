import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { useNavigate } from "react-router-dom";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { signOut, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao fazer logout.",
        variant: "destructive",
      });
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Minimal Header */}
          <header className="h-14 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-between px-6">
            <div className="flex items-center gap-6">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Buscar cursos..." 
                  className="pl-10 w-80 bg-card border-border/50 focus:border-primary/50"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <NotificationCenter />
              
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sair">
                <LogOut className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white text-sm font-medium hover:bg-gradient-primary/90 transition-colors p-0"
                onClick={handleProfileClick}
                title="Ir para configurações do perfil"
              >
                {profile?.first_name?.charAt(0) || 'U'}
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}