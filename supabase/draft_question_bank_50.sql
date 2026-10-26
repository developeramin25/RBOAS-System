-- Management-review draft question bank. Not yet approved for actual employee onboarding.
BEGIN;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('ERX Processing','What should you check first when opening a newly received electronic prescription?',ARRAY['Immediately submit a claim','Verify patient identity and prescription details','Change the prescribed quantity','Close the ERX without review']::text[],'basic',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,1,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('ERX Processing','Which details help match an electronic prescription to the correct patient?',ARRAY['Patient identifiers','Employee schedule','Printer settings','Coupon branding']::text[],'basic',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('ERX Processing','If an ERX is missing required information, what is the safest next step?',ARRAY['Guess the missing information','Request clarification through the approved workflow','Change the drug to one in stock','Submit a cash claim']::text[],'basic',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,1,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('ERX Processing','What should be compared between the ERX and the selected product?',ARRAY['Drug name, strength, form, and directions','Only the medication color','Only the package size','Only the pharmacy name']::text[],'basic',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('ERX Processing','What should be done when an ERX''s directions are unclear?',ARRAY['Clarify the directions through the appropriate workflow','Rewrite directions from memory','Increase days'' supply','Ignore the ambiguity']::text[],'basic',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('ERX Processing','If the same ERX appears twice, what should the technician do?',ARRAY['Bill both immediately','Review for duplication and follow correction procedures','Mark both as delivered','Transfer both without checking']::text[],'intermediate',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,1,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('ERX Processing','Why review the patient''s medication profile before processing a new prescription?',ARRAY['Identify relevant history and duplicate therapies','Calculate employee overtime','Choose a marketing promotion','Confirm website traffic']::text[],'intermediate',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('ERX Processing','When a new ERX requires pharmacist review, the technician should:',ARRAY['Override the concern independently','Refer the issue to the pharmacist','Change the prescriber','Skip the review']::text[],'intermediate',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,1,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('ERX Processing','Which fields are essential for evaluating days'' supply?',ARRAY['Quantity, dose, and administration directions','Store address only','Employee shift time','Label color']::text[],'intermediate',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('ERX Processing','If the new ERX strength differs from an active profile medication, what is appropriate?',ARRAY['Flag the difference for review as needed','Automatically use the older strength','Combine both strengths on one claim','Delete the previous prescription without review']::text[],'intermediate',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Refill Processing','What should be checked before attempting to refill a prescription?',ARRAY['Authorized refills and prescription validity','Monthly ad budget','Printer serial number','Staff attendance']::text[],'basic',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Refill Processing','A refill-too-soon rejection generally means:',ARRAY['The payer''s refill timing requirements have not been met','The patient''s name is unknown','The drug is permanently unavailable','The prescriber has no address']::text[],'basic',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Refill Processing','What should the technician do when no authorized refills remain?',ARRAY['Create an additional refill','Use the approved refill-request workflow','Change the NDC automatically','Ignore the prescription']::text[],'basic',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,1,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Refill Processing','Before billing another refill when an earlier fill is uncollected, what should be checked?',ARRAY['Pickup history and applicable store instructions','The trainee''s work schedule','Coupon expiration only','The website analytics']::text[],'basic',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Refill Processing','Why review the last fill date?',ARRAY['To assess refill timing and possible overlaps','To choose a different label template','To determine employee pay rate','To automatically increase quantity']::text[],'basic',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Refill Processing','If a medication is marked discontinued, what is the appropriate approach?',ARRAY['Review the status and seek clarification when needed','Refill the old order without review','Remove discontinuation status automatically','Bill it as a new prescription']::text[],'intermediate',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Refill Processing','Why is quantity important in refill processing?',ARRAY['It helps confirm the authorized supply and coverage limits','It determines the prescriber''s specialty','It sets the patient''s age','It changes the pharmacy address']::text[],'intermediate',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Refill Processing','What should you do when a refill rejection is not understood?',ARRAY['Review the rejection details and follow escalation procedures','Submit identical claims repeatedly','Change the patient profile randomly','Ignore the rejection']::text[],'intermediate',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Refill Processing','If the patient''s insurance changes before a refill, what should be done?',ARRAY['Verify the new insurance before resubmitting','Use the old plan without checking','Change the patient''s date of birth','Bill all medications as cash']::text[],'intermediate',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Refill Processing','What is an important step after resolving a refill issue?',ARRAY['Document the action and status according to workflow','Delete all previous notes','Avoid updating the team','Change the prescriber']::text[],'intermediate',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Insurance & Rejections','What should be checked first after an insurance claim rejects?',ARRAY['The rejection code and payer message','The employee''s clock-in','The pharmacy logo','The patient''s favorite color']::text[],'basic',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Insurance & Rejections','When a claim says member not found, what information is useful to verify?',ARRAY['Member ID, payer details, and patient identifiers','Shipping company name only','Medication package color','Employee initials only']::text[],'basic',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Insurance & Rejections','What is an appropriate response to an inactive insurance rejection?',ARRAY['Verify eligibility and follow coverage-update procedures','Change the date of birth without verification','Ignore the payer response','Override any rejection']::text[],'basic',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Insurance & Rejections','What should happen when a clinical DUR rejection needs authorization?',ARRAY['Escalate to the pharmacist','Automatically override it','Choose a different patient','Change the product without review']::text[],'basic',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Insurance & Rejections','What is a prior authorization (PA) generally used for?',ARRAY['Obtaining payer approval for certain coverage requirements','Creating a new pharmacy account','Calculating employee overtime','Ordering office supplies']::text[],'basic',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Insurance & Rejections','If a claim rejects as non-formulary, what should the technician do?',ARRAY['Review the message and follow the payer/prescriber workflow','Change the prescribed drug without authorization','Ignore the rejection','Apply every coupon automatically']::text[],'intermediate',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Insurance & Rejections','Why is the payer help message important?',ARRAY['It can identify the issue and required next steps','It guarantees a claim will be paid','It replaces pharmacist judgment','It always authorizes an override']::text[],'intermediate',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Insurance & Rejections','When changing an NDC to address a rejection, what must be confirmed?',ARRAY['The selected product matches the prescription and is appropriate','Only that the claim becomes paid','That the package looks similar','Only the manufacturer''s logo']::text[],'intermediate',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Insurance & Rejections','What should you do if rejection guidance conflicts with local policy?',ARRAY['Pause and escalate to the designated lead/pharmacist','Ignore both sets of instructions','Override the claim anyway','File the prescription as paid']::text[],'intermediate',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Insurance & Rejections','What is important after a payer issue is resolved?',ARRAY['Document actions and ensure claim information is accurate','Delete prior claim history','Skip all final checks','Avoid communicating with the team']::text[],'intermediate',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('LTC Billing','What must be confirmed before using an LTC billing workflow?',ARRAY['Facility eligibility and the applicable billing instructions','Only the patient''s age','Only the package size','The employee''s shift']::text[],'basic',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('LTC Billing','What is the best response to uncertainty about a patient''s LTC facility status?',ARRAY['Verify facility information through the approved process','Assume all patients qualify','Change the facility in the profile','Bill without verification']::text[],'basic',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('LTC Billing','Why should LTC day supply be verified carefully?',ARRAY['It affects claim accuracy and may be subject to plan rules','It controls the staff schedule','It changes the prescriber''s name','It determines the store phone number']::text[],'basic',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('LTC Billing','If an LTC claim would require changing a prescribed quantity, what should be done?',ARRAY['Confirm any change is authorized under the applicable workflow','Reduce quantity by default','Increase quantity for every patient','Ignore the prescribed directions']::text[],'basic',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('LTC Billing','Which source should guide an LTC billing date?',ARRAY['The documented policy and patient dispensing history','The technician''s preferred date','The current marketing schedule','The staff meeting calendar']::text[],'basic',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('LTC Billing','What should the technician check when reviewing an LTC claim for a previous date?',ARRAY['Eligibility, history, and permitted billing timeframe','Only whether the system allows typing the date','Only medication color','Only current inventory']::text[],'intermediate',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('LTC Billing','How should a possible duplicate LTC claim be handled?',ARRAY['Review existing transactions and resolve before submitting','Submit it again immediately','Delete the patient profile','Switch to a different patient']::text[],'intermediate',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('LTC Billing','If an LTC claim requires a pharmacist decision, what is the correct action?',ARRAY['Obtain pharmacist guidance','Override independently','Change the medication strength','Skip the concern']::text[],'intermediate',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('LTC Billing','Which of the following is essential to an LTC claim audit trail?',ARRAY['Accurate notes and documented billing actions','Only a verbal memory','No documentation','An unrelated employee message']::text[],'intermediate',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('LTC Billing','When LTC instructions are updated, the technician should:',ARRAY['Follow the current authorized instructions and ask about conflicts','Keep using outdated instructions','Ignore new guidance','Apply rules from any unrelated location']::text[],'intermediate',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Coupons & Follow-Up','Before applying a manufacturer savings coupon, what should be verified?',ARRAY['Patient and insurance eligibility under coupon terms','Employee clock-out time','Store inventory list only','Marketing email open rate']::text[],'basic',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Coupons & Follow-Up','Why must the manufacturer coupon terms be reviewed?',ARRAY['Restrictions and benefit limits can vary','All cards have identical rules','The terms replace the prescription','They guarantee zero copay']::text[],'basic',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Coupons & Follow-Up','What should happen if a coupon cannot be applied?',ARRAY['Document the reason and follow the approved escalation or follow-up process','Force an unauthorized override','Delete the insurance plan','Mark the claim as paid']::text[],'basic',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Coupons & Follow-Up','Why is coordination of benefits important when using a secondary coupon?',ARRAY['It affects correct billing order and claim processing','It changes the medication name','It changes the patient''s address','It sets employee work hours']::text[],'basic',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Coupons & Follow-Up','If a coupon is restricted to commercial plans, what should the technician do?',ARRAY['Verify coverage type before use','Apply it to every government plan','Assume the patient has commercial coverage','Ignore the restriction']::text[],'basic',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Coupons & Follow-Up','What should be recorded after submitting a follow-up request?',ARRAY['Issue, action taken, and next responsible team or status','Only the trainee''s name','The pharmacy logo','No details']::text[],'intermediate',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Coupons & Follow-Up','When a rejection needs action from a specialized team, what is appropriate?',ARRAY['Route it through the designated workflow with clear notes','Delete the claim','Change the prescriber without review','Wait without documenting']::text[],'intermediate',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Coupons & Follow-Up','What is the purpose of tagging unresolved billing issues?',ARRAY['Enable tracking and clear follow-up ownership','Increase days'' supply','Replace insurance coverage','Change claim price automatically']::text[],'intermediate',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Coupons & Follow-Up','If a patient must be contacted, what should be documented?',ARRAY['Reason for contact and follow-up status in the approved system','Private details in a public chat','The employee''s personal opinion only','No record of the call']::text[],'intermediate',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
WITH q AS (INSERT INTO public.question_bank(category,prompt,options,difficulty,active)
VALUES ('Coupons & Follow-Up','What should be checked before marking a billing follow-up complete?',ARRAY['The issue is resolved or properly handed off with documentation','The trainee has finished their shift','A coupon card exists','A dashboard number has changed']::text[],'intermediate',false) RETURNING id)
INSERT INTO private.answer_keys(question_id,correct_option_index,explanation)
SELECT id,0,'Draft onboarding question; review against approved SOP before activation.' FROM q;
COMMIT;