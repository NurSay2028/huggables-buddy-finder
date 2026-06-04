-- Revoke EXECUTE from anon and public on SECURITY DEFINER helper functions
-- that should never be callable by unauthenticated users directly.
-- These are only used inside RLS policies for authenticated users or as triggers.

REVOKE EXECUTE ON FUNCTION public.can_manage_landing(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.belongs_to_clinic(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.user_clinic_id(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.assign_request_clinic() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_clinic_member(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_clinic_manager(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.shares_clinic(uuid, uuid) FROM anon, public;

-- Ensure authenticated users retain EXECUTE where needed for RLS evaluation.
GRANT EXECUTE ON FUNCTION public.can_manage_landing(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.belongs_to_clinic(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_clinic_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_clinic_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_clinic_manager(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.shares_clinic(uuid, uuid) TO authenticated;

-- clinic_exists is required by the anonymous appointment-request INSERT policy,
-- so keep it executable by anon and authenticated.
GRANT EXECUTE ON FUNCTION public.clinic_exists(uuid) TO anon, authenticated;