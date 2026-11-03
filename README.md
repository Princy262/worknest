# WorkNest

A **hierarchical employee management system** with role-based and hierarchy-based access control, built with the MERN stack. Every user sees and manages only what their position in the company allows, and each company's data is fully isolated from every other company.

> Status: backend complete. React frontend in progress.

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

## Key features

- No public signup. Every account is created by someone above that person.
- Creator-set identity: the username is generated as first name + employee ID (for example `Rahul123`).
- Temporary password, with a forced password change on first login.
- Employees can edit their own contact info and password. Everything else is locked.
- Search, filters and direct profile lookups all respect the viewer's scope.
- Multi-company support with complete data isolation, plus the ability to deactivate a company.
- JWT authentication in HTTP-only cookies, bcrypt password hashing, rate-limited login.

## Tech stack

| Layer | Tools |
|---|---|
| Frontend (planned) | React, Vite, Tailwind CSS, React Router, Redux Toolkit, Axios |
| Backend | Node.js, Express, JWT, bcryptjs, express-validator, helmet, morgan |
| Database | MongoDB (Atlas), Mongoose |

## Getting started

### Requirements

- Node.js (LTS)
- A MongoDB Atlas cluster (free tier works) with a database user and your IP allowed

### Setup

```bash
git clone https://github.com/Princy262/worknest.git
cd worknest/backend
npm install
cp .env.example .env
```

Open `.env` and fill in your own values (database connection string, JWT secret, Platform Owner details).

### Run

```bash
npm run seed              # creates the Platform Owner
npm run seed -- --sample  # optional: also creates a sample company for testing
npm run dev               # starts the API on http://localhost:5000
```

### Sample logins (only after `npm run seed -- --sample`)

All sample users have the password `Sample@1234`.

| Role | Email |
|---|---|
| Company Head | `companyhead@sample.com` |
| Dept Head (Technology) | `tech.head@sample.com` |
| Team Manager (Frontend) | `frontend.manager@sample.com` |
| Employee | `employee.a@sample.com` |

## Backend structure

```text
backend/
+-- config/         database connection
+-- models/         Company, User, Department, Team
+-- controllers/    auth, platform, user, department, team logic
+-- routes/         URL to controller mapping
+-- middleware/     authentication, roles, errors, rate limiting
+-- utils/          constants, access scope rules, token and username helpers
+-- seeds/          seed script
+-- server.js       entry point
```

## API overview

All routes start with `/api`. Request bodies are JSON.

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

### Users

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | `/users` | Heads and managers | List, search and filter (`search`, `department`, `team`, `role`, `employmentStatus`, `page`, `limit`) |
| POST | `/users` | Heads and managers | Create a user below your own role |
| PUT | `/users/me` | Any user | Update your own contact info |
| GET | `/users/:id` | In scope | View one profile |
| PUT | `/users/:id` | Heads and managers | Update a user below you |
| DELETE | `/users/:id` | Heads and managers | Deactivate a user below you |

### Departments

| Method | Route | Access |
|---|---|---|
| GET | `/departments` | Company Head, Dept Head (own) |
| POST, PUT, DELETE | `/departments`, `/departments/:id` | Company Head |
| GET | `/departments/:id` | In scope (includes its teams) |

### Teams

| Method | Route | Access |
|---|---|---|
| GET | `/teams`, `/teams/:id` | Company Head, Dept Head (own department), Team Manager (own team) |
| POST, PUT, DELETE | `/teams`, `/teams/:id` | Company Head, Dept Head (own department) |

## Security notes

- Access rules are enforced on the server, never only in the interface.
- `role`, `company` and `username` are decided by the server and never trusted from the request body.
- Requests for records outside your scope return 404, so IDs cannot be probed.
- Passwords are hashed with bcrypt and never returned in responses.
- Login and password-change routes are rate limited.