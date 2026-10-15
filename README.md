# Secure Note-Taking & Posts REST API

> 🌐 **Live API Deployment**: [https://securenote-takingapplicationbeckend.vercel.app/](https://securenote-takingapplicationbeckend.vercel.app/)
> 🔗 **API Base URL**: `https://securenote-takingapplicationbeckend.vercel.app/api/v1`

A production-grade, secure REST API built with **Node.js**, **Express.js**, **TypeScript**, and **MongoDB (Mongoose)** using a strict **Feature-Based Modular Architecture**. The application provides role-based access control (RBAC), operational error handling, comprehensive request validation with Zod, high-performance database indexing, and advanced MongoDB aggregation pipelines.

---

## 🏛️ Architecture Overview

The codebase is organized using a **Feature-Based Modular Architecture** located in `src/module/`. Each feature encapsulates its own interface, Mongoose schema, validation, service layer, controller, and routes:

```
backend/
├── src/
│   ├── config/              # Validated environment configuration & database connection
│   │   ├── env.config.ts    # Zod-validated environment variables
│   │   ├── db.ts            # Mongoose connection with serverless connection pooling
│   │   └── index.ts         # Central config exporter
│   ├── middlewares/         # Global application middlewares
│   │   ├── auth.middleware.ts       # JWT authentication & RBAC authorization ('USER' | 'ADMIN')
│   │   ├── error.middleware.ts      # Global centralized error handler & 404 handler
│   │   └── validate.middleware.ts   # Zod request validation middleware
│   ├── module/              # Domain modules (Feature-based)
│   │   ├── auth/            # Authentication (register, login, me)
│   │   │   ├── auth.interface.ts
│   │   │   ├── auth.validation.ts
│   │   │   ├── auth.services.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.routes.ts
│   │   ├── user/            # User management & Aggregation Scenario 1
│   │   │   ├── user.interface.ts
│   │   │   ├── user.model.ts
│   │   │   ├── user.validation.ts
│   │   │   ├── user.services.ts
│   │   │   ├── user.controller.ts
│   │   │   └── user.routes.ts
│   │   ├── note/            # Note management & compound indexing
│   │   │   ├── note.interface.ts
│   │   │   ├── note.model.ts
│   │   │   ├── note.validation.ts
│   │   │   ├── note.services.ts
│   │   │   ├── note.controller.ts
│   │   │   └── note.routes.ts
│   │   └── post/            # Public posts & Aggregation Scenario 2 ($lookup)
│   │       ├── post.interface.ts
│   │       ├── post.model.ts
│   │       ├── post.validation.ts
│   │       ├── post.services.ts
│   │       ├── post.controller.ts
│   │       └── post.routes.ts
│   ├── routes/              # Central routing registry
│   │   └── routes.ts        # Mounts /auth, /users, /notes, /posts
│   ├── utils/               # Shared utilities
│   │   ├── AppError.ts      # Operational error class
│   │   ├── catchAsync.ts    # Higher-order async handler wrapper
│   │   └── pagination.ts    # Standardized pagination helper & metadata formatter
│   ├── app.ts               # Express application setup & middleware pipeline
│   ├── server.ts            # Server entrypoint with graceful shutdown
│   └── seed.ts              # Idempotent database seeding script
├── .env.example             # Template environment variables
├── package.json             # Scripts & dependencies
├── tsconfig.json            # Strict TypeScript configuration
└── vercel.json              # Serverless deployment configuration
```

---

## ⚡ Database Indexing Strategy (`schema.index`) — Critical Evaluation

To guarantee optimal query performance and prevent unindexed collection scans, **no inline `index: true` or `unique: true` attributes exist inside field definitions**. All indexes are explicitly defined at the bottom of each model file using `schema.index(...)`.

### Indexing Summary Table

| Model                      | Index Definition                                   | Index Type                     | Query / Pipeline Optimized                                                | Rationale & Performance Impact                                                                                                                            |
| -------------------------- | -------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User** (`user.model.ts`) | `userSchema.index({ email: 1 }, { unique: true })` | Single-field Unique Index      | `POST /api/v1/auth/login`<br>`POST /api/v1/auth/register`                 | Provides $O(\log N)$ unique email lookups during login and enforces database-level uniqueness during registration.                                        |
| **User** (`user.model.ts`) | `userSchema.index({ createdAt: -1 })`              | Single-field Descending Index  | `GET /api/v1/users?page=1&limit=10`                                       | Supports Admin paginated user queries sorted by newest registration date, avoiding memory-intensive sort operations (`SORT_KEY_GENERATOR`).               |
| **User** (`user.model.ts`) | `userSchema.index({ interests: 1 })`               | Multikey Index                 | **Scenario 1 Aggregation**<br>`GET /api/v1/users/group-by-interests`      | Indexes array elements to optimize the Stage 1 `$match: { "interests.0": { $exists: true } }` filter before `$unwind` and grouping.                       |
| **Note** (`note.model.ts`) | `noteSchema.index({ userId: 1, createdAt: -1 })`   | Compound Index                 | `GET /api/v1/notes/my-notes`                                              | Follows the **ESR (Equality, Sort, Range)** rule: Equality on `userId` + Sort on `createdAt: -1`. Enables index-covered sorting for user note pagination. |
| **Note** (`note.model.ts`) | `noteSchema.index({ createdAt: -1 })`              | Single-field Descending Index  | `GET /api/v1/notes/all` (Admin)                                           | Allows Admin to view all notes across the entire platform sorted newest first without in-memory sorting.                                                  |
| **Post** (`post.model.ts`) | `postSchema.index({ userId: 1 })`                  | Single-field Foreign Key Index | **Scenario 2 Aggregation**<br>`GET /api/v1/posts/user/:userId`            | Crucial for the `$lookup` stage. MongoDB uses this index on the foreign collection (`posts.userId`) to join posts to a user in $O(\log N)$ time.          |
| **Post** (`post.model.ts`) | `postSchema.index({ createdAt: -1 })`              | Single-field Descending Index  | `GET /api/v1/posts`                                                       | Optimizes public post feed pagination sorted chronologically (newest first).                                                                              |
| **All Models**             | `_id_` (Default primary key)                       | Primary Index                  | `GET /auth/me`, `GET /notes/:id`, `PATCH /notes/:id`, `DELETE /notes/:id` | B-tree index on `_id` naturally powers point queries and Stage 1 `$match: { _id: ObjectId }` in Scenario 2.                                               |

---

## 📊 MongoDB Aggregation Pipelines

### Scenario 1: Group Users by Interests

- **Endpoint**: `GET /api/v1/users/group-by-interests`
- **Access**: Authenticated (`USER` or `ADMIN`)
- **Implementation**: Executed in **exactly one** `User.aggregate()` query:
  1. **`$match`**: `{ "interests.0": { $exists: true } }` — Filters users having at least one interest (utilizes `{ interests: 1 }` multikey index).
  2. **`$unwind`**: `"$interests"` — Deconstructs array of interests into individual documents.
  3. **`$group`**: Groups by interest, calculates total count with `{ $sum: 1 }`, and projects user details (`_id`, `name`, `email`, `role`) using `{ $push: ... }`.
  4. **`$project`**: Remaps `_id` to `interest` for clean JSON representation.
  5. **`$sort`**: `{ count: -1, interest: 1 }` — Sorts primarily by highest popularity, then alphabetically by interest name.

### Scenario 2: Retrieve User & Posts via `$lookup`

- **Endpoints**: `GET /api/v1/posts/user/:userId` and `GET /api/v1/users/:userId/posts`
- **Access**: Public
- **Implementation**: Executed in a single `User.aggregate()` pipeline:
  1. **Validation**: Pre-validates `mongoose.Types.ObjectId.isValid(userId)` (returns `400 Bad Request` if malformed).
  2. **`$match`**: `{ _id: new Types.ObjectId(userId) }` — Matches the exact user document using the default `_id_` primary index.
  3. **`$lookup`**: Joins from `posts` where `localField: "_id"` matches `foreignField: "userId"` (optimized by `{ userId: 1 }` on `Post`), including a sub-pipeline `[{ $sort: { createdAt: -1 } }]` to order posts newest first.
  4. **`$project`**: Excludes sensitive password hash (`password: 0`).
  5. Returns `404 User not found` if the user does not exist.

---

## 🚀 API Endpoints Reference

- **Local Base URL**: `http://localhost:5000/api/v1`
- **Live Production Base URL**: `https://securenote-takingapplicationbeckend.vercel.app/api/v1`
- **Health Check**: `GET https://securenote-takingapplicationbeckend.vercel.app/`

### 1. Authentication Module (`/auth`)

| Method | Endpoint                | Access Role   | Description                                             |
| ------ | ----------------------- | ------------- | ------------------------------------------------------- |
| `POST` | `/api/v1/auth/register` | Public        | Register new user with name, email, password, interests |
| `POST` | `/api/v1/auth/login`    | Public        | Authenticate user & receive signed JWT token            |
| `GET`  | `/api/v1/auth/me`       | Authenticated | Retrieve current authenticated user's profile           |

### 2. User Module (`/users`)

| Method   | Endpoint                           | Access Role   | Description                                                  |
| -------- | ---------------------------------- | ------------- | ------------------------------------------------------------ |
| `GET`    | `/api/v1/users/group-by-interests` | Authenticated | **Scenario 1 Aggregation**: Users grouped by interests       |
| `GET`    | `/api/v1/users/:userId/posts`      | Public        | **Scenario 2 Aggregation**: User & their posts via `$lookup` |
| `GET`    | `/api/v1/users`                    | `ADMIN` only  | Paginated user list (`?page=1&limit=10`) sorted by newest    |
| `POST`   | `/api/v1/users`                    | `ADMIN` only  | Create a new user (with bcrypt hashed password)              |
| `GET`    | `/api/v1/users/:id`                | `ADMIN` only  | Fetch single user details by ID                              |
| `PATCH`  | `/api/v1/users/:id`                | `ADMIN` only  | Update user details (hashes password if changed)             |
| `DELETE` | `/api/v1/users/:id`                | `ADMIN` only  | Delete user (cascades deletion of user's notes & posts)      |

### 3. Note Module (`/notes`)

| Method   | Endpoint                 | Access Role     | Description                                                   |
| -------- | ------------------------ | --------------- | ------------------------------------------------------------- |
| `GET`    | `/api/v1/notes/my-notes` | Authenticated   | Paginated list of logged-in user's notes (`?page=1&limit=10`) |
| `GET`    | `/api/v1/notes/all`      | `ADMIN` only    | Paginated list of all notes across users                      |
| `POST`   | `/api/v1/notes`          | Authenticated   | Create a new private note                                     |
| `GET`    | `/api/v1/notes/:id`      | Owner / `ADMIN` | Retrieve single note by ID                                    |
| `PATCH`  | `/api/v1/notes/:id`      | Owner / `ADMIN` | Update note content or title                                  |
| `DELETE` | `/api/v1/notes/:id`      | Owner / `ADMIN` | Delete a note                                                 |

### 4. Post Module (`/posts`)

| Method | Endpoint                     | Access Role   | Description                                                  |
| ------ | ---------------------------- | ------------- | ------------------------------------------------------------ |
| `GET`  | `/api/v1/posts`              | Public        | Paginated public feed of all posts (`?page=1&limit=10`)      |
| `GET`  | `/api/v1/posts/user/:userId` | Public        | **Scenario 2 Aggregation**: User & their posts via `$lookup` |
| `POST` | `/api/v1/posts`              | Authenticated | Create a public post                                         |

---

## 🛠️ Local Setup & Getting Started

### Prerequisites

- Node.js (v18+ or v20+ recommended)
- pnpm (`npm install -g pnpm`)
- MongoDB Atlas or local MongoDB instance

### 1. Installation

Clone the repository and install dependencies:

```bash
cd backend
pnpm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Ensure your `.env` contains valid values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/note_tracker?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=admin123
SEED_DEFAULT_PASSWORD=password123
```

### 3. Database Seeding

Populate the database with pre-configured Admin, Sample Users, Notes, and Posts:

```bash
pnpm seed
```

#### Seeded Test Accounts

| Role      | Email                 | Password      | Pre-seeded Content                                                   |
| --------- | --------------------- | ------------- | -------------------------------------------------------------------- |
| **ADMIN** | `admin@example.com`   | `admin123`    | Full administrative privileges across all routes                     |
| **USER**  | `alice@example.com`   | `password123` | Interests: `['coding', 'typescript', 'react']`, Sample Notes & Posts |
| **USER**  | `bob@example.com`     | `password123` | Interests: `['coding', 'mongodb', 'gaming']`, Sample Notes & Posts   |
| **USER**  | `charlie@example.com` | `password123` | Interests: `['design', 'music', 'gaming']`                           |

### 4. Running the Application

- **Development Mode** (with automatic hot-reload):
  ```bash
  pnpm dev
  ```
- **Production Build**:
  ```bash
  pnpm build
  ```
- **Production Start**:
  ```bash
  pnpm start
  ```

---

## 🌐 Deployment Configuration

### Deploying to Render (Persistent Node Server)

1. Set the **Build Command** to:
   ```bash
   pnpm install && pnpm build
   ```
2. Set the **Start Command** to:
   ```bash
   pnpm start
   ```
3. Set the required environment variables in the Render Dashboard (`MONGO_URI`, `JWT_SECRET`, etc.).

### Deploying to Vercel (Serverless Function)

The repository includes a ready-to-use [`vercel.json`](file:///d:/Projects/Job%20Task/Care%20Guide%202/backend/vercel.json):

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/server.js"
    }
  ]
}
```

`src/app.ts` includes a database connection pooling middleware that re-uses connections across serverless invocations and avoids cold-start connection timeouts.
