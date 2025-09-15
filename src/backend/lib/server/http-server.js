/**
 * Node.js Tutorial Core HTTP Server Module
 * 
 * This module provides the foundational HTTP server functionality for the Node.js tutorial
 * application using Node.js built-in http module. It implements comprehensive server lifecycle
 * management, request delegation to the router, and educational server operations with extensive
 * error handling, graceful shutdown capabilities, and performance monitoring designed specifically
 * for the Node.js tutorial learning experience.
 * 
 * Educational Features:
 * - Complete server lifecycle demonstration from creation to graceful shutdown
 * - Educational logging with performance timing and server state transitions
 * - Comprehensive error handling with troubleshooting guidance and learning context
 * - Server metrics collection for educational performance monitoring and awareness
 * - Graceful shutdown procedures demonstrating proper Node.js process management
 * - Request processing integration showcasing event-driven HTTP server architecture
 * 
 * Integration Architecture:
 * - Router Integration: Delegates all HTTP requests to request router for URL matching and handler selection
 * - Configuration Integration: Uses server-config and app-config for centralized configuration management
 * - Logging Integration: Integrates with logger utility for structured educational logging throughout server lifecycle
 * - Error Handling Integration: Uses error-handler utility for consistent error handling and educational messaging
 * - Main Server Integration: Provides server creation and management functions to main server.js entry point
 * 
 * Performance Considerations:
 * - Startup timing measurement and logging for educational performance awareness
 * - Request processing time monitoring with educational benchmarks and guidance
 * - Memory management with proper cleanup and resource management for educational demonstration
 * - Connection handling using Node.js default connection pooling with educational monitoring capabilities
 * - Graceful shutdown ensuring proper resource cleanup during shutdown for educational best practices
 */

// Node.js built-in modules for HTTP server creation and process management - Node.js Built-in
const http = require('node:http');
const process = require('node:process');

// Internal imports for routing and request processing integration
const { routeRequest } = require('../router/request-router.js');

// Server configuration imports for centralized configuration management
const { createServerConfig, DEFAULT_PORT, DEFAULT_HOSTNAME } = require('../config/server-config.js');

// Educational logging integration for structured server lifecycle logging
const { logger } = require('../utils/logger.js');

// Error handling imports for comprehensive server error management with educational context
const { handleServerError, handleRequestError } = require('../utils/error-handler.js');

// Application configuration for educational settings and server behavior customization
const { appConfig } = require('../config/app-config.js');

// =============================================================================
// GLOBAL SERVER STATE AND CONSTANTS
// =============================================================================

/**
 * Global server instance reference for lifecycle management and graceful shutdown procedures
 * Educational Note: Global server reference enables proper cleanup during shutdown and
 * demonstrates server instance management patterns in Node.js applications
 */
let SERVER_INSTANCE = null;

/**
 * Current server state for lifecycle tracking and educational state transition demonstration
 * Educational Note: Server state tracking provides visibility into server lifecycle and
 * helps students understand the different phases of server operation
 */
let SERVER_STATE = 'stopped';

/**
 * Server startup timestamp for educational performance metrics and uptime calculations
 * Educational Note: Startup timing helps demonstrate performance monitoring concepts
 * and provides baseline for educational performance awareness and optimization
 */
let STARTUP_TIMESTAMP = null;

/**
 * Educational HTTP server prefix for consistent tutorial logging and identification
 * Educational Note: Consistent prefixing helps identify tutorial-specific logs and
 * provides clear educational context throughout the server lifecycle
 */
const EDUCATIONAL_HTTP_PREFIX = '[HTTP Server]';

/**
 * Graceful shutdown timeout in milliseconds for connection draining and cleanup procedures
 * Educational Note: Shutdown timeout demonstrates proper resource management and ensures
 * educational completeness of server lifecycle with appropriate cleanup timing
 */
const SHUTDOWN_TIMEOUT = 5000;

/**
 * Server state constants for lifecycle management and educational status tracking
 * Educational Note: State constants provide clear server status communication and
 * demonstrate state machine patterns in server lifecycle management
 */
const SERVER_STATES = {
    STOPPED: 'stopped',
    STARTING: 'starting', 
    RUNNING: 'running',
    STOPPING: 'stopping'
};

// =============================================================================
// HTTP SERVER CREATION AND CONFIGURATION
// =============================================================================

/**
 * Creates a new HTTP server instance using Node.js built-in http module with educational
 * configuration, request routing integration, and comprehensive error handling designed
 * specifically for tutorial purposes and enhanced learning experience.
 * 
 * Educational Note: This function demonstrates the fundamental pattern for creating HTTP
 * servers in Node.js using the built-in http module, showcasing proper configuration,
 * request handling integration, and error management for educational value.
 * 
 * @param {object} options - Optional configuration object for server creation with educational settings
 * @returns {object} HTTP server instance configured with request handler, error handling, and educational features
 */
function createHTTPServer(options = {}) {
    // Start educational timing for server creation performance measurement
    const creationTimer = logger.startTimer('server_creation');
    
    logger.info(`${EDUCATIONAL_HTTP_PREFIX} Creating HTTP server instance...`, {
        educational: true,
        phase: 'server_creation',
        timestamp: new Date().toISOString()
    });
    
    try {
        // Load server configuration using createServerConfig with educational defaults and validation
        const serverConfig = createServerConfig();
        
        // Merge provided options with server configuration for customization support
        const mergedConfig = {
            ...serverConfig,
            ...options,
            // Preserve educational security settings regardless of options
            hostname: serverConfig.hostname, // Always enforce localhost-only for educational security
            educational: {
                ...serverConfig.educational,
                ...(options.educational || {})
            }
        };
        
        logger.debug(`${EDUCATIONAL_HTTP_PREFIX} Server configuration loaded`, {
            educational: true,
            config: {
                port: mergedConfig.port,
                hostname: mergedConfig.hostname,
                timeout: mergedConfig.timeout,
                educationalMode: mergedConfig.educational?.showConfigurationInfo
            }
        });
        
        // Create request handler function that integrates with routing system and error handling
        const requestHandler = createRequestHandler(mergedConfig);
        
        logger.debug(`${EDUCATIONAL_HTTP_PREFIX} Request handler configured with routing integration`, {
            educational: true,
            handlerType: 'educational_request_handler',
            routingIntegration: true
        });
        
        // Create HTTP server instance using http.createServer with configured request listener
        const serverInstance = http.createServer(requestHandler);
        
        logger.info(`${EDUCATIONAL_HTTP_PREFIX} HTTP server instance created successfully`, {
            educational: true,
            serverInstanceCreated: true,
            httpModuleVersion: process.version
        });
        
        // Configure server timeout settings from configuration for educational environment stability
        serverInstance.timeout = mergedConfig.timeout || 120000; // Default 2 minutes for educational use
        serverInstance.headersTimeout = mergedConfig.headersTimeout || 61000; // Slightly higher than keepAliveTimeout
        serverInstance.keepAliveTimeout = mergedConfig.keepAliveTimeout || 60000; // 1 minute keep-alive for tutorials
        
        logger.debug(`${EDUCATIONAL_HTTP_PREFIX} Server timeout configuration applied`, {
            educational: true,
            timeout: serverInstance.timeout,
            headersTimeout: serverInstance.headersTimeout,
            keepAliveTimeout: serverInstance.keepAliveTimeout
        });
        
        // Set up server event listeners for comprehensive lifecycle monitoring and educational logging
        setupServerEventListeners(serverInstance, mergedConfig);
        
        // Configure connection handling and limits appropriate for educational environment
        serverInstance.maxConnections = mergedConfig.limits?.maxConcurrentConnections || 100;
        serverInstance.maxHeadersCount = mergedConfig.performance?.maxHeadersCount || 100;
        
        logger.debug(`${EDUCATIONAL_HTTP_PREFIX} Server connection limits configured`, {
            educational: true,
            maxConnections: serverInstance.maxConnections,
            maxHeadersCount: serverInstance.maxHeadersCount
        });
        
        // Store server instance globally for lifecycle management and graceful shutdown procedures
        SERVER_INSTANCE = serverInstance;
        
        // End creation timing and log performance information for educational awareness
        const creationTime = creationTimer();
        logger.info(`${EDUCATIONAL_HTTP_PREFIX} Server creation completed`, {
            educational: true,
            creationTime: `${creationTime}ms`,
            serverReady: true,
            phase: 'creation_complete'
        });
        
        // Display educational information about server creation for learning enhancement
        if (mergedConfig.educational?.showConfigurationInfo) {
            logger.info(`${EDUCATIONAL_HTTP_PREFIX} Educational Server Creation Summary`, {
                educational: true,
                summary: {
                    httpModule: 'Node.js Built-in HTTP Module',
                    serverType: 'Educational HTTP Server',
                    requestHandling: 'Event-driven with Router Integration',
                    errorHandling: 'Comprehensive with Educational Context',
                    lifecycle: 'Complete with Graceful Shutdown Support',
                    performance: `Created in ${creationTime}ms`
                }
            });
        }
        
        // Return configured HTTP server instance ready for binding and startup
        return serverInstance;
        
    } catch (error) {
        // Handle server creation errors with comprehensive educational error handling
        logger.error(`${EDUCATIONAL_HTTP_PREFIX} Server creation failed`, error, {
            educational: true,
            phase: 'server_creation_error',
            troubleshooting: 'Check server configuration and system resources'
        });
        
        // Use handleServerError for comprehensive educational error processing
        handleServerError(error, {
            phase: 'server_creation',
            config: options,
            educational: true
        });
        
        // Re-throw error for upstream handling after educational processing
        throw error;
    }
}

/**
 * Creates the main request handler function that processes all incoming HTTP requests by
 * delegating to the router with comprehensive error handling, performance monitoring, and
 * educational logging for enhanced learning experience and debugging assistance.
 * 
 * Educational Note: This function demonstrates the request handler pattern in Node.js HTTP
 * servers, showing how to integrate routing, error handling, and performance monitoring
 * in a clean, maintainable way suitable for educational purposes.
 * 
 * @param {object} config - Configuration object with routing and educational settings
 * @returns {function} Request handler function suitable for http.createServer() with educational features
 */
function createRequestHandler(config) {
    logger.debug(`${EDUCATIONAL_HTTP_PREFIX} Creating request handler with educational features`, {
        educational: true,
        routingIntegration: true,
        errorHandling: true,
        performanceMonitoring: true
    });
    
    // Return configured request handler function with comprehensive processing capabilities
    return async function educationalRequestHandler(req, res) {
        // Start performance timer for educational request timing measurement and monitoring
        const requestTimer = logger.startTimer('request_processing');
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Log incoming request with educational context and comprehensive request information
        logger.info(`${EDUCATIONAL_HTTP_PREFIX} Request received`, {
            educational: true,
            requestId: requestId,
            method: req.method,
            url: req.url,
            userAgent: req.headers['user-agent'],
            remoteAddress: req.socket.remoteAddress,
            timestamp: new Date().toISOString(),
            phase: 'request_received'
        });
        
        try {
            // Set up comprehensive error handling wrapper around request processing for educational safety
            req.requestId = requestId;
            req.startTime = Date.now();
            
            // Add educational headers for tutorial identification and debugging assistance
            if (config.educational?.enableDebugHeaders) {
                res.setHeader('X-Tutorial-Server', 'Node.js Educational HTTP Server');
                res.setHeader('X-Request-ID', requestId);
                res.setHeader('X-Server-Version', appConfig.app.version);
            }
            
            logger.debug(`${EDUCATIONAL_HTTP_PREFIX} Request processing initiated`, {
                educational: true,
                requestId: requestId,
                phase: 'processing_start',
                routerDelegation: 'preparing'
            });
            
            // Delegate request processing to routeRequest function from router module with educational context
            await routeRequest(req, res, {
                educational: true,
                requestId: requestId,
                serverConfig: config
            });
            
            // Calculate and log request completion time for educational performance awareness
            const processingTime = requestTimer();
            const totalTime = Date.now() - req.startTime;
            
            logger.info(`${EDUCATIONAL_HTTP_PREFIX} Request completed successfully`, {
                educational: true,
                requestId: requestId,
                method: req.method,
                url: req.url,
                statusCode: res.statusCode,
                processingTime: `${processingTime}ms`,
                totalTime: `${totalTime}ms`,
                phase: 'request_complete'
            });
            
            // Include educational performance benchmarks and guidance for learning enhancement
            if (config.educational?.showPerformanceMetrics && totalTime > 100) {
                logger.warn(`${EDUCATIONAL_HTTP_PREFIX} Request took longer than expected`, {
                    educational: true,
                    requestId: requestId,
                    totalTime: `${totalTime}ms`,
                    benchmark: '< 100ms expected for simple requests',
                    guidance: 'Consider performance optimization for production applications'
                });
            }
            
        } catch (error) {
            // Handle request processing errors using handleRequestError with comprehensive educational context
            logger.error(`${EDUCATIONAL_HTTP_PREFIX} Request processing error occurred`, error, {
                educational: true,
                requestId: requestId,
                method: req.method,
                url: req.url,
                phase: 'request_error'
            });
            
            // Use handleRequestError for comprehensive educational error processing and response generation
            handleRequestError(error, req, res);
            
            // End request timer for error cases to maintain consistent performance monitoring
            const errorTime = requestTimer();
            logger.debug(`${EDUCATIONAL_HTTP_PREFIX} Request error handling completed`, {
                educational: true,
                requestId: requestId,
                errorHandlingTime: `${errorTime}ms`,
                phase: 'error_handling_complete'
            });
        }
    };
}

/**
 * Sets up comprehensive server event listeners for lifecycle monitoring, error handling,
 * and educational logging to demonstrate proper Node.js server event management patterns.
 * 
 * Educational Note: Server event listeners provide visibility into server lifecycle events
 * and demonstrate proper event-driven programming patterns in Node.js applications.
 * 
 * @param {object} serverInstance - HTTP server instance for event listener setup
 * @param {object} config - Server configuration for event handling behavior
 */
function setupServerEventListeners(serverInstance, config) {
    logger.debug(`${EDUCATIONAL_HTTP_PREFIX} Setting up server event listeners`, {
        educational: true,
        eventHandling: true,
        lifecycleMonitoring: true
    });
    
    // Set up 'listening' event listener for successful server startup notification and educational logging
    serverInstance.on('listening', () => {
        const address = serverInstance.address();
        
        logger.info(`${EDUCATIONAL_HTTP_PREFIX} Server listening event triggered`, {
            educational: true,
            address: address,
            url: `http://${address.address}:${address.port}`,
            phase: 'server_listening',
            event: 'listening'
        });
        
        // Display educational startup banner and guidance for enhanced learning experience
        if (config.educational?.showStartupBanner) {
            displayEducationalBanner(address);
        }
    });
    
    // Set up 'error' event listener for comprehensive server error handling and educational guidance
    serverInstance.on('error', (error) => {
        logger.error(`${EDUCATIONAL_HTTP_PREFIX} Server error event triggered`, error, {
            educational: true,
            event: 'server_error',
            errorCode: error.code,
            phase: 'server_error_handling'
        });
        
        // Use handleServerError for comprehensive educational error processing and guidance
        handleServerError(error, {
            event: 'server_error',
            serverInstance: serverInstance,
            config: config,
            educational: true
        });
    });
    
    // Set up 'close' event listener for server shutdown notification and cleanup completion logging
    serverInstance.on('close', () => {
        logger.info(`${EDUCATIONAL_HTTP_PREFIX} Server close event triggered`, {
            educational: true,
            event: 'close',
            phase: 'server_closed',
            serverState: SERVER_STATE
        });
        
        // Reset global server state for educational state tracking and lifecycle demonstration
        SERVER_STATE = SERVER_STATES.STOPPED;
        SERVER_INSTANCE = null;
        
        logger.info(`${EDUCATIONAL_HTTP_PREFIX} Server instance cleaned up successfully`, {
            educational: true,
            cleanup: 'complete',
            serverState: SERVER_STATE
        });
    });
    
    // Set up 'connection' event listener for educational connection monitoring and demonstration
    serverInstance.on('connection', (socket) => {
        logger.debug(`${EDUCATIONAL_HTTP_PREFIX} New client connection established`, {
            educational: true,
            event: 'connection',
            remoteAddress: socket.remoteAddress,
            remotePort: socket.remotePort,
            localAddress: socket.localAddress,
            localPort: socket.localPort
        });
        
        // Set up socket error handling for educational connection error demonstration
        socket.on('error', (socketError) => {
            logger.warn(`${EDUCATIONAL_HTTP_PREFIX} Socket error occurred`, {
                educational: true,
                event: 'socket_error',
                error: socketError.message,
                remoteAddress: socket.remoteAddress
            });
        });
    });
    
    // Set up 'clientError' event listener for educational client error handling and demonstration
    serverInstance.on('clientError', (error, socket) => {
        logger.warn(`${EDUCATIONAL_HTTP_PREFIX} Client error occurred`, {
            educational: true,
            event: 'client_error',
            error: error.message,
            errorCode: error.code,
            remoteAddress: socket.remoteAddress
        });
        
        // Send appropriate error response to client for educational HTTP error handling demonstration
        if (socket.writable) {
            socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
        }
    });
    
    logger.debug(`${EDUCATIONAL_HTTP_PREFIX} Server event listeners configured successfully`, {
        educational: true,
        listeners: ['listening', 'error', 'close', 'connection', 'clientError'],
        eventHandlingComplete: true
    });
}

/**
 * Displays educational startup banner with server information, usage examples, and
 * learning guidance for enhanced tutorial experience and student engagement.
 * 
 * Educational Note: Startup banner provides immediate feedback and guidance for students,
 * making the learning experience more interactive and informative.
 * 
 * @param {object} address - Server address information from server.address()
 */
function displayEducationalBanner(address) {
    const serverUrl = `http://${address.address}:${address.port}`;
    
    console.log('\n' + '='.repeat(80));
    console.log('🎓 NODE.JS TUTORIAL HTTP SERVER - READY FOR LEARNING! 🎓');
    console.log('='.repeat(80));
    console.log(`✅ Server running at: ${serverUrl}`);
    console.log(`📚 Tutorial endpoint: ${serverUrl}/hello`);
    console.log('');
    console.log('📖 LEARNING OBJECTIVES:');
    console.log('   • Understand Node.js HTTP server fundamentals');
    console.log('   • Learn request-response patterns');
    console.log('   • Practice basic routing concepts');
    console.log('   • Explore error handling patterns');
    console.log('');
    console.log('🧪 TRY THESE EXAMPLES:');
    console.log(`   curl ${serverUrl}/hello`);
    console.log(`   curl -v ${serverUrl}/hello`);
    console.log(`   curl ${serverUrl}/nonexistent`);
    console.log('');
    console.log('🔍 WHAT TO OBSERVE:');
    console.log('   • Console logs showing request processing');
    console.log('   • HTTP status codes and response headers');
    console.log('   • Error handling for invalid requests');
    console.log('   • Performance timing information');
    console.log('');
    console.log('⏹️  Stop server: Press Ctrl+C');
    console.log('='.repeat(80) + '\n');
}

// =============================================================================
// SERVER LIFECYCLE MANAGEMENT FUNCTIONS
// =============================================================================

/**
 * Starts the HTTP server instance with comprehensive port binding, educational startup logging,
 * and thorough error handling to demonstrate proper Node.js server startup procedures and
 * provide enhanced learning experience with detailed monitoring and guidance.
 * 
 * Educational Note: This function demonstrates the complete server startup sequence including
 * port binding, error handling, and performance monitoring suitable for educational purposes.
 * 
 * @param {object} serverInstance - HTTP server instance to start
 * @param {number} port - Port number for server binding, defaults to configuration value
 * @param {string} hostname - Hostname for server binding, defaults to localhost
 * @returns {Promise} Promise resolving when server successfully starts listening or rejecting with educational error
 */
function startServer(serverInstance = SERVER_INSTANCE, port = DEFAULT_PORT, hostname = DEFAULT_HOSTNAME) {
    return new Promise((resolve, reject) => {
        // Start comprehensive performance timer for educational startup timing measurement and analysis
        const startupTimer = logger.startTimer('server_startup');
        
        logger.info(`${EDUCATIONAL_HTTP_PREFIX} Starting server...`, {
            educational: true,
            phase: 'startup_initiated',
            port: port,
            hostname: hostname,
            timestamp: new Date().toISOString()
        });
        
        try {
            // Validate server instance exists and is properly configured for startup
            if (!serverInstance) {
                const error = new Error('Server instance is required for startup');
                error.code = 'NO_SERVER_INSTANCE';
                throw error;
            }
            
            // Validate port parameter using configuration validation for educational parameter checking
            if (typeof port !== 'number' || port < 1 || port > 65535) {
                const error = new Error(`Invalid port number: ${port}. Port must be between 1-65535`);
                error.code = 'INVALID_PORT';
                throw error;
            }
            
            // Validate hostname parameter for educational security and proper binding
            if (typeof hostname !== 'string' || (hostname !== '127.0.0.1' && hostname !== 'localhost')) {
                const error = new Error(`Invalid hostname: ${hostname}. Only localhost binding allowed for tutorial security`);
                error.code = 'INVALID_HOSTNAME';
                throw error;
            }
            
            logger.debug(`${EDUCATIONAL_HTTP_PREFIX} Server startup validation passed`, {
                educational: true,
                validation: 'passed',
                port: port,
                hostname: hostname
            });
            
            // Set server state to 'starting' for educational lifecycle tracking and state management
            SERVER_STATE = SERVER_STATES.STARTING;
            STARTUP_TIMESTAMP = Date.now();
            
            logger.info(`${EDUCATIONAL_HTTP_PREFIX} Server state updated to starting`, {
                educational: true,
                serverState: SERVER_STATE,
                startupTimestamp: STARTUP_TIMESTAMP,
                phase: 'state_starting'
            });
            
            // Set up startup timeout for educational timeout handling and error recovery demonstration
            const startupTimeout = setTimeout(() => {
                const error = new Error(`Server startup timeout after 30 seconds`);
                error.code = 'STARTUP_TIMEOUT';
                
                logger.error(`${EDUCATIONAL_HTTP_PREFIX} Server startup timeout`, error, {
                    educational: true,
                    timeout: '30 seconds',
                    troubleshooting: 'Check port availability and system resources'
                });
                
                reject(error);
            }, 30000);
            
            // Attempt server binding using server.listen() with comprehensive error handling and monitoring
            serverInstance.listen(port, hostname, () => {
                // Clear startup timeout on successful binding
                clearTimeout(startupTimeout);
                
                // Calculate and log startup performance metrics for educational timing awareness
                const startupTime = startupTimer();
                const address = serverInstance.address();
                
                // Update server state to 'running' after successful binding and startup completion
                SERVER_STATE = SERVER_STATES.RUNNING;
                
                logger.info(`${EDUCATIONAL_HTTP_PREFIX} Server started successfully`, {
                    educational: true,
                    serverState: SERVER_STATE,
                    address: address,
                    url: `http://${address.address}:${address.port}`,
                    startupTime: `${startupTime}ms`,
                    phase: 'startup_complete',
                    success: true
                });
                
                // Display comprehensive educational information about server capabilities and educational endpoints
                if (appConfig.educational?.tutorial?.showStartupGuidance) {
                    logger.info(`${EDUCATIONAL_HTTP_PREFIX} Educational Server Information`, {
                        educational: true,
                        capabilities: {
                            httpModule: 'Node.js Built-in',
                            requestHandling: 'Event-driven with Router Integration',
                            endpoints: ['/hello'],
                            errorHandling: 'Comprehensive Educational Error Management',
                            lifecycle: 'Complete with Graceful Shutdown',
                            monitoring: 'Performance Timing and Request Logging'
                        },
                        learningObjectives: [
                            'HTTP server creation and lifecycle management',
                            'Request-response patterns and routing concepts',
                            'Error handling and recovery strategies',
                            'Performance monitoring and optimization awareness'
                        ]
                    });
                }
                
                // Provide educational startup benchmarks and performance guidance for learning enhancement
                if (startupTime > 2000) {
                    logger.warn(`${EDUCATIONAL_HTTP_PREFIX} Server startup took longer than expected`, {
                        educational: true,
                        startupTime: `${startupTime}ms`,
                        benchmark: '< 1000ms expected for tutorial server',
                        guidance: 'Monitor system resources and startup process for optimization opportunities'
                    });
                }
                
                // Return Promise resolution with server instance for continued operation and integration
                resolve(serverInstance);
            });
            
            // Handle port binding errors with comprehensive educational guidance and troubleshooting assistance
            serverInstance.on('error', (error) => {
                clearTimeout(startupTimeout);
                
                logger.error(`${EDUCATIONAL_HTTP_PREFIX} Server binding error occurred`, error, {
                    educational: true,
                    errorCode: error.code,
                    port: port,
                    hostname: hostname,
                    phase: 'binding_error'
                });
                
                // Provide specific educational guidance based on common binding error types
                let educationalGuidance = 'Check server configuration and system resources';
                if (error.code === 'EADDRINUSE') {
                    educationalGuidance = `Port ${port} is already in use. Try: PORT=${port + 1} node server.js or kill existing process`;
                } else if (error.code === 'EACCES') {
                    educationalGuidance = `Permission denied for port ${port}. Use port above 1024 or run with elevated privileges`;
                } else if (error.code === 'ENOTFOUND') {
                    educationalGuidance = `Hostname '${hostname}' not found. Use 127.0.0.1 or localhost for tutorial safety`;
                }
                
                logger.error(`${EDUCATIONAL_HTTP_PREFIX} Educational troubleshooting guidance`, {
                    educational: true,
                    guidance: educationalGuidance,
                    commonSolutions: [
                        `Change port: PORT=${port + 1} node server.js`,
                        `Kill conflicting process: lsof -ti:${port} | xargs kill -9`,
                        `Check port availability: netstat -tulpn | grep ${port}`
                    ]
                });
                
                // Reset server state on startup failure for educational state management consistency
                SERVER_STATE = SERVER_STATES.STOPPED;
                STARTUP_TIMESTAMP = null;
                
                // Reject Promise with educational error information and comprehensive troubleshooting context
                reject(error);
            });
            
        } catch (error) {
            // Handle startup validation errors with comprehensive educational error processing and guidance
            logger.error(`${EDUCATIONAL_HTTP_PREFIX} Server startup validation failed`, error, {
                educational: true,
                phase: 'startup_validation_error',
                parameters: { port, hostname }
            });
            
            // Reset server state on validation failure for consistent educational state management
            SERVER_STATE = SERVER_STATES.STOPPED;
            STARTUP_TIMESTAMP = null;
            
            // Use handleServerError for comprehensive educational error processing and recovery guidance
            handleServerError(error, {
                phase: 'startup_validation',
                port: port,
                hostname: hostname,
                educational: true
            });
            
            // Reject Promise with validation error for upstream handling and educational error demonstration
            reject(error);
        }
    });
}

/**
 * Gracefully stops the HTTP server instance with comprehensive connection draining, resource cleanup,
 * and educational shutdown logging to demonstrate proper Node.js server shutdown procedures and
 * provide enhanced learning experience about application lifecycle management.
 * 
 * Educational Note: This function demonstrates proper server shutdown including connection draining,
 * resource cleanup, and timeout handling suitable for production applications and educational learning.
 * 
 * @param {object} serverInstance - HTTP server instance to stop, defaults to global instance
 * @param {number} timeout - Maximum time to wait for graceful shutdown in milliseconds
 * @returns {Promise} Promise resolving when server successfully stops or rejecting with timeout error
 */
function stopServer(serverInstance = SERVER_INSTANCE, timeout = SHUTDOWN_TIMEOUT) {
    return new Promise((resolve, reject) => {
        // Start comprehensive shutdown timing for educational shutdown performance measurement and monitoring
        const shutdownTimer = logger.startTimer('server_shutdown');
        
        logger.info(`${EDUCATIONAL_HTTP_PREFIX} Initiating graceful server shutdown...`, {
            educational: true,
            phase: 'shutdown_initiated',
            timeout: `${timeout}ms`,
            serverState: SERVER_STATE,
            timestamp: new Date().toISOString()
        });
        
        try {
            // Validate server instance exists and is currently running for shutdown operations
            if (!serverInstance) {
                logger.warn(`${EDUCATIONAL_HTTP_PREFIX} No server instance to stop`, {
                    educational: true,
                    serverState: SERVER_STATE,
                    action: 'no_action_required'
                });
                resolve(null);
                return;
            }
            
            // Check if server is already stopped or stopping to prevent duplicate shutdown operations
            if (SERVER_STATE === SERVER_STATES.STOPPED || SERVER_STATE === SERVER_STATES.STOPPING) {
                logger.info(`${EDUCATIONAL_HTTP_PREFIX} Server is already ${SERVER_STATE}`, {
                    educational: true,
                    serverState: SERVER_STATE,
                    action: 'shutdown_already_in_progress'
                });
                resolve(serverInstance);
                return;
            }
            
            // Set server state to 'stopping' for educational lifecycle tracking and state management demonstration
            SERVER_STATE = SERVER_STATES.STOPPING;
            
            logger.info(`${EDUCATIONAL_HTTP_PREFIX} Server state updated to stopping`, {
                educational: true,
                serverState: SERVER_STATE,
                phase: 'state_stopping',
                gracefulShutdown: true
            });
            
            // Set up shutdown timeout for educational timeout handling and forced termination demonstration
            const shutdownTimeoutId = setTimeout(() => {
                logger.warn(`${EDUCATIONAL_HTTP_PREFIX} Graceful shutdown timeout exceeded`, {
                    educational: true,
                    timeout: `${timeout}ms`,
                    action: 'force_closing_connections',
                    guidance: 'Some connections may be forcefully closed'
                });
                
                // Force close remaining connections after timeout for educational timeout handling demonstration
                if (serverInstance.listening) {
                    serverInstance.close(() => {
                        const shutdownTime = shutdownTimer();
                        logger.warn(`${EDUCATIONAL_HTTP_PREFIX} Server force-closed after timeout`, {
                            educational: true,
                            shutdownTime: `${shutdownTime}ms`,
                            timeoutExceeded: true,
                            phase: 'force_shutdown_complete'
                        });
                        resolve(serverInstance);
                    });
                }
            }, timeout);
            
            // Log educational information about graceful shutdown process and connection handling
            logger.info(`${EDUCATIONAL_HTTP_PREFIX} Educational shutdown process explanation`, {
                educational: true,
                shutdownSteps: [
                    '1. Stop accepting new connections',
                    '2. Wait for existing connections to complete',
                    '3. Close server after all connections finish',
                    '4. Clean up resources and reset state'
                ],
                gracefulShutdownBenefits: [
                    'Prevents data loss during active requests',
                    'Ensures proper resource cleanup',
                    'Maintains application reliability',
                    'Demonstrates production-ready practices'
                ]
            });
            
            // Stop accepting new connections using server.close() method with comprehensive monitoring
            serverInstance.close((error) => {
                clearTimeout(shutdownTimeoutId);
                
                if (error) {
                    logger.error(`${EDUCATIONAL_HTTP_PREFIX} Server shutdown error occurred`, error, {
                        educational: true,
                        phase: 'shutdown_error',
                        errorCode: error.code
                    });
                    
                    // Handle shutdown errors with educational guidance and troubleshooting assistance
                    handleServerError(error, {
                        phase: 'server_shutdown',
                        educational: true,
                        action: 'shutdown_error_recovery'
                    });
                    
                    reject(error);
                    return;
                }
                
                // Calculate shutdown performance metrics for educational timing awareness and monitoring
                const shutdownTime = shutdownTimer();
                const uptime = STARTUP_TIMESTAMP ? Date.now() - STARTUP_TIMESTAMP : 0;
                
                // Clean up server resources and clear global references for educational resource management demonstration
                SERVER_STATE = SERVER_STATES.STOPPED;
                SERVER_INSTANCE = null;
                STARTUP_TIMESTAMP = null;
                
                logger.info(`${EDUCATIONAL_HTTP_PREFIX} Server shutdown completed successfully`, {
                    educational: true,
                    serverState: SERVER_STATE,
                    shutdownTime: `${shutdownTime}ms`,
                    serverUptime: `${Math.floor(uptime / 1000)}s`,
                    phase: 'shutdown_complete',
                    cleanup: 'complete'
                });
                
                // Display educational shutdown summary with performance metrics and learning outcomes
                if (appConfig.educational?.tutorial?.verboseLogging) {
                    logger.info(`${EDUCATIONAL_HTTP_PREFIX} Educational Shutdown Summary`, {
                        educational: true,
                        shutdownMetrics: {
                            shutdownTime: `${shutdownTime}ms`,
                            totalUptime: `${Math.floor(uptime / 1000)}s`,
                            shutdownType: 'graceful',
                            connectionHandling: 'proper_drainage',
                            resourceCleanup: 'complete'
                        },
                        learningOutcomes: [
                            'Demonstrated graceful shutdown patterns',
                            'Showed proper connection management',
                            'Illustrated resource cleanup procedures',
                            'Provided performance timing awareness'
                        ]
                    });
                }
                
                // Provide educational guidance about server shutdown timing and optimization
                if (shutdownTime > 5000) {
                    logger.info(`${EDUCATIONAL_HTTP_PREFIX} Shutdown timing guidance`, {
                        educational: true,
                        shutdownTime: `${shutdownTime}ms`,
                        guidance: 'Shutdown took longer than expected, consider connection timeout optimization',
                        optimizationTips: [
                            'Reduce keep-alive timeout for faster shutdown',
                            'Implement connection tracking for better control',
                            'Consider implementing shutdown hooks for cleanup'
                        ]
                    });
                }
                
                // Return Promise resolution after complete shutdown and cleanup for continued application lifecycle
                resolve(serverInstance);
            });
            
        } catch (error) {
            // Handle shutdown initialization errors with comprehensive educational error processing
            logger.error(`${EDUCATIONAL_HTTP_PREFIX} Server shutdown initialization failed`, error, {
                educational: true,
                phase: 'shutdown_initialization_error',
                serverState: SERVER_STATE
            });
            
            // Use handleServerError for comprehensive educational error processing and recovery guidance
            handleServerError(error, {
                phase: 'shutdown_initialization',
                educational: true,
                serverState: SERVER_STATE
            });
            
            // Reject Promise with shutdown initialization error for upstream handling and error demonstration
            reject(error);
        }
    });
}

/**
 * Configures comprehensive graceful shutdown procedures for the HTTP server including process
 * signal handlers, connection draining, and educational shutdown messaging for proper Node.js
 * process management and enhanced learning experience about application lifecycle patterns.
 * 
 * Educational Note: This function demonstrates proper process signal handling and graceful shutdown
 * patterns essential for production Node.js applications and educational understanding of process lifecycle.
 * 
 * @param {object} serverInstance - HTTP server instance to configure for graceful shutdown
 * @returns {void} No return value, configures shutdown handlers for server instance with educational monitoring
 */
function setupGracefulShutdown(serverInstance) {
    logger.info(`${EDUCATIONAL_HTTP_PREFIX} Setting up graceful shutdown procedures...`, {
        educational: true,
        phase: 'shutdown_setup',
        signalHandling: true,
        processManagement: true
    });
    
    // Flag to prevent multiple shutdown attempts and provide educational shutdown state management
    let shutdownInProgress = false;
    
    /**
     * Unified shutdown function that handles graceful server termination with educational
     * logging and comprehensive error handling for all shutdown triggers and scenarios.
     * 
     * @param {string} signal - Process signal that triggered shutdown for educational context
     * @param {string} reason - Human-readable reason for shutdown for educational logging
     */
    async function performGracefulShutdown(signal, reason) {
        // Prevent multiple shutdown attempts with educational state tracking and monitoring
        if (shutdownInProgress) {
            logger.warn(`${EDUCATIONAL_HTTP_PREFIX} Shutdown already in progress, ignoring ${signal}`, {
                educational: true,
                signal: signal,
                reason: 'duplicate_shutdown_signal',
                shutdownInProgress: true
            });
            return;
        }
        
        shutdownInProgress = true;
        
        logger.info(`${EDUCATIONAL_HTTP_PREFIX} Graceful shutdown triggered`, {
            educational: true,
            signal: signal,
            reason: reason,
            phase: 'graceful_shutdown_triggered',
            timestamp: new Date().toISOString()
        });
        
        // Display educational information about shutdown signal handling and process management
        if (appConfig.educational?.tutorial?.verboseLogging) {
            logger.info(`${EDUCATIONAL_HTTP_PREFIX} Educational Signal Handling Information`, {
                educational: true,
                signalInfo: {
                    signal: signal,
                    description: getSignalDescription(signal),
                    commonUse: getSignalCommonUse(signal),
                    gracefulShutdown: 'Process will shutdown gracefully with resource cleanup'
                },
                shutdownSteps: [
                    'Stop accepting new HTTP connections',
                    'Wait for existing requests to complete',
                    'Close server and clean up resources',
                    'Exit process with appropriate code'
                ]
            });
        }
        
        try {
            // Attempt graceful server shutdown with educational timing and comprehensive monitoring
            logger.info(`${EDUCATIONAL_HTTP_PREFIX} Attempting graceful server shutdown...`, {
                educational: true,
                shutdownMethod: 'graceful_stop_server',
                timeout: SHUTDOWN_TIMEOUT
            });
            
            await stopServer(serverInstance, SHUTDOWN_TIMEOUT);
            
            logger.info(`${EDUCATIONAL_HTTP_PREFIX} Graceful shutdown completed successfully`, {
                educational: true,
                signal: signal,
                shutdownType: 'graceful',
                exitCode: 0,
                phase: 'graceful_shutdown_success'
            });
            
            // Display educational shutdown completion message with learning outcomes and process information
            if (appConfig.educational?.tutorial?.showStartupGuidance) {
                console.log('\n' + '='.repeat(60));
                console.log('🎓 EDUCATIONAL GRACEFUL SHUTDOWN COMPLETE 🎓');
                console.log('='.repeat(60));
                console.log(`✅ Signal received: ${signal} (${reason})`);
                console.log('✅ Server stopped gracefully');
                console.log('✅ All connections closed properly');
                console.log('✅ Resources cleaned up successfully');
                console.log('');
                console.log('📚 LEARNING OUTCOMES ACHIEVED:');
                console.log('   • Process signal handling patterns');
                console.log('   • Graceful shutdown implementation');
                console.log('   • Resource cleanup procedures');
                console.log('   • Production-ready lifecycle management');
                console.log('='.repeat(60) + '\n');
            }
            
            // Exit process with success code after graceful shutdown completion
            process.exit(0);
            
        } catch (shutdownError) {
            // Handle graceful shutdown failures with comprehensive educational error processing
            logger.error(`${EDUCATIONAL_HTTP_PREFIX} Graceful shutdown failed`, shutdownError, {
                educational: true,
                signal: signal,
                shutdownType: 'forced',
                fallbackAction: 'process_exit_1'
            });
            
            logger.warn(`${EDUCATIONAL_HTTP_PREFIX} Falling back to forced process termination`, {
                educational: true,
                reason: 'graceful_shutdown_failed',
                exitCode: 1,
                guidance: 'Check application logs for shutdown issues'
            });
            
            // Exit with error code if graceful shutdown fails for educational error handling demonstration
            process.exit(1);
        }
    }
    
    // Register SIGINT signal handler for Ctrl+C graceful shutdown with comprehensive educational logging
    process.on('SIGINT', () => {
        performGracefulShutdown('SIGINT', 'User interrupted with Ctrl+C');
    });
    
    // Register SIGTERM signal handler for process termination with graceful shutdown procedures and monitoring
    process.on('SIGTERM', () => {
        performGracefulShutdown('SIGTERM', 'Process termination signal received');
    });
    
    // Set up uncaught exception handler with server cleanup and comprehensive educational error messaging
    process.on('uncaughtException', (error) => {
        logger.error(`${EDUCATIONAL_HTTP_PREFIX} Uncaught exception occurred`, error, {
            educational: true,
            errorType: 'uncaught_exception',
            recovery: 'attempting_graceful_shutdown',
            guidance: 'Review stack trace and fix the underlying issue'
        });
        
        // Display educational information about uncaught exceptions and error handling best practices
        if (appConfig.educational?.tutorial?.verboseLogging) {
            console.log('\n' + '!'.repeat(60));
            console.log('⚠️  EDUCATIONAL UNCAUGHT EXCEPTION HANDLER ⚠️');
            console.log('!'.repeat(60));
            console.log('An unhandled error occurred in the application:');
            console.log(`Error: ${error.message}`);
            console.log('');
            console.log('📚 LEARNING POINTS:');
            console.log('   • Always use try-catch blocks for error-prone code');
            console.log('   • Handle Promise rejections with .catch() or async/await');
            console.log('   • Implement proper error handling throughout application');
            console.log('   • Use process.on("uncaughtException") as last resort only');
            console.log('!'.repeat(60) + '\n');
        }
        
        performGracefulShutdown('UNCAUGHT_EXCEPTION', `Uncaught exception: ${error.message}`);
    });
    
    // Configure unhandled promise rejection handler with educational guidance and graceful shutdown procedures
    process.on('unhandledRejection', (reason, promise) => {
        logger.error(`${EDUCATIONAL_HTTP_PREFIX} Unhandled promise rejection`, {
            educational: true,
            errorType: 'unhandled_rejection',
            reason: reason,
            promise: promise,
            recovery: 'attempting_graceful_shutdown',
            guidance: 'Add .catch() handlers to all promises or use async/await with try-catch'
        });
        
        // Display educational information about promise rejection handling and async error patterns
        if (appConfig.educational?.tutorial?.verboseLogging) {
            console.log('\n' + '!'.repeat(60));
            console.log('⚠️  EDUCATIONAL UNHANDLED PROMISE REJECTION ⚠️');
            console.log('!'.repeat(60));
            console.log('A promise was rejected but not handled:');
            console.log(`Reason: ${reason}`);
            console.log('');
            console.log('📚 LEARNING POINTS:');
            console.log('   • Always add .catch() handlers to promises');
            console.log('   • Use try-catch blocks with async/await');
            console.log('   • Handle errors in promise chains properly');
            console.log('   • Consider using Promise.allSettled() for multiple promises');
            console.log('!'.repeat(60) + '\n');
        }
        
        performGracefulShutdown('UNHANDLED_REJECTION', `Promise rejection: ${reason}`);
    });
    
    logger.info(`${EDUCATIONAL_HTTP_PREFIX} Graceful shutdown procedures configured successfully`, {
        educational: true,
        signalHandlers: ['SIGINT', 'SIGTERM'],
        exceptionHandlers: ['uncaughtException', 'unhandledRejection'],
        shutdownMethod: 'graceful_with_timeout',
        timeout: SHUTDOWN_TIMEOUT,
        phase: 'shutdown_setup_complete'
    });
    
    // Display educational information about process signal handling for enhanced learning experience
    if (appConfig.educational?.tutorial?.verboseLogging) {
        logger.info(`${EDUCATIONAL_HTTP_PREFIX} Educational Process Management Information`, {
            educational: true,
            processManagement: {
                signalHandling: 'Configured for graceful shutdown',
                errorHandling: 'Comprehensive uncaught error recovery',
                resourceCleanup: 'Automatic server and connection cleanup',
                processLifecycle: 'Production-ready lifecycle management'
            },
            usageInstructions: [
                'Press Ctrl+C to trigger graceful shutdown',
                'Send SIGTERM signal for programmatic shutdown',
                'Monitor console for educational shutdown information',
                'Observe graceful connection handling during shutdown'
            ]
        });
    }
}

// =============================================================================
// SERVER STATUS AND MONITORING FUNCTIONS
// =============================================================================

/**
 * Returns comprehensive status information about the HTTP server including current state,
 * configuration details, performance metrics, and educational context for debugging,
 * monitoring, and enhanced learning experience about server management patterns.
 * 
 * Educational Note: This function demonstrates server status monitoring patterns and provides
 * comprehensive information about server health, configuration, and performance suitable for
 * educational purposes and production monitoring understanding.
 * 
 * @returns {object} Server status object with state, configuration, timing, and educational information
 */
function getServerStatus() {
    logger.debug(`${EDUCATIONAL_HTTP_PREFIX} Retrieving server status information`, {
        educational: true,
        phase: 'status_retrieval',
        serverState: SERVER_STATE
    });
    
    // Calculate server uptime if currently running for educational timing awareness
    const currentTime = Date.now();
    const uptime = STARTUP_TIMESTAMP ? currentTime - STARTUP_TIMESTAMP : 0;
    const uptimeSeconds = Math.floor(uptime / 1000);
    
    // Extract server address information if server is listening for comprehensive status reporting
    let addressInfo = null;
    if (SERVER_INSTANCE && SERVER_INSTANCE.listening) {
        const address = SERVER_INSTANCE.address();
        addressInfo = {
            address: address.address,
            port: address.port,
            family: address.family,
            url: `http://${address.address}:${address.port}`
        };
    }
    
    // Gather server configuration details for educational transparency and debugging assistance
    const configDetails = {
        defaultPort: DEFAULT_PORT,
        defaultHostname: DEFAULT_HOSTNAME,
        shutdownTimeout: SHUTDOWN_TIMEOUT,
        educationalMode: appConfig.educational?.tutorial?.mode || false,
        environment: appConfig.environment || 'unknown'
    };
    
    // Include connection information if server is active for comprehensive monitoring
    let connectionInfo = null;
    if (SERVER_INSTANCE && SERVER_INSTANCE.listening) {
        connectionInfo = {
            maxConnections: SERVER_INSTANCE.maxConnections,
            timeout: SERVER_INSTANCE.timeout,
            keepAliveTimeout: SERVER_INSTANCE.keepAliveTimeout,
            headersTimeout: SERVER_INSTANCE.headersTimeout,
            listening: SERVER_INSTANCE.listening
        };
    }
    
    // Build comprehensive server status object with educational context and debugging information
    const serverStatus = {
        // Core server state and timing information
        status: SERVER_STATE,
        uptime: uptimeSeconds,
        uptimeMs: uptime,
        startupTimestamp: STARTUP_TIMESTAMP,
        currentTimestamp: currentTime,
        
        // Server address and network configuration
        address: addressInfo,
        configuration: configDetails,
        connections: connectionInfo,
        
        // Process and system information for educational context
        process: {
            pid: process.pid,
            nodeVersion: process.version,
            platform: process.platform,
            architecture: process.arch,
            memoryUsage: process.memoryUsage(),
            uptime: Math.floor(process.uptime())
        },
        
        // Educational context and tutorial information
        educational: {
            tutorialMode: appConfig.educational?.tutorial?.mode || false,
            learningObjectives: [
                'Server status monitoring and health checking',
                'Performance metrics collection and analysis',
                'Configuration management and transparency',
                'Process information and resource monitoring'
            ],
            statusCategories: {
                stopped: 'Server is not running',
                starting: 'Server is initializing and binding to port',
                running: 'Server is active and accepting connections',
                stopping: 'Server is shutting down gracefully'
            }
        },
        
        // Status metadata for debugging and educational purposes
        metadata: {
            retrieved: new Date().toISOString(),
            serverImplementation: 'Node.js Tutorial HTTP Server',
            version: appConfig.app?.version || '1.0.0',
            educationalFeatures: true,
            monitoringCapabilities: true
        }
    };
    
    // Add runtime performance indicators if server is running for educational performance monitoring
    if (SERVER_STATE === SERVER_STATES.RUNNING && STARTUP_TIMESTAMP) {
        serverStatus.performance = {
            startupTime: 'Available from startup logs',
            averageRequestTime: 'Tracked per request',
            memoryEfficiency: serverStatus.process.memoryUsage.heapUsed < 50 * 1024 * 1024 ? 'Good' : 'Monitor',
            uptimeStability: uptimeSeconds > 60 ? 'Stable' : 'Recently started'
        };
    }
    
    // Include educational guidance based on current server state for learning enhancement
    serverStatus.educational.guidance = getServerStatusGuidance(SERVER_STATE, serverStatus);
    
    // Log status retrieval for educational transparency and debugging assistance
    logger.debug(`${EDUCATIONAL_HTTP_PREFIX} Server status retrieved successfully`, {
        educational: true,
        serverState: SERVER_STATE,
        uptime: `${uptimeSeconds}s`,
        hasAddressInfo: !!addressInfo,
        phase: 'status_complete'
    });
    
    // Return comprehensive server status object for monitoring, debugging, and educational analysis
    return serverStatus;
}

/**
 * Collects and returns comprehensive server performance metrics including uptime, request processing,
 * response times, and educational benchmarks for performance monitoring, learning, and optimization
 * awareness in tutorial and production environments.
 * 
 * Educational Note: This function demonstrates performance monitoring patterns and provides
 * educational insights into server performance characteristics suitable for learning about
 * optimization, resource management, and performance analysis techniques.
 * 
 * @returns {object} Metrics object with performance data, educational benchmarks, and timing information
 */
function getServerMetrics() {
    logger.debug(`${EDUCATIONAL_HTTP_PREFIX} Collecting server performance metrics`, {
        educational: true,
        phase: 'metrics_collection',
        serverState: SERVER_STATE
    });
    
    // Calculate comprehensive server uptime metrics for educational timing awareness and monitoring
    const currentTime = Date.now();
    const serverUptime = STARTUP_TIMESTAMP ? currentTime - STARTUP_TIMESTAMP : 0;
    const processUptime = Math.floor(process.uptime() * 1000); // Convert to milliseconds
    
    // Gather memory usage metrics for educational resource monitoring and optimization awareness
    const memoryMetrics = process.memoryUsage();
    const memoryMB = {
        rss: Math.round(memoryMetrics.rss / 1024 / 1024 * 100) / 100,
        heapTotal: Math.round(memoryMetrics.heapTotal / 1024 / 1024 * 100) / 100,
        heapUsed: Math.round(memoryMetrics.heapUsed / 1024 / 1024 * 100) / 100,
        external: Math.round(memoryMetrics.external / 1024 / 1024 * 100) / 100
    };
    
    // Calculate memory efficiency metrics for educational performance assessment and guidance
    const memoryEfficiency = {
        heapUtilization: Math.round((memoryMB.heapUsed / memoryMB.heapTotal) * 100),
        totalMemoryUsage: memoryMB.rss,
        isEfficient: memoryMB.rss < 100, // Less than 100MB considered efficient for tutorial
        optimizationNeeded: memoryMB.rss > 200 // More than 200MB may need optimization
    };
    
    // Build performance timing metrics for educational performance monitoring and benchmarking
    const timingMetrics = {
        serverUptime: serverUptime,
        processUptime: processUptime,
        serverUptimeFormatted: formatUptime(serverUptime),
        processUptimeFormatted: formatUptime(processUptime),
        startupTimestamp: STARTUP_TIMESTAMP,
        metricsTimestamp: currentTime
    };
    
    // Include Node.js runtime performance metrics for educational system monitoring and analysis
    const runtimeMetrics = {
        nodeVersion: process.version,
        v8HeapStatistics: process.memoryUsage(),
        platform: process.platform,
        architecture: process.arch,
        pid: process.pid,
        ppid: process.ppid
    };
    
    // Calculate server state metrics for educational lifecycle monitoring and status analysis
    const stateMetrics = {
        currentState: SERVER_STATE,
        isRunning: SERVER_STATE === SERVER_STATES.RUNNING,
        hasBeenStarted: STARTUP_TIMESTAMP !== null,
        isHealthy: SERVER_STATE === SERVER_STATES.RUNNING && memoryEfficiency.isEfficient,
        stateTransitions: {
            stopped: 'Initial state or after shutdown',
            starting: 'Server binding and initialization',
            running: 'Active and processing requests',
            stopping: 'Graceful shutdown in progress'
        }
    };
    
    // Build educational performance benchmarks and targets for learning and optimization guidance
    const educationalBenchmarks = {
        startupTime: {
            target: '< 1000ms',
            good: '< 500ms',
            description: 'Time from process start to server listening'
        },
        memoryUsage: {
            target: '< 50MB RSS',
            good: '< 25MB RSS',
            current: `${memoryMB.rss}MB`,
            description: 'Resident Set Size memory consumption'
        },
        requestProcessing: {
            target: '< 100ms per request',
            good: '< 50ms per request',
            description: 'Average time to process simple requests'
        },
        uptime: {
            target: 'Continuous operation',
            good: '> 1 hour stable',
            current: timingMetrics.serverUptimeFormatted,
            description: 'Server continuous operation duration'
        }
    };
    
    // Include connection and network metrics if server is active for comprehensive monitoring
    let networkMetrics = null;
    if (SERVER_INSTANCE && SERVER_INSTANCE.listening) {
        const address = SERVER_INSTANCE.address();
        networkMetrics = {
            bindingAddress: address,
            maxConnections: SERVER_INSTANCE.maxConnections,
            timeout: SERVER_INSTANCE.timeout,
            keepAliveTimeout: SERVER_INSTANCE.keepAliveTimeout,
            headersTimeout: SERVER_INSTANCE.headersTimeout,
            listening: SERVER_INSTANCE.listening,
            serverUrl: `http://${address.address}:${address.port}`
        };
    }
    
    // Build comprehensive server metrics object with educational context and optimization guidance
    const serverMetrics = {
        // Core performance timing and state metrics
        timing: timingMetrics,
        state: stateMetrics,
        memory: {
            raw: memoryMetrics,
            formatted: memoryMB,
            efficiency: memoryEfficiency
        },
        
        // Runtime and system performance information
        runtime: runtimeMetrics,
        network: networkMetrics,
        
        // Educational benchmarks and performance targets
        educational: {
            benchmarks: educationalBenchmarks,
            performance: {
                overall: assessOverallPerformance(memoryEfficiency, serverUptime),
                memory: assessMemoryPerformance(memoryEfficiency),
                uptime: assessUptimePerformance(serverUptime),
                recommendations: generatePerformanceRecommendations(memoryEfficiency, serverUptime)
            },
            learningObjectives: [
                'Understanding server performance monitoring',
                'Learning memory usage patterns and optimization',
                'Practicing performance benchmarking techniques',
                'Developing optimization awareness and skills'
            ]
        },
        
        // Metrics metadata for debugging and educational transparency
        metadata: {
            collected: new Date().toISOString(),
            serverImplementation: 'Node.js Tutorial HTTP Server',
            metricsVersion: '1.0.0',
            educationalFeatures: true,
            performanceMonitoring: true,
            optimizationGuidance: true
        }
    };
    
    // Add health assessment and status indicators for educational health monitoring demonstration
    serverMetrics.health = {
        overall: serverMetrics.educational.performance.overall,
        indicators: {
            memoryHealth: memoryEfficiency.isEfficient ? 'Good' : 'Monitor',
            stateHealth: SERVER_STATE === SERVER_STATES.RUNNING ? 'Good' : 'Check Status',
            uptimeHealth: serverUptime > 60000 ? 'Stable' : 'Recently Started',
            processHealth: 'Good' // Process is running if we can collect metrics
        },
        recommendations: serverMetrics.educational.performance.recommendations
    };
    
    // Log metrics collection completion for educational transparency and debugging assistance
    logger.debug(`${EDUCATIONAL_HTTP_PREFIX} Server metrics collected successfully`, {
        educational: true,
        metricsCollected: {
            timing: !!timingMetrics,
            memory: !!memoryMetrics,
            state: !!stateMetrics,
            network: !!networkMetrics,
            health: true
        },
        overallHealth: serverMetrics.health.overall,
        phase: 'metrics_complete'
    });
    
    // Display educational performance summary if verbose logging is enabled for learning enhancement
    if (appConfig.educational?.tutorial?.verboseLogging) {
        logger.info(`${EDUCATIONAL_HTTP_PREFIX} Performance Metrics Summary`, {
            educational: true,
            performance: {
                uptime: timingMetrics.serverUptimeFormatted,
                memoryUsage: `${memoryMB.rss}MB RSS`,
                healthStatus: serverMetrics.health.overall,
                serverState: SERVER_STATE,
                optimizationLevel: memoryEfficiency.isEfficient ? 'Good' : 'Needs Attention'
            }
        });
    }
    
    // Return comprehensive server metrics object for monitoring, analysis, and educational learning
    return serverMetrics;
}

/**
 * Validates server configuration parameters including port availability, hostname security,
 * and timeout values with comprehensive educational validation messaging for configuration
 * troubleshooting, learning assistance, and proper setup guidance.
 * 
 * Educational Note: This function demonstrates configuration validation patterns and provides
 * educational feedback about proper server configuration, security considerations, and
 * troubleshooting guidance for common configuration issues.
 * 
 * @param {object} config - Server configuration object to validate
 * @returns {boolean} True if configuration is valid, throws EducationalError with guidance if invalid
 */
function validateServerConfig(config) {
    logger.debug(`${EDUCATIONAL_HTTP_PREFIX} Validating server configuration`, {
        educational: true,
        phase: 'config_validation',
        configProvided: !!config
    });
    
    // Initialize validation results collection for comprehensive educational feedback
    const validationErrors = [];
    const validationWarnings = [];
    const educationalGuidance = [];
    
    try {
        // Validate configuration object exists and has required structure
        if (!config || typeof config !== 'object') {
            validationErrors.push('Server configuration must be a valid object');
            educationalGuidance.push('CONFIG OBJECT: Provide configuration object with port, hostname, and timeout');
            throw new Error('Invalid configuration object');
        }
        
        // Validate port number is within acceptable range and available for educational security
        if (typeof config.port !== 'number') {
            validationErrors.push('Port must be a number');
            educationalGuidance.push('PORT TYPE: Specify port as a number (e.g., 3000)');
        } else if (config.port < 1 || config.port > 65535) {
            validationErrors.push('Port must be between 1 and 65535');
            educationalGuidance.push('PORT RANGE: Valid port range is 1-65535');
        } else if (config.port < 1024) {
            validationWarnings.push('Port below 1024 requires elevated privileges');
            educationalGuidance.push('PRIVILEGED PORTS: Ports below 1024 require administrator/root privileges');
        }
        
        // Validate hostname is localhost or 127.0.0.1 for educational security requirements
        if (typeof config.hostname !== 'string') {
            validationErrors.push('Hostname must be a string');
            educationalGuidance.push('HOSTNAME TYPE: Specify hostname as string (127.0.0.1 or localhost)');
        } else if (config.hostname !== '127.0.0.1' && config.hostname !== 'localhost') {
            validationErrors.push('Only localhost hostnames allowed for tutorial security');
            educationalGuidance.push('SECURITY: Use 127.0.0.1 or localhost for tutorial safety');
        }
        
        // Verify timeout values are reasonable for educational environment and proper operation
        if (config.timeout !== undefined) {
            if (typeof config.timeout !== 'number') {
                validationErrors.push('Timeout must be a number');
                educationalGuidance.push('TIMEOUT TYPE: Specify timeout in milliseconds as number');
            } else if (config.timeout <= 0) {
                validationErrors.push('Timeout must be positive');
                educationalGuidance.push('TIMEOUT VALUE: Use positive timeout value (e.g., 30000 for 30 seconds)');
            } else if (config.timeout < 5000) {
                validationWarnings.push('Very short timeout may cause request interruptions');
                educationalGuidance.push('TIMEOUT GUIDANCE: Consider timeout >= 5000ms for stable operation');
            } else if (config.timeout > 300000) {
                validationWarnings.push('Very long timeout may cause resource issues');
                educationalGuidance.push('TIMEOUT GUIDANCE: Consider timeout <= 300000ms (5 minutes)');
            }
        }
        
        // Validate educational settings and tutorial-specific options for proper learning experience
        if (config.educational && typeof config.educational !== 'object') {
            validationWarnings.push('Educational settings should be an object');
            educationalGuidance.push('EDUCATIONAL CONFIG: Provide educational options as object with boolean properties');
        }
        
        // Check for common configuration conflicts and provide educational guidance
        if (config.port === 80 && config.hostname === '127.0.0.1') {
            validationWarnings.push('Port 80 may conflict with system web server');
            educationalGuidance.push('PORT CONFLICT: Consider using port 3000 or other non-standard port');
        }
        
        // Validate keep-alive and connection settings for optimal tutorial performance
        if (config.keepAliveTimeout !== undefined && typeof config.keepAliveTimeout !== 'number') {
            validationWarnings.push('keepAliveTimeout should be a number');
            educationalGuidance.push('KEEP-ALIVE: Specify keep-alive timeout in milliseconds');
        }
        
        if (config.maxConnections !== undefined && typeof config.maxConnections !== 'number') {
            validationWarnings.push('maxConnections should be a number');
            educationalGuidance.push('MAX CONNECTIONS: Specify maximum connections as number');
        }
        
        // Log validation progress for educational transparency and debugging assistance
        logger.debug(`${EDUCATIONAL_HTTP_PREFIX} Configuration validation analysis complete`, {
            educational: true,
            validationResults: {
                errors: validationErrors.length,
                warnings: validationWarnings.length,
                guidance: educationalGuidance.length
            }
        });
        
        // Display validation warnings with educational guidance for learning enhancement
        if (validationWarnings.length > 0) {
            logger.warn(`${EDUCATIONAL_HTTP_PREFIX} Configuration validation warnings`, {
                educational: true,
                warnings: validationWarnings,
                guidance: educationalGuidance.filter((_, index) => index >= validationErrors.length)
            });
        }
        
        // Throw comprehensive educational error if validation fails with troubleshooting guidance
        if (validationErrors.length > 0) {
            logger.error(`${EDUCATIONAL_HTTP_PREFIX} Configuration validation failed`, {
                educational: true,
                errors: validationErrors,
                guidance: educationalGuidance,
                phase: 'validation_failed'
            });
            
            // Create detailed error message with educational guidance for troubleshooting assistance
            const errorMessage = `Configuration validation failed:\n${validationErrors.join('\n')}`;
            const guidanceMessage = educationalGuidance.length > 0 
                ? `\n\nTroubleshooting Guidance:\n${educationalGuidance.join('\n')}` 
                : '';
            
            const error = new Error(errorMessage + guidanceMessage);
            error.name = 'ConfigurationValidationError';
            error.errors = validationErrors;
            error.warnings = validationWarnings;
            error.guidance = educationalGuidance;
            
            throw error;
        }
        
        // Log successful validation with educational context and configuration summary
        logger.info(`${EDUCATIONAL_HTTP_PREFIX} Configuration validation passed`, {
            educational: true,
            validatedConfig: {
                port: config.port,
                hostname: config.hostname,
                timeout: config.timeout,
                educationalMode: config.educational?.showConfigurationInfo
            },
            warnings: validationWarnings.length,
            phase: 'validation_success'
        });
        
        // Display educational configuration summary for enhanced learning experience
        if (appConfig.educational?.tutorial?.showConfigurationInfo) {
            logger.info(`${EDUCATIONAL_HTTP_PREFIX} Configuration Summary`, {
                educational: true,
                configuration: {
                    bindingAddress: `${config.hostname}:${config.port}`,
                    securityLevel: 'Localhost-only (Educational)',
                    timeoutSettings: `${config.timeout || 'default'}ms`,
                    educationalFeatures: 'Enabled',
                    validationStatus: 'Passed'
                }
            });
        }
        
        // Return true indicating successful validation with educational context
        return true;
        
    } catch (error) {
        // Handle validation errors with comprehensive educational error processing
        logger.error(`${EDUCATIONAL_HTTP_PREFIX} Configuration validation error`, error, {
            educational: true,
            phase: 'validation_error',
            troubleshooting: 'Check configuration object and parameter values'
        });
        
        // Re-throw error for upstream handling after educational processing
        throw error;
    }
}

// =============================================================================
// UTILITY AND HELPER FUNCTIONS
// =============================================================================

/**
 * Formats uptime milliseconds into human-readable duration string for educational display
 * Educational Note: Demonstrates time formatting and provides user-friendly duration display
 */
function formatUptime(uptimeMs) {
    if (!uptimeMs || uptimeMs < 0) return '0s';
    
    const seconds = Math.floor(uptimeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

/**
 * Assesses overall server performance based on memory efficiency and uptime
 * Educational Note: Provides performance assessment logic for educational monitoring
 */
function assessOverallPerformance(memoryEfficiency, uptime) {
    if (!memoryEfficiency.isEfficient) return 'Needs Optimization';
    if (uptime < 60000) return 'Recently Started';
    if (memoryEfficiency.optimizationNeeded) return 'Monitor Performance';
    return 'Good';
}

/**
 * Assesses memory performance and provides educational classification
 * Educational Note: Demonstrates memory performance analysis for learning
 */
function assessMemoryPerformance(memoryEfficiency) {
    if (memoryEfficiency.optimizationNeeded) return 'Needs Optimization';
    if (!memoryEfficiency.isEfficient) return 'Monitor Usage';
    return 'Efficient';
}

/**
 * Assesses uptime performance for educational stability monitoring
 * Educational Note: Provides uptime analysis for server stability learning
 */
function assessUptimePerformance(uptime) {
    if (uptime < 60000) return 'Recently Started';
    if (uptime < 3600000) return 'Short Term';
    return 'Stable';
}

/**
 * Generates performance optimization recommendations based on current metrics
 * Educational Note: Provides actionable optimization guidance for learning
 */
function generatePerformanceRecommendations(memoryEfficiency, uptime) {
    const recommendations = [];
    
    if (memoryEfficiency.optimizationNeeded) {
        recommendations.push('Monitor memory usage and consider optimization');
    }
    if (!memoryEfficiency.isEfficient) {
        recommendations.push('Review memory usage patterns');
    }
    if (uptime < 60000) {
        recommendations.push('Allow server to run longer for stability assessment');
    }
    
    if (recommendations.length === 0) {
        recommendations.push('Server performance is within acceptable ranges');
    }
    
    return recommendations;
}

/**
 * Provides educational guidance based on server status for learning enhancement
 * Educational Note: Contextual guidance helps students understand server states
 */
function getServerStatusGuidance(state, statusObject) {
    switch (state) {
        case SERVER_STATES.STOPPED:
            return 'Server is not running. Use startServer() to begin accepting connections.';
        case SERVER_STATES.STARTING:
            return 'Server is initializing. Wait for startup completion before sending requests.';
        case SERVER_STATES.RUNNING:
            return `Server is active at ${statusObject.address?.url || 'unknown address'}. Ready to handle requests.`;
        case SERVER_STATES.STOPPING:
            return 'Server is shutting down gracefully. Wait for shutdown completion.';
        default:
            return 'Server state is unknown. Check server instance and configuration.';
    }
}

/**
 * Provides human-readable description of process signals for educational context
 * Educational Note: Helps students understand different process signals and their purposes
 */
function getSignalDescription(signal) {
    const descriptions = {
        'SIGINT': 'Interrupt signal (Ctrl+C) - User requested interruption',
        'SIGTERM': 'Termination signal - Graceful shutdown request',
        'UNCAUGHT_EXCEPTION': 'Unhandled error occurred - Emergency shutdown',
        'UNHANDLED_REJECTION': 'Promise rejection not handled - Error recovery'
    };
    
    return descriptions[signal] || `Process signal: ${signal}`;
}

/**
 * Provides common use cases for process signals for educational context
 * Educational Note: Helps students understand when and why different signals are used
 */
function getSignalCommonUse(signal) {
    const useCases = {
        'SIGINT': 'User presses Ctrl+C in terminal',
        'SIGTERM': 'Process manager or system shutdown',
        'UNCAUGHT_EXCEPTION': 'Programming error not caught',
        'UNHANDLED_REJECTION': 'Promise error not handled'
    };
    
    return useCases[signal] || 'System or application event';
}

// =============================================================================
// MODULE EXPORTS
// =============================================================================

module.exports = {
    // Main HTTP server creation and configuration functions
    createHTTPServer,
    
    // Server lifecycle management functions for complete server operation
    startServer,
    stopServer,
    setupGracefulShutdown,
    
    // Server status and monitoring functions for comprehensive observability
    getServerStatus,
    getServerMetrics,
    
    // Configuration validation function for educational troubleshooting
    validateServerConfig,
    
    // Server state constants for lifecycle management and educational status tracking
    SERVER_STATES
};