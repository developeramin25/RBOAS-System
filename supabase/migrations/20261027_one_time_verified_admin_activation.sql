-- One-time administrator activation; no open/public signup or public email allowlist.
CREATE TABLE IF NOT EXISTS private.rboas_admin_bootstrap (
  email text PRIMARY KEY CHECK (email = lower(trim(email))),
  claimed_by uuid REFERENCES auth.users(id),
  claimed_at timestamptz
);
ALTER TABLE private.rboas_admin_bootstrap ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON private.rboas_admin_bootstrap FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE FUNCTION public.rboas_claim_bootstrap(p_email text,p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE outcome uuid;
BEGIN
  IF p_email IS NULL OR p_user_id IS NULL THEN RETURN false; END IF;
  UPDATE private.rboas_admin_bootstrap b
    SET claimed_by = p_user_id,
        claimed_at = COALESCE(b.claimed_at,now())
    WHERE b.email = lower(trim(p_email))
      AND (b.claimed_by IS NULL OR b.claimed_by = p_user_id)
    RETURNING b.claimed_by INTO outcome;
  RETURN outcome = p_user_id;
END;
$$;
REVOKE ALL ON FUNCTION public.rboas_claim_bootstrap(text,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.rboas_claim_bootstrap(text,uuid) TO service_role;
