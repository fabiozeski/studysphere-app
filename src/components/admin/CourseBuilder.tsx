import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useCourseModules, useModuleLessons, Course } from '@/hooks/useAdminCourses';
import { CreateModuleModal } from '@/components/admin/CreateModuleModal';
import { CreateLessonModal } from '@/components/admin/CreateLessonModal';
import { 
  BookOpen, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  PlayCircle, 
  FileText,
  Clock,
  Settings,
  Youtube,
  Upload,
  Edit
} from 'lucide-react';
import { EditModuleModal } from './EditModuleModal';
import { EditLessonModal } from './EditLessonModal';

interface CourseBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course;
}

export function CourseBuilder({ open, onOpenChange, course }: CourseBuilderProps) {
  const [createModuleOpen, setCreateModuleOpen] = useState(false);
  const [createLessonOpen, setCreateLessonOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [editModuleOpen, setEditModuleOpen] = useState(false);
  const [editLessonOpen, setEditLessonOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  const { data: modules = [] } = useCourseModules(course.id);

  const toggleModuleExpansion = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const openCreateLesson = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setCreateLessonOpen(true);
  };

  const openEditModule = (module: any) => {
    setSelectedModule(module);
    setEditModuleOpen(true);
  };

  const openEditLesson = (lesson: any) => {
    setSelectedLesson(lesson);
    setEditLessonOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Estrutura do Curso: {course.title}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="structure" className="space-y-4">
            <TabsList>
              <TabsTrigger value="structure">Estrutura</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="structure" className="space-y-4">
              {/* Course Summary */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {modules.length} módulos • {Math.round(course.duration_minutes / 60 * 10) / 10}h de duração
                      </p>
                    </div>
                    <Badge variant={course.is_published ? 'default' : 'secondary'}>
                      {course.is_published ? 'Publicado' : 'Rascunho'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Modules List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Módulos do Curso</h3>
                  <Button 
                    onClick={() => setCreateModuleOpen(true)}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Módulo
                  </Button>
                </div>

                {modules.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h4 className="font-semibold mb-2">Nenhum módulo criado</h4>
                      <p className="text-muted-foreground mb-4">
                        Comece criando o primeiro módulo do seu curso
                      </p>
                      <Button 
                        onClick={() => setCreateModuleOpen(true)}
                        className="bg-gradient-primary hover:opacity-90"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeiro Módulo
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {modules.map((module, index) => (
                      <ModuleCard 
                        key={module.id}
                        module={module}
                        index={index}
                        isExpanded={expandedModules.includes(module.id)}
                        onToggleExpansion={() => toggleModuleExpansion(module.id)}
                        onCreateLesson={() => openCreateLesson(module.id)}
                        onEditModule={() => openEditModule(module)}
                        onEditLesson={openEditLesson}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações do Curso</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Configurações avançadas do curso serão implementadas aqui.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      <CreateModuleModal 
        open={createModuleOpen}
        onOpenChange={setCreateModuleOpen}
        courseId={course.id}
        nextOrderIndex={modules.length}
      />
      
      <CreateLessonModal 
        open={createLessonOpen}
        onOpenChange={setCreateLessonOpen}
        moduleId={selectedModuleId}
        nextOrderIndex={0} // Will be calculated based on existing lessons
      />

      {selectedModule && (
        <EditModuleModal
          module={selectedModule}
          open={editModuleOpen}
          onOpenChange={setEditModuleOpen}
        />
      )}

      {selectedLesson && (
        <EditLessonModal
          lesson={selectedLesson}
          open={editLessonOpen}
          onOpenChange={setEditLessonOpen}
        />
      )}
    </>
  );
}

interface ModuleCardProps {
  module: any;
  index: number;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onCreateLesson: () => void;
  onEditModule: () => void;
  onEditLesson: (lesson: any) => void;
}

function ModuleCard({ module, index, isExpanded, onToggleExpansion, onCreateLesson, onEditModule, onEditLesson }: ModuleCardProps) {
  const { data: lessons = [] } = useModuleLessons(module.id);

  return (
    <Card>
      <Collapsible open={isExpanded} onOpenChange={onToggleExpansion}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
                <div>
                  <h4 className="font-semibold">
                    Módulo {index + 1}: {module.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {lessons.length} aulas
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditModule();
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateLesson();
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Aula
                </Button>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            {module.description && (
              <p className="text-sm text-muted-foreground mb-4">
                {module.description}
              </p>
            )}
            
            {lessons.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <PlayCircle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma aula criada neste módulo
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {lessons.map((lesson, lessonIndex) => (
                  <div 
                    key={lesson.id}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {lesson.video_type === 'youtube' ? (
                        <Youtube className="w-4 h-4 text-red-500" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">
                        {lessonIndex + 1}. {lesson.title}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-auto">
                      {lesson.duration_minutes > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {lesson.duration_minutes}min
                        </Badge>
                      )}
                      
                      {lesson.materials && lesson.materials.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <FileText className="w-3 h-3 mr-1" />
                          {lesson.materials.length} arquivo{lesson.materials.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditLesson(lesson)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}