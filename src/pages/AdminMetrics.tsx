import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  Clock, 
  TrendingUp, 
  Award,
  UserCheck,
  BarChart3
} from "lucide-react";
import { useAdminMetrics } from "@/hooks/useAdminMetrics";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const AdminMetrics = () => {
  const { data: metrics, isLoading } = useAdminMetrics();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-gradient-hero rounded-xl p-8 text-white">
          <Skeleton className="h-8 w-64 bg-white/20" />
          <Skeleton className="h-5 w-96 bg-white/20 mt-2" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const completionRate = metrics.totalEnrollments > 0 
    ? (metrics.completedCourses / metrics.totalEnrollments) * 100 
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-hero rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Painel de Métricas Admin
        </h1>
        <p className="text-white/90 text-lg">
          Acompanhe o desempenho da plataforma e progresso dos alunos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Usuários</p>
                <p className="text-2xl font-bold">{metrics.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <BookOpen className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cursos</p>
                <p className="text-2xl font-bold">{metrics.totalCourses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <GraduationCap className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inscrições</p>
                <p className="text-2xl font-bold">{metrics.totalEnrollments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <UserCheck className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                <p className="text-2xl font-bold">{metrics.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent">
                <Award className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cursos Concluídos</p>
                <p className="text-2xl font-bold">{metrics.completedCourses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Horas Estudadas</p>
                <p className="text-2xl font-bold">{metrics.totalStudyHours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent">
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-2xl font-bold">{Math.round(completionRate)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Estatísticas por Curso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.courseStats.slice(0, 5).map((course) => (
                <div key={course.course_id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm truncate max-w-xs">
                      {course.course_title}
                    </h4>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {course.enrollments_count} inscritos
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {course.completion_rate}% concluído
                      </Badge>
                    </div>
                  </div>
                  <Progress value={course.completion_rate} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Enrollments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Inscrições Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.recentEnrollments.slice(0, 5).map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">
                      {enrollment.user.first_name} {enrollment.user.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-xs">
                      {enrollment.course.title}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(enrollment.enrolled_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Progress Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Progresso dos Alunos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.userProgress
              .filter(user => user.enrolled_courses > 0)
              .slice(0, 10)
              .map((user) => (
              <div key={user.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{user.user_name}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                    <span>{user.enrolled_courses} cursos inscritos</span>
                    <span>{user.completed_courses} concluídos</span>
                    <span>{user.total_study_hours}h estudadas</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right min-w-0">
                    <p className="text-xs text-muted-foreground">Progresso</p>
                    <Progress value={user.progress_percentage} className="h-2 w-20" />
                  </div>
                  <Badge variant={user.progress_percentage >= 80 ? "default" : "secondary"}>
                    {user.progress_percentage}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMetrics;