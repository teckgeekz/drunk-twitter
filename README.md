<div align="center">

# 🍺 Drunk Twitter

### The Unfiltered Microblogging Platform

*A high-performance, text-only social feed — no algorithms, no vanity metrics, just raw thoughts in chronological order.*

[![Built by TeckGeekz](https://img.shields.io/badge/Built%20by-TeckGeekz.com-8B5CF6?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTV6Ii8+PHBhdGggZD0iTTIgMTdsMTAgNSAxMC01Ii8+PHBhdGggZD0iTTIgMTJsMTAgNSAxMC01Ii8+PC9zdmc+)](https://teckgeekz.com)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-6-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)

</div>

---

## 📖 Overview

**Drunk Twitter** is a production-ready, vertically scalable microblogging platform engineered to handle up to **~1 million users on a single Docker node**. Built with a philosophy of radical simplicity — no images, no comments, no likes, no reposts — just a pure, chronological stream of text posts.

Think of it as Twitter stripped down to its original DNA: raw, unfiltered, real-time thoughts.

> **Developed & Engineered by [TeckGeekz](https://teckgeekz.com)** — Full-Stack Development, System Architecture & Product Design.

---

## ✨ Features

### Core Platform
| Feature | Description |
|---|---|
| 📝 **Text-Only Posts** | Up to 650 characters per post. No media, no distractions. |
| 🔄 **Chronological Feed** | Global feed sorted by latest — zero algorithmic manipulation. |
| 🔍 **Full-Text Search** | Search across post content, author names, and @handles in real-time. |
| ⚡ **Real-Time Feel** | 10-second polling with optimistic UI updates and ID-based deduplication. |
| 🛡️ **Rate Limiting** | 5 posts per minute per user via Redis sorted sets. |

### Authentication & Identity
| Feature | Description |
|---|---|
| 🔐 **Google Sign-In** | One-click OAuth via Firebase Authentication. |
| ✉️ **Email/Password** | Full registration and login flow with validation. |
| 👻 **Anonymous Access** | Device-bound anonymous sessions with auto-generated unique usernames (e.g., `NeonFalcon4829`). |
| 🏷️ **Custom Handles** | Auto-assigned `@handle` on signup. One-time profile edit with real-time availability checking. |
| 💾 **Session Persistence** | Auth state persisted in IndexedDB — survives browser restarts. |

### Social Features
| Feature | Description |
|---|---|
| 📣 **@Mentions** | Tag users with `@handle` — mentions are highlighted in purple across the feed. |
| 🔔 **Live Notifications** | Mentioned users receive real-time notifications with unread badge counts. |
| 👤 **User Profiles** | Profile page with avatar, display name, handle, post count, and personal post history. |
| ✏️ **Compose Anywhere** | Floating compose modal accessible from any page via the sidebar. |

### Administration
| Feature | Description |
|---|---|
| 🗑️ **Super Admin Moderation** | Designated admin UID can delete any post platform-wide. |
| ✅ **Two-Click Confirm** | Delete actions require confirmation to prevent accidental removal. |
| 🔒 **Role-Based Access** | Admin status verified server-side on every request — no client-side bypasses. |

### UI/UX
| Feature | Description |
|---|---|
| 🎨 **Dark Mode Design** | Premium glassmorphism aesthetic with a curated purple/dark color palette. |
| 📱 **Responsive Layout** | Twitter-style sidebar that collapses to icons on smaller screens. |
| ✨ **Micro-Animations** | Framer Motion transitions on posts, modals, buttons, and navigation. |
| ♾️ **Infinite Scroll** | Intersection Observer-based pagination with cursor-based API. |
| 🏠 **Landing Page** | Feature showcase for unauthenticated visitors with sign-in CTA. |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                        │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Frontend    │  │   Backend    │  │   MongoDB 6   │  │
│  │  Next.js 16  │  │  Fastify     │  │               │  │
│  │  Port 3000   │──│  Cluster     │──│  Posts         │  │
│  │             │  │  Mode        │  │  Users         │  │
│  │  Standalone  │  │  Port 8080   │  │  Notifications │  │
│  └─────────────┘  └──────┬───────┘  └───────────────┘  │
│                          │                              │
│                   ┌──────┴───────┐                      │
│                   │   Redis 7    │                      │
│                   │              │                      │
│                   │  Feed Cache  │                      │
│                   │  Rate Limits │                      │
│                   │  Seed Locks  │                      │
│                   └──────────────┘                      │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Firebase Auth (External)             │   │
│  │  Google OAuth · Email/Password · Anonymous        │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Design Decisions

- **Single-Node, Vertical Scaling** — No microservices. Scales via CPU cores (Node.js cluster mode) and RAM. Designed for up to ~1M users on one machine.
- **Redis as Hot Cache** — The global feed is served from Redis (`LRANGE`), with MongoDB as the source of truth. Cache is auto-seeded on startup with distributed locking to prevent multi-worker race conditions.
- **Cursor-Based Pagination** — No offset pagination. Uses `createdAt` timestamps as cursors for consistent, performant paging.
- **Optimistic UI + Polling** — Posts appear instantly (optimistic insert) with 10-second background polling. ID-based deduplication prevents doubles.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 16 (App Router) | SSR, routing, standalone deployment |
| **Styling** | Tailwind CSS 4 | Utility-first responsive design |
| **Animations** | Framer Motion | Page transitions, micro-interactions |
| **Icons** | Lucide React | Consistent icon system |
| **Auth (Client)** | Firebase Client SDK | Google, Email, Anonymous auth flows |
| **Backend** | Fastify | High-performance HTTP framework |
| **Clustering** | Node.js Cluster | Multi-core CPU utilization |
| **Database** | MongoDB 6 | Document store for posts, users, notifications |
| **Cache** | Redis 7 | Feed cache, rate limiting, distributed locks |
| **Auth (Server)** | Firebase Admin SDK | JWT token verification |
| **Containerization** | Docker Compose | Single-command deployment |

---

## 🚀 Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-started/) & Docker Compose
- A [Firebase Project](https://console.firebase.google.com/) with Authentication enabled (Google, Email/Password, Anonymous)

### 1. Clone & Configure

```bash
git clone https://github.com/teckgeekz/drunk-twitter.git
cd drunk-twitter
cp .env.example .env
```

Edit `.env` with your Firebase credentials:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
SUPER_ADMIN_UID=your-firebase-uid

NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 2. Deploy

```bash
docker-compose up --build -d
```

### 3. Access

| Service | URL |
|---|---|
| Frontend | [http://localhost:3000](http://localhost:3000) |
| Backend API | [http://localhost:8080](http://localhost:8080) |
| Health Check | [http://localhost:8080/api/health](http://localhost:8080/api/health) |

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | No | Service health check |
| `GET` | `/api/me` | Yes | Current user info + admin status |
| `GET` | `/api/feed?cursor=` | No | Global feed (paginated) |
| `GET` | `/api/search?q=` | No | Search posts, names, handles |
| `POST` | `/api/posts` | Yes | Create a new post |
| `DELETE` | `/api/posts/:id` | Admin | Delete any post |
| `GET` | `/api/profile` | Yes | Get/create user profile |
| `PUT` | `/api/profile` | Yes | One-time profile edit |
| `GET` | `/api/handle/check?handle=` | No | Check handle availability |
| `GET` | `/api/notifications` | Yes | Get user notifications |
| `GET` | `/api/notifications/count` | Yes | Unread notification count |
| `POST` | `/api/notifications/read` | Yes | Mark all as read |

---

## 📁 Project Structure

```
drunk-twitter/
├── backend/
│   ├── app.js              # Fastify app setup, CORS, auth middleware
│   ├── auth.js             # Firebase Admin SDK token verification
│   ├── mongo.js            # MongoDB connection + index creation
│   ├── redis.js            # Redis connection
│   ├── routes.js           # All API routes (feed, posts, search, notifications, profiles)
│   ├── server.js           # Cluster mode entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   │   ├── page.tsx            # Home (feed + landing)
│   │   │   ├── explore/            # Search + browse
│   │   │   ├── notifications/      # @mention notifications
│   │   │   ├── feeds/              # Pure chronological feed
│   │   │   ├── profile/            # User profile + post history
│   │   │   ├── settings/           # App settings
│   │   │   ├── lists/              # Lists (coming soon)
│   │   │   └── saved/              # Saved posts (coming soon)
│   │   ├── components/
│   │   │   ├── Sidebar.tsx         # Twitter-style navigation + notification badge
│   │   │   ├── Feed.tsx            # Infinite scroll feed with polling
│   │   │   ├── PostItem.tsx        # Post card with @mention highlighting
│   │   │   ├── PostBox.tsx         # Inline compose box
│   │   │   ├── ComposeModal.tsx    # Floating compose modal
│   │   │   ├── SignInModal.tsx     # Multi-method auth modal
│   │   │   ├── Header.tsx          # Landing page header
│   │   │   ├── Landing.tsx         # Feature showcase
│   │   │   ├── AppLayout.tsx       # Shared sidebar + content layout
│   │   │   └── AuthProvider.tsx    # Firebase auth context
│   │   └── lib/
│   │       └── firebase.ts         # Firebase client initialization
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── .gitignore
```

---

## 🔒 Security

- **No secrets in source code** — All credentials injected via environment variables at build/runtime.
- **Server-side auth verification** — Every protected endpoint verifies Firebase JWTs via the Admin SDK.
- **Role-based admin checks** — Super Admin status is verified server-side per request. No client-side trust.
- **Rate limiting** — Redis sorted set-based sliding window (5 posts/min/user).
- **Input sanitization** — Content length validation, handle format enforcement.
- **CORS configured** — Adjustable origin policy for production deployment.

---

## 📈 Scaling Notes

| Resource | Strategy |
|---|---|
| **CPU** | Node.js cluster mode spawns one worker per core. |
| **Memory** | Redis `allkeys-lru` eviction policy. MongoDB connection pool capped at 50. |
| **Feed** | Top 1,000 posts cached in Redis. Cache auto-seeds on startup with distributed locking. |
| **Notifications** | Indexed on `(userId, createdAt)` and `(userId, read)` for fast queries. |
| **Search** | MongoDB text index on `content`, `authorName`, `authorHandle`. |

---

## 🗺️ Roadmap

- [ ] Direct Messages (DMs)
- [ ] Bookmark / Save posts
- [ ] Custom user lists
- [ ] Post analytics for authors
- [ ] Media attachments (optional toggle)
- [ ] WebSocket upgrade for true real-time
- [ ] Horizontal scaling with Redis Pub/Sub

---

<div align="center">

### Built with 🔥 by [TeckGeekz](https://teckgeekz.com)

*Full-Stack Development · System Architecture · Product Design*

**[teckgeekz.com](https://teckgeekz.com)** · Engineering products that scale.

</div>
