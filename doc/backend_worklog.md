# LinkFolio Backend Worklog

## Purpose

This document tracks the backend work carried out on the `backend` branch.
It is meant to serve both as:

- a practical execution log for the project;
- supporting evidence of the work done step by step over several sessions.

## Initial Snapshot

- Date: 2026-06-24
- Branch: `backend`
- Repository state: clean working tree at the time of review
- Current app state: default Next.js scaffold still present
- Backend state: not started yet

## Project Context

Based on [LinkFolio_Project_Report.md](/Users/maximegregoire/tek5/linkfolio/doc/LinkFolio_Project_Report.md), LinkFolio is a small full-stack profile hosting platform built with:

- Next.js on Vercel
- Amazon DynamoDB as the database
- AWS SDK v3 for backend access to DynamoDB

The backend scope described in the report is:

1. Create a profile
2. Read a public profile by id
3. Update a profile with a valid edit token

## What Already Exists

- Next.js project scaffold
- AWS SDK DynamoDB dependencies already installed in `package.json`
- App Router frontend placeholder files in `app/`
- Project report with product scope, data model, and implementation roadmap

## Important Observations

- The report mentions Next.js 14, but the actual project uses `next@16.2.9`.
- The repository does not yet contain backend routes, shared backend utilities, or environment variable templates.
- The report still contains placeholders that should be cleaned up later, such as `[Teammate Name]`.
- Since the repository contains a local instruction about Next.js breaking changes, relevant docs in `node_modules/next/dist/docs/` must be checked before writing framework code.

## Backend Scope We Will Handle

We are deliberately focusing only on backend work for now.

That includes:

- backend architecture inside the Next.js app
- DynamoDB access layer
- input validation strategy
- API route implementation
- token-based edit protection
- backend-focused documentation

That does not include, for now:

- frontend styling
- final responsive polish
- demo video or submission assets

## Step-by-Step Backend Plan

We will spread the work across small, clearly documented steps instead of building everything in one shot.

### Step 0 - Project Review and Planning

Goal:
- understand the project report and current repository state;
- define a progressive backend roadmap;
- create this documentation file.

Expected output:
- shared understanding of the backend scope;
- initial written roadmap.

### Step 1 - Backend Foundations

Goal:
- decide the backend folder structure;
- define TypeScript types for profiles and links;
- define environment variables and DynamoDB configuration strategy;
- choose input validation approach.

Expected output:
- shared backend model/types;
- reusable DynamoDB client setup;
- environment variable contract documented.

### Step 2 - Create Profile Endpoint

Goal:
- implement the endpoint that creates a new profile;
- generate a public id and a private edit token;
- write the item into DynamoDB.

Expected output:
- working create API route;
- validated request payload;
- documented response shape.

### Step 3 - Read Public Profile Endpoint

Goal:
- implement the endpoint that reads a profile by id;
- return only the data needed for public display.

Expected output:
- working read API route;
- proper not-found handling;
- documented public response contract.

### Step 4 - Update Profile Endpoint

Goal:
- implement the endpoint that updates a profile when the edit token matches;
- protect against unauthorized edits.

Expected output:
- working update API route;
- token verification logic;
- documented error cases.

### Step 5 - Backend Verification and Cleanup

Goal:
- verify endpoint behavior;
- clean naming and structure;
- prepare backend documentation for handoff and deployment.

Expected output:
- tested backend flows;
- cleaned backend code;
- updated final backend notes.

## Documentation Rules For Our Work

For each work session, we should record:

- date
- objective of the session
- decisions taken
- files created or modified
- tests or checks performed
- remaining tasks

## Session Log

### Session 0 - 2026-06-24

Objective:
- review the report and repository before starting implementation.

Actions completed:
- read the project report in `doc/LinkFolio_Project_Report.md`;
- checked the active branch and repository structure;
- confirmed the backend branch exists and the worktree was clean during review;
- identified the current codebase as a near-empty scaffold;
- created this backend worklog.

Key decisions:
- work only on backend concerns for now;
- progress in small steps rather than implementing everything at once;
- keep a written trace of each session in this file.

Current backlog:
- define the backend structure;
- define the profile data contract in code;
- prepare the DynamoDB client and environment variable handling;
- implement create, read, then update routes in that order.

### Session 1 - 2026-06-24

Objective:
- build the backend foundations before implementing API routes.

Actions completed:
- installed project dependencies so the local Next.js documentation could be consulted;
- reviewed the local Next.js docs for route handlers, app structure, and environment variables;
- created a backend environment loader;
- created a reusable DynamoDB Document client setup;
- defined the shared profile TypeScript types;
- defined backend validation rules for incoming profile payloads;
- added a `.env.example` file to document the required variables;
- updated `.gitignore` so `.env.example` can be tracked in the repository.

Files created:
- `.env.example`
- `lib/backend/env.ts`
- `lib/backend/dynamodb.ts`
- `lib/backend/profiles/types.ts`
- `lib/backend/profiles/validation.ts`

Key decisions:
- use App Router route handlers under `app/api/`;
- keep backend-only code under `lib/backend/` for reuse across future routes;
- validate payloads manually for now instead of adding another dependency;
- accept optional `title`, `bio`, and `photoUrl` values as empty strings, but require `name` and at least one link;
- allow only `http` and `https` URLs for profile photo and links.

Assumptions introduced at this stage:
- maximum of 10 links per profile;
- `name` max length: 80;
- `title` max length: 120;
- `bio` max length: 280;
- link label max length: 40.

Checks performed:
- `npm run lint`
- `npx tsc --noEmit`

Remaining tasks:
- create the profile creation route;
- create the public profile read route;
- create the protected update route.

### Session 2 - 2026-06-24

Objective:
- implement the backend endpoint that creates a profile.

Actions completed:
- added secure profile id generation;
- added secure edit token generation;
- added a serializer to expose only the public profile shape;
- added the profile creation repository write flow for DynamoDB;
- implemented `POST /api/profiles` as the first backend route handler.

Files created:
- `app/api/profiles/route.ts`
- `lib/backend/profiles/ids.ts`
- `lib/backend/profiles/serializers.ts`
- `lib/backend/profiles/repository.ts`

Key decisions:
- use `POST /api/profiles` as the collection endpoint for profile creation;
- force the route to run on the Node.js runtime because it depends on the AWS SDK;
- use DynamoDB conditional writes to avoid accidental id collisions;
- return `editToken` separately from the public profile object so the private secret is not mixed into public profile data;
- return backend validation issues in `400` responses, but keep `500` errors generic.

Response contract chosen for now:
- success status: `201`
- success body:
  - `profile`: public profile object without `editToken`
  - `editToken`: secret token required for future edits

Error handling:
- `400` if JSON is invalid
- `400` if the payload fails validation
- `500` if DynamoDB write or another unexpected backend error fails

Checks to run:
- lint
- TypeScript check

Remaining tasks:
- verify the create route with lint and type checks;
- create the public profile read route;
- create the protected update route.

### Session 3 - 2026-06-24

Objective:
- implement the public backend endpoint that reads a profile by id.

Actions completed:
- added a repository read function based on DynamoDB `GetCommand`;
- added backend validation for the profile id parameter;
- implemented `GET /api/profiles/[id]` to return a public profile by id only;
- kept `editToken` excluded from the public response.

Files created:
- `app/api/profiles/[id]/route.ts`

Files updated:
- `lib/backend/profiles/repository.ts`
- `lib/backend/profiles/validation.ts`

Key decisions:
- use `GET /api/profiles/[id]` as the public read endpoint;
- return `404` when the profile does not exist;
- reuse the public serializer so the private `editToken` never leaks through the public API;
- validate the route param before querying DynamoDB.

Response contract chosen for now:
- success status: `200`
- success body:
  - `profile`: public profile object without `editToken`

Error handling:
- `400` if the id parameter is invalid
- `404` if no profile exists for that id
- `500` if the DynamoDB read or another backend operation fails

Checks performed:
- `npm run lint`
- `npx tsc --noEmit`

Remaining tasks:
- create the protected update route;
- test the create and read flow against a real AWS-backed local environment.

### Session 4 - 2026-06-25

Objective:
- implement the protected backend endpoint that updates a profile.

Actions completed:
- added a DynamoDB update flow with conditional token checking;
- added repository-level errors to distinguish missing profiles from invalid edit tokens;
- added backend parsing for update payloads containing both profile fields and `editToken`;
- implemented `PUT /api/profiles/[id]` in the existing dynamic route handler.

Files updated:
- `app/api/profiles/[id]/route.ts`
- `lib/backend/profiles/repository.ts`
- `lib/backend/profiles/validation.ts`
- `doc/backend_worklog.md`

Key decisions:
- use `PUT /api/profiles/[id]` for full profile updates;
- require the request body to include `editToken` together with the profile fields;
- keep `createdAt`, `id`, and `editToken` unchanged during updates;
- return `403` when the profile exists but the edit token is invalid;
- use a conditional DynamoDB update to avoid updating the wrong record.

Response contract chosen for now:
- success status: `200`
- success body:
  - `profile`: updated public profile object without `editToken`

Error handling:
- `400` if JSON is invalid
- `400` if the id or payload fails validation
- `403` if the edit token is wrong
- `404` if no profile exists for that id
- `500` if the DynamoDB update or another backend operation fails

Checks to run:
- lint
- TypeScript check

Remaining tasks:
- verify the update route with lint and type checks;
- test the full create/read/update flow against the real AWS-backed local environment;
- finalize backend documentation and cleanup.
