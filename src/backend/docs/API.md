# Node.js Tutorial HTTP Server API Documentation

## Overview

The **Node.js Tutorial HTTP Server API** is a simple educational HTTP API that demonstrates fundamental Node.js server concepts through a minimalist design. This API serves as a practical introduction to HTTP server development using Node.js built-in modules, focusing on core web server functionality without the complexity of external frameworks.

**API Purpose**: Educational demonstration of HTTP request-response patterns, basic routing concepts, and proper error handling in Node.js applications.

**Educational Objectives**:
- Understand Node.js HTTP server creation using built-in modules
- Learn fundamental request-response patterns in web development
- Practice basic routing concepts and URL path handling
- Master proper error handling and HTTP status code usage
- Develop troubleshooting and debugging skills for web servers

## Base URL

```
http://127.0.0.1:3000
```

**Alternative Base URL** (localhost alias):
```
http://localhost:3000
```

**Important Security Note**: This tutorial server binds exclusively to localhost (127.0.0.1) for educational security. The server is not accessible from external networks, ensuring safe learning environment.

## API Version

**Current Version**: 1.0.0

## Authentication

**No authentication required** - This tutorial application operates without authentication mechanisms to maintain educational simplicity and focus on core HTTP server concepts.

## Supported Content Types

The API supports the following content types:

- `text/plain; charset=utf-8` - Primary content type for tutorial responses
- `application/json; charset=utf-8` - For error responses and structured data

## Supported HTTP Methods

- **GET** - Primary method supported by all endpoints
- **POST, PUT, DELETE, PATCH** - Not supported (will return 405 Method Not Allowed)

---

## Endpoints

### GET /hello

Returns a simple "Hello world" message demonstrating basic HTTP response functionality.

**Endpoint Details:**
- **URL**: `/hello`
- **Method**: `GET`
- **Description**: Standard successful HTTP response endpoint for educational demonstration
- **Content-Type**: `text/plain; charset=utf-8`

#### Request Parameters

**Query Parameters**: None required
**Path Parameters**: None required
**Request Body**: Not applicable for GET requests

#### Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `User-Agent` | No | Client identification (automatically sent by browsers) |
| `Accept` | No | Content type preference (defaults to `*/*`) |
| `Connection` | No | Connection management (handled automatically) |

#### Response Format

**Success Response (HTTP 200)**:

```http
HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8
Content-Length: 11
Connection: keep-alive

Hello world
```

#### Response Headers

| Header | Value | Description |
|--------|-------|-------------|
| `Content-Type` | `text/plain; charset=utf-8` | Response content type and character encoding |
| `Content-Length` | `11` | Size of response body in bytes |
| `Connection` | `keep-alive` | Connection management directive |

#### Example Requests

**Using curl:**
```bash
# Basic GET request
curl http://localhost:3000/hello

# Verbose output showing headers
curl -v http://localhost:3000/hello

# Using explicit GET method
curl -X GET http://localhost:3000/hello

# Using IP address instead of localhost
curl http://127.0.0.1:3000/hello
```

**Using Browser:**
Simply navigate to: `http://localhost:3000/hello`

**Using JavaScript (Fetch API):**
```javascript
fetch('http://localhost:3000/hello')
  .then(response => response.text())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

**Using Node.js (http module):**
```javascript
const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 3000,
  path: '/hello',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
```

---

## Error Responses

The API returns structured error responses with educational context to help with troubleshooting and learning.

### HTTP Status Codes

| Status Code | Status Message | Description | Usage in Tutorial |
|-------------|----------------|-------------|-------------------|
| **200** | OK | Standard successful HTTP response | Success response for GET /hello |
| **404** | Not Found | Requested resource not found | Invalid endpoint paths |
| **405** | Method Not Allowed | HTTP method not supported | Non-GET requests to /hello |
| **500** | Internal Server Error | Unexpected server error | Unhandled server exceptions |

### Error Response Format

All error responses follow a consistent structure:

```http
HTTP/1.1 [STATUS_CODE] [STATUS_MESSAGE]
Content-Type: text/plain; charset=utf-8
Content-Length: [LENGTH]
Connection: keep-alive

[ERROR_MESSAGE_WITH_EDUCATIONAL_CONTEXT]
```

### 404 Not Found

**Triggered when**: Requesting any endpoint other than `/hello`

**Example Request:**
```bash
curl http://localhost:3000/invalid-path
```

**Response:**
```http
HTTP/1.1 404 Not Found
Content-Type: text/plain; charset=utf-8
Content-Length: 118

404 Not Found: The requested resource could not be found. Try visiting http://localhost:3000/hello for the tutorial endpoint.
```

### 405 Method Not Allowed

**Triggered when**: Using HTTP methods other than GET on the `/hello` endpoint

**Example Request:**
```bash
curl -X POST http://localhost:3000/hello
```

**Response:**
```http
HTTP/1.1 405 Method Not Allowed
Content-Type: text/plain; charset=utf-8
Content-Length: 123

405 Method Not Allowed: This endpoint only supports GET requests. Please use GET method to access the tutorial endpoint.
```

### 500 Internal Server Error

**Triggered when**: Unexpected server errors occur

**Example Response:**
```http
HTTP/1.1 500 Internal Server Error
Content-Type: text/plain; charset=utf-8
Content-Length: 145

500 Internal Server Error: An unexpected error occurred while processing your request. Please check the server logs for debugging information.
```

---

## Usage Examples

### Testing with curl

**Basic Request:**
```bash
curl http://localhost:3000/hello
# Expected output: Hello world
```

**Verbose Request (shows headers):**
```bash
curl -v http://localhost:3000/hello
```

**Testing Error Conditions:**
```bash
# Test 404 Not Found
curl http://localhost:3000/nonexistent

# Test 405 Method Not Allowed
curl -X POST http://localhost:3000/hello

# Test with different HTTP methods
curl -X PUT http://localhost:3000/hello
curl -X DELETE http://localhost:3000/hello
```

### Testing with Browser

1. **Success Test**: Open `http://localhost:3000/hello` in your browser
   - **Expected Result**: Page displays "Hello world"

2. **Error Test**: Open `http://localhost:3000/invalid` in your browser
   - **Expected Result**: Page displays 404 error message with educational guidance

### Testing with HTTP Clients

**Using HTTPie:**
```bash
# Basic request
http GET localhost:3000/hello

# Verbose output
http --verbose GET localhost:3000/hello
```

**Using Postman:**
1. Create new GET request
2. Set URL to `http://localhost:3000/hello`
3. Send request
4. Observe response body: "Hello world"
5. Check response headers for Content-Type and status code

### Performance Testing

**Using curl to measure response time:**
```bash
curl -w "Total time: %{time_total}s\n" -o /dev/null -s http://localhost:3000/hello
```

**Expected Performance Characteristics:**
- **Response Time**: < 100ms average
- **Server Startup**: < 1 second
- **Memory Usage**: < 50MB
- **Concurrent Connections**: Supports 100+ simultaneous requests

---

## Server Information

### Default Configuration

| Setting | Value | Description |
|---------|-------|-------------|
| **Hostname** | 127.0.0.1 | Localhost binding for security |
| **Port** | 3000 | Default development port |
| **Protocol** | HTTP/1.1 | Standard HTTP protocol |
| **Timeout** | 30 seconds | Request timeout duration |

### Environment Variables

The server supports the following environment variable overrides:

| Variable | Default | Description | Valid Values |
|----------|---------|-------------|--------------|
| `PORT` | 3000 | Server port number | 1024-65535 |
| `HOST` | 127.0.0.1 | Server hostname | localhost, 127.0.0.1 |
| `NODE_ENV` | development | Environment mode | development, production, educational |

**Example with custom port:**
```bash
PORT=8080 node server.js
```

---

## Troubleshooting

### Common Issues and Solutions

#### Server Not Responding

**Problem**: Connection refused or timeout errors

**Solutions**:
1. **Check if server is running**: Look for "Server running on http://localhost:3000" message
2. **Verify port availability**: Ensure port 3000 is not being used by another application
3. **Check firewall settings**: Ensure localhost connections are allowed
4. **Restart the server**: Stop with Ctrl+C and restart

**Diagnostic Commands**:
```bash
# Check if port 3000 is in use
netstat -an | grep 3000

# Test basic connectivity
curl -I http://localhost:3000/hello

# Check server process
ps aux | grep node
```

#### Method Not Allowed Errors

**Problem**: Receiving 405 errors when testing

**Solutions**:
1. **Use GET method only**: The tutorial server only supports GET requests
2. **Check request method**: Ensure your HTTP client is using GET
3. **Review API documentation**: Confirm endpoint supports your intended method

**Correct Usage**:
```bash
# ✅ Correct - uses GET method
curl http://localhost:3000/hello

# ❌ Incorrect - uses POST method
curl -X POST http://localhost:3000/hello
```

#### Resource Not Found Errors

**Problem**: Receiving 404 errors for valid-looking URLs

**Solutions**:
1. **Verify endpoint path**: Only `/hello` endpoint is available
2. **Check URL spelling**: Ensure correct capitalization and spelling
3. **Remove extra slashes**: Use `/hello` not `/hello/` or `//hello`
4. **Test known working endpoint**: Try `http://localhost:3000/hello`

**Correct Endpoints**:
```bash
# ✅ Correct endpoints
curl http://localhost:3000/hello

# ❌ Incorrect endpoints
curl http://localhost:3000/Hello     # Wrong capitalization
curl http://localhost:3000/hello/    # Extra slash
curl http://localhost:3000/api/hello # Wrong path
```

#### Port Already in Use

**Problem**: Error message "EADDRINUSE: address already in use"

**Solutions**:
1. **Stop conflicting process**: Find and stop the process using port 3000
2. **Use different port**: Set PORT environment variable to different value
3. **Wait and retry**: Sometimes ports take time to be released

**Commands to resolve**:
```bash
# Find process using port 3000 (Linux/Mac)
lsof -ti:3000

# Kill process using port 3000
kill -9 $(lsof -ti:3000)

# Start server on different port
PORT=8080 node server.js
```

### Debugging Tips

1. **Enable verbose logging**: Check console output for detailed information
2. **Use curl with verbose flag**: `curl -v` shows full HTTP conversation
3. **Test with multiple clients**: Try browser, curl, and Postman
4. **Check network connectivity**: Ensure localhost resolution works
5. **Review server logs**: Look for error messages and stack traces
6. **Monitor resource usage**: Check memory and CPU usage during requests

### Getting Help

If you encounter issues not covered in this troubleshooting guide:

1. **Review console output**: Look for detailed error messages and educational guidance
2. **Check server startup messages**: Ensure all initialization steps completed successfully
3. **Verify Node.js version**: Ensure Node.js 18+ is installed
4. **Test basic functionality**: Start with simple GET request to /hello endpoint
5. **Consult tutorial materials**: Review related educational content and examples

---

## Educational Notes

### Learning Objectives Achievement

This API documentation demonstrates several important concepts:

1. **HTTP Protocol Fundamentals**: Understanding request/response patterns, status codes, and headers
2. **RESTful API Design**: Proper endpoint structure and HTTP method usage
3. **Error Handling**: Comprehensive error responses with educational context
4. **Security Practices**: Localhost binding for safe development environments
5. **Documentation Standards**: Complete API documentation with examples and troubleshooting

### Key Concepts Illustrated

- **Stateless Design**: Each request is independent and contains all necessary information
- **HTTP Status Codes**: Proper use of 200, 404, 405, and 500 status codes
- **Content Negotiation**: Appropriate Content-Type headers for different response types
- **Educational Error Messages**: Helpful error responses that guide learning and troubleshooting

### Next Steps in Learning

After mastering this tutorial API, consider exploring:

1. **Multiple Endpoints**: Add more endpoints with different functionality
2. **Request Parameters**: Handle query parameters and request bodies
3. **JSON Responses**: Return structured JSON data instead of plain text
4. **Middleware**: Add request logging, authentication, or validation middleware
5. **Express.js Framework**: Transition to using Express.js for more advanced features
6. **Database Integration**: Connect to databases for persistent data storage
7. **Testing**: Write comprehensive tests for API endpoints
8. **Production Deployment**: Learn about deployment, scaling, and monitoring

### Best Practices Demonstrated

- **Clear Documentation**: Comprehensive API documentation with examples
- **Consistent Error Handling**: Standardized error response format
- **Security Awareness**: Localhost-only binding for development safety
- **Educational Context**: Learning-focused error messages and troubleshooting guidance
- **Performance Considerations**: Response time expectations and resource usage monitoring

---

## API Reference Summary

| Endpoint | Method | Description | Status Codes |
|----------|--------|-------------|--------------|
| `/hello` | GET | Returns "Hello world" message | 200, 405, 500 |
| `/*` | GET | Any other path returns 404 | 404 |
| `/hello` | POST/PUT/DELETE | Method not allowed | 405 |

**Base URL**: `http://127.0.0.1:3000`
**Authentication**: None required
**Content-Type**: `text/plain; charset=utf-8`
**Educational Mode**: Enabled with verbose error messages and troubleshooting guidance

---

*This documentation was generated for educational purposes as part of the Node.js tutorial HTTP server application. For questions or additional learning resources, refer to the tutorial materials and server console output.*