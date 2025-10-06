-- Fix RLS policies for emergencies and infrastructure tables to allow proper inserts

-- Drop and recreate emergencies policies
DROP POLICY IF EXISTS "Institution users can manage their emergencies" ON public.emergencies;

CREATE POLICY "Users can insert emergencies for their institution"
ON public.emergencies
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) 
  OR institution_id = get_user_institution(auth.uid())
);

CREATE POLICY "Users can update emergencies for their institution"
ON public.emergencies
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) 
  OR institution_id = get_user_institution(auth.uid())
);

CREATE POLICY "Users can delete emergencies for their institution"
ON public.emergencies
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) 
  OR institution_id = get_user_institution(auth.uid())
);

-- Drop and recreate infrastructure policies
DROP POLICY IF EXISTS "Institution users can manage their infrastructure" ON public.infrastructure;

CREATE POLICY "Users can insert infrastructure for their institution"
ON public.infrastructure
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) 
  OR institution_id = get_user_institution(auth.uid())
);

CREATE POLICY "Users can update infrastructure for their institution"
ON public.infrastructure
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) 
  OR institution_id = get_user_institution(auth.uid())
);

CREATE POLICY "Users can delete infrastructure for their institution"
ON public.infrastructure
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) 
  OR institution_id = get_user_institution(auth.uid())
);