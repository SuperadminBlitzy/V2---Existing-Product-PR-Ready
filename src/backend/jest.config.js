// Node.js Built-in modules for Jest configuration
const path = require('node:path'); // Node.js Built-in - File path resolution for test files, coverage directories, and configuration paths
const process = require('node:process'); // Node.js Built-in - Environment variable access for test configuration and educational settings

// Global configuration constants for educational testing environment
const TEST_TIMEOUT_MS = 10000; // 10 second timeout for test execution including async operations
const EDUCATIONAL_MODE = true; // Enable educational testing features with enhanced visibility
const COVERAGE_THRESHOLD_GLOBAL = 90; // Global coverage threshold for comprehensive testing standards
const PERFORMANCE_TEST_ENABLED = true; // Enable performance testing capabilities for tutorial application

/**
 * Jest Testing Framework Configuration
 * 
 * Comprehensive testing environment setup for the Node.js tutorial application
 * that demonstrates fundamental HTTP server testing capabilities while providing
 * educational value through detailed reporting, comprehensive coverage analysis,
 * and organized test structure.
 * 
 * This configuration supports:
 * - Unit testing for individual component validation
 * - Integration testing for end-to-end system validation  
 * - Educational testing features with verbose output
 * - Performance testing with timeout management
 * - Comprehensive coverage reporting and analysis
 * - Mock management for isolated testing
 * - Educational debugging and error detection
 */
const jestConfig = {
  // Preset Configuration - No preset used for custom educational Node.js testing setup
  preset: null,

  // Test Environment - Node.js environment for server-side testing of HTTP server components
  testEnvironment: 'node',

  // Test Search Roots - Define root directories for test discovery
  roots: [
    '<rootDir>' // Test search root directory covering entire backend application
  ],

  // Test File Matching Patterns - Comprehensive test file discovery
  testMatch: [
    '**/__tests__/**/*.js', // Match all JavaScript test files in __tests__ directories
    '**/?(*.)+(spec|test).js', // Match spec and test files with naming conventions
    '**/__tests__/**/*.test.js', // Specific test file pattern for unit and integration tests
    '**/__tests__/**/integration.test.js', // Integration test file matching
    '**/__tests__/**/server.test.js' // Server test file matching
  ],

  // Test Path Ignore Patterns - Exclude unnecessary files from test execution
  testPathIgnorePatterns: [
    '/node_modules/', // Exclude npm dependencies from test execution
    '/coverage/', // Exclude coverage reports from test scanning
    '/logs/', // Exclude log files from test execution
    '/.git/' // Exclude git repository files from test scanning
  ],

  // Coverage Collection Configuration - Define which files to include in coverage analysis
  collectCoverageFrom: [
    'lib/**/*.js', // Collect coverage from all library modules
    'server.js', // Include main server file in coverage collection
    'scripts/**/*.js', // Include utility scripts in coverage analysis
    '!lib/**/*.test.js', // Exclude test files from coverage collection
    '!lib/**/*.spec.js', // Exclude spec files from coverage analysis
    '!**/node_modules/**', // Exclude dependencies from coverage
    '!**/coverage/**', // Exclude coverage reports from analysis
    '!**/__tests__/**', // Exclude test directories from coverage
    '!**/logs/**' // Exclude log directories from coverage collection
  ],

  // Coverage Output Directory - Directory for coverage reports and analysis output
  coverageDirectory: 'coverage',

  // Coverage Reporters - Multiple formats for comprehensive coverage analysis
  coverageReporters: [
    'text', // Console text coverage summary for immediate feedback
    'lcov', // LCOV format for integration with external tools
    'html', // HTML coverage reports for detailed analysis
    'json-summary', // JSON summary for programmatic coverage analysis
    'clover' // Clover XML format for CI/CD integration
  ],

  // Coverage Thresholds - Enforce high coverage standards for educational demonstration
  coverageThreshold: {
    global: {
      branches: 80, // Minimum 80% branch coverage for conditional logic testing
      functions: 95, // Minimum 95% function coverage for comprehensive testing
      lines: 90, // Minimum 90% line coverage for thorough code testing
      statements: 90 // Minimum 90% statement coverage for complete validation
    }
  },

  // Test Environment Setup - Educational testing utilities and helpers
  setupFilesAfterEnv: [
    path.resolve(__dirname, '__tests__', 'helpers', 'test-setup.js') // Test environment setup with educational utilities
  ],

  // Test Execution Configuration
  testTimeout: TEST_TIMEOUT_MS, // 10 second timeout for test execution including async operations
  verbose: EDUCATIONAL_MODE, // Detailed test output for educational visibility and debugging
  
  // Mock Management Configuration - Proper test isolation and cleanup
  clearMocks: true, // Clear mock calls between tests for clean test state
  restoreMocks: true, // Restore original implementations after each test
  resetMocks: false, // Preserve mock configurations across tests for consistency

  // Performance and Execution Optimization
  maxWorkers: '50%', // Use 50% of available CPU cores for test execution optimization
  detectOpenHandles: true, // Detect async operations preventing Jest exit for debugging
  forceExit: false, // Allow graceful test suite completion without forcing exit
  bail: 5, // Stop test execution after 5 test failures for rapid feedback

  // Quality Assurance and Error Detection
  errorOnDeprecated: true, // Treat deprecated API usage as errors for future compatibility

  // Educational Testing Features Configuration
  ...(EDUCATIONAL_MODE && {
    // Enhanced educational configuration when educational mode is enabled
    collectCoverage: process.env.NODE_ENV !== 'development', // Collect coverage except during development
    passWithNoTests: true, // Allow test suite to pass when no tests are found during development
    
    // Educational reporting configuration
    reporters: [
      'default', // Standard Jest reporter for basic output
      ['jest-html-reporter', {
        pageTitle: 'Node.js Tutorial Test Report',
        outputPath: path.resolve(__dirname, 'coverage', 'test-report.html'),
        includeFailureMsg: true,
        includeSuiteFailure: true
      }]
    ]
  }),

  // Performance Testing Configuration
  ...(PERFORMANCE_TEST_ENABLED && {
    // Performance testing specific configuration
    slowTestThreshold: 1000, // Mark tests slower than 1 second as slow
    testNamePattern: process.env.PERF_TEST ? '.*performance.*' : undefined // Run only performance tests when specified
  }),

  // Module Resolution Configuration for Educational Structure
  moduleDirectories: [
    'node_modules',
    path.resolve(__dirname, 'lib'), // Custom lib directory for tutorial modules
    path.resolve(__dirname, '__tests__', 'helpers') // Test helpers directory
  ],

  // Transform Configuration - No transforms needed for pure JavaScript
  transform: {},

  // Module File Extensions - Standard JavaScript file extensions
  moduleFileExtensions: [
    'js',
    'json'
  ],

  // Global Variables Available in Tests
  globals: {
    TEST_TIMEOUT_MS,
    EDUCATIONAL_MODE,
    COVERAGE_THRESHOLD_GLOBAL,
    PERFORMANCE_TEST_ENABLED,
    // Educational constants for test environments
    SERVER_PORT: 3000,
    SERVER_HOST: '127.0.0.1',
    API_ENDPOINT: '/hello',
    EXPECTED_RESPONSE: 'Hello world'
  },

  // Test Results Processing Configuration
  testResultsProcessor: undefined, // Use default test results processor

  // Snapshot Configuration for Educational Testing
  snapshotSerializers: [], // No custom snapshot serializers needed

  // Watch Mode Configuration for Development
  watchman: true, // Use Watchman for file watching when available
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/logs/'
  ],

  // Notification Configuration for Educational Feedback
  notify: EDUCATIONAL_MODE, // Enable notifications in educational mode
  notifyMode: 'failure-change', // Notify on test status changes

  // Cache Configuration for Performance
  cache: true, // Enable test result caching for faster subsequent runs
  cacheDirectory: path.resolve(__dirname, '.jest-cache'), // Custom cache directory

  // Educational Documentation and Metadata
  displayName: {
    name: 'Node.js Tutorial Tests',
    color: 'blue'
  },

  // Test Execution Environment Variables
  setupFiles: [], // No additional setup files needed

  // Extension Configuration for Future Educational Enhancements
  extensionsToTreatAsEsm: [], // No ESM extensions for this tutorial

  // Test Matching Configuration
  testRegex: undefined, // Use testMatch instead of testRegex
  
  // Coverage Path Mapping for Educational Structure  
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/__tests__/',
    '/logs/'
  ],

  // Dependency Extraction Configuration
  dependencyExtractor: undefined, // Use default dependency extractor

  // Custom Test Environment Options
  testEnvironmentOptions: {
    // Node.js specific test environment configuration
    node: {
      // Preserve Node.js global objects
      global: true
    }
  }
};

// Export the complete Jest configuration for the Node.js tutorial testing environment
module.exports = jestConfig;