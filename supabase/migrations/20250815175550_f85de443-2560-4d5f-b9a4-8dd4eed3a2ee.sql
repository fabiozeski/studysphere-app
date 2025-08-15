-- Insert sample data
INSERT INTO public.categories (name, slug, description) VALUES
  ('Programação', 'programacao', 'Cursos de desenvolvimento de software'),
  ('Design', 'design', 'Cursos de design gráfico e UI/UX'),
  ('Marketing', 'marketing', 'Cursos de marketing digital'),
  ('Negócios', 'negocios', 'Cursos de gestão e empreendedorismo');

INSERT INTO public.courses (title, description, thumbnail_url, instructor_name, duration_hours, category_id, is_published) VALUES
  ('React Completo', 'Aprenda React do básico ao avançado', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400', 'João Silva', 40, (SELECT id FROM public.categories WHERE slug = 'programacao'), true),
  ('UI/UX Design', 'Design de interfaces modernas', 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400', 'Maria Santos', 30, (SELECT id FROM public.categories WHERE slug = 'design'), true),
  ('Marketing Digital', 'Estratégias de marketing online', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400', 'Pedro Costa', 25, (SELECT id FROM public.categories WHERE slug = 'marketing'), true);

-- Insert modules for React course
INSERT INTO public.modules (course_id, title, description, order_index) VALUES
  ((SELECT id FROM public.courses WHERE title = 'React Completo'), 'Introdução ao React', 'Conceitos básicos e configuração', 1),
  ((SELECT id FROM public.courses WHERE title = 'React Completo'), 'Componentes e Props', 'Criando e utilizando componentes', 2),
  ((SELECT id FROM public.courses WHERE title = 'React Completo'), 'Estado e Hooks', 'Gerenciamento de estado', 3);

-- Insert lessons for React modules
INSERT INTO public.lessons (module_id, title, description, video_url, video_type, duration_minutes, order_index, materials) VALUES
  ((SELECT id FROM public.modules WHERE title = 'Introdução ao React' LIMIT 1), 'O que é React?', 'Introdução ao React e sua filosofia', 'dQw4w9WgXcQ', 'youtube', 15, 1, '[{"name": "Slides da Aula", "url": "#"}, {"name": "Código Exemplo", "url": "#"}]'),
  ((SELECT id FROM public.modules WHERE title = 'Introdução ao React' LIMIT 1), 'Configurando o Ambiente', 'Instalação e configuração', 'dQw4w9WgXcQ', 'youtube', 20, 2, '[{"name": "Guia de Instalação", "url": "#"}]'),
  ((SELECT id FROM public.modules WHERE title = 'Componentes e Props' LIMIT 1), 'Primeiro Componente', 'Criando seu primeiro componente', 'dQw4w9WgXcQ', 'youtube', 25, 1, '[{"name": "Exemplo Prático", "url": "#"}]');

-- Fix security function search path issues
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;