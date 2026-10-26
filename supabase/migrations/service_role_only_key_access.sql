-- Service-role-only bridges to protected exam answer keys.
-- The private schema remains excluded from the public Data API.
CREATE OR REPLACE FUNCTION public.rboas_get_scoring_keys(p_question_ids uuid[])
RETURNS TABLE(question_id uuid, correct_option_index smallint)
LANGUAGE sql SECURITY DEFINER SET search_path = ''
AS $$
 SELECT a.question_id,a.correct_option_index
 FROM private.answer_keys a
 WHERE a.question_id = ANY(p_question_ids);
$$;
CREATE OR REPLACE FUNCTION public.rboas_upsert_answer_key(p_question_id uuid, p_correct_index smallint, p_explanation text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
 IF p_correct_index < 0 OR p_correct_index > 3 THEN
   RAISE EXCEPTION 'Invalid answer index';
 END IF;
 INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
 VALUES (p_question_id,p_correct_index,p_explanation)
 ON CONFLICT (question_id) DO UPDATE
 SET correct_option_index = excluded.correct_option_index, explanation = excluded.explanation;
END;
$$;
REVOKE ALL ON FUNCTION public.rboas_get_scoring_keys(uuid[]) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.rboas_upsert_answer_key(uuid,smallint,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.rboas_get_scoring_keys(uuid[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.rboas_upsert_answer_key(uuid,smallint,text) TO service_role;
