# RBOAS-System — Remote Billing Onboarding Assessment System

A remote pharmacy billing onboarding assessment application. Supabase provides authentication, a PostgreSQL question bank, answer-key protection, and an Edge Function API. Netlify is intended to publish the website from GitHub.

## Current training bank
- 50 **inactive drafts** stored in Supabase: 40 questions imported verbatim from the training material, plus 10 previously created supplemental draft questions (5 LTC and 5 coupons/follow-up).
- The 40 supplied questions preserve the six numbered training modules and a seventh practical medication-calculation section.
- All 50 require SOP and HR/trainer review before publication. The administrator can review, edit, approve, and deactivate questions.
- Official assessments choose 25 randomly from the approved bank, with representation from all nine stored topics, and shuffle answer options. Results are graded on the server.
- The public presentation preview uses a **separate generic quiz** with sample questions and scores; it must not be interpreted as an official assessment.

## Currently implemented
Dashboard, management tour, trainee invitations and staff management, question review/approval, secure official exam flow, password management, results, category analysis, printable sample reports and CSV exports.

## Important deployment and safety notes
- There is currently no provisioned initial administrator. Real employee enrollment and exam-taking remain untested until a verified admin account is authorized.
- The GitHub repository is currently **public**. Historical commits contained draft question-answer seed files; the files have been removed from the latest branch but historical commits may still expose them. Change repository visibility to **private** and treat previously published questions as potentially disclosed before using any of them in production.
- Never place actual patient information in trainee exercises.
- Before sending staff invitations, set the correct production Site URL and allowed redirects in Supabase Authentication → URL Configuration.
- Public website deployment has **not** been independently verified from this environment.

## Services
- GitHub: https://github.com/developeramin25/RBOAS-System
- Supabase: https://supabase.com/dashboard/project/dgusnyfhcizbmdmryjbj
- Netlify URL supplied by the project owner: https://astonishing-beijinho-a0f70b.netlify.app/

## Management demonstration
Open **Project tour**, **Question bank** (shows nine-topic distribution), **Assessments** (separate generic 25-question practice), and **Results & insights** (illustrative printable performance reports). Staff-only question review is visible after administrator activation.

The current preview is for evaluation, not live employment decisions.
