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

// Mock user role - in real app this would come from auth context
type UserRole = "student" | "admin";
const userRole: UserRole = "student";

const studentItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Meus Cursos", url: "/courses", icon: BookOpen },
  { title: "Progresso", url: "/progress", icon: BarChart3 },
  { title: "Perfil", url: "/profile", icon: User },
];

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: Home },
  { title: "Alunos", url: "/admin/students", icon: Users },
  { title: "Cursos", url: "/admin/courses", icon: BookOpen },
  { title: "Categorias", url: "/admin/categories", icon: FolderOpen },
  { title: "Configurações", url: "/admin/settings", icon: Settings },
  { title: "Perfil", url: "/admin/profile", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const items = userRole === "admin" ? adminItems : studentItems;
  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-primary font-medium" 
      : "hover:bg-sidebar-accent/50 text-sidebar-foreground";

  return (
    <Sidebar
      className={isCollapsed ? "w-16" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent>
        {/* Logo/Brand */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="text-lg font-bold text-sidebar-foreground">EduPlatform</h2>
                <p className="text-xs text-sidebar-foreground/70 capitalize flex items-center gap-1">
                  {userRole === "admin" && <Shield className="w-3 h-3" />}
                  {userRole === "admin" ? "Administrador" : "Estudante"}
                </p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup className="px-2">
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            {!isCollapsed && "Navegação"}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}