# Docker Setup for Production API

This guide explains how to run the Production API with Neon Database in both development and production environments.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Development Setup (with Neon Local)](#development-setup-with-neon-local)
- [Production Setup (with Neon Cloud)](#production-setup-with-neon-cloud)
- [Environment Variables](#environment-variables)
- [Docker Commands Reference](#docker-commands-reference)
- [Troubleshooting](#troubleshooting)

## Overview

This application uses different database configurations for development and production:

- **Development**: Uses **Neon Local** via Docker, which creates ephemeral database branches that are automatically created when containers start and deleted when they stop.
- **Production**: Uses **Neon Cloud Database** with direct connection to your production Neon project.

## Prerequisites

Before you begin, ensure you have:

1. **Docker** and **Docker Compose** installed on your machine
   - Docker Desktop (recommended) or Docker Engine + Docker Compose plugin
   - Verify installation: `docker --version` and `docker compose version`

2. **Neon Account** with an active project
   - Sign up at [neon.tech](https://neon.tech)
   - Create a project and note down:
     - API Key (from Account Settings → API Keys)
     - Project ID (from your project dashboard)
     - Parent Branch ID (usually `main` or your primary branch)

## Development Setup (with Neon Local)

### Step 1: Configure Environment Variables

1. Copy the development environment template:

   ```bash
   cp .env.development .env.development.local
   ```

2. Edit `.env.development.local` and add your Neon credentials:

   ```bash
   # Required for Neon Local
   NEON_API_KEY=neon_api_xxxxxxxxxxxxx
   NEON_PROJECT_ID=your-project-id
   PARENT_BRANCH_ID=br-xxxxxxxxxxxxx

   # Database URL (points to Neon Local)
   DATABASE_URL=postgres://neondb_owner:password@neon-local:5432/neondb?sslmode=require
   ```

3. Get your Neon credentials from [console.neon.tech](https://console.neon.tech):
   - **API Key**: Account Settings → API Keys → Create new key
   - **Project ID**: Project Dashboard → Project ID (top of page)
   - **Parent Branch ID**: Project Dashboard → Branches → Copy branch ID of main branch

### Step 2: Start Development Environment

Start the application with Neon Local:

```bash
docker compose -f docker-compose.dev.yml --env-file .env.development.local up --build
```

This command will:

- Build your application Docker image
- Start Neon Local proxy (creates an ephemeral database branch)
- Start your application connected to Neon Local
- Enable hot-reload for development (source code is mounted)

### Step 3: Verify Development Setup

1. Check that both services are running:

   ```bash
   docker compose -f docker-compose.dev.yml ps
   ```

2. Test your application:

   ```bash
   curl http://localhost:3000
   ```

3. View logs:

   ```bash
   # All services
   docker compose -f docker-compose.dev.yml logs -f

   # Just the app
   docker compose -f docker-compose.dev.yml logs -f app

   # Just Neon Local
   docker compose -f docker-compose.dev.yml logs -f neon-local
   ```

### Step 4: Run Database Migrations (Development)

Run Drizzle migrations inside the app container:

```bash
docker compose -f docker-compose.dev.yml exec app npm run db:migrate
```

### Step 5: Stop Development Environment

When you're done, stop the containers:

```bash
docker compose -f docker-compose.dev.yml down
```

**Note**: The ephemeral database branch created by Neon Local will be automatically deleted when the containers stop.

## Production Setup (with Neon Cloud)

### Step 1: Configure Production Environment

1. Copy the production environment template:

   ```bash
   cp .env.production .env.production.local
   ```

2. Edit `.env.production.local` with your production Neon database URL:

   ```bash
   NODE_ENV=production
   PORT=3000
   LOG_LEVEL=info

   # Get this from Neon Console → Connection Details
   DATABASE_URL=postgres://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require

   # Use a strong secret in production
   JWT_SECRET=your_production_jwt_secret_here
   ```

3. Get your production `DATABASE_URL` from Neon Console:
   - Go to your project → Connection Details
   - Select your production branch (usually `main`)
   - Copy the connection string

### Step 2: Build Production Image

Build the production Docker image:

```bash
docker compose -f docker-compose.prod.yml build
```

### Step 3: Start Production Environment

Start the application in production mode:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production.local up -d
```

This command will:

- Start your application in production mode
- Connect directly to Neon Cloud Database
- Run the container in detached mode (`-d`)
- Automatically restart on failure

### Step 4: Verify Production Setup

1. Check that the service is running:

   ```bash
   docker compose -f docker-compose.prod.yml ps
   ```

2. Check health status:

   ```bash
   docker compose -f docker-compose.prod.yml exec app wget --no-verbose --tries=1 --spider http://localhost:3000/health
   ```

3. View production logs:
   ```bash
   docker compose -f docker-compose.prod.yml logs -f
   ```

### Step 5: Run Database Migrations (Production)

**Important**: Always backup your production database before running migrations!

```bash
docker compose -f docker-compose.prod.yml exec app npm run db:migrate
```

## Environment Variables

### Development Environment Variables

| Variable           | Description                          | Example                                                                   |
| ------------------ | ------------------------------------ | ------------------------------------------------------------------------- |
| `NEON_API_KEY`     | Your Neon API key                    | `neon_api_xxxxx`                                                          |
| `NEON_PROJECT_ID`  | Your Neon project ID                 | `broad-tree-12345`                                                        |
| `PARENT_BRANCH_ID` | Parent branch for ephemeral branches | `br-xxxxx`                                                                |
| `DATABASE_URL`     | Points to Neon Local                 | `postgres://neondb_owner:password@neon-local:5432/neondb?sslmode=require` |
| `NODE_ENV`         | Environment                          | `development`                                                             |
| `LOG_LEVEL`        | Logging level                        | `debug`                                                                   |

### Production Environment Variables

| Variable       | Description             | Example                                                                   |
| -------------- | ----------------------- | ------------------------------------------------------------------------- |
| `DATABASE_URL` | Neon Cloud database URL | `postgres://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require` |
| `NODE_ENV`     | Environment             | `production`                                                              |
| `LOG_LEVEL`    | Logging level           | `info`                                                                    |
| `JWT_SECRET`   | JWT signing secret      | Strong random string                                                      |

## Docker Commands Reference

### Development

```bash
# Start development environment
docker compose -f docker-compose.dev.yml --env-file .env.development.local up

# Start in background
docker compose -f docker-compose.dev.yml --env-file .env.development.local up -d

# Rebuild and start
docker compose -f docker-compose.dev.yml --env-file .env.development.local up --build

# Stop development environment
docker compose -f docker-compose.dev.yml down

# Stop and remove volumes
docker compose -f docker-compose.dev.yml down -v

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Execute command in app container
docker compose -f docker-compose.dev.yml exec app sh

# Run migrations
docker compose -f docker-compose.dev.yml exec app npm run db:migrate

# Open Drizzle Studio
docker compose -f docker-compose.dev.yml exec app npm run db:studio
```

### Production

```bash
# Build production image
docker compose -f docker-compose.prod.yml build

# Start production environment
docker compose -f docker-compose.prod.yml --env-file .env.production.local up -d

# Stop production environment
docker compose -f docker-compose.prod.yml down

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Execute command in app container
docker compose -f docker-compose.prod.yml exec app sh

# Run migrations (BE CAREFUL!)
docker compose -f docker-compose.prod.yml exec app npm run db:migrate

# Restart the application
docker compose -f docker-compose.prod.yml restart app
```

## Troubleshooting

### Neon Local won't start

**Issue**: Neon Local container fails to start or times out

**Solutions**:

1. Verify your Neon credentials are correct in `.env.development.local`
2. Check Neon Local logs: `docker compose -f docker-compose.dev.yml logs neon-local`
3. Ensure your Neon API key has proper permissions
4. Verify the PARENT_BRANCH_ID exists in your Neon project

### Application can't connect to database

**Issue**: Application shows database connection errors

**Solutions**:

For Development:

1. Wait for Neon Local health check to pass (can take 10-20 seconds)
2. Check that `DATABASE_URL` points to `neon-local:5432` (not `localhost`)
3. Verify Neon Local is running: `docker compose -f docker-compose.dev.yml ps`

For Production:

1. Verify your `DATABASE_URL` is correct in `.env.production.local`
2. Ensure the database URL includes `?sslmode=require`
3. Test connection from your machine first (outside Docker)
4. Check network connectivity to Neon Cloud

### Port already in use

**Issue**: Error binding to port 3000 or 5432

**Solution**:

```bash
# Find process using the port
lsof -i :3000
lsof -i :5432

# Kill the process or change port in environment variables
```

### Cannot see code changes in development

**Issue**: Code changes don't reflect in running container

**Solution**:

1. Verify volume mounts in `docker-compose.dev.yml`
2. Ensure you're using `npm run dev` (watch mode)
3. Rebuild the container: `docker compose -f docker-compose.dev.yml up --build`

### Migration errors

**Issue**: Database migration fails

**Solutions**:

1. Check database connectivity first
2. Verify Drizzle schema files exist in `src/models/`
3. Generate migration first: `docker compose -f docker-compose.dev.yml exec app npm run db:generate`
4. Then apply migration: `docker compose -f docker-compose.dev.yml exec app npm run db:migrate`
