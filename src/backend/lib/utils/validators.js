/**
 * Validator Utility Module for Node.js Tutorial Application
 * 
 * This module provides comprehensive validation functions for HTTP requests, responses, 
 * and input sanitization in the Node.js tutorial application. It implements basic validation 
 * logic for the '/hello' endpoint including URL path validation, HTTP method verification, 
 * and request structure validation using only Node.js built-in modules.
 * 
 * The module focuses on educational value while implementing production-ready validation
 * patterns suitable for learning fundamental web security and input validation concepts.
 * 
 * Key Features:
 * - HTTP method validation for supported request methods
 * - URL path validation and sanitization for security
 * - Request structure validation for proper HTTP format
 * - Input sanitization to prevent basic security vulnerabilities
 * - Header validation for HTTP compliance
 * - Standardized error creation for consistent error handling
 * 
 * Educational Objectives:
 * - Demonstrate importance of input validation in web applications
 * - Show basic security practices for HTTP request processing
 * - Illustrate modular utility function design patterns
 * - Teach HTTP protocol validation concepts
 * - Provide examples of error handling and validation result structures
 * 
 * @module validators
 * @version 1.0.0
 * @educational Demonstrates input validation best practices in Node.js
 */

// =============================================================================
// EXTERNAL IMPORTS
// =============================================================================

// Node.js built-in URL module for URL parsing and validation (built-in)
const { URL } = require('node:url');

// =============================================================================
// INTERNAL IMPORTS
// =============================================================================

// HTTP status code constants for validation error responses
const { HTTP_STATUS } = require('../constants/http-status-codes');

// Standard response messages for validation errors
const { ERROR_MESSAGES } = require('../constants/response-messages');

// =============================================================================
// GLOBAL CONSTANTS
// =============================================================================

/**
 * Array of valid HTTP methods supported by the tutorial application.
 * Currently only supports GET method for the '/hello' endpoint demonstration.
 * This restriction aligns with the educational scope of the tutorial.
 */
const VALID_HTTP_METHODS = ['GET'];

/**
 * Array of valid endpoint paths supported by the tutorial application.
 * Contains only the '/hello' endpoint which is the core demonstration endpoint
 * for the Node.js HTTP server tutorial.
 */
const VALID_ENDPOINTS = ['/hello'];

/**
 * Maximum allowed URL length in characters to prevent buffer overflow attacks
 * and excessive memory usage. Set to 2048 characters which is a reasonable limit
 * for educational purposes while preventing potential security issues.
 */
const MAX_URL_LENGTH = 2048;

/**
 * Regular expression pattern for detecting potentially dangerous characters
 * in input strings. Used for basic input sanitization to prevent injection attacks.
 * Includes common script injection patterns and control characters.
 */
const DANGEROUS_CHARS_PATTERN = /[<>\"'&\x00-\x1f\x7f-\x9f]/g;

/**
 * Regular expression pattern for detecting valid URL path characters.
 * Allows alphanumeric characters, forward slashes, hyphens, underscores,
 * and dots for basic URL path validation.
 */
const VALID_PATH_PATTERN = /^[a-zA-Z0-9\/\-_\.]*$/;

/**
 * Maximum length for individual input fields to prevent excessive memory usage
 * and potential buffer overflow attacks. Set to reasonable limit for tutorial scope.
 */
const MAX_INPUT_LENGTH = 1000;

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validates that the HTTP request method is supported by the application.
 * Currently only supports GET method for the tutorial endpoint, demonstrating
 * basic HTTP method validation patterns for educational purposes.
 * 
 * This function teaches the importance of validating HTTP methods to ensure
 * that only expected request types are processed, which is a fundamental
 * security practice in web application development.
 * 
 * @param {string} method - HTTP request method to validate (e.g., 'GET', 'POST')
 * @returns {object} Validation result object with isValid boolean and error details
 * @throws {TypeError} If method parameter is not provided or not a string
 * 
 * @example
 * const result = validateHttpMethod('GET');
 * // Returns: { isValid: true, sanitizedMethod: 'GET', errors: [] }
 * 
 * const result = validateHttpMethod('POST');
 * // Returns: { isValid: false, errors: [{ message: 'Method not allowed', field: 'method' }] }
 */
function validateHttpMethod(method) {
    // Initialize validation result object with default values
    const result = {
        isValid: false,
        sanitizedMethod: null,
        errors: [],
        timestamp: new Date().toISOString()
    };

    try {
        // Check if method parameter is provided and is a string
        if (typeof method !== 'string' || !method) {
            result.errors.push(createValidationError(
                'HTTP method must be a non-empty string',
                'method',
                HTTP_STATUS.BAD_REQUEST
            ));
            return result;
        }

        // Convert method to uppercase for case-insensitive comparison
        // This follows HTTP specification where method names are case-sensitive
        // but allows for common lowercase input variations
        const upperMethod = method.toUpperCase().trim();
        
        // Validate method length to prevent excessive input
        if (upperMethod.length > 10) {
            result.errors.push(createValidationError(
                'HTTP method name is too long',
                'method',
                HTTP_STATUS.BAD_REQUEST
            ));
            return result;
        }

        // Compare method against VALID_HTTP_METHODS array
        // This demonstrates whitelist validation approach which is more secure
        // than blacklist validation for security-critical applications
        if (!VALID_HTTP_METHODS.includes(upperMethod)) {
            result.errors.push(createValidationError(
                ERROR_MESSAGES.METHOD_NOT_ALLOWED,
                'method',
                HTTP_STATUS.METHOD_NOT_ALLOWED
            ));
            return result;
        }

        // Set successful validation result
        result.isValid = true;
        result.sanitizedMethod = upperMethod;
        
        return result;

    } catch (error) {
        // Handle any unexpected errors during validation
        result.errors.push(createValidationError(
            `Validation error: ${error.message}`,
            'method',
            HTTP_STATUS.INTERNAL_SERVER_ERROR
        ));
        return result;
    }
}

/**
 * Validates the URL path from HTTP requests to ensure it matches supported endpoints.
 * Performs basic path sanitization and validation for the '/hello' endpoint, demonstrating
 * important security practices for URL validation in web applications.
 * 
 * This function teaches URL validation concepts including:
 * - Path length validation to prevent buffer overflow attacks
 * - Character validation to prevent directory traversal attacks
 * - Path normalization to ensure consistent routing
 * - Whitelist validation against known good endpoints
 * 
 * @param {string} urlPath - URL path string to validate and sanitize
 * @returns {object} Validation result with isValid boolean, sanitized path, and error details
 * @throws {TypeError} If urlPath parameter is not provided or not a string
 * 
 * @example
 * const result = validateUrlPath('/hello');
 * // Returns: { isValid: true, sanitizedPath: '/hello', errors: [] }
 * 
 * const result = validateUrlPath('/invalid');
 * // Returns: { isValid: false, errors: [{ message: 'Invalid route', field: 'path' }] }
 */
function validateUrlPath(urlPath) {
    // Initialize validation result object with comprehensive structure
    const result = {
        isValid: false,
        sanitizedPath: null,
        originalPath: urlPath,
        errors: [],
        timestamp: new Date().toISOString()
    };

    try {
        // Check if urlPath parameter is provided and is a string
        if (typeof urlPath !== 'string' || !urlPath) {
            result.errors.push(createValidationError(
                'URL path must be a non-empty string',
                'path',
                HTTP_STATUS.BAD_REQUEST
            ));
            return result;
        }

        // Validate URL path length against MAX_URL_LENGTH to prevent buffer overflow
        // This is an important security measure to prevent excessive memory usage
        if (urlPath.length > MAX_URL_LENGTH) {
            result.errors.push(createValidationError(
                `URL path exceeds maximum length of ${MAX_URL_LENGTH} characters`,
                'path',
                HTTP_STATUS.BAD_REQUEST
            ));
            return result;
        }

        // Basic sanitization: remove extra slashes and whitespace
        // This prevents path traversal attacks and normalizes the path format
        let sanitizedPath = urlPath.trim()
            .replace(/\/+/g, '/') // Replace multiple slashes with single slash
            .replace(/\/+$/, '') || '/'; // Remove trailing slashes except for root

        // Validate path contains only safe characters using whitelist approach
        // This prevents directory traversal and script injection attacks
        if (!VALID_PATH_PATTERN.test(sanitizedPath)) {
            result.errors.push(createValidationError(
                'URL path contains invalid characters',
                'path',
                HTTP_STATUS.BAD_REQUEST
            ));
            return result;
        }

        // Additional security check for directory traversal patterns
        if (sanitizedPath.includes('..') || sanitizedPath.includes('//')) {
            result.errors.push(createValidationError(
                'URL path contains potentially dangerous patterns',
                'path',
                HTTP_STATUS.BAD_REQUEST
            ));
            return result;
        }

        // Parse URL path using Node.js built-in URL module for additional validation
        // This ensures the path conforms to URL standards and catches malformed URLs
        try {
            const testUrl = new URL(sanitizedPath, 'http://localhost');
            sanitizedPath = testUrl.pathname;
        } catch (urlError) {
            result.errors.push(createValidationError(
                'URL path is malformed',
                'path',
                HTTP_STATUS.BAD_REQUEST
            ));
            return result;
        }

        // Compare sanitized path against VALID_ENDPOINTS array using whitelist validation
        // This is the primary security control ensuring only approved endpoints are accessible
        if (!VALID_ENDPOINTS.includes(sanitizedPath)) {
            result.errors.push(createValidationError(
                ERROR_MESSAGES.INVALID_ROUTE,
                'path',
                HTTP_STATUS.NOT_FOUND
            ));
            return result;
        }

        // Set successful validation result with sanitized path
        result.isValid = true;
        result.sanitizedPath = sanitizedPath;
        
        return result;

    } catch (error) {
        // Handle any unexpected errors during path validation
        result.errors.push(createValidationError(
            `Path validation error: ${error.message}`,
            'path',
            HTTP_STATUS.INTERNAL_SERVER_ERROR
        ));
        return result;
    }
}

/**
 * Validates the basic structure of HTTP request objects to ensure required properties
 * are present and properly formatted. This function demonstrates comprehensive request
 * validation patterns essential for secure web application development.
 * 
 * Educational focus areas:
 * - HTTP request object structure validation
 * - Required property presence checking
 * - Type validation for request components
 * - Security-focused input validation
 * 
 * @param {object} request - HTTP request object to validate
 * @returns {object} Validation result with isValid boolean and detailed error information
 * @throws {TypeError} If request parameter is not provided or not an object
 * 
 * @example
 * const result = validateRequestStructure({ url: '/hello', method: 'GET', headers: {} });
 * // Returns: { isValid: true, validatedRequest: {...}, errors: [] }
 */
function validateRequestStructure(request) {
    // Initialize comprehensive validation result object
    const result = {
        isValid: false,
        validatedRequest: null,
        errors: [],
        timestamp: new Date().toISOString(),
        checkedProperties: []
    };

    try {
        // Check if request parameter is provided and is an object
        if (!request || typeof request !== 'object' || Array.isArray(request)) {
            result.errors.push(createValidationError(
                'Request must be a valid object',
                'request',
                HTTP_STATUS.BAD_REQUEST
            ));
            return result;
        }

        // Define required properties for HTTP request validation
        const requiredProperties = ['url', 'method', 'headers'];
        const validatedRequest = {};

        // Validate presence of required request properties
        for (const prop of requiredProperties) {
            result.checkedProperties.push(prop);
            
            if (!(prop in request)) {
                result.errors.push(createValidationError(
                    `Missing required property: ${prop}`,
                    prop,
                    HTTP_STATUS.BAD_REQUEST
                ));
                continue;
            }

            // Validate URL property type and format
            if (prop === 'url') {
                if (typeof request[prop] !== 'string' || !request[prop]) {
                    result.errors.push(createValidationError(
                        'Request URL must be a non-empty string',
                        'url',
                        HTTP_STATUS.BAD_REQUEST
                    ));
                } else {
                    validatedRequest.url = request[prop].trim();
                }
            }

            // Validate method property type and format
            if (prop === 'method') {
                if (typeof request[prop] !== 'string' || !request[prop]) {
                    result.errors.push(createValidationError(
                        'Request method must be a non-empty string',
                        'method',
                        HTTP_STATUS.BAD_REQUEST
                    ));
                } else {
                    validatedRequest.method = request[prop].trim().toUpperCase();
                }
            }

            // Validate headers property type and structure
            if (prop === 'headers') {
                if (!request[prop] || typeof request[prop] !== 'object' || Array.isArray(request[prop])) {
                    result.errors.push(createValidationError(
                        'Request headers must be a valid object',
                        'headers',
                        HTTP_STATUS.BAD_REQUEST
                    ));
                } else {
                    validatedRequest.headers = request[prop];
                }
            }
        }

        // Additional validation for optional but important properties
        if ('body' in request && request.body !== null && request.body !== undefined) {
            result.checkedProperties.push('body');
            // For tutorial application, we expect no body content for GET requests
            if (validatedRequest.method === 'GET' && request.body) {
                result.errors.push(createValidationError(
                    'GET requests should not include request body',
                    'body',
                    HTTP_STATUS.BAD_REQUEST
                ));
            }
        }

        // If there are validation errors, return early with error details
        if (result.errors.length > 0) {
            return result;
        }

        // Set successful validation result
        result.isValid = true;
        result.validatedRequest = validatedRequest;
        
        return result;

    } catch (error) {
        // Handle any unexpected errors during request structure validation
        result.errors.push(createValidationError(
            `Request structure validation error: ${error.message}`,
            'request',
            HTTP_STATUS.INTERNAL_SERVER_ERROR
        ));
        return result;
    }
}

/**
 * Performs basic input sanitization to prevent common security issues and ensure 
 * clean data processing. Removes dangerous characters and normalizes input strings
 * following security best practices for web application input handling.
 * 
 * This function demonstrates important security concepts:
 * - Input sanitization to prevent XSS attacks
 * - Character encoding normalization
 * - Input length validation
 * - Safe character whitelisting approaches
 * 
 * @param {string} input - Input string to sanitize and validate
 * @returns {string} Sanitized input string with dangerous characters removed or escaped
 * @throws {TypeError} If input processing fails unexpectedly
 * 
 * @example
 * const clean = sanitizeInput('<script>alert("xss")</script>');
 * // Returns: 'scriptalert(xss)/script' (dangerous chars removed)
 * 
 * const clean = sanitizeInput('  normal text  ');
 * // Returns: 'normal text' (trimmed and normalized)
 */
function sanitizeInput(input) {
    try {
        // Check if input is provided, convert to string if necessary
        if (input === null || input === undefined) {
            return '';
        }

        // Convert input to string to handle various input types safely
        let sanitized = String(input);

        // Validate input length to prevent excessive memory usage and buffer overflow
        if (sanitized.length > MAX_INPUT_LENGTH) {
            // Truncate input to safe length rather than rejecting entirely
            sanitized = sanitized.substring(0, MAX_INPUT_LENGTH);
        }

        // Remove or escape potentially dangerous characters using regex replacement
        // This prevents basic XSS attacks and script injection attempts
        sanitized = sanitized.replace(DANGEROUS_CHARS_PATTERN, '');

        // Trim whitespace from beginning and end to normalize input format
        sanitized = sanitized.trim();

        // Normalize Unicode characters to standard form (NFC) for consistent processing
        // This prevents Unicode-based security attacks and ensures consistent data
        if (sanitized.normalize) {
            sanitized = sanitized.normalize('NFC');
        }

        // Additional sanitization for common injection patterns
        sanitized = sanitized
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/data:/gi, '')       // Remove data: protocol
            .replace(/vbscript:/gi, '');  // Remove vbscript: protocol

        // Return the sanitized string ready for safe processing
        return sanitized;

    } catch (error) {
        // If sanitization fails, return empty string as safe fallback
        // Log error for debugging purposes in educational environment
        console.error('Input sanitization error:', error.message);
        return '';
    }
}

/**
 * Validates HTTP request headers to ensure they meet basic requirements and contain
 * expected values for the tutorial application. This function demonstrates HTTP header
 * validation patterns essential for web security and protocol compliance.
 * 
 * Educational objectives:
 * - HTTP header structure validation
 * - Security-focused header analysis
 * - Content-Type and Content-Length validation
 * - Detection of potentially malicious header values
 * 
 * @param {object} headers - HTTP headers object to validate
 * @returns {object} Validation result with isValid boolean and header analysis details
 * @throws {TypeError} If headers parameter is not a valid object
 * 
 * @example
 * const result = validateHeaders({ 'content-type': 'text/plain', 'user-agent': 'Mozilla/5.0' });
 * // Returns: { isValid: true, validatedHeaders: {...}, errors: [] }
 */
function validateHeaders(headers) {
    // Initialize comprehensive header validation result
    const result = {
        isValid: false,
        validatedHeaders: {},
        errors: [],
        headerAnalysis: {
            totalHeaders: 0,
            suspiciousHeaders: [],
            missingRecommended: []
        },
        timestamp: new Date().toISOString()
    };

    try {
        // Check if headers parameter is provided and is a valid object
        if (!headers || typeof headers !== 'object' || Array.isArray(headers)) {
            result.errors.push(createValidationError(
                'Headers must be a valid object',
                'headers',
                HTTP_STATUS.BAD_REQUEST
            ));
            return result;
        }

        // Count total headers for analysis
        const headerKeys = Object.keys(headers);
        result.headerAnalysis.totalHeaders = headerKeys.length;

        // Define suspicious header patterns that might indicate attacks
        const suspiciousPatterns = [
            /script/i,           // Script-related content
            /javascript/i,       // JavaScript execution
            /vbscript/i,         // VBScript execution
            /data:/i,            // Data URLs
            /\x00-\x1f/,         // Control characters
            /\x7f-\x9f/          // DEL and C1 control characters
        ];

        // Validate each header name and value
        for (const [headerName, headerValue] of Object.entries(headers)) {
            // Validate header name format
            if (typeof headerName !== 'string' || !headerName.trim()) {
                result.errors.push(createValidationError(
                    'Header name must be a non-empty string',
                    'headers',
                    HTTP_STATUS.BAD_REQUEST
                ));
                continue;
            }

            // Validate header value format
            if (typeof headerValue !== 'string' && typeof headerValue !== 'number') {
                result.errors.push(createValidationError(
                    `Header value for '${headerName}' must be string or number`,
                    'headers',
                    HTTP_STATUS.BAD_REQUEST
                ));
                continue;
            }

            // Convert header value to string for consistent processing
            const stringValue = String(headerValue);

            // Check for suspicious patterns in header values
            for (const pattern of suspiciousPatterns) {
                if (pattern.test(stringValue)) {
                    result.headerAnalysis.suspiciousHeaders.push({
                        name: headerName,
                        value: stringValue,
                        pattern: pattern.source
                    });
                    result.errors.push(createValidationError(
                        `Suspicious content detected in header '${headerName}'`,
                        'headers',
                        HTTP_STATUS.BAD_REQUEST
                    ));
                    break;
                }
            }

            // Specific validation for important headers
            const lowerHeaderName = headerName.toLowerCase();

            // Validate Content-Length header if present
            if (lowerHeaderName === 'content-length') {
                const contentLength = parseInt(stringValue, 10);
                if (isNaN(contentLength) || contentLength < 0) {
                    result.errors.push(createValidationError(
                        'Content-Length must be a non-negative number',
                        'headers',
                        HTTP_STATUS.BAD_REQUEST
                    ));
                } else if (contentLength > MAX_INPUT_LENGTH) {
                    result.errors.push(createValidationError(
                        'Content-Length exceeds maximum allowed size',
                        'headers',
                        HTTP_STATUS.BAD_REQUEST
                    ));
                }
            }

            // Validate Content-Type header if present
            if (lowerHeaderName === 'content-type') {
                // For tutorial application, we expect text/plain for responses
                // This validation can be extended for more complex applications
                if (stringValue && !stringValue.match(/^[\w\-]+\/[\w\-]+/)) {
                    result.errors.push(createValidationError(
                        'Content-Type header format is invalid',
                        'headers',
                        HTTP_STATUS.BAD_REQUEST
                    ));
                }
            }

            // Add validated header to result if no errors found for this header
            if (!result.errors.some(error => error.field === 'headers' && 
                                   error.message.includes(headerName))) {
                result.validatedHeaders[headerName] = stringValue;
            }
        }

        // Check for recommended headers (educational purpose)
        const recommendedHeaders = ['user-agent'];
        for (const recommended of recommendedHeaders) {
            if (!headerKeys.some(key => key.toLowerCase() === recommended)) {
                result.headerAnalysis.missingRecommended.push(recommended);
            }
        }

        // Determine overall validation success
        result.isValid = result.errors.length === 0;
        
        return result;

    } catch (error) {
        // Handle any unexpected errors during header validation
        result.errors.push(createValidationError(
            `Header validation error: ${error.message}`,
            'headers',
            HTTP_STATUS.INTERNAL_SERVER_ERROR
        ));
        return result;
    }
}

/**
 * Quick utility function to check if a given path matches any of the valid 
 * application endpoints. Used for fast endpoint validation in routing logic
 * without the overhead of full path validation.
 * 
 * This function provides efficient endpoint checking for:
 * - Route matching in middleware
 * - Quick validation before full request processing
 * - Performance-optimized endpoint verification
 * 
 * @param {string} path - URL path to check against valid endpoints
 * @returns {boolean} True if path matches a valid endpoint, false otherwise
 * 
 * @example
 * const isValid = isValidEndpoint('/hello');  // returns true
 * const isValid = isValidEndpoint('/invalid'); // returns false
 */
function isValidEndpoint(path) {
    try {
        // Quick type check for performance
        if (typeof path !== 'string') {
            return false;
        }

        // Basic sanitization for consistent comparison
        const sanitizedPath = path.trim().replace(/\/+/g, '/').replace(/\/+$/, '') || '/';

        // Fast array lookup using includes method
        return VALID_ENDPOINTS.includes(sanitizedPath);

    } catch (error) {
        // Return false for any errors to maintain security-first approach
        return false;
    }
}

/**
 * Utility function to create standardized validation error objects with consistent 
 * structure for error handling throughout the application. This promotes consistent
 * error reporting and makes debugging easier for educational purposes.
 * 
 * Educational value:
 * - Demonstrates standardized error handling patterns
 * - Shows consistent error object structure
 * - Provides comprehensive error information for debugging
 * - Implements error categorization for better error management
 * 
 * @param {string} message - Descriptive error message for the validation failure
 * @param {string} field - Name of the field or property that failed validation
 * @param {number} statusCode - HTTP status code appropriate for this error type
 * @returns {object} Standardized error object with message, field, statusCode, and timestamp
 * 
 * @example
 * const error = createValidationError('Invalid input', 'username', 400);
 * // Returns: { message: 'Invalid input', field: 'username', statusCode: 400, ... }
 */
function createValidationError(message, field, statusCode) {
    return {
        // Primary error information
        message: String(message || 'Validation error occurred'),
        field: String(field || 'unknown'),
        statusCode: Number(statusCode || HTTP_STATUS.BAD_REQUEST),
        
        // Error metadata for debugging and logging
        timestamp: new Date().toISOString(),
        type: 'VALIDATION_ERROR',
        source: 'validators.js',
        
        // Categorize error for better handling
        category: statusCode >= 500 ? 'SERVER_ERROR' : 
                 statusCode >= 400 ? 'CLIENT_ERROR' : 'VALIDATION_ERROR',
        
        // Severity level for error handling prioritization
        severity: statusCode >= 500 ? 'HIGH' : 
                 statusCode >= 400 ? 'MEDIUM' : 'LOW',
        
        // Additional context for educational purposes
        educational: {
            description: 'This error was generated by the validation system to ensure request safety',
            recommendation: 'Check the field value and ensure it meets the validation requirements'
        }
    };
}

// =============================================================================
// MODULE EXPORTS
// =============================================================================

/**
 * Export all validation functions and utilities for use throughout the application.
 * This module serves as the centralized source for all HTTP request validation
 * functionality in the Node.js tutorial application.
 * 
 * The exported functions provide comprehensive validation capabilities while
 * maintaining educational value and demonstrating best practices for input
 * validation and security in web applications.
 */
module.exports = {
    // Primary validation functions for HTTP request processing
    validateHttpMethod,
    validateUrlPath,
    validateRequestStructure,
    sanitizeInput,
    validateHeaders,
    
    // Utility functions for quick validation and error handling
    isValidEndpoint,
    createValidationError,
    
    // Global constants for reference and configuration
    VALID_HTTP_METHODS,
    VALID_ENDPOINTS,
    MAX_URL_LENGTH
};

// =============================================================================
// EDUCATIONAL NOTES
// =============================================================================

/**
 * EDUCATIONAL CONTEXT AND LEARNING OBJECTIVES:
 * 
 * This validation module demonstrates several important concepts for Node.js developers:
 * 
 * 1. INPUT VALIDATION BEST PRACTICES:
 *    - Whitelist validation over blacklist validation for security
 *    - Comprehensive type checking and format validation
 *    - Length validation to prevent buffer overflow attacks
 *    - Character validation to prevent injection attacks
 * 
 * 2. SECURITY-FOCUSED DESIGN:
 *    - Input sanitization to prevent XSS attacks
 *    - Path traversal prevention in URL validation
 *    - Header injection prevention
 *    - Safe error handling that doesn't leak sensitive information
 * 
 * 3. HTTP PROTOCOL UNDERSTANDING:
 *    - HTTP method validation according to REST principles
 *    - URL structure validation and normalization
 *    - Header validation for protocol compliance
 *    - Proper HTTP status code usage in error responses
 * 
 * 4. ERROR HANDLING PATTERNS:
 *    - Consistent error object structure
 *    - Comprehensive error information for debugging
 *    - Graceful degradation on validation failures
 *    - Educational error messages for learning purposes
 * 
 * 5. PERFORMANCE CONSIDERATIONS:
 *    - Efficient validation algorithms
 *    - Early return patterns for performance
 *    - Minimal memory allocation during validation
 *    - Fast endpoint lookup for routing decisions
 * 
 * INTEGRATION WITH TUTORIAL APPLICATION:
 * - Used by request handlers for input validation
 * - Integrated with routing logic for endpoint validation
 * - Provides security layer for HTTP request processing
 * - Supports educational objectives through comprehensive documentation
 * 
 * PRODUCTION READINESS CONCEPTS:
 * While designed for educational purposes, this module demonstrates patterns
 * that can be extended for production use including comprehensive logging,
 * configurable validation rules, and extensible error handling systems.
 */