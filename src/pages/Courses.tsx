import { useState } from "react";
import { Search, Filter, Clock, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCourses } from "@/hooks/useCourses";

export default function Courses() {
  const { courses, categories, loading, selectedCategory, setSelectedCategory } = useCourses();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Carregando cursos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Cursos Disponíveis</h1>
        <p className="text-muted-foreground">
          Explore nossa biblioteca de cursos e continue aprendendo
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar cursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => setSelectedCategory("all")}
            className="whitespace-nowrap"
          >
            Todos
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.slug ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.slug)}
              className="whitespace-nowrap"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">Nenhum curso encontrado</div>
          <p className="text-sm text-muted-foreground">
            Tente ajustar os filtros ou termos de busca
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Link key={course.id} to={`/course/${course.id}`}>
              <Card className="group hover:shadow-lg transition-all duration-300 hover:shadow-primary/10 border-border/50 hover:border-primary/20">
                <CardHeader className="p-0">
                  <div className="aspect-video bg-gradient-primary rounded-t-lg overflow-hidden">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                        <div className="text-white text-4xl font-bold">
                          {course.title.charAt(0)}
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="p-4">
                  <div className="mb-2">
                    {course.category && (
                      <Badge variant="secondary" className="mb-2">
                        {course.category.name}
                      </Badge>
                    )}
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                  </div>
                  
                  {course.description && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{course.instructor_name || 'Instrutor'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration_hours}h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}