# Workita — Your AI Job Companion

**Workita** helps candidates navigate the job search and application process with intelligent, AI-powered recommendations at every stage.

## Features

- 🔍 **Job Search** — Discover and explore opportunities tailored to your profile and preferences.
- 📋 **Application Tracking** — Track all your applications and their status throughout the selection process.
- 🎯 **Interview Preparation** — AI-powered guidance to help you prepare for every interview stage.

## User Journeys

Each journey supports users at a different stage of their job search. The app leverages AI to analyze user profiles and job descriptions, providing personalized recommendations to maximize success.

| Journey | Description |
|---|---|
| **Registration / Log in** | Sign up and log in securely via Google SSO |
| **Onboarding** | Set up your profile, upload your CV, and define your job preferences |
| **New Candidature** | Analyze a job description and get a personalized match report |
| **Selection Process** | Get guided support through each stage of the interview process |
| **Closing** | Manage offer decisions and wrap up your application |
| **Glossary** | Access definitions of key industry and role-specific terms |
| **Quizzes** | Test and reinforce your knowledge to prepare for interviews |

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | TypeScript |
| Backend | Node.js |
| Database | PostgreSQL |
| AI Framework | Google Genkit (Google Gemini) |
| Authentication | Google SSO (OAuth 2.0) |

## Running the App

Workita runs via Docker Compose and is accessible at **http://localhost:8080**.

```bash
docker compose up --build
```
