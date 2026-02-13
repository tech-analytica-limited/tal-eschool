# 🚀 Deployment Steps for Demo

## What Changed

✅ **CORS Policy**: Now allows ALL origins (demo configuration)  
✅ **Database Setup**: Run migrations from your local machine  
✅ **Simplified**: Removed CORS environment variable  

---

## Step 1: Run Database Migrations (First Time Only)

```bash
cd backend

# Option 1: Use the script
./migrate-production.sh

# Option 2: Manual commands
export DATABASE_URL="postgresql://postgres:postgres@31.97.190.200:37860/postgres?schema=public"
npx prisma migrate deploy
npx prisma db seed
```

This will:
- Create all database tables
- Seed demo data (schools, users, students, etc.)
- Create test accounts

---

## Step 2: Deploy to Portainer

1. **Login to Portainer** → Stacks → Add Stack

2. **Name**: `tal-eschool`

3. **Paste Configuration**:

```yaml
version: '3.8'

services:
  backend:
    image: techanalytica/tal-eschool-be:latest
    container_name: tal-eschool-backend
    ports:
      - "37862:37862"
    environment:
      - NODE_ENV=production
      - PORT=37862
      - DATABASE_URL=postgresql://postgres:postgres@31.97.190.200:37860/postgres?schema=public
      - JWT_SECRET=demo-jwt-secret-change-in-production
    restart: unless-stopped

  frontend:
    image: techanalytica/tal-eschool-fe:latest
    container_name: tal-eschool-frontend
    ports:
      - "37861:37861"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://31.97.190.200:37862/api
    restart: unless-stopped
```

4. **Deploy** → Wait for containers to start

---

## Step 3: Access Application

**URL**: http://31.97.190.200:37861

**Test Accounts**:
```
Super Admin: superadmin@xyz.com / Admin@123
School Admin: admin@abc.com / Admin@123
Teacher: teacher1@abc.com / Teacher@123
```

---

## Quick Commands

```bash
# Check if containers are running
docker ps

# View backend logs
docker logs -f tal-eschool-backend

# View frontend logs
docker logs -f tal-eschool-frontend

# Restart if needed
docker restart tal-eschool-backend tal-eschool-frontend
```

---

## ⚠️ Demo Configuration Notes

This setup is optimized for **demo purposes**:
- ✅ CORS allows all origins
- ✅ Database is open for testing
- ✅ Simple JWT secret (change for production)

For production deployment:
- Use HTTPS/SSL
- Restrict CORS to specific domains
- Use strong JWT secret: `openssl rand -base64 32`
- Set up firewall rules
- Enable database authentication

---

That's it! Your demo should be running now. 🎉
