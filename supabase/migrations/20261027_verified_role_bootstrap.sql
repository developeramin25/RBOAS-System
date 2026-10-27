-- Preauthorized roles are stored privately and may be claimed only after verified email ownership.
CREATE TABLE IF NOT EXISTS private.rboas_preapproved_accounts (
 email text PRIMARY KEY CHECK(email = lower(trim(email))),
 assigned_role text NOT NULL CHECK(assigned_role IN ('admin','manager')),
 claimed_by uuid REFERENCES auth.users(id),
 claimed_at timestamptz
);
ALTER TABLE private.rboas_preapproved_accounts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON private.rboas_preapproved_accounts FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.rboas_claim_preapproved(p_email text,p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE v_role text;
BEGIN
 IF p_email IS NULL OR p_user_id IS NULL THEN RETURN NULL; END IF;
 UPDATE private.rboas_preapproved_accounts r
 SET claimed_by=p_user_id,claimed_at=COALESCE(r.claimed_at,now())
 WHERE r.email=lower(trim(p_email))
 AND (r.claimed_by IS NULL OR r.claimed_by=p_user_id)
 RETURNING r.assigned_role INTO v_role;
 RETURN v_role;
END; $$;
REVOKE ALL ON FUNCTION public.rboas_claim_preapproved(text,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.rboas_claim_preapproved(text,uuid) TO service_role;