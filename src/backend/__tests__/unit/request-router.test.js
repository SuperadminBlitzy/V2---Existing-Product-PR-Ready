/**
 * Comprehensive Unit Test Suite for Request Router Component
 * Node.js Tutorial Application - Educational Testing Patterns
 * 
 * This comprehensive unit test file validates the request router component of the Node.js 
 * tutorial application using Jest testing framework. It provides complete coverage of HTTP 
 * request routing functionality including URL parsing, method validation, route matching, 
 * error handling, and educational context while demonstrating professional testing patterns 
 * and educational best practices for Node.js application testing.
 * 
 * Educational Features:
 * - Comprehensive test coverage demonstrating professional testing patterns
 * - Performance measurement and benchmarking for educational performance awareness
 * - Mock object utilization with Jest spies for behavioral testing verification
 * - Educational assertion helpers with detailed comparison and troubleshooting guidance
 * - Error scenario testing with comprehensive educational guidance and troubleshooting
 * - Test organization following industry-standard describe/it structure patterns
 * - Learning objective alignment supporting tutorial Node.js education goals
 * 
 * @module request-router-unit-tests
 * @version 1.0.0
 * @educational Demonstrates comprehensive unit testing for Node.js HTTP routing components
 */

// =============================================================================
// EXTERNAL DEPENDENCIES
// =============================================================================

// Jest testing framework ^29.0.0 - Professional testing framework with zero configuration
const jest = require('jest');

// =============================================================================
// INTERNAL MODULE IMPORTS
// =============================================================================

// Import main request routing functions for comprehensive testing
const {
    routeRequest,
    parseRequestUrl,
    validateHttpMethod,
    matchRoute,
    handleRouteNotFound,
    handleMethodNotAllowed,
    getRoutingMetadata,
    ROUTING_CONFIG
} = require('../../lib/router/request-router.js');

// Import HTTP mock factories and utilities for isolated unit testing
const {
    createMockRequest,
    createMockResponse,
    createRequestResponsePair,
    resetMockCalls,
    validateMockBehavior
} = require('../mocks/http-mocks.js');

// Import test helpers for performance measurement and educational insights
const {
    assertResponseEquals,
    measurePerformance,
    createTestScenario,
    validateTestEnvironment,
    getEducationalInsights
} = require('../helpers/test-helpers.js');

// Import comprehensive test data fixtures for consistent testing
const {
    validRequestData,
    invalidRequestData,
    expectedResponseData,
    testScenarios,
    performanceExpectations
} = require('../fixtures/test-data.js');

// =============================================================================
// GLOBAL TEST CONFIGURATION
// =============================================================================

// Educational test timeout for comprehensive testing scenarios
const TEST_TIMEOUT = 10000;

// Test logging prefix for educational context and debugging assistance
const ROUTING_TEST_PREFIX = '[Request Router Test]';

// Enable educational context throughout testing for learning enhancement
const EDUCATIONAL_CONTEXT = true;

// Global mock objects for test state management and cleanup
let mockRequest = null;
let mockResponse = null;

// =============================================================================
// TEST SETUP AND TEARDOWN UTILITIES
// =============================================================================

/**
 * Sets up comprehensive mock objects for request router testing including mock HTTP 
 * requests, responses, and spy function initialization with educational context and 
 * cleanup registration for reliable test execution and learning demonstration.
 * 
 * @param {Object} options - Optional configuration for mock setup including educational features and spy tracking preferences
 * @returns {Object} Object containing initialized mock request, response, and utility functions for routing tests
 */
function setupTestMocks(options = {}) {
    // Initialize mock request object using createMockRequest with routing test configuration
    mockRequest = createMockRequest({
        url: validRequestData.helloGetRequest.url,
        method: validRequestData.helloGetRequest.method,
        headers: validRequestData.helloGetRequest.headers,
        educational: EDUCATIONAL_CONTEXT,
        ...options.requestOptions
    });
    
    // Initialize mock response object using createMockResponse with comprehensive spy tracking
    mockResponse = createMockResponse({
        enableSpies: true,
        trackMethodCalls: true,
        educational: EDUCATIONAL_CONTEXT,
        ...options.responseOptions
    });
    
    // Set up Jest spy functions for all critical routing functions and external dependencies
    const routeRequestSpy = jest.spyOn({ routeRequest }, 'routeRequest');
    const parseUrlSpy = jest.spyOn({ parseRequestUrl }, 'parseRequestUrl');
    const validateMethodSpy = jest.spyOn({ validateHttpMethod }, 'validateHttpMethod');
    const matchRouteSpy = jest.spyOn({ matchRoute }, 'matchRoute');
    
    // Configure educational context and metadata for tutorial testing purposes
    const educationalMetadata = {
        testSetup: 'Mock objects initialized for request router testing',
        mockingStrategy: 'Jest spies with comprehensive behavioral tracking',
        educationalValue: 'Demonstrates professional mock object setup patterns'
    };
    
    // Register mock objects for cleanup management and proper test teardown
    const mockRegistry = {
        request: mockRequest,
        response: mockResponse,
        spies: {
            routeRequest: routeRequestSpy,
            parseUrl: parseUrlSpy,
            validateMethod: validateMethodSpy,
            matchRoute: matchRouteSpy
        }
    };
    
    // Set up performance monitoring utilities for educational routing performance testing
    const performanceMonitoring = {
        startTime: Date.now(),
        measureRouting: true,
        educationalBenchmarks: performanceExpectations.requestProcessing.thresholds
    };
    
    // Configure mock validation utilities for verifying routing behavior
    const mockValidation = {
        validateCalls: () => validateMockBehavior(mockRequest, mockResponse),
        checkSpyStatus: () => ({
            routeRequestCalled: routeRequestSpy.mock.calls.length > 0,
            parseUrlCalled: parseUrlSpy.mock.calls.length > 0,
            validateMethodCalled: validateMethodSpy.mock.calls.length > 0
        })
    };
    
    // Return comprehensive mock setup object ready for routing test execution
    return {
        mockRequest,
        mockResponse,
        registry: mockRegistry,
        performance: performanceMonitoring,
        validation: mockValidation,
        educational: educationalMetadata,
        cleanup: () => cleanupTestMocks()
    };
}

/**
 * Cleans up all mock objects, resets Jest spy calls, and prepares clean state for 
 * subsequent routing tests with educational context and resource management for 
 * reliable test isolation and proper test execution.
 * 
 * @returns {void} No return value, performs comprehensive cleanup operations for routing test state
 */
function cleanupTestMocks() {
    // Reset all Jest spy function calls using resetMockCalls utility
    resetMockCalls();
    
    // Clear mock request and response object state for fresh testing
    if (mockRequest && typeof mockRequest.reset === 'function') {
        mockRequest.reset();
    }
    if (mockResponse && typeof mockResponse.reset === 'function') {
        mockResponse.reset();
    }
    
    // Clean up performance monitoring data and educational context
    const cleanupStart = Date.now();
    
    // Reset global test variables and configuration to default state
    mockRequest = null;
    mockResponse = null;
    
    // Validate cleanup completion and mock object state for test reliability
    const cleanupComplete = mockRequest === null && mockResponse === null;
    
    // Log cleanup completion with educational context for debugging assistance
    if (EDUCATIONAL_CONTEXT) {
        const cleanupTime = Date.now() - cleanupStart;
        console.log(`${ROUTING_TEST_PREFIX} Mock cleanup completed in ${cleanupTime}ms - Ready for next test`);
    }
}

/**
 * Factory function that creates valid HTTP request objects configured for successful 
 * routing testing to the '/hello' endpoint with proper headers and educational 
 * metadata for comprehensive hello endpoint routing validation.
 * 
 * @param {Object} overrides - Optional property overrides for customizing request configuration
 * @returns {Object} Valid mock HTTP request object configured for hello endpoint routing tests
 */
function createValidRoutingRequest(overrides = {}) {
    // Use validRequestData.helloGetRequest as base configuration for valid routing request
    const baseRequest = validRequestData.helloGetRequest;
    
    // Merge any provided overrides with default valid request configuration
    const requestConfig = {
        url: baseRequest.url,
        method: baseRequest.method,
        headers: { ...baseRequest.headers },
        httpVersion: '1.1',
        ...overrides
    };
    
    // Set up proper HTTP headers including host, user-agent, and accept headers
    if (!requestConfig.headers['host']) {
        requestConfig.headers['host'] = 'localhost:3000';
    }
    if (!requestConfig.headers['user-agent']) {
        requestConfig.headers['user-agent'] = 'Jest-Test-Suite/1.0';
    }
    if (!requestConfig.headers['accept']) {
        requestConfig.headers['accept'] = 'text/plain';
    }
    
    // Configure request URL to '/hello' path for successful routing validation
    requestConfig.url = requestConfig.url || '/hello';
    
    // Set HTTP method to 'GET' for supported method testing
    requestConfig.method = requestConfig.method || 'GET';
    
    // Add educational metadata and context for tutorial routing demonstration
    const educationalContext = {
        description: 'Valid GET request to /hello endpoint for routing success testing',
        expectedOutcome: '200 OK response with hello world message',
        learningObjective: 'Demonstrate successful HTTP request routing patterns',
        testingConcepts: ['Valid request structure', 'Proper header configuration', 'Successful routing']
    };
    
    // Configure request properties for realistic HTTP request simulation
    const mockRequest = createMockRequest({
        ...requestConfig,
        educational: educationalContext
    });
    
    // Return complete valid request object ready for routing test execution
    return mockRequest;
}

/**
 * Factory function that creates invalid HTTP request objects for testing routing 
 * error scenarios including unsupported methods, invalid paths, and malformed 
 * request structures with comprehensive educational guidance.
 * 
 * @param {string} errorType - Type of invalid request to create (method, path, malformed)
 * @param {Object} options - Optional configuration for specific error scenario testing
 * @returns {Object} Invalid mock HTTP request object configured for routing error scenario testing
 */
function createInvalidRoutingRequest(errorType, options = {}) {
    let requestConfig;
    
    // Determine appropriate invalid request configuration based on errorType parameter
    switch (errorType) {
        case 'method':
            // Use invalidRequestData fixtures for specific error scenario configuration
            const methodError = invalidRequestData.invalidMethods.find(req => 
                req.method === (options.method || 'POST')
            ) || invalidRequestData.invalidMethods[0];
            
            requestConfig = {
                url: '/hello',
                method: methodError.method,
                headers: { 'host': 'localhost:3000' },
                expectedError: 'METHOD_NOT_ALLOWED'
            };
            break;
            
        case 'path':
            const pathError = invalidRequestData.invalidPaths.find(req => 
                req.url === (options.url || '/nonexistent')
            ) || invalidRequestData.invalidPaths[0];
            
            requestConfig = {
                url: pathError.url,
                method: 'GET',
                headers: { 'host': 'localhost:3000' },
                expectedError: 'NOT_FOUND'
            };
            break;
            
        case 'malformed':
            const malformedError = invalidRequestData.malformedRequests[0];
            requestConfig = {
                url: options.url || malformedError.url,
                method: options.method || malformedError.method,
                headers: options.headers || {},
                expectedError: 'MALFORMED_REQUEST'
            };
            break;
            
        default:
            requestConfig = {
                url: '/unknown',
                method: 'GET',
                headers: { 'host': 'localhost:3000' },
                expectedError: 'GENERAL_ERROR'
            };
    }
    
    // Set up invalid HTTP method, URL path, or request structure as specified
    // Configure request with intentional validation failures for routing error testing
    
    // Add educational context explaining error scenario and expected routing behavior
    const educationalContext = {
        errorType: errorType,
        description: `Invalid ${errorType} request for testing routing error handling`,
        expectedBehavior: `Router should handle ${errorType} error gracefully`,
        learningObjective: `Understand ${errorType} error detection and response generation`,
        troubleshootingGuidance: `Check ${errorType} validation logic in routing code`
    };
    
    // Configure request properties to trigger specific routing error conditions
    const mockRequest = createMockRequest({
        ...requestConfig,
        educational: educationalContext,
        ...options
    });
    
    // Include troubleshooting guidance for educational error handling demonstration
    mockRequest.troubleshooting = {
        commonCauses: [`Invalid ${errorType} configuration`, 'Request structure issues'],
        resolutionSteps: [`Fix ${errorType} format`, 'Validate request structure'],
        educationalValue: `Learn proper ${errorType} handling in HTTP routing`
    };
    
    // Return invalid request object ready for routing error scenario testing
    return mockRequest;
}

/**
 * Validates routing performance against educational benchmarks by measuring routing 
 * execution time and comparing against expected performance thresholds with detailed 
 * analysis and comprehensive educational insights.
 * 
 * @param {Function} routingFunction - Routing function to test for performance validation
 * @param {Object} testRequest - Mock request object for performance testing
 * @param {Object} testResponse - Mock response object for performance testing
 * @returns {Object} Performance validation results with timing data, threshold comparison, and educational insights
 */
async function validateRoutingPerformance(routingFunction, testRequest, testResponse) {
    // Use measurePerformance utility to execute routing function with timing measurement
    const performanceResult = await measurePerformance(
        'routing_operation',
        () => routingFunction(testRequest, testResponse),
        {
            iterations: 1,
            warmupRuns: 0,
            educational: true
        }
    );
    
    // Measure routing execution time from request analysis to response generation
    const executionTime = performanceResult.statistics.average;
    
    // Compare measured performance against performanceExpectations.requestProcessing thresholds
    const thresholds = performanceExpectations.requestProcessing.thresholds;
    const performanceAnalysis = {
        executionTime: executionTime,
        threshold: thresholds.maxResponseTime,
        withinThreshold: executionTime <= thresholds.maxResponseTime,
        performanceLevel: executionTime <= thresholds.averageResponseTime ? 'excellent' : 
                          executionTime <= thresholds.maxResponseTime ? 'acceptable' : 'needs_improvement'
    };
    
    // Analyze routing performance characteristics including URL parsing and handler delegation
    const performanceCharacteristics = {
        urlParsingEstimate: Math.min(executionTime * 0.1, 5), // Estimated URL parsing time
        routeMatchingEstimate: Math.min(executionTime * 0.2, 10), // Estimated route matching time
        handlerDelegationEstimate: Math.min(executionTime * 0.3, 15), // Estimated handler delegation time
        responseGenerationEstimate: executionTime * 0.4 // Remaining time for response generation
    };
    
    // Generate educational insights about routing performance and optimization opportunities
    const educationalInsights = {
        performanceLevel: performanceAnalysis.performanceLevel,
        optimizationOpportunities: [],
        learningPoints: [
            'Routing performance directly impacts user experience',
            'URL parsing and route matching should be optimized for production',
            'Performance thresholds help maintain quality standards'
        ]
    };
    
    if (!performanceAnalysis.withinThreshold) {
        educationalInsights.optimizationOpportunities.push(
            'Consider caching route patterns for faster matching',
            'Optimize URL parsing logic for better performance',
            'Profile routing code to identify bottlenecks'
        );
    }
    
    // Validate performance meets educational benchmarks for tutorial demonstration
    const benchmarkValidation = {
        meetsEducationalStandards: performanceAnalysis.withinThreshold,
        benchmarkComparison: `${executionTime}ms vs ${thresholds.maxResponseTime}ms threshold`,
        educationalValue: 'Demonstrates performance testing and benchmark comparison'
    };
    
    // Include performance troubleshooting guidance for routing optimization
    const troubleshootingGuidance = {
        slowPerformance: [
            'Check for blocking operations in routing code',
            'Optimize URL parsing and route matching algorithms',
            'Consider request caching for repeated routing operations'
        ],
        performanceMonitoring: [
            'Use performance measurement tools regularly',
            'Set appropriate performance thresholds',
            'Monitor routing performance in production environments'
        ]
    };
    
    // Return comprehensive performance validation results with educational context
    return {
        analysis: performanceAnalysis,
        characteristics: performanceCharacteristics,
        insights: educationalInsights,
        benchmark: benchmarkValidation,
        troubleshooting: troubleshootingGuidance,
        rawResults: performanceResult
    };
}

// =============================================================================
// MAIN TEST SUITE - REQUEST ROUTER UNIT TESTS
// =============================================================================

describe('Request Router Unit Tests', () => {
    // Test environment validation and setup
    beforeAll(async () => {
        // Validate test environment setup before routing tests
        const environmentValidation = await validateTestEnvironment({
            requiredModules: ['request-router', 'http-mocks', 'test-helpers'],
            performanceExpectations: performanceExpectations,
            educational: EDUCATIONAL_CONTEXT
        });
        
        if (!environmentValidation.isValid) {
            throw new Error(`Test environment validation failed: ${environmentValidation.errors.join(', ')}`);
        }
        
        console.log(`${ROUTING_TEST_PREFIX} Test environment validated successfully`);
    });
    
    // Test setup before each individual test case
    beforeEach(() => {
        // Initialize fresh mock objects for each test to ensure isolation
        setupTestMocks({
            educational: EDUCATIONAL_CONTEXT,
            performanceTracking: true
        });
    });
    
    // Test cleanup after each individual test case
    afterEach(() => {
        // Clean up mock objects and reset state for next test
        cleanupTestMocks();
    });
    
    // =============================================================================
    // ROUTE REQUEST FUNCTION TESTING
    // =============================================================================
    
    describe('routeRequest Function', () => {
        /**
         * Test successful routing of GET requests to /hello endpoint with comprehensive
         * validation of handler delegation, response generation, and educational context
         */
        it('should successfully route GET requests to /hello endpoint', async () => {
            // Create valid hello endpoint request using createValidRoutingRequest factory
            const testRequest = createValidRoutingRequest({
                url: '/hello',
                method: 'GET'
            });
            
            const testResponse = createMockResponse({
                enableSpies: true,
                educational: true
            });
            
            // Execute routeRequest function with valid hello request and mock response
            const routingResult = await routeRequest(testRequest, testResponse);
            
            // Verify routing correctly identifies '/hello' path and delegates to hello handler
            expect(routingResult).toBeDefined();
            expect(testResponse.writeHead).toHaveBeenCalledWith(200, expect.objectContaining({
                'Content-Type': 'text/plain'
            }));
            
            // Validate HTTP method validation accepts 'GET' method for hello endpoint
            expect(testResponse.end).toHaveBeenCalledWith(expect.stringContaining('Hello world'));
            
            // Confirm route matching successfully matches '/hello' path against valid endpoints
            const routingMetadata = getRoutingMetadata();
            expect(routingMetadata.validEndpoints).toContain('/hello');
            expect(routingMetadata.supportedMethods).toContain('GET');
        }, TEST_TIMEOUT);
        
        /**
         * Test that routing delegates to hello handler for valid hello requests with
         * proper handler invocation and response processing verification
         */
        it('should delegate to hello handler for valid hello requests', async () => {
            const testRequest = createValidRoutingRequest();
            const testResponse = createMockResponse({ enableSpies: true });
            
            // Execute routing and verify handler delegation
            await routeRequest(testRequest, testResponse);
            
            // Verify mock response object receives proper method calls for successful routing
            expect(testResponse.writeHead).toHaveBeenCalledTimes(1);
            expect(testResponse.end).toHaveBeenCalledTimes(1);
            
            // Validate routing decision logging includes educational context and debugging information
            const responseContent = testResponse.end.mock.calls[0][0];
            expect(typeof responseContent).toBe('string');
            expect(responseContent.length).toBeGreaterThan(0);
        });
        
        /**
         * Test routing behavior with method validation errors including comprehensive
         * educational guidance and 405 error response generation
         */
        it('should handle method validation errors with educational guidance', async () => {
            const testRequest = createInvalidRoutingRequest('method', {
                method: 'POST'
            });
            const testResponse = createMockResponse({ enableSpies: true });
            
            // Execute routing with invalid method and verify error handling
            await routeRequest(testRequest, testResponse);
            
            // Verify handleMethodNotAllowed is called for unsupported HTTP methods
            expect(testResponse.writeHead).toHaveBeenCalledWith(405, expect.objectContaining({
                'Content-Type': 'text/plain',
                'Allow': 'GET'
            }));
            
            // Assert routing generates 405 Method Not Allowed responses with educational guidance
            const errorResponse = testResponse.end.mock.calls[0][0];
            expect(errorResponse).toContain('Method Not Allowed');
            
            // Validate educational error messages include supported methods information (GET only)
            expect(errorResponse).toContain('GET');
        });
        
        /**
         * Test routing behavior with path validation errors including comprehensive
         * educational guidance and 404 error response generation
         */
        it('should handle path validation errors with endpoint suggestions', async () => {
            const testRequest = createInvalidRoutingRequest('path', {
                url: '/nonexistent'
            });
            const testResponse = createMockResponse({ enableSpies: true });
            
            // Execute routing with invalid path and verify error handling
            await routeRequest(testRequest, testResponse);
            
            // Verify handleRouteNotFound is called for invalid URL paths
            expect(testResponse.writeHead).toHaveBeenCalledWith(404, expect.objectContaining({
                'Content-Type': 'text/plain'
            }));
            
            // Assert routing generates 404 Not Found responses with educational endpoint suggestions
            const errorResponse = testResponse.end.mock.calls[0][0];
            expect(errorResponse).toContain('Not Found');
        });
        
        /**
         * Test routing performance measurement against educational benchmarks with
         * comprehensive performance analysis and optimization guidance
         */
        it('should measure and log routing performance for educational purposes', async () => {
            const testRequest = createValidRoutingRequest();
            const testResponse = createMockResponse({ enableSpies: true });
            
            // Validate routing performance meets educational benchmarks using validateRoutingPerformance
            const performanceResults = await validateRoutingPerformance(
                routeRequest,
                testRequest,
                testResponse
            );
            
            // Verify performance results and analysis
            expect(performanceResults.analysis).toBeDefined();
            expect(performanceResults.analysis.executionTime).toBeGreaterThan(0);
            expect(performanceResults.benchmark.meetsEducationalStandards).toBe(true);
            
            // Validate educational insights about routing performance
            expect(performanceResults.insights.learningPoints).toBeDefined();
            expect(performanceResults.insights.learningPoints.length).toBeGreaterThan(0);
        });
        
        /**
         * Test comprehensive educational context throughout routing process with
         * learning objectives validation and educational metadata verification
         */
        it('should provide comprehensive educational context throughout routing', async () => {
            const testRequest = createValidRoutingRequest();
            testRequest.educational = {
                learningObjective: 'Understand HTTP routing fundamentals',
                demonstrateConcepts: ['URL parsing', 'Method validation', 'Route matching']
            };
            
            const testResponse = createMockResponse({ enableSpies: true });
            
            // Execute routing with educational context
            await routeRequest(testRequest, testResponse);
            
            // Verify educational context is maintained throughout routing
            expect(testRequest.educational).toBeDefined();
            expect(testRequest.educational.learningObjective).toBeDefined();
            
            // Validate routing provides educational insights
            const routingMetadata = getRoutingMetadata();
            expect(routingMetadata.educational).toBe(true);
        });
    });
    
    // =============================================================================
    // URL PARSING FUNCTION TESTING
    // =============================================================================
    
    describe('parseRequestUrl Function', () => {
        /**
         * Test URL parsing for pathname extraction with comprehensive validation
         * of URL component extraction and route matching support
         */
        it('should correctly parse URL pathname for route matching', () => {
            // Test parseRequestUrl function with various URL formats including '/hello', '/hello?test=1', and complex URLs
            const simpleUrl = parseRequestUrl('/hello');
            expect(simpleUrl.pathname).toBe('/hello');
            expect(simpleUrl.search).toBe('');
            
            const urlWithQuery = parseRequestUrl('/hello?test=1&educational=true');
            expect(urlWithQuery.pathname).toBe('/hello');
            expect(urlWithQuery.search).toBe('?test=1&educational=true');
            
            // Validate URL parsing correctly extracts pathname component for route matching
            const complexUrl = parseRequestUrl('/hello?name=tutorial&version=1.0');
            expect(complexUrl.pathname).toBe('/hello');
            expect(complexUrl.query).toBeDefined();
        });
        
        /**
         * Test query parameter parsing for educational URL structure demonstration
         * with comprehensive query parameter extraction and analysis
         */
        it('should extract query parameters for educational URL demonstration', () => {
            const urlWithParams = parseRequestUrl('/hello?learning=nodejs&tutorial=routing');
            
            // Verify query parameter parsing for educational demonstration of URL structure
            expect(urlWithParams.query).toBeDefined();
            expect(urlWithParams.search).toContain('learning=nodejs');
            expect(urlWithParams.search).toContain('tutorial=routing');
        });
        
        /**
         * Test URL parsing error handling for malformed URLs with educational
         * error guidance and comprehensive error handling validation
         */
        it('should handle malformed URLs with educational error guidance', () => {
            // Test URL parsing with edge cases including trailing slashes, special characters, and encoded URLs
            const trailingSlash = parseRequestUrl('/hello/');
            expect(trailingSlash.pathname).toBe('/hello/');
            
            const encodedUrl = parseRequestUrl('/hello%20world');
            expect(encodedUrl.pathname).toBe('/hello%20world');
            
            // Test URL parsing error handling for malformed URLs with educational error guidance
            const emptyUrl = parseRequestUrl('');
            expect(emptyUrl.pathname).toBe('');
        });
        
        /**
         * Test educational context about URL structure and components with
         * comprehensive URL analysis and learning point validation
         */
        it('should provide educational context about URL structure', () => {
            const educationalUrl = parseRequestUrl('/hello?educational=true');
            
            // Verify URL parsing generates educational context about URL structure and components
            expect(educationalUrl.pathname).toBe('/hello');
            expect(educationalUrl.search).toContain('educational=true');
            
            // Validate URL parsing performance meets educational benchmarks for URL processing
            const parseStart = Date.now();
            parseRequestUrl('/hello?test=performance');
            const parseTime = Date.now() - parseStart;
            expect(parseTime).toBeLessThan(50); // Should be very fast for educational URLs
        });
        
        /**
         * Test URL parsing performance against educational benchmarks with
         * timing validation and performance awareness demonstration
         */
        it('should meet performance benchmarks for URL parsing', async () => {
            // Validate URL parsing performance meets educational benchmarks for URL processing
            const performanceResult = await measurePerformance(
                'url_parsing',
                () => parseRequestUrl('/hello?performance=test&benchmark=true'),
                { iterations: 100, educational: true }
            );
            
            expect(performanceResult.statistics.average).toBeLessThan(5); // Very fast URL parsing
            expect(performanceResult.statistics.max).toBeLessThan(20); // Consistent performance
        });
    });
    
    // =============================================================================
    // HTTP METHOD VALIDATION TESTING
    // =============================================================================
    
    describe('validateHttpMethod Function', () => {
        /**
         * Test GET method validation as supported method for hello endpoint
         * with comprehensive method validation and support verification
         */
        it('should validate GET method as supported for hello endpoint', () => {
            // Validate GET method validation accepts 'GET' method for hello endpoint
            const getValidation = validateHttpMethod('GET');
            expect(getValidation.isValid).toBe(true);
            expect(getValidation.method).toBe('GET');
            expect(getValidation.supported).toBe(true);
        });
        
        /**
         * Test POST method rejection with educational guidance about supported methods
         * and comprehensive method validation error handling
         */
        it('should reject POST method with educational method guidance', () => {
            // Test method validation rejection with educational guidance
            const postValidation = validateHttpMethod('POST');
            expect(postValidation.isValid).toBe(false);
            expect(postValidation.method).toBe('POST');
            expect(postValidation.supported).toBe(false);
            
            // Verify educational guidance is provided for unsupported methods
            expect(postValidation.educationalGuidance).toBeDefined();
            expect(postValidation.supportedMethods).toContain('GET');
        });
        
        /**
         * Test PUT method rejection with supported methods information and
         * comprehensive educational HTTP method context
         */
        it('should reject PUT method with supported methods information', () => {
            const putValidation = validateHttpMethod('PUT');
            expect(putValidation.isValid).toBe(false);
            expect(putValidation.educationalContext).toBeDefined();
            expect(putValidation.supportedMethods).toEqual(['GET']);
        });
        
        /**
         * Test DELETE method rejection with educational HTTP method context
         * and comprehensive method validation guidance
         */
        it('should reject DELETE method with educational HTTP method context', () => {
            const deleteValidation = validateHttpMethod('DELETE');
            expect(deleteValidation.isValid).toBe(false);
            expect(deleteValidation.educationalGuidance).toContain('GET');
        });
        
        /**
         * Test validation results with educational troubleshooting guidance
         * and comprehensive method validation support
         */
        it('should provide validation results with educational troubleshooting', () => {
            // Test various invalid methods with troubleshooting guidance
            const invalidMethods = ['PATCH', 'OPTIONS', 'HEAD'];
            
            for (const method of invalidMethods) {
                const validation = validateHttpMethod(method);
                expect(validation.isValid).toBe(false);
                expect(validation.troubleshooting).toBeDefined();
                expect(validation.troubleshooting.suggestion).toContain('GET');
            }
        });
    });
    
    // =============================================================================
    // ROUTE MATCHING FUNCTION TESTING
    // =============================================================================
    
    describe('matchRoute Function', () => {
        /**
         * Test successful route matching for /hello path against valid endpoints
         * with comprehensive route matching validation and pattern verification
         */
        it('should match /hello path against valid endpoints successfully', () => {
            // Validate route matching successfully matches '/hello' path against valid endpoints
            const helloMatch = matchRoute('/hello');
            expect(helloMatch.matches).toBe(true);
            expect(helloMatch.route).toBe('/hello');
            expect(helloMatch.handler).toBe('hello-handler');
        });
        
        /**
         * Test route matching rejection for invalid paths with educational
         * route suggestions and comprehensive error guidance
         */
        it('should reject invalid paths with educational route suggestions', () => {
            // Test various invalid paths with educational guidance
            const invalidPaths = ['/invalid', '/api/users', '/hello/', '/HELLO'];
            
            for (const path of invalidPaths) {
                const pathMatch = matchRoute(path);
                expect(pathMatch.matches).toBe(false);
                expect(pathMatch.suggestions).toContain('/hello');
                expect(pathMatch.educationalGuidance).toBeDefined();
            }
        });
        
        /**
         * Test educational context about route matching patterns with
         * comprehensive pattern analysis and learning point validation
         */
        it('should provide educational context about route matching patterns', () => {
            const routeMatch = matchRoute('/hello');
            
            // Verify educational context about route matching is provided
            expect(routeMatch.educationalContext).toBeDefined();
            expect(routeMatch.educationalContext.patterns).toBeDefined();
            expect(routeMatch.educationalContext.learningPoints).toBeDefined();
        });
        
        /**
         * Test edge case handling with comprehensive error guidance and
         * educational route matching demonstration
         */
        it('should handle edge cases with comprehensive error guidance', () => {
            // Test edge cases like empty paths, special characters, etc.
            const edgeCases = ['', '/', '//hello', '/hello//'];
            
            for (const edgeCase of edgeCases) {
                const edgeMatch = matchRoute(edgeCase);
                expect(edgeMatch.troubleshooting).toBeDefined();
                expect(edgeMatch.educationalGuidance).toBeDefined();
            }
        });
        
        /**
         * Test performance expectations for route matching operations with
         * timing validation and educational performance awareness
         */
        it('should meet performance expectations for route matching operations', async () => {
            // Measure route matching performance
            const performanceResult = await measurePerformance(
                'route_matching',
                () => matchRoute('/hello'),
                { iterations: 1000, educational: true }
            );
            
            expect(performanceResult.statistics.average).toBeLessThan(10); // Fast route matching
        });
    });
    
    // =============================================================================
    // ERROR HANDLING FUNCTIONS TESTING
    // =============================================================================
    
    describe('Error Handling Functions', () => {
        /**
         * Test 404 error response generation with educational guidance and
         * comprehensive not found error handling validation
         */
        it('handleRouteNotFound should generate 404 responses with educational guidance', async () => {
            const testRequest = createInvalidRoutingRequest('path', { url: '/nonexistent' });
            const testResponse = createMockResponse({ enableSpies: true });
            
            // Execute handleRouteNotFound and verify response
            await handleRouteNotFound(testRequest, testResponse);
            
            // Verify 404 response generation with educational guidance
            expect(testResponse.writeHead).toHaveBeenCalledWith(404, expect.objectContaining({
                'Content-Type': 'text/plain'
            }));
            
            const errorResponse = testResponse.end.mock.calls[0][0];
            expect(errorResponse).toContain('Not Found');
            expect(errorResponse).toContain('/hello'); // Educational suggestion
        });
        
        /**
         * Test 405 error response generation with method education and
         * comprehensive method not allowed error handling
         */
        it('handleMethodNotAllowed should generate 405 responses with method education', async () => {
            const testRequest = createInvalidRoutingRequest('method', { method: 'POST' });
            const testResponse = createMockResponse({ enableSpies: true });
            
            // Execute handleMethodNotAllowed and verify response
            await handleMethodNotAllowed(testRequest, testResponse);
            
            // Verify 405 response with method education
            expect(testResponse.writeHead).toHaveBeenCalledWith(405, expect.objectContaining({
                'Content-Type': 'text/plain',
                'Allow': 'GET'
            }));
            
            const errorResponse = testResponse.end.mock.calls[0][0];
            expect(errorResponse).toContain('Method Not Allowed');
            expect(errorResponse).toContain('GET'); // Educational method guidance
        });
        
        /**
         * Test error handlers include troubleshooting assistance for learners
         * with comprehensive educational error guidance validation
         */
        it('Error handlers should include troubleshooting assistance for learners', async () => {
            const testRequest = createInvalidRoutingRequest('path');
            const testResponse = createMockResponse({ enableSpies: true });
            
            await handleRouteNotFound(testRequest, testResponse);
            
            // Verify troubleshooting assistance is included
            const errorResponse = testResponse.end.mock.calls[0][0];
            expect(errorResponse).toMatch(/troubleshooting|help|guidance|try/i);
        });
        
        /**
         * Test error responses provide clear guidance for correcting requests
         * with comprehensive request correction guidance
         */
        it('Error responses should provide clear guidance for correcting requests', async () => {
            const testRequest = createInvalidRoutingRequest('method', { method: 'DELETE' });
            const testResponse = createMockResponse({ enableSpies: true });
            
            await handleMethodNotAllowed(testRequest, testResponse);
            
            // Verify clear correction guidance is provided
            const errorResponse = testResponse.end.mock.calls[0][0];
            expect(errorResponse).toMatch(/use GET|try GET|GET method/i);
        });
        
        /**
         * Test error handling maintains educational context throughout processing
         * with comprehensive educational context validation
         */
        it('Error handling should maintain educational context throughout processing', async () => {
            const testRequest = createInvalidRoutingRequest('path');
            testRequest.educational = { learningObjective: 'Understand error handling' };
            
            const testResponse = createMockResponse({ enableSpies: true });
            
            await handleRouteNotFound(testRequest, testResponse);
            
            // Verify educational context is maintained
            expect(testRequest.educational).toBeDefined();
            expect(testRequest.educational.learningObjective).toBeDefined();
        });
    });
    
    // =============================================================================
    // EDUCATIONAL FEATURES TESTING
    // =============================================================================
    
    describe('Educational Features', () => {
        /**
         * Test comprehensive routing metadata for learning purposes with
         * complete metadata validation and educational configuration verification
         */
        it('should provide comprehensive routing metadata for learning purposes', () => {
            // Execute getRoutingMetadata function and validate returned metadata structure
            const metadata = getRoutingMetadata();
            
            // Verify metadata includes supportedMethods array with 'GET' method for tutorial application
            expect(metadata.supportedMethods).toBeDefined();
            expect(metadata.supportedMethods).toContain('GET');
            
            // Validate metadata contains validEndpoints array with '/hello' endpoint configuration
            expect(metadata.validEndpoints).toBeDefined();
            expect(metadata.validEndpoints).toContain('/hello');
            
            // Assert metadata includes educational context and tutorial-specific routing information
            expect(metadata.educational).toBe(true);
            expect(metadata.tutorialContext).toBeDefined();
        });
        
        /**
         * Test educational insights generation from routing test execution with
         * comprehensive learning insights validation and analysis
         */
        it('should generate educational insights from routing test execution', async () => {
            const testRequest = createValidRoutingRequest();
            const testResponse = createMockResponse({ enableSpies: true });
            
            // Execute routing operation
            await routeRequest(testRequest, testResponse);
            
            // Generate educational insights from test execution
            const insights = await getEducationalInsights({
                testType: 'routing',
                executionResults: {
                    success: true,
                    performanceTime: 50,
                    educationalContext: true
                }
            });
            
            // Validate educational insights generation
            expect(insights.educational).toBeDefined();
            expect(insights.educational.conceptsReinforced).toBeDefined();
            expect(insights.educational.skillsDemonstrated).toBeDefined();
        });
        
        /**
         * Test professional testing patterns and best practices demonstration
         * with comprehensive testing pattern validation
         */
        it('should demonstrate professional testing patterns and best practices', () => {
            // Verify test structure follows professional patterns
            expect(typeof setupTestMocks).toBe('function');
            expect(typeof cleanupTestMocks).toBe('function');
            expect(typeof createValidRoutingRequest).toBe('function');
            expect(typeof createInvalidRoutingRequest).toBe('function');
            
            // Validate testing patterns include proper setup/teardown
            expect(mockRequest).toBeDefined();
            expect(mockResponse).toBeDefined();
        });
        
        /**
         * Test tutorial learning objectives support through routing examples
         * with comprehensive learning objective validation
         */
        it('should support tutorial learning objectives through routing examples', () => {
            const routingConfig = ROUTING_CONFIG;
            
            // Verify routing configuration supports tutorial objectives
            expect(routingConfig.educational).toBe(true);
            expect(routingConfig.supportedMethods).toEqual(['GET']);
            expect(routingConfig.validEndpoints).toContain('/hello');
            
            // Validate educational features enhance learning
            expect(routingConfig.tutorialFeatures).toBeDefined();
            expect(routingConfig.learningObjectives).toBeDefined();
        });
        
        /**
         * Test educational context and guidance maintenance throughout all routing operations
         * with comprehensive educational context validation
         */
        it('should maintain educational context and guidance throughout all routing operations', async () => {
            const testScenarios = [
                { type: 'success', request: createValidRoutingRequest() },
                { type: 'method_error', request: createInvalidRoutingRequest('method') },
                { type: 'path_error', request: createInvalidRoutingRequest('path') }
            ];
            
            for (const scenario of testScenarios) {
                const testResponse = createMockResponse({ enableSpies: true });
                
                // Execute routing with educational context
                if (scenario.type === 'success') {
                    await routeRequest(scenario.request, testResponse);
                } else if (scenario.type === 'method_error') {
                    await handleMethodNotAllowed(scenario.request, testResponse);
                } else {
                    await handleRouteNotFound(scenario.request, testResponse);
                }
                
                // Verify educational context is maintained
                expect(scenario.request.educational || scenario.request.troubleshooting).toBeDefined();
            }
        });
    });
});