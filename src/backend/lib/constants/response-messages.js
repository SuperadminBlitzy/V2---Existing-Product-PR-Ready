// Response message constants module for Node.js Tutorial Application
// This module centralizes all response message definitions including success messages,
// error messages, content types, and educational guidance for consistent HTTP messaging

// Educational and tutorial configuration constants
const EDUCATIONAL_PREFIX = '[Node.js Tutorial] ';
const TUTORIAL_VERSION = '1.0.0';
const DEFAULT_CHARSET = 'utf-8';

/**
 * Success response messages for positive HTTP interactions and successful endpoint responses
 * These messages provide clear, educational content for successful API interactions
 */
const SUCCESS_MESSAGES = {
    HELLO_WORLD: 'Hello world - Standard response message for successful GET requests to the \'/hello\' endpoint, demonstrating basic HTTP response functionality'
};

/**
 * Error response messages for HTTP error conditions with educational context and troubleshooting guidance
 * Each error message includes specific guidance to help learners understand and resolve issues
 */
const ERROR_MESSAGES = {
    NOT_FOUND: '404 Not Found: The requested resource could not be found. Try visiting http://localhost:3000/hello for the tutorial endpoint.',
    METHOD_NOT_ALLOWED: '405 Method Not Allowed: This endpoint only supports GET requests. Please use GET method to access the tutorial endpoint.',
    INTERNAL_SERVER_ERROR: '500 Internal Server Error: An unexpected error occurred while processing your request. Please check the server logs for debugging information.',
    INVALID_ROUTE: 'Invalid route requested. This tutorial application only supports the \'/hello\' endpoint. Please check your URL path.'
};

/**
 * Content-Type header values for proper MIME type specification in HTTP responses
 * Includes charset specification for proper character encoding
 */
const CONTENT_TYPES = {
    TEXT_PLAIN: 'text/plain; charset=utf-8',
    APPLICATION_JSON: 'application/json; charset=utf-8'
};

/**
 * Educational messages providing learning guidance, troubleshooting assistance, and debugging tips
 * These messages enhance the educational value of the tutorial application
 */
const EDUCATIONAL_MESSAGES = {
    TROUBLESHOOTING_HELP: 'Troubleshooting Help: 1. Ensure the server is running on http://localhost:3000, 2. Use GET method for requests, 3. Check URL spelling and case sensitivity, 4. Review server logs for additional error details.',
    TUTORIAL_GUIDANCE: 'Tutorial Guidance: This Node.js application demonstrates basic HTTP server functionality. Visit /hello endpoint with GET method to see the tutorial response.',
    DEBUGGING_TIPS: 'Debugging Tips: Check console logs for detailed error information, verify request method and URL path, ensure server is running without port conflicts.'
};

/**
 * Utility function that formats response messages with educational context and tutorial-specific prefixes
 * for enhanced learning experience and debugging assistance
 * 
 * @param {string} message - Base message content to format with educational context
 * @param {object} options - Optional formatting options including prefix, suffix, and educational context
 * @returns {string} Formatted message with educational prefix and context for tutorial learning
 */
function formatEducationalMessage(message, options = {}) {
    // Validate message parameter and ensure it's a string
    if (typeof message !== 'string' || !message) {
        throw new Error('Message parameter must be a non-empty string');
    }

    // Extract formatting options with defaults for educational context
    const {
        includePrefix = true,
        includeVersion = false,
        addSpacing = true,
        educationalContext = true
    } = options;

    let formattedMessage = message;

    // Add educational prefix if configured for tutorial environment
    if (includePrefix && educationalContext) {
        formattedMessage = EDUCATIONAL_PREFIX + formattedMessage;
    }

    // Include tutorial version information if requested in options
    if (includeVersion) {
        formattedMessage += ` (Tutorial Version: ${TUTORIAL_VERSION})`;
    }

    // Apply educational formatting with appropriate spacing and structure
    if (addSpacing && educationalContext) {
        formattedMessage = '\n' + formattedMessage + '\n';
    }

    // Return formatted message ready for use in HTTP responses
    return formattedMessage;
}

/**
 * Combines standard error messages with troubleshooting guidance to provide educational context
 * and debugging assistance for learners
 * 
 * @param {string} baseMessage - Base error message content
 * @param {string} errorType - Type of error for specific troubleshooting guidance
 * @returns {string} Combined message with troubleshooting guidance for educational error handling
 */
function getMessageWithTroubleshooting(baseMessage, errorType) {
    // Validate base message and error type parameters
    if (typeof baseMessage !== 'string' || !baseMessage) {
        throw new Error('Base message must be a non-empty string');
    }
    if (typeof errorType !== 'string' || !errorType) {
        throw new Error('Error type must be a non-empty string');
    }

    // Retrieve appropriate troubleshooting guidance for error type
    let troubleshootingGuidance;
    switch (errorType.toLowerCase()) {
        case '404':
        case 'not_found':
            troubleshootingGuidance = EDUCATIONAL_MESSAGES.TROUBLESHOOTING_HELP;
            break;
        case '405':
        case 'method_not_allowed':
            troubleshootingGuidance = 'Method Not Allowed: Ensure you are using the GET method. POST, PUT, DELETE are not supported in this tutorial.';
            break;
        case '500':
        case 'internal_server_error':
            troubleshootingGuidance = EDUCATIONAL_MESSAGES.DEBUGGING_TIPS;
            break;
        default:
            troubleshootingGuidance = EDUCATIONAL_MESSAGES.TUTORIAL_GUIDANCE;
    }

    // Combine base message with educational troubleshooting content
    const separator = '\n\n';
    const combinedMessage = baseMessage + separator + troubleshootingGuidance;

    // Format combined message with clear structure and educational context
    const formattedMessage = formatEducationalMessage(combinedMessage, {
        includePrefix: true,
        addSpacing: true,
        educationalContext: true
    });

    // Return comprehensive error message with troubleshooting assistance
    return formattedMessage;
}

/**
 * Validates message content for appropriate length, format, and educational suitability
 * before use in HTTP responses
 * 
 * @param {string} message - Message content to validate for HTTP response usage
 * @returns {boolean} True if message content is valid for HTTP response usage, false otherwise
 */
function validateMessageContent(message) {
    // Check message parameter is provided and is a string
    if (typeof message !== 'string') {
        return false;
    }

    // Validate message length is within appropriate bounds for HTTP responses
    const MIN_LENGTH = 1;
    const MAX_LENGTH = 2000; // Reasonable limit for educational messages
    if (message.length < MIN_LENGTH || message.length > MAX_LENGTH) {
        return false;
    }

    // Check for appropriate educational content and language
    const containsEducationalKeywords = message.toLowerCase().includes('tutorial') ||
                                       message.toLowerCase().includes('help') ||
                                       message.toLowerCase().includes('error') ||
                                       message.toLowerCase().includes('hello') ||
                                       message.toLowerCase().includes('endpoint');

    // Ensure message format is suitable for tutorial application context
    const hasProperStructure = message.trim().length > 0 && 
                               !message.includes('<script>') && // Basic security check
                               !message.includes('javascript:'); // Basic security check

    // Return boolean validation result for message usage decision
    return hasProperStructure && (containsEducationalKeywords || message.includes('world'));
}

// Export all message constants and utility functions for use throughout the application
module.exports = {
    // Global constants
    EDUCATIONAL_PREFIX,
    TUTORIAL_VERSION,
    DEFAULT_CHARSET,
    
    // Message objects
    SUCCESS_MESSAGES,
    ERROR_MESSAGES,
    CONTENT_TYPES,
    EDUCATIONAL_MESSAGES,
    
    // Utility functions
    formatEducationalMessage,
    getMessageWithTroubleshooting,
    validateMessageContent
};