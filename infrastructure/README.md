# Node.js Tutorial HTTP Server - Infrastructure

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-20.10%2B-blue.svg)](https://docker.com/)
[![Docker Compose](https://img.shields.io/badge/Docker%20Compose-2.0%2B-blue.svg)](https://docs.docker.com/compose/)
[![Educational](https://img.shields.io/badge/Purpose-Educational-orange.svg)](https://github.com/nodejs)
[![Infrastructure](https://img.shields.io/badge/Infrastructure-Automation-red.svg)](https://en.wikipedia.org/wiki/Infrastructure_as_Code)

> **🎓 Educational Infrastructure Platform**  
> Comprehensive deployment automation and infrastructure learning environment for the Node.js Tutorial HTTP Server. This infrastructure demonstrates professional deployment strategies, containerization patterns, and automation best practices through hands-on experience with multiple deployment approaches.

## 🚀 Quick Start

### One-Command Deployment

Get started immediately with automatic deployment strategy selection:

```bash
# Clone the repository
git clone <repository-url>
cd nodejs-tutorial-http-server

# Automated deployment with intelligent strategy selection
./infrastructure/scripts/deploy.sh

# Verify deployment success
curl http://127.0.0.1:3000/hello
# Expected response: "Hello world"
```

### Educational Deployment with Verbose Logging

For learning and troubleshooting, use verbose mode to see detailed educational information:

```bash
# Deploy with comprehensive educational logging
./infrastructure/scripts/deploy.sh --verbose --educational

# Comprehensive health validation with learning context
./infrastructure/scripts/health-check.sh --verbose --nodejs-fallback
```

### Alternative Quick Start Options

```bash
# NPM-based deployment (from project root)
npm run deploy:dev                    # Direct Node.js deployment
npm run deploy:docker                 # Docker containerization  
npm run deploy:compose                # Docker Compose orchestration

# Health check validation
npm run health-check                  # Basic health validation
npm run health:verbose                # Detailed health analysis
```

## 📋 Deployment Strategies Overview

The infrastructure supports **three progressive deployment strategies**, each designed to demonstrate specific DevOps concepts and infrastructure automation patterns:

### 🔧 Direct Node.js Deployment

**Perfect for**: Learning Node.js fundamentals, local development, and understanding application lifecycle management.

```bash
# Basic direct deployment
./infrastructure/scripts/deploy.sh --strategy direct

# Custom configuration
./infrastructure/scripts/deploy.sh --strategy direct --port 8080 --env development --verbose
```

**Educational Benefits:**
- Node.js process management and lifecycle understanding
- Environment variable configuration and application settings
- Direct dependency management and troubleshooting
- Native debugging and development workflows

**Resource Requirements:** Minimal (Node.js 18+, ~50MB RAM, ~10s startup)

### 🐳 Docker Container Deployment  

**Perfect for**: Environment consistency, containerization concepts, and production deployment preparation.

```bash
# Docker container deployment
./infrastructure/scripts/deploy.sh --strategy docker

# Production-optimized container deployment
./infrastructure/scripts/deploy.sh --strategy docker --env production --cleanup
```

**Educational Benefits:**
- Container isolation and portability concepts
- Docker image layering and optimization techniques
- Container security patterns and best practices
- Production deployment environment simulation

**Resource Requirements:** Moderate (Docker 20.10+, ~150MB RAM, ~60-180s startup)

### 🏗️ Docker Compose Orchestration

**Perfect for**: Service orchestration, networking concepts, and comprehensive infrastructure management.

```bash  
# Complete service orchestration
./infrastructure/scripts/deploy.sh --strategy docker-compose

# Advanced orchestration with monitoring
./infrastructure/scripts/deploy.sh --strategy docker-compose --verbose --health-retries 10
```

**Educational Benefits:**
- Multi-container service coordination and management
- Custom networking and service discovery patterns
- Volume management and data persistence concepts
- Production-like infrastructure simulation and monitoring

**Resource Requirements:** Higher (Docker Compose 2.0+, ~300MB RAM, ~90-300s startup)

## 🎯 Strategy Selection Guide

| Choose This Strategy | When You Want To Learn | Resource Usage | Complexity Level |
|---------------------|------------------------|----------------|------------------|
| **Direct Node.js** | Application fundamentals, debugging, local development | Minimal ⚡ | Beginner 🟢 |
| **Docker Container** | Containerization, environment consistency, deployment | Moderate 🔋 | Intermediate 🟡 |
| **Docker Compose** | Orchestration, networking, production infrastructure | Higher 🔋🔋 | Advanced 🔴 |

## 🏥 Health Monitoring & Validation

The infrastructure includes **comprehensive health monitoring** with both shell-based and Node.js application health checking for deployment validation and ongoing operational monitoring.

### Quick Health Check

```bash
# Basic health validation
./infrastructure/scripts/health-check.sh

# Comprehensive health analysis with educational insights
./infrastructure/scripts/health-check.sh --verbose --format json

# Health check with automatic Node.js fallback
./infrastructure/scripts/health-check.sh --nodejs-fallback --verbose
```

### Health Check Features

**Validation Criteria:**
- ✅ **HTTP Connectivity**: Successful endpoint accessibility validation
- ✅ **Response Content**: Exact "Hello world" message verification  
- ✅ **Status Code**: HTTP 200 OK compliance validation
- ✅ **Content Type**: Proper text/plain header verification
- ✅ **Performance**: Response time under 100ms threshold
- ✅ **Availability**: Retry logic with exponential backoff

**Expected Healthy Output:**
```
🏥 Node.js Tutorial Health Check Report
================================================================================
📋 HEALTH CHECK SUMMARY
   Timestamp: 2023-12-15T10:30:25.123Z
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

## ⚙️ Prerequisites & System Requirements

### Required Software

**Core Dependencies:**
- **Node.js 18+**: Runtime environment ([Download](https://nodejs.org/))
- **npm 8+**: Package manager (included with Node.js)
- **curl 7.0+**: Health check validation tool
- **bash 4.0+**: Deployment automation shell

**Docker Dependencies (for container strategies):**
- **Docker Engine 20.10+**: Container runtime ([Download](https://docker.com/))
- **Docker Compose 2.0+**: Service orchestration tool

### Quick Prerequisites Check

```bash
# Automated prerequisites validation
./infrastructure/scripts/deploy.sh --validate-env

# Manual verification
node --version     # Should show v18.x.x or higher
npm --version      # Should show 8.x.x or higher  
curl --version     # Should show curl 7.x.x or higher
docker --version   # Should show Docker version 20.10+
```

### System Requirements

| Resource | Minimum | Recommended | Purpose |
|----------|---------|-------------|---------|
| **RAM** | 512MB free | 2GB+ free | Comfortable development and container operations |
| **CPU** | 1 core | 2+ cores | Docker build operations and concurrent processes |
| **Disk** | 100MB free | 1GB+ free | Application, Docker images, and logs |
| **Network** | Localhost | High-speed connection | Container image downloads |

## 🎓 Educational Infrastructure Concepts

### Infrastructure as Code (IaC)

This infrastructure demonstrates **Infrastructure as Code principles** through:

```yaml
# docker-compose.yml - Declarative infrastructure definition
services:
  backend:
    build:
      context: ../..
      dockerfile: infrastructure/docker/Dockerfile.backend
    ports:
      - "127.0.0.1:3000:3000"
    healthcheck:
      test: ["CMD", "node", "scripts/health-check.js"]
      interval: 30s
      timeout: 10s
      retries: 3
```

**Learning Objectives:**
- Version-controlled infrastructure definitions
- Declarative vs. imperative configuration management
- Environment-specific deployment automation
- Infrastructure reproducibility and consistency

### Container Orchestration Patterns

**Service Discovery and Networking:**
```yaml
networks:
  tutorial-network:
    driver: bridge
    name: nodejs-tutorial-network
    ipam:
      config:
        - subnet: 172.20.0.0/16
          gateway: 172.20.0.1
```

**Data Persistence and Volume Management:**
```yaml
volumes:
  tutorial-logs:
    driver: local
    name: nodejs-tutorial-logs
```

### Deployment Automation Architecture

**Shell-Based Automation Framework:**
```bash
# deploy.sh - Comprehensive deployment orchestration
deploy_strategy() {
    local strategy="$1"
    
    case "$strategy" in
        "direct")    deploy_direct "$@" ;;
        "docker")    deploy_docker "$@" ;;
        "compose")   deploy_docker_compose "$@" ;;
    esac
    
    perform_health_checks "$@"
}
```

**Learning Concepts:**
- Multi-strategy deployment pattern implementation
- Comprehensive prerequisite validation and error handling
- Health check integration with retry logic and exponential backoff
- Educational logging with troubleshooting guidance and context

## 🛠️ Available Infrastructure Commands

### Primary Deployment Commands

```bash
# Strategy-specific deployment
npm run deploy:dev          # Direct Node.js deployment for development
npm run deploy:docker       # Docker containerized deployment  
npm run deploy:compose      # Docker Compose orchestration

# Advanced deployment options
npm run deploy:verbose      # Deployment with comprehensive educational logging
npm run deploy:production   # Production-optimized deployment configuration
npm run deploy:cleanup      # Deployment with automatic resource cleanup
```

### Health Monitoring Commands

```bash
# Basic health validation
npm run health-check        # Standard health check validation
npm run health:dev          # Development-specific health validation
npm run health:verbose      # Comprehensive health analysis with insights
npm run health:retry        # Health check with increased retry attempts
npm run health:nodejs       # Node.js fallback health validation
```

### Infrastructure Management Commands  

```bash
# System status and monitoring
npm run infrastructure:status      # Complete infrastructure status overview
npm run infrastructure:validate    # Prerequisites and environment validation
npm run infrastructure:cleanup     # Resource cleanup and optimization
npm run infrastructure:reset       # Complete infrastructure reset

# Docker-specific management
npm run docker:build              # Container image building
npm run docker:run                # Direct container execution
npm run docker:clean              # Docker resource cleanup
npm run docker:logs               # Container log analysis

# Docker Compose management  
npm run compose:up                # Service orchestration startup
npm run compose:down              # Service shutdown with cleanup
npm run compose:logs              # Aggregated service log analysis
npm run compose:ps                # Service status monitoring
npm run compose:restart           # Service restart procedures
```

## 🔧 Configuration & Customization

### Environment Configuration

**Development Environment:**
```bash
# Development deployment with custom port
./infrastructure/scripts/deploy.sh --strategy direct --port 8080 --env development

# Enable educational logging and verbose output
NODE_ENV=development EDUCATIONAL_LOGGING=true npm run deploy:dev
```

**Production Environment:**
```bash
# Production-optimized deployment  
./infrastructure/scripts/deploy.sh --strategy docker --env production --timeout 300

# Production health monitoring
NODE_ENV=production npm run health:verbose
```

### Advanced Configuration Options

```bash
# Complete deployment customization
./infrastructure/scripts/deploy.sh \
    --strategy docker-compose \
    --env production \
    --port 3000 \
    --host 127.0.0.1 \
    --timeout 300 \
    --health-retries 10 \
    --health-delay 3 \
    --verbose \
    --cleanup \
    --educational

# Health check customization
./infrastructure/scripts/health-check.sh \
    --host localhost \
    --port 3000 \
    --endpoint /hello \
    --timeout 15 \
    --retries 5 \
    --retry-delay 2 \
    --format json \
    --verbose
```

### Configuration Files

| File | Purpose | Location |
|------|---------|----------|
| `package.json` | NPM scripts and automation | `infrastructure/package.json` |
| `docker-compose.yml` | Service orchestration | `infrastructure/docker/docker-compose.yml` |
| `Dockerfile.backend` | Container build configuration | `infrastructure/docker/Dockerfile.backend` |
| `deploy.sh` | Deployment automation | `infrastructure/scripts/deploy.sh` |
| `health-check.sh` | Health validation | `infrastructure/scripts/health-check.sh` |

## 🚨 Troubleshooting Quick Reference

### Common Issues & Solutions

#### 🔌 Port Already in Use

**Symptoms:** `EADDRINUSE: address already in use :::3000`

```bash
# Identify conflicting process
lsof -ti:3000

# Resolution options
kill -9 $(lsof -ti:3000)                    # Kill conflicting process
PORT=3001 npm run deploy:dev                # Use alternative port
./infrastructure/scripts/deploy.sh --port 3001  # Deploy with custom port
```

#### 🐳 Docker Issues

**Symptoms:** `Cannot connect to the Docker daemon`

```bash
# Check Docker daemon status
docker info

# Start Docker service (Linux)
sudo systemctl start docker

# Restart Docker Desktop (macOS/Windows)
# Use Docker Desktop interface

# Fix permissions (Linux)
sudo usermod -a -G docker $USER
newgrp docker
```

#### ❌ Health Check Failures

**Symptoms:** Health checks timeout or return wrong content

```bash
# Manual endpoint testing
curl -v http://127.0.0.1:3000/hello

# Extended health check with troubleshooting
./infrastructure/scripts/health-check.sh --verbose --timeout 30 --retries 10

# Server restart and validation
npm run deploy:dev
sleep 10
npm run health-check
```

#### 💾 Resource Issues

**Symptoms:** Out of memory or disk space errors

```bash
# Check system resources
free -h                    # Memory usage
df -h                      # Disk usage
docker system prune -af    # Clean Docker resources

# Deploy with resource constraints
docker run --memory=256m --cpus="0.5" nodejs-tutorial
```

### Systematic Troubleshooting Approach

1. **🔍 Check Prerequisites**: Run `./infrastructure/scripts/deploy.sh --validate-env`
2. **📋 Verify Configuration**: Review port, environment, and network settings
3. **🏥 Test Health**: Use `npm run health:verbose` for detailed diagnosis
4. **📝 Check Logs**: Review application and container logs for errors
5. **🔄 Clean Restart**: Try `npm run infrastructure:cleanup` and redeploy
6. **🆘 Get Help**: Consult detailed [troubleshooting guide](docs/DEPLOYMENT.md#troubleshooting-guide)

## 📚 Detailed Documentation

### Comprehensive Guides

- **[📖 Complete Deployment Guide](docs/DEPLOYMENT.md)**: Detailed deployment procedures, advanced configuration, and comprehensive troubleshooting
- **[🏗️ Infrastructure Architecture](docs/INFRASTRUCTURE.md)**: Technical architecture, containerization patterns, and orchestration details
- **[🔧 Configuration Reference](../src/backend/README.md)**: Application configuration and development setup

### Educational Resources

**Infrastructure Learning Path:**
1. **Beginner**: Start with [Direct Node.js Deployment](docs/DEPLOYMENT.md#direct-nodejs-deployment)
2. **Intermediate**: Progress to [Docker Containerization](docs/DEPLOYMENT.md#docker-container-deployment)  
3. **Advanced**: Master [Docker Compose Orchestration](docs/DEPLOYMENT.md#docker-compose-orchestration)

**Key Learning Concepts:**
- **🎯 Deployment Strategies**: Multi-approach infrastructure automation
- **🐳 Containerization**: Docker isolation and portability concepts
- **🏗️ Orchestration**: Service coordination and networking patterns
- **🏥 Health Monitoring**: Observability and validation automation
- **⚙️ Configuration Management**: Environment-specific deployment automation
- **🔧 Shell Scripting**: Infrastructure automation best practices

## 🤝 Contributing & Development

### Infrastructure Development

```bash
# Development setup
git clone <repository-url>
cd nodejs-tutorial-http-server/infrastructure

# Test infrastructure changes
./scripts/deploy.sh --dry-run --verbose
./scripts/health-check.sh --verbose

# Validate script functionality
npm run infrastructure:validate
npm test  # Run infrastructure tests
```

### Educational Contributions

We welcome contributions that enhance the educational value:
- 📝 **Documentation improvements** with clearer explanations
- 🔧 **Script enhancements** with better error handling  
- 🎓 **Tutorial additions** for advanced concepts
- 🐛 **Bug fixes** with educational context
- 💡 **Feature suggestions** for learning improvements

## 📄 License & Educational Use

This infrastructure is designed for **educational purposes** and demonstrates professional deployment patterns suitable for learning environments. The configuration prioritizes educational value, safety (localhost binding), and hands-on learning opportunities over production optimization.

**Educational License**: Free for educational use, learning, and non-commercial development.

---

## 🎉 Getting Started Summary

Ready to begin your infrastructure learning journey? Choose your path:

**🚀 Quick Start (2 minutes):**
```bash
./infrastructure/scripts/deploy.sh
curl http://127.0.0.1:3000/hello
```

**🎓 Educational Journey (10 minutes):**
```bash
./infrastructure/scripts/deploy.sh --verbose --educational
./infrastructure/scripts/health-check.sh --verbose --nodejs-fallback
```

**🏗️ Complete Infrastructure Experience (20 minutes):**
```bash
npm run deploy:compose
npm run infrastructure:status
npm run health:verbose
```

**Need help?** Check the [complete deployment guide](docs/DEPLOYMENT.md) or [infrastructure architecture](docs/INFRASTRUCTURE.md) for detailed information and troubleshooting assistance.

---

*Built with ❤️ for Node.js education and infrastructure learning*