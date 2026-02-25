# 🎤 Private Moderated Live Q&A Platform

A production-ready, Dockerized live Q&A platform. Participants submit questions anonymously via QR code; only the admin sees all questions and controls which appear on the public display.

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, TailwindCSS, Socket.io-client |
| Backend | Node.js, Express, TypeScript, TypeORM, Socket.io |
| Database | PostgreSQL 16 |
| Auth | JWT (HTTP-only cookie) + bcrypt |
| Infrastructure | Docker, Docker Compose, Nginx |

## 🚀 Quick Start

### 1. Clone & configure

```bash
cp .env.example .env
# Edit .env — at minimum change DB_PASSWORD and JWT_SECRET
```

### 2. Start everything

```bash
docker compose up --build -d
```

### 3. Run database migrations

```bash
docker compose exec backend npm run migration:run
```

### 4. Create first admin account

```bash
docker compose exec backend npm run seed:admin
# Creates: admin@example.com / Admin1234!
# Override via ADMIN_EMAIL and ADMIN_PASSWORD in .env
```

### 5. Open the app

| URL | Purpose |
|---|---|
| `http://localhost/admin/login` | Admin login |
| `http://localhost/admin/dashboard` | Admin dashboard |
| `http://localhost/e/<EVENT_CODE>` | Participant submission |
| `http://localhost/display/<EVENT_CODE>` | Public display screen |

---

## 📋 Usage Flow

1. **Admin logs in** → Creates an event → Gets an event code + QR code
2. **Participants scan** the QR → Submit a question (anonymous, no listing shown)
3. **Admin moderates** → Approve / Reject / Toggle visibility
4. **Display screen** auto-updates in real-time via Socket.io

---

## 🐳 Docker Services

| Service | Exposes | Description |
|---|---|---|
| `postgres` | Internal only | PostgreSQL 16 with persistent volume |
| `backend` | Internal `:4000` | Express API + Socket.io |
| `frontend` | Internal `:3000` | Next.js 14 |
| `nginx` | **`:80`** | Reverse proxy (entry point) |

---

## 🗄️ Database Migrations

```bash
# Run pending migrations
docker compose exec backend npm run migration:run

# Revert last migration
docker compose exec backend npm run migration:revert
```

---

## 🧪 Tests

### Unit tests (no DB required)
```bash
cd backend
npm install
npm test
```

### Load test (100 concurrent submissions)
```bash
# Requires running stack + an active event
EVENT_CODE=ABC123 npm run load-test
```

---

## 📡 API Endpoints

### Public
| Method | Path | Description |
|---|---|---|
| GET | `/api/events/:eventCode` | Get event info |
| POST | `/api/events/:eventCode/questions` | Submit question (rate limited: 10/min) |
| GET | `/api/events/:eventCode/display` | Get approved+visible questions |

### Admin (JWT required)
| Method | Path | Description |
|---|---|---|
| POST | `/api/admin/login` | Login |
| POST | `/api/admin/logout` | Logout |
| GET | `/api/admin/events` | List events |
| POST | `/api/admin/events` | Create event |
| DELETE | `/api/admin/events/:id` | Delete event |
| GET | `/api/admin/events/:id/questions` | Get questions (filter by `?status=PENDING`) |
| PATCH | `/api/admin/questions/:id/approve` | Approve |
| PATCH | `/api/admin/questions/:id/reject` | Reject |
| PATCH | `/api/admin/questions/:id/toggle-visibility` | Toggle display |
| DELETE | `/api/admin/questions/:id` | Delete |

---

## 🔒 Security

- JWT stored in **HTTP-only cookies** (XSS-safe)
- Passwords hashed with **bcrypt** (cost factor 12)
- **Rate limiting**: 10 question submissions / minute / IP; 20 login attempts / 15 min
- **CORS** restricted to frontend origin
- Input sanitised via **Zod** validation
- SQL injection prevented by **TypeORM parameterised queries**

---

## 📁 Folder Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/        # TypeORM DataSource
│   │   ├── entities/      # Admin, Event, Question
│   │   ├── migrations/    # TypeORM migrations
│   │   ├── middleware/    # auth, rateLimiter, validate
│   │   ├── dto/           # Zod schemas
│   │   ├── repositories/  # TypeORM repos
│   │   ├── services/      # AuthService, EventService, QuestionService
│   │   ├── sockets/       # Socket.io service
│   │   ├── controllers/   # authController, eventController, questionController
│   │   ├── routes/        # authRoutes, eventRoutes, questionRoutes, publicRoutes
│   │   ├── scripts/       # seedAdmin, loadTest
│   │   ├── __tests__/     # Unit tests
│   │   └── server.ts
│   └── Dockerfile
├── frontend/
│   ├── app/
│   │   ├── admin/login/           # Admin login page
│   │   ├── admin/dashboard/       # Event management
│   │   ├── admin/event/[id]/      # Question moderation
│   │   ├── e/[eventCode]/         # Participant submission
│   │   └── display/[eventCode]/   # Public display screen
│   ├── lib/                       # api.ts, socket.ts, utils.ts
│   ├── types/                     # TypeScript types
│   └── Dockerfile
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
└── .env.example
```
