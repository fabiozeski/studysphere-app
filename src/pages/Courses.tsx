import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  Filter, 
  Clock, 
  Users, 
  Star,
  Play,
  BookOpen
} from "lucide-react";

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "Todos os Cursos" },
    { id: "desenvolvimento", name: "Desenvolvimento" },
    { id: "design", name: "Design" },
    { id: "marketing", name: "Marketing" },
    { id: "business", name: "Negócios" }
  ];

  const courses = [
    {
      id: 1,
      title: "React do Zero ao Avançado",
      instructor: "João Silva",
      description: "Aprenda React desde o básico até conceitos avançados com projetos práticos.",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop",
      category: "desenvolvimento",
      duration: "40h",
      students: 1234,
      rating: 4.8,
      progress: 75,
      enrolled: true,
      level: "Intermediário"
    },
    {
      id: 2,
      title: "Design System Completo",
      instructor: "Maria Santos",
      description: "Crie design systems escaláveis e consistentes para seus projetos.",
      thumbnail: "https://images.unsplash.com/photo-1545670723-196ed0954986?w=400&h=250&fit=crop",
      category: "design",
      duration: "25h",
      students: 856,
      rating: 4.9,
      progress: 45,
      enrolled: true,
      level: "Avançado"
    },
    {
      id: 3,
      title: "TypeScript Fundamentals",
      instructor: "Pedro Costa",
      description: "Domine TypeScript e melhore a qualidade do seu código JavaScript.",
      thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop",
      category: "desenvolvimento",
      duration: "30h",
      students: 2100,
      rating: 4.7,
      progress: 30,
      enrolled: true,
      level: "Intermediário"
    },
    {
      id: 4,
      title: "Marketing Digital Estratégico",
      instructor: "Ana Lima",
      description: "Estratégias completas de marketing digital para impulsionar seu negócio.",
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
      category: "marketing",
      duration: "35h",
      students: 1567,
      rating: 4.6,
      progress: 0,
      enrolled: false,
      level: "Iniciante"
    }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Meus Cursos</h1>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Buscar cursos..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img 
                src={course.thumbnail} 
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              {course.enrolled && (
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="bg-success text-success-foreground">
                    Inscrito
                  </Badge>
                </div>
              )}
              <div className="absolute top-3 left-3">
                <Badge variant="outline" className="bg-white/90">
                  {course.level}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                  <p className="text-muted-foreground text-sm">por {course.instructor}</p>
                </div>
                
                <p className="text-sm line-clamp-2">{course.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.students.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-warning text-warning" />
                    {course.rating}
                  </div>
                </div>

                {course.enrolled && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                )}
                
                <div className="flex gap-2">
                  {course.enrolled ? (
                    <Button className="flex-1">
                      <Play className="w-4 h-4 mr-2" />
                      Continuar
                    </Button>
                  ) : (
                    <Button className="flex-1">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Inscrever-se
                    </Button>
                  )}
                  <Button variant="outline" size="icon">
                    <BookOpen className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nenhum curso encontrado</h3>
          <p className="text-muted-foreground">
            Tente ajustar os filtros ou termos de busca.
          </p>
        </div>
      )}
    </div>
  );
};

export default Courses;