/**
 * Node.js Tutorial HTTP Request Routing Module
 * 
 * This module implements the core request routing logic for the Node.js tutorial HTTP server application.
 * It analyzes incoming HTTP requests, extracts URL and method information, and determines the appropriate
 * handler for processing. The router implements educational routing patterns with comprehensive logging,
 * performance monitoring, and troubleshooting guidance throughout the routing process.
 * 
 * Educational Features:
 * - Comprehensive request analysis and URL parsing for learning HTTP fundamentals
 * - Educational logging with routing decision explanations and troubleshooting guidance
 * - Performance timing utilities for demonstrating routing optimization concepts
 * - Method validation with educational guidance about HTTP methods and their usage
 * - Route matching demonstration with clear explanations of URL pattern comparison
 * - Error handling with educational context for 404 and 405 response generation
 * - Request/response correlation tracking for understanding the complete HTTP lifecycle
 * - Tutorial-specific formatting and educational prefixes for enhanced learning visibility
 * 
 * Integration Points:
 * - Integrates with hello-handler.js for processing '/hello' endpoint requests
 * - Uses response-generator.js for creating standardized HTTP success and error responses
 * - Imports HTTP status codes from http-status-codes.js for consistent status code usage
 * - Uses response-messages.js for standardized educational error messages and guidance
 * - Integrates with logger.js for comprehensive educational logging and performance monitoring
 * - Uses app-config.js for routing configuration and educational mode settings
 * - Utilizes Node.js built-in url module for URL parsing and component extraction
 * 
 * Architecture:
 * - Event-driven routing architecture leveraging Node.js's non-blocking I/O model
 * - Stateless request processing with proper cleanup and performance monitoring
 * - Educational design patterns demonstrating professional routing practices
 * - Comprehensive error handling with graceful degradation and educational feedback
 * - Performance-conscious implementation suitable for tutorial environments
 */

// Node.js built-in url module for parsing and analyzing request URLs - Node.js Built-in
const url = require('node:url');

// Internal handler imports for processing specific endpoint requests
const { handleHelloRequest } = require('../handlers/hello-handler.js');

// Response generation utilities for creating standardized HTTP responses
const { 
    generateNotFoundResponse, 
    generateMethodNotAllowedResponse, 
    generateErrorResponse 
} = require('../response/response-generator.js');

// HTTP status code constants for consistent status code usage throughout routing
const { HTTP_STATUS } = require('../constants/http-status-codes.js');

// Standardized error messages for consistent routing error responses with educational guidance
const { ERROR_MESSAGES } = require('../constants/response-messages.js');

// Educational logging utilities for request routing tracking, performance monitoring, and debugging
const { logger } = require('../utils/logger.js');

// Application configuration for educational settings and routing behavior customization
const { appConfig } = require('../config/app-config.js');

// =============================================================================
// GLOBAL CONSTANTS AND CONFIGURATION
// =============================================================================

/**
 * Array of supported HTTP methods for the tutorial application
 * Educational Note: Currently only GET method is supported to keep the tutorial focused
 * on fundamental HTTP server concepts without overwhelming beginners with method complexity
 */
const SUPPORTED_METHODS = ['GET'];

/**
 * Array of valid endpoint paths that the router can handle
 * Educational Note: Single endpoint design demonstrates basic routing concepts
 * while maintaining educational simplicity and clear learning objectives
 */
const VALID_ENDPOINTS = ['/hello'];

/**
 * Performance timer label for educational routing performance measurement
 * Educational Note: Consistent labeling helps track routing performance and
 * demonstrates performance monitoring best practices in Node.js applications
 */
const ROUTER_TIMER_LABEL = 'request-routing';

/**
 * Educational prefix for routing-specific log messages to enhance learning visibility
 * Educational Note: Consistent prefixing helps identify routing-specific logs in mixed
 * environments and provides clear educational context for routing operations
 */
const EDUCATIONAL_ROUTING_PREFIX = '[Request Router]';

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Utility function that parses incoming request URLs into structured components including 
 * pathname, query parameters, and hash for educational demonstration of URL parsing and 
 * routing analysis.
 * 
 * Educational Note: URL parsing is fundamental to web server routing and demonstrates
 * how servers analyze client requests to determine appropriate response handlers.
 * This function breaks down URLs into components for educational visibility.
 * 
 * @param {string} requestUrl - Raw URL string from HTTP request for parsing and analysis
 * @returns {object} Parsed URL object with pathname, query, and educational context properties
 */
function parseRequestUrl(requestUrl) {
    // Start performance timer for educational URL parsing measurement
    const parseTimer = logger.startTimer('url-parsing');
    
    // Validate requestUrl parameter and ensure it's a string for proper URL parsing
    if (typeof requestUrl !== 'string' || requestUrl.length === 0) {
        logger.warn(`${EDUCATIONAL_ROUTING_PREFIX} Invalid URL provided for parsing`, {
            providedUrl: requestUrl,
            expectedType: 'string',
            troubleshooting: 'Ensure request URL is a valid string before parsing'
        });
        
        // Return safe default structure for educational error handling demonstration
        return {
            pathname: '/',
            search: '',
            query: {},
            hash: '',
            educational: {
                error: 'Invalid URL provided',
                guidance: 'URL must be a non-empty string for proper parsing'
            }
        };
    }
    
    // Use Node.js url.parse() method to parse URL into components
    let parsedUrl;
    try {
        // Parse URL with querystring parsing enabled for educational demonstration
        parsedUrl = url.parse(requestUrl, true);
        
        // Log URL parsing process for educational visibility
        logger.debug(`${EDUCATIONAL_ROUTING_PREFIX} URL parsing initiated`, {
            originalUrl: requestUrl,
            parsingMethod: 'url.parse()',
            includeQuery: true
        });
        
    } catch (parseError) {
        logger.error(`${EDUCATIONAL_ROUTING_PREFIX} URL parsing failed`, parseError, {
            originalUrl: requestUrl,
            errorType: 'URLParsingError',
            troubleshooting: 'Check URL format and special character encoding'
        });
        
        // Return safe fallback structure for error demonstration
        return {
            pathname: requestUrl.split('?')[0] || '/',
            search: '',
            query: {},
            hash: '',
            educational: {
                error: 'URL parsing failed',
                originalUrl: requestUrl,
                guidance: 'URL may contain invalid characters or malformed structure'
            }
        };
    }
    
    // Extract pathname component for route matching logic
    const pathname = parsedUrl.pathname || '/';
    
    // Parse query parameters if present for educational query handling demonstration
    const query = parsedUrl.query || {};
    const search = parsedUrl.search || '';
    const hash = parsedUrl.hash || '';
    
    // Add educational context about URL structure and components
    const educationalContext = {
        urlComponents: {
            pathname: `Path component used for route matching (${pathname})`,
            query: `Query parameters for additional request data (${Object.keys(query).length} parameters)`,
            search: `Full query string including ? character (${search})`,
            hash: `Fragment identifier typically used client-side (${hash})`
        },
        parsingMethod: 'Node.js url.parse() with querystring parsing enabled',
        routingRelevance: 'Pathname is primary component used for route matching logic'
    };
    
    // Log URL parsing results with educational breakdown of components
    logger.debug(`${EDUCATIONAL_ROUTING_PREFIX} URL parsed successfully`, {
        pathname: pathname,
        queryCount: Object.keys(query).length,
        hasSearch: search.length > 0,
        hasHash: hash.length > 0,
        educational: 'URL components extracted for routing analysis'
    });
    
    // End performance timer and log parsing completion time
    const parseDuration = logger.endTimer('url-parsing');
    
    // Include educational performance context
    if (appConfig.educational?.performance?.showTimingInfo && parseDuration > 1) {
        logger.info(`${EDUCATIONAL_ROUTING_PREFIX} URL parsing completed in ${parseDuration.toFixed(2)}ms`, {
            performanceNote: 'URL parsing timing for educational performance awareness',
            optimization: parseDuration > 5 ? 'Consider URL caching for repeated requests' : 'Excellent parsing performance'
        });
    }
    
    // Return structured URL object with pathname, query, and educational metadata
    return {
        pathname: pathname,
        search: search,
        query: query,
        hash: hash,
        educational: educationalContext,
        metadata: {
            originalUrl: requestUrl,
            parsedAt: new Date().toISOString(),
            parseTime: parseDuration
        }
    };
}

/**
 * Validates incoming HTTP request methods against supported methods for the tutorial application, 
 * providing educational guidance about HTTP methods and their appropriate usage.
 * 
 * Educational Note: HTTP method validation is essential for proper REST API implementation
 * and security. This function demonstrates method checking while providing educational
 * context about different HTTP methods and their purposes.
 * 
 * @param {string} method - HTTP method string from request object (GET, POST, etc.)
 * @returns {object} Validation result object with isValid boolean and educational context
 */
function validateHttpMethod(method) {
    // Start timer for educational method validation performance tracking
    const validationTimer = logger.startTimer('method-validation');
    
    // Convert method parameter to uppercase for consistent comparison
    const normalizedMethod = (method || '').toString().toUpperCase().trim();
    
    // Log method validation initiation for educational demonstration
    logger.debug(`${EDUCATIONAL_ROUTING_PREFIX} HTTP method validation started`, {
        originalMethod: method,
        normalizedMethod: normalizedMethod,
        supportedMethods: SUPPORTED_METHODS,
        educational: 'Method validation ensures only supported HTTP verbs are processed'
    });
    
    // Validate that method parameter is provided and not empty
    if (!normalizedMethod) {
        logger.warn(`${EDUCATIONAL_ROUTING_PREFIX} Empty or invalid HTTP method provided`, {
            providedMethod: method,
            expectedFormat: 'Non-empty string representing HTTP method',
            troubleshooting: 'Ensure HTTP method is properly extracted from request object'
        });
        
        // Return validation failure with educational guidance
        return {
            isValid: false,
            method: normalizedMethod,
            error: 'Empty or invalid method',
            educational: {
                issue: 'HTTP method is required for proper request processing',
                guidance: 'Check request parsing and ensure method property is accessible',
                supportedMethods: SUPPORTED_METHODS
            }
        };
    }
    
    // Check method against SUPPORTED_METHODS array (currently only GET)
    const isMethodSupported = SUPPORTED_METHODS.includes(normalizedMethod);
    
    // Log method validation process and results for educational demonstration
    if (isMethodSupported) {
        logger.debug(`${EDUCATIONAL_ROUTING_PREFIX} HTTP method validation successful`, {
            method: normalizedMethod,
            status: 'supported',
            educational: `${normalizedMethod} method is supported for tutorial endpoints`
        });
    } else {
        logger.debug(`${EDUCATIONAL_ROUTING_PREFIX} HTTP method validation failed`, {
            method: normalizedMethod,
            status: 'unsupported',
            supportedMethods: SUPPORTED_METHODS,
            educational: 'Only GET method is supported in this tutorial application'
        });
    }
    
    // End performance timer for educational timing awareness
    const validationDuration = logger.endTimer('method-validation');
    
    // If method is supported, return positive validation result with educational context
    if (isMethodSupported) {
        return {
            isValid: true,
            method: normalizedMethod,
            educational: {
                methodType: getHttpMethodEducationalInfo(normalizedMethod),
                usage: `${normalizedMethod} method is appropriate for resource retrieval`,
                restfulPattern: 'GET requests should be idempotent and safe',
                tutorialContext: 'Tutorial focuses on GET method for educational simplicity'
            },
            performance: {
                validationTime: validationDuration,
                status: 'validated'
            }
        };
    }
    
    // If method is not supported, return validation failure with guidance about supported methods
    return {
        isValid: false,
        method: normalizedMethod,
        error: `Method ${normalizedMethod} is not supported`,
        educational: {
            issue: `${normalizedMethod} method is not implemented in this tutorial`,
            supportedMethods: SUPPORTED_METHODS,
            guidance: 'Use GET method for accessing tutorial endpoints',
            httpMethodInfo: getHttpMethodEducationalInfo(normalizedMethod),
            tutorialNote: 'Tutorial is limited to GET method for educational focus'
        },
        troubleshooting: [
            'Check that you are using GET method for requests',
            'Verify client is sending correct HTTP method',
            'Consider using curl with -X GET flag for testing'
        ],
        performance: {
            validationTime: validationDuration,
            status: 'rejected'
        }
    };
}

/**
 * Helper function to provide educational information about different HTTP methods
 * Educational Note: Provides context about HTTP method purposes and usage patterns
 */
function getHttpMethodEducationalInfo(method) {
    const methodInfo = {
        'GET': {
            purpose: 'Retrieve data from server',
            characteristics: 'Safe and idempotent',
            usage: 'Fetching resources without side effects'
        },
        'POST': {
            purpose: 'Submit data to server',
            characteristics: 'Not safe or idempotent',
            usage: 'Creating resources or submitting forms'
        },
        'PUT': {
            purpose: 'Update or create resource',
            characteristics: 'Idempotent but not safe',
            usage: 'Full resource replacement'
        },
        'DELETE': {
            purpose: 'Remove resource',
            characteristics: 'Idempotent but not safe',
            usage: 'Resource deletion'
        }
    };
    
    return methodInfo[method] || {
        purpose: 'Unknown HTTP method',
        characteristics: 'Not recognized',
        usage: 'Refer to HTTP specification for details'
    };
}

/**
 * Performs route matching logic to determine if incoming request paths match valid endpoints, 
 * with educational demonstration of route matching patterns and URL comparison techniques.
 * 
 * Educational Note: Route matching is the core of web server routing logic. This function
 * demonstrates how servers compare request paths against configured routes to determine
 * which handler should process each request.
 * 
 * @param {string} pathname - URL pathname from parsed request URL for route matching
 * @param {array} validRoutes - Array of valid route patterns for comparison
 * @returns {object} Route matching result with matched route, handler information, and educational context
 */
function matchRoute(pathname, validRoutes = VALID_ENDPOINTS) {
    // Start performance timer for educational route matching measurement
    const matchTimer = logger.startTimer('route-matching');
    
    // Normalize pathname by trimming whitespace and ensuring leading slash
    const normalizedPath = (pathname || '/').toString().trim();
    const cleanPath = normalizedPath.startsWith('/') ? normalizedPath : '/' + normalizedPath;
    
    // Log route matching initiation with educational context
    logger.debug(`${EDUCATIONAL_ROUTING_PREFIX} Route matching initiated`, {
        originalPathname: pathname,
        normalizedPath: cleanPath,
        availableRoutes: validRoutes,
        matchingAlgorithm: 'exact string comparison',
        educational: 'Route matching determines which handler processes the request'
    });
    
    // Validate that validRoutes is an array for proper iteration
    if (!Array.isArray(validRoutes) || validRoutes.length === 0) {
        logger.warn(`${EDUCATIONAL_ROUTING_PREFIX} Invalid or empty routes array provided`, {
            providedRoutes: validRoutes,
            expectedType: 'Array of strings',
            troubleshooting: 'Ensure valid routes array is configured properly'
        });
        
        return {
            matched: false,
            path: cleanPath,
            error: 'No valid routes configured',
            educational: {
                issue: 'Route matching requires valid routes configuration',
                guidance: 'Check application configuration for valid endpoints array'
            }
        };
    }
    
    // Iterate through validRoutes array to find exact path matches
    let matchedRoute = null;
    let matchIndex = -1;
    
    for (let i = 0; i < validRoutes.length; i++) {
        const route = validRoutes[i];
        
        // Compare normalized pathname against each valid route using string comparison
        if (cleanPath === route) {
            matchedRoute = route;
            matchIndex = i;
            
            // Log successful route match for educational demonstration
            logger.debug(`${EDUCATIONAL_ROUTING_PREFIX} Route match found`, {
                requestPath: cleanPath,
                matchedRoute: route,
                matchIndex: i,
                matchingMethod: 'exact string comparison',
                educational: 'Exact path match determines request handler'
            });
            break;
        }
    }
    
    // Log route matching process and comparison results for educational visibility
    logger.debug(`${EDUCATIONAL_ROUTING_PREFIX} Route matching analysis completed`, {
        requestPath: cleanPath,
        routesChecked: validRoutes.length,
        matchFound: matchedRoute !== null,
        matchedRoute: matchedRoute,
        educational: 'Route comparison uses exact string matching for tutorial simplicity'
    });
    
    // End performance timer and capture matching duration
    const matchDuration = logger.endTimer('route-matching');
    
    // If exact match found, return match result with handler information
    if (matchedRoute) {
        const handlerInfo = getHandlerForRoute(matchedRoute);
        
        return {
            matched: true,
            path: cleanPath,
            matchedRoute: matchedRoute,
            handler: handlerInfo,
            educational: {
                matchingAlgorithm: 'exact string comparison',
                routePattern: `Request path '${cleanPath}' matches configured route '${matchedRoute}'`,
                handlerMapping: `Route '${matchedRoute}' maps to ${handlerInfo.name} handler`,
                routingDecision: 'Request will be forwarded to appropriate handler function'
            },
            performance: {
                matchTime: matchDuration,
                routesChecked: matchIndex + 1,
                efficiency: 'O(n) linear search through available routes'
            }
        };
    }
    
    // If no match found, return no-match result with suggestions for valid routes
    return {
        matched: false,
        path: cleanPath,
        availableRoutes: validRoutes,
        educational: {
            issue: `Request path '${cleanPath}' does not match any configured routes`,
            availableEndpoints: validRoutes,
            suggestions: [
                'Check URL spelling and case sensitivity',
                'Ensure path starts with forward slash (/)',
                'Verify endpoint exists in application configuration',
                `Try accessing: ${validRoutes.map(route => `http://localhost:3000${route}`).join(', ')}`
            ],
            routingConcept: 'Unmatched routes result in 404 Not Found responses',
            troubleshooting: 'Use exact path matching - no wildcards or parameters in tutorial'
        },
        performance: {
            matchTime: matchDuration,
            routesChecked: validRoutes.length,
            outcome: 'no_match_found'
        }
    };
}

/**
 * Helper function to get handler information for a matched route
 * Educational Note: Maps routes to their corresponding handler functions
 */
function getHandlerForRoute(route) {
    const handlerMap = {
        '/hello': {
            name: 'handleHelloRequest',
            module: 'hello-handler',
            description: 'Processes GET requests to /hello endpoint',
            educational: 'Demonstrates basic endpoint handling with static response'
        }
    };
    
    return handlerMap[route] || {
        name: 'unknown',
        module: 'unknown',
        description: 'Handler not configured',
        educational: 'Route mapping requires handler configuration'
    };
}

/**
 * Handles requests to invalid routes by generating appropriate 404 Not Found responses with 
 * educational guidance directing users to valid endpoints and troubleshooting assistance.
 * 
 * Educational Note: 404 error handling is crucial for user experience and demonstrates
 * proper HTTP error response patterns. This function shows how to provide helpful
 * guidance while maintaining professional error handling standards.
 * 
 * @param {object} req - HTTP request object with details about the invalid route request
 * @param {object} res - HTTP response object for sending 404 error response to client
 * @param {string} requestedPath - The invalid path that was requested for educational context
 * @returns {void} No return value, generates and sends 404 response with educational guidance
 */
function handleRouteNotFound(req, res, requestedPath) {
    // Start timer for educational 404 handling performance measurement
    const notFoundTimer = logger.startTimer('404-handling');
    
    // Log route not found event with requested path for educational debugging
    logger.info(`${EDUCATIONAL_ROUTING_PREFIX} Route not found`, {
        requestedPath: requestedPath,
        method: req.method,
        userAgent: req.headers['user-agent'],
        clientIP: req.socket?.remoteAddress,
        educational: 'Invalid route access demonstrates 404 error handling patterns'
    });
    
    // Extract educational guidance about valid endpoints from configuration
    const educationalGuidance = {
        issue: `The requested path '${requestedPath}' is not available on this server`,
        validEndpoints: VALID_ENDPOINTS,
        testUrls: VALID_ENDPOINTS.map(endpoint => 
            `http://${req.headers.host || 'localhost:3000'}${endpoint}`
        ),
        troubleshootingSteps: [
            'Verify the URL spelling and case sensitivity',
            'Ensure the path starts with a forward slash (/)',
            'Check that you are accessing a configured endpoint',
            'Use curl or browser to test valid endpoints'
        ],
        httpConcept: '404 Not Found indicates the requested resource does not exist',
        learningObjective: 'Understanding HTTP status codes and error handling patterns'
    };
    
    // Format 404 error message with troubleshooting tips and valid endpoint suggestions
    const notFoundContext = {
        requestedPath: requestedPath,
        method: req.method,
        availableEndpoints: VALID_ENDPOINTS,
        educationalGuidance: educationalGuidance,
        timestamp: new Date().toISOString(),
        serverInfo: {
            name: appConfig.app?.name || 'Node.js Tutorial Server',
            version: appConfig.app?.version || '1.0.0'
        }
    };
    
    // Add educational context about URL structure and common routing mistakes
    if (appConfig.educational?.errors?.includeEducationalContext) {
        notFoundContext.educational = {
            commonMistakes: [
                'Missing forward slash at the beginning of the path',
                'Incorrect case sensitivity (paths are case-sensitive)',
                'Typos in the endpoint name',
                'Accessing endpoints that do not exist'
            ],
            urlStructure: `URL format: http://${req.headers.host || 'localhost:3000'}/endpoint`,
            routingConcepts: [
                'Web servers match request paths against configured routes',
                'Exact path matching is used in this tutorial application',
                'Unmatched paths result in 404 Not Found responses'
            ]
        };
    }
    
    // Call generateNotFoundResponse with educational error message and context
    try {
        generateNotFoundResponse(res, ERROR_MESSAGES.NOT_FOUND, notFoundContext);
        
        // Log successful 404 response generation for educational demonstration
        logger.info(`${EDUCATIONAL_ROUTING_PREFIX} 404 response generated successfully`, {
            requestedPath: requestedPath,
            responseStatus: HTTP_STATUS.NOT_FOUND,
            educational: '404 response includes troubleshooting guidance for learning'
        });
        
    } catch (responseError) {
        // Handle response generation errors with educational context
        logger.error(`${EDUCATIONAL_ROUTING_PREFIX} Failed to generate 404 response`, responseError, {
            requestedPath: requestedPath,
            errorType: 'ResponseGenerationError',
            troubleshooting: 'Check response generator module and HTTP response object',
            fallbackAction: 'Attempting basic error response'
        });
        
        // Fallback to basic error response if response generation fails
        try {
            res.statusCode = HTTP_STATUS.NOT_FOUND;
            res.setHeader('Content-Type', 'text/plain');
            res.end('404 Not Found - Educational server error occurred');
        } catch (fallbackError) {
            logger.error(`${EDUCATIONAL_ROUTING_PREFIX} Fallback response failed`, fallbackError);
        }
    }
    
    // End performance timer and log response completion time
    const notFoundDuration = logger.endTimer('404-handling');
    
    // Log 404 response generation completion for educational error handling demonstration
    logger.debug(`${EDUCATIONAL_ROUTING_PREFIX} 404 error handling completed in ${notFoundDuration.toFixed(2)}ms`, {
        performanceMetric: '404 response generation timing',
        educational: 'Error response performance monitoring for optimization awareness'
    });
}

/**
 * Handles requests with unsupported HTTP methods by generating appropriate 405 Method Not Allowed 
 * responses with educational guidance about supported methods and HTTP method concepts.
 * 
 * Educational Note: 405 Method Not Allowed responses are important for REST API compliance
 * and user guidance. This function demonstrates proper HTTP method validation and provides
 * educational context about different HTTP methods and their appropriate usage.
 * 
 * @param {object} req - HTTP request object with unsupported method details
 * @param {object} res - HTTP response object for sending 405 error response to client
 * @param {string} attemptedMethod - The unsupported HTTP method that was attempted
 * @returns {void} No return value, generates and sends 405 response with educational method guidance
 */
function handleMethodNotAllowed(req, res, attemptedMethod) {
    // Start timer for educational 405 handling performance measurement
    const methodTimer = logger.startTimer('405-handling');
    
    // Log method not allowed event with attempted method for educational debugging
    logger.info(`${EDUCATIONAL_ROUTING_PREFIX} Method not allowed`, {
        attemptedMethod: attemptedMethod,
        requestPath: req.url,
        supportedMethods: SUPPORTED_METHODS,
        clientInfo: {
            userAgent: req.headers['user-agent'],
            clientIP: req.socket?.remoteAddress
        },
        educational: 'Unsupported HTTP method demonstrates proper method validation'
    });
    
    // Format educational error message explaining supported methods (GET only)
    const methodGuidance = {
        issue: `HTTP method '${attemptedMethod}' is not supported by this endpoint`,
        supportedMethods: SUPPORTED_METHODS,
        attemptedMethod: attemptedMethod,
        correctUsage: `Use GET method to access ${req.url}`,
        testCommands: [
            `curl -X GET http://${req.headers.host || 'localhost:3000'}${req.url}`,
            `Browser access: http://${req.headers.host || 'localhost:3000'}${req.url}`
        ],
        httpMethodInfo: getHttpMethodEducationalInfo(attemptedMethod),
        tutorialContext: 'Tutorial application supports only GET method for educational simplicity'
    };
    
    // Include educational context about HTTP methods and their appropriate usage
    const methodContext = {
        attemptedMethod: attemptedMethod,
        supportedMethods: SUPPORTED_METHODS,
        requestPath: req.url,
        educationalGuidance: methodGuidance,
        httpConcepts: {
            methodNotAllowed: '405 status indicates unsupported HTTP method for the resource',
            allowHeader: 'Allow header specifies which methods are supported',
            restfulDesign: 'Different HTTP methods have specific semantic meanings'
        },
        timestamp: new Date().toISOString()
    };
    
    // Add troubleshooting guidance for method-related issues in tutorial environment
    if (appConfig.educational?.errors?.includeTroubleshootingTips) {
        methodContext.troubleshooting = [
            'Ensure you are using GET method for tutorial endpoints',
            'Check your HTTP client configuration (curl -X GET, browser, etc.)',
            'Verify the request method is being sent correctly',
            'Tutorial application is designed for GET method learning'
        ];
        
        methodContext.educational = {
            learningObjective: 'Understanding HTTP method validation and 405 error responses',
            methodComparison: {
                GET: 'Safe and idempotent - supported in tutorial',
                POST: 'Not safe or idempotent - not implemented',
                PUT: 'Idempotent but not safe - not implemented',
                DELETE: 'Idempotent but not safe - not implemented'
            },
            tutorialFocus: 'Limited to GET method to maintain educational simplicity'
        };
    }
    
    // Call generateMethodNotAllowedResponse with supported methods information
    try {
        generateMethodNotAllowedResponse(res, ERROR_MESSAGES.METHOD_NOT_ALLOWED, methodContext);
        
        // Log successful 405 response generation for educational demonstration
        logger.info(`${EDUCATIONAL_ROUTING_PREFIX} 405 response generated successfully`, {
            attemptedMethod: attemptedMethod,
            responseStatus: HTTP_STATUS.METHOD_NOT_ALLOWED,
            allowedMethods: SUPPORTED_METHODS,
            educational: '405 response includes HTTP method education and guidance'
        });
        
    } catch (responseError) {
        // Handle response generation errors with educational error handling
        logger.error(`${EDUCATIONAL_ROUTING_PREFIX} Failed to generate 405 response`, responseError, {
            attemptedMethod: attemptedMethod,
            errorType: 'ResponseGenerationError',
            troubleshooting: 'Check response generator module and method handling',
            fallbackAction: 'Attempting basic method not allowed response'
        });
        
        // Fallback to basic 405 response if response generation fails
        try {
            res.statusCode = HTTP_STATUS.METHOD_NOT_ALLOWED;
            res.setHeader('Allow', SUPPORTED_METHODS.join(', '));
            res.setHeader('Content-Type', 'text/plain');
            res.end(`405 Method Not Allowed - Supported methods: ${SUPPORTED_METHODS.join(', ')}`);
        } catch (fallbackError) {
            logger.error(`${EDUCATIONAL_ROUTING_PREFIX} Fallback 405 response failed`, fallbackError);
        }
    }
    
    // End performance timer and capture method handling duration
    const methodDuration = logger.endTimer('405-handling');
    
    // Include educational tips about using proper HTTP methods for tutorial endpoints
    if (appConfig.educational?.logging?.demonstratePatterns) {
        logger.info(`${EDUCATIONAL_ROUTING_PREFIX} HTTP method educational tip`, {
            tip: 'GET method is the standard for retrieving resources without side effects',
            usage: 'Browsers automatically use GET for navigation and resource loading',
            restfulConcept: 'GET requests should be safe and idempotent for proper REST design',
            tutorialApplication: 'Use GET method for all tutorial endpoint access'
        });
    }
    
    // Log 405 response generation completion for educational method handling demonstration
    logger.debug(`${EDUCATIONAL_ROUTING_PREFIX} 405 method handling completed in ${methodDuration.toFixed(2)}ms`, {
        performanceMetric: '405 response generation timing',
        educational: 'Method validation performance monitoring for optimization awareness'
    });
}

/**
 * Educational logging function that provides detailed logging of routing decisions including 
 * request analysis, route matching results, handler delegation, and performance metrics for 
 * learning and debugging purposes.
 * 
 * Educational Note: Routing decision logging provides visibility into the routing process
 * and helps students understand how web servers analyze requests and determine appropriate
 * responses. This comprehensive logging demonstrates professional debugging practices.
 * 
 * @param {object} request - HTTP request object with routing context
 * @param {string} decision - Routing decision made (hello_handler, not_found, method_not_allowed)
 * @param {object} details - Additional routing details including timing and context
 * @returns {void} No return value, outputs educational routing log to console
 */
function logRoutingDecision(request, decision, details = {}) {
    // Format routing decision with educational context and timestamp information
    const timestamp = new Date().toISOString();
    const routingContext = {
        timestamp: timestamp,
        decision: decision,
        requestMethod: request.method,
        requestUrl: request.url,
        requestHeaders: {
            host: request.headers.host,
            userAgent: request.headers['user-agent']?.substring(0, 100),
            acceptLanguage: request.headers['accept-language']
        },
        clientInfo: {
            remoteAddress: request.socket?.remoteAddress,
            remotePort: request.socket?.remotePort
        },
        ...details
    };
    
    // Include request details such as method, URL, and client information if available
    const requestSummary = `${request.method} ${request.url} from ${request.socket?.remoteAddress || 'unknown'}`;
    
    // Add educational explanation of routing logic and decision-making process
    let educationalExplanation;
    let logLevel = 'info';
    
    switch (decision) {
        case 'hello_handler':
            educationalExplanation = {
                decision: 'Request routed to Hello Handler',
                reasoning: 'Path matches /hello endpoint and method is GET',
                concept: 'Successful route matching directs request to appropriate handler',
                nextStep: 'Hello Handler will generate Hello World response'
            };
            break;
            
        case 'not_found':
            educationalExplanation = {
                decision: 'Request routed to 404 Not Found handler',
                reasoning: 'Path does not match any configured endpoints',
                concept: 'Unmatched routes result in 404 error responses',
                nextStep: '404 response will be generated with troubleshooting guidance'
            };
            logLevel = 'warn';
            break;
            
        case 'method_not_allowed':
            educationalExplanation = {
                decision: 'Request routed to 405 Method Not Allowed handler',
                reasoning: 'HTTP method is not supported for any endpoints',
                concept: 'Method validation ensures only supported HTTP verbs are processed',
                nextStep: '405 response will be generated with method guidance'
            };
            logLevel = 'warn';
            break;
            
        case 'server_error':
            educationalExplanation = {
                decision: 'Request routed to 500 Server Error handler',
                reasoning: 'Internal server error occurred during routing process',
                concept: 'Unexpected errors require graceful error handling',
                nextStep: '500 response will be generated with error details'
            };
            logLevel = 'error';
            break;
            
        default:
            educationalExplanation = {
                decision: 'Unknown routing decision',
                reasoning: 'Routing decision not recognized',
                concept: 'All routing decisions should have defined educational context',
                nextStep: 'Check routing logic for unhandled decision types'
            };
            logLevel = 'warn';
    }
    
    // Include performance timing information for educational performance awareness
    if (details.duration) {
        educationalExplanation.performance = {
            routingTime: `${details.duration.toFixed(2)}ms`,
            performanceLevel: details.duration < 1 ? 'Excellent' : 
                            details.duration < 10 ? 'Good' : 
                            details.duration < 50 ? 'Acceptable' : 'Slow',
            optimizationTip: details.duration > 10 ? 'Consider routing optimization for better performance' : 'Good routing performance'
        };
    }
    
    // Add routing decision context to logging information
    routingContext.educational = educationalExplanation;
    
    // Log routing decision with appropriate log level based on decision type
    const routingMessage = `${EDUCATIONAL_ROUTING_PREFIX} Routing decision: ${decision} for ${requestSummary}`;
    
    if (logLevel === 'error') {
        logger.error(routingMessage, routingContext);
    } else if (logLevel === 'warn') {
        logger.warn(routingMessage, routingContext);
    } else {
        logger.info(routingMessage, routingContext);
    }
    
    // Add troubleshooting context specific to routing decisions and common issues
    if (appConfig.educational?.debugging?.verboseDebugging) {
        const troubleshootingContext = {
            routingDecision: decision,
            commonIssues: getCommonRoutingIssues(decision),
            debuggingSteps: getRoutingDebuggingSteps(decision),
            educationalValue: 'Routing decision logging helps understand server request processing'
        };
        
        logger.debug(`${EDUCATIONAL_ROUTING_PREFIX} Routing troubleshooting context`, troubleshootingContext);
    }
    
    // Output comprehensive routing log entry with educational prefixes and context
    if (appConfig.educational?.performance?.showTimingInfo && details.startTime) {
        const totalTime = Date.now() - details.startTime;
        logger.debug(`${EDUCATIONAL_ROUTING_PREFIX} Total request processing time: ${totalTime}ms`, {
            startTime: details.startTime,
            endTime: Date.now(),
            totalDuration: totalTime,
            educational: 'Complete request-response cycle timing for performance analysis'
        });
    }
}

/**
 * Helper function to get common issues for different routing decisions
 */
function getCommonRoutingIssues(decision) {
    const issueMap = {
        'hello_handler': [
            'Handler function errors',
            'Response generation failures',
            'Performance bottlenecks in handler'
        ],
        'not_found': [
            'Typos in requested URLs',
            'Case sensitivity issues',
            'Missing endpoint configuration',
            'Incorrect base URL usage'
        ],
        'method_not_allowed': [
            'Using wrong HTTP method (POST instead of GET)',
            'Client configuration issues',
            'Misunderstanding of REST conventions'
        ],
        'server_error': [
            'Unhandled exceptions in routing logic',
            'Configuration errors',
            'Resource availability issues',
            'Module loading failures'
        ]
    };
    
    return issueMap[decision] || ['Unknown routing decision issues'];
}

/**
 * Helper function to get debugging steps for different routing decisions
 */
function getRoutingDebuggingSteps(decision) {
    const stepsMap = {
        'hello_handler': [
            'Verify handler function is working correctly',
            'Check response generation and formatting',
            'Monitor handler performance and resource usage'
        ],
        'not_found': [
            'Double-check the requested URL spelling and case',
            'Verify the endpoint exists in VALID_ENDPOINTS array',
            'Test with known working URLs',
            'Check server configuration and available routes'
        ],
        'method_not_allowed': [
            'Verify you are using GET method for requests',
            'Check HTTP client configuration',
            'Use curl with explicit method: curl -X GET <url>',
            'Review HTTP method documentation and usage'
        ],
        'server_error': [
            'Check server logs for detailed error information',
            'Verify all required modules are properly loaded',
            'Review configuration settings and environment variables',
            'Test with simplified requests to isolate the issue'
        ]
    };
    
    return stepsMap[decision] || ['Contact support or review documentation'];
}

/**
 * Utility function that returns metadata information about the request router including 
 * supported endpoints, methods, routing patterns, and educational context for debugging 
 * and learning assistance.
 * 
 * Educational Note: Router metadata provides comprehensive information about the routing
 * configuration and capabilities, helping students understand the router's behavior and
 * serving as a reference for debugging and optimization activities.
 * 
 * @returns {object} Routing metadata object with endpoint information, configuration, and educational context
 */
function getRoutingMetadata() {
    // Start timer for metadata generation performance tracking
    const metadataTimer = logger.startTimer('metadata-generation');
    
    // Compile routing metadata including supported endpoints and HTTP methods
    const basicMetadata = {
        supportedMethods: SUPPORTED_METHODS,
        validEndpoints: VALID_ENDPOINTS,
        routerVersion: '1.0.0',
        lastUpdated: new Date().toISOString(),
        environment: appConfig.environment,
        educationalMode: appConfig.educational?.tutorial?.mode || false
    };
    
    // Include route matching patterns and URL structure information
    const routingPatterns = {
        matchingAlgorithm: 'exact string comparison',
        caseSensitive: true,
        queryParametersIgnored: true,
        fragmentsIgnored: true,
        trailingSlashSignificant: true,
        routeFormat: 'Static path matching (no parameters or wildcards)',
        exampleMatches: VALID_ENDPOINTS.map(endpoint => ({
            pattern: endpoint,
            example: `http://localhost:3000${endpoint}`,
            handler: getHandlerForRoute(endpoint).name
        }))
    };
    
    // Add educational context about routing concepts and tutorial objectives
    const educationalContext = {
        learningObjectives: [
            'Understand HTTP request routing fundamentals',
            'Learn URL parsing and path matching techniques',
            'Master HTTP method validation and error responses',
            'Practice performance monitoring and optimization',
            'Develop debugging skills for web server applications'
        ],
        routingConcepts: {
            urlParsing: 'Breaking down URLs into components for analysis',
            pathMatching: 'Comparing request paths against configured routes',
            methodValidation: 'Ensuring only supported HTTP methods are processed',
            errorHandling: 'Generating appropriate responses for invalid requests',
            performanceMonitoring: 'Tracking routing performance and optimization opportunities'
        },
        tutorialFeatures: [
            'Educational logging with detailed explanations',
            'Performance timing for optimization awareness',
            'Comprehensive error messages with troubleshooting guidance',
            'Route matching demonstration with clear decision logic',
            'HTTP status code education and proper usage examples'
        ]
    };
    
    // Include performance benchmarks and typical routing response times
    const performanceMetrics = {
        typicalRoutingTime: '< 5ms for simple route matching',
        urlParsingTime: '< 1ms for standard URLs',
        methodValidationTime: '< 1ms for supported methods',
        errorResponseTime: '< 10ms for 404/405 responses',
        optimizationTargets: {
            routeMatching: 'O(n) linear search - acceptable for small route sets',
            memoryUsage: 'Minimal memory footprint for static routing',
            cpuUsage: 'Lightweight processing suitable for educational environments'
        },
        performanceTips: [
            'Monitor routing times to identify bottlenecks',
            'Use performance profiling for optimization opportunities',
            'Consider route caching for high-traffic applications',
            'Optimize error response generation for better user experience'
        ]
    };
    
    // Add troubleshooting information and common routing issues for educational guidance
    const troubleshootingGuide = {
        commonIssues: [
            {
                issue: '404 Not Found responses',
                causes: ['Incorrect URL spelling', 'Case sensitivity', 'Missing endpoints'],
                solutions: ['Check URL carefully', 'Verify endpoint configuration', 'Use exact path matching']
            },
            {
                issue: '405 Method Not Allowed responses',
                causes: ['Using unsupported HTTP methods', 'Client configuration errors'],
                solutions: ['Use GET method only', 'Check HTTP client settings', 'Verify request method']
            },
            {
                issue: 'Slow routing performance',
                causes: ['Complex URL parsing', 'Inefficient route matching', 'Logging overhead'],
                solutions: ['Optimize route order', 'Reduce logging verbosity', 'Profile performance']
            }
        ],
        debuggingTools: [
            'Browser Developer Tools for network inspection',
            'curl command-line tool for HTTP testing',
            'Node.js debugger for server-side debugging',
            'Console logging for request/response analysis'
        ],
        testingStrategies: [
            'Test all configured endpoints systematically',
            'Try invalid URLs to verify 404 handling',
            'Use different HTTP methods to test method validation',
            'Monitor performance under various load conditions'
        ]
    };
    
    // Format metadata object for easy consumption and educational display
    const completeMetadata = {
        ...basicMetadata,
        routing: routingPatterns,
        educational: educationalContext,
        performance: performanceMetrics,
        troubleshooting: troubleshootingGuide,
        configuration: {
            supportedMethods: SUPPORTED_METHODS,
            validEndpoints: VALID_ENDPOINTS,
            routerTimerLabel: ROUTER_TIMER_LABEL,
            educationalPrefix: EDUCATIONAL_ROUTING_PREFIX,
            environmentConfig: {
                environment: appConfig.environment,
                educationalMode: appConfig.educational?.tutorial?.mode,
                loggingLevel: appConfig.logging?.level,
                performanceMonitoring: appConfig.educational?.performance?.showTimingInfo
            }
        },
        metadata: {
            generatedAt: new Date().toISOString(),
            nodeVersion: process.version,
            platform: process.platform,
            applicationVersion: appConfig.app?.version || '1.0.0'
        }
    };
    
    // End metadata generation timer and capture duration
    const metadataDuration = logger.endTimer('metadata-generation');
    
    // Include metadata generation performance information
    completeMetadata.performance.metadataGenerationTime = `${metadataDuration.toFixed(2)}ms`;
    
    // Log metadata generation completion for educational monitoring
    logger.debug(`${EDUCATIONAL_ROUTING_PREFIX} Routing metadata generated`, {
        metadataSize: Object.keys(completeMetadata).length,
        generationTime: metadataDuration,
        educational: 'Router metadata provides comprehensive routing information for debugging'
    });
    
    // Return comprehensive routing metadata for debugging and learning assistance
    return completeMetadata;
}

// =============================================================================
// MAIN ROUTING FUNCTION
// =============================================================================

/**
 * Main request routing function that analyzes incoming HTTP requests, validates method and URL, 
 * and routes to appropriate handlers or generates error responses. Includes comprehensive 
 * educational logging and performance monitoring throughout the routing process.
 * 
 * Educational Note: This is the core routing function that demonstrates how web servers
 * process incoming requests. It shows the complete request analysis workflow including
 * URL parsing, method validation, route matching, and handler delegation with proper
 * error handling and educational context throughout the process.
 * 
 * @param {object} req - HTTP request object from Node.js http.IncomingMessage containing client request details
 * @param {object} res - HTTP response object from Node.js http.ServerResponse for sending responses back to client
 * @returns {void} No return value, handles routing and delegates to appropriate handler or error response generator
 */
function routeRequest(req, res) {
    // Start performance timer for educational routing performance measurement using logger.startTimer
    const routingStartTime = Date.now();
    const routingTimer = logger.startTimer(ROUTER_TIMER_LABEL);
    
    // Log incoming request details using logger.logRequest with educational context
    logger.logRequest(req, {
        educational: true,
        routingContext: 'Request routing initiated',
        learningObjective: 'Demonstrate HTTP request processing and routing logic'
    });
    
    try {
        // Extract and validate HTTP method from request object using req.method property
        const httpMethod = req.method;
        
        // Log method extraction for educational visibility
        logger.debug(`${EDUCATIONAL_ROUTING_PREFIX} HTTP method extracted`, {
            method: httpMethod,
            educational: 'HTTP method determines which operations are allowed on the resource'
        });
        
        // Parse request URL using Node.js url module for path and query parameter extraction
        const parsedUrl = parseRequestUrl(req.url);
        
        // Log request parsing results and routing analysis for educational demonstration
        logger.debug(`${EDUCATIONAL_ROUTING_PREFIX} Request URL parsed`, {
            originalUrl: req.url,
            pathname: parsedUrl.pathname,
            queryCount: Object.keys(parsedUrl.query).length,
            educational: 'URL parsing extracts routing components for decision making'
        });
        
        // Validate HTTP method against supported methods list (GET only for tutorial)
        const methodValidation = validateHttpMethod(httpMethod);
        
        // Log method validation results for educational context
        logger.debug(`${EDUCATIONAL_ROUTING_PREFIX} Method validation completed`, {
            method: httpMethod,
            isValid: methodValidation.isValid,
            supportedMethods: SUPPORTED_METHODS,
            educational: 'Method validation ensures only supported HTTP verbs are processed'
        });
        
        // If method not supported, delegate to generateMethodNotAllowedResponse with educational guidance
        if (!methodValidation.isValid) {
            logRoutingDecision(req, 'method_not_allowed', {
                attemptedMethod: httpMethod,
                startTime: routingStartTime,
                validationResult: methodValidation
            });
            
            handleMethodNotAllowed(req, res, httpMethod);
            return;
        }
        
        // Extract URL path from parsed URL object for route matching logic
        const requestPath = parsedUrl.pathname;
        
        // Log path extraction for educational route matching demonstration
        logger.debug(`${EDUCATIONAL_ROUTING_PREFIX} Request path extracted for matching`, {
            path: requestPath,
            educational: 'Request path is primary component used for route matching'
        });
        
        // Perform route matching against valid endpoints list using exact path comparison
        const routeMatch = matchRoute(requestPath, VALID_ENDPOINTS);
        
        // Log route matching results for educational visibility
        logger.debug(`${EDUCATIONAL_ROUTING_PREFIX} Route matching completed`, {
            requestPath: requestPath,
            matched: routeMatch.matched,
            matchedRoute: routeMatch.matchedRoute,
            availableRoutes: VALID_ENDPOINTS,
            educational: 'Route matching determines which handler processes the request'
        });
        
        // If path matches '/hello', delegate to handleHelloRequest from hello-handler module
        if (routeMatch.matched && routeMatch.matchedRoute === '/hello') {
            logRoutingDecision(req, 'hello_handler', {
                matchedRoute: routeMatch.matchedRoute,
                handler: 'handleHelloRequest',
                startTime: routingStartTime,
                routeMatch: routeMatch
            });
            
            // Delegate to hello handler with educational context
            logger.info(`${EDUCATIONAL_ROUTING_PREFIX} Routing to Hello Handler`, {
                endpoint: '/hello',
                handler: 'handleHelloRequest',
                educational: 'Successful route match delegates request to appropriate handler'
            });
            
            handleHelloRequest(req, res);
            return;
        }
        
        // If path does not match valid endpoints, delegate to generateNotFoundResponse with guidance
        logRoutingDecision(req, 'not_found', {
            requestedPath: requestPath,
            availableEndpoints: VALID_ENDPOINTS,
            startTime: routingStartTime,
            routeMatch: routeMatch
        });
        
        handleRouteNotFound(req, res, requestPath);
        
    } catch (routingError) {
        // Handle any routing errors using comprehensive error handling with educational context
        logger.error(`${EDUCATIONAL_ROUTING_PREFIX} Routing error occurred`, routingError, {
            requestUrl: req.url,
            requestMethod: req.method,
            errorType: 'RoutingError',
            educational: 'Routing errors demonstrate the importance of proper error handling',
            troubleshooting: [
                'Check request object properties for validity',
                'Verify all imported modules are available',
                'Review error stack trace for specific failure point',
                'Consider adding additional error handling for edge cases'
            ]
        });
        
        // Log routing error decision
        logRoutingDecision(req, 'server_error', {
            error: routingError.message,
            startTime: routingStartTime,
            errorType: routingError.name
        });
        
        // Generate 500 error response for routing failures
        try {
            generateErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 
                'Internal server error during request routing', {
                error: routingError.message,
                educational: 'Server errors require graceful error handling and user feedback',
                troubleshooting: 'Check server logs for detailed error information'
            });
        } catch (errorResponseFailure) {
            // Ultimate fallback for critical response failures
            logger.error(`${EDUCATIONAL_ROUTING_PREFIX} Critical error response failure`, errorResponseFailure);
            
            try {
                res.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
                res.setHeader('Content-Type', 'text/plain');
                res.end('500 Internal Server Error - Critical routing failure');
            } catch (finalError) {
                logger.error(`${EDUCATIONAL_ROUTING_PREFIX} Final error response failed`, finalError);
            }
        }
    } finally {
        // End performance timer and log routing completion time for educational performance awareness
        const routingDuration = logger.endTimer(ROUTER_TIMER_LABEL);
        
        // Calculate total routing time from start
        const totalRoutingTime = Date.now() - routingStartTime;
        
        // Log final routing decision and handler delegation for educational debugging assistance
        logger.info(`${EDUCATIONAL_ROUTING_PREFIX} Request routing completed`, {
            requestMethod: req.method,
            requestUrl: req.url,
            routingDuration: routingDuration,
            totalProcessingTime: totalRoutingTime,
            educational: 'Complete routing cycle demonstrates HTTP request processing flow',
            performance: {
                routingTime: `${routingDuration.toFixed(2)}ms`,
                performanceLevel: routingDuration < 5 ? 'Excellent' : 
                                routingDuration < 20 ? 'Good' : 
                                routingDuration < 50 ? 'Acceptable' : 'Needs Optimization'
            }
        });
        
        // Add educational performance insights if enabled
        if (appConfig.educational?.performance?.showTimingInfo) {
            if (routingDuration > 10) {
                logger.warn(`${EDUCATIONAL_ROUTING_PREFIX} Slow routing performance detected`, {
                    duration: routingDuration,
                    threshold: 10,
                    suggestion: 'Consider routing optimization for better performance',
                    educational: 'Performance monitoring helps identify optimization opportunities'
                });
            }
        }
    }
}

// =============================================================================
// ROUTING CONFIGURATION OBJECT
// =============================================================================

/**
 * Configuration object containing routing settings, endpoints, and educational parameters
 * Educational Note: Centralized configuration provides easy access to routing settings
 * and demonstrates configuration management best practices
 */
const ROUTING_CONFIG = {
    supportedMethods: SUPPORTED_METHODS,
    validEndpoints: VALID_ENDPOINTS,
    educational: appConfig.educational?.tutorial?.mode || false,
    performance: {
        timingEnabled: appConfig.educational?.performance?.showTimingInfo || false,
        timerLabel: ROUTER_TIMER_LABEL,
        performanceThresholds: {
            excellent: 5,
            good: 20,
            acceptable: 50
        }
    },
    logging: {
        prefix: EDUCATIONAL_ROUTING_PREFIX,
        verboseMode: appConfig.educational?.logging?.verboseMode || false,
        includeEducationalContext: appConfig.educational?.errors?.includeEducationalContext || false
    },
    errorHandling: {
        includeStackTraces: appConfig.logging?.debug?.showStackTraces || false,
        verboseErrors: appConfig.educational?.errors?.verboseErrors || false,
        includeTroubleshootingTips: appConfig.educational?.errors?.includeTroubleshootingTips || false
    },
    metadata: {
        version: '1.0.0',
        created: new Date().toISOString(),
        environment: appConfig.environment,
        nodeVersion: process.version
    }
};

// =============================================================================
// MODULE EXPORTS
// =============================================================================

module.exports = {
    // Main request routing function for analyzing and routing HTTP requests with educational context
    routeRequest,
    
    // URL parsing utility for educational demonstration of URL structure analysis
    parseRequestUrl,
    
    // HTTP method validation function with educational guidance about supported methods
    validateHttpMethod,
    
    // Route matching utility demonstrating URL pattern comparison and routing logic
    matchRoute,
    
    // 404 error handler with educational guidance for invalid route requests
    handleRouteNotFound,
    
    // 405 error handler with educational guidance about HTTP method usage
    handleMethodNotAllowed,
    
    // Educational logging function for routing decision tracking and analysis
    logRoutingDecision,
    
    // Metadata utility providing routing configuration and educational information
    getRoutingMetadata,
    
    // Configuration object containing routing settings, endpoints, and educational parameters
    ROUTING_CONFIG
};