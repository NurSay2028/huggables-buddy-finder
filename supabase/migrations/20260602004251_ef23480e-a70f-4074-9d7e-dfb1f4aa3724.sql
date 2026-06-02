GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.belongs_to_clinic(uuid, uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated, service_role;