
-- Remove invite-code marking from new-user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_invite TEXT;
  v_name TEXT;
  v_section TEXT;
BEGIN
  v_invite := NEW.raw_user_meta_data->>'invite_code';
  v_name := COALESCE(NEW.raw_user_meta_data->>'name', 'Student');
  v_section := COALESCE(NEW.raw_user_meta_data->>'section', 'A');

  INSERT INTO public.profiles (id, name, section, invite_code_used)
  VALUES (NEW.id, v_name, v_section, v_invite);

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student');

  RETURN NEW;
END $function$;

-- Ensure the trigger exists on auth.users INSERT
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- New: mark invite code as used only when the user confirms their email
CREATE OR REPLACE FUNCTION public.consume_invite_on_confirm()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_invite TEXT;
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    v_invite := NEW.raw_user_meta_data->>'invite_code';
    IF v_invite IS NOT NULL THEN
      UPDATE public.invite_codes
      SET used_by = NEW.id
      WHERE code = v_invite AND used_by IS NULL;
    END IF;
  END IF;
  RETURN NEW;
END $function$;

DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
AFTER UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.consume_invite_on_confirm();

-- Release any invite codes currently held by users who never confirmed their email
UPDATE public.invite_codes ic
SET used_by = NULL
WHERE used_by IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = ic.used_by AND u.email_confirmed_at IS NULL
  );
