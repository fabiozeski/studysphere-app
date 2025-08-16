import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Clock, 
  Search,
  Play,
  Award,
  Filter,
  Grid3X3,
  List,
  CheckCircle
} from "lucide-react";
import { useEnrolledCourses } from "@/hooks/useEnrolledCourses";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatDuration } from "@/lib/formatDuration";

const EnrolledCourses = () => {
  const { profile } = useAuth();
  const { data: enrolledCourses = [], isLoading } = useEnrolledCourses();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter courses based on search and status
  const filteredCourses = enrolledCourses.filter(enrollment => {
    const course = enrollment.courses;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (filter) {
      case 'completed':
        return enrollment.completed_at !== null;
      case 'in-progress':
        return enrollment.completed_at === null && (enrollment.progress?.completedLessons || 0) > 0;
      default:
        return true;
    }
  });

  const handleCourseClick = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const completedCount = enrolledCourses.filter(e => e.completed_at).length;
  const inProgressCount = enrolledCourses.filter(e => !e.completed_at && (e.progress?.completedLessons || 0) > 0).length;
  const notStartedCount = enrolledCourses.filter(e => !e.completed_at && (e.progress?.completedLessons || 0) === 0).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-hero rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Meus Cursos, {profile?.first_name || 'Estudante'}!
        </h1>
        <p className="text-white/90 text-lg">
          Continue seu aprendizado de onde parou
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Inscritos</p>
                <p className="text-2xl font-bold">{enrolledCourses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Play className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Em Progresso</p>
                <p className="text-2xl font-bold">{inProgressCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Não Iniciados</p>
                <p className="text-2xl font-bold">{notStartedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar nos meus cursos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-80"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todos
            </Button>
            <Button
              variant={filter === 'in-progress' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('in-progress')}
            >
              Em Progresso
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('completed')}
            >
              Concluídos
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Courses */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchTerm ? 'Nenhum curso encontrado' : 'Nenhum curso inscrito'}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm 
              ? 'Tente ajustar sua busca' 
              : 'Explore nossos cursos e comece sua jornada de aprendizado'
            }
          </p>
          {!searchTerm && (
            <Button 
              className="mt-4" 
              onClick={() => navigate('/courses')}
            >
              Explorar Cursos
            </Button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredCourses.map((enrollment) => {
            const course = enrollment.courses;
            const progress = enrollment.progress;
            
            if (viewMode === 'list') {
              return (
                <Card 
                  key={enrollment.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleCourseClick(course.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={course.thumbnail_url || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop"}
                        alt={course.title}
                        className="w-20 h-14 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{course.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {course.instructor_name}
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progresso</span>
                              <span>{progress?.progressPercentage || 0}%</span>
                            </div>
                            <Progress value={progress?.progressPercentage || 0} className="h-2" />
                          </div>
                          <Badge variant={enrollment.completed_at ? "default" : "secondary"}>
                            {enrollment.completed_at ? "Concluído" : "Em progresso"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }

            return (
              <Card 
                key={enrollment.id} 
                className="group hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() => handleCourseClick(course.id)}
              >
                <div className="relative">
                  <img
                    src={course.thumbnail_url || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop"}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant={enrollment.completed_at ? "default" : "secondary"}>
                      {enrollment.completed_at ? "Concluído" : "Em progresso"}
                    </Badge>
                  </div>
                  {progress && progress.progressPercentage > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 rounded-b-lg">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progresso</span>
                        <span>{progress.progressPercentage}%</span>
                      </div>
                      <Progress value={progress.progressPercentage} className="h-1 bg-white/20" />
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{course.instructor_name}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(course.duration_minutes || 0)}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Inscrito {formatDistanceToNow(new Date(enrollment.enrolled_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </span>
                      {progress && (
                        <span>
                          {progress.completedLessons} / {progress.totalLessons} aulas
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EnrolledCourses;