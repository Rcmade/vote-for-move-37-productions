# Vote — Move37 Real-Time Polls

![Live Polls Screenshot](assets/LivePoll.png)

![Swagger Docs Screenshot](assets/SwaggerWeb.png)

**Repository:** `https://github.com/Rcmade/vote-for-move-37-productions`  
**Live site (frontend + realtime):** `https://vote.rcmade.me/`
**REST/OpenAPI docs (Swagger UI):** `https://vote.rcmade.me/api/docs/`

---

## Project summary

This project is a real-time polling application (backend + frontend) built for the Move37 Backend Developer challenge.

- Backend: Node.js + Express + Prisma (PostgreSQL) + Socket.IO
- Frontend: React (Vite) — single page shows live poll counts
- Realtime: Socket.IO rooms (one room per poll); server emits `vote_update` and `poll_created` events

The backend exposes REST endpoints for Users, Polls and Votes and broadcasts live updates to connected clients when votes are cast or new polls created.

---

## Quick demo links

- Frontend (live): `https://vote.rcmade.me/`
- API docs (Swagger UI): `https://vote.rcmade.me/api/docs/`
- GitHub: `https://github.com/Rcmade/vote-for-move-37-productions`

---

## How to use (quick demo — create user → vote → live update)

1. **Open API docs (Swagger UI)**
   Visit: `https://vote.rcmade.me/api/docs/`

2. **Create an account (Signup)**

   - In Swagger find **POST /api/auth/signup**.
   - Click **Try it out**, fill `name`, `email`, `password`, then **Execute**.
   - You should get a `201` response and a JSON user object. Swagger (running in your browser on the same origin) will receive the `token` cookie set by the server.

3. **Login**

   - In Swagger find **POST /api/auth/login**.
   - Click **Try it out**, enter the same `email` and `password`, then **Execute**.
   - Response `200` and Swagger will have received the HTTP-only cookie. The browser now sends this auth cookie on subsequent requests (Swagger will include it automatically because it is same-origin).

4. **Open the live polls page**

   - Visit: `https://vote.rcmade.me/`
   - You will see a list of polls and their options. Each option displays its **option id** (copyable). This page automatically connects to the server via Socket.IO and joins poll rooms.

5. **Cast a vote (via Swagger)**

   - In Swagger open **POST /api/votes**.
   - Click **Try it out** and paste the option id you copied into the body, e.g.:

     ```json
     {
       "optionId": "c3f1d7e2-xxxx-xxxx-xxxx-xxxxxxxx"
     }
     ```

   - Click **Execute**. If authenticated, you should receive `201` with `{ "ok": true, "voteId": "..." }`.

6. **Watch the frontend update live**

   - Immediately after the successful vote, the frontend will receive a `vote_update` event from the server and update the vote counts for that poll in real time.

---

Is

## Tech stack

- Node.js, Express
- TypeScript
- Prisma (PostgreSQL)
- Socket.IO
- Zod (validation)
- React + Vite (frontend)
- PM2 (process manager)
- Nginx (reverse proxy)

---

## Repo layout (important parts)

```txt
├─ prisma/
│  └─ schema.prisma
├─ src/                    # backend source
│  ├─ controllers/
│  ├─ services/
│  ├─ socket/
│  ├─ middlewares/
│  ├─ routes/
│  └─ ...
├─ client/                 # React / Vite frontend
├─ openapi.yaml            # OpenAPI spec served at /api/docs
├─ assets/
│  ├─ LivePoll.png
│  └─ SwaggerWeb.png
└─ package.json

```

---

## Prerequisites

- Node 18+ (recommended)
- pnpm (or npm, but commands assume `pnpm`)
- PostgreSQL (running, accessible)
- `DATABASE_URL` for PostgreSQL

---

## Environment variables

Create a `.env` at repo root (or copy `.env.example`) and set the values:

```env
# Backend (root .env)

DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
NODE_ENV=development
PORT=4002

JWT_SECRET="change_this_to_a_strong_secret"
JWT_EXPIRES_IN=30d

BACKEND_URL=http://localhost:4002
FRONTEND_URL=http://localhost:5173

```

Frontend client (copy to `client/.env`):

```env

VITE_APP_BACKEND_URL=http://localhost:4002

```

---

## Install & local development

From repo root:

```bash
# install backend deps
pnpm install

# install frontend deps
cd client
pnpm install
cd ..
```

Generate Prisma client and run migrations:

```bash
pnpm db:generate
pnpm migrate
```

Start backend + frontend concurrently (dev):

```bash
pnpm run dev
```

- Backend default: `http://localhost:3000` (or `PORT` from .env if set)
- Frontend Vite dev: `http://localhost:5173`

---

## Build & Production run

Build client and server:

```bash
# build client
pnpm build:client

# build server (TypeScript compile)
pnpm build
```

Start production server (example script from package.json):

```bash
pnpm run start:prod
```

Or run via PM2 (recommended for server uptime):

```bash
# start with pm2 and name the process "vote"
pm2 start "pnpm run start:prod" --name "vote"

# common pm2 commands
pm2 logs vote
pm2 restart vote
pm2 stop vote
pm2 delete vote
pm2 save
pm2 startup
```

---

## Nginx reverse proxy (example)

If serving on production domain `vote.rcmade.me`, use a reverse proxy. Example server block:

```nginx
server {
    listen 80;
    server_name vote.rcmade.me;

    location / {
        proxy_pass http://127.0.0.1:4003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and reload Nginx, then add TLS with Certbot:

```bash
sudo certbot --nginx -d vote.rcmade.me
```

---

## API Docs (Swagger / OpenAPI)

OpenAPI spec is at `/openapi.yaml` and Swagger UI is served at:

```txt
GET `https://vote.rcmade.me/api/docs/`
```

This UI exposes the REST endpoints and lets you test them manually (note cookie auth / bearer token options).
