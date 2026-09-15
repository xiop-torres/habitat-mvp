# Habitat Backend Architecture

## Decision

Use the current Next.js app as the frontend and backend entry point, deployed later on Vercel Hobby, with Supabase Free for PostgreSQL, Auth, Storage, and Row Level Security.

This replaces the temporary MongoDB/Mongoose code currently present in `auth.ts`, `models/`, `lib/dbConnect.ts`, and `app/api/*` in later tasks. Those files are left untouched in this task except for adding the Supabase preparation layer.

## Current App Inventory

- Framework: Next.js `16.3.3`, App Router.
- UI: React `19`, Tailwind CSS `4`, lucide icons.
- Current backend remnants: NextAuth credentials, Mongoose models, `app/api/register`, `app/api/listings`.
- Current data source for most screens: `lib/mocks.ts`.
- Important student pages: search/listings, listing detail, favorites, visits, messages, notifications, profile.
- Important owner pages: owner panel, requests, calendar, new listing, edit listing, published confirmation.

## Free-Cost Architecture

- Hosting: Vercel Hobby. Use the free `*.vercel.app` URL.
- Database: Supabase Free PostgreSQL.
- Auth: Supabase Auth email/password first. Optional OAuth only if configured without paid add-ons.
- Storage: Supabase Storage Free for listing images.
- API: Prefer Supabase server/client SDK plus Next.js Route Handlers only when server-side validation is needed.
- Maps: keep current visual/reference map for MVP. Do not add paid map APIs.

## Initial Data Model

Keep only the tables needed by current product flows:

- `profiles`: one row per Supabase auth user, with role `student`, `owner`, or `admin`.
- `listings`: owner housing posts.
- `listing_images`: images stored in Supabase Storage.
- `favorites`: saved listings per student.
- `visit_requests`: visit scheduling and status.
- `conversations`: one student-owner-listing thread.
- `messages`: chat messages inside a conversation.
- `notifications`: user alerts for visits, messages, favorites, listings, or system events.

The initial SQL proposal is in `supabase/schema.sql`.

## Main Relationships

- `profiles.id` references `auth.users.id`.
- `listings.owner_id` references `profiles.id`.
- `listing_images.listing_id` references `listings.id`.
- `favorites.student_id` references `profiles.id`; `favorites.listing_id` references `listings.id`.
- `visit_requests` connects listing, student, and owner.
- `conversations` connects listing, student, and owner.
- `messages.conversation_id` references `conversations.id`; `messages.sender_id` references `profiles.id`.
- `notifications.user_id` references `profiles.id`.

## Authorization Strategy

Use Supabase Auth plus Row Level Security in a later task:

- Student:
  - Can read published listings.
  - Can create/delete their own favorites.
  - Can create visit requests as `student_id`.
  - Can read/update their own profile.
  - Can read conversations/messages where they are the student.
  - Can read/update their own notifications.

- Owner:
  - Can create/update/archive their own listings.
  - Can manage images for their own listings.
  - Can read visit requests for their own listings.
  - Can accept/reject/reprogram requests where they are `owner_id`.
  - Can read conversations/messages where they are the owner.
  - Can read/update their own profile and notifications.

- Admin:
  - Reserved for later manual moderation.

## Environment Variables

Required later:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AUTH_SECRET` temporarily, until NextAuth is fully removed or replaced.

Never commit real `.env` files. Only `.env.example` and `.env.local.example` are allowed.

## Dependencies

Added:

- `@supabase/supabase-js`
- `@supabase/ssr`

Prepared files:

- `lib/supabase/client.ts`
- `lib/supabase/server.ts`

## Later Implementation Plan

1. Create Supabase project and paste keys into local `.env.local`.
2. Run reviewed schema and RLS policies.
3. Replace registration pages with Supabase Auth sign-up and profile creation.
4. Replace login with Supabase Auth sign-in/sign-out.
5. Migrate listings from mocks to Supabase.
6. Implement favorites.
7. Implement visit requests.
8. Implement conversations/messages.
9. Implement notifications.
10. Add image upload to Supabase Storage.
11. Remove MongoDB/Mongoose/NextAuth legacy code when no longer used.

## Cost Guardrails

- Do not add paid map APIs.
- Do not add paid email/SMS providers.
- Do not add Supabase Pro features such as custom domains, PITR, branching, paid compute, or advanced phone MFA.
- Do not add Vercel Pro features.
- Use `*.vercel.app` for publishing.
