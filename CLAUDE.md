# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**B-Hub** — A badminton court booking and management system (thesis project at HCMUTE). Full-stack monorepo with separate `frontend/` and `backend/` directories.

## Commands

### Backend (`backend/`)
```bash
npm run dev      # Start with nodemon (Babel watch mode)
npm run build    # Compile via Babel to dist/
```

### Frontend (`frontend/`)
```bash
npm run dev      # Start Vite dev server (port 5173)
npm run build    # Type-check + Vite production build
npm run lint     # ESLint
npm run preview  # Preview production build
```

No testing infrastructure exists — `npm test` is a placeholder.

## Architecture

### Tech Stack
- **Backend:** Node.js + Express v5, Sequelize ORM (MySQL), Redis, Socket.IO v4, JWT auth
- **Frontend:** React 19 + TypeScript + Vite, Redux Toolkit + Redux-Persist, Ant Design, React Router v7, Zod + React Hook Form

### Backend Structure (`backend/src/`)

```
config/         → DB (MySQL) and Redis connections
controllers/    → Route handlers (thin, delegate to services)
services/       → Business logic layer
models/         → Sequelize models (30+ entities, auto-synced on startup)
routes/         → Express route definitions (all under /user/ namespace or direct)
middlewares/    → auth.js (JWT decode), authorize.js (RBAC), validation, upload
validations/    → Joi schemas for request validation
helpers/        → mailer.js (Nodemailer email templates), SuccessResponse.js
utils/          → jwt.js, cloudinary.js, handleVNPayURL.js, sendNotification.js
socket/         → Socket.IO event handlers
errors/         → Custom error classes (ApiError, BadRequestError, etc.)
```

**Database:** No migrations — Sequelize `sync()` runs on every startup. Timezone: `+07:00`.

**API response shape:**
```json
{ "success": boolean, "message": string, "errors": null|object, "data": null|object }
```

**Roles:** `USER` (customer), `EMPLOYEE` (staff), `ADMIN` (manager). Role-based via `authorize.js` middleware.

### Frontend Structure (`frontend/src/`)

```
pages/          → 29 page components (Auth, Booking, Shopping, Social, User)
components/     → commons/ (Header/Footer), contexts/ (AuthContext), layouts/, ui/
redux/          → slices/ per domain + store.ts; persists cart & offlineEpl to localStorage
services/       → Axios service functions per domain
configs/        → Axios instance setup
schemas/        → Zod validation schemas
routes/         → AllRoute.tsx → UserRoute.tsx (admin/employee routes currently commented out)
types/          → TypeScript interfaces
```

**State:** Redux Toolkit with Redux-Persist. Auth token interceptor in `utils/axiosCustomize.ts` handles automatic refresh. Auth context (`components/contexts/`) runs alongside Redux for auth state.

### Key Patterns

**Auth flow:** JWT access token (30 min) + refresh token (7 days). Tokens stored in localStorage. Access token sent as `Authorization: Bearer {token}`. OTP via email (5-min expiry) for registration and password reset.

**Real-time (Socket.IO):** JWT auth middleware on connection. Rooms: `user:{userId}`, `role:{role}`, `conversation:{conversationId}`. Events: `chat:join`, `disconnect`, plus booking and notification broadcasts.

**Payments:** MoMo SDK + VNPay (sandbox). Both use `.env` credentials. VNPay return URL points to `/wallet/deposit/success`.

**File uploads:** Cloudinary via Multer. Separate uploaders for avatars (`uploadAvatar.js`) and chat files (`uploadChat.js`).

**Frontend validation:** Zod schemas (`schemas/`) paired with React Hook Form. Backend validation: Joi schemas (`validations/`).

### Environment

Backend `.env` (required keys):
```
PORT, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
EMAIL_USER, EMAIL_PASS
CLOUD_NAME, API_KEY, API_SECRET
SECRET_KEY, ACCESS_KEY, PARTNER_CODE   # MoMo
VNP_TMN_CODE, VNP_HASH_SECRET, VNP_URL, VNP_RETURN_URL, VNP_IPN_URL
NODE_ENV
```

Frontend `.env`:
```
VITE_BACKEND_URL=http://localhost:8080
VITE_SOCKET_URL=http://localhost:8080
```

No Docker setup — requires local MySQL and Redis.

## Important Notes

- **Vietnamese language:** All user-facing content, email templates, and error messages are in Vietnamese.
- **Admin/Employee routes:** Backend infrastructure exists but frontend routes are commented out in `routes/UserRoute.tsx`.
- **No migration system:** Schema changes go through Sequelize `sync()`. Be careful with production DB changes.
- **Socket.IO global:** IO instance stored in a global variable — avoid patterns that depend on multiple IO instances.
