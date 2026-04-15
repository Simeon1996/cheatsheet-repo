import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  await prisma.category.deleteMany({
    where: { name: "Docker", userId: null },
  });

  const docker = await prisma.category.create({
    data: {
      name: "Docker",
      icon: "🐋",
      color: "cyan",
      description: "Docker CLI, Dockerfile patterns, Compose, networking, volumes and registry operations",
      isPublic: true,
      snippets: {
        create: [
          // ── Images ───────────────────────────────────────────────────────────
          {
            title: "Images",
            description: "Build, tag, inspect and clean up Docker images",
            isPublic: true,
            commands: {
              create: [
                { order: 0,  language: "bash", label: "List images",                        content: "docker images" },
                { order: 1,  language: "bash", label: "Build image from Dockerfile",         content: "docker build -t myapp:latest ." },
                { order: 2,  language: "bash", label: "Build with a specific Dockerfile",    content: "docker build -f docker/Dockerfile.prod -t myapp:prod ." },
                { order: 3,  language: "bash", label: "Build with build args",               content: "docker build --build-arg NODE_ENV=production --build-arg PORT=8080 -t myapp ." },
                { order: 4,  language: "bash", label: "Build for a specific platform",       content: "docker build --platform linux/amd64 -t myapp:amd64 ." },
                { order: 5,  language: "bash", label: "Build multi-platform and push",       content: "docker buildx build --platform linux/amd64,linux/arm64 -t myrepo/myapp:latest --push ." },
                { order: 6,  language: "bash", label: "Tag an image",                        content: "docker tag myapp:latest myrepo/myapp:1.0.0" },
                { order: 7,  language: "bash", label: "Pull image",                          content: "docker pull nginx:alpine" },
                { order: 8,  language: "bash", label: "Push image to registry",              content: "docker push myrepo/myapp:1.0.0" },
                { order: 9,  language: "bash", label: "Inspect image layers and metadata",   content: "docker inspect myapp:latest" },
                { order: 10, language: "bash", label: "Show image layer history and sizes",  content: "docker history myapp:latest" },
                { order: 11, language: "bash", label: "Remove image",                        content: "docker rmi myapp:latest" },
                { order: 12, language: "bash", label: "Remove all dangling images",          content: "docker image prune" },
                { order: 13, language: "bash", label: "Remove all unused images",            content: "docker image prune -a" },
                { order: 14, language: "bash", label: "Save image to tar file",              content: "docker save myapp:latest | gzip > myapp.tar.gz" },
                { order: 15, language: "bash", label: "Load image from tar file",            content: "docker load < myapp.tar.gz" },
              ],
            },
          },
          // ── Containers ───────────────────────────────────────────────────────
          {
            title: "Containers",
            description: "Run, stop, inspect and manage container lifecycles",
            isPublic: true,
            commands: {
              create: [
                { order: 0,  language: "bash", label: "List running containers",                    content: "docker ps" },
                { order: 1,  language: "bash", label: "List all containers (including stopped)",    content: "docker ps -a" },
                { order: 2,  language: "bash", label: "Run container (foreground)",                 content: "docker run nginx:alpine" },
                { order: 3,  language: "bash", label: "Run container (detached + named)",           content: "docker run -d --name webserver nginx:alpine" },
                { order: 4,  language: "bash", label: "Run with port mapping",                      content: "docker run -d -p 8080:80 nginx:alpine" },
                { order: 5,  language: "bash", label: "Run with environment variables",             content: "docker run -d -e NODE_ENV=production -e PORT=3000 myapp:latest" },
                { order: 6,  language: "bash", label: "Run with env file",                          content: "docker run -d --env-file .env myapp:latest" },
                { order: 7,  language: "bash", label: "Run with volume mount",                      content: "docker run -d -v $(pwd)/data:/app/data myapp:latest" },
                { order: 8,  language: "bash", label: "Run interactively and remove on exit",       content: "docker run -it --rm ubuntu:22.04 bash" },
                { order: 9,  language: "bash", label: "Run with resource limits",                   content: "docker run -d --memory=512m --cpus=1.5 myapp:latest" },
                { order: 10, language: "bash", label: "Run with restart policy",                    content: "docker run -d --restart=unless-stopped myapp:latest" },
                { order: 11, language: "bash", label: "Stop container",                             content: "docker stop webserver" },
                { order: 12, language: "bash", label: "Start stopped container",                    content: "docker start webserver" },
                { order: 13, language: "bash", label: "Restart container",                          content: "docker restart webserver" },
                { order: 14, language: "bash", label: "Remove container",                           content: "docker rm webserver" },
                { order: 15, language: "bash", label: "Stop and remove container",                  content: "docker rm -f webserver" },
                { order: 16, language: "bash", label: "Remove all stopped containers",              content: "docker container prune -f" },
                { order: 17, language: "bash", label: "Stop all running containers",                content: "docker stop $(docker ps -q)" },
              ],
            },
          },
          // ── Logs & Exec ───────────────────────────────────────────────────────
          {
            title: "Logs, Exec & Inspect",
            description: "Debug running containers — logs, shell access and low-level inspection",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "Stream container logs",                     content: "docker logs -f webserver" },
                { order: 1, language: "bash", label: "Show last 100 lines with timestamps",       content: "docker logs --tail=100 --timestamps webserver" },
                { order: 2, language: "bash", label: "Logs since a time",                         content: "docker logs --since=1h webserver" },
                { order: 3, language: "bash", label: "Execute command in running container",      content: "docker exec webserver cat /etc/nginx/nginx.conf" },
                { order: 4, language: "bash", label: "Open interactive shell in container",       content: "docker exec -it webserver /bin/sh" },
                { order: 5, language: "bash", label: "Open shell as root",                        content: "docker exec -it -u root webserver /bin/bash" },
                { order: 6, language: "bash", label: "Inspect container (full JSON metadata)",    content: "docker inspect webserver" },
                { order: 7, language: "bash", label: "Get container IP address",                  content: "docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' webserver" },
                { order: 8, language: "bash", label: "Show live resource usage",                  content: "docker stats" },
                { order: 9, language: "bash", label: "Show resource usage (single, no stream)",   content: "docker stats webserver --no-stream" },
                { order: 10, language: "bash", label: "Show running processes inside container",  content: "docker top webserver" },
                { order: 11, language: "bash", label: "Copy file from container",                 content: "docker cp webserver:/etc/nginx/nginx.conf ./nginx.conf" },
                { order: 12, language: "bash", label: "Copy file into container",                 content: "docker cp ./nginx.conf webserver:/etc/nginx/nginx.conf" },
                { order: 13, language: "bash", label: "Diff filesystem changes vs image",         content: "docker diff webserver" },
              ],
            },
          },
          // ── Volumes ───────────────────────────────────────────────────────────
          {
            title: "Volumes",
            description: "Create and manage named volumes for persistent data",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "List volumes",                              content: "docker volume ls" },
                { order: 1, language: "bash", label: "Create named volume",                       content: "docker volume create pgdata" },
                { order: 2, language: "bash", label: "Inspect volume",                            content: "docker volume inspect pgdata" },
                { order: 3, language: "bash", label: "Mount named volume into container",         content: "docker run -d -v pgdata:/var/lib/postgresql/data postgres:16" },
                { order: 4, language: "bash", label: "Bind mount current directory",              content: "docker run -d -v $(pwd):/app -w /app node:20 node index.js" },
                { order: 5, language: "bash", label: "Read-only bind mount",                      content: "docker run -d -v $(pwd)/config:/app/config:ro myapp" },
                { order: 6, language: "bash", label: "Backup volume to tar",                      content: "docker run --rm -v pgdata:/data -v $(pwd):/backup alpine tar czf /backup/pgdata.tar.gz -C /data ." },
                { order: 7, language: "bash", label: "Restore volume from tar",                   content: "docker run --rm -v pgdata:/data -v $(pwd):/backup alpine tar xzf /backup/pgdata.tar.gz -C /data" },
                { order: 8, language: "bash", label: "Remove volume",                             content: "docker volume rm pgdata" },
                { order: 9, language: "bash", label: "Remove all unused volumes",                 content: "docker volume prune -f" },
              ],
            },
          },
          // ── Networking ────────────────────────────────────────────────────────
          {
            title: "Networking",
            description: "Create networks and connect containers together",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "List networks",                             content: "docker network ls" },
                { order: 1, language: "bash", label: "Create bridge network",                     content: "docker network create mynetwork" },
                { order: 2, language: "bash", label: "Create network with subnet",                content: "docker network create --subnet=172.20.0.0/16 mynetwork" },
                { order: 3, language: "bash", label: "Run container on specific network",         content: "docker run -d --network mynetwork --name api myapp:latest" },
                { order: 4, language: "bash", label: "Connect running container to network",      content: "docker network connect mynetwork webserver" },
                { order: 5, language: "bash", label: "Disconnect container from network",         content: "docker network disconnect mynetwork webserver" },
                { order: 6, language: "bash", label: "Inspect network (see connected containers)", content: "docker network inspect mynetwork" },
                { order: 7, language: "bash", label: "Remove network",                            content: "docker network rm mynetwork" },
                { order: 8, language: "bash", label: "Remove all unused networks",                content: "docker network prune -f" },
              ],
            },
          },
          // ── Dockerfile ────────────────────────────────────────────────────────
          {
            title: "Dockerfile Patterns",
            description: "Production-ready Dockerfile patterns and best practices",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "docker", label: "Node.js multi-stage production build",
                  content: `# ── deps stage ──────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ── build stage ──────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── runtime stage ────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Non-root user
RUN addgroup -S app && adduser -S app -G app
USER app

COPY --from=deps  /app/node_modules ./node_modules
COPY --from=build /app/dist         ./dist

EXPOSE 3000
CMD ["node", "dist/index.js"]`,
                },
                {
                  order: 1, language: "docker", label: "Python multi-stage build",
                  content: `# ── build stage ──────────────────────────────
FROM python:3.12-slim AS build
WORKDIR /app

RUN pip install uv
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-editable

# ── runtime stage ────────────────────────────
FROM python:3.12-slim AS runtime
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \\
    PYTHONUNBUFFERED=1

RUN addgroup --system app && adduser --system --ingroup app app
USER app

COPY --from=build /app/.venv ./.venv
COPY src/ ./src/

ENV PATH="/app/.venv/bin:$PATH"
EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]`,
                },
                {
                  order: 2, language: "docker", label: "Go — single binary scratch image",
                  content: `# ── build stage ──────────────────────────────
FROM golang:1.23-alpine AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server ./cmd/server

# ── runtime stage (minimal) ──────────────────
FROM scratch
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=build /app/server /server
EXPOSE 8080
ENTRYPOINT ["/server"]`,
                },
                {
                  order: 3, language: "docker", label: "Dockerfile best-practice patterns",
                  content: `# Pin base image versions for reproducibility
FROM node:20.18-alpine3.20

# Combine RUN layers to reduce image size
RUN apk add --no-cache curl git && \\
    rm -rf /var/cache/apk/*

# Copy dependency manifests before source code
# (improves layer cache — only re-runs npm ci when lockfile changes)
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Use COPY instead of ADD unless you need auto-extraction
COPY config/ ./config/

# Prefer ENTRYPOINT + CMD for flexibility
ENTRYPOINT ["node"]
CMD ["dist/index.js"]

# HEALTHCHECK
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1

# Document exposed ports and volumes
EXPOSE 3000
VOLUME ["/app/data"]`,
                },
              ],
            },
          },
          // ── Docker Compose ────────────────────────────────────────────────────
          {
            title: "Docker Compose",
            description: "Define and run multi-container applications",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "Start services (detached)",                 content: "docker compose up -d" },
                { order: 1, language: "bash", label: "Start and rebuild images",                  content: "docker compose up -d --build" },
                { order: 2, language: "bash", label: "Start specific service",                    content: "docker compose up -d api" },
                { order: 3, language: "bash", label: "Stop services",                             content: "docker compose down" },
                { order: 4, language: "bash", label: "Stop and remove volumes",                   content: "docker compose down -v" },
                { order: 5, language: "bash", label: "Stream logs for all services",              content: "docker compose logs -f" },
                { order: 6, language: "bash", label: "Stream logs for one service",               content: "docker compose logs -f api" },
                { order: 7, language: "bash", label: "Scale a service",                           content: "docker compose up -d --scale worker=5" },
                { order: 8, language: "bash", label: "Run one-off command in service",            content: "docker compose run --rm api python manage.py migrate" },
                { order: 9, language: "bash", label: "Exec into running service",                 content: "docker compose exec api /bin/sh" },
                { order: 10, language: "bash", label: "Restart a service",                        content: "docker compose restart api" },
                { order: 11, language: "bash", label: "Pull latest images for all services",      content: "docker compose pull" },
                { order: 12, language: "bash", label: "Show running service status",              content: "docker compose ps" },
                { order: 13, language: "bash", label: "Validate compose file",                    content: "docker compose config" },
                { order: 14, language: "bash", label: "Use alternate compose file",               content: "docker compose -f docker-compose.prod.yml up -d" },
                {
                  order: 15, language: "yaml", label: "Full compose.yml example",
                  content: `services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
      target: runtime
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/app
    env_file:
      - .env
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    networks:
      - backend

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: app
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d app"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend

  redis:
    image: redis:7-alpine
    command: redis-server --save 60 1 --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redisdata:/data
    networks:
      - backend

volumes:
  pgdata:
  redisdata:

networks:
  backend:
    driver: bridge`,
                },
              ],
            },
          },
          // ── Registry & Security ───────────────────────────────────────────────
          {
            title: "Registry & Security",
            description: "Login to registries, scan images and manage credentials",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "Login to Docker Hub",                       content: "docker login" },
                { order: 1, language: "bash", label: "Login to private registry",                 content: "docker login registry.example.com" },
                { order: 2, language: "bash", label: "Logout",                                    content: "docker logout" },
                { order: 3, language: "bash", label: "Search Docker Hub",                         content: "docker search nginx --limit 10" },
                { order: 4, language: "bash", label: "Scan image for vulnerabilities (Scout)",    content: "docker scout cves myapp:latest" },
                { order: 5, language: "bash", label: "Show Scout recommendations",                content: "docker scout recommendations myapp:latest" },
                { order: 6, language: "bash", label: "Run as non-root (verify)",                  content: "docker run --rm myapp:latest whoami" },
                { order: 7, language: "bash", label: "Run read-only filesystem",                  content: "docker run --read-only --tmpfs /tmp myapp:latest" },
                { order: 8, language: "bash", label: "Drop all capabilities (least privilege)",   content: "docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE myapp:latest" },
                { order: 9, language: "bash", label: "Run with security options",                 content: "docker run --security-opt=no-new-privileges:true myapp:latest" },
              ],
            },
          },
          // ── System & Cleanup ──────────────────────────────────────────────────
          {
            title: "System & Cleanup",
            description: "Reclaim disk space and inspect Docker system usage",
            isPublic: true,
            commands: {
              create: [
                { order: 0, language: "bash", label: "Show disk usage by resource type",          content: "docker system df" },
                { order: 1, language: "bash", label: "Show verbose disk usage",                   content: "docker system df -v" },
                { order: 2, language: "bash", label: "Remove all unused resources (safe prune)",  content: "docker system prune" },
                { order: 3, language: "bash", label: "Remove everything including volumes",       content: "docker system prune -a --volumes" },
                { order: 4, language: "bash", label: "Remove dangling images only",               content: "docker image prune -f" },
                { order: 5, language: "bash", label: "Remove unused images (including tagged)",   content: "docker image prune -a -f" },
                { order: 6, language: "bash", label: "Show Docker version info",                  content: "docker version" },
                { order: 7, language: "bash", label: "Show Docker system info",                   content: "docker info" },
                { order: 8, language: "bash", label: "Show all Docker events (live)",             content: "docker events" },
                { order: 9, language: "bash", label: "Kill all running containers",               content: "docker kill $(docker ps -q)" },
                { order: 10, language: "bash", label: "Remove all containers, images and volumes (nuclear)", content: "docker stop $(docker ps -q) && docker system prune -a --volumes -f" },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Docker cheatsheet: ${docker.name} (${docker.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
