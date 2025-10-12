-- Create books table for school library management
CREATE TABLE IF NOT EXISTS public.books (
  id BIGSERIAL PRIMARY KEY,
  institution_id BIGINT REFERENCES public.institutions(id),
  title VARCHAR NOT NULL,
  author VARCHAR,
  isbn VARCHAR,
  category VARCHAR,
  level VARCHAR,
  subject VARCHAR,
  publisher VARCHAR,
  year_published INTEGER,
  quantity INTEGER DEFAULT 0,
  unit_price VARCHAR,
  condition VARCHAR DEFAULT 'new',
  created_at TIMESTAMP DEFAULT now()
);

-- Enable RLS on books table
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- RLS policies for books
CREATE POLICY "Institution users can view their books"
ON public.books FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  institution_id = get_user_institution(auth.uid())
);

CREATE POLICY "Institution users can manage their books"
ON public.books FOR ALL
USING (institution_id = get_user_institution(auth.uid()));

-- Add deceased tracking to learners table
ALTER TABLE public.learners ADD COLUMN IF NOT EXISTS deceased BOOLEAN DEFAULT false;
ALTER TABLE public.learners ADD COLUMN IF NOT EXISTS date_of_death DATE;
ALTER TABLE public.learners ADD COLUMN IF NOT EXISTS cause_of_death VARCHAR;
ALTER TABLE public.learners ADD COLUMN IF NOT EXISTS death_details TEXT;

-- Add deceased tracking to students table
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS deceased BOOLEAN DEFAULT false;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS date_of_death DATE;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS cause_of_death VARCHAR;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS death_details TEXT;