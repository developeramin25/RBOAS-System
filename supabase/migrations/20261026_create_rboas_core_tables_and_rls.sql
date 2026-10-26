
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

CREATE TABLE public.user_profiles (
 id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 display_name text NOT NULL, email text NOT NULL, employee_code text,
 store_code text, manager_id uuid REFERENCES public.user_profiles(id),
 active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.user_profiles(manager_id);

CREATE TABLE public.assessments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL,
 description text, duration_minutes integer NOT NULL DEFAULT 30 CHECK (duration_minutes BETWEEN 5 AND 180),
 passing_percent integer NOT NULL DEFAULT 80 CHECK (passing_percent BETWEEN 1 AND 100),
 question_count integer NOT NULL DEFAULT 25 CHECK (question_count BETWEEN 1 AND 100),
 allowed_attempts integer NOT NULL DEFAULT 1 CHECK (allowed_attempts BETWEEN 1 AND 10),
 published boolean NOT NULL DEFAULT false,
 created_by uuid REFERENCES public.user_profiles(id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.question_bank (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), category text NOT NULL
 CHECK (category IN ('ERX Processing','Refill Processing','Insurance & Rejections','LTC Billing','Coupons & Follow-Up')),
 prompt text NOT NULL, options text[] NOT NULL CHECK (cardinality(options)=4),
 difficulty text NOT NULL DEFAULT 'basic' CHECK (difficulty IN ('basic','intermediate','advanced')),
 active boolean NOT NULL DEFAULT true,
 created_by uuid REFERENCES public.user_profiles(id), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.question_bank(category,active);

CREATE TABLE private.answer_keys (
 question_id uuid PRIMARY KEY REFERENCES public.question_bank(id) ON DELETE CASCADE,
 correct_option_index smallint NOT NULL CHECK (correct_option_index BETWEEN 0 AND 3),
 explanation text
);

CREATE TABLE public.assessment_assignments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 assessment_id uuid NOT NULL REFERENCES public.assessments(id),
 trainee_id uuid NOT NULL REFERENCES public.user_profiles(id),
 assigned_by uuid REFERENCES public.user_profiles(id),
 assigned_at timestamptz NOT NULL DEFAULT now(), available_from timestamptz, due_at timestamptz,
 status text NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned','in_progress','completed','cancelled'))
);
CREATE INDEX ON public.assessment_assignments(trainee_id);
CREATE TABLE public.assessment_attempts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 assignment_id uuid NOT NULL REFERENCES public.assessment_assignments(id) ON DELETE CASCADE,
 trainee_id uuid NOT NULL REFERENCES public.user_profiles(id),
 attempt_number integer NOT NULL CHECK (attempt_number>0),
 status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','submitted','expired')),
 started_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz, submitted_at timestamptz,
 correct_count integer CHECK (correct_count>=0),
 score_percent numeric(5,2) CHECK (score_percent BETWEEN 0 AND 100), passed boolean,
 UNIQUE(assignment_id,attempt_number)
);
CREATE INDEX ON public.assessment_attempts(trainee_id);
CREATE TABLE public.attempt_questions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 attempt_id uuid NOT NULL REFERENCES public.assessment_attempts(id) ON DELETE CASCADE,
 question_id uuid NOT NULL REFERENCES public.question_bank(id),
 position integer NOT NULL CHECK (position>0),
 displayed_options text[] NOT NULL CHECK (cardinality(displayed_options)=4),
 UNIQUE(attempt_id,question_id), UNIQUE(attempt_id,position)
);
CREATE TABLE public.attempt_answers (
 attempt_question_id uuid PRIMARY KEY REFERENCES public.attempt_questions(id) ON DELETE CASCADE,
 selected_index smallint NOT NULL CHECK (selected_index BETWEEN 0 AND 3),
 saved_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.audit_logs (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 actor_id uuid REFERENCES public.user_profiles(id), action text NOT NULL,
 entity_type text NOT NULL, entity_id uuid, metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now()
);

CREATE FUNCTION public.rboas_is_admin() RETURNS boolean LANGUAGE sql STABLE
SET search_path = '' AS $$
 SELECT COALESCE((SELECT auth.jwt())->'app_metadata'->>'rboas_role'='admin',false)
$$;
CREATE FUNCTION public.rboas_is_manager() RETURNS boolean LANGUAGE sql STABLE
SET search_path = '' AS $$
 SELECT COALESCE((SELECT auth.jwt())->'app_metadata'->>'rboas_role'='manager',false)
$$;
REVOKE ALL ON FUNCTION public.rboas_is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rboas_is_manager() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rboas_is_admin(),public.rboas_is_manager() TO authenticated;

INSERT INTO public.assessments(title,description,published) VALUES (
 'Five-Day Remote Billing Onboarding Assessment',
 '25 questions randomly selected from 50 approved questions, balanced across five billing categories.',false
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.answer_keys ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
GRANT SELECT ON public.user_profiles,public.assessments,public.question_bank,
 public.assessment_assignments,public.assessment_attempts,public.attempt_questions,
 public.attempt_answers,public.audit_logs TO authenticated;
GRANT INSERT,UPDATE,DELETE ON public.user_profiles,public.assessments,
 public.question_bank,public.assessment_assignments TO authenticated;

CREATE POLICY profiles_own_or_team ON public.user_profiles FOR SELECT TO authenticated
 USING (id=(SELECT auth.uid()) OR (SELECT public.rboas_is_admin())
 OR ((SELECT public.rboas_is_manager()) AND manager_id=(SELECT auth.uid())));
CREATE POLICY profiles_admin_write ON public.user_profiles FOR ALL TO authenticated
 USING ((SELECT public.rboas_is_admin())) WITH CHECK ((SELECT public.rboas_is_admin()));

CREATE POLICY assessments_visible ON public.assessments FOR SELECT TO authenticated
 USING (published OR (SELECT public.rboas_is_admin()) OR (SELECT public.rboas_is_manager()));
CREATE POLICY assessments_admin_write ON public.assessments FOR ALL TO authenticated
 USING ((SELECT public.rboas_is_admin())) WITH CHECK ((SELECT public.rboas_is_admin()));

CREATE POLICY assignments_visible ON public.assessment_assignments FOR SELECT TO authenticated
 USING (trainee_id=(SELECT auth.uid()) OR (SELECT public.rboas_is_admin()) OR
  ((SELECT public.rboas_is_manager()) AND EXISTS (
   SELECT 1 FROM public.user_profiles p WHERE p.id=trainee_id AND p.manager_id=(SELECT auth.uid())
 )));
CREATE POLICY assignments_admin_write ON public.assessment_assignments FOR ALL TO authenticated
 USING ((SELECT public.rboas_is_admin())) WITH CHECK ((SELECT public.rboas_is_admin()));

CREATE POLICY attempts_visible ON public.assessment_attempts FOR SELECT TO authenticated
 USING (trainee_id=(SELECT auth.uid()) OR (SELECT public.rboas_is_admin()) OR
 ((SELECT public.rboas_is_manager()) AND EXISTS (
   SELECT 1 FROM public.user_profiles p WHERE p.id=trainee_id AND p.manager_id=(SELECT auth.uid())
  )));
CREATE POLICY attempt_questions_visible ON public.attempt_questions FOR SELECT TO authenticated
 USING (EXISTS (SELECT 1 FROM public.assessment_attempts a WHERE a.id=attempt_id));
CREATE POLICY attempt_answers_visible ON public.attempt_answers FOR SELECT TO authenticated
 USING (EXISTS (SELECT 1 FROM public.attempt_questions q WHERE q.id=attempt_question_id));

CREATE POLICY questions_visible ON public.question_bank FOR SELECT TO authenticated
 USING ((SELECT public.rboas_is_admin()) OR (SELECT public.rboas_is_manager()) OR
 EXISTS (SELECT 1 FROM public.attempt_questions q WHERE q.question_id=question_bank.id));
CREATE POLICY questions_admin_write ON public.question_bank FOR ALL TO authenticated
 USING ((SELECT public.rboas_is_admin())) WITH CHECK ((SELECT public.rboas_is_admin()));

CREATE POLICY audit_admin_read ON public.audit_logs FOR SELECT TO authenticated
 USING ((SELECT public.rboas_is_admin()));
REVOKE ALL ON private.answer_keys FROM PUBLIC,anon,authenticated;
