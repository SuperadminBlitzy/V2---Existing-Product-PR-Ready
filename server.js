const http = require('http');
const url = require('url');

// Configuration constants
const hostname = '127.0.0.1';
const port = 3000;
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_URL_LENGTH = 2048;
const MAX_HEADER_SIZE = 8192;

// Connection tracking for graceful shutdown
const connections = new Set();
let server;
let isShuttingDown = false;

// Allowed HTTP methods
const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']);

// Security headers
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'none'",
  'Referrer-Policy': 'no-referrer'
};

// Utility function to validate URL for path traversal
function isValidUrl(reqUrl) {
  if (!reqUrl || reqUrl.length > MAX_URL_LENGTH) {
    return false;
  }
  
  // Check for path traversal attempts
  const pathTraversalPatterns = [
    '../', '..\\', 
    '%2e%2e%2f', '%2e%2e%5c', 
    '%252e%252e%252f', '%252e%252e%255c',
    '..%2f', '..%5c',
    '%2e%2e/', '%2e%2e\\',
    '....//', '....\\\\',
    '..;/', '..;\\',
    '%u002e%u002e%u002f', '%u002e%u002e%u005c'
  ];
  
  const lowerUrl = reqUrl.toLowerCase();
  return !pathTraversalPatterns.some(pattern => lowerUrl.includes(pattern));
}

// Utility function to validate headers
function validateHeaders(headers) {
  if (!headers || typeof headers !== 'object') {
    return false;
  }
  
  const headerString = JSON.stringify(headers);
  if (headerString.length > MAX_HEADER_SIZE) {
    return false;
  }
  
  // Check for suspicious header patterns
  const suspiciousPatterns = ['<script', 'javascript:', 'vbscript:', 'onload='];
  const lowerHeaderString = headerString.toLowerCase();
  return !suspiciousPatterns.some(pattern => lowerHeaderString.includes(pattern));
}

// Enhanced request handler with comprehensive validation and error handling
function handleRequest(req, res) {
  try {
    // Set request timeout
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.writeHead(408, { 'Content-Type': 'text/plain', ...SECURITY_HEADERS });
        res.end('Request Timeout\n');
      }
      req.destroy();
    }, REQUEST_TIMEOUT);

    res.on('finish', () => {
      clearTimeout(timeout);
    });

    // Validate HTTP method
    if (!ALLOWED_METHODS.has(req.method)) {
      res.writeHead(405, { 
        'Content-Type': 'text/plain', 
        'Allow': Array.from(ALLOWED_METHODS).join(', '),
        ...SECURITY_HEADERS 
      });
      res.end('Method Not Allowed\n');
      return;
    }

    // Validate URL
    if (!isValidUrl(req.url)) {
      res.writeHead(400, { 'Content-Type': 'text/plain', ...SECURITY_HEADERS });
      res.end('Bad Request: Invalid URL\n');
      return;
    }

    // Validate headers
    if (!validateHeaders(req.headers)) {
      res.writeHead(400, { 'Content-Type': 'text/plain', ...SECURITY_HEADERS });
      res.end('Bad Request: Invalid Headers\n');
      return;
    }

    // Parse URL for routing
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Health check endpoint
    if (pathname === '/health') {
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        ...SECURITY_HEADERS 
      });
      res.end(JSON.stringify({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      }) + '\n');
      return;
    }

    // Default Hello World response (preserving original functionality)
    if (pathname === '/' || pathname === '') {
      res.writeHead(200, { 
        'Content-Type': 'text/plain',
        ...SECURITY_HEADERS 
      });
      res.end('Hello, World!\n');
      return;
    }

    // Handle other paths
    res.writeHead(404, { 'Content-Type': 'text/plain', ...SECURITY_HEADERS });
    res.end('Not Found\n');

  } catch (error) {
    console.error('Request handling error:', error);
    
    if (!res.headersSent) {
      try {
        res.writeHead(500, { 'Content-Type': 'text/plain', ...SECURITY_HEADERS });
        res.end('Internal Server Error\n');
      } catch (responseError) {
        console.error('Error sending error response:', responseError);
        // Force close the response if we can't send properly
        res.destroy();
      }
    }
  }
}

// Create server with comprehensive error handling
server = http.createServer(handleRequest);

// Configure server timeouts to prevent resource exhaustion
server.keepAliveTimeout = 5000; // 5 seconds
server.headersTimeout = 10000;  // 10 seconds for header parsing
server.requestTimeout = REQUEST_TIMEOUT;

// Server-level error handling
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please choose a different port.`);
    process.exit(1);
  }
});

// Handle client errors (malformed requests, etc.)
server.on('clientError', (error, socket) => {
  console.error('Client error:', error.message);
  
  if (!socket.destroyed) {
    try {
      // Check if it's an invalid method error - send 405 instead of 400
      let statusCode = '400 Bad Request';
      let responseBody = 'Bad Request';
      let allowHeader = '';
      
      if (error.message.includes('Invalid method') || error.message.includes('method encountered')) {
        statusCode = '405 Method Not Allowed';
        responseBody = 'Method Not Allowed';
        allowHeader = `Allow: ${Array.from(ALLOWED_METHODS).join(', ')}\r\n`;
      }
      
      // Send a proper HTTP response for client errors
      const response = `HTTP/1.1 ${statusCode}\r\n` +
                      'Connection: close\r\n' +
                      'Content-Type: text/plain\r\n' +
                      allowHeader +
                      `Content-Length: ${responseBody.length}\r\n` +
                      '\r\n' +
                      responseBody;
      socket.end(response);
    } catch (socketError) {
      console.error('Error sending client error response:', socketError);
      socket.destroy();
    }
  }
});

// Track connections for graceful shutdown
server.on('connection', (socket) => {
  connections.add(socket);
  
  socket.on('close', () => {
    connections.delete(socket);
  });
  
  socket.on('error', (error) => {
    console.error('Socket error:', error.message);
    connections.delete(socket);
    socket.destroy();
  });
});

// Graceful shutdown implementation
function gracefulShutdown(signal) {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
  
  if (isShuttingDown) {
    console.log('Shutdown already in progress...');
    return;
  }
  
  isShuttingDown = true;
  
  // Stop accepting new connections
  server.close(() => {
    console.log('HTTP server closed');
  });
  
  // Set a timeout for forceful shutdown
  const forceShutdownTimeout = setTimeout(() => {
    console.log('Force shutdown - terminating remaining connections');
    connections.forEach(socket => {
      socket.destroy();
    });
    process.exit(1);
  }, 10000); // 10 second grace period
  
  // Wait for existing connections to finish
  const shutdownInterval = setInterval(() => {
    console.log(`Waiting for ${connections.size} connections to close...`);
    
    if (connections.size === 0) {
      clearTimeout(forceShutdownTimeout);
      clearInterval(shutdownInterval);
      console.log('Graceful shutdown completed');
      process.exit(0);
    }
  }, 1000);
  
  // Immediately start closing idle connections
  connections.forEach(socket => {
    if (!socket.destroyed && socket.readyState === 'open') {
      socket.end();
    }
  });
}

// Register signal handlers for graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start the server
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  console.log('Health check available at: /health');
  console.log('Press Ctrl+C for graceful shutdown');
});
