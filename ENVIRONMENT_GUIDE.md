# Environment Configuration Guide

This document explains how environment variables switch between development and production environments.

## Environment Architecture

### Development Environment
```
┌─────────────────┐
│   Your App      │
│  (Container)    │
└────────┬────────┘
         │ DATABASE_URL: postgres://neondb_owner:password@neon-local:5432/neondb
         ↓
┌─────────────────┐
│  Neon Local     │
│   (Container)   │
│   Port: 5432    │
└────────┬────────┘
         │ NEON_API_KEY, NEON_PROJECT_ID, PARENT_BRANCH_ID
         ↓
┌─────────────────┐
│  Neon Cloud     │
│  (Ephemeral     │
│   Branch)       │
└─────────────────┘
```

### Production Environment
```
┌─────────────────┐
│   Your App      │
│  (Container)    │
└────────┬────────┘
         │ DATABASE_URL: postgres://...@ep-xxx.region.aws.neon.tech/dbname
         ↓
┌─────────────────┐
│  Neon Cloud     │
│  (Production    │
│   Branch)       │
└─────────────────┘
```

## Environment Variables Comparison

| Variable | Development (.env.development) | Production (.env.production) |
|----------|-------------------------------|------------------------------|
| `NODE_ENV` | `development` | `production` |
| `DATABASE_URL` | `postgres://neondb_owner:password@neon-local:5432/neondb?sslmode=require` | `postgres://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require` |
| `NEON_API_KEY` | Required (for Neon Local) | Not used |
| `NEON_PROJECT_ID` | Required (for Neon Local) | Not used |
| `PARENT_BRANCH_ID` | Required (for Neon Local) | Not used |
| `LOG_LEVEL` | `debug` | `info` or `warn` |
| `PORT` | `3000` | `3000` (or as required) |

## How DATABASE_URL Switching Works

### Development Flow

1. You set `NEON_API_KEY`, `NEON_PROJECT_ID`, and `PARENT_BRANCH_ID` in `.env.development.local`
2. Docker Compose starts Neon Local container with these credentials
3. Neon Local creates an ephemeral branch from your parent branch
4. Your app connects to `neon-local:5432` (the local proxy)
5. Neon Local proxies all queries to the ephemeral branch in Neon Cloud
6. When containers stop, the ephemeral branch is automatically deleted

**Key Point**: Your app code doesn't know it's using Neon Local - it just sees a regular Postgres connection!

### Production Flow

1. You set `DATABASE_URL` directly to your Neon Cloud endpoint in `.env.production.local`
2. Docker Compose starts only your app container (no Neon Local)
3. Your app connects directly to Neon Cloud using the `@neondatabase/serverless` driver
4. No proxy, no ephemeral branches - direct connection to production database

## Docker Compose Configuration Differences

### docker-compose.dev.yml
```yaml
services:
  neon-local:
    # Neon Local proxy container
    environment:
      NEON_API_KEY: ${NEON_API_KEY}
      NEON_PROJECT_ID: ${NEON_PROJECT_ID}
      PARENT_BRANCH_ID: ${PARENT_BRANCH_ID}

  app:
    environment:
      DATABASE_URL: postgres://...@neon-local:5432/...
    depends_on:
      neon-local:
        condition: service_healthy
    volumes:
      - ./src:/app/src  # Hot-reload
    command: npm run dev
```

### docker-compose.prod.yml
```yaml
services:
  app:
    environment:
      DATABASE_URL: ${DATABASE_URL}
    # No neon-local service
    # No volume mounts
    # No dev dependencies
    command: node src/index.js
```

## Environment Files Structure

```
production-api/
├── .env.example              # Template for all environments
├── .env.development          # Development template (committed to git)
├── .env.development.local    # Your local dev config (NOT in git)
├── .env.production           # Production template (committed to git)
└── .env.production.local     # Your prod config (NOT in git)
```

### What to commit to Git?

✅ **DO commit:**
- `.env.example` - Template for developers
- `.env.development` - Development template with placeholder values
- `.env.production` - Production template with placeholder values

❌ **DO NOT commit:**
- `.env` - May contain secrets
- `.env.*.local` - Contains real credentials
- Any file with actual API keys, passwords, or database URLs

## Using Different Database Connections

### Scenario 1: Local Development with Ephemeral Branch

```bash
# .env.development.local
DATABASE_URL=postgres://neondb_owner:password@neon-local:5432/neondb?sslmode=require
NEON_API_KEY=your_api_key
NEON_PROJECT_ID=your_project_id
PARENT_BRANCH_ID=br-main-branch-id
```

```bash
docker compose -f docker-compose.dev.yml --env-file .env.development.local up
```

**Result**: Fresh database branch every time you start!

### Scenario 2: Local Development with Specific Branch

If you want to test against a specific branch instead of creating ephemeral ones:

```bash
# .env.development.local
DATABASE_URL=postgres://neondb_owner:password@neon-local:5432/neondb?sslmode=require
NEON_API_KEY=your_api_key
NEON_PROJECT_ID=your_project_id
BRANCH_ID=br-specific-branch-id  # Use BRANCH_ID instead of PARENT_BRANCH_ID
```

Update `docker-compose.dev.yml` to use `BRANCH_ID`:
```yaml
neon-local:
  environment:
    BRANCH_ID: ${BRANCH_ID}  # Changed from PARENT_BRANCH_ID
```

### Scenario 3: Staging Environment

Use a staging Neon branch with production-like setup:

```bash
# .env.staging
DATABASE_URL=postgres://user:pass@ep-staging-xxx.region.aws.neon.tech/dbname?sslmode=require
NODE_ENV=production
LOG_LEVEL=info
```

```bash
docker compose -f docker-compose.prod.yml --env-file .env.staging up -d
```

### Scenario 4: Direct Neon Cloud Connection (No Docker)

For local development without Docker:

```bash
# .env
DATABASE_URL=postgres://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
NODE_ENV=development
```

```bash
npm run dev
```

## Runtime Environment Variable Override

You can override specific variables at runtime:

```bash
# Override DATABASE_URL at runtime
DATABASE_URL="postgres://..." docker compose -f docker-compose.prod.yml up -d

# Override multiple variables
NODE_ENV=staging LOG_LEVEL=debug docker compose -f docker-compose.prod.yml up -d
```

## Best Practices

1. **Use `.local` suffix for files with real credentials**
   - Pattern: `.env.{environment}.local`
   - Always in `.gitignore`

2. **Validate environment variables on startup**
   - Check required variables exist
   - Fail fast if misconfigured

3. **Use separate Neon projects for dev/prod**
   - Development project: For ephemeral branches
   - Production project: For production data

4. **Document all required variables**
   - Update `.env.example` when adding new variables
   - Include descriptions and example values

5. **Rotate secrets regularly**
   - Neon API keys
   - JWT secrets
   - Other credentials

6. **Use secrets managers in production**
   - AWS Secrets Manager
   - Google Cloud Secret Manager
   - HashiCorp Vault
   - Kubernetes Secrets

## Troubleshooting Environment Issues

### "Cannot connect to database"
- **Check**: Is `DATABASE_URL` set correctly?
- **Development**: Should point to `neon-local:5432` (not `localhost`)
- **Production**: Should point to `ep-xxx.region.aws.neon.tech`

### "NEON_API_KEY not found"
- **Check**: Are you using the correct env file?
- **Fix**: `--env-file .env.development.local`

### "Environment variable not loading"
- **Check**: Variable defined in correct env file?
- **Check**: Quotes around values with special characters?
- **Check**: No spaces around `=` sign?

### "Using wrong database"
- **Check**: Are you using the right compose file?
- **Dev**: `docker-compose.dev.yml`
- **Prod**: `docker-compose.prod.yml`

## Additional Resources

- [Docker Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [Neon Environment Variables](https://neon.tech/docs/connect/connect-from-any-app)
- [12-Factor App Config](https://12factor.net/config)
