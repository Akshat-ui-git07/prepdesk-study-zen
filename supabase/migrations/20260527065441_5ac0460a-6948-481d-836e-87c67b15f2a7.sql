
DROP POLICY IF EXISTS "Anyone can check invite code" ON public.invite_codes;

REVOKE SELECT ON public.invite_codes FROM anon;

CREATE OR REPLACE FUNCTION public.validate_invite_code(_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.invite_codes
    WHERE code = _code AND used_by IS NULL
  );
$$;

GRANT EXECUTE ON FUNCTION public.validate_invite_code(text) TO anon, authenticated;
