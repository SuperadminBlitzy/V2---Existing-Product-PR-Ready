# Node.js Tutorial HTTP Server - Comprehensive Deployment Guide

This comprehensive deployment guide provides detailed documentation for deploying the Node.js tutorial HTTP server application using multiple deployment strategies including direct Node.js execution, Docker containerization, and Docker Compose orchestration. This guide demonstrates fundamental deployment and infrastructure automation practices while teaching essential DevOps concepts through practical hands-on experience.

## Table of Contents

1. [Quick Start Guide](#quick-start-guide)
2. [Deployment Strategies Overview](#deployment-strategies-overview)
3. [Prerequisites and System Requirements](#prerequisites-and-system-requirements)
4. [Direct Node.js Deployment](#direct-nodejs-deployment)
5. [Docker Container Deployment](#docker-container-deployment)
6. [Docker Compose Orchestration](#docker-compose-orchestration)
7. [Configuration Management](#configuration-management)
8. [Health Monitoring and Validation](#health-monitoring-and-validation)
9. [Automation and CI/CD Integration](#automation-and-cicd-integration)
10. [Troubleshooting Guide](#troubleshooting-guide)
11. [Educational Learning Objectives](#educational-learning-objectives)
12. [Maintenance and Operations](#maintenance-and-operations)

## Quick Start Guide

### Automated Deployment (Recommended for Beginners)

The fastest way to get started is using the automated deployment script:

```bash
# Basic deployment with automatic strategy selection
./infrastructure/scripts/deploy.sh

# Deploy using specific strategy with educational logging
./infrastructure/scripts/deploy.sh --strategy direct --verbose

# Docker deployment with production configuration
./infrastructure/scripts/deploy.sh --strategy docker --env production

# Complete orchestration with Docker Compose
./infrastructure/scripts/deploy.sh --strategy docker-compose --verbose
```

### Manual Quick Deployment

For immediate access to the tutorial application:

```bash
# Navigate to backend directory
cd src/backend

# Install dependencies
npm ci --only=production

# Start the application
npm start

# Verify deployment (in new terminal)
curl http://127.0.0.1:3000/hello
# Expected response: "Hello world"
```

### Health Check Validation

After deployment, validate server health using integrated health check tools:

```bash
# Shell-based health check with comprehensive validation
./infrastructure/scripts/health-check.sh --verbose

# Node.js application health check
cd src/backend && npm run health-check

# Combined health validation with fallback
./infrastructure/scripts/health-check.sh --nodejs-fallback --verbose
```

## Deployment Strategies Overview

This tutorial application supports three distinct deployment strategies, each demonstrating different infrastructure concepts and providing progressive learning opportunities:

### Strategy Comparison Matrix

| Strategy | Complexity | Startup Time | Resource Usage | Isolation Level | Educational Focus |
|----------|------------|--------------|----------------|-----------------|-------------------|
| **Direct Node.js** | Low | ~15-30s | Minimal | Process-level | Node.js fundamentals, application lifecycle |
| **Docker Container** | Medium | ~60-180s | Moderate | Container isolation | Containerization, image management |
| **Docker Compose** | High | ~90-300s | Higher | Service orchestration | Orchestration, service management |

### Strategy Selection Guidelines

**Choose Direct Node.js when:**
- Learning Node.js fundamentals
- Local development and debugging
- Resource-constrained environments
- Quick prototyping and experimentation

**Choose Docker Container when:**
- Ensuring environment consistency
- Preparing for production deployment
- Learning containerization concepts
- CI/CD pipeline integration

**Choose Docker Compose when:**
- Learning service orchestration
- Simulating production environments
- Advanced container networking
- Multi-service architecture preparation

## Prerequisites and System Requirements

### Required Software Dependencies

**Core Requirements:**
- **Node.js**: Version 18+ (LTS recommended)
  ```bash
  # Verify Node.js version
  node --version  # Should show v18.x.x or higher
  ```

- **npm**: Version 8+ (included with Node.js)
  ```bash
  # Verify npm version
  npm --version   # Should show 8.x.x or higher
  ```

**Docker-Based Deployments:**
- **Docker Engine**: Version 20.10+ with CLI access
  ```bash
  # Verify Docker installation
  docker --version
  docker info
  ```

- **Docker Compose**: Version 2.0+ for orchestration
  ```bash
  # Verify Docker Compose
  docker-compose --version  # or docker compose version
  ```

**System Utilities:**
- **curl**: Version 7.0+ for health check validation
- **bash**: Version 4.0+ for deployment automation
- **Standard Unix tools**: grep, awk, date, sleep

### System Resource Requirements

**Minimum System Resources:**
- **RAM**: 512MB available memory
- **CPU**: Single core (dual core recommended)
- **Disk**: 100MB free space for application
- **Network**: Localhost network interface available

**Recommended System Resources:**
- **RAM**: 2GB+ for comfortable development
- **CPU**: Dual core for Docker operations
- **Disk**: 1GB+ for Docker images and logs
- **Network**: High-speed connection for image downloads

### Network Configuration

**Port Requirements:**
- **Default Port**: 3000 (configurable via PORT environment variable)
- **Port Range**: 1024-65535 (avoid privileged ports <1024)
- **Binding**: localhost (127.0.0.1) only for security

**Security Considerations:**
- Tutorial configured for localhost-only access
- No external network exposure by default
- Educational safety through restricted binding
- No authentication required (development only)

### Environment Validation

Use the automated prerequisite checker:

```bash
# Comprehensive environment validation
./infrastructure/scripts/deploy.sh --validate-env

# Manual validation steps
node --version              # Check Node.js version
npm --version              # Check npm availability
docker --version           # Check Docker (for container deployments)
lsof -ti:3000             # Check port availability (should be empty)
curl --version            # Check health check tool availability
```

## Direct Node.js Deployment

Direct Node.js deployment provides the simplest deployment method, running the application as a native Node.js process without containerization. This approach offers maximum visibility into application behavior and demonstrates fundamental Node.js server concepts.

### Educational Benefits

Direct deployment teaches:
- Node.js application lifecycle management
- Process management and signal handling
- Environment variable configuration
- Direct dependency management
- Native debugging capabilities

### Step-by-Step Deployment Procedure

#### Step 1: Environment Preparation

```bash
# Navigate to the project root
cd /path/to/nodejs-tutorial-http-server

# Verify Node.js version compatibility
node --version  # Must be 18.0.0 or higher

# Check port availability
lsof -ti:3000 || echo "Port 3000 is available"
```

#### Step 2: Dependency Installation

```bash
# Navigate to backend directory
cd src/backend

# Install production dependencies only
npm ci --only=production

# Verify installation success
npm ls --depth=0
```

#### Step 3: Configuration Setup

```bash
# Copy environment template (optional)
cp .env.example .env

# Review default configuration
cat .env.example
```

**Default Environment Variables:**
```env
# Application Configuration
NODE_ENV=development
PORT=3000
HOST=127.0.0.1

# Logging Configuration  
LOG_LEVEL=info

# Educational Features
EDUCATIONAL_LOGGING=true
VERBOSE_STARTUP=true
```

#### Step 4: Application Startup

```bash
# Method 1: Using npm scripts (recommended)
npm start

# Method 2: Direct Node.js execution
node server.js

# Method 3: With custom port
PORT=8080 node server.js
```

**Expected Startup Output:**
```
================================================================================
🎓 NODE.JS TUTORIAL HTTP SERVER - EDUCATIONAL DEMONSTRATION
================================================================================
📋 APPLICATION INFORMATION
------------------------------------------------------------
   Name: Node.js Tutorial HTTP Server
   Version: 1.0.0
   Description: Educational HTTP server demonstration
   Environment: DEVELOPMENT
   Node.js Version: v18.17.0
   Platform: darwin (arm64)

🌐 SERVER CONFIGURATION
------------------------------------------------------------
   Host: 127.0.0.1
   Port: 3000
   Protocol: HTTP/1.1
   Access URL: http://127.0.0.1:3000
   Primary Endpoint: http://127.0.0.1:3000/hello

🎉 SERVER READY FOR TUTORIAL INTERACTION!
```

#### Step 5: Deployment Verification

```bash
# Test basic connectivity
curl http://127.0.0.1:3000/hello

# Expected response
# Hello world

# Comprehensive health check
cd src/backend
npm run health-check

# View server status in browser
open http://127.0.0.1:3000/hello
```

#### Step 6: Process Management

```bash
# View running Node.js processes
ps aux | grep node

# Graceful shutdown
# Press Ctrl+C in terminal running the server

# Or send SIGTERM signal
kill -TERM $(lsof -ti:3000)
```

### Automated Direct Deployment

Use the deployment automation script for streamlined deployment:

```bash
# Basic direct deployment
./infrastructure/scripts/deploy.sh --strategy direct

# Direct deployment with custom configuration
./infrastructure/scripts/deploy.sh --strategy direct --port 8080 --env development --verbose

# Direct deployment with health validation
./infrastructure/scripts/deploy.sh --strategy direct --health-retries 5 --health-delay 2
```

### Troubleshooting Direct Deployment

**Common Issues and Solutions:**

**Port Already in Use:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process (if safe to do so)
kill -9 $(lsof -ti:3000)

# Or use alternative port
PORT=3001 npm start
```

**Permission Denied:**
```bash
# If using port < 1024, use elevated privileges (not recommended)
sudo PORT=80 node server.js

# Better: Use unprivileged port
PORT=8080 npm start
```

**Module Not Found Errors:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Or use clean install
npm ci
```

## Docker Container Deployment

Docker container deployment provides environment isolation, consistency across platforms, and demonstrates modern containerization practices. This approach encapsulates the application and its dependencies in a portable, reproducible container environment.

### Educational Benefits

Container deployment teaches:
- Docker containerization principles
- Image layering and optimization
- Container lifecycle management
- Environment isolation concepts
- Production deployment preparation

### Container Architecture Overview

The tutorial application uses a multi-stage Dockerfile optimized for both development and production:

**Dockerfile Structure:**
```dockerfile
# Development stage with full tooling
FROM node:22-alpine AS development

# Production dependencies optimization  
FROM node:22-alpine AS production-dependencies

# Final optimized production image
FROM node:22-alpine AS final
```

**Security Features:**
- Non-root user execution (`nodejs-tutorial:nodejs-tutorial`)
- Minimal Alpine Linux base image
- Proper signal handling with `dumb-init`
- Health check integration
- Resource constraints

### Step-by-Step Container Deployment

#### Step 1: Docker Environment Validation

```bash
# Verify Docker installation and status
docker --version
docker info

# Check Docker daemon status
docker ps

# Verify Docker permissions (should not require sudo)
docker run hello-world
```

#### Step 2: Container Image Build

```bash
# Navigate to project root (build context)
cd /path/to/nodejs-tutorial-http-server

# Build container image with educational tags
docker build \
    -f infrastructure/docker/Dockerfile.backend \
    -t nodejs-tutorial:latest \
    -t nodejs-tutorial:1.0.0 \
    --target final \
    .

# Verify image creation
docker images | grep nodejs-tutorial
```

**Expected Build Output:**
```
[+] Building 45.3s (12/12) FINISHED
 => [internal] load build definition from Dockerfile.backend
 => => transferring dockerfile: 2.1kB
 => [internal] load .dockerignore
 => [production-dependencies 3/4] RUN npm ci --only=production
 => [final 4/6] COPY --from=production-dependencies /usr/src/app/node_modules
 => exporting to image
 => => naming to docker.io/library/nodejs-tutorial:latest
```

#### Step 3: Container Startup

```bash
# Run container with port mapping and educational features
docker run \
    --name tutorial-server \
    --publish 127.0.0.1:3000:3000 \
    --detach \
    --restart unless-stopped \
    nodejs-tutorial:latest

# Verify container startup
docker ps

# Expected output shows running container
CONTAINER ID   IMAGE                    COMMAND                  STATUS          PORTS                      NAMES
abc123def456   nodejs-tutorial:latest   "dumb-init node serv…"   Up 30 seconds   127.0.0.1:3000->3000/tcp  tutorial-server
```

#### Step 4: Container Health Validation

```bash
# Check container logs
docker logs tutorial-server

# Execute health check inside container
docker exec tutorial-server node scripts/health-check.js

# Check container health status
docker inspect tutorial-server | jq '.[0].State.Health'

# External health validation
curl http://127.0.0.1:3000/hello
```

#### Step 5: Container Management

```bash
# View container resource usage
docker stats tutorial-server

# Access container shell for debugging
docker exec -it tutorial-server sh

# View container configuration
docker inspect tutorial-server

# Stop container gracefully
docker stop tutorial-server

# Remove container
docker rm tutorial-server
```

### Advanced Container Configuration

**Custom Environment Variables:**
```bash
# Run with custom configuration
docker run \
    --name tutorial-server \
    --publish 127.0.0.1:8080:3000 \
    --env PORT=3000 \
    --env NODE_ENV=production \
    --env LOG_LEVEL=debug \
    --detach \
    nodejs-tutorial:latest
```

**Volume Mounting for Development:**
```bash
# Mount source code for development (bind mount)
docker run \
    --name tutorial-dev \
    --publish 127.0.0.1:3000:3000 \
    --volume "$(pwd)/src/backend:/usr/src/app" \
    --workdir /usr/src/app \
    --interactive --tty \
    nodejs-tutorial:latest sh
```

**Resource Constraints:**
```bash
# Run with memory and CPU limits
docker run \
    --name tutorial-server \
    --publish 127.0.0.1:3000:3000 \
    --memory=256m \
    --cpus="0.5" \
    --detach \
    nodejs-tutorial:latest
```

### Automated Container Deployment

Use the deployment script for streamlined container deployment:

```bash
# Basic Docker deployment
./infrastructure/scripts/deploy.sh --strategy docker

# Docker deployment with custom configuration
./infrastructure/scripts/deploy.sh --strategy docker --env production --port 8080 --verbose

# Docker deployment with resource constraints
./infrastructure/scripts/deploy.sh --strategy docker --memory=512m --cpus=1.0
```

### Container Troubleshooting

**Build Failures:**
```bash
# Build with verbose output for debugging
docker build \
    -f infrastructure/docker/Dockerfile.backend \
    --progress=plain \
    --no-cache \
    -t nodejs-tutorial:debug \
    .

# Check build context size
du -sh .
```

**Runtime Issues:**
```bash
# Check container logs for errors
docker logs --timestamps --follow tutorial-server

# Inspect container process
docker exec tutorial-server ps aux

# Check container network connectivity
docker exec tutorial-server ping localhost
docker exec tutorial-server nc -zv localhost 3000
```

**Performance Issues:**
```bash
# Monitor container resource usage
docker stats tutorial-server

# Check container limits
docker inspect tutorial-server | jq '.[0].HostConfig.Memory'

# Analyze container overhead
docker exec tutorial-server cat /proc/meminfo
```

## Docker Compose Orchestration

Docker Compose orchestration provides advanced service management, networking, and storage capabilities while demonstrating professional container orchestration patterns. This deployment strategy simulates production-like environments with comprehensive service coordination.

### Educational Benefits

Compose orchestration teaches:
- Service orchestration patterns
- Container networking concepts
- Volume management and persistence
- Service discovery and communication
- Infrastructure as Code principles
- Production environment simulation

### Orchestration Architecture

The Docker Compose configuration defines:

**Services:**
- **backend**: Node.js tutorial application with health checks
- **Custom Networks**: Isolated bridge network (`tutorial-network`)
- **Named Volumes**: Persistent log storage (`tutorial-logs`)

**Service Configuration Features:**
- Health check integration with application validation
- Resource constraints (memory, CPU limits)
- Network isolation and custom IP ranges
- Volume mounting for log persistence
- Restart policies for resilience

### Step-by-Step Compose Deployment

#### Step 1: Compose Environment Preparation

```bash
# Verify Docker Compose availability
docker-compose --version || docker compose version

# Navigate to Docker configuration directory
cd infrastructure/docker

# Review compose configuration
cat docker-compose.yml

# Validate compose file syntax
docker-compose config
```

#### Step 2: Service Network and Volume Initialization

```bash
# Create custom network (optional - compose will create automatically)
docker network create tutorial-network --driver bridge --subnet 172.20.0.0/16

# Create named volume for log persistence
docker volume create tutorial-logs

# List existing networks and volumes
docker network ls | grep tutorial
docker volume ls | grep tutorial
```

#### Step 3: Service Build and Startup

```bash
# Build all services with dependency resolution
docker-compose build --parallel

# Start complete service stack in detached mode
docker-compose up --detach

# Verify service startup
docker-compose ps

# Expected output shows healthy services
      Name                     Command                  State                      Ports
---------------------------------------------------------------------------------------------
nodejs-tutorial-backend   dumb-init node server.js     Up (healthy)   127.0.0.1:3000->3000/tcp
```

#### Step 4: Service Health and Status Validation

```bash
# Check service health status
docker-compose ps

# View aggregated service logs
docker-compose logs --follow

# Check specific service logs
docker-compose logs backend

# Execute health check within service context
docker-compose exec backend node scripts/health-check.js
```

#### Step 5: Service Network and Communication Testing

```bash
# Test service network connectivity
docker-compose exec backend ping nodejs-tutorial-backend

# Check internal service discovery
docker-compose exec backend nslookup backend

# Test external endpoint access
curl http://127.0.0.1:3000/hello

# Verify network isolation
docker network inspect nodejs-tutorial-network
```

### Advanced Compose Operations

**Service Scaling (Future Enhancement):**
```bash
# Scale backend service (when configured for scaling)
docker-compose up --scale backend=3

# Note: Current configuration binds to specific port, scaling requires load balancer
```

**Development with Live Reload:**
```bash
# Override for development with volume mounting
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

**Production Configuration:**
```bash
# Production deployment with optimized settings
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --detach
```

### Service Management Commands

**Lifecycle Management:**
```bash
# Start services
docker-compose up --detach

# Stop services gracefully
docker-compose stop

# Restart specific service
docker-compose restart backend

# Remove services and networks
docker-compose down

# Remove with volumes (destructive)
docker-compose down --volumes
```

**Service Monitoring:**
```bash
# View service status
docker-compose ps

# Monitor resource usage
docker-compose top

# Stream service logs
docker-compose logs --follow --timestamps

# Execute commands in service context
docker-compose exec backend sh
```

**Configuration Updates:**
```bash
# Apply configuration changes
docker-compose up --detach --remove-orphans

# Recreate services with new configuration
docker-compose up --detach --force-recreate

# Rebuild and restart after code changes
docker-compose build && docker-compose up --detach
```

### Automated Compose Deployment

Use the deployment script for comprehensive compose orchestration:

```bash
# Basic compose deployment
./infrastructure/scripts/deploy.sh --strategy docker-compose

# Verbose compose deployment with educational logging
./infrastructure/scripts/deploy.sh --strategy docker-compose --verbose

# Production compose deployment
./infrastructure/scripts/deploy.sh --strategy docker-compose --env production --cleanup
```

### Compose Troubleshooting

**Service Startup Issues:**
```bash
# Check service configuration
docker-compose config

# View detailed service logs
docker-compose logs --timestamps backend

# Debug service health checks
docker-compose exec backend node scripts/health-check.js --verbose
```

**Network Connectivity Issues:**
```bash
# Inspect service networks
docker network ls
docker network inspect nodejs-tutorial-network

# Test inter-service connectivity
docker-compose exec backend ping backend
docker-compose exec backend nc -zv backend 3000
```

**Volume and Persistence Issues:**
```bash
# Check volume mounts
docker-compose exec backend df -h
docker-compose exec backend ls -la /usr/src/app/logs

# Inspect volume configuration
docker volume inspect tutorial-logs

# Debug volume permissions
docker-compose exec backend ls -la /usr/src/app/logs
```

## Configuration Management

Comprehensive configuration management enables flexible deployment across different environments while maintaining consistency and security. The tutorial application supports multiple configuration methods including environment variables, configuration files, and deployment-specific settings.

### Configuration Architecture

**Configuration Hierarchy (in order of precedence):**
1. Command line arguments and deployment script options
2. Environment variables
3. `.env` file configuration
4. Application default configuration (`app-config.js`)
5. Server default configuration (`server-config.js`)

### Environment Variables

**Core Application Configuration:**

```bash
# Application Identity
APP_NAME="Node.js Tutorial HTTP Server"
APP_VERSION="1.0.0"
APP_DESCRIPTION="Educational HTTP server demonstration"

# Runtime Environment
NODE_ENV=development|production|test
LOG_LEVEL=debug|info|warn|error

# Network Configuration
HOST=127.0.0.1
PORT=3000
SERVER_TIMEOUT=120000

# Educational Features
EDUCATIONAL_LOGGING=true
VERBOSE_STARTUP=true
STARTUP_BANNER=true

# Health Check Configuration
HEALTH_CHECK_ENDPOINT=/hello
HEALTH_CHECK_TIMEOUT=5000
HEALTH_CHECK_RETRIES=3
```

**Docker-Specific Configuration:**
```bash
# Container resource limits
CONTAINER_MEMORY=256m
CONTAINER_CPUS=0.5

# Container user and security
CONTAINER_USER=nodejs-tutorial
CONTAINER_GROUP=nodejs-tutorial

# Health check configuration
HEALTHCHECK_INTERVAL=30s
HEALTHCHECK_TIMEOUT=10s
HEALTHCHECK_START_PERIOD=40s
```

### Environment-Specific Configuration

#### Development Configuration

Create or modify `.env` file for development:
```bash
# Development Environment Configuration
NODE_ENV=development
LOG_LEVEL=debug
HOST=127.0.0.1
PORT=3000

# Educational features enabled
EDUCATIONAL_LOGGING=true
VERBOSE_STARTUP=true
STARTUP_BANNER=true

# Development-friendly timeouts
HEALTH_CHECK_TIMEOUT=10000
HEALTH_CHECK_RETRIES=5
```

#### Production Configuration

Production environment variables (never commit to version control):
```bash
# Production Environment Configuration  
NODE_ENV=production
LOG_LEVEL=info
HOST=127.0.0.1
PORT=3000

# Optimized for production
EDUCATIONAL_LOGGING=false
VERBOSE_STARTUP=false
STARTUP_BANNER=false

# Production timeouts
HEALTH_CHECK_TIMEOUT=5000
HEALTH_CHECK_RETRIES=3
```

### Deployment Script Configuration

The deployment script supports extensive configuration options:

```bash
# Basic deployment configuration
./infrastructure/scripts/deploy.sh \
    --strategy direct \
    --env development \
    --port 3000 \
    --host 127.0.0.1

# Advanced deployment configuration  
./infrastructure/scripts/deploy.sh \
    --strategy docker-compose \
    --env production \
    --timeout 300 \
    --health-retries 10 \
    --health-delay 3 \
    --verbose \
    --cleanup
```

**Available Deployment Options:**

| Option | Description | Default | Example |
|--------|-------------|---------|---------|
| `--strategy` | Deployment strategy | `direct` | `--strategy docker` |
| `--env` | Environment | `development` | `--env production` |
| `--port` | Server port | `3000` | `--port 8080` |
| `--host` | Server host | `127.0.0.1` | `--host localhost` |
| `--timeout` | Deployment timeout | `120` | `--timeout 300` |
| `--health-retries` | Health check retries | `5` | `--health-retries 10` |
| `--health-delay` | Retry delay (seconds) | `2` | `--health-delay 5` |
| `--verbose` | Educational logging | `false` | `--verbose` |
| `--cleanup` | Post-deployment cleanup | `false` | `--cleanup` |

### Docker Configuration Management

**Container Environment Variables:**
```bash
# Docker run with environment configuration
docker run \
    --env NODE_ENV=production \
    --env LOG_LEVEL=info \
    --env EDUCATIONAL_LOGGING=false \
    --publish 127.0.0.1:3000:3000 \
    --detach \
    nodejs-tutorial:latest

# Environment file with Docker
docker run \
    --env-file .env.production \
    --publish 127.0.0.1:3000:3000 \
    --detach \
    nodejs-tutorial:latest
```

**Docker Compose Environment Configuration:**
```yaml
# docker-compose.yml environment section
services:
  backend:
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
      - EDUCATIONAL_LOGGING=false
      - HEALTH_CHECK_RETRIES=5
    env_file:
      - .env.production
```

### Configuration Validation

**Automated Configuration Validation:**
```bash
# Validate environment configuration
./infrastructure/scripts/deploy.sh --validate-config

# Check configuration completeness
node -e "
const config = require('./src/backend/lib/config/app-config.js');
console.log('Configuration validation:', config.appConfig ? 'PASS' : 'FAIL');
console.log('Server port:', config.appConfig.server?.port || 'DEFAULT');
console.log('Environment:', config.appConfig.environment || 'DEFAULT');
"
```

**Manual Configuration Verification:**
```bash
# Check environment variables
printenv | grep NODE_ENV
printenv | grep PORT
printenv | grep LOG_LEVEL

# Verify configuration file existence
ls -la .env* 2>/dev/null || echo "No .env files found"

# Test configuration loading
cd src/backend
node -e "console.log('Config test:', require('./lib/config/app-config.js').appConfig)"
```

### Configuration Security

**Security Best Practices:**

1. **Never commit sensitive configuration:**
   ```bash
   # .gitignore entries
   .env
   .env.production
   .env.local
   config/secrets.*
   ```

2. **Use environment-specific files:**
   ```bash
   .env.example          # Template with dummy values (commit)
   .env                  # Development config (don't commit)
   .env.production       # Production config (don't commit)
   .env.test             # Test config (don't commit)
   ```

3. **Container secrets management:**
   ```bash
   # Use Docker secrets in production
   docker secret create app_config ./config/production.env
   
   # Mount secrets in compose
   services:
     backend:
       secrets:
         - app_config
   ```

### Configuration Troubleshooting

**Common Configuration Issues:**

**Environment Variable Not Recognized:**
```bash
# Check variable spelling and case sensitivity
printenv | grep -i port
printenv | grep -i node

# Verify variable export in current shell
export PORT=8080
echo $PORT
```

**Configuration File Not Found:**
```bash
# Check file existence and permissions
ls -la .env*
cat .env.example

# Create from template if missing
cp .env.example .env
```

**Invalid Configuration Values:**
```bash
# Validate port range
echo $PORT | grep -E '^[0-9]+$' && echo "Valid number" || echo "Invalid port"

# Check Node.js environment values
case $NODE_ENV in
    development|production|test) echo "Valid NODE_ENV" ;;
    *) echo "Invalid NODE_ENV: $NODE_ENV" ;;
esac
```

## Health Monitoring and Validation

Comprehensive health monitoring ensures deployment success and provides ongoing operational visibility. The tutorial application includes both shell-based and Node.js-based health checking with educational monitoring features and troubleshooting guidance.

### Health Monitoring Architecture

**Dual Health Check System:**
1. **Shell-based Health Check** (`infrastructure/scripts/health-check.sh`)
   - Uses curl and standard Unix tools
   - CI/CD pipeline compatible
   - Comprehensive retry logic with exponential backoff
   - Educational troubleshooting guidance

2. **Node.js Application Health Check** (`src/backend/scripts/health-check.js`)
   - Native application integration
   - Detailed response validation
   - Performance metrics collection
   - Educational insights and learning context

### Health Check Configuration

**Default Health Check Parameters:**
```bash
# Health check endpoint and expected response
HEALTH_CHECK_ENDPOINT="/hello"
EXPECTED_RESPONSE="Hello world"
EXPECTED_CONTENT_TYPE="text/plain"
EXPECTED_STATUS_CODE=200

# Performance and timing configuration
PERFORMANCE_THRESHOLD_MS=100
HEALTH_CHECK_TIMEOUT=5000
HEALTH_CHECK_RETRIES=5
RETRY_DELAY=2

# Educational and monitoring features
VERBOSE_HEALTH_CHECK=true
EDUCATIONAL_LOGGING=true
```

### Shell-Based Health Validation

The shell-based health check provides comprehensive server validation using standard Unix tools:

#### Basic Health Check Usage

```bash
# Basic health check with default settings
./infrastructure/scripts/health-check.sh

# Verbose health check with educational logging
./infrastructure/scripts/health-check.sh --verbose

# Custom configuration with increased retries
./infrastructure/scripts/health-check.sh --retries 10 --retry-delay 3 --timeout 30
```

#### Advanced Health Check Options

```bash
# Health check with custom server configuration
./infrastructure/scripts/health-check.sh \
    --host localhost \
    --port 8080 \
    --endpoint /hello \
    --timeout 15 \
    --retries 5 \
    --verbose

# Health check with JSON output for automation
./infrastructure/scripts/health-check.sh --format json --no-color

# Health check with Node.js fallback
./infrastructure/scripts/health-check.sh --nodejs-fallback --verbose
```

#### Expected Health Check Output

**Successful Health Check:**
```
🏥 Node.js Tutorial Shell-Based Health Check Script
=================================================

🔍 Validating health check prerequisites
✅ curl available - Version: curl 7.88.1
✅ grep available - POSIX compatible pattern matching  
✅ awk available - Text processing and metrics extraction
✅ Prerequisites validation completed successfully

🏥 Starting comprehensive health check validation
📡 Executing HTTP request with performance measurement
✅ HTTP request completed successfully - Status: 200, Duration: 45ms
🔍 Validating HTTP response against health check criteria
✅ All validation criteria passed - server is functioning correctly

🎉 Health check validation PASSED
Performance: Good, Validation: PASS

================================================================================
                    Node.js Tutorial Health Check Report
================================================================================

📋 HEALTH CHECK SUMMARY
   Timestamp: 2023-10-15T14:30:25.123Z
   Target URL: http://127.0.0.1:3000/hello
   Overall Status: ✅ HEALTHY
   Validation: PASS

🌐 SERVER RESPONSE
   HTTP Status Code: 200
   Response Time: 45ms
   Content Type: text/plain; charset=utf-8
   Response Content: "Hello world"
   Performance Level: Good

✅ VALIDATION RESULTS
   Tests Passed: 5/5
   Success Rate: 100%
   Overall Status: PASS
================================================================================
```

### Node.js Application Health Check

The Node.js health check provides native application integration with detailed validation:

#### Basic Node.js Health Check

```bash
# Navigate to backend directory
cd src/backend

# Basic health check using npm script
npm run health-check

# Direct script execution with options
node scripts/health-check.js --verbose

# Custom configuration
node scripts/health-check.js --timeout 10000 --endpoint /hello
```

#### Advanced Health Check Features

```bash
# Detailed health check with performance analysis
node scripts/health-check.js \
    --timeout 15000 \
    --verbose \
    --endpoint /hello

# Health check with custom host/port (for testing)
node scripts/health-check.js \
    --host localhost \
    --port 8080 \
    --timeout 5000 \
    --verbose
```

### Container Health Integration

**Docker Container Health Checks:**

The Docker container includes integrated health checks:

```bash
# Check container health status
docker ps  # Shows health status

# View health check details
docker inspect tutorial-server | jq '.[0].State.Health'

# Execute health check manually in container
docker exec tutorial-server node scripts/health-check.js

# View health check logs
docker inspect tutorial-server | jq '.[0].State.Health.Log'
```

**Docker Compose Health Monitoring:**

```bash
# Check service health status
docker-compose ps

# Execute health check in service context
docker-compose exec backend node scripts/health-check.js --verbose

# Monitor health check logs
docker-compose logs backend | grep -i health
```

### Health Check Validation Criteria

**Comprehensive Validation Tests:**

1. **HTTP Status Code Validation**
   - Expected: 200 (HTTP OK)
   - Validates: Successful request processing
   - Educational: HTTP protocol compliance

2. **Response Content Validation**
   - Expected: "Hello world"
   - Validates: Endpoint functionality
   - Educational: Application logic verification

3. **Content-Type Header Validation**
   - Expected: "text/plain"
   - Validates: Proper MIME type specification
   - Educational: HTTP header handling

4. **Response Time Performance**
   - Threshold: <100ms (configurable)
   - Validates: Server performance
   - Educational: Performance monitoring

5. **Content Length Validation**
   - Expected: Non-empty response
   - Validates: Response completeness
   - Educational: Data integrity

### Performance Monitoring

**Response Time Categories:**
- **Excellent**: ≤50ms - Optimal server performance
- **Good**: 51-100ms - Acceptable tutorial performance  
- **Needs Improvement**: >100ms - Consider optimization

**Performance Tracking:**
```bash
# Multiple health checks for performance profiling
for i in {1..10}; do 
    echo "Health check attempt $i:"
    time ./infrastructure/scripts/health-check.sh --quiet
    sleep 1
done

# Performance analysis with Node.js health check
node scripts/health-check.js --verbose 2>&1 | grep "responseTime"
```

### Automated Health Monitoring

**Continuous Health Monitoring:**
```bash
# Health check every 30 seconds
watch -n 30 './infrastructure/scripts/health-check.sh --quiet'

# Log health check results with timestamps
while true; do
    echo "$(date): $(./infrastructure/scripts/health-check.sh --quiet && echo 'HEALTHY' || echo 'UNHEALTHY')"
    sleep 60
done >> health-check.log
```

**Integration with Deployment:**
```bash
# Deployment with integrated health validation
./infrastructure/scripts/deploy.sh --strategy docker --health-retries 10 --health-delay 3

# Post-deployment health verification
./infrastructure/scripts/deploy.sh --strategy direct && \
sleep 10 && \
./infrastructure/scripts/health-check.sh --verbose
```

### Health Check Troubleshooting

**Common Health Check Failures:**

**Connection Refused (ECONNREFUSED):**
```bash
# Diagnosis: Server not running
# Resolution steps:
1. Start the server: npm start
2. Check server logs for errors
3. Verify port availability: lsof -ti:3000
4. Check server startup completion
```

**Timeout Errors:**
```bash
# Diagnosis: Server overloaded or unresponsive
# Resolution steps:
1. Check server resource usage: top, htop
2. Increase timeout: --timeout 30000
3. Review server logs for processing delays
4. Verify system load and available memory
```

**Wrong Response Content:**
```bash
# Diagnosis: Server responding but wrong content
# Resolution steps:  
1. Manual endpoint test: curl -v http://localhost:3000/hello
2. Check server endpoint implementation
3. Verify response message matches "Hello world"
4. Review application logs for processing errors
```

**Performance Issues:**
```bash
# Diagnosis: Response time exceeding threshold
# Resolution steps:
1. Monitor server performance: docker stats
2. Check system resources and load
3. Analyze application processing time
4. Consider server optimization opportunities
```

## Automation and CI/CD Integration

The tutorial application includes comprehensive deployment automation and CI/CD pipeline integration capabilities, demonstrating modern DevOps practices while providing educational insights into infrastructure automation and continuous deployment workflows.

### Deployment Automation Architecture

**Automation Components:**
- **Master Deployment Script** (`infrastructure/scripts/deploy.sh`)
- **Health Check Automation** (`infrastructure/scripts/health-check.sh`)
- **NPM Script Integration** (package.json automation)
- **Docker Automation** (container lifecycle management)
- **CI/CD Pipeline Templates** (GitHub Actions compatible)

### Master Deployment Script

The `deploy.sh` script provides comprehensive deployment automation with strategy selection, validation, and educational guidance:

#### Basic Automation Usage

```bash
# Automated deployment with strategy selection
./infrastructure/scripts/deploy.sh

# Specific strategy deployment
./infrastructure/scripts/deploy.sh --strategy direct
./infrastructure/scripts/deploy.sh --strategy docker
./infrastructure/scripts/deploy.sh --strategy docker-compose

# Educational deployment with verbose logging
./infrastructure/scripts/deploy.sh --strategy docker-compose --verbose --educational
```

#### Advanced Automation Features

```bash
# Production deployment with comprehensive validation
./infrastructure/scripts/deploy.sh \
    --strategy docker-compose \
    --env production \
    --timeout 300 \
    --health-retries 10 \
    --health-delay 3 \
    --cleanup \
    --verbose

# Development deployment with custom configuration
./infrastructure/scripts/deploy.sh \
    --strategy direct \
    --env development \
    --port 8080 \
    --host localhost \
    --health-timeout 15 \
    --educational
```

### NPM Script Automation

The application includes comprehensive NPM script automation for common deployment and operational tasks:

**Package.json Integration:**
```json
{
  "scripts": {
    "deploy": "./infrastructure/scripts/deploy.sh",
    "deploy:dev": "./infrastructure/scripts/deploy.sh --strategy direct --env development",
    "deploy:docker": "./infrastructure/scripts/deploy.sh --strategy docker --env production",
    "deploy:compose": "./infrastructure/scripts/deploy.sh --strategy docker-compose --env production",
    "health-check": "./infrastructure/scripts/health-check.sh --verbose",
    "health:dev": "./infrastructure/scripts/health-check.sh --host 127.0.0.1 --port 3000",
    "infrastructure:status": "./infrastructure/scripts/deploy.sh --status",
    "infrastructure:cleanup": "./infrastructure/scripts/deploy.sh --cleanup",
    "infrastructure:validate": "./infrastructure/scripts/deploy.sh --validate-env"
  }
}
```

**Common Automation Commands:**
```bash
# Development workflow automation
npm run deploy:dev
npm run health-check

# Production deployment automation  
npm run deploy:compose
npm run health:dev

# Infrastructure management
npm run infrastructure:status
npm run infrastructure:cleanup
```

### CI/CD Pipeline Integration

**GitHub Actions Integration:**

Create `.github/workflows/deploy.yml` for automated deployment:

```yaml
name: Node.js Tutorial Deployment Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  validate-environment:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Validate Prerequisites
        run: |
          ./infrastructure/scripts/deploy.sh --validate-env --verbose

  deploy-and-test:
    needs: validate-environment
    runs-on: ubuntu-latest
    strategy:
      matrix:
        deployment-strategy: [direct, docker, docker-compose]
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Deploy Application
        run: |
          ./infrastructure/scripts/deploy.sh \
            --strategy ${{ matrix.deployment-strategy }} \
            --env production \
            --timeout 300 \
            --health-retries 10 \
            --verbose
      
      - name: Validate Deployment
        run: |
          ./infrastructure/scripts/health-check.sh \
            --verbose \
            --retries 5 \
            --timeout 15
      
      - name: Cleanup Resources
        if: always()
        run: |
          ./infrastructure/scripts/deploy.sh --cleanup --verbose
```

**Jenkins Pipeline Integration:**

```groovy
pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18'
        DEPLOYMENT_TIMEOUT = '300'
    }
    
    stages {
        stage('Environment Validation') {
            steps {
                sh './infrastructure/scripts/deploy.sh --validate-env --verbose'
            }
        }
        
        stage('Deploy Application') {
            parallel {
                stage('Direct Deployment') {
                    steps {
                        sh './infrastructure/scripts/deploy.sh --strategy direct --env production --verbose'
                        sh './infrastructure/scripts/health-check.sh --verbose --retries 5'
                    }
                }
                stage('Docker Deployment') {
                    steps {
                        sh './infrastructure/scripts/deploy.sh --strategy docker --env production --verbose'
                        sh './infrastructure/scripts/health-check.sh --verbose --retries 5'
                    }
                }
            }
        }
        
        stage('Health Validation') {
            steps {
                sh './infrastructure/scripts/health-check.sh --verbose --format json --retries 10'
            }
        }
    }
    
    post {
        always {
            sh './infrastructure/scripts/deploy.sh --cleanup --verbose'
        }
    }
}
```

### Automated Deployment Strategies

**Blue-Green Deployment Simulation:**
```bash
# Deploy new version while keeping old version
./infrastructure/scripts/deploy.sh --strategy docker --port 3001 --tag new-version

# Health check new deployment
./infrastructure/scripts/health-check.sh --port 3001 --verbose

# Switch traffic (manual step in tutorial context)
# Stop old version after validation
docker stop tutorial-server-old
```

**Rolling Deployment with Health Checks:**
```bash
# Rolling deployment script example
for strategy in direct docker docker-compose; do
    echo "Deploying with $strategy strategy..."
    ./infrastructure/scripts/deploy.sh --strategy $strategy --verbose
    
    if ./infrastructure/scripts/health-check.sh --retries 5; then
        echo "✅ $strategy deployment successful"
    else
        echo "❌ $strategy deployment failed"
        ./infrastructure/scripts/deploy.sh --rollback
        break
    fi
    
    sleep 10
done
```

### Automation Configuration

**Environment-Specific Automation:**

Create environment-specific automation scripts:

```bash
# scripts/deploy-development.sh
#!/bin/bash
./infrastructure/scripts/deploy.sh \
    --strategy direct \
    --env development \
    --educational \
    --verbose \
    --health-retries 3

# scripts/deploy-production.sh  
#!/bin/bash
./infrastructure/scripts/deploy.sh \
    --strategy docker-compose \
    --env production \
    --timeout 300 \
    --health-retries 10 \
    --cleanup
```

### Monitoring and Alerting Integration

**Automated Health Monitoring:**
```bash
# Continuous monitoring script
#!/bin/bash
# monitor-deployment.sh

while true; do
    if ./infrastructure/scripts/health-check.sh --quiet; then
        echo "$(date): ✅ Service healthy"
    else
        echo "$(date): ❌ Service unhealthy - sending alert"
        # Integration point for alerting system
        # curl -X POST https://hooks.slack.com/services/... -d '{"text":"Service down"}'
    fi
    sleep 60
done
```

**Deployment Status Reporting:**
```bash
# Status reporting integration
./infrastructure/scripts/deploy.sh --strategy docker --verbose 2>&1 | \
    tee deployment.log | \
    grep -E "(✅|❌|⚠️)" | \
    while read line; do
        echo "$(date): $line"
        # Send to monitoring system
    done
```

### Exit Code Integration

The deployment and health check scripts provide standardized exit codes for automation integration:

**Deployment Script Exit Codes:**
- `0` - Successful deployment and health validation
- `1` - General deployment failure
- `2` - Configuration or parameter error
- `3` - Prerequisite validation failure
- `4` - Health check validation failure

**Health Check Script Exit Codes:**
- `0` - Health check passed all validations
- `1` - Health check failed validation criteria
- `2` - Invalid command line arguments
- `3` - Connection error or server unreachable
- `5` - Health check timeout exceeded

**Automation Usage:**
```bash
# Pipeline step with exit code handling
./infrastructure/scripts/deploy.sh --strategy docker
DEPLOY_EXIT_CODE=$?

case $DEPLOY_EXIT_CODE in
    0) echo "Deployment successful" ;;
    1) echo "Deployment failed - check logs"; exit 1 ;;
    2) echo "Configuration error - check parameters"; exit 1 ;;
    3) echo "Prerequisites missing - install dependencies"; exit 1 ;;
    4) echo "Health check failed - service unhealthy"; exit 1 ;;
    *) echo "Unknown error - investigate"; exit 1 ;;
esac
```

## Troubleshooting Guide

Comprehensive troubleshooting guidance for common deployment issues, performance problems, and operational challenges. This guide provides systematic diagnostic approaches and educational context for resolving infrastructure issues.

### Common Deployment Issues

#### Port Conflicts and Binding Issues

**Symptoms:**
- `EADDRINUSE: address already in use :::3000`
- `Error: listen EADDRINUSE: address already in use 127.0.0.1:3000`
- Connection refused errors during deployment

**Diagnostic Steps:**
```bash
# Check what's using the port
lsof -ti:3000                    # macOS/Linux
netstat -ano | findstr :3000     # Windows

# List all processes using ports
sudo lsof -i -P -n | grep LISTEN

# Check specific port availability
nc -zv localhost 3000
```

**Resolution Strategies:**
```bash
# Option 1: Kill the conflicting process
kill -9 $(lsof -ti:3000)

# Option 2: Use alternative port  
PORT=3001 npm start
./infrastructure/scripts/deploy.sh --port 3001

# Option 3: Find available port automatically
PORT=$(node -e "
const net = require('net');
const server = net.createServer();
server.listen(0, () => {
    console.log(server.address().port);
    server.close();
});
") npm start
```

**Educational Context:**
Port conflicts teach network resource management, process lifecycle understanding, and system administration skills.

#### Node.js Version Compatibility

**Symptoms:**
- `SyntaxError: Unexpected token` in modern JavaScript
- `Error: Cannot find module 'node:*'` for Node.js built-in imports
- Package compatibility warnings

**Diagnostic Steps:**
```bash
# Check current Node.js version
node --version

# Check npm version
npm --version

# Verify version requirements
cat package.json | jq '.engines'
```

**Resolution Strategies:**
```bash
# Option 1: Update Node.js using nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Option 2: Update using official installer
# Download from https://nodejs.org/

# Option 3: Verify installation
node --version  # Should show v18.x.x or higher
```

**Educational Context:**
Version management demonstrates dependency management, backward compatibility, and the importance of maintaining current runtime environments.

#### Docker Daemon and Container Issues

**Symptoms:**
- `Cannot connect to the Docker daemon`
- `docker: command not found`
- Container build failures or startup errors

**Diagnostic Steps:**
```bash
# Check Docker daemon status
docker info
systemctl status docker    # Linux
brew services list | grep docker  # macOS

# Verify Docker permissions
docker run hello-world

# Check container logs for errors
docker logs container-name
```

**Resolution Strategies:**
```bash
# Start Docker daemon (Linux)
sudo systemctl start docker
sudo systemctl enable docker

# Fix permission issues
sudo usermod -a -G docker $USER
newgrp docker

# Restart Docker Desktop (macOS/Windows)
# Use Docker Desktop interface to restart

# Clean up Docker resources if needed
docker system prune -af
```

**Educational Context:**
Docker troubleshooting teaches containerization concepts, system service management, and resource cleanup procedures.

### Performance and Resource Issues

#### Memory and Resource Constraints

**Symptoms:**
- Application crashes with `JavaScript heap out of memory`
- Slow response times or timeouts
- System becomes unresponsive

**Diagnostic Steps:**
```bash
# Check system memory usage
free -h                    # Linux
vm_stat                    # macOS

# Monitor Node.js process memory
node --max-old-space-size=2048 server.js  # Increase heap size

# Check Docker container resources
docker stats tutorial-server
```

**Resolution Strategies:**
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 server.js

# Set Docker resource limits
docker run --memory=512m --cpus="1.0" nodejs-tutorial

# Monitor and optimize resource usage
docker-compose up --scale backend=1  # Reduce scale if needed
```

**Educational Context:**
Resource management teaches system administration, performance optimization, and capacity planning concepts.

#### Network Connectivity Issues

**Symptoms:**
- Health check failures with network errors
- Cannot reach server from browser
- DNS resolution failures

**Diagnostic Steps:**
```bash
# Test basic network connectivity
ping localhost
ping 127.0.0.1

# Check network interface status
ifconfig                   # macOS/Linux
ipconfig                   # Windows

# Test port connectivity
telnet localhost 3000
nc -zv localhost 3000
```

**Resolution Strategies:**
```bash
# Reset network configuration
sudo systemctl restart network  # Linux
sudo dscacheutil -flushcache   # macOS

# Test with different host binding
HOST=0.0.0.0 npm start          # Bind to all interfaces (development only)

# Verify firewall settings
sudo ufw status                 # Ubuntu
sudo iptables -L               # Generic Linux
```

**Educational Context:**
Network troubleshooting teaches networking fundamentals, security implications, and system configuration.

### Health Check Failures

#### Server Response Issues

**Symptoms:**
- Health checks fail with wrong response content
- Incorrect HTTP status codes
- Missing or wrong content-type headers

**Diagnostic Steps:**
```bash
# Manual endpoint testing
curl -v http://localhost:3000/hello

# Check response details
curl -I http://localhost:3000/hello  # Headers only

# Test with different tools
wget --spider http://localhost:3000/hello
```

**Resolution Strategies:**
```bash
# Verify endpoint implementation
grep -r "hello" src/backend/lib/handlers/

# Check server logs for errors
npm start 2>&1 | tee server.log

# Test server restart
pkill -f "node.*server.js"
npm start
```

**Educational Context:**
Response validation teaches HTTP protocol understanding, API testing methodologies, and systematic debugging approaches.

#### Timeout and Performance Issues

**Symptoms:**
- Health checks timeout waiting for response
- Slow server startup or response times
- Intermittent connectivity failures

**Diagnostic Steps:**
```bash
# Measure response times
time curl http://localhost:3000/hello

# Check server load
top -p $(pgrep -f "node.*server.js")

# Monitor request processing
strace -p $(pgrep -f "node.*server.js") -e network  # Linux
```

**Resolution Strategies:**
```bash
# Increase health check timeout
./infrastructure/scripts/health-check.sh --timeout 30

# Optimize server performance
NODE_ENV=production npm start

# Add server warmup time
sleep 10 && ./infrastructure/scripts/health-check.sh
```

**Educational Context:**
Performance troubleshooting teaches optimization techniques, system monitoring, and capacity planning.

### Container and Orchestration Issues

#### Docker Build Failures

**Symptoms:**
- Container image build errors
- Missing files in container context
- Permission denied during build

**Diagnostic Steps:**
```bash
# Build with verbose output
docker build --progress=plain --no-cache -f infrastructure/docker/Dockerfile.backend .

# Check build context size
du -sh . | head -1

# Verify .dockerignore configuration
cat infrastructure/docker/.dockerignore
```

**Resolution Strategies:**
```bash
# Clean build environment
docker builder prune -af

# Fix build context issues
rsync -av --exclude-from=.dockerignore . /tmp/build-context/
docker build -f infrastructure/docker/Dockerfile.backend /tmp/build-context/

# Debug build stages
docker build --target development -t debug-image .
docker run --rm -it debug-image sh
```

**Educational Context:**
Build troubleshooting teaches containerization principles, build optimization, and debugging methodologies.

#### Docker Compose Service Issues

**Symptoms:**
- Services fail to start or communicate
- Network connectivity issues between services
- Volume mounting problems

**Diagnostic Steps:**
```bash
# Check service status
docker-compose ps

# View service logs
docker-compose logs --timestamps backend

# Test service connectivity
docker-compose exec backend ping backend
```

**Resolution Strategies:**
```bash
# Recreate services and networks
docker-compose down --volumes --remove-orphans
docker-compose up --force-recreate

# Debug network issues
docker network ls
docker network inspect nodejs-tutorial-network

# Fix volume permissions
docker-compose exec backend chmod 755 /usr/src/app/logs
```

**Educational Context:**
Orchestration troubleshooting teaches service management, networking concepts, and infrastructure coordination.

### Systematic Diagnostic Approach

#### General Troubleshooting Methodology

**1. Information Gathering:**
```bash
# System information
uname -a                    # System info
df -h                       # Disk space
free -h                     # Memory usage
ps aux | grep node         # Process status

# Application information
cat package.json | jq '.version'
node --version
npm --version
docker --version
```

**2. Log Analysis:**
```bash
# Application logs
tail -f server.log
journalctl -u docker       # Docker service logs
docker logs --timestamps tutorial-server
```

**3. Configuration Validation:**
```bash
# Validate configuration files
./infrastructure/scripts/deploy.sh --validate-config
docker-compose config
```

**4. Step-by-Step Isolation:**
```bash
# Test individual components
node -e "console.log('Node.js working')"
curl --version
docker run hello-world
```

#### Educational Problem-Solving Framework

**Problem Analysis Steps:**
1. **Symptom Identification**: What specific error or behavior is observed?
2. **Context Gathering**: When did it start? What changed recently?
3. **Hypothesis Formation**: What might be causing this issue?
4. **Testing and Validation**: How can we verify the hypothesis?
5. **Solution Implementation**: What steps will resolve the issue?
6. **Prevention**: How can we prevent this issue in the future?

**Documentation and Learning:**
```bash
# Document solutions for future reference
echo "$(date): Issue resolved - port conflict" >> troubleshooting.log

# Share learning with team
git commit -m "docs: Add troubleshooting guide for port conflicts"
```

**Educational Value:**
Systematic troubleshooting teaches analytical thinking, problem-solving methodologies, and builds confidence in technical problem resolution.

## Educational Learning Objectives

This comprehensive deployment guide serves multiple educational objectives, providing hands-on experience with modern DevOps practices, infrastructure automation, and system administration concepts through practical Node.js application deployment scenarios.

### Primary Learning Outcomes

#### Infrastructure and DevOps Concepts

**Deployment Strategy Understanding:**
- **Direct Deployment**: Learn application lifecycle management, process control, and native runtime environments
- **Container Deployment**: Master containerization principles, image management, and isolation concepts
- **Orchestration**: Understand service coordination, networking, and production-like environments

**Infrastructure as Code:**
- Configuration management through declarative files (docker-compose.yml, Dockerfile)
- Version-controlled infrastructure definitions and deployment automation
- Environment-specific configuration and parameter management

**Automation and Scripting:**
- Shell scripting for infrastructure automation and deployment orchestration
- CI/CD pipeline integration with standardized exit codes and structured logging
- Health check automation and monitoring integration patterns

#### System Administration Skills

**Network and Service Management:**
- Port binding, network interface configuration, and connectivity troubleshooting
- Service discovery, container networking, and network isolation concepts
- Load balancing simulation and traffic management fundamentals

**Resource Management:**
- Memory and CPU resource allocation and constraint management
- Storage management through volume mounting and data persistence
- Performance monitoring and optimization techniques

**Security Practices:**
- Localhost binding for development security and access control
- Non-root container execution and security best practices
- Configuration management without credential exposure

#### Monitoring and Observability

**Health Check Implementation:**
- HTTP endpoint validation and response verification
- Performance monitoring with threshold-based alerting
- Systematic troubleshooting and diagnostic methodologies

**Logging and Debugging:**
- Structured logging with educational context and troubleshooting guidance
- Log aggregation and analysis for operational insight
- Debug output interpretation and issue resolution

### Progressive Learning Path

#### Beginner Level (Direct Node.js Deployment)

**Learning Objectives:**
- Understand Node.js application structure and dependency management
- Learn environment variable configuration and application settings
- Practice basic command-line operations and process management
- Develop troubleshooting skills for common development issues

**Hands-on Activities:**
```bash
# Start with simple deployment
cd src/backend
npm ci --only=production
npm start

# Experiment with configuration
PORT=8080 npm start
NODE_ENV=production npm start

# Practice health checking
npm run health-check
```

**Skills Developed:**
- Node.js runtime understanding
- Package management with npm
- Environment configuration
- Basic troubleshooting

#### Intermediate Level (Docker Container Deployment)

**Learning Objectives:**
- Master containerization concepts and Docker fundamentals
- Understand image layering, optimization, and security practices
- Learn container lifecycle management and debugging techniques
- Practice infrastructure consistency and environment isolation

**Hands-on Activities:**
```bash
# Build and run containers
docker build -f infrastructure/docker/Dockerfile.backend -t tutorial-app .
docker run -p 3000:3000 tutorial-app

# Experiment with container configuration
docker run -e NODE_ENV=production -p 8080:3000 tutorial-app

# Practice container debugging
docker exec -it container-name sh
docker logs container-name
```

**Skills Developed:**
- Docker containerization
- Image management
- Container debugging
- Security configuration

#### Advanced Level (Docker Compose Orchestration)

**Learning Objectives:**
- Understand service orchestration and multi-container architectures
- Master networking, volume management, and service coordination
- Learn production deployment patterns and scalability concepts
- Practice comprehensive monitoring and operational procedures

**Hands-on Activities:**
```bash
# Deploy with orchestration
docker-compose up --detach
docker-compose ps
docker-compose logs

# Experiment with scaling and networking
docker-compose scale backend=3
docker-compose exec backend ping backend

# Practice operational procedures
docker-compose restart backend
docker-compose down --volumes
```

**Skills Developed:**
- Service orchestration
- Network management
- Volume configuration
- Production readiness

### Practical Exercises and Experiments

#### Configuration Management Exercises

**Exercise 1: Environment Configuration**
```bash
# Create different environment configurations
cp .env.example .env.development
cp .env.example .env.production

# Modify configurations and test impact
NODE_ENV=development npm start
NODE_ENV=production npm start

# Observe differences in logging and behavior
```

**Exercise 2: Port and Network Configuration**
```bash
# Test different port configurations
PORT=3000 npm start &
PORT=3001 npm start &
PORT=3002 npm start &

# Test health checks on different ports
./infrastructure/scripts/health-check.sh --port 3000
./infrastructure/scripts/health-check.sh --port 3001
./infrastructure/scripts/health-check.sh --port 3002
```

#### Deployment Strategy Comparison

**Exercise 3: Strategy Performance Analysis**
```bash
# Time each deployment strategy
time ./infrastructure/scripts/deploy.sh --strategy direct
time ./infrastructure/scripts/deploy.sh --strategy docker  
time ./infrastructure/scripts/deploy.sh --strategy docker-compose

# Compare resource usage
ps aux | grep node              # Direct deployment
docker stats tutorial-server   # Container deployment
docker-compose top             # Orchestrated deployment
```

**Exercise 4: Failure Recovery Testing**
```bash
# Simulate failures and practice recovery
kill -9 $(pgrep -f "node.*server.js")  # Kill direct process
docker stop tutorial-server            # Stop container
docker-compose stop backend           # Stop orchestrated service

# Practice different recovery approaches
npm start                              # Restart direct
docker start tutorial-server          # Restart container
docker-compose up backend            # Restart service
```

#### Monitoring and Troubleshooting Labs

**Exercise 5: Health Check Configuration**
```bash
# Experiment with health check parameters
./infrastructure/scripts/health-check.sh --timeout 1000   # Force timeout
./infrastructure/scripts/health-check.sh --retries 10     # Test retry logic
./infrastructure/scripts/health-check.sh --verbose        # Educational output

# Create custom health check scenarios
PORT=9999 ./infrastructure/scripts/health-check.sh        # Test error handling
```

**Exercise 6: Log Analysis and Debugging**
```bash
# Generate different types of logs
NODE_ENV=development npm start         # Verbose development logs
NODE_ENV=production npm start          # Production optimized logs

# Analyze container logs
docker logs --timestamps tutorial-server
docker-compose logs --follow backend

# Practice log filtering and analysis
docker logs tutorial-server 2>&1 | grep ERROR
docker-compose logs backend | grep -i health
```

### Assessment and Reflection

#### Knowledge Check Questions

**Deployment Concepts:**
1. What are the advantages and disadvantages of each deployment strategy?
2. How do environment variables affect application behavior?
3. Why is localhost binding important for tutorial security?
4. What role do health checks play in deployment validation?

**Technical Implementation:**
1. How do Docker layers optimize image build time and storage?
2. What networking concepts enable container communication?
3. How do volume mounts provide data persistence?
4. Why are non-root users important in container security?

**Operational Procedures:**
1. How would you scale this application for higher load?
2. What monitoring would you implement for production deployment?
3. How would you implement automated rollback procedures?
4. What backup and disaster recovery considerations apply?

#### Practical Skill Validation

**Scenario-Based Challenges:**
1. **Port Conflict Resolution**: Server won't start due to port conflict
2. **Container Build Failure**: Docker image fails to build with dependency errors  
3. **Health Check Failure**: Application starts but health checks fail
4. **Performance Degradation**: Response times exceed acceptable thresholds
5. **Network Connectivity Issues**: Containers cannot communicate with each other

**Problem-Solving Framework:**
1. Identify symptoms and gather diagnostic information
2. Form hypotheses about potential root causes
3. Test hypotheses through systematic investigation
4. Implement solutions and verify effectiveness
5. Document learning and prevention strategies

### Career and Professional Development

#### Industry-Relevant Skills

**DevOps Engineer Path:**
- Infrastructure automation and configuration management
- Container orchestration and production deployment
- Monitoring, logging, and observability implementation
- CI/CD pipeline design and automation

**Software Developer Path:**
- Application lifecycle management and deployment awareness
- Configuration management and environment handling
- Debugging and troubleshooting methodologies
- Performance optimization and monitoring

**System Administrator Path:**
- Service management and process control
- Network configuration and security management
- Resource allocation and performance tuning
- Disaster recovery and maintenance procedures

#### Continuous Learning Opportunities

**Advanced Topics for Further Study:**
- Kubernetes orchestration and advanced container management
- Service mesh implementation for microservices communication
- Infrastructure as Code with Terraform and cloud providers
- Advanced monitoring with Prometheus, Grafana, and alerting systems
- Security hardening and compliance implementation
- Performance optimization and load testing methodologies

**Recommended Learning Resources:**
- Official Docker and Kubernetes documentation
- Cloud provider tutorials (AWS, Google Cloud, Azure)
- DevOps methodology books and best practices guides
- Open source monitoring and automation tools
- Community forums and professional development groups

## Maintenance and Operations

Ongoing maintenance and operational procedures ensure stable, secure, and efficient deployment environments while providing opportunities to practice system administration and DevOps operational skills through hands-on experience with real-world maintenance scenarios.

### Regular Maintenance Procedures

#### System Update Management

**Node.js Runtime Updates:**
```bash
# Check current Node.js version and available updates
node --version
npm --version

# Using nvm for Node.js version management
nvm list                    # List installed versions
nvm list-remote --lts       # List available LTS versions
nvm install --lts           # Install latest LTS
nvm use --lts               # Switch to LTS version

# Update npm separately if needed
npm install -g npm@latest

# Verify compatibility after updates
npm test                    # Run application tests
npm run health-check        # Verify health check functionality
```

**Dependency Management:**
```bash
# Check for outdated packages
npm outdated

# Update dependencies safely
npm update                  # Update within semver ranges
npm audit                   # Check for security vulnerabilities
npm audit fix               # Apply automatic fixes

# Major version updates (requires careful testing)
npm install package-name@latest

# Verify application functionality after updates
npm start
npm run health-check
```

**Container Image Updates:**
```bash
# Update base images in Dockerfile
docker pull node:22-alpine
docker build --no-cache -f infrastructure/docker/Dockerfile.backend -t nodejs-tutorial:latest .

# Update Docker Compose images
docker-compose pull
docker-compose build --no-cache

# Apply updates with rolling restart
docker-compose up --detach --force-recreate
```

#### Security Maintenance

**Security Scanning and Updates:**
```bash
# Security vulnerability scanning
npm audit                              # Node.js dependencies
docker scan nodejs-tutorial:latest    # Container image security

# Apply security updates
npm audit fix --force                  # Apply all available fixes
npm install --package-lock-only       # Update lock file

# Container security updates
docker build --pull --no-cache -f infrastructure/docker/Dockerfile.backend .
```

**Configuration Security Review:**
```bash
# Review configuration files for security issues
grep -r "password\|secret\|key" . --exclude-dir=node_modules

# Check for exposed credentials
find . -name "*.env*" -not -path "./.env.example" -exec echo "Warning: Env file found: {}" \;

# Validate localhost binding (security requirement)
grep -r "0.0.0.0" . --exclude-dir=node_modules || echo "✅ No external binding found"
```

#### Performance Monitoring and Optimization

**Resource Usage Monitoring:**
```bash
# Monitor application performance
npm run start &
APP_PID=$!

# CPU and memory monitoring
top -p $APP_PID
ps -p $APP_PID -o pid,ppid,cmd,%mem,%cpu

# Container resource monitoring
docker stats tutorial-server --no-stream
docker exec tutorial-server cat /proc/meminfo | head -10
```

**Performance Optimization:**
```bash
# Enable production optimizations
NODE_ENV=production npm start

# Monitor response times
for i in {1..10}; do
    time curl -s http://localhost:3000/hello > /dev/null
done

# Container performance optimization
docker run --memory=256m --cpus="0.5" nodejs-tutorial
```

#### Log Management and Rotation

**Application Log Management:**
```bash
# Configure log rotation (if logs grow large)
# For direct deployment
logrotate -f /etc/logrotate.conf

# For container deployment
docker logs tutorial-server --since="24h" | tail -100

# Clean old container logs
docker system prune -f
```

**Docker Compose Log Management:**
```bash
# View and manage service logs
docker-compose logs --since="1h" backend
docker-compose logs --tail=50 backend

# Implement log rotation policy in compose
# Add to docker-compose.yml:
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Health Monitoring and Alerting

#### Automated Health Monitoring

**Continuous Health Check Implementation:**
```bash
# Create automated monitoring script
cat > scripts/continuous-monitor.sh << 'EOF'
#!/bin/bash
while true; do
    if ./infrastructure/scripts/health-check.sh --quiet; then
        echo "$(date): ✅ Service healthy"
        # Optional: Log to monitoring system
    else
        echo "$(date): ❌ Service unhealthy - investigating"
        # Optional: Trigger alert
        # curl -X POST webhook-url -d "Service down"
    fi
    sleep 30
done
EOF

chmod +x scripts/continuous-monitor.sh
nohup scripts/continuous-monitor.sh > monitoring.log 2>&1 &
```

**Health Check Scheduling with Cron:**
```bash
# Add health check to crontab
(crontab -l 2>/dev/null; echo "*/5 * * * * cd /path/to/project && ./infrastructure/scripts/health-check.sh --quiet") | crontab -

# View scheduled jobs
crontab -l

# Check cron execution logs
tail -f /var/log/cron
```

#### Performance Metrics Collection

**Application Performance Monitoring:**
```bash
# Create performance monitoring script
cat > scripts/performance-monitor.sh << 'EOF'
#!/bin/bash
echo "$(date): Performance Check"
echo "Memory Usage:"
docker stats tutorial-server --no-stream --format "Memory: {{.MemUsage}} ({{.MemPerc}})"

echo "Response Time Test:"
for i in {1..5}; do
    response_time=$(curl -o /dev/null -s -w "%{time_total}" http://localhost:3000/hello)
    echo "Response $i: ${response_time}s"
done

echo "Disk Usage:"
df -h /var/lib/docker

echo "---"
EOF

chmod +x scripts/performance-monitor.sh
```

**Resource Threshold Monitoring:**
```bash
# Monitor resource usage and alert on thresholds
cat > scripts/resource-monitor.sh << 'EOF'
#!/bin/bash
MEMORY_THRESHOLD=80
CPU_THRESHOLD=80

# Check memory usage
MEMORY_USAGE=$(docker stats tutorial-server --no-stream --format "{{.MemPerc}}" | tr -d '%')
if (( $(echo "$MEMORY_USAGE > $MEMORY_THRESHOLD" | bc -l) )); then
    echo "WARNING: Memory usage ${MEMORY_USAGE}% exceeds threshold ${MEMORY_THRESHOLD}%"
fi

# Check CPU usage
CPU_USAGE=$(docker stats tutorial-server --no-stream --format "{{.CPUPerc}}" | tr -d '%')
if (( $(echo "$CPU_USAGE > $CPU_THRESHOLD" | bc -l) )); then
    echo "WARNING: CPU usage ${CPU_USAGE}% exceeds threshold ${CPU_THRESHOLD}%"
fi
EOF
```

### Backup and Disaster Recovery

#### Configuration Backup

**Backup Critical Configuration Files:**
```bash
# Create backup directory structure
mkdir -p backups/$(date +%Y-%m-%d)

# Backup configuration files
cp -r src/backend/package*.json backups/$(date +%Y-%m-%d)/
cp -r infrastructure/ backups/$(date +%Y-%m-%d)/
cp docker-compose.yml backups/$(date +%Y-%m-%d)/ 2>/dev/null || true

# Create backup archive
tar -czf backups/config-backup-$(date +%Y-%m-%d).tar.gz backups/$(date +%Y-%m-%d)/

echo "Configuration backup created: config-backup-$(date +%Y-%m-%d).tar.gz"
```

**Automated Backup Script:**
```bash
# Create automated backup script
cat > scripts/backup-config.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="backups/$(date +%Y-%m-%d-%H%M)"
mkdir -p "$BACKUP_DIR"

# Backup application configuration
echo "Backing up configuration files..."
rsync -av --exclude='node_modules' --exclude='*.log' src/ "$BACKUP_DIR/src/"
rsync -av infrastructure/ "$BACKUP_DIR/infrastructure/"

# Create archive
tar -czf "config-backup-$(date +%Y-%m-%d-%H%M).tar.gz" "$BACKUP_DIR"
rm -rf "$BACKUP_DIR"

echo "Backup completed: config-backup-$(date +%Y-%m-%d-%H%M).tar.gz"

# Cleanup old backups (keep last 7 days)
find backups/ -name "config-backup-*.tar.gz" -mtime +7 -delete
EOF

chmod +x scripts/backup-config.sh
```

#### Container and Volume Backup

**Container Image Backup:**
```bash
# Save container images
docker save nodejs-tutorial:latest | gzip > backups/nodejs-tutorial-image-$(date +%Y%m%d).tar.gz

# Backup Docker Compose volumes
docker run --rm -v tutorial-logs:/data -v $(pwd)/backups:/backup \
    alpine tar -czf /backup/tutorial-logs-$(date +%Y%m%d).tar.gz -C /data .
```

**Restore Procedures:**
```bash
# Restore container image
gunzip -c backups/nodejs-tutorial-image-20231215.tar.gz | docker load

# Restore volume data
docker run --rm -v tutorial-logs:/data -v $(pwd)/backups:/backup \
    alpine tar -xzf /backup/tutorial-logs-20231215.tar.gz -C /data
```

### Scaling and Capacity Planning

#### Load Testing and Performance Analysis

**Simple Load Testing:**
```bash
# Install testing tools
npm install -g artillery autocannon

# Basic load test with autocannon
autocannon -c 10 -d 30 http://localhost:3000/hello

# Load test with artillery
cat > load-test.yml << 'EOF'
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 5
      name: "Warm up"
    - duration: 120
      arrivalRate: 10
      name: "Load test"
scenarios:
  - name: "Hello endpoint test"
    requests:
      - get:
          url: "/hello"
EOF

artillery run load-test.yml
```

**Performance Monitoring During Load:**
```bash
# Monitor during load test
./scripts/performance-monitor.sh &
MONITOR_PID=$!

# Run load test
autocannon -c 20 -d 60 http://localhost:3000/hello

# Stop monitoring
kill $MONITOR_PID
```

#### Horizontal Scaling Preparation

**Docker Compose Scaling Configuration:**
```yaml
# docker-compose.scale.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "127.0.0.1:3000:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - backend
    networks:
      - tutorial-network

  backend:
    build:
      context: ../..
      dockerfile: infrastructure/docker/Dockerfile.backend
    expose:
      - "3000"
    networks:
      - tutorial-network
    # Remove port binding to allow scaling

networks:
  tutorial-network:
    driver: bridge
```

**Load Balancer Configuration:**
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend_1:3000;
        server backend_2:3000;
        server backend_3:3000;
    }

    server {
        listen 80;
        location / {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

### Troubleshooting and Incident Response

#### Incident Response Procedures

**Service Down Response:**
```bash
# Immediate response checklist
echo "Incident Response Checklist:"
echo "1. Check service status"
docker-compose ps || echo "Compose not running"
docker ps | grep tutorial || echo "No running containers"
pgrep -f "node.*server.js" || echo "No Node.js processes"

echo "2. Check recent logs"
docker-compose logs --tail=50 backend 2>/dev/null || echo "No compose logs"
docker logs --tail=50 tutorial-server 2>/dev/null || echo "No container logs"

echo "3. Attempt service restart"
docker-compose restart backend 2>/dev/null || echo "Compose restart failed"
docker restart tutorial-server 2>/dev/null || echo "Container restart failed"

echo "4. Verify health after restart"
sleep 10
./infrastructure/scripts/health-check.sh --verbose
```

**Automated Recovery Script:**
```bash
# Create auto-recovery script
cat > scripts/auto-recovery.sh << 'EOF'
#!/bin/bash
MAX_FAILURES=3
FAILURE_COUNT=0

while [ $FAILURE_COUNT -lt $MAX_FAILURES ]; do
    if ./infrastructure/scripts/health-check.sh --quiet; then
        echo "$(date): Service healthy, resetting failure count"
        FAILURE_COUNT=0
    else
        FAILURE_COUNT=$((FAILURE_COUNT + 1))
        echo "$(date): Health check failed (attempt $FAILURE_COUNT/$MAX_FAILURES)"
        
        if [ $FAILURE_COUNT -lt $MAX_FAILURES ]; then
            echo "$(date): Attempting service restart"
            docker-compose restart backend || docker restart tutorial-server
            sleep 30
        fi
    fi
    
    sleep 60
done

echo "$(date): Max failures reached, manual intervention required"
EOF

chmod +x scripts/auto-recovery.sh
```

#### Diagnostic Data Collection

**System State Snapshot:**
```bash
# Create diagnostic snapshot script
cat > scripts/diagnostic-snapshot.sh << 'EOF'
#!/bin/bash
SNAPSHOT_DIR="diagnostics/$(date +%Y-%m-%d-%H%M%S)"
mkdir -p "$SNAPSHOT_DIR"

echo "Collecting diagnostic information..."

# System information
uname -a > "$SNAPSHOT_DIR/system-info.txt"
df -h > "$SNAPSHOT_DIR/disk-usage.txt"
free -h > "$SNAPSHOT_DIR/memory-usage.txt"
ps aux > "$SNAPSHOT_DIR/processes.txt"

# Network information
netstat -tulpn > "$SNAPSHOT_DIR/network-ports.txt"
ss -tulpn > "$SNAPSHOT_DIR/socket-stats.txt"

# Docker information
docker ps -a > "$SNAPSHOT_DIR/docker-containers.txt"
docker images > "$SNAPSHOT_DIR/docker-images.txt"
docker stats --no-stream > "$SNAPSHOT_DIR/docker-stats.txt"

# Application logs
docker-compose logs --no-color > "$SNAPSHOT_DIR/compose-logs.txt" 2>/dev/null
docker logs tutorial-server > "$SNAPSHOT_DIR/container-logs.txt" 2>/dev/null

# Configuration files
cp docker-compose.yml "$SNAPSHOT_DIR/" 2>/dev/null
cp infrastructure/docker/Dockerfile.backend "$SNAPSHOT_DIR/" 2>/dev/null

echo "Diagnostic snapshot created in $SNAPSHOT_DIR"
tar -czf "${SNAPSHOT_DIR}.tar.gz" "$SNAPSHOT_DIR"
echo "Archive created: ${SNAPSHOT_DIR}.tar.gz"
EOF

chmod +x scripts/diagnostic-snapshot.sh
```

### Documentation and Knowledge Management

#### Operational Runbook Creation

**Standard Operating Procedures:**
```markdown
# Node.js Tutorial Application - Operations Runbook

## Daily Operations Checklist
- [ ] Check service health status
- [ ] Review application logs for errors
- [ ] Monitor resource usage (CPU, memory, disk)
- [ ] Verify backup completion
- [ ] Update security patches if available

## Weekly Maintenance
- [ ] Review performance metrics
- [ ] Clean up old logs and temporary files
- [ ] Update dependencies (after testing)
- [ ] Review security alerts and advisories

## Monthly Reviews
- [ ] Capacity planning analysis
- [ ] Disaster recovery testing
- [ ] Configuration backup verification
- [ ] Performance optimization review
```

**Emergency Contact and Escalation:**
```markdown
# Emergency Response Guide

## Service Down (P1 Incident)
1. Check service status immediately
2. Attempt automatic restart procedures
3. Collect diagnostic information
4. Contact development team if restart fails

## Performance Degradation (P2 Incident)  
1. Monitor resource usage
2. Check for resource leaks or high load
3. Scale resources if possible
4. Schedule maintenance window if needed

## Security Alert (P1 Security)
1. Assess impact immediately
2. Apply emergency patches
3. Monitor for unusual activity
4. Document incident for review
```

This comprehensive deployment guide provides practical, hands-on experience with modern deployment practices while maintaining educational focus throughout each aspect of the infrastructure automation and operational procedures. The guide demonstrates professional deployment patterns through progressive learning opportunities, from basic Node.js execution through advanced container orchestration, providing a solid foundation for DevOps and infrastructure management skills development.