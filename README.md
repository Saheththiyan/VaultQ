# VaultQ

A live Q&A platform where participants submit anonymous questions through an event link/QR code, and admins moderate what appears on the public display in real time.

Frontend, backend, and database are deployed separately (no Docker required).

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, TailwindCSS, Socket.io-client |
| Backend | Node.js, Express, TypeScript, TypeORM, Socket.io |
| Database | PostgreSQL |
| Auth | JWT (HTTP-only cookie) + bcrypt |

## ⚙️ Environment Variables

Use `.env.example` as reference, then set variables in your deployment platform(s) or local env files.

### Backend required variables

- `DATABASE_URL` (PostgreSQL connection string used by TypeORM)
- `JWT_SECRET`
- `PORT` (default `4000`)
- `NODE_ENV` (`development` or `production`)
- `FRONTEND_URL` (exact frontend origin for CORS/cookies)

Optional for admin seeding/load test:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `EVENT_CODE`

### Frontend required variables

- `NEXT_PUBLIC_API_URL` (backend base URL, e.g. `https://api.yourdomain.com`)
- `NEXT_PUBLIC_SOCKET_URL` (Socket.io backend URL, usually same as API host)

## 🚀 Local Development (No Docker)

### 1) Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2) Configure environment

Set backend and frontend variables (for example via your shell, secrets manager, or local env files).

### 3) Run database migrations

```bash
cd backend
npm run migration:run
```

### 4) Seed first admin (optional)

```bash
cd backend
npm run seed:admin
```

### 5) Start services

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

### 6) Open the app

| URL | Purpose |
|---|---|
| `http://localhost:3000/admin/login` | Admin login |
| `http://localhost:3000/admin/signup` | Admin signup |
| `http://localhost:3000/admin/dashboard` | Admin dashboard |
| `http://localhost:3000/e/<EVENT_CODE>` | Participant submission page |
| `http://localhost:3000/display/<EVENT_CODE>` | Public display screen |

Backend health check:

- `http://localhost:4000/health`

## 🌐 Deployment Model

Deploy each layer independently:

1. **Database**: PostgreSQL instance (managed or self-hosted)
2. **Backend**: Node.js service exposing REST + Socket.io
3. **Frontend**: Next.js app (set `NEXT_PUBLIC_*` to backend URL)

Recommended production notes:

- Use HTTPS for frontend + backend
- Set `FRONTEND_URL` to the exact frontend domain
- Keep `NODE_ENV=production` so secure cookie behavior is applied

## 📋 Usage Flow

1. Admin logs in/signs up and creates an event
2. Participants open event link/QR and submit anonymous questions
3. Admin approves/rejects/marks answered
4. Display updates live through Socket.io

## 🗄️ Database Migrations

```bash
# Run pending migrations
cd backend
npm run migration:run

# Revert last migration
npm run migration:revert
```

## 🧪 Tests & Scripts

### Backend tests

```bash
cd backend
npm test
```

### Load test (requires active event)

```bash
cd backend
EVENT_CODE=ABC123 npm run load-test
```

### Useful backend scripts

- `npm run dev` — run backend in watch mode
- `npm run build` — compile TypeScript
- `npm run start` — run compiled backend
- `npm run migration:run` — apply DB migrations
- `npm run migration:revert` — revert latest migration
- `npm run seed:admin` — create admin user

### Useful frontend scripts

- `npm run dev` — run Next.js in dev mode
- `npm run build` — build frontend
- `npm run start` — run production build
- `npm run lint` — run linting

## 📡 API Endpoints

### Public

| Method | Path | Description |
|---|---|---|
| GET | `/api/events/:eventCode` | Get event info |
| POST | `/api/events/:eventCode/questions` | Submit question (rate limited) |
| GET | `/api/events/:eventCode/display` | Get approved questions for display |

### Admin auth

| Method | Path | Description |
|---|---|---|
| POST | `/api/admin/signup` | Signup |
| POST | `/api/admin/login` | Login |
| POST | `/api/admin/logout` | Logout |
| GET | `/api/admin/me` | Current admin info |

### Admin events/questions (JWT required)

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/events` | List events |
| POST | `/api/admin/events` | Create event |
| DELETE | `/api/admin/events/:id` | Delete event |
| GET | `/api/admin/events/:id/questions` | List event questions (`?status=PENDING`) |
| PATCH | `/api/admin/questions/:id/approve` | Approve question |
| PATCH | `/api/admin/questions/:id/reject` | Reject question |
| PATCH | `/api/admin/questions/:id/mark-answered` | Mark approved question as answered |
| DELETE | `/api/admin/questions/:id` | Delete question |

## 🔒 Security

- JWT in HTTP-only cookie
- Password hashing with bcrypt
- Rate limiting on login/question submissions
- CORS restricted by `FRONTEND_URL`
- Request validation with Zod

## 📁 Folder Structure

```text
.
├── backend/
│   ├── src/
│   │   ├── __tests__/      # Unit tests
│   │   ├── config/         # DB datasource config
│   │   ├── controllers/    # Route handlers
│   │   ├── dto/            # Validation schemas
│   │   ├── entities/       # Admin, Event, Question entities
│   │   ├── middleware/     # Auth, validation, rate limiting
│   │   ├── migrations/     # TypeORM migrations
│   │   ├── repositories/   # Repository exports
│   │   ├── routes/         # API route modules
│   │   ├── scripts/        # seedAdmin, loadTest
│   │   ├── services/       # Business logic
│   │   ├── sockets/        # Socket.io service
│   │   └── server.ts
│   └── package.json
├── frontend/
│   ├── app/                # Next.js app routes
│   ├── components/         # Shared/admin/ui components
│   ├── hooks/              # Custom hooks
│   ├── lib/                # API/socket helpers
│   ├── public/             # Static assets
│   ├── types/              # Frontend TS types
│   └── package.json
├── .env.example
└── README.md
```
