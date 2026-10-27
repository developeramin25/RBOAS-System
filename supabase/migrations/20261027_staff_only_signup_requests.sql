
-- Staff-only public registration requests. Trainees cannot self-register.
CREATE TABLE IF NOT EXISTS public.staff_access_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 auth_user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
 email text NOT NULL,
 display_name text NOT NULL CHECK(char_length(display_name) BETWEEN 2 AND 120),
 requested_role text NOT NULL CHECK(requested_role IN ('manager','hr')),
 store_code text,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
 created_at timestamptz NOT NULL DEFAULT now(),
 reviewed_at timestamptz,
 reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
 notes text
);
CREATE INDEX IF NOT EXISTS staff_requests_status_created_idx ON public.staff_access_requests(status,created_at DESC);
ALTER TABLE public.staff_access_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.staff_access_requests FROM anon,authenticated;
-- Capture signups in a private trigger; user-editable metadata is REQUEST DATA ONLY,
-- never used to issue administrator, manager, or HR permissions.
CREATE OR REPLACE FUNCTION private.capture_rboas_staff_signup()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE req_role text; req_name text; req_store text;
BEGIN
  IF NEW.raw_user_meta_data->>'rboas_request' IS DISTINCT FROM 'staff' THEN
    RETURN NEW;
  END IF;
  req_role := lower(coalesce(NEW.raw_user_meta_data->>'requested_role',''));
  req_name := trim(coalesce(NEW.raw_user_meta_data->>'display_name',''));
  req_store := nullif(trim(coalesce(NEW.raw_user_meta_data->>'store_code','')),'');
  IF req_role NOT IN ('manager','hr')
     OR char_length(req_name) NOT BETWEEN 2 AND 120
     OR (req_role='manager' AND (req_store IS NULL OR req_store NOT IN ('475','904','872','1030','1070','864','1101')))
  THEN
    RAISE EXCEPTION 'Invalid RBOAS staff access request';
  END IF;
  INSERT INTO public.staff_access_requests(auth_user_id,email,display_name,requested_role,store_code)
  VALUES(NEW.id,lower(NEW.email),req_name,req_role,req_store)
  ON CONFLICT(auth_user_id) DO NOTHING;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS rboas_staff_signup_created ON auth.users;
CREATE TRIGGER rboas_staff_signup_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION private.capture_rboas_staff_signup();
REVOKE ALL ON FUNCTION private.capture_rboas_staff_signup() FROM PUBLIC,anon,authenticated;
