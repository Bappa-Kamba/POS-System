# Quick Start - POS System Setup

## Prerequisites Check

```bash
# Check Node.js version (need 18+)
node --version

# Check pnpm version (need 9+)
pnpm --version

# Install NestJS CLI globally
pnpm install -g @nestjs/cli

# Verify installation
nest --version
```

---

## Backend Setup (5 minutes)

### 1. Create Backend Project

```bash
# Create NestJS project
nest new pos-backend

# Choose pnpm as package manager
# Wait for installation to complete

cd pos-backend
```

### 2. Install Dependencies

```bash
# Prisma & Database
pnpm install @prisma/client
pnpm install -D prisma

# Authentication
pnpm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
pnpm install -D @types/passport-jwt @types/bcrypt

# Validation
pnpm install class-validator class-transformer

# Logging
pnpm install winston winston-daily-rotate-file nest-winston

# API Documentation
pnpm install @nestjs/swagger swagger-ui-express

# Config
pnpm install @nestjs/config

# Testing
pnpm install -D @nestjs/testing supertest @types/supertest
```

### 3. Initialize Prisma

```bash
# Initialize Prisma with SQLite
npx prisma init --datasource-provider sqlite

# This creates:
# - prisma/schema.prisma
# - .env file
```

### 4. Configure Environment

```bash
# Edit .env file
cat > .env << EOF
# Database
DATABASE_URL="file:./pos.db"

# Server
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-change-in-production
JWT_EXPIRATION=24h
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_REFRESH_EXPIRATION=7d

# Security
BCRYPT_ROUNDS=10

# Logging
LOG_LEVEL=info
LOG_MAX_FILES=30d

# Backup
BACKUP_ENABLED=true
BACKUP_INTERVAL=24h
BACKUP_RETENTION_DAYS=30

# CORS
CORS_ORIGIN=http://localhost:5173
EOF
```

### 5. Copy Prisma Schema

```bash
# Replace prisma/schema.prisma with the complete schema from the master prompt
# Then run:

npx prisma generate
npx prisma migrate dev --name init
```

### 6. Create Seed Script

```bash
# Create prisma/seed.ts (copy seed script from master prompt)

# Add to package.json:
pnpm pkg set prisma.seed="ts-node prisma/seed.ts"

# Install ts-node
pnpm install -D ts-node

# Run seed
npx prisma db seed
```

### 7. Start Backend

```bash
pnpm run start:dev

# Should see: Application is running on: http://localhost:3000
```

### 8. Verify Backend

```bash
# Open Prisma Studio to see seeded data
npx prisma studio

# Should open at http://localhost:5555
# Verify users, products, and branch exist
```

---

## Frontend Setup (5 minutes)

### 1. Create Frontend Project

```bash
# In a new terminal, go back to parent directory
cd ..

# Create Vite project with React
pnpm create vite@latest pos-frontend -- --template react

cd pos-frontend
```

### 2. Install Dependencies

```bash
# Core dependencies
pnpm install

# Routing
pnpm install react-router-dom

# State Management
pnpm install zustand @tanstack/react-query

# HTTP Client
pnpm install axios

# Forms & Validation
pnpm install react-hook-form @hookform/resolvers zod

# UI & Styling
pnpm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Icons
pnpm install lucide-react

# Charts
pnpm install recharts

# Date handling
pnpm install date-fns

# PDF generation
pnpm install jspdf jspdf-autotable

# Excel export
pnpm install xlsx

# Barcode
pnpm install react-barcode

# Testing
pnpm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### 3. Configure TailwindCSS

```bash
# Replace tailwind.config.js
cat > tailwind.config.js << EOF
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
}
EOF
```

### 4. Update CSS

```bash
# Replace src/index.css
cat > src/index.css << EOF
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary-50: #f0f9ff;
    --color-primary-500: #0ea5e9;
    --color-primary-600: #0284c7;
    --color-primary-700: #0369a1;
  }
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
EOF
```

### 5. Configure Environment

```bash
# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=POS System
VITE_APP_VERSION=1.0.0
EOF
```

### 6. Create Folder Structure

```bash
mkdir -p src/{components,pages,hooks,services,store,utils,router,styles}
mkdir -p src/components/{common,layout,products,pos,reports,dashboard}
mkdir -p src/pages/{auth,admin,cashier}
```

### 7. Start Frontend

```bash
pnpm run dev

# Should see: Local: http://localhost:5173/
```

---

## Verify Complete Setup

### 1. Check Backend

```bash
# In backend terminal, you should see:
# - No errors
# - "Application is running on: http://localhost:3000"

# Test with curl
curl http://localhost:3000

# Should return HTML from NestJS
```

### 2. Check Frontend

```bash
# In browser, open: http://localhost:5173
# Should see Vite + React welcome page (default)
```

### 3. Check Database

```bash
# In backend directory
npx prisma studio

# Should see:
# - users table with admin and cashier
# - products table with sample products
# - branch table with main branch
```

### 4. Test API (Optional)

```bash
# Create a quick test file
cat > test-api.http << EOF
### Login as Admin
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
EOF

# Use REST Client extension in VS Code or curl:
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Should return JWT token
```

---

## Next Steps

Now you're ready to start building! Follow the PROJECT_ROADMAP.md for the build order.

### Recommended First Steps:

1. **Create Auth Module** (Backend)
   ```bash
   cd pos-backend
   nest g module auth
   nest g service auth
   nest g controller auth
   ```

2. **Create Login Page** (Frontend)
   ```bash
   cd pos-frontend
   # Create src/pages/auth/Login.jsx
   # Create src/store/authStore.js
   ```

3. **Test Authentication Flow**
   - Login with admin/admin123
   - Verify JWT token received
   - Store token in Zustand
   - Make authenticated request

---

## Troubleshooting

### Backend won't start
```bash
# Check if port 3000 is already in use
lsof -i :3000

# If something is using it, kill it
kill -9 <PID>

# Or change port in .env
```

### Prisma errors
```bash
# Reset database
npx prisma migrate reset

# Generate client
npx prisma generate

# Run seed again
npx prisma db seed
```

### Frontend build errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
pnpm install
```

### CORS errors
```bash
# Make sure CORS_ORIGIN in backend .env matches frontend URL
# Default should be: CORS_ORIGIN=http://localhost:5173
```

---

## Useful Commands Reference

### Backend
```bash
# Start dev server
pnpm run start:dev

# Build for production
pnpm run build

# Run tests
pnpm run test

# See Prisma Studio
npx prisma studio

# Create new module
nest g module <name>

# Create new service
nest g service <name>

# Create new controller
nest g controller <name>
```

### Frontend
```bash
# Start dev server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Run tests
pnpm run test

# Lint
pnpm run lint
```

### Git
```bash
# Initialize repository
git init

# Create .gitignore
cat > .gitignore << EOF
node_modules/
dist/
.env
*.db
*.db-journal
.DS_Store
logs/
backups/
EOF

# First commit
git add .
git commit -m "feat: initial project setup"
```

---

## Development Workflow

1. **Start both servers**
   ```bash
   # Terminal 1 - Backend
   cd pos-backend && pnpm run start:dev

   # Terminal 2 - Frontend
   cd pos-frontend && pnpm run dev

   # Terminal 3 - Prisma Studio (optional)
   cd pos-backend && npx prisma studio
   ```

2. **Make changes**
   - Edit code in your editor
   - Both servers hot-reload automatically

3. **Test changes**
   - Backend: http://localhost:3000
   - Frontend: http://localhost:5173
   - Database: http://localhost:5555

4. **Commit often**
   ```bash
   git add .
   git commit -m "feat: add specific feature"
   ```

---

## Ready to Code!

You now have:
- ✅ Backend running on port 3000
- ✅ Frontend running on port 5173
- ✅ Database with seed data
- ✅ All dependencies installed
- ✅ Development environment ready

**Time to build!** 🚀

Follow the PROJECT_ROADMAP.md for the step-by-step build order.
