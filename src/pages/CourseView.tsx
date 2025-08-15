import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
  Link
} from "lucide-react";

const CourseView = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [expandedModules, setExpandedModules] = useState<number[]>([1]);

  const courseData = {
    title: "React do Zero ao Avançado",
    instructor: "João Silva",
    description: "Neste módulo, você aprenderá os fundamentos do React, incluindo componentes, JSX, props e state. Este é o primeiro passo para dominar uma das bibliotecas mais populares para desenvolvimento front-end.",
    currentLesson: "Introdução ao JSX",
    progress: 45,
    modules: [
      {
        id: 1,
        title: "Fundamentos do React",
        completed: true,
        lessons: [
          { id: 1, title: "O que é React?", duration: "8:30", completed: true },
          { id: 2, title: "Configuração do Ambiente", duration: "12:45", completed: true },
          { id: 3, title: "Introdução ao JSX", duration: "15:20", completed: false, current: true },
          { id: 4, title: "Componentes Funcionais", duration: "18:15", completed: false }
        ]
      },
      {
        id: 2,
        title: "Estado e Props",
        completed: false,
        lessons: [
          { id: 5, title: "Entendendo Props", duration: "14:30", completed: false },
          { id: 6, title: "useState Hook", duration: "20:45", completed: false },
          { id: 7, title: "Event Handling", duration: "16:20", completed: false }
        ]
      },
      {
        id: 3,
        title: "Hooks Avançados",
        completed: false,
        lessons: [
          { id: 8, title: "useEffect Hook", duration: "22:30", completed: false },
          { id: 9, title: "useContext Hook", duration: "18:45", completed: false },
          { id: 10, title: "Custom Hooks", duration: "25:20", completed: false }
        ]
      }
    ],
    materials: [
      { id: 1, title: "Slides da Aula", type: "pdf", size: "2.3 MB" },
      { id: 2, title: "Código Fonte", type: "zip", size: "1.8 MB" },
      { id: 3, title: "Documentação React", type: "link", url: "https://reactjs.org" }
    ]
  };

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const getModuleProgress = (module: any) => {
    const completedLessons = module.lessons.filter((lesson: any) => lesson.completed).length;
    return (completedLessons / module.lessons.length) * 100;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Left Column - Video Player and Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <Card className="overflow-hidden">
            <div className="relative bg-player-background aspect-video">
              {/* Video placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    {isPlaying ? (
                      <Pause className="w-8 h-8" />
                    ) : (
                      <Play className="w-8 h-8 ml-1" />
                    )}
                  </div>
                  <p className="text-lg font-semibold">{courseData.currentLesson}</p>
                  <p className="text-sm text-white/70">Clique para reproduzir</p>
                </div>
              </div>
              
              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <div className="flex items-center gap-4 text-white">
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  <Volume2 className="w-5 h-5" />
                  <div className="flex-1 bg-white/20 h-1 rounded-full">
                    <div className="bg-primary h-full w-1/3 rounded-full"></div>
                  </div>
                  <span className="text-sm">5:30 / 15:20</span>
                  <Maximize className="w-5 h-5" />
                </div>
              </div>
            </div>
          </Card>

          {/* Course Info */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h1 className="text-2xl font-bold">{courseData.title}</h1>
                  <p className="text-muted-foreground">por {courseData.instructor}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">Módulo 1</Badge>
                  <Badge variant="outline">Aula 3 de 4</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso do Curso</span>
                    <span>{courseData.progress}%</span>
                  </div>
                  <Progress value={courseData.progress} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Descrição da Aula</h3>
              <p className="text-muted-foreground leading-relaxed">
                {courseData.description}
              </p>
            </CardContent>
          </Card>

          {/* Materials */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Download className="w-5 h-5" />
                Materiais Adicionais
              </h3>
              <div className="space-y-3">
                {courseData.materials.map((material) => (
                  <div key={material.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {material.type === "pdf" && <FileText className="w-5 h-5 text-destructive" />}
                      {material.type === "zip" && <Download className="w-5 h-5 text-primary" />}
                      {material.type === "link" && <Link className="w-5 h-5 text-success" />}
                      <div>
                        <p className="font-medium">{material.title}</p>
                        {material.size && (
                          <p className="text-sm text-muted-foreground">{material.size}</p>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      {material.type === "link" ? "Abrir" : "Download"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Course Content */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Conteúdo do Curso</h3>
              <div className="space-y-4">
                {courseData.modules.map((module) => (
                  <div key={module.id} className="border rounded-lg">
                    <div 
                      className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => toggleModule(module.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{module.title}</h4>
                            {module.completed && (
                              <CheckCircle className="w-4 h-4 text-success" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <Progress value={getModuleProgress(module)} className="h-1" />
                            <p className="text-xs text-muted-foreground">
                              {module.lessons.filter(l => l.completed).length} de {module.lessons.length} aulas
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
                              lesson.current ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                            }`}
                          >
                            {lesson.completed ? (
                              <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm truncate ${lesson.current ? 'font-medium' : ''}`}>
                                {lesson.title}
                              </p>
                              <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                            </div>
                            {lesson.current && (
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