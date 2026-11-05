# WorkNest

A **hierarchical employee management system** with role-based and hierarchy-based access control, built with the MERN stack. Every person sees and manages only what their position in the company allows, and each company's data is fully isolated from every other company.

**Live demo:** https://worknest-sooty.vercel.app

> The backend runs on a free plan and goes to sleep when idle, so the first load after a quiet period can take up to a minute. The app shows a "waking the server up" message while it starts, and is fast again afterwards. Accounts are created by an administrator, so there is no public sign-up. To explore every role, run the project locally with the sample data (see below).

## Hierarchy

```text
Platform Owner  (belongs to no company)
      |
      +-- Company
             +-- Company Head
                    +-- Department Head
                           +-- Team Manager
                                  +-- Employee
```

## Roles and access

| Role | Can see | Can create |
|---|---|---|
| `PLATFORM_OWNER` | Company list only. No employee data. | Companies and their Company Heads |
| `COMPANY_HEAD` | Entire own company | Dept Heads, Team Managers, Employees, departments, teams |
| `DEPT_HEAD` | Own department, its teams and people | Team Managers and Employees in own department, teams |
| `TEAM_MANAGER` | Own team and its people | Employees in own team |
| `EMPLOYEE` | Own profile only | Nobody |

## Features

- **No public sign-up.** Every account is created by someone above that person.
- **Server-made usernames:** first name + employee ID (for example `Rahul123`).
- **Temporary passwords** from a built-in generator (secure randomness, adjustable length and character groups), shown once, with a **forced password change** on first login.
- **Password reset:** managers can reset the password of anyone below them, and the Platform Owner can reset a Company Head's. The person must choose a new password at their next login.
- **Self-service profile:** employees edit their own contact information and password. Everything else is locked.
- **Search, filters and paging** that always respect the viewer's scope, plus direct profile lookups that return "not found" outside it.
- **A different menu and dashboard for each role.**
- **Multi-company support** with full data isolation, and the ability to deactivate a whole company.
- **Security basics:** JWT in HTTP-only cookies, bcrypt hashing, rate-limited login, helmet headers.
- **Polish:** responsive layout with a mobile menu, session-expiry handling, a friendly cold-start screen, and a 404 page.

## Screens

| Screen | Who |
|---|---|
| Login, Change password | Everyone |
| Dashboard, My Profile | Everyone (Employees go straight to My Profile) |
| Employees: search, filter, add, edit, deactivate, reset password | Company Head, Dept Head, Team Manager |
| Departments: create, rename, delete, see heads and teams | Company Head |
| Teams: create, rename, delete, see managers | Company Head, Dept Head |
| Company: organization details and totals | Company Head |
| Companies: create with a Company Head, edit, activate, deactivate, reset a head's password | Platform Owner |

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router, Redux Toolkit, Axios, lucide-react |
| Backend | Node.js, Express, JWT, bcryptjs, helmet, express-rate-limit, morgan, cors, cookie-parser |
| Database | MongoDB Atlas, Mongoose |
| Hosting | Vercel (frontend), Render (backend) |

## Getting started

### Requirements

- Node.js 22 (LTS)
- A MongoDB Atlas cluster (the free tier works) with a database user, and your IP address allowed

### Setup

```bash
git clone https://github.com/Princy262/worknest.git
cd worknest

# backend
cd backend
npm install
cp .env.example .env      # then fill in your own values

# frontend
cd ../frontend
npm install
```

### Run (two terminals)

```bash
# Terminal 1: API on http://localhost:5000
cd backend
npm run seed               # creates the Platform Owner (once)
npm run seed -- --sample   # optional: also creates a sample company for testing
npm run dev

# Terminal 2: app on http://localhost:5173
cd frontend
npm run dev
```

In development, Vite forwards every `/api` request to the backend on port 5000, so no frontend configuration is needed.

### Sample logins (local only, after `npm run seed -- --sample`)

All sample users have the password `Sample@1234`. The sample company must never be created on a public server.

| Role | Email |
|---|---|
| Company Head | `companyhead@sample.com` |
| Dept Head (Technology) | `tech.head@sample.com` |
| Team Manager (Frontend) | `frontend.manager@sample.com` |
| Employee | `employee.a@sample.com` |

Try logging in as the Frontend Manager and confirm that the Backend team's employees (D, E and F) are invisible to them.

## Environment variables (backend)

Copy `backend/.env.example` to `backend/.env`.

| Name | Purpose |
|---|---|
| `PORT` | Port for the API (default 5000). Hosting platforms set it automatically. |
| `NODE_ENV` | `development` locally, `production` when deployed |
| `MONGO_URI` | MongoDB Atlas connection string, ending in the database name |
| `JWT_SECRET` | Long random secret for signing login tokens. Use a different one in production. |
| `JWT_EXPIRES_IN` | How long a login lasts (for example `1d`) |
| `CLIENT_URL` | Address of the frontend |
| `TRUST_PROXY_HOPS` | Production only: how many proxy addresses to skip when finding the visitor's real address, so the rate limiter counts each visitor separately |
| `PLATFORM_OWNER_NAME`, `_EMAIL`, `_USERNAME`, `_PASSWORD` | Used only by `npm run seed` to create the first account |

The frontend needs no environment variables.

## Project structure

```text
backend/
+-- config/         database connection
+-- models/         Company, User, Department, Team
+-- controllers/    auth, platform, user, department, team logic
+-- routes/         URL to controller mapping
+-- middleware/     authentication, roles, errors, rate limiting
+-- utils/          constants, access scope rules, token, username and password helpers
+-- seeds/          seed script
+-- server.js       entry point

frontend/
+-- vercel.json     forwards /api to the backend and serves the React app
+-- src/
    +-- api/            Axios setup
    +-- app/            Redux store
    +-- features/       auth, dashboard, employees, departments, teams, companies
    +-- components/     shared pieces (sidebar, modals, form fields, password generator...)
    +-- pages/          full screens
    +-- routes/         protected routes
    +-- utils/          formatting, password generator, debounce
```

## API overview

All routes start with `/api`. Request and response bodies are JSON.

### Auth

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/auth/login` | Public | Log in with `identifier` (email or username) and `password` |
| POST | `/auth/logout` | Public | Clear the login cookie |
| GET | `/auth/me` | Logged in | Current user |
| PUT | `/auth/change-password` | Logged in | `currentPassword`, `newPassword` |

### Platform (Platform Owner only)

| Method | Route | Purpose |
|---|---|---|
| GET | `/platform/companies` | List companies |
| POST | `/platform/companies` | Create a company and its Company Head |
| PUT | `/platform/companies/:id` | Rename, change domain, activate or deactivate |
| POST | `/platform/companies/:id/reset-head-password` | New temporary password for the Company Head |

### Users

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | `/users` | Heads and managers | List, search and filter (`search`, `department`, `team`, `role`, `employmentStatus`, `page`, `limit`) |
| POST | `/users` | Heads and managers | Create a user below your own role |
| PUT | `/users/me` | Any user | Update your own contact info |
| GET | `/users/:id` | In scope | View one profile |
| PUT | `/users/:id` | Heads and managers | Update a user below you |
| DELETE | `/users/:id` | Heads and managers | Deactivate a user below you |
| POST | `/users/:id/reset-password` | Heads and managers | New temporary password for a user below you |

### Departments

| Method | Route | Access |
|---|---|---|
| GET | `/departments`, `/departments/:id` | Company Head, Dept Head (own) |
| POST, PUT, DELETE | `/departments`, `/departments/:id` | Company Head |

### Teams

| Method | Route | Access |
|---|---|---|
| GET | `/teams`, `/teams/:id` | Company Head, Dept Head (own department), Team Manager (own team) |
| POST, PUT, DELETE | `/teams`, `/teams/:id` | Company Head, Dept Head (own department) |

## Security notes

- Access rules are enforced on the server, never only in the interface.
- `role`, `company` and `username` are decided by the server and never trusted from the request body.
- Requests for records outside your scope return 404, so IDs cannot be probed.
- Passwords are hashed with bcrypt and never returned. Temporary passwords are shown once and never stored in plain text.
- Login and password-change routes are rate limited, and the limiter identifies visitors by their real address behind the hosting proxies.
- The login cookie is HTTP-only. In production, the frontend host forwards `/api` to the backend, so the browser only ever talks to one address and the cookie stays first-party.

## Deployment

| Part | Where |
|---|---|
| Frontend | Vercel. `frontend/vercel.json` forwards `/api` requests to the backend and sends every other address to the React app. |
| Backend | Render (free web service). It sleeps after a quiet period, so the first request can take about a minute. |
| Database | MongoDB Atlas, using a separate production database and user from development |

```text
Browser -> Vercel (React app)
Browser -> Vercel /api/... -> Render (Express API) -> MongoDB Atlas
```

Every push to `main` redeploys the frontend and the backend automatically.

## Known limitations and ideas

- Credentials for new accounts are shown to the creator once and shared manually. There is no email sending yet.
- A person's role, department or team cannot be changed after creation.
- The free hosting plans cause a slow first load after inactivity.
- There are no automated tests yet. Good candidates are the access-scope rules.

## Author

Built by Princy Agarwal ([@Princy262](https://github.com/Princy262)).