-- Allow clinic managers (owner/admin/super_admin) to view all roles in their clinic
CREATE POLICY "roles clinic managers select"
ON public.user_roles
FOR SELECT
TO authenticated
USING (clinic_id IS NOT NULL AND is_clinic_manager(auth.uid(), clinic_id));

-- Allow clinic managers to remove staff roles in their clinic
CREATE POLICY "roles clinic managers delete"
ON public.user_roles
FOR DELETE
TO authenticated
USING (clinic_id IS NOT NULL AND is_clinic_manager(auth.uid(), clinic_id));

-- Helper: do two users share a clinic?
CREATE OR REPLACE FUNCTION public.shares_clinic(_viewer uuid, _target uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles a
    JOIN public.user_roles b ON a.clinic_id = b.clinic_id
    WHERE a.user_id = _viewer
      AND b.user_id = _target
      AND a.clinic_id IS NOT NULL
  );
$$;

-- Allow clinic members to view profiles of co-workers in the same clinic
CREATE POLICY "profiles clinic members select"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid() OR is_super_admin(auth.uid()) OR shares_clinic(auth.uid(), id));