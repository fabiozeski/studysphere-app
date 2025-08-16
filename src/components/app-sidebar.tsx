import { useState } from "react";
import { 
  Home, 
  BookOpen, 
  Users, 
  Settings, 
  User,
  BarChart3,
  FolderOpen,
  GraduationCap,
  Shield
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const studentItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Explorar Cursos", url: "/courses", icon: BookOpen },
  { title: "Meus Cursos", url: "/my-courses", icon: GraduationCap },
  { title: "Métricas", url: "/metrics", icon: BarChart3 },
  { title: "Perfil", url: "/profile", icon: User },
];

const adminItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Métricas", url: "/admin/metrics", icon: BarChart3 },
  { title: "Usuários", url: "/users", icon: Users },
  { title: "Cursos", url: "/admin/courses", icon: BookOpen },
  { title: "Categorias", url: "/admin/categories", icon: FolderOpen },
  { title: "Solicitações", url: "/admin/access-requests", icon: Shield },
  { title: "Perfil", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { userRole } = useAuth();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const items = userRole === "admin" ? adminItems : studentItems;
  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-primary font-medium rounded-md" 
      : "hover:bg-sidebar-accent/70 text-sidebar-foreground/80 hover:text-sidebar-foreground rounded-md transition-smooth";

  return (
    <Sidebar
      className="w-16"
      collapsible="none"
    >
      <SidebarContent className="p-2">
        {/* Minimal Logo */}
        <div className="p-3 mb-4 flex justify-center">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
        </div>

        <SidebarGroup className="px-0">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="w-12 h-12 p-0 justify-center">
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls}
                      title={item.title}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User indicator at bottom */}
        <div className="mt-auto p-3 flex justify-center">
          <div className="w-8 h-8 bg-sidebar-accent rounded-full flex items-center justify-center">
            {userRole === "admin" ? (
              <Shield className="w-4 h-4 text-sidebar-primary" />
            ) : (
              <User className="w-4 h-4 text-sidebar-foreground/70" />
            )}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}