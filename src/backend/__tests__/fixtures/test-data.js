/**
 * Test Data Fixtures Module for Node.js Tutorial Application Testing Suite
 * 
 * This module provides comprehensive test data fixtures for the Node.js tutorial application
 * testing suite, centralizing all test data including valid and invalid request objects,
 * expected response data, test scenarios, and performance expectations to ensure consistent
 * testing across unit tests, integration tests, and educational testing demonstrations
 * while maintaining data integrity and educational value.
 * 
 * Educational Features:
 * - Comprehensive test data coverage for all tutorial application testing scenarios
 * - Learning context integration with educational metadata throughout all test data objects
 * - Professional testing patterns demonstrating industry-standard test data organization
 * - Performance testing support with benchmarks for educational performance testing
 * - Error scenario coverage with comprehensive error test data for proper error handling
 * - Educational troubleshooting with test data including guidance for failures
 * - Tutorial-specific customization tailored for Node.js tutorial learning objectives
 * 
 * @module test-data
 * @version 1.0.0
 * @educational Demonstrates comprehensive test data organization for Node.js applications
 */

// Import HTTP status code constants for consistent test data response status values
const {
    HTTP_STATUS: {
        OK,
        NOT_FOUND,
        METHOD_NOT_ALLOWED,
        INTERNAL_SERVER_ERROR
    }
} = require('../../lib/constants/http-status-codes.js');

// Import success messages for consistent test data response content
const {
    SUCCESS_MESSAGES: {
        HELLO_WORLD
    }
} = require('../../lib/constants/response-messages.js');

// Import error messages for consistent test data error response content
const {
    ERROR_MESSAGES: {
        NOT_FOUND: NOT_FOUND_MESSAGE,
        METHOD_NOT_ALLOWED: METHOD_NOT_ALLOWED_MESSAGE,
        INTERNAL_SERVER_ERROR: INTERNAL_SERVER_ERROR_MESSAGE
    }
} = require('../../lib/constants/response-messages.js');

// Import content type constants for consistent test data response headers
const {
    CONTENT_TYPES: {
        TEXT_PLAIN,
        APPLICATION_JSON
    }
} = require('../../lib/constants/response-messages.js');

// Import default server configuration for consistent test data server configuration values
const {
    DEFAULT_PORT,
    DEFAULT_HOSTNAME
} = require('../../lib/config/server-config.js');

// =============================================================================
// GLOBAL TEST CONSTANTS
// =============================================================================

/**
 * Hello endpoint path for testing the main tutorial functionality
 * Educational Note: This path represents the single endpoint in the tutorial application
 */
const HELLO_ENDPOINT_PATH = '/hello';

/**
 * Supported HTTP methods for the tutorial application
 * Educational Note: Only GET method is supported, demonstrating focused API design
 */
const SUPPORTED_HTTP_METHODS = ['GET'];

/**
 * Educational test timeout in milliseconds for async operations
 * Educational Note: 5 seconds provides sufficient time for learning and experimentation
 */
const EDUCATIONAL_TEST_TIMEOUT = 5000;

/**
 * Performance threshold in milliseconds for response time validation
 * Educational Note: 100ms threshold demonstrates performance awareness in testing
 */
const PERFORMANCE_THRESHOLD_MS = 100;

// =============================================================================
// TEST DATA CONSTANTS OBJECT
// =============================================================================

/**
 * Constants and configuration used throughout test data creation and validation
 * Contains centralized values for consistent test data generation across all testing scenarios
 */
const TEST_DATA_CONSTANTS = {
    HELLO_PATH: HELLO_ENDPOINT_PATH,
    SUPPORTED_METHODS: SUPPORTED_HTTP_METHODS,
    DEFAULT_HEADERS: {
        'host': `${DEFAULT_HOSTNAME}:${DEFAULT_PORT}`,
        'user-agent': 'Jest-Test-Suite/1.0',
        'accept': 'text/plain',
        'connection': 'keep-alive'
    },
    EDUCATIONAL_METADATA: {
        tutorial_version: '1.0.0',
        learning_context: 'Node.js HTTP server fundamentals',
        testing_framework: 'Jest',
        performance_awareness: true
    }
};

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Factory function that creates valid HTTP request test data with configurable options
 * for comprehensive testing of successful request scenarios in the tutorial application
 * 
 * @param {Object} options - Optional configuration for customizing request properties including URL, method, headers, and educational context
 * @returns {Object} Valid HTTP request test data object with proper structure, headers, and educational metadata for testing
 */
function createValidRequest(options = {}) {
    // Merge provided options with default valid request configuration
    const defaultConfig = {
        url: HELLO_ENDPOINT_PATH,
        method: 'GET',
        headers: { ...TEST_DATA_CONSTANTS.DEFAULT_HEADERS },
        httpVersion: '1.1'
    };

    // Set default URL to '/hello' for hello endpoint testing
    const url = options.url || defaultConfig.url;
    
    // Set default method to 'GET' for supported HTTP method testing
    const method = options.method || defaultConfig.method;
    
    // Configure standard request headers including host, user-agent, and accept
    const headers = options.headers ? { ...defaultConfig.headers, ...options.headers } : defaultConfig.headers;
    
    // Add educational context and metadata for tutorial testing
    const educational_metadata = {
        description: `Valid ${method} request to ${url} endpoint for success scenario testing`,
        expected_outcome: `${OK} OK response with '${HELLO_WORLD.split(' - ')[0]}' message`,
        learning_objective: 'Demonstrate successful HTTP request-response cycle',
        ...options.educational_metadata
    };
    
    // Include timing information for performance testing validation
    const timing_info = {
        created_at: new Date().toISOString(),
        performance_expectation: `Response time should be < ${PERFORMANCE_THRESHOLD_MS}ms`,
        timeout_threshold: EDUCATIONAL_TEST_TIMEOUT
    };
    
    // Return complete valid request object ready for test usage
    return {
        url,
        method,
        headers,
        httpVersion: defaultConfig.httpVersion,
        educational_metadata,
        timing_info,
        ...options
    };
}

/**
 * Factory function that creates invalid HTTP request test data for error scenario testing
 * including unsupported methods, malformed structures, and validation failures
 * 
 * @param {string} errorType - Type of invalid request to create (method_not_allowed, malformed, invalid_path)
 * @param {Object} options - Optional configuration for customizing invalid request properties
 * @returns {Object} Invalid HTTP request test data object configured for specific error testing scenarios
 */
function createInvalidRequest(errorType, options = {}) {
    let baseRequest;
    
    // Determine invalid request configuration based on errorType parameter
    switch (errorType) {
        case 'method_not_allowed':
            // Create request structure with intentional validation failures
            baseRequest = {
                url: HELLO_ENDPOINT_PATH,
                method: options.method || 'POST',
                headers: { ...TEST_DATA_CONSTANTS.DEFAULT_HEADERS },
                expected_status: METHOD_NOT_ALLOWED,
                expected_message: METHOD_NOT_ALLOWED_MESSAGE
            };
            break;
            
        case 'malformed':
            // Configure headers and properties to trigger specific error conditions
            baseRequest = {
                url: options.url || HELLO_ENDPOINT_PATH,
                method: null, // Intentionally malformed
                headers: options.headers || {},
                expected_error: 'Invalid HTTP method',
                malformed_reason: 'Missing or null HTTP method'
            };
            break;
            
        case 'invalid_path':
            baseRequest = {
                url: options.url || '/nonexistent',
                method: 'GET',
                headers: { ...TEST_DATA_CONSTANTS.DEFAULT_HEADERS },
                expected_status: NOT_FOUND,
                expected_message: NOT_FOUND_MESSAGE
            };
            break;
            
        default:
            baseRequest = {
                url: '/unknown',
                method: 'GET',
                headers: { ...TEST_DATA_CONSTANTS.DEFAULT_HEADERS },
                expected_status: NOT_FOUND
            };
    }
    
    // Add educational context about error scenario and expected outcomes
    const educational_context = {
        error_type: errorType,
        description: `Invalid request designed to test ${errorType} scenario`,
        expected_outcome: baseRequest.expected_status ? 
            `HTTP ${baseRequest.expected_status} error response` : 
            'Request processing error',
        learning_objective: `Understand ${errorType} error handling patterns`,
        troubleshooting_guidance: getTroubleshootingGuidance(errorType)
    };
    
    // Include troubleshooting guidance for educational error testing
    const troubleshooting_info = {
        common_causes: getCommonCauses(errorType),
        resolution_steps: getResolutionSteps(errorType),
        related_concepts: getRelatedConcepts(errorType)
    };
    
    // Return invalid request object ready for error scenario testing
    return {
        ...baseRequest,
        educational_context,
        troubleshooting_info,
        created_at: new Date().toISOString(),
        ...options
    };
}

/**
 * Factory function that creates expected HTTP response test data for response validation testing
 * with configurable status codes, headers, and content for comprehensive response testing
 * 
 * @param {number} statusCode - HTTP status code for the expected response
 * @param {string} responseBody - Response body content for validation
 * @param {Object} options - Optional configuration for headers and educational context
 * @returns {Object} Expected HTTP response test data object with status, headers, body, and validation criteria
 */
function createExpectedResponse(statusCode, responseBody, options = {}) {
    // Initialize response object with provided status code and body content
    const baseResponse = {
        statusCode,
        body: responseBody
    };
    
    // Configure appropriate headers based on response type and content
    let headers = {
        'content-type': TEXT_PLAIN,
        'x-powered-by': 'Node.js Tutorial'
    };
    
    // Add educational headers and metadata for tutorial demonstration
    if (responseBody && typeof responseBody === 'string') {
        headers['content-length'] = Buffer.byteLength(responseBody, 'utf8').toString();
    }
    
    // Handle specific status codes with appropriate headers
    if (statusCode === METHOD_NOT_ALLOWED) {
        headers['allow'] = 'GET';
    }
    
    // Merge with any provided headers
    if (options.headers) {
        headers = { ...headers, ...options.headers };
    }
    
    // Include validation criteria for comprehensive response testing
    const validation_criteria = {
        status_code_valid: statusCode >= 100 && statusCode < 600,
        content_type_present: Boolean(headers['content-type']),
        body_length_match: Boolean(headers['content-length']),
        educational_headers_present: Boolean(headers['x-powered-by'])
    };
    
    // Set up timing expectations for performance validation
    const timing_expectations = {
        max_response_time: PERFORMANCE_THRESHOLD_MS,
        generation_time_target: 10, // milliseconds
        header_write_time_target: 5
    };
    
    // Add educational context for learning purposes
    const educational_metadata = {
        status_code_meaning: getStatusCodeMeaning(statusCode),
        response_type: statusCode >= 200 && statusCode < 300 ? 'success' : 'error',
        learning_points: getResponseLearningPoints(statusCode),
        ...options.educational_metadata
    };
    
    // Return complete expected response object for test assertions
    return {
        ...baseResponse,
        headers,
        validation_criteria,
        timing_expectations,
        educational_metadata,
        created_at: new Date().toISOString(),
        ...options
    };
}

/**
 * Factory function that creates comprehensive test scenarios combining request data, expected responses,
 * and educational context for systematic testing of hello endpoint functionality
 * 
 * @param {string} scenarioName - Descriptive name for the test scenario
 * @param {string} scenarioType - Type of scenario (success, error, performance, edge_case)
 * @param {Object} config - Configuration object with request, response, and validation settings
 * @returns {Object} Complete test scenario object with input data, expected outcomes, and educational context
 */
function createTestScenario(scenarioName, scenarioType, config) {
    // Create scenario metadata with name, type, and educational description
    const metadata = {
        name: scenarioName,
        type: scenarioType,
        description: config.description || `${scenarioType} scenario for ${scenarioName}`,
        category: getScenarioCategory(scenarioType),
        priority: config.priority || 'medium'
    };
    
    // Generate appropriate request data based on scenario type
    let requestData;
    if (scenarioType === 'success') {
        requestData = createValidRequest(config.request || {});
    } else {
        const errorType = config.errorType || 'invalid_path';
        requestData = createInvalidRequest(errorType, config.request || {});
    }
    
    // Configure expected response data for validation
    const responseData = createExpectedResponse(
        config.expectedStatus || OK,
        config.expectedBody || HELLO_WORLD.split(' - ')[0],
        config.response || {}
    );
    
    // Add performance expectations and timing requirements
    const performance_expectations = {
        response_time: {
            max: PERFORMANCE_THRESHOLD_MS,
            target: 50,
            acceptable: 200
        },
        memory_usage: {
            max: 50 * 1024 * 1024, // 50MB
            target: 20 * 1024 * 1024 // 20MB
        },
        timeout: EDUCATIONAL_TEST_TIMEOUT
    };
    
    // Include educational context and learning objectives
    const educational_context = {
        learning_objectives: config.learning_objectives || [],
        concepts_demonstrated: config.concepts_demonstrated || [],
        skill_level: config.skill_level || 'beginner',
        related_topics: config.related_topics || []
    };
    
    // Set up troubleshooting guidance and debugging assistance
    const troubleshooting_guide = {
        common_issues: config.common_issues || [],
        debugging_steps: config.debugging_steps || [],
        helpful_resources: config.helpful_resources || []
    };
    
    // Return complete test scenario ready for execution
    return {
        metadata,
        request: requestData,
        expected_response: responseData,
        performance_expectations,
        educational_context,
        troubleshooting_guide,
        validation_rules: config.validation_rules || [],
        created_at: new Date().toISOString()
    };
}

/**
 * Validation function that ensures test data objects conform to expected structures
 * and contain all required properties for reliable testing execution
 * 
 * @param {Object} testData - Test data object to validate
 * @param {string} dataType - Type of test data being validated (request, response, scenario)
 * @returns {Object} Validation result with success status and detailed error information
 */
function validateTestData(testData, dataType) {
    // Check for presence of all required properties based on data type
    const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        educational_notes: []
    };
    
    // Validate data format and structure according to HTTP standards
    switch (dataType) {
        case 'request':
            if (!testData.url) {
                validation.errors.push('Request must have a URL property');
                validation.isValid = false;
            }
            if (!testData.method) {
                validation.errors.push('Request must have a method property');
                validation.isValid = false;
            }
            if (!testData.headers || typeof testData.headers !== 'object') {
                validation.warnings.push('Request should include headers object');
            }
            break;
            
        case 'response':
            if (typeof testData.statusCode !== 'number') {
                validation.errors.push('Response must have a numeric statusCode');
                validation.isValid = false;
            }
            if (!testData.headers || typeof testData.headers !== 'object') {
                validation.errors.push('Response must have headers object');
                validation.isValid = false;
            }
            break;
            
        case 'scenario':
            if (!testData.request || !testData.expected_response) {
                validation.errors.push('Scenario must include both request and expected_response');
                validation.isValid = false;
            }
            break;
    }
    
    // Verify educational context and learning metadata are included
    if (!testData.educational_metadata && !testData.educational_context) {
        validation.warnings.push('Test data should include educational context for learning value');
    }
    
    // Check for consistency with application constants and configuration
    if (testData.url && testData.url.startsWith('/') && testData.url !== HELLO_ENDPOINT_PATH && testData.url !== '/') {
        validation.educational_notes.push(`URL ${testData.url} may not be supported by tutorial application`);
    }
    
    // Compile validation results with specific error descriptions
    validation.educational_notes.push(`Validation completed for ${dataType} test data`);
    
    // Return validation results for test data quality assurance
    return validation;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get troubleshooting guidance based on error type
 * @param {string} errorType - Type of error for guidance
 * @returns {string} Troubleshooting guidance
 */
function getTroubleshootingGuidance(errorType) {
    const guidance = {
        method_not_allowed: 'Ensure you are using the GET method. POST, PUT, DELETE are not supported in this tutorial.',
        malformed: 'Check that all required request properties (url, method, headers) are properly formatted.',
        invalid_path: 'Verify the URL path is correct. Only /hello endpoint is supported in this tutorial.',
    };
    return guidance[errorType] || 'Check server logs and verify request format.';
}

/**
 * Get common causes for error types
 * @param {string} errorType - Type of error
 * @returns {Array} Array of common causes
 */
function getCommonCauses(errorType) {
    const causes = {
        method_not_allowed: ['Using POST instead of GET', 'Using PUT/DELETE methods', 'Incorrect HTTP verb'],
        malformed: ['Missing URL property', 'Null method value', 'Invalid header format'],
        invalid_path: ['Typo in URL path', 'Case sensitivity issues', 'Extra slashes in path']
    };
    return causes[errorType] || ['Unknown request format', 'Server configuration issues'];
}

/**
 * Get resolution steps for error types
 * @param {string} errorType - Type of error
 * @returns {Array} Array of resolution steps
 */
function getResolutionSteps(errorType) {
    const steps = {
        method_not_allowed: ['Change request method to GET', 'Verify endpoint supports the method', 'Check API documentation'],
        malformed: ['Validate request object structure', 'Ensure all required properties exist', 'Check data types'],
        invalid_path: ['Verify URL spelling', 'Check case sensitivity', 'Confirm endpoint exists']
    };
    return steps[errorType] || ['Check request format', 'Verify server is running', 'Review error logs'];
}

/**
 * Get related concepts for error types
 * @param {string} errorType - Type of error
 * @returns {Array} Array of related concepts
 */
function getRelatedConcepts(errorType) {
    const concepts = {
        method_not_allowed: ['HTTP methods', 'REST API design', 'Endpoint specifications'],
        malformed: ['Request validation', 'Data types', 'Object structure'],
        invalid_path: ['URL routing', 'Path matching', 'Endpoint discovery']
    };
    return concepts[errorType] || ['HTTP protocol', 'Request-response cycle', 'Error handling'];
}

/**
 * Get status code meaning for educational context
 * @param {number} statusCode - HTTP status code
 * @returns {string} Status code meaning
 */
function getStatusCodeMeaning(statusCode) {
    const meanings = {
        200: 'OK - Successful request processing',
        404: 'Not Found - Requested resource does not exist',
        405: 'Method Not Allowed - HTTP method not supported for endpoint',
        500: 'Internal Server Error - Unexpected server error occurred'
    };
    return meanings[statusCode] || `HTTP status code ${statusCode}`;
}

/**
 * Get learning points for response status codes
 * @param {number} statusCode - HTTP status code
 * @returns {Array} Array of learning points
 */
function getResponseLearningPoints(statusCode) {
    const points = {
        200: ['HTTP 200 indicates success', 'Content-Type header specifies format', 'Response body contains expected data'],
        404: ['HTTP 404 indicates resource not found', 'Error message includes troubleshooting guidance', 'Educational context helps users'],
        405: ['HTTP 405 indicates method not allowed', 'Allow header specifies supported methods', 'Educational message explains proper usage'],
        500: ['HTTP 500 indicates server error', 'Error details help with debugging', 'Server logs provide additional context']
    };
    return points[statusCode] || [`HTTP status code ${statusCode} usage`, 'Proper error handling', 'Client-server communication'];
}

/**
 * Get scenario category based on type
 * @param {string} scenarioType - Type of scenario
 * @returns {string} Scenario category
 */
function getScenarioCategory(scenarioType) {
    const categories = {
        success: 'Positive Testing',
        error: 'Error Handling',
        performance: 'Performance Testing',
        edge_case: 'Edge Case Testing'
    };
    return categories[scenarioType] || 'General Testing';
}

// =============================================================================
// VALID REQUEST TEST DATA
// =============================================================================

/**
 * Valid HTTP request test data for positive testing scenarios
 * Includes successful hello endpoint requests and proper request structures
 */
const validRequestData = {
    // Standard valid GET request to /hello endpoint with proper headers and educational context
    helloGetRequest: createValidRequest({
        educational_metadata: {
            description: 'Standard valid GET request to /hello endpoint for success scenario testing',
            expected_outcome: '200 OK response with \'Hello world\' message',
            learning_objective: 'Demonstrate successful HTTP request-response cycle',
            concepts_covered: ['HTTP GET method', 'Request headers', 'URL routing']
        }
    }),
    
    // Collection of valid HTTP headers for hello endpoint testing
    validHeaders: {
        standard: {
            'host': `${DEFAULT_HOSTNAME}:${DEFAULT_PORT}`,
            'user-agent': 'Tutorial-Test-Client',
            'accept': 'text/plain'
        },
        minimal: {
            'host': `${DEFAULT_HOSTNAME}:${DEFAULT_PORT}`
        },
        comprehensive: {
            'host': `${DEFAULT_HOSTNAME}:${DEFAULT_PORT}`,
            'user-agent': 'Node.js-Tutorial-Testing',
            'accept': 'text/plain, application/json',
            'accept-encoding': 'gzip, deflate',
            'connection': 'keep-alive',
            'cache-control': 'no-cache'
        }
    },
    
    // Standard request template for various testing scenarios
    standardRequest: createValidRequest({
        headers: {
            'host': `${DEFAULT_HOSTNAME}:${DEFAULT_PORT}`,
            'user-agent': 'Jest-Test-Suite/1.0',
            'accept': 'text/plain',
            'connection': 'keep-alive'
        },
        educational_metadata: {
            description: 'Standard request template with common headers',
            usage: 'Base template for creating test requests',
            learning_objective: 'Understand standard HTTP request structure'
        }
    })
};

// =============================================================================
// INVALID REQUEST TEST DATA
// =============================================================================

/**
 * Invalid HTTP request test data for error scenario testing
 * Includes method validation and malformed request handling test cases
 */
const invalidRequestData = {
    // Array of invalid HTTP methods for testing method validation
    invalidMethods: [
        createInvalidRequest('method_not_allowed', {
            method: 'POST',
            educational_context: {
                description: 'POST method not supported by hello endpoint',
                expected_outcome: '405 Method Not Allowed response',
                learning_objective: 'Understand HTTP method validation'
            }
        }),
        createInvalidRequest('method_not_allowed', {
            method: 'PUT',
            educational_context: {
                description: 'PUT method not supported by hello endpoint',
                expected_outcome: '405 Method Not Allowed response'
            }
        }),
        createInvalidRequest('method_not_allowed', {
            method: 'DELETE',
            educational_context: {
                description: 'DELETE method not supported by hello endpoint',
                expected_outcome: '405 Method Not Allowed response'
            }
        }),
        createInvalidRequest('method_not_allowed', {
            method: 'PATCH',
            educational_context: {
                description: 'PATCH method not supported by hello endpoint',
                expected_outcome: '405 Method Not Allowed response'
            }
        })
    ],
    
    // Array of malformed request objects for error handling testing
    malformedRequests: [
        createInvalidRequest('malformed', {
            description: 'Request with missing URL',
            url: undefined,
            expected_error: 'Missing or invalid URL',
            educational_context: {
                description: 'Demonstrates importance of request URL validation',
                learning_objective: 'Understand request structure requirements'
            }
        }),
        createInvalidRequest('malformed', {
            description: 'Request with null method',
            method: null,
            expected_error: 'Invalid HTTP method',
            educational_context: {
                description: 'Shows method validation requirements',
                learning_objective: 'Understand HTTP method importance'
            }
        })
    ],
    
    // Array of invalid paths for route testing
    invalidPaths: [
        createInvalidRequest('invalid_path', {
            url: '/nonexistent',
            educational_context: {
                description: 'Request to non-existent endpoint',
                expected_outcome: '404 Not Found response',
                learning_objective: 'Understand URL routing and 404 handling'
            }
        }),
        createInvalidRequest('invalid_path', {
            url: '/api/users',
            educational_context: {
                description: 'Request to unsupported API path',
                expected_outcome: '404 Not Found response'
            }
        })
    ]
};

// =============================================================================
// EXPECTED RESPONSE TEST DATA
// =============================================================================

/**
 * Expected HTTP response test data for response validation testing
 * Includes various status codes and response content for comprehensive testing
 */
const expectedResponseData = {
    // Expected response for successful hello endpoint requests
    successResponse: createExpectedResponse(OK, HELLO_WORLD.split(' - ')[0], {
        educational_metadata: {
            description: 'Successful hello endpoint response with proper HTTP formatting',
            learning_points: [
                'HTTP 200 status indicates success',
                'Content-Type header specifies response format',
                'Response body contains expected hello message'
            ]
        }
    }),
    
    // Expected response for requests to non-existent endpoints
    notFoundResponse: createExpectedResponse(NOT_FOUND, NOT_FOUND_MESSAGE, {
        educational_metadata: {
            description: '404 error response for invalid routes with educational guidance',
            learning_points: [
                'HTTP 404 indicates resource not found',
                'Error message includes troubleshooting guidance',
                'Educational context helps users understand correct usage'
            ]
        }
    }),
    
    // Expected response for unsupported HTTP methods
    methodNotAllowedResponse: createExpectedResponse(METHOD_NOT_ALLOWED, METHOD_NOT_ALLOWED_MESSAGE, {
        headers: {
            'content-type': TEXT_PLAIN,
            'allow': 'GET',
            'x-powered-by': 'Node.js Tutorial'
        },
        educational_metadata: {
            description: '405 error response for unsupported methods with educational guidance',
            learning_points: [
                'HTTP 405 indicates method not allowed',
                'Allow header specifies supported methods',
                'Educational message explains proper method usage'
            ]
        }
    }),
    
    // Expected response for internal server errors
    internalServerErrorResponse: createExpectedResponse(INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR_MESSAGE, {
        educational_metadata: {
            description: '500 error response for server errors with debugging guidance',
            learning_points: [
                'HTTP 500 indicates server error',
                'Error details help with debugging',
                'Server logs provide additional context'
            ]
        }
    })
};

// =============================================================================
// COMPREHENSIVE TEST SCENARIOS
// =============================================================================

/**
 * Comprehensive test scenarios for systematic testing
 * Includes success cases, error conditions, performance validation, and edge cases
 */
const testScenarios = {
    // Hello endpoint testing scenarios
    helloEndpointScenarios: [
        createTestScenario('Valid Hello Request', 'success', {
            description: 'Test successful GET request to /hello endpoint',
            expectedStatus: OK,
            expectedBody: HELLO_WORLD.split(' - ')[0],
            learning_objectives: ['HTTP GET method usage', 'Successful request-response cycle'],
            concepts_demonstrated: ['URL routing', 'Response generation', 'HTTP status codes']
        }),
        createTestScenario('Hello Response Headers', 'success', {
            description: 'Validate proper response headers for /hello endpoint',
            expectedStatus: OK,
            validation_rules: ['Content-Type header present', 'Content-Length matches body'],
            learning_objectives: ['HTTP headers understanding', 'Response validation']
        })
    ],
    
    // Error condition testing scenarios
    errorScenarios: [
        createTestScenario('Method Not Allowed', 'error', {
            description: 'Test POST request to /hello endpoint returns 405',
            errorType: 'method_not_allowed',
            expectedStatus: METHOD_NOT_ALLOWED,
            request: { method: 'POST' },
            learning_objectives: ['HTTP method validation', 'Error response handling']
        }),
        createTestScenario('Not Found Error', 'error', {
            description: 'Test request to non-existent endpoint returns 404',
            errorType: 'invalid_path',
            expectedStatus: NOT_FOUND,
            request: { url: '/nonexistent' },
            learning_objectives: ['URL routing', '404 error handling']
        })
    ],
    
    // Performance testing scenarios
    performanceScenarios: [
        createTestScenario('Response Time Performance', 'performance', {
            description: 'Test hello endpoint response time is under threshold',
            expectedStatus: OK,
            performance_expectations: {
                response_time: { max: PERFORMANCE_THRESHOLD_MS }
            },
            learning_objectives: ['Performance testing', 'Response time monitoring']
        })
    ],
    
    // Edge case testing scenarios
    edgeCaseScenarios: [
        createTestScenario('Case Sensitive Path', 'edge_case', {
            description: 'Test /Hello (capitalized) returns 404',
            request: { url: '/Hello' },
            expectedStatus: NOT_FOUND,
            learning_objectives: ['URL case sensitivity', 'Path matching']
        })
    ]
};

// =============================================================================
// PERFORMANCE EXPECTATIONS
// =============================================================================

/**
 * Performance expectations and thresholds for validating hello endpoint
 * response times and resource utilization in educational testing
 */
const performanceExpectations = {
    // Performance expectations for HTTP request processing
    requestProcessing: {
        thresholds: {
            maxResponseTime: PERFORMANCE_THRESHOLD_MS,
            averageResponseTime: 50,
            p95ResponseTime: 80,
            maxMemoryUsage: 50 * 1024 * 1024, // 50MB
            timeoutThreshold: EDUCATIONAL_TEST_TIMEOUT
        },
        educational_context: {
            purpose: 'Demonstrate performance testing concepts and benchmarks',
            learning_objectives: [
                'Understanding response time measurement',
                'Setting appropriate performance thresholds',
                'Memory usage monitoring in Node.js applications'
            ]
        }
    },
    
    // Performance expectations for HTTP response generation
    responseGeneration: {
        thresholds: {
            maxGenerationTime: 10,
            headerWriteTime: 5,
            bodyWriteTime: 5,
            responseEndTime: 2
        },
        educational_context: {
            purpose: 'Illustrate response generation performance characteristics',
            learning_objectives: [
                'Understanding response lifecycle timing',
                'Optimizing response generation performance',
                'Educational performance benchmarking'
            ]
        }
    },
    
    // Complete request cycle performance expectations
    completeRequestCycle: {
        thresholds: {
            totalProcessingTime: PERFORMANCE_THRESHOLD_MS,
            requestParsingTime: 5,
            routingTime: 10,
            responseGenerationTime: 15,
            networkTransmissionTime: 20
        },
        educational_context: {
            purpose: 'Comprehensive request cycle performance analysis',
            learning_objectives: [
                'End-to-end performance monitoring',
                'Identifying performance bottlenecks',
                'Request lifecycle optimization'
            ]
        }
    }
};

// =============================================================================
// MODULE EXPORTS
// =============================================================================

module.exports = {
    // Valid request test data for positive testing scenarios
    validRequestData,
    
    // Invalid request test data for error scenario testing
    invalidRequestData,
    
    // Expected response test data for response validation
    expectedResponseData,
    
    // Comprehensive test scenarios for systematic testing
    testScenarios,
    
    // Performance expectations and thresholds
    performanceExpectations,
    
    // Factory functions for creating test data
    createValidRequest,
    createInvalidRequest,
    createExpectedResponse,
    createTestScenario,
    validateTestData,
    
    // Test data constants and configuration
    TEST_DATA_CONSTANTS,
    
    // Global constants for test configuration
    HELLO_ENDPOINT_PATH,
    SUPPORTED_HTTP_METHODS,
    EDUCATIONAL_TEST_TIMEOUT,
    PERFORMANCE_THRESHOLD_MS
};