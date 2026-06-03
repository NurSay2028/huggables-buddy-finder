-- Helper: is the user an owner/admin of the clinic (or a super admin)?
CREATE OR REPLACE FUNCTION public.is_clinic_manager(_user_id uuid, _clinic_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_super_admin(_user_id)
    OR public.has_role(_user_id, 'owner'::app_role, _clinic_id)
    OR public.has_role(_user_id, 'admin'::app_role, _clinic_id);
$$;

REVOKE EXECUTE ON FUNCTION public.is_clinic_manager(uuid, uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_clinic_manager(uuid, uuid) TO authenticated;

-- PAYMENTS: edit/delete -> owner/admin only
DROP POLICY IF EXISTS "payments tenant update" ON public.payments;
DROP POLICY IF EXISTS "payments tenant delete" ON public.payments;
CREATE POLICY "payments tenant update" ON public.payments
  FOR UPDATE TO authenticated
  USING (is_clinic_manager(auth.uid(), clinic_id))
  WITH CHECK (is_clinic_manager(auth.uid(), clinic_id));
CREATE POLICY "payments tenant delete" ON public.payments
  FOR DELETE TO authenticated
  USING (is_clinic_manager(auth.uid(), clinic_id));

-- EXPENSES: edit/delete -> owner/admin only
DROP POLICY IF EXISTS "Clinic members update expenses" ON public.expenses;
DROP POLICY IF EXISTS "Clinic members delete expenses" ON public.expenses;
CREATE POLICY "Clinic members update expenses" ON public.expenses
  FOR UPDATE TO authenticated
  USING (is_clinic_manager(auth.uid(), clinic_id))
  WITH CHECK (is_clinic_manager(auth.uid(), clinic_id));
CREATE POLICY "Clinic members delete expenses" ON public.expenses
  FOR DELETE TO authenticated
  USING (is_clinic_manager(auth.uid(), clinic_id));

-- DENTAL RECORDS: edit/delete -> owner/admin only
DROP POLICY IF EXISTS "dental_records tenant update" ON public.dental_records;
DROP POLICY IF EXISTS "dental_records tenant delete" ON public.dental_records;
CREATE POLICY "dental_records tenant update" ON public.dental_records
  FOR UPDATE TO authenticated
  USING (is_clinic_manager(auth.uid(), clinic_id))
  WITH CHECK (is_clinic_manager(auth.uid(), clinic_id));
CREATE POLICY "dental_records tenant delete" ON public.dental_records
  FOR DELETE TO authenticated
  USING (is_clinic_manager(auth.uid(), clinic_id));

-- SCHEDULED REMINDERS: edit/delete -> owner/admin only
DROP POLICY IF EXISTS "Clinic members update scheduled" ON public.scheduled_reminders;
DROP POLICY IF EXISTS "Clinic members delete scheduled" ON public.scheduled_reminders;
CREATE POLICY "Clinic members update scheduled" ON public.scheduled_reminders
  FOR UPDATE TO authenticated
  USING (is_clinic_manager(auth.uid(), clinic_id))
  WITH CHECK (is_clinic_manager(auth.uid(), clinic_id));
CREATE POLICY "Clinic members delete scheduled" ON public.scheduled_reminders
  FOR DELETE TO authenticated
  USING (is_clinic_manager(auth.uid(), clinic_id));