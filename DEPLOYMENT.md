# Deployment Guide

## Architecture

```
Frontend (Vercel) → Backend API (Hetzner VPS) → PostgreSQL (Supabase/Hetzner)
```

---

## Backend Deployment (Hetzner Ubuntu 22.04)

### Initial Server Setup

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
nvm alias default 18

# Install PostgreSQL (if self-hosting)
sudo apt install postgresql postgresql-contrib -y

# Install Nginx
sudo apt install nginx -y

# Install PM2 globally
npm install -g pm2

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

### Application Deployment

```bash
# Clone repository
cd /var/www
sudo mkdir -p immigrationai
sudo chown $USER:$USER immigrationai
cd immigrationai
git clone https://github.com/yourusername/immigration_ai.git .

# Install dependencies
cd backend
npm install --production

# Set up environment variables
cp .env.example .env
nano .env  # Edit with your production values

# Run migrations
npx prisma migrate deploy

# Build TypeScript
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow instructions to enable on boot
```

### PM2 ecosystem.config.js

Create `backend/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'immigration-backend',
      script: './dist/app.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
    },
  ],
};
```

### Nginx Configuration

Create `/etc/nginx/sites-available/api.immigrationai.co.za`:

```nginx
server {
    listen 80;
    server_name api.immigrationai.co.za;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.immigrationai.co.za;

    # SSL certificates (will be added by Certbot)
    ssl_certificate /etc/letsencrypt/live/api.immigrationai.co.za/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.immigrationai.co.za/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Increase body size for file uploads
    client_max_body_size 10M;

    # Proxy to Node.js backend
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:4000/health;
        access_log off;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/api.immigrationai.co.za /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

### SSL Setup

```bash
sudo certbot --nginx -d api.immigrationai.co.za
```

Certbot will automatically configure SSL and set up auto-renewal.

### Database Setup

#### Option 1: Supabase (Recommended)

1. Create account at https://supabase.com
2. Create new project
3. Get connection string from Settings → Database
4. Add to `backend/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
   ```

#### Option 2: Self-Hosted PostgreSQL

```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE immigration_ai;
CREATE USER immigration_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE immigration_ai TO immigration_user;
\q

# Update .env
DATABASE_URL="postgresql://immigration_user:your_secure_password@localhost:5432/immigration_ai"
```

### Maintenance Commands

```bash
# View logs
pm2 logs immigration-backend

# Restart application
pm2 restart immigration-backend

# Stop application
pm2 stop immigration-backend

# View status
pm2 status

# Monitor in real-time
pm2 monit

# Backup database (if self-hosted)
pg_dump -U immigration_user immigration_ai > backup_$(date +%Y%m%d).sql

# Update application
cd /var/www/immigrationai
git pull
cd backend
npm install --production
npm run build
npx prisma migrate deploy
pm2 restart immigration-backend
```

---

## Frontend Deployment (Vercel)

### One-Click Deploy

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `/` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://api.immigrationai.co.za
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Custom Domain Setup

1. In Vercel Dashboard → Settings → Domains
2. Add your domain: `immigrationai.co.za`
3. Follow DNS configuration instructions
4. Vercel will automatically provision SSL certificates

### Deployment Command

Vercel automatically deploys on every push to the main branch. For manual deployment:

```bash
npm install -g vercel
vercel --prod
```

---

## Monitoring

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# View logs
pm2 logs immigration-backend --lines 100

# View specific log file
tail -f /var/www/immigrationai/backend/logs/out.log
tail -f /var/www/immigrationai/backend/logs/err.log
```

### Log Locations

- **PM2 Logs**: `~/.pm2/logs/`
- **Application Logs**: `/var/www/immigrationai/backend/logs/`
- **Nginx Logs**: `/var/log/nginx/access.log` and `/var/log/nginx/error.log`

### Health Check

```bash
# Test backend health endpoint
curl https://api.immigrationai.co.za/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### Database Monitoring

If using Supabase:
- Dashboard → Database → Observability
- View connection stats, query performance, storage usage

If self-hosted:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# View active connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## Troubleshooting

### Database Connection Errors

```bash
# Test connection from server
psql $DATABASE_URL

# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check connection string format
echo $DATABASE_URL  # Should start with postgresql://
```

### CORS Errors

Ensure `FRONTEND_URL` in backend `.env` matches your frontend domain:
```env
FRONTEND_URL=https://immigrationai.co.za
```

### File Upload Errors

1. Check file size limits in Nginx config (`client_max_body_size`)
2. Check upload directory permissions:
   ```bash
   sudo chown -R $USER:$USER /var/www/immigrationai/backend/uploads
   sudo chmod -R 755 /var/www/immigrationai/backend/uploads
   ```

### JWT Errors

1. Verify `JWT_SECRET` and `JWT_REFRESH_SECRET` are set
2. Ensure secrets are at least 32 characters
3. Check token expiration in code matches frontend expectations

### PM2 Process Not Starting

```bash
# Check PM2 logs
pm2 logs immigration-backend --err

# Check if port 4000 is in use
sudo lsof -i :4000

# Restart PM2
pm2 restart all
pm2 save
```

### Nginx 502 Bad Gateway

1. Check if backend is running:
   ```bash
   pm2 status
   ```

2. Check backend logs:
   ```bash
   pm2 logs immigration-backend
   ```

3. Test backend directly:
   ```bash
   curl http://localhost:4000/health
   ```

4. Check Nginx error logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

### SSL Certificate Issues

```bash
# Renew certificate manually
sudo certbot renew

# Check certificate expiration
sudo certbot certificates

# Test auto-renewal
sudo certbot renew --dry-run
```

### High Memory Usage

```bash
# Check memory usage
pm2 monit

# Restart if needed
pm2 restart immigration-backend

# Adjust PM2 memory limit in ecosystem.config.js
max_memory_restart: '2G'  # Increase if needed
```

---

## Backup Strategy

### Database Backups

#### Supabase
- Automatic daily backups included
- Manual backup: Dashboard → Database → Backups

#### Self-Hosted PostgreSQL
```bash
# Daily backup script (add to crontab)
0 2 * * * pg_dump -U immigration_user immigration_ai | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz

# Keep last 30 days
find /backups -name "db_*.sql.gz" -mtime +30 -delete
```

### File Backups

```bash
# Backup uploads directory
tar -czf /backups/uploads_$(date +%Y%m%d).tar.gz /var/www/immigrationai/backend/uploads

# Sync to remote storage (e.g., S3, Backblaze)
# Use rclone or aws-cli
```

---

## Security Checklist

- [x] SSL certificates installed and auto-renewing
- [x] Firewall configured (UFW)
- [x] SSH key-based authentication only
- [x] Environment variables secured (not in Git)
- [x] Database credentials rotated regularly
- [x] JWT secrets are strong (32+ characters)
- [x] Rate limiting enabled on API
- [x] File upload size limits configured
- [x] Regular security updates applied
- [x] PM2 process monitoring enabled
- [x] Log rotation configured
- [x] Database backups automated

---

## Performance Optimization

### Backend

1. Enable PM2 cluster mode (if needed):
   ```javascript
   instances: 'max',
   exec_mode: 'cluster',
   ```

2. Use Redis for session storage (if implementing)

3. Enable database connection pooling (Prisma handles this)

### Frontend

1. Enable Vercel Analytics
2. Optimize images (Next.js Image component)
3. Enable caching headers
4. Use CDN for static assets (Vercel handles this)

---

## Scaling Considerations

### Horizontal Scaling

1. Add more PM2 instances:
   ```javascript
   instances: 4,  // Or 'max' for all CPUs
   exec_mode: 'cluster',
   ```

2. Use load balancer (Nginx upstream):
   ```nginx
   upstream backend {
       server localhost:4000;
       server localhost:4001;
       server localhost:4002;
   }
   ```

3. Database read replicas (Supabase Pro plan)

### Vertical Scaling

1. Upgrade Hetzner server (more RAM/CPU)
2. Upgrade Supabase plan (more database resources)
3. Add Redis cache layer

---

## Support

For deployment issues:
- Check PM2 logs: `pm2 logs immigration-backend`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Check application health: `curl https://api.immigrationai.co.za/health`

For production support, contact: support@immigrationai.co.za
