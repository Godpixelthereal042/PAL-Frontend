# PAL Founder Deployment Guide (v3.3)

## Quick Start: Deploying PAL in 4 Steps

### Step 1: Clone & Configure Environment
```bash
git clone https://github.com/pal/pal-frontend.git
cd pal-frontend
cp .env.example .env.production
```

### Step 2: Configure Environment Variables
Edit `.env.production` and configure:
```env
NODE_ENV=production
DATABASE_URL=postgresql://pal_user:your_password@your-db-host:5432/pal_prod
JWT_SECRET=your_32_character_jwt_secret
AUDIT_SIGNATURE_SECRET=your_32_character_audit_secret
STRIPE_SECRET_KEY=sk_live_...
GEMINI_API_KEY=your_gemini_key
```

### Step 3: Run Database Migrations
```bash
npx tsx scripts/runMigrations.ts
```

### Step 4: Launch Production Container
```bash
docker-compose up -d --build
```

Verify deployment health:
```bash
curl http://localhost:3000/api/health
```
