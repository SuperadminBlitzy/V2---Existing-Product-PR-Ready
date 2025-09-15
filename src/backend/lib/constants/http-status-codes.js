/**
 * HTTP Status Code Constants Module
 * 
 * This module provides standardized HTTP status code constants for the Node.js tutorial application.
 * It centralizes all HTTP status code definitions used throughout the application, ensuring consistency
 * in response status codes and enabling educational demonstration of standard HTTP status code patterns.
 * 
 * The module includes:
 * - Standard HTTP status code constants grouped by category
 * - Utility functions for status code validation and categorization
 * - Educational descriptions for learning HTTP standards
 * - Support for tutorial-specific status codes (200, 404, 405, 500)
 * 
 * @module http-status-codes
 * @version 1.0.0
 * @educational Demonstrates HTTP/1.1 protocol compliance and proper status code usage
 */

// =============================================================================
// HTTP STATUS CODE CONSTANTS
// =============================================================================

/**
 * HTTP Status Codes Object
 * Contains all standardized HTTP status codes used in the tutorial application.
 * Organized by category for educational clarity and easy reference.
 */
const HTTP_STATUS = {
    // 2xx Success Status Codes
    OK: 200,                    // Standard successful HTTP response for GET requests to /hello endpoint
    CREATED: 201,              // Resource successfully created (included for completeness)
    NO_CONTENT: 204,           // Successful request with no content to return
    
    // 4xx Client Error Status Codes
    BAD_REQUEST: 400,          // Request syntax is malformed or invalid
    UNAUTHORIZED: 401,         // Authentication is required (not used in tutorial)
    FORBIDDEN: 403,            // Server understands request but refuses authorization
    NOT_FOUND: 404,            // Requested resource not found, used for invalid routes
    METHOD_NOT_ALLOWED: 405,   // HTTP method not supported for endpoint, used for non-GET requests to /hello
    CONFLICT: 409,             // Request conflicts with current state of resource
    UNPROCESSABLE_ENTITY: 422, // Request is well-formed but semantically incorrect
    
    // 5xx Server Error Status Codes
    INTERNAL_SERVER_ERROR: 500, // Generic server error for unhandled exceptions
    NOT_IMPLEMENTED: 501,       // Server does not support the functionality required
    BAD_GATEWAY: 502,          // Server received invalid response from upstream server
    SERVICE_UNAVAILABLE: 503   // Server is temporarily unavailable
};

// =============================================================================
// GLOBAL CONSTANTS
// =============================================================================

/**
 * HTTP Status Code Categories
 * Defines the numeric ranges for different HTTP status code categories.
 * Used for educational classification and validation of HTTP responses.
 */
const HTTP_STATUS_CATEGORIES = {
    success: [200, 299],      // 2xx Success responses
    clientError: [400, 499],  // 4xx Client error responses
    serverError: [500, 599]   // 5xx Server error responses
};

/**
 * Tutorial Supported Status Codes
 * Array of HTTP status codes specifically used in the tutorial application.
 * These represent the core status codes demonstrated in the educational context.
 */
const TUTORIAL_SUPPORTED_STATUSES = [200, 404, 405, 500];

/**
 * Status Code Categories for Export
 * Provides arrays of status codes organized by category for educational purposes.
 */
const STATUS_CATEGORIES = {
    SUCCESS: [200, 201, 202, 204, 206],
    CLIENT_ERROR: [400, 401, 403, 404, 405, 409, 422, 429],
    SERVER_ERROR: [500, 501, 502, 503, 504]
};

// =============================================================================
// STATUS CODE DESCRIPTIONS
// =============================================================================

/**
 * Educational Status Code Descriptions
 * Provides human-readable descriptions for HTTP status codes with educational context.
 * Used by the getStatusCodeDescription function for learning purposes.
 */
const STATUS_CODE_DESCRIPTIONS = {
    // Success Status Codes
    200: "OK - Standard successful HTTP response for GET requests to /hello endpoint",
    201: "Created - Resource successfully created (not used in tutorial but included for completeness)",
    204: "No Content - Successful request with no content to return",
    
    // Client Error Status Codes
    400: "Bad Request - Request syntax is malformed or invalid",
    401: "Unauthorized - Authentication is required (not used in tutorial)",
    403: "Forbidden - Server understands request but refuses authorization",
    404: "Not Found - Requested resource not found, used for invalid routes",
    405: "Method Not Allowed - HTTP method not supported for endpoint, used for non-GET requests to /hello",
    409: "Conflict - Request conflicts with current state of resource",
    422: "Unprocessable Entity - Request is well-formed but semantically incorrect",
    
    // Server Error Status Codes
    500: "Internal Server Error - Generic server error for unhandled exceptions",
    501: "Not Implemented - Server does not support the functionality required",
    502: "Bad Gateway - Server received invalid response from upstream server",
    503: "Service Unavailable - Server is temporarily unavailable"
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Determines if a given HTTP status code represents a successful response (2xx range).
 * Used for educational status code validation and response handling logic.
 * 
 * @param {number} statusCode - HTTP status code number to validate
 * @returns {boolean} True if status code is in the 200-299 success range, false otherwise
 * @throws {TypeError} If statusCode is not a number
 * 
 * @example
 * isSuccessStatus(200); // returns true
 * isSuccessStatus(404); // returns false
 */
function isSuccessStatus(statusCode) {
    // Validate that statusCode parameter is a number
    if (typeof statusCode !== 'number' || isNaN(statusCode)) {
        throw new TypeError('Status code must be a valid number');
    }
    
    // Check if status code is within 200-299 range inclusive
    const [minSuccess, maxSuccess] = HTTP_STATUS_CATEGORIES.success;
    return statusCode >= minSuccess && statusCode <= maxSuccess;
}

/**
 * Determines if a given HTTP status code represents a client error response (4xx range).
 * Used for educational error handling and status code categorization.
 * 
 * @param {number} statusCode - HTTP status code number to validate
 * @returns {boolean} True if status code is in the 400-499 client error range, false otherwise
 * @throws {TypeError} If statusCode is not a number
 * 
 * @example
 * isClientErrorStatus(404); // returns true
 * isClientErrorStatus(200); // returns false
 */
function isClientErrorStatus(statusCode) {
    // Validate that statusCode parameter is a number
    if (typeof statusCode !== 'number' || isNaN(statusCode)) {
        throw new TypeError('Status code must be a valid number');
    }
    
    // Check if status code is within 400-499 range inclusive
    const [minClientError, maxClientError] = HTTP_STATUS_CATEGORIES.clientError;
    return statusCode >= minClientError && statusCode <= maxClientError;
}

/**
 * Determines if a given HTTP status code represents a server error response (5xx range).
 * Used for educational error handling and status code categorization.
 * 
 * @param {number} statusCode - HTTP status code number to validate
 * @returns {boolean} True if status code is in the 500-599 server error range, false otherwise
 * @throws {TypeError} If statusCode is not a number
 * 
 * @example
 * isServerErrorStatus(500); // returns true
 * isServerErrorStatus(404); // returns false
 */
function isServerErrorStatus(statusCode) {
    // Validate that statusCode parameter is a number
    if (typeof statusCode !== 'number' || isNaN(statusCode)) {
        throw new TypeError('Status code must be a valid number');
    }
    
    // Check if status code is within 500-599 range inclusive
    const [minServerError, maxServerError] = HTTP_STATUS_CATEGORIES.serverError;
    return statusCode >= minServerError && statusCode <= maxServerError;
}

/**
 * Returns a human-readable description for a given HTTP status code.
 * Provides educational context about the meaning and usage of different status codes.
 * 
 * @param {number} statusCode - HTTP status code number to describe
 * @returns {string} Human-readable description of the HTTP status code with educational context
 * @throws {TypeError} If statusCode is not a number
 * 
 * @example
 * getStatusCodeDescription(200); // returns "OK - Standard successful HTTP response..."
 * getStatusCodeDescription(999); // returns "Unknown Status Code - No description available for code: 999"
 */
function getStatusCodeDescription(statusCode) {
    // Validate that statusCode parameter is a number
    if (typeof statusCode !== 'number' || isNaN(statusCode)) {
        throw new TypeError('Status code must be a valid number');
    }
    
    // Look up status code in internal description mapping
    const description = STATUS_CODE_DESCRIPTIONS[statusCode];
    
    // Return educational description with context about proper usage
    if (description) {
        return description;
    }
    
    // Return generic description if status code is not specifically mapped
    return `Unknown Status Code - No description available for code: ${statusCode}. Please refer to HTTP/1.1 specification for standard status codes.`;
}

/**
 * Checks if a given HTTP status code is supported by the tutorial application.
 * Used for educational validation of status code usage within the tutorial context.
 * 
 * @param {number} statusCode - HTTP status code number to validate
 * @returns {boolean} True if status code is supported by tutorial application, false otherwise
 * @throws {TypeError} If statusCode is not a number
 * 
 * @example
 * isSupportedStatus(200); // returns true
 * isSupportedStatus(418); // returns false (I'm a teapot - not used in tutorial)
 */
function isSupportedStatus(statusCode) {
    // Validate that statusCode parameter is a number
    if (typeof statusCode !== 'number' || isNaN(statusCode)) {
        throw new TypeError('Status code must be a valid number');
    }
    
    // Check if status code exists in TUTORIAL_SUPPORTED_STATUSES array
    return TUTORIAL_SUPPORTED_STATUSES.includes(statusCode);
}

// =============================================================================
// MODULE EXPORTS
// =============================================================================

/**
 * Export all HTTP status code constants, utility functions, and educational resources.
 * This module serves as the centralized source for all HTTP status code related functionality
 * in the Node.js tutorial application, ensuring consistency and educational value.
 */
module.exports = {
    // Main HTTP status codes object containing all standardized status code constants
    HTTP_STATUS,
    
    // Utility functions for status code validation and categorization
    isSuccessStatus,
    isClientErrorStatus, 
    isServerErrorStatus,
    getStatusCodeDescription,
    isSupportedStatus,
    
    // Status code categories for educational classification of HTTP responses
    STATUS_CATEGORIES,
    
    // Global constants for advanced status code handling (also available as named exports)
    HTTP_STATUS_CATEGORIES,
    TUTORIAL_SUPPORTED_STATUSES
};

// =============================================================================
// NAMED EXPORTS FOR CONVENIENCE
// =============================================================================

/**
 * Named exports for convenient access to specific functionality.
 * Allows for both destructured imports and full module imports based on usage preferences.
 */
module.exports.HTTP_STATUS_CATEGORIES = HTTP_STATUS_CATEGORIES;
module.exports.TUTORIAL_SUPPORTED_STATUSES = TUTORIAL_SUPPORTED_STATUSES;

// =============================================================================
// EDUCATIONAL NOTES
// =============================================================================

/**
 * EDUCATIONAL CONTEXT:
 * 
 * This module demonstrates several important concepts for Node.js developers:
 * 
 * 1. HTTP/1.1 Protocol Compliance: All status codes follow RFC 9110 standards
 * 2. Constants Organization: Logical grouping of related constants for maintainability
 * 3. Input Validation: Proper validation of function parameters with meaningful error messages
 * 4. Documentation: Comprehensive JSDoc comments for educational and maintenance purposes
 * 5. Error Handling: Graceful handling of invalid inputs with descriptive error messages
 * 6. Module Patterns: Both default exports and named exports for flexible usage
 * 7. Code Comments: Extensive commenting for learning and maintenance purposes
 * 
 * INTEGRATION POINTS:
 * - Used by response generators for setting HTTP response status codes
 * - Used by request handlers for success and error response status codes
 * - Used by routing components for handling routing error status codes
 * - Used by middleware for centralized error response status codes
 * - Used by server components for server-level error status codes
 * - Referenced in test files for validating correct HTTP status codes
 * 
 * TUTORIAL USAGE:
 * - Primary status codes: 200 (success), 404 (not found), 405 (method not allowed), 500 (server error)
 * - Educational value: Demonstrates standard HTTP status code usage patterns
 * - Response consistency: Ensures all components use the same status code constants
 * - Learning support: Provides clear descriptions and validation for educational purposes
 */