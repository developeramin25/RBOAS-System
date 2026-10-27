ALTER TABLE private.rboas_preapproved_accounts ADD COLUMN IF NOT EXISTS invite_requested_at timestamptz;
CREATE OR REPLACE FUNCTION public.rboas_reserve_invite(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=''
AS $$
DECLARE v_email text;
BEGIN
 v_email=lower(trim(p_email));
 IF v_email IS NULL OR length(v_email)>254 THEN RETURN false; END IF;
 UPDATE private.rboas_preapproved_accounts a SET invite_requested_at=now()
 WHERE a.email=v_email
   AND a.claimed_by IS NULL
   AND (a.invite_requested_at IS NULL OR a.invite_requested_at < now()- interval '6 hours');
 RETURN FOUND;
END;$$;
REVOKE ALL ON FUNCTION public.rboas_reserve_invite(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.rboas_reserve_invite(text) TO service_role;