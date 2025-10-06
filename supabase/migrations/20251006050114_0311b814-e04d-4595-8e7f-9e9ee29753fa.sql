-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own data" 
ON public.users 
FOR SELECT 
TO authenticated
USING (id::text = auth.uid()::text);

CREATE POLICY "Super admins can manage all users" 
ON public.users 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));