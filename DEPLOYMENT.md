# Deployment Guide

## Docker Deployment

This project includes Docker configuration for easy deployment.

### Prerequisites

- Docker (version 20.10+)
- Docker Compose (version 2.0+)

### Files Created

- `Dockerfile` - Multi-stage build configuration (uses Node.js with `serve` package)
- `docker-compose.yml` - Service orchestration with service name `web-panel`
- `.dockerignore` - Files to exclude from Docker build

**Note**: Nginx is not included in the container. Handle reverse proxy configuration on your server.

### Build and Run

#### Option 1: Using Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f web-panel

# Stop the container
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

#### Option 2: Using Docker Commands

```bash
# Build the image
docker build -t metaalearn-web-panel:latest .

# Run the container
docker run -d \
  --name metaalearn-web-panel \
  -p 80:80 \
  --restart unless-stopped \
  metaalearn-web-panel:latest

# View logs
docker logs -f metaalearn-web-panel

# Stop and remove
docker stop metaalearn-web-panel
docker rm metaalearn-web-panel
```

### Port Configuration

By default, the application runs on port **3000**. To change the port:

Edit `docker-compose.yml`:
```yaml
ports:
  - "8080:3000"  # Change 8080 to your desired host port
```

### Environment Variables

**IMPORTANT**: The API URL must be set at **build time** because Vite bakes environment variables into the bundle.

#### Option 1: Edit docker-compose.yml (Recommended)

Edit the `VITE_API_BASE_URL` in docker-compose.yml:

```yaml
services:
  web-panel:
    build:
      args:
        VITE_API_BASE_URL: http://your-api-server:5000  # Change this!
```

#### Option 2: Use .env.production file

Edit `.env.production` with your API URL, then rebuild:

```bash
docker-compose build --no-cache
docker-compose up -d
```

#### Option 3: Pass as build argument

```bash
docker-compose build --build-arg VITE_API_BASE_URL=http://your-api:5000
docker-compose up -d
```

**Common API URLs:**
- Local API: `http://localhost:5000`
- Server API: `http://94.101.186.126:5000`
- Domain API: `https://api.metaalearn.com`

### Health Check

The container includes a health check:
- URL: `http://localhost:3000/`
- Interval: 30 seconds
- Timeout: 10 seconds

Check health status:
```bash
docker inspect --format='{{.State.Health.Status}}' metaalearn-web-panel
```

### Accessing the Application

After deployment:
- Local: `http://localhost:3000`
- Server: `http://your-server-ip:3000`

**Important**: Configure your server's Nginx to reverse proxy to port 3000.

### Troubleshooting

#### View Container Logs
```bash
docker-compose logs -f web-panel
```

#### Access Container Shell
```bash
docker-compose exec web-panel sh
```

#### Rebuild Without Cache
```bash
docker-compose build --no-cache
docker-compose up -d
```

#### Check Container is Running
```bash
docker-compose ps
curl http://localhost:3000
```

### Production Considerations

1. **Reverse Proxy**: Configure your server's Nginx to proxy to `http://localhost:3000`
2. **SSL/TLS**: Handle HTTPS at the Nginx level on your server
3. **Port**: The container uses port 3000 internally
4. **Networks**: Customize the network configuration as needed
5. **Resources**: Set CPU and memory limits in docker-compose.yml

### Example Nginx Configuration (on your server)

Add this to your server's Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
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
```

### Example with Resource Limits

```yaml
services:
  web-panel:
    # ... other config
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Updating the Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build

# Clean up old images (optional)
docker image prune -f
```
