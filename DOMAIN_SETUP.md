# Domain Setup for TAL-Eschool

## Domain Configuration

Your application is configured to use **subdomain-based multi-tenancy** on the domain:

**Main Domain**: `taleschool.taldev.xyz`

### Subdomain Structure

- **Main Application**: `https://taleschool.taldev.xyz` (Super Admin access)
- **School Subdomains**: `https://{school-slug}.taleschool.taldev.xyz`

Example school subdomains:
- `https://abc.taleschool.taldev.xyz` (ABC School)
- `https://xyz-school.taleschool.taldev.xyz` (XYZ School)

## DNS Configuration Required

You need to configure DNS records to point to your server IP: `31.97.190.200`

### Required DNS Records

```
# Main domain
taleschool.taldev.xyz         A      31.97.190.200

# Wildcard for all school subdomains
*.taleschool.taldev.xyz       A      31.97.190.200
```

### Alternative: Individual Subdomains

If wildcard is not available, create individual A records:

```
abc.taleschool.taldev.xyz         A      31.97.190.200
xyz-school.taleschool.taldev.xyz  A      31.97.190.200
```

## Reverse Proxy Setup (Nginx/Traefik)

Since your services run on specific ports (37861, 37862), you need a reverse proxy to handle domain routing.

### Option 1: Nginx Configuration

```nginx
# Frontend - Main domain and subdomains
server {
    listen 80;
    listen 443 ssl http2;
    server_name taleschool.taldev.xyz *.taleschool.taldev.xyz;

    # SSL Configuration (if using HTTPS)
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:37861;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API - on port 37862
server {
    listen 37862 ssl http2;
    server_name taleschool.taldev.xyz *.taleschool.taldev.xyz;

    # SSL Configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:37862;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeout for long-running requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### Option 2: Simplified Port Access (Current Setup)

If reverse proxy is not available yet, access services directly via ports:

- **Frontend**: `http://31.97.190.200:37861`
- **Backend API**: `http://31.97.190.200:37862`

**Note**: Frontend is configured to call `https://taleschool.taldev.xyz:37862/api` for the backend. Ensure DNS points correctly.

## SSL/TLS Certificate

For production use with HTTPS, obtain SSL certificates:

### Using Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate for main domain and wildcard
sudo certbot certonly --manual --preferred-challenges dns \
  -d taleschool.taldev.xyz \
  -d *.taleschool.taldev.xyz

# Follow prompts to add TXT records to DNS
```

### Certificate Files Location

```
Certificate: /etc/letsencrypt/live/taleschool.taldev.xyz/fullchain.pem
Private Key: /etc/letsencrypt/live/taleschool.taldev.xyz/privkey.pem
```

## Application Configuration

The application is already configured for your domain:

### Frontend Configuration
- **Environment**: `NEXT_PUBLIC_API_URL=https://taleschool.taldev.xyz:37862/api`
- **Docker Image**: `techanalytica/tal-eschool-fe:latest`

### Backend Configuration
- **CORS**: Open for demo (accepts all origins)
- **Tenant Resolution**: Automatic subdomain detection
- **Docker Image**: `techanalytica/tal-eschool-be:latest`

## How Tenant Resolution Works

The backend automatically extracts the school slug from subdomains:

1. User visits: `https://abc.taleschool.taldev.xyz`
2. Backend extracts: `abc` as the school slug
3. Looks up school in database with `slug = 'abc'`
4. All subsequent requests are scoped to that school

### Example Flow

```
Request: https://abc.taleschool.taldev.xyz/login
         ↓
Backend receives hostname: abc.taleschool.taldev.xyz
         ↓
Extracts subdomain: 'abc'
         ↓
Queries: SELECT * FROM schools WHERE slug = 'abc'
         ↓
Attaches school context to request
         ↓
All API calls scoped to ABC School
```

## Demo Schools

Your seeded database includes two demo schools:

| School | Subdomain | Full URL | Admin Email |
|--------|-----------|----------|-------------|
| **ABC School** | `abc` | `https://abc.taleschool.taldev.xyz` | admin@abc.com |
| **XYZ School** | `xyz-school` | `https://xyz-school.taleschool.taldev.xyz` | admin@xyz-school.com |

### Test Access

Once DNS is configured:

1. **Super Admin**: `https://taleschool.taldev.xyz`
   - Email: superadmin@xyz.com
   - Password: Admin@123

2. **ABC School**: `https://abc.taleschool.taldev.xyz`
   - Admin: admin@abc.com / Admin@123
   - Teacher: teacher1@abc.com / Teacher@123

3. **XYZ School**: `https://xyz-school.taleschool.taldev.xyz`
   - Admin: admin@xyz-school.com / Admin@123

## Deployment Checklist

- [ ] Configure DNS A records (wildcard or individual)
- [ ] Wait for DNS propagation (up to 48 hours, usually 5-10 minutes)
- [ ] Setup reverse proxy (Nginx/Traefik/Caddy)
- [ ] Obtain SSL certificates (Let's Encrypt)
- [ ] Configure SSL in reverse proxy
- [ ] Deploy docker-compose stack in Portainer
- [ ] Test main domain access
- [ ] Test school subdomain access
- [ ] Verify tenant isolation (each school sees only their data)

## Troubleshooting

### DNS Not Resolving

```bash
# Check DNS propagation
nslookup taleschool.taldev.xyz
nslookup abc.taleschool.taldev.xyz

# Or use online tools
# whatsmydns.net
# dnschecker.org
```

### Certificate Issues

```bash
# Test SSL certificate
openssl s_client -connect taleschool.taldev.xyz:443 -servername taleschool.taldev.xyz

# Renew certificates
sudo certbot renew
```

### Subdomain Not Working

1. Check wildcard DNS is configured
2. Verify Nginx/reverse proxy is catching all subdomains
3. Check backend logs for tenant resolution
4. Ensure school slug exists in database

```bash
# Check backend logs
docker logs tal-eschool-backend -f

# Verify school exists
docker exec -it tal-eschool-backend npx prisma studio
# Navigate to School model and check slug values
```

## Quick Test (Before DNS Setup)

To test subdomain routing locally:

```bash
# Add to /etc/hosts (or C:\Windows\System32\drivers\etc\hosts)
31.97.190.200 taleschool.taldev.xyz
31.97.190.200 abc.taleschool.taldev.xyz
31.97.190.200 xyz-school.taleschool.taldev.xyz

# Then access via browser
http://taleschool.taldev.xyz:37861
http://abc.taleschool.taldev.xyz:37861
```

---

**Status**: ✅ Application configured for domain-based multi-tenancy  
**Next Step**: Configure DNS records and reverse proxy  
**Support**: Check backend logs if tenant resolution fails
