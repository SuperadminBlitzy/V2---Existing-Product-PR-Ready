/**
 * Node.js Tutorial Educational Logging Utility Module
 * 
 * This module provides structured console-based logging for the Node.js tutorial HTTP server application.
 * It implements comprehensive logging functionality with educational context, color-coded output, performance
 * timing, and tutorial-specific formatting to enhance learning visibility and debugging assistance
 * throughout the application.
 * 
 * Educational Features:
 * - Color-coded output for visual distinction of log levels and message types
 * - Educational prefixes and context for tutorial learning objectives
 * - Performance timing utilities for demonstrating performance monitoring concepts
 * - Request/response correlation logging for HTTP server learning
 * - Troubleshooting guidance integrated into log messages for learning assistance
 * - Tutorial-specific formatting tailored for Node.js education
 * - Development assistance with enhanced debugging information and context
 * 
 * Integration Points:
 * - Used by request-logger.js middleware for HTTP request/response logging
 * - Used by error-middleware.js for centralized error logging with educational guidance
 * - Used by hello-handler.js for endpoint-specific logging and response generation
 * - Used by server.js for application lifecycle logging and configuration events
 * - Used by http-server.js for server event logging and operational monitoring
 * - Integrates with app-config.js for logging configuration and educational settings
 * 
 * Performance Considerations:
 * - Minimal overhead design suitable for tutorial environments
 * - Efficient message formatting with optimized string operations
 * - Conditional logging to avoid unnecessary processing for disabled log levels
 * - Color detection with caching for terminal performance optimization
 * - High-resolution timing using process.hrtime.bigint() for accurate metrics
 */

// Node.js built-in modules for object inspection and formatting - Node.js Built-in
const util = require('node:util');

// Node.js built-in process module for environment detection and performance timing - Node.js Built-in
const process = require('node:process');

// Import application configuration for logging levels, educational settings, and environment behavior
const { appConfig } = require('../config/app-config.js');

// =============================================================================
// GLOBAL CONSTANTS AND CONFIGURATION
// =============================================================================

/**
 * Log levels with numeric values for level comparison and filtering
 * Educational Note: Log levels provide hierarchical filtering where higher numbers
 * indicate more severe conditions, allowing selective logging based on environment
 */
const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

/**
 * Educational prefix for tutorial identification in all log messages
 * Educational Note: Consistent prefixing helps identify tutorial-specific logs
 * in mixed environments and provides clear educational context
 */
const EDUCATIONAL_PREFIX = '[Node.js Tutorial]';

/**
 * Color codes for terminal output formatting with ANSI escape sequences
 * Educational Note: Color coding improves log readability and provides visual
 * distinction between different log levels and message types
 */
const COLOR_CODES = {
    RESET: '\x1b[0m',
    RED: '\x1b[31m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    CYAN: '\x1b[36m',
    MAGENTA: '\x1b[35m',
    GRAY: '\x1b[90m'
};

/**
 * Default log level for safe tutorial operation with appropriate verbosity
 * Educational Note: Info level provides sufficient detail for learning while
 * avoiding overwhelming beginners with debug-level verbosity
 */
const DEFAULT_LOG_LEVEL = 'info';

// Extract configuration values with fallbacks for safe operation
const loggingConfig = appConfig?.logging || {};
const educationalConfig = appConfig?.educational || {};
const environmentConfig = appConfig?.environment || 'development';

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Determines whether a message should be logged based on current log level configuration,
 * environment settings, and educational mode preferences
 * 
 * Educational Note: Log level checking prevents unnecessary processing and allows
 * different verbosity levels for development versus production environments
 * 
 * @param {string} targetLevel - Target log level to check against current configuration
 * @returns {boolean} True if message should be logged at specified level, false otherwise
 */
function shouldLogAtLevel(targetLevel) {
    // Get current log level from configuration with fallback to default
    const currentLevel = loggingConfig.level || DEFAULT_LOG_LEVEL;
    
    // Convert target level and current level to numeric values for comparison
    const targetLevelNum = LOG_LEVELS[targetLevel.toUpperCase()];
    const currentLevelNum = LOG_LEVELS[currentLevel.toUpperCase()];
    
    // Validate that both levels are recognized
    if (targetLevelNum === undefined || currentLevelNum === undefined) {
        // If level is unrecognized, default to allowing the log for educational safety
        return true;
    }
    
    // Check if target level meets or exceeds current threshold
    if (targetLevelNum >= currentLevelNum) {
        return true;
    }
    
    // Consider educational mode for enhanced logging visibility
    if (educationalConfig.tutorial?.mode && targetLevel.toLowerCase() === 'debug') {
        return true; // Allow debug logs in educational mode for learning
    }
    
    // Apply environment-specific logging rules
    if (environmentConfig === 'educational' && targetLevelNum >= LOG_LEVELS.INFO) {
        return true; // Enhanced logging in educational environment
    }
    
    // Return false if target level is below current threshold
    return false;
}

/**
 * Formats log messages with educational context, timestamps, color coding, and consistent
 * formatting for tutorial clarity and professional logging demonstration
 * 
 * Educational Note: Consistent message formatting improves readability and demonstrates
 * professional logging practices while maintaining educational value
 * 
 * @param {string} level - Log level string (DEBUG, INFO, WARN, ERROR)
 * @param {string} message - Primary log message content
 * @param {object} context - Optional context object with additional information
 * @param {object} options - Formatting options for color and educational features
 * @returns {string} Formatted log message string ready for console output with educational context
 */
function formatLogMessage(level, message, context = {}, options = {}) {
    // Generate timestamp in educational-friendly ISO format
    const timestamp = new Date().toISOString();
    
    // Determine appropriate color coding based on log level
    let levelColor = COLOR_CODES.RESET;
    switch (level.toUpperCase()) {
        case 'DEBUG':
            levelColor = COLOR_CODES.CYAN;
            break;
        case 'INFO':
            levelColor = COLOR_CODES.GREEN;
            break;
        case 'WARN':
            levelColor = COLOR_CODES.YELLOW;
            break;
        case 'ERROR':
            levelColor = COLOR_CODES.RED;
            break;
        default:
            levelColor = COLOR_CODES.RESET;
    }
    
    // Check if color output is supported and enabled
    const colorEnabled = loggingConfig.format?.colorOutput !== false && 
                        (process.stdout?.isTTY || options.forceColor);
    
    // Apply color formatting conditionally
    const colorStart = colorEnabled ? levelColor : '';
    const colorEnd = colorEnabled ? COLOR_CODES.RESET : '';
    
    // Build educational prefix with tutorial context
    const educationalPrefix = educationalConfig.logging?.includeEducationalPrefixes ? 
        EDUCATIONAL_PREFIX : '';
    
    // Format level indicator with consistent width for alignment
    const levelIndicator = `[${level.toUpperCase().padEnd(5)}]`;
    
    // Create base message structure with timestamp and level
    let formattedMessage = `${colorStart}${timestamp} ${levelIndicator}${colorEnd}`;
    
    // Add educational prefix if enabled
    if (educationalPrefix) {
        formattedMessage += ` ${colorStart}${educationalPrefix}${colorEnd}`;
    }
    
    // Add primary message content with proper spacing
    formattedMessage += ` ${message}`;
    
    // Include additional context information if provided
    if (context && Object.keys(context).length > 0) {
        const contextStr = util.inspect(context, { 
            colors: colorEnabled, 
            depth: 2, 
            compact: true 
        });
        formattedMessage += ` ${COLOR_CODES.GRAY}Context: ${contextStr}${COLOR_CODES.RESET}`;
    }
    
    // Add performance timing information if available
    if (context.duration) {
        const durationColor = colorEnabled ? COLOR_CODES.BLUE : '';
        formattedMessage += ` ${durationColor}[${context.duration}ms]${COLOR_CODES.RESET}`;
    }
    
    // Include educational tips and troubleshooting guidance when appropriate
    if (educationalConfig.errors?.includeTroubleshootingTips && level.toUpperCase() === 'ERROR') {
        if (context.troubleshooting) {
            formattedMessage += `\n${COLOR_CODES.YELLOW}💡 Tip: ${context.troubleshooting}${COLOR_CODES.RESET}`;
        }
    }
    
    // Return complete formatted message for console output
    return formattedMessage;
}

/**
 * Core logging function that outputs messages at specified log levels with educational formatting,
 * context preservation, and appropriate console method selection
 * 
 * Educational Note: Centralized logging ensures consistency and allows for easy modification
 * of logging behavior throughout the application
 * 
 * @param {string} level - Target log level for the message
 * @param {string} message - Primary message content to log
 * @param {...any} args - Additional arguments for context and formatting
 * @returns {void} No return value, outputs formatted log message to console
 */
function logWithLevel(level, message, ...args) {
    // Check if message should be logged based on current log level configuration
    if (!shouldLogAtLevel(level)) {
        return; // Exit early if level is disabled
    }
    
    // Extract context object from arguments if provided
    let context = {};
    let additionalArgs = [];
    
    // Process additional arguments for context extraction
    args.forEach(arg => {
        if (arg && typeof arg === 'object' && !Array.isArray(arg) && !(arg instanceof Error)) {
            Object.assign(context, arg);
        } else {
            additionalArgs.push(arg);
        }
    });
    
    // Format message using formatLogMessage function
    const formattedMessage = formatLogMessage(level, message, context);
    
    // Select appropriate console method based on log level
    let consoleMethod;
    switch (level.toUpperCase()) {
        case 'DEBUG':
            consoleMethod = console.debug;
            break;
        case 'INFO':
            consoleMethod = console.info;
            break;
        case 'WARN':
            consoleMethod = console.warn;
            break;
        case 'ERROR':
            consoleMethod = console.error;
            break;
        default:
            consoleMethod = console.log;
    }
    
    // Handle console output errors gracefully
    try {
        // Output formatted message to console with proper method
        if (additionalArgs.length > 0) {
            consoleMethod(formattedMessage, ...additionalArgs);
        } else {
            consoleMethod(formattedMessage);
        }
        
        // Track logging metrics for educational monitoring if enabled
        if (educationalConfig.performance?.showTimingInfo && context.startTime) {
            const duration = Date.now() - context.startTime;
            if (duration > 100) { // Log slow operations for educational awareness
                console.debug(`${COLOR_CODES.YELLOW}[PERFORMANCE] Slow log operation: ${duration}ms${COLOR_CODES.RESET}`);
            }
        }
    } catch (error) {
        // Fallback to basic console.log if specific method fails
        console.log(`[LOGGING ERROR] ${formattedMessage}`);
        console.error('Logging error:', error.message);
    }
}

/**
 * Educational HTTP request logging function that captures and formats incoming request details
 * with method, URL, headers, and timing information for learning demonstration
 * 
 * Educational Note: Request logging helps students understand the HTTP request lifecycle
 * and provides visibility into server processing patterns
 * 
 * @param {object} req - HTTP request object from Node.js http.IncomingMessage
 * @param {object} options - Optional logging configuration for request details
 * @returns {void} No return value, outputs structured request log to console
 */
function logRequest(req, options = {}) {
    // Check if request logging is enabled in configuration
    if (!loggingConfig.request?.enabled) {
        return; // Exit early if request logging is disabled
    }
    
    // Extract HTTP method, URL, and relevant headers from request object
    const method = req.method || 'UNKNOWN';
    const url = req.url || '/';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const contentType = req.headers['content-type'] || 'Not specified';
    
    // Parse request URL for educational breakdown of components
    let parsedUrl;
    try {
        parsedUrl = new URL(url, `http://${req.headers.host || 'localhost'}`);
    } catch (error) {
        parsedUrl = { pathname: url, search: '', hash: '' };
    }
    
    // Format timestamp for request arrival timing
    const timestamp = new Date().toISOString();
    
    // Build educational context about HTTP request processing
    const requestContext = {
        method: method,
        path: parsedUrl.pathname,
        query: parsedUrl.search,
        timestamp: timestamp,
        userAgent: userAgent.substring(0, 50) + (userAgent.length > 50 ? '...' : ''),
        contentType: contentType,
        startTime: Date.now() // For response correlation
    };
    
    // Include client information if available for learning context
    const clientInfo = {
        remoteAddress: req.socket?.remoteAddress || 'Unknown',
        remotePort: req.socket?.remotePort || 'Unknown',
        httpVersion: req.httpVersion || '1.1'
    };
    
    // Apply color coding for different HTTP methods
    let methodColor = COLOR_CODES.BLUE;
    if (method === 'GET') methodColor = COLOR_CODES.GREEN;
    else if (method === 'POST') methodColor = COLOR_CODES.YELLOW;
    else if (method === 'PUT') methodColor = COLOR_CODES.CYAN;
    else if (method === 'DELETE') methodColor = COLOR_CODES.RED;
    
    // Create educational message about request processing
    const colorEnabled = loggingConfig.format?.colorOutput !== false && process.stdout?.isTTY;
    const methodFormatted = colorEnabled ? `${methodColor}${method}${COLOR_CODES.RESET}` : method;
    
    let requestMessage = `Incoming HTTP request: ${methodFormatted} ${url}`;
    
    // Add educational context about HTTP request processing
    if (educationalConfig.logging?.showRequestFlow) {
        requestMessage += ` from ${clientInfo.remoteAddress}:${clientInfo.remotePort}`;
    }
    
    // Include headers information for educational purposes if enabled
    const logContext = { ...requestContext };
    if (loggingConfig.request?.includeHeaders && educationalConfig.logging?.verboseMode) {
        logContext.headers = {
            host: req.headers.host,
            connection: req.headers.connection,
            accept: req.headers.accept
        };
    }
    
    // Store request timing information for response correlation
    if (!req._loggerContext) {
        req._loggerContext = {
            startTime: Date.now(),
            requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        logContext.requestId = req._loggerContext.requestId;
    }
    
    // Output formatted request log with educational prefixes
    logWithLevel('INFO', requestMessage, logContext);
    
    // Add educational guidance for common HTTP concepts
    if (educationalConfig.logging?.demonstratePatterns) {
        if (method === 'GET' && parsedUrl.pathname === '/hello') {
            logWithLevel('DEBUG', 'Educational note: GET request to /hello endpoint demonstrates basic HTTP routing', {
                concept: 'HTTP GET method for resource retrieval',
                pattern: 'RESTful endpoint design'
            });
        }
    }
}

/**
 * Educational HTTP response logging function that captures response details including status code,
 * processing time, and performance metrics for tutorial learning
 * 
 * Educational Note: Response logging correlates with request logging to show complete
 * request-response cycle timing and helps students understand server performance
 * 
 * @param {object} req - Original HTTP request object for context correlation
 * @param {object} res - HTTP response object from Node.js http.ServerResponse
 * @param {number} duration - Request processing duration in milliseconds
 * @returns {void} No return value, outputs structured response log with performance context
 */
function logResponse(req, res, duration) {
    // Check if response logging is enabled in configuration
    if (!loggingConfig.request?.enabled) {
        return; // Exit early if response logging is disabled
    }
    
    // Extract response status code and relevant headers
    const statusCode = res.statusCode || 500;
    const contentType = res.getHeader('content-type') || 'Not set';
    const contentLength = res.getHeader('content-length') || 'Unknown';
    
    // Calculate and format processing duration for performance awareness
    const processingTime = duration || (req._loggerContext ? Date.now() - req._loggerContext.startTime : 0);
    
    // Determine response category (success/error) for educational context
    let statusCategory = 'Unknown';
    let statusColor = COLOR_CODES.RESET;
    if (statusCode >= 200 && statusCode < 300) {
        statusCategory = 'Success';
        statusColor = COLOR_CODES.GREEN;
    } else if (statusCode >= 300 && statusCode < 400) {
        statusCategory = 'Redirect';
        statusColor = COLOR_CODES.BLUE;
    } else if (statusCode >= 400 && statusCode < 500) {
        statusCategory = 'Client Error';
        statusColor = COLOR_CODES.YELLOW;
    } else if (statusCode >= 500) {
        statusCategory = 'Server Error';
        statusColor = COLOR_CODES.RED;
    }
    
    // Format status code with color for visual distinction
    const colorEnabled = loggingConfig.format?.colorOutput !== false && process.stdout?.isTTY;
    const statusFormatted = colorEnabled ? `${statusColor}${statusCode}${COLOR_CODES.RESET}` : statusCode.toString();
    
    // Create response message with performance context
    const responseMessage = `HTTP response sent: ${statusFormatted} (${statusCategory}) in ${processingTime}ms`;
    
    // Build response context for logging
    const responseContext = {
        statusCode: statusCode,
        statusCategory: statusCategory,
        duration: processingTime,
        contentType: contentType,
        contentLength: contentLength,
        timestamp: new Date().toISOString()
    };
    
    // Add request correlation if available
    if (req._loggerContext?.requestId) {
        responseContext.requestId = req._loggerContext.requestId;
    }
    
    // Add educational performance insights based on timing
    if (educationalConfig.performance?.showTimingInfo) {
        if (processingTime > 100) {
            responseContext.performanceNote = 'Response time over 100ms - consider optimization';
            responseContext.troubleshooting = 'Check for blocking operations or complex processing';
        } else if (processingTime < 10) {
            responseContext.performanceNote = 'Excellent response time - static content delivery';
        }
    }
    
    // Include troubleshooting guidance for slow responses
    if (processingTime > 1000) {
        responseContext.troubleshooting = 'Very slow response - investigate server performance and network conditions';
    }
    
    // Output response log with performance benchmarks
    logWithLevel('INFO', responseMessage, responseContext);
    
    // Add educational insights for different status code ranges
    if (educationalConfig.logging?.demonstratePatterns) {
        if (statusCode === 200) {
            logWithLevel('DEBUG', 'Educational note: HTTP 200 OK indicates successful request processing', {
                concept: 'HTTP status codes communicate request outcomes',
                pattern: '2xx codes indicate successful operations'
            });
        } else if (statusCode === 404) {
            logWithLevel('DEBUG', 'Educational note: HTTP 404 Not Found indicates requested resource not available', {
                concept: 'HTTP error handling and status communication',
                pattern: '4xx codes indicate client-side errors'
            });
        }
    }
}

/**
 * Specialized logging function for server lifecycle events including startup, shutdown,
 * and configuration changes with educational context and tutorial guidance
 * 
 * Educational Note: Server event logging provides visibility into application lifecycle
 * and helps students understand server management and operational concepts
 * 
 * @param {string} event - Server event type (startup, shutdown, error, etc.)
 * @param {object} details - Event details including configuration and context information
 * @returns {void} No return value, outputs educational server event log to console
 */
function logServerEvent(event, details = {}) {
    // Determine event category and appropriate log level
    let logLevel = 'INFO';
    let eventColor = COLOR_CODES.BLUE;
    
    switch (event.toLowerCase()) {
        case 'startup':
        case 'start':
        case 'listening':
            logLevel = 'INFO';
            eventColor = COLOR_CODES.GREEN;
            break;
        case 'shutdown':
        case 'stop':
        case 'close':
            logLevel = 'INFO';
            eventColor = COLOR_CODES.YELLOW;
            break;
        case 'error':
        case 'crash':
            logLevel = 'ERROR';
            eventColor = COLOR_CODES.RED;
            break;
        case 'warning':
        case 'warn':
            logLevel = 'WARN';
            eventColor = COLOR_CODES.YELLOW;
            break;
        default:
            logLevel = 'INFO';
            eventColor = COLOR_CODES.BLUE;
    }
    
    // Extract relevant server configuration and status information
    const serverInfo = {
        event: event,
        timestamp: new Date().toISOString(),
        pid: process.pid,
        uptime: Math.floor(process.uptime()),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform
    };
    
    // Merge provided details with server information
    const eventContext = { ...serverInfo, ...details };
    
    // Format event message with educational context
    const colorEnabled = loggingConfig.format?.colorOutput !== false && process.stdout?.isTTY;
    const eventFormatted = colorEnabled ? `${eventColor}${event.toUpperCase()}${COLOR_CODES.RESET}` : event.toUpperCase();
    
    let eventMessage = `Server event: ${eventFormatted}`;
    
    // Add tutorial-specific guidance and learning objectives based on event type
    if (event.toLowerCase() === 'startup' || event.toLowerCase() === 'listening') {
        eventMessage = `🚀 Server ${eventFormatted} - Tutorial application ready for learning!`;
        
        if (educationalConfig.startup?.showLearningObjectives && details.port && details.hostname) {
            eventContext.learningObjectives = [
                'Test the /hello endpoint using browser or curl',
                'Observe request/response logging in console output',
                'Experiment with different request methods',
                'Practice server management with Ctrl+C shutdown'
            ];
            eventContext.testUrls = [
                `http://${details.hostname}:${details.port}/hello`,
                `http://localhost:${details.port}/hello`
            ];
        }
    }
    
    // Add educational troubleshooting tips for common server issues
    if (event.toLowerCase() === 'error') {
        if (details.code === 'EADDRINUSE') {
            eventContext.troubleshooting = 'Port already in use - try a different PORT environment variable or stop conflicting process';
            eventContext.solution = 'Run: lsof -ti:3000 | xargs kill -9 (macOS/Linux) or netstat -ano | findstr :3000 (Windows)';
        } else if (details.code === 'EACCES') {
            eventContext.troubleshooting = 'Permission denied - try using a port number above 1024 or run with elevated privileges';
        }
    }
    
    // Apply distinctive color coding for server events
    if (colorEnabled && educationalConfig.logging?.verboseMode) {
        if (event.toLowerCase() === 'startup') {
            eventMessage = `${COLOR_CODES.GREEN}🌟 ${eventMessage}${COLOR_CODES.RESET}`;
        } else if (event.toLowerCase() === 'shutdown') {
            eventMessage = `${COLOR_CODES.YELLOW}📴 ${eventMessage}${COLOR_CODES.RESET}`;
        }
    }
    
    // Output comprehensive server event log with educational value
    logWithLevel(logLevel, eventMessage, eventContext);
    
    // Update internal server status tracking for monitoring
    if (educationalConfig.debugging?.showInternalState) {
        logWithLevel('DEBUG', `Internal server state updated for event: ${event}`, {
            internalState: 'Server event processed',
            nextExpectedEvents: getExpectedNextEvents(event)
        });
    }
}

/**
 * Helper function to predict expected next events for educational purposes
 * Educational Note: Helps students understand server lifecycle and event sequences
 */
function getExpectedNextEvents(currentEvent) {
    const eventSequences = {
        'startup': ['listening', 'request'],
        'listening': ['request', 'shutdown'],
        'request': ['response', 'request', 'shutdown'],
        'shutdown': ['startup'],
        'error': ['shutdown', 'restart']
    };
    
    return eventSequences[currentEvent.toLowerCase()] || ['unknown'];
}

/**
 * Centralized error logging function that formats errors with educational context,
 * stack traces, troubleshooting guidance, and appropriate error classification for learning
 * 
 * Educational Note: Centralized error logging ensures consistent error handling
 * and provides learning opportunities about error classification and debugging
 * 
 * @param {Error} error - Error object with message, stack trace, and error properties
 * @param {object} context - Additional context about where and why the error occurred
 * @param {object} options - Error logging options for educational formatting
 * @returns {void} No return value, outputs comprehensive error log with educational guidance
 */
function logError(error, context = {}, options = {}) {
    // Extract error message, type, and stack trace information
    const errorMessage = error?.message || 'Unknown error occurred';
    const errorType = error?.name || error?.constructor?.name || 'Error';
    const errorCode = error?.code || context.code || 'UNKNOWN';
    const errorStack = error?.stack || 'No stack trace available';
    
    // Classify error for educational categorization and guidance
    let errorCategory = 'Application Error';
    let troubleshootingTip = 'Check application logs and code for potential issues';
    
    // Classify specific error types for educational context
    if (error instanceof TypeError) {
        errorCategory = 'Type Error - Data Type Mismatch';
        troubleshootingTip = 'Verify variable types and function arguments match expected types';
    } else if (error instanceof ReferenceError) {
        errorCategory = 'Reference Error - Undefined Variable';
        troubleshootingTip = 'Check that all variables are properly declared and in scope';
    } else if (error instanceof SyntaxError) {
        errorCategory = 'Syntax Error - Invalid Code Structure';
        troubleshootingTip = 'Review code syntax for missing brackets, semicolons, or typos';
    } else if (errorCode === 'EADDRINUSE') {
        errorCategory = 'Network Error - Port Already in Use';
        troubleshootingTip = 'Change PORT environment variable or stop the conflicting process';
    } else if (errorCode === 'ECONNREFUSED') {
        errorCategory = 'Network Error - Connection Refused';
        troubleshootingTip = 'Verify server is running and network connectivity is available';
    }
    
    // Format error details with educational context and prefixes
    const errorContext = {
        error: errorMessage,
        type: errorType,
        code: errorCode,
        category: errorCategory,
        timestamp: new Date().toISOString(),
        troubleshooting: troubleshootingTip,
        ...context
    };
    
    // Include stack trace information for development environment
    if ((environmentConfig === 'development' || environmentConfig === 'educational') && 
        loggingConfig.debug?.showStackTraces) {
        errorContext.stackTrace = errorStack.split('\n').slice(0, 10).join('\n'); // Limit stack trace length
    }
    
    // Apply error-specific color coding for visual distinction
    const errorMessageFormatted = `❌ ${errorCategory}: ${errorMessage}`;
    
    // Include educational tips for error prevention and debugging
    if (educationalConfig.errors?.includeEducationalContext) {
        errorContext.educationalTips = [
            'Use console.log() to debug variable values and execution flow',
            'Check Node.js documentation for built-in module usage patterns',
            'Validate input parameters before processing to prevent type errors',
            'Use try-catch blocks to handle potential errors gracefully'
        ];
        
        if (errorCode === 'EADDRINUSE') {
            errorContext.educationalTips.push('Learn about port management and process handling in Node.js');
        }
    }
    
    // Output complete error log with educational value
    logWithLevel('ERROR', errorMessageFormatted, errorContext);
    
    // Add follow-up debugging suggestions for educational value
    if (educationalConfig.debugging?.verboseDebugging) {
        logWithLevel('INFO', '🔍 Debugging suggestions for learning:', {
            suggestions: [
                'Review the error message and stack trace above',
                'Check recent code changes that might have introduced the issue',
                'Use Node.js debugger or console.log() for step-by-step analysis',
                'Consult Node.js documentation for proper API usage'
            ]
        });
    }
}

/**
 * Creates performance timing utilities for educational performance monitoring, allowing measurement
 * and logging of operation durations with learning context
 * 
 * Educational Note: Performance timing helps students understand application performance
 * characteristics and learn about optimization techniques
 * 
 * @param {string} label - Descriptive label for the performance timing measurement
 * @returns {object} Performance timer object with start, end, and duration methods for educational timing
 */
function createPerformanceTimer(label) {
    // Initialize high-resolution timer for accurate measurement
    let startTime = null;
    let endTime = null;
    let isRunning = false;
    
    // Create timer object with educational labeling
    const timer = {
        label: label,
        
        /**
         * Starts the performance timer measurement
         * Educational Note: High-resolution timing provides microsecond accuracy for performance analysis
         */
        start() {
            if (isRunning) {
                logWithLevel('WARN', `Timer "${label}" is already running`, { 
                    action: 'start',
                    status: 'already_running' 
                });
                return this;
            }
            
            startTime = process.hrtime.bigint();
            isRunning = true;
            
            if (educationalConfig.performance?.showTimingInfo) {
                logWithLevel('DEBUG', `Started performance timer: ${label}`, {
                    action: 'timer_start',
                    label: label,
                    startTime: startTime.toString()
                });
            }
            
            return this;
        },
        
        /**
         * Ends the performance timer and calculates duration
         * Educational Note: Ending timer calculates elapsed time and provides performance metrics
         */
        end() {
            if (!isRunning) {
                logWithLevel('WARN', `Timer "${label}" is not running`, { 
                    action: 'end',
                    status: 'not_running' 
                });
                return 0;
            }
            
            endTime = process.hrtime.bigint();
            isRunning = false;
            
            // Calculate duration in milliseconds with high precision
            const duration = Number(endTime - startTime) / 1000000; // Convert nanoseconds to milliseconds
            
            // Log timing result with educational benchmarks and guidance
            const performanceLevel = this.getPerformanceLevel(duration);
            const performanceMessage = `Performance timer "${label}" completed: ${duration.toFixed(2)}ms (${performanceLevel})`;
            
            const timingContext = {
                label: label,
                duration: duration.toFixed(2),
                performanceLevel: performanceLevel,
                startTime: startTime.toString(),
                endTime: endTime.toString(),
                educationalBenchmark: this.getEducationalBenchmark(duration)
            };
            
            logWithLevel('INFO', performanceMessage, timingContext);
            
            return duration;
        },
        
        /**
         * Gets current duration without ending the timer
         * Educational Note: Intermediate timing allows monitoring of long-running operations
         */
        getDuration() {
            if (!isRunning) {
                return 0;
            }
            
            const currentTime = process.hrtime.bigint();
            return Number(currentTime - startTime) / 1000000;
        },
        
        /**
         * Determines performance level for educational context
         * Educational Note: Performance categorization helps students understand timing benchmarks
         */
        getPerformanceLevel(duration) {
            if (duration < 1) return 'Excellent';
            if (duration < 10) return 'Very Good';
            if (duration < 50) return 'Good';
            if (duration < 100) return 'Acceptable';
            if (duration < 500) return 'Slow';
            return 'Very Slow';
        },
        
        /**
         * Provides educational performance benchmark context
         * Educational Note: Benchmarks help students understand typical performance expectations
         */
        getEducationalBenchmark(duration) {
            if (duration < 1) {
                return 'Sub-millisecond performance - excellent for simple operations';
            } else if (duration < 10) {
                return 'Single-digit milliseconds - good for basic HTTP responses';
            } else if (duration < 100) {
                return 'Under 100ms - acceptable for web applications';
            } else {
                return 'Over 100ms - consider optimization for better user experience';
            }
        }
    };
    
    // Return timer object ready for performance monitoring
    return timer;
}

// =============================================================================
// MAIN LOGGER CLASS
// =============================================================================

/**
 * Main logger class that encapsulates all educational logging functionality with methods for
 * different log levels, HTTP request/response logging, performance timing, and tutorial-specific
 * educational features
 * 
 * Educational Note: Object-oriented logger design demonstrates class-based architecture
 * and provides a clean interface for consistent logging throughout the application
 */
class Logger {
    /**
     * Initializes Logger instance with educational configuration, log levels, color formatting,
     * and tutorial-specific settings for comprehensive educational logging
     * 
     * Educational Note: Constructor pattern establishes initial state and configuration
     * for consistent logger behavior across the application
     * 
     * @param {object} config - Configuration object with logging preferences and educational options
     */
    constructor(config = {}) {
        // Set logger configuration from provided config or defaults
        this.config = {
            level: config.level || loggingConfig.level || DEFAULT_LOG_LEVEL,
            colorEnabled: config.colorEnabled ?? (loggingConfig.format?.colorOutput !== false),
            educationalMode: config.educationalMode ?? (educationalConfig.tutorial?.mode || false),
            includeTimestamp: config.includeTimestamp ?? true,
            includeContext: config.includeContext ?? true,
            ...config
        };
        
        // Initialize current log level based on environment and configuration
        this.currentLevel = this.config.level;
        
        // Configure color formatting based on terminal support and preferences
        this.colorEnabled = this.config.colorEnabled && (process.stdout?.isTTY || config.forceColor);
        
        // Set up educational mode features and enhanced messaging
        this.educationalMode = this.config.educationalMode;
        
        // Initialize performance timer tracking for educational metrics
        this.performanceTimers = new Map();
        
        // Create method bindings for consistent context preservation
        this.debug = this.debug.bind(this);
        this.info = this.info.bind(this);
        this.warn = this.warn.bind(this);
        this.error = this.error.bind(this);
        this.logRequest = this.logRequest.bind(this);
        this.logResponse = this.logResponse.bind(this);
        this.startTimer = this.startTimer.bind(this);
        this.endTimer = this.endTimer.bind(this);
        
        // Set up internal state for request/response correlation tracking
        this.requestCorrelationMap = new Map();
        
        // Log logger initialization for educational transparency
        if (this.educationalMode) {
            this.info('Logger initialized with educational features enabled', {
                level: this.currentLevel,
                colorEnabled: this.colorEnabled,
                educationalMode: this.educationalMode
            });
        }
    }
    
    /**
     * Logs debug-level messages with detailed information for development and troubleshooting,
     * formatted with educational context and color coding
     * 
     * Educational Note: Debug logging provides detailed execution information for learning
     * and troubleshooting without overwhelming production environments
     * 
     * @param {string} message - Debug message content
     * @param {...any} args - Additional context arguments
     * @returns {void} No return value, outputs debug log to console if debug level is enabled
     */
    debug(message, ...args) {
        // Check if debug logging is enabled for current configuration
        if (!shouldLogAtLevel('DEBUG')) {
            return;
        }
        
        // Format debug message with educational context and timestamp
        const debugContext = { 
            level: 'debug',
            educational: this.educationalMode,
            timestamp: Date.now()
        };
        
        // Apply cyan color coding for debug message distinction
        logWithLevel('DEBUG', message, debugContext, ...args);
        
        // Track debug logging metrics for educational monitoring
        if (this.educationalMode && educationalConfig.debugging?.showInternalState) {
            console.debug(`${COLOR_CODES.GRAY}[DEBUG STATS] Debug message logged at ${new Date().toISOString()}${COLOR_CODES.RESET}`);
        }
    }
    
    /**
     * Logs informational messages about normal application operation with educational formatting
     * and green color coding for positive status indication
     * 
     * Educational Note: Info logging provides visibility into normal application flow
     * and demonstrates standard logging practices for operational awareness
     * 
     * @param {string} message - Informational message content
     * @param {...any} args - Additional context arguments
     * @returns {void} No return value, outputs info log to console with educational formatting
     */
    info(message, ...args) {
        // Format informational message with educational prefix and timestamp
        const infoContext = {
            level: 'info',
            educational: this.educationalMode
        };
        
        // Apply green color coding for positive informational context
        logWithLevel('INFO', message, infoContext, ...args);
        
        // Update logging metrics for educational monitoring
        if (this.educationalMode && educationalConfig.performance?.showTimingInfo) {
            // Track info logging frequency for educational awareness
            if (!this._infoLogCount) this._infoLogCount = 0;
            this._infoLogCount++;
        }
    }
    
    /**
     * Logs warning messages for potential issues or educational guidance with yellow color coding
     * and troubleshooting context for learning assistance
     * 
     * Educational Note: Warning logging helps identify potential issues before they become
     * critical and provides learning opportunities about system monitoring
     * 
     * @param {string} message - Warning message content
     * @param {...any} args - Additional context arguments
     * @returns {void} No return value, outputs warning log to console with educational guidance
     */
    warn(message, ...args) {
        // Format warning message with educational context and troubleshooting tips
        const warnContext = {
            level: 'warn',
            educational: this.educationalMode,
            warningCategory: 'General Warning'
        };
        
        // Apply yellow color coding for warning level distinction
        logWithLevel('WARN', message, warnContext, ...args);
        
        // Include educational guidance for addressing potential issues
        if (this.educationalMode && educationalConfig.errors?.includeTroubleshootingTips) {
            logWithLevel('INFO', '💡 Warning guidance: Review the warning above and consider corrective actions', {
                guidance: 'Warnings indicate potential issues that should be addressed to prevent problems'
            });
        }
        
        // Track warning patterns for educational insights
        if (this.educationalMode) {
            if (!this._warningCount) this._warningCount = 0;
            this._warningCount++;
            
            if (this._warningCount > 5) {
                logWithLevel('INFO', '📊 Educational note: Multiple warnings detected - consider reviewing application health', {
                    warningCount: this._warningCount,
                    suggestion: 'High warning frequency may indicate underlying issues'
                });
            }
        }
    }
    
    /**
     * Logs error messages with comprehensive error details, stack traces, educational troubleshooting
     * guidance, and red color coding for critical issues
     * 
     * Educational Note: Error logging provides critical information for debugging and demonstrates
     * proper error handling patterns in Node.js applications
     * 
     * @param {string} message - Error message content
     * @param {Error} error - Optional Error object with stack trace
     * @param {...any} args - Additional context arguments
     * @returns {void} No return value, outputs comprehensive error log with educational context
     */
    error(message, error, ...args) {
        // Format error message with educational context and troubleshooting guidance
        const errorContext = {
            level: 'error',
            educational: this.educationalMode,
            severity: 'high'
        };
        
        // If error object provided, use logError for comprehensive error handling
        if (error instanceof Error) {
            logError(error, { message, ...errorContext }, ...args);
        } else {
            // Apply red color coding for error severity indication
            logWithLevel('ERROR', message, errorContext, error, ...args);
        }
        
        // Track error patterns for educational insights and improvements
        if (this.educationalMode) {
            if (!this._errorCount) this._errorCount = 0;
            this._errorCount++;
            
            // Provide educational guidance after multiple errors
            if (this._errorCount === 1) {
                logWithLevel('INFO', '📚 Educational note: First error detected - good opportunity to practice debugging', {
                    debuggingTips: [
                        'Read the error message carefully for clues',
                        'Check the stack trace for the error location',
                        'Review recent code changes',
                        'Use console.log() to trace execution flow'
                    ]
                });
            } else if (this._errorCount > 3) {
                logWithLevel('WARN', '⚠️  Multiple errors detected - consider systematic debugging approach', {
                    errorCount: this._errorCount,
                    suggestion: 'Multiple errors may indicate a fundamental issue requiring investigation'
                });
            }
        }
    }
    
    /**
     * Starts a performance timer with educational labeling for measuring operation durations
     * and demonstrating performance monitoring concepts
     * 
     * Educational Note: Performance timing helps students understand operation costs
     * and learn about performance optimization techniques
     * 
     * @param {string} label - Descriptive label for the timing measurement
     * @returns {object} Timer object with methods to end timing and calculate duration
     */
    startTimer(label) {
        // Create high-resolution timer with educational labeling
        const timer = createPerformanceTimer(label);
        
        // Store timer in performance timers map with label key
        this.performanceTimers.set(label, timer);
        
        // Start timer and add educational context about performance timing
        timer.start();
        
        // Log timer start for educational performance monitoring
        if (this.educationalMode && educationalConfig.performance?.showTimingInfo) {
            this.debug(`Performance timer started: ${label}`, {
                action: 'timer_start',
                label: label,
                educationalNote: 'Performance timing helps identify optimization opportunities'
            });
        }
        
        // Return timer object with end method for duration calculation
        return timer;
    }
    
    /**
     * Ends a performance timer and logs the duration with educational performance context,
     * benchmarks, and learning guidance about timing optimization
     * 
     * Educational Note: Timer completion provides concrete performance data for learning
     * about application performance characteristics and optimization opportunities
     * 
     * @param {string} label - Label of the timer to end and measure
     * @returns {number} Duration in milliseconds for educational performance analysis
     */
    endTimer(label) {
        // Retrieve timer from performance timers map using label
        const timer = this.performanceTimers.get(label);
        
        if (!timer) {
            this.warn(`Performance timer "${label}" not found`, {
                action: 'timer_end_failed',
                availableTimers: Array.from(this.performanceTimers.keys()),
                troubleshooting: 'Ensure timer was started before attempting to end it'
            });
            return 0;
        }
        
        // Calculate duration using high-resolution time difference
        const duration = timer.end();
        
        // Remove timer from active timers map for cleanup
        this.performanceTimers.delete(label);
        
        // Log timing result with educational benchmarks and guidance
        if (this.educationalMode && educationalConfig.performance?.showTimingInfo) {
            const benchmarkContext = {
                duration: duration,
                performanceLevel: timer.getPerformanceLevel(duration),
                educationalBenchmark: timer.getEducationalBenchmark(duration),
                optimizationTip: duration > 100 ? 'Consider optimization for better performance' : 'Good performance timing'
            };
            
            this.info(`⏱️  Performance measurement completed: ${label}`, benchmarkContext);
        }
        
        // Return duration value for further educational analysis
        return duration;
    }
    
    /**
     * Educational HTTP request logging wrapper that integrates with Logger instance
     * Educational Note: Instance method provides consistent logging context and configuration
     */
    logRequest(req, options = {}) {
        logRequest(req, { ...options, logger: this });
    }
    
    /**
     * Educational HTTP response logging wrapper that integrates with Logger instance
     * Educational Note: Instance method maintains logging consistency and correlation
     */
    logResponse(req, res, duration) {
        logResponse(req, res, duration);
    }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Factory function that creates a logger instance with educational configuration, color formatting,
 * and tutorial-specific logging capabilities based on application configuration
 * 
 * Educational Note: Factory pattern provides controlled instance creation with consistent
 * configuration and allows customization while maintaining educational defaults
 * 
 * @param {object} options - Optional configuration object for customizing logger behavior and educational settings
 * @returns {Logger} Configured logger instance with all educational logging methods and formatting capabilities
 */
function createLogger(options = {}) {
    // Extract logging configuration from appConfig module
    const defaultConfig = {
        level: loggingConfig.level || DEFAULT_LOG_LEVEL,
        colorEnabled: loggingConfig.format?.colorOutput !== false,
        educationalMode: educationalConfig.tutorial?.mode || false,
        includeTimestamp: true,
        includeContext: true
    };
    
    // Determine current log level based on environment and configuration
    const environmentLevel = environmentConfig === 'educational' ? 'debug' : 
                            environmentConfig === 'development' ? 'debug' :
                            environmentConfig === 'production' ? 'warn' : 'info';
    
    // Set up color formatting based on terminal support and configuration
    const colorSupport = process.stdout?.isTTY && !process.env.NO_COLOR;
    
    // Configure educational prefixes and context formatting
    const educationalOptions = {
        showStartupGuidance: educationalConfig.startup?.showLearningObjectives || false,
        includeTroubleshootingTips: educationalConfig.errors?.includeTroubleshootingTips || false,
        verboseLogging: educationalConfig.logging?.verboseMode || false,
        showPerformanceTips: educationalConfig.performance?.showTimingInfo || false
    };
    
    // Initialize performance timing utilities for educational metrics
    const performanceConfig = {
        enableTiming: educationalConfig.performance?.showTimingInfo || false,
        showBenchmarks: educationalConfig.performance?.displayPerformanceTips || false,
        timingThreshold: 100 // Log operations over 100ms
    };
    
    // Merge provided options with default configuration
    const mergedConfig = {
        ...defaultConfig,
        level: options.level || environmentLevel,
        colorEnabled: options.colorEnabled ?? colorSupport,
        educationalMode: options.educationalMode ?? educationalOptions.verboseLogging,
        educational: educationalOptions,
        performance: performanceConfig,
        ...options
    };
    
    // Create logger instance with all required methods and properties
    const logger = new Logger(mergedConfig);
    
    // Add educational startup guidance if enabled
    if (mergedConfig.educationalMode && educationalOptions.showStartupGuidance) {
        logger.info('🎓 Educational Logger initialized with tutorial features', {
            features: [
                'Color-coded output for visual learning',
                'Performance timing for optimization awareness',
                'Request/response correlation tracking',
                'Educational troubleshooting guidance',
                'Tutorial-specific formatting and context'
            ],
            usage: 'Logger ready for Node.js tutorial HTTP server learning'
        });
    }
    
    // Return fully configured logger ready for application use
    return logger;
}

// =============================================================================
// MODULE EXPORTS
// =============================================================================

// Create default logger instance with application configuration
const logger = createLogger({
    level: loggingConfig.level || DEFAULT_LOG_LEVEL,
    educationalMode: educationalConfig.tutorial?.mode || environmentConfig === 'educational',
    colorEnabled: loggingConfig.format?.colorOutput !== false
});

// Export default logger instance and factory functions
module.exports = {
    // Default configured logger instance ready for use throughout the Node.js tutorial application
    logger,
    
    // Factory function to create custom logger instances with specific configuration options
    createLogger,
    
    // Logger class for creating custom logger instances with educational features
    Logger,
    
    // Log level constants for configuration and level checking throughout the application
    LOG_LEVELS,
    
    // Utility functions for advanced logging scenarios
    formatLogMessage,
    logWithLevel,
    logRequest,
    logResponse,
    logServerEvent,
    logError,
    createPerformanceTimer,
    shouldLogAtLevel
};