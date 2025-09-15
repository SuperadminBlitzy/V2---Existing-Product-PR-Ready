# Backend Application Deployment Guide

## Overview

This document provides comprehensive deployment procedures for the Node.js Tutorial HTTP Server application. This educational backend service implements a single `/hello` endpoint that returns "Hello world" and serves as a foundational learning platform for Node.js HTTP server concepts, deployment strategies, and production operations.

**Application Characteristics:**
- **Runtime**: Node.js 18+ (LTS recommended)  
- **Architecture**: Monolithic HTTP server with modular components
- **Dependencies**: Zero production dependencies (development tools only)
- **Scope**: Educational tutorial demonstrating Node.js built-in HTTP capabilities
- **Deployment Target**: Localhost-first with production deployment options

**Educational Objectives:**
- Demonstrate Node.js application deployment strategies and operational procedures
- Provide hands-on experience with configuration management and environment handling
- Illustrate process management, monitoring integration, and troubleshooting methodologies
- Teach production deployment best practices and operational maintenance

## Prerequisites

### System Requirements

**Minimum Requirements:**
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Memory (RAM)**: 512MB available (1GB recommended)
- **Storage**: 100MB free disk space (500MB recommended for development tools)
- **Network**: Localhost network interface (127.0.0.1)

**Required Software:**

| Software | Version | Purpose | Installation Verification |
|----------|---------|---------|---------------------------|
| Node.js | 18.0+ (LTS) | JavaScript runtime for application execution | `node --version` |
| npm | 8.0+ | Package manager for dependency management | `npm --version` |

**Optional Production Tools:**

| Tool | Version | Purpose | Installation |
|------|---------|---------|--------------|
| PM2 | 5.0+ | Production process manager | `npm install -g pm2` |
| curl | 7.0+ | HTTP client for validation | System package manager |

### Installation Verification

Verify your system meets the prerequisites:

```bash
# Check Node.js version (must be 18+)
node --version

# Check npm version (must be 8+)  
npm --version

# Verify network interface availability
ping -c 1 127.0.0.1

# Check port availability (optional)
netstat -tulpn | grep :3000
```

Expected output indicators:
- Node.js version: `v18.x.x` or higher
- npm version: `8.x.x` or higher  
- Ping response: `1 packets transmitted, 1 received`
- Port check: No output (port 3000 available)

## Local Development Deployment

### Quick Start

For immediate local deployment and testing:

```bash
# 1. Navigate to backend directory
cd src/backend

# 2. Install development dependencies
npm install

# 3. Configure environment (optional)
cp .env.example .env

# 4. Start development server
npm run dev
```

The application will start on `http://localhost:3000` with auto-reload enabled.

### Detailed Development Setup

**Step 1: Dependency Installation**

```bash
# Install all dependencies (development tools only)
npm install

# Verify installation
npm ls --depth=0
```

Expected development dependencies:
- `jest` (testing framework)
- `eslint` (code linting)  
- `nodemon` (auto-reload during development)
- `supertest` (HTTP testing utilities)

**Step 2: Environment Configuration**

Create environment configuration from template:

```bash
# Copy environment template
cp .env.example .env

# Edit configuration (optional)
nano .env
```

Development environment variables:
```bash
# Application Environment
NODE_ENV=development

# Server Configuration  
PORT=3000
HOST=127.0.0.1

# Logging Configuration
LOG_LEVEL=debug

# Development Features
EDUCATIONAL_MODE=true
DEVELOPMENT_LOGGING=true
```

**Step 3: Development Server Startup**

```bash
# Start with auto-reload (recommended)
npm run dev

# Alternative: Start without auto-reload
npm start

# Educational mode with detailed logging
NODE_ENV=development npm run dev
```

**Step 4: Deployment Validation**

Validate development deployment:

```bash
# Test endpoint functionality
curl http://localhost:3000/hello

# Run health check
npm run health-check

# Run test suite
npm test
```

Expected validation results:
- Endpoint response: `Hello world`
- Health check: `Health check passed`
- Test results: All tests passing

## Production Deployment

### Production Environment Setup

**Step 1: Production Dependencies**

```bash
# Clean installation (production only)
npm ci --production

# Verify production installation
npm ls --depth=0 --production
```

Note: This application has zero production dependencies, so only the application code is deployed.

**Step 2: Production Environment Configuration**

Create production environment configuration:

```bash
# Production environment template
cat > .env.production << 'EOF'
# Production Environment Configuration
NODE_ENV=production

# Server Configuration
PORT=3000
HOST=0.0.0.0

# Logging Configuration  
LOG_LEVEL=info
LOG_TO_FILE=true

# Performance Configuration
SERVER_TIMEOUT=30000
KEEP_ALIVE_TIMEOUT=65000

# Security Configuration
EDUCATIONAL_MODE=false
DEVELOPMENT_LOGGING=false
EOF
```

**Step 3: Production Startup Options**

**Option A: Direct Node.js Execution**

```bash
# Production startup
NODE_ENV=production node scripts/start.js

# Background execution with nohup
nohup NODE_ENV=production node scripts/start.js > logs/application.log 2>&1 &
```

**Option B: Using npm Scripts**

```bash
# Production script execution
npm run server:prod

# With custom environment
NODE_ENV=production npm start
```

### Process Manager Deployment (Recommended)

**PM2 Production Deployment**

Install and configure PM2 for production process management:

```bash
# Install PM2 globally
npm install -g pm2

# Create PM2 ecosystem configuration
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'nodejs-tutorial-server',
    script: 'scripts/start.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0',
      LOG_LEVEL: 'info'
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true,
    max_restarts: 5,
    min_uptime: '10s'
  }]
};
EOF

# Deploy with PM2
pm2 start ecosystem.config.js

# Verify deployment
pm2 status
pm2 logs nodejs-tutorial-server
```

**PM2 Management Commands**

```bash
# Process control
pm2 start nodejs-tutorial-server    # Start application
pm2 stop nodejs-tutorial-server     # Stop application  
pm2 restart nodejs-tutorial-server  # Restart application
pm2 reload nodejs-tutorial-server   # Graceful reload

# Monitoring
pm2 monit                           # Real-time monitoring
pm2 logs nodejs-tutorial-server    # View logs
pm2 status                          # Process status

# Persistence
pm2 save                            # Save current processes
pm2 startup                         # Generate startup script
```

## Configuration Management

### Environment Variables

**Core Configuration Variables:**

| Variable | Development | Production | Description |
|----------|-------------|------------|-------------|
| `NODE_ENV` | `development` | `production` | Runtime environment mode |
| `PORT` | `3000` | `3000` | HTTP server listen port |
| `HOST` | `127.0.0.1` | `0.0.0.0` | Server hostname binding |
| `LOG_LEVEL` | `debug` | `info` | Logging verbosity level |

**Advanced Configuration:**

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_TIMEOUT` | `30000` | HTTP server timeout (milliseconds) |
| `KEEP_ALIVE_TIMEOUT` | `65000` | Keep-alive timeout (milliseconds) |
| `EDUCATIONAL_MODE` | `true` | Enable educational features and verbose logging |
| `LOG_TO_FILE` | `false` | Enable file-based logging output |

### Configuration Validation

Verify configuration with the built-in validation:

```bash
# Validate current configuration
node -e "console.log(require('./lib/config/app-config.js'))"

# Test configuration in different environments
NODE_ENV=development node -e "console.log(require('./lib/config/app-config.js'))"
NODE_ENV=production node -e "console.log(require('./lib/config/app-config.js'))"
```

### Environment-Specific Configurations

**Development Environment:**
- Enhanced logging with debug information
- Educational banners and guidance
- Auto-reload capabilities with nodemon
- Localhost-only binding for security

**Production Environment:**  
- Optimized logging (info level)
- External network binding (0.0.0.0)
- Process management integration
- Performance monitoring enabled

## Monitoring and Health Checks

### Health Check Integration

The application includes a comprehensive health check script for monitoring:

**Manual Health Check:**

```bash
# Basic health check
npm run health-check

# Health check with verbose output
node scripts/health-check.js --verbose

# Custom timeout and endpoint
node scripts/health-check.js --timeout 10000 --endpoint /hello
```

**Automated Health Check Integration:**

```bash
# Continuous monitoring (every 30 seconds)
watch -n 30 'npm run health-check'

# Integration with monitoring systems
curl -f http://localhost:3000/hello || exit 1

# PM2 health check integration
pm2 start ecosystem.config.js --health-check-grace-period 5000
```

### Logging Configuration

**Development Logging:**
```javascript
// Console output with structured logging
LOG_LEVEL=debug
DEVELOPMENT_LOGGING=true
EDUCATIONAL_MODE=true
```

**Production Logging:**
```javascript
// File-based logging with rotation
LOG_LEVEL=info
LOG_TO_FILE=true
LOG_ROTATION=true
```

**Log Management:**

```bash
# View application logs
tail -f logs/application.log

# PM2 log management
pm2 logs nodejs-tutorial-server
pm2 flush nodejs-tutorial-server  # Clear logs

# Log rotation setup (PM2)
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### Performance Monitoring

**Basic Performance Metrics:**

```bash
# Monitor server performance
top -p $(pgrep node)

# Network monitoring
netstat -tulpn | grep :3000

# Memory usage tracking
ps aux | grep node
```

**Advanced Monitoring with PM2:**

```bash
# Real-time monitoring dashboard
pm2 monit

# Performance metrics
pm2 describe nodejs-tutorial-server

# Resource usage statistics
pm2 show nodejs-tutorial-server
```

## Troubleshooting

### Common Deployment Issues

**Issue 1: Port Already in Use**

```bash
# Symptoms
Error: listen EADDRINUSE :::3000

# Diagnosis
netstat -tulpn | grep :3000
lsof -ti:3000

# Resolution
pkill -f "node.*3000"           # Kill conflicting process
export PORT=3001                # Use different port
pm2 delete all && pm2 start    # Restart PM2 processes
```

**Issue 2: Permission Denied**

```bash
# Symptoms  
Error: EACCES: permission denied

# Diagnosis
ls -la server.js
whoami

# Resolution
chmod +x scripts/start.js       # Fix script permissions
chown $USER:$USER *.js         # Fix file ownership
sudo -u nodejs npm start       # Run as specific user
```

**Issue 3: Module Not Found**

```bash
# Symptoms
Error: Cannot find module

# Diagnosis
npm ls                          # Check installed packages
node -e "console.log(process.env.NODE_PATH)"

# Resolution
rm -rf node_modules package-lock.json
npm install                     # Clean reinstall
npm cache clean --force        # Clear npm cache
```

### Diagnostic Procedures

**Application Startup Diagnosis:**

```bash
# Check server process
ps aux | grep node

# Verify port binding
netstat -tulpn | grep 3000

# Test connectivity
curl -v http://localhost:3000/hello

# Review startup logs
tail -f logs/application.log
```

**Configuration Diagnosis:**

```bash
# Validate environment variables
env | grep NODE

# Test configuration loading
node -p "require('./lib/config/app-config.js')"

# Check file permissions
find . -name "*.js" -exec ls -la {} \;
```

**Performance Diagnosis:**

```bash
# Monitor resource usage
top -p $(pgrep node)

# Check response times  
curl -w '%{time_total}\n' -o /dev/null http://localhost:3000/hello

# Analyze server logs for bottlenecks
grep -i "slow\|timeout\|error" logs/application.log
```

### Recovery Procedures

**Graceful Recovery:**

```bash
# Graceful application restart
pm2 restart nodejs-tutorial-server --update-env

# Clean process restart
pm2 delete nodejs-tutorial-server
pm2 start ecosystem.config.js

# Full environment reset
pm2 kill
rm -rf logs/*
npm run server:prod
```

**Emergency Recovery:**

```bash
# Force kill all Node.js processes
pkill -9 node

# Clean temporary files
rm -rf /tmp/nodejs-*

# Redeploy from clean state
git clean -fdx
npm install
npm run server:prod
```

## Security Considerations

### Development Security

**Localhost Binding:**
```javascript
// Development configuration (secure)
HOST=127.0.0.1  // Localhost only
PORT=3000       // Standard development port
```

**Production Security:**

```javascript
// Production configuration
HOST=0.0.0.0    // External access (configure firewall)
NODE_ENV=production  // Disable development features
EDUCATIONAL_MODE=false  // Disable verbose logging
```

### Security Best Practices

**Network Security:**
- Use firewall rules to restrict port 3000 access
- Consider reverse proxy (nginx) for production
- Implement rate limiting for production deployments
- Regular security updates for Node.js runtime

**Process Security:**
- Run application as non-root user
- Use process isolation with containers (future enhancement)
- Implement proper log rotation and cleanup
- Monitor for security vulnerabilities in dependencies

## Educational Concepts

### Deployment Strategy Comparison

| Strategy | Use Case | Advantages | Disadvantages |
|----------|----------|------------|---------------|
| **Direct Node.js** | Development, Learning | Simple setup, Direct debugging | Manual process management |
| **npm Scripts** | Tutorial, Education | Standardized commands | Limited production features |
| **PM2 Manager** | Production, Scaling | Process management, Monitoring | Additional dependency |
| **Container Deploy** | Cloud, Microservices | Environment consistency | Infrastructure complexity |

### Learning Objectives Achieved

**Operational Skills:**
- Node.js application lifecycle management
- Environment configuration and management
- Process monitoring and health checking
- Troubleshooting and diagnostic techniques

**Professional Practices:**
- Production deployment procedures
- Configuration management strategies
- Logging and monitoring integration
- Security considerations and best practices

## Maintenance Procedures

### Regular Maintenance

**Daily Operations:**
```bash
# Health check validation
npm run health-check

# Log review and cleanup  
tail -100 logs/application.log
find logs/ -name "*.log" -mtime +7 -delete

# Process status verification
pm2 status
```

**Weekly Maintenance:**
```bash
# Security updates
npm audit
npm update

# Log rotation
pm2 reloadLogs

# Performance review
pm2 describe nodejs-tutorial-server
```

**Monthly Maintenance:**
```bash
# System updates
node --version  # Check for LTS updates
npm --version   # Verify npm version

# Configuration validation
node scripts/health-check.js --verbose

# Backup procedures
tar -czf backup-$(date +%Y%m%d).tar.gz src/backend/
```

### Backup and Recovery

**Configuration Backup:**
```bash
# Backup critical configuration files
cp .env .env.backup.$(date +%Y%m%d)
cp ecosystem.config.js ecosystem.backup.$(date +%Y%m%d)

# Application backup
tar -czf nodejs-tutorial-backup-$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=logs \
  src/backend/
```

**Recovery Procedures:**
```bash
# Restore from backup
tar -xzf nodejs-tutorial-backup-YYYYMMDD.tar.gz

# Restore configuration
cp .env.backup.YYYYMMDD .env

# Redeploy application
npm install
pm2 start ecosystem.config.js
```

## Integration with Infrastructure

### Container Integration

For advanced deployment scenarios, this backend integrates with containerized infrastructure:

**Docker Integration Points:**
- Environment variable configuration aligns with container environment
- Health check endpoint (`/hello`) suitable for container health checks
- Logging output compatible with container log collection
- Process management adaptable to container orchestration

**Kubernetes Readiness:**
- Health check endpoint enables readiness and liveness probes
- Configuration externalization supports ConfigMap integration
- Logging framework compatible with centralized log aggregation
- Horizontal scaling capabilities with stateless design

### CI/CD Integration

**Pipeline Integration Points:**
```bash
# Build verification
npm install
npm test
npm run health-check

# Deployment commands
npm ci --production
pm2 start ecosystem.config.js
npm run health-check --timeout 30000
```

**Automation Scripts:**
- `scripts/start.js` - Production startup script
- `scripts/health-check.js` - Deployment validation
- `package.json` scripts - Standardized commands

## Conclusion

This deployment guide provides comprehensive procedures for deploying the Node.js Tutorial HTTP Server application across development and production environments. The deployment strategies balance educational value with production readiness, providing hands-on experience with Node.js operational best practices.

**Key Takeaways:**
- Zero production dependencies simplify deployment procedures
- Multiple deployment strategies accommodate different learning objectives
- Comprehensive monitoring and troubleshooting enable operational excellence
- Educational focus provides learning opportunities throughout deployment lifecycle

**Next Steps:**
- Experiment with different deployment strategies
- Practice troubleshooting procedures with intentional failures  
- Explore advanced monitoring and automation integration
- Consider containerization for enhanced infrastructure integration

For additional support, review server logs, consult the health check script output, or refer to the troubleshooting procedures outlined in this document.