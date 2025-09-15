/**
 * HTTP Mock Objects Module for Node.js Tutorial Application Testing Suite
 * 
 * This module provides comprehensive mock implementations for Node.js HTTP request, response,
 * and server objects used throughout the tutorial application testing suite. Creates realistic
 * mock objects that simulate HTTP protocol behavior, support educational testing patterns, and
 * enable comprehensive unit testing of HTTP server components, request routing, response
 * generation, and hello endpoint functionality with spy capabilities and educational context.
 * 
 * Educational Features:
 * - Comprehensive mock object implementations with realistic HTTP behavior simulation
 * - Jest spy integration for detailed method call tracking and testing verification
 * - Educational context integration with learning metadata throughout all mock objects
 * - Professional testing patterns demonstrating industry-standard mock object usage
 * - Performance testing support with timing capabilities for educational benchmarks
 * - Error scenario coverage with comprehensive error mock scenarios for proper testing
 * - Educational troubleshooting with mock validation and debugging assistance
 * - Tutorial-specific customization tailored for Node.js tutorial learning objectives
 * 
 * @module http-mocks
 * @version 1.0.0
 * @educational Demonstrates comprehensive HTTP mocking for Node.js applications testing
 */

// =============================================================================
// EXTERNAL IMPORTS
// =============================================================================

// Jest testing framework for mock creation and spy functionality - v29.0.0
const jest = require('jest');

// EventEmitter for creating mock server instances with realistic event handling - Node.js Built-in
const { EventEmitter } = require('node:events');

// =============================================================================
// INTERNAL IMPORTS
// =============================================================================

// Import valid request test data for creating realistic mock request objects
const {
    validRequestData: {
        helloGetRequest,
        validHeaders
    },
    expectedResponseData: {
        successResponse,
        notFoundResponse
    }
} = require('../fixtures/test-data.js');

// Import HTTP status code constants for realistic mock responses
const {
    HTTP_STATUS: {
        OK,
        NOT_FOUND,
        METHOD_NOT_ALLOWED,
        INTERNAL_SERVER_ERROR
    }
} = require('../../lib/constants/http-status-codes.js');

// Import success message constants for mock response content
const {
    SUCCESS_MESSAGES: {
        HELLO_WORLD
    }
} = require('../../lib/constants/response-messages.js');

// Import server configuration constants for mock server instances
const {
    DEFAULT_PORT,
    DEFAULT_HOSTNAME
} = require('../../lib/config/server-config.js');

// =============================================================================
// GLOBAL CONSTANTS AND MOCK REGISTRIES
// =============================================================================

/**
 * Default mock request properties for consistent request object creation
 * Educational Note: These defaults ensure all mock requests have proper HTTP structure
 */
const MOCK_REQUEST_DEFAULTS = {
    method: 'GET',
    url: '/hello',
    httpVersion: '1.1',
    headers: {
        'host': `${DEFAULT_HOSTNAME}:${DEFAULT_PORT}`,
        'user-agent': 'Jest-Test-Suite/1.0',
        'accept': 'text/plain',
        'connection': 'keep-alive'
    },
    socket: {
        remoteAddress: '127.0.0.1',
        remotePort: Math.floor(Math.random() * 65535) + 1024
    },
    readable: true,
    complete: true
};

/**
 * Default mock response properties for consistent response object creation
 * Educational Note: These defaults ensure all mock responses follow HTTP protocol standards
 */
const MOCK_RESPONSE_DEFAULTS = {
    statusCode: 200,
    headers: {},
    headersSent: false,
    finished: false,
    writableEnded: false,
    writable: true,
    destroyed: false
};

/**
 * Mock cleanup registry for tracking created mock objects and proper teardown
 * Educational Note: Maintains references to all mocks for cleanup between tests
 */
const MOCK_CLEANUP_REGISTRY = [];

/**
 * Educational mock prefix for identifying mock-generated content
 * Educational Note: Helps distinguish mock objects from real HTTP objects in testing
 */
const EDUCATIONAL_MOCK_PREFIX = '[HTTP Mock]';

// =============================================================================
// MOCK HTTP REQUEST CLASS
// =============================================================================

/**
 * Mock implementation of Node.js http.IncomingMessage class providing realistic HTTP request
 * simulation with configurable properties, educational context, and comprehensive testing
 * support for request processing validation.
 * 
 * Educational Note: Simulates Node.js http.IncomingMessage behavior for testing request handlers
 */
class MockHttpRequest {
    /**
     * Initializes MockHttpRequest with realistic request properties, educational context,
     * and comprehensive testing utilities for HTTP request simulation and validation.
     * 
     * @param {Object} options - Configuration options for request customization including URL, method, headers, and educational settings
     */
    constructor(options = {}) {
        // Initialize request properties with default values and option overrides
        this.method = options.method || MOCK_REQUEST_DEFAULTS.method;
        this.url = options.url || MOCK_REQUEST_DEFAULTS.url;
        this.httpVersion = options.httpVersion || MOCK_REQUEST_DEFAULTS.httpVersion;
        
        // Set up HTTP headers with realistic browser-like values
        this.headers = {
            ...MOCK_REQUEST_DEFAULTS.headers,
            ...options.headers
        };
        
        // Configure request URL parsing and query parameter handling
        this.path = this.url;
        this.query = {};
        if (this.url.includes('?')) {
            const [path, queryString] = this.url.split('?');
            this.path = path;
            this.query = this._parseQueryString(queryString);
        }
        
        // Set up connection and socket information for realistic request simulation
        this.socket = {
            ...MOCK_REQUEST_DEFAULTS.socket,
            ...options.socket
        };
        this.connection = this.socket;
        
        // Add educational metadata and context for tutorial testing purposes
        this.educational = {
            mockType: 'HTTP Request',
            description: `Mock HTTP ${this.method} request to ${this.url}`,
            created_at: new Date().toISOString(),
            learning_context: 'HTTP request processing simulation',
            ...options.educational
        };
        
        // Configure request body handling for different HTTP methods
        this.readable = options.readable !== undefined ? options.readable : MOCK_REQUEST_DEFAULTS.readable;
        this.complete = options.complete !== undefined ? options.complete : MOCK_REQUEST_DEFAULTS.complete;
        this._body = options.body || '';
        this._bodyChunks = [];
        
        // Set up request timing and performance tracking capabilities
        this.requestStartTime = Date.now();
        this.performanceMetrics = {
            created: this.requestStartTime,
            parsingTime: Math.floor(Math.random() * 5) + 1,
            headerCount: Object.keys(this.headers).length
        };
        
        // Initialize request validation and educational debugging utilities
        this._eventListeners = {};
        this._piped = false;
        this._destroyed = false;
        
        // Register mock request in cleanup registry for proper test teardown
        MOCK_CLEANUP_REGISTRY.push(this);
        
        // Add spy tracking for educational testing and debugging assistance
        this._spyMetadata = {
            methodCalls: [],
            eventListeners: {},
            createdBy: 'MockHttpRequest',
            testContext: options.testContext || 'Unknown test'
        };
    }

    /**
     * Mock implementation of EventEmitter.on method for handling request events like 'data',
     * 'end', and 'error' with realistic event simulation for testing request processing.
     * 
     * @param {string} event - Event name to listen for (data, end, error, close)
     * @param {Function} callback - Event handler function to call when event occurs
     * @returns {Object} Mock request object for method chaining
     */
    on(event, callback) {
        // Store event listener in internal event registry
        if (!this._eventListeners[event]) {
            this._eventListeners[event] = [];
        }
        this._eventListeners[event].push(callback);
        
        // Set up realistic event simulation based on request type
        if (event === 'end' && this.complete) {
            // Simulate immediate end event for complete requests
            process.nextTick(() => callback());
        }
        
        if (event === 'data' && this._body) {
            // Simulate data chunks for requests with body content
            process.nextTick(() => {
                callback(Buffer.from(this._body));
            });
        }
        
        // Configure educational logging for event handling demonstration
        this._spyMetadata.methodCalls.push({
            method: 'on',
            event: event,
            timestamp: Date.now(),
            educational: `Event listener registered for '${event}' event`
        });
        
        // Track event listeners for spy validation
        this._spyMetadata.eventListeners[event] = (this._spyMetadata.eventListeners[event] || 0) + 1;
        
        // Return mock request object for method chaining support
        return this;
    }

    /**
     * Mock implementation of stream pipe method for testing request body streaming
     * and processing with educational context about Node.js streams.
     * 
     * @param {Object} destination - Destination stream for piping request data
     * @returns {Object} Destination stream object for method chaining
     */
    pipe(destination) {
        // Simulate request data piping to destination stream
        this._piped = true;
        
        // Add educational context about Node.js stream processing
        this._spyMetadata.methodCalls.push({
            method: 'pipe',
            destination: destination.constructor.name,
            timestamp: Date.now(),
            educational: 'Request data piped to destination stream for processing'
        });
        
        // Track piping operations for testing validation
        this.educational.pipeOperations = (this.educational.pipeOperations || 0) + 1;
        
        // Simulate data flow if destination has write method
        if (destination && typeof destination.write === 'function' && this._body) {
            process.nextTick(() => {
                destination.write(Buffer.from(this._body));
                if (typeof destination.end === 'function') {
                    destination.end();
                }
            });
        }
        
        // Return destination stream for chaining support
        return destination;
    }

    /**
     * Parse query string into object for URL parameter handling
     * @private
     */
    _parseQueryString(queryString) {
        const params = {};
        const pairs = queryString.split('&');
        for (const pair of pairs) {
            const [key, value] = pair.split('=');
            if (key) {
                params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
            }
        }
        return params;
    }
}

// =============================================================================
// MOCK HTTP RESPONSE CLASS
// =============================================================================

/**
 * Mock implementation of Node.js http.ServerResponse class providing comprehensive response
 * simulation with spy methods, header tracking, content capture, and educational context
 * for testing response generation and HTTP server functionality.
 * 
 * Educational Note: Simulates Node.js http.ServerResponse behavior for testing response handlers
 */
class MockHttpResponse {
    /**
     * Initializes MockHttpResponse with comprehensive spy methods, response tracking capabilities,
     * and educational context for testing HTTP response generation and validation.
     * 
     * @param {Object} options - Configuration options for response customization including spy tracking, header validation, and educational features
     */
    constructor(options = {}) {
        // Initialize response properties with default values and realistic HTTP response structure
        this.statusCode = options.statusCode || MOCK_RESPONSE_DEFAULTS.statusCode;
        this.statusMessage = this._getStatusMessage(this.statusCode);
        this.headersSent = false;
        this.finished = false;
        this.writableEnded = false;
        this.writable = true;
        this.destroyed = false;
        
        // Set up response header storage and tracking for validation testing
        this.headers = {};
        this._headerNames = {};
        this._removedHeaders = {};
        
        // Configure response body capture for content validation and testing
        this.bodyChunks = [];
        this._bodyLength = 0;
        this._responseBody = '';
        
        // Add response timing tracking for performance testing and educational metrics
        this.responseStartTime = Date.now();
        this.performanceMetrics = {
            created: this.responseStartTime,
            headerWriteTime: null,
            bodyWriteTime: null,
            endTime: null,
            totalProcessingTime: null
        };
        
        // Set up educational metadata and context for tutorial testing purposes
        this.educational = {
            mockType: 'HTTP Response',
            description: `Mock HTTP response with status ${this.statusCode}`,
            created_at: new Date().toISOString(),
            learning_context: 'HTTP response generation simulation',
            ...options.educational
        };
        
        // Create Jest spy functions for all response methods with comprehensive tracking
        this.spies = {
            writeHead: jest.fn(this._writeHeadImplementation.bind(this)),
            write: jest.fn(this._writeImplementation.bind(this)),
            end: jest.fn(this._endImplementation.bind(this)),
            setHeader: jest.fn(this._setHeaderImplementation.bind(this)),
            getHeader: jest.fn(this._getHeaderImplementation.bind(this)),
            getHeaders: jest.fn(this._getHeadersImplementation.bind(this)),
            removeHeader: jest.fn(this._removeHeaderImplementation.bind(this))
        };
        
        // Initialize response state tracking for realistic HTTP response behavior
        this._writeHeadCalled = false;
        this._implicitHeaders = true;
        this._hasBody = true;
        
        // Initialize response validation utilities and debugging assistance
        this._spyMetadata = {
            methodCalls: [],
            headerOperations: [],
            bodyOperations: [],
            createdBy: 'MockHttpResponse',
            testContext: options.testContext || 'Unknown test'
        };
        
        // Register mock response in cleanup registry for proper test teardown
        MOCK_CLEANUP_REGISTRY.push(this);
        
        // Set up spy method call tracking for comprehensive testing verification
        this._setupSpyTracking();
    }

    /**
     * Mock implementation of response.writeHead method with spy tracking, header validation,
     * and educational context for testing HTTP response header generation.
     * 
     * @param {number} statusCode - HTTP status code for the response
     * @param {Object} headers - Optional response headers object
     * @returns {Object} Mock response object for method chaining
     */
    writeHead(statusCode, headers) {
        return this.spies.writeHead(statusCode, headers);
    }

    /**
     * Mock implementation of response.write method with content capture, spy tracking,
     * and educational context for testing response body generation.
     * 
     * @param {string} chunk - Response body chunk to write
     * @returns {boolean} True indicating successful write operation
     */
    write(chunk) {
        return this.spies.write(chunk);
    }

    /**
     * Mock implementation of response.end method with completion tracking, spy validation,
     * and educational context for testing response finalization and HTTP protocol compliance.
     * 
     * @param {string} data - Optional final data chunk to write before ending response
     * @returns {Object} Mock response object for method chaining
     */
    end(data) {
        return this.spies.end(data);
    }

    /**
     * Mock implementation of response.setHeader method with header tracking, validation,
     * and educational context for testing individual header setting operations.
     * 
     * @param {string} name - Header name to set
     * @param {string} value - Header value to assign
     * @returns {void} No return value, modifies response headers object
     */
    setHeader(name, value) {
        return this.spies.setHeader(name, value);
    }

    /**
     * Mock implementation of response.getHeader method for retrieving header values
     * 
     * @param {string} name - Header name to retrieve
     * @returns {string} Header value or undefined if not set
     */
    getHeader(name) {
        return this.spies.getHeader(name);
    }

    /**
     * Mock implementation of response.getHeaders method returning current response headers
     * for testing header validation and educational header inspection.
     * 
     * @returns {Object} Object containing current response headers
     */
    getHeaders() {
        return this.spies.getHeaders();
    }

    /**
     * Mock implementation of response.removeHeader method for header removal testing
     * 
     * @param {string} name - Header name to remove
     * @returns {void} No return value, modifies response headers object
     */
    removeHeader(name) {
        return this.spies.removeHeader(name);
    }

    // =============================================================================
    // PRIVATE IMPLEMENTATION METHODS
    // =============================================================================

    /**
     * Private implementation for writeHead spy method
     * @private
     */
    _writeHeadImplementation(statusCode, headers) {
        // Track method call using Jest spy with arguments
        this._spyMetadata.methodCalls.push({
            method: 'writeHead',
            statusCode,
            headers,
            timestamp: Date.now(),
            educational: `Response headers written with status ${statusCode}`
        });
        
        // Set response status code and merge provided headers
        this.statusCode = statusCode;
        this.statusMessage = this._getStatusMessage(statusCode);
        this._writeHeadCalled = true;
        this._implicitHeaders = false;
        
        // Update performance timing for educational benchmarking
        this.performanceMetrics.headerWriteTime = Date.now() - this.responseStartTime;
        
        // Merge headers if provided
        if (headers && typeof headers === 'object') {
            Object.keys(headers).forEach(name => {
                this._setHeaderImplementation(name, headers[name]);
            });
        }
        
        // Update headersSent flag to true for realistic behavior
        this.headersSent = true;
        
        // Add educational logging about response header setting
        this.educational.headerOperations = (this.educational.headerOperations || 0) + 1;
        
        // Return mock response object for method chaining
        return this;
    }

    /**
     * Private implementation for write spy method
     * @private
     */
    _writeImplementation(chunk) {
        // Track method call using Jest spy with chunk content
        this._spyMetadata.methodCalls.push({
            method: 'write',
            chunkLength: chunk ? chunk.length : 0,
            timestamp: Date.now(),
            educational: `Response body chunk written (${chunk ? chunk.length : 0} bytes)`
        });
        
        // Handle implicit headers if not already sent
        if (!this.headersSent && this._implicitHeaders) {
            this._writeHeadImplementation(this.statusCode, {});
        }
        
        // Store chunk in bodyChunks array for content validation
        if (chunk) {
            const chunkBuffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
            this.bodyChunks.push(chunkBuffer);
            this._bodyLength += chunkBuffer.length;
            this._responseBody += chunkBuffer.toString();
        }
        
        // Update performance timing for educational benchmarking
        if (!this.performanceMetrics.bodyWriteTime) {
            this.performanceMetrics.bodyWriteTime = Date.now() - this.responseStartTime;
        }
        
        // Update response state for realistic HTTP response behavior
        this.educational.bodyOperations = (this.educational.bodyOperations || 0) + 1;
        
        // Add educational logging about response body writing
        this._spyMetadata.bodyOperations.push({
            operation: 'write',
            size: chunk ? chunk.length : 0,
            timestamp: Date.now()
        });
        
        // Return true to simulate successful write operation
        return true;
    }

    /**
     * Private implementation for end spy method
     * @private
     */
    _endImplementation(data) {
        // Track method call using Jest spy with final data
        this._spyMetadata.methodCalls.push({
            method: 'end',
            finalDataLength: data ? data.length : 0,
            timestamp: Date.now(),
            educational: 'Response ended - HTTP transaction complete'
        });
        
        // Handle implicit headers if not already sent
        if (!this.headersSent && this._implicitHeaders) {
            this._writeHeadImplementation(this.statusCode, {});
        }
        
        // Add final data chunk to bodyChunks if provided
        if (data) {
            this._writeImplementation(data);
        }
        
        // Set finished and writableEnded flags to true
        this.finished = true;
        this.writableEnded = true;
        this.writable = false;
        
        // Update performance timing metrics
        this.performanceMetrics.endTime = Date.now() - this.responseStartTime;
        this.performanceMetrics.totalProcessingTime = this.performanceMetrics.endTime;
        
        // Simulate response completion and connection cleanup
        this.educational.responseCompleted = true;
        this.educational.totalBodySize = this._bodyLength;
        
        // Add educational logging about response finalization
        this._spyMetadata.bodyOperations.push({
            operation: 'end',
            size: data ? data.length : 0,
            timestamp: Date.now(),
            finalBodySize: this._bodyLength
        });
        
        // Return mock response object for chaining
        return this;
    }

    /**
     * Private implementation for setHeader spy method
     * @private
     */
    _setHeaderImplementation(name, value) {
        // Track method call using Jest spy with header name and value
        this._spyMetadata.methodCalls.push({
            method: 'setHeader',
            headerName: name,
            headerValue: value,
            timestamp: Date.now(),
            educational: `Header '${name}' set to '${value}'`
        });
        
        // Validate header name and value for HTTP compliance
        if (typeof name !== 'string' || !name.trim()) {
            throw new Error('Header name must be a non-empty string');
        }
        
        // Set header in internal headers object with proper formatting
        const headerName = name.toLowerCase();
        this.headers[headerName] = value;
        this._headerNames[headerName] = name; // Store original case
        
        // Track header operations for educational purposes
        this._spyMetadata.headerOperations.push({
            operation: 'set',
            name: name,
            value: value,
            timestamp: Date.now()
        });
        
        // Add educational logging about individual header setting
        this.educational.headerCount = Object.keys(this.headers).length;
        
        // Update headers tracking for validation testing
        return this;
    }

    /**
     * Private implementation for getHeader spy method
     * @private
     */
    _getHeaderImplementation(name) {
        // Track method call using Jest spy
        this._spyMetadata.methodCalls.push({
            method: 'getHeader',
            headerName: name,
            timestamp: Date.now(),
            educational: `Header '${name}' retrieved`
        });
        
        // Return header value in case-insensitive manner
        return this.headers[name.toLowerCase()];
    }

    /**
     * Private implementation for getHeaders spy method
     * @private
     */
    _getHeadersImplementation() {
        // Track method call using Jest spy for testing verification
        this._spyMetadata.methodCalls.push({
            method: 'getHeaders',
            timestamp: Date.now(),
            educational: `All headers retrieved (${Object.keys(this.headers).length} headers)`
        });
        
        // Return copy of current headers object for testing validation
        return { ...this.headers };
    }

    /**
     * Private implementation for removeHeader spy method
     * @private
     */
    _removeHeaderImplementation(name) {
        // Track method call using Jest spy
        this._spyMetadata.methodCalls.push({
            method: 'removeHeader',
            headerName: name,
            timestamp: Date.now(),
            educational: `Header '${name}' removed`
        });
        
        const headerName = name.toLowerCase();
        if (this.headers[headerName]) {
            this._removedHeaders[headerName] = this.headers[headerName];
            delete this.headers[headerName];
            delete this._headerNames[headerName];
        }
        
        // Track header operations
        this._spyMetadata.headerOperations.push({
            operation: 'remove',
            name: name,
            timestamp: Date.now()
        });
    }

    /**
     * Get HTTP status message for status code
     * @private
     */
    _getStatusMessage(statusCode) {
        const messages = {
            200: 'OK',
            404: 'Not Found',
            405: 'Method Not Allowed',
            500: 'Internal Server Error'
        };
        return messages[statusCode] || 'Unknown';
    }

    /**
     * Set up spy tracking for all spy methods
     * @private
     */
    _setupSpyTracking() {
        // Track spy method calls for educational analysis
        Object.keys(this.spies).forEach(methodName => {
            const originalSpy = this.spies[methodName];
            this.spies[methodName] = jest.fn((...args) => {
                this._spyMetadata.methodCalls.push({
                    spyMethod: methodName,
                    args: args,
                    timestamp: Date.now()
                });
                return originalSpy(...args);
            });
        });
    }
}

// =============================================================================
// MOCK HTTP SERVER CLASS
// =============================================================================

/**
 * Mock implementation of Node.js http.Server class extending EventEmitter providing
 * comprehensive server simulation with lifecycle management, event handling, and
 * educational context for server component testing.
 * 
 * Educational Note: Simulates Node.js http.Server behavior for testing server functionality
 */
class MockHttpServer extends EventEmitter {
    /**
     * Initializes MockHttpServer with EventEmitter capabilities, Jest spy methods,
     * realistic server behavior, and educational context for comprehensive server testing.
     * 
     * @param {Object} options - Configuration options for server customization including port, hostname, event handling, and educational settings
     */
    constructor(options = {}) {
        // Initialize server properties with EventEmitter inheritance
        super();
        
        // Set default server properties including port, hostname, and listening state
        this.port = options.port || DEFAULT_PORT;
        this.hostname = options.hostname || DEFAULT_HOSTNAME;
        this.listening = false;
        this.closing = false;
        this.connectionCount = 0;
        this.timeout = options.timeout || 0;
        this.keepAliveTimeout = options.keepAliveTimeout || 5000;
        this.maxConnections = options.maxConnections || null;
        
        // Set up server state tracking for realistic server behavior simulation
        this._connections = [];
        this._requestCount = 0;
        this._startTime = null;
        this._closeCallback = null;
        this._listenCallback = null;
        
        // Set up server configuration and network binding information
        this.address = () => ({
            address: this.hostname,
            port: this.port,
            family: 'IPv4'
        });
        
        // Add educational metadata and server demonstration features for tutorial purposes
        this.educational = {
            mockType: 'HTTP Server',
            description: `Mock HTTP server on ${this.hostname}:${this.port}`,
            created_at: new Date().toISOString(),
            learning_context: 'HTTP server lifecycle simulation',
            serverCapabilities: ['request handling', 'event emission', 'lifecycle management'],
            ...options.educational
        };
        
        // Create Jest spy functions for server methods with comprehensive tracking
        this.spies = {
            listen: jest.fn(this._listenImplementation.bind(this)),
            close: jest.fn(this._closeImplementation.bind(this)),
            setTimeout: jest.fn(this._setTimeoutImplementation.bind(this)),
            ref: jest.fn(() => this),
            unref: jest.fn(() => this)
        };
        
        // Add server performance tracking and monitoring capabilities for testing
        this.performanceMetrics = {
            created: Date.now(),
            startupTime: null,
            shutdownTime: null,
            totalRequests: 0,
            averageResponseTime: 0,
            uptime: () => this._startTime ? Date.now() - this._startTime : 0
        };
        
        // Initialize server validation and debugging assistance
        this._spyMetadata = {
            methodCalls: [],
            eventEmissions: [],
            connectionTracking: [],
            createdBy: 'MockHttpServer',
            testContext: options.testContext || 'Unknown test'
        };
        
        // Configure server lifecycle management with realistic startup and shutdown behavior
        this._setupEventHandling();
        
        // Register mock server in cleanup registry for proper test teardown and resource management
        MOCK_CLEANUP_REGISTRY.push(this);
        
        // Set up server request simulation utilities for integration testing scenarios
        this._requestHandler = options.requestHandler || this._defaultRequestHandler.bind(this);
    }

    /**
     * Mock implementation of server.listen method with port binding simulation, event emission,
     * spy tracking, and educational context for testing server startup functionality.
     * 
     * @param {number} port - Port number to bind server to
     * @param {string} hostname - Hostname to bind server to (optional)
     * @param {Function} callback - Callback function to call when server starts listening
     * @returns {Object} Mock server object for method chaining
     */
    listen(port, hostname, callback) {
        return this.spies.listen(port, hostname, callback);
    }

    /**
     * Mock implementation of server.close method with graceful shutdown simulation, event emission,
     * spy tracking, and educational context for testing server shutdown functionality.
     * 
     * @param {Function} callback - Optional callback function to call when server closes
     * @returns {Object} Mock server object for method chaining
     */
    close(callback) {
        return this.spies.close(callback);
    }

    /**
     * Mock implementation of server.setTimeout method with timeout configuration, spy tracking,
     * and educational context for testing server timeout management.
     * 
     * @param {number} timeout - Timeout value in milliseconds
     * @param {Function} callback - Optional timeout callback function
     * @returns {Object} Mock server object for method chaining
     */
    setTimeout(timeout, callback) {
        return this.spies.setTimeout(timeout, callback);
    }

    // =============================================================================
    // PRIVATE IMPLEMENTATION METHODS
    // =============================================================================

    /**
     * Private implementation for listen spy method
     * @private
     */
    _listenImplementation(port, hostname, callback) {
        // Handle different parameter combinations
        let finalPort, finalHostname, finalCallback;
        
        if (typeof port === 'function') {
            finalCallback = port;
            finalPort = this.port;
            finalHostname = this.hostname;
        } else if (typeof hostname === 'function') {
            finalCallback = hostname;
            finalPort = port || this.port;
            finalHostname = this.hostname;
        } else {
            finalPort = port || this.port;
            finalHostname = hostname || this.hostname;
            finalCallback = callback;
        }
        
        // Track method call using Jest spy with port and hostname arguments
        this._spyMetadata.methodCalls.push({
            method: 'listen',
            port: finalPort,
            hostname: finalHostname,
            timestamp: Date.now(),
            educational: `Server listening on ${finalHostname}:${finalPort}`
        });
        
        // Set server properties and listening state for realistic behavior
        this.port = finalPort;
        this.hostname = finalHostname;
        this.listening = true;
        this._startTime = Date.now();
        this._listenCallback = finalCallback;
        
        // Update performance tracking
        this.performanceMetrics.startupTime = Date.now() - this.performanceMetrics.created;
        
        // Simulate asynchronous server startup with appropriate timing
        process.nextTick(() => {
            // Emit 'listening' event to simulate realistic server behavior
            this.emit('listening');
            
            // Call callback function if provided for proper async simulation
            if (finalCallback && typeof finalCallback === 'function') {
                finalCallback();
            }
            
            // Track event emission for educational purposes
            this._spyMetadata.eventEmissions.push({
                event: 'listening',
                timestamp: Date.now(),
                educational: 'Server listening event emitted'
            });
            
            // Add educational logging about server startup process
            this.educational.serverStarted = true;
            this.educational.bindingAddress = `${this.hostname}:${this.port}`;
        });
        
        // Return mock server object for method chaining support
        return this;
    }

    /**
     * Private implementation for close spy method
     * @private
     */
    _closeImplementation(callback) {
        // Track method call using Jest spy with callback argument
        this._spyMetadata.methodCalls.push({
            method: 'close',
            timestamp: Date.now(),
            educational: 'Server shutdown initiated'
        });
        
        // Set closing flag and update server state for realistic shutdown behavior
        this.closing = true;
        this._closeCallback = callback;
        
        // Update performance tracking
        this.performanceMetrics.shutdownTime = Date.now() - (this._startTime || this.performanceMetrics.created);
        
        // Simulate connection draining and resource cleanup process
        process.nextTick(() => {
            // Update server state
            this.listening = false;
            this.closing = false;
            this.connectionCount = 0;
            this._connections = [];
            
            // Emit 'close' event to simulate realistic server shutdown
            this.emit('close');
            
            // Call callback function if provided for proper async simulation
            if (callback && typeof callback === 'function') {
                callback();
            }
            
            // Track event emission
            this._spyMetadata.eventEmissions.push({
                event: 'close',
                timestamp: Date.now(),
                educational: 'Server close event emitted'
            });
            
            // Add educational logging about server shutdown process
            this.educational.serverClosed = true;
            this.educational.shutdownReason = 'Manual close() call';
        });
        
        // Return mock server object for method chaining support
        return this;
    }

    /**
     * Private implementation for setTimeout spy method
     * @private
     */
    _setTimeoutImplementation(timeout, callback) {
        // Track method call using Jest spy with timeout and callback arguments
        this._spyMetadata.methodCalls.push({
            method: 'setTimeout',
            timeout: timeout,
            timestamp: Date.now(),
            educational: `Server timeout set to ${timeout}ms`
        });
        
        // Store timeout configuration in server properties
        this.timeout = timeout;
        if (callback && typeof callback === 'function') {
            this.on('timeout', callback);
        }
        
        // Add educational logging about server timeout configuration
        this.educational.timeoutConfiguration = {
            value: timeout,
            units: 'milliseconds',
            description: 'Socket inactivity timeout'
        };
        
        // Return mock server object for method chaining support
        return this;
    }

    /**
     * Set up event handling for educational demonstration
     * @private
     */
    _setupEventHandling() {
        // Track event emissions for educational purposes
        const originalEmit = this.emit;
        this.emit = function(event, ...args) {
            this._spyMetadata.eventEmissions.push({
                event: event,
                args: args.length,
                timestamp: Date.now(),
                educational: `Server emitted '${event}' event`
            });
            return originalEmit.call(this, event, ...args);
        };
    }

    /**
     * Default request handler for demonstration
     * @private
     */
    _defaultRequestHandler(req, res) {
        this._requestCount++;
        this.performanceMetrics.totalRequests++;
        
        // Simulate request processing
        this._spyMetadata.connectionTracking.push({
            operation: 'request',
            method: req.method,
            url: req.url,
            timestamp: Date.now()
        });
        
        // Emit request event
        this.emit('request', req, res);
    }

    /**
     * Simulate incoming request for testing
     */
    simulateRequest(mockRequest, mockResponse) {
        if (this.listening) {
            this._requestHandler(mockRequest, mockResponse);
        }
        return { request: mockRequest, response: mockResponse };
    }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Factory function that creates comprehensive mock HTTP request objects (http.IncomingMessage)
 * with configurable properties, realistic behavior, and educational context for testing
 * HTTP server components and request processing functionality.
 * 
 * @param {Object} options - Optional configuration object for customizing mock request properties including URL, method, headers, and educational context
 * @returns {Object} Mock HTTP request object with Node.js http.IncomingMessage interface, spy methods, and educational metadata
 */
function createMockRequest(options = {}) {
    // Initialize mock request object with http.IncomingMessage interface structure
    const mockRequest = new MockHttpRequest({
        // Set default request properties including method, URL, HTTP version, and headers
        method: options.method || 'GET',
        url: options.url || '/hello',
        httpVersion: options.httpVersion || '1.1',
        
        // Merge provided options with default request configuration for customization
        headers: {
            ...validHeaders.standard,
            ...options.headers
        },
        
        // Create realistic request headers with host, user-agent, and accept properties
        socket: {
            remoteAddress: options.remoteAddress || '127.0.0.1',
            remotePort: options.remotePort || Math.floor(Math.random() * 65535) + 1024,
            localAddress: DEFAULT_HOSTNAME,
            localPort: DEFAULT_PORT
        },
        
        // Set up request body handling for POST/PUT requests if applicable
        body: options.body || '',
        readable: options.readable !== undefined ? options.readable : true,
        complete: options.complete !== undefined ? options.complete : true,
        
        // Add educational metadata and context for tutorial testing purposes
        educational: {
            mockType: 'HTTP Request Mock',
            testScenario: options.testScenario || 'Default request testing',
            learningObjective: options.learningObjective || 'HTTP request processing validation',
            ...options.educational
        },
        
        // Configure request timing and performance tracking properties
        testContext: options.testContext || 'createMockRequest',
        ...options
    });
    
    // Set up connection properties including remote address and socket information
    mockRequest.connection = mockRequest.socket;
    mockRequest.httpVersionMajor = 1;
    mockRequest.httpVersionMinor = 1;
    mockRequest.rawHeaders = Object.keys(mockRequest.headers).reduce((acc, key) => {
        acc.push(key, mockRequest.headers[key]);
        return acc;
    }, []);
    
    // Register mock request in cleanup registry for proper test teardown
    // (Already handled in MockHttpRequest constructor)
    
    // Add spy tracking for educational testing and debugging assistance
    mockRequest.spyMetadata = mockRequest._spyMetadata;
    
    // Configure request event emitter behavior for realistic HTTP request simulation
    mockRequest.setTimeout = jest.fn((timeout, callback) => {
        if (callback) mockRequest.on('timeout', callback);
        return mockRequest;
    });
    mockRequest.destroy = jest.fn(() => {
        mockRequest._destroyed = true;
        mockRequest.readable = false;
        return mockRequest;
    });
    
    // Return complete mock request object ready for testing HTTP server components
    return mockRequest;
}

/**
 * Factory function that creates comprehensive mock HTTP response objects (http.ServerResponse)
 * with spy methods, header tracking, content capture, and educational context for testing
 * response generation and HTTP server functionality.
 * 
 * @param {Object} options - Optional configuration for customizing mock response properties including spy tracking, header validation, and educational features
 * @returns {Object} Mock HTTP response object with Node.js http.ServerResponse interface, comprehensive spy methods, and response tracking capabilities
 */
function createMockResponse(options = {}) {
    // Initialize mock response object with http.ServerResponse interface structure
    const mockResponse = new MockHttpResponse({
        // Set default response properties including status code, headers, and writable state
        statusCode: options.statusCode || OK,
        headers: options.headers || {},
        
        // Configure educational context and metadata for tutorial testing purposes
        educational: {
            mockType: 'HTTP Response Mock',
            testScenario: options.testScenario || 'Default response testing',
            learningObjective: options.learningObjective || 'HTTP response generation validation',
            expectedContent: options.expectedContent || HELLO_WORLD.split(' - ')[0],
            ...options.educational
        },
        
        // Set up spy method expectations for comprehensive testing verification
        testContext: options.testContext || 'createMockResponse',
        ...options
    });
    
    // Create Jest spy functions for all response methods (writeHead, write, end, setHeader)
    // (Already handled in MockHttpResponse constructor)
    
    // Set up header storage and tracking for response header validation testing
    // Configure response body capture for content validation and testing
    // Add response timing tracking for performance testing and educational metrics
    // (All handled in MockHttpResponse constructor)
    
    // Set up response state tracking (headersSent, finished, writableEnded)
    Object.defineProperty(mockResponse, 'socket', {
        value: {
            writable: true,
            destroyed: false,
            write: jest.fn(),
            end: jest.fn(),
            destroy: jest.fn()
        },
        writable: false
    });
    
    // Implement realistic response method behavior with proper HTTP protocol simulation
    mockResponse.cork = jest.fn();
    mockResponse.uncork = jest.fn();
    mockResponse.flushHeaders = jest.fn(() => {
        if (!mockResponse.headersSent) {
            mockResponse.headersSent = true;
        }
    });
    
    // Add response validation utilities for testing response generation components
    mockResponse.getHeaderNames = jest.fn(() => Object.keys(mockResponse.headers));
    mockResponse.hasHeader = jest.fn((name) => name.toLowerCase() in mockResponse.headers);
    
    // Set up spy method call tracking for comprehensive testing verification
    // Register mock response in cleanup registry for proper test teardown
    // (Already handled in MockHttpResponse constructor)
    
    // Configure response event handling for complete HTTP response lifecycle simulation
    mockResponse.once = jest.fn((event, listener) => {
        if (event === 'finish' && mockResponse.finished) {
            process.nextTick(listener);
        }
        return mockResponse;
    });
    
    // Return complete mock response object ready for testing response generation functionality
    return mockResponse;
}

/**
 * Factory function that creates comprehensive mock HTTP server instances with event handling,
 * lifecycle management, request simulation capabilities, and educational context for testing
 * server functionality and educational demonstrations.
 * 
 * @param {Object} options - Optional configuration for server properties including port, hostname, event handling, and educational features
 * @returns {Object} Mock HTTP server instance with Node.js http.Server interface, event emitter capabilities, and comprehensive testing utilities
 */
function createMockServer(options = {}) {
    // Initialize mock server object extending EventEmitter for realistic server event handling
    const mockServer = new MockHttpServer({
        // Set default server properties including port, hostname, and listening state
        port: options.port || DEFAULT_PORT,
        hostname: options.hostname || DEFAULT_HOSTNAME,
        timeout: options.timeout || 0,
        keepAliveTimeout: options.keepAliveTimeout || 5000,
        maxConnections: options.maxConnections || null,
        
        // Add educational context and server demonstration features for tutorial purposes
        educational: {
            mockType: 'HTTP Server Mock',
            testScenario: options.testScenario || 'Default server testing',
            learningObjective: options.learningObjective || 'HTTP server lifecycle validation',
            serverCapabilities: [
                'Request handling simulation',
                'Event emission testing', 
                'Lifecycle management validation',
                'Performance monitoring'
            ],
            ...options.educational
        },
        
        // Configure educational context and server demonstration features for tutorial purposes
        testContext: options.testContext || 'createMockServer',
        requestHandler: options.requestHandler,
        ...options
    });
    
    // Create Jest spy functions for server methods (listen, close, setTimeout)
    // Set up server event handling for 'request', 'listening', 'error', and 'close' events
    // (Already handled in MockHttpServer constructor)
    
    // Configure server state tracking (listening, closing, connectionCount)
    // Add server lifecycle management with realistic startup and shutdown behavior
    // Set up connection management and request handling simulation
    // (All handled in MockHttpServer constructor)
    
    // Add server performance tracking and monitoring capabilities for testing
    mockServer.getConnections = jest.fn((callback) => {
        process.nextTick(() => callback(null, mockServer.connectionCount));
        return mockServer;
    });
    
    // Set up server configuration validation and error simulation for educational error handling
    mockServer.address = jest.fn(() => {
        if (!mockServer.listening) return null;
        return {
            address: mockServer.hostname,
            port: mockServer.port,
            family: 'IPv4'
        };
    });
    
    // Create server request simulation utilities for integration testing scenarios
    mockServer.simulateRequest = function(requestOptions = {}, responseOptions = {}) {
        const mockRequest = createMockRequest(requestOptions);
        const mockResponse = createMockResponse(responseOptions);
        
        if (mockServer.listening) {
            // Simulate request arrival
            process.nextTick(() => {
                mockServer.emit('request', mockRequest, mockResponse);
            });
        }
        
        return { request: mockRequest, response: mockResponse };
    };
    
    // Register mock server in cleanup registry for proper test teardown and resource management
    // (Already handled in MockHttpServer constructor)
    
    // Configure server timeout handling and connection management for realistic server behavior
    mockServer.headersTimeout = options.headersTimeout || 60000;
    mockServer.requestTimeout = options.requestTimeout || 0;
    
    // Return complete mock server instance ready for testing HTTP server component functionality
    return mockServer;
}

/**
 * Utility function that simulates complete HTTP request-response cycles using mock objects,
 * providing realistic request processing, response generation, and educational context
 * for integration testing scenarios.
 * 
 * @param {Object} mockServer - Mock server instance to process the simulated request
 * @param {Object} requestOptions - Configuration for the simulated request including URL, method, headers, and body content
 * @param {Function} requestHandler - Request handler function to process the simulated request
 * @returns {Promise} Promise resolving to simulation results with request, response, timing data, and educational insights
 */
async function simulateRequest(mockServer, requestOptions = {}, requestHandler) {
    // Create mock request and response objects using factory functions
    const mockRequest = createMockRequest({
        url: requestOptions.url || '/hello',
        method: requestOptions.method || 'GET',
        headers: requestOptions.headers || {},
        body: requestOptions.body || '',
        ...requestOptions
    });
    
    const mockResponse = createMockResponse({
        statusCode: requestOptions.expectedStatus || OK,
        ...requestOptions.responseOptions
    });
    
    // Configure request simulation with provided options and educational context
    const simulationContext = {
        startTime: Date.now(),
        testScenario: requestOptions.testScenario || 'Request simulation',
        learningObjective: requestOptions.learningObjective || 'HTTP request-response cycle',
        expectedOutcome: requestOptions.expectedOutcome || 'Successful processing'
    };
    
    // Start performance timing for educational performance measurement
    const performanceStart = Date.now();
    
    try {
        // Simulate request arrival by calling request handler with mock objects
        if (requestHandler && typeof requestHandler === 'function') {
            await new Promise((resolve, reject) => {
                try {
                    // Track request processing and response generation through spy methods
                    const result = requestHandler(mockRequest, mockResponse);
                    
                    // Handle both synchronous and asynchronous request handlers
                    if (result && typeof result.then === 'function') {
                        result.then(resolve).catch(reject);
                    } else {
                        // For synchronous handlers, wait for response to be ended
                        if (mockResponse.writableEnded || mockResponse.finished) {
                            resolve();
                        } else {
                            // Wait a short time for async response completion
                            setTimeout(resolve, 10);
                        }
                    }
                } catch (error) {
                    reject(error);
                }
            });
        } else if (mockServer && mockServer.simulateRequest) {
            // Use server's built-in request simulation
            mockServer.simulateRequest(requestOptions, requestOptions.responseOptions);
        }
        
        // Monitor response headers, status codes, and content during simulation
        const responseData = {
            statusCode: mockResponse.statusCode,
            headers: mockResponse.getHeaders(),
            body: mockResponse.bodyChunks.join(''),
            headersSent: mockResponse.headersSent,
            finished: mockResponse.finished
        };
        
        // End performance timing and calculate request-response cycle duration
        const processingTime = Date.now() - performanceStart;
        
        // Compile simulation results including request data, response data, and timing metrics
        const simulationResults = {
            success: true,
            request: {
                method: mockRequest.method,
                url: mockRequest.url,
                headers: mockRequest.headers,
                body: mockRequest._body || ''
            },
            response: responseData,
            performance: {
                processingTime,
                requestStartTime: mockRequest.requestStartTime,
                responseStartTime: mockResponse.responseStartTime,
                totalDuration: Date.now() - simulationContext.startTime
            },
            spyData: {
                requestCalls: mockRequest._spyMetadata?.methodCalls || [],
                responseCalls: mockResponse._spyMetadata?.methodCalls || [],
                serverCalls: mockServer?._spyMetadata?.methodCalls || []
            },
            educational: {
                context: simulationContext,
                insights: [
                    `Request processed in ${processingTime}ms`,
                    `Response status: ${responseData.statusCode}`,
                    `Headers sent: ${responseData.headersSent}`,
                    `Response finished: ${responseData.finished}`
                ],
                learningPoints: [
                    'HTTP request-response cycle completed',
                    'Spy methods tracked all interactions',
                    'Performance metrics collected',
                    'Educational context maintained'
                ]
            }
        };
        
        // Add educational insights about HTTP request-response cycle and performance characteristics
        simulationResults.educational.performanceInsights = {
            responseTimeCategory: processingTime < 50 ? 'Excellent' : processingTime < 100 ? 'Good' : 'Acceptable',
            memoryEfficiency: 'Mock objects used minimal memory',
            protocolCompliance: 'HTTP/1.1 standards followed'
        };
        
        // Include troubleshooting information and debugging assistance for test failures
        if (responseData.statusCode >= 400) {
            simulationResults.educational.troubleshooting = {
                statusCodeMeaning: responseData.statusCode === 404 ? 'Resource not found' : 
                                  responseData.statusCode === 405 ? 'Method not allowed' :
                                  responseData.statusCode >= 500 ? 'Server error' : 'Client error',
                commonCauses: [
                    'Check request URL path',
                    'Verify HTTP method',
                    'Review request headers',
                    'Examine server implementation'
                ],
                debuggingSteps: [
                    'Check spy method calls',
                    'Review performance metrics',
                    'Examine request/response data',
                    'Validate educational context'
                ]
            };
        }
        
        // Return comprehensive simulation results for test validation and educational purposes
        return simulationResults;
        
    } catch (error) {
        // Capture any errors or exceptions during request processing simulation
        const processingTime = Date.now() - performanceStart;
        
        return {
            success: false,
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name
            },
            performance: {
                processingTime,
                failureTime: Date.now() - simulationContext.startTime
            },
            educational: {
                context: simulationContext,
                errorLearning: [
                    'Request processing encountered an error',
                    'Error handling demonstrates exception management',
                    'Debugging information captured for learning',
                    'Error recovery strategies can be implemented'
                ],
                troubleshooting: {
                    errorType: error.name || 'Unknown Error',
                    debuggingSteps: [
                        'Review error message and stack trace',
                        'Check request handler implementation',
                        'Verify mock object configuration',
                        'Examine test setup and context'
                    ]
                }
            }
        };
    }
}

/**
 * Factory function that creates matched HTTP request and response mock objects with
 * coordinated behavior, spy tracking, and educational context for comprehensive
 * HTTP component testing.
 * 
 * @param {Object} requestOptions - Configuration for the mock request object properties and behavior
 * @param {Object} responseOptions - Configuration for the mock response object properties and spy tracking
 * @returns {Object} Object containing matched request and response mock objects with coordinated behavior and testing utilities
 */
function createRequestResponsePair(requestOptions = {}, responseOptions = {}) {
    // Create mock request object using createMockRequest with provided options
    const mockRequest = createMockRequest({
        url: requestOptions.url || '/hello',
        method: requestOptions.method || 'GET',
        headers: requestOptions.headers || {},
        educational: {
            mockType: 'Paired HTTP Request',
            pairContext: 'Request-response coordination',
            ...requestOptions.educational
        },
        ...requestOptions
    });
    
    // Create mock response object using createMockResponse with provided options
    const mockResponse = createMockResponse({
        statusCode: responseOptions.statusCode || OK,
        headers: responseOptions.headers || {},
        educational: {
            mockType: 'Paired HTTP Response',
            pairContext: 'Request-response coordination',
            expectedContent: responseOptions.expectedContent || HELLO_WORLD.split(' - ')[0],
            ...responseOptions.educational
        },
        ...responseOptions
    });
    
    // Configure request-response coordination for realistic HTTP interaction simulation
    const coordinationId = `pair_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    mockRequest.coordinationId = coordinationId;
    mockResponse.coordinationId = coordinationId;
    
    // Set up shared context between request and response objects for testing
    const sharedContext = {
        coordinationId,
        createdAt: new Date().toISOString(),
        testScenario: requestOptions.testScenario || responseOptions.testScenario || 'Request-response pair testing',
        learningObjective: 'Coordinated HTTP request-response interaction testing'
    };
    
    // Add educational metadata linking request and response for tutorial demonstrations
    mockRequest.educational.pairedWith = 'HTTP Response Mock';
    mockRequest.educational.sharedContext = sharedContext;
    mockResponse.educational.pairedWith = 'HTTP Request Mock';
    mockResponse.educational.sharedContext = sharedContext;
    
    // Configure spy method coordination for comprehensive interaction testing
    const pairMetadata = {
        requestSpies: mockRequest._spyMetadata,
        responseSpies: mockResponse._spyMetadata,
        coordinatedInteractions: [],
        performanceMetrics: {
            pairCreated: Date.now(),
            requestProcessingStart: null,
            responseGenerationStart: null,
            interactionComplete: null
        }
    };
    
    // Set up performance timing coordination between request and response processing
    const originalResponseEnd = mockResponse.end;
    mockResponse.end = function(...args) {
        pairMetadata.performanceMetrics.interactionComplete = Date.now();
        const result = originalResponseEnd.apply(this, args);
        
        // Track coordinated interaction completion
        pairMetadata.coordinatedInteractions.push({
            type: 'response_end',
            timestamp: Date.now(),
            educational: 'Request-response cycle completed'
        });
        
        return result;
    };
    
    // Add validation utilities for testing request-response interaction patterns
    const validationUtilities = {
        validateCoordination: () => {
            return {
                isCoordinated: mockRequest.coordinationId === mockResponse.coordinationId,
                sharedContext: !!mockRequest.educational.sharedContext,
                timingCoordinated: pairMetadata.performanceMetrics.pairCreated > 0,
                educational: 'Coordination validation for paired objects'
            };
        },
        
        getInteractionSummary: () => {
            return {
                request: {
                    method: mockRequest.method,
                    url: mockRequest.url,
                    headers: Object.keys(mockRequest.headers).length
                },
                response: {
                    statusCode: mockResponse.statusCode,
                    headers: Object.keys(mockResponse.headers).length,
                    finished: mockResponse.finished
                },
                coordination: {
                    id: coordinationId,
                    interactions: pairMetadata.coordinatedInteractions.length,
                    performance: pairMetadata.performanceMetrics
                },
                educational: 'Summary of request-response pair interactions'
            };
        }
    };
    
    // Register request-response pair in cleanup registry for proper test teardown
    MOCK_CLEANUP_REGISTRY.push({
        type: 'request-response-pair',
        coordinationId,
        request: mockRequest,
        response: mockResponse,
        metadata: pairMetadata
    });
    
    // Return coordinated request-response pair ready for comprehensive HTTP testing
    return {
        request: mockRequest,
        response: mockResponse,
        coordination: {
            id: coordinationId,
            metadata: pairMetadata,
            utilities: validationUtilities,
            sharedContext
        },
        educational: {
            pairType: 'HTTP Request-Response Pair',
            description: 'Coordinated mock objects for comprehensive HTTP testing',
            learningObjectives: [
                'Request-response coordination understanding',
                'HTTP interaction pattern testing',
                'Spy method coordination validation',
                'Performance timing coordination'
            ]
        }
    };
}

/**
 * Cleanup utility function that resets all Jest spy calls, clears mock state,
 * and prepares mock objects for fresh testing to prevent test interference
 * and ensure clean test state between test cases.
 * 
 * @param {Array} mocks - Optional array of specific mock objects to reset, defaults to all registered mocks
 * @returns {void} No return value, performs cleanup operations on mock objects and spy functions
 */
function resetMockCalls(mocks = null) {
    // Iterate through cleanup registry to find all registered mock objects
    const mocksToReset = mocks || MOCK_CLEANUP_REGISTRY;
    
    let resetCount = 0;
    let spyResetCount = 0;
    
    for (const mock of mocksToReset) {
        if (!mock) continue;
        
        try {
            // Reset Jest spy function call histories and mock implementations
            if (mock.spies && typeof mock.spies === 'object') {
                Object.values(mock.spies).forEach(spy => {
                    if (spy && typeof spy.mockReset === 'function') {
                        spy.mockReset();
                        spyResetCount++;
                    }
                });
            }
            
            // Clear mock response headers, body content, and state tracking
            if (mock.bodyChunks) {
                mock.bodyChunks = [];
                mock._bodyLength = 0;
                mock._responseBody = '';
            }
            
            if (mock.headers && typeof mock.headers === 'object') {
                Object.keys(mock.headers).forEach(key => delete mock.headers[key]);
            }
            
            // Reset mock request properties to default values for fresh testing
            if (mock.method) {
                mock.headersSent = false;
                mock.finished = false;
                mock.writableEnded = false;
                mock.writable = true;
                mock.destroyed = false;
            }
            
            // Clear mock server state, event listeners, and connection tracking
            if (mock.listening !== undefined) {
                mock.listening = false;
                mock.closing = false;
                mock.connectionCount = 0;
                mock._connections = [];
                mock._requestCount = 0;
            }
            
            // Reset performance timing data and educational context for clean testing state
            if (mock.performanceMetrics) {
                mock.performanceMetrics = {
                    ...mock.performanceMetrics,
                    startupTime: null,
                    shutdownTime: null,
                    totalRequests: 0,
                    averageResponseTime: 0
                };
            }
            
            // Clear spy metadata
            if (mock._spyMetadata) {
                mock._spyMetadata.methodCalls = [];
                mock._spyMetadata.eventEmissions = [];
                mock._spyMetadata.connectionTracking = [];
                mock._spyMetadata.headerOperations = [];
                mock._spyMetadata.bodyOperations = [];
            }
            
            // Handle request-response pairs
            if (mock.type === 'request-response-pair') {
                if (mock.request) resetMockCalls([mock.request]);
                if (mock.response) resetMockCalls([mock.response]);
                if (mock.metadata) {
                    mock.metadata.coordinatedInteractions = [];
                    mock.metadata.performanceMetrics = {
                        pairCreated: Date.now(),
                        requestProcessingStart: null,
                        responseGenerationStart: null,
                        interactionComplete: null
                    };
                }
            }
            
            resetCount++;
            
        } catch (error) {
            console.warn(`${EDUCATIONAL_MOCK_PREFIX} Failed to reset mock:`, error.message);
        }
    }
    
    // Clear any captured console output or debugging information
    if (global.console && global.console.mockReset) {
        global.console.mockReset();
    }
    
    // Log cleanup completion with educational context about test state management
    console.log(`${EDUCATIONAL_MOCK_PREFIX} Cleanup completed: ${resetCount} mocks reset, ${spyResetCount} spies cleared`);
    console.log(`${EDUCATIONAL_MOCK_PREFIX} Test state cleaned for fresh testing environment`);
    
    // Reset global mock counters and tracking variables to default values
    MOCK_CLEANUP_REGISTRY.length = 0; // Clear registry but keep reference
}

/**
 * Validation utility function that verifies mock objects behave correctly,
 * spy methods are called appropriately, and educational testing patterns
 * are followed for comprehensive mock validation.
 * 
 * @param {Object} mockObject - Mock object to validate for proper behavior and spy method calls
 * @param {Object} expectedBehavior - Expected behavior criteria including method calls, property values, and educational context
 * @returns {Object} Validation results with success status, detailed analysis, and educational guidance for mock testing improvement
 */
function validateMockBehavior(mockObject, expectedBehavior = {}) {
    // Analyze mock object structure and verify proper interface implementation
    const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        analysis: {},
        educational: []
    };
    
    try {
        // Validate Jest spy method calls against expected behavior criteria
        if (expectedBehavior.spyCalls && mockObject.spies) {
            const spyValidation = {
                expectedCalls: expectedBehavior.spyCalls,
                actualCalls: {},
                matches: {},
                mismatches: []
            };
            
            Object.keys(expectedBehavior.spyCalls).forEach(methodName => {
                const expectedCallCount = expectedBehavior.spyCalls[methodName];
                const actualCallCount = mockObject.spies[methodName] ? 
                    mockObject.spies[methodName].mock.calls.length : 0;
                
                spyValidation.actualCalls[methodName] = actualCallCount;
                spyValidation.matches[methodName] = actualCallCount === expectedCallCount;
                
                if (actualCallCount !== expectedCallCount) {
                    validation.isValid = false;
                    validation.errors.push(
                        `Method '${methodName}' called ${actualCallCount} times, expected ${expectedCallCount}`
                    );
                    spyValidation.mismatches.push({
                        method: methodName,
                        expected: expectedCallCount,
                        actual: actualCallCount
                    });
                }
            });
            
            validation.analysis.spyValidation = spyValidation;
        }
        
        // Check mock object state tracking and property values for correctness
        if (expectedBehavior.properties && typeof expectedBehavior.properties === 'object') {
            const propertyValidation = {
                expectedProperties: expectedBehavior.properties,
                actualProperties: {},
                matches: {},
                mismatches: []
            };
            
            Object.keys(expectedBehavior.properties).forEach(propertyName => {
                const expectedValue = expectedBehavior.properties[propertyName];
                const actualValue = mockObject[propertyName];
                
                propertyValidation.actualProperties[propertyName] = actualValue;
                propertyValidation.matches[propertyName] = actualValue === expectedValue;
                
                if (actualValue !== expectedValue) {
                    validation.warnings.push(
                        `Property '${propertyName}' is ${actualValue}, expected ${expectedValue}`
                    );
                    propertyValidation.mismatches.push({
                        property: propertyName,
                        expected: expectedValue,
                        actual: actualValue
                    });
                }
            });
            
            validation.analysis.propertyValidation = propertyValidation;
        }
        
        // Verify educational context and metadata are properly maintained during testing
        if (mockObject.educational) {
            const educationalValidation = {
                hasEducationalContext: true,
                mockType: mockObject.educational.mockType || 'Unknown',
                learningContext: mockObject.educational.learning_context || 'Not specified',
                createdAt: mockObject.educational.created_at
            };
            
            validation.analysis.educationalValidation = educationalValidation;
            validation.educational.push('Educational context properly maintained');
            
            if (!mockObject.educational.mockType) {
                validation.warnings.push('Mock type not specified in educational context');
            }
        } else {
            validation.warnings.push('No educational context found');
            validation.educational.push('Consider adding educational metadata to improve learning value');
        }
        
        // Validate performance tracking and timing data accuracy in mock objects
        if (mockObject.performanceMetrics) {
            const performanceValidation = {
                hasPerformanceTracking: true,
                created: mockObject.performanceMetrics.created,
                hasTimingData: !!(mockObject.performanceMetrics.startupTime || 
                                 mockObject.performanceMetrics.headerWriteTime ||
                                 mockObject.performanceMetrics.endTime)
            };
            
            validation.analysis.performanceValidation = performanceValidation;
            validation.educational.push('Performance tracking available for educational metrics');
        }
        
        // Check cleanup registry registration and proper resource management
        const isRegistered = MOCK_CLEANUP_REGISTRY.some(mock => 
            mock === mockObject || 
            (mock.request === mockObject || mock.response === mockObject) ||
            (mock.coordinationId === mockObject.coordinationId)
        );
        
        validation.analysis.cleanupRegistration = {
            isRegistered,
            registrySize: MOCK_CLEANUP_REGISTRY.length
        };
        
        if (!isRegistered) {
            validation.warnings.push('Mock object not found in cleanup registry');
            validation.educational.push('Ensure mock objects are properly registered for cleanup');
        }
        
        // Compile validation results with detailed analysis of mock behavior
        validation.analysis.summary = {
            totalErrors: validation.errors.length,
            totalWarnings: validation.warnings.length,
            overallValid: validation.isValid,
            hasEducationalValue: !!mockObject.educational,
            hasPerformanceTracking: !!mockObject.performanceMetrics,
            isCleanupRegistered: isRegistered
        };
        
        // Include educational guidance for improving mock testing patterns
        if (validation.isValid) {
            validation.educational.push('Mock object validation passed successfully');
            validation.educational.push('All expected behaviors and patterns validated');
        } else {
            validation.educational.push('Mock object validation failed - review errors for improvement');
            validation.educational.push('Check spy method calls and property expectations');
        }
        
        validation.educational.push('Use validation results to improve mock testing quality');
        validation.educational.push('Educational context enhances learning value of testing');
        
    } catch (error) {
        validation.isValid = false;
        validation.errors.push(`Validation error: ${error.message}`);
        validation.educational.push('Validation process encountered an error - check mock object structure');
    }
    
    // Return comprehensive validation results for mock testing quality assurance
    return validation;
}

/**
 * Factory function that creates comprehensive mock testing scenarios with educational context,
 * learning objectives, and complete request-response simulation for tutorial-focused
 * testing demonstrations.
 * 
 * @param {string} scenarioType - Type of educational scenario (hello_success, method_error, not_found, server_error)
 * @param {Object} options - Configuration for educational context, learning objectives, and scenario customization
 * @returns {Object} Complete educational mock scenario with request, response, server mocks, and comprehensive learning context
 */
function createEducationalMockScenario(scenarioType, options = {}) {
    // Determine appropriate mock configuration based on educational scenario type
    let scenarioConfig = {
        description: '',
        expectedStatus: OK,
        expectedContent: HELLO_WORLD.split(' - ')[0],
        learningObjectives: [],
        concepts: [],
        requestOptions: {},
        responseOptions: {},
        serverOptions: {},
        troubleshooting: []
    };
    
    // Create realistic mock objects for the specific educational testing scenario
    switch (scenarioType.toLowerCase()) {
        case 'hello_success':
            scenarioConfig = {
                description: 'Successful GET request to /hello endpoint with proper response generation',
                expectedStatus: OK,
                expectedContent: HELLO_WORLD.split(' - ')[0],
                learningObjectives: [
                    'Understanding successful HTTP request-response cycle',
                    'Proper GET method usage and routing',
                    'HTTP 200 OK status code handling',
                    'Response content generation and delivery'
                ],
                concepts: [
                    'HTTP GET method',
                    'URL routing',
                    'Response generation',
                    'Status code handling'
                ],
                requestOptions: {
                    method: 'GET',
                    url: '/hello',
                    headers: validHeaders.standard,
                    educational: {
                        testScenario: 'Hello Success Scenario',
                        expectedOutcome: '200 OK with Hello world message'
                    }
                },
                responseOptions: {
                    statusCode: OK,
                    expectedContent: HELLO_WORLD.split(' - ')[0],
                    educational: {
                        testScenario: 'Hello Success Response',
                        learningPoints: ['Proper status code', 'Correct content type', 'Expected body content']
                    }
                },
                troubleshooting: [
                    'Verify server is running on correct port',
                    'Check request URL is exactly /hello',
                    'Ensure GET method is used',
                    'Validate response status code is 200'
                ]
            };
            break;
            
        case 'method_error':
            scenarioConfig = {
                description: 'HTTP method validation error testing with POST request to GET-only endpoint',
                expectedStatus: METHOD_NOT_ALLOWED,
                expectedContent: 'Method Not Allowed',
                learningObjectives: [
                    'Understanding HTTP method validation',
                    'Error response generation patterns',
                    'HTTP 405 Method Not Allowed handling',
                    'Proper error message formatting'
                ],
                concepts: [
                    'HTTP method validation',
                    'Error response handling',
                    'HTTP 405 status code',
                    'API endpoint restrictions'
                ],
                requestOptions: {
                    method: 'POST',
                    url: '/hello',
                    headers: validHeaders.standard,
                    educational: {
                        testScenario: 'Method Error Scenario',
                        expectedOutcome: '405 Method Not Allowed response'
                    }
                },
                responseOptions: {
                    statusCode: METHOD_NOT_ALLOWED,
                    expectedContent: 'Method Not Allowed',
                    headers: { 'allow': 'GET' },
                    educational: {
                        testScenario: 'Method Error Response',
                        learningPoints: ['HTTP 405 status code', 'Allow header with supported methods', 'Educational error message']
                    }
                },
                troubleshooting: [
                    'Change request method from POST to GET',
                    'Check API documentation for supported methods',
                    'Review Allow header in response',
                    'Understand method validation importance'
                ]
            };
            break;
            
        case 'not_found':
            scenarioConfig = {
                description: 'Resource not found error testing with request to non-existent endpoint',
                expectedStatus: NOT_FOUND,
                expectedContent: 'Not Found',
                learningObjectives: [
                    'Understanding URL routing and validation',
                    'HTTP 404 Not Found error handling',
                    'Proper error response structure',
                    'Educational error messaging'
                ],
                concepts: [
                    'URL routing',
                    'Resource discovery',
                    'HTTP 404 status code',
                    'Error handling patterns'
                ],
                requestOptions: {
                    method: 'GET',
                    url: '/nonexistent',
                    headers: validHeaders.standard,
                    educational: {
                        testScenario: 'Not Found Scenario',
                        expectedOutcome: '404 Not Found response'
                    }
                },
                responseOptions: {
                    statusCode: NOT_FOUND,
                    expectedContent: 'Not Found',
                    educational: {
                        testScenario: 'Not Found Response',
                        learningPoints: ['HTTP 404 status code', 'Clear error message', 'Helpful troubleshooting guidance']
                    }
                },
                troubleshooting: [
                    'Check URL path spelling and case sensitivity',
                    'Verify endpoint exists in application',
                    'Try /hello for the correct endpoint',
                    'Review available routes documentation'
                ]
            };
            break;
            
        case 'server_error':
            scenarioConfig = {
                description: 'Internal server error testing with simulated server-side exception',
                expectedStatus: INTERNAL_SERVER_ERROR,
                expectedContent: 'Internal Server Error',
                learningObjectives: [
                    'Understanding server error handling',
                    'HTTP 500 Internal Server Error response',
                    'Error logging and debugging practices',
                    'Graceful error recovery patterns'
                ],
                concepts: [
                    'Server error handling',
                    'Exception management',
                    'HTTP 500 status code',
                    'Error debugging'
                ],
                requestOptions: {
                    method: 'GET',
                    url: '/hello',
                    headers: validHeaders.standard,
                    educational: {
                        testScenario: 'Server Error Scenario',
                        expectedOutcome: '500 Internal Server Error response'
                    }
                },
                responseOptions: {
                    statusCode: INTERNAL_SERVER_ERROR,
                    expectedContent: 'Internal Server Error',
                    educational: {
                        testScenario: 'Server Error Response',
                        learningPoints: ['HTTP 500 status code', 'Error handling best practices', 'Server debugging guidance']
                    }
                },
                troubleshooting: [
                    'Check server logs for detailed error information',
                    'Review request handler implementation',
                    'Verify server configuration and dependencies',
                    'Test with different request patterns'
                ]
            };
            break;
            
        default:
            scenarioConfig.description = 'Default educational testing scenario';
            scenarioConfig.learningObjectives.push('Basic HTTP testing concepts');
            scenarioConfig.concepts.push('HTTP protocol fundamentals');
    }
    
    // Configure educational metadata including learning objectives and context
    const educationalMetadata = {
        scenarioType: scenarioType,
        scenarioId: `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        description: scenarioConfig.description,
        learningObjectives: scenarioConfig.learningObjectives,
        conceptsCovered: scenarioConfig.concepts,
        skillLevel: options.skillLevel || 'beginner',
        estimatedDuration: options.estimatedDuration || '5-10 minutes',
        prerequisiteKnowledge: options.prerequisiteKnowledge || [
            'Basic HTTP concepts',
            'Request-response cycle',
            'Status codes understanding'
        ],
        relatedTopics: options.relatedTopics || [
            'HTTP methods',
            'Status codes',
            'Error handling',
            'Testing patterns'
        ]
    };
    
    // Set up expected outcomes and validation criteria for educational testing
    const expectedOutcomes = {
        response: {
            statusCode: scenarioConfig.expectedStatus,
            content: scenarioConfig.expectedContent,
            headers: scenarioConfig.responseOptions.headers || {}
        },
        performance: {
            maxResponseTime: 100, // milliseconds
            expectedMemoryUsage: 'minimal',
            resourceCleanup: 'automatic'
        },
        educational: {
            conceptsDemonstrated: scenarioConfig.concepts,
            learningPointsValidated: true,
            troubleshootingGuidanceProvided: true
        }
    };
    
    // Add troubleshooting guidance and debugging assistance for learners
    const troubleshootingGuide = {
        commonIssues: scenarioConfig.troubleshooting,
        debuggingSteps: [
            'Review spy method calls for expected patterns',
            'Check mock object state and properties',
            'Validate educational context and metadata',
            'Examine performance metrics and timing'
        ],
        successCriteria: [
            'Mock objects created successfully',
            'Spy methods track interactions correctly',
            'Expected outcomes match actual results',
            'Educational context maintained throughout'
        ],
        learningResources: options.learningResources || [
            'HTTP specification documentation',
            'Node.js HTTP module guide',
            'Testing best practices',
            'Mock object patterns'
        ]
    };
    
    // Include performance expectations and educational benchmarks
    const performanceExpectations = {
        mockCreation: {
            maxTime: 10, // milliseconds
            memoryUsage: 'minimal',
            spySetup: 'automatic'
        },
        scenarioExecution: {
            maxTime: 100,
            expectedSpyCalls: {
                request: ['on', 'pipe'],
                response: ['writeHead', 'write', 'end'],
                server: ['listen', 'close']
            }
        },
        educational: {
            learningValueMaintained: true,
            contextPreserved: true,
            troubleshootingAvailable: true
        }
    };
    
    // Configure spy method expectations for comprehensive testing validation
    const spyExpectations = {
        request: {
            methodsAvailable: ['on', 'pipe'],
            eventListeners: ['data', 'end', 'error'],
            educationalTracking: true
        },
        response: {
            methodsAvailable: ['writeHead', 'write', 'end', 'setHeader', 'getHeaders'],
            headerTracking: true,
            bodyCapture: true,
            educationalTracking: true
        },
        server: {
            methodsAvailable: ['listen', 'close', 'setTimeout'],
            eventEmission: ['listening', 'request', 'close'],
            lifecycleManagement: true,
            educationalTracking: true
        }
    };
    
    // Add educational insights about HTTP concepts demonstrated in scenario
    const educationalInsights = {
        httpConcepts: scenarioConfig.concepts,
        protocolCompliance: 'HTTP/1.1 standards followed',
        testingPatterns: [
            'Mock object creation and configuration',
            'Spy method tracking and validation',
            'Request-response cycle simulation',
            'Error condition testing'
        ],
        bestPractices: [
            'Comprehensive mock object setup',
            'Educational context integration',
            'Performance awareness',
            'Proper cleanup procedures'
        ]
    };
    
    // Set up scenario execution utilities and validation helpers
    const executionUtilities = {
        createScenarioMocks: () => {
            return {
                request: createMockRequest(scenarioConfig.requestOptions),
                response: createMockResponse(scenarioConfig.responseOptions),
                server: createMockServer(scenarioConfig.serverOptions || {})
            };
        },
        
        validateScenarioExecution: (mocks) => {
            return validateMockBehavior(mocks.response, {
                properties: {
                    statusCode: scenarioConfig.expectedStatus,
                    finished: true
                },
                spyCalls: {
                    writeHead: 1,
                    write: scenarioConfig.expectedContent ? 1 : 0,
                    end: 1
                }
            });
        },
        
        getEducationalSummary: (executionResults) => {
            return {
                scenarioType: scenarioType,
                success: executionResults.success || false,
                learningObjectivesMet: scenarioConfig.learningObjectives,
                conceptsValidated: scenarioConfig.concepts,
                troubleshootingApplied: troubleshootingGuide.commonIssues.length > 0,
                educationalValue: 'High - comprehensive learning context provided'
            };
        }
    };
    
    // Return complete educational mock scenario ready for tutorial testing execution
    return {
        metadata: educationalMetadata,
        configuration: scenarioConfig,
        expectedOutcomes: expectedOutcomes,
        troubleshooting: troubleshootingGuide,
        performance: performanceExpectations,
        spyExpectations: spyExpectations,
        educational: educationalInsights,
        utilities: executionUtilities,
        
        // Convenience methods for immediate use
        createMocks: executionUtilities.createScenarioMocks,
        validate: executionUtilities.validateScenarioExecution,
        getSummary: executionUtilities.getEducationalSummary,
        
        // Scenario execution timestamp
        createdAt: new Date().toISOString(),
        version: '1.0.0'
    };
}

/**
 * Utility function that retrieves and formats Jest spy call history from mock objects
 * for debugging, validation, and educational demonstration of testing patterns and
 * mock object behavior analysis.
 * 
 * @param {Object} mockObject - Mock object to analyze for spy method call history and behavior patterns
 * @param {Object} options - Optional configuration for call history formatting and educational context inclusion
 * @returns {Object} Formatted call history with method names, arguments, return values, and educational context for analysis
 */
function getMockCallHistory(mockObject, options = {}) {
    // Extract Jest spy call history from all spy methods in mock object
    const callHistory = {
        summary: {
            totalCalls: 0,
            uniqueMethods: 0,
            timespan: null,
            analysisTimestamp: new Date().toISOString()
        },
        methodCalls: {},
        chronologicalCalls: [],
        educational: {
            purpose: 'Mock object behavior analysis for educational testing',
            insights: [],
            patterns: []
        }
    };
    
    try {
        // Format method call information including arguments and return values
        if (mockObject.spies && typeof mockObject.spies === 'object') {
            Object.keys(mockObject.spies).forEach(methodName => {
                const spy = mockObject.spies[methodName];
                if (spy && spy.mock) {
                    const methodCallData = {
                        methodName: methodName,
                        callCount: spy.mock.calls.length,
                        calls: spy.mock.calls.map((call, index) => ({
                            callIndex: index,
                            arguments: call,
                            returnValue: spy.mock.results[index]?.value,
                            timestamp: spy.mock.invocationCallOrder?.[index] || index,
                            educational: `Call ${index + 1} to ${methodName} method`
                        })),
                        lastCall: spy.mock.lastCall,
                        educational: {
                            usage: `${methodName} method called ${spy.mock.calls.length} times`,
                            pattern: spy.mock.calls.length === 0 ? 'unused' :
                                    spy.mock.calls.length === 1 ? 'single-use' : 'multiple-use'
                        }
                    };
                    
                    callHistory.methodCalls[methodName] = methodCallData;
                    callHistory.summary.totalCalls += spy.mock.calls.length;
                    
                    // Add calls to chronological list
                    spy.mock.calls.forEach((call, index) => {
                        callHistory.chronologicalCalls.push({
                            method: methodName,
                            callIndex: index,
                            arguments: call,
                            returnValue: spy.mock.results[index]?.value,
                            educational: `${methodName}(${call.map(arg => 
                                typeof arg === 'string' ? `"${arg}"` : String(arg)
                            ).join(', ')})`
                        });
                    });
                }
            });
            
            callHistory.summary.uniqueMethods = Object.keys(callHistory.methodCalls).length;
        }
        
        // Organize call history chronologically with timing information
        callHistory.chronologicalCalls.sort((a, b) => {
            return (a.timestamp || a.callIndex) - (b.timestamp || b.callIndex);
        });
        
        // Calculate timespan if timing information is available
        if (callHistory.chronologicalCalls.length > 0) {
            const firstCall = callHistory.chronologicalCalls[0];
            const lastCall = callHistory.chronologicalCalls[callHistory.chronologicalCalls.length - 1];
            if (firstCall.timestamp && lastCall.timestamp) {
                callHistory.summary.timespan = lastCall.timestamp - firstCall.timestamp;
            }
        }
        
        // Add educational context about spy method usage and testing patterns
        callHistory.educational.insights = [
            `Total spy method calls: ${callHistory.summary.totalCalls}`,
            `Unique methods called: ${callHistory.summary.uniqueMethods}`,
            `Call pattern analysis: ${callHistory.summary.totalCalls === 0 ? 'No interactions' : 
                                      callHistory.summary.totalCalls < 5 ? 'Light usage' : 'Heavy usage'}`,
            'Spy call history provides insight into mock object interaction patterns'
        ];
        
        // Include call frequency analysis and pattern recognition for educational purposes
        const frequencyAnalysis = {};
        Object.keys(callHistory.methodCalls).forEach(methodName => {
            const callCount = callHistory.methodCalls[methodName].callCount;
            frequencyAnalysis[methodName] = {
                count: callCount,
                frequency: callHistory.summary.totalCalls > 0 ? 
                          (callCount / callHistory.summary.totalCalls * 100).toFixed(1) + '%' : '0%',
                pattern: callCount === 0 ? 'unused' :
                        callCount === 1 ? 'single-call' :
                        callCount <= 3 ? 'light-usage' : 'frequent-usage'
            };
        });
        
        callHistory.analysis = {
            frequency: frequencyAnalysis,
            patterns: {
                mostCalledMethod: Object.keys(frequencyAnalysis).reduce((max, method) => 
                    frequencyAnalysis[method].count > (frequencyAnalysis[max]?.count || 0) ? method : max, 
                    null
                ),
                unusedMethods: Object.keys(frequencyAnalysis).filter(method => 
                    frequencyAnalysis[method].count === 0
                ),
                singleUseMethods: Object.keys(frequencyAnalysis).filter(method => 
                    frequencyAnalysis[method].count === 1
                )
            }
        };
        
        // Format call history for easy reading and debugging assistance
        if (options.includeFormatted !== false) {
            callHistory.formatted = {
                summary: `Mock Object Call History - ${callHistory.summary.totalCalls} total calls across ${callHistory.summary.uniqueMethods} methods`,
                methods: Object.keys(callHistory.methodCalls).map(methodName => {
                    const methodData = callHistory.methodCalls[methodName];
                    return `${methodName}: ${methodData.callCount} calls - ${methodData.educational.pattern}`;
                }).join('\n'),
                chronological: callHistory.chronologicalCalls.map((call, index) => 
                    `${index + 1}. ${call.educational}`
                ).join('\n')
            };
        }
        
        // Add troubleshooting guidance for common mock testing issues
        callHistory.troubleshooting = {
            commonIssues: [],
            debuggingTips: [
                'Check if expected methods were called',
                'Verify call arguments match expectations',
                'Review call frequency patterns',
                'Examine chronological order of calls'
            ]
        };
        
        if (callHistory.summary.totalCalls === 0) {
            callHistory.troubleshooting.commonIssues.push('No spy methods called - check if mock object is being used');
        }
        
        if (callHistory.analysis.patterns.unusedMethods.length > 0) {
            callHistory.troubleshooting.commonIssues.push(
                `Unused methods detected: ${callHistory.analysis.patterns.unusedMethods.join(', ')}`
            );
        }
        
    } catch (error) {
        callHistory.error = {
            message: error.message,
            educational: 'Call history analysis encountered an error - check mock object structure'
        };
        callHistory.educational.insights.push('Error occurred during call history analysis');
    }
    
    // Return comprehensive call history analysis for educational testing validation
    return callHistory;
}

/**
 * Verification utility function that validates expected interactions occurred between
 * mock objects, providing comprehensive assertion capabilities and educational context
 * for mock testing validation.
 * 
 * @param {Object} mocks - Object containing mock objects to verify for expected interactions
 * @param {Object} expectations - Expected interaction patterns and validation criteria
 * @returns {Object} Verification results with success status, detailed analysis, and educational feedback for mock interaction testing
 */
function verifyMockInteractions(mocks, expectations = {}) {
    // Analyze mock object interactions and spy method call patterns
    const verification = {
        success: true,
        results: {},
        summary: {
            totalMocks: 0,
            passedVerifications: 0,
            failedVerifications: 0,
            totalExpectations: 0
        },
        interactions: [],
        educational: {
            purpose: 'Mock object interaction verification for educational testing',
            insights: [],
            recommendations: []
        },
        timestamp: new Date().toISOString()
    };
    
    try {
        // Verify expected method calls occurred with correct arguments and timing
        if (mocks && typeof mocks === 'object') {
            verification.summary.totalMocks = Object.keys(mocks).length;
            
            Object.keys(mocks).forEach(mockName => {
                const mock = mocks[mockName];
                const mockExpectations = expectations[mockName] || {};
                
                const mockVerification = {
                    mockName: mockName,
                    expectations: mockExpectations,
                    results: {},
                    passed: true,
                    educational: {
                        mockType: mock.educational?.mockType || 'Unknown Mock Type',
                        description: mock.educational?.description || 'Mock object verification'
                    }
                };
                
                // Verify spy method calls
                if (mockExpectations.spyCalls && mock.spies) {
                    Object.keys(mockExpectations.spyCalls).forEach(methodName => {
                        const expectedCalls = mockExpectations.spyCalls[methodName];
                        const spy = mock.spies[methodName];
                        const actualCalls = spy ? spy.mock.calls.length : 0;
                        
                        const callVerification = {
                            method: methodName,
                            expected: expectedCalls,
                            actual: actualCalls,
                            passed: actualCalls === expectedCalls,
                            educational: `${methodName} method: expected ${expectedCalls}, actual ${actualCalls}`
                        };
                        
                        mockVerification.results[methodName] = callVerification;
                        verification.summary.totalExpectations++;
                        
                        if (callVerification.passed) {
                            verification.summary.passedVerifications++;
                        } else {
                            verification.summary.failedVerifications++;
                            mockVerification.passed = false;
                            verification.success = false;
                        }
                        
                        // Verify call arguments if specified
                        if (mockExpectations.callArguments && mockExpectations.callArguments[methodName] && spy) {
                            const expectedArgs = mockExpectations.callArguments[methodName];
                            spy.mock.calls.forEach((actualCallArgs, callIndex) => {
                                if (expectedArgs[callIndex]) {
                                    const argsMatch = JSON.stringify(actualCallArgs) === JSON.stringify(expectedArgs[callIndex]);
                                    if (!argsMatch) {
                                        mockVerification.passed = false;
                                        verification.success = false;
                                        callVerification.argumentMismatch = {
                                            call: callIndex,
                                            expected: expectedArgs[callIndex],
                                            actual: actualCallArgs
                                        };
                                    }
                                }
                            });
                        }
                    });
                }
                
                // Check mock object state changes and property updates during interactions
                if (mockExpectations.properties) {
                    Object.keys(mockExpectations.properties).forEach(propertyName => {
                        const expectedValue = mockExpectations.properties[propertyName];
                        const actualValue = mock[propertyName];
                        
                        const propertyVerification = {
                            property: propertyName,
                            expected: expectedValue,
                            actual: actualValue,
                            passed: actualValue === expectedValue,
                            educational: `${propertyName} property: expected ${expectedValue}, actual ${actualValue}`
                        };
                        
                        mockVerification.results[propertyName] = propertyVerification;
                        verification.summary.totalExpectations++;
                        
                        if (propertyVerification.passed) {
                            verification.summary.passedVerifications++;
                        } else {
                            verification.summary.failedVerifications++;
                            mockVerification.passed = false;
                            verification.success = false;
                        }
                    });
                }
                
                // Validate request-response coordination and HTTP protocol simulation accuracy
                if (mock.coordinationId && mockExpectations.coordination) {
                    const coordinationVerification = {
                        hasCoordinationId: !!mock.coordinationId,
                        coordinationExpected: !!mockExpectations.coordination,
                        passed: !!mock.coordinationId === !!mockExpectations.coordination,
                        educational: 'Request-response coordination verification'
                    };
                    
                    mockVerification.results.coordination = coordinationVerification;
                    verification.summary.totalExpectations++;
                    
                    if (coordinationVerification.passed) {
                        verification.summary.passedVerifications++;
                    } else {
                        verification.summary.failedVerifications++;
                        mockVerification.passed = false;
                        verification.success = false;
                    }
                }
                
                verification.results[mockName] = mockVerification;
                
                // Track interactions for analysis
                verification.interactions.push({
                    mockName: mockName,
                    mockType: mock.educational?.mockType,
                    interactionCount: Object.keys(mockVerification.results).length,
                    passed: mockVerification.passed,
                    educational: mockVerification.educational
                });
            });
        }
        
        // Verify educational context maintenance throughout mock interactions
        const educationalContextVerification = {
            mocksWithEducationalContext: 0,
            totalMocks: verification.summary.totalMocks,
            percentage: 0
        };
        
        Object.values(mocks).forEach(mock => {
            if (mock.educational) {
                educationalContextVerification.mocksWithEducationalContext++;
            }
        });
        
        educationalContextVerification.percentage = verification.summary.totalMocks > 0 ?
            (educationalContextVerification.mocksWithEducationalContext / verification.summary.totalMocks * 100).toFixed(1) + '%' : '0%';
        
        verification.educational.contextVerification = educationalContextVerification;
        
        // Check performance tracking and timing accuracy during mock object usage
        const performanceVerification = {
            mocksWithPerformanceTracking: 0,
            totalMocks: verification.summary.totalMocks,
            averageCreationTime: 0,
            timingDataAvailable: false
        };
        
        let totalCreationTime = 0;
        let mocksWithTiming = 0;
        
        Object.values(mocks).forEach(mock => {
            if (mock.performanceMetrics) {
                performanceVerification.mocksWithPerformanceTracking++;
                if (mock.performanceMetrics.created) {
                    totalCreationTime += Date.now() - mock.performanceMetrics.created;
                    mocksWithTiming++;
                }
            }
        });
        
        if (mocksWithTiming > 0) {
            performanceVerification.averageCreationTime = Math.round(totalCreationTime / mocksWithTiming);
            performanceVerification.timingDataAvailable = true;
        }
        
        verification.performance = performanceVerification;
        
        // Compile comprehensive verification results with detailed interaction analysis
        verification.summary.successRate = verification.summary.totalExpectations > 0 ?
            (verification.summary.passedVerifications / verification.summary.totalExpectations * 100).toFixed(1) + '%' : '0%';
        
        verification.analysis = {
            overallSuccess: verification.success,
            verificationDetails: verification.results,
            interactionSummary: verification.interactions,
            educationalValue: educationalContextVerification.percentage,
            performanceInsights: performanceVerification.timingDataAvailable
        };
        
        // Include educational feedback about mock testing patterns and best practices
        verification.educational.insights = [
            `Verification completed for ${verification.summary.totalMocks} mock objects`,
            `${verification.summary.passedVerifications}/${verification.summary.totalExpectations} expectations met (${verification.summary.successRate})`,
            `Educational context present in ${educationalContextVerification.percentage} of mocks`,
            verification.success ? 'All mock interactions verified successfully' : 'Some verification failures detected'
        ];
        
        verification.educational.recommendations = [];
        
        if (!verification.success) {
            verification.educational.recommendations.push('Review failed verifications and adjust expectations or mock behavior');
        }
        
        if (educationalContextVerification.percentage !== '100%') {
            verification.educational.recommendations.push('Add educational context to all mock objects for better learning value');
        }
        
        if (!performanceVerification.timingDataAvailable) {
            verification.educational.recommendations.push('Consider adding performance tracking for educational timing insights');
        }
        
        verification.educational.recommendations.push('Use verification results to improve mock testing patterns and educational value');
        
        // Add best practices guidance
        verification.educational.bestPractices = [
            'Set clear expectations for all mock interactions',
            'Include educational context in all mock objects',
            'Track performance metrics for learning insights',
            'Verify both positive and negative test scenarios',
            'Use verification results to improve testing patterns'
        ];
        
    } catch (error) {
        verification.success = false;
        verification.error = {
            message: error.message,
            stack: error.stack,
            educational: 'Mock interaction verification encountered an error'
        };
        
        verification.educational.insights.push('Verification process failed - check mock object structure and expectations');
        verification.educational.recommendations.push('Debug verification error and ensure proper mock object setup');
    }
    
    // Return verification results for educational mock testing quality assurance
    return verification;
}

// =============================================================================
// MOCK UTILITIES CONFIGURATION OBJECT
// =============================================================================

/**
 * Configuration constants and utilities for mock object creation and customization
 * Provides default options, educational settings, and utility functions for comprehensive mock testing
 */
const MOCK_UTILITIES = {
    // Default configuration options for request mock creation
    DEFAULT_REQUEST_OPTIONS: {
        method: 'GET',
        url: '/hello',
        headers: validHeaders.standard,
        httpVersion: '1.1',
        readable: true,
        complete: true,
        educational: {
            mockType: 'HTTP Request Mock',
            learningContext: 'Request processing simulation'
        }
    },
    
    // Default configuration options for response mock creation
    DEFAULT_RESPONSE_OPTIONS: {
        statusCode: OK,
        headers: {},
        headersSent: false,
        finished: false,
        writableEnded: false,
        educational: {
            mockType: 'HTTP Response Mock',
            learningContext: 'Response generation simulation'
        }
    },
    
    // Educational settings for enhanced learning experience
    EDUCATIONAL_SETTINGS: {
        enableVerboseLogging: true,
        includePerformanceMetrics: true,
        addTroubleshootingGuidance: true,
        maintainEducationalContext: true,
        provideLearningInsights: true,
        trackSpyInteractions: true,
        enableScenarioGeneration: true,
        supportProgressiveComplexity: true
    }
};

// =============================================================================
// MODULE EXPORTS
// =============================================================================

module.exports = {
    // Factory functions for creating mock objects
    createMockRequest,
    createMockResponse,
    createMockServer,
    simulateRequest,
    createRequestResponsePair,
    
    // Utility functions for mock management and validation
    resetMockCalls,
    validateMockBehavior,
    createEducationalMockScenario,
    getMockCallHistory,
    verifyMockInteractions,
    
    // Mock classes for advanced usage
    MockHttpRequest,
    MockHttpResponse,
    MockHttpServer,
    
    // Configuration constants and utilities
    MOCK_UTILITIES,
    
    // Global constants and registries
    MOCK_REQUEST_DEFAULTS,
    MOCK_RESPONSE_DEFAULTS,
    MOCK_CLEANUP_REGISTRY,
    EDUCATIONAL_MOCK_PREFIX
};