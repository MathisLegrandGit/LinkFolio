# LinkFolio Backend Local Test Guide

## Purpose

This document explains how to run and verify the backend locally against the real AWS DynamoDB table.

## Prerequisites

Create a `.env.local` file with:

```env
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=your_aws_region
DYNAMODB_TABLE_NAME=profiles
```

The referenced DynamoDB table must already exist and use:

- table name: `profiles`
- partition key: `id`

## Start The App

Run:

```bash
npm run dev
```

The backend should then be available at:

```txt
http://localhost:3000
```

## Manual Test Flow

### 1. Create a profile

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

Expected result:

- status `201`
- response includes:
  - `profile.id`
  - `editToken`
  - public profile fields only

### 2. Read the public profile

Replace `<PROFILE_ID>` with the returned profile id:

```bash
curl http://localhost:3000/api/profiles/<PROFILE_ID>
```

Expected result:

- status `200`
- response contains the public profile
- response does not contain `editToken`

### 3. Update the profile with the edit token

Replace `<PROFILE_ID>` and `<EDIT_TOKEN>` with the values returned at creation time:

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

Expected result:

- status `200`
- response contains the updated public profile

### 4. Verify the update publicly

```bash
curl http://localhost:3000/api/profiles/<PROFILE_ID>
```

Expected result:

- status `200`
- updated values are visible in the public payload

### 5. Verify edit token protection

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

Expected result:

- status `403`
- response body:

```json
{
  "error": "Invalid edit token."
}
```

## Verified Result On 2026-06-25

The following end-to-end flow was successfully executed locally against the AWS DynamoDB table:

- create profile: `201`
- read created profile: `200`
- update profile with valid edit token: `200`
- read updated profile: `200`
- update profile with invalid edit token: `403`
