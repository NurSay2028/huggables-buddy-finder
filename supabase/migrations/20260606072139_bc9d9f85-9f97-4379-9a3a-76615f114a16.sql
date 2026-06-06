-- Revoke execute from PUBLIC/anon on internal SECURITY DEFINER helpers,
-- re-grant only to authenticated + service_role. clinic_exists is intentionally
-- left callable by anon (used by the public appointment-request insert policy).

REVOKE EXECUTE ON FUNCTION public.can_manage_landing(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_manage_landing(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.belongs_to_clinic(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.belongs_to_clinic(uuid, uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.user_clinic_id(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.user_clinic_id(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.gen_patient_telegram_code() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.gen_patient_telegram_code() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_clinic_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_clinic_member(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role, uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_clinic_manager(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_clinic_manager(uuid, uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.shares_clinic(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.shares_clinic(uuid, uuid) TO authenticated, service_role;

-- Trigger functions: not meant to be called directly via the API at all.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.touch_updated_at() TO service_role;

REVOKE EXECUTE ON FUNCTION public.assign_request_clinic() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.assign_request_clinic() TO service_role;

REVOKE EXECUTE ON FUNCTION public.assign_patient_telegram_code() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.assign_patient_telegram_code() TO service_role;
