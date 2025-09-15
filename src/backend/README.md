# Node.js Tutorial Application

A comprehensive educational Node.js HTTP server demonstration implementing a single `/hello` endpoint that returns "Hello world" to HTTP clients. This tutorial application demonstrates fundamental web server capabilities through practical implementation using Node.js built-in HTTP module.

## Table of Contents

- [Project Overview](#project-overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Development](#development)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Educational Objectives](#educational-objectives)

## Project Overview

This Node.js tutorial application serves as a practical introduction to server-side JavaScript development, demonstrating core HTTP server concepts through a minimal yet complete implementation. The application leverages Node.js® - a free, open-source, cross-platform JavaScript runtime environment - to create a basic web service with a single endpoint `/hello` that returns "Hello world" to HTTP clients.

### Key Features

- **HTTP Server Creation**: Demonstrates fundamental HTTP server initialization using Node.js built-in `http` module
- **RESTful Endpoint Implementation**: Single `/hello` endpoint with proper HTTP status codes and headers
- **Event-Driven Architecture**: Showcases Node.js's non-blocking, event-driven programming model
- **Request-Response Handling**: Complete HTTP request processing and response generation cycle
- **Modern JavaScript Practices**: ES2022+ features with Node.js runtime compatibility

### Educational Value

The tutorial addresses the educational need for a practical, hands-on introduction to Node.js web development, providing developers with foundational understanding of:

- HTTP server creation using Node.js built-in modules
- Request-response cycle implementation
- Event-driven programming principles
- Basic server deployment and testing procedures
- Node.js development workflow and best practices

### Technology Stack

- **Runtime**: Node.js 18+ (LTS recommended, Current 24.8.0 supported)
- **Core Module**: Built-in `http` module (no external dependencies)
- **JavaScript**: ES2022+ features
- **Development Environment**: Cross-platform (Windows, macOS, Linux)

## Prerequisites

Before running this tutorial application, ensure your development environment meets the following requirements:

### Node.js Version Requirements

| Node.js Version | Status | Support Period | Recommendation |
|----------------|--------|----------------|----------------|
| 24.x | Current | Until April 2025 | Development/Testing |
| 22.x | Active LTS | 2024-10-29 to 2027-04-30 | **Production Use** |
| 20.x | Maintenance LTS | Until April 2026 | Legacy Support |
| 18.x | Maintenance LTS | Until April 2025 | **Minimum Required** |

### System Requirements

- **Operating System**: Windows 8.1+, macOS, or Linux
- **Memory**: 512MB RAM minimum
- **Storage**: 100MB available space for Node.js installation and application files
- **Network**: Localhost interface access (127.0.0.1)

### Development Tools

- **Code Editor**: Any text editor (VS Code, Sublime Text, Atom, etc.)
- **Terminal/CLI**: System default terminal or command prompt
- **Package Manager**: npm (included with Node.js installation)

### Verification

Verify your Node.js installation:

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Verify Node.js installation path
which node    # macOS/Linux
where node    # Windows
```

## Installation

### 1. Repository Setup

```bash
# Clone the repository (if using version control)
git clone <repository-url>
cd node-tutorial-app

# Or create a new directory for the project
mkdir node-tutorial-app
cd node-tutorial-app
```

### 2. Project Initialization

```bash
# Initialize npm package (if package.json doesn't exist)
npm init -y

# Install development dependencies (optional)
npm install --save-dev nodemon

# No production dependencies required - uses Node.js built-in modules only
```

### 3. Environment Configuration

Create a `.env` file based on the provided template (optional):

```bash
# Copy environment template
cp .env.example .env

# Edit configuration if needed
# Default configuration works for tutorial purposes
```

Example `.env` configuration:
```env
# Server Configuration
PORT=3000
HOST=127.0.0.1
NODE_ENV=development

# Logging Configuration
LOG_LEVEL=info
```

### 4. Verify Installation

```bash
# Verify all files are in place
ls -la

# Check if main server file exists
ls server.js

# Validate Node.js can parse the application
node -c server.js
```

## Usage

### Starting the Server

#### Standard Startup

```bash
# Start the server using Node.js directly
node server.js

# Expected output:
# Server running on http://localhost:3000
# Press Ctrl+C to stop the server
```

#### Development Mode (with auto-restart)

```bash
# Start with nodemon for automatic restarts during development
npm run dev

# Or directly with nodemon
npx nodemon server.js

# Expected output:
# [nodemon] starting `node server.js`
# Server running on http://localhost:3000
# [nodemon] watching for changes...
```

#### Using npm Scripts

Configure `package.json` scripts section:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "node --test",
    "lint": "eslint *.js"
  }
}
```

Then use:
```bash
# Production start
npm start

# Development start with auto-reload
npm run dev
```

### Testing the Server

#### Browser Testing

1. Open your web browser
2. Navigate to: `http://localhost:3000/hello`
3. Expected response: "Hello world" displayed as plain text
4. Status: `200 OK`

#### Command Line Testing

```bash
# Test the hello endpoint
curl http://localhost:3000/hello

# Expected output:
# Hello world

# Test with verbose output to see headers
curl -v http://localhost:3000/hello

# Test invalid endpoint
curl http://localhost:3000/invalid

# Expected: 404 Not Found response
```

#### Advanced Testing

```bash
# Test with specific HTTP method
curl -X GET http://localhost:3000/hello

# Test response headers
curl -I http://localhost:3000/hello

# Test with timing information
curl -w "@curl-format.txt" -s http://localhost:3000/hello
```

### Stopping the Server

```bash
# In the terminal where server is running:
# Press Ctrl+C (Windows/Linux) or Cmd+C (macOS)

# Or send termination signal
kill -TERM <process_id>

# Find and kill process by port
lsof -ti:3000 | xargs kill
```

## API Documentation

### Endpoint Overview

The tutorial application implements a single HTTP endpoint demonstrating basic REST API principles.

| Endpoint | Method | Description | Response Type |
|----------|--------|-------------|---------------|
| `/hello` | GET | Returns greeting message | `text/plain` |

### GET /hello

Returns a simple "Hello world" greeting message.

#### Request Specification

```http
GET /hello HTTP/1.1
Host: localhost:3000
Accept: text/plain
```

**Parameters**: None required

**Headers**: 
- `Accept`: `text/plain` (optional)
- `User-Agent`: Any HTTP client identifier (optional)

#### Response Specification

**Success Response (200 OK)**

```http
HTTP/1.1 200 OK
Content-Type: text/plain
Content-Length: 11
Date: Mon, 01 Jan 2024 12:00:00 GMT

Hello world
```

**Response Headers**:
- `Content-Type`: `text/plain; charset=utf-8`
- `Content-Length`: Calculated automatically
- `Date`: Current server timestamp

#### Error Responses

**404 Not Found (Invalid Path)**

```http
HTTP/1.1 404 Not Found
Content-Type: text/plain
Content-Length: 9

Not Found
```

**405 Method Not Allowed (Invalid HTTP Method)**

```http
HTTP/1.1 405 Method Not Allowed
Content-Type: text/plain
Allow: GET

Method Not Allowed
```

#### Response Examples

```bash
# Successful request
$ curl http://localhost:3000/hello
Hello world

# Invalid path
$ curl http://localhost:3000/invalid
Not Found

# Invalid method
$ curl -X POST http://localhost:3000/hello
Method Not Allowed
```

#### Performance Characteristics

| Metric | Target | Typical Range |
|--------|--------|---------------|
| Response Time | < 100ms | 5-50ms |
| Throughput | 1000+ req/sec | Varies by system |
| Memory Usage | < 50MB | 20-40MB |
| CPU Usage | Minimal | < 5% single core |

## Project Structure

```
node-tutorial-app/
├── server.js                 # Main application entry point
├── package.json              # Node.js package configuration
├── .env.example              # Environment configuration template
├── .env                      # Local environment variables (git-ignored)
├── .gitignore               # Git ignore patterns
├── README.md                # This documentation file
├── lib/                     # Application modules and components
│   ├── server/
│   │   └── http-server.js   # HTTP server implementation
│   └── handlers/
│       └── hello-handler.js # Hello endpoint handler
├── __tests__/               # Test files (optional)
│   ├── server.test.js       # Server integration tests
│   └── handlers.test.js     # Handler unit tests
├── docs/                    # Additional documentation
│   ├── API.md              # Detailed API documentation
│   └── DEPLOYMENT.md       # Deployment instructions
└── examples/                # Usage examples
    ├── client-examples.js   # HTTP client examples
    └── curl-commands.sh     # Command line test examples
```

### Key Files Description

#### `server.js`
Main entry point containing the HTTP server initialization, request handling logic, and server lifecycle management. Demonstrates core Node.js HTTP server patterns.

#### `package.json`
Node.js package configuration file defining project metadata, dependencies, and npm scripts for development workflow.

#### `lib/server/http-server.js`
Modular HTTP server implementation separating server creation logic from the main application file, demonstrating code organization best practices.

#### `lib/handlers/hello-handler.js`
Request handler module for the `/hello` endpoint, showcasing separation of concerns and modular request processing.

### Architecture Pattern

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   HTTP Client   │───▶│  Node.js Server  │───▶│ Request Handler │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌──────────────────┐
│ Response Client │◀───│ Response Handler │
└─────────────────┘    └──────────────────┘
```

The application follows a simple request-response architecture pattern suitable for educational purposes while demonstrating professional code organization principles.

## Development

### Development Workflow

The tutorial application supports a streamlined development workflow optimized for learning and experimentation.

#### Setting Up Development Environment

```bash
# Start development server with auto-reload
npm run dev

# In a separate terminal, monitor logs
tail -f server.log

# Run tests in watch mode
npm test -- --watch
```

#### Code Structure and Patterns

The application demonstrates several key Node.js development patterns:

**Event-Driven Programming**
```javascript
// Server creation with event handling
const server = http.createServer((req, res) => {
  // Event-driven request processing
  console.log(`Request received: ${req.method} ${req.url}`);
  
  // Asynchronous response handling
  res.end('Hello world');
});

// Server lifecycle events
server.on('listening', () => {
  console.log('Server is listening on port 3000');
});

server.on('error', (err) => {
  console.error('Server error:', err.message);
});
```

**Request-Response Cycle**
```javascript
// Demonstrates complete HTTP request-response handling
function handleRequest(req, res) {
  // Request parsing and validation
  const { method, url } = req;
  
  // Route matching logic
  if (url === '/hello' && method === 'GET') {
    // Success response generation
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello world');
  } else {
    // Error response handling
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
}
```

#### Development Best Practices

1. **Code Organization**: Separate concerns using modules
2. **Error Handling**: Implement comprehensive error handling
3. **Logging**: Use console logging for development insight
4. **Testing**: Write basic tests for core functionality
5. **Documentation**: Comment code for educational clarity

#### Hot Reloading Setup

```bash
# Install nodemon for development
npm install --save-dev nodemon

# Configure nodemon with custom settings
echo '{
  "watch": ["*.js", "lib/**/*.js"],
  "ext": "js,json",
  "ignore": ["__tests__/**", "node_modules/**"],
  "delay": 1000
}' > nodemon.json

# Start development server
npm run dev
```

#### Debugging

```bash
# Start server in debug mode
node --inspect server.js

# Start with debugger attached
node --inspect-brk server.js

# Debug with VS Code or Chrome DevTools
# Navigate to: chrome://inspect
```

### Code Style and Standards

#### JavaScript Standards

- Use ES2022+ features where appropriate
- Implement proper error handling with try-catch blocks
- Follow consistent naming conventions (camelCase)
- Use meaningful variable and function names
- Include comprehensive comments for educational value

#### Example Code Style

```javascript
/**
 * HTTP Server Implementation for Node.js Tutorial
 * Demonstrates fundamental server creation and request handling
 */
const http = require('node:http');

// Server configuration constants
const SERVER_CONFIG = {
  port: process.env.PORT || 3000,
  hostname: process.env.HOST || '127.0.0.1'
};

/**
 * Main request handler demonstrating HTTP request-response cycle
 * @param {http.IncomingMessage} req - HTTP request object
 * @param {http.ServerResponse} res - HTTP response object
 */
function requestHandler(req, res) {
  // Implementation details...
}

// Server creation and lifecycle management
const server = http.createServer(requestHandler);
```

## Testing

### Testing Strategy

The tutorial application includes basic testing to demonstrate Node.js testing concepts without overwhelming complexity.

#### Test Framework Setup

```bash
# Install Jest for testing
npm install --save-dev jest supertest

# Configure test scripts in package.json
npm install --save-dev nodemon jest-html-reporter
```

#### Unit Testing

**Testing Server Functions**

```javascript
// __tests__/server.test.js
const request = require('supertest');
const app = require('../server');

describe('HTTP Server', () => {
  describe('GET /hello', () => {
    it('should return "Hello world" with status 200', async () => {
      const response = await request(app)
        .get('/hello')
        .expect(200)
        .expect('Content-Type', /text\/plain/);
      
      expect(response.text).toBe('Hello world');
    });
    
    it('should return correct Content-Type header', async () => {
      const response = await request(app)
        .get('/hello')
        .expect(200);
      
      expect(response.headers['content-type']).toMatch(/text\/plain/);
    });
  });
  
  describe('Invalid routes', () => {
    it('should return 404 for unknown paths', async () => {
      await request(app)
        .get('/invalid')
        .expect(404);
    });
    
    it('should handle unsupported HTTP methods', async () => {
      await request(app)
        .post('/hello')
        .expect(405);
    });
  });
});
```

#### Integration Testing

**Testing HTTP Endpoints**

```javascript
// __tests__/integration.test.js
const http = require('http');
const server = require('../server');

describe('Server Integration Tests', () => {
  let testServer;
  
  beforeAll(() => {
    testServer = server.listen(0); // Use ephemeral port
  });
  
  afterAll(() => {
    testServer.close();
  });
  
  it('should start server and accept connections', (done) => {
    const port = testServer.address().port;
    const options = {
      hostname: '127.0.0.1',
      port: port,
      path: '/hello',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      expect(res.statusCode).toBe(200);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        expect(data).toBe('Hello world');
        done();
      });
    });
    
    req.end();
  });
});
```

#### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- server.test.js

# Verbose test output
npm test -- --verbose
```

#### Test Coverage

```bash
# Generate coverage report
npm run test:coverage

# View coverage report in browser
open coverage/lcov-report/index.html

# Coverage targets for educational purposes:
# - Statement Coverage: 85%+
# - Branch Coverage: 80%+
# - Function Coverage: 100%
# - Line Coverage: 85%+
```

#### Manual Testing Procedures

```bash
# Test server startup
node server.js
# Verify: "Server running on http://localhost:3000" message

# Test endpoint functionality
curl http://localhost:3000/hello
# Expected: "Hello world" response

# Test error handling
curl http://localhost:3000/invalid
# Expected: 404 Not Found response

# Test response headers
curl -I http://localhost:3000/hello
# Verify: Content-Type and status headers

# Test server shutdown
# Press Ctrl+C and verify graceful shutdown
```

## Troubleshooting

### Common Issues and Solutions

#### Port Already in Use (EADDRINUSE)

**Symptoms**: Server fails to start with "Error: listen EADDRINUSE :::3000"

**Solutions**:
```bash
# Find process using port 3000
lsof -i :3000        # macOS/Linux
netstat -ano | findstr :3000   # Windows

# Kill process using port
kill -9 <PID>        # macOS/Linux
taskkill /PID <PID> /F   # Windows

# Use different port
PORT=3001 node server.js

# Or modify server.js to use environment variable
const port = process.env.PORT || 3000;
```

#### Server Startup Failures

**Symptoms**: Process exits immediately without error message

**Diagnostic Steps**:
```bash
# Check syntax errors
node -c server.js

# Run with detailed error output
node --trace-warnings server.js

# Check Node.js version compatibility
node --version

# Verify file permissions
ls -la server.js
```

#### Network Connectivity Issues

**Symptoms**: Cannot access server from browser or curl

**Solutions**:
```bash
# Verify server is running
ps aux | grep node

# Check if port is listening
netstat -tlnp | grep :3000   # Linux
netstat -an | findstr :3000  # Windows

# Test localhost connectivity
ping 127.0.0.1

# Verify firewall settings
sudo ufw status    # Linux
# Check Windows Firewall settings on Windows
```

#### Node.js Version Compatibility Problems

**Symptoms**: Syntax errors or unexpected behavior

**Solutions**:
```bash
# Check current Node.js version
node --version

# Update Node.js to LTS version
# Visit: https://nodejs.org/en/download/

# Use nvm for version management
nvm install --lts
nvm use --lts

# Verify compatibility
node -e "console.log(process.version)"
```

### Performance Issues

#### High Memory Usage

**Diagnostic Commands**:
```bash
# Monitor memory usage
node --max-old-space-size=100 server.js

# Profile memory usage
node --inspect server.js
# Open Chrome DevTools for profiling

# Check for memory leaks
node --trace-gc server.js
```

#### Slow Response Times

**Performance Testing**:
```bash
# Benchmark with ApacheBench
ab -n 1000 -c 10 http://localhost:3000/hello

# Monitor with curl timing
curl -w "@curl-format.txt" http://localhost:3000/hello

# Profile with Node.js built-in profiler
node --prof server.js
```

### Error Handling and Debugging

#### Server Error Debugging

```javascript
// Enhanced error handling for debugging
const server = http.createServer((req, res) => {
  try {
    // Request handling logic
    handleRequest(req, res);
  } catch (error) {
    console.error('Request handling error:', error);
    
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  }
});

// Server error handling
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Try a different port.`);
  } else if (error.code === 'EACCES') {
    console.error(`Permission denied. Try using a port number above 1024.`);
  } else {
    console.error('Server error:', error.message);
  }
  process.exit(1);
});
```

#### Logging for Troubleshooting

```javascript
// Development logging configuration
const logRequest = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url} - ${req.headers['user-agent']}`);
  
  const originalEnd = res.end;
  res.end = function(...args) {
    console.log(`[${timestamp}] Response: ${res.statusCode}`);
    originalEnd.apply(res, args);
  };
};
```

### Getting Help

#### Documentation Resources

- **Node.js Official Documentation**: https://nodejs.org/docs/
- **HTTP Module Documentation**: https://nodejs.org/api/http.html
- **NPM Documentation**: https://docs.npmjs.com/

#### Community Support

- **Stack Overflow**: Tag questions with `node.js` and `http-server`
- **Node.js GitHub Issues**: https://github.com/nodejs/node/issues
- **Reddit**: r/node and r/javascript communities

#### Educational Resources

- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices
- **MDN HTTP Guide**: https://developer.mozilla.org/en-US/docs/Web/HTTP
- **JavaScript.info Node.js**: https://javascript.info/

## Educational Objectives

### Core Learning Outcomes

By completing this Node.js tutorial application, developers will gain practical understanding of:

#### 1. Node.js Runtime Environment
- **Server-Side JavaScript Execution**: Understanding how Node.js enables JavaScript to run outside the browser environment
- **Built-in Module System**: Practical experience with Node.js core modules, specifically the `http` module
- **Event Loop Architecture**: Hands-on demonstration of Node.js's non-blocking, event-driven programming model
- **Cross-Platform Development**: Experience with Node.js applications running on Windows, macOS, and Linux

#### 2. HTTP Protocol Understanding
- **Request-Response Cycle**: Complete understanding of HTTP communication patterns
- **HTTP Methods**: Practical implementation of GET requests and proper method validation
- **Status Codes**: Correct usage of HTTP status codes (200, 404, 405, 500)
- **Headers Management**: Setting and manipulating HTTP headers for proper client communication

#### 3. Web Server Fundamentals
- **Server Initialization**: Creating and configuring HTTP servers using Node.js built-in capabilities
- **Port Binding**: Understanding network interface binding and port management
- **Request Routing**: Basic URL path matching and request direction
- **Response Generation**: Creating appropriate HTTP responses with proper formatting

#### 4. Event-Driven Programming Concepts
- **Asynchronous Programming**: Non-blocking I/O operations and callback functions
- **Event Handling**: Server lifecycle events and request processing events
- **Error Handling**: Proper error management in asynchronous environments
- **Resource Management**: Memory cleanup and garbage collection awareness

### Demonstrated Concepts

#### JavaScript and Node.js Features
```javascript
// ES2022+ Features Demonstrated
const { createServer } = require('node:http');  // Destructuring
const server = createServer((req, res) => {     // Arrow functions
  const { method, url } = req;                  // Object destructuring
  
  // Template literals
  console.log(`${method} request to ${url}`);
  
  // Modern error handling
  try {
    handleRequest(req, res);
  } catch (error) {
    console.error('Error:', error.message);
  }
});
```

#### HTTP Server Architecture
- **Single-threaded Event Loop**: Demonstrating Node.js's concurrency model
- **Stream-based Processing**: HTTP request and response stream handling
- **Middleware Concepts**: Basic request preprocessing and response postprocessing
- **RESTful Principles**: Simple REST API endpoint implementation

#### Development Workflow
- **Project Structure**: Organizing Node.js applications with clear separation of concerns
- **Environment Configuration**: Using environment variables and configuration files
- **Testing Strategies**: Basic unit and integration testing approaches
- **Debugging Techniques**: Using Node.js debugging tools and console logging

### Skill Development Areas

#### Technical Skills
| Skill Area | Proficiency Level | Application |
|------------|-------------------|-------------|
| Node.js HTTP Module | Beginner to Intermediate | Server creation and request handling |
| JavaScript ES2022+ | Intermediate | Modern syntax and language features |
| HTTP Protocol | Beginner to Intermediate | Request-response cycle implementation |
| Debugging | Beginner | Basic troubleshooting and error resolution |

#### Professional Skills
- **Code Organization**: Modular programming and separation of concerns
- **Documentation**: Technical writing and code commenting
- **Testing Mindset**: Basic test-driven development concepts
- **Problem Solving**: Debugging and troubleshooting systematic approaches

### Next Steps and Extensions

#### Immediate Extensions
1. **Multiple Endpoints**: Add additional routes like `/goodbye` or `/status`
2. **Query Parameters**: Handle URL query parameters and request parsing
3. **Request Logging**: Implement comprehensive request/response logging
4. **Configuration Management**: Expand environment variable usage

#### Intermediate Projects
1. **Express.js Migration**: Convert the application to use the Express.js framework
2. **Database Integration**: Add file-based or database storage
3. **Authentication**: Implement basic authentication mechanisms
4. **Static File Serving**: Add capability to serve HTML, CSS, and JavaScript files

#### Advanced Concepts
1. **Microservices Architecture**: Break application into multiple services
2. **API Documentation**: Generate comprehensive API documentation
3. **Performance Optimization**: Implement caching and performance monitoring
4. **Production Deployment**: Configure for cloud deployment and scaling

### Learning Assessment

#### Self-Assessment Questions
1. Can you explain the difference between blocking and non-blocking I/O?
2. How does Node.js handle multiple concurrent requests with a single thread?
3. What are the key components of an HTTP request and response?
4. How would you add error handling for different types of server errors?

#### Practical Exercises
1. **Extend the API**: Add a `/time` endpoint that returns the current timestamp
2. **Error Handling**: Implement custom error pages for different HTTP status codes
3. **Request Validation**: Add validation for request headers and methods
4. **Performance Testing**: Use load testing tools to understand server limits

#### Project Variations
1. **RESTful Calculator**: Create endpoints for basic mathematical operations
2. **File Server**: Serve static files from a directory
3. **Proxy Server**: Forward requests to external APIs
4. **WebSocket Server**: Upgrade to support real-time communication

### Resources for Further Learning

#### Official Documentation
- **Node.js Documentation**: https://nodejs.org/docs/latest/api/
- **HTTP Module Reference**: https://nodejs.org/api/http.html
- **Stream API**: https://nodejs.org/api/stream.html

#### Educational Materials
- **Node.js Best Practices**: Industry-standard development patterns
- **HTTP Protocol Specification**: RFC 9110 for comprehensive HTTP understanding
- **JavaScript MDN Reference**: Modern JavaScript language features

#### Community Resources
- **npm Registry**: Explore packages for extended functionality
- **GitHub Projects**: Study open-source Node.js applications
- **Stack Overflow**: Community-driven problem solving and learning

This comprehensive tutorial provides a solid foundation for Node.js web development while maintaining focus on educational clarity and practical application. The progression from basic concepts to advanced topics ensures learners can build upon their knowledge systematically.

---

## License

This tutorial application is provided for educational purposes. Feel free to use, modify, and extend the code for learning and development.

## Contributing

This is an educational project. Contributions that enhance learning value or fix educational content are welcome through pull requests.