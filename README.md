# Node.js Tutorial HTTP Server

Educational Node.js HTTP server demonstrating fundamental web server concepts through a simple '/hello' endpoint that returns 'Hello world'. This tutorial application showcases Node.js built-in HTTP module capabilities, request-response patterns, basic routing, and essential web development concepts without external dependencies.

## 🎯 Educational Objectives

This tutorial project provides hands-on experience with Node.js HTTP server fundamentals:

- **Understanding Node.js HTTP server creation** using built-in modules without external dependencies
- **Learning application lifecycle management** from initialization through graceful shutdown
- **Practicing error handling patterns** and debugging techniques in Node.js applications
- **Exploring configuration management** and environment variable usage
- **Building foundation for scalable web application development** with professional patterns

## ✨ Features

- **Single '/hello' endpoint** returning 'Hello world' response for clear learning focus
- **Node.js built-in HTTP module implementation** demonstrating core capabilities without frameworks
- **Localhost-only binding** for security and educational purposes (127.0.0.1:3000)
- **Comprehensive educational logging** with detailed request processing insights
- **Graceful shutdown handling** with proper resource cleanup demonstration
- **Cross-platform compatibility** (Windows, macOS, Linux) for universal accessibility
- **Professional development workflow** with testing, linting, and automation tools
- **Docker containerization support** for consistent deployment environments

## 🔧 Prerequisites

### System Requirements

Before starting, ensure your development environment meets these requirements:

- **Node.js 18.0.0 or higher (LTS recommended)** - Required for modern JavaScript features and security updates
- **npm 8.0.0 or higher (bundled with Node.js)** - Package management and script execution
- **Terminal/Command line access** - For running development commands and monitoring server logs
- **Text editor or IDE with JavaScript support** - VS Code, WebStorm, or similar recommended

### Verification Commands

Verify your development environment with these commands:

```bash
# Check Node.js version (should be 18.0.0 or higher)
node --version

# Check npm version (should be 8.0.0 or higher)
npm --version

# Verify platform compatibility
node -p "process.platform + ' ' + process.arch"
```

### Recommended Development Tools

- **VS Code with Node.js extensions** - Enhanced JavaScript development experience
- **Chrome DevTools** - Network monitoring and request inspection capabilities
- **Git for version control** - Source code management and collaboration
- **HTTP client tools** - curl, Postman, or similar for endpoint testing

## 🚀 Quick Start

Get the tutorial server running in under 60 seconds:

### 1. Clone and Navigate

```bash
# Clone the repository (if applicable) or navigate to project directory
cd src/backend
```

### 2. Install Dependencies

```bash
# Install development dependencies (Jest, ESLint, nodemon)
npm install
```

### 3. Start Development Server

```bash
# Start server with automatic restart on file changes
npm run dev
```

### 4. Test the Server

```bash
# Open browser to:
# http://localhost:3000/hello

# Or use curl:
curl http://localhost:3000/hello

# Expected response: Hello world
```

### 5. Verify Success

You should see:
- Educational welcome banner with server configuration details
- Server startup messages with learning objectives
- Access URL: `http://127.0.0.1:3000`
- Primary endpoint: `http://127.0.0.1:3000/hello`
- Response: `Hello world` in plain text format

## 📦 Installation

### Local Development Installation

#### Step 1: Environment Setup

```bash
# Navigate to backend directory
cd src/backend

# Copy environment configuration template
cp .env.example .env
```

#### Step 2: Customize Configuration (Optional)

Edit `.env` file to customize server settings:

```bash
# Basic server configuration
NODE_ENV=development
PORT=3000
HOST=127.0.0.1
LOG_LEVEL=info

# Timeout settings (milliseconds)
SERVER_TIMEOUT=30000
KEEP_ALIVE_TIMEOUT=5000
```

#### Step 3: Install Dependencies

```bash
# Install all dependencies
npm install

# Verify installation
npm run health
```

#### Step 4: Validate Setup

```bash
# Run basic validation
npm run validate

# Check application health
npm run health
```

### Alternative Installation Methods

#### Docker Installation

```bash
# Using Docker Compose
docker-compose -f infrastructure/docker/docker-compose.yml up

# Access server at: http://localhost:3000/hello
```

#### Production Installation

```bash
# Install production dependencies only
npm ci --only=production

# Start in production mode
npm run server:prod
```

## 🎮 Usage

### Available Scripts

The tutorial provides comprehensive npm scripts for different development scenarios:

#### Development Scripts

```bash
# Primary development command with automatic restart
npm run dev

# Direct server execution
npm run server

# Production-like server startup
npm start

# Display tutorial welcome message
npm run tutorial
```

#### Testing Scripts

```bash
# Run all tests with coverage
npm test

# Run tests in watch mode for active development
npm run test:watch

# Generate detailed coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

#### Quality Assurance Scripts

```bash
# Check code quality with ESLint
npm run lint

# Fix automatically correctable linting issues
npm run lint:fix

# Strict quality check with zero warnings tolerance
npm run lint:check

# Comprehensive validation (lint + test + coverage)
npm run validate
```

#### Utility Scripts

```bash
# Check application health and configuration
npm run health

# Clean generated files and cache
npm run clean

# Reset project (clean + install)
npm run reset
```

### HTTP Server Usage

#### Basic Endpoint Testing

```bash
# Test hello endpoint with curl
curl http://localhost:3000/hello

# Test with verbose output to see headers
curl -v http://localhost:3000/hello

# Test with browser
open http://localhost:3000/hello  # macOS
xdg-open http://localhost:3000/hello  # Linux
start http://localhost:3000/hello  # Windows
```

#### Response Format

The server returns plain text responses:

```
GET http://localhost:3000/hello

HTTP/1.1 200 OK
Content-Type: text/plain
Content-Length: 11
Connection: keep-alive

Hello world
```

#### Server Monitoring

Monitor server activity through comprehensive educational logging:

```bash
# View server logs in development mode
npm run dev

# Monitor specific log levels
LOG_LEVEL=debug npm run dev

# Check server health
npm run health
```

## 📚 API Documentation

### Primary Endpoint

#### GET /hello

Returns a simple "Hello world" greeting message.

**Request:**
```http
GET /hello HTTP/1.1
Host: localhost:3000
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: text/plain
Content-Length: 11
Connection: keep-alive

Hello world
```

**Response Details:**
- **Status Code:** 200 OK
- **Content-Type:** text/plain
- **Response Body:** "Hello world" (plain text)
- **Response Time:** < 100ms average

#### Error Handling

**Unknown Endpoints:**
```http
GET /unknown HTTP/1.1
Host: localhost:3000

HTTP/1.1 404 Not Found
Content-Type: text/plain

Not Found
```

**Server Errors:**
- Internal errors return 500 status with educational error context
- All errors include appropriate HTTP status codes and descriptive messages

## 🛠️ Development

### Development Workflow

The tutorial supports efficient development with automatic restart and comprehensive monitoring:

#### 1. Start Development Environment

```bash
# Start with file watching and auto-restart
npm run dev
```

#### 2. Code Modification Workflow

- Edit any `.js` files in `lib/`, `scripts/`, or `server.js`
- Server automatically restarts within 1 second
- View detailed logs for request processing education
- Test changes immediately via browser or curl

#### 3. Testing During Development

```bash
# Run tests in watch mode
npm run test:watch

# Quick endpoint test
curl http://localhost:3000/hello

# Health check
npm run health
```

### Development Features

#### File Watching

The development server monitors these directories for changes:
- `lib/` - Core application logic
- `scripts/` - Development and utility scripts
- `server.js` - Main application entry point
- `.env` - Environment configuration

#### Educational Logging

Development mode provides comprehensive educational insights:

```javascript
[INFO] 🎓 NODE.JS TUTORIAL HTTP SERVER - Starting...
[DEBUG] Server configuration: { port: 3000, host: '127.0.0.1' }
[INFO] 🌐 Server started: http://127.0.0.1:3000
[DEBUG] GET /hello from 127.0.0.1
[INFO] Educational Note: Request-response cycle demonstrates HTTP protocol
[DEBUG] Response sent in 5ms
```

#### Live Debugging

- **Console debugging** with educational context throughout request lifecycle
- **Error messages** with troubleshooting guidance and learning notes
- **Performance metrics** for response time awareness and optimization learning

### Development Environment Configuration

#### Project Structure

```
src/backend/
├── server.js                 # Main application entry point and bootstrap
├── package.json              # Project configuration and dependencies
├── .env.example              # Environment configuration template
├── lib/                      # Core application modules
│   ├── server/               # HTTP server lifecycle management
│   ├── handlers/             # Request handlers for endpoints
│   ├── router/               # Request routing logic
│   ├── config/               # Configuration management
│   └── utils/                # Utilities (logging, validation, error handling)
├── scripts/                  # Development and automation scripts
├── __tests__/                # Comprehensive test suites
└── docs/                     # Detailed development documentation
```

#### Configuration Management

The application uses environment-based configuration:

```bash
# .env file configuration options
NODE_ENV=development          # Application environment
PORT=3000                     # HTTP server port
HOST=127.0.0.1               # Server hostname binding
LOG_LEVEL=info               # Logging verbosity (debug, info, warn, error)
SERVER_TIMEOUT=30000         # General server timeout (ms)
```

## 🧪 Testing

### Testing Strategy

The tutorial implements comprehensive testing with educational focus:

#### Testing Framework

- **Jest 29.7.0** - Zero-configuration testing framework with built-in assertions
- **SuperTest 6.3.3** - HTTP testing library for endpoint validation
- **Coverage reporting** with detailed metrics and HTML reports

#### Test Organization

```
__tests__/
├── unit/                     # Unit tests for individual components
│   ├── server.test.js        # HTTP server functionality
│   ├── handlers.test.js      # Request handler validation  
│   └── utils.test.js         # Utility function testing
├── integration/              # Integration tests for complete workflows
│   └── api.test.js           # End-to-end HTTP endpoint testing
└── helpers/                  # Testing utilities and fixtures
```

#### Coverage Requirements

- **Statement Coverage:** 85% minimum
- **Branch Coverage:** 80% minimum
- **Function Coverage:** 100% (all functions tested)
- **Line Coverage:** 85% minimum

### Running Tests

#### Basic Testing

```bash
# Run complete test suite
npm test

# Run with detailed output
npm run test:verbose

# Generate coverage report
npm run test:coverage
```

#### Development Testing

```bash
# Watch mode for active development
npm run test:watch

# Run specific test types
npm run test:unit
npm run test:integration
```

#### Test Reports

```bash
# Generate and view coverage report
npm run test:coverage
open coverage/lcov-report/index.html
```

### Testing Best Practices

#### Test Examples

**Unit Test Example:**
```javascript
describe('Hello Handler', () => {
  it('should return correct response for hello endpoint', () => {
    const response = helloHandler();
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('Hello world');
    expect(response.headers['Content-Type']).toBe('text/plain');
  });
});
```

**Integration Test Example:**
```javascript
describe('HTTP Server Integration', () => {
  it('should respond to GET /hello requests', async () => {
    const response = await request(app)
      .get('/hello')
      .expect(200)
      .expect('Content-Type', /text\/plain/);
    
    expect(response.text).toBe('Hello world');
  });
});
```

## 🐳 Docker Deployment

### Docker Compose Deployment

The tutorial includes complete Docker containerization for consistent deployment:

#### Quick Docker Start

```bash
# Start containerized application
docker-compose -f infrastructure/docker/docker-compose.yml up

# Start in background (detached mode)
docker-compose -f infrastructure/docker/docker-compose.yml up -d

# Access server: http://localhost:3000/hello
```

#### Docker Features

- **Multi-stage Dockerfile** for optimized production builds
- **Health monitoring** with automatic container health checks
- **Resource constraints** appropriate for educational environments
- **Volume persistence** for log data across container restarts
- **Security hardening** with non-root user execution

### Docker Commands

#### Container Management

```bash
# View container status and health
docker-compose -f infrastructure/docker/docker-compose.yml ps

# View application logs
docker-compose -f infrastructure/docker/docker-compose.yml logs backend

# Follow logs in real-time
docker-compose -f infrastructure/docker/docker-compose.yml logs -f backend

# Stop all services
docker-compose -f infrastructure/docker/docker-compose.yml down
```

#### Development with Docker

```bash
# Access container shell for debugging
docker-compose -f infrastructure/docker/docker-compose.yml exec backend /bin/sh

# Run health check manually
docker-compose -f infrastructure/docker/docker-compose.yml exec backend node scripts/health-check.js

# View container resource usage
docker stats nodejs-tutorial-backend
```

### Container Configuration

#### Resource Limits

The Docker configuration includes educational resource management:

- **Memory Limit:** 128MB (sufficient for tutorial HTTP server)
- **CPU Limit:** 0.5 cores (prevents resource exhaustion)
- **Memory Reservation:** 64MB (guaranteed minimum resources)
- **CPU Reservation:** 0.25 cores (baseline performance)

#### Network Configuration

- **Custom bridge network** for container isolation
- **Service discovery** with DNS-based container communication
- **Localhost-only binding** (127.0.0.1:3000) for security
- **Health monitoring** with automatic restart on failure

## 🎓 Educational Learning Path

### Learning Progression

#### Beginner Level (Start Here)

1. **Basic HTTP Server Understanding**
   - Start the server: `npm run dev`
   - Test the endpoint: `curl http://localhost:3000/hello`
   - Read server logs and understand request-response cycle

2. **Code Exploration**
   - Examine `server.js` for application structure
   - Review `lib/` directory for modular organization
   - Understand configuration in `package.json`

3. **Development Workflow**
   - Make simple code changes and observe auto-restart
   - Practice debugging with console logs
   - Run tests: `npm test`

#### Intermediate Level

1. **Advanced Features**
   - Explore error handling patterns in `lib/utils/error-handler.js`
   - Study logging implementation in `lib/utils/logger.js`
   - Understand configuration management in `lib/config/`

2. **Testing and Quality**
   - Write additional tests in `__tests__/` directory
   - Practice test-driven development with `npm run test:watch`
   - Use linting for code quality: `npm run lint:fix`

3. **Container Deployment**
   - Deploy with Docker: `docker-compose up`
   - Understand container orchestration and networking
   - Practice production deployment patterns

#### Advanced Level

1. **Architecture Extensions**
   - Add new endpoints beyond `/hello`
   - Implement middleware patterns
   - Add database integration (external project)

2. **Production Readiness**
   - Implement comprehensive monitoring
   - Add authentication and security features
   - Scale with load balancing and clustering

3. **Framework Migration**
   - Migrate to Express.js framework
   - Implement RESTful API patterns
   - Add template engines and static file serving

### Learning Resources

#### Internal Documentation

- **Development Guide:** `src/backend/docs/DEVELOPMENT.md` - Comprehensive development workflow
- **API Documentation:** HTTP endpoint specifications and usage examples
- **Configuration Guide:** Environment variables and application settings
- **Testing Documentation:** Testing strategies and best practices

#### External Learning Resources

- **Official Node.js Documentation:** [nodejs.org/docs](https://nodejs.org/docs)
- **HTTP Protocol Reference:** Understanding request-response patterns
- **JavaScript Modern Features:** ES2022+ syntax and capabilities
- **Docker Documentation:** Container deployment and orchestration

#### Community and Support

- **GitHub Issues:** Bug reports and feature requests
- **Stack Overflow:** Programming questions with `nodejs` and `http-server` tags
- **Node.js Community:** Discord, Reddit r/node, and official forums
- **Educational Platforms:** Online courses and tutorial resources

## 🤝 Contributing

### Contributing Guidelines

We welcome contributions that enhance the educational value and maintain the tutorial's learning focus:

#### Code Standards

- **Follow existing code style** with comprehensive educational comments
- **Maintain educational value** - prioritize learning over complexity
- **Write comprehensive tests** for all new functionality
- **Update documentation** for user-facing changes

#### Development Process

1. **Fork the repository** and create a feature branch
2. **Make changes** with educational context and clear comments
3. **Run quality checks:** `npm run validate`
4. **Write or update tests** to maintain coverage requirements
5. **Update documentation** in README.md and DEVELOPMENT.md
6. **Submit pull request** with detailed description

#### Code Quality Requirements

```bash
# Before submitting contributions
npm run validate        # Comprehensive validation
npm run lint:check      # Zero-warning code quality
npm run test:coverage   # Maintain coverage thresholds
```

#### Educational Considerations

- **Preserve learning objectives** - maintain tutorial focus
- **Add educational value** - include learning context in changes
- **Keep complexity appropriate** - avoid over-engineering for tutorial scope
- **Document educational benefits** - explain learning outcomes

### Contribution Areas

#### Welcome Contributions

- **Documentation improvements** with educational enhancements
- **Additional test cases** for educational testing examples
- **Error handling improvements** with better educational guidance
- **Performance optimizations** with learning context
- **Cross-platform compatibility** fixes and improvements

#### Future Enhancement Ideas

- **Additional HTTP methods** (POST, PUT, DELETE) for learning expansion
- **Request parameter parsing** for dynamic endpoint examples
- **Middleware implementation** demonstrating middleware patterns
- **Static file serving** for complete web server education
- **Authentication examples** for security learning

## 📄 License and Support

### License

This Node.js tutorial HTTP server is released under the **MIT License**, providing maximum flexibility for educational and commercial use:

```
MIT License - Free for educational and commercial use
- Modify and distribute freely
- Include copyright notice in derivatives
- No warranty provided - educational use only
```

### Support Resources

#### Getting Help

- **GitHub Issues:** [Report bugs and request features](https://github.com/nodejs-tutorial/http-server/issues)
- **Troubleshooting Guide:** See `src/backend/docs/DEVELOPMENT.md` for detailed troubleshooting
- **Educational Support:** Community-driven assistance for learning objectives

#### Documentation

- **Complete Development Guide:** `src/backend/docs/DEVELOPMENT.md`
- **API Reference:** HTTP endpoint specifications and usage
- **Configuration Reference:** Environment variables and settings
- **Docker Guide:** Container deployment and orchestration

#### Community Resources

- **Node.js Official Documentation:** [nodejs.org](https://nodejs.org/docs)
- **Learning Path:** Progressive tutorial for advancing Node.js skills
- **Best Practices:** Professional development patterns and conventions
- **Extension Examples:** Building upon tutorial foundations

### Educational Support Statement

This tutorial is designed for educational purposes and provides a foundation for understanding Node.js HTTP server development. While suitable for learning and experimentation, additional security, monitoring, and scalability considerations are required for production deployment.

**Learning Commitment:** We maintain this tutorial to provide clear, accurate, and educational Node.js examples that help developers build strong foundations in server-side JavaScript development.

---

## 🏁 Getting Started Checklist

Ready to start learning? Complete this checklist:

- [ ] ✅ **Verify Node.js 18.0.0+ installed:** `node --version`
- [ ] ✅ **Navigate to backend directory:** `cd src/backend`
- [ ] ✅ **Install dependencies:** `npm install`
- [ ] ✅ **Start development server:** `npm run dev`
- [ ] ✅ **Test hello endpoint:** `curl http://localhost:3000/hello`
- [ ] ✅ **Verify "Hello world" response received**
- [ ] ✅ **Explore development documentation:** `src/backend/docs/DEVELOPMENT.md`
- [ ] ✅ **Run test suite:** `npm test`
- [ ] ✅ **Try Docker deployment:** `docker-compose up` (optional)

**🎉 Success!** You now have a working Node.js HTTP server tutorial environment. 

**Next Steps:** Explore the code, make modifications, run tests, and build upon these foundations to create more complex Node.js applications.

Happy learning! 🚀📚

---

*Node.js Tutorial HTTP Server v1.0.0 - Educational HTTP server demonstrating fundamental Node.js concepts*