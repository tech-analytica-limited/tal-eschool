# Docker Deployment Guide

Quick guide to deploy TAL-Eschool using Docker and Portainer.

---

## Docker Images

```
Backend:  techanalytica/tal-eschool-be:latest
Frontend: techanalytica/tal-eschool-fe:latest

Ports:
- Backend: 37862
- Frontend: 37861
- Database: 31.97.190.200:37860
```

---

## Deploy with Portainer

### Step 1: Login to Portainer
Access your Portainer web UI

### Step 2: Create Stack
1. Go to **Stacks** → **Add Stack**
2. Name: `tal-eschool`
3. Select **Web editor**

### Step 3: Paste Configuration

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
      - JWT_SECRET=CHANGE_THIS_TO_SECURE_RANDOM_STRING
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

### Step 4: Run Database Migrations (Before Deploy)

Run migrations from your local machine:

```bash
cd backend

# Set production database URL
export DATABASE_URL="postgresql://postgres:postgres@31.97.190.200:37860/postgres?schema=public"

# Run migrations
npx prisma migrate deploy

# Seed demo data
npx prisma db seed
```

### Step 5: Deploy
Click **Deploy the stack** and wait for containers to start

### Step 6: Access Application

**URL:** http://31.97.190.200:37861

**Test Accounts:**
```
Super Admin: superadmin@xyz.com / Admin@123
School Admin: admin@abc.com / Admin@123
Teacher: teacher1@abc.com / Teacher@123
```

---

## Security

### Generate Secure JWT Secret

```bash
openssl rand -base64 32
```

Update `JWT_SECRET` in Portainer:
1. Stacks → tal-eschool → Editor
2. Replace `CHANGE_THIS_TO_SECURE_RANDOM_STRING`
3. Click **Update the stack**

---

## Update Deployment

### Via Portainer:
Stacks → tal-eschool → **Pull and redeploy**

### Via Docker CLI:
```bash
docker-compose pull
docker-compose up -d --force-recreate
```

---

## Troubleshooting

### View Logs
```bash
docker logs tal-eschool-backend
docker logs tal-eschool-frontend
```

### Container Won't Start
```bash
# Check logs
docker logs --tail 50 tal-eschool-backend

# Check ports
netstat -tuln | grep 37862
netstat -tuln | grep 37861
```

### Database Connection Issues
```bash
# Test database connection
docker run --rm postgres:17 psql -h 31.97.190.200 -p 37860 -U postgres -d postgres
```

### Restart Containers
```bash
docker restart tal-eschool-backend
docker restart tal-eschool-frontend
```

---

That's it! Your application should be running. 🚀
