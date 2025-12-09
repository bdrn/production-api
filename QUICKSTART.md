# Quick Start Guide

Get your application running with Docker in 5 minutes!

## Development (Local with Neon Local)

### Prerequisites
- Docker Desktop installed
- Neon account with API key, Project ID, and Parent Branch ID

### Steps

1. **Copy and configure environment file:**
   ```bash
   cp .env.development .env.development.local
   ```

2. **Edit `.env.development.local` with your Neon credentials:**
   ```bash
   NEON_API_KEY=your_neon_api_key
   NEON_PROJECT_ID=your_project_id
   PARENT_BRANCH_ID=your_branch_id
   ```

3. **Start the application:**
   ```bash
   docker compose -f docker-compose.dev.yml --env-file .env.development.local up --build
   ```

4. **Access your app:**
   - API: http://localhost:3000
   - Postgres: localhost:5432

5. **Run migrations (in a new terminal):**
   ```bash
   docker compose -f docker-compose.dev.yml exec app npm run db:migrate
   ```

6. **Stop when done:**
   ```bash
   docker compose -f docker-compose.dev.yml down
   ```

## Production (with Neon Cloud)

### Prerequisites
- Docker installed
- Production Neon database URL

### Steps

1. **Copy and configure environment file:**
   ```bash
   cp .env.production .env.production.local
   ```

2. **Edit `.env.production.local` with your production database URL:**
   ```bash
   DATABASE_URL=postgres://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   JWT_SECRET=your_strong_secret_here
   ```

3. **Start the application:**
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.production.local up -d
   ```

4. **Run migrations:**
   ```bash
   docker compose -f docker-compose.prod.yml exec app npm run db:migrate
   ```

5. **Check logs:**
   ```bash
   docker compose -f docker-compose.prod.yml logs -f
   ```

## Useful Commands

```bash
# View running containers
docker compose -f docker-compose.dev.yml ps

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Run commands in container
docker compose -f docker-compose.dev.yml exec app sh

# Stop and clean up
docker compose -f docker-compose.dev.yml down -v
```

## Need Help?

See the full documentation in [DOCKER.md](./DOCKER.md)
