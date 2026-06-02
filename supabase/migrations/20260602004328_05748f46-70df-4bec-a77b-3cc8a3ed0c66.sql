REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.belongs_to_clinic(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;