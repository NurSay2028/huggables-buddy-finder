-- Lock down RLS-helper SECURITY DEFINER functions: revoke from public/anon, grant to authenticated only
REVOKE EXECUTE ON FUNCTION public.can_manage_landing(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.can_manage_landing(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.belongs_to_clinic(uuid, uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.belongs_to_clinic(uuid, uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.user_clinic_id(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.user_clinic_id(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_clinic_member(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_clinic_member(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role, uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role, uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_clinic_manager(uuid, uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_clinic_manager(uuid, uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.shares_clinic(uuid, uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.shares_clinic(uuid, uuid) TO authenticated;

-- clinic_exists is used by the anonymous appointment-request INSERT policy: keep it callable by anon
REVOKE EXECUTE ON FUNCTION public.clinic_exists(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.clinic_exists(uuid) TO anon, authenticated;

-- Trigger functions are executed automatically by the DB and never need direct API execute access
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.assign_request_clinic() FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.gen_patient_telegram_code() FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.assign_patient_telegram_code() FROM public, anon;