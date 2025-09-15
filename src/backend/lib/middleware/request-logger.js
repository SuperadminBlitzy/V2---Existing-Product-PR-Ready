/**
 * Node.js Tutorial HTTP Request Logging Middleware Module
 * 
 * This module provides comprehensive request and response logging functionality for the Node.js tutorial
 * application. It implements educational HTTP logging middleware that captures and logs incoming HTTP
 * requests with method, URL, headers, timing information, and response details while providing
 * educational context about HTTP communication patterns and troubleshooting guidance.
 * 
 * Educational Features:
 * - Comprehensive request/response lifecycle logging with educational context and timing measurement
 * - Educational HTTP protocol explanations and troubleshooting guidance integrated into log messages
 * - Performance timing measurement and benchmarking with high-resolution timers for learning
 * - Request correlation tracking across the complete request-response cycle for educational demonstration
 * - HTTP status code categorization and educational explanations for different response types
 * - Troubleshooting assistance and debugging guidance for common HTTP communication issues
 * - Tutorial-specific formatting and educational prefixes for enhanced learning visibility
 * 
 * Integration Points:
 * - Used by http-server.js as middleware for comprehensive request/response logging throughout server operation
 * - Integrates with request-router.js for logging routing decisions and URL matching patterns
 * - Works with logger.js for structured educational logging with consistent formatting and context
 * - Uses app-config.js for logging configuration and educational settings management
 * - Supports error-middleware.js with request context for error logging and troubleshooting
 * - Provides logging context to hello-handler.js for endpoint-specific request tracking
 * 
 * Performance Considerations:
 * - Designed for minimal performance impact while providing comprehensive educational logging
 * - Uses high-resolution timers efficiently to minimize performance measurement overhead
 * - Supports log level configuration to balance educational detail with performance requirements
 * - Avoids excessive memory allocation while maintaining educational features and request context
 * - Balances comprehensive educational logging with reasonable performance for tutorial environments
 */

// Node.js built-in modules for URL parsing and high-resolution timing - Node.js Built-in
const { URL } = require('node:url');
const process = require('node:process');

// Import comprehensive educational logging functionality from utils/logger.js
const {
    logger,
    info,
    debug,
    warn,
    error,
    startTimer,
    endTimer,
    logRequest,
    logResponse
} = require('../utils/logger.js');

// Import application configuration for logging settings, educational options, and environment behavior
const { appConfig } = require('../config/app-config.js');

// Import HTTP status code constants and utility functions for educational status code categorization
const {
    HTTP_STATUS,
    isSuccessStatus,
    isClientErrorStatus,
    getStatusCodeDescription
} = require('../constants/http-status-codes.js');

// =============================================================================
// GLOBAL CONSTANTS AND CONFIGURATION
// =============================================================================

/**
 * Educational middleware prefix for consistent identification in all log messages
 * Educational Note: Consistent prefixing helps identify middleware-specific logs
 * and provides clear educational context for request logging functionality
 */
const MIDDLEWARE_PREFIX = '[Request Logger]';

/**
 * Global request counter for educational tracking of request volume and patterns
 * Educational Note: Request counting demonstrates server usage patterns and provides
 * educational context about request volume in web applications
 */
let REQUEST_COUNTER = 0;

/**
 * Performance timing thresholds for educational benchmarking and performance awareness
 * Educational Note: Performance thresholds help students understand typical response
 * time expectations and identify optimization opportunities in web applications
 */
const PERFORMANCE_THRESHOLDS = {
    fast: 50,      // Excellent performance - under 50ms response time
    normal: 100,   // Good performance - under 100ms response time  
    slow: 200      // Slow performance - over 200ms may need optimization
};

/**
 * Educational timing enablement flag for performance measurement features
 * Educational Note: Timing features demonstrate performance monitoring concepts
 * and provide educational context about request processing performance
 */
const EDUCATIONAL_TIMING_ENABLED = true;

// Extract configuration values with safe fallbacks for educational operation
const loggingConfig = appConfig?.logging || {};
const educationalConfig = appConfig?.educational || {};
const environmentConfig = appConfig?.environment || 'development';

// =============================================================================
// REQUEST LOGGING CONFIGURATION OBJECT
// =============================================================================

/**
 * Comprehensive request logging configuration object with educational features and performance settings
 * Educational Note: Configuration objects demonstrate best practices for managing complex
 * middleware settings and providing customizable educational features
 */
const REQUEST_LOGGING_CONFIG = {
    // Enable performance timing measurement for educational demonstration of response time monitoring
    enableTiming: loggingConfig?.request?.enabled !== false,
    
    // Include HTTP headers in request logging for educational protocol demonstration
    includeHeaders: educationalConfig?.logging?.verboseMode || environmentConfig === 'educational',
    
    // Educational mode enables enhanced logging features and troubleshooting guidance
    educationalMode: educationalConfig?.tutorial?.mode || environmentConfig === 'educational',
    
    // Performance monitoring thresholds for educational benchmarking and optimization awareness
    performanceThresholds: {
        fast: PERFORMANCE_THRESHOLDS.fast,
        normal: PERFORMANCE_THRESHOLDS.normal,
        slow: PERFORMANCE_THRESHOLDS.slow
    },
    
    // Request correlation settings for educational request lifecycle tracking
    correlation: {
        enabled: true,
        generateRequestId: true,
        trackTiming: EDUCATIONAL_TIMING_ENABLED
    },
    
    // Educational context settings for enhanced learning experience
    educational: {
        showHttpProtocolInfo: educationalConfig?.logging?.demonstratePatterns || false,
        includeTroubleshootingTips: educationalConfig?.errors?.includeTroubleshootingTips || false,
        displayPerformanceBenchmarks: educationalConfig?.performance?.showTimingInfo || false,
        enableDebuggingGuidance: educationalConfig?.debugging?.verboseDebugging || false
    },
    
    // Log level configuration for different request types and educational verbosity
    logLevels: {
        successfulRequests: 'info',
        clientErrors: 'warn',
        serverErrors: 'error',
        debugRequests: 'debug'
    }
};

// =============================================================================
// UTILITY FUNCTIONS FOR REQUEST PROCESSING
// =============================================================================

/**
 * Generates unique request identifier for correlation tracking across log entries, enabling
 * educational demonstration of request lifecycle tracking and distributed logging concepts
 * 
 * Educational Note: Request correlation demonstrates how to track individual requests
 * through complex systems and provides learning opportunities about logging best practices
 * 
 * @param {object} req - HTTP request object for extracting connection and timing information
 * @returns {string} Unique request identifier combining timestamp and counter for educational correlation
 */
function generateRequestId(req) {
    // Increment global request counter for educational volume tracking
    REQUEST_COUNTER++;
    
    // Generate high-resolution timestamp for request uniqueness and timing correlation
    const timestamp = Date.now();
    const hrtime = process.hrtime.bigint();
    
    // Extract client connection information for enhanced request correlation
    const clientInfo = {
        remoteAddress: req.socket?.remoteAddress?.replace(/^::ffff:/, '') || 'unknown',
        remotePort: req.socket?.remotePort || 'unknown'
    };
    
    // Create readable request identifier with educational prefix for clarity
    const requestId = `req_${timestamp}_${REQUEST_COUNTER}_${hrtime.toString().slice(-6)}`;
    
    // Add educational context about request identification and correlation
    if (REQUEST_LOGGING_CONFIG.educationalMode) {
        debug(`${MIDDLEWARE_PREFIX} Generated request ID: ${requestId}`, {
            requestNumber: REQUEST_COUNTER,
            clientAddress: clientInfo.remoteAddress,
            educationalNote: 'Request IDs enable tracking individual requests through system components'
        });
    }
    
    // Return unique request identifier for use throughout request lifecycle
    return requestId;
}

/**
 * Parses and categorizes HTTP request headers for educational logging, extracting relevant
 * headers like User-Agent, Content-Type, and Accept while providing educational context
 * about HTTP header usage patterns and protocol communication
 * 
 * Educational Note: Header parsing demonstrates HTTP protocol internals and helps students
 * understand how browsers and clients communicate requirements to servers
 * 
 * @param {object} headers - HTTP headers object from request containing client-sent headers
 * @param {object} options - Optional parsing configuration including educational detail level
 * @returns {object} Parsed headers object with educational categorization and descriptions
 */
function parseRequestHeaders(headers, options = {}) {
    // Initialize parsed headers object with educational categorization
    const parsedHeaders = {
        essential: {},
        content: {},
        client: {},
        caching: {},
        security: {},
        educational: {}
    };
    
    // Extract and categorize essential HTTP headers for educational demonstration
    if (headers.host) {
        parsedHeaders.essential.host = headers.host;
        parsedHeaders.educational.hostExplanation = 'Host header specifies the domain name of the server';
    }
    
    if (headers.connection) {
        parsedHeaders.essential.connection = headers.connection;
        parsedHeaders.educational.connectionExplanation = 'Connection header controls connection persistence';
    }
    
    // Extract content negotiation headers for educational HTTP protocol demonstration
    if (headers.accept) {
        parsedHeaders.content.accept = headers.accept;
        parsedHeaders.educational.acceptExplanation = 'Accept header specifies preferred response content types';
    }
    
    if (headers['content-type']) {
        parsedHeaders.content.contentType = headers['content-type'];
        parsedHeaders.educational.contentTypeExplanation = 'Content-Type specifies the media type of request body';
    }
    
    if (headers['content-length']) {
        parsedHeaders.content.contentLength = headers['content-length'];
        parsedHeaders.educational.contentLengthExplanation = 'Content-Length specifies the size of request body';
    }
    
    // Extract client identification headers for educational browser/client analysis
    if (headers['user-agent']) {
        // Truncate user agent for readability while preserving educational value
        const userAgent = headers['user-agent'];
        parsedHeaders.client.userAgent = userAgent.length > 100 
            ? userAgent.substring(0, 100) + '...' 
            : userAgent;
        parsedHeaders.educational.userAgentExplanation = 'User-Agent identifies the client software making the request';
    }
    
    if (headers.referer) {
        parsedHeaders.client.referer = headers.referer;
        parsedHeaders.educational.refererExplanation = 'Referer header indicates the URL that linked to this resource';
    }
    
    // Extract caching headers for educational cache behavior demonstration
    if (headers['cache-control']) {
        parsedHeaders.caching.cacheControl = headers['cache-control'];
        parsedHeaders.educational.cacheControlExplanation = 'Cache-Control directives manage caching behavior';
    }
    
    if (headers['if-modified-since']) {
        parsedHeaders.caching.ifModifiedSince = headers['if-modified-since'];
        parsedHeaders.educational.ifModifiedSinceExplanation = 'If-Modified-Since enables conditional requests';
    }
    
    // Extract security-related headers for educational security awareness
    if (headers.origin) {
        parsedHeaders.security.origin = headers.origin;
        parsedHeaders.educational.originExplanation = 'Origin header important for CORS and security policies';
    }
    
    // Add educational summary about header categories and their purposes
    parsedHeaders.educational.summary = {
        totalHeaders: Object.keys(headers).length,
        essentialHeaders: Object.keys(parsedHeaders.essential).length,
        contentHeaders: Object.keys(parsedHeaders.content).length,
        clientHeaders: Object.keys(parsedHeaders.client).length,
        learningNote: 'HTTP headers communicate metadata between client and server'
    };
    
    // Include troubleshooting guidance for common header-related issues
    if (REQUEST_LOGGING_CONFIG.educational.includeTroubleshootingTips) {
        parsedHeaders.educational.troubleshooting = [
            'Missing Host header indicates HTTP/1.0 client or malformed request',
            'Large User-Agent strings may indicate automated tools or outdated browsers',
            'Missing Accept header suggests non-browser client or custom application',
            'Unusual header combinations may indicate security testing or misconfigured clients'
        ];
    }
    
    // Return comprehensive parsed headers object with educational context
    return parsedHeaders;
}

/**
 * Determines appropriate log level for request/response logging based on status code, 
 * performance, and educational configuration to provide appropriate logging detail
 * for different scenarios and learning objectives
 * 
 * Educational Note: Dynamic log level determination demonstrates intelligent logging
 * strategies and helps students understand when different verbosity levels are appropriate
 * 
 * @param {number} statusCode - HTTP response status code for log level determination
 * @param {number} duration - Request processing duration in milliseconds
 * @param {object} config - Logging configuration with educational settings and preferences
 * @returns {string} Appropriate log level (debug, info, warn, error) based on response characteristics
 */
function determineLogLevel(statusCode, duration, config = REQUEST_LOGGING_CONFIG) {
    // Check for server errors requiring error-level logging
    if (statusCode >= 500) {
        return config.logLevels.serverErrors; // 'error'
    }
    
    // Check for client errors requiring warning-level logging
    if (isClientErrorStatus(statusCode)) {
        return config.logLevels.clientErrors; // 'warn'
    }
    
    // Consider performance impact on log level for educational awareness
    if (duration > PERFORMANCE_THRESHOLDS.slow) {
        // Slow requests deserve warning attention for educational performance awareness
        return 'warn';
    }
    
    // Check for successful responses with standard info logging
    if (isSuccessStatus(statusCode)) {
        // Educational mode may enhance successful request logging for learning
        if (config.educationalMode && duration < PERFORMANCE_THRESHOLDS.fast) {
            return 'info'; // Highlight fast successful responses
        }
        return config.logLevels.successfulRequests; // 'info'
    }
    
    // Default to info level for unclassified status codes
    return 'info';
}

/**
 * Formats educational context information for request/response logging including learning tips,
 * HTTP protocol explanations, and troubleshooting guidance tailored to tutorial learning objectives
 * 
 * Educational Note: Educational context enhances learning by providing explanations,
 * examples, and troubleshooting guidance that help students understand HTTP protocols
 * 
 * @param {object} req - HTTP request object for extracting educational context
 * @param {object} res - Optional HTTP response object for response-specific educational content
 * @param {object} timing - Timing information for performance educational context
 * @returns {object} Educational context object with learning tips and troubleshooting guidance
 */
function formatEducationalContext(req, res = null, timing = {}) {
    // Initialize educational context with basic HTTP request information
    const educationalContext = {
        httpMethod: {
            method: req.method,
            explanation: getHttpMethodExplanation(req.method),
            commonUsage: getHttpMethodUsage(req.method)
        },
        urlAnalysis: {
            fullUrl: req.url,
            components: analyzeUrlComponents(req.url, req.headers.host),
            explanation: 'URL components help understand client request intentions'
        },
        timing: {
            duration: timing.duration || 0,
            performanceCategory: categorizePerformance(timing.duration || 0),
            optimizationTips: getPerformanceOptimizationTips(timing.duration || 0)
        }
    };
    
    // Add response-specific educational context if response object provided
    if (res && res.statusCode) {
        educationalContext.response = {
            statusCode: res.statusCode,
            statusCategory: getStatusCategory(res.statusCode),
            statusExplanation: getStatusCodeDescription(res.statusCode),
            troubleshooting: getStatusCodeTroubleshooting(res.statusCode)
        };
    }
    
    // Include HTTP protocol educational information
    if (REQUEST_LOGGING_CONFIG.educational.showHttpProtocolInfo) {
        educationalContext.httpProtocol = {
            version: req.httpVersion || '1.1',
            explanation: 'HTTP version indicates protocol capabilities and features',
            headers: {
                count: Object.keys(req.headers).length,
                significance: 'Headers provide metadata about the request and client capabilities'
            }
        };
    }
    
    // Add performance benchmarking information for educational awareness
    if (REQUEST_LOGGING_CONFIG.educational.displayPerformanceBenchmarks && timing.duration) {
        educationalContext.performanceBenchmarks = {
            currentTiming: timing.duration,
            benchmark: getBenchmarkComparison(timing.duration),
            expectations: {
                excellent: `< ${PERFORMANCE_THRESHOLDS.fast}ms`,
                good: `< ${PERFORMANCE_THRESHOLDS.normal}ms`,
                needsAttention: `> ${PERFORMANCE_THRESHOLDS.slow}ms`
            }
        };
    }
    
    // Include troubleshooting guidance for educational problem-solving skills
    if (REQUEST_LOGGING_CONFIG.educational.includeTroubleshootingTips) {
        educationalContext.troubleshooting = {
            commonIssues: getCommonRequestIssues(req),
            debuggingTips: getDebuggingTips(req, res),
            learningResources: [
                'Review HTTP method specifications for proper usage',
                'Check browser developer tools for request/response details',
                'Use curl -v command for verbose HTTP request analysis',
                'Monitor server logs for patterns and performance trends'
            ]
        };
    }
    
    // Return comprehensive educational context for enhanced learning
    return educationalContext;
}

// =============================================================================
// HELPER FUNCTIONS FOR EDUCATIONAL CONTEXT
// =============================================================================

/**
 * Educational helper function to explain HTTP method usage and patterns
 */
function getHttpMethodExplanation(method) {
    const explanations = {
        'GET': 'Retrieves data from server without modifying resources - safe and idempotent',
        'POST': 'Submits data to server, often causing state changes - not idempotent',
        'PUT': 'Updates or creates resources with complete replacement - idempotent',
        'DELETE': 'Removes specified resources from server - idempotent',
        'HEAD': 'Like GET but returns only headers without response body',
        'OPTIONS': 'Returns allowed methods and server capabilities for resource'
    };
    return explanations[method] || `${method} is a non-standard or custom HTTP method`;
}

/**
 * Educational helper function to describe common HTTP method usage patterns
 */
function getHttpMethodUsage(method) {
    const usagePatterns = {
        'GET': 'Loading web pages, fetching API data, retrieving resources',
        'POST': 'Form submissions, creating new resources, uploading data',
        'PUT': 'Updating existing resources, uploading files with known names',
        'DELETE': 'Removing resources, clearing cached data',
        'HEAD': 'Checking resource existence, validating cache freshness',
        'OPTIONS': 'CORS preflight requests, API capability discovery'
    };
    return usagePatterns[method] || 'Custom application-specific operations';
}

/**
 * Educational helper function to analyze URL components for learning
 */
function analyzeUrlComponents(url, host) {
    try {
        const fullUrl = new URL(url, `http://${host || 'localhost'}`);
        return {
            protocol: fullUrl.protocol,
            hostname: fullUrl.hostname,
            port: fullUrl.port || '80',
            pathname: fullUrl.pathname,
            search: fullUrl.search,
            hash: fullUrl.hash
        };
    } catch (error) {
        return {
            pathname: url,
            error: 'Unable to parse full URL components',
            suggestion: 'Check URL format and host header'
        };
    }
}

/**
 * Educational helper function to categorize response performance
 */
function categorizePerformance(duration) {
    if (duration < PERFORMANCE_THRESHOLDS.fast) return 'Excellent';
    if (duration < PERFORMANCE_THRESHOLDS.normal) return 'Good';
    if (duration < PERFORMANCE_THRESHOLDS.slow) return 'Acceptable';
    return 'Needs Optimization';
}

/**
 * Educational helper function to provide performance optimization tips
 */
function getPerformanceOptimizationTips(duration) {
    if (duration > PERFORMANCE_THRESHOLDS.slow) {
        return [
            'Check for blocking operations in request processing',
            'Consider caching strategies for repeated requests',
            'Review database queries and external API calls',
            'Monitor server resource usage and optimize bottlenecks'
        ];
    } else if (duration < PERFORMANCE_THRESHOLDS.fast) {
        return [
            'Excellent response time - maintain current optimization level',
            'Consider this as benchmark for other endpoints',
            'Document successful optimization strategies for reuse'
        ];
    }
    return [
        'Good performance - monitor trends for consistency',
        'Consider minor optimizations for improved user experience'
    ];
}

/**
 * Educational helper function to get status code category for learning
 */
function getStatusCategory(statusCode) {
    if (isSuccessStatus(statusCode)) return 'Success (2xx)';
    if (isClientErrorStatus(statusCode)) return 'Client Error (4xx)';
    if (statusCode >= 500) return 'Server Error (5xx)';
    return 'Other/Informational';
}

/**
 * Educational helper function to provide status code troubleshooting guidance
 */
function getStatusCodeTroubleshooting(statusCode) {
    const troubleshootingGuide = {
        200: 'Successful request - no troubleshooting needed',
        404: 'Check URL path spelling and ensure endpoint exists in application routing',
        405: 'Verify HTTP method matches endpoint requirements (GET for /hello)',
        500: 'Check server logs for error details and review request processing code'
    };
    return troubleshootingGuide[statusCode] || 'Review HTTP specification for status code meaning';
}

/**
 * Educational helper function to identify common request issues
 */
function getCommonRequestIssues(req) {
    const issues = [];
    
    if (!req.headers.host) {
        issues.push('Missing Host header may indicate HTTP/1.0 client or malformed request');
    }
    
    if (req.method !== 'GET' && req.url === '/hello') {
        issues.push('Tutorial /hello endpoint only supports GET method');
    }
    
    if (!req.headers['user-agent']) {
        issues.push('Missing User-Agent may indicate programmatic client or security tools');
    }
    
    return issues.length > 0 ? issues : ['No common issues detected in request'];
}

/**
 * Educational helper function to provide debugging tips
 */
function getDebuggingTips(req, res) {
    return [
        'Use browser developer tools Network tab to inspect requests',
        'Check console output for detailed request/response logging',
        'Test endpoints with curl -v for verbose output',
        'Verify server is running and accessible on correct port'
    ];
}

/**
 * Educational helper function to compare performance against benchmarks
 */
function getBenchmarkComparison(duration) {
    const benchmarks = [
        { threshold: 10, description: 'Excellent - faster than most static content servers' },
        { threshold: 50, description: 'Very Good - typical for optimized web applications' },
        { threshold: 100, description: 'Good - acceptable for standard web responses' },
        { threshold: 500, description: 'Slow - consider optimization opportunities' }
    ];
    
    for (const benchmark of benchmarks) {
        if (duration < benchmark.threshold) {
            return benchmark.description;
        }
    }
    
    return 'Very Slow - requires immediate optimization attention';
}

// =============================================================================
// MAIN LOGGING FUNCTIONS
// =============================================================================

/**
 * Logs incoming HTTP request details including method, URL, headers, and timing information
 * with educational context about HTTP request anatomy and protocol patterns for learning enhancement
 * 
 * Educational Note: Request logging provides visibility into the HTTP request lifecycle
 * and demonstrates how servers receive and process client requests
 * 
 * @param {object} req - HTTP request object from Node.js http.IncomingMessage
 * @param {string} requestId - Unique identifier for request tracking and correlation
 * @param {object} options - Optional logging configuration including educational features
 * @returns {object} Request logging context object with timing and correlation information
 */
function logIncomingRequest(req, requestId, options = {}) {
    // Start high-resolution performance timer for educational request timing measurement
    const startTime = process.hrtime.bigint();
    const startTimestamp = Date.now();
    
    // Create request context object for correlation tracking throughout request lifecycle
    const requestContext = {
        requestId: requestId,
        method: req.method || 'UNKNOWN',
        url: req.url || '/',
        httpVersion: req.httpVersion || '1.1',
        remoteAddress: req.socket?.remoteAddress?.replace(/^::ffff:/, '') || 'unknown',
        remotePort: req.socket?.remotePort || 'unknown',
        startTime: startTime,
        startTimestamp: startTimestamp,
        headers: {}
    };
    
    // Parse and categorize request headers for educational HTTP protocol demonstration
    if (REQUEST_LOGGING_CONFIG.includeHeaders) {
        requestContext.headers = parseRequestHeaders(req.headers, {
            educationalMode: REQUEST_LOGGING_CONFIG.educationalMode,
            verboseMode: options.verboseMode
        });
    }
    
    // Analyze URL components for educational understanding of request structure
    const urlComponents = analyzeUrlComponents(req.url, req.headers.host);
    requestContext.urlAnalysis = urlComponents;
    
    // Generate educational context about HTTP request processing
    const educationalContext = formatEducationalContext(req, null, {
        startTime: startTimestamp
    });
    
    // Format educational request message with method and URL information
    const requestMessage = `${MIDDLEWARE_PREFIX} Incoming HTTP request: ${req.method} ${req.url}`;
    
    // Determine appropriate log level based on educational configuration
    let logLevel = 'info';
    if (REQUEST_LOGGING_CONFIG.educationalMode) {
        logLevel = 'debug'; // Enhanced verbosity for educational mode
    }
    
    // Log comprehensive request information with educational context
    const logContext = {
        ...requestContext,
        educational: educationalContext,
        middleware: 'request-logger',
        phase: 'request-received',
        requestNumber: REQUEST_COUNTER
    };
    
    // Output request log using appropriate logger function
    switch (logLevel) {
        case 'debug':
            debug(requestMessage, logContext);
            break;
        case 'info':
            info(requestMessage, logContext);
            break;
        default:
            info(requestMessage, logContext);
    }
    
    // Add educational guidance for common HTTP request patterns
    if (REQUEST_LOGGING_CONFIG.educational.showHttpProtocolInfo) {
        if (req.method === 'GET' && req.url === '/hello') {
            debug(`${MIDDLEWARE_PREFIX} Educational note: GET /hello demonstrates basic HTTP routing`, {
                concept: 'RESTful endpoint design for resource retrieval',
                pattern: 'Stateless request-response communication',
                learning: 'This request pattern is fundamental to web applications'
            });
        }
        
        if (req.method !== 'GET') {
            debug(`${MIDDLEWARE_PREFIX} Educational note: ${req.method} method detected`, {
                concept: `${req.method} method usage and server handling`,
                expectedBehavior: req.url === '/hello' ? 'Should return 405 Method Not Allowed' : 'Should return 404 Not Found',
                learning: 'HTTP methods define the type of operation requested by client'
            });
        }
    }
    
    // Store request context for response correlation
    req._loggerContext = requestContext;
    
    // Return request context for middleware chaining and response correlation
    return requestContext;
}

/**
 * Logs HTTP response details including status code, headers, processing time, and educational
 * performance metrics with categorization of response types and timing benchmarks for learning
 * 
 * Educational Note: Response logging correlates with request logging to demonstrate the complete
 * HTTP request-response cycle and provides learning opportunities about server performance
 * 
 * @param {object} req - Original HTTP request object for context correlation
 * @param {object} res - HTTP response object from Node.js http.ServerResponse
 * @param {object} requestContext - Request context object containing timing and correlation data
 * @returns {void} No return value, outputs comprehensive response log with educational analysis
 */
function logOutgoingResponse(req, res, requestContext) {
    // Calculate request processing duration using high-resolution timer from context
    const endTime = process.hrtime.bigint();
    const endTimestamp = Date.now();
    const startTime = requestContext?.startTime || endTime;
    
    // Calculate precise duration in milliseconds for educational performance analysis
    const durationNanoseconds = endTime - startTime;
    const duration = Number(durationNanoseconds) / 1000000; // Convert to milliseconds
    
    // Extract response status code and categorize using status code utility functions
    const statusCode = res.statusCode || 500;
    const statusCategory = getStatusCategory(statusCode);
    const statusDescription = getStatusCodeDescription(statusCode);
    
    // Determine response performance category based on educational thresholds
    const performanceLevel = categorizePerformance(duration);
    const performanceColor = getPerformanceColor(performanceLevel);
    
    // Extract response headers for educational HTTP protocol demonstration
    const responseHeaders = {};
    if (REQUEST_LOGGING_CONFIG.includeHeaders) {
        responseHeaders.contentType = res.getHeader('content-type') || 'not-set';
        responseHeaders.contentLength = res.getHeader('content-length') || 'not-set';
        responseHeaders.cacheControl = res.getHeader('cache-control') || 'not-set';
    }
    
    // Generate comprehensive educational performance analysis and benchmarking context
    const educationalContext = formatEducationalContext(req, res, {
        duration: duration,
        performanceLevel: performanceLevel,
        startTime: requestContext?.startTimestamp,
        endTime: endTimestamp
    });
    
    // Create response context object with comprehensive information for educational logging
    const responseContext = {
        requestId: requestContext?.requestId || 'unknown',
        method: req.method,
        url: req.url,
        statusCode: statusCode,
        statusCategory: statusCategory,
        statusDescription: statusDescription,
        duration: Math.round(duration * 100) / 100, // Round to 2 decimal places
        performanceLevel: performanceLevel,
        headers: responseHeaders,
        educational: educationalContext,
        middleware: 'request-logger',
        phase: 'response-sent',
        requestNumber: requestContext?.requestNumber || REQUEST_COUNTER
    };
    
    // Format response message with educational performance context and status information
    const responseMessage = `${MIDDLEWARE_PREFIX} HTTP response sent: ${statusCode} (${statusCategory}) in ${responseContext.duration}ms (${performanceLevel})`;
    
    // Determine appropriate log level based on status code and performance characteristics
    const logLevel = determineLogLevel(statusCode, duration, REQUEST_LOGGING_CONFIG);
    
    // Output comprehensive response log with educational performance analysis
    switch (logLevel) {
        case 'error':
            error(responseMessage, responseContext);
            break;
        case 'warn':
            warn(responseMessage, responseContext);
            break;
        case 'debug':
            debug(responseMessage, responseContext);
            break;
        case 'info':
        default:
            info(responseMessage, responseContext);
    }
    
    // Add educational insights about HTTP status code patterns and performance expectations
    if (REQUEST_LOGGING_CONFIG.educational.showHttpProtocolInfo) {
        if (statusCode === 200) {
            debug(`${MIDDLEWARE_PREFIX} Educational note: HTTP 200 OK indicates successful request processing`, {
                concept: 'HTTP success status codes communicate positive outcomes to clients',
                pattern: '2xx status codes indicate successful request completion',
                learning: 'Status 200 is the most common success response for GET requests'
            });
        } else if (statusCode === 404) {
            debug(`${MIDDLEWARE_PREFIX} Educational note: HTTP 404 Not Found indicates requested resource unavailable`, {
                concept: 'HTTP client error status codes help diagnose request issues',
                pattern: '4xx status codes indicate client-side errors or invalid requests',
                learning: 'Status 404 helps clients understand when requested resources do not exist'
            });
        } else if (statusCode === 405) {
            debug(`${MIDDLEWARE_PREFIX} Educational note: HTTP 405 Method Not Allowed indicates unsupported HTTP method`, {
                concept: 'HTTP method validation ensures proper endpoint usage',
                pattern: 'Servers should validate HTTP methods for each endpoint',
                learning: 'Status 405 guides clients to use appropriate HTTP methods'
            });
        }
    }
    
    // Include performance guidance and optimization tips for educational development
    if (REQUEST_LOGGING_CONFIG.educational.displayPerformanceBenchmarks) {
        if (duration > PERFORMANCE_THRESHOLDS.slow) {
            warn(`${MIDDLEWARE_PREFIX} Performance alert: Slow response time detected`, {
                duration: duration,
                threshold: PERFORMANCE_THRESHOLDS.slow,
                optimizationTips: getPerformanceOptimizationTips(duration),
                educationalNote: 'Response times over 200ms may impact user experience'
            });
        } else if (duration < PERFORMANCE_THRESHOLDS.fast) {
            debug(`${MIDDLEWARE_PREFIX} Performance note: Excellent response time achieved`, {
                duration: duration,
                benchmark: PERFORMANCE_THRESHOLDS.fast,
                educationalNote: 'Fast response times enhance user experience and SEO'
            });
        }
    }
    
    // Add troubleshooting guidance for educational problem-solving assistance
    if (REQUEST_LOGGING_CONFIG.educational.includeTroubleshootingTips && 
        (isClientErrorStatus(statusCode) || statusCode >= 500)) {
        const troubleshootingTips = getStatusCodeTroubleshooting(statusCode);
        info(`${MIDDLEWARE_PREFIX} Troubleshooting guidance for status ${statusCode}`, {
            statusCode: statusCode,
            guidance: troubleshootingTips,
            educationalNote: 'Use status codes and error patterns to diagnose issues',
            nextSteps: 'Review request details and server logs for additional context'
        });
    }
}

/**
 * Educational helper function to get performance level color coding
 */
function getPerformanceColor(performanceLevel) {
    const colors = {
        'Excellent': 'green',
        'Good': 'blue',
        'Acceptable': 'yellow',
        'Needs Optimization': 'red'
    };
    return colors[performanceLevel] || 'white';
}

// =============================================================================
// MIDDLEWARE FACTORY FUNCTION
// =============================================================================

/**
 * Factory function that creates a request logging middleware instance with educational configuration,
 * performance timing, and comprehensive HTTP request/response logging capabilities tailored for
 * Node.js tutorial learning and debugging assistance
 * 
 * Educational Note: Factory functions provide flexible middleware configuration and demonstrate
 * the factory pattern for creating customized instances with specific educational features
 * 
 * @param {object} options - Optional configuration object for customizing request logging behavior
 * @returns {function} Request logging middleware function that processes HTTP requests and responses
 */
function createRequestLogger(options = {}) {
    // Extract and merge logging configuration from appConfig and provided options
    const config = {
        ...REQUEST_LOGGING_CONFIG,
        ...options
    };
    
    // Initialize request counter for educational tracking of request volume
    if (REQUEST_COUNTER === 0) {
        info(`${MIDDLEWARE_PREFIX} Request logging middleware initialized`, {
            educationalMode: config.educationalMode,
            performanceTiming: config.enableTiming,
            headerLogging: config.includeHeaders,
            configuration: config,
            educationalNote: 'Request logging provides visibility into HTTP communication patterns'
        });
    }
    
    // Set up performance timing configuration based on educational settings
    const timingConfig = {
        enabled: config.enableTiming,
        thresholds: config.performanceThresholds,
        highResolution: EDUCATIONAL_TIMING_ENABLED
    };
    
    // Configure educational features including troubleshooting guidance and protocol explanations
    const educationalFeatures = {
        protocolInfo: config.educational?.showHttpProtocolInfo || false,
        troubleshootingTips: config.educational?.includeTroubleshootingTips || false,
        performanceBenchmarks: config.educational?.displayPerformanceBenchmarks || false,
        debuggingGuidance: config.educational?.enableDebuggingGuidance || false
    };
    
    // Create and return configured middleware function ready for HTTP server integration
    return function requestLoggingMiddleware(req, res, next) {
        // Generate unique request identifier for educational correlation tracking
        const requestId = generateRequestId(req);
        
        // Log incoming request with comprehensive educational context and timing
        const requestContext = logIncomingRequest(req, requestId, {
            verboseMode: config.educationalMode,
            includeHeaders: config.includeHeaders,
            educationalFeatures: educationalFeatures
        });
        
        // Store original response.end method for educational response timing measurement
        const originalEnd = res.end;
        
        // Wrap response.end method to capture response completion timing
        res.end = function(chunk, encoding) {
            // Log outgoing response with performance analysis and educational context
            logOutgoingResponse(req, res, requestContext);
            
            // Call original response.end method to complete the HTTP response
            originalEnd.call(res, chunk, encoding);
        };
        
        // Add educational context to request object for downstream middleware usage
        if (config.educationalMode) {
            req._educationalContext = {
                requestLoggingEnabled: true,
                requestId: requestId,
                loggingConfig: config,
                startTime: requestContext.startTime,
                educationalFeatures: educationalFeatures
            };
        }
        
        // Include troubleshooting guidance for common request logging configuration issues
        if (config.educational?.enableDebuggingGuidance && REQUEST_COUNTER === 1) {
            debug(`${MIDDLEWARE_PREFIX} Educational guidance: Request logging middleware active`, {
                troubleshooting: [
                    'Check console output for request/response logging information',
                    'Adjust LOG_LEVEL environment variable to control verbosity',
                    'Enable educational mode for enhanced learning features',
                    'Use browser developer tools to correlate client and server logs'
                ],
                configuration: {
                    currentLogLevel: loggingConfig?.level || 'info',
                    educationalMode: config.educationalMode,
                    timingEnabled: timingConfig.enabled
                }
            });
        }
        
        // Continue to next middleware in the chain
        if (typeof next === 'function') {
            next();
        }
    };
}

// =============================================================================
// DEFAULT MIDDLEWARE INSTANCE
// =============================================================================

/**
 * Default configured request logging middleware instance ready for HTTP server integration
 * with educational features, performance timing, and comprehensive request/response logging
 * 
 * Educational Note: Pre-configured middleware instances provide convenience while demonstrating
 * default configuration patterns and educational best practices for Node.js applications
 */
const requestLogger = createRequestLogger({
    educationalMode: REQUEST_LOGGING_CONFIG.educationalMode,
    enableTiming: REQUEST_LOGGING_CONFIG.enableTiming,
    includeHeaders: REQUEST_LOGGING_CONFIG.includeHeaders,
    performanceThresholds: REQUEST_LOGGING_CONFIG.performanceThresholds,
    educational: REQUEST_LOGGING_CONFIG.educational
});

// =============================================================================
// MODULE EXPORTS
// =============================================================================

module.exports = {
    // Factory function to create request logging middleware with educational configuration
    createRequestLogger,
    
    // Default configured request logging middleware function ready for HTTP server integration
    requestLogger,
    
    // Utility function for logging incoming HTTP request details with educational context
    logIncomingRequest,
    
    // Utility function for logging outgoing HTTP response details with performance analysis
    logOutgoingResponse,
    
    // Configuration object for request logging behavior including educational features
    REQUEST_LOGGING_CONFIG,
    
    // Utility functions for advanced request logging scenarios and educational customization
    parseRequestHeaders,
    generateRequestId,
    determineLogLevel,
    formatEducationalContext,
    
    // Global constants for external access and configuration
    MIDDLEWARE_PREFIX,
    PERFORMANCE_THRESHOLDS,
    EDUCATIONAL_TIMING_ENABLED,
    
    // Current request counter for educational monitoring and statistics
    get REQUEST_COUNTER() {
        return REQUEST_COUNTER;
    }
};