# BhangBosdha

A high-performance, text-only microblogging platform optimized for vertical scaling (CPU + RAM) up to ~1 million users on a single-node Docker-based deployment.

## Features

- **Firebase Authentication** (Google + Email/Password)
- **Text-only posts** (max 650 characters)
- **Global feed** (latest posts first)
- **Rate limiting**: 5 posts/min per user
- **Real-time feel** using smart polling (NO websockets)
- **Optimistic UI** & micro-interactions

## Tech Stack

- **Backend**: Node.js + Fastify (Cluster Mode)
- **Frontend**: Next.js (App Router) + Tailwind CSS + Framer Motion
- **Database**: MongoDB (Append-only)
- **Cache + Feed**: Redis (LRU cache, List-based timeline)
- **Auth**: Firebase JWT verification

## Getting Started

1. Set up your `.env` file based on the required variables:
```env
MONGO_URI=mongodb://mongodb:27017/bhangbhosdha
REDIS_URL=redis://redis:6379
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PUBLIC_KEY=your-public-key
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

2. Run Docker Compose:
```bash
docker-compose up --build -d
```

3. Access the app at `http://localhost:3000`

## Architecture Highlights

- **Single-node system** scaling via CPU & RAM only.
- **Node cluster** running 1 worker per CPU core.
- **Redis Global Feed**: Read directly from Redis. Mongo fallback ONLY if Redis empty.
- **Redis Sorted Set Rate Limiting**: Efficiently rate limit users without overloading the DB.
- **Graceful shutdown** & proper HTTP keep-alive.
