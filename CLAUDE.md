# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About

**Workita** is your AI Job Companion. It helps candidates navigate the job search and application process with intelligent, AI-powered recommendations at every stage.

## Main Features

- **Job Search** — Discover and explore job opportunities tailored to the user's profile and preferences.
- **Application Tracking** — Keep track of all job applications and their status throughout the selection process.
- **Interview Preparation** — AI-powered guidance to help candidates prepare for each stage of the interview process.

### Journeys
Each journey is designed to support users in different stages of their job search, from registration and onboarding to applying for specific roles. The app leverages AI to analyze user profiles, job descriptions, and provide personalized recommendations to enhance the user's chances of success in their job applications.
Each journey will be presented in the UI as a separate section or tab, allowing users to easily navigate between them and access the specific features and guidance they need at each stage of their job search process.
These are the main user journeys that the app supports:
**Registration / Log in**
- Users can register and log in using Google SSO, providing a seamless and secure authentication process.
**Onboarding**
**New Candidature**
**Selection process**
**Closing**
**Glossary of key terms and concepts**
**Quizzes**

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | TypeScript |
| Backend | Node.js |
| Database | PostgreSQL |
| AI Framework | Google Genkit (Google Gemini 2.5 Flash) |
| Authentication | Google SSO (OAuth 2.0) |

## Running the App

Workita runs via Docker Compose and is accessible at:

```
http://localhost:8080
```

Start the app:

```bash
docker compose up --build
```

## Authentication

Workita uses **Google SSO** for user registration and login, leveraging Google OAuth 2.0 for secure, seamless access.

## AI Integration

Workita uses the **Google Genkit** framework to integrate **Google Gemini** into the app, providing candidates with intelligent, contextual recommendations throughout their job search and application journey.
