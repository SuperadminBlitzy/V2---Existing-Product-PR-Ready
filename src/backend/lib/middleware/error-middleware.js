/**
 * Node.js Tutorial Error Handling Middleware Module
 * 
 * This module provides centralized error handling middleware functionality for the Node.js tutorial 
 * HTTP server application. It implements comprehensive error management with educational features,
 * structured error processing, educational error responses, and consistent error logging throughout 
 * the application. The middleware serves as the unified error handling layer for all HTTP requests, 
 * capturing errors from request processing, routing, and response generation while providing 
 * educational error responses with troubleshooting guidance.
 * 
 * Educational Features:
 * - Centralized error handling patterns that demonstrate proper Node.js error management
 * - Educational error responses with comprehensive troubleshooting guidance and learning context
 * - Error type classification system for different error scenarios and handling strategies
 * - Tutorial-specific error messaging with step-by-step resolution instructions
 * - Performance-conscious error handling optimized for educational environments
 * - Structured error logging with educational formatting and debugging assistance
 * - Security-aware error disclosure balancing educational value with safe error information
 * 
 * Integration Points:
 * - Used by src/backend/server.js as the main error handling middleware for application-level processing
 * - Integrates with src/backend/lib/utils/logger.js for structured educational error logging and tracking
 * - Uses src/backend/lib/utils/error-handler.js for centralized error processing and EducationalError handling
 * - Leverages src/backend/lib/response/response-generator.js for consistent HTTP error response formatting
 * - References src/backend/lib/constants/http-status-codes.js and response-messages.js for standardized codes
 * - Configures behavior through src/backend/lib/config/app-config.js for environment-specific settings
 * 
 * @module error-middleware
 * @version 1.0.0
 * @educational Demonstrates centralized error handling with educational context and troubleshooting assistance
 */

// Node.js built-in process module for error context and educational debugging information - Node.js Built-in
const process = require('node:process');

// Internal imports for HTTP status codes and consistent error response status codes
const { 
    HTTP_STATUS: {
        INTERNAL_SERVER_ERROR,
        NOT_FOUND,
        METHOD_NOT_ALLOWED,
        BAD_REQUEST
    }
} = require('../constants/http-status-codes.js');

// Standardized error messages and educational guidance for consistent error responses
const { 
    ERROR_MESSAGES: {
        INTERNAL_SERVER_ERROR: INTERNAL_SERVER_ERROR_MESSAGE,
        NOT_FOUND: NOT_FOUND_MESSAGE,
        METHOD_NOT_ALLOWED: METHOD_NOT_ALLOWED_MESSAGE,
        INVALID_ROUTE: INVALID_ROUTE_MESSAGE
    },
    EDUCATIONAL_MESSAGES: {
        TROUBLESHOOTING_HELP,
        DEBUGGING_TIPS
    }
} = require('../constants/response-messages.js');

// Structured educational logging functionality for comprehensive error logging with context
const { 
    logger,
    logError: logErrorWithContext
} = require('../utils/logger.js');

// Server error handling for critical server-level error processing
const { 
    handleServerError,
    handleRequestError,
    formatErrorForResponse,
    EducationalError,
    createEducationalError,
    isRecoverableError,
    getTroubleshootingGuidance
} = require('../utils/error-handler.js');

// Error response generation for consistent HTTP error response formatting and delivery
const { 
    generateErrorResponse
} = require('../response/response-generator.js');

// Application configuration for error handling behavior and educational settings
const { 
    appConfig: {
        environment,
        educational,
        logging
    }
} = require('../config/app-config.js');

// =============================================================================
// GLOBAL CONSTANTS AND CONFIGURATION
// =============================================================================

/**
 * Educational error middleware prefix for tutorial identification in all error messages
 * Educational Note: Consistent prefixing helps identify tutorial-specific errors in logs
 * and provides clear educational context for learning environments
 */
const ERROR_MIDDLEWARE_PREFIX = '[Error Middleware]';

/**
 * Default HTTP status code for unclassified errors with safe fallback
 * Educational Note: 500 Internal Server Error provides appropriate default status
 * for errors that don't fit specific categories while maintaining HTTP compliance
 */
const DEFAULT_ERROR_STATUS = 500;

/**
 * Educational error context flag enabling tutorial-specific features and guidance
 * Educational Note: Educational context activates learning-focused error handling
 * with verbose logging, startup guidance, and educational error messages
 */
const EDUCATIONAL_ERROR_CONTEXT = true;

/**
 * Maximum stack trace depth for educational error display and debugging assistance
 * Educational Note: Limiting stack trace depth prevents overwhelming beginners
 * while providing sufficient debugging information for learning purposes
 */
const MAX_ERROR_STACK_DEPTH = 10;

// =============================================================================
// ERROR HANDLING MIDDLEWARE FUNCTIONS
// =============================================================================

/**
 * Main error handling middleware function that serves as Express-style error middleware,
 * capturing all application errors and generating appropriate HTTP error responses with
 * educational context and troubleshooting guidance for comprehensive error management
 * throughout the tutorial application
 * 
 * Educational Note: Error middleware provides centralized error handling that captures
 * errors from all application layers and converts them into appropriate HTTP responses
 * with educational context for enhanced learning experience
 * 
 * @param {Error} error - Error object or error information from application processing
 * @param {object} req - HTTP request object from Node.js http.IncomingMessage
 * @param {object} res - HTTP response object from Node.js http.ServerResponse
 * @param {function} next - Next middleware function in the chain (optional for error middleware)
 * @returns {void} No return value, handles error and sends appropriate HTTP response or calls next middleware
 */
function errorHandler(error, req, res, next) {
    // Start performance timer for educational error handling timing metrics
    const errorTimer = logger.startTimer('error_middleware_processing');
    
    try {
        // Log error occurrence with comprehensive context using educational logging
        logger.info(`${ERROR_MIDDLEWARE_PREFIX} Processing application error`, {
            errorName: error?.name || 'Unknown',
            errorMessage: error?.message || 'No error message',
            requestMethod: req?.method || 'UNKNOWN',
            requestUrl: req?.url || '/',
            timestamp: new Date().toISOString(),
            educational: true,
            middlewareType: 'error_handler'
        });
        
        // Validate error object and extract error information for processing
        if (!error) {
            logger.warn(`${ERROR_MIDDLEWARE_PREFIX} No error object provided to error handler`, {
                requestUrl: req?.url,
                requestMethod: req?.method,
                troubleshooting: 'Error handler called without error object - this may indicate middleware chain issue'
            });
            
            // Create generic error for processing
            error = new Error('Unknown error occurred in application processing');
            error.statusCode = INTERNAL_SERVER_ERROR;
        }
        
        // Check if response has already been sent to prevent double response
        if (res?.headersSent) {
            logger.warn(`${ERROR_MIDDLEWARE_PREFIX} Response headers already sent, cannot send error response`, {
                errorMessage: error.message,
                requestUrl: req?.url,
                troubleshooting: 'Headers already sent indicates response was generated before error occurred'
            });
            
            // Call next middleware if available since we cannot send response
            if (next && typeof next === 'function') {
                return next(error);
            }
            return;
        }
        
        // Determine error type and classification for appropriate handling strategy
        const errorType = determineErrorType(error, { req, res });
        logger.debug(`${ERROR_MIDDLEWARE_PREFIX} Error classified as: ${errorType}`, {
            errorName: error.name,
            errorCode: error.code,
            statusCode: error.statusCode
        });
        
        // Extract request context including method, URL, and headers for error analysis
        const requestContext = createErrorContext(error, req, {
            includeHeaders: educational?.errors?.includeEducationalContext,
            includeTiming: educational?.performance?.showTimingInfo
        });
        
        // Format error for response using formatErrorForResponse utility
        const formattedError = formatErrorForResponse(error, {
            educational: educational?.errors?.includeEducationalContext,
            includeDebuggingInfo: environment === 'development' || environment === 'educational',
            includeStackTrace: environment === 'development',
            statusCode: error.statusCode || DEFAULT_ERROR_STATUS
        });
        
        // Generate educational error response with troubleshooting guidance
        const statusCode = error.statusCode || DEFAULT_ERROR_STATUS;
        const errorMessage = formattedError.message || INTERNAL_SERVER_ERROR_MESSAGE;
        
        // Send formatted error response using generateErrorResponse function
        try {
            generateErrorResponse(res, statusCode, errorMessage, {
                includeEducationalGuidance: educational?.errors?.includeTroubleshootingTips,
                verboseLogging: logging?.verboseMode,
                enableTiming: educational?.performance?.showTimingInfo
            });
        } catch (responseError) {
            // Fallback error response if primary response generation fails
            logger.error(`${ERROR_MIDDLEWARE_PREFIX} Failed to generate error response`, responseError, {
                originalError: error.message,
                statusCode: statusCode,
                troubleshooting: 'Error response generation failed - using fallback response'
            });
            
            // Send minimal fallback response
            if (res && typeof res.writeHead === 'function' && typeof res.end === 'function') {
                try {
                    res.writeHead(INTERNAL_SERVER_ERROR, { 'Content-Type': 'text/plain' });
                    res.end('Internal Server Error: Unable to process request');
                } catch (fallbackError) {
                    logger.error(`${ERROR_MIDDLEWARE_PREFIX} Fallback response also failed`, fallbackError);
                }
            }
        }
        
        // Log error resolution completion with educational context for learning
        const errorResolutionContext = {
            errorType: errorType,
            statusCode: statusCode,
            resolved: true,
            processingTime: errorTimer.end(),
            educational: true,
            learningNote: 'Error handled by centralized middleware with educational context'
        };
        
        logger.info(`${ERROR_MIDDLEWARE_PREFIX} Error processing completed`, errorResolutionContext);
        
        // Add educational guidance about error handling patterns
        if (educational?.tutorial?.mode && logging?.demonstratePatterns) {
            logger.info('Educational note: Centralized error handling provides consistent error management', {
                concept: 'Error middleware catches all application errors in a single location',
                benefits: [
                    'Consistent error response formatting across application',
                    'Centralized logging and monitoring of all errors',
                    'Educational error messages with troubleshooting guidance',
                    'Proper HTTP status code usage and client communication'
                ],
                pattern: 'Express-style error middleware with (err, req, res, next) signature'
            });
        }
        
    } catch (middlewareError) {
        // Handle errors within the error middleware itself
        logger.error(`${ERROR_MIDDLEWARE_PREFIX} Critical error in error handling middleware`, middlewareError, {
            originalError: error?.message,
            criticalFailure: true,
            troubleshooting: 'Error middleware itself failed - this indicates a serious system issue'
        });
        
        // End timer and attempt emergency response
        errorTimer.end();
        
        // Try emergency response without educational features
        try {
            if (res && !res.headersSent && typeof res.writeHead === 'function' && typeof res.end === 'function') {
                res.writeHead(INTERNAL_SERVER_ERROR, { 'Content-Type': 'text/plain' });
                res.end('Critical Server Error: Error handling system failure');
            }
        } catch (emergencyError) {
            logger.error(`${ERROR_MIDDLEWARE_PREFIX} Emergency response failed - server in critical state`, emergencyError);
        }
        
        // Call next middleware as last resort if available
        if (next && typeof next === 'function') {
            next(middlewareError);
        }
    }
}

/**
 * Specialized error handler for HTTP 404 Not Found errors when requested resources 
 * or endpoints are not available, providing educational guidance to direct users to 
 * valid tutorial endpoints with troubleshooting assistance
 * 
 * Educational Note: 404 error handling demonstrates proper client error response
 * patterns and provides learning opportunities about URL routing and endpoint design
 * 
 * @param {object} req - HTTP request object containing the invalid route information
 * @param {object} res - HTTP response object for sending 404 error response
 * @returns {void} No return value, sends HTTP 404 Not Found response with educational guidance
 */
function handleNotFoundError(req, res) {
    // Start performance timer for 404 error handling measurement
    const notFoundTimer = logger.startTimer('not_found_error_handling');
    
    try {
        // Extract requested URL path from request object for error context
        const requestedPath = req?.url || '/unknown';
        const requestMethod = req?.method || 'GET';
        
        // Log 404 error occurrence with requested path and educational context
        logger.warn(`${ERROR_MIDDLEWARE_PREFIX} Handling 404 Not Found error`, {
            requestedPath: requestedPath,
            requestMethod: requestMethod,
            statusCode: NOT_FOUND,
            errorType: 'client_error',
            educational: true,
            concept: 'Resource not found on server'
        });
        
        // Create educational 404 error message with guidance to '/hello' endpoint
        let notFoundMessage = NOT_FOUND_MESSAGE;
        
        // Include educational guidance for learning and troubleshooting assistance
        if (educational?.errors?.includeEducationalContext) {
            notFoundMessage += `\n\nRequested path: ${requestedPath}`;
            notFoundMessage += '\n\nEducational Guidance:';
            notFoundMessage += '\n- This tutorial server only supports the \'/hello\' endpoint';
            notFoundMessage += '\n- Try visiting: http://localhost:3000/hello';
            notFoundMessage += '\n- Ensure the URL path is spelled correctly and includes the leading slash';
            notFoundMessage += '\n- Check that you\'re using the correct hostname and port number';
            
            // Include troubleshooting tips for common URL mistakes and typos
            if (requestedPath !== '/hello') {
                notFoundMessage += '\n\nCommon Issues:';
                notFoundMessage += '\n• Check for typos in the URL path';
                notFoundMessage += '\n• Ensure the path starts with a forward slash (/)';
                notFoundMessage += '\n• Verify the endpoint name is exactly \'hello\'';
                notFoundMessage += '\n• Use GET method for requests to tutorial endpoints';
            }
        }
        
        // Generate HTTP 404 response with educational content and guidance
        const notFoundOptions = {
            includeEducationalGuidance: educational?.errors?.includeTroubleshootingTips,
            verboseLogging: logging?.verboseMode,
            enableTiming: educational?.performance?.showTimingInfo
        };
        
        // Send 404 response using generateErrorResponse with educational messaging
        generateErrorResponse(res, NOT_FOUND, notFoundMessage, notFoundOptions);
        
        // Log 404 response completion for educational tracking and analytics
        const notFoundContext = {
            requestedPath: requestedPath,
            requestMethod: requestMethod,
            statusCode: NOT_FOUND,
            responseGenerated: true,
            processingTime: notFoundTimer.end(),
            educational: true,
            tutorialGuidance: 'User directed to valid /hello endpoint'
        };
        
        logger.info(`${ERROR_MIDDLEWARE_PREFIX} 404 Not Found response sent`, notFoundContext);
        
        // Add educational context about 404 errors and proper endpoint design
        if (educational?.tutorial?.mode && logging?.demonstratePatterns) {
            logger.info('Educational note: 404 errors help clients identify invalid URLs', {
                concept: 'RESTful API design uses 404 for non-existent resources',
                pattern: 'Clear error messages guide users to valid endpoints',
                tutorialEndpoint: '/hello',
                httpStandard: 'HTTP 404 Not Found indicates requested resource does not exist',
                bestPractices: [
                    'Provide helpful error messages with guidance to valid endpoints',
                    'Include troubleshooting tips for common URL mistakes',
                    'Use consistent error response formatting throughout application',
                    'Log 404 errors for monitoring and debugging purposes'
                ]
            });
        }
        
    } catch (error) {
        // Handle errors during 404 error processing
        logger.error(`${ERROR_MIDDLEWARE_PREFIX} Failed to handle 404 Not Found error`, error, {
            requestedPath: req?.url,
            fallbackAction: 'Attempting generic error response'
        });
        
        notFoundTimer.end();
        
        // Fallback to generic error handling
        try {
            errorHandler(error, req, res);
        } catch (fallbackError) {
            logger.error(`${ERROR_MIDDLEWARE_PREFIX} Fallback 404 handling also failed`, fallbackError);
        }
    }
}

/**
 * Specialized error handler for HTTP 405 Method Not Allowed errors when unsupported 
 * HTTP methods are used on valid endpoints, providing educational guidance about 
 * supported methods and HTTP method concepts for learning purposes
 * 
 * Educational Note: 405 error handling demonstrates proper HTTP method validation
 * and provides learning opportunities about HTTP methods and RESTful API design
 * 
 * @param {object} req - HTTP request object containing the unsupported method
 * @param {object} res - HTTP response object for sending 405 error response
 * @param {array} allowedMethods - Array of allowed HTTP methods for the endpoint
 * @returns {void} No return value, sends HTTP 405 Method Not Allowed response with method guidance
 */
function handleMethodNotAllowed(req, res, allowedMethods = ['GET']) {
    // Start performance timer for method not allowed error handling
    const methodTimer = logger.startTimer('method_not_allowed_error_handling');
    
    try {
        // Extract HTTP method from request object for error analysis
        const attemptedMethod = req?.method || 'UNKNOWN';
        const requestPath = req?.url || '/';
        
        // Log method not allowed error with method details and educational context
        logger.warn(`${ERROR_MIDDLEWARE_PREFIX} Handling 405 Method Not Allowed error`, {
            attemptedMethod: attemptedMethod,
            requestPath: requestPath,
            allowedMethods: allowedMethods,
            statusCode: METHOD_NOT_ALLOWED,
            errorType: 'client_error',
            educational: true,
            concept: 'HTTP method validation and proper method usage'
        });
        
        // Format allowed methods list for educational response messaging
        const allowedMethodsString = allowedMethods.join(', ');
        
        // Create educational error message explaining method restrictions and proper usage
        let methodNotAllowedMessage = METHOD_NOT_ALLOWED_MESSAGE;
        
        if (educational?.errors?.includeEducationalContext) {
            methodNotAllowedMessage += `\n\nAttempted method: ${attemptedMethod}`;
            methodNotAllowedMessage += `\nAllowed methods: ${allowedMethodsString}`;
            methodNotAllowedMessage += '\n\nEducational Guidance:';
            methodNotAllowedMessage += '\n- The tutorial server only accepts GET requests';
            methodNotAllowedMessage += '\n- GET is used for retrieving resources without side effects';
            methodNotAllowedMessage += '\n- Other methods (POST, PUT, DELETE) are not implemented in this tutorial';
            methodNotAllowedMessage += '\n- Use browser navigation or curl -X GET for testing';
            
            // Include educational content about HTTP methods and proper usage
            methodNotAllowedMessage += '\n\nHTTP Method Education:';
            methodNotAllowedMessage += '\n• GET: Retrieve resource data (safe and idempotent)';
            methodNotAllowedMessage += '\n• POST: Create new resources or submit data';
            methodNotAllowedMessage += '\n• PUT: Update or replace existing resources';
            methodNotAllowedMessage += '\n• DELETE: Remove resources from server';
            methodNotAllowedMessage += '\n• HEAD: Retrieve headers only (like GET but no body)';
        }
        
        // Prepare additional headers including Allow header as per HTTP/1.1 standards
        const methodHeaders = {
            'Allow': allowedMethodsString
        };
        
        if (educational?.tutorial?.mode) {
            methodHeaders['X-Educational-Method-Info'] = 'GET method required for tutorial endpoints';
            methodHeaders['X-Tutorial-Allowed-Methods'] = allowedMethodsString;
        }
        
        // Generate HTTP 405 response with educational content about HTTP methods
        const methodOptions = {
            includeEducationalGuidance: educational?.errors?.includeTroubleshootingTips,
            verboseLogging: logging?.verboseMode,
            enableTiming: educational?.performance?.showTimingInfo,
            additionalHeaders: methodHeaders
        };
        
        // Send method not allowed response with educational guidance and troubleshooting tips
        generateErrorResponse(res, METHOD_NOT_ALLOWED, methodNotAllowedMessage, methodOptions);
        
        // Log method error resolution with educational context for learning tracking
        const methodContext = {
            attemptedMethod: attemptedMethod,
            allowedMethods: allowedMethods,
            requestPath: requestPath,
            statusCode: METHOD_NOT_ALLOWED,
            allowHeaderSet: true,
            responseGenerated: true,
            processingTime: methodTimer.end(),
            educational: true,
            learningNote: 'Client educated about proper HTTP method usage'
        };
        
        logger.info(`${ERROR_MIDDLEWARE_PREFIX} 405 Method Not Allowed response sent`, methodContext);
        
        // Add educational context about HTTP methods and proper API design
        if (educational?.tutorial?.mode && logging?.demonstratePatterns) {
            logger.info('Educational note: HTTP methods define the intended action for requests', {
                concept: 'RESTful APIs use specific HTTP methods for different operations',
                httpStandard: 'HTTP 405 Method Not Allowed indicates unsupported method for resource',
                allowHeader: 'Allow header communicates supported methods to clients',
                methods: {
                    GET: 'Safe and idempotent - retrieve resource without modifications',
                    POST: 'Create new resources or submit form data',
                    PUT: 'Update or replace existing resources (idempotent)',
                    DELETE: 'Remove resources from the server',
                    PATCH: 'Apply partial modifications to resources'
                },
                tutorialFocus: 'Tutorial demonstrates GET method for resource retrieval',
                bestPractices: [
                    'Always include Allow header in 405 responses',
                    'Provide clear guidance about supported methods',
                    'Use appropriate HTTP methods for different operations',
                    'Validate methods before processing requests'
                ]
            });
        }
        
    } catch (error) {
        // Handle errors during method not allowed processing
        logger.error(`${ERROR_MIDDLEWARE_PREFIX} Failed to handle 405 Method Not Allowed error`, error, {
            attemptedMethod: req?.method,
            fallbackAction: 'Attempting generic error response'
        });
        
        methodTimer.end();
        
        // Fallback to generic error handling
        try {
            errorHandler(error, req, res);
        } catch (fallbackError) {
            logger.error(`${ERROR_MIDDLEWARE_PREFIX} Fallback method error handling failed`, fallbackError);
        }
    }
}

/**
 * Specialized error handler for HTTP 500 Internal Server Error conditions when 
 * unexpected server-side errors occur, providing educational context about server 
 * errors while protecting sensitive error details from client exposure
 * 
 * Educational Note: Server error handling demonstrates proper server-side error
 * management and provides learning opportunities about error security and debugging
 * 
 * @param {Error} error - Server error object with stack trace and error details
 * @param {object} req - HTTP request object that triggered the server error
 * @param {object} res - HTTP response object for sending 500 error response
 * @returns {void} No return value, sends HTTP 500 Internal Server Error response with educational context
 */
function handleServerError(error, req, res) {
    // Start performance timer for server error handling measurement
    const serverErrorTimer = logger.startTimer('server_error_handling');
    
    try {
        // Extract server error details while protecting sensitive information
        const errorMessage = error?.message || 'Unknown server error occurred';
        const errorCode = error?.code || 'UNKNOWN_SERVER_ERROR';
        const requestPath = req?.url || '/';
        const requestMethod = req?.method || 'GET';
        
        // Log comprehensive server error with stack trace for debugging (development only)
        const serverErrorContext = {
            errorMessage: errorMessage,
            errorName: error?.name || 'Error',
            errorCode: errorCode,
            requestPath: requestPath,
            requestMethod: requestMethod,
            statusCode: INTERNAL_SERVER_ERROR,
            errorType: 'server_error',
            timestamp: new Date().toISOString(),
            educational: true,
            concept: 'Unexpected server-side error handling and debugging'
        };
        
        // Include stack trace and detailed error information for development environments
        if (environment === 'development' || environment === 'educational') {
            serverErrorContext.stackTrace = error?.stack ? error.stack.split('\n').slice(0, MAX_ERROR_STACK_DEPTH) : [];
            serverErrorContext.errorDetails = {
                fileName: error?.fileName,
                lineNumber: error?.lineNumber,
                columnNumber: error?.columnNumber
            };
        }
        
        logger.error(`${ERROR_MIDDLEWARE_PREFIX} Handling 500 Internal Server Error`, error, serverErrorContext);
        
        // Determine if error details should be exposed based on environment settings
        const shouldExposeDetails = shouldExposeErrorDetails(error, environment);
        
        // Create educational server error message with appropriate level of detail
        let serverErrorMessage = INTERNAL_SERVER_ERROR_MESSAGE;
        
        if (educational?.errors?.includeEducationalContext) {
            serverErrorMessage += '\n\nEducational Server Error Guidance:';
            serverErrorMessage += '\n- Check the server console output for detailed error information';
            serverErrorMessage += '\n- Review recent code changes that might have caused the issue';
            serverErrorMessage += '\n- Verify all required modules and dependencies are installed';
            serverErrorMessage += '\n- Ensure server has sufficient resources (memory, disk space)';
            serverErrorMessage += '\n- Restart the server if the error persists';
            
            // Include troubleshooting guidance for common server error scenarios
            if (shouldExposeDetails) {
                serverErrorMessage += `\n\nTechnical Details (for educational purposes):`;
                serverErrorMessage += `\n- Error Type: ${error?.name || 'Unknown'}`;
                
                if (errorCode && errorCode !== 'UNKNOWN_SERVER_ERROR') {
                    serverErrorMessage += `\n- Error Code: ${errorCode}`;
                }
                
                // Include safe error message without sensitive information
                const safeErrorMessage = errorMessage ? 
                    errorMessage.substring(0, 200).replace(/[<>'"]/g, '') : 
                    'No specific error message available';
                serverErrorMessage += `\n- Error Message: ${safeErrorMessage}`;
                
                // Add debugging tips specific to the error type
                if (errorCode === 'MODULE_NOT_FOUND') {
                    serverErrorMessage += '\n- Debugging: Check if all dependencies are installed (npm install)';
                } else if (errorCode === 'EADDRINUSE') {
                    serverErrorMessage += '\n- Debugging: Port is already in use, try a different port';
                } else if (errorCode === 'EACCES') {
                    serverErrorMessage += '\n- Debugging: Permission denied, check file and port permissions';
                }
            }
        }
        
        // Generate HTTP 500 response with educational context and debugging tips
        const serverErrorOptions = {
            includeEducationalGuidance: educational?.errors?.includeTroubleshootingTips,
            verboseLogging: true, // Always log server errors verbosely
            enableTiming: educational?.performance?.showTimingInfo,
            includeDebuggingInfo: shouldExposeDetails
        };
        
        // Send server error response while protecting sensitive application information
        generateErrorResponse(res, INTERNAL_SERVER_ERROR, serverErrorMessage, serverErrorOptions);
        
        // Log server error resolution with educational context for learning and debugging
        const resolutionContext = {
            errorCode: errorCode,
            statusCode: INTERNAL_SERVER_ERROR,
            detailsExposed: shouldExposeDetails,
            responseGenerated: true,
            processingTime: serverErrorTimer.end(),
            educational: true,
            recoverable: isRecoverableError(error),
            debuggingNote: 'Server error handled with educational context and security considerations'
        };
        
        logger.info(`${ERROR_MIDDLEWARE_PREFIX} 500 Internal Server Error response sent`, resolutionContext);
        
        // Add educational context about server error handling and debugging
        if (educational?.tutorial?.mode && logging?.demonstratePatterns) {
            logger.info('Educational note: 500 Internal Server Error indicates unexpected server issues', {
                concept: '5xx status codes represent server-side errors that clients cannot resolve',
                pattern: 'Proper server error handling prevents application crashes and provides debugging info',
                security: 'Balance educational value with security by limiting exposed error details',
                httpStandard: 'HTTP 500 indicates generic server error when more specific code unavailable',
                debugging: [
                    'Check server console output for detailed stack traces',
                    'Review error logs for patterns and frequency',
                    'Verify system resources and dependencies',
                    'Use debugging tools for step-by-step analysis'
                ],
                prevention: [
                    'Implement comprehensive error handling with try-catch blocks',
                    'Validate input parameters before processing',
                    'Monitor server resources and performance metrics',
                    'Use proper logging for debugging assistance'
                ]
            });
        }
        
    } catch (handlerError) {
        // Handle errors within the server error handler itself
        logger.error(`${ERROR_MIDDLEWARE_PREFIX} Critical error in server error handler`, handlerError, {
            originalError: error?.message,
            criticalFailure: true,
            troubleshooting: 'Server error handler failed - indicates serious system issue'
        });
        
        serverErrorTimer.end();
        
        // Attempt emergency response without educational features
        try {
            if (res && !res.headersSent && typeof res.writeHead === 'function' && typeof res.end === 'function') {
                res.writeHead(INTERNAL_SERVER_ERROR, { 'Content-Type': 'text/plain' });
                res.end('Critical Server Error: Unable to process error response');
            }
        } catch (emergencyError) {
            logger.error(`${ERROR_MIDDLEWARE_PREFIX} Emergency server error response failed`, emergencyError);
        }
    }
}

/**
 * Specialized error handler for request validation errors including invalid parameters, 
 * headers, or request format issues, providing educational feedback about proper HTTP 
 * request formatting and tutorial endpoint requirements
 * 
 * Educational Note: Validation error handling demonstrates proper input validation
 * patterns and provides learning opportunities about data validation and security
 * 
 * @param {Error} validationError - Validation error object with validation failure details
 * @param {object} req - HTTP request object that failed validation
 * @param {object} res - HTTP response object for sending validation error response
 * @returns {void} No return value, sends HTTP 400 Bad Request response with validation guidance
 */
function handleValidationError(validationError, req, res) {
    // Start performance timer for validation error handling measurement
    const validationTimer = logger.startTimer('validation_error_handling');
    
    try {
        // Extract validation error details and identify specific validation failures
        const errorMessage = validationError?.message || 'Request validation failed';
        const validationField = validationError?.field || 'unknown';
        const validationValue = validationError?.value;
        const requestPath = req?.url || '/';
        const requestMethod = req?.method || 'GET';
        
        // Log validation error with request context and educational information
        const validationContext = {
            errorMessage: errorMessage,
            validationField: validationField,
            validationValue: validationValue,
            requestPath: requestPath,
            requestMethod: requestMethod,
            statusCode: BAD_REQUEST,
            errorType: 'validation_error',
            timestamp: new Date().toISOString(),
            educational: true,
            concept: 'Request parameter validation and input sanitization'
        };
        
        logger.warn(`${ERROR_MIDDLEWARE_PREFIX} Handling validation error`, validationContext);
        
        // Generate educational error message explaining proper request format
        let validationErrorMessage = errorMessage;
        
        if (educational?.errors?.includeEducationalContext) {
            validationErrorMessage += '\n\nValidation Error Guidance:';
            validationErrorMessage += '\n- Check that all required parameters are provided';
            validationErrorMessage += '\n- Verify parameter data types match expected formats';
            validationErrorMessage += '\n- Ensure parameter values are within acceptable ranges';
            validationErrorMessage += '\n- Review API documentation for parameter requirements';
            
            // Include examples of correct request formatting for tutorial endpoints
            if (validationField && validationField !== 'unknown') {
                validationErrorMessage += `\n\nField-Specific Guidance for '${validationField}':`;
                validationErrorMessage += `\n- Check the format and value requirements for this field`;
                validationErrorMessage += `\n- Refer to examples or documentation for proper formatting`;
                
                if (validationValue !== undefined) {
                    validationErrorMessage += `\n- Provided value: ${validationValue}`;
                }
            }
            
            // Add troubleshooting guidance specific to validation requirements
            validationErrorMessage += '\n\nValidation Troubleshooting:';
            validationErrorMessage += '\n• Ensure all required fields are present and not empty';
            validationErrorMessage += '\n• Check data types (string, number, boolean) match expectations';
            validationErrorMessage += '\n• Verify field values are within allowed ranges or patterns';
            validationErrorMessage += '\n• Use validation tools or examples to test format requirements';
            
            // Include educational content about input validation importance
            validationErrorMessage += '\n\nEducational Note:';
            validationErrorMessage += '\n- Input validation prevents security vulnerabilities';
            validationErrorMessage += '\n- Validation helps maintain data integrity and consistency';
            validationErrorMessage += '\n- Proper validation provides clear feedback to API consumers';
            validationErrorMessage += '\n- Validation errors are recoverable client errors (4xx status)';
        }
        
        // Generate HTTP 400 response with educational validation error content
        const validationOptions = {
            includeEducationalGuidance: educational?.errors?.includeTroubleshootingTips,
            verboseLogging: logging?.verboseMode,
            enableTiming: educational?.performance?.showTimingInfo,
            includeValidationInfo: true
        };
        
        // Send validation error response with detailed guidance and examples
        generateErrorResponse(res, BAD_REQUEST, validationErrorMessage, validationOptions);
        
        // Log validation error resolution with educational context for learning improvement
        const resolutionContext = {
            validationField: validationField,
            validationValue: validationValue,
            statusCode: BAD_REQUEST,
            responseGenerated: true,
            processingTime: validationTimer.end(),
            educational: true,
            recoverable: true,
            learningNote: 'Client provided guidance for proper request formatting'
        };
        
        logger.info(`${ERROR_MIDDLEWARE_PREFIX} Validation error response sent`, resolutionContext);
        
        // Add educational context about input validation and security
        if (educational?.tutorial?.mode && logging?.demonstratePatterns) {
            logger.info('Educational note: Request validation ensures data integrity and security', {
                concept: 'Input validation prevents malicious data and maintains system integrity',
                pattern: 'Validate all user input before processing to prevent security issues',
                httpStandard: 'HTTP 400 Bad Request indicates client provided invalid or malformed data',
                security: [
                    'Validation prevents injection attacks and data corruption',
                    'Sanitize input data to remove potentially dangerous content',
                    'Use whitelist validation instead of blacklist filtering',
                    'Provide clear error messages without revealing system internals'
                ],
                bestPractices: [
                    'Validate data types, formats, and ranges for all input fields',
                    'Use server-side validation even with client-side validation',
                    'Provide specific error messages for each validation failure',
                    'Log validation errors for monitoring and security analysis'
                ],
                tutorialFocus: 'Tutorial demonstrates proper validation error handling patterns'
            });
        }
        
    } catch (error) {
        // Handle errors during validation error processing
        logger.error(`${ERROR_MIDDLEWARE_PREFIX} Failed to handle validation error`, error, {
            originalValidationError: validationError?.message,
            fallbackAction: 'Attempting generic error response'
        });
        
        validationTimer.end();
        
        // Fallback to generic error handling
        try {
            errorHandler(error, req, res);
        } catch (fallbackError) {
            logger.error(`${ERROR_MIDDLEWARE_PREFIX} Fallback validation error handling failed`, fallbackError);
        }
    }
}

// =============================================================================
// UTILITY FUNCTIONS FOR ERROR HANDLING
// =============================================================================

/**
 * Utility function that logs errors with comprehensive educational context including 
 * request details, application state, and troubleshooting guidance for enhanced 
 * learning and debugging assistance
 * 
 * Educational Note: Centralized error logging ensures consistent error documentation
 * and provides learning opportunities about logging best practices and debugging
 * 
 * @param {Error} error - Error object to log with educational formatting
 * @param {object} req - HTTP request object for request context
 * @param {object} additionalContext - Optional additional context for error logging
 * @returns {void} No return value, outputs comprehensive error log with educational context
 */
function logErrorWithContext(error, req, additionalContext = {}) {
    try {
        // Extract error information including type, message, and stack trace
        const errorInfo = {
            errorName: error?.name || 'Error',
            errorMessage: error?.message || 'Unknown error occurred',
            errorType: error?.errorType || 'unknown',
            errorCode: error?.code,
            statusCode: error?.statusCode,
            timestamp: new Date().toISOString()
        };
        
        // Gather request context including method, URL, headers, and timing information
        const requestContext = {
            method: req?.method || 'UNKNOWN',
            url: req?.url || '/',
            headers: req?.headers || {},
            remoteAddress: req?.socket?.remoteAddress,
            userAgent: req?.headers?.['user-agent'],
            requestTime: req?.requestStartTime || Date.now()
        };
        
        // Compile additional context including application state and configuration
        const applicationContext = {
            environment: environment,
            educationalMode: educational?.tutorial?.mode,
            nodeVersion: process.version,
            platform: process.platform,
            uptime: Math.floor(process.uptime()),
            memoryUsage: process.memoryUsage(),
            ...additionalContext
        };
        
        // Format error log with educational prefix and consistent structure
        const logContext = {
            ...errorInfo,
            request: requestContext,
            application: applicationContext,
            educational: true,
            middlewareType: 'error_logging'
        };
        
        // Include troubleshooting guidance appropriate for error type and context
        if (educational?.errors?.includeTroubleshootingTips) {
            logContext.troubleshooting = getTroubleshootingGuidance(errorInfo.errorType || 'general', {
                errorCode: errorInfo.errorCode,
                method: requestContext.method,
                url: requestContext.url
            });
        }
        
        // Add educational tips for error prevention and debugging assistance
        if (educational?.errors?.includeEducationalContext) {
            logContext.educational_tips = [
                'Use console.log() to trace execution flow and variable values',
                'Read error messages carefully for specific clues about the problem',
                'Check the stack trace to identify the exact location of the error',
                'Review recent code changes that might have introduced the issue',
                'Use Node.js debugging tools for step-by-step code analysis'
            ];
        }
        
        // Output comprehensive error log using logger with appropriate level
        logErrorWithContext(error, logContext, {
            level: 'error',
            educational: true,
            includeStackTrace: environment === 'development' || environment === 'educational'
        });
        
        // Track error patterns for educational insights and application improvement
        if (educational?.tutorial?.mode && logging?.verboseMode) {
            logger.info('Educational error pattern tracking', {
                errorPattern: `${errorInfo.errorType || 'unknown'}_${errorInfo.errorCode || 'generic'}`,
                frequency: 'tracked_for_educational_insights',
                learningValue: 'Error patterns help identify common issues and improvement opportunities'
            });
        }
        
    } catch (loggingError) {
        // Handle errors in error logging itself
        console.error(`${ERROR_MIDDLEWARE_PREFIX} Failed to log error with educational context:`, loggingError);
        console.error(`${ERROR_MIDDLEWARE_PREFIX} Original error was:`, error);
    }
}

/**
 * Utility function that analyzes error objects to classify error types for appropriate 
 * handling strategies, educational categorization, and response generation with proper 
 * HTTP status codes and messaging
 * 
 * Educational Note: Error type classification helps students understand different
 * error patterns and appropriate handling strategies for each category
 * 
 * @param {Error} error - Error object to analyze for type classification
 * @param {object} context - Optional context information for error analysis
 * @returns {string} Error type classification string for handling strategy determination
 */
function determineErrorType(error, context = {}) {
    try {
        // Examine error object properties including name, message, and custom properties
        const errorName = error?.name || '';
        const errorMessage = error?.message || '';
        const errorCode = error?.code || '';
        const statusCode = error?.statusCode;
        
        // Check for specific error types including EducationalError instances
        if (error instanceof EducationalError) {
            return error.errorType || 'educational';
        }
        
        // Analyze HTTP status code for error type classification
        if (statusCode) {
            if (statusCode >= 400 && statusCode < 500) {
                return 'client_error';
            } else if (statusCode >= 500 && statusCode < 600) {
                return 'server_error';
            }
        }
        
        // Analyze error message patterns for common error classifications
        const messagePatterns = [
            { pattern: /not found|404/i, type: 'not_found' },
            { pattern: /method not allowed|405/i, type: 'method_not_allowed' },
            { pattern: /validation|invalid|bad request/i, type: 'validation' },
            { pattern: /timeout|timed out/i, type: 'timeout' },
            { pattern: /permission|access|unauthorized/i, type: 'authorization' },
            { pattern: /server|internal|500/i, type: 'server_error' },
            { pattern: /network|connection|econnrefused/i, type: 'network' }
        ];
        
        for (const { pattern, type } of messagePatterns) {
            if (pattern.test(errorMessage)) {
                return type;
            }
        }
        
        // Analyze error code patterns for system-level error classification
        const codePatterns = [
            { pattern: /^E[A-Z]+$/, type: 'system_error' },
            { pattern: /MODULE_NOT_FOUND/i, type: 'dependency_error' },
            { pattern: /SYNTAX|REFERENCE/i, type: 'code_error' },
            { pattern: /TIMEOUT/i, type: 'timeout' },
            { pattern: /VALIDATION/i, type: 'validation' }
        ];
        
        for (const { pattern, type } of codePatterns) {
            if (pattern.test(errorCode)) {
                return type;
            }
        }
        
        // Consider request context and application state for error type determination
        const requestMethod = context.req?.method;
        const requestUrl = context.req?.url;
        
        if (requestUrl && !requestUrl.startsWith('/')) {
            return 'malformed_request';
        }
        
        if (requestMethod && !['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH'].includes(requestMethod)) {
            return 'invalid_method';
        }
        
        // Apply educational error classification criteria for tutorial context
        if (educational?.tutorial?.mode) {
            // Tutorial-specific error classification
            if (requestUrl === '/hello' && requestMethod !== 'GET') {
                return 'tutorial_method_error';
            }
            
            if (requestUrl && requestUrl !== '/hello' && requestUrl !== '/') {
                return 'tutorial_endpoint_error';
            }
        }
        
        // Return appropriate error type string for handling strategy selection
        return 'unknown_error';
        
    } catch (classificationError) {
        // Handle errors during error classification
        logger.warn(`${ERROR_MIDDLEWARE_PREFIX} Failed to classify error type`, {
            classificationError: classificationError.message,
            originalError: error?.message,
            fallbackType: 'unknown_error'
        });
        
        return 'unknown_error';
    }
}

/**
 * Utility function that creates comprehensive error context objects containing request 
 * details, application state, and educational metadata for enhanced error handling and 
 * troubleshooting guidance
 * 
 * Educational Note: Error context creation provides structured error information
 * for consistent error handling and debugging assistance throughout the application
 * 
 * @param {Error} error - Error object requiring context creation
 * @param {object} req - HTTP request object for context extraction
 * @param {object} options - Optional configuration for context creation
 * @returns {object} Comprehensive error context object with request details and educational metadata
 */
function createErrorContext(error, req, options = {}) {
    try {
        // Extract options with defaults
        const {
            includeHeaders = false,
            includeTiming = false,
            includeSystemInfo = false,
            educational = true
        } = options;
        
        // Extract request information including method, URL, headers, and timing
        const requestInfo = {
            method: req?.method || 'UNKNOWN',
            url: req?.url || '/',
            protocol: req?.protocol || 'http',
            httpVersion: req?.httpVersion,
            remoteAddress: req?.socket?.remoteAddress,
            remotePort: req?.socket?.remotePort
        };
        
        // Include headers if requested and available
        if (includeHeaders && req?.headers) {
            requestInfo.headers = {
                'user-agent': req.headers['user-agent'],
                'accept': req.headers['accept'],
                'content-type': req.headers['content-type'],
                'content-length': req.headers['content-length'],
                'authorization': req.headers['authorization'] ? '[REDACTED]' : undefined
            };
            
            // Remove undefined header values
            Object.keys(requestInfo.headers).forEach(key => {
                if (requestInfo.headers[key] === undefined) {
                    delete requestInfo.headers[key];
                }
            });
        }
        
        // Gather application state including configuration and environment details
        const applicationInfo = {
            environment: environment,
            educationalMode: educational && educational?.tutorial?.mode,
            nodeVersion: process.version,
            platform: process.platform,
            architecture: process.arch
        };
        
        // Include timing information if requested
        if (includeTiming) {
            applicationInfo.timing = {
                requestStartTime: req?.requestStartTime || Date.now(),
                currentTime: Date.now(),
                uptime: Math.floor(process.uptime())
            };
        }
        
        // Include system information if requested
        if (includeSystemInfo) {
            applicationInfo.system = {
                pid: process.pid,
                memoryUsage: process.memoryUsage(),
                loadAverage: process.platform !== 'win32' ? require('os').loadavg() : null,
                freeMemory: require('os').freemem(),
                totalMemory: require('os').totalmem()
            };
        }
        
        // Create educational metadata including learning context and guidance
        const educationalInfo = {};
        if (educational) {
            educationalInfo.context = {
                tutorialMode: educational?.tutorial?.mode || false,
                learningObjective: 'Understanding error handling and debugging techniques',
                concept: 'Comprehensive error context for debugging and learning',
                debuggingTips: [
                    'Examine error message for specific clues about the issue',
                    'Check request details for malformed or invalid data',
                    'Review application state for resource or configuration issues',
                    'Use error context to trace the source and impact of errors'
                ]
            };
            
            // Include troubleshooting information specific to error type and request
            const errorType = determineErrorType(error, { req });
            educationalInfo.troubleshooting = getTroubleshootingGuidance(errorType, {
                method: requestInfo.method,
                url: requestInfo.url,
                errorCode: error?.code
            });
        }
        
        // Add debugging assistance and educational tips for error resolution
        const debuggingInfo = {
            errorName: error?.name || 'Error',
            errorMessage: error?.message || 'Unknown error',
            errorCode: error?.code,
            statusCode: error?.statusCode,
            timestamp: new Date().toISOString(),
            recoverable: isRecoverableError(error)
        };
        
        // Format context object with consistent structure and educational value
        const errorContext = {
            error: debuggingInfo,
            request: requestInfo,
            application: applicationInfo,
            ...(educational && { educational: educationalInfo }),
            metadata: {
                contextCreated: new Date().toISOString(),
                contextVersion: '1.0.0',
                educational: educational
            }
        };
        
        // Return comprehensive error context for enhanced error handling and logging
        return errorContext;
        
    } catch (contextError) {
        // Handle errors during context creation
        logger.warn(`${ERROR_MIDDLEWARE_PREFIX} Failed to create error context`, {
            contextError: contextError.message,
            fallbackContext: {
                error: { message: error?.message || 'Unknown error' },
                request: { method: req?.method, url: req?.url },
                timestamp: new Date().toISOString()
            }
        });
        
        // Return minimal fallback context
        return {
            error: { message: error?.message || 'Unknown error' },
            request: { method: req?.method || 'UNKNOWN', url: req?.url || '/' },
            timestamp: new Date().toISOString(),
            contextCreationFailed: true
        };
    }
}

/**
 * Utility function that determines whether detailed error information should be 
 * exposed to clients based on environment settings, error type, and educational 
 * configuration for appropriate error disclosure and security
 * 
 * Educational Note: Error detail exposure balances educational value with security
 * considerations, demonstrating proper error information handling in different environments
 * 
 * @param {Error} error - Error object to evaluate for detail exposure
 * @param {string} environment - Current application environment
 * @returns {boolean} True if error details should be exposed to client, false for minimal disclosure
 */
function shouldExposeErrorDetails(error, environment) {
    try {
        // Check application environment for error detail exposure settings
        if (environment === 'production') {
            // Production environment should never expose detailed error information
            return false;
        }
        
        if (environment === 'development' || environment === 'educational') {
            // Development and educational environments can expose details for learning
            return true;
        }
        
        // Evaluate error type for sensitivity and security considerations
        const errorType = determineErrorType(error);
        const sensitiveErrorTypes = [
            'authentication_error',
            'authorization_error',
            'database_error',
            'configuration_error',
            'security_error'
        ];
        
        if (sensitiveErrorTypes.includes(errorType)) {
            // Never expose sensitive error types regardless of environment
            return false;
        }
        
        // Consider educational mode settings for enhanced error visibility
        if (educational?.errors?.includeEducationalContext) {
            // Educational mode enables detailed error information for learning
            return true;
        }
        
        // Apply security guidelines for error information disclosure
        const safeErrorTypes = [
            'validation',
            'not_found',
            'method_not_allowed',
            'client_error',
            'tutorial_endpoint_error',
            'tutorial_method_error'
        ];
        
        if (safeErrorTypes.includes(errorType)) {
            // Safe error types can expose details for troubleshooting
            return true;
        }
        
        // Balance educational value with security and privacy requirements
        if (educational?.tutorial?.mode && environment !== 'production') {
            // Tutorial mode in non-production can expose details for learning
            return true;
        }
        
        // Return boolean decision for error detail exposure to clients
        return false;
        
    } catch (exposureError) {
        // Handle errors during exposure determination
        logger.warn(`${ERROR_MIDDLEWARE_PREFIX} Failed to determine error detail exposure`, {
            exposureError: exposureError.message,
            defaultDecision: false
        });
        
        // Default to not exposing details for security
        return false;
    }
}

// =============================================================================
// ERROR MIDDLEWARE CLASS
// =============================================================================

/**
 * Main error middleware class that encapsulates comprehensive error handling functionality
 * for the Node.js tutorial application, providing centralized error processing, educational
 * error responses, and consistent error logging with tutorial-specific features and learning assistance
 * 
 * Educational Note: Error middleware class demonstrates object-oriented error handling
 * patterns and provides structured approach to error management with educational features
 */
class ErrorMiddleware {
    /**
     * Initializes ErrorMiddleware instance with configuration settings, logging setup,
     * and educational error handling features for comprehensive error management throughout
     * the tutorial application
     * 
     * Educational Note: Constructor pattern establishes error middleware state with
     * educational features while maintaining compatibility with Express-style middleware
     * 
     * @param {object} options - Optional configuration object with error handling preferences and educational settings
     */
    constructor(options = {}) {
        // Merge provided options with default error middleware configuration
        this.config = {
            educationalMode: educational?.tutorial?.mode || false,
            verboseLogging: logging?.verboseMode || false,
            includeStackTraces: environment === 'development' || environment === 'educational',
            exposureSettings: {
                development: true,
                educational: true,
                production: false,
                test: false
            },
            ...options
        };
        
        // Initialize logger instance for educational error logging and tracking
        this.logger = logger;
        
        // Set up educational mode features and enhanced error messaging
        this.educationalMode = this.config.educationalMode;
        
        // Configure error counters and statistics tracking for analytics
        this.errorCounters = {
            total: 0,
            byType: {},
            byStatusCode: {},
            lastReset: new Date().toISOString()
        };
        
        // Initialize error type classification and handling strategies
        this.errorTypes = {
            CLIENT_ERROR: 'client_error',
            SERVER_ERROR: 'server_error',
            VALIDATION_ERROR: 'validation_error',
            NOT_FOUND: 'not_found',
            METHOD_NOT_ALLOWED: 'method_not_allowed',
            EDUCATIONAL: 'educational'
        };
        
        // Set up troubleshooting guidance and educational content systems
        this.troubleshootingDatabase = new Map([
            ['not_found', 'Check URL spelling and ensure endpoint exists'],
            ['method_not_allowed', 'Verify HTTP method is supported for the endpoint'],
            ['validation_error', 'Check request parameters and data formats'],
            ['server_error', 'Review server logs and check system resources'],
            ['timeout', 'Increase timeout values or optimize request processing']
        ]);
        
        // Prepare error response formatting and educational context generation
        this.responseFormats = {
            json: 'application/json',
            text: 'text/plain',
            html: 'text/html'
        };
        
        // Log middleware initialization for educational transparency
        if (this.educationalMode) {
            this.logger.info(`${ERROR_MIDDLEWARE_PREFIX} ErrorMiddleware initialized with educational features`, {
                educationalMode: this.educationalMode,
                verboseLogging: this.config.verboseLogging,
                includeStackTraces: this.config.includeStackTraces,
                environment: environment
            });
        }
    }
    
    /**
     * Main error handling method that processes errors with educational context, determines
     * appropriate response strategies, and generates comprehensive error responses with
     * troubleshooting guidance for learning purposes
     * 
     * Educational Note: Method demonstrates comprehensive error processing with educational
     * context while maintaining standard middleware interface compatibility
     * 
     * @param {Error} error - Error object from application processing
     * @param {object} req - HTTP request object with request details
     * @param {object} res - HTTP response object for error response generation
     * @returns {void} No return value, processes error and sends appropriate HTTP error response
     */
    handleError(error, req, res) {
        // Start performance timer for error handling measurement
        const handlingTimer = this.logger.startTimer('error_middleware_handle_error');
        
        try {
            // Validate error and request/response objects for proper error handling
            if (!error) {
                this.logger.warn(`${ERROR_MIDDLEWARE_PREFIX} No error object provided to handleError method`);
                error = new Error('Unknown error occurred in application');
            }
            
            if (!res || typeof res.writeHead !== 'function') {
                this.logger.error(`${ERROR_MIDDLEWARE_PREFIX} Invalid response object provided to handleError`);
                return;
            }
            
            // Log error occurrence with comprehensive educational context
            this.logger.error(`${ERROR_MIDDLEWARE_PREFIX} Processing error through ErrorMiddleware`, error, {
                errorName: error.name,
                errorMessage: error.message,
                requestUrl: req?.url,
                requestMethod: req?.method,
                educational: this.educationalMode,
                middlewareVersion: '1.0.0'
            });
            
            // Classify error type using error analysis and classification utilities
            const errorType = this.classifyError(error, req);
            
            // Determine appropriate HTTP status code based on error type and context
            const statusCode = this.determineStatusCode(error, errorType);
            
            // Create educational error response with troubleshooting guidance
            const errorResponse = this.generateEducationalErrorResponse(error, {
                errorType: errorType,
                statusCode: statusCode,
                request: req,
                educational: this.educationalMode
            });
            
            // Generate and send formatted error response to client
            this.sendErrorResponse(res, statusCode, errorResponse);
            
            // Update error statistics and tracking for educational analytics
            this.updateErrorStatistics(errorType, {
                statusCode: statusCode,
                errorName: error.name,
                timestamp: new Date().toISOString()
            });
            
            // Log error resolution completion with educational context and metrics
            const processingTime = handlingTimer.end();
            this.logger.info(`${ERROR_MIDDLEWARE_PREFIX} Error handling completed`, {
                errorType: errorType,
                statusCode: statusCode,
                processingTime: processingTime,
                resolved: true,
                educational: this.educationalMode
            });
            
        } catch (handlingError) {
            // Handle errors within the error handling method itself
            this.logger.error(`${ERROR_MIDDLEWARE_PREFIX} Critical error in handleError method`, handlingError, {
                originalError: error?.message,
                criticalFailure: true
            });
            
            handlingTimer.end();
            
            // Attempt emergency response
            try {
                this.sendEmergencyResponse(res, handlingError);
            } catch (emergencyError) {
                this.logger.error(`${ERROR_MIDDLEWARE_PREFIX} Emergency response failed`, emergencyError);
            }
        }
    }
    
    /**
     * Generates educational error responses with comprehensive troubleshooting guidance,
     * learning context, and tutorial-specific messaging for enhanced learning experience
     * and debugging assistance
     * 
     * Educational Note: Educational error response generation demonstrates comprehensive
     * error formatting with learning context and troubleshooting assistance
     * 
     * @param {Error} error - Error object to format for educational response
     * @param {object} context - Error context with request and application details
     * @returns {object} Educational error response object with guidance and learning context
     */
    generateEducationalErrorResponse(error, context = {}) {
        try {
            // Extract error information and educational context for response generation
            const {
                errorType = 'unknown',
                statusCode = INTERNAL_SERVER_ERROR,
                request = {},
                educational = this.educationalMode
            } = context;
            
            // Create base error response object
            const errorResponse = {
                error: true,
                status: statusCode,
                type: errorType,
                message: error.message || 'An error occurred while processing your request',
                timestamp: new Date().toISOString()
            };
            
            // Create tutorial-specific error message with learning objectives
            if (educational) {
                errorResponse.educational = {
                    concept: this.getEducationalConcept(errorType),
                    learningObjective: this.getLearningObjective(errorType),
                    troubleshooting: this.getTroubleshootingGuidance(errorType, error),
                    nextSteps: this.getNextSteps(errorType, request)
                };
                
                // Include comprehensive troubleshooting guidance and debugging tips
                errorResponse.troubleshooting = {
                    immediate: this.getImmediateActions(errorType, error),
                    investigation: this.getInvestigationSteps(errorType, error),
                    prevention: this.getPreventionTips(errorType, error)
                };
                
                // Add educational examples and proper usage guidance
                if (this.config.includeExamples) {
                    errorResponse.examples = this.getUsageExamples(errorType, request);
                }
            }
            
            // Include debugging information for development environments
            if (this.config.includeStackTraces && error.stack) {
                errorResponse.debug = {
                    stackTrace: error.stack.split('\n').slice(0, MAX_ERROR_STACK_DEPTH),
                    errorCode: error.code,
                    fileName: error.fileName,
                    lineNumber: error.lineNumber
                };
            }
            
            // Format response with consistent educational structure and prefixes
            errorResponse.metadata = {
                middleware: 'ErrorMiddleware',
                version: '1.0.0',
                educational: educational,
                environment: environment,
                generated: new Date().toISOString()
            };
            
            // Include performance and learning metrics for educational value
            if (this.config.includeMetrics) {
                errorResponse.metrics = {
                    totalErrors: this.errorCounters.total,
                    errorsByType: this.errorCounters.byType,
                    processingTime: Date.now() - (request.startTime || Date.now())
                };
            }
            
            // Return complete educational error response ready for client delivery
            return errorResponse;
            
        } catch (responseError) {
            // Handle errors during educational response generation
            this.logger.error(`${ERROR_MIDDLEWARE_PREFIX} Failed to generate educational error response`, responseError);
            
            // Return minimal fallback response
            return {
                error: true,
                status: statusCode || INTERNAL_SERVER_ERROR,
                message: error?.message || 'Error occurred while processing request',
                timestamp: new Date().toISOString(),
                responseGenerationFailed: true
            };
        }
    }
    
    /**
     * Updates error statistics and tracking information for educational analytics,
     * providing insights into common error patterns and learning opportunities for
     * tutorial improvement and debugging assistance
     * 
     * Educational Note: Error statistics tracking provides insights into application
     * behavior and helps identify areas for improvement and learning focus
     * 
     * @param {string} errorType - Classification of error type for statistics tracking
     * @param {object} errorDetails - Error details and context for analytics
     * @returns {void} No return value, updates internal error statistics and tracking
     */
    updateErrorStatistics(errorType, errorDetails = {}) {
        try {
            // Extract error type and classification for statistics categorization
            const {
                statusCode,
                errorName,
                timestamp = new Date().toISOString()
            } = errorDetails;
            
            // Update error counters and frequency tracking for analytics
            this.errorCounters.total += 1;
            
            // Update error type statistics
            if (!this.errorCounters.byType[errorType]) {
                this.errorCounters.byType[errorType] = {
                    count: 0,
                    firstOccurrence: timestamp,
                    lastOccurrence: timestamp
                };
            }
            this.errorCounters.byType[errorType].count += 1;
            this.errorCounters.byType[errorType].lastOccurrence = timestamp;
            
            // Update status code statistics
            if (statusCode) {
                if (!this.errorCounters.byStatusCode[statusCode]) {
                    this.errorCounters.byStatusCode[statusCode] = {
                        count: 0,
                        firstOccurrence: timestamp,
                        lastOccurrence: timestamp
                    };
                }
                this.errorCounters.byStatusCode[statusCode].count += 1;
                this.errorCounters.byStatusCode[statusCode].lastOccurrence = timestamp;
            }
            
            // Record error patterns and trends for educational insights
            if (this.educationalMode && this.config.verboseLogging) {
                this.logger.debug(`${ERROR_MIDDLEWARE_PREFIX} Error statistics updated`, {
                    totalErrors: this.errorCounters.total,
                    errorType: errorType,
                    statusCode: statusCode,
                    errorName: errorName,
                    educational: true,
                    analytics: 'Error tracking for tutorial improvement'
                });
            }
            
            // Track error resolution metrics and response times
            if (errorDetails.processingTime) {
                if (!this.errorCounters.byType[errorType].processingTimes) {
                    this.errorCounters.byType[errorType].processingTimes = [];
                }
                this.errorCounters.byType[errorType].processingTimes.push(errorDetails.processingTime);
            }
            
            // Update troubleshooting effectiveness and guidance analytics
            if (this.educationalMode) {
                // Track which troubleshooting guidance is most commonly needed
                const guidanceKey = `${errorType}_troubleshooting`;
                if (!this.errorCounters[guidanceKey]) {
                    this.errorCounters[guidanceKey] = 0;
                }
                this.errorCounters[guidanceKey] += 1;
            }
            
            // Log statistical updates for educational monitoring and improvement
            if (this.errorCounters.total % 10 === 0 && this.educationalMode) {
                this.logger.info(`${ERROR_MIDDLEWARE_PREFIX} Error statistics milestone reached`, {
                    totalErrors: this.errorCounters.total,
                    topErrorTypes: this.getTopErrorTypes(),
                    educational: true,
                    insight: 'Regular statistics help identify improvement opportunities'
                });
            }
            
        } catch (statsError) {
            // Handle errors during statistics updates
            this.logger.warn(`${ERROR_MIDDLEWARE_PREFIX} Failed to update error statistics`, {
                statsError: statsError.message,
                errorType: errorType,
                troubleshooting: 'Statistics tracking error - analytics may be incomplete'
            });
        }
    }
    
    // =============================================================================
    // HELPER METHODS FOR ERROR MIDDLEWARE CLASS
    // =============================================================================
    
    /**
     * Classifies error based on type, code, and context
     */
    classifyError(error, req) {
        if (error instanceof EducationalError) {
            return error.errorType || this.errorTypes.EDUCATIONAL;
        }
        
        if (error.statusCode >= 400 && error.statusCode < 500) {
            return this.errorTypes.CLIENT_ERROR;
        }
        
        if (error.statusCode >= 500) {
            return this.errorTypes.SERVER_ERROR;
        }
        
        return determineErrorType(error, { req });
    }
    
    /**
     * Determines appropriate HTTP status code for error type
     */
    determineStatusCode(error, errorType) {
        if (error.statusCode) {
            return error.statusCode;
        }
        
        const statusMapping = {
            'not_found': NOT_FOUND,
            'method_not_allowed': METHOD_NOT_ALLOWED,
            'validation_error': BAD_REQUEST,
            'client_error': BAD_REQUEST,
            'server_error': INTERNAL_SERVER_ERROR
        };
        
        return statusMapping[errorType] || INTERNAL_SERVER_ERROR;
    }
    
    /**
     * Sends error response with appropriate headers and content
     */
    sendErrorResponse(res, statusCode, errorResponse) {
        try {
            if (res.headersSent) {
                return;
            }
            
            const responseJson = JSON.stringify(errorResponse, null, 2);
            
            res.writeHead(statusCode, {
                'Content-Type': 'application/json; charset=utf-8',
                'Content-Length': Buffer.byteLength(responseJson),
                'X-Tutorial-Error': 'true',
                'X-Error-Middleware': 'ErrorMiddleware'
            });
            
            res.end(responseJson);
        } catch (sendError) {
            this.logger.error(`${ERROR_MIDDLEWARE_PREFIX} Failed to send error response`, sendError);
            this.sendEmergencyResponse(res, sendError);
        }
    }
    
    /**
     * Sends emergency response when normal error handling fails
     */
    sendEmergencyResponse(res, error) {
        try {
            if (!res.headersSent) {
                res.writeHead(INTERNAL_SERVER_ERROR, { 'Content-Type': 'text/plain' });
                res.end('Critical Error: Unable to process error response');
            }
        } catch (emergencyError) {
            this.logger.error(`${ERROR_MIDDLEWARE_PREFIX} Emergency response failed`, emergencyError);
        }
    }
    
    /**
     * Gets educational concept for error type
     */
    getEducationalConcept(errorType) {
        const concepts = {
            'not_found': 'HTTP 404 errors indicate requested resources do not exist',
            'method_not_allowed': 'HTTP 405 errors occur when unsupported methods are used',
            'validation_error': 'Input validation prevents security issues and data corruption',
            'server_error': 'Server errors require debugging and system resource checks'
        };
        
        return concepts[errorType] || 'Error handling provides feedback about system state';
    }
    
    /**
     * Gets learning objective for error type
     */
    getLearningObjective(errorType) {
        const objectives = {
            'not_found': 'Learn URL routing and endpoint design patterns',
            'method_not_allowed': 'Understand HTTP methods and RESTful API design',
            'validation_error': 'Practice input validation and security best practices',
            'server_error': 'Develop debugging skills and error investigation techniques'
        };
        
        return objectives[errorType] || 'Understand error handling and debugging techniques';
    }
    
    /**
     * Gets troubleshooting guidance for error type
     */
    getTroubleshootingGuidance(errorType, error) {
        return getTroubleshootingGuidance(errorType, {
            errorCode: error?.code,
            errorMessage: error?.message
        });
    }
    
    /**
     * Gets next steps for error resolution
     */
    getNextSteps(errorType, request) {
        const nextSteps = {
            'not_found': [
                'Check URL spelling and path structure',
                'Verify endpoint exists in application routing',
                'Try the /hello endpoint for tutorial demonstration'
            ],
            'method_not_allowed': [
                'Use GET method for tutorial endpoints',
                'Check HTTP method requirements in documentation',
                'Test with curl -X GET or browser navigation'
            ],
            'validation_error': [
                'Review request parameters and data types',
                'Check parameter formatting and requirements',
                'Validate input against API documentation'
            ]
        };
        
        return nextSteps[errorType] || [
            'Check error message for specific guidance',
            'Review server logs for additional information',
            'Consult tutorial documentation for help'
        ];
    }
    
    /**
     * Gets immediate actions for error type
     */
    getImmediateActions(errorType, error) {
        const actions = {
            'not_found': 'Verify the URL path and try /hello endpoint',
            'method_not_allowed': 'Use GET method instead of ' + (error?.attemptedMethod || 'current method'),
            'validation_error': 'Check request parameters and data formats',
            'server_error': 'Check server console output and restart if needed'
        };
        
        return actions[errorType] || 'Review error message and check server status';
    }
    
    /**
     * Gets investigation steps for error type
     */
    getInvestigationSteps(errorType, error) {
        return [
            'Examine error message for specific details',
            'Check server logs for additional context',
            'Review recent changes that might cause the issue',
            'Test with different request parameters or methods',
            'Verify server configuration and dependencies'
        ];
    }
    
    /**
     * Gets prevention tips for error type
     */
    getPreventionTips(errorType, error) {
        return [
            'Implement proper input validation',
            'Use consistent error handling patterns',
            'Add comprehensive logging for debugging',
            'Test edge cases and error conditions',
            'Monitor application performance and errors'
        ];
    }
    
    /**
     * Gets usage examples for error type
     */
    getUsageExamples(errorType, request) {
        if (errorType === 'not_found') {
            return {
                correct: 'http://localhost:3000/hello',
                incorrect: request?.url || 'unknown'
            };
        }
        
        if (errorType === 'method_not_allowed') {
            return {
                correct: 'curl -X GET http://localhost:3000/hello',
                incorrect: `curl -X ${request?.method || 'POST'} http://localhost:3000/hello`
            };
        }
        
        return {};
    }
    
    /**
     * Gets top error types from statistics
     */
    getTopErrorTypes() {
        const types = Object.entries(this.errorCounters.byType)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5)
            .map(([type, data]) => ({ type, count: data.count }));
            
        return types;
    }
}

// =============================================================================
// MODULE EXPORTS
// =============================================================================

module.exports = {
    // Main error handling middleware function for centralized error processing
    errorHandler,
    
    // Specialized error handlers for different HTTP error scenarios
    handleNotFoundError,
    handleMethodNotAllowed,
    handleServerError,
    handleValidationError,
    
    // Error middleware class with comprehensive error handling and educational features
    ErrorMiddleware,
    
    // Utility functions for error context and logging with educational enhancements
    logErrorWithContext,
    createErrorContext,
    
    // Error type determination and classification utilities
    determineErrorType,
    shouldExposeErrorDetails,
    
    // Educational constants for consistent error handling throughout application
    ERROR_MIDDLEWARE_PREFIX,
    DEFAULT_ERROR_STATUS,
    EDUCATIONAL_ERROR_CONTEXT,
    MAX_ERROR_STACK_DEPTH
};