# Marriott Hotel Reservation - Deployment Guide

## Deployment Options

### 1. Docker & Docker Compose (Recommended for Local/Development)

```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 2. Heroku Deployment

#### Prerequisites
- Heroku CLI installed
- Heroku account

#### Steps

```bash
# Login to Heroku
heroku login

# Create Heroku app
heroku create marriott-reservation-app

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev -a marriott-reservation-app

# Set environment variables
heroku config:set JWT_SECRET=your-secret-key -a marriott-reservation-app
heroku config:set SMTP_HOST=smtp.gmail.com -a marriott-reservation-app
heroku config:set SMTP_USER=your-email@gmail.com -a marriott-reservation-app
heroku config:set SMTP_PASS=your-app-password -a marriott-reservation-app

# Deploy
git push heroku main

# Run migrations
heroku run npm run migrate -a marriott-reservation-app
```

### 3. AWS Deployment

#### Using EC2 + RDS

1. **Create RDS PostgreSQL Instance**
   - Go to AWS RDS Console
   - Create DB instance with PostgreSQL 14
   - Note the endpoint and credentials

2. **Create EC2 Instance**
   - Launch Ubuntu 22.04 LTS instance
   - Configure security groups to allow ports 80, 443, 5000, 3000

3. **SSH into EC2 and Install Dependencies**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Install Nginx
   sudo apt install -y nginx
   ```

4. **Clone and Setup Application**
   ```bash
   cd /home/ubuntu
   git clone https://github.com/nadeemdibbah-cpu/marriott-hotel-reservation.git
   cd marriott-hotel-reservation
   
   # Backend setup
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with RDS credentials
   
   # Frontend setup
   cd ../frontend
   npm install
   npm run build
   ```

5. **Configure PM2**
   ```bash
   cd /home/ubuntu/marriott-hotel-reservation/backend
   pm2 start src/server.js --name "marriott-api"
   pm2 startup
   pm2 save
   ```

6. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/default
   ```
   
   Add:
   ```nginx
   upstream backend {
     server 127.0.0.1:5000;
   }
   
   server {
     listen 80;
     server_name your-domain.com;
   
     # Frontend
     location / {
       root /home/ubuntu/marriott-hotel-reservation/frontend/build;
       try_files $uri /index.html;
     }
   
     # API
     location /api {
       proxy_pass http://backend;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```
   
   ```bash
   sudo systemctl restart nginx
   ```

7. **Setup SSL (Let's Encrypt)**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### 4. Azure Deployment

#### Using App Service + Azure Database

1. Create Azure App Service (Node.js runtime)
2. Create Azure Database for PostgreSQL
3. Connect via deployment center using GitHub
4. Set environment variables in App Service Configuration
5. Run migrations using SSH console

## Environment Variables (Production)

### Backend (.env)
```
NODE_ENV=production
PORT=5000
DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=5432
DB_USER=marriott_user
DB_PASSWORD=your-secure-password
DB_NAME=marriott_reservation
JWT_SECRET=your-very-secure-random-secret
JWT_EXPIRY=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
NODE_CORS_ORIGIN=https://your-domain.com
```

### Frontend (.env)
```
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_ENVIRONMENT=production
```

## Database Migrations

```bash
# Run migrations
npm run migrate

# Rollback migrations
npm run migrate:rollback

# Create seed data
npm run seed
```

## Monitoring & Logging

### PM2 Monitoring
```bash
pm2 monit
pm2 logs
pm2 status
```

### Application Logs
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Backup & Recovery

### Database Backup
```bash
pg_dump -h your-rds-endpoint -U marriott_user -d marriott_reservation > backup.sql
```

### Database Restore
```bash
psql -h your-rds-endpoint -U marriott_user -d marriott_reservation < backup.sql
```

## Performance Optimization

1. **Enable CDN** (CloudFront for AWS)
2. **Enable Gzip compression** in Nginx
3. **Setup caching headers**
4. **Use connection pooling** for database
5. **Implement rate limiting**
