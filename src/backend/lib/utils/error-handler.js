/**
 * Node.js Tutorial Educational Error Handler Module
 * 
 * This module provides centralized error handling utility functionality for the Node.js tutorial 
 * HTTP server application. It implements comprehensive error management with educational features,
 * structured error processing, logging, formatting, and response generation. The module serves as
 * the core error handling foundation for the entire application, providing custom error classes,
 * error type classification, and educational error messaging for enhanced learning experience and
 * debugging assistance.
 * 
 * Educational Features:
 * - Custom EducationalError class with tutorial-specific context and guidance
 * - Comprehensive error classification system for different error types and scenarios
 * - Educational troubleshooting guidance integrated into all error handling processes
 * - Error recovery assessment and guidance for application resilience patterns
 * - Performance-conscious error handling optimized for tutorial environments
 * - Structured error logging with educational formatting and debugging context
 * - Consistent error response formatting with HTTP standards compliance
 * 
 * Integration Points:
 * - Used by src/backend/server.js for application-level error handling with process management
 * - Imported by src/backend/lib/middleware/error-middleware.js for centralized HTTP error processing
 * - Referenced by src/backend/lib/server/http-server.js for server startup and configuration errors
 * - Used by src/backend/lib/router/request-router.js for routing error handling and validation
 * - Integrated with src/backend/lib/response/response-generator.js for error response formatting
 * - Supports all application components with centralized error handling and educational management
 */

// Node.js built-in modules for error inspection and process management - Node.js Built-in
const util = require('node:util');
const process = require('node:process');

// Internal imports for structured logging and educational context
const { logger } = require('./logger.js');

// Application configuration for error handling behavior and educational settings
const { appConfig } = require('../config/app-config.js');

// HTTP status code constants for consistent error response status codes
const { HTTP_STATUS } = require('../constants/http-status-codes.js');

// Standardized error messages and educational guidance for consistent error responses
const { ERROR_MESSAGES, EDUCATIONAL_MESSAGES } = require('../constants/response-messages.js');

// =============================================================================
// GLOBAL CONSTANTS AND CONFIGURATION
// =============================================================================

/**
 * Educational error prefix for tutorial identification in all error messages
 * Educational Note: Consistent prefixing helps identify tutorial-specific errors
 * and provides clear educational context for learning environments
 */
const ERROR_PREFIX = '[Node.js Tutorial Error]';

/**
 * Symbol for marking errors with educational context and tutorial-specific features
 * Educational Note: Symbols provide unique identifiers for educational error enhancement
 * without interfering with standard error properties or functionality
 */
const EDUCATIONAL_ERROR_SYMBOL = Symbol('EducationalError');

/**
 * Default HTTP status code for unclassified server errors with safe fallback
 * Educational Note: 500 Internal Server Error provides appropriate default status
 * for errors that don't fit specific categories while maintaining HTTP compliance
 */
const DEFAULT_ERROR_STATUS = 500;

/**
 * Maximum stack trace depth for educational error display and debugging
 * Educational Note: Limiting stack trace depth prevents overwhelming beginners
 * while providing sufficient debugging information for learning purposes
 */
const ERROR_STACK_DEPTH = 10;

// Extract configuration values with educational defaults and safe fallbacks
const environmentConfig = appConfig?.environment || 'development';
const educationalConfig = appConfig?.educational || {};
const loggingConfig = appConfig?.logging || {};

// =============================================================================
// ERROR TYPE CLASSIFICATION SYSTEM
// =============================================================================

/**
 * Error type constants for educational categorization and handling strategies
 * Educational Note: Error type classification helps students understand different
 * error patterns and appropriate handling strategies for each category
 */
const ERROR_TYPES = {
    SERVER: 'SERVER_ERROR',           // Server startup, configuration, and lifecycle errors
    REQUEST: 'REQUEST_ERROR',         // HTTP request processing and parsing errors
    VALIDATION: 'VALIDATION_ERROR',   // Request parameter and content validation failures
    RESPONSE: 'RESPONSE_ERROR',       // Response generation and formatting errors
    CONFIGURATION: 'CONFIGURATION_ERROR' // Application configuration and setup errors
};

/**
 * Error recovery classification for educational guidance about error handling strategies
 * Educational Note: Understanding error recoverability helps students learn about
 * application resilience and appropriate error recovery patterns
 */
const ERROR_RECOVERY_TYPES = {
    RECOVERABLE: 'RECOVERABLE',       // Operational errors that allow continued processing
    UNRECOVERABLE: 'UNRECOVERABLE',   // Programming errors requiring process restart
    DEGRADED: 'DEGRADED'              // Partial functionality errors with reduced capability
};

// =============================================================================
// CUSTOM ERROR CLASSES
// =============================================================================

/**
 * Custom EducationalError class that extends JavaScript Error with educational context,
 * troubleshooting guidance, and tutorial-specific error handling capabilities for
 * enhanced learning experience and debugging assistance
 * 
 * Educational Note: Custom error classes demonstrate object-oriented error handling
 * patterns and provide structured approach to error management with educational value
 */
class EducationalError extends Error {
    /**
     * Initializes EducationalError instance with comprehensive error information,
     * educational context, and tutorial-specific metadata for enhanced error handling
     * 
     * Educational Note: Constructor pattern establishes error state with educational
     * features while maintaining compatibility with standard JavaScript Error objects
     * 
     * @param {string} message - Primary error message describing the issue
     * @param {string} errorType - Error type classification for educational categorization
     * @param {number} statusCode - HTTP status code for error response generation
     * @param {object} educationalContext - Optional educational context with troubleshooting guidance
     */
    constructor(message, errorType = ERROR_TYPES.SERVER, statusCode = DEFAULT_ERROR_STATUS, educationalContext = {}) {
        // Call parent Error constructor with educational prefix and message
        super(`${ERROR_PREFIX} ${message}`);
        
        // Set error name for identification and debugging purposes
        this.name = 'EducationalError';
        
        // Store error type classification for educational categorization and handling
        this.errorType = errorType;
        
        // Set HTTP status code for response generation and client communication
        this.statusCode = statusCode;
        
        // Initialize educational context with troubleshooting guidance and learning tips
        this.educationalContext = {
            troubleshootingGuidance: '',
            learningTips: [],
            debuggingSteps: [],
            relatedConcepts: [],
            ...educationalContext
        };
        
        // Set timestamp for error occurrence tracking and debugging timeline
        this.timestamp = new Date().toISOString();
        
        // Determine error recoverability based on type and context for handling strategy
        this.isRecoverable = this.determineRecoverability(errorType);
        
        // Mark error with educational symbol for identification and enhancement
        this[EDUCATIONAL_ERROR_SYMBOL] = true;
        
        // Capture clean stack trace for educational debugging without constructor noise
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, EducationalError);
        }
        
        // Generate educational troubleshooting guidance based on error type and context
        this.generateTroubleshootingGuidance();
    }
    
    /**
     * Determines error recoverability based on error type and context for appropriate
     * handling strategy and educational guidance about error recovery patterns
     * 
     * Educational Note: Error recoverability assessment helps students understand
     * different error handling strategies and application resilience patterns
     * 
     * @param {string} errorType - Error type for recoverability assessment
     * @returns {boolean} True if error allows continued operation, false if restart required
     */
    determineRecoverability(errorType) {
        // Classify error recoverability based on error type and operational impact
        switch (errorType) {
            case ERROR_TYPES.SERVER:
                // Server errors typically require process restart for stability
                return false;
            case ERROR_TYPES.REQUEST:
                // Request errors are generally recoverable with appropriate error responses
                return true;
            case ERROR_TYPES.VALIDATION:
                // Validation errors are always recoverable with client error responses
                return true;
            case ERROR_TYPES.RESPONSE:
                // Response errors may be recoverable depending on the specific failure
                return true;
            case ERROR_TYPES.CONFIGURATION:
                // Configuration errors typically require restart to apply fixes
                return false;
            default:
                // Unknown error types default to non-recoverable for safety
                return false;
        }
    }
    
    /**
     * Generates specific troubleshooting guidance based on error type and context
     * for educational assistance and step-by-step resolution instructions
     * 
     * Educational Note: Contextual troubleshooting guidance helps students learn
     * debugging techniques and problem-solving approaches for different error types
     */
    generateTroubleshootingGuidance() {
        // Generate error-type specific troubleshooting guidance and learning context
        switch (this.errorType) {
            case ERROR_TYPES.SERVER:
                this.educationalContext.troubleshootingGuidance = 
                    'Server error detected. Check server configuration, port availability, and system resources.';
                this.educationalContext.debuggingSteps = [
                    'Verify port is not already in use (lsof -ti:3000)',
                    'Check system permissions for port binding',
                    'Review server configuration parameters',
                    'Examine system resource availability (memory, CPU)'
                ];
                this.educationalContext.relatedConcepts = [
                    'Node.js server lifecycle management',
                    'Port binding and network configuration',
                    'System resource management'
                ];
                break;
                
            case ERROR_TYPES.REQUEST:
                this.educationalContext.troubleshootingGuidance = 
                    'Request processing error occurred. Verify request format, method, and URL structure.';
                this.educationalContext.debuggingSteps = [
                    'Check HTTP method (GET, POST, etc.) is supported',
                    'Verify URL path matches expected endpoint pattern',
                    'Examine request headers for proper formatting',
                    'Review request body structure and content-type'
                ];
                this.educationalContext.relatedConcepts = [
                    'HTTP request structure and methods',
                    'URL routing and path matching',
                    'Request header processing'
                ];
                break;
                
            case ERROR_TYPES.VALIDATION:
                this.educationalContext.troubleshootingGuidance = 
                    'Validation error encountered. Check input parameters, data types, and format requirements.';
                this.educationalContext.debuggingSteps = [
                    'Verify all required parameters are provided',
                    'Check parameter data types match expectations',
                    'Validate parameter values are within acceptable ranges',
                    'Review parameter format requirements and constraints'
                ];
                this.educationalContext.relatedConcepts = [
                    'Input validation patterns and techniques',
                    'Data type checking and conversion',
                    'Parameter sanitization and security'
                ];
                break;
                
            case ERROR_TYPES.RESPONSE:
                this.educationalContext.troubleshootingGuidance = 
                    'Response generation error occurred. Check response format, headers, and content structure.';
                this.educationalContext.debuggingSteps = [
                    'Verify response status code is valid HTTP status',
                    'Check response headers are properly formatted',
                    'Review response body content and encoding',
                    'Ensure response.end() is called properly'
                ];
                this.educationalContext.relatedConcepts = [
                    'HTTP response structure and headers',
                    'Status code selection and usage',
                    'Response content formatting'
                ];
                break;
                
            case ERROR_TYPES.CONFIGURATION:
                this.educationalContext.troubleshootingGuidance = 
                    'Configuration error detected. Review application settings, environment variables, and config files.';
                this.educationalContext.debuggingSteps = [
                    'Check environment variables are set correctly',
                    'Verify configuration file syntax and structure',
                    'Review default configuration values and overrides',
                    'Examine configuration validation and loading process'
                ];
                this.educationalContext.relatedConcepts = [
                    'Configuration management patterns',
                    'Environment variable usage',
                    'Configuration validation and defaults'
                ];
                break;
        }
        
        // Add general educational tips applicable to all error types for learning enhancement
        this.educationalContext.learningTips = [
            'Use console.log() to trace execution flow and variable values',
            'Read error messages carefully for specific clues about the problem',
            'Check the stack trace to identify the exact location of the error',
            'Review recent code changes that might have introduced the issue',
            'Use Node.js debugging tools for step-by-step code analysis'
        ];
    }
    
    /**
     * Converts EducationalError instance to structured response object suitable for
     * HTTP error responses with educational context and troubleshooting guidance
     * 
     * Educational Note: Response object conversion demonstrates error serialization
     * and provides structured error information for client consumption and learning
     * 
     * @returns {object} Structured error response object with status, message, and educational context
     */
    toResponseObject() {
        // Create base error response object with HTTP-compatible structure
        const responseObject = {
            error: true,
            status: this.statusCode,
            errorType: this.errorType,
            message: this.message,
            timestamp: this.timestamp,
            recoverable: this.isRecoverable
        };
        
        // Include educational context for learning and troubleshooting assistance
        if (educationalConfig.errors?.includeEducationalContext) {
            responseObject.educational = {
                troubleshooting: this.educationalContext.troubleshootingGuidance,
                learningTips: this.educationalContext.learningTips,
                debuggingSteps: this.educationalContext.debuggingSteps,
                relatedConcepts: this.educationalContext.relatedConcepts
            };
        }
        
        // Add detailed debugging information for development environment
        if (environmentConfig === 'development' || environmentConfig === 'educational') {
            responseObject.debug = {
                errorName: this.name,
                errorCode: this.code,
                stackTrace: this.stack ? this.stack.split('\n').slice(0, ERROR_STACK_DEPTH) : [],
                nodeVersion: process.version,
                platform: process.platform
            };
        }
        
        // Include tutorial-specific guidance for educational value and learning support
        if (educationalConfig.errors?.includeTroubleshootingTips) {
            responseObject.tutorialGuidance = [
                'This error is part of your Node.js learning experience',
                'Use the troubleshooting steps above to practice debugging skills',
                'Review the related concepts to deepen your understanding',
                'Check the Node.js documentation for additional information'
            ];
        }
        
        // Return complete structured error response ready for HTTP transmission
        return responseObject;
    }
    
    /**
     * Adds or updates educational context including troubleshooting guidance,
     * learning tips, and tutorial-specific information to enhance error learning value
     * 
     * Educational Note: Method chaining pattern allows fluent configuration of
     * educational context while maintaining error object immutability principles
     * 
     * @param {object} context - Educational context object with guidance and tips
     * @returns {EducationalError} Self reference for method chaining capability
     */
    addEducationalContext(context) {
        // Validate educational context object has required structure
        if (!context || typeof context !== 'object') {
            logger.warn('Invalid educational context provided to EducationalError', {
                errorType: this.errorType,
                contextType: typeof context
            });
            return this;
        }
        
        // Merge new context with existing educational context while preserving existing values
        this.educationalContext = {
            ...this.educationalContext,
            ...context,
            // Merge arrays rather than replacing to preserve existing guidance
            learningTips: [...(this.educationalContext.learningTips || []), ...(context.learningTips || [])],
            debuggingSteps: [...(this.educationalContext.debuggingSteps || []), ...(context.debuggingSteps || [])],
            relatedConcepts: [...(this.educationalContext.relatedConcepts || []), ...(context.relatedConcepts || [])]
        };
        
        // Update troubleshooting guidance with new information if provided
        if (context.troubleshootingGuidance) {
            this.educationalContext.troubleshootingGuidance = context.troubleshootingGuidance;
        }
        
        // Return self for method chaining pattern support
        return this;
    }
    
    /**
     * Converts EducationalError to comprehensive string representation with educational
     * formatting and complete error information for logging and debugging purposes
     * 
     * Educational Note: String representation provides human-readable error format
     * for console output and log files with educational context preservation
     * 
     * @returns {string} Educational string representation of error with full context and guidance
     */
    toString() {
        // Build comprehensive string representation with educational formatting
        let errorString = `${this.name}: ${this.message}\n`;
        
        // Add error classification and metadata for educational context
        errorString += `Error Type: ${this.errorType}\n`;
        errorString += `HTTP Status: ${this.statusCode}\n`;
        errorString += `Timestamp: ${this.timestamp}\n`;
        errorString += `Recoverable: ${this.isRecoverable}\n`;
        
        // Include troubleshooting guidance for immediate debugging assistance
        if (this.educationalContext.troubleshootingGuidance) {
            errorString += `\nTroubleshooting: ${this.educationalContext.troubleshootingGuidance}\n`;
        }
        
        // Add debugging steps for structured problem-solving approach
        if (this.educationalContext.debuggingSteps.length > 0) {
            errorString += '\nDebugging Steps:\n';
            this.educationalContext.debuggingSteps.forEach((step, index) => {
                errorString += `  ${index + 1}. ${step}\n`;
            });
        }
        
        // Include learning tips for educational value and skill development
        if (this.educationalContext.learningTips.length > 0) {
            errorString += '\nLearning Tips:\n';
            this.educationalContext.learningTips.forEach(tip => {
                errorString += `  • ${tip}\n`;
            });
        }
        
        // Add stack trace information for development environment debugging
        if ((environmentConfig === 'development' || environmentConfig === 'educational') && this.stack) {
            errorString += '\nStack Trace:\n';
            const stackLines = this.stack.split('\n').slice(1, ERROR_STACK_DEPTH + 1);
            stackLines.forEach(line => {
                errorString += `  ${line}\n`;
            });
        }
        
        // Return complete educational error string representation
        return errorString;
    }
}

// =============================================================================
// ERROR HANDLING FUNCTIONS
// =============================================================================

/**
 * Handles server-level errors including startup failures, port binding issues,
 * and critical server errors with educational context and troubleshooting guidance
 * 
 * Educational Note: Server error handling demonstrates application lifecycle
 * management and provides learning opportunities about system-level error recovery
 * 
 * @param {Error} error - Server error object with details about the failure
 * @param {object} context - Optional context object with server configuration and state information
 * @returns {void} No return value, logs error with educational context and provides troubleshooting guidance
 */
function handleServerError(error, context = {}) {
    // Extract error details and classify server error type for educational categorization
    const errorMessage = error?.message || 'Unknown server error occurred';
    const errorCode = error?.code || context.errorCode || 'UNKNOWN_SERVER_ERROR';
    const errorType = ERROR_TYPES.SERVER;
    
    // Classify specific server error types for targeted troubleshooting guidance
    let specificErrorCategory = 'General Server Error';
    let troubleshootingGuidance = EDUCATIONAL_MESSAGES.TROUBLESHOOTING_HELP;
    
    if (errorCode === 'EADDRINUSE') {
        specificErrorCategory = 'Port Already in Use';
        troubleshootingGuidance = 'Port is already in use. Change the PORT environment variable or stop the conflicting process.';
    } else if (errorCode === 'EACCES') {
        specificErrorCategory = 'Permission Denied';
        troubleshootingGuidance = 'Permission denied for port binding. Try using a port above 1024 or run with elevated privileges.';
    } else if (errorCode === 'ENOTFOUND') {
        specificErrorCategory = 'Hostname Not Found';
        troubleshootingGuidance = 'Hostname could not be resolved. Check network configuration and hostname spelling.';
    }
    
    // Create comprehensive error context for educational logging and guidance
    const serverErrorContext = {
        errorType: errorType,
        errorCode: errorCode,
        category: specificErrorCategory,
        port: context.port || process.env.PORT || 3000,
        hostname: context.hostname || process.env.HOST || '127.0.0.1',
        pid: process.pid,
        uptime: Math.floor(process.uptime()),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
        troubleshooting: troubleshootingGuidance,
        ...context
    };
    
    // Log server error with comprehensive educational context using structured logging
    logError(error, serverErrorContext, { 
        level: 'error',
        educational: true,
        includeSystemInfo: true 
    });
    
    // Determine if server error is recoverable or requires process termination
    const isRecoverable = isRecoverableError(error);
    
    if (!isRecoverable) {
        // Log process termination notice with educational guidance for unrecoverable errors
        logger.error('Server error is unrecoverable, process will terminate', {
            errorCode: errorCode,
            category: specificErrorCategory,
            recoveryAction: 'Process termination required',
            educationalNote: 'Unrecoverable server errors require process restart to ensure stability'
        });
        
        // Provide educational guidance for resolving server startup issues
        if (educationalConfig.errors?.includeEducationalContext) {
            console.log('\n' + '='.repeat(80));
            console.log('EDUCATIONAL GUIDANCE FOR SERVER ERROR RESOLUTION');
            console.log('='.repeat(80));
            console.log(`Error Category: ${specificErrorCategory}`);
            console.log(`Troubleshooting: ${troubleshootingGuidance}`);
            
            if (errorCode === 'EADDRINUSE') {
                console.log('\nQuick Fix Steps:');
                console.log('1. Change port: PORT=3001 node server.js');
                console.log('2. Kill process: lsof -ti:3000 | xargs kill -9');
                console.log('3. Check running processes: netstat -tulpn | grep 3000');
            }
            
            console.log('\nLearning Objectives:');
            console.log('- Understanding Node.js server lifecycle and error handling');
            console.log('- Learning about port management and process handling');
            console.log('- Practicing debugging techniques for server startup issues');
            console.log('='.repeat(80) + '\n');
        }
        
        // Exit process with appropriate error code for system monitoring
        process.exit(1);
    } else {
        // Log recovery attempt for educational demonstration of error resilience
        logger.warn('Server error is recoverable, attempting to continue operation', {
            errorCode: errorCode,
            recoveryStrategy: 'Continue with degraded functionality',
            educationalNote: 'Recoverable errors demonstrate application resilience patterns'
        });
    }
}

/**
 * Handles HTTP request processing errors including parsing failures, routing errors,
 * and request validation issues with educational error responses and debugging assistance
 * 
 * Educational Note: Request error handling demonstrates proper HTTP error response
 * patterns and provides learning opportunities about client-server communication
 * 
 * @param {Error} error - Request processing error object
 * @param {object} req - HTTP request object that generated the error
 * @param {object} res - HTTP response object for sending error response
 * @returns {object} Formatted error response object with educational context and appropriate HTTP status
 */
function handleRequestError(error, req, res) {
    // Extract request context information for educational error analysis
    const requestMethod = req?.method || 'UNKNOWN';
    const requestUrl = req?.url || '/';
    const requestHeaders = req?.headers || {};
    const clientAddress = req?.socket?.remoteAddress || 'Unknown';
    
    // Classify request error type for appropriate handling strategy
    let statusCode = HTTP_STATUS.BAD_REQUEST;
    let errorCategory = 'Request Processing Error';
    
    // Determine specific error type and appropriate HTTP status code
    if (error?.code === 'INVALID_METHOD') {
        statusCode = HTTP_STATUS.METHOD_NOT_ALLOWED;
        errorCategory = 'Method Not Allowed';
    } else if (error?.code === 'INVALID_URL') {
        statusCode = HTTP_STATUS.NOT_FOUND;
        errorCategory = 'Resource Not Found';
    } else if (error?.code === 'INVALID_HEADERS') {
        statusCode = HTTP_STATUS.BAD_REQUEST;
        errorCategory = 'Invalid Headers';
    }
    
    // Build comprehensive request error context for educational logging and response
    const requestErrorContext = {
        errorType: ERROR_TYPES.REQUEST,
        errorCategory: errorCategory,
        statusCode: statusCode,
        requestMethod: requestMethod,
        requestUrl: requestUrl,
        clientAddress: clientAddress,
        userAgent: requestHeaders['user-agent'],
        contentType: requestHeaders['content-type'],
        timestamp: new Date().toISOString(),
        troubleshooting: getTroubleshootingGuidance(ERROR_TYPES.REQUEST, { 
            method: requestMethod, 
            url: requestUrl 
        })
    };
    
    // Log request error with structured context for educational debugging and learning
    logError(error, requestErrorContext, {
        level: 'warn',
        educational: true,
        includeRequestInfo: true
    });
    
    // Create educational error response object with troubleshooting guidance
    const errorResponse = createEducationalError(
        error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        ERROR_TYPES.REQUEST,
        statusCode,
        {
            troubleshootingGuidance: requestErrorContext.troubleshooting,
            debuggingSteps: [
                `Verify HTTP method '${requestMethod}' is supported for endpoint`,
                `Check URL path '${requestUrl}' matches expected endpoint pattern`,
                'Review request headers for proper formatting and required fields',
                'Examine request body structure if applicable'
            ],
            relatedConcepts: [
                'HTTP request structure and methods',
                'URL routing and path matching patterns',
                'Request header processing and validation'
            ]
        }
    );
    
    // Format error response for HTTP transmission with educational context
    const formattedResponse = formatErrorForResponse(errorResponse, {
        educational: true,
        includeDebuggingInfo: environmentConfig === 'development' || environmentConfig === 'educational',
        statusCode: statusCode
    });
    
    // Send HTTP error response with appropriate headers and educational content
    if (res && typeof res.writeHead === 'function' && typeof res.end === 'function') {
        try {
            res.writeHead(statusCode, {
                'Content-Type': 'application/json; charset=utf-8',
                'X-Tutorial-Error': 'true',
                'X-Error-Category': errorCategory
            });
            res.end(JSON.stringify(formattedResponse, null, 2));
        } catch (responseError) {
            // Fallback error response if primary response fails
            logger.error('Failed to send error response', responseError);
            res.writeHead(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
                'Content-Type': 'text/plain; charset=utf-8'
            });
            res.end('Internal Server Error: Unable to process request');
        }
    }
    
    // Return formatted error response object for further processing or testing
    return formattedResponse;
}

/**
 * Handles validation errors for request parameters, headers, or content with
 * educational feedback about proper HTTP request formatting and tutorial requirements
 * 
 * Educational Note: Validation error handling demonstrates input validation patterns
 * and provides learning opportunities about data validation and sanitization
 * 
 * @param {Error} validationError - Validation error with details about validation failure
 * @param {object} validationContext - Context about what was being validated
 * @returns {object} Formatted validation error response with educational guidance for proper request formatting
 */
function handleValidationError(validationError, validationContext = {}) {
    // Extract validation context information for educational error classification
    const validationType = validationContext.type || 'general';
    const validatedField = validationContext.field || 'unknown';
    const validatedValue = validationContext.value;
    const validationRules = validationContext.rules || {};
    
    // Build educational validation error context with specific guidance
    const validationErrorContext = {
        errorType: ERROR_TYPES.VALIDATION,
        validationType: validationType,
        field: validatedField,
        providedValue: validatedValue,
        validationRules: validationRules,
        statusCode: HTTP_STATUS.BAD_REQUEST,
        troubleshooting: generateValidationTroubleshooting(validationType, validatedField, validationRules)
    };
    
    // Log validation error with educational context for debugging and learning
    logError(validationError, validationErrorContext, {
        level: 'warn',
        educational: true,
        includeValidationInfo: true
    });
    
    // Create educational validation error with specific guidance and examples
    const validationErrorResponse = createEducationalError(
        validationError.message || 'Validation failed for request parameters',
        ERROR_TYPES.VALIDATION,
        HTTP_STATUS.BAD_REQUEST,
        {
            troubleshootingGuidance: validationErrorContext.troubleshooting,
            debuggingSteps: [
                `Check ${validatedField} parameter is provided and not empty`,
                'Verify parameter data type matches expected format',
                'Ensure parameter value is within acceptable range or pattern',
                'Review API documentation for parameter requirements'
            ],
            learningTips: [
                'Validation errors help prevent security vulnerabilities and data corruption',
                'Always validate user input before processing in production applications',
                'Use descriptive validation messages to help API consumers',
                'Consider both format validation and business rule validation'
            ],
            relatedConcepts: [
                'Input validation patterns and security',
                'Data type checking and conversion',
                'Parameter sanitization techniques'
            ]
        }
    );
    
    // Format validation error response with HTTP-compatible structure and educational content
    const formattedValidationResponse = formatErrorForResponse(validationErrorResponse, {
        educational: true,
        includeValidationGuidance: true,
        statusCode: HTTP_STATUS.BAD_REQUEST
    });
    
    // Add validation-specific information for educational value and debugging assistance
    if (educationalConfig.errors?.includeEducationalContext) {
        formattedValidationResponse.validation = {
            field: validatedField,
            providedValue: validatedValue,
            expectedFormat: validationRules.format || 'Not specified',
            allowedValues: validationRules.allowedValues || 'Not specified',
            examples: generateValidationExamples(validationType, validatedField, validationRules)
        };
    }
    
    // Return comprehensive validation error response ready for HTTP transmission
    return formattedValidationResponse;
}

/**
 * Formats error objects into consistent HTTP response format with educational context,
 * appropriate status codes, and structured error information for client consumption
 * 
 * Educational Note: Error formatting demonstrates response standardization patterns
 * and provides learning opportunities about HTTP error response best practices
 * 
 * @param {Error} error - Error object to format for HTTP response
 * @param {object} options - Formatting options including educational features and response preferences
 * @returns {object} Formatted error response object with status, message, and educational context ready for HTTP transmission
 */
function formatErrorForResponse(error, options = {}) {
    // Extract formatting options with educational defaults and safe fallbacks
    const {
        educational = educationalConfig.errors?.includeEducationalContext || false,
        includeDebuggingInfo = environmentConfig === 'development' || environmentConfig === 'educational',
        includeStackTrace = environmentConfig === 'development',
        statusCode = error.statusCode || DEFAULT_ERROR_STATUS,
        includeTimestamp = true
    } = options;
    
    // Determine if error is an EducationalError instance for enhanced formatting
    const isEducationalError = error instanceof EducationalError || error[EDUCATIONAL_ERROR_SYMBOL];
    
    // Build base formatted response object with HTTP-compatible structure
    const formattedResponse = {
        error: true,
        status: statusCode,
        message: error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        type: error.errorType || ERROR_TYPES.SERVER
    };
    
    // Add timestamp information if requested for debugging and logging correlation
    if (includeTimestamp) {
        formattedResponse.timestamp = error.timestamp || new Date().toISOString();
    }
    
    // Include educational context and guidance for enhanced learning experience
    if (educational && isEducationalError) {
        formattedResponse.educational = {
            troubleshooting: error.educationalContext?.troubleshootingGuidance || 
                           EDUCATIONAL_MESSAGES.TROUBLESHOOTING_HELP,
            debuggingSteps: error.educationalContext?.debuggingSteps || [],
            learningTips: error.educationalContext?.learningTips || [],
            relatedConcepts: error.educationalContext?.relatedConcepts || []
        };
        
        // Add tutorial-specific guidance for Node.js learning objectives
        formattedResponse.tutorial = {
            context: 'This error provides learning opportunities for Node.js development',
            objectives: [
                'Practice error identification and debugging techniques',
                'Learn HTTP status code selection and usage patterns',
                'Understand error handling and recovery strategies',
                'Develop troubleshooting and problem-solving skills'
            ]
        };
    }
    
    // Include debugging information for development and educational environments
    if (includeDebuggingInfo) {
        formattedResponse.debug = {
            errorName: error.name || 'Error',
            errorCode: error.code || 'UNKNOWN',
            recoverable: error.isRecoverable !== undefined ? error.isRecoverable : isRecoverableError(error),
            nodeVersion: process.version,
            platform: process.platform,
            timestamp: new Date().toISOString()
        };
        
        // Add stack trace for detailed debugging if enabled and available
        if (includeStackTrace && error.stack) {
            formattedResponse.debug.stackTrace = error.stack.split('\n').slice(0, ERROR_STACK_DEPTH);
        }
    }
    
    // Add HTTP-specific formatting and headers information for client consumption
    formattedResponse.http = {
        statusCode: statusCode,
        statusText: getStatusText(statusCode),
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'X-Error-Type': error.errorType || ERROR_TYPES.SERVER,
            'X-Tutorial-Error': educational ? 'true' : 'false'
        }
    };
    
    // Include recovery guidance for operational errors and application resilience
    if (error.isRecoverable !== false) {
        formattedResponse.recovery = {
            recoverable: true,
            suggestions: [
                'Retry the request with corrected parameters',
                'Check request format against API documentation',
                'Verify network connectivity and server availability',
                'Review error message for specific resolution guidance'
            ]
        };
    }
    
    // Return complete formatted error response ready for HTTP transmission
    return formattedResponse;
}

/**
 * Centralized error logging function that provides structured error logging with
 * educational formatting, context preservation, and comprehensive debugging information
 * 
 * Educational Note: Centralized logging ensures consistent error documentation
 * and provides learning opportunities about logging best practices and debugging
 * 
 * @param {Error} error - Error object to log with educational context
 * @param {object} context - Additional context about error occurrence including request details and application state
 * @param {object} options - Logging options including educational formatting preferences
 * @returns {void} No return value, outputs comprehensive error log with educational formatting
 */
function logError(error, context = {}, options = {}) {
    // Extract logging options with educational defaults and environment-specific settings
    const {
        level = 'error',
        educational = educationalConfig.errors?.includeEducationalContext || false,
        includeSystemInfo = environmentConfig === 'development' || environmentConfig === 'educational',
        includeStackTrace = environmentConfig === 'development'
    } = options;
    
    // Build comprehensive error logging context with educational and debugging information
    const errorLogContext = {
        errorName: error.name || 'Error',
        errorMessage: error.message || 'Unknown error occurred',
        errorType: error.errorType || ERROR_TYPES.SERVER,
        errorCode: error.code || 'UNKNOWN',
        timestamp: new Date().toISOString(),
        recoverable: error.isRecoverable !== undefined ? error.isRecoverable : isRecoverableError(error),
        ...context
    };
    
    // Include system information for comprehensive debugging and educational context
    if (includeSystemInfo) {
        errorLogContext.system = {
            nodeVersion: process.version,
            platform: process.platform,
            architecture: process.arch,
            pid: process.pid,
            uptime: Math.floor(process.uptime()),
            memoryUsage: process.memoryUsage()
        };
    }
    
    // Add educational context and troubleshooting guidance for learning enhancement
    if (educational && error instanceof EducationalError) {
        errorLogContext.educational = {
            troubleshootingGuidance: error.educationalContext?.troubleshootingGuidance,
            debuggingSteps: error.educationalContext?.debuggingSteps,
            learningTips: error.educationalContext?.learningTips,
            relatedConcepts: error.educationalContext?.relatedConcepts
        };
    }
    
    // Include stack trace information for debugging if enabled and available
    if (includeStackTrace && error.stack) {
        errorLogContext.stackTrace = error.stack.split('\n').slice(0, ERROR_STACK_DEPTH);
    }
    
    // Log error using structured logger with appropriate level and educational formatting
    switch (level.toLowerCase()) {
        case 'error':
            logger.error(error.message || 'Error occurred', error, errorLogContext);
            break;
        case 'warn':
            logger.warn(error.message || 'Warning occurred', errorLogContext);
            break;
        case 'info':
            logger.info(error.message || 'Information logged', errorLogContext);
            break;
        case 'debug':
            logger.debug(error.message || 'Debug information', errorLogContext);
            break;
        default:
            logger.error(error.message || 'Error occurred', error, errorLogContext);
    }
    
    // Output additional educational guidance for tutorial learning and skill development
    if (educational && educationalConfig.debugging?.verboseDebugging) {
        console.log('\n' + '='.repeat(60));
        console.log('EDUCATIONAL ERROR ANALYSIS');
        console.log('='.repeat(60));
        console.log(`Error Type: ${errorLogContext.errorType}`);
        console.log(`Recovery Possible: ${errorLogContext.recoverable ? 'Yes' : 'No'}`);
        
        if (error.educationalContext?.troubleshootingGuidance) {
            console.log(`Troubleshooting: ${error.educationalContext.troubleshootingGuidance}`);
        }
        
        console.log('\nDebugging Practice:');
        console.log('1. Examine the error message above for specific clues');
        console.log('2. Review the stack trace to locate the error source');
        console.log('3. Check recent code changes that might have introduced the issue');
        console.log('4. Use Node.js debugging tools for detailed analysis');
        console.log('='.repeat(60) + '\n');
    }
}

/**
 * Factory function that creates EducationalError instances with tutorial-specific
 * context, troubleshooting guidance, and educational metadata for enhanced learning
 * 
 * Educational Note: Factory pattern provides controlled error creation with consistent
 * configuration and educational enhancement while maintaining error object standards
 * 
 * @param {string} message - Primary error message describing the issue
 * @param {string} errorType - Classification of error type for educational categorization
 * @param {number} statusCode - HTTP status code for error response
 * @param {object} educationalContext - Educational context including learning guidance and troubleshooting tips
 * @returns {EducationalError} EducationalError instance with tutorial-specific error handling and educational context
 */
function createEducationalError(message, errorType = ERROR_TYPES.SERVER, statusCode = DEFAULT_ERROR_STATUS, educationalContext = {}) {
    // Validate input parameters for proper error creation and educational value
    if (typeof message !== 'string' || !message.trim()) {
        message = 'Unknown error occurred in tutorial application';
    }
    
    if (!Object.values(ERROR_TYPES).includes(errorType)) {
        logger.warn(`Invalid error type provided: ${errorType}, defaulting to SERVER`, {
            providedType: errorType,
            validTypes: Object.values(ERROR_TYPES)
        });
        errorType = ERROR_TYPES.SERVER;
    }
    
    if (typeof statusCode !== 'number' || statusCode < 100 || statusCode > 599) {
        logger.warn(`Invalid status code provided: ${statusCode}, defaulting to ${DEFAULT_ERROR_STATUS}`, {
            providedStatusCode: statusCode,
            defaultStatusCode: DEFAULT_ERROR_STATUS
        });
        statusCode = DEFAULT_ERROR_STATUS;
    }
    
    // Create EducationalError instance with validated parameters and educational context
    const educationalError = new EducationalError(message, errorType, statusCode, educationalContext);
    
    // Enhance error with tutorial-specific metadata and learning objectives
    if (educationalConfig.errors?.includeEducationalContext) {
        educationalError.addEducationalContext({
            tutorialVersion: appConfig?.app?.version || '1.0.0',
            learningObjective: 'Practice error handling and debugging in Node.js applications',
            skillDevelopment: [
                'Error identification and classification',
                'Debugging techniques and problem-solving',
                'HTTP error response handling',
                'Application resilience patterns'
            ]
        });
    }
    
    // Log error creation for educational transparency and debugging assistance
    if (educationalConfig.debugging?.showInternalState) {
        logger.debug(`EducationalError created: ${errorType}`, {
            message: message,
            statusCode: statusCode,
            hasEducationalContext: Object.keys(educationalContext).length > 0
        });
    }
    
    // Return configured EducationalError ready for use in error handling
    return educationalError;
}

/**
 * Determines whether an error is recoverable (operational) or unrecoverable (programming)
 * to inform error handling strategy and educational guidance about error types
 * 
 * Educational Note: Error recoverability assessment helps students understand different
 * error handling strategies and application resilience patterns for robust applications
 * 
 * @param {Error} error - Error object to analyze for recoverability assessment
 * @returns {boolean} True if error is recoverable and application can continue safely, false if error requires process termination
 */
function isRecoverableError(error) {
    // Return cached recoverability assessment if available from EducationalError instance
    if (error.isRecoverable !== undefined) {
        return error.isRecoverable;
    }
    
    // Check error code patterns for known recoverable and unrecoverable error types
    const errorCode = error.code || '';
    const errorMessage = error.message || '';
    
    // Unrecoverable system-level errors that require process restart for stability
    const unrecoverableErrorCodes = [
        'EADDRINUSE',        // Port already in use - configuration issue
        'EACCES',           // Permission denied - system permission issue
        'ENOMEM',           // Out of memory - system resource exhaustion
        'MODULE_NOT_FOUND',  // Missing module - deployment/configuration issue
        'STACK_OVERFLOW'     // Stack overflow - programming logic issue
    ];
    
    // Check if error code indicates unrecoverable system or configuration error
    if (unrecoverableErrorCodes.includes(errorCode)) {
        return false;
    }
    
    // Unrecoverable error patterns in error messages indicating fundamental issues
    const unrecoverablePatterns = [
        /cannot find module/i,
        /unexpected token/i,
        /syntaxerror/i,
        /referenceerror.*is not defined/i,
        /maximum call stack size exceeded/i
    ];
    
    // Check error message against patterns indicating programming errors
    for (const pattern of unrecoverablePatterns) {
        if (pattern.test(errorMessage)) {
            return false;
        }
    }
    
    // Recoverable HTTP and request processing errors that allow continued operation
    const recoverableErrorCodes = [
        'INVALID_REQUEST',   // Client request format issues
        'VALIDATION_ERROR',  // Input validation failures
        'NOT_FOUND',        // Resource not found errors
        'METHOD_NOT_ALLOWED', // HTTP method not supported
        'TIMEOUT'           // Request timeout errors
    ];
    
    // Check if error code indicates recoverable operational error
    if (recoverableErrorCodes.includes(errorCode)) {
        return true;
    }
    
    // Check error type classification for recoverability assessment
    if (error.errorType) {
        switch (error.errorType) {
            case ERROR_TYPES.REQUEST:
            case ERROR_TYPES.VALIDATION:
            case ERROR_TYPES.RESPONSE:
                return true; // These error types are generally recoverable
            case ERROR_TYPES.SERVER:
            case ERROR_TYPES.CONFIGURATION:
                return false; // These typically require restart
            default:
                return false; // Unknown error types default to non-recoverable for safety
        }
    }
    
    // Default to non-recoverable for unknown error patterns to ensure application stability
    return false;
}

/**
 * Generates specific troubleshooting guidance based on error type and context,
 * providing educational assistance and step-by-step resolution guidance for common issues
 * 
 * Educational Note: Contextual troubleshooting guidance helps students learn debugging
 * techniques and develop problem-solving skills for different error scenarios
 * 
 * @param {string} errorType - Type of error for specific troubleshooting guidance
 * @param {object} errorContext - Context about error occurrence for targeted guidance
 * @returns {string} Educational troubleshooting guidance with step-by-step resolution instructions
 */
function getTroubleshootingGuidance(errorType, errorContext = {}) {
    // Initialize base troubleshooting guidance with general debugging principles
    let troubleshootingGuidance = EDUCATIONAL_MESSAGES.TROUBLESHOOTING_HELP;
    
    // Generate error-type specific troubleshooting guidance with educational context
    switch (errorType) {
        case ERROR_TYPES.SERVER:
            troubleshootingGuidance = 'Server Error Troubleshooting:\n' +
                '1. Check if the specified port is available and not in use by another process\n' +
                '2. Verify system permissions for port binding (use ports above 1024 for non-root users)\n' +
                '3. Review server configuration parameters and environment variables\n' +
                '4. Examine system resources (memory, CPU) and ensure adequate availability\n' +
                '5. Check Node.js version compatibility and system requirements';
            
            // Add specific guidance for common server error codes
            if (errorContext.errorCode === 'EADDRINUSE') {
                troubleshootingGuidance += '\n\nPort Already in Use - Specific Solutions:\n' +
                    '• Change port: PORT=3001 node server.js\n' +
                    '• Kill conflicting process: lsof -ti:3000 | xargs kill -9\n' +
                    '• Check running processes: netstat -tulpn | grep 3000';
            }
            break;
            
        case ERROR_TYPES.REQUEST:
            troubleshootingGuidance = 'Request Error Troubleshooting:\n' +
                '1. Verify HTTP method (GET, POST, etc.) is supported by the endpoint\n' +
                '2. Check URL path matches the expected endpoint pattern exactly\n' +
                '3. Examine request headers for proper formatting and required fields\n' +
                '4. Review request body structure and content-type if applicable\n' +
                '5. Ensure client and server are communicating using the same protocol';
            
            // Add method-specific guidance
            if (errorContext.method && errorContext.method !== 'GET') {
                troubleshootingGuidance += '\n\nMethod-Specific Guidance:\n' +
                    `• The tutorial server only supports GET requests\n` +
                    `• Your request used method: ${errorContext.method}\n` +
                    `• Change to GET method or use: curl -X GET ${errorContext.url || '/hello'}`;
            }
            break;
            
        case ERROR_TYPES.VALIDATION:
            troubleshootingGuidance = 'Validation Error Troubleshooting:\n' +
                '1. Check that all required parameters are provided and not empty\n' +
                '2. Verify parameter data types match expected formats (string, number, boolean)\n' +
                '3. Ensure parameter values are within acceptable ranges or match patterns\n' +
                '4. Review API documentation for specific parameter requirements\n' +
                '5. Use validation tools or examples to test parameter formats';
            
            // Add field-specific guidance if available
            if (errorContext.field) {
                troubleshootingGuidance += '\n\nField-Specific Guidance:\n' +
                    `• Problem with field: ${errorContext.field}\n` +
                    `• Check the format and value requirements for this specific field\n` +
                    `• Refer to examples or documentation for proper formatting`;
            }
            break;
            
        case ERROR_TYPES.RESPONSE:
            troubleshootingGuidance = 'Response Error Troubleshooting:\n' +
                '1. Verify response status code is a valid HTTP status (100-599)\n' +
                '2. Check that response headers are properly formatted and not conflicting\n' +
                '3. Review response body content and encoding for proper structure\n' +
                '4. Ensure response.end() is called properly to complete the response\n' +
                '5. Check for any response middleware that might be interfering';
            break;
            
        case ERROR_TYPES.CONFIGURATION:
            troubleshootingGuidance = 'Configuration Error Troubleshooting:\n' +
                '1. Check environment variables are set correctly (NODE_ENV, PORT, etc.)\n' +
                '2. Verify configuration file syntax and structure are valid\n' +
                '3. Review default configuration values and any environment overrides\n' +
                '4. Examine configuration validation and loading process for errors\n' +
                '5. Ensure all required configuration sections are present and complete';
            break;
            
        default:
            troubleshootingGuidance = 'General Error Troubleshooting:\n' +
                '1. Read the error message carefully for specific clues about the problem\n' +
                '2. Check the stack trace to identify the exact location where the error occurred\n' +
                '3. Review recent code changes that might have introduced the issue\n' +
                '4. Use console.log() statements to trace execution flow and variable values\n' +
                '5. Consult Node.js documentation for proper API usage and examples';
    }
    
    // Add educational context and learning objectives to troubleshooting guidance
    if (educationalConfig.errors?.includeEducationalContext) {
        troubleshootingGuidance += '\n\nEducational Learning Objectives:\n' +
            '• Practice systematic debugging and problem-solving techniques\n' +
            '• Learn to interpret error messages and stack traces effectively\n' +
            '• Develop skills in using debugging tools and console logging\n' +
            '• Understand error prevention strategies and best practices\n' +
            '• Build confidence in troubleshooting Node.js applications';
    }
    
    // Return comprehensive troubleshooting guidance for educational assistance
    return troubleshootingGuidance;
}

// =============================================================================
// UTILITY HELPER FUNCTIONS
// =============================================================================

/**
 * Generates validation-specific troubleshooting guidance based on validation type and rules
 * Educational Note: Helps students understand validation patterns and requirements
 */
function generateValidationTroubleshooting(validationType, field, rules) {
    let guidance = `Validation failed for ${field} field. `;
    
    if (rules.required && !rules.provided) {
        guidance += 'This field is required and cannot be empty. ';
    }
    
    if (rules.type) {
        guidance += `Expected data type: ${rules.type}. `;
    }
    
    if (rules.format) {
        guidance += `Expected format: ${rules.format}. `;
    }
    
    return guidance + 'Please check your input and try again.';
}

/**
 * Generates validation examples based on field type and validation rules
 * Educational Note: Provides concrete examples to help students understand requirements
 */
function generateValidationExamples(validationType, field, rules) {
    const examples = [];
    
    switch (validationType) {
        case 'string':
            examples.push('Example: "Hello World"');
            if (rules.minLength) examples.push(`Minimum length: ${rules.minLength} characters`);
            break;
        case 'number':
            examples.push('Example: 42');
            if (rules.min) examples.push(`Minimum value: ${rules.min}`);
            if (rules.max) examples.push(`Maximum value: ${rules.max}`);
            break;
        case 'email':
            examples.push('Example: user@example.com');
            break;
        default:
            examples.push('Check API documentation for specific format requirements');
    }
    
    return examples;
}

/**
 * Gets HTTP status text for a given status code
 * Educational Note: Provides standard HTTP status text for educational context
 */
function getStatusText(statusCode) {
    const statusTexts = {
        200: 'OK',
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        405: 'Method Not Allowed',
        500: 'Internal Server Error',
        501: 'Not Implemented',
        502: 'Bad Gateway',
        503: 'Service Unavailable'
    };
    
    return statusTexts[statusCode] || 'Unknown Status';
}

// =============================================================================
// MODULE EXPORTS
// =============================================================================

module.exports = {
    // Main error handling functions for different error scenarios and contexts
    handleServerError,
    handleRequestError,
    handleValidationError,
    
    // Error formatting and response generation functions for HTTP communication
    formatErrorForResponse,
    
    // Centralized error logging function with educational formatting and context
    logError,
    
    // Custom EducationalError class with tutorial-specific features and guidance
    EducationalError,
    
    // Error type classification constants for educational categorization throughout application
    ERROR_TYPES,
    
    // Factory function for creating EducationalError instances with tutorial context
    createEducationalError,
    
    // Utility function for determining error recoverability and handling strategies
    isRecoverableError,
    
    // Function for generating specific troubleshooting guidance based on error context
    getTroubleshootingGuidance
};