
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.consume_invite_on_confirm() FROM PUBLIC, anon, authenticated;
