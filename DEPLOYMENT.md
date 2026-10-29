# ExamPro — Zero-Cost Public College Demo Deployment Guide

This guide describes how to deploy **ExamPro** for a zero-cost public college demo or evaluation using:
- **Backend**: Render Free Web Service (Docker container, 512MB RAM)
- **Database**: Aiven Free MySQL (Managed cloud MySQL with TLS/SSL)
- **Frontend**: Vercel Hobby Tier (Global CDN, Serverless SPA hosting)
- **Source Control**: GitHub Private Repository

---

## Architecture Overview

```
+-----------------------------+        HTTPS / REST API        +-----------------------------------+
|        Vercel (Hobby)       | -----------------------------> |        Render (Free Web)          |
|    React 18 + Vite Frontend |   Authorization: Bearer <jwt>  |    Java 21 + Spring Boot (Docker) |
| https://<app>.vercel.app    |                                | https://<backend>.onrender.com    |
+-----------------------------+                                +-----------------------------------+
                                                                                 |
                                                                   TLS / SSL     |
                                                                (sslMode=REQUIRED)|
                                                                                 v
                                                               +-----------------------------------+
                                                               |         Aiven Cloud MySQL         |
                                                               |   Free Managed MySQL Instance     |
                                                               |   Port 10000-30000 (Encrypted)    |
                                                               +-----------------------------------+
```

---

## Prerequisites
- A [GitHub](https://github.com/) account
- An [Aiven](https://aiven.io/) account (Free tier, no credit card required)
- A [Render](https://render.com/) account (Free tier, no credit card required)
- A [Vercel](https://vercel.com/) account (Hobby tier, free)

---

## Step 1: Push Code to a Private GitHub Repository

1. Ensure sensitive files (`.env`, `*.dump`, `node_modules/`, `target/`) are ignored by verifying `.gitignore`.
2. Initialize and push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: prepare ExamPro for zero-cost college demo deployment"
   git branch -M main
   git remote add origin https://github.com/<your-username>/exampro.git
   git push -u origin main
   ```

---

## Step 2: Provision Free Cloud MySQL on Aiven

1. Log into your **Aiven Console** and click **Create Service**.
2. Select **MySQL** and pick the **Free** tier (or trial credits) in your preferred region.
3. Once the service status turns **Running**, view the **Overview** tab:
   - Note down: `Host`, `Port`, `User`, `Password`, and `Database Name` (default is `defaultdb`).
   - Aiven requires encrypted TLS connections by default.
4. Construct your JDBC URL:
   ```text
   jdbc:mysql://<aiven-host>:<aiven-port>/defaultdb?sslMode=REQUIRED&allowPublicKeyRetrieval=true&serverTimezone=UTC
   ```
5. *(Optional Seed)*: Use the Aiven web query console or a MySQL client (like DBeaver, MySQL Workbench, or `mysql` CLI) to execute the synthetic college assessment seed script:
   ```bash
   mysql -h <aiven-host> -P <aiven-port> -u <aiven-user> -p defaultdb < database/demo-seed.sql
   ```

---

## Step 3: Deploy Backend on Render (Free Web Service)

1. Log into **Render Dashboard** and click **New +** -> **Web Service**.
2. Connect your private GitHub repository (`exampro`).
3. Configure service settings:
   - **Name**: `exampro-backend` (or any unique name)
   - **Region**: Select the region closest to your Aiven database
   - **Branch**: `main`
   - **Root Directory**: Leave blank (uses repo root containing `Dockerfile`)
   - **Runtime**: **Docker**
   - **Instance Type**: **Free** (512 MB RAM, 0.1 CPU)
4. Scroll to **Environment Variables** and add the following:

   | Variable Name | Example / Recommended Value | Description |
   | :--- | :--- | :--- |
   | `SPRING_PROFILES_ACTIVE` | `prod` | Enables production security safeguards |
   | `PORT` | `8080` | Render listens on dynamic port automatically |
   | `DB_URL` | `jdbc:mysql://<host>:<port>/defaultdb?sslMode=REQUIRED&allowPublicKeyRetrieval=true&serverTimezone=UTC` | Aiven MySQL JDBC connection string |
   | `DB_USERNAME` | `<aiven-username>` | Aiven database username (e.g. `avnadmin`) |
   | `DB_PASSWORD` | `<aiven-password>` | Aiven database password |
   | `DB_MAX_POOL_SIZE` | `5` | Keeps connection count within free tier limits |
   | `JWT_SECRET` | *(64-char hex string)* | Generate with `openssl rand -hex 32` |
   | `JWT_EXPIRATION_MS` | `86400000` | Token expiration (e.g., 24 hours for demos) |
   | `FRONTEND_URL` | `https://<your-app>.vercel.app` | Vercel domain (update after Step 4) |
   | `ADMIN_EMAIL` | `admin@college.edu` | Email for initial administrator account |
   | `ADMIN_PASSWORD` | `<secure-admin-password>` | Password for initial administrator (min 8 chars) |
   | `ADMIN_NAME` | `Demo Administrator` | Display name for administrator account |

5. Under **Advanced**, set **Health Check Path** to `/api/status`.
6. Click **Create Web Service**.
   - Render will build the Docker container and start Spring Boot.
   - You can track logs live in the Render dashboard until `Started ExamProApplication in ... seconds` is printed.
   - Note down your backend URL (e.g. `https://exampro-backend.onrender.com`).

---

## Step 4: Deploy Frontend on Vercel (Hobby Tier)

1. Log into **Vercel Dashboard** and click **Add New...** -> **Project**.
2. Import your GitHub repository (`exampro`).
3. In the project configuration screen:
   - **Project Name**: `exampro-demo`
   - **Framework Preset**: **Vite**
   - **Root Directory**: Click *Edit* and select **`frontend`**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables**:
   - Add variable:
     - **Name**: `VITE_API_BASE_URL`
     - **Value**: `https://exampro-backend.onrender.com` (Your Render backend URL from Step 3, without trailing slash)
5. Click **Deploy**.
   - Vercel will install dependencies, build the production Vite bundle, and deploy to their global edge network.
   - Note down your frontend URL (e.g., `https://exampro-demo.vercel.app`).

---

## Step 5: Link CORS on Render

1. Return to your **Render Dashboard** -> **`exampro-backend`** -> **Environment**.
2. Ensure `FRONTEND_URL` matches your deployed Vercel URL:
   ```text
   FRONTEND_URL=https://exampro-demo.vercel.app
   ```
3. Save changes. Render will quickly restart the backend with the exact allowed CORS origin.

---

## Step 6: Verify the College Demo

1. Open your Vercel URL in your browser: `https://exampro-demo.vercel.app`.
2. **System Health Pill**: Observe the header pill showing `Backend Online & Healthy (v1.0.0)`.
3. **Public Catalog**:
   - Click **Exams** in the navigation bar.
   - Verify the 3 examinations are visible with their question counts, durations, and passing thresholds.
4. **Student Flow**:
   - Click **Register** and create a test student (e.g., `student@college.edu`).
   - Start an exam, answer questions, navigate using the question palette, and submit.
   - View the instant automated scorecard and pass/fail result.
5. **Admin Flow**:
   - Log in using your configured `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
   - Access **Admin Panel** (`/admin/dashboard`) and **Manage Questions** (`/admin/questions`).
   - Author multiple-choice questions, view assigned questions with correct answer keys, and inspect candidates' exam submissions.

---

## Free-Tier Operational Notes & FAQ

### Render Free Tier Spin-Down (Cold Starts)
- Render's free tier spins down web services after **15 minutes of inactivity**.
- The first request to a dormant service takes **30–50 seconds** while the container wakes up.
- For a live college demo, open `https://<backend>.onrender.com/api/status` in a browser tab 2 minutes before the presentation to ensure the backend is fully awake.

### Aiven Connection Limits
- Aiven free MySQL instances have strict limits on simultaneous connections.
- ExamPro's `DB_MAX_POOL_SIZE=5` ensures the HikariCP connection pool never exhausts the database limits.

### Client-Side Routing on Vercel
- The repository includes [`frontend/vercel.json`](file:///frontend/vercel.json) configuring rewrite rules so refreshing pages like `/exams` or `/student/dashboard` redirects to `/index.html` seamlessly without 404 errors.

