-- Create profiles table for user data
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  institution_id bigint REFERENCES public.institutions(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'institution_admin', 'teacher', 'data_clerk');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to get user's institution
CREATE OR REPLACE FUNCTION public.get_user_institution(_user_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT institution_id FROM public.profiles WHERE id = _user_id
$$;

-- Trigger function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email)
  );
  RETURN new;
END;
$$;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Super admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for institutions
CREATE POLICY "Institution admins can view their institution"
  ON public.institutions FOR SELECT
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    id = public.get_user_institution(auth.uid())
  );

CREATE POLICY "Super admins can manage all institutions"
  ON public.institutions FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for learners
CREATE POLICY "Institution users can view their learners"
  ON public.learners FOR SELECT
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    institution_id = public.get_user_institution(auth.uid())
  );

CREATE POLICY "Institution users can insert learners"
  ON public.learners FOR INSERT
  WITH CHECK (institution_id = public.get_user_institution(auth.uid()));

CREATE POLICY "Institution users can update their learners"
  ON public.learners FOR UPDATE
  USING (institution_id = public.get_user_institution(auth.uid()));

-- RLS Policies for students
CREATE POLICY "Institution users can view their students"
  ON public.students FOR SELECT
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    institution_id = public.get_user_institution(auth.uid())
  );

CREATE POLICY "Institution users can insert students"
  ON public.students FOR INSERT
  WITH CHECK (institution_id = public.get_user_institution(auth.uid()));

CREATE POLICY "Institution users can update their students"
  ON public.students FOR UPDATE
  USING (institution_id = public.get_user_institution(auth.uid()));

-- RLS Policies for teachers
CREATE POLICY "Institution users can view their teachers"
  ON public.teachers FOR SELECT
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    institution_id = public.get_user_institution(auth.uid())
  );

CREATE POLICY "Institution users can manage their teachers"
  ON public.teachers FOR ALL
  USING (institution_id = public.get_user_institution(auth.uid()));

-- RLS Policies for bank_accounts
CREATE POLICY "Institution users can view their bank accounts"
  ON public.bank_accounts FOR SELECT
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    institution_id = public.get_user_institution(auth.uid())
  );

CREATE POLICY "Institution admins can manage their bank accounts"
  ON public.bank_accounts FOR ALL
  USING (
    public.has_role(auth.uid(), 'institution_admin') OR
    public.has_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (institution_id = public.get_user_institution(auth.uid()));

-- RLS Policies for capitation_receipts
CREATE POLICY "Institution users can view their receipts"
  ON public.capitation_receipts FOR SELECT
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    institution_id = public.get_user_institution(auth.uid())
  );

CREATE POLICY "Institution users can insert receipts"
  ON public.capitation_receipts FOR INSERT
  WITH CHECK (institution_id = public.get_user_institution(auth.uid()));

-- RLS Policies for infrastructure
CREATE POLICY "Institution users can view their infrastructure"
  ON public.infrastructure FOR SELECT
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    institution_id = public.get_user_institution(auth.uid())
  );

CREATE POLICY "Institution users can manage their infrastructure"
  ON public.infrastructure FOR ALL
  USING (institution_id = public.get_user_institution(auth.uid()));

-- RLS Policies for emergencies
CREATE POLICY "Institution users can view their emergencies"
  ON public.emergencies FOR SELECT
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    institution_id = public.get_user_institution(auth.uid())
  );

CREATE POLICY "Institution users can manage their emergencies"
  ON public.emergencies FOR ALL
  USING (institution_id = public.get_user_institution(auth.uid()));

-- Create storage bucket for learner photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('learner-photos', 'learner-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for learner photos
CREATE POLICY "Institution users can view learner photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'learner-photos');

CREATE POLICY "Institution users can upload learner photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'learner-photos' AND auth.role() = 'authenticated');

-- Create storage bucket for receipts
INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for receipts
CREATE POLICY "Institution users can view their receipts"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'receipts' AND auth.role() = 'authenticated');

CREATE POLICY "Institution users can upload receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'receipts' AND auth.role() = 'authenticated');