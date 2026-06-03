GRANT EXECUTE ON FUNCTION public.belongs_to_clinic(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_manage_landing(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.user_clinic_id(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_clinic_member(uuid) TO authenticated, service_role;