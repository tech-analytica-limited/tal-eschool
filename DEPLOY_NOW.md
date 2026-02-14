# 🚀 Ready to Deploy - Final Instructions

## 🌐 Domain Configuration

**Your application is configured for**: `taleschool.taldev.xyz`

- **Main Domain**: https://taleschool.taldev.xyz (Super Admin)
- **School Subdomains**: https://{school-slug}.taleschool.taldev.xyz

For complete domain setup instructions, DNS configuration, and SSL setup, see **[DOMAIN_SETUP.md](DOMAIN_SETUP.md)**

---

## ✅ Pre-Deployment Checklist

All done! Your application is ready to deploy:

- ✅ Docker images built and pushed to Docker Hub
- ✅ Database migrations applied successfully  
- ✅ Demo data seeded with test accounts
- ✅ CORS opened for all origins (demo mode)
- ✅ Configuration tested and verified

## 📦 Deployment Steps

### 1. Access Portainer

Navigate to your Portainer instance and go to **Stacks** > **Add Stack**.

### 2. Deploy Stack

1. **Stack Name**: Enter `tal-eschool`
2. **Web Editor**: Copy and paste the contents of `docker-compose.yml` from this repository
3. **Environment Variables**: Already configured in the compose file
4. Click **Deploy the Stack**

### 3. Access Your Application

Once deployed, access your application at:

**Primary Access** (via domain - requires DNS setup):
- **Main App**: https://taleschool.taldev.xyz
- **ABC School**: https://abc.taleschool.taldev.xyz
- **XYZ School**: https://xyz-school.taleschool.taldev.xyz

**Direct Access** (via IP:port - works immediately):
- **Frontend**: http://31.97.190.200:37861
- **Backend API**: http://31.97.190.200:37862

**Note**: Domain access requires DNS configuration. See [DOMAIN_SETUP.md](DOMAIN_SETUP.md) for details.

## 🔑 Login Credentials

### Super Admin (Platform Administrator)
- **Email**: superadmin@xyz.com
- **Password**: Admin@123
- **Access**: All schools and platform settings
- **URL**: https://taleschool.taldev.xyz (or http://31.97.190.200:37861)

### ABC School Admin
- **Email**: admin@abc.com
- **Password**: Admin@123
- **Access**: ABC School management
- **URL**: https://abc.taleschool.taldev.xyz

### ABC School Teacher
- **Email**: teacher1@abc.com
- **Password**: Teacher@123
- **Access**: ABC School teaching features
- **URL**: https://abc.taleschool.taldev.xyz

### XYZ School Admin
- **Email**: admin@xyz-school.com
- **Password**: Admin@123
- **Access**: XYZ School management
- **URL**: https://xyz-school.taleschool.taldev.xyz

## 🗄️ Database

Your database is already configured and running:

- **Host**: 31.97.190.200
- **Port**: 37860
- **Database**: postgres
- **Schema**: public
- **Status**: ✅ Migrations applied, demo data seeded

## 🔧 Post-Deployment

### Verify Deployment

1. **Check Container Logs** in Portainer:
   - Backend should show: `Application is running on port 37862`
   - Frontend should be serving on port 37861

2. **Test Login**:
   - Go to http://31.97.190.200:37861
   - Login with any of the credentials above

3. **Test CORS**:
   - Application accepts requests from any origin (demo mode)
   - No CORS errors should appear

### Container Health

Both containers will show as **healthy** in Portainer once:
- Backend completes startup (runs migrations on startup)
- Frontend builds and serves static files

## ⚠️ Important Notes

### Security
- **DEMO MODE**: CORS is fully open (`origin: true`)
- **Passwords**: All demo accounts use `Admin@123` or `Teacher@123`
- **Production**: Change passwords and restrict CORS before production use

### Architecture
- **Multi-tenant**: Uses school slugs for tenant isolation
- **Subdomains**: Designed for subdomain-based access (abc.taleschool.taldev.xyz)
- **Domain Setup**: Requires DNS wildcard (*.taleschool.taldev.xyz) pointing to server
- **Current Access**: Works via IP:port without DNS setup

### Troubleshooting

**Backend won't start?**
- Check Portainer logs: Look for database connection errors
- Verify DATABASE_URL environment variable is correct

**Frontend won't load?**
- Wait 30 seconds for build to complete
- Check if port 37861 is accessible

**Login fails?**
- Verify database was seeded (see credentials above)
- Check backend logs for authentication errors

## 🎯 Next Steps

### For Demo
1. Deploy to Portainer (2 minutes)
2. Test login with provided credentials
3. Explore multi-tenant features

### FDNS**: Configure wildcard DNS (*.taleschool.taldev.xyz → 31.97.190.200)
2. **SSL**: Setup HTTPS/TLS certificates for taleschool.taldev.xyz
3. **Reverse Proxy**: Setup Nginx/Traefik for domain routing (see [DOMAIN_SETUP.md](DOMAIN_SETUP.md))
4. **Security**: Change all passwords
5. **CORS**: Restrict to specific domains in `backend/src/main.ts`
6. **Backups**: Setup PostgreSQL backup strategy
7. **Backups**: Setup PostgreSQL backup strategy
6. **Monitoring**: Add health checks and logging

## 📚 Additional Documentation

- **README.md**: Complete project overview
- **DOCKER_DEPLOYMENT.md**: Detailed Docker deployment guide
- **docker-compose.yml**: Stack configuration

## 🆘 Need Help?

### Quick Commands

**View Backend Logs**:
```bash
docker logs tal-eschool-backend -f
```

**View Frontend Logs**:
```bash
docker logs tal-eschool-frontend -f
```

**Restart Services** (in Portainer):
Navigate to Stack > tal-eschool > Click "Update" or restart individual containers

---

**Status**: ✅ Ready to Deploy  
**Images**:
- Backend: `techanalytica/tal-eschool-be:latest` (Node 20, OpenSSL compatible)
- Frontend: `techanalytica/tal-eschool-fe:latest` (Node 20)

**Last Updated**: {{ timestamp }}
**Build Status**: All images built and pushed successfully
