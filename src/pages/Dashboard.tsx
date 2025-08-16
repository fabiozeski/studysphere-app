import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp,
  Play,
  Users,
  BarChart3,
  GraduationCap
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useCourses } from "@/hooks/useCourses";

const Dashboard = () => {
  const { userRole, profile } = useAuth();
  const { data: adminStats, isLoading: adminLoading } = useAdminStats();
  const { courses } = useCourses();

  // Show loading state
  if (adminLoading && userRole === 'admin') {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  if (userRole === 'admin') {
    const stats = [
      {
        title: "Total de Usuários",
        value: adminStats?.totalUsers?.toString() || "0",
        icon: Users,
        color: "text-primary"
      },
      {
        title: "Cursos Totais",
        value: adminStats?.totalCourses?.toString() || "0",
        icon: BookOpen,
        color: "text-warning"
      },
      {
        title: "Cursos Publicados",
        value: adminStats?.publishedCourses?.toString() || "0",
        icon: GraduationCap,
        color: "text-success"
      },
      {
        title: "Total de Inscrições",
        value: adminStats?.totalEnrollments?.toString() || "0",
        icon: TrendingUp,
        color: "text-primary"
      }
    ];

    return (
      <div className="p-6 space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-hero rounded-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Bem-vindo, {profile?.first_name || 'Admin'}!
          </h1>
          <p className="text-white/90 text-lg">
            Gerencie seus cursos, alunos e monitore o progresso da plataforma.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Cursos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {courses.slice(0, 3).map((course) => (
                <div 
                  key={course.id} 
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <img 
                    src={course.thumbnail_url || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop"} 
                    alt={course.title}
                    className="w-16 h-12 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{course.title}</h4>
                    <p className="text-sm text-muted-foreground">{course.instructor_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        course.is_published ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                      }`}>
                        {course.is_published ? 'Publicado' : 'Rascunho'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link to="/admin/courses">Ver Todos os Cursos</Link>
            </Button>
            </CardContent>
          </Card>

          {/* Platform Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Estatísticas da Plataforma
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Cursos Publicados</span>
                    <span>{adminStats?.publishedCourses} / {adminStats?.totalCourses}</span>
                  </div>
                  <Progress 
                    value={adminStats?.totalCourses ? (adminStats.publishedCourses / adminStats.totalCourses) * 100 : 0} 
                    className="h-3" 
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Taxa de Engajamento</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-3" />
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Últimas Inscrições</h4>
                  <div className="space-y-2 text-sm">
                    {adminStats?.recentEnrollments?.slice(0, 3).map((enrollment, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        {enrollment.courses?.title || 'Curso não encontrado'}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Student Dashboard (existing mock data for now)
  const studentStats = [
    {
      title: "Cursos Inscritos",
      value: "5",
      icon: BookOpen,
      color: "text-primary"
    },
    {
      title: "Horas Estudadas",
      value: "24h",
      icon: Clock,
      color: "text-warning"
    },
    {
      title: "Certificados",
      value: "2",
      icon: Award,
      color: "text-success"
    },
    {
      title: "Progresso Geral",
      value: "68%",
      icon: TrendingUp,
      color: "text-primary"
    }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-hero rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Bem-vindo de volta, {profile?.first_name || 'Estudante'}!
        </h1>
        <p className="text-white/90 text-lg">
          Continue seu aprendizado e alcance seus objetivos educacionais.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {studentStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Courses - Show available courses for students */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Cursos Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {courses.filter(c => c.is_published).slice(0, 3).map((course) => (
              <div 
                key={course.id} 
                className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <img 
                  src={course.thumbnail_url || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop"} 
                  alt={course.title}
                  className="w-16 h-12 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{course.title}</h4>
                  <p className="text-sm text-muted-foreground">{course.instructor_name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Progress value={Math.random() * 100} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground">
                      {Math.floor(Math.random() * 100)}%
                    </span>
                  </div>
                </div>
                <Button size="icon" variant="ghost">
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link to="/courses">Ver Todos os Cursos</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Learning Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Estatísticas de Aprendizado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Meta Semanal</span>
                  <span>8h / 10h</span>
                </div>
                <Progress value={80} className="h-3" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Cursos Concluídos</span>
                  <span>2 / 5</span>
                </div>
                <Progress value={40} className="h-3" />
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3">Próximas Metas</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Finalizar módulo React Hooks
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    Começar curso de Node.js
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    Obter certificação em TypeScript
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;