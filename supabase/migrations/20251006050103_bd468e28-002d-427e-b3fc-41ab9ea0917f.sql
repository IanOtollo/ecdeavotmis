-- Fix schema permissions and RLS policies
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Ensure profiles table has proper RLS that doesn't create circular dependencies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Allow all authenticated users to view institutions (for selection dropdowns)
DROP POLICY IF EXISTS "Institution admins can view their institution" ON public.institutions;
CREATE POLICY "Authenticated users can view all institutions" 
ON public.institutions 
FOR SELECT 
TO authenticated
USING (true);

-- Insert real schools from Busia County (only if they don't already exist by name)
INSERT INTO public.institutions (name, type, level, county, subcounty, registration_no, category) 
SELECT * FROM (VALUES
  ('Nangina ECDE Center', 'Public', 'ECDE', 'Busia', 'Teso North', 'ECDE-001-BUS', 'ECDE'),
  ('Malaba Vocational Training Center', 'Public', 'Vocational', 'Busia', 'Teso South', 'VTC-002-BUS', 'Vocational'),
  ('Bumala ECDE School', 'Public', 'ECDE', 'Busia', 'Bumala', 'ECDE-003-BUS', 'ECDE'),
  ('Funyula Vocational Institute', 'Public', 'Vocational', 'Busia', 'Funyula', 'VTC-004-BUS', 'Vocational'),
  ('Matayos ECDE Center', 'Public', 'ECDE', 'Busia', 'Matayos', 'ECDE-005-BUS', 'ECDE'),
  ('Busia Town Vocational Training', 'Public', 'Vocational', 'Busia', 'Busia Township', 'VTC-006-BUS', 'Vocational'),
  ('Angurai ECDE School', 'Public', 'ECDE', 'Busia', 'Teso North', 'ECDE-007-BUS', 'ECDE'),
  ('Port Victoria Skills Center', 'Public', 'Vocational', 'Busia', 'Samia', 'VTC-008-BUS', 'Vocational'),
  ('Bukhayo ECDE Center', 'Public', 'ECDE', 'Busia', 'Nambale', 'ECDE-009-BUS', 'ECDE'),
  ('Nambale Vocational Institute', 'Public', 'Vocational', 'Busia', 'Nambale', 'VTC-010-BUS', 'Vocational')
) AS v(name, type, level, county, subcounty, registration_no, category)
WHERE NOT EXISTS (
  SELECT 1 FROM public.institutions WHERE institutions.name = v.name
);