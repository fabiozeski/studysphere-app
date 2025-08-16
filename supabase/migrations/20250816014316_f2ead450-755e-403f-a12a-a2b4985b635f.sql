-- Create storage buckets for course files
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('course-thumbnails', 'course-thumbnails', true),
  ('course-materials', 'course-materials', false);

-- Create RLS policies for course thumbnails (public)
CREATE POLICY "Anyone can view course thumbnails" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'course-thumbnails');

CREATE POLICY "Admins can upload course thumbnails" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'course-thumbnails' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update course thumbnails" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'course-thumbnails' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete course thumbnails" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'course-thumbnails' AND has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policies for course materials (private - only enrolled users)
CREATE POLICY "Enrolled users can view course materials" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'course-materials' AND (
    has_role(auth.uid(), 'admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM enrollments e
      JOIN modules m ON m.course_id = e.course_id
      JOIN lessons l ON l.module_id = m.id
      WHERE e.user_id = auth.uid() 
      AND (storage.foldername(name))[1] = l.id::text
    )
  )
);

CREATE POLICY "Admins can upload course materials" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'course-materials' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update course materials" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'course-materials' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete course materials" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'course-materials' AND has_role(auth.uid(), 'admin'::app_role));