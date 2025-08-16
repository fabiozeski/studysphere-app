import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAdminCourses, useDeleteCourse, useUpdateCourse, Course } from '@/hooks/useAdminCourses';
import { useCategories } from '@/hooks/useCategories';
import { BookOpen, Search, Plus, Trash2, Edit, Settings, Eye, Users, Clock, FolderOpen } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CreateCourseModal } from '@/components/admin/CreateCourseModal';
import { EditCourseModal } from '@/components/admin/EditCourseModal';
import { CourseBuilder } from '@/components/admin/CourseBuilder';

export default function CourseManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  const { data: courses = [], isLoading } = useAdminCourses();
  const { data: categories = [] } = useCategories();
  const deleteCourse = useDeleteCourse();
  const updateCourse = useUpdateCourse();

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || course.category_id === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'published' && course.is_published) ||
      (statusFilter === 'draft' && !course.is_published);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDeleteCourse = (courseId: string) => {
    deleteCourse.mutate(courseId);
  };

  const handleTogglePublish = (course: Course) => {
    updateCourse.mutate({
      id: course.id,
      is_published: !course.is_published,
    });
  };

  const openCourseBuilder = (course: Course) => {
    setSelectedCourse(course);
    setBuilderOpen(true);
  };

  const openEditCourse = (course: Course) => {
    setEditingCourse(course);
    setEditModalOpen(true);
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Cursos</h1>
          <p className="text-muted-foreground mt-1">
            Crie e gerencie cursos, módulos e aulas da plataforma
          </p>
        </div>
        <Button 
          className="bg-gradient-primary hover:opacity-90"
          onClick={() => setCreateModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Curso
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total de Cursos</p>
                <p className="text-3xl font-bold mt-2">{courses.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted text-primary">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Publicados</p>
                <p className="text-3xl font-bold mt-2">
                  {courses.filter(c => c.is_published).length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted text-success">
                <Eye className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Rascunhos</p>
                <p className="text-3xl font-bold mt-2">
                  {courses.filter(c => !c.is_published).length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted text-warning">
                <Edit className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Duração Total</p>
                <p className="text-3xl font-bold mt-2">
                  {courses.reduce((acc, course) => acc + course.duration_hours, 0)}h
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted text-info">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Lista de Cursos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por título, descrição ou instrutor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(value: 'all' | 'published' | 'draft') => setStatusFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="published">Publicados</SelectItem>
                <SelectItem value="draft">Rascunhos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Instrutor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <BookOpen className="w-8 h-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm ? 'Nenhum curso encontrado' : 'Nenhum curso cadastrado'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={course.thumbnail_url || undefined} />
                            <AvatarFallback>
                              <BookOpen className="w-6 h-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{course.title}</div>
                            <div className="text-sm text-muted-foreground max-w-xs truncate">
                              {course.description || 'Sem descrição'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {course.category ? (
                          <Badge variant="outline">{course.category.name}</Badge>
                        ) : (
                          <span className="text-muted-foreground italic">Sem categoria</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {course.instructor_name || (
                          <span className="text-muted-foreground italic">Não informado</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={course.is_published ? 'default' : 'secondary'}>
                          {course.is_published ? 'Publicado' : 'Rascunho'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {course.duration_hours}h
                      </TableCell>
                      <TableCell>
                        {format(new Date(course.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                       <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditCourse(course)}
                            className="text-primary"
                            title="Editar curso"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openCourseBuilder(course)}
                            className="text-primary"
                            title="Editar estrutura do curso"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleTogglePublish(course)}
                            className={course.is_published ? "text-warning" : "text-success"}
                            title={course.is_published ? "Despublicar" : "Publicar"}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon" className="text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Curso</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o curso "{course.title}"? 
                                  Esta ação não pode ser desfeita e todos os módulos e aulas serão perdidos.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCourse(course.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateCourseModal 
        open={createModalOpen} 
        onOpenChange={setCreateModalOpen} 
      />

      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
        />
      )}
      
      {selectedCourse && (
        <CourseBuilder 
          open={builderOpen} 
          onOpenChange={setBuilderOpen} 
          course={selectedCourse}
        />
      )}
    </div>
  );
}