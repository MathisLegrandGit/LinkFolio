**LinkFolio**

*A full-stack profile hosting platform built on AWS and Vercel*

**Project Report**

Prepared for: the AWS Databases and Vercel Hackathon, and as supporting evidence for the final practical credit at Epitech

**Team**

Mathis Legrand

Maxime Grégoire

June 2026

# Table of Contents

- 1. Executive Summary
- 2. Context and Objectives
- 3. Problem Statement and Target Users
- 4. Product Description and Core Features
- 5. System Architecture
- 6. Data Model
- 7. Security and Access Model
- 8. Technology Stack
- 9. Division of Responsibilities
- 10. Implementation Roadmap
- 11. Use of AI-Assisted Development Tools
- 12. Deliverables and Proof of Work
- 13. Skills and Learning Outcomes Demonstrated
- 14. Conclusion
- Appendix A: Environment Variables Reference
- Appendix B: Reference Links

# 1. Executive Summary

This document describes the design, architecture, and implementation plan for LinkFolio, a full-stack web application built by Mathis Legrand and \[Teammate Name\]. The project was developed for the AWS Databases and Vercel Hackathon, and this report is also intended as supporting documentation of our work for the final practical credit requirement at Epitech.

LinkFolio is a lightweight profile hosting platform. Any user can create a public, shareable page containing a short bio, a profile photo, and a curated list of links, in the spirit of existing link-in-bio tools, but built from scratch on our own infrastructure rather than a third-party SaaS product. The project required us to provision and connect a managed cloud database on AWS, design a serverless backend, build a responsive frontend with Next.js, and deploy the result to live production infrastructure on Vercel.

The sections below walk through the problem we chose to solve, the architecture we settled on, the reasoning behind each technical decision, how the work was split between the two of us, and the exact sequence of steps required to take the project from an empty repository to a deployed, working product.

# 2. Context and Objectives

## 2.1 Hackathon Context

The AWS Databases and Vercel Hackathon asks participants to build a full-stack application that connects a Vercel-hosted frontend to one of three AWS managed databases: Amazon Aurora PostgreSQL, Aurora DSQL, or Amazon DynamoDB. The stated goal of the challenge is to show that a project prototyped quickly can still run on database infrastructure that holds up under real production traffic, rather than treating the database as an afterthought.

Submissions can be made under one of four tracks. We chose Track 1, Monetizable B2C App, because a profile hosting tool aimed at freelancers and small creators is a natural consumer product, has a clear and easy to explain use case, and keeps the technical scope realistic given our timeline.

## 2.2 School Credit Context

This project also serves as the practical deliverable for our final outstanding credit at Epitech. The credit requires demonstrating a complete software build process: defining a problem, designing an architecture, implementing it end to end, and deploying a working result. This report documents that process in full, including the reasoning behind each technical decision, so it can be reviewed independently of the hackathon submission itself.

## 2.3 Objectives

- Design and implement a complete full-stack application, from data model to deployed user interface.
- Correctly provision and connect to a managed AWS database from a serverless Vercel backend.
- Practice a realistic two-person engineering workflow, with clearly divided responsibilities.
- Use AI-assisted development tools responsibly and transparently to accelerate implementation, while retaining full ownership of architectural decisions, code review, and testing.
- Produce a working, demonstrable product, independent of whether the team chooses to submit the project for hackathon judging.

# 3. Problem Statement and Target Users

Freelancers, independent creators, and small business owners frequently need a single, simple link to share across social media bios, email signatures, and business cards. Existing link-in-bio products solve this, but they are closed, third-party SaaS platforms: the user does not own the infrastructure, the data, or the customization beyond what the SaaS provider allows.

LinkFolio addresses the same need with a small, self-built alternative. A user fills in a short form (name, title, bio, photo, and a list of links) and receives a permanent, shareable URL for their public profile. The target audience for this specific build is solo freelancers and very small businesses who want a fast, no-friction way to put a professional presence online without setting up a full website.

# 4. Product Description and Core Features

## 4.1 Core User Flow

1.  A new user visits the homepage and fills out a creation form: display name, title or tagline, short bio, photo URL, and a list of links (label and URL pairs).
2.  On submission, the backend generates a unique profile ID and a separate, private edit token, then stores the profile in the database.
3.  The user is redirected to their new public profile page, and is shown their private edit link, which they should save.
4.  Anyone with the public URL can view the profile. Only someone with the edit link (containing the edit token) can modify it.

## 4.2 Feature List

- Public, permanent profile pages at a clean, shareable URL.
- Simple creation form with no account or password required.
- Token-based private edit links, instead of a full authentication system.
- Responsive layout that works cleanly on both desktop and mobile, since most link-in-bio traffic comes from phones.
- Minimal, clean visual design so any user's content looks presentable by default.

# 5. System Architecture

LinkFolio follows a standard modern serverless architecture. There is no traditional always-on backend server: the frontend, the API logic, and the database are three separate, independently managed pieces that communicate over HTTP and the AWS SDK.

![LinkFolio system architecture diagram](media/image1.png)

## 5.1 Components

| **Component** | **Technology**                                                              | **Responsibility**                                                                                       |
|---------------|-----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| Frontend      | Next.js (App Router), React                                                 | Renders the creation form and the public profile pages; runs in the user's browser.                      |
| Backend       | Next.js API routes / Server Actions, running as Vercel serverless functions | Validates input, generates IDs and edit tokens, reads and writes profile data in the database.           |
| Database      | Amazon DynamoDB (on-demand capacity)                                        | Persists profile data permanently, independent of any single request or server instance.                 |
| Hosting       | Vercel                                                                      | Builds, hosts, and serves both the frontend and the backend functions; required by the hackathon rules.  |
| Dev tooling   | Claude Code, AWS SDK for JavaScript v3                                      | Used to scaffold and wire components together; see Section 11 for details on how AI assistance was used. |

## 5.2 Request Flow

Creating a profile: the browser submits the form to a Vercel API route, which writes a new item to DynamoDB and returns the new profile ID and edit token to the browser.

Viewing a profile: the browser requests the public URL, the corresponding Vercel function reads the matching item from DynamoDB by its ID, and the page is rendered with that data.

# 6. Data Model

The application uses a single DynamoDB table, since DynamoDB is a NoSQL, single-table-friendly database and the data here has no need for relational joins.

| **Attribute** | **Type**               | **Description**                                                                       |
|---------------|------------------------|---------------------------------------------------------------------------------------|
| id            | String (Partition Key) | Unique, randomly generated identifier for the profile; also used in the public URL.   |
| editToken     | String                 | Unique, randomly generated secret; required as a query parameter to edit the profile. |
| name          | String                 | Display name shown on the public profile.                                             |
| title         | String                 | Short tagline or role, shown under the name.                                          |
| bio           | String                 | Short free-text biography.                                                            |
| photoUrl      | String                 | URL of the profile photo to display.                                                  |
| links         | List                   | Ordered list of label and URL pairs shown as buttons on the profile.                  |
| createdAt     | String (ISO timestamp) | Creation date, used for internal record-keeping and sorting if needed later.          |

Table name: profiles. Capacity mode: on-demand, chosen so the table requires no manual throughput tuning and scales automatically with traffic, which suits a project with an unpredictable, low, hackathon-scale load.

# 7. Security and Access Model

LinkFolio deliberately does not implement full user accounts. Building a secure authentication system (signup, login, password resets, session handling) is a significant amount of additional work that is out of proportion with the scope of this project and is not required by the hackathon brief.

Instead, editing is protected by a private, unguessable edit token generated at creation time and known only to the profile's creator. This is a reasonable security and effort trade-off for a project at this scale: it prevents casual tampering by strangers, while avoiding the overhead of a full account system. It is explicitly not intended as production-grade security for a multi-tenant commercial product, and this report states that trade-off openly rather than overstating what was built.

# 8. Technology Stack

| **Layer**              | **Tool / Library**                               | **Purpose**                                                                       |
|------------------------|--------------------------------------------------|-----------------------------------------------------------------------------------|
| Frontend framework     | Next.js 14, React                                | Page rendering, routing, and form handling.                                       |
| Styling                | Tailwind CSS                                     | Fast, consistent styling without writing custom CSS files.                        |
| Backend logic          | Next.js API routes (Vercel serverless functions) | Handles create and read requests for profile data.                                |
| Database               | Amazon DynamoDB                                  | Persistent storage for profile records, required AWS Database for this hackathon. |
| Database SDK           | @aws-sdk/client-dynamodb, @aws-sdk/lib-dynamodb  | Official AWS SDK clients used to read and write to DynamoDB from the backend.     |
| Hosting and deployment | Vercel                                           | Builds and serves the application; required deployment target for the hackathon.  |
| Version control        | Git and GitHub                                   | Source control and collaboration between the two of us.                           |

# 9. Division of Responsibilities

The work was split so each of us owns a clear vertical slice of the stack, while both of us review and test the full application together before deployment.

| **Owner**         | **Area**                                   | **Responsibilities**                                                                                                                                                               |
|-------------------|--------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Mathis Legrand    | AWS infrastructure and backend integration | AWS account setup, DynamoDB table provisioning, IAM credentials, writing and testing the API routes that read and write to DynamoDB, environment variable configuration on Vercel. |
| \[Teammate Name\] | Frontend and product design                | Building the creation form and public profile page in Next.js, styling with Tailwind, responsive layout, and the overall visual presentation.                                      |
| Shared            | Architecture, testing, documentation       | Agreeing on the data model and request flow before implementation, end-to-end testing of the deployed application, writing this report and preparing proof-of-work artifacts.      |

# 10. Implementation Roadmap

The following sequence is the order in which the project is actually built, so both of us are working from the same plan and not blocking each other unnecessarily.

## Phase 1, Infrastructure Setup

1.  Create the AWS account and confirm the free tier credit is active.
2.  Create the DynamoDB table (name: profiles, partition key: id, capacity mode: on-demand).
3.  Create a scoped IAM user with programmatic access and generate an access key and secret key for use by the backend.

## Phase 2, Application Scaffold

4.  Initialize the Next.js project and push the empty repository to GitHub.
5.  Build the creation form page and the dynamic public profile page (\[id\] route).

## Phase 3, Backend and Database Integration

6.  Write the API route that creates a profile: generate id and editToken, write the item to DynamoDB.
7.  Write the API route that reads a profile by id for the public page.
8.  Write the API route that updates a profile, gated by a matching editToken.

## Phase 4, Styling and Polish

9.  Apply Tailwind styling to both the form and the public profile layout.
10. Test on mobile screen sizes, since most link-in-bio traffic is mobile.

## Phase 5, Deployment

11. Connect the GitHub repository to a new Vercel project.
12. Set the AWS credentials, region, and table name as environment variables in the Vercel project settings.
13. Deploy and confirm the live URL works for both creating and viewing a profile.

## Phase 6, Verification and Documentation

14. Test the full flow end to end on the live deployment: create a profile, copy the edit link, edit it, and confirm changes are reflected publicly.
15. Capture a screenshot of the DynamoDB console showing a stored item, as required proof of AWS Database usage.
16. Finalize this report and, if the team decides to submit to the hackathon, prepare the short demo video and submission form.

# 11. Use of AI-Assisted Development Tools

We used Claude Code throughout the implementation phase to speed up writing boilerplate and integration code, such as the Next.js project structure, the AWS SDK calls inside the API routes, and repetitive form and layout markup. This is consistent with how AI-assisted coding tools are used across the industry today, and the hackathon's own rules explicitly permit it.

AI assistance does not replace engineering decisions. The two of us defined the data model, the request flow, the security trade-off described in Section 7, and the division of responsibilities ourselves, before any code was written. Every piece of generated code was reviewed, tested, and adjusted by us before being considered part of the final application. We are documenting this openly here so the report accurately reflects how the project was actually built.

# 12. Deliverables and Proof of Work

| **Deliverable**                 | **Location / Status**                                                                                                     |
|---------------------------------|---------------------------------------------------------------------------------------------------------------------------|
| Source code repository          | [https://github.com/MathisLegrandGit/linkfolio/tree/main](https://github.com/MathisLegrandGit/linkfolio/tree/main) |
| Live deployment                 | \[Vercel deployment URL\]                                                                                                 |
| DynamoDB proof screenshot       | \[Attach screenshot of AWS console showing a stored profile item\]                                                        |
| Architecture diagram            | Included in Section 5 of this report                                                                                      |
| This project report             | Sent to teammate for review, and to the school as supporting documentation                                                |
| Hackathon demo video (optional) | \[Only required if submitting to the hackathon leaderboard\]                                                              |

# 13. Skills and Learning Outcomes Demonstrated

- Provisioning and configuring a managed cloud database (Amazon DynamoDB) and the IAM credentials needed to access it securely.
- Designing a serverless backend using Next.js API routes deployed as Vercel functions.
- Building a complete frontend, from form handling to dynamic, data-driven pages.
- Making and documenting a deliberate security trade-off appropriate to a project's actual scope, rather than over-engineering or under-engineering it.
- Working as a two-person team with clearly divided ownership, while still collaborating on architecture and testing.
- Using AI-assisted development tools as a productivity multiplier while retaining responsibility for design decisions, review, and testing.
- Taking a project from an empty repository to a deployed, publicly accessible product.

# 14. Conclusion

LinkFolio is a small project in scope, but it touches every layer of a modern full-stack application: a managed cloud database, a serverless backend, a deployed frontend, and the operational details (credentials, environment variables, capacity modes) that connect them. It satisfies the technical requirements of the AWS Databases and Vercel Hackathon under Track 1, and it stands on its own as a complete, working demonstration of our ability to plan, build, and ship a project together.

# Appendix A: Environment Variables Reference

| **Variable**          | **Purpose**                                                    |
|-----------------------|----------------------------------------------------------------|
| AWS_ACCESS_KEY_ID     | IAM access key used by the backend to authenticate with AWS.   |
| AWS_SECRET_ACCESS_KEY | IAM secret key, paired with the access key above.              |
| AWS_REGION            | AWS region where the DynamoDB table was created.               |
| DYNAMODB_TABLE_NAME   | Name of the DynamoDB table storing profile records (profiles). |

# Appendix B: Reference Links

- Hackathon submission page: \[insert link\]
- GitHub repository: [https://github.com/MathisLegrandGit/linkfolio/tree/main](https://github.com/MathisLegrandGit/linkfolio/tree/main)
- Live Vercel deployment: \[insert link\]
