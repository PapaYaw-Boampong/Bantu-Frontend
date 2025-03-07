# Deployment Guide

## Overview

This guide outlines the process for deploying the Bantu Project application to production environments. The application consists of a React frontend and Node.js microservices backend.

## Prerequisites

- Node.js (v18+)
- PostgreSQL database
- Supabase account (for database and storage)
- Netlify account (for frontend deployment)
- Environment variables configured

## Environment Variables

Create a `.env` file with the following variables:

```
# Frontend
VITE_API_URL=https://api.bantuproject.org
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Backend
DB_USER=postgres
DB_HOST=localhost
DB_NAME=bantu
DB_PASSWORD=your-password
DB_PORT=5432
JWT_SECRET=your-jwt-secret
AUTH_SERVICE_PORT=3001
API_SERVICE_PORT=3002
STORAGE_SERVICE_PORT=3003
```

## Database Setup

### Supabase Setup

1. Create a new Supabase project
2. Run the migration scripts from the `supabase/migrations` directory
3. Configure Row Level Security policies
4. Set up storage buckets for audio files

### Local PostgreSQL (Development)

```bash
# Create database
createdb bantu

# Run migrations
psql -d bantu -f supabase/migrations/20250210154829_spring_swamp.sql
psql -d bantu -f supabase/migrations/20250215161653_morning_math.sql
```

## Frontend Deployment

### Build the Frontend

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

### Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Configure environment variables in Netlify dashboard
4. Deploy the site

### Manual Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy to Netlify
netlify deploy --prod
```

## Backend Deployment

### Option 1: Traditional Server

1. Set up a server with Node.js installed
2. Clone the repository
3. Install dependencies
4. Configure environment variables
5. Start the services

```bash
# Install PM2 for process management
npm install -g pm2

# Start services
pm2 start services/auth/index.js --name auth-service
pm2 start services/api/index.js --name api-service
pm2 start services/storage/index.js --name storage-service

# Save PM2 configuration
pm2 save

# Set up PM2 to start on server boot
pm2 startup
```

### Option 2: Docker Deployment

1. Create Dockerfiles for each service
2. Build Docker images
3. Deploy with Docker Compose

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d
```

Example `docker-compose.yml`:

```yaml
version: '3'
services:
  auth:
    build:
      context: .
      dockerfile: services/auth/Dockerfile
    ports:
      - "3001:3001"
    environment:
      - DB_USER=${DB_USER}
      - DB_HOST=${DB_HOST}
      - DB_NAME=${DB_NAME}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_PORT=${DB_PORT}
      - JWT_SECRET=${JWT_SECRET}
      - AUTH_SERVICE_PORT=${AUTH_SERVICE_PORT}
    restart: always

  api:
    build:
      context: .
      dockerfile: services/api/Dockerfile
    ports:
      - "3002:3002"
    environment:
      - DB_USER=${DB_USER}
      - DB_HOST=${DB_HOST}
      - DB_NAME=${DB_NAME}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_PORT=${DB_PORT}
      - API_SERVICE_PORT=${API_SERVICE_PORT}
    restart: always

  storage:
    build:
      context: .
      dockerfile: services/storage/Dockerfile
    ports:
      - "3003:3003"
    environment:
      - DB_USER=${DB_USER}
      - DB_HOST=${DB_HOST}
      - DB_NAME=${DB_NAME}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_PORT=${DB_PORT}
      - STORAGE_SERVICE_PORT=${STORAGE_SERVICE_PORT}
    restart: always
```

## Reverse Proxy Setup

Configure Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name api.bantuproject.org;

    location /auth/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /storage/ {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## SSL Configuration

Set up SSL with Let's Encrypt:

```bash
# Install Certbot
apt-get install certbot python3-certbot-nginx

# Obtain SSL certificate
certbot --nginx -d api.bantuproject.org
```

## Monitoring and Logging

### PM2 Monitoring

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs
```

### Log Rotation

Configure log rotation with logrotate:

```
/var/log/bantu/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
```

## Backup Strategy

### Database Backups

Set up automated PostgreSQL backups:

```bash
# Create backup script
cat > /usr/local/bin/backup-bantu-db.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
BACKUP_DIR="/var/backups/bantu"
mkdir -p $BACKUP_DIR
pg_dump -U postgres bantu | gzip > "$BACKUP_DIR/bantu_$TIMESTAMP.sql.gz"
find $BACKUP_DIR -type f -mtime +7 -delete
EOF

# Make executable
chmod +x /usr/local/bin/backup-bantu-db.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-bantu-db.sh") | crontab -
```

## Scaling Considerations

- Use a load balancer for distributing traffic across multiple instances
- Implement database read replicas for scaling read operations
- Consider containerization with Kubernetes for advanced scaling
- Implement caching with Redis for frequently accessed data
- Use a CDN for static assets

## Troubleshooting

### Common Issues

- **Database Connection Errors**: Check database credentials and network connectivity
- **Permission Issues**: Ensure proper file permissions for application files
- **Memory Issues**: Monitor and adjust resource allocation as needed
- **SSL Certificate Errors**: Verify certificate validity and renewal

### Diagnostic Commands

```bash
# Check service status
pm2 status

# View service logs
pm2 logs [service-name]

# Test database connection
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1"

# Check network connectivity
curl -v https://api.bantuproject.org/health
```

## Maintenance Procedures

### Updates and Patches

1. Pull latest code from repository
2. Install dependencies
3. Run database migrations
4. Build frontend
5. Restart services

### Rollback Procedure

1. Identify the last stable version
2. Check out that version in the repository
3. Restore database from backup if needed
4. Rebuild and redeploy