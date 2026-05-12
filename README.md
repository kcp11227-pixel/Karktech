# Facebook Page Post Scheduler

A comprehensive full-stack application to manage and schedule posts to Facebook Pages using the Meta Graph API.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, React Router, Axios
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database & Queue**: PostgreSQL, Redis, BullMQ
- **Deployment**: Docker Compose

## Prerequisites
- Docker and Docker Compose installed.
- A Facebook Developer App with `pages_show_list`, `pages_read_engagement`, `pages_manage_posts` permissions.
- Get your `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET`.

## Setup Instructions

1. Configure Environment Variables
Navigate to `backend` directory and create `.env` based on `.env.example`:
```bash
cd backend
cp .env.example .env
```
Update your Facebook App credentials in the `.env` file.

2. Run with Docker Compose
From the root folder (`facebook-post-scheduler`), start the entire stack:
```bash
docker-compose up -d --build
```
This will start PostgreSQL (5432), Redis (6379), Backend (3000), and Frontend (80).

3. Setup Database Schema
Once the containers are running, run the Prisma migration:
```bash
docker-compose exec backend npx prisma migrate deploy
```

4. Access the App
Open your browser and navigate to `http://localhost`.

## Development (Local without Docker)
1. Start local Postgres and Redis.
2. In `backend/`: `npm install`, setup `.env`, `npx prisma db push`, `npm run dev`.
3. In `frontend/`: `npm install`, `npm run dev`.
