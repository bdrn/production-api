# Production API

A production-ready REST API built with Express.js, featuring authentication, user management, and comprehensive security measures. This API is designed for scalability and includes full CI/CD pipeline support.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Complete CRUD operations for user management
- **Security**:
  - Arcjet integration for advanced security
  - Helmet.js for HTTP security headers
  - CORS configuration
  - Security middleware for rate limiting and protection
- **Database**: PostgreSQL with Neon serverless database and Drizzle ORM
- **Logging**: Winston logger with Morgan HTTP request logging
- **Testing**: Jest test suite with coverage reports
- **Code Quality**: ESLint and Prettier for code formatting
- **Docker Support**: Multi-stage Docker builds for development and production
- **CI/CD**: GitHub Actions workflows for linting, testing, and Docker image building

## 📋 Prerequisites

- **Node.js** 20.x or higher
- **npm** 9.x or higher
- **PostgreSQL** database (Neon recommended)
- **Docker** (optional, for containerized deployment)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/bdrn/production-api.git
cd production-api
```

### 2. Install dependencies

```bash
npm ci
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# JWT
JWT_SECRET=your_strong_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# Arcjet (optional)
ARCJET_KEY=your_arcjet_key
```

### 4. Database Setup

Run database migrations:

```bash
npm run db:migrate
```

Generate new migrations (if needed):

```bash
npm run db:generate
```

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Production Mode

```bash
npm start
```

### Using Docker

#### Development

```bash
# Copy and configure environment file
cp .env.development .env.development.local
# Edit .env.development.local with your credentials

# Start the application
docker compose -f docker-compose.dev.yml --env-file .env.development.local up --build
```

#### Production

```bash
# Copy and configure environment file
cp .env.production .env.production.local
# Edit .env.production.local with your production credentials

# Start the application
docker compose -f docker-compose.prod.yml --env-file .env.production.local up -d
```

For detailed Docker instructions, see [DOCKER.md](./DOCKER.md) or [QUICKSTART.md](./QUICKSTART.md).

## 📡 API Endpoints

### Health & Status

- `GET /health` - Health check endpoint
- `GET /api` - API status message
- `GET /` - Root endpoint

### Authentication

- `POST /api/auth/sign-up` - Register a new user
- `POST /api/auth/sign-in` - Sign in and get JWT token
- `POST /api/auth/sign-out` - Sign out (clears cookies)

### Users (Protected Routes)

- `GET /api/users` - Get all users (requires authentication)
- `GET /api/users/:id` - Get user by ID (requires authentication)
- `PUT /api/users/:id` - Update user (requires authentication)
- `DELETE /api/users/:id` - Delete user (requires authentication)

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm test -- --coverage
```

## 🔧 Development Scripts

```bash
# Development
npm run dev              # Start development server with watch mode

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues automatically
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting

# Database
npm run db:generate      # Generate database migrations
npm run db:migrate       # Run database migrations
npm run db:studio        # Open Drizzle Studio

# Docker
npm run dev:docker       # Start development with Docker
npm run prod:docker      # Start production with Docker
```

## 🏗️ Project Structure

```
production-api/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD workflows
│       ├── lint-and-format.yml
│       ├── tests.yml
│       └── docker-build-and-push.yml
├── src/
│   ├── config/            # Configuration files
│   │   ├── arcjet.js
│   │   ├── database.js
│   │   └── logger.js
│   ├── controllers/       # Route controllers
│   │   ├── auth.controller.js
│   │   └── users.controllers.js
│   ├── middleware/       # Express middleware
│   │   ├── auth.middleware.js
│   │   └── security.middleware.js
│   ├── models/            # Database models (Drizzle)
│   │   └── user.model.js
│   ├── routes/            # API routes
│   │   ├── auth.routes.js
│   │   └── users.routes.js
│   ├── services/          # Business logic
│   │   ├── auth.service.js
│   │   └── users.service.js
│   ├── utils/             # Utility functions
│   │   ├── cookies.js
│   │   ├── format.js
│   │   └── jwt.js
│   ├── validations/       # Request validation schemas
│   │   ├── auth.validation.js
│   │   └── users.validation.js
│   ├── tests/             # Test files
│   │   └── app.test.js
│   ├── app.js             # Express app configuration
│   └── server.js          # Server entry point
├── drizzle/               # Database migrations
├── coverage/              # Test coverage reports
├── docker-compose.dev.yml # Development Docker Compose
├── docker-compose.prod.yml # Production Docker Compose
├── Dockerfile             # Docker image definition
└── package.json
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password encryption
- **HTTP Security Headers**: Helmet.js configuration
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Arcjet integration for DDoS protection
- **Input Validation**: Zod schemas for request validation
- **Security Middleware**: Custom middleware for additional protection

## 🚢 CI/CD Pipeline

The project includes three GitHub Actions workflows:

### 1. Lint and Format (`lint-and-format.yml`)

- Runs on pushes and PRs to `main` and `staging` branches
- Checks code with ESLint and Prettier
- Provides clear error messages and fix suggestions

### 2. Tests (`tests.yml`)

- Runs on pushes and PRs to `main` and `staging` branches
- Executes Jest test suite
- Uploads coverage reports as artifacts
- Generates test summary

### 3. Docker Build and Push (`docker-build-and-push.yml`)

- Runs on pushes to `main` branch or manual trigger
- Builds multi-platform Docker images (linux/amd64, linux/arm64)
- Pushes to Docker Hub with multiple tags
- Includes build caching for efficiency

## 📦 Docker Image

The Docker image is automatically built and pushed to Docker Hub on each push to `main`.

**Image**: `your-username/production-api`

**Tags**:

- `latest` - Latest stable version
- `main` - Main branch builds
- `main-<sha>` - Specific commit SHA
- `prod-YYYYMMDD-HHmmss` - Production timestamp tags

## 🔑 Required Secrets

For GitHub Actions, configure these secrets in your repository:

- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub Personal Access Token (PAT) with Read, Write & Delete permissions
- `DATABASE_URL` (optional) - Test database URL for CI tests

## 🛡️ Environment Variables

| Variable         | Description                  | Required | Default       |
| ---------------- | ---------------------------- | -------- | ------------- |
| `DATABASE_URL`   | PostgreSQL connection string | Yes      | -             |
| `JWT_SECRET`     | Secret key for JWT tokens    | Yes      | -             |
| `JWT_EXPIRES_IN` | JWT token expiration time    | No       | `7d`          |
| `PORT`           | Server port                  | No       | `3000`        |
| `NODE_ENV`       | Environment mode             | No       | `development` |
| `ARCJET_KEY`     | Arcjet API key               | No       | -             |

## 📝 Database Schema

### Users Table

```sql
- id: serial (primary key)
- name: varchar(255)
- email: varchar(255) (unique)
- password: varchar(255) (hashed)
- role: varchar(50) (default: 'user')
- created_at: timestamp
- updated_at: timestamp
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm test && npm run lint`)
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

ISC

## 🐛 Issues

If you encounter any issues, please [open an issue](https://github.com/bdrn/production-api/issues) on GitHub.

## 📚 Additional Documentation

- [Docker Setup Guide](./DOCKER.md) - Detailed Docker configuration
- [Quick Start Guide](./QUICKSTART.md) - Quick setup instructions

## 👤 Author

**Mohamad Badran**

- GitHub: [@bdrn](https://github.com/bdrn)
- Repository: [production-api](https://github.com/bdrn/production-api)

---

Built with ❤️ using Express.js, Node.js, and PostgreSQL
