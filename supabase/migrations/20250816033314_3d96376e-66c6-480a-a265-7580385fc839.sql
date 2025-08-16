-- Add course type field to courses table
ALTER TABLE public.courses 
ADD COLUMN course_type text NOT NULL DEFAULT 'free';

-- Add check constraint for course type
ALTER TABLE public.courses 
ADD CONSTRAINT courses_type_check CHECK (course_type IN ('free', 'private'));

-- Create access requests table
CREATE TABLE public.access_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  message text,
  admin_response text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Add check constraint for request status
ALTER TABLE public.access_requests 
ADD CONSTRAINT access_requests_status_check CHECK (status IN ('pending', 'approved', 'rejected'));

-- Enable RLS on access_requests
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for access_requests
CREATE POLICY "Users can view their own requests" 
ON public.access_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests" 
ON public.access_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all requests" 
ON public.access_requests 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_access_requests_updated_at
BEFORE UPDATE ON public.access_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();