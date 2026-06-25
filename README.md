# LinkFolio

LinkFolio is a small full-stack profile hosting platform built with:

- Next.js
- Vercel serverless route handlers
- Amazon DynamoDB
- AWS SDK v3

This repository currently contains the backend foundations and backend API flow for:

- creating a profile
- reading a public profile by id
- updating a profile with a valid edit token

## Backend Routes

The backend currently exposes:

- `POST /api/profiles`
- `GET /api/profiles/:id`
- `PUT /api/profiles/:id`

## Environment Variables

Create a `.env.local` file with:

```bash
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=your_aws_region
DYNAMODB_TABLE_NAME=profiles
```

The DynamoDB table must already exist and use:

- table name: `profiles`
- partition key: `id`

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The app will be available at:

```txt
http://localhost:3000
```

## Verification Commands

Lint the project:

```bash
npm run lint
```

Run the TypeScript check:

```bash
npm run typecheck
```

Run both checks together:

```bash
npm run check
```

Build the app:

```bash
npm run build
```

## Backend API Test Commands

### Create a profile

```bash
curl -X POST http://localhost:3000/api/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maxime Test",
    "title": "Backend Validation",
    "bio": "Profile created to validate the LinkFolio backend flow.",
    "photoUrl": "https://example.com/avatar.png",
    "links": [
      { "label": "Portfolio", "url": "https://example.com" },
      { "label": "GitHub", "url": "https://github.com/example" }
    ]
  }'
```

### Read a profile

```bash
curl http://localhost:3000/api/profiles/<PROFILE_ID>
```

### Update a profile

```bash
curl -X PUT http://localhost:3000/api/profiles/<PROFILE_ID> \
  -H "Content-Type: application/json" \
  -d '{
    "editToken": "<EDIT_TOKEN>",
    "name": "Maxime Test Updated",
    "title": "Backend Validation Updated",
    "bio": "Profile updated through the protected endpoint.",
    "photoUrl": "https://example.com/avatar-updated.png",
    "links": [
      { "label": "Main Site", "url": "https://example.com/home" }
    ]
  }'
```

### Check invalid edit token protection

```bash
curl -X PUT http://localhost:3000/api/profiles/<PROFILE_ID> \
  -H "Content-Type: application/json" \
  -d '{
    "editToken": "invalid-token",
    "name": "Rejected Update",
    "title": "Rejected Update",
    "bio": "Rejected Update",
    "photoUrl": "https://example.com/rejected.png",
    "links": [
      { "label": "Rejected", "url": "https://example.com/rejected" }
    ]
  }'
```

## Project Documentation

Useful project docs:

- [Project report](./doc/LinkFolio_Project_Report.md)
- [Backend worklog](./doc/backend_worklog.md)
- [Backend local test guide](./doc/backend_local_test_guide.md)

## Current Status

The backend flow has been verified locally against the real AWS DynamoDB table for:

- create profile
- read public profile
- update profile with valid token
- reject update with invalid token

## Notes

- The project uses `next@16.2.9`
- AWS SDK currently works in the local environment used for development
- A future Node.js upgrade to `>=22` is recommended for long-term AWS SDK compatibility
