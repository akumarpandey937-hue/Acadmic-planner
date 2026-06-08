# AcademicOS Deployment Guide

## Deployment Options

1. **VPS (DigitalOcean, AWS EC2, Linode)** – Full control
2. **Railway / Render** – Easy Node.js hosting
3. **Docker** – Containerized deployment
4. **MongoDB Atlas** – Managed database (recommended)

---

## 1. MongoDB Atlas Setup

1. Create account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free M0 cluster
3. Database Access → Add user with read/write permissions
4. Network Access → Allow `0.0.0.0/0` (or your server IP)
5. Connect → Copy connection string:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/academicos
   ```

---

## 2. Environment Configuration (Production)

```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/academicos
JWT_SECRET=generate-a-64-char-random-string-here
JWT_EXPIRE=7d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=AcademicOS <noreply@yourdomain.com>

OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...

ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=StrongPassword123!
```

Generate JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 3. VPS Deployment (Ubuntu 22.04)

### Install Dependencies
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx
sudo npm install -g pm2
```

### Deploy Application
```bash
cd /var/www
git clone <your-repo-url> academicos
cd academicos
cp .env.example .env
# Edit .env with production values

cd backend
npm install --production
pm2 start server.js --name academicos
pm2 save
pm2 startup
```

### Nginx Reverse Proxy
```nginx
# /etc/nginx/sites-available/academicos
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 10M;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/academicos /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### SSL with Certbot
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 4. Docker Deployment

Create `Dockerfile` in project root:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "backend/server.js"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    env_file: .env
    depends_on:
      - mongo
    volumes:
      - uploads:/app/backend/uploads
    restart: unless-stopped

  mongo:
    image: mongo:7
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

volumes:
  mongo_data:
  uploads:
```

```bash
docker-compose up -d
```

---

## 5. Railway / Render

### Railway
1. Connect GitHub repo
2. Set root directory to `backend`
3. Add environment variables from `.env.example`
4. Railway auto-detects Node.js and runs `npm start`
5. Set custom domain in settings

### Render
1. New Web Service → Connect repo
2. Build Command: `cd backend && npm install`
3. Start Command: `cd backend && node server.js`
4. Add environment variables
5. Use Render MongoDB or Atlas connection string

---

## 6. Post-Deployment Checklist

- [ ] Change default admin password
- [ ] Set strong `JWT_SECRET`
- [ ] Configure SMTP for email verification
- [ ] Add OpenAI/Gemini API keys
- [ ] Enable HTTPS
- [ ] Set `NODE_ENV=production`
- [ ] Configure MongoDB Atlas IP whitelist
- [ ] Set up PM2 monitoring: `pm2 monit`
- [ ] Configure backup for MongoDB
- [ ] Test all auth flows (register, login, reset password)
- [ ] Test AI features with credits

---

## 7. Monitoring & Logs

```bash
# PM2 logs
pm2 logs academicos

# PM2 status
pm2 status

# Restart after updates
cd /var/www/academicos/backend
git pull
npm install --production
pm2 restart academicos
```

---

## 8. Scaling Considerations

- Use MongoDB Atlas M10+ for production workloads
- Add Redis for session caching (optional)
- Use CDN for static assets (Cloudflare)
- Horizontal scaling with PM2 cluster mode:
  ```bash
  pm2 start server.js -i max --name academicos
  ```
- Rate limits are per-instance; use Redis store for distributed rate limiting at scale

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection failed | Check Atlas IP whitelist and credentials |
| CORS errors | Update `FRONTEND_URL` in `.env` |
| Email not sending | Verify SMTP credentials; check mock logs |
| AI features return fallback | Add valid `OPENAI_API_KEY` or `GEMINI_API_KEY` |
| File uploads fail | Ensure `backend/uploads/` exists with write permissions |
| 502 Bad Gateway | Check if Node process is running: `pm2 status` |
