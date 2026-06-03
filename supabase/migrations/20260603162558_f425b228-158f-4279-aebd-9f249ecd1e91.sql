-- 1) Clinic-scoped role check to prevent cross-clinic owner privilege escalation
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role, _clinic_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND clinic_id = _clinic_id
  );
$$;

DROP POLICY IF EXISTS "clinics owner update settings" ON public.clinics;
CREATE POLICY "clinics owner update settings"
ON public.clinics
FOR UPDATE
TO authenticated
USING (public.belongs_to_clinic(auth.uid(), id) AND public.has_role(auth.uid(), 'owner'::app_role, id))
WITH CHECK (public.belongs_to_clinic(auth.uid(), id) AND public.has_role(auth.uid(), 'owner'::app_role, id));

-- 2) Explicit, configurable flag for landing-page management (replaces insertion-order logic)
ALTER TABLE public.clinics
  ADD COLUMN IF NOT EXISTS manages_landing boolean NOT NULL DEFAULT false;

-- Preserve current behavior: the currently-designated (oldest) clinic keeps access
UPDATE public.clinics
SET manages_landing = true
WHERE id = (SELECT id FROM public.clinics ORDER BY created_at LIMIT 1);

CREATE OR REPLACE FUNCTION public.can_manage_landing(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_super_admin(_user_id)
    OR EXISTS (
      SELECT 1
      FROM public.user_roles ur
      JOIN public.clinics c ON c.id = ur.clinic_id
      WHERE ur.user_id = _user_id
        AND ur.role IN ('owner'::app_role, 'admin'::app_role)
        AND c.manages_landing = true
    );
$$;