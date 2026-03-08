# MarketMind AI - Deployment Guide

## 🚀 Production Deployment Options

---

## Option 1: Docker Deployment (Recommended)

### Create Dockerfile

```dockerfile
# Dockerfile
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libxml2-dev \
    libxslt-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://marketmind:password@db:5432/marketmind
      - OLLAMA_BASE_URL=http://ollama:11434
      - SERPAPI_KEY=${SERPAPI_KEY}
      - REDDIT_CLIENT_ID=${REDDIT_CLIENT_ID}
      - REDDIT_CLIENT_SECRET=${REDDIT_CLIENT_SECRET}
    depends_on:
      - db
      - ollama
    volumes:
      - ./temp:/app/temp
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=marketmind
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=marketmind
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    restart: unless-stopped

  frontend:
    build:
      context: ./marketmind-ui
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  ollama_data:
```

### Frontend Dockerfile

```dockerfile
# marketmind-ui/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

```nginx
# marketmind-ui/nginx.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # API proxy
    location /api/ {
        proxy_pass http://backend:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Deploy

```bash
# Build and start all services
docker-compose up -d

# Pull Ollama model
docker-compose exec ollama ollama pull llama3:8b

# Check logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

---

## Option 2: Cloud Deployment (AWS/GCP/Azure)

### AWS Elastic Beanstalk

1. **Install EB CLI**
```bash
pip install awsebcli
```

2. **Initialize EB**
```bash
eb init -p python-3.11 marketmind-ai
```

3. **Create environment**
```bash
eb create marketmind-prod
```

4. **Set environment variables**
```bash
eb setenv \
  DATABASE_URL=postgresql://... \
  OLLAMA_BASE_URL=http://... \
  SERPAPI_KEY=... \
  REDDIT_CLIENT_ID=... \
  REDDIT_CLIENT_SECRET=...
```

5. **Deploy**
```bash
eb deploy
```

### Google Cloud Run

1. **Build container**
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/marketmind-ai
```

2. **Deploy**
```bash
gcloud run deploy marketmind-ai \
  --image gcr.io/PROJECT_ID/marketmind-ai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=...,OLLAMA_BASE_URL=...
```

### Azure Container Instances

1. **Build and push**
```bash
az acr build --registry myregistry --image marketmind-ai .
```

2. **Deploy**
```bash
az container create \
  --resource-group myResourceGroup \
  --name marketmind-ai \
  --image myregistry.azurecr.io/marketmind-ai \
  --dns-name-label marketmind-ai \
  --ports 8000 \
  --environment-variables \
    DATABASE_URL=... \
    OLLAMA_BASE_URL=...
```

---

## Option 3: VPS Deployment (DigitalOcean/Linode/Vultr)

### Setup Script

```bash
#!/bin/bash
# deploy.sh - Run on fresh Ubuntu 22.04 server

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Python 3.11
sudo apt-get install -y python3.11 python3.11-venv python3-pip

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib
sudo -u postgres createuser marketmind
sudo -u postgres createdb marketmind
sudo -u postgres psql -c "ALTER USER marketmind WITH PASSWORD 'your_password';"

# Install Ollama
curl https://ollama.ai/install.sh | sh
ollama pull llama3:8b

# Clone repository
git clone https://github.com/yourusername/marketmind-ai.git
cd marketmind-ai

# Setup Python environment
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with production values
nano .env

# Build frontend
cd marketmind-ui
npm install
npm run build
cd ..

# Install Nginx
sudo apt-get install -y nginx

# Configure Nginx
sudo tee /etc/nginx/sites-available/marketmind <<EOF
server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location / {
        root /home/ubuntu/marketmind-ai/marketmind-ui/dist;
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/marketmind /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup systemd service for backend
sudo tee /etc/systemd/system/marketmind.service <<EOF
[Unit]
Description=MarketMind AI Backend
After=network.target postgresql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/marketmind-ai
Environment="PATH=/home/ubuntu/marketmind-ai/venv/bin"
ExecStart=/home/ubuntu/marketmind-ai/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable marketmind
sudo systemctl start marketmind

# Setup systemd service for Ollama
sudo tee /etc/systemd/system/ollama.service <<EOF
[Unit]
Description=Ollama Service
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/ollama serve
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable ollama
sudo systemctl start ollama

echo "Deployment complete!"
echo "Access your app at: http://your-domain.com"
```

---

## Option 4: Kubernetes Deployment

### Create Kubernetes manifests

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: marketmind-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: marketmind-backend
  template:
    metadata:
      labels:
        app: marketmind-backend
    spec:
      containers:
      - name: backend
        image: your-registry/marketmind-ai:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: marketmind-secrets
              key: database-url
        - name: OLLAMA_BASE_URL
          value: "http://ollama-service:11434"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
---
apiVersion: v1
kind: Service
metadata:
  name: marketmind-backend
spec:
  selector:
    app: marketmind-backend
  ports:
  - port: 8000
    targetPort: 8000
  type: ClusterIP
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ollama
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ollama
  template:
    metadata:
      labels:
        app: ollama
    spec:
      containers:
      - name: ollama
        image: ollama/ollama:latest
        ports:
        - containerPort: 11434
        volumeMounts:
        - name: ollama-data
          mountPath: /root/.ollama
      volumes:
      - name: ollama-data
        persistentVolumeClaim:
          claimName: ollama-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: ollama-service
spec:
  selector:
    app: ollama
  ports:
  - port: 11434
    targetPort: 11434
  type: ClusterIP
```

### Deploy to Kubernetes

```bash
kubectl apply -f k8s/
kubectl get pods
kubectl logs -f deployment/marketmind-backend
```

---

## Production Checklist

### Security

- [ ] Use HTTPS (Let's Encrypt or cloud provider SSL)
- [ ] Set strong database passwords
- [ ] Use environment variables for secrets (never commit to git)
- [ ] Enable CORS only for your domain
- [ ] Add rate limiting (nginx or application level)
- [ ] Set up firewall rules
- [ ] Use API key authentication for sensitive endpoints
- [ ] Regular security updates

### Performance

- [ ] Use PostgreSQL instead of SQLite
- [ ] Enable database connection pooling
- [ ] Add Redis for caching (optional)
- [ ] Use CDN for frontend assets
- [ ] Enable gzip compression
- [ ] Set up load balancer for multiple instances
- [ ] Monitor response times
- [ ] Optimize database queries

### Monitoring

- [ ] Set up application logging (Sentry, LogRocket)
- [ ] Monitor server resources (CPU, RAM, disk)
- [ ] Track API response times
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure alerts for errors
- [ ] Monitor database performance
- [ ] Track API usage and rate limits

### Backup

- [ ] Automated database backups (daily)
- [ ] Store backups in separate location
- [ ] Test backup restoration
- [ ] Version control for code
- [ ] Document deployment process

### Scaling

- [ ] Horizontal scaling: Multiple backend instances
- [ ] Database read replicas
- [ ] Separate Ollama service (can be expensive)
- [ ] Queue system for long-running tasks (Celery + Redis)
- [ ] Cache frequently accessed data

---

## Environment Variables for Production

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/marketmind

# Ollama
OLLAMA_BASE_URL=http://ollama-service:11434
OLLAMA_MODEL=llama3:8b
OLLAMA_TIMEOUT=180

# API Keys
SERPAPI_KEY=your_production_key
GOOGLE_ADS_DEVELOPER_TOKEN=your_token
GOOGLE_ADS_CLIENT_ID=your_id
GOOGLE_ADS_CLIENT_SECRET=your_secret
GOOGLE_ADS_REFRESH_TOKEN=your_token
GOOGLE_ADS_LOGIN_CUSTOMER_ID=123-456-7890
REDDIT_CLIENT_ID=your_id
REDDIT_CLIENT_SECRET=your_secret

# Security
SECRET_KEY=your_random_secret_key_here
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# CORS
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

---

## Cost Estimates

### Minimum Setup (No API Keys)
- **VPS**: $5-10/month (DigitalOcean, Linode)
- **Domain**: $10-15/year
- **SSL**: Free (Let's Encrypt)
- **Total**: ~$7/month

### Recommended Setup (With SerpAPI)
- **VPS**: $20-40/month (4GB RAM, 2 CPU)
- **SerpAPI**: $50/month (5000 searches)
- **Domain + SSL**: ~$1/month
- **Total**: ~$71/month

### Production Setup
- **Cloud hosting**: $100-200/month
- **Database**: $20-50/month (managed PostgreSQL)
- **APIs**: $100-300/month (Google Ads + SerpAPI)
- **Monitoring**: $20-50/month
- **Total**: ~$240-600/month

---

## Post-Deployment Testing

```bash
# Test health
curl https://your-domain.com/api/health

# Test trend discovery
curl -X POST https://your-domain.com/api/discover-trends \
  -H "Content-Type: application/json" \
  -d '{"region":"India","time_range":"3_months"}'

# Test product analysis
curl -X POST https://your-domain.com/api/analyze-product \
  -H "Content-Type: application/json" \
  -d '{"product":"yoga mat","country":"India","platform":"Amazon","budget":30000}'

# Check frontend
curl https://your-domain.com
```

---

## Maintenance

### Weekly
- Check error logs
- Monitor disk space
- Review API usage

### Monthly
- Update dependencies
- Review security patches
- Analyze performance metrics
- Backup verification

### Quarterly
- Review and optimize database
- Update documentation
- Security audit
- Cost optimization review

---

**Your production deployment is ready! 🚀**
