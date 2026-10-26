# RBOAS-System

Remote Billing Onboarding Assessment System (RBOAS): five-day pharmacy billing onboarding evaluation.

## Current phase
Phase 1: Responsive application shell, role-aware dashboard, question-bank and trainee views, sample quiz experience, and Supabase Auth email/password sign-in.

The public design-preview mode uses clearly labeled fake trainee/score information and **does not** expose real employee records. Real data is loaded after Supabase authentication and is governed by database RLS policies.

## Tech
- Static, no-build, responsive UI (HTML/CSS/JavaScript) for reliable initial Netlify deployment
- Supabase PostgreSQL, Auth and RLS (project ref: dgusnyfhcizbmdmryjbj)
- Netlify deployment from \`main\`
- A public Supabase publishable key is used client-side. **Never commit service-role/secret keys.**

## Pending features
- Secure admin bootstrap and invitation flow (no public signup)
- Question authoring + protected correct answer keys using server functions
- Balanced random exam allocation, timing, secure submission and grading
- PDF reports and manager review
- Production QA and launch readiness

## Security
The 9 database tables were created in the initial migration; answer keys are stored in the private schema. Exam submissions must be written and scored by trusted backend functions, not by the frontend.

## Deployment
Netlify publishes repository root directly, configured by netlify.toml. No Node build is required for this phase. A git push to \`main\` automatically publishes if the Netlify project is connected to the repo.
