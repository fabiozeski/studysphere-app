import { useState, useEffect, useRef } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useCourseDetails } from "@/hooks/useCourseDetails";
import { 
  Play, 
  Pause, 
  Volume2, 
  Maximize, 
  Download, 
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronUp,
  FileText,
  Link,
  Lock
} from "lucide-react";

const CourseView = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubeRef = useRef<HTMLIFrameElement>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isVideoEnded, setIsVideoEnded] = useState(false);

  const {
    course,
    loading,
    isEnrolled,
    currentLesson,
    setCurrentLesson,
    completedLessons,
    enrollInCourse,
    markLessonComplete,
  } = useCourseDetails(courseId!);

  // Expand first module by default
  useEffect(() => {
    if (course?.modules && course.modules.length > 0 && expandedModules.length === 0) {
      setExpandedModules([course.modules[0].id]);
    }
  }, [course?.modules, expandedModules.length]);

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setVideoProgress(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setVideoDuration(video.duration);
    };

    const handleEnded = () => {
      setIsVideoEnded(true);
      if (currentLesson && !completedLessons.has(currentLesson.id)) {
        markLessonComplete(currentLesson.id);
        toast.success("Aula marcada como concluída!");
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentLesson, completedLessons, markLessonComplete]);

  // YouTube video end detection
  useEffect(() => {
    if (currentLesson?.video_type === 'youtube') {
      const checkVideoEnd = () => {
        const iframe = youtubeRef.current;
        if (iframe && iframe.contentWindow) {
          // This is a simplified approach - in production you'd use YouTube Player API
          setTimeout(() => {
            if (currentLesson && !completedLessons.has(currentLesson.id)) {
              // For demo purposes, we'll mark as complete after 80% of duration
              const watchedPercentage = (videoProgress / (currentLesson.duration_minutes * 60)) * 100;
              if (watchedPercentage >= 80) {
                markLessonComplete(currentLesson.id);
                toast.success("Aula marcada como concluída!");
              }
            }
          }, 1000);
        }
      };
      
      const interval = setInterval(checkVideoEnd, 5000);
      return () => clearInterval(interval);
    }
  }, [currentLesson, videoProgress, completedLessons, markLessonComplete]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const getModuleProgress = (moduleId: string) => {
    const module = course?.modules.find(m => m.id === moduleId);
    if (!module) return 0;
    const completedCount = module.lessons.filter(lesson => completedLessons.has(lesson.id)).length;
    return (completedCount / module.lessons.length) * 100;
  };

  const getCourseProgress = () => {
    if (!course) return 0;
    const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
    return totalLessons > 0 ? (completedLessons.size / totalLessons) * 100 : 0;
  };

  const handleEnroll = async () => {
    try {
      await enrollInCourse();
      toast.success("Inscrição realizada com sucesso!");
    } catch (error) {
      toast.error("Erro ao se inscrever no curso");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  if (!courseId) {
    return <Navigate to="/courses" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="aspect-video w-full" />
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-1/2 mb-4" />
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return <Navigate to="/courses" replace />;
  }

  if (!isEnrolled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Curso Não Acessível</h2>
            <p className="text-muted-foreground mb-4">
              Você precisa se inscrever neste curso para acessar o conteúdo.
            </p>
            <Button onClick={handleEnroll} className="w-full">
              Inscrever-se no Curso
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Left Column - Video Player and Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <Card className="overflow-hidden">
            <div className="relative bg-black aspect-video">
              {currentLesson ? (
                currentLesson.video_type === 'youtube' ? (
                  currentLesson.video_url ? (
                    <iframe
                      ref={youtubeRef}
                      src={`https://www.youtube.com/embed/${getYouTubeVideoId(currentLesson.video_url)}?enablejsapi=1`}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      title={currentLesson.title}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <p>URL do vídeo não encontrada</p>
                    </div>
                  )
                ) : (
                  currentLesson.video_url ? (
                    <video
                      ref={videoRef}
                      src={currentLesson.video_url}
                      controls
                      className="w-full h-full"
                      onEnded={() => setIsVideoEnded(true)}
                    >
                      Seu navegador não suporta o elemento de vídeo.
                    </video>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <p>Vídeo não disponível</p>
                    </div>
                  )
                )
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Selecione uma aula para começar</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Course Info */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h1 className="text-2xl font-bold">{course.title}</h1>
                  <p className="text-muted-foreground">por {course.instructor_name}</p>
                </div>
                
                {currentLesson && (
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">
                      {course.modules.find(m => m.lessons.some(l => l.id === currentLesson.id))?.title}
                    </Badge>
                    <Badge variant="outline">
                      Aula: {currentLesson.title}
                    </Badge>
                    {completedLessons.has(currentLesson.id) && (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Concluída
                      </Badge>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso do Curso</span>
                    <span>{Math.round(getCourseProgress())}%</span>
                  </div>
                  <Progress value={getCourseProgress()} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {currentLesson && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Descrição da Aula</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {currentLesson.description || "Nenhuma descrição disponível para esta aula."}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Materials */}
          {currentLesson && currentLesson.materials && currentLesson.materials.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Materiais Adicionais
                </h3>
                <div className="space-y-3">
                  {currentLesson.materials.map((material, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">{material.name}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(material.url, '_blank')}
                      >
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Course Content */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Conteúdo do Curso</h3>
              <div className="space-y-4">
                {course.modules.map((module) => (
                  <div key={module.id} className="border rounded-lg">
                    <div 
                      className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => toggleModule(module.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{module.title}</h4>
                            {module.lessons.every(lesson => completedLessons.has(lesson.id)) && module.lessons.length > 0 && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <Progress value={getModuleProgress(module.id)} className="h-1" />
                            <p className="text-xs text-muted-foreground">
                              {module.lessons.filter(l => completedLessons.has(l.id)).length} de {module.lessons.length} aulas
                            </p>
                          </div>
                        </div>
                        {expandedModules.includes(module.id) ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                    
                    {expandedModules.includes(module.id) && (
                      <div className="border-t">
                        {module.lessons.map((lesson) => (
                          <div 
                            key={lesson.id} 
                            className={`p-3 flex items-center gap-3 hover:bg-accent/50 transition-colors cursor-pointer ${
                              currentLesson?.id === lesson.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                            }`}
                            onClick={() => setCurrentLesson(lesson)}
                          >
                            {completedLessons.has(lesson.id) ? (
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm truncate ${currentLesson?.id === lesson.id ? 'font-medium' : ''}`}>
                                {lesson.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {lesson.duration_minutes}min
                              </p>
                            </div>
                            {currentLesson?.id === lesson.id && (
                              <Badge variant="default" className="text-xs">Atual</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseView;