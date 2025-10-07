-- Fix RLS policies to allow users to create institutions and manage their data

-- Allow authenticated users to create institutions (for initial setup)
DROP POLICY IF EXISTS "Authenticated users can create institutions" ON public.institutions;
CREATE POLICY "Authenticated users can create institutions"
ON public.institutions
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to update their own institution
DROP POLICY IF EXISTS "Users can update their own institution" ON public.institutions;
CREATE POLICY "Users can update their own institution"
ON public.institutions
FOR UPDATE
TO authenticated
USING (id = get_user_institution(auth.uid()));

-- Ensure bank_accounts has proper insert policy
DROP POLICY IF EXISTS "Users can insert bank accounts for their institution" ON public.bank_accounts;
CREATE POLICY "Users can insert bank accounts for their institution"
ON public.bank_accounts
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) 
  OR institution_id = get_user_institution(auth.uid())
);