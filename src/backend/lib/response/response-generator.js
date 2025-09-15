/**
 * HTTP Response Generation Module for Node.js Tutorial Application
 * 
 * This module constructs complete HTTP responses with proper headers, status codes, and body content 
 * for the Node.js tutorial application. It ensures HTTP/1.1 protocol compliance while providing 
 * educational context and structured response generation for the '/hello' endpoint and error handling 
 * scenarios, including proper Content-Type headers, status code management, and response formatting 
 * with educational logging integration.
 * 
 * Educational Features:
 * - HTTP/1.1 protocol compliance demonstration with proper status line formatting
 * - Comprehensive header management including Content-Type, Content-Length, and educational headers
 * - Educational response logging for transparent HTTP response generation process
 * - Performance timing metrics showing response generation performance for learning
 * - Troubleshooting guidance and debugging assistance integrated into response handling
 * - Professional HTTP response patterns while maintaining educational simplicity
 * 
 * Integration Points:
 * - Used by hello-handler.js for generating successful responses to '/hello' endpoint requests
 * - Used by request-router.js for generating error responses for invalid routes and methods
 * - Used by error-middleware.js for centralized error response generation
 * - Used by http-server.js for server-level error response generation
 * - Provides consistent response generation for automated testing and validation
 * 
 * HTTP Compliance Features:
 * - HTTP/1.1 compliant response generation with proper status line formatting
 * - Comprehensive header setting including Content-Type, Content-Length, and educational headers
 * - Proper HTTP status code usage for success (200), client errors (404, 405), and server errors (500)
 * - UTF-8 charset specification and proper content encoding for international compatibility
 * - Proper response.end() method usage as required by Node.js HTTP protocol implementation
 * 
 * @module response-generator
 * @version 1.0.0
 * @educational Demonstrates HTTP response generation with educational context and professional patterns
 */

// Import HTTP status code constants for consistent response status code management
const { HTTP_STATUS } = require('../constants/http-status-codes.js');

// Import success and error message constants for standardized response content
const { SUCCESS_MESSAGES, ERROR_MESSAGES, CONTENT_TYPES } = require('../constants/response-messages.js');

// Import logger for educational response generation logging and performance timing
const { logger } = require('../utils/logger.js');

// Import application configuration for educational settings and server configuration
const { appConfig } = require('../config/app-config.js');

// =============================================================================
// GLOBAL CONSTANTS
// =============================================================================

/**
 * Default character encoding for HTTP responses ensuring international compatibility
 * Educational Note: UTF-8 encoding supports international characters and is the web standard
 */
const DEFAULT_CHARSET = 'utf-8';

/**
 * HTTP protocol version constant for response status line formatting
 * Educational Note: HTTP/1.1 is the standard protocol version for modern web applications
 */
const HTTP_VERSION = 'HTTP/1.1';

/**
 * Educational response prefix for tutorial identification and learning context
 * Educational Note: Consistent prefixing helps identify tutorial-specific responses in logs
 */
const EDUCATIONAL_RESPONSE_PREFIX = '[Tutorial Response]';

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Calculates the byte length of response content for accurate Content-Length header setting
 * with support for different character encodings and international content
 * 
 * Educational Note: Proper Content-Length calculation is essential for HTTP/1.1 compliance
 * and helps browsers and clients properly handle response content
 * 
 * @param {string} content - Response content string to calculate byte length for
 * @returns {number} Byte length of the content string for Content-Length header usage
 * @throws {TypeError} If content parameter is not a string
 */
function calculateContentLength(content) {
    // Validate that content parameter is provided and is a string
    if (typeof content !== 'string') {
        const error = new TypeError('Content parameter must be a string for length calculation');
        logger.error('Content length calculation failed - invalid content type', error, {
            contentType: typeof content,
            troubleshooting: 'Ensure response content is a string before calculating length'
        });
        throw error;
    }
    
    try {
        // Convert content string to Buffer for accurate byte length calculation
        // Educational Note: String.length returns character count, but Content-Length needs byte count
        const buffer = Buffer.from(content, DEFAULT_CHARSET);
        const byteLength = buffer.length;
        
        // Add educational logging about content length calculation if debug mode enabled
        if (appConfig.educational?.debugging?.verboseDebugging) {
            logger.debug('Content length calculated for HTTP response', {
                characterCount: content.length,
                byteLength: byteLength,
                encoding: DEFAULT_CHARSET,
                educationalNote: 'Byte length may differ from character count for international characters'
            });
        }
        
        return byteLength;
    } catch (error) {
        logger.error('Failed to calculate content length for HTTP response', error, {
            contentPreview: content.substring(0, 50),
            encoding: DEFAULT_CHARSET,
            troubleshooting: 'Check content encoding and ensure valid string format'
        });
        
        // Return conservative estimate based on character count
        return content.length * 2; // UTF-8 worst case for ASCII-compatible content
    }
}

/**
 * Validates response generation parameters to ensure they are safe and appropriate
 * for HTTP response creation with comprehensive validation and educational guidance
 * 
 * Educational Note: Parameter validation prevents runtime errors and ensures consistent
 * HTTP response generation throughout the application
 * 
 * @param {object} res - ServerResponse object to validate for HTTP response writing
 * @param {number} statusCode - Status code to validate for HTTP specification compliance
 * @param {string} content - Content to validate for response body generation
 * @returns {boolean} True if parameters are valid, false otherwise with educational logging
 */
function validateResponseParameters(res, statusCode, content) {
    let validationErrors = [];
    let validationWarnings = [];
    
    // Start performance timer for validation timing measurement
    const validationTimer = logger.startTimer('response_parameter_validation');
    
    try {
        // Check that res object is a valid ServerResponse instance
        if (!res || typeof res !== 'object') {
            validationErrors.push('Response object (res) must be a valid HTTP ServerResponse instance');
        } else {
            // Verify essential ServerResponse methods are available
            if (typeof res.writeHead !== 'function') {
                validationErrors.push('Response object missing writeHead method - not a valid ServerResponse');
            }
            if (typeof res.write !== 'function') {
                validationErrors.push('Response object missing write method - not a valid ServerResponse');
            }
            if (typeof res.end !== 'function') {
                validationErrors.push('Response object missing end method - not a valid ServerResponse');
            }
            
            // Check that response has not already been sent
            if (res.headersSent) {
                validationErrors.push('Response headers already sent - cannot modify response');
            }
            if (res.finished) {
                validationErrors.push('Response already finished - cannot write additional content');
            }
        }
        
        // Validate status code is a number within valid HTTP range (100-599)
        if (typeof statusCode !== 'number') {
            validationErrors.push('Status code must be a number for HTTP compliance');
        } else if (isNaN(statusCode)) {
            validationErrors.push('Status code cannot be NaN - must be valid HTTP status code');
        } else if (statusCode < 100 || statusCode > 599) {
            validationErrors.push(`Status code ${statusCode} outside valid HTTP range (100-599)`);
        } else if (!Number.isInteger(statusCode)) {
            validationWarnings.push('Status code should be an integer for HTTP specification compliance');
        }
        
        // Ensure content is a string and not excessively long
        if (typeof content !== 'string') {
            validationErrors.push('Response content must be a string for proper HTTP body generation');
        } else {
            const MAX_CONTENT_LENGTH = 1048576; // 1MB limit for educational safety
            if (content.length > MAX_CONTENT_LENGTH) {
                validationWarnings.push(`Content length ${content.length} exceeds recommended limit of ${MAX_CONTENT_LENGTH} characters`);
            }
            
            // Check for potentially dangerous content patterns
            if (content.includes('<script>')) {
                validationWarnings.push('Content contains script tags - ensure proper content validation');
            }
        }
        
        // Additional educational validation checks
        if (appConfig.educational?.tutorial?.mode) {
            // Verify tutorial-appropriate status codes are being used
            const tutorialStatusCodes = [200, 404, 405, 500];
            if (statusCode && !tutorialStatusCodes.includes(statusCode)) {
                validationWarnings.push(`Status code ${statusCode} not commonly used in tutorial - educational focus on: ${tutorialStatusCodes.join(', ')}`);
            }
            
            // Check for educational content patterns
            if (content && statusCode === 200 && !content.includes('world')) {
                validationWarnings.push('Success response content may not match tutorial expectations (should include "world" for /hello endpoint)');
            }
        }
        
        // Log validation results for educational transparency
        const isValid = validationErrors.length === 0;
        const validationContext = {
            isValid: isValid,
            errorCount: validationErrors.length,
            warningCount: validationWarnings.length,
            statusCode: statusCode,
            contentLength: content ? content.length : 0,
            hasResponse: !!res
        };
        
        if (validationErrors.length > 0) {
            logger.error('Response parameter validation failed', null, {
                ...validationContext,
                errors: validationErrors,
                troubleshooting: 'Fix parameter validation errors before attempting response generation'
            });
        } else if (validationWarnings.length > 0) {
            logger.warn('Response parameter validation passed with warnings', {
                ...validationContext,
                warnings: validationWarnings,
                guidance: 'Consider addressing warnings for optimal response generation'
            });
        } else if (appConfig.educational?.debugging?.verboseDebugging) {
            logger.debug('Response parameter validation successful', validationContext);
        }
        
        // End validation timing
        const validationDuration = validationTimer.end();
        
        // Add educational performance context
        if (appConfig.educational?.performance?.showTimingInfo && validationDuration > 5) {
            logger.info('Response validation timing information', {
                duration: validationDuration,
                performanceNote: validationDuration > 10 ? 'Validation took longer than expected' : 'Normal validation performance',
                educationalTip: 'Parameter validation ensures safe HTTP response generation'
            });
        }
        
        return isValid;
        
    } catch (error) {
        // Handle unexpected validation errors gracefully
        logger.error('Unexpected error during response parameter validation', error, {
            troubleshooting: 'Check parameter types and ensure proper ServerResponse object'
        });
        
        validationTimer.end();
        return false;
    }
}

/**
 * Sets common HTTP response headers with educational context, proper HTTP/1.1 compliance,
 * and appropriate MIME types for consistent response formatting
 * 
 * Educational Note: Proper header setting is crucial for HTTP/1.1 compliance and helps
 * browsers and clients correctly interpret response content and behavior
 * 
 * @param {object} res - Node.js HTTP ServerResponse object for setting headers
 * @param {number} statusCode - HTTP status code for the response status line
 * @param {string} contentType - Content-Type header value for MIME type specification
 * @param {number} contentLength - Content-Length header value for response body size
 * @param {object} additionalHeaders - Optional additional headers for response customization
 * @returns {void} No return value, sets headers on the ServerResponse object with educational logging
 */
function setResponseHeaders(res, statusCode, contentType, contentLength, additionalHeaders = {}) {
    // Start performance timer for header setting measurement
    const headerTimer = logger.startTimer('response_header_setting');
    
    try {
        // Validate parameters before attempting to set headers
        if (!validateResponseParameters(res, statusCode, '')) {
            logger.error('Cannot set response headers - parameter validation failed', null, {
                statusCode: statusCode,
                contentType: contentType,
                contentLength: contentLength,
                troubleshooting: 'Ensure valid ServerResponse object and status code'
            });
            headerTimer.end();
            return;
        }
        
        // Create headers object with status code and standard headers
        const headers = {
            'Content-Type': contentType || CONTENT_TYPES.TEXT_PLAIN,
            'Content-Length': contentLength || 0
        };
        
        // Add educational headers if tutorial mode is enabled in configuration
        if (appConfig.educational?.tutorial?.mode) {
            headers['X-Tutorial-Server'] = 'Node.js HTTP Server Tutorial';
            headers['X-Educational-Context'] = 'Learning HTTP Response Generation';
            headers['X-Response-Generated-At'] = new Date().toISOString();
            
            // Include server identification header for educational context
            headers['Server'] = `${appConfig.app?.name || 'Tutorial-Server'}/v${appConfig.app?.version || '1.0.0'}`;
        }
        
        // Add timing headers if performance monitoring is enabled
        if (appConfig.educational?.performance?.showTimingInfo) {
            headers['X-Response-Start-Time'] = Date.now().toString();
        }
        
        // Include tutorial-specific headers for learning demonstration
        if (appConfig.educational?.logging?.verboseMode) {
            headers['X-Tutorial-Endpoint'] = 'HTTP Response Generation';
            headers['X-Educational-Mode'] = 'Enabled';
            headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'; // Prevent caching during learning
            headers['Pragma'] = 'no-cache';
            headers['Expires'] = '0';
        }
        
        // Merge any additional headers provided in parameters
        if (additionalHeaders && typeof additionalHeaders === 'object') {
            Object.keys(additionalHeaders).forEach(key => {
                if (additionalHeaders[key] !== undefined && additionalHeaders[key] !== null) {
                    headers[key] = additionalHeaders[key];
                }
            });
        }
        
        // Add CORS headers for educational development if enabled
        if (appConfig.educational?.debugging?.enableDebugMode) {
            headers['Access-Control-Allow-Origin'] = 'http://localhost:3000';
            headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
            headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept';
        }
        
        // Set Connection header based on HTTP/1.1 keep-alive behavior
        headers['Connection'] = 'keep-alive';
        
        // Write all headers to response using res.writeHead method for HTTP/1.1 compliance
        res.writeHead(statusCode, headers);
        
        // Log header setting activity for educational transparency
        const headerCount = Object.keys(headers).length;
        const headerContext = {
            statusCode: statusCode,
            headerCount: headerCount,
            contentType: contentType,
            contentLength: contentLength,
            educationalHeaders: appConfig.educational?.tutorial?.mode ? 'enabled' : 'disabled'
        };
        
        if (appConfig.educational?.logging?.verboseMode) {
            logger.info(`${EDUCATIONAL_RESPONSE_PREFIX} HTTP headers set successfully`, headerContext);
        } else {
            logger.debug('Response headers configured', headerContext);
        }
        
        // Add educational explanation about header importance
        if (appConfig.educational?.tutorial?.mode && appConfig.educational?.logging?.demonstratePatterns) {
            logger.info('Educational note: HTTP headers communicate response metadata to clients', {
                concept: 'Headers provide essential information about response content and server behavior',
                examples: {
                    'Content-Type': 'Tells client how to interpret response body',
                    'Content-Length': 'Enables efficient content transfer and connection management',
                    'Server': 'Identifies server software for debugging and analytics'
                }
            });
        }
        
    } catch (error) {
        logger.error('Failed to set HTTP response headers', error, {
            statusCode: statusCode,
            contentType: contentType,
            troubleshooting: 'Check ServerResponse object state and header values'
        });
    } finally {
        // End header timing measurement
        const headerDuration = headerTimer.end();
        
        // Log performance information if enabled
        if (appConfig.educational?.performance?.showTimingInfo && headerDuration > 5) {
            logger.debug('Header setting performance measurement', {
                duration: headerDuration,
                performanceLevel: headerDuration < 5 ? 'excellent' : headerDuration < 10 ? 'good' : 'slow',
                educationalTip: 'Fast header setting indicates efficient response preparation'
            });
        }
    }
}

// =============================================================================
// MAIN RESPONSE GENERATION FUNCTIONS
// =============================================================================

/**
 * Generates a successful HTTP response with 200 status code, appropriate headers, and content body
 * for successful requests to the '/hello' endpoint with comprehensive educational logging and timing
 * 
 * Educational Note: Success response generation demonstrates proper HTTP 200 OK response structure
 * with educational context about successful request processing and response formatting
 * 
 * @param {object} res - Node.js HTTP ServerResponse object for writing response data
 * @param {string} content - Response content body, defaults to 'Hello world' message from constants
 * @param {object} options - Optional response configuration including Content-Type and educational features
 * @returns {void} No return value, writes complete HTTP response to ServerResponse object with logging
 */
function generateSuccessResponse(res, content = SUCCESS_MESSAGES.HELLO_WORLD, options = {}) {
    // Start performance timer for educational response timing metrics
    const responseTimer = logger.startTimer('success_response_generation');
    
    try {
        // Log response generation start with educational context
        logger.info(`${EDUCATIONAL_RESPONSE_PREFIX} Generating successful HTTP response`, {
            statusCode: HTTP_STATUS.OK,
            contentPreview: content.substring(0, 50),
            educational: true,
            responseType: 'success',
            endpoint: '/hello'
        });
        
        // Validate response parameters before proceeding with generation
        if (!validateResponseParameters(res, HTTP_STATUS.OK, content)) {
            logger.error('Success response generation aborted due to parameter validation failure', null, {
                troubleshooting: 'Ensure valid ServerResponse object and content before generating response'
            });
            responseTimer.end();
            return;
        }
        
        // Extract options with educational defaults
        const {
            contentType = CONTENT_TYPES.TEXT_PLAIN,
            includeEducationalHeaders = appConfig.educational?.tutorial?.mode,
            enableTiming = appConfig.educational?.performance?.showTimingInfo,
            verboseLogging = appConfig.educational?.logging?.verboseMode
        } = options;
        
        // Calculate Content-Length header based on response body size
        const contentLength = calculateContentLength(content);
        
        // Prepare additional headers for educational context
        const additionalHeaders = {};
        if (includeEducationalHeaders) {
            additionalHeaders['X-Success-Response'] = 'Hello Endpoint Success';
            additionalHeaders['X-Tutorial-Concept'] = 'HTTP 200 OK Success Response';
            additionalHeaders['X-Learning-Objective'] = 'Demonstrate successful request processing';
        }
        
        if (enableTiming) {
            additionalHeaders['X-Response-Generation-Start'] = Date.now().toString();
        }
        
        // Set HTTP status code to 200 OK using HTTP_STATUS constants
        // Set Content-Type header to text/plain with UTF-8 charset
        // Add educational headers for tutorial demonstration if enabled
        // Set Content-Length header based on response body size
        setResponseHeaders(res, HTTP_STATUS.OK, contentType, contentLength, additionalHeaders);
        
        // Write response body content using res.write method for HTTP protocol compliance
        res.write(content);
        
        // End response stream with res.end method as required by HTTP protocol
        res.end();
        
        // Log successful response generation with timing information
        const responseContext = {
            statusCode: HTTP_STATUS.OK,
            statusMessage: 'OK',
            contentType: contentType,
            contentLength: contentLength,
            responseComplete: true,
            educational: includeEducationalHeaders
        };
        
        if (verboseLogging) {
            logger.info(`${EDUCATIONAL_RESPONSE_PREFIX} Success response sent successfully`, responseContext);
        } else {
            logger.debug('HTTP 200 OK response generated', responseContext);
        }
        
        // Add educational context about successful response generation
        if (appConfig.educational?.tutorial?.mode && appConfig.educational?.logging?.demonstratePatterns) {
            logger.info('Educational note: HTTP 200 OK indicates successful request processing', {
                concept: 'Success responses confirm that request was received, understood, and processed successfully',
                pattern: 'Standard success response for GET requests to valid endpoints',
                nextSteps: [
                    'Client receives response with status 200',
                    'Response body contains requested content',
                    'Connection may be kept alive for additional requests'
                ]
            });
        }
        
    } catch (error) {
        logger.error('Failed to generate success response', error, {
            statusCode: HTTP_STATUS.OK,
            contentLength: content ? content.length : 0,
            troubleshooting: 'Check ServerResponse object state and ensure content is valid string',
            recoveryAction: 'Generate error response instead'
        });
        
        // Attempt to generate error response as fallback
        try {
            generateInternalServerErrorResponse(res, error);
        } catch (fallbackError) {
            logger.error('Failed to generate fallback error response', fallbackError);
        }
    } finally {
        // End performance timer and log educational timing metrics
        const responseDuration = responseTimer.end();
        
        // Add educational timing information if enabled
        if (appConfig.educational?.performance?.showTimingInfo) {
            const performanceLevel = responseDuration < 10 ? 'excellent' : 
                                   responseDuration < 50 ? 'good' : 
                                   responseDuration < 100 ? 'acceptable' : 'slow';
            
            logger.info('Success response performance measurement', {
                duration: responseDuration,
                performanceLevel: performanceLevel,
                benchmark: responseDuration < 100 ? 'Within target response time' : 'Consider optimization',
                educationalTip: 'Fast response generation provides better user experience'
            });
        }
    }
}

/**
 * Generates HTTP error responses with appropriate status codes, error messages, and educational context
 * for client and server error conditions with comprehensive troubleshooting guidance
 * 
 * Educational Note: Error response generation demonstrates proper HTTP error handling patterns
 * with educational context about different error types and appropriate status codes
 * 
 * @param {object} res - Node.js HTTP ServerResponse object for writing error response
 * @param {number} statusCode - HTTP status code for the error response (404, 405, 500, etc.)
 * @param {string} message - Error message content, defaults to standard error messages from constants
 * @param {object} options - Optional error response configuration including educational guidance
 * @returns {void} No return value, writes complete HTTP error response to ServerResponse object
 */
function generateErrorResponse(res, statusCode, message, options = {}) {
    // Start performance timer for error response generation timing
    const errorTimer = logger.startTimer('error_response_generation');
    
    try {
        // Log error response generation with status code and educational context
        logger.warn(`${EDUCATIONAL_RESPONSE_PREFIX} Generating error response`, {
            statusCode: statusCode,
            errorMessage: message,
            educational: true,
            responseType: 'error',
            errorCategory: statusCode >= 500 ? 'server_error' : 'client_error'
        });
        
        // Validate status code is within acceptable error ranges (400-599)
        if (statusCode < 400 || statusCode > 599) {
            logger.error('Invalid error status code provided', null, {
                providedStatusCode: statusCode,
                validRange: '400-599',
                troubleshooting: 'Use appropriate HTTP error status codes (4xx for client errors, 5xx for server errors)'
            });
            statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR; // Default to 500 for invalid status codes
        }
        
        // Determine appropriate error message from constants or provided message
        let errorMessage = message;
        if (!errorMessage) {
            switch (statusCode) {
                case HTTP_STATUS.NOT_FOUND:
                    errorMessage = ERROR_MESSAGES.NOT_FOUND;
                    break;
                case HTTP_STATUS.METHOD_NOT_ALLOWED:
                    errorMessage = ERROR_MESSAGES.METHOD_NOT_ALLOWED;
                    break;
                case HTTP_STATUS.INTERNAL_SERVER_ERROR:
                    errorMessage = ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
                    break;
                default:
                    errorMessage = `HTTP Error ${statusCode}: An error occurred while processing your request.`;
            }
        }
        
        // Validate error response parameters
        if (!validateResponseParameters(res, statusCode, errorMessage)) {
            logger.error('Error response generation aborted due to parameter validation failure', null, {
                statusCode: statusCode,
                troubleshooting: 'Ensure valid ServerResponse object before generating error response'
            });
            errorTimer.end();
            return;
        }
        
        // Extract options with educational defaults
        const {
            contentType = CONTENT_TYPES.TEXT_PLAIN,
            includeEducationalGuidance = appConfig.educational?.errors?.includeTroubleshootingTips,
            enableTiming = appConfig.educational?.performance?.showTimingInfo,
            verboseLogging = appConfig.educational?.logging?.verboseMode
        } = options;
        
        // Include educational troubleshooting guidance if tutorial mode is enabled
        let fullErrorMessage = errorMessage;
        if (includeEducationalGuidance) {
            const troubleshootingGuidance = getTroubleshootingGuidance(statusCode);
            if (troubleshootingGuidance) {
                fullErrorMessage += '\n\n' + troubleshootingGuidance;
            }
        }
        
        // Calculate Content-Length header based on error message size
        const contentLength = calculateContentLength(fullErrorMessage);
        
        // Prepare educational error headers
        const additionalHeaders = {};
        if (appConfig.educational?.tutorial?.mode) {
            additionalHeaders['X-Error-Response'] = 'Tutorial Error Handling';
            additionalHeaders['X-Error-Category'] = statusCode >= 500 ? 'Server Error' : 'Client Error';
            additionalHeaders['X-Tutorial-Concept'] = `HTTP ${statusCode} Error Response`;
            
            if (includeEducationalGuidance) {
                additionalHeaders['X-Educational-Guidance'] = 'Troubleshooting information included in response body';
            }
        }
        
        if (enableTiming) {
            additionalHeaders['X-Error-Response-Generated'] = Date.now().toString();
        }
        
        // Set HTTP status code using provided statusCode parameter
        // Set Content-Type header to text/plain for error message content
        // Add educational error headers if tutorial mode is enabled
        // Set Content-Length header based on error message size
        setResponseHeaders(res, statusCode, contentType, contentLength, additionalHeaders);
        
        // Write error message content using res.write method
        res.write(fullErrorMessage);
        
        // End response stream with res.end method
        res.end();
        
        // Log error response completion with educational guidance
        const errorContext = {
            statusCode: statusCode,
            statusMessage: getStatusMessage(statusCode),
            errorType: statusCode >= 500 ? 'Server Error' : 'Client Error',
            contentLength: contentLength,
            guidanceIncluded: includeEducationalGuidance,
            responseComplete: true
        };
        
        if (verboseLogging) {
            logger.info(`${EDUCATIONAL_RESPONSE_PREFIX} Error response sent successfully`, errorContext);
        } else {
            logger.debug(`HTTP ${statusCode} error response generated`, errorContext);
        }
        
        // Add educational context about error response handling
        if (appConfig.educational?.tutorial?.mode && appConfig.educational?.logging?.demonstratePatterns) {
            const errorType = statusCode >= 500 ? 'server error' : 'client error';
            logger.info(`Educational note: HTTP ${statusCode} indicates ${errorType} condition`, {
                concept: `${statusCode >= 500 ? '5xx' : '4xx'} status codes communicate ${errorType} conditions to clients`,
                pattern: 'Proper error responses help clients understand and recover from error conditions',
                troubleshooting: includeEducationalGuidance ? 'Troubleshooting guidance included in response' : 'Basic error response without guidance'
            });
        }
        
    } catch (error) {
        logger.error('Failed to generate error response', error, {
            statusCode: statusCode,
            originalMessage: message,
            troubleshooting: 'Check ServerResponse object state and error message format'
        });
    } finally {
        // End performance timer and log error response timing
        const errorDuration = errorTimer.end();
        
        // Add educational timing context for error responses
        if (appConfig.educational?.performance?.showTimingInfo) {
            logger.debug('Error response performance measurement', {
                duration: errorDuration,
                performanceNote: 'Error responses should be fast to minimize impact on user experience',
                educationalTip: 'Efficient error handling maintains application responsiveness'
            });
        }
    }
}

/**
 * Specialized function for generating 404 Not Found responses with educational guidance
 * for invalid route requests and comprehensive troubleshooting assistance
 * 
 * Educational Note: 404 responses indicate that the requested resource could not be found
 * on the server, demonstrating proper client error handling patterns
 * 
 * @param {object} res - Node.js HTTP ServerResponse object for 404 response generation
 * @param {string} requestedPath - The invalid path that was requested for educational context
 * @returns {void} No return value, writes 404 HTTP response with educational guidance
 */
function generateNotFoundResponse(res, requestedPath = 'unknown') {
    try {
        // Log 404 error with requested path for educational debugging
        logger.warn(`${EDUCATIONAL_RESPONSE_PREFIX} Generating 404 Not Found response`, {
            statusCode: HTTP_STATUS.NOT_FOUND,
            requestedPath: requestedPath,
            educational: true,
            errorType: 'client_error',
            concept: 'Resource not found on server'
        });
        
        // Create educational 404 message with troubleshooting guidance
        let notFoundMessage = ERROR_MESSAGES.NOT_FOUND;
        
        // Include suggestion to use '/hello' endpoint for tutorial
        if (appConfig.educational?.tutorial?.mode) {
            notFoundMessage += `\n\nRequested path: ${requestedPath}`;
            notFoundMessage += '\n\nEducational Guidance:';
            notFoundMessage += '\n- This tutorial application only supports the \'/hello\' endpoint';
            notFoundMessage += `\n- Try visiting: http://${appConfig.server?.hostname || 'localhost'}:${appConfig.server?.port || 3000}/hello`;
            notFoundMessage += '\n- Ensure the URL path is spelled correctly and includes the leading slash';
            notFoundMessage += '\n- Use GET method for requests to the tutorial endpoint';
        }
        
        // Add educational context about valid endpoints and usage examples
        const educationalOptions = {
            includeEducationalGuidance: true,
            verboseLogging: appConfig.educational?.logging?.verboseMode,
            enableTiming: appConfig.educational?.performance?.showTimingInfo
        };
        
        // Generate error response using generateErrorResponse with 404 status
        generateErrorResponse(res, HTTP_STATUS.NOT_FOUND, notFoundMessage, educationalOptions);
        
        // Add specific educational guidance for 404 errors in tutorial context
        if (appConfig.educational?.tutorial?.mode && appConfig.educational?.logging?.demonstratePatterns) {
            logger.info('Educational note: 404 Not Found responses help clients identify invalid URLs', {
                concept: 'RESTful API design uses 404 for non-existent resources',
                pattern: 'Clear error messages guide users to valid endpoints',
                tutorialEndpoint: '/hello',
                commonCauses: [
                    'Typo in URL path',
                    'Missing leading slash in path',
                    'Requesting non-existent endpoint',
                    'Case sensitivity in path matching'
                ]
            });
        }
        
    } catch (error) {
        logger.error('Failed to generate 404 Not Found response', error, {
            requestedPath: requestedPath,
            fallbackAction: 'Attempting generic error response generation'
        });
        
        // Fallback to generic error response
        try {
            generateErrorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
        } catch (fallbackError) {
            logger.error('Failed to generate fallback 404 response', fallbackError);
        }
    }
}

/**
 * Specialized function for generating 405 Method Not Allowed responses when non-GET methods
 * are used on tutorial endpoints with comprehensive HTTP method education
 * 
 * Educational Note: 405 responses indicate that the requested HTTP method is not allowed
 * for the specified resource, demonstrating proper method validation patterns
 * 
 * @param {object} res - Node.js HTTP ServerResponse object for 405 response generation
 * @param {string} method - The HTTP method that was attempted for educational context
 * @returns {void} No return value, writes 405 HTTP response with method guidance
 */
function generateMethodNotAllowedResponse(res, method = 'unknown') {
    try {
        // Log method not allowed error with attempted method for education
        logger.warn(`${EDUCATIONAL_RESPONSE_PREFIX} Generating 405 Method Not Allowed response`, {
            statusCode: HTTP_STATUS.METHOD_NOT_ALLOWED,
            attemptedMethod: method,
            allowedMethods: ['GET'],
            educational: true,
            errorType: 'client_error',
            concept: 'HTTP method validation'
        });
        
        // Create educational message explaining GET method requirement
        let methodNotAllowedMessage = ERROR_MESSAGES.METHOD_NOT_ALLOWED;
        
        if (appConfig.educational?.tutorial?.mode) {
            methodNotAllowedMessage += `\n\nAttempted method: ${method}`;
            methodNotAllowedMessage += '\nAllowed methods: GET';
            methodNotAllowedMessage += '\n\nEducational Guidance:';
            methodNotAllowedMessage += '\n- The \'/hello\' endpoint only accepts GET requests';
            methodNotAllowedMessage += '\n- GET is used for retrieving resources without side effects';
            methodNotAllowedMessage += '\n- Other methods (POST, PUT, DELETE) are not implemented in this tutorial';
            methodNotAllowedMessage += '\n- Use curl -X GET or browser navigation for testing';
        }
        
        // Prepare additional headers with Allow header as per HTTP specification
        const methodHeaders = {
            'Allow': 'GET' // Set Allow header to 'GET' to indicate supported methods
        };
        
        if (appConfig.educational?.tutorial?.mode) {
            methodHeaders['X-Educational-Method-Info'] = 'GET method required for tutorial endpoints';
            methodHeaders['X-Tutorial-Allowed-Methods'] = 'GET';
        }
        
        // Educational options for method not allowed response
        const educationalOptions = {
            includeEducationalGuidance: true,
            verboseLogging: appConfig.educational?.logging?.verboseMode,
            enableTiming: appConfig.educational?.performance?.showTimingInfo,
            additionalHeaders: methodHeaders
        };
        
        // Generate error response using generateErrorResponse with 405 status
        generateErrorResponse(res, HTTP_STATUS.METHOD_NOT_ALLOWED, methodNotAllowedMessage, educationalOptions);
        
        // Include educational guidance about HTTP methods and proper usage
        if (appConfig.educational?.tutorial?.mode && appConfig.educational?.logging?.demonstratePatterns) {
            logger.info('Educational note: HTTP methods define the intended action for requests', {
                concept: 'RESTful APIs use specific HTTP methods for different operations',
                methods: {
                    'GET': 'Retrieve resource data (safe and idempotent)',
                    'POST': 'Create new resources or submit data',
                    'PUT': 'Update or replace existing resources',
                    'DELETE': 'Remove resources from server'
                },
                tutorialFocus: 'Tutorial demonstrates GET method for resource retrieval',
                allowHeader: 'Allow header communicates supported methods to clients'
            });
        }
        
    } catch (error) {
        logger.error('Failed to generate 405 Method Not Allowed response', error, {
            attemptedMethod: method,
            fallbackAction: 'Attempting generic error response generation'
        });
        
        // Fallback to generic error response
        try {
            generateErrorResponse(res, HTTP_STATUS.METHOD_NOT_ALLOWED, ERROR_MESSAGES.METHOD_NOT_ALLOWED);
        } catch (fallbackError) {
            logger.error('Failed to generate fallback 405 response', fallbackError);
        }
    }
}

/**
 * Specialized function for generating 500 Internal Server Error responses with educational
 * error handling and comprehensive debugging guidance for server-side issues
 * 
 * Educational Note: 500 responses indicate unexpected server errors that prevent request
 * processing, demonstrating proper server error handling and debugging assistance
 * 
 * @param {object} res - Node.js HTTP ServerResponse object for 500 response generation
 * @param {Error} error - Optional Error object with stack trace for debugging context
 * @returns {void} No return value, writes 500 HTTP response with debugging guidance
 */
function generateInternalServerErrorResponse(res, error = null) {
    try {
        // Log internal server error with educational context and debugging information
        const errorContext = {
            statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            educational: true,
            errorType: 'server_error',
            concept: 'Unexpected server-side error occurred',
            hasErrorObject: !!error,
            errorMessage: error?.message || 'Unknown server error'
        };
        
        if (error) {
            errorContext.errorName = error.name;
            errorContext.errorCode = error.code;
        }
        
        logger.error(`${EDUCATIONAL_RESPONSE_PREFIX} Generating 500 Internal Server Error response`, error, errorContext);
        
        // Create user-friendly error message without exposing sensitive details
        let serverErrorMessage = ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
        
        // Include educational troubleshooting guidance for server errors
        if (appConfig.educational?.tutorial?.mode) {
            serverErrorMessage += '\n\nEducational Debugging Guidance:';
            serverErrorMessage += '\n- Check the server console output for detailed error information';
            serverErrorMessage += '\n- Review recent code changes that might have caused the issue';
            serverErrorMessage += '\n- Verify all required modules and dependencies are properly installed';
            serverErrorMessage += '\n- Ensure server has sufficient resources (memory, disk space)';
            serverErrorMessage += '\n- Restart the server if the error persists';
            
            if (error) {
                serverErrorMessage += `\n\nTechnical Details (for learning purposes):`;
                serverErrorMessage += `\n- Error Type: ${error.name || 'Unknown'}`;
                if (error.code) {
                    serverErrorMessage += `\n- Error Code: ${error.code}`;
                }
                
                // Include safe error message for educational purposes
                const safeErrorMessage = error.message ? 
                    error.message.substring(0, 200).replace(/[<>]/g, '') : 
                    'No error message available';
                serverErrorMessage += `\n- Error Message: ${safeErrorMessage}`;
            }
        }
        
        // Prepare educational server error headers
        const serverErrorHeaders = {};
        if (appConfig.educational?.tutorial?.mode) {
            serverErrorHeaders['X-Error-Type'] = 'Internal Server Error';
            serverErrorHeaders['X-Educational-Debug'] = 'Debugging guidance included';
            serverErrorHeaders['X-Tutorial-Recovery'] = 'Check console output and restart server if needed';
            
            if (error?.code) {
                serverErrorHeaders['X-Error-Code'] = error.code;
            }
        }
        
        // Educational options for server error response
        const educationalOptions = {
            includeEducationalGuidance: true,
            verboseLogging: true, // Always log server errors verbosely
            enableTiming: appConfig.educational?.performance?.showTimingInfo,
            additionalHeaders: serverErrorHeaders
        };
        
        // Generate error response using generateErrorResponse with 500 status
        generateErrorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, serverErrorMessage, educationalOptions);
        
        // Log detailed error information for educational debugging assistance
        if (error && appConfig.educational?.debugging?.verboseDebugging) {
            logger.error('Detailed server error information for educational debugging', error, {
                stack: error.stack,
                timestamp: new Date().toISOString(),
                nodeVersion: process.version,
                platform: process.platform,
                memoryUsage: process.memoryUsage(),
                uptime: process.uptime(),
                debuggingTips: [
                    'Check error stack trace for the exact location of the problem',
                    'Review error message for clues about the root cause',
                    'Verify input parameters and data types',
                    'Check for resource availability (memory, disk, network)',
                    'Consider adding try-catch blocks for better error handling'
                ]
            });
        }
        
        // Add educational context about server error handling
        if (appConfig.educational?.tutorial?.mode && appConfig.educational?.logging?.demonstratePatterns) {
            logger.info('Educational note: 500 Internal Server Error indicates unexpected server issues', {
                concept: '5xx status codes represent server-side errors that clients cannot resolve',
                pattern: 'Proper error handling prevents application crashes and provides debugging information',
                recovery: 'Server errors often require code fixes or resource adjustments',
                prevention: [
                    'Implement comprehensive error handling with try-catch blocks',
                    'Validate input parameters before processing',
                    'Monitor server resources and performance',
                    'Use proper logging for debugging assistance'
                ]
            });
        }
        
    } catch (responseError) {
        // Last resort error handling - use minimal response to prevent infinite error loops
        logger.error('Critical error: Failed to generate 500 Internal Server Error response', responseError, {
            originalError: error?.message,
            criticalFailure: true,
            emergencyAction: 'Attempting basic error response'
        });
        
        try {
            // Basic emergency response without educational features
            if (res && !res.headersSent && !res.finished) {
                res.writeHead(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
                    'Content-Type': CONTENT_TYPES.TEXT_PLAIN,
                    'Content-Length': ERROR_MESSAGES.INTERNAL_SERVER_ERROR.length
                });
                res.write(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
                res.end();
            }
        } catch (emergencyError) {
            logger.error('Emergency response also failed - server in critical state', emergencyError);
        }
    }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Provides troubleshooting guidance based on HTTP status code for educational assistance
 * 
 * Educational Note: Context-specific troubleshooting helps learners understand common
 * issues and solutions for different types of HTTP errors
 * 
 * @param {number} statusCode - HTTP status code to provide guidance for
 * @returns {string} Troubleshooting guidance text for the specified status code
 */
function getTroubleshootingGuidance(statusCode) {
    const guidanceMap = {
        [HTTP_STATUS.NOT_FOUND]: `
Troubleshooting 404 Not Found:
• Verify the URL path is correct and includes the leading slash
• Check that you're accessing the '/hello' endpoint for this tutorial
• Ensure there are no typos in the URL
• Confirm the server is running and accessible`,
        
        [HTTP_STATUS.METHOD_NOT_ALLOWED]: `
Troubleshooting 405 Method Not Allowed:
• Use GET method for requests to the '/hello' endpoint
• Avoid using POST, PUT, DELETE methods in this tutorial
• Test with browser navigation or curl -X GET command
• Check that your HTTP client is configured correctly`,
        
        [HTTP_STATUS.INTERNAL_SERVER_ERROR]: `
Troubleshooting 500 Internal Server Error:
• Check the server console output for detailed error messages
• Restart the server process if errors persist
• Verify all dependencies are properly installed
• Review recent code changes for potential issues
• Check system resources (memory, disk space) availability`
    };
    
    return guidanceMap[statusCode] || `
General Error Troubleshooting:
• Check server logs for detailed error information
• Verify request format and parameters
• Ensure server is running and responsive
• Contact support if issues persist`;
}

/**
 * Gets human-readable status message for HTTP status codes
 * 
 * @param {number} statusCode - HTTP status code
 * @returns {string} Status message text
 */
function getStatusMessage(statusCode) {
    const statusMessages = {
        [HTTP_STATUS.OK]: 'OK',
        [HTTP_STATUS.NOT_FOUND]: 'Not Found',
        [HTTP_STATUS.METHOD_NOT_ALLOWED]: 'Method Not Allowed',
        [HTTP_STATUS.INTERNAL_SERVER_ERROR]: 'Internal Server Error'
    };
    
    return statusMessages[statusCode] || 'Unknown Status';
}

// =============================================================================
// MODULE EXPORTS
// =============================================================================

/**
 * Export all response generation functions and utilities for use throughout the Node.js tutorial application.
 * These exports provide comprehensive HTTP response generation capabilities with educational features,
 * proper HTTP/1.1 compliance, and extensive troubleshooting assistance for learning environments.
 */
module.exports = {
    // Primary response generation functions for different HTTP response scenarios
    generateSuccessResponse,        // Generate successful HTTP responses for '/hello' endpoint requests with proper formatting
    generateErrorResponse,         // Generate HTTP error responses with appropriate status codes and educational context
    generateNotFoundResponse,      // Generate specialized 404 Not Found responses with educational guidance
    generateMethodNotAllowedResponse, // Generate 405 Method Not Allowed responses with HTTP method education
    generateInternalServerErrorResponse, // Generate 500 Internal Server Error responses with debugging assistance
    
    // Utility functions for HTTP response construction and validation
    setResponseHeaders,           // Utility function for setting common HTTP response headers with educational context
    calculateContentLength,      // Calculate accurate byte length for Content-Length header specification
    validateResponseParameters,  // Validate response generation parameters for safe HTTP response creation
    
    // Educational constants and configuration
    DEFAULT_CHARSET,            // Default UTF-8 character encoding for international compatibility
    HTTP_VERSION,               // HTTP/1.1 protocol version constant for educational reference
    EDUCATIONAL_RESPONSE_PREFIX // Educational prefix for tutorial identification in logging
};