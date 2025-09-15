# Development Guide

Comprehensive development documentation for the Node.js tutorial HTTP server application that demonstrates fundamental Node.js concepts, development workflows, and professional development practices through a simple educational HTTP server.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development Environment Setup](#development-environment-setup)
- [Development Workflow](#development-workflow)
- [Available Scripts](#available-scripts)
- [Testing and Quality Assurance](#testing-and-quality-assurance)
- [Debugging and Troubleshooting](#debugging-and-troubleshooting)
- [Code Organization](#code-organization)
- [Configuration Management](#configuration-management)
- [Best Practices](#best-practices)
- [Next Steps](#next-steps)

## Prerequisites

### System Requirements

Before starting development, ensure your system meets the following requirements:

- **Node.js 18.0.0 or higher (LTS recommended)** - The application requires modern Node.js features and ECMAScript 2022+ support
- **npm 8.0.0 or higher (bundled with Node.js)** - Package management and script execution
- **Terminal/Command line access** - For running development commands and monitoring server logs
- **Text editor or IDE with JavaScript support** - VS Code, WebStorm, or similar
- **Git for version control (optional but recommended)** - Source code management and collaboration

### Verification Commands

Run these commands to verify your development environment:

```bash
# Check Node.js version (should be 18.0.0 or higher)
node --version

# Check npm version (should be 8.0.0 or higher)
npm --version

# Optional: Check git version for version control
git --version
```

### Recommended Development Tools

- **VS Code with Node.js extensions** - Enhanced JavaScript development experience
- **Chrome DevTools for debugging** - Network monitoring and request inspection
- **Postman or similar HTTP client** - API testing and endpoint validation
- **Git Bash on Windows** - Better terminal experience on Windows systems

## Quick Start

Get the tutorial server running in under 60 seconds:

### Setup Steps

1. **Navigate to the backend directory:**
   ```bash
   cd src/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Copy environment configuration (optional):**
   ```bash
   cp .env.example .env
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Test the server:**
   ```bash
   # Open browser to:
   http://localhost:3000/hello
   
   # Or use curl:
   curl http://localhost:3000/hello
   ```

### Expected Output

You should see:
- Server startup messages with educational banner
- Access URL: `http://127.0.0.1:3000`
- Primary endpoint: `http://127.0.0.1:3000/hello`
- Response: `Hello world`

### Quick Troubleshooting

- **Port 3000 in use?** Change port: `PORT=3001 npm run dev`
- **Dependencies fail to install?** Try: `npm cache clean --force && npm install`
- **Node.js version too old?** Install Node.js 18+ LTS from [nodejs.org](https://nodejs.org)

## Development Environment Setup

### Initial Setup

#### Dependency Installation

The application uses minimal dependencies focused on development tooling and educational value:

```bash
# Install all development dependencies
npm install
```

**Development Dependencies Installed:**
- **Jest ^29.7.0** - Testing framework with zero configuration
- **ESLint ^8.0.0** - Code quality and style enforcement
- **nodemon ^3.0.1** - Automatic restart during development
- **supertest ^6.3.3** - HTTP testing library for endpoint testing

#### Environment Configuration

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Customize values as needed:**
   ```bash
   # Basic configuration
   NODE_ENV=development
   PORT=3000
   HOST=127.0.0.1
   LOG_LEVEL=info
   
   # Timeout settings (in milliseconds)
   SERVER_TIMEOUT=30000
   KEEP_ALIVE_TIMEOUT=5000
   REQUEST_TIMEOUT=10000
   ```

#### IDE Setup

**VS Code Configuration:**
1. Install recommended extensions:
   - Node.js Extension Pack
   - ESLint
   - Jest
   - JavaScript (ES6) code snippets

2. Configure workspace settings (`.vscode/settings.json`):
   ```json
   {
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "editor.formatOnSave": true,
     "editor.codeActionsOnSave": {
       "source.fixAll.eslint": true
     },
     "jest.jestCommandLine": "npm test"
   }
   ```

### Configuration Files Overview

#### package.json
Contains project metadata, dependencies, and comprehensive npm scripts for development automation:

```json
{
  "scripts": {
    "start": "node scripts/start.js",
    "dev": "nodemon --config nodemon.json",
    "test": "jest --config jest.config.js",
    "test:watch": "jest --config jest.config.js --watch",
    "test:coverage": "jest --config jest.config.js --coverage",
    "lint": "eslint . --config .eslintrc.js",
    "lint:fix": "eslint . --config .eslintrc.js --fix"
  }
}
```

#### .env.example
Comprehensive template for environment variables with educational comments explaining each setting:
- Application environment configuration (development, production, test)
- HTTP server settings (port, hostname, timeouts)
- Logging configuration with multiple verbosity levels
- Educational notes and troubleshooting guidance

#### nodemon.json
Development server configuration with file watching and automatic restart:

```json
{
  "script": "scripts/dev.js",
  "watch": ["lib/", "scripts/", "server.js", ".env"],
  "ignore": ["node_modules/", "coverage/", "logs/", "__tests__/"],
  "ext": "js,json,env",
  "delay": 1000,
  "env": {
    "NODE_ENV": "development",
    "LOG_LEVEL": "debug",
    "EDUCATIONAL_MODE": "true"
  }
}
```

### Directory Structure

Understanding the project organization:

```
src/backend/
├── server.js                 # Main application entry point
├── package.json              # Project configuration and dependencies
├── .env.example              # Environment variable template
├── nodemon.json              # Development server configuration
├── lib/                      # Core application logic
│   ├── server/               # HTTP server creation and lifecycle
│   ├── handlers/             # Request handlers for endpoints
│   ├── router/               # Request routing logic
│   ├── config/               # Application configuration management
│   ├── utils/                # Utility functions (logging, validation)
│   ├── middleware/           # HTTP middleware (future expansion)
│   └── response/             # Response generation utilities
├── scripts/                  # Automation and utility scripts
│   ├── dev.js                # Development environment startup
│   ├── start.js              # Production startup script
│   └── health-check.js       # Server health validation
├── __tests__/                # Test suites and testing utilities
│   ├── unit/                 # Unit tests for individual components
│   ├── integration/          # Integration tests for full workflows
│   └── helpers/              # Testing utilities and fixtures
└── docs/                     # Project documentation
    ├── DEVELOPMENT.md        # This development guide
    └── API.md                # API documentation (if applicable)
```

## Development Workflow

### Daily Development Workflow

1. **Start development server with automatic restart:**
   ```bash
   npm run dev
   ```

2. **Make code changes** in any of the watched directories:
   - `lib/` - Core application logic
   - `scripts/` - Development and utility scripts
   - `server.js` - Main application entry point
   - `.env` - Environment configuration

3. **Test changes automatically** via browser or HTTP client:
   ```bash
   # Test with curl
   curl http://localhost:3000/hello
   
   # Test with verbose output
   curl -v http://localhost:3000/hello
   
   # Test with browser
   open http://localhost:3000/hello
   ```

4. **Run tests** to verify functionality:
   ```bash
   # Run all tests
   npm test
   
   # Run tests with file watching
   npm run test:watch
   
   # Generate coverage report
   npm run test:coverage
   ```

5. **Check code quality:**
   ```bash
   # Run linting
   npm run lint
   
   # Fix linting issues automatically
   npm run lint:fix
   ```

6. **Commit changes** with descriptive messages following conventional commit format

### File Watching and Automatic Restart

The development environment uses nodemon for automatic server restart on file changes:

**Watched Directories:**
- `lib/` - Core application code
- `scripts/` - Development and utility scripts
- `server.js` - Main application entry point
- `.env` - Environment configuration

**Ignored Patterns:**
- `node_modules/` - Third-party dependencies
- `coverage/` - Test coverage reports
- `logs/` - Application log files
- `__tests__/` - Test files
- `docs/` - Documentation files

**Restart Behavior:**
- **1 second delay** prevents rapid restart cycles during multiple file saves
- **Manual restart:** Type `rs` and press Enter to manually restart the development server
- **Educational logging:** Comprehensive restart information with educational context

### Development Modes

#### Development Mode (`npm run dev`)
- Starts with file watching using nodemon
- Debug logging enabled for educational insights
- Automatic restart on file changes
- Enhanced error messages with troubleshooting guidance
- Educational development features enabled

#### Production Mode (`npm start`)
- Production-like startup without file watching
- Optimized logging levels
- Performance optimizations enabled
- Production error handling

#### Testing Mode (`npm test`)
- Runs complete test suite with coverage reporting
- Test environment configuration
- Comprehensive test output with educational context

## Available Scripts

### Primary Development Scripts

#### `npm start`
**Purpose:** Starts the server in production mode using `scripts/start.js`
```bash
npm start
```
- Production-like behavior for final validation
- Optimized performance and logging
- No file watching or development features
- Suitable for deployment testing

#### `npm run dev`
**Purpose:** Starts development server with automatic restart using nodemon
```bash
npm run dev
```
- Primary command for development work
- File watching enabled for automatic restart
- Debug logging and educational features
- Enhanced error messages and guidance

#### `npm run server`
**Purpose:** Directly starts the server using Node.js without additional tooling
```bash
npm run server
```
- Direct execution of `server.js`
- No file watching or automatic restart
- Useful for debugging or minimal environment testing

### Testing Scripts

#### `npm test`
**Purpose:** Runs complete test suite including unit and integration tests
```bash
npm test
```
- Executes all tests with Jest framework
- Generates basic test results
- Includes pre-test linting check

#### `npm run test:watch`
**Purpose:** Continuously runs tests when files change
```bash
npm run test:watch
```
- Monitors file changes and re-runs affected tests
- Immediate feedback during development
- Optimized for test-driven development workflow

#### `npm run test:coverage`
**Purpose:** Generates detailed test coverage reports
```bash
npm run test:coverage
```
- Creates coverage reports in `coverage/` directory
- HTML report viewable in browser
- Coverage thresholds: 85% statements, 80% branches, 100% functions

#### `npm run test:unit`
**Purpose:** Runs only unit tests for isolated component testing
```bash
npm run test:unit
```
- Focuses on individual component testing
- Faster execution than full test suite
- Useful for component development

#### `npm run test:integration`
**Purpose:** Runs integration tests for end-to-end functionality
```bash
npm run test:integration
```
- Tests complete request-response cycles
- Validates component interaction
- HTTP endpoint testing with supertest

### Code Quality Scripts

#### `npm run lint`
**Purpose:** Runs ESLint to check code quality and style consistency
```bash
npm run lint
```
- Identifies code quality issues
- Enforces consistent coding standards
- Educational rule set for learning best practices

#### `npm run lint:fix`
**Purpose:** Automatically fixes linting issues where possible
```bash
npm run lint:fix
```
- Resolves formatting and style issues
- Safe automatic corrections only
- Manual review required for complex issues

#### `npm run lint:check`
**Purpose:** Strict linting with zero warnings tolerance
```bash
npm run lint:check
```
- Enforces maximum code quality standards
- Fails on any warnings or errors
- Used in pre-commit checks and CI/CD

### Utility Scripts

#### `npm run health`
**Purpose:** Verifies server health and configuration status
```bash
npm run health
```
- Validates application configuration
- Checks system requirements
- Reports server health status

#### `npm run clean`
**Purpose:** Removes generated files and cache
```bash
npm run clean
```
- Clears coverage reports
- Removes log files
- Cleans temporary files

#### `npm run validate`
**Purpose:** Runs comprehensive validation (linting + testing)
```bash
npm run validate
```
- Complete code quality check
- Full test suite execution
- Recommended before commits

### Educational Scripts

#### `npm run tutorial`
**Purpose:** Displays welcome message and getting started guidance
```bash
npm run tutorial
```
- Shows educational welcome message
- Provides quick start instructions
- Links to documentation and resources

## Testing and Quality Assurance

### Testing Framework and Strategy

The application uses **Jest** as the primary testing framework, chosen for its zero-configuration approach and educational value:

```javascript
// Jest configuration in package.json
{
  "jest": {
    "testEnvironment": "node",
    "collectCoverageFrom": [
      "*.js",
      "lib/**/*.js",
      "scripts/**/*.js",
      "!node_modules/**",
      "!coverage/**"
    ],
    "coverageThreshold": {
      "global": {
        "statements": 85,
        "branches": 80,
        "functions": 100,
        "lines": 85
      }
    }
  }
}
```

### Test Organization

#### Test Directory Structure
```
__tests__/
├── unit/                     # Unit tests for individual components
│   ├── server.test.js        # HTTP server functionality tests
│   ├── handlers.test.js      # Request handler tests
│   └── utils.test.js         # Utility function tests
├── integration/              # Integration tests for complete workflows
│   └── api.test.js           # End-to-end API testing
└── helpers/                  # Testing utilities and fixtures
    ├── test-server.js        # Test server utilities
    └── fixtures.js           # Test data and mocks
```

### Test Types and Coverage

#### Unit Tests
**Location:** `__tests__/unit/`
**Purpose:** Test individual components in isolation

```javascript
// Example unit test
describe('Hello Handler', () => {
  it('should return "Hello world" response', () => {
    const response = helloHandler();
    expect(response.body).toBe('Hello world');
    expect(response.statusCode).toBe(200);
  });
});
```

**Execution:** `npm run test:unit`

#### Integration Tests
**Location:** `__tests__/integration/`
**Purpose:** Test complete HTTP request-response cycles

```javascript
// Example integration test using supertest
const request = require('supertest');
const app = require('../../server');

describe('HTTP Server Integration', () => {
  it('should respond to GET /hello', async () => {
    const response = await request(app)
      .get('/hello')
      .expect(200)
      .expect('Content-Type', /text\/plain/);
    
    expect(response.text).toBe('Hello world');
  });
});
```

**Execution:** `npm run test:integration`

### Coverage Requirements and Reporting

#### Coverage Targets
- **Statement Coverage:** 85% minimum
- **Branch Coverage:** 80% minimum  
- **Function Coverage:** 100% (all functions must be tested)
- **Line Coverage:** 85% minimum

#### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/lcov-report/index.html
```

**Coverage Report Formats:**
- **HTML:** Visual coverage report in browser
- **LCOV:** Machine-readable format for CI/CD integration
- **JSON:** Structured coverage data for analysis
- **Text:** Console output summary

### Code Quality and Linting

#### ESLint Configuration

The application uses ESLint with educational-focused rules:

```javascript
// .eslintrc.js configuration
module.exports = {
  extends: ["eslint:recommended", "plugin:node/recommended"],
  env: {
    node: true,
    es2022: true,
    jest: true
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module"
  },
  rules: {
    "no-console": "off",  // Allow console for educational logging
    "node/no-unsupported-features/es-syntax": "off"
  }
};
```

#### Code Quality Checks

**Linting Rules Include:**
- JavaScript best practices and error prevention
- Node.js-specific patterns and conventions
- Code consistency and formatting standards
- Educational rule set optimized for learning

**Running Quality Checks:**
```bash
# Check code quality
npm run lint

# Fix automatic issues
npm run lint:fix

# Strict quality check (zero warnings)
npm run lint:check
```

### Testing Best Practices

#### Writing Effective Tests

1. **Test Naming Convention:**
   ```javascript
   describe('Component Name', () => {
     describe('specific functionality', () => {
       it('should behave in expected way under specific conditions', () => {
         // Test implementation
       });
     });
   });
   ```

2. **Test Structure (Arrange, Act, Assert):**
   ```javascript
   it('should return correct response for valid request', () => {
     // Arrange - Set up test conditions
     const request = { url: '/hello', method: 'GET' };
     
     // Act - Execute the functionality being tested
     const response = processRequest(request);
     
     // Assert - Verify expected outcomes
     expect(response.statusCode).toBe(200);
     expect(response.body).toBe('Hello world');
   });
   ```

3. **Test Data Management:**
   ```javascript
   // Use fixtures for consistent test data
   const testFixtures = {
     validRequest: { url: '/hello', method: 'GET' },
     invalidRequest: { url: '/invalid', method: 'GET' }
   };
   ```

#### HTTP Testing with SuperTest

```javascript
const request = require('supertest');
const app = require('../server');

describe('HTTP Endpoints', () => {
  it('should handle GET /hello requests', async () => {
    await request(app)
      .get('/hello')
      .expect(200)
      .expect('Content-Type', /text\/plain/)
      .expect('Hello world');
  });
  
  it('should return 404 for unknown endpoints', async () => {
    await request(app)
      .get('/unknown')
      .expect(404);
  });
});
```

## Debugging and Troubleshooting

### Development Debugging

#### Debug Logging
Enable detailed logging for development insights:

```bash
# Set debug log level in .env
LOG_LEVEL=debug

# Or set directly when starting
LOG_LEVEL=debug npm run dev
```

**Debug logging provides:**
- Detailed HTTP request/response information
- Internal processing steps and timing
- Educational context for learning
- Troubleshooting guidance

#### Error Messages
The application provides educational error messages with context:

```javascript
// Example error with educational context
Error: Port 3000 already in use (EADDRINUSE)
Educational Note: This error occurs when another process is using port 3000.
Troubleshooting Steps:
1. Change port: PORT=3001 npm run dev
2. Find process using port: lsof -i :3000
3. Stop conflicting process or choose different port
```

#### Request Logging
Development mode includes comprehensive HTTP request logging:

```
[DEBUG] GET /hello from 127.0.0.1
[DEBUG] Request headers: { host: 'localhost:3000', user-agent: 'curl/7.64.1' }
[DEBUG] Response 200 sent in 5ms
[INFO] Educational Note: Request-response cycle demonstrates HTTP protocol
```

### Common Issues and Solutions

#### Port Conflicts
**Problem:** `Error: Port 3000 already in use (EADDRINUSE)`

**Solutions:**
1. **Change port in environment:**
   ```bash
   PORT=3001 npm run dev
   ```

2. **Find and stop process using port:**
   ```bash
   # Find process using port 3000
   lsof -i :3000
   
   # Stop process by PID
   kill -9 <PID>
   
   # Or stop all processes using port
   lsof -ti :3000 | xargs kill -9
   ```

3. **Use different port in .env file:**
   ```bash
   # .env file
   PORT=3001
   ```

#### Permission Errors
**Problem:** `Permission denied errors during startup`

**Solutions:**
1. **Use non-privileged port (above 1024):**
   ```bash
   PORT=3001 npm run dev
   ```

2. **Check file permissions:**
   ```bash
   # Check current directory permissions
   ls -la
   
   # Fix permissions if needed
   chmod +rw .
   ```

3. **Avoid system ports below 1024**

#### Dependency Issues
**Problem:** `Module not found or dependency installation failures`

**Solutions:**
1. **Clear npm cache and reinstall:**
   ```bash
   npm cache clean --force
   rm -rf node_modules
   npm install
   ```

2. **Verify Node.js version compatibility:**
   ```bash
   node --version  # Should be 18.0.0+
   ```

3. **Check for conflicting global packages:**
   ```bash
   npm list -g --depth=0
   ```

#### Development Restart Issues
**Problem:** `Nodemon not restarting on file changes`

**Solutions:**
1. **Check nodemon watch patterns in nodemon.json:**
   ```json
   {
     "watch": ["lib/", "scripts/", "server.js", ".env"],
     "ignore": ["node_modules/", "coverage/"]
   }
   ```

2. **Manual restart with nodemon:**
   ```bash
   # Type 'rs' and press Enter in terminal where dev server is running
   rs
   ```

3. **Verify file permissions for watched directories:**
   ```bash
   ls -la lib/
   ```

4. **Restart development server:**
   ```bash
   # Stop current server (Ctrl+C) and restart
   npm run dev
   ```

### Debugging Techniques

#### Console Debugging
Use strategic console logging with educational context:

```javascript
// Educational debugging with context
console.log('🔍 Debug: Processing request for:', request.url);
console.log('📊 Request details:', {
  method: request.method,
  headers: request.headers,
  timestamp: new Date().toISOString()
});
```

#### HTTP Debugging
Test endpoints thoroughly during development:

```bash
# Basic request testing
curl http://localhost:3000/hello

# Verbose output with headers
curl -v http://localhost:3000/hello

# Test with different methods
curl -X POST http://localhost:3000/hello

# Test invalid endpoints
curl http://localhost:3000/invalid
```

#### Process Debugging
Monitor server startup and lifecycle:

```bash
# Monitor process startup
npm run dev 2>&1 | tee development.log

# Check process status
ps aux | grep node

# Monitor resource usage
top -p <PID>
```

### Performance Monitoring

#### Response Time Tracking
The development environment includes basic performance monitoring:

```javascript
// Example performance logging
const startTime = Date.now();
// Process request
const duration = Date.now() - startTime;
console.log(`Request processed in ${duration}ms`);
```

#### Memory Usage Monitoring
```javascript
// Monitor memory usage during development
const memoryUsage = process.memoryUsage();
console.log('Memory Usage:', {
  rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
  heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
  heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB'
});
```

## Code Organization

### Architectural Patterns

The application demonstrates professional Node.js code organization patterns:

#### Modular Design
- **Clear separation of concerns** with dedicated modules
- **Single responsibility principle** for each component
- **Loose coupling** between components for maintainability

#### Educational Structure
Code organization demonstrates Node.js best practices:
- **Logical grouping** by functionality
- **Consistent naming conventions** throughout
- **Scalable structure** that supports future expansion

### Directory Structure Details

#### `lib/server/`
**Purpose:** HTTP server creation, startup, and lifecycle management
```
lib/server/
├── http-server.js           # Core HTTP server functionality
├── server-config.js         # Server configuration management
└── lifecycle-manager.js     # Server lifecycle and graceful shutdown
```

#### `lib/handlers/`
**Purpose:** Request handlers for specific endpoints
```
lib/handlers/
├── hello-handler.js         # '/hello' endpoint handler
├── error-handler.js         # Error response handling
└── not-found-handler.js     # 404 handler for unknown routes
```

#### `lib/router/`
**Purpose:** Request routing logic and URL pattern matching
```
lib/router/
├── request-router.js        # Main routing logic
├── route-matcher.js         # URL pattern matching
└── route-registry.js        # Route registration and management
```

#### `lib/config/`
**Purpose:** Application and server configuration management
```
lib/config/
├── app-config.js            # Application-wide configuration
├── server-config.js         # HTTP server specific settings
└── environment-config.js    # Environment variable handling
```

#### `lib/utils/`
**Purpose:** Utility functions for logging, error handling, and validation
```
lib/utils/
├── logger.js                # Educational logging with context
├── error-handler.js         # Centralized error handling
├── validators.js            # Input validation utilities
└── formatters.js           # Response formatting utilities
```

### Naming Conventions

#### Files and Directories
- **Files:** kebab-case format (e.g., `hello-handler.js`, `request-router.js`)
- **Directories:** lowercase with descriptive names (e.g., `handlers/`, `config/`)
- **Test files:** `*.test.js` or `*.spec.js` suffix

#### Functions and Variables
- **Functions:** camelCase (e.g., `createHTTPServer`, `handleRequest`)
- **Variables:** camelCase (e.g., `serverInstance`, `requestHandler`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `DEFAULT_PORT`, `HTTP_STATUS_CODES`)

#### Classes and Constructors
- **Classes:** PascalCase (e.g., `EducationalError`, `ResponseGenerator`)
- **Constructor functions:** PascalCase following class conventions

### Code Documentation

#### Inline Comments
Comprehensive educational comments throughout the codebase:

```javascript
/**
 * Creates and configures HTTP server instance with educational features
 * 
 * Educational Note: This function demonstrates Node.js HTTP server creation
 * using the built-in http module, showcasing fundamental web server concepts
 * 
 * @param {object} config - Server configuration object
 * @returns {object} Configured HTTP server instance
 */
function createHTTPServer(config) {
  // Implementation with educational context
}
```

#### JSDoc Documentation
Function and class documentation following JSDoc standards for educational clarity and IDE integration.

## Configuration Management

### Environment Variables

The application uses environment variables for flexible configuration:

#### Development Configuration

```bash
# Application Environment
NODE_ENV=development                    # Controls application behavior
LOG_LEVEL=debug                        # Logging verbosity level
EDUCATIONAL_MODE=true                  # Enables educational features

# Server Configuration  
PORT=3000                              # HTTP server port
HOST=127.0.0.1                        # Server hostname/IP binding
SERVER_TIMEOUT=30000                   # General server timeout (ms)

# Development Features
NODEMON_RUNNING=true                   # Indicates nodemon environment
VERBOSE_LOGGING=true                   # Enhanced logging output
```

#### Configuration Files

#### `.env` File (Local Environment)
Create from `.env.example` template and customize for your environment:

```bash
# Copy template
cp .env.example .env

# Customize values
nano .env
```

#### `lib/config/app-config.js`
**Purpose:** Application-wide configuration with environment-specific overrides
- Centralizes configuration management
- Provides sensible defaults
- Validates configuration on startup

#### `lib/config/server-config.js`
**Purpose:** HTTP server configuration including defaults and validation
- Network binding configuration
- Timeout and connection management
- Performance tuning parameters

### Configuration Validation

#### Startup Validation
The server validates configuration on startup with educational error messages:

```javascript
// Example configuration validation
if (!config.server.port || config.server.port < 1 || config.server.port > 65535) {
  throw new Error(
    `Invalid port configuration: ${config.server.port}. ` +
    `Educational Note: HTTP ports must be between 1-65535, ` +
    `with ports above 1024 recommended for development.`
  );
}
```

#### Environment Checks
- **Node.js version compatibility** (minimum v18.0.0)
- **Port availability** and permissions
- **File system permissions** for logging and temporary files
- **Required environment variables** presence and validity

### Default Fallbacks

The application provides sensible defaults for all configuration values:

| Configuration | Default Value | Purpose |
|---------------|---------------|---------|
| PORT | 3000 | Standard development port |
| HOST | 127.0.0.1 | Localhost-only for security |
| LOG_LEVEL | info | Balanced logging verbosity |
| SERVER_TIMEOUT | 30000ms | Reasonable request timeout |
| NODE_ENV | development | Development mode activation |

## Best Practices

### Development Practices

#### Code Quality Standards
1. **Always run lint checks before committing:**
   ```bash
   npm run lint:check
   ```

2. **Write and run tests for new functionality:**
   ```bash
   npm run test:coverage
   ```

3. **Update documentation when adding features:**
   - Update README.md for user-facing changes
   - Update DEVELOPMENT.md for developer changes
   - Add inline comments for complex logic

4. **Use descriptive commit messages:**
   ```bash
   # Good commit messages
   git commit -m "feat: add request logging with educational context"
   git commit -m "fix: resolve port binding issue on Windows"
   git commit -m "docs: update debugging section with troubleshooting steps"
   ```

#### Version Control Best Practices
- **Commit frequently** with logical, small changes
- **Use descriptive branch names** (e.g., `feature/enhanced-logging`, `fix/port-binding`)
- **Include educational context** in commit messages when relevant
- **Keep commits atomic** - one feature/fix per commit

### Performance Considerations

#### Development Efficiency
1. **Use `npm run dev` for fastest development feedback:**
   - Automatic restart on file changes
   - Debug logging for immediate insight
   - Educational error messages

2. **Leverage test:watch for continuous testing:**
   ```bash
   npm run test:watch
   ```

3. **Utilize debug logging for troubleshooting:**
   ```bash
   LOG_LEVEL=debug npm run dev
   ```

#### Resource Optimization
- **Monitor memory usage** during development sessions
- **Use appropriate timeout values** for development vs. production
- **Clean up resources** regularly with `npm run clean`

### Security Practices

#### Development Security
1. **Keep HOST=127.0.0.1** for educational security:
   - Prevents external network access
   - Maintains localhost-only binding
   - Demonstrates security-conscious development

2. **Never commit `.env` files:**
   ```bash
   # .gitignore should include:
   .env
   .env.local
   .env.*.local
   ```

3. **Use .env.example for templates:**
   - Document all environment variables
   - Provide safe example values
   - Include educational context

#### Dependency Management
- **Regularly update dependencies:** `npm audit fix`
- **Review security advisories:** `npm audit`
- **Use exact versions for critical dependencies**

### Educational Guidelines

#### Learning Progression
1. **Start with basic server functionality:**
   - Understand HTTP server creation
   - Learn request-response patterns
   - Practice basic debugging

2. **Progress to advanced concepts:**
   - Explore error handling patterns
   - Study configuration management
   - Learn testing methodologies

3. **Build practical skills:**
   - Practice troubleshooting techniques
   - Develop debugging proficiency
   - Understand performance monitoring

#### Experimentation
- **Use development mode safely** for code experimentation
- **Test different configurations** with environment variables
- **Explore logging levels** to understand application behavior
- **Practice debugging techniques** with intentional errors

#### Understanding
- **Read and understand configuration files** to learn Node.js patterns
- **Study error messages carefully** for learning opportunities
- **Examine code comments** for educational insights
- **Practice systematic troubleshooting** for skill development

## Next Steps

### Extending Functionality

#### Additional HTTP Endpoints
1. **Add new routes beyond /hello:**
   ```javascript
   // Example: Add /health endpoint
   if (request.url === '/health') {
     return handleHealthCheck(request, response);
   }
   ```

2. **Implement additional HTTP methods:**
   ```javascript
   // Support POST, PUT, DELETE methods
   if (request.method === 'POST') {
     return handlePostRequest(request, response);
   }
   ```

3. **Add request parameter parsing:**
   ```javascript
   // Parse URL parameters and query strings
   const urlParts = parseURL(request.url);
   const params = parseQueryParameters(urlParts.query);
   ```

#### Advanced Features
- **Middleware implementation** for request/response processing
- **Static file serving** capabilities
- **Request body parsing** for POST/PUT requests
- **Session management** and cookie handling

### Production Considerations

#### HTTPS Support
```javascript
// Add HTTPS server creation
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('private-key.pem'),
  cert: fs.readFileSync('certificate.pem')
};

https.createServer(options, app).listen(443);
```

#### Comprehensive Logging
- **Structured logging** with log levels and timestamps
- **Log rotation** to manage disk space
- **Centralized logging** for monitoring and analysis

#### Production Deployment
- **Process management** with PM2 or similar
- **Environment-specific configurations**
- **Health check endpoints** for load balancers
- **Graceful shutdown** handling for production

### Learning Progression

#### Framework Integration
1. **Express.js Framework:**
   ```bash
   npm install express
   ```
   - Learn middleware concepts
   - Understand routing patterns
   - Practice with popular Node.js framework

2. **Database Integration:**
   ```javascript
   // Example with MongoDB
   const MongoClient = require('mongodb').MongoClient;
   
   // Or with PostgreSQL
   const { Client } = require('pg');
   ```

3. **Template Engines:**
   ```javascript
   // EJS templates
   app.set('view engine', 'ejs');
   
   // Or Handlebars
   app.engine('handlebars', exphbs());
   ```

#### Advanced Topics
- **RESTful API design** patterns and best practices
- **Authentication and authorization** implementation
- **API documentation** with tools like Swagger
- **Testing strategies** for complex applications
- **Performance optimization** and scaling techniques

### Community and Resources

#### Learning Resources
- **Official Node.js Documentation:** [nodejs.org/docs](https://nodejs.org/docs)
- **MDN Web Docs:** [developer.mozilla.org](https://developer.mozilla.org)
- **Node.js Best Practices:** [github.com/goldbergyoni/nodebestpractices](https://github.com/goldbergyoni/nodebestpractices)

#### Development Tools
- **Node.js REPL:** Interactive development environment
- **Chrome DevTools:** For debugging and performance analysis
- **VS Code Extensions:** Enhanced development experience
- **Postman/Insomnia:** API testing and development

#### Community Support
- **Stack Overflow:** Programming questions and solutions
- **Reddit r/node:** Node.js community discussions
- **Discord/Slack:** Real-time developer communication
- **GitHub Issues:** Open source project support

---

## Conclusion

This development guide provides comprehensive coverage of the Node.js tutorial HTTP server application development workflow. The educational focus ensures that developers not only learn to use the tools effectively but also understand the underlying concepts and best practices that make Node.js development productive and professional.

Continue exploring, experimenting, and building upon these foundations to develop expertise in Node.js web development. The combination of hands-on practice, systematic understanding, and professional development practices will provide a solid foundation for advanced Node.js development projects.

Happy coding and continuous learning! 🎓🚀