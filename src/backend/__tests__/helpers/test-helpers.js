/**
 * Test Helper Utilities Module for Node.js Tutorial Application
 * 
 * This module provides comprehensive testing assistance for the Node.js tutorial application,
 * offering centralized testing utilities including server lifecycle management, HTTP request
 * simulation, performance measurement, assertion helpers, mock management, and educational
 * testing patterns to support unit tests, integration tests, and comprehensive educational
 * validation across the entire tutorial application testing suite.
 * 
 * Educational Features:
 * - Server lifecycle testing with performance measurement and educational logging
 * - HTTP request-response testing infrastructure with validation and timing analysis
 * - Performance measurement utilities with educational benchmarks and threshold validation
 * - Educational assertion helpers with detailed comparison and troubleshooting guidance
 * - Comprehensive mock integration with automatic cleanup and state management
 * - Environment setup and validation with educational configuration and resource management
 * - Educational insights generation from test execution and performance data analysis
 * 
 * Integration Capabilities:
 * - Deep integration with Jest testing framework for spy management and test lifecycle
 * - Seamless coordination with HTTP mock objects for comprehensive testing scenarios
 * - Integration with test data fixtures for realistic testing and educational validation
 * - Logger integration for test timing, debugging assistance, and execution visibility
 * - Configuration integration for consistent test environment and educational features
 * - Error handling integration for testing error scenarios with educational guidance
 * 
 * @module test-helpers
 * @version 1.0.0
 * @educational Provides comprehensive testing utilities with educational context and professional patterns
 */

// =============================================================================
// EXTERNAL IMPORTS
// =============================================================================

// Jest testing framework utilities for spy management, assertions, and test lifecycle management (v29.0.0)
const jest = require('jest');

// Node.js HTTP module for creating test server instances and HTTP client functionality (Node.js Built-in)
const http = require('node:http');

// Node.js process module for performance timing and test environment management (Node.js Built-in)
const process = require('node:process');

// =============================================================================
// INTERNAL IMPORTS
// =============================================================================

// Test data fixtures for creating realistic test scenarios and request validation
const { 
    validRequestData: { helloGetRequest, validHeaders },
    invalidRequestData: { invalidMethods, malformedRequests },
    expectedResponseData: { successResponse, notFoundResponse }
} = require('../fixtures/test-data.js');

// HTTP mock utilities for creating mock objects with spy capabilities and comprehensive tracking
const { 
    createMockRequest, 
    createMockResponse, 
    createMockServer, 
    simulateRequest, 
    resetMockCalls 
} = require('../mocks/http-mocks.js');

// HTTP server functions for server instance testing and lifecycle management
const { 
    createHTTPServer, 
    startServer, 
    stopServer, 
    getServerStatus 
} = require('../../lib/server/http-server.js');

// Educational logger for test timing, debugging assistance, and educational context logging
const { logger } = require('../../lib/utils/logger.js');

// Educational error factory for testing error handling with tutorial-specific context
const { createEducationalError } = require('../../lib/utils/error-handler.js');

// Server configuration constants for consistent test server setup
const { DEFAULT_PORT, DEFAULT_HOSTNAME } = require('../../lib/config/server-config.js');

// HTTP status codes for response validation and assertion testing
const { HTTP_STATUS } = require('../../lib/constants/http-status-codes.js');

// Response messages for content validation and assertion testing
const { SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../../lib/constants/response-messages.js');

// Application configuration for test environment setup and educational testing features
const { appConfig } = require('../../lib/config/app-config.js');

// =============================================================================
// GLOBAL CONSTANTS AND CONFIGURATION
// =============================================================================

/**
 * Default timeout for test operations in milliseconds to prevent hanging tests
 * Educational Note: Reasonable timeout prevents test suite delays while allowing for slower systems
 */
const TEST_TIMEOUT = 10000;

/**
 * Educational test prefix for consistent test output identification and learning context
 */
const EDUCATIONAL_TEST_PREFIX = '[Test Helper]';

/**
 * Performance thresholds for educational benchmarking and timing validation
 */
const PERFORMANCE_THRESHOLDS = {
    startup: 2000,    // Server startup should complete within 2 seconds
    request: 100,     // Request processing should complete within 100ms
    response: 50      // Response generation should complete within 50ms
};

/**
 * Global test server registry for automatic cleanup management and resource tracking
 */
const TEST_SERVER_REGISTRY = new Map();

// =============================================================================
// SERVER LIFECYCLE TESTING UTILITIES
// =============================================================================

/**
 * Creates a test HTTP server instance with educational configuration, proper cleanup
 * registration, and comprehensive testing utilities for server lifecycle testing and validation
 * 
 * Educational Note: Test server creation demonstrates server instantiation patterns while
 * providing isolated testing environment with automatic resource management
 * 
 * @param {object} options - Optional configuration for test server including port, hostname, and educational features
 * @returns {object} Test server instance with utilities for testing, cleanup methods, and educational context
 */
function createTestServer(options = {}) {
    const serverTimer = logger.startTimer('test_server_creation');
    
    try {
        logger.info(`${EDUCATIONAL_TEST_PREFIX} Creating test server instance`, {
            educational: true,
            operation: 'server_creation',
            options: options
        });
        
        // Create server configuration with test-specific overrides and educational settings
        const serverConfig = {
            port: options.port || 0, // Use ephemeral port for testing to avoid conflicts
            hostname: options.hostname || DEFAULT_HOSTNAME,
            educational: {
                mode: true,
                testingContext: true,
                performanceMonitoring: appConfig.educational?.performance?.showTimingInfo || true,
                verboseLogging: appConfig.educational?.logging?.verboseMode || false
            },
            ...options
        };
        
        // Initialize HTTP server instance using createHTTPServer with test configuration
        const serverInstance = createHTTPServer(serverConfig);
        
        // Add educational context and testing utilities to server instance
        const testServer = {
            // Core server instance and configuration
            server: serverInstance,
            config: serverConfig,
            
            // Server state tracking for testing
            isRunning: false,
            startTime: null,
            testId: `test-server-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            
            // Performance measurement utilities
            performanceMetrics: {
                startupTime: null,
                requestCount: 0,
                totalResponseTime: 0,
                averageResponseTime: 0
            },
            
            // Testing utilities and helper methods
            utils: {
                // Get server URL for testing requests
                getUrl: () => {
                    const port = testServer.address?.port || serverConfig.port;
                    return `http://${serverConfig.hostname}:${port}`;
                },
                
                // Wait for server to be ready for testing
                waitForReady: (timeout = 5000) => {
                    return new Promise((resolve, reject) => {
                        const startWait = Date.now();
                        const checkReady = () => {
                            if (testServer.isRunning && testServer.server.listening) {
                                resolve(testServer);
                            } else if (Date.now() - startWait > timeout) {
                                reject(new Error('Timeout waiting for server to be ready'));
                            } else {
                                setTimeout(checkReady, 50);
                            }
                        };
                        checkReady();
                    });
                },
                
                // Record performance metrics for educational analysis
                recordMetrics: (responseTime) => {
                    testServer.performanceMetrics.requestCount++;
                    testServer.performanceMetrics.totalResponseTime += responseTime;
                    testServer.performanceMetrics.averageResponseTime = 
                        testServer.performanceMetrics.totalResponseTime / testServer.performanceMetrics.requestCount;
                },
                
                // Get comprehensive server status for testing validation
                getStatus: () => ({
                    isRunning: testServer.isRunning,
                    listening: testServer.server.listening,
                    address: testServer.address,
                    uptime: testServer.startTime ? Date.now() - testServer.startTime : 0,
                    metrics: testServer.performanceMetrics
                })
            },
            
            // Educational context and learning features
            educational: {
                concept: 'HTTP Server Testing with Lifecycle Management',
                learningObjectives: [
                    'Understanding server instantiation and configuration',
                    'Testing server lifecycle states and transitions',
                    'Monitoring server performance during testing',
                    'Managing test server resources and cleanup'
                ],
                troubleshooting: {
                    portConflicts: 'Use ephemeral ports (port 0) for testing to avoid conflicts',
                    serverNotReady: 'Use waitForReady() method before making test requests',
                    memoryLeaks: 'Always stop test servers after testing to prevent resource leaks'
                }
            }
        };
        
        // Set up performance monitoring and timing measurement for educational metrics
        if (serverConfig.educational.performanceMonitoring) {
            testServer.server.on('request', (req, res) => {
                const requestStart = Date.now();
                res.on('finish', () => {
                    const responseTime = Date.now() - requestStart;
                    testServer.utils.recordMetrics(responseTime);
                    
                    if (responseTime > PERFORMANCE_THRESHOLDS.response) {
                        logger.warn(`${EDUCATIONAL_TEST_PREFIX} Slow response detected`, {
                            responseTime,
                            threshold: PERFORMANCE_THRESHOLDS.response,
                            educationalTip: 'Consider optimizing response generation for better performance'
                        });
                    }
                });
            });
        }
        
        // Configure server event listeners for testing validation and error handling
        testServer.server.on('listening', () => {
            testServer.isRunning = true;
            testServer.address = testServer.server.address();
            testServer.performanceMetrics.startupTime = Date.now() - (testServer.startTime || Date.now());
            
            logger.info(`${EDUCATIONAL_TEST_PREFIX} Test server listening`, {
                address: testServer.address,
                startupTime: testServer.performanceMetrics.startupTime,
                educational: true
            });
        });
        
        testServer.server.on('error', (error) => {
            logger.error(`${EDUCATIONAL_TEST_PREFIX} Test server error`, error, {
                testId: testServer.testId,
                troubleshooting: 'Check port availability and server configuration'
            });
        });
        
        testServer.server.on('close', () => {
            testServer.isRunning = false;
            logger.debug(`${EDUCATIONAL_TEST_PREFIX} Test server closed`, {
                testId: testServer.testId,
                uptime: testServer.startTime ? Date.now() - testServer.startTime : 0
            });
        });
        
        // Register server in test server registry for automatic cleanup management
        TEST_SERVER_REGISTRY.set(testServer.testId, testServer);
        
        const creationDuration = serverTimer.end();
        
        // Add educational context about server creation performance
        if (creationDuration > 100) {
            logger.warn(`${EDUCATIONAL_TEST_PREFIX} Server creation took longer than expected`, {
                duration: creationDuration,
                educationalTip: 'Server creation should be fast for efficient testing'
            });
        }
        
        logger.info(`${EDUCATIONAL_TEST_PREFIX} Test server created successfully`, {
            testId: testServer.testId,
            creationTime: creationDuration,
            educational: true
        });
        
        // Return configured test server with cleanup and utility methods attached
        return testServer;
        
    } catch (error) {
        serverTimer.end();
        logger.error(`${EDUCATIONAL_TEST_PREFIX} Failed to create test server`, error, {
            troubleshooting: 'Check server configuration and ensure no port conflicts exist'
        });
        throw createEducationalError('Test server creation failed', {
            originalError: error,
            context: 'test_server_creation',
            educationalGuidance: 'Verify test configuration and try using ephemeral ports'
        });
    }
}

/**
 * Starts a test server instance with performance measurement, educational logging,
 * and comprehensive error handling for testing server startup procedures and validation
 * 
 * Educational Note: Server startup testing demonstrates proper server initialization
 * patterns while measuring performance against educational benchmarks
 * 
 * @param {object} serverInstance - Test server instance to start
 * @param {number} port - Optional port override for test server binding
 * @returns {Promise} Promise resolving to started server with performance metrics and educational context
 */
async function startTestServer(serverInstance, port = null) {
    const startupTimer = logger.startTimer('test_server_startup');
    
    try {
        logger.info(`${EDUCATIONAL_TEST_PREFIX} Starting test server`, {
            testId: serverInstance.testId,
            port: port || serverInstance.config.port,
            educational: true,
            operation: 'server_startup'
        });
        
        // Validate server instance and configuration parameters for testing
        if (!serverInstance || !serverInstance.server) {
            throw createEducationalError('Invalid server instance provided for startup', {
                context: 'test_server_startup',
                educationalGuidance: 'Ensure server instance is created with createTestServer() before starting'
            });
        }
        
        if (serverInstance.isRunning) {
            logger.warn(`${EDUCATIONAL_TEST_PREFIX} Server is already running`, {
                testId: serverInstance.testId,
                educationalTip: 'Check server status before attempting to start'
            });
            return serverInstance;
        }
        
        // Record server startup start time for performance measurement
        serverInstance.startTime = Date.now();
        
        // Determine port for server binding with educational context
        const bindingPort = port || serverInstance.config.port;
        const bindingHostname = serverInstance.config.hostname;
        
        logger.debug(`${EDUCATIONAL_TEST_PREFIX} Binding server to network interface`, {
            hostname: bindingHostname,
            port: bindingPort,
            educational: true
        });
        
        // Start server using Promise-based approach for async/await compatibility
        await new Promise((resolve, reject) => {
            // Set timeout for startup to prevent hanging tests
            const startupTimeout = setTimeout(() => {
                reject(createEducationalError('Server startup timeout exceeded', {
                    timeout: PERFORMANCE_THRESHOLDS.startup,
                    context: 'server_startup_timeout',
                    educationalGuidance: 'Check for port conflicts or system resource constraints'
                }));
            }, PERFORMANCE_THRESHOLDS.startup);
            
            // Handle successful server startup
            serverInstance.server.once('listening', () => {
                clearTimeout(startupTimeout);
                const startupDuration = startupTimer.end();
                
                // Record startup performance metrics
                serverInstance.performanceMetrics.startupTime = startupDuration;
                
                logger.info(`${EDUCATIONAL_TEST_PREFIX} Test server started successfully`, {
                    testId: serverInstance.testId,
                    address: serverInstance.server.address(),
                    startupTime: startupDuration,
                    performanceLevel: startupDuration < 1000 ? 'excellent' : 
                                    startupDuration < 2000 ? 'good' : 'slow',
                    educational: true
                });
                
                // Add educational performance analysis
                if (startupDuration > PERFORMANCE_THRESHOLDS.startup) {
                    logger.warn(`${EDUCATIONAL_TEST_PREFIX} Server startup exceeded performance threshold`, {
                        duration: startupDuration,
                        threshold: PERFORMANCE_THRESHOLDS.startup,
                        educationalTip: 'Slow startup may indicate system resource constraints'
                    });
                }
                
                resolve(serverInstance);
            });
            
            // Handle server startup errors
            serverInstance.server.once('error', (error) => {
                clearTimeout(startupTimeout);
                startupTimer.end();
                
                logger.error(`${EDUCATIONAL_TEST_PREFIX} Server startup failed`, error, {
                    testId: serverInstance.testId,
                    port: bindingPort,
                    hostname: bindingHostname
                });
                
                reject(createEducationalError('Test server startup failed', {
                    originalError: error,
                    context: 'server_startup_error',
                    educationalGuidance: 'Check port availability and network interface configuration'
                }));
            });
            
            // Attempt to start the server
            try {
                serverInstance.server.listen(bindingPort, bindingHostname);
            } catch (listenError) {
                clearTimeout(startupTimeout);
                startupTimer.end();
                reject(createEducationalError('Failed to bind server to port', {
                    originalError: listenError,
                    port: bindingPort,
                    hostname: bindingHostname,
                    educationalGuidance: 'Verify port is not in use and binding permissions are sufficient'
                }));
            }
        });
        
        return serverInstance;
        
    } catch (error) {
        startupTimer.end();
        logger.error(`${EDUCATIONAL_TEST_PREFIX} Test server startup failed`, error, {
            testId: serverInstance?.testId,
            troubleshooting: 'Verify port availability and server configuration'
        });
        throw error;
    }
}

/**
 * Gracefully stops a test server instance with cleanup procedures, performance measurement,
 * and educational logging for testing server shutdown and resource management
 * 
 * Educational Note: Server shutdown testing demonstrates proper resource cleanup
 * and graceful termination patterns essential for reliable applications
 * 
 * @param {object} serverInstance - Test server instance to stop
 * @param {number} timeout - Optional timeout for graceful shutdown
 * @returns {Promise} Promise resolving when server is completely stopped and cleaned up
 */
async function stopTestServer(serverInstance, timeout = 5000) {
    const shutdownTimer = logger.startTimer('test_server_shutdown');
    
    try {
        logger.info(`${EDUCATIONAL_TEST_PREFIX} Stopping test server`, {
            testId: serverInstance.testId,
            timeout: timeout,
            educational: true,
            operation: 'server_shutdown'
        });
        
        // Validate server instance before attempting shutdown
        if (!serverInstance || !serverInstance.server) {
            logger.warn(`${EDUCATIONAL_TEST_PREFIX} Invalid server instance for shutdown`, {
                educationalTip: 'Ensure server instance exists before attempting to stop'
            });
            shutdownTimer.end();
            return;
        }
        
        if (!serverInstance.isRunning) {
            logger.info(`${EDUCATIONAL_TEST_PREFIX} Server is already stopped`, {
                testId: serverInstance.testId,
                educationalTip: 'Check server status before attempting shutdown'
            });
            shutdownTimer.end();
            return;
        }
        
        // Calculate server uptime for educational context
        const uptime = serverInstance.startTime ? Date.now() - serverInstance.startTime : 0;
        
        // Initiate graceful server shutdown with timeout protection
        await new Promise((resolve, reject) => {
            // Set timeout for shutdown to prevent hanging tests
            const shutdownTimeout = setTimeout(() => {
                logger.warn(`${EDUCATIONAL_TEST_PREFIX} Server shutdown timeout - forcing close`, {
                    testId: serverInstance.testId,
                    timeout: timeout,
                    educationalNote: 'Forced shutdown may not clean up all resources'
                });
                
                // Force close if graceful shutdown times out
                try {
                    serverInstance.server.close(() => resolve());
                } catch (forceError) {
                    logger.error(`${EDUCATIONAL_TEST_PREFIX} Failed to force close server`, forceError);
                    resolve(); // Continue with cleanup even if force close fails
                }
            }, timeout);
            
            // Handle successful server shutdown
            serverInstance.server.close((error) => {
                clearTimeout(shutdownTimeout);
                const shutdownDuration = shutdownTimer.end();
                
                if (error) {
                    logger.error(`${EDUCATIONAL_TEST_PREFIX} Server shutdown error`, error, {
                        testId: serverInstance.testId
                    });
                    reject(createEducationalError('Server shutdown failed', {
                        originalError: error,
                        context: 'server_shutdown_error'
                    }));
                    return;
                }
                
                logger.info(`${EDUCATIONAL_TEST_PREFIX} Test server stopped successfully`, {
                    testId: serverInstance.testId,
                    uptime: uptime,
                    shutdownTime: shutdownDuration,
                    performanceMetrics: serverInstance.performanceMetrics,
                    educational: true
                });
                
                resolve();
            });
        });
        
        // Remove server from test server registry for cleanup management
        if (TEST_SERVER_REGISTRY.has(serverInstance.testId)) {
            TEST_SERVER_REGISTRY.delete(serverInstance.testId);
            logger.debug(`${EDUCATIONAL_TEST_PREFIX} Server removed from registry`, {
                testId: serverInstance.testId,
                remainingServers: TEST_SERVER_REGISTRY.size
            });
        }
        
        // Generate educational summary of server session
        if (appConfig.educational?.logging?.verboseMode) {
            logger.info(`${EDUCATIONAL_TEST_PREFIX} Server session summary`, {
                testId: serverInstance.testId,
                totalUptime: uptime,
                requestsProcessed: serverInstance.performanceMetrics.requestCount,
                averageResponseTime: serverInstance.performanceMetrics.averageResponseTime,
                startupPerformance: serverInstance.performanceMetrics.startupTime,
                educational: {
                    concept: 'Server lifecycle completed successfully',
                    learningPoints: [
                        'Server started and stopped cleanly',
                        'Performance metrics collected throughout session',
                        'Resources properly cleaned up on shutdown'
                    ]
                }
            });
        }
        
    } catch (error) {
        shutdownTimer.end();
        logger.error(`${EDUCATIONAL_TEST_PREFIX} Test server shutdown failed`, error, {
            testId: serverInstance?.testId,
            troubleshooting: 'Force restart if server becomes unresponsive'
        });
        throw error;
    }
}

// =============================================================================
// HTTP REQUEST-RESPONSE TESTING UTILITIES
// =============================================================================

/**
 * Makes HTTP test requests to server instances with performance measurement, response
 * validation, and educational context for comprehensive request-response testing
 * 
 * Educational Note: Request testing demonstrates HTTP client-server communication
 * patterns while measuring performance and validating response correctness
 * 
 * @param {string} url - Request URL path for HTTP test request
 * @param {object} options - Request options including method, headers, and educational settings
 * @returns {Promise} Promise resolving to response object with performance metrics and validation results
 */
async function makeTestRequest(url, options = {}) {
    const requestTimer = logger.startTimer('test_request');
    
    try {
        logger.info(`${EDUCATIONAL_TEST_PREFIX} Making test HTTP request`, {
            url: url,
            method: options.method || 'GET',
            educational: true,
            operation: 'http_request'
        });
        
        // Extract request configuration with educational defaults
        const {
            method = 'GET',
            headers = {},
            body = null,
            timeout = 5000,
            validateResponse = true,
            measurePerformance = true
        } = options;
        
        // Validate URL format for test request
        if (typeof url !== 'string' || !url) {
            throw createEducationalError('Invalid URL provided for test request', {
                providedUrl: url,
                context: 'test_request_validation',
                educationalGuidance: 'Ensure URL is a valid string starting with http:// or is a path'
            });
        }
        
        // Parse URL and prepare request options
        let requestUrl;
        try {
            // Handle full URLs or paths
            if (url.startsWith('http://') || url.startsWith('https://')) {
                requestUrl = new URL(url);
            } else {
                // Assume localhost path for testing
                requestUrl = new URL(url, `http://${DEFAULT_HOSTNAME}:${DEFAULT_PORT}`);
            }
        } catch (urlError) {
            throw createEducationalError('Malformed URL for test request', {
                originalError: urlError,
                providedUrl: url,
                educationalGuidance: 'Use valid URL format like "/hello" or full URL with protocol'
            });
        }
        
        // Prepare HTTP request options
        const requestOptions = {
            hostname: requestUrl.hostname,
            port: requestUrl.port || (requestUrl.protocol === 'https:' ? 443 : 80),
            path: requestUrl.pathname + (requestUrl.search || ''),
            method: method.toUpperCase(),
            headers: {
                'User-Agent': 'Node.js Tutorial Test Client',
                'Accept': 'text/plain',
                ...headers
            },
            timeout: timeout
        };
        
        logger.debug(`${EDUCATIONAL_TEST_PREFIX} Request configuration`, {
            hostname: requestOptions.hostname,
            port: requestOptions.port,
            path: requestOptions.path,
            method: requestOptions.method,
            educational: true
        });
        
        // Make HTTP request using Node.js http module
        const response = await new Promise((resolve, reject) => {
            const requestStartTime = Date.now();
            
            const req = http.request(requestOptions, (res) => {
                let responseBody = '';
                
                // Collect response data
                res.on('data', (chunk) => {
                    responseBody += chunk;
                });
                
                res.on('end', () => {
                    const requestDuration = Date.now() - requestStartTime;
                    
                    // Create comprehensive response object
                    const responseObject = {
                        statusCode: res.statusCode,
                        statusMessage: res.statusMessage,
                        headers: res.headers,
                        body: responseBody,
                        
                        // Performance metrics
                        performance: {
                            requestTime: requestDuration,
                            responseSize: Buffer.byteLength(responseBody, 'utf8'),
                            performanceLevel: requestDuration < 50 ? 'excellent' :
                                            requestDuration < 100 ? 'good' :
                                            requestDuration < 200 ? 'acceptable' : 'slow'
                        },
                        
                        // Educational context
                        educational: {
                            requestMethod: requestOptions.method,
                            requestPath: requestOptions.path,
                            responseContentType: res.headers['content-type'],
                            httpVersion: res.httpVersion
                        },
                        
                        // Validation results
                        validation: {
                            isSuccessStatus: res.statusCode >= 200 && res.statusCode < 300,
                            isClientError: res.statusCode >= 400 && res.statusCode < 500,
                            isServerError: res.statusCode >= 500,
                            hasContent: responseBody.length > 0
                        }
                    };
                    
                    logger.info(`${EDUCATIONAL_TEST_PREFIX} Test request completed`, {
                        statusCode: res.statusCode,
                        responseTime: requestDuration,
                        responseSize: responseObject.performance.responseSize,
                        performanceLevel: responseObject.performance.performanceLevel,
                        educational: true
                    });
                    
                    // Add performance warning if request was slow
                    if (requestDuration > PERFORMANCE_THRESHOLDS.request) {
                        logger.warn(`${EDUCATIONAL_TEST_PREFIX} Slow request detected`, {
                            duration: requestDuration,
                            threshold: PERFORMANCE_THRESHOLDS.request,
                            educationalTip: 'Consider server optimization if consistent slow responses occur'
                        });
                    }
                    
                    resolve(responseObject);
                });
            });
            
            // Handle request errors
            req.on('error', (error) => {
                requestTimer.end();
                logger.error(`${EDUCATIONAL_TEST_PREFIX} Test request failed`, error, {
                    url: url,
                    method: method,
                    troubleshooting: 'Check server is running and URL is accessible'
                });
                
                reject(createEducationalError('HTTP test request failed', {
                    originalError: error,
                    requestUrl: url,
                    requestMethod: method,
                    educationalGuidance: 'Verify server is started and accepting connections'
                }));
            });
            
            // Handle request timeout
            req.on('timeout', () => {
                req.destroy();
                requestTimer.end();
                
                reject(createEducationalError('Test request timeout', {
                    timeout: timeout,
                    requestUrl: url,
                    educationalGuidance: 'Increase timeout or check server responsiveness'
                }));
            });
            
            // Send request body if provided
            if (body) {
                req.write(body);
            }
            
            // End request to send it
            req.end();
        });
        
        const totalDuration = requestTimer.end();
        
        // Add educational analysis of request performance
        if (measurePerformance && appConfig.educational?.performance?.showTimingInfo) {
            logger.info(`${EDUCATIONAL_TEST_PREFIX} Request performance analysis`, {
                totalRequestTime: totalDuration,
                networkLatency: totalDuration - response.performance.requestTime,
                responseProcessing: response.performance.requestTime,
                performanceTips: {
                    networkOptimization: 'Keep requests local for testing to minimize network latency',
                    responseOptimization: 'Monitor server response time for performance bottlenecks'
                }
            });
        }
        
        return response;
        
    } catch (error) {
        requestTimer.end();
        logger.error(`${EDUCATIONAL_TEST_PREFIX} Test request error`, error, {
            url: url,
            options: options,
            troubleshooting: 'Verify request parameters and server availability'
        });
        throw error;
    }
}

// =============================================================================
// EDUCATIONAL ASSERTION HELPERS
// =============================================================================

/**
 * Educational assertion helper that compares actual HTTP responses with expected responses,
 * providing detailed comparison results and troubleshooting guidance for test validation
 * 
 * Educational Note: Response assertion demonstrates comprehensive testing validation
 * with detailed error analysis and troubleshooting guidance for learning
 * 
 * @param {object} actualResponse - Actual HTTP response received from test request
 * @param {object} expectedResponse - Expected HTTP response for comparison validation
 * @param {object} options - Assertion options including educational context and comparison settings
 * @returns {void} No return value, performs assertions with detailed error messages and educational guidance
 */
function assertResponseEquals(actualResponse, expectedResponse, options = {}) {
    const assertionTimer = logger.startTimer('response_assertion');
    
    try {
        logger.info(`${EDUCATIONAL_TEST_PREFIX} Performing response assertion`, {
            educational: true,
            operation: 'response_assertion',
            actualStatus: actualResponse?.statusCode,
            expectedStatus: expectedResponse?.statusCode
        });
        
        // Extract assertion options with educational defaults
        const {
            includeHeaders = true,
            includeBody = true,
            includePerformance = appConfig.educational?.performance?.showTimingInfo,
            verboseLogging = appConfig.educational?.logging?.verboseMode,
            strictComparison = false
        } = options;
        
        // Validate assertion parameters
        if (!actualResponse || typeof actualResponse !== 'object') {
            throw createEducationalError('Actual response must be a valid response object', {
                providedResponse: actualResponse,
                context: 'response_assertion_validation',
                educationalGuidance: 'Ensure test request returns valid response object'
            });
        }
        
        if (!expectedResponse || typeof expectedResponse !== 'object') {
            throw createEducationalError('Expected response must be a valid response object', {
                providedResponse: expectedResponse,
                context: 'response_assertion_validation',
                educationalGuidance: 'Define expected response structure for comparison'
            });
        }
        
        const assertionErrors = [];
        const assertionWarnings = [];
        
        // Compare HTTP status codes with educational context
        if (expectedResponse.statusCode !== undefined) {
            if (actualResponse.statusCode !== expectedResponse.statusCode) {
                const statusError = `Status code mismatch: expected ${expectedResponse.statusCode}, got ${actualResponse.statusCode}`;
                assertionErrors.push({
                    type: 'STATUS_CODE_MISMATCH',
                    message: statusError,
                    expected: expectedResponse.statusCode,
                    actual: actualResponse.statusCode,
                    educational: {
                        concept: 'HTTP status codes indicate the result of request processing',
                        guidance: getStatusCodeGuidance(expectedResponse.statusCode, actualResponse.statusCode)
                    }
                });
            } else if (verboseLogging) {
                logger.debug(`${EDUCATIONAL_TEST_PREFIX} Status code assertion passed`, {
                    statusCode: actualResponse.statusCode,
                    educational: true
                });
            }
        }
        
        // Validate response headers if requested
        if (includeHeaders && expectedResponse.headers) {
            for (const [headerName, expectedValue] of Object.entries(expectedResponse.headers)) {
                const actualValue = actualResponse.headers?.[headerName.toLowerCase()];
                
                if (strictComparison) {
                    if (actualValue !== expectedValue) {
                        assertionErrors.push({
                            type: 'HEADER_MISMATCH',
                            message: `Header '${headerName}' mismatch: expected '${expectedValue}', got '${actualValue}'`,
                            header: headerName,
                            expected: expectedValue,
                            actual: actualValue,
                            educational: {
                                concept: 'HTTP headers provide metadata about requests and responses',
                                guidance: `Check ${headerName} header generation in response code`
                            }
                        });
                    }
                } else {
                    // Flexible header comparison for educational purposes
                    if (!actualValue) {
                        assertionWarnings.push({
                            type: 'MISSING_HEADER',
                            message: `Expected header '${headerName}' is missing`,
                            header: headerName,
                            expected: expectedValue,
                            educational: {
                                guidance: `Ensure response includes ${headerName} header for proper HTTP compliance`
                            }
                        });
                    } else if (!actualValue.includes(expectedValue)) {
                        assertionWarnings.push({
                            type: 'HEADER_PARTIAL_MATCH',
                            message: `Header '${headerName}' doesn't contain expected value`,
                            header: headerName,
                            expected: expectedValue,
                            actual: actualValue,
                            educational: {
                                guidance: `Check if ${headerName} header value meets expectations`
                            }
                        });
                    }
                }
            }
        }
        
        // Compare response body content with educational analysis
        if (includeBody && expectedResponse.body !== undefined) {
            const actualBody = actualResponse.body || '';
            const expectedBody = expectedResponse.body || '';
            
            if (strictComparison) {
                if (actualBody !== expectedBody) {
                    assertionErrors.push({
                        type: 'BODY_MISMATCH',
                        message: 'Response body content mismatch',
                        expected: expectedBody,
                        actual: actualBody,
                        educational: {
                            concept: 'Response body contains the actual content returned to clients',
                            guidance: 'Verify response generation logic produces expected content',
                            diff: generateBodyDiff(expectedBody, actualBody)
                        }
                    });
                }
            } else {
                // Flexible body comparison for educational scenarios
                if (!actualBody.includes(expectedBody)) {
                    if (expectedBody && !actualBody) {
                        assertionErrors.push({
                            type: 'EMPTY_BODY',
                            message: 'Response body is empty but content was expected',
                            expected: expectedBody,
                            actual: actualBody,
                            educational: {
                                guidance: 'Check response generation code to ensure content is written to response'
                            }
                        });
                    } else {
                        assertionWarnings.push({
                            type: 'BODY_PARTIAL_MATCH',
                            message: 'Response body doesn\'t contain expected content',
                            expected: expectedBody,
                            actual: actualBody,
                            educational: {
                                guidance: 'Verify response content matches tutorial expectations'
                            }
                        });
                    }
                }
            }
        }
        
        // Check response performance against educational thresholds
        if (includePerformance && actualResponse.performance) {
            const responseTime = actualResponse.performance.requestTime;
            if (responseTime > PERFORMANCE_THRESHOLDS.response) {
                assertionWarnings.push({
                    type: 'SLOW_RESPONSE',
                    message: `Response time ${responseTime}ms exceeds threshold ${PERFORMANCE_THRESHOLDS.response}ms`,
                    responseTime: responseTime,
                    threshold: PERFORMANCE_THRESHOLDS.response,
                    educational: {
                        concept: 'Response performance affects user experience',
                        guidance: 'Consider optimizing server response generation for better performance'
                    }
                });
            }
        }
        
        const assertionDuration = assertionTimer.end();
        
        // Report assertion results with educational context
        if (assertionErrors.length > 0) {
            logger.error(`${EDUCATIONAL_TEST_PREFIX} Response assertion failed`, null, {
                errorCount: assertionErrors.length,
                warningCount: assertionWarnings.length,
                errors: assertionErrors,
                warnings: assertionWarnings,
                assertionTime: assertionDuration,
                educational: true,
                troubleshooting: generateAssertionTroubleshooting(assertionErrors)
            });
            
            // Throw assertion error with educational context
            const assertionError = new Error(`Response assertion failed: ${assertionErrors.length} error(s), ${assertionWarnings.length} warning(s)`);
            assertionError.details = {
                errors: assertionErrors,
                warnings: assertionWarnings,
                educational: true
            };
            throw assertionError;
        } else {
            logger.info(`${EDUCATIONAL_TEST_PREFIX} Response assertion passed`, {
                warningCount: assertionWarnings.length,
                warnings: assertionWarnings,
                assertionTime: assertionDuration,
                educational: true,
                success: true
            });
            
            if (assertionWarnings.length > 0 && verboseLogging) {
                logger.warn(`${EDUCATIONAL_TEST_PREFIX} Response assertion passed with warnings`, {
                    warnings: assertionWarnings,
                    educationalTip: 'Consider addressing warnings for optimal response validation'
                });
            }
        }
        
    } catch (error) {
        assertionTimer.end();
        logger.error(`${EDUCATIONAL_TEST_PREFIX} Response assertion error`, error, {
            troubleshooting: 'Check assertion parameters and response object structure'
        });
        throw error;
    }
}

// =============================================================================
// PERFORMANCE MEASUREMENT UTILITIES
// =============================================================================

/**
 * Performance measurement utility that tracks operation timing with educational benchmarks,
 * threshold validation, and comprehensive performance analysis for tutorial testing
 * 
 * Educational Note: Performance measurement demonstrates timing analysis and benchmarking
 * concepts essential for understanding application performance characteristics
 * 
 * @param {function} testFunction - Function to execute and measure for performance analysis
 * @param {string} operationName - Descriptive name for the performance measurement
 * @param {object} options - Performance measurement options including thresholds and educational context
 * @returns {object} Performance results with timing data, threshold validation, and educational insights
 */
async function measurePerformance(testFunction, operationName, options = {}) {
    const measurementTimer = logger.startTimer('performance_measurement');
    
    try {
        logger.info(`${EDUCATIONAL_TEST_PREFIX} Starting performance measurement`, {
            operation: operationName,
            educational: true,
            measurementType: 'execution_timing'
        });
        
        // Extract measurement options with educational defaults
        const {
            iterations = 1,
            warmupRuns = 0,
            collectMemoryStats = appConfig.educational?.performance?.collectMemoryStats,
            thresholds = PERFORMANCE_THRESHOLDS,
            analyzePerformance = true
        } = options;
        
        // Validate test function
        if (typeof testFunction !== 'function') {
            throw createEducationalError('Test function must be a valid function for performance measurement', {
                providedFunction: typeof testFunction,
                context: 'performance_measurement_validation',
                educationalGuidance: 'Provide function to measure as first parameter'
            });
        }
        
        // Initialize performance measurement results
        const performanceResults = {
            operationName: operationName,
            iterations: iterations,
            warmupRuns: warmupRuns,
            measurements: [],
            statistics: {
                min: Infinity,
                max: 0,
                total: 0,
                average: 0,
                median: 0
            },
            memoryStats: collectMemoryStats ? [] : null,
            thresholdAnalysis: {},
            educational: {
                concept: 'Performance measurement quantifies operation efficiency',
                analysisType: 'execution_timing_analysis'
            }
        };
        
        // Perform warmup runs if requested
        if (warmupRuns > 0) {
            logger.debug(`${EDUCATIONAL_TEST_PREFIX} Performing warmup runs`, {
                warmupCount: warmupRuns,
                educationalNote: 'Warmup runs help stabilize performance measurements'
            });
            
            for (let i = 0; i < warmupRuns; i++) {
                try {
                    await testFunction();
                } catch (warmupError) {
                    logger.warn(`${EDUCATIONAL_TEST_PREFIX} Warmup run failed`, warmupError);
                }
            }
        }
        
        // Perform performance measurements
        logger.debug(`${EDUCATIONAL_TEST_PREFIX} Executing performance measurements`, {
            iterations: iterations,
            operationName: operationName
        });
        
        for (let i = 0; i < iterations; i++) {
            // Collect memory stats before execution if enabled
            const memoryBefore = collectMemoryStats ? process.memoryUsage() : null;
            
            // Measure execution time with high resolution
            const executionStart = process.hrtime.bigint();
            
            try {
                // Execute test function and await result
                const result = await testFunction();
                
                // Calculate execution time in milliseconds
                const executionEnd = process.hrtime.bigint();
                const executionTime = Number(executionEnd - executionStart) / 1000000; // Convert to milliseconds
                
                // Collect memory stats after execution if enabled
                const memoryAfter = collectMemoryStats ? process.memoryUsage() : null;
                
                // Record measurement
                const measurement = {
                    iteration: i + 1,
                    executionTime: executionTime,
                    result: result,
                    timestamp: Date.now()
                };
                
                if (collectMemoryStats && memoryBefore && memoryAfter) {
                    measurement.memoryDelta = {
                        rss: memoryAfter.rss - memoryBefore.rss,
                        heapUsed: memoryAfter.heapUsed - memoryBefore.heapUsed,
                        heapTotal: memoryAfter.heapTotal - memoryBefore.heapTotal,
                        external: memoryAfter.external - memoryBefore.external
                    };
                    performanceResults.memoryStats.push(measurement.memoryDelta);
                }
                
                performanceResults.measurements.push(measurement);
                
                // Update statistics
                performanceResults.statistics.total += executionTime;
                performanceResults.statistics.min = Math.min(performanceResults.statistics.min, executionTime);
                performanceResults.statistics.max = Math.max(performanceResults.statistics.max, executionTime);
                
                logger.debug(`${EDUCATIONAL_TEST_PREFIX} Measurement ${i + 1} completed`, {
                    executionTime: executionTime,
                    iteration: i + 1,
                    operationName: operationName
                });
                
            } catch (executionError) {
                logger.error(`${EDUCATIONAL_TEST_PREFIX} Performance measurement iteration failed`, executionError, {
                    iteration: i + 1,
                    operationName: operationName
                });
                
                // Record failed measurement
                performanceResults.measurements.push({
                    iteration: i + 1,
                    executionTime: null,
                    error: executionError.message,
                    timestamp: Date.now()
                });
            }
        }
        
        // Calculate final statistics
        const successfulMeasurements = performanceResults.measurements.filter(m => m.executionTime !== null);
        const executionTimes = successfulMeasurements.map(m => m.executionTime);
        
        if (executionTimes.length > 0) {
            performanceResults.statistics.average = performanceResults.statistics.total / executionTimes.length;
            
            // Calculate median
            const sortedTimes = executionTimes.sort((a, b) => a - b);
            const medianIndex = Math.floor(sortedTimes.length / 2);
            performanceResults.statistics.median = sortedTimes.length % 2 === 0 
                ? (sortedTimes[medianIndex - 1] + sortedTimes[medianIndex]) / 2
                : sortedTimes[medianIndex];
        }
        
        // Analyze performance against thresholds
        if (analyzePerformance && successfulMeasurements.length > 0) {
            performanceResults.thresholdAnalysis = analyzePerformanceThresholds(
                performanceResults.statistics,
                thresholds,
                operationName
            );
        }
        
        const measurementDuration = measurementTimer.end();
        
        // Generate educational performance report
        logger.info(`${EDUCATIONAL_TEST_PREFIX} Performance measurement completed`, {
            operationName: operationName,
            iterations: iterations,
            successfulMeasurements: successfulMeasurements.length,
            averageTime: performanceResults.statistics.average,
            minTime: performanceResults.statistics.min,
            maxTime: performanceResults.statistics.max,
            measurementOverhead: measurementDuration,
            thresholdAnalysis: performanceResults.thresholdAnalysis,
            educational: true
        });
        
        // Add educational insights about performance results
        if (appConfig.educational?.performance?.showTimingInfo) {
            generatePerformanceInsights(performanceResults, operationName);
        }
        
        return performanceResults;
        
    } catch (error) {
        measurementTimer.end();
        logger.error(`${EDUCATIONAL_TEST_PREFIX} Performance measurement failed`, error, {
            operationName: operationName,
            troubleshooting: 'Check test function and measurement parameters'
        });
        throw error;
    }
}

// =============================================================================
// ENVIRONMENT MANAGEMENT UTILITIES
// =============================================================================

/**
 * Utility function that waits for server to be ready for testing with timeout management,
 * health checking, and educational progress tracking for reliable test setup
 * 
 * Educational Note: Server readiness checking demonstrates proper test setup patterns
 * and reliable testing practices essential for consistent test results
 * 
 * @param {object} serverInstance - Server instance to wait for readiness
 * @param {number} timeout - Maximum time to wait for server readiness in milliseconds
 * @returns {Promise} Promise resolving when server is ready or rejecting on timeout with educational context
 */
async function waitForServer(serverInstance, timeout = 5000) {
    const waitTimer = logger.startTimer('server_readiness_wait');
    
    try {
        logger.info(`${EDUCATIONAL_TEST_PREFIX} Waiting for server readiness`, {
            testId: serverInstance?.testId,
            timeout: timeout,
            educational: true,
            operation: 'server_readiness_check'
        });
        
        // Validate server instance
        if (!serverInstance || !serverInstance.server) {
            throw createEducationalError('Invalid server instance for readiness check', {
                context: 'server_readiness_validation',
                educationalGuidance: 'Ensure server instance is created before checking readiness'
            });
        }
        
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            // Set timeout for readiness check
            const readinessTimeout = setTimeout(() => {
                waitTimer.end();
                
                const timeoutError = createEducationalError('Server readiness timeout exceeded', {
                    timeout: timeout,
                    serverState: {
                        isRunning: serverInstance.isRunning,
                        listening: serverInstance.server.listening,
                        address: serverInstance.server.address()
                    },
                    context: 'server_readiness_timeout',
                    educationalGuidance: 'Check server startup logs and increase timeout if needed'
                });
                
                logger.error(`${EDUCATIONAL_TEST_PREFIX} Server readiness timeout`, timeoutError, {
                    testId: serverInstance.testId,
                    waitTime: timeout
                });
                
                reject(timeoutError);
            }, timeout);
            
            // Check server readiness periodically
            const checkInterval = 100; // Check every 100ms
            const checkReadiness = () => {
                const elapsed = Date.now() - startTime;
                
                // Check if server is ready for connections
                if (serverInstance.server.listening && serverInstance.isRunning) {
                    clearTimeout(readinessTimeout);
                    const waitDuration = waitTimer.end();
                    
                    logger.info(`${EDUCATIONAL_TEST_PREFIX} Server is ready for testing`, {
                        testId: serverInstance.testId,
                        waitTime: waitDuration,
                        serverAddress: serverInstance.server.address(),
                        educational: true,
                        readinessCheck: 'successful'
                    });
                    
                    // Add educational context about server readiness
                    if (appConfig.educational?.logging?.verboseMode) {
                        logger.debug(`${EDUCATIONAL_TEST_PREFIX} Server readiness verification`, {
                            listening: serverInstance.server.listening,
                            isRunning: serverInstance.isRunning,
                            address: serverInstance.server.address(),
                            educationalNote: 'Server is listening and ready to accept connections'
                        });
                    }
                    
                    resolve(serverInstance);
                    return;
                }
                
                // Continue checking if within timeout
                if (elapsed < timeout) {
                    setTimeout(checkReadiness, checkInterval);
                }
            };
            
            // Start readiness checking
            checkReadiness();
        });
        
    } catch (error) {
        waitTimer.end();
        logger.error(`${EDUCATIONAL_TEST_PREFIX} Server readiness check failed`, error, {
            testId: serverInstance?.testId,
            troubleshooting: 'Verify server startup process and configuration'
        });
        throw error;
    }
}

/**
 * Factory function that creates comprehensive test scenarios with educational context,
 * performance expectations, and validation criteria for systematic testing of tutorial
 * application functionality
 * 
 * Educational Note: Test scenario creation demonstrates systematic testing approaches
 * and comprehensive validation patterns for reliable test coverage
 * 
 * @param {string} scenarioName - Descriptive name for the test scenario
 * @param {object} scenarioConfig - Configuration including request data, expected responses, and educational context
 * @returns {object} Complete test scenario with request data, expectations, validation methods, and educational context
 */
function createTestScenario(scenarioName, scenarioConfig) {
    const creationTimer = logger.startTimer('test_scenario_creation');
    
    try {
        logger.info(`${EDUCATIONAL_TEST_PREFIX} Creating test scenario`, {
            scenarioName: scenarioName,
            educational: true,
            operation: 'test_scenario_creation'
        });
        
        // Validate scenario parameters
        if (!scenarioName || typeof scenarioName !== 'string') {
            throw createEducationalError('Scenario name must be a non-empty string', {
                providedName: scenarioName,
                context: 'test_scenario_validation',
                educationalGuidance: 'Provide descriptive name for test scenario'
            });
        }
        
        if (!scenarioConfig || typeof scenarioConfig !== 'object') {
            throw createEducationalError('Scenario configuration must be a valid object', {
                providedConfig: scenarioConfig,
                context: 'test_scenario_validation',
                educationalGuidance: 'Provide configuration object with test scenario details'
            });
        }
        
        // Extract configuration with educational defaults
        const {
            request = helloGetRequest,
            expectedResponse = successResponse,
            performanceExpectations = PERFORMANCE_THRESHOLDS,
            educationalContext = {},
            validationRules = {},
            setupSteps = [],
            teardownSteps = []
        } = scenarioConfig;
        
        // Create comprehensive test scenario
        const testScenario = {
            // Scenario identification
            name: scenarioName,
            id: `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            
            // Test configuration
            request: {
                ...request,
                // Add scenario-specific request metadata
                scenarioId: `scenario-${scenarioName.toLowerCase().replace(/\s+/g, '-')}`,
                testContext: 'educational_scenario_testing'
            },
            
            expectedResponse: {
                ...expectedResponse,
                // Add response validation metadata
                validationLevel: validationRules.strict ? 'strict' : 'flexible',
                performanceExpected: true
            },
            
            // Performance expectations
            performance: {
                maxResponseTime: performanceExpectations.response || PERFORMANCE_THRESHOLDS.response,
                maxRequestTime: performanceExpectations.request || PERFORMANCE_THRESHOLDS.request,
                maxStartupTime: performanceExpectations.startup || PERFORMANCE_THRESHOLDS.startup,
                measureMemory: performanceExpectations.measureMemory || false
            },
            
            // Validation configuration
            validation: {
                strictComparison: validationRules.strict || false,
                includeHeaders: validationRules.includeHeaders !== false,
                includeBody: validationRules.includeBody !== false,
                validatePerformance: validationRules.validatePerformance !== false,
                customValidators: validationRules.customValidators || []
            },
            
            // Educational context
            educational: {
                concept: educationalContext.concept || 'HTTP Request-Response Testing',
                learningObjectives: educationalContext.learningObjectives || [
                    'Understanding HTTP client-server communication',
                    'Learning request-response validation patterns',
                    'Demonstrating performance measurement techniques'
                ],
                troubleshootingGuide: educationalContext.troubleshootingGuide || {},
                expectedOutcomes: educationalContext.expectedOutcomes || []
            },
            
            // Test lifecycle
            lifecycle: {
                setupSteps: setupSteps,
                teardownSteps: teardownSteps,
                timeout: scenarioConfig.timeout || TEST_TIMEOUT
            },
            
            // Execution methods
            execute: async function(serverInstance) {
                return await executeTestScenario(this, serverInstance);
            },
            
            validate: function(actualResponse) {
                return validateScenarioResponse(this, actualResponse);
            },
            
            // Utility methods
            getRequestUrl: function() {
                return this.request.path || this.request.url;
            },
            
            getExpectedStatus: function() {
                return this.expectedResponse.statusCode;
            },
            
            isPerformanceCritical: function() {
                return this.validation.validatePerformance;
            }
        };
        
        const creationDuration = creationTimer.end();
        
        logger.info(`${EDUCATIONAL_TEST_PREFIX} Test scenario created successfully`, {
            scenarioName: scenarioName,
            scenarioId: testScenario.id,
            creationTime: creationDuration,
            hasCustomValidation: validationRules.customValidators?.length > 0,
            performanceTracking: testScenario.isPerformanceCritical(),
            educational: true
        });
        
        // Add educational guidance about scenario usage
        if (appConfig.educational?.logging?.demonstratePatterns) {
            logger.info(`${EDUCATIONAL_TEST_PREFIX} Test scenario educational guidance`, {
                scenarioName: scenarioName,
                usage: 'Use scenario.execute(serverInstance) to run the test',
                validation: 'Scenario includes automatic response validation',
                performance: testScenario.isPerformanceCritical() ? 'Performance monitoring enabled' : 'Basic timing only',
                educational: testScenario.educational
            });
        }
        
        return testScenario;
        
    } catch (error) {
        creationTimer.end();
        logger.error(`${EDUCATIONAL_TEST_PREFIX} Test scenario creation failed`, error, {
            scenarioName: scenarioName,
            troubleshooting: 'Check scenario configuration and ensure all required fields are provided'
        });
        throw error;
    }
}

/**
 * Validates test environment setup including server availability, configuration correctness,
 * and educational testing prerequisites for reliable test execution
 * 
 * Educational Note: Environment validation demonstrates thorough testing preparation
 * and system verification practices essential for reliable test execution
 * 
 * @param {object} environmentConfig - Test environment configuration to validate
 * @returns {object} Validation results with success status, detailed analysis, and educational guidance for environment setup
 */
function validateTestEnvironment(environmentConfig = {}) {
    const validationTimer = logger.startTimer('environment_validation');
    
    try {
        logger.info(`${EDUCATIONAL_TEST_PREFIX} Starting test environment validation`, {
            educational: true,
            operation: 'environment_validation'
        });
        
        const validationResults = {
            isValid: true,
            validationTime: null,
            checks: {
                nodeVersion: null,
                jestFramework: null,
                serverConfiguration: null,
                mockObjects: null,
                testData: null,
                educationalFeatures: null
            },
            issues: {
                errors: [],
                warnings: [],
                recommendations: []
            },
            educational: {
                concept: 'Test environment validation ensures reliable test execution',
                validationAreas: [
                    'Node.js runtime version compatibility',
                    'Testing framework availability',
                    'Server configuration validation',
                    'Mock and test data accessibility'
                ]
            }
        };
        
        // Check Node.js version compatibility
        try {
            const nodeVersion = process.version;
            const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
            
            validationResults.checks.nodeVersion = {
                version: nodeVersion,
                majorVersion: majorVersion,
                isCompatible: majorVersion >= 18,
                status: majorVersion >= 18 ? 'valid' : 'error'
            };
            
            if (majorVersion < 18) {
                validationResults.issues.errors.push({
                    type: 'NODE_VERSION_INCOMPATIBLE',
                    message: `Node.js version ${nodeVersion} is not supported. Minimum required: v18.0.0`,
                    educationalGuidance: 'Update Node.js to a supported LTS version for tutorial compatibility'
                });
                validationResults.isValid = false;
            } else if (majorVersion < 20) {
                validationResults.issues.warnings.push({
                    type: 'NODE_VERSION_OUTDATED',
                    message: `Node.js version ${nodeVersion} works but is not the latest LTS`,
                    educationalGuidance: 'Consider updating to Node.js v20+ for optimal performance and features'
                });
            }
            
        } catch (nodeError) {
            validationResults.checks.nodeVersion = {
                status: 'error',
                error: nodeError.message
            };
            validationResults.issues.errors.push({
                type: 'NODE_VERSION_CHECK_FAILED',
                message: 'Failed to determine Node.js version',
                educationalGuidance: 'Ensure Node.js is properly installed and accessible'
            });
            validationResults.isValid = false;
        }
        
        // Validate Jest testing framework setup
        try {
            const jestAvailable = typeof jest !== 'undefined';
            validationResults.checks.jestFramework = {
                available: jestAvailable,
                version: jestAvailable ? jest.getVersion?.() : null,
                status: jestAvailable ? 'valid' : 'error'
            };
            
            if (!jestAvailable) {
                validationResults.issues.errors.push({
                    type: 'JEST_FRAMEWORK_MISSING',
                    message: 'Jest testing framework is not available',
                    educationalGuidance: 'Install Jest: npm install --save-dev jest'
                });
                validationResults.isValid = false;
            }
            
        } catch (jestError) {
            validationResults.checks.jestFramework = {
                status: 'error',
                error: jestError.message
            };
            validationResults.issues.warnings.push({
                type: 'JEST_CHECK_FAILED',
                message: 'Failed to verify Jest framework setup',
                educationalGuidance: 'Ensure Jest is properly installed and configured'
            });
        }
        
        // Validate server configuration
        try {
            const serverConfigValid = DEFAULT_PORT && DEFAULT_HOSTNAME;
            validationResults.checks.serverConfiguration = {
                defaultPort: DEFAULT_PORT,
                defaultHostname: DEFAULT_HOSTNAME,
                configurationValid: serverConfigValid,
                status: serverConfigValid ? 'valid' : 'error'
            };
            
            if (!serverConfigValid) {
                validationResults.issues.errors.push({
                    type: 'SERVER_CONFIG_INVALID',
                    message: 'Server configuration constants are not properly defined',
                    educationalGuidance: 'Check server-config.js file for proper configuration exports'
                });
                validationResults.isValid = false;
            }
            
            // Check port availability
            if (environmentConfig.checkPortAvailability && DEFAULT_PORT !== 0) {
                validationResults.issues.recommendations.push({
                    type: 'USE_EPHEMERAL_PORTS',
                    message: 'Consider using ephemeral ports (port 0) for testing',
                    educationalGuidance: 'Ephemeral ports prevent conflicts during parallel test execution'
                });
            }
            
        } catch (configError) {
            validationResults.checks.serverConfiguration = {
                status: 'error',
                error: configError.message
            };
            validationResults.issues.errors.push({
                type: 'SERVER_CONFIG_CHECK_FAILED',
                message: 'Failed to validate server configuration',
                educationalGuidance: 'Ensure server configuration files are properly loaded'
            });
            validationResults.isValid = false;
        }
        
        // Check mock objects and test data availability
        try {
            const mockFunctionsAvailable = typeof createMockRequest === 'function' && 
                                          typeof createMockResponse === 'function';
            const testDataAvailable = helloGetRequest && validHeaders;
            
            validationResults.checks.mockObjects = {
                mockFunctionsAvailable: mockFunctionsAvailable,
                testDataAvailable: testDataAvailable,
                status: (mockFunctionsAvailable && testDataAvailable) ? 'valid' : 'error'
            };
            
            if (!mockFunctionsAvailable) {
                validationResults.issues.errors.push({
                    type: 'MOCK_OBJECTS_MISSING',
                    message: 'Mock object creation functions are not available',
                    educationalGuidance: 'Ensure http-mocks.js module is properly loaded and exported'
                });
                validationResults.isValid = false;
            }
            
            if (!testDataAvailable) {
                validationResults.issues.errors.push({
                    type: 'TEST_DATA_MISSING',
                    message: 'Test data fixtures are not available',
                    educationalGuidance: 'Ensure test-data.js module is properly loaded with required fixtures'
                });
                validationResults.isValid = false;
            }
            
        } catch (mockError) {
            validationResults.checks.mockObjects = {
                status: 'error',
                error: mockError.message
            };
            validationResults.issues.errors.push({
                type: 'MOCK_DATA_CHECK_FAILED',
                message: 'Failed to validate mock objects and test data',
                educationalGuidance: 'Check mock and test data module imports and exports'
            });
            validationResults.isValid = false;
        }
        
        // Validate educational features
        try {
            const educationalConfigAvailable = appConfig && appConfig.educational;
            const loggerAvailable = typeof logger === 'object' && typeof logger.info === 'function';
            
            validationResults.checks.educationalFeatures = {
                configAvailable: educationalConfigAvailable,
                loggerAvailable: loggerAvailable,
                performanceTracking: appConfig?.educational?.performance?.showTimingInfo,
                verboseLogging: appConfig?.educational?.logging?.verboseMode,
                status: (educationalConfigAvailable && loggerAvailable) ? 'valid' : 'warning'
            };
            
            if (!educationalConfigAvailable) {
                validationResults.issues.warnings.push({
                    type: 'EDUCATIONAL_CONFIG_MISSING',
                    message: 'Educational configuration is not available',
                    educationalGuidance: 'Some educational features may not function properly'
                });
            }
            
            if (!loggerAvailable) {
                validationResults.issues.warnings.push({
                    type: 'LOGGER_NOT_AVAILABLE',
                    message: 'Educational logger is not properly configured',
                    educationalGuidance: 'Test execution logging may be limited'
                });
            }
            
        } catch (educationalError) {
            validationResults.checks.educationalFeatures = {
                status: 'warning',
                error: educationalError.message
            };
            validationResults.issues.warnings.push({
                type: 'EDUCATIONAL_FEATURES_CHECK_FAILED',
                message: 'Failed to validate educational features',
                educationalGuidance: 'Educational features may have limited functionality'
            });
        }
        
        const validationDuration = validationTimer.end();
        validationResults.validationTime = validationDuration;
        
        // Generate validation summary
        const errorCount = validationResults.issues.errors.length;
        const warningCount = validationResults.issues.warnings.length;
        const recommendationCount = validationResults.issues.recommendations.length;
        
        if (validationResults.isValid) {
            logger.info(`${EDUCATIONAL_TEST_PREFIX} Test environment validation successful`, {
                validationTime: validationDuration,
                warningCount: warningCount,
                recommendationCount: recommendationCount,
                checks: validationResults.checks,
                educational: true,
                success: true
            });
        } else {
            logger.error(`${EDUCATIONAL_TEST_PREFIX} Test environment validation failed`, null, {
                validationTime: validationDuration,
                errorCount: errorCount,
                warningCount: warningCount,
                issues: validationResults.issues,
                educational: true,
                troubleshooting: 'Address validation errors before running tests'
            });
        }
        
        return validationResults;
        
    } catch (error) {
        validationTimer.end();
        logger.error(`${EDUCATIONAL_TEST_PREFIX} Environment validation error`, error, {
            troubleshooting: 'Check environment configuration and dependencies'
        });
        throw error;
    }
}

/**
 * Sets up comprehensive test environment with educational configuration, performance monitoring,
 * mock initialization, and resource management for tutorial application testing
 * 
 * Educational Note: Environment setup demonstrates proper test preparation and resource
 * management practices essential for reliable and educational testing
 * 
 * @param {object} setupOptions - Environment setup options including educational features and testing configuration
 * @returns {object} Setup results with initialized resources, configuration summary, and educational context
 */
function setupTestEnvironment(setupOptions = {}) {
    const setupTimer = logger.startTimer('test_environment_setup');
    
    try {
        logger.info(`${EDUCATIONAL_TEST_PREFIX} Setting up test environment`, {
            educational: true,
            operation: 'environment_setup',
            options: setupOptions
        });
        
        // Extract setup options with educational defaults
        const {
            enablePerformanceTracking = true,
            enableEducationalLogging = appConfig?.educational?.logging?.verboseMode,
            initializeMocks = true,
            validateEnvironment = true,
            clearRegistry = true
        } = setupOptions;
        
        const setupResults = {
            success: true,
            setupTime: null,
            initializedComponents: {
                performanceTracking: false,
                educationalLogging: false,
                mocks: false,
                serverRegistry: false
            },
            configuration: {
                testTimeout: TEST_TIMEOUT,
                performanceThresholds: PERFORMANCE_THRESHOLDS,
                educationalFeatures: {}
            },
            resources: {
                serverRegistry: TEST_SERVER_REGISTRY,
                mockRegistry: null
            },
            educational: {
                concept: 'Test environment setup prepares consistent testing conditions',
                setupAreas: [
                    'Performance monitoring configuration',
                    'Educational logging initialization',
                    'Mock object preparation',
                    'Resource registry management'
                ]
            }
        };
        
        // Validate environment if requested
        if (validateEnvironment) {
            try {
                const validationResults = validateTestEnvironment();
                if (!validationResults.isValid) {
                    setupResults.success = false;
                    setupResults.validationErrors = validationResults.issues.errors;
                    
                    logger.warn(`${EDUCATIONAL_TEST_PREFIX} Environment setup proceeding with validation warnings`, {
                        errorCount: validationResults.issues.errors.length,
                        educationalTip: 'Some features may not work optimally'
                    });
                }
                setupResults.environmentValidation = validationResults;
            } catch (validationError) {
                logger.warn(`${EDUCATIONAL_TEST_PREFIX} Environment validation failed during setup`, validationError);
            }
        }
        
        // Initialize performance monitoring
        if (enablePerformanceTracking) {
            try {
                // Configure performance monitoring
                setupResults.configuration.performanceThresholds = {
                    ...PERFORMANCE_THRESHOLDS,
                    ...setupOptions.customThresholds
                };
                
                setupResults.initializedComponents.performanceTracking = true;
                
                logger.debug(`${EDUCATIONAL_TEST_PREFIX} Performance tracking initialized`, {
                    thresholds: setupResults.configuration.performanceThresholds,
                    educational: true
                });
                
            } catch (performanceError) {
                logger.error(`${EDUCATIONAL_TEST_PREFIX} Failed to initialize performance tracking`, performanceError);
                setupResults.success = false;
            }
        }
        
        // Set up educational logging
        if (enableEducationalLogging) {
            try {
                setupResults.configuration.educationalFeatures = {
                    verboseLogging: true,
                    demonstratePatterns: appConfig?.educational?.logging?.demonstratePatterns,
                    showTimingInfo: appConfig?.educational?.performance?.showTimingInfo,
                    debuggingAssistance: true
                };
                
                setupResults.initializedComponents.educationalLogging = true;
                
                logger.info(`${EDUCATIONAL_TEST_PREFIX} Educational logging configured`, {
                    features: setupResults.configuration.educationalFeatures,
                    educational: true
                });
                
            } catch (loggingError) {
                logger.error(`${EDUCATIONAL_TEST_PREFIX} Failed to configure educational logging`, loggingError);
            }
        }
        
        // Initialize mock objects and reset state
        if (initializeMocks) {
            try {
                // Reset any existing mock calls from previous tests
                if (typeof resetMockCalls === 'function') {
                    resetMockCalls();
                }
                
                // Initialize mock registry for tracking
                setupResults.resources.mockRegistry = new Map();
                setupResults.initializedComponents.mocks = true;
                
                logger.debug(`${EDUCATIONAL_TEST_PREFIX} Mock objects initialized and reset`, {
                    mockFunctions: ['createMockRequest', 'createMockResponse', 'simulateRequest'],
                    educational: true
                });
                
            } catch (mockError) {
                logger.error(`${EDUCATIONAL_TEST_PREFIX} Failed to initialize mock objects`, mockError);
                setupResults.success = false;
            }
        }
        
        // Clear or initialize server registry
        if (clearRegistry) {
            try {
                TEST_SERVER_REGISTRY.clear();
                setupResults.initializedComponents.serverRegistry = true;
                
                logger.debug(`${EDUCATIONAL_TEST_PREFIX} Server registry cleared and ready`, {
                    registrySize: TEST_SERVER_REGISTRY.size,
                    educational: true
                });
                
            } catch (registryError) {
                logger.error(`${EDUCATIONAL_TEST_PREFIX} Failed to initialize server registry`, registryError);
            }
        }
        
        // Set Jest timeout if available
        try {
            if (typeof jest !== 'undefined' && jest.setTimeout) {
                jest.setTimeout(setupResults.configuration.testTimeout);
                logger.debug(`${EDUCATIONAL_TEST_PREFIX} Jest timeout configured`, {
                    timeout: setupResults.configuration.testTimeout
                });
            }
        } catch (jestError) {
            logger.warn(`${EDUCATIONAL_TEST_PREFIX} Failed to configure Jest timeout`, jestError);
        }
        
        const setupDuration = setupTimer.end();
        setupResults.setupTime = setupDuration;
        
        // Generate setup summary
        const initializedCount = Object.values(setupResults.initializedComponents).filter(Boolean).length;
        const totalComponents = Object.keys(setupResults.initializedComponents).length;
        
        logger.info(`${EDUCATIONAL_TEST_PREFIX} Test environment setup completed`, {
            success: setupResults.success,
            setupTime: setupDuration,
            componentsInitialized: `${initializedCount}/${totalComponents}`,
            initializedComponents: setupResults.initializedComponents,
            configuration: setupResults.configuration,
            educational: true
        });
        
        // Add educational guidance about setup results
        if (appConfig.educational?.logging?.demonstratePatterns) {
            logger.info(`${EDUCATIONAL_TEST_PREFIX} Environment setup educational summary`, {
                concept: 'Proper test setup ensures consistent and reliable test execution',
                benefits: [
                    'Performance monitoring tracks test execution efficiency',
                    'Educational logging provides learning context throughout tests',
                    'Mock objects enable isolated testing of components',
                    'Resource registry prevents memory leaks and cleanup issues'
                ],
                nextSteps: [
                    'Create test servers using createTestServer()',
                    'Use test scenarios with createTestScenario()',
                    'Monitor performance with measurePerformance()',
                    'Clean up with teardownTestEnvironment()'
                ]
            });
        }
        
        return setupResults;
        
    } catch (error) {
        setupTimer.end();
        logger.error(`${EDUCATIONAL_TEST_PREFIX} Test environment setup failed`, error, {
            troubleshooting: 'Check setup options and ensure all dependencies are available'
        });
        throw error;
    }
}

/**
 * Tears down test environment with comprehensive cleanup, resource management, performance
 * reporting, and educational summary for proper test suite completion
 * 
 * Educational Note: Environment teardown demonstrates proper resource cleanup and
 * summary reporting practices essential for reliable test suite management
 * 
 * @param {object} teardownOptions - Teardown options including cleanup preferences and educational reporting
 * @returns {void} No return value, performs comprehensive environment cleanup with educational logging
 */
function teardownTestEnvironment(teardownOptions = {}) {
    const teardownTimer = logger.startTimer('test_environment_teardown');
    
    try {
        logger.info(`${EDUCATIONAL_TEST_PREFIX} Starting test environment teardown`, {
            educational: true,
            operation: 'environment_teardown',
            options: teardownOptions
        });
        
        // Extract teardown options
        const {
            forceCleanup = false,
            generateReport = appConfig?.educational?.logging?.verboseMode,
            stopAllServers = true,
            resetMocks = true,
            clearRegistry = true
        } = teardownOptions;
        
        const teardownResults = {
            success: true,
            teardownTime: null,
            cleanupActions: {
                serversStpped: 0,
                mocksReset: false,
                registryCleared: false
            },
            performanceSummary: null,
            issues: []
        };
        
        // Stop all registered test servers
        if (stopAllServers && TEST_SERVER_REGISTRY.size > 0) {
            logger.info(`${EDUCATIONAL_TEST_PREFIX} Stopping ${TEST_SERVER_REGISTRY.size} test servers`, {
                serverCount: TEST_SERVER_REGISTRY.size,
                educational: true
            });
            
            const serverStopPromises = [];
            for (const [testId, serverInstance] of TEST_SERVER_REGISTRY.entries()) {
                try {
                    if (serverInstance.isRunning) {
                        const stopPromise = stopTestServer(serverInstance, 3000)
                            .then(() => {
                                teardownResults.cleanupActions.serversStpped++;
                                logger.debug(`${EDUCATIONAL_TEST_PREFIX} Server stopped during teardown`, {
                                    testId: testId
                                });
                            })
                            .catch((stopError) => {
                                teardownResults.issues.push({
                                    type: 'SERVER_STOP_ERROR',
                                    testId: testId,
                                    error: stopError.message
                                });
                                
                                if (forceCleanup) {
                                    logger.warn(`${EDUCATIONAL_TEST_PREFIX} Force closing server`, {
                                        testId: testId,
                                        error: stopError.message
                                    });
                                    try {
                                        serverInstance.server.close();
                                    } catch (forceError) {
                                        logger.error(`${EDUCATIONAL_TEST_PREFIX} Force close failed`, forceError);
                                    }
                                }
                            });
                        
                        serverStopPromises.push(stopPromise);
                    }
                } catch (stopError) {
                    teardownResults.issues.push({
                        type: 'SERVER_STOP_SETUP_ERROR',
                        testId: testId,
                        error: stopError.message
                    });
                }
            }
            
            // Wait for all servers to stop (with timeout)
            try {
                await Promise.allSettled(serverStopPromises);
            } catch (stopAllError) {
                logger.error(`${EDUCATIONAL_TEST_PREFIX} Error stopping servers during teardown`, stopAllError);
            }
        }
        
        // Reset mock objects
        if (resetMocks) {
            try {
                if (typeof resetMockCalls === 'function') {
                    resetMockCalls();
                    teardownResults.cleanupActions.mocksReset = true;
                    
                    logger.debug(`${EDUCATIONAL_TEST_PREFIX} Mock objects reset during teardown`, {
                        educational: true
                    });
                }
            } catch (mockResetError) {
                teardownResults.issues.push({
                    type: 'MOCK_RESET_ERROR',
                    error: mockResetError.message
                });
            }
        }
        
        // Clear server registry
        if (clearRegistry) {
            try {
                const registrySize = TEST_SERVER_REGISTRY.size;
                TEST_SERVER_REGISTRY.clear();
                teardownResults.cleanupActions.registryCleared = true;
                
                logger.debug(`${EDUCATIONAL_TEST_PREFIX} Server registry cleared`, {
                    clearedEntries: registrySize,
                    educational: true
                });
            } catch (registryError) {
                teardownResults.issues.push({
                    type: 'REGISTRY_CLEAR_ERROR',
                    error: registryError.message
                });
            }
        }
        
        const teardownDuration = teardownTimer.end();
        teardownResults.teardownTime = teardownDuration;
        
        // Generate performance and execution summary if requested
        if (generateReport) {
            try {
                teardownResults.performanceSummary = generateTestSummaryReport(teardownResults);
            } catch (reportError) {
                logger.warn(`${EDUCATIONAL_TEST_PREFIX} Failed to generate teardown report`, reportError);
            }
        }
        
        // Determine overall teardown success
        teardownResults.success = teardownResults.issues.length === 0;
        
        // Log teardown completion
        if (teardownResults.success) {
            logger.info(`${EDUCATIONAL_TEST_PREFIX} Test environment teardown completed successfully`, {
                teardownTime: teardownDuration,
                cleanupActions: teardownResults.cleanupActions,
                educational: true,
                success: true
            });
        } else {
            logger.warn(`${EDUCATIONAL_TEST_PREFIX} Test environment teardown completed with issues`, {
                teardownTime: teardownDuration,
                issueCount: teardownResults.issues.length,
                issues: teardownResults.issues,
                cleanupActions: teardownResults.cleanupActions,
                educational: true
            });
        }
        
        // Add educational context about teardown importance
        if (appConfig.educational?.logging?.demonstratePatterns) {
            logger.info(`${EDUCATIONAL_TEST_PREFIX} Teardown educational summary`, {
                concept: 'Proper test teardown prevents resource leaks and ensures clean test environment',
                importance: [
                    'Prevents memory leaks from unclosed servers',
                    'Resets mock state for consistent testing',
                    'Provides summary of test execution',
                    'Ensures reliable subsequent test runs'
                ],
                bestPractices: [
                    'Always stop test servers after testing',
                    'Reset mocks between test suites',
                    'Monitor resource usage during testing',
                    'Generate reports for performance analysis'
                ]
            });
        }
        
    } catch (error) {
        teardownTimer.end();
        logger.error(`${EDUCATIONAL_TEST_PREFIX} Test environment teardown failed`, error, {
            troubleshooting: 'Manual cleanup may be required to prevent resource leaks'
        });
        throw error;
    }
}

// =============================================================================
// EDUCATIONAL INSIGHTS AND REPORTING
// =============================================================================

/**
 * Generates educational insights from test execution including performance analysis,
 * error patterns, and learning recommendations for enhanced tutorial experience
 * 
 * Educational Note: Insight generation demonstrates test analysis and learning
 * extraction patterns that help students understand testing results and improve
 * 
 * @param {object} testResults - Test execution results for educational analysis
 * @param {object} options - Options for insight generation including educational context and analysis depth
 * @returns {object} Educational insights with performance analysis, learning recommendations, and troubleshooting guidance
 */
function getEducationalInsights(testResults, options = {}) {
    const insightsTimer = logger.startTimer('educational_insights_generation');
    
    try {
        logger.info(`${EDUCATIONAL_TEST_PREFIX} Generating educational insights`, {
            educational: true,
            operation: 'insights_generation'
        });
        
        // Extract options for insight generation
        const {
            analyzePerformance = true,
            includeRecommendations = true,
            provideTroubleshooting = true,
            detailLevel = 'comprehensive'
        } = options;
        
        const insights = {
            summary: {
                testExecutionTime: Date.now(),
                analysisDepth: detailLevel,
                insightCategories: []
            },
            performance: {
                analysis: null,
                trends: [],
                recommendations: []
            },
            patterns: {
                successPatterns: [],
                errorPatterns: [],
                learningOpportunities: []
            },
            recommendations: {
                immediate: [],
                longTerm: [],
                learningPath: []
            },
            troubleshooting: {
                commonIssues: [],
                solutions: [],
                preventionTips: []
            },
            educational: {
                conceptsReinforced: [],
                skillsDemonstrated: [],
                nextLearningSteps: []
            }
        };
        
        // Analyze performance data if available
        if (analyzePerformance && testResults.performance) {
            insights.summary.insightCategories.push('performance');
            
            // Analyze timing patterns
            const performanceAnalysis = {
                averageResponseTime: testResults.performance.averageResponseTime || 0,
                performanceLevel: 'unknown',
                thresholdComparison: {},
                improvementAreas: []
            };
            
            // Compare against thresholds
            if (performanceAnalysis.averageResponseTime <= PERFORMANCE_THRESHOLDS.response) {
                performanceAnalysis.performanceLevel = 'excellent';
                insights.patterns.successPatterns.push({
                    pattern: 'FAST_RESPONSE_TIME',
                    description: 'Server responses consistently meet performance targets',
                    educationalValue: 'Demonstrates efficient HTTP server implementation'
                });
            } else if (performanceAnalysis.averageResponseTime <= PERFORMANCE_THRESHOLDS.response * 2) {
                performanceAnalysis.performanceLevel = 'acceptable';
                performanceAnalysis.improvementAreas.push('Response time optimization');
            } else {
                performanceAnalysis.performanceLevel = 'needs_improvement';
                performanceAnalysis.improvementAreas.push('Significant response time optimization needed');
                
                insights.patterns.errorPatterns.push({
                    pattern: 'SLOW_RESPONSE_TIME',
                    description: 'Server responses exceed acceptable performance thresholds',
                    educationalImpact: 'Demonstrates importance of performance optimization'
                });
            }
            
            insights.performance.analysis = performanceAnalysis;
            
            // Generate performance recommendations
            if (performanceAnalysis.improvementAreas.length > 0) {
                insights.performance.recommendations.push({
                    category: 'PERFORMANCE_OPTIMIZATION',
                    priority: 'HIGH',
                    description: 'Optimize server response time for better user experience',
                    actionItems: [
                        'Profile response generation code',
                        'Check for blocking operations in request handling',
                        'Consider caching strategies for static responses'
                    ],
                    educationalContext: 'Performance optimization is crucial for production applications'
                });
            }
        }
        
        // Identify learning patterns and opportunities
        if (testResults.scenarios) {
            insights.summary.insightCategories.push('scenarios');
            
            // Analyze scenario success rates
            const scenarioAnalysis = testResults.scenarios.reduce((analysis, scenario) => {
                if (scenario.success) {
                    analysis.successful++;
                    insights.patterns.successPatterns.push({
                        pattern: 'SCENARIO_SUCCESS',
                        scenario: scenario.name,
                        description: `Test scenario '${scenario.name}' executed successfully`,
                        learningReinforced: 'HTTP request-response cycle understanding'
                    });
                } else {
                    analysis.failed++;
                    insights.patterns.errorPatterns.push({
                        pattern: 'SCENARIO_FAILURE',
                        scenario: scenario.name,
                        description: `Test scenario '${scenario.name}' failed execution`,
                        learningOpportunity: 'Understand error conditions and debugging'
                    });
                }
                return analysis;
            }, { successful: 0, failed: 0, total: testResults.scenarios.length });
            
            insights.patterns.scenarioAnalysis = scenarioAnalysis;
        }
        
        // Generate immediate recommendations
        if (includeRecommendations) {
            insights.summary.insightCategories.push('recommendations');
            
            // Performance recommendations
            insights.recommendations.immediate.push({
                category: 'TESTING_PRACTICE',
                title: 'Continue Regular Testing',
                description: 'Maintain consistent testing practices to ensure code quality',
                educationalValue: 'Regular testing builds confidence and catches issues early'
            });
            
            // Learning path recommendations
            insights.recommendations.learningPath.push({
                level: 'BEGINNER',
                topic: 'HTTP Protocol Deep Dive',
                description: 'Learn more about HTTP status codes, headers, and request methods',
                resources: [
                    'Study HTTP/1.1 specification concepts',
                    'Practice with different HTTP methods beyond GET',
                    'Explore HTTP header usage and importance'
                ]
            });
            
            insights.recommendations.learningPath.push({
                level: 'INTERMEDIATE',
                topic: 'Advanced Testing Techniques',
                description: 'Explore more sophisticated testing patterns and practices',
                resources: [
                    'Learn about test-driven development (TDD)',
                    'Study integration testing strategies',
                    'Practice performance testing and optimization'
                ]
            });
        }
        
        // Generate troubleshooting guidance
        if (provideTroubleshooting) {
            insights.summary.insightCategories.push('troubleshooting');
            
            insights.troubleshooting.commonIssues.push({
                issue: 'Server Not Starting',
                symptoms: ['Port already in use errors', 'Server fails to bind to port'],
                solutions: [
                    'Use ephemeral ports (port 0) for testing',
                    'Check for other processes using the same port',
                    'Ensure proper server configuration'
                ],
                prevention: 'Always stop test servers after testing to free up ports'
            });
            
            insights.troubleshooting.commonIssues.push({
                issue: 'Slow Test Execution',
                symptoms: ['Tests take longer than expected', 'Timeout errors'],
                solutions: [
                    'Check server performance and response times',
                    'Increase test timeouts if necessary',
                    'Optimize server code for better performance'
                ],
                prevention: 'Monitor performance metrics and set appropriate expectations'
            });
        }
        
        // Generate educational context
        insights.educational.conceptsReinforced = [
            'HTTP client-server communication patterns',
            'Request-response cycle understanding',
            'Performance measurement and analysis',
            'Testing best practices and patterns'
        ];
        
        insights.educational.skillsDemonstrated = [
            'Server lifecycle management',
            'HTTP request testing techniques',
            'Performance monitoring and analysis',
            'Systematic debugging approaches'
        ];
        
        insights.educational.nextLearningSteps = [
            'Explore error handling in HTTP servers',
            'Learn about middleware and request processing',
            'Study database integration with HTTP servers',
            'Practice with production deployment considerations'
        ];
        
        const insightsDuration = insightsTimer.end();
        insights.summary.generationTime = insightsDuration;
        
        logger.info(`${EDUCATIONAL_TEST_PREFIX} Educational insights generated`, {
            generationTime: insightsDuration,
            insightCategories: insights.summary.insightCategories,
            recommendationCount: insights.recommendations.immediate.length,
            troubleshootingTopics: insights.troubleshooting.commonIssues.length,
            educational: true
        });
        
        // Log key insights if verbose mode enabled
        if (appConfig.educational?.logging?.verboseMode) {
            logger.info(`${EDUCATIONAL_TEST_PREFIX} Key educational insights`, {
                performanceLevel: insights.performance.analysis?.performanceLevel,
                successPatterns: insights.patterns.successPatterns.length,
                learningOpportunities: insights.patterns.learningOpportunities.length,
                nextSteps: insights.educational.nextLearningSteps,
                educational: true
            });
        }
        
        return insights;
        
    } catch (error) {
        insightsTimer.end();
        logger.error(`${EDUCATIONAL_TEST_PREFIX} Failed to generate educational insights`, error, {
            troubleshooting: 'Check test results structure and insight generation parameters'
        });
        throw error;
    }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Executes a test scenario with performance monitoring and educational logging
 * 
 * @param {object} scenario - Test scenario to execute
 * @param {object} serverInstance - Server instance for testing
 * @returns {Promise} Promise resolving to scenario execution results
 */
async function executeTestScenario(scenario, serverInstance) {
    try {
        logger.info(`${EDUCATIONAL_TEST_PREFIX} Executing test scenario: ${scenario.name}`, {
            scenarioId: scenario.id,
            educational: true
        });
        
        const executionStart = Date.now();
        
        // Make test request
        const response = await makeTestRequest(scenario.getRequestUrl(), {
            method: scenario.request.method,
            headers: scenario.request.headers,
            timeout: scenario.lifecycle.timeout
        });
        
        // Validate response
        const validationResult = scenario.validate(response);
        
        const executionTime = Date.now() - executionStart;
        
        const result = {
            scenario: scenario.name,
            success: validationResult.success,
            executionTime: executionTime,
            response: response,
            validation: validationResult,
            educational: scenario.educational
        };
        
        logger.info(`${EDUCATIONAL_TEST_PREFIX} Scenario execution completed`, {
            scenario: scenario.name,
            success: result.success,
            executionTime: executionTime,
            educational: true
        });
        
        return result;
        
    } catch (error) {
        logger.error(`${EDUCATIONAL_TEST_PREFIX} Scenario execution failed`, error, {
            scenario: scenario.name
        });
        throw error;
    }
}

/**
 * Validates scenario response against expected criteria
 * 
 * @param {object} scenario - Test scenario with validation rules
 * @param {object} actualResponse - Actual response to validate
 * @returns {object} Validation results
 */
function validateScenarioResponse(scenario, actualResponse) {
    try {
        const validation = {
            success: true,
            errors: [],
            warnings: []
        };
        
        // Status code validation
        if (actualResponse.statusCode !== scenario.expectedResponse.statusCode) {
            validation.success = false;
            validation.errors.push({
                type: 'STATUS_MISMATCH',
                expected: scenario.expectedResponse.statusCode,
                actual: actualResponse.statusCode
            });
        }
        
        // Body validation if required
        if (scenario.validation.includeBody && scenario.expectedResponse.body) {
            if (!actualResponse.body || !actualResponse.body.includes(scenario.expectedResponse.body)) {
                validation.success = false;
                validation.errors.push({
                    type: 'BODY_MISMATCH',
                    expected: scenario.expectedResponse.body,
                    actual: actualResponse.body
                });
            }
        }
        
        // Performance validation
        if (scenario.validation.validatePerformance) {
            if (actualResponse.performance.requestTime > scenario.performance.maxResponseTime) {
                validation.warnings.push({
                    type: 'SLOW_RESPONSE',
                    time: actualResponse.performance.requestTime,
                    threshold: scenario.performance.maxResponseTime
                });
            }
        }
        
        return validation;
        
    } catch (error) {
        return {
            success: false,
            errors: [{ type: 'VALIDATION_ERROR', message: error.message }],
            warnings: []
        };
    }
}

/**
 * Analyzes performance against thresholds and provides educational insights
 * 
 * @param {object} statistics - Performance statistics
 * @param {object} thresholds - Performance thresholds
 * @param {string} operationName - Name of operation being analyzed
 * @returns {object} Threshold analysis results
 */
function analyzePerformanceThresholds(statistics, thresholds, operationName) {
    try {
        const analysis = {
            overall: 'unknown',
            details: {},
            recommendations: []
        };
        
        // Analyze average performance
        if (statistics.average <= thresholds.response) {
            analysis.overall = 'excellent';
            analysis.details.averagePerformance = 'within_target';
        } else if (statistics.average <= thresholds.response * 2) {
            analysis.overall = 'acceptable';
            analysis.details.averagePerformance = 'slightly_slow';
            analysis.recommendations.push('Consider optimizing for better performance');
        } else {
            analysis.overall = 'needs_improvement';
            analysis.details.averagePerformance = 'slow';
            analysis.recommendations.push('Performance optimization is highly recommended');
        }
        
        // Analyze consistency (difference between min and max)
        const performanceVariation = statistics.max - statistics.min;
        if (performanceVariation < thresholds.response * 0.5) {
            analysis.details.consistency = 'consistent';
        } else {
            analysis.details.consistency = 'variable';
            analysis.recommendations.push('Investigate performance variability');
        }
        
        return analysis;
        
    } catch (error) {
        logger.error('Failed to analyze performance thresholds', error);
        return { overall: 'analysis_failed', error: error.message };
    }
}

/**
 * Generates body content diff for educational assertion failures
 * 
 * @param {string} expected - Expected body content
 * @param {string} actual - Actual body content
 * @returns {object} Diff information
 */
function generateBodyDiff(expected, actual) {
    try {
        return {
            expected: expected,
            actual: actual,
            lengthDiff: actual.length - expected.length,
            hasContent: actual.length > 0,
            isEmpty: actual.length === 0,
            containsExpected: actual.includes(expected)
        };
    } catch (error) {
        return { error: 'Failed to generate diff' };
    }
}

/**
 * Provides educational guidance for HTTP status code mismatches
 * 
 * @param {number} expected - Expected status code
 * @param {number} actual - Actual status code
 * @returns {string} Educational guidance
 */
function getStatusCodeGuidance(expected, actual) {
    const statusGuide = {
        200: 'Success - Request processed successfully',
        404: 'Not Found - Resource does not exist',
        405: 'Method Not Allowed - HTTP method not supported',
        500: 'Internal Server Error - Server encountered an error'
    };
    
    const expectedGuide = statusGuide[expected] || `HTTP ${expected}`;
    const actualGuide = statusGuide[actual] || `HTTP ${actual}`;
    
    return `Expected ${expectedGuide}, but got ${actualGuide}. Check request path and server logic.`;
}

/**
 * Generates troubleshooting guidance for assertion failures
 * 
 * @param {Array} errors - Array of assertion errors
 * @returns {Array} Troubleshooting suggestions
 */
function generateAssertionTroubleshooting(errors) {
    const troubleshooting = [];
    
    for (const error of errors) {
        switch (error.type) {
            case 'STATUS_CODE_MISMATCH':
                troubleshooting.push('Check server route handling and response generation');
                break;
            case 'HEADER_MISMATCH':
                troubleshooting.push('Verify response header setting in server code');
                break;
            case 'BODY_MISMATCH':
                troubleshooting.push('Check response content generation logic');
                break;
            default:
                troubleshooting.push('Review test expectations and server implementation');
        }
    }
    
    return troubleshooting;
}

/**
 * Generates performance insights for educational purposes
 * 
 * @param {object} performanceResults - Performance measurement results
 * @param {string} operationName - Name of operation measured
 * @returns {void} Logs educational performance insights
 */
function generatePerformanceInsights(performanceResults, operationName) {
    try {
        const insights = {
            operation: operationName,
            performance: performanceResults.statistics.average,
            consistency: performanceResults.statistics.max - performanceResults.statistics.min,
            recommendations: []
        };
        
        if (insights.performance < PERFORMANCE_THRESHOLDS.response) {
            insights.recommendations.push('Excellent performance - maintain current optimization level');
        } else {
            insights.recommendations.push('Consider performance optimization techniques');
        }
        
        if (insights.consistency > PERFORMANCE_THRESHOLDS.response * 0.5) {
            insights.recommendations.push('Investigate performance variability sources');
        }
        
        logger.info(`${EDUCATIONAL_TEST_PREFIX} Performance insights for ${operationName}`, {
            insights: insights,
            educational: true
        });
        
    } catch (error) {
        logger.warn('Failed to generate performance insights', error);
    }
}

/**
 * Generates comprehensive test summary report
 * 
 * @param {object} teardownResults - Teardown results for reporting
 * @returns {object} Summary report
 */
function generateTestSummaryReport(teardownResults) {
    try {
        return {
            executionTime: teardownResults.teardownTime,
            resourcesManaged: {
                servers: teardownResults.cleanupActions.serversStpped,
                mocksReset: teardownResults.cleanupActions.mocksReset,
                registryCleared: teardownResults.cleanupActions.registryCleared
            },
            issues: teardownResults.issues,
            success: teardownResults.success,
            educational: {
                concept: 'Test execution summary provides overview of testing session',
                learningValue: 'Understanding test lifecycle and resource management'
            }
        };
    } catch (error) {
        logger.warn('Failed to generate test summary report', error);
        return { error: 'Report generation failed' };
    }
}

// =============================================================================
// MODULE EXPORTS
// =============================================================================

/**
 * Export comprehensive test helper utilities with educational features and professional patterns.
 * These exports provide complete testing infrastructure for the Node.js tutorial application
 * including server lifecycle management, HTTP testing, performance measurement, and educational insights.
 */
module.exports = {
    // Server lifecycle testing utilities
    createTestServer,              // Factory function for creating test HTTP server instances with educational configuration
    startTestServer,              // Utility function for starting test servers with performance measurement and logging
    stopTestServer,               // Utility function for gracefully stopping test servers with cleanup and metrics
    
    // HTTP request-response testing utilities
    makeTestRequest,              // HTTP request utility for testing server endpoints with performance measurement
    
    // Educational assertion helpers
    assertResponseEquals,         // Educational assertion helper for comparing HTTP responses with detailed validation
    
    // Performance measurement utilities
    measurePerformance,           // Performance measurement utility with educational benchmarks and threshold validation
    
    // Environment and scenario management utilities
    waitForServer,                // Server readiness utility for reliable test setup with timeout management
    createTestScenario,           // Factory function for creating comprehensive test scenarios with educational context
    validateTestEnvironment,      // Environment validation utility for ensuring proper test setup with guidance
    setupTestEnvironment,         // Environment setup utility for initializing comprehensive test environment
    teardownTestEnvironment,      // Environment cleanup utility for proper test suite completion with reporting
    
    // Educational insights and analysis utilities
    getEducationalInsights,       // Educational analysis utility for generating learning insights from test execution
    
    // Configuration constants and settings
    TEST_HELPERS: {
        PERFORMANCE_THRESHOLDS,   // Performance benchmark constants for educational validation
        EDUCATIONAL_SETTINGS: {   // Educational configuration settings for test helper features
            enableVerboseLogging: appConfig?.educational?.logging?.verboseMode,
            showPerformanceTiming: appConfig?.educational?.performance?.showTimingInfo,
            includeTroubleshooting: appConfig?.educational?.errors?.includeTroubleshootingTips,
            demonstratePatterns: appConfig?.educational?.logging?.demonstratePatterns
        },
        DEFAULT_TEST_OPTIONS: {   // Default options for test helper functions
            timeout: TEST_TIMEOUT,
            measurePerformance: true,
            includeEducationalContext: true,
            validateResponses: true,
            enableCleanup: true
        }
    }
};