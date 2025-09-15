/**
 * Health Check Script for Node.js Tutorial HTTP Server Application
 * 
 * This script performs comprehensive server availability validation by testing server connectivity,
 * endpoint responsiveness, and proper HTTP response generation. It validates the '/hello' endpoint
 * and verifies expected responses, providing educational demonstration of health monitoring practices
 * and server validation techniques.
 * 
 * Educational Features:
 * - Demonstrates professional health check implementation patterns
 * - Shows HTTP client usage for server connectivity validation  
 * - Illustrates performance monitoring with response time measurement
 * - Provides comprehensive error handling and troubleshooting guidance
 * - Demonstrates systematic response validation and criteria checking
 * - Shows structured logging for monitoring and debugging assistance
 * - Implements command line processing with help system
 * - Demonstrates appropriate exit code usage for script automation
 * 
 * Integration Points:
 * - Uses server-config.js for consistent server connection details
 * - Uses http-status-codes.js for standardized status code checking
 * - Uses response-messages.js for expected content validation
 * - Uses logger.js for consistent educational logging output
 * - Supports testing framework integration for automated health checks
 * - Provides structured output for external monitoring integration
 * - Supports continuous integration with appropriate exit codes
 */

// Node.js built-in modules for HTTP client functionality and process management
const http = require('node:http'); // Node.js Built-in
const process = require('node:process'); // Node.js Built-in

// Internal imports for server configuration and health check validation
const { getServerPort, getServerHostname } = require('../lib/config/server-config.js');
const { HTTP_STATUS } = require('../lib/constants/http-status-codes.js');
const { SUCCESS_MESSAGES } = require('../lib/constants/response-messages.js');
const { logger } = require('../lib/utils/logger.js');

// =============================================================================
// GLOBAL CONSTANTS AND CONFIGURATION
// =============================================================================

/**
 * Default timeout for health check requests in milliseconds
 * Educational Note: 5-second timeout provides reasonable time for server response
 * while preventing indefinite hanging in automated environments
 */
const HEALTH_CHECK_TIMEOUT = 5000;

/**
 * Default endpoint path for health check validation
 * Educational Note: '/hello' endpoint validates core tutorial functionality
 * as specified in F-002 feature requirements
 */
const HEALTH_CHECK_ENDPOINT = '/hello';

/**
 * Success exit code for successful health check completion
 * Educational Note: Exit code 0 indicates successful operation in Unix conventions
 */
const EXIT_CODE_SUCCESS = 0;

/**
 * Failure exit code for health check validation failures
 * Educational Note: Exit code 1 indicates general failure in automation scripts
 */
const EXIT_CODE_FAILURE = 1;

/**
 * Configuration error exit code for invalid command line options
 * Educational Note: Exit code 2 indicates configuration or usage errors
 */
const EXIT_CODE_CONFIG_ERROR = 2;

/**
 * Connection error exit code for network connectivity issues
 * Educational Note: Exit code 3 indicates network or connection problems
 */
const EXIT_CODE_CONNECTION_ERROR = 3;

/**
 * Health check configuration constants exported for external usage and testing
 * Educational Note: Centralizing configuration enables consistent health check behavior
 */
const HEALTH_CHECK_CONFIG = {
    timeout: HEALTH_CHECK_TIMEOUT,
    endpoint: HEALTH_CHECK_ENDPOINT,
    expectedStatus: HTTP_STATUS.OK,
    expectedContent: SUCCESS_MESSAGES.HELLO_WORLD,
    expectedContentType: 'text/plain',
    performanceThreshold: 100 // Response time threshold in milliseconds
};

// =============================================================================
// CORE HEALTH CHECK FUNCTIONS
// =============================================================================

/**
 * Main health check function that performs comprehensive server validation including
 * connectivity, response time, status code verification, and content validation
 * for educational monitoring demonstration
 * 
 * Educational Note: This function orchestrates the complete health check process,
 * demonstrating systematic approach to server validation and monitoring practices
 * 
 * @param {object} options - Optional health check configuration including timeout, endpoint, and validation criteria
 * @returns {Promise<object>} Health check results object containing status, timing, validation results, and educational context
 */
async function performHealthCheck(options = {}) {
    // Start performance timing for health check duration measurement
    const healthCheckStartTime = Date.now();
    
    // Extract server configuration for health check URL construction
    const serverPort = getServerPort();
    const serverHostname = getServerHostname();
    const endpoint = options.endpoint || HEALTH_CHECK_ENDPOINT;
    const timeout = options.timeout || HEALTH_CHECK_TIMEOUT;
    
    // Construct complete health check URL using server configuration
    const healthCheckUrl = `http://${serverHostname}:${serverPort}${endpoint}`;
    
    // Initialize health check results object with educational context
    const healthCheckResults = {
        timestamp: new Date().toISOString(),
        serverConfig: {
            hostname: serverHostname,
            port: serverPort,
            endpoint: endpoint
        },
        url: healthCheckUrl,
        timeout: timeout,
        success: false,
        statusCode: null,
        responseTime: null,
        responseContent: null,
        validationResults: {},
        educationalContext: {
            purpose: 'Validates Node.js tutorial HTTP server functionality',
            features: ['Server connectivity', 'Endpoint responsiveness', 'Response validation'],
            learningObjectives: 'Demonstrates professional health monitoring practices'
        }
    };
    
    try {
        // Log health check initiation with educational context
        logger.info('🏥 Starting comprehensive health check validation', {
            url: healthCheckUrl,
            timeout: timeout,
            expectedResponse: SUCCESS_MESSAGES.HELLO_WORLD,
            educationalNote: 'Health check validates F-002 Hello Endpoint Implementation'
        });
        
        // Make HTTP request to server health check endpoint with timeout handling
        const response = await makeHealthCheckRequest(healthCheckUrl, timeout);
        
        // Calculate total health check processing time
        const healthCheckDuration = Date.now() - healthCheckStartTime;
        
        // Update results with response information
        healthCheckResults.statusCode = response.statusCode;
        healthCheckResults.responseTime = response.duration;
        healthCheckResults.responseContent = response.body;
        healthCheckResults.totalDuration = healthCheckDuration;
        
        // Define expected criteria for response validation
        const expectedCriteria = {
            statusCode: HTTP_STATUS.OK,
            contentType: 'text/plain',
            responseContent: SUCCESS_MESSAGES.HELLO_WORLD,
            performanceThreshold: HEALTH_CHECK_CONFIG.performanceThreshold
        };
        
        // Validate health check response against expected criteria
        const validationResults = validateHealthCheckResponse(response, expectedCriteria);
        healthCheckResults.validationResults = validationResults;
        
        // Determine overall health check success based on validation results
        healthCheckResults.success = validationResults.overallStatus === 'PASS';
        
        // Add educational performance analysis
        if (response.duration <= 50) {
            healthCheckResults.performanceLevel = 'Excellent';
            healthCheckResults.performanceNote = 'Sub-50ms response time indicates optimal server performance';
        } else if (response.duration <= 100) {
            healthCheckResults.performanceLevel = 'Good';
            healthCheckResults.performanceNote = 'Response time within acceptable tutorial performance threshold';
        } else {
            healthCheckResults.performanceLevel = 'Needs Improvement';
            healthCheckResults.performanceNote = 'Response time exceeds optimal threshold, consider server optimization';
        }
        
        // Log comprehensive health check completion with educational context
        logger.info('✅ Health check validation completed', {
            success: healthCheckResults.success,
            statusCode: healthCheckResults.statusCode,
            responseTime: `${response.duration}ms`,
            performanceLevel: healthCheckResults.performanceLevel,
            validationsPassed: validationResults.passedValidations,
            validationsFailed: validationResults.failedValidations
        });
        
        return healthCheckResults;
        
    } catch (error) {
        // Handle health check errors with educational context
        const healthCheckDuration = Date.now() - healthCheckStartTime;
        healthCheckResults.totalDuration = healthCheckDuration;
        healthCheckResults.error = {
            message: error.message,
            code: error.code || 'UNKNOWN_ERROR',
            category: categorizeHealthCheckError(error)
        };
        
        // Add troubleshooting guidance based on error type
        healthCheckResults.troubleshooting = getTroubleshootingGuidance(error);
        
        // Log error with educational troubleshooting guidance
        logger.error('❌ Health check validation failed', error, {
            duration: healthCheckDuration,
            troubleshooting: healthCheckResults.troubleshooting,
            educationalNote: 'Health check failures indicate server availability issues'
        });
        
        return healthCheckResults;
    }
}

/**
 * Makes HTTP request to the server health check endpoint with timeout handling,
 * error management, and educational logging for server connectivity validation
 * 
 * Educational Note: This function demonstrates proper HTTP client usage for server
 * connectivity testing and implements best practices for timeout handling and error management
 * 
 * @param {string} url - Complete URL for health check endpoint request
 * @param {number} timeout - Request timeout in milliseconds for health check validation
 * @returns {Promise<object>} HTTP response object with status, headers, body, and timing information
 */
function makeHealthCheckRequest(url, timeout) {
    return new Promise((resolve, reject) => {
        // Parse URL components for HTTP request configuration
        const urlParts = new URL(url);
        const requestOptions = {
            hostname: urlParts.hostname,
            port: urlParts.port,
            path: urlParts.pathname,
            method: 'GET',
            headers: {
                'User-Agent': 'Node.js-Tutorial-Health-Check/1.0.0',
                'Accept': 'text/plain',
                'Connection': 'close'
            }
        };
        
        // Initialize request timing measurement for performance validation
        const requestStartTime = Date.now();
        
        // Create HTTP request with educational logging context
        logger.debug('📡 Making HTTP request for health check validation', {
            hostname: requestOptions.hostname,
            port: requestOptions.port,
            path: requestOptions.path,
            method: requestOptions.method,
            timeout: timeout,
            educationalNote: 'HTTP client demonstrates server connectivity testing'
        });
        
        const request = http.request(requestOptions, (response) => {
            let responseBody = '';
            
            // Collect response data including status code, headers, and body content
            response.on('data', (chunk) => {
                responseBody += chunk;
            });
            
            response.on('end', () => {
                // Calculate request duration for performance validation
                const requestDuration = Date.now() - requestStartTime;
                
                // Build complete response object with educational timing context
                const responseObject = {
                    statusCode: response.statusCode,
                    headers: response.headers,
                    body: responseBody.trim(),
                    duration: requestDuration,
                    contentType: response.headers['content-type'] || 'unknown',
                    contentLength: response.headers['content-length'] || responseBody.length
                };
                
                logger.debug('📬 HTTP response received', {
                    statusCode: responseObject.statusCode,
                    duration: `${requestDuration}ms`,
                    bodyLength: responseBody.length,
                    contentType: responseObject.contentType,
                    educationalNote: 'Response data enables validation of server functionality'
                });
                
                resolve(responseObject);
            });
        });
        
        // Set up request timeout handling with educational error messaging
        request.setTimeout(timeout, () => {
            request.destroy();
            const timeoutError = new Error(`Health check request timed out after ${timeout}ms`);
            timeoutError.code = 'TIMEOUT';
            timeoutError.educationalGuidance = 'Server may be overloaded or unresponsive - check server logs';
            reject(timeoutError);
        });
        
        // Handle connection errors with educational troubleshooting guidance
        request.on('error', (error) => {
            const requestDuration = Date.now() - requestStartTime;
            error.duration = requestDuration;
            
            // Add educational context to connection errors
            if (error.code === 'ECONNREFUSED') {
                error.educationalGuidance = 'Server is not running - start server with "node server.js"';
            } else if (error.code === 'ENOTFOUND') {
                error.educationalGuidance = 'Hostname resolution failed - check server configuration';
            } else {
                error.educationalGuidance = 'Network connectivity issue - verify server is accessible';
            }
            
            logger.debug('🔌 HTTP request error occurred', {
                errorCode: error.code,
                errorMessage: error.message,
                duration: requestDuration,
                troubleshooting: error.educationalGuidance
            });
            
            reject(error);
        });
        
        // Send the HTTP request to server endpoint
        request.end();
    });
}

/**
 * Validates health check response against expected criteria including status code,
 * content, headers, and performance requirements with educational validation reporting
 * 
 * Educational Note: This function demonstrates systematic response validation techniques
 * and provides detailed feedback for each validation criterion with educational context
 * 
 * @param {object} response - HTTP response object from health check request
 * @param {object} expectedCriteria - Expected response validation criteria and thresholds
 * @returns {object} Validation results object with pass/fail status, detailed results, and educational guidance
 */
function validateHealthCheckResponse(response, expectedCriteria) {
    // Initialize validation results tracking with educational context
    const validationResults = {
        timestamp: new Date().toISOString(),
        overallStatus: 'PASS',
        passedValidations: 0,
        failedValidations: 0,
        totalValidations: 0,
        detailedResults: {},
        educationalSummary: []
    };
    
    // Define validation test cases with educational descriptions
    const validationTests = [
        {
            name: 'statusCode',
            description: 'HTTP status code validation for successful response',
            test: () => response.statusCode === expectedCriteria.statusCode,
            expected: expectedCriteria.statusCode,
            actual: response.statusCode,
            educationalNote: 'HTTP 200 OK indicates successful request processing per HTTP/1.1 standards'
        },
        {
            name: 'responseContent',
            description: 'Response body content validation for expected message',
            test: () => response.body === expectedCriteria.responseContent,
            expected: expectedCriteria.responseContent,
            actual: response.body,
            educationalNote: 'Response content validates F-002 Hello Endpoint Implementation requirement'
        },
        {
            name: 'contentType',
            description: 'Content-Type header validation for proper MIME type specification',
            test: () => response.contentType && response.contentType.includes('text/plain'),
            expected: 'text/plain',
            actual: response.contentType,
            educationalNote: 'Content-Type header enables proper client content processing'
        },
        {
            name: 'responseTime',
            description: 'Response time performance validation against threshold',
            test: () => response.duration <= expectedCriteria.performanceThreshold,
            expected: `<= ${expectedCriteria.performanceThreshold}ms`,
            actual: `${response.duration}ms`,
            educationalNote: 'Response time validation ensures server performance meets tutorial standards'
        },
        {
            name: 'contentLength',
            description: 'Response content length validation for non-empty response',
            test: () => response.body && response.body.length > 0,
            expected: 'Non-empty response',
            actual: `${response.body ? response.body.length : 0} characters`,
            educationalNote: 'Content length validation ensures server provides meaningful response'
        }
    ];
    
    // Execute each validation test with detailed result tracking
    validationTests.forEach((test) => {
        validationResults.totalValidations++;
        const testResult = test.test();
        
        validationResults.detailedResults[test.name] = {
            status: testResult ? 'PASS' : 'FAIL',
            description: test.description,
            expected: test.expected,
            actual: test.actual,
            educationalNote: test.educationalNote
        };
        
        if (testResult) {
            validationResults.passedValidations++;
            validationResults.educationalSummary.push(`✅ ${test.name}: ${test.description} - PASSED`);
        } else {
            validationResults.failedValidations++;
            validationResults.overallStatus = 'FAIL';
            validationResults.educationalSummary.push(`❌ ${test.name}: ${test.description} - FAILED`);
        }
    });
    
    // Add comprehensive validation summary with educational insights
    validationResults.summary = {
        successRate: `${validationResults.passedValidations}/${validationResults.totalValidations}`,
        successPercentage: Math.round((validationResults.passedValidations / validationResults.totalValidations) * 100),
        overallStatus: validationResults.overallStatus,
        educationalInsight: validationResults.overallStatus === 'PASS' ? 
            'All validation criteria passed - server is functioning correctly per tutorial requirements' :
            'Some validation criteria failed - server may need troubleshooting or configuration review'
    };
    
    // Log detailed validation results for educational transparency
    logger.debug('🔍 Response validation completed', {
        overallStatus: validationResults.overallStatus,
        successRate: validationResults.summary.successRate,
        passedTests: validationResults.passedValidations,
        failedTests: validationResults.failedValidations,
        educationalInsight: validationResults.summary.educationalInsight
    });
    
    return validationResults;
}

/**
 * Logs comprehensive health check results with educational context, performance metrics,
 * and troubleshooting guidance for monitoring and debugging assistance
 * 
 * Educational Note: This function demonstrates structured logging practices for monitoring
 * systems and provides educational insights for understanding server performance and health
 * 
 * @param {object} healthCheckResults - Complete health check results object with status and validation data
 * @param {boolean} isSuccess - Whether health check passed all validation criteria
 * @returns {void} No return value, outputs educational health check logs to console
 */
function logHealthCheckResults(healthCheckResults, isSuccess) {
    // Log health check initiation with server configuration details
    logger.info('🚀 Health Check Results Summary', {
        serverEndpoint: healthCheckResults.url,
        executionTime: new Date(healthCheckResults.timestamp).toLocaleString(),
        totalDuration: `${healthCheckResults.totalDuration}ms`,
        educationalContext: healthCheckResults.educationalContext
    });
    
    if (isSuccess) {
        // Log successful health check with performance metrics
        logger.info('🎉 Health Check PASSED - Server is healthy and responding correctly', {
            statusCode: `${healthCheckResults.statusCode} (${HTTP_STATUS.OK === healthCheckResults.statusCode ? 'HTTP OK' : 'Unexpected'})`,
            responseTime: `${healthCheckResults.responseTime}ms`,
            performanceLevel: healthCheckResults.performanceLevel,
            performanceNote: healthCheckResults.performanceNote,
            responseContent: `"${healthCheckResults.responseContent}"`,
            validationSummary: healthCheckResults.validationResults.summary,
            educationalAchievement: 'Tutorial server demonstrates correct HTTP implementation'
        });
        
        // Log educational insights for successful validation
        logger.info('📚 Educational Insights: Health Check Success', {
            httpCompliance: 'Server properly implements HTTP/1.1 response standards',
            endpointFunctionality: 'F-002 Hello Endpoint Implementation validated successfully',
            performanceCharacteristics: `Response time of ${healthCheckResults.responseTime}ms demonstrates efficient processing`,
            monitoringPractices: 'Health check demonstrates professional server monitoring techniques'
        });
        
    } else {
        // Log failed health check with detailed troubleshooting information
        logger.error('⚠️  Health Check FAILED - Server validation issues detected', {
            statusCode: healthCheckResults.statusCode || 'No Response',
            error: healthCheckResults.error,
            validationResults: healthCheckResults.validationResults,
            troubleshootingGuidance: healthCheckResults.troubleshooting,
            educationalFailureContext: 'Health check failures indicate server configuration or availability issues'
        });
        
        // Log specific validation failures with educational guidance
        if (healthCheckResults.validationResults && healthCheckResults.validationResults.detailedResults) {
            Object.entries(healthCheckResults.validationResults.detailedResults).forEach(([testName, result]) => {
                if (result.status === 'FAIL') {
                    logger.warn(`🔧 Validation Failure: ${testName}`, {
                        expected: result.expected,
                        actual: result.actual,
                        educationalNote: result.educationalNote,
                        troubleshootingTip: getValidationTroubleshootingTip(testName)
                    });
                }
            });
        }
        
        // Log educational troubleshooting guidance for common failure scenarios
        logger.info('🛠️  Troubleshooting Guidance for Health Check Failures', {
            commonIssues: [
                'Server not running: Start server with "node server.js"',
                'Port conflicts: Check if port 3000 is available or change PORT environment variable',
                'Network connectivity: Verify localhost network interface is working',
                'Server errors: Check server console logs for error messages'
            ],
            educationalValue: 'Health check failures provide learning opportunities for debugging and troubleshooting'
        });
    }
    
    // Log next steps and recommendations based on health check results
    const nextSteps = isSuccess ? 
        ['Server is ready for tutorial usage', 'Try accessing http://localhost:3000/hello in your browser', 'Experiment with different request methods to see error handling'] :
        ['Review server logs for error details', 'Verify server configuration and startup process', 'Check network connectivity and port availability'];
    
    logger.info('👉 Next Steps and Recommendations', {
        immediateActions: nextSteps,
        educationalOpportunity: isSuccess ? 
            'Explore additional HTTP methods and endpoints to learn about error handling' :
            'Use this failure as a learning opportunity to practice debugging and troubleshooting skills'
    });
}

/**
 * Handles health check errors with educational error categorization, troubleshooting
 * guidance, and appropriate exit code management for script execution
 * 
 * Educational Note: This function demonstrates comprehensive error handling patterns
 * and provides learning opportunities for understanding different types of system errors
 * 
 * @param {Error} error - Error object from failed health check operation
 * @param {string} context - Context information about where the error occurred
 * @returns {void} No return value, logs error and exits process with appropriate code
 */
function handleHealthCheckError(error, context) {
    // Categorize error type for educational error classification
    const errorCategory = categorizeHealthCheckError(error);
    const exitCode = determineExitCode(error);
    
    // Log comprehensive error details with educational context
    logger.error('💥 Health Check Error - System validation failed', error, {
        context: context,
        errorCategory: errorCategory,
        errorCode: error.code,
        exitCode: exitCode,
        educationalNote: 'Error handling demonstrates proper system failure management'
    });
    
    // Provide specific troubleshooting guidance based on error type
    const troubleshootingGuidance = getTroubleshootingGuidance(error);
    logger.info('🔧 Error-Specific Troubleshooting Guidance', {
        errorType: errorCategory,
        recommendedActions: troubleshootingGuidance.actions,
        educationalInsight: troubleshootingGuidance.learningNote,
        debuggingTips: troubleshootingGuidance.debuggingTips
    });
    
    // Log educational context about error handling and system reliability
    logger.info('📖 Educational Context: Error Handling in System Monitoring', {
        concept: 'Health checks provide early detection of system issues',
        bestPractices: [
            'Systematic error categorization enables targeted troubleshooting',
            'Appropriate exit codes support automation and monitoring systems',
            'Detailed error logging assists with debugging and maintenance'
        ],
        learningObjective: 'Understanding error handling patterns improves system reliability'
    });
    
    // Display final error summary with exit code explanation
    logger.error('🚨 Health Check Script Terminating', {
        reason: errorCategory,
        exitCode: exitCode,
        exitCodeMeaning: getExitCodeMeaning(exitCode),
        educationalNote: 'Exit codes enable integration with monitoring and automation systems'
    });
    
    // Exit process with appropriate error code for script automation
    process.exit(exitCode);
}

// =============================================================================
// COMMAND LINE INTERFACE FUNCTIONS
// =============================================================================

/**
 * Parses command line arguments for health check script configuration including
 * timeout, endpoint, verbose logging, and educational options
 * 
 * Educational Note: This function demonstrates command line argument processing
 * and provides flexible configuration options for different learning scenarios
 * 
 * @returns {object} Parsed command line options object with health check configuration and educational settings
 */
function parseCommandLineOptions() {
    // Get command line arguments excluding node executable and script path
    const args = process.argv.slice(2);
    
    // Initialize default options with educational settings
    const options = {
        timeout: HEALTH_CHECK_TIMEOUT,
        endpoint: HEALTH_CHECK_ENDPOINT,
        verbose: false,
        help: false,
        host: null,
        port: null,
        educationalMode: true,
        showHelp: false
    };
    
    // Parse command line arguments with educational error handling
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        switch (arg) {
            case '--timeout':
                if (i + 1 < args.length) {
                    const timeoutValue = parseInt(args[++i], 10);
                    if (isNaN(timeoutValue) || timeoutValue <= 0) {
                        logger.error('❌ Invalid timeout value - must be positive integer', {
                            providedValue: args[i],
                            expectedFormat: 'Positive integer in milliseconds',
                            example: '--timeout 10000'
                        });
                        process.exit(EXIT_CODE_CONFIG_ERROR);
                    }
                    options.timeout = timeoutValue;
                    logger.debug('⏱️  Timeout configured', { timeout: `${timeoutValue}ms` });
                } else {
                    logger.error('❌ --timeout option requires a value', {
                        usage: '--timeout <milliseconds>',
                        example: '--timeout 5000'
                    });
                    process.exit(EXIT_CODE_CONFIG_ERROR);
                }
                break;
                
            case '--endpoint':
                if (i + 1 < args.length) {
                    options.endpoint = args[++i];
                    logger.debug('🎯 Endpoint configured', { endpoint: options.endpoint });
                } else {
                    logger.error('❌ --endpoint option requires a value', {
                        usage: '--endpoint <path>',
                        example: '--endpoint /hello'
                    });
                    process.exit(EXIT_CODE_CONFIG_ERROR);
                }
                break;
                
            case '--verbose':
                options.verbose = true;
                logger.debug('📢 Verbose logging enabled');
                break;
                
            case '--help':
            case '-h':
                options.showHelp = true;
                break;
                
            case '--port':
                if (i + 1 < args.length) {
                    const portValue = parseInt(args[++i], 10);
                    if (isNaN(portValue) || portValue < 1 || portValue > 65535) {
                        logger.error('❌ Invalid port value - must be between 1 and 65535', {
                            providedValue: args[i],
                            validRange: '1-65535',
                            example: '--port 3000'
                        });
                        process.exit(EXIT_CODE_CONFIG_ERROR);
                    }
                    options.port = portValue;
                    logger.debug('🔌 Port override configured', { port: portValue });
                } else {
                    logger.error('❌ --port option requires a value', {
                        usage: '--port <number>',
                        example: '--port 3000'
                    });
                    process.exit(EXIT_CODE_CONFIG_ERROR);
                }
                break;
                
            case '--host':
                if (i + 1 < args.length) {
                    const hostValue = args[++i];
                    // Validate host for security (localhost only for tutorial)
                    if (!['localhost', '127.0.0.1', '::1'].includes(hostValue)) {
                        logger.warn('⚠️  Host override detected - tutorial security recommends localhost only', {
                            providedHost: hostValue,
                            recommendedHosts: ['localhost', '127.0.0.1'],
                            securityNote: 'External hosts may expose tutorial server to network access'
                        });
                    }
                    options.host = hostValue;
                    logger.debug('🏠 Host override configured', { host: hostValue });
                } else {
                    logger.error('❌ --host option requires a value', {
                        usage: '--host <hostname>',
                        example: '--host localhost'
                    });
                    process.exit(EXIT_CODE_CONFIG_ERROR);
                }
                break;
                
            default:
                logger.error('❌ Unknown command line option', {
                    unknownOption: arg,
                    suggestion: 'Use --help to see available options',
                    commonOptions: ['--timeout', '--endpoint', '--verbose', '--help']
                });
                process.exit(EXIT_CODE_CONFIG_ERROR);
        }
    }
    
    // Log parsed configuration for educational transparency
    if (options.verbose) {
        logger.info('⚙️  Health Check Configuration Parsed', {
            timeout: `${options.timeout}ms`,
            endpoint: options.endpoint,
            verboseLogging: options.verbose,
            hostOverride: options.host || 'Using server configuration',
            portOverride: options.port || 'Using server configuration',
            educationalNote: 'Command line options enable flexible health check configuration'
        });
    }
    
    return options;
}

/**
 * Displays comprehensive usage help information for the health check script including
 * options, examples, and educational guidance for tutorial users
 * 
 * Educational Note: This function provides clear documentation and examples to help
 * users understand health check script capabilities and proper usage patterns
 * 
 * @returns {void} No return value, outputs help information to console
 */
function displayUsageHelp() {
    // Display script header with educational context
    console.log('\n🏥 Node.js Tutorial Health Check Script');
    console.log('=====================================');
    console.log('Comprehensive server availability validation for Node.js tutorial HTTP server application.');
    console.log('Validates server connectivity, endpoint responsiveness, and proper HTTP response generation.');
    console.log();
    
    // Display usage syntax with command structure
    console.log('📋 USAGE:');
    console.log('  node health-check.js [options]');
    console.log();
    
    // Display available command line options with descriptions
    console.log('⚙️  OPTIONS:');
    console.log('  --timeout <ms>     Set health check timeout in milliseconds (default: 5000)');
    console.log('  --endpoint <path>  Specify endpoint to check (default: /hello)');
    console.log('  --verbose          Enable verbose educational logging output');
    console.log('  --help, -h         Display this help information');
    console.log('  --port <number>    Override server port for health check (uses config default)');
    console.log('  --host <hostname>  Override server hostname (must be localhost for security)');
    console.log();
    
    // Display usage examples for common scenarios
    console.log('📚 EXAMPLES:');
    console.log('  Basic health check:');
    console.log('    node health-check.js');
    console.log();
    console.log('  Verbose output with educational details:');
    console.log('    node health-check.js --verbose');
    console.log();
    console.log('  Custom timeout configuration:');
    console.log('    node health-check.js --timeout 10000');
    console.log();
    console.log('  Health check with port override:');
    console.log('    node health-check.js --port 8080 --verbose');
    console.log();
    console.log('  Check different endpoint:');
    console.log('    node health-check.js --endpoint /status --timeout 3000');
    console.log();
    
    // Display exit codes with educational explanation
    console.log('🚦 EXIT CODES:');
    console.log('  0 - Health check passed successfully');
    console.log('  1 - Health check failed (server issues or validation failures)');
    console.log('  2 - Configuration error (invalid command line options)');
    console.log('  3 - Connection error (unable to connect to server)');
    console.log();
    
    // Display educational guidance and best practices
    console.log('🎓 EDUCATIONAL GUIDANCE:');
    console.log('  • Health checks validate server functionality and availability');
    console.log('  • Response time validation ensures server performance standards');
    console.log('  • Status code validation confirms proper HTTP implementation');
    console.log('  • Content validation verifies endpoint functionality');
    console.log('  • Exit codes enable integration with monitoring and automation systems');
    console.log();
    
    // Display troubleshooting tips for common issues
    console.log('🔧 TROUBLESHOOTING:');
    console.log('  Server not responding:');
    console.log('    • Ensure server is running: node server.js');
    console.log('    • Check server logs for error messages');
    console.log('    • Verify port 3000 is not in use by another process');
    console.log();
    console.log('  Connection refused errors:');
    console.log('    • Confirm server startup completed successfully');
    console.log('    • Check firewall and network connectivity');
    console.log('    • Verify localhost network interface is functioning');
    console.log();
    console.log('  Timeout errors:');
    console.log('    • Server may be overloaded - check system resources');
    console.log('    • Increase timeout value with --timeout option');
    console.log('    • Review server performance and optimization opportunities');
    console.log();
    
    // Display integration and automation guidance
    console.log('🔗 INTEGRATION:');
    console.log('  • Use in CI/CD pipelines: npm run health-check');
    console.log('  • Integrate with monitoring systems using exit codes');
    console.log('  • Schedule regular health checks with cron jobs');
    console.log('  • Parse JSON output for programmatic health status monitoring');
    console.log();
    
    // Display tutorial context and learning objectives
    console.log('📖 TUTORIAL CONTEXT:');
    console.log('  This health check script demonstrates professional monitoring practices');
    console.log('  and provides hands-on experience with:');
    console.log('  • HTTP client programming in Node.js');
    console.log('  • Systematic server validation techniques');
    console.log('  • Error handling and troubleshooting methodologies');
    console.log('  • Command line interface design and argument processing');
    console.log('  • Performance monitoring and threshold validation');
    console.log();
    
    console.log('For more information, visit the tutorial documentation or check server logs.');
    console.log('=====================================\n');
}

// =============================================================================
// UTILITY HELPER FUNCTIONS
// =============================================================================

/**
 * Categorizes health check errors for educational error classification and analysis
 * 
 * @param {Error} error - Error object to categorize
 * @returns {string} Error category for troubleshooting guidance
 */
function categorizeHealthCheckError(error) {
    if (!error) return 'Unknown Error';
    
    const errorCode = error.code;
    const errorMessage = error.message ? error.message.toLowerCase() : '';
    
    if (errorCode === 'ECONNREFUSED') {
        return 'Connection Refused - Server Not Running';
    } else if (errorCode === 'TIMEOUT') {
        return 'Request Timeout - Server Unresponsive';
    } else if (errorCode === 'ENOTFOUND') {
        return 'Network Error - Hostname Resolution Failed';
    } else if (errorCode === 'EADDRINUSE') {
        return 'Port Conflict - Address Already In Use';
    } else if (errorMessage.includes('timeout')) {
        return 'Timeout Error - Response Time Exceeded';
    } else if (errorMessage.includes('network')) {
        return 'Network Error - Connectivity Issue';
    } else {
        return 'General Error - Unexpected Condition';
    }
}

/**
 * Determines appropriate exit code based on error type for automation integration
 * 
 * @param {Error} error - Error object to analyze
 * @returns {number} Appropriate exit code for process termination
 */
function determineExitCode(error) {
    if (!error) return EXIT_CODE_FAILURE;
    
    const errorCode = error.code;
    
    if (errorCode === 'ECONNREFUSED' || errorCode === 'TIMEOUT' || errorCode === 'ENOTFOUND') {
        return EXIT_CODE_CONNECTION_ERROR;
    } else if (errorCode === 'EADDRINUSE') {
        return EXIT_CODE_CONFIG_ERROR;
    } else {
        return EXIT_CODE_FAILURE;
    }
}

/**
 * Provides specific troubleshooting guidance based on error type with educational context
 * 
 * @param {Error} error - Error object requiring troubleshooting guidance
 * @returns {object} Troubleshooting guidance object with actions and learning notes
 */
function getTroubleshootingGuidance(error) {
    const guidance = {
        actions: [],
        debuggingTips: [],
        learningNote: ''
    };
    
    if (!error) {
        guidance.actions = ['Review health check logs for error details'];
        guidance.learningNote = 'Error analysis provides debugging practice opportunities';
        return guidance;
    }
    
    switch (error.code) {
        case 'ECONNREFUSED':
            guidance.actions = [
                'Start the Node.js server: node server.js',
                'Verify server startup completed without errors',
                'Check if another process is using port 3000',
                'Review server configuration for correct port binding'
            ];
            guidance.debuggingTips = [
                'Use "lsof -ti:3000" (macOS/Linux) or "netstat -ano | findstr :3000" (Windows) to check port usage',
                'Check server console output for startup error messages',
                'Verify Node.js process is running with correct arguments'
            ];
            guidance.learningNote = 'Connection refused errors teach network communication and process management';
            break;
            
        case 'TIMEOUT':
            guidance.actions = [
                'Check server performance and resource usage',
                'Increase health check timeout with --timeout option',
                'Review server logs for processing delays',
                'Verify server is not overloaded with requests'
            ];
            guidance.debuggingTips = [
                'Monitor server CPU and memory usage during health checks',
                'Test server responsiveness with direct browser access',
                'Check for blocking operations in server code'
            ];
            guidance.learningNote = 'Timeout errors demonstrate performance monitoring and optimization concepts';
            break;
            
        case 'ENOTFOUND':
            guidance.actions = [
                'Verify hostname configuration in server-config.js',
                'Check localhost network interface configuration',
                'Test network connectivity with ping localhost',
                'Review DNS resolution for specified hostname'
            ];
            guidance.debuggingTips = [
                'Use "ping localhost" to test basic network connectivity',
                'Check /etc/hosts file for localhost entries (Unix systems)',
                'Verify network interface configuration and status'
            ];
            guidance.learningNote = 'Hostname resolution errors teach network configuration and DNS concepts';
            break;
            
        default:
            guidance.actions = [
                'Review detailed error message for specific guidance',
                'Check server logs for additional error context',
                'Verify server configuration and environment settings',
                'Test health check with verbose logging enabled'
            ];
            guidance.debuggingTips = [
                'Enable verbose logging: --verbose',
                'Check Node.js version compatibility',
                'Verify all required modules are properly installed'
            ];
            guidance.learningNote = 'General errors provide opportunities to practice systematic troubleshooting';
            break;
    }
    
    return guidance;
}

/**
 * Provides troubleshooting tips for specific validation failures
 * 
 * @param {string} validationName - Name of the failed validation
 * @returns {string} Specific troubleshooting tip for the validation failure
 */
function getValidationTroubleshootingTip(validationName) {
    const troubleshootingTips = {
        statusCode: 'Check server error handling - ensure /hello endpoint returns HTTP 200 OK',
        responseContent: 'Verify server response message matches expected "Hello world" content exactly',
        contentType: 'Ensure server sets correct Content-Type: text/plain header in responses',
        responseTime: 'Investigate server performance - consider optimizing request processing logic',
        contentLength: 'Verify server generates non-empty response body for health check endpoint'
    };
    
    return troubleshootingTips[validationName] || 'Review server implementation for proper endpoint functionality';
}

/**
 * Provides human-readable explanation of exit codes for educational purposes
 * 
 * @param {number} exitCode - Exit code to explain
 * @returns {string} Human-readable explanation of the exit code
 */
function getExitCodeMeaning(exitCode) {
    const exitCodeMeanings = {
        [EXIT_CODE_SUCCESS]: 'Success - Health check passed all validations',
        [EXIT_CODE_FAILURE]: 'General Failure - Health check validation failed',
        [EXIT_CODE_CONFIG_ERROR]: 'Configuration Error - Invalid command line options or settings',
        [EXIT_CODE_CONNECTION_ERROR]: 'Connection Error - Unable to connect to server'
    };
    
    return exitCodeMeanings[exitCode] || 'Unknown Exit Code - Unexpected termination condition';
}

// =============================================================================
// MAIN ENTRY POINT FUNCTION
// =============================================================================

/**
 * Main entry point function that orchestrates the complete health check process including
 * option parsing, health check execution, result validation, and educational reporting
 * 
 * Educational Note: This function demonstrates complete script orchestration and provides
 * a comprehensive example of health check automation with educational value
 * 
 * @returns {Promise<void>} No return value, executes health check and exits with appropriate code
 */
async function main() {
    try {
        // Display educational script banner for user context
        logger.info('🚀 Node.js Tutorial Health Check Script Starting', {
            purpose: 'Comprehensive server validation and monitoring demonstration',
            educationalObjectives: [
                'Validate F-002 Hello Endpoint Implementation',
                'Demonstrate HTTP client programming patterns',
                'Practice server monitoring and troubleshooting techniques'
            ],
            version: '1.0.0'
        });
        
        // Parse command line options with educational error handling
        const options = parseCommandLineOptions();
        
        // Display usage help if requested and exit gracefully
        if (options.showHelp) {
            displayUsageHelp();
            process.exit(EXIT_CODE_SUCCESS);
        }
        
        // Initialize health check configuration with parsed options
        const healthCheckConfig = {
            timeout: options.timeout,
            endpoint: options.endpoint,
            host: options.host,
            port: options.port,
            verbose: options.verbose,
            educationalMode: options.educationalMode
        };
        
        // Log health check initialization with educational context
        logger.info('⚙️  Health Check Configuration Initialized', {
            config: healthCheckConfig,
            serverEndpoint: `http://${options.host || getServerHostname()}:${options.port || getServerPort()}${options.endpoint}`,
            educationalNote: 'Configuration demonstrates flexible health check parameterization'
        });
        
        // Execute comprehensive health check with performance timing
        logger.info('🔍 Executing comprehensive server health validation');
        const healthCheckResults = await performHealthCheck(healthCheckConfig);
        
        // Determine overall health check success status
        const isHealthCheckSuccessful = healthCheckResults.success;
        
        // Log detailed health check results with educational context
        logHealthCheckResults(healthCheckResults, isHealthCheckSuccessful);
        
        // Generate educational summary with learning insights
        logger.info('📊 Health Check Execution Summary', {
            overallResult: isHealthCheckSuccessful ? 'SUCCESS' : 'FAILURE',
            executionTime: `${healthCheckResults.totalDuration}ms`,
            serverValidation: isHealthCheckSuccessful ? 'All criteria passed' : 'Some validations failed',
            educationalAchievements: [
                'Demonstrated HTTP client programming techniques',
                'Practiced systematic server validation methods',
                'Applied performance monitoring and threshold analysis',
                'Experienced comprehensive error handling patterns'
            ]
        });
        
        // Exit process with appropriate success or failure code
        const finalExitCode = isHealthCheckSuccessful ? EXIT_CODE_SUCCESS : EXIT_CODE_FAILURE;
        
        logger.info('✨ Health Check Script Completed', {
            exitCode: finalExitCode,
            exitCodeMeaning: getExitCodeMeaning(finalExitCode),
            nextSteps: isHealthCheckSuccessful ? 
                'Server is ready for tutorial usage and experimentation' :
                'Review troubleshooting guidance and address identified issues',
            educationalReflection: 'Health check execution provides practical experience with server monitoring'
        });
        
        process.exit(finalExitCode);
        
    } catch (error) {
        // Handle unexpected errors during main execution with comprehensive error reporting
        logger.error('💥 Unexpected error during health check execution', error, {
            stage: 'Main execution',
            errorType: error.constructor.name,
            educationalNote: 'Unexpected errors demonstrate importance of comprehensive error handling'
        });
        
        // Use error handling function for consistent error processing
        handleHealthCheckError(error, 'Main execution');
    }
}

// =============================================================================
// MODULE EXPORTS AND SCRIPT EXECUTION
// =============================================================================

// Export functions for testing and external usage
module.exports = {
    // Main health check functionality
    performHealthCheck,
    validateHealthCheckResponse,
    
    // Configuration constants
    HEALTH_CHECK_CONFIG
};

// Execute main function only when script is run directly (not imported)
if (require.main === module) {
    main().catch((error) => {
        // Final fallback error handler for uncaught promise rejections
        console.error('💥 Fatal error in health check script:', error.message);
        console.error('🔧 Troubleshooting: Review error details above and check server status');
        process.exit(EXIT_CODE_FAILURE);
    });
}