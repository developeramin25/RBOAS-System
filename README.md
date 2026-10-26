# RBOAS — Remote Billing Onboarding Assessment System

An internal onboarding assessment application for remote pharmacy billing trainees.

## Management demonstration

- Guided Project tour explaining the assessment workflow
- Responsive dashboard with navigation and illustrative KPI cards
- Trainee directory, administrator invitations, profile management, and store/manager assignments
- 50 draft questions, 10 per each of five billing categories
- Randomized 25-question management quiz, five from each category, shuffled answers and 30-minute countdown
- Question navigation, sample score breakdown, and print-ready sample result
- Official authenticated exam assignment, server-side answer saving and scoring via Supabase Edge Functions
- Role-limited performance reports, individual category breakdowns, CSV exports and printed reports
- Administrator assessment configuration and password management

## Connected services

- GitHub repository: https://github.com/developeramin25/RBOAS-System
- Netlify URL provided by the owner: https://astonishing-beijinho-a0f70b.netlify.app/
- Supabase project: https://supabase.com/dashboard/project/dgusnyfhcizbmdmryjbj

## Security and status

The 50 questions are DRAFT and inactive in the official Supabase bank until reviewed and approved.
Public demonstration content and sample trainees are fictional; they are not confidential exam records.
Private answer keys reside in the private Supabase schema, with service-role-only access.
Production onboarding requires the initial administrator, SOP approval, invitation redirect setup, and end-to-end testing.
The live Netlify domain has not been independently browser-verified in this session.

## First administrator activation

1. In Supabase Authentication URL Configuration, set the actual Netlify domain as the Site URL and include it among allowed redirect URLs.
2. Establish the first administrator with a verified email account. Only an authorized administrator should receive the role in raw_app_meta_data.rboas_role and a matching active user_profiles record.
3. Sign in, invite users from the trainee directory, and have them set their passwords from their profile.
4. Verify current company SOPs, approve the question bank and publish the assessment.
5. Test a complete 25-question assigned exam without patient data and verify score, reporting, and permissions.

## Four-minute presentation

1. Open Project tour.
2. Show the five-category Question bank and 50 draft items.
3. Try the random 25-question assessment and submit a sample result.
4. Visit Results & insights and open the individual printable report.
5. Explain that live employee workflows remain behind staff authentication and approved policies.

## Database

user_profiles, assessments, question_bank, private.answer_keys, assessment_assignments, assessment_attempts, attempt_questions, attempt_answers, audit_logs.

## Implementation

HTML/CSS/JavaScript static frontend on Netlify (no build step); Supabase Auth + PostgreSQL RLS; Supabase rboas-api Edge Function. Never put service-role or secret keys into this public repository.