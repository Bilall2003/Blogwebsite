# Inkwell — Blog Website

A small-scale dynamic blog application built for the **Cloud Computing Fundamentals**
project. It demonstrates a full stack with user authentication, CRUD operations, and
database connectivity, ready to be containerized with Docker and deployed on Kubernetes.

## Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | React 18 + Vite + React Router      |
| Backend  | Node.js + Express (REST API)        |
| Auth     | JWT + bcrypt                        |
| Database | MySQL 8                             |

## Features

- User registration & login (JWT-based authentication)
- Protected React routes and protected Express middleware
- Blog post **CRUD** (create, read, update, delete) — authors can only edit/delete their own
- Comments and likes (toggle) on posts
- Responsive, clean UI with search
- 3+ dynamic pages: Home, Post detail, Dashboard, Editor, Login, Register

## Project Structure

```
Blogwebsite/
├── client/                 # React (Vite) frontend
│   ├── src/
│   │   ├── api/            # axios instance with JWT interceptor
│   │   ├── components/     # Navbar, PostCard, ProtectedRoute
│   │   ├── context/        # AuthContext (session state)
│   │   └── pages/          # Home, Login, Register, PostDetail, PostEditor, Dashboard
│   └── package.json
├── server/                 # Node.js/Express backend
│   ├── db/schema.sql       # MySQL schema
│   ├── src/
│   │   ├── config/         # MySQL connection pool
│   │   ├── controllers/    # auth + posts logic
│   │   ├── middleware/      # requireAuth / optionalAuth / errors
│   │   ├── routes/         # /api/auth, /api/posts
│   │   ├── scripts/initDb.js  # applies schema.sql
│   │   └── server.js
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js 18+ (tested on v24)
- A running **MySQL 8** server (local install or container)

## Getting Started

### 1. Database

Make sure MySQL is running, then set credentials in `server/.env`
(copy from `server/.env.example` and edit `DB_PASSWORD`).

Apply the schema (creates the `blog_website` database and all tables):

```bash
cd server
npm install
npm run init-db
```

> Alternatively, run `server/db/schema.sql` directly in MySQL Workbench / CLI.

### 2. Backend API

```bash
cd server
npm run dev      # starts on http://localhost:4000
```

Health check: `GET http://localhost:4000/api/health`

### 3. Frontend

```bash
cd client
npm install
npm run dev      # starts on http://localhost:5173
```

Open http://localhost:5173 in your browser.

## API Reference

### Auth (`/api/auth`)

| Method | Endpoint     | Auth | Description                          |
| ------ | ------------ | ---- | ------------------------------------ |
| POST   | `/register`  | —    | Create account → `{ token, user }`   |
| POST   | `/login`     | —    | `{ identifier, password }` → token   |
| GET    | `/me`        | ✅   | Current user from token              |

### Posts (`/api/posts`)

| Method | Endpoint                  | Auth | Description                  |
| ------ | ------------------------- | ---- | ---------------------------- |
| GET    | `/`                       | —    | List all posts               |
| GET    | `/:id`                    | opt. | Single post + comments       |
| GET    | `/mine/list`              | ✅   | Current user's posts         |
| POST   | `/`                       | ✅   | Create post                  |
| PUT    | `/:id`                    | ✅   | Update own post              |
| DELETE | `/:id`                    | ✅   | Delete own post              |
| POST   | `/:id/comments`           | ✅   | Add comment                  |
| DELETE | `/:id/comments/:commentId`| ✅   | Delete own comment           |
| POST   | `/:id/like`               | ✅   | Toggle like                  |

Protected endpoints require an `Authorization: Bearer <token>` header.

## Route Protection

- **Frontend:** `ProtectedRoute` redirects unauthenticated users to `/login`
  (used for `/dashboard`, `/create`, `/edit/:id`).
- **Backend:** `requireAuth` middleware verifies the JWT before allowing
  writes; ownership is checked in controllers for edit/delete.

## Docker

Three images are defined:

| Image            | Build context        | Base               | Port |
| ---------------- | -------------------- | ------------------ | ---- |
| `blog-db:1.0`    | `database/Dockerfile`| `mysql:8.0`        | 3306 |
| `blog-server:1.0`| `server/Dockerfile`  | `node:20-alpine`   | 4000 |
| `blog-client:1.0`| `client/Dockerfile`  | `nginx:1.27-alpine`| 80   |

The database image pre-loads `server/db/schema.sql`, and the client image
serves the built React app via nginx, proxying `/api` to the backend.

### Run everything locally with Docker Compose

```bash
docker compose build      # builds all three images
docker compose up -d      # starts db + server + client
```

Then open **http://localhost:8088**.
(API: http://localhost:4000, MySQL: localhost:3307, root password `blogpass123`.)

```bash
docker compose ps         # view containers
docker compose logs -f    # follow logs
docker compose down       # stop (add -v to also delete the DB volume)
```

## Kubernetes

Manifests live in `k8s/` and deploy into a `blog` namespace:

| File                  | Resources                                             |
| --------------------- | ----------------------------------------------------- |
| `00-namespace.yaml`   | Namespace `blog`                                      |
| `01-config.yaml`      | ConfigMap (DB host/name/user) + Secret (passwords)    |
| `02-mysql.yaml`       | PersistentVolumeClaim + Deployment + headless Service |
| `03-server.yaml`      | Deployment (**2 replicas**) + ClusterIP Service       |
| `04-client.yaml`      | Deployment (**2 replicas**) + NodePort Service (30080)|
| `dashboard-admin.yaml`| Admin ServiceAccount for the Kubernetes Dashboard     |

> **Prerequisite:** enable Kubernetes in Docker Desktop
> (Settings → Kubernetes → "Enable Kubernetes" → Apply & Restart).
> Locally built images are used directly via `imagePullPolicy: IfNotPresent`,
> so no registry/push is needed.

### Deploy

```bash
# build images first (so the cluster can find them)
docker compose build

# apply all manifests
kubectl apply -f k8s/

# watch them come up
kubectl get pods -n blog -w
```

### Inspect (commands from the project brief)

```bash
kubectl get pods -n blog
kubectl get services -n blog
kubectl get rs -n blog
kubectl get deploy -n blog
kubectl describe pod <pod-name> -n blog
```

### Open the app in a browser

Docker Desktop's Kubernetes does not always map NodePort to `localhost`,
so the most reliable way is a port-forward:

```bash
kubectl port-forward -n blog svc/blog-client 18080:80
```

Then open **http://localhost:18080**.
(The NodePort Service is still defined at `30080` to satisfy the requirement.)

### Tear down

```bash
kubectl delete -f k8s/
```

## Kubernetes Dashboard

```bash
# 1. install the dashboard (once)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml

# 2. create the admin login (once)
kubectl apply -f k8s/dashboard-admin.yaml

# 3. generate a login token (valid 24h)
kubectl -n kubernetes-dashboard create token dashboard-admin --duration=24h

# 4. start the proxy
kubectl proxy
```

Then open:

```
http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/
```

Choose **Token**, paste the token from step 3, and select the `blog` namespace
to see the Deployments, Pods, ReplicaSets, and Services.
