-- Fix user_roles INSERT policy to allow initial role assignment
DROP POLICY IF EXISTS "Users can insert their first role" ON public.user_roles;
CREATE POLICY "Users can insert their first role" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid()
  )
);

-- Fix emergencies INSERT policy to work without roles
DROP POLICY IF EXISTS "Users can insert emergencies for their institution" ON public.emergencies;
CREATE POLICY "Users can insert emergencies for their institution" 
ON public.emergencies 
FOR INSERT 
WITH CHECK (
  institution_id = get_user_institution(auth.uid())
);

-- Fix emergencies UPDATE policy
DROP POLICY IF EXISTS "Users can update emergencies for their institution" ON public.emergencies;
CREATE POLICY "Users can update emergencies for their institution" 
ON public.emergencies 
FOR UPDATE 
USING (
  institution_id = get_user_institution(auth.uid())
);

-- Fix emergencies DELETE policy
DROP POLICY IF EXISTS "Users can delete emergencies for their institution" ON public.emergencies;
CREATE POLICY "Users can delete emergencies for their institution" 
ON public.emergencies 
FOR DELETE 
USING (
  institution_id = get_user_institution(auth.uid())
);

-- Fix infrastructure INSERT policy to work without roles
DROP POLICY IF EXISTS "Users can insert infrastructure for their institution" ON public.infrastructure;
CREATE POLICY "Users can insert infrastructure for their institution" 
ON public.infrastructure 
FOR INSERT 
WITH CHECK (
  institution_id = get_user_institution(auth.uid())
);

-- Fix infrastructure UPDATE policy
DROP POLICY IF EXISTS "Users can update infrastructure for their institution" ON public.infrastructure;
CREATE POLICY "Users can update infrastructure for their institution" 
ON public.infrastructure 
FOR UPDATE 
USING (
  institution_id = get_user_institution(auth.uid())
);

-- Fix infrastructure DELETE policy
DROP POLICY IF EXISTS "Users can delete infrastructure for their institution" ON public.infrastructure;
CREATE POLICY "Users can delete infrastructure for their institution" 
ON public.infrastructure 
FOR DELETE 
USING (
  institution_id = get_user_institution(auth.uid())
);