/**
 * Node.js Tutorial Application - Custom Test Runner
 * 
 * This script provides a comprehensive test runner for the Node.js tutorial application
 * that orchestrates educational test execution with enhanced monitoring, reporting, and
 * learning-focused features. It manages the complete testing lifecycle including
 * environment setup, Jest integration, test suite execution, coverage analysis,
 * and educational test reporting while providing enhanced testing capabilities
 * beyond basic Jest execution.
 * 
 * Educational Features:
 * - Comprehensive test execution banner with learning context
 * - Real-time progress monitoring with educational insights
 * - Performance benchmarking with optimization tips
 * - Coverage analysis with improvement recommendations
 * - Educational test reporting with learning outcomes
 * - Failure analysis with troubleshooting guidance
 * 
 * @author Node.js Tutorial Team
 * @version 1.0.0
 * @since 2024-01-01
 */

// =============================================================================
// EXTERNAL DEPENDENCIES
// =============================================================================

const { spawn } = require('node:child_process'); // Node.js Built-in
const path = require('node:path'); // Node.js Built-in
const fs = require('node:fs/promises'); // Node.js Built-in
const process = require('node:process'); // Node.js Built-in

// =============================================================================
// INTERNAL DEPENDENCIES
// =============================================================================

const { 
    info: logInfo, 
    error: logError, 
    warn: logWarn, 
    logServerEvent, 
    startTimer, 
    endTimer 
} = require('../lib/utils/logger.js');

const { 
    testing: testConfig, 
    educational: educationalConfig, 
    environment 
} = require('../lib/config/app-config.js');

const { 
    setupTestEnvironment, 
    teardownTestEnvironment, 
    generateTestReport 
} = require('../__tests__/helpers/test-helpers.js');

// =============================================================================
// GLOBAL VARIABLES
// =============================================================================

let TEST_START_TIME = null;
let TEST_CONFIG = null;
let JEST_PROCESS = null;
let EXIT_CODE = 0;

// =============================================================================
// EDUCATIONAL CONSTANTS
// =============================================================================

const EDUCATIONAL_TEST_PREFIX = '[NODE.JS TUTORIAL]';
const TEST_BANNER_WIDTH = 80;
const PERFORMANCE_BENCHMARKS = {
    fast: 100,
    moderate: 500,
    slow: 1000
};

// =============================================================================
// COMMAND LINE ARGUMENT PARSING
// =============================================================================

/**
 * Parses command line arguments to determine test execution options including test suites to run,
 * coverage requirements, watch mode, and educational features configuration
 * 
 * @param {Array} argv - Command line arguments array from process.argv
 * @returns {object} Parsed command line options with test execution configuration and educational settings
 */
function parseCommandLineArguments(argv) {
    const parseTimer = startTimer('argument_parsing');
    
    try {
        logInfo(`${EDUCATIONAL_TEST_PREFIX} Parsing command line arguments`, {
            argumentCount: argv.length,
            educational: true,
            operation: 'argument_parsing'
        });
        
        const options = {
            // Test execution modes
            testSuites: {
                unit: false,
                integration: false,
                all: true
            },
            
            // Coverage configuration
            coverage: {
                enabled: false,
                threshold: testConfig?.coverage?.threshold || 80,
                generateReport: false
            },
            
            // Watch and interactive modes
            interactive: {
                watchMode: false,
                watchFiles: [],
                silent: false
            },
            
            // Performance and benchmarking
            performance: {
                enabled: false,
                benchmarking: false,
                showTimings: educationalConfig?.performance?.showTimingInfo || true
            },
            
            // Educational features
            educational: {
                verboseOutput: educationalConfig?.logging?.verboseMode || false,
                showBanner: true,
                includeInsights: true,
                troubleshootingTips: educationalConfig?.errors?.includeTroubleshootingTips || true
            },
            
            // Jest configuration overrides
            jestOverrides: {
                timeout: testConfig?.jest?.timeout || 30000,
                maxWorkers: testConfig?.jest?.maxWorkers || '50%',
                bail: false,
                forceExit: true
            }
        };
        
        // Parse command line flags
        for (let i = 2; i < argv.length; i++) {
            const arg = argv[i].toLowerCase();
            
            switch (arg) {
                case '--unit':
                    options.testSuites.unit = true;
                    options.testSuites.all = false;
                    logInfo(`${EDUCATIONAL_TEST_PREFIX} Unit tests only mode enabled`);
                    break;
                    
                case '--integration':
                    options.testSuites.integration = true;
                    options.testSuites.all = false;
                    logInfo(`${EDUCATIONAL_TEST_PREFIX} Integration tests only mode enabled`);
                    break;
                    
                case '--coverage':
                    options.coverage.enabled = true;
                    options.coverage.generateReport = true;
                    logInfo(`${EDUCATIONAL_TEST_PREFIX} Coverage analysis enabled`);
                    break;
                    
                case '--watch':
                    options.interactive.watchMode = true;
                    logInfo(`${EDUCATIONAL_TEST_PREFIX} Watch mode enabled for continuous feedback`);
                    break;
                    
                case '--performance':
                    options.performance.enabled = true;
                    options.performance.benchmarking = true;
                    logInfo(`${EDUCATIONAL_TEST_PREFIX} Performance benchmarking enabled`);
                    break;
                    
                case '--verbose':
                    options.educational.verboseOutput = true;
                    logInfo(`${EDUCATIONAL_TEST_PREFIX} Verbose educational output enabled`);
                    break;
                    
                case '--silent':
                    options.interactive.silent = true;
                    options.educational.showBanner = false;
                    logInfo(`${EDUCATIONAL_TEST_PREFIX} Silent mode enabled for CI/CD environments`);
                    break;
                    
                case '--help':
                    displayUsageInformation();
                    process.exit(0);
                    break;
                    
                default:
                    if (arg.startsWith('--')) {
                        logWarn(`${EDUCATIONAL_TEST_PREFIX} Unknown argument: ${arg}`, {
                            suggestion: 'Use --help to see available options'
                        });
                    }
                    break;
            }
        }
        
        // Validate argument combinations
        if (options.testSuites.unit && options.testSuites.integration) {
            options.testSuites.all = true;
            options.testSuites.unit = false;
            options.testSuites.integration = false;
            logInfo(`${EDUCATIONAL_TEST_PREFIX} Both unit and integration specified - running all tests`);
        }
        
        const parseDuration = endTimer(parseTimer);
        logInfo(`${EDUCATIONAL_TEST_PREFIX} Command line arguments parsed successfully`, {
            parseDuration,
            testMode: options.testSuites.all ? 'all' : (options.testSuites.unit ? 'unit' : 'integration'),
            coverageEnabled: options.coverage.enabled,
            watchMode: options.interactive.watchMode,
            educational: true
        });
        
        return options;
        
    } catch (error) {
        endTimer(parseTimer);
        logError(`${EDUCATIONAL_TEST_PREFIX} Failed to parse command line arguments`, error, {
            troubleshooting: 'Check argument syntax and use --help for guidance'
        });
        throw error;
    }
}

/**
 * Displays usage information and educational guidance for the test runner
 */
function displayUsageInformation() {
    console.log(`
${EDUCATIONAL_TEST_PREFIX} Node.js Tutorial Test Runner Usage Guide

USAGE:
  npm run test [options]
  node scripts/test.js [options]

OPTIONS:
  --unit          Run unit tests only with focused educational output
  --integration   Run integration tests only with end-to-end validation
  --coverage      Generate enhanced coverage report with educational insights
  --watch         Run in watch mode with continuous educational feedback
  --performance   Enable performance benchmarking and optimization tips
  --verbose       Enable verbose educational output with detailed explanations
  --silent        Minimize output for CI/CD environments
  --help          Display this usage information

EDUCATIONAL FEATURES:
  • Comprehensive test execution banner with learning objectives
  • Real-time progress monitoring with educational insights
  • Performance benchmarking with optimization recommendations
  • Coverage analysis with improvement guidance
  • Failure analysis with troubleshooting tips
  • Educational test reporting with learning outcomes

EXAMPLES:
  npm run test                    # Run all tests with educational features
  npm run test -- --coverage     # Run tests with coverage analysis
  npm run test -- --unit --verbose   # Run unit tests with detailed output
  npm run test -- --watch        # Run tests in continuous watch mode

For more information, visit the Node.js Tutorial documentation.
`);
}

// =============================================================================
// TEST EXECUTION BANNER
// =============================================================================

/**
 * Displays educational test execution banner with tutorial context, test configuration,
 * learning objectives, and execution information to provide clear testing context for learners
 * 
 * @param {object} config - Test execution configuration with educational settings and test options
 * @returns {void} No return value, outputs formatted test banner with educational context
 */
function displayTestBanner(config) {
    if (!config.educational.showBanner) {
        return;
    }
    
    try {
        logInfo(`${EDUCATIONAL_TEST_PREFIX} Displaying educational test banner`, {
            educational: true,
            operation: 'banner_display'
        });
        
        const bannerLines = [
            '='.repeat(TEST_BANNER_WIDTH),
            '🚀 NODE.JS TUTORIAL APPLICATION - COMPREHENSIVE TEST EXECUTION',
            '='.repeat(TEST_BANNER_WIDTH),
            '',
            '📚 LEARNING OBJECTIVES:',
            '  • Understanding HTTP server testing fundamentals',
            '  • Practicing automated testing with Jest framework',
            '  • Learning performance measurement and analysis',
            '  • Exploring test-driven development principles',
            '',
            '⚙️  TEST CONFIGURATION:',
            `  • Test Environment: ${environment || 'development'}`,
            `  • Test Suite: ${config.testSuites.all ? 'All Tests' : (config.testSuites.unit ? 'Unit Tests' : 'Integration Tests')}`,
            `  • Coverage Analysis: ${config.coverage.enabled ? 'Enabled' : 'Disabled'}`,
            `  • Performance Benchmarking: ${config.performance.enabled ? 'Enabled' : 'Disabled'}`,
            `  • Watch Mode: ${config.interactive.watchMode ? 'Enabled' : 'Disabled'}`,
            `  • Educational Features: ${config.educational.verboseOutput ? 'Verbose' : 'Standard'}`,
            '',
            '🎯 QUALITY STANDARDS:',
            `  • Coverage Threshold: ${config.coverage.threshold}%`,
            `  • Performance Target: < ${PERFORMANCE_BENCHMARKS.fast}ms response time`,
            `  • Code Quality: ESLint compliance and best practices`,
            `  • Educational Value: Learning objectives assessment`,
            '',
            '🔧 TESTING BEST PRACTICES:',
            '  • Write tests before implementing features (TDD)',
            '  • Keep tests simple, focused, and independent',
            '  • Use descriptive test names and clear assertions',
            '  • Monitor performance and maintain quality thresholds',
            '',
            '📊 EXECUTION DETAILS:',
            `  • Start Time: ${new Date().toLocaleString()}`,
            `  • Jest Configuration: ${path.resolve('jest.config.js')}`,
            `  • Test Timeout: ${config.jestOverrides.timeout}ms`,
            `  • Max Workers: ${config.jestOverrides.maxWorkers}`,
            '',
            '='.repeat(TEST_BANNER_WIDTH),
            '🎓 Happy Learning and Testing! Let\'s build quality software together!',
            '='.repeat(TEST_BANNER_WIDTH),
            ''
        ];
        
        // Display banner with educational styling
        bannerLines.forEach(line => {
            if (line.includes('🚀') || line.includes('🎓')) {
                console.log(`\x1b[1m\x1b[36m${line}\x1b[0m`); // Bold cyan for titles
            } else if (line.startsWith('📚') || line.startsWith('⚙️') || line.startsWith('🎯') || line.startsWith('🔧') || line.startsWith('📊')) {
                console.log(`\x1b[1m\x1b[33m${line}\x1b[0m`); // Bold yellow for sections
            } else if (line.startsWith('  •')) {
                console.log(`\x1b[32m${line}\x1b[0m`); // Green for bullet points
            } else if (line.startsWith('=')) {
                console.log(`\x1b[2m\x1b[37m${line}\x1b[0m`); // Dim white for separators
            } else {
                console.log(line);
            }
        });
        
        logInfo(`${EDUCATIONAL_TEST_PREFIX} Test execution banner displayed successfully`, {
            bannerWidth: TEST_BANNER_WIDTH,
            sectionCount: bannerLines.filter(line => line.startsWith('📚') || line.startsWith('⚙️')).length,
            educational: true
        });
        
    } catch (error) {
        logError(`${EDUCATIONAL_TEST_PREFIX} Failed to display test banner`, error);
        // Continue execution even if banner fails
    }
}

// =============================================================================
// ENVIRONMENT VALIDATION
// =============================================================================

/**
 * Validates the testing environment including Jest installation, test file availability,
 * configuration completeness, and educational testing requirements before test execution
 * 
 * @returns {boolean} True if test environment is valid and ready, throws error with educational guidance if validation fails
 */
async function validateTestEnvironment() {
    const validationTimer = startTimer('environment_validation');
    
    try {
        logInfo(`${EDUCATIONAL_TEST_PREFIX} Validating test environment`, {
            educational: true,
            operation: 'environment_validation'
        });
        
        const validationResults = {
            jestInstallation: false,
            testFiles: false,
            configuration: false,
            testHelpers: false,
            coverageDirectory: false,
            educationalFixtures: false
        };
        
        // Verify Jest testing framework installation and version compatibility
        try {
            const jestPackage = require.resolve('jest');
            if (jestPackage) {
                validationResults.jestInstallation = true;
                logInfo(`${EDUCATIONAL_TEST_PREFIX} Jest framework found and accessible`, {
                    jestPath: jestPackage
                });
            }
        } catch (error) {
            logError(`${EDUCATIONAL_TEST_PREFIX} Jest framework not found`, error, {
                troubleshooting: 'Run "npm install jest --save-dev" to install Jest testing framework'
            });
            throw new Error('Jest testing framework is required but not installed');
        }
        
        // Check test file availability and test suite completeness
        try {
            const testDirectory = path.resolve('__tests__');
            await fs.access(testDirectory);
            
            const testFiles = await fs.readdir(testDirectory, { recursive: true });
            const jsTestFiles = testFiles.filter(file => file.endsWith('.test.js') || file.endsWith('.spec.js'));
            
            if (jsTestFiles.length > 0) {
                validationResults.testFiles = true;
                logInfo(`${EDUCATIONAL_TEST_PREFIX} Test files found`, {
                    testDirectory,
                    testFileCount: jsTestFiles.length,
                    testFiles: jsTestFiles.slice(0, 5) // Show first 5 files
                });
            } else {
                logWarn(`${EDUCATIONAL_TEST_PREFIX} No test files found in test directory`, {
                    testDirectory,
                    troubleshooting: 'Create test files with .test.js or .spec.js extensions'
                });
            }
        } catch (error) {
            logWarn(`${EDUCATIONAL_TEST_PREFIX} Test directory not accessible`, {
                error: error.message,
                troubleshooting: 'Create __tests__ directory and add test files'
            });
        }
        
        // Validate Jest configuration file and educational test settings
        try {
            const jestConfigPath = path.resolve('jest.config.js');
            await fs.access(jestConfigPath);
            
            validationResults.configuration = true;
            logInfo(`${EDUCATIONAL_TEST_PREFIX} Jest configuration file found`, {
                configPath: jestConfigPath
            });
        } catch (error) {
            logWarn(`${EDUCATIONAL_TEST_PREFIX} Jest configuration file not found`, {
                troubleshooting: 'Create jest.config.js file with test configuration'
            });
        }
        
        // Verify test helper utilities and mock objects availability
        try {
            const testHelpersPath = path.resolve('__tests__/helpers/test-helpers.js');
            await fs.access(testHelpersPath);
            
            validationResults.testHelpers = true;
            logInfo(`${EDUCATIONAL_TEST_PREFIX} Test helpers found and accessible`, {
                helpersPath: testHelpersPath
            });
        } catch (error) {
            logError(`${EDUCATIONAL_TEST_PREFIX} Test helpers not found`, error, {
                troubleshooting: 'Ensure __tests__/helpers/test-helpers.js exists and is accessible'
            });
        }
        
        // Check coverage reporting tools and output directory configuration
        try {
            const coverageDir = path.resolve('coverage');
            // Create coverage directory if it doesn't exist
            await fs.mkdir(coverageDir, { recursive: true });
            
            validationResults.coverageDirectory = true;
            logInfo(`${EDUCATIONAL_TEST_PREFIX} Coverage directory prepared`, {
                coverageDir
            });
        } catch (error) {
            logWarn(`${EDUCATIONAL_TEST_PREFIX} Coverage directory setup failed`, {
                error: error.message
            });
        }
        
        // Validate educational test fixtures and scenario data
        try {
            const fixturesPath = path.resolve('__tests__/fixtures');
            await fs.access(fixturesPath);
            
            validationResults.educationalFixtures = true;
            logInfo(`${EDUCATIONAL_TEST_PREFIX} Educational test fixtures found`, {
                fixturesPath
            });
        } catch (error) {
            logInfo(`${EDUCATIONAL_TEST_PREFIX} Educational fixtures not found (optional)`, {
                fixturesPath: path.resolve('__tests__/fixtures'),
                note: 'Fixtures are optional for basic testing'
            });
        }
        
        const validationDuration = endTimer(validationTimer);
        
        // Determine overall validation status
        const criticalChecks = [
            validationResults.jestInstallation,
            validationResults.testHelpers
        ];
        
        const isValid = criticalChecks.every(check => check === true);
        
        logInfo(`${EDUCATIONAL_TEST_PREFIX} Environment validation completed`, {
            validationDuration,
            isValid,
            validationResults,
            educational: true
        });
        
        if (!isValid) {
            throw new Error('Test environment validation failed - missing critical dependencies');
        }
        
        return true;
        
    } catch (error) {
        endTimer(validationTimer);
        logError(`${EDUCATIONAL_TEST_PREFIX} Test environment validation failed`, error, {
            troubleshooting: [
                'Ensure Jest is installed: npm install jest --save-dev',
                'Verify test files exist in __tests__ directory',
                'Check that test-helpers.js is properly configured',
                'Review jest.config.js configuration file'
            ]
        });
        throw error;
    }
}

// =============================================================================
// JEST CONFIGURATION
// =============================================================================

/**
 * Configures Jest test execution with educational enhancements, performance monitoring,
 * custom reporters, and tutorial-specific testing features based on command line options
 * and application configuration
 * 
 * @param {object} options - Test execution options from command line parsing and configuration
 * @returns {object} Complete Jest execution configuration with educational enhancements and custom settings
 */
function configureTestExecution(options) {
    const configTimer = startTimer('test_configuration');
    
    try {
        logInfo(`${EDUCATIONAL_TEST_PREFIX} Configuring Jest test execution`, {
            educational: true,
            operation: 'test_configuration'
        });
        
        // Load base Jest configuration from jest.config.js
        const baseConfig = {
            testEnvironment: 'node',
            collectCoverage: options.coverage.enabled,
            coverageDirectory: './coverage',
            coverageReporters: ['text', 'lcov', 'html'],
            testTimeout: options.jestOverrides.timeout,
            maxWorkers: options.jestOverrides.maxWorkers,
            forceExit: options.jestOverrides.forceExit,
            verbose: options.educational.verboseOutput
        };
        
        // Apply command line option overrides and customizations
        const jestConfig = { ...baseConfig };
        
        // Configure test pattern based on test suite selection
        if (options.testSuites.unit) {
            jestConfig.testMatch = ['**/__tests__/**/*.unit.test.js', '**/*.unit.spec.js'];
            jestConfig.displayName = 'Unit Tests';
        } else if (options.testSuites.integration) {
            jestConfig.testMatch = ['**/__tests__/**/*.integration.test.js', '**/*.integration.spec.js'];
            jestConfig.displayName = 'Integration Tests';
        } else {
            jestConfig.testMatch = ['**/__tests__/**/*.test.js', '**/__tests__/**/*.spec.js'];
            jestConfig.displayName = 'All Tests';
        }
        
        // Configure educational test reporters and output formatting
        const reporters = ['default'];
        
        if (options.educational.verboseOutput) {
            reporters.push(['jest-html-reporter', {
                pageTitle: 'Node.js Tutorial - Test Results',
                outputPath: './coverage/test-report.html',
                includeFailureMsg: true,
                includeSuiteFailure: true,
                includeConsoleLog: true
            }]);
        }
        
        jestConfig.reporters = reporters;
        
        // Set up performance monitoring and benchmark configuration
        if (options.performance.enabled) {
            jestConfig.setupFilesAfterEnv = ['<rootDir>/__tests__/setup/performance-setup.js'];
        }
        
        // Configure coverage collection with educational thresholds
        if (options.coverage.enabled) {
            jestConfig.collectCoverageFrom = [
                'src/**/*.js',
                '!src/**/*.test.js',
                '!src/**/*.spec.js',
                '!**/node_modules/**',
                '!**/coverage/**'
            ];
            
            jestConfig.coverageThreshold = {
                global: {
                    branches: options.coverage.threshold,
                    functions: options.coverage.threshold,
                    lines: options.coverage.threshold,
                    statements: options.coverage.threshold
                }
            };
        }
        
        // Set up test environment variables and educational context
        jestConfig.testEnvironment = 'node';
        jestConfig.setupFiles = ['<rootDir>/__tests__/setup/test-env.js'];
        
        // Configure custom test execution timeout and retry settings
        if (options.interactive.watchMode) {
            jestConfig.watchMode = true;
            jestConfig.watchAll = false;
            jestConfig.watchPathIgnorePatterns = [
                'coverage/',
                'node_modules/',
                '*.log'
            ];
        }
        
        const configDuration = endTimer(configTimer);
        
        logInfo(`${EDUCATIONAL_TEST_PREFIX} Jest configuration completed`, {
            configDuration,
            testPattern: jestConfig.testMatch,
            coverageEnabled: jestConfig.collectCoverage,
            watchMode: jestConfig.watchMode,
            maxWorkers: jestConfig.maxWorkers,
            educational: true
        });
        
        return jestConfig;
        
    } catch (error) {
        endTimer(configTimer);
        logError(`${EDUCATIONAL_TEST_PREFIX} Failed to configure Jest test execution`, error, {
            troubleshooting: 'Check Jest configuration and command line options'
        });
        throw error;
    }
}

// =============================================================================
// JEST TEST EXECUTION
// =============================================================================

/**
 * Executes Jest test runner with enhanced monitoring, educational logging,
 * real-time progress reporting, and comprehensive error handling for tutorial test execution
 * 
 * @param {object} jestConfig - Complete Jest configuration with educational enhancements and execution options
 * @returns {Promise} Promise resolving to test execution results with performance metrics and educational insights
 */
async function executeJestTests(jestConfig) {
    const executionTimer = startTimer('jest_execution');
    
    try {
        logInfo(`${EDUCATIONAL_TEST_PREFIX} Starting Jest test execution`, {
            testPattern: jestConfig.testMatch,
            watchMode: jestConfig.watchMode,
            coverageEnabled: jestConfig.collectCoverage,
            educational: true
        });
        
        return new Promise((resolve, reject) => {
            // Build Jest command line arguments
            const jestArgs = [
                '--config', JSON.stringify(jestConfig),
                '--passWithNoTests'
            ];
            
            if (jestConfig.watchMode) {
                jestArgs.push('--watch');
            }
            
            if (jestConfig.collectCoverage) {
                jestArgs.push('--coverage');
            }
            
            if (jestConfig.verbose) {
                jestArgs.push('--verbose');
            }
            
            logInfo(`${EDUCATIONAL_TEST_PREFIX} Spawning Jest process`, {
                jestArgs: jestArgs.filter(arg => arg !== JSON.stringify(jestConfig)), // Exclude large config object
                educational: true
            });
            
            // Spawn Jest process with configured options and educational enhancements
            JEST_PROCESS = spawn('npx', ['jest', ...jestArgs], {
                stdio: ['inherit', 'pipe', 'pipe'],
                env: {
                    ...process.env,
                    NODE_ENV: 'test',
                    EDUCATIONAL_MODE: 'true',
                    JEST_WORKER_ID: undefined // Clear worker ID to avoid issues
                }
            });
            
            let testOutput = '';
            let errorOutput = '';
            const testResults = {
                success: false,
                exitCode: null,
                performance: {
                    startTime: Date.now(),
                    endTime: null,
                    duration: null
                },
                output: {
                    stdout: '',
                    stderr: ''
                },
                coverage: {
                    enabled: jestConfig.collectCoverage,
                    results: null
                },
                educational: {
                    insights: [],
                    recommendations: []
                }
            };
            
            // Set up real-time output monitoring and progress reporting
            JEST_PROCESS.stdout.on('data', (data) => {
                const output = data.toString();
                testOutput += output;
                
                // Log educational progress information
                if (output.includes('PASS') || output.includes('FAIL')) {
                    const lines = output.split('\n').filter(line => line.trim());
                    lines.forEach(line => {
                        if (line.includes('PASS')) {
                            logInfo(`${EDUCATIONAL_TEST_PREFIX} ${line.trim()}`, { educational: true });
                        } else if (line.includes('FAIL')) {
                            logError(`${EDUCATIONAL_TEST_PREFIX} ${line.trim()}`, null, { educational: true });
                        }
                    });
                }
                
                // Stream output to console for real-time feedback
                if (!jestConfig.watchMode) {
                    process.stdout.write(output);
                }
            });
            
            // Handle Jest process stderr for educational logging
            JEST_PROCESS.stderr.on('data', (data) => {
                const error = data.toString();
                errorOutput += error;
                
                // Filter out non-critical warnings and focus on educational errors
                if (!error.includes('ExperimentalWarning') && !error.includes('DeprecationWarning')) {
                    logWarn(`${EDUCATIONAL_TEST_PREFIX} Jest warning/error`, {
                        message: error.trim(),
                        educational: true
                    });
                }
                
                process.stderr.write(error);
            });
            
            // Handle Jest process completion
            JEST_PROCESS.on('close', async (code) => {
                testResults.exitCode = code;
                testResults.success = code === 0;
                testResults.performance.endTime = Date.now();
                testResults.performance.duration = testResults.performance.endTime - testResults.performance.startTime;
                testResults.output.stdout = testOutput;
                testResults.output.stderr = errorOutput;
                
                const executionDuration = endTimer(executionTimer);
                
                logInfo(`${EDUCATIONAL_TEST_PREFIX} Jest execution completed`, {
                    exitCode: code,
                    success: testResults.success,
                    executionDuration,
                    totalDuration: testResults.performance.duration,
                    educational: true
                });
                
                // Add educational insights based on execution results
                if (testResults.success) {
                    testResults.educational.insights.push({
                        category: 'SUCCESS',
                        message: 'All tests passed successfully! This demonstrates good code quality and testing practices.',
                        learningValue: 'Successful test execution indicates reliable code and comprehensive test coverage.'
                    });
                } else {
                    testResults.educational.insights.push({
                        category: 'FAILURE',
                        message: 'Some tests failed. This is a learning opportunity to improve code quality.',
                        learningValue: 'Test failures help identify issues early and guide improvements.'
                    });
                }
                
                resolve(testResults);
            });
            
            // Handle Jest process errors
            JEST_PROCESS.on('error', (error) => {
                endTimer(executionTimer);
                logError(`${EDUCATIONAL_TEST_PREFIX} Jest process failed to start`, error, {
                    troubleshooting: 'Ensure Jest is properly installed and accessible'
                });
                reject(error);
            });
            
            // Monitor test execution performance and resource usage
            const performanceMonitor = setInterval(() => {
                if (JEST_PROCESS && !JEST_PROCESS.killed) {
                    logInfo(`${EDUCATIONAL_TEST_PREFIX} Test execution in progress`, {
                        elapsedTime: Date.now() - testResults.performance.startTime,
                        processId: JEST_PROCESS.pid,
                        educational: true
                    });
                }
            }, 10000); // Log every 10 seconds
            
            // Clean up performance monitor when process completes
            JEST_PROCESS.on('close', () => {
                clearInterval(performanceMonitor);
            });
        });
        
    } catch (error) {
        endTimer(executionTimer);
        logError(`${EDUCATIONAL_TEST_PREFIX} Jest test execution failed`, error, {
            troubleshooting: 'Check Jest configuration and test file syntax'
        });
        throw error;
    }
}

// =============================================================================
// COVERAGE ANALYSIS
// =============================================================================

/**
 * Analyzes test coverage results with educational insights, threshold validation,
 * improvement recommendations, and tutorial-specific coverage guidance for learning demonstration
 * 
 * @param {string} coverageDir - Directory containing coverage results and reports
 * @returns {object} Coverage analysis results with educational insights and improvement recommendations
 */
async function analyzeCoverageResults(coverageDir) {
    const analysisTimer = startTimer('coverage_analysis');
    
    try {
        logInfo(`${EDUCATIONAL_TEST_PREFIX} Analyzing test coverage results`, {
            coverageDir,
            educational: true,
            operation: 'coverage_analysis'
        });
        
        const coverageAnalysis = {
            summary: {
                analysisTime: Date.now(),
                coverageDir,
                reportAvailable: false
            },
            metrics: {
                lines: { covered: 0, total: 0, percentage: 0 },
                functions: { covered: 0, total: 0, percentage: 0 },
                branches: { covered: 0, total: 0, percentage: 0 },
                statements: { covered: 0, total: 0, percentage: 0 }
            },
            thresholds: {
                target: testConfig?.coverage?.threshold || 80,
                met: false,
                details: {}
            },
            educational: {
                insights: [],
                recommendations: [],
                improvementAreas: []
            },
            files: {
                uncoveredFiles: [],
                lowCoverageFiles: [],
                wellTestedFiles: []
            }
        };
        
        // Read coverage results from JSON summary and detailed reports
        try {
            const coverageSummaryPath = path.join(coverageDir, 'coverage-summary.json');
            const coverageSummaryData = await fs.readFile(coverageSummaryPath, 'utf8');
            const coverageSummary = JSON.parse(coverageSummaryData);
            
            coverageAnalysis.summary.reportAvailable = true;
            
            // Extract overall coverage metrics
            if (coverageSummary.total) {
                const total = coverageSummary.total;
                coverageAnalysis.metrics = {
                    lines: {
                        covered: total.lines.covered,
                        total: total.lines.total,
                        percentage: total.lines.pct
                    },
                    functions: {
                        covered: total.functions.covered,
                        total: total.functions.total,
                        percentage: total.functions.pct
                    },
                    branches: {
                        covered: total.branches.covered,
                        total: total.branches.total,
                        percentage: total.branches.pct
                    },
                    statements: {
                        covered: total.statements.covered,
                        total: total.statements.total,
                        percentage: total.statements.pct
                    }
                };
            }
            
            logInfo(`${EDUCATIONAL_TEST_PREFIX} Coverage summary loaded successfully`, {
                linesCoverage: coverageAnalysis.metrics.lines.percentage,
                functionsCoverage: coverageAnalysis.metrics.functions.percentage,
                branchesCoverage: coverageAnalysis.metrics.branches.percentage,
                educational: true
            });
            
        } catch (error) {
            logWarn(`${EDUCATIONAL_TEST_PREFIX} Coverage summary not available`, {
                coverageSummaryPath: path.join(coverageDir, 'coverage-summary.json'),
                error: error.message,
                troubleshooting: 'Ensure coverage collection is enabled and tests have run'
            });
        }
        
        // Analyze coverage metrics against educational thresholds
        const thresholdTarget = coverageAnalysis.thresholds.target;
        const metrics = coverageAnalysis.metrics;
        
        coverageAnalysis.thresholds.details = {
            lines: metrics.lines.percentage >= thresholdTarget,
            functions: metrics.functions.percentage >= thresholdTarget,
            branches: metrics.branches.percentage >= thresholdTarget,
            statements: metrics.statements.percentage >= thresholdTarget
        };
        
        coverageAnalysis.thresholds.met = Object.values(coverageAnalysis.thresholds.details).every(met => met);
        
        // Generate educational coverage insights for learning purposes
        if (coverageAnalysis.thresholds.met) {
            coverageAnalysis.educational.insights.push({
                category: 'EXCELLENT_COVERAGE',
                message: `Excellent code coverage! All metrics meet the ${thresholdTarget}% threshold.`,
                learningValue: 'High coverage indicates comprehensive testing and reduces the risk of undetected bugs.',
                celebration: true
            });
        } else {
            coverageAnalysis.educational.insights.push({
                category: 'IMPROVEMENT_OPPORTUNITY',
                message: `Coverage below ${thresholdTarget}% threshold provides opportunity for improvement.`,
                learningValue: 'Identifying coverage gaps helps improve test quality and code reliability.',
                actionRequired: true
            });
        }
        
        // Identify uncovered code areas with educational context
        const improvementAreas = [];
        if (metrics.lines.percentage < thresholdTarget) {
            improvementAreas.push(`Line coverage: ${metrics.lines.percentage}% (target: ${thresholdTarget}%)`);
        }
        if (metrics.functions.percentage < thresholdTarget) {
            improvementAreas.push(`Function coverage: ${metrics.functions.percentage}% (target: ${thresholdTarget}%)`);
        }
        if (metrics.branches.percentage < thresholdTarget) {
            improvementAreas.push(`Branch coverage: ${metrics.branches.percentage}% (target: ${thresholdTarget}%)`);
        }
        
        coverageAnalysis.educational.improvementAreas = improvementAreas;
        
        // Generate improvement recommendations for test coverage
        if (improvementAreas.length > 0) {
            coverageAnalysis.educational.recommendations.push({
                priority: 'HIGH',
                category: 'COVERAGE_IMPROVEMENT',
                title: 'Increase Test Coverage',
                description: 'Add tests for uncovered code areas to improve overall quality',
                actionItems: [
                    'Identify uncovered lines using coverage report',
                    'Write unit tests for uncovered functions',
                    'Add integration tests for complex workflows',
                    'Consider edge cases and error conditions'
                ],
                educationalContext: 'Higher coverage typically correlates with fewer production bugs'
            });
        }
        
        // Create educational coverage insights for learning purposes
        coverageAnalysis.educational.recommendations.push({
            priority: 'MEDIUM',
            category: 'TESTING_BEST_PRACTICES',
            title: 'Maintain Quality Over Quantity',
            description: 'Focus on meaningful tests rather than just achieving high coverage percentages',
            actionItems: [
                'Write tests that validate business logic',
                'Include both positive and negative test cases',
                'Test error handling and edge conditions',
                'Ensure tests are maintainable and readable'
            ],
            educationalContext: '100% coverage doesn\'t guarantee bug-free code, but quality tests do'
        });
        
        const analysisDuration = endTimer(analysisTimer);
        coverageAnalysis.summary.analysisDuration = analysisDuration;
        
        logInfo(`${EDUCATIONAL_TEST_PREFIX} Coverage analysis completed`, {
            analysisDuration,
            overallCoverage: Math.round(
                (metrics.lines.percentage + metrics.functions.percentage + 
                 metrics.branches.percentage + metrics.statements.percentage) / 4
            ),
            thresholdMet: coverageAnalysis.thresholds.met,
            improvementAreas: improvementAreas.length,
            educational: true
        });
        
        return coverageAnalysis;
        
    } catch (error) {
        endTimer(analysisTimer);
        logError(`${EDUCATIONAL_TEST_PREFIX} Coverage analysis failed`, error, {
            troubleshooting: 'Check coverage report generation and file accessibility'
        });
        throw error;
    }
}

// =============================================================================
// EDUCATIONAL TEST REPORTING
// =============================================================================

/**
 * Generates comprehensive educational test report with performance metrics, coverage analysis,
 * learning insights, and tutorial-specific recommendations for educational test execution analysis
 * 
 * @param {object} testResults - Complete test execution results with performance and coverage data
 * @param {object} options - Report generation options including format and educational preferences
 * @returns {object} Complete educational test report with insights, metrics, and recommendations
 */
async function generateEducationalTestReport(testResults, options = {}) {
    const reportTimer = startTimer('test_report_generation');
    
    try {
        logInfo(`${EDUCATIONAL_TEST_PREFIX} Generating comprehensive educational test report`, {
            educational: true,
            operation: 'report_generation'
        });
        
        const reportOptions = {
            includePerformance: true,
            includeCoverage: true,
            includeInsights: true,
            includeRecommendations: true,
            format: 'comprehensive',
            ...options
        };
        
        // Use generateTestReport from test helpers
        const baseReport = await generateTestReport(testResults, reportOptions);
        
        // Enhance with educational content
        const educationalReport = {
            ...baseReport,
            metadata: {
                ...baseReport.metadata,
                generatedAt: new Date().toISOString(),
                reportType: 'educational',
                tutorialApplication: 'Node.js HTTP Server Tutorial',
                educationalObjectives: [
                    'Understanding HTTP server fundamentals',
                    'Learning automated testing practices',
                    'Practicing performance measurement',
                    'Exploring quality assurance techniques'
                ]
            },
            educational: {
                learningOutcomes: [],
                skillsDemonstrated: [],
                improvementOpportunities: [],
                nextSteps: [],
                troubleshootingTips: []
            }
        };
        
        // Assess educational learning outcomes and objectives
        if (testResults.success) {
            educationalReport.educational.learningOutcomes.push({
                outcome: 'TESTING_FUNDAMENTALS',
                achieved: true,
                description: 'Successfully demonstrated understanding of automated testing concepts',
                evidence: 'All tests executed successfully with proper setup and teardown'
            });
            
            educationalReport.educational.skillsDemonstrated.push(
                'Test environment setup and configuration',
                'HTTP server testing with Jest framework',
                'Test result analysis and interpretation',
                'Quality metrics evaluation'
            );
        } else {
            educationalReport.educational.improvementOpportunities.push({
                area: 'TEST_DEBUGGING',
                description: 'Opportunity to practice debugging failed tests',
                learningValue: 'Debugging skills are essential for effective development',
                recommendedActions: [
                    'Analyze test failure messages carefully',
                    'Use console logging for debugging',
                    'Check test expectations against actual results',
                    'Verify test environment setup'
                ]
            });
        }
        
        // Generate recommendations for test improvement and learning
        educationalReport.educational.nextSteps = [
            {
                level: 'IMMEDIATE',
                action: 'Review Test Results',
                description: 'Analyze test outcomes and performance metrics',
                timeframe: 'Now'
            },
            {
                level: 'SHORT_TERM',
                action: 'Improve Coverage',
                description: 'Add tests for uncovered code areas',
                timeframe: 'This week'
            },
            {
                level: 'LONG_TERM',
                action: 'Advanced Testing',
                description: 'Explore integration and end-to-end testing',
                timeframe: 'Next sprint'
            }
        ];
        
        // Add troubleshooting tips for common testing issues
        educationalReport.educational.troubleshootingTips = [
            {
                issue: 'Tests failing locally but passing in CI',
                causes: ['Environment differences', 'Timing issues', 'Dependency versions'],
                solutions: ['Use consistent Node.js versions', 'Mock external dependencies', 'Add proper test timeouts']
            },
            {
                issue: 'Slow test execution',
                causes: ['Heavy setup/teardown', 'External service calls', 'Inefficient test logic'],
                solutions: ['Optimize test data creation', 'Mock external services', 'Use parallel test execution']
            },
            {
                issue: 'Flaky tests',
                causes: ['Timing dependencies', 'Shared state', 'External dependencies'],
                solutions: ['Add proper wait conditions', 'Ensure test isolation', 'Mock unpredictable dependencies']
            }
        ];
        
        // Format report with tutorial-appropriate presentation and guidance
        const reportSummary = {
            success: testResults.success,
            totalTests: baseReport.summary?.totalTests || 0,
            passedTests: baseReport.summary?.passedTests || 0,
            failedTests: baseReport.summary?.failedTests || 0,
            executionTime: testResults.performance?.duration || 0,
            coveragePercentage: baseReport.coverage?.overall?.percentage || 0,
            educationalValue: 'HIGH'
        };
        
        educationalReport.summary = reportSummary;
        
        // Save report to coverage directory and return summary results
        try {
            const reportPath = path.resolve('coverage', 'educational-test-report.json');
            await fs.writeFile(reportPath, JSON.stringify(educationalReport, null, 2));
            
            logInfo(`${EDUCATIONAL_TEST_PREFIX} Educational test report saved`, {
                reportPath,
                reportSize: JSON.stringify(educationalReport).length,
                educational: true
            });
            
        } catch (error) {
            logWarn(`${EDUCATIONAL_TEST_PREFIX} Failed to save test report`, {
                error: error.message,
                note: 'Report still available in memory'
            });
        }
        
        const reportDuration = endTimer(reportTimer);
        
        logInfo(`${EDUCATIONAL_TEST_PREFIX} Educational test report generated successfully`, {
            reportDuration,
            reportSections: Object.keys(educationalReport).length,
            learningOutcomes: educationalReport.educational.learningOutcomes.length,
            educational: true
        });
        
        return educationalReport;
        
    } catch (error) {
        endTimer(reportTimer);
        logError(`${EDUCATIONAL_TEST_PREFIX} Failed to generate educational test report`, error, {
            troubleshooting: 'Check test results data structure and report generation settings'
        });
        throw error;
    }
}

// =============================================================================
// FAILURE HANDLING
// =============================================================================

/**
 * Handles test failures with educational context, detailed error analysis, troubleshooting guidance,
 * and learning-focused failure investigation for tutorial test execution
 * 
 * @param {object} testResults - Test execution results containing failure information and details
 * @returns {void} No return value, logs failure analysis and educational guidance
 */
function handleTestFailures(testResults) {
    try {
        logError(`${EDUCATIONAL_TEST_PREFIX} Test execution completed with failures`, {
            exitCode: testResults.exitCode,
            educational: true,
            operation: 'failure_analysis'
        });
        
        // Analyze test failure patterns and categorize failure types
        const failureAnalysis = {
            categories: [],
            commonPatterns: [],
            educationalGuidance: [],
            troubleshootingSteps: []
        };
        
        // Extract detailed error messages and stack traces
        if (testResults.output && testResults.output.stderr) {
            const errorOutput = testResults.output.stderr;
            
            // Common failure patterns analysis
            if (errorOutput.includes('EADDRINUSE')) {
                failureAnalysis.categories.push('PORT_CONFLICT');
                failureAnalysis.commonPatterns.push({
                    pattern: 'Port already in use',
                    description: 'Server trying to bind to a port that is already occupied',
                    frequency: 'common'
                });
                
                failureAnalysis.troubleshootingSteps.push({
                    step: 'Check for running processes',
                    command: 'netstat -tulpn | grep :3000',
                    description: 'Find processes using port 3000'
                });
            }
            
            if (errorOutput.includes('timeout') || errorOutput.includes('ETIMEDOUT')) {
                failureAnalysis.categories.push('TIMEOUT_ERROR');
                failureAnalysis.commonPatterns.push({
                    pattern: 'Test timeout',
                    description: 'Tests taking longer than expected to complete',
                    frequency: 'occasional'
                });
                
                failureAnalysis.troubleshootingSteps.push({
                    step: 'Increase test timeout',
                    solution: 'Add jest.setTimeout(30000) to test files',
                    description: 'Allow more time for test completion'
                });
            }
            
            if (errorOutput.includes('AssertionError') || errorOutput.includes('expect(')) {
                failureAnalysis.categories.push('ASSERTION_FAILURE');
                failureAnalysis.commonPatterns.push({
                    pattern: 'Assertion mismatch',
                    description: 'Expected values do not match actual results',
                    frequency: 'common'
                });
                
                failureAnalysis.troubleshootingSteps.push({
                    step: 'Review test expectations',
                    action: 'Compare expected vs actual values in test output',
                    description: 'Verify that test expectations match server behavior'
                });
            }
        }
        
        // Provide educational context for common test failure scenarios
        failureAnalysis.educationalGuidance = [
            {
                concept: 'Test Failure Learning',
                guidance: 'Test failures are valuable learning opportunities that help identify issues early in development',
                value: 'Each failure teaches us something about our code or test expectations'
            },
            {
                concept: 'Debugging Skills',
                guidance: 'Systematic debugging approach: read error messages, check test logic, verify server behavior',
                value: 'Strong debugging skills are essential for effective software development'
            },
            {
                concept: 'Test Quality',
                guidance: 'Good tests should be reliable, maintainable, and provide clear failure messages',
                value: 'High-quality tests make debugging faster and more effective'
            }
        ];
        
        // Generate troubleshooting recommendations based on failure analysis
        const troubleshootingRecommendations = [
            {
                category: 'IMMEDIATE_ACTIONS',
                title: 'Quick Troubleshooting Steps',
                actions: [
                    'Read error messages carefully and completely',
                    'Check server logs for additional context',
                    'Verify test expectations match server behavior',
                    'Ensure test environment is properly set up'
                ]
            },
            {
                category: 'SYSTEMATIC_DEBUGGING',
                title: 'Systematic Debugging Approach',
                actions: [
                    'Isolate failing tests and run them individually',
                    'Add console.log statements to understand data flow',
                    'Use Jest\'s --verbose flag for detailed output',
                    'Check for race conditions in asynchronous code'
                ]
            },
            {
                category: 'PREVENTION_STRATEGIES',
                title: 'Prevent Future Failures',
                actions: [
                    'Write clear, descriptive test names',
                    'Use proper setup and teardown for test isolation',
                    'Mock external dependencies to reduce flakiness',
                    'Add timeout handling for async operations'
                ]
            }
        ];
        
        // Include learning guidance for understanding test failures
        logError(`${EDUCATIONAL_TEST_PREFIX} Test Failure Analysis`, null, {
            failureCategories: failureAnalysis.categories,
            commonPatterns: failureAnalysis.commonPatterns.length,
            troubleshootingSteps: failureAnalysis.troubleshootingSteps.length,
            educational: true
        });
        
        // Log educational guidance
        failureAnalysis.educationalGuidance.forEach(guidance => {
            logInfo(`${EDUCATIONAL_TEST_PREFIX} Educational Insight: ${guidance.concept}`, {
                guidance: guidance.guidance,
                value: guidance.value,
                educational: true
            });
        });
        
        // Log troubleshooting recommendations
        troubleshootingRecommendations.forEach(recommendation => {
            logInfo(`${EDUCATIONAL_TEST_PREFIX} ${recommendation.title}`, {
                category: recommendation.category,
                actions: recommendation.actions,
                educational: true
            });
        });
        
        // Format failure analysis with clear error explanations
        if (failureAnalysis.categories.length > 0) {
            logInfo(`${EDUCATIONAL_TEST_PREFIX} Most likely failure causes:`, {
                primaryCategory: failureAnalysis.categories[0],
                allCategories: failureAnalysis.categories,
                troubleshootingAvailable: true,
                educational: true
            });
        }
        
        // Log comprehensive failure report with educational assistance
        logInfo(`${EDUCATIONAL_TEST_PREFIX} For detailed debugging help:`, {
            resources: [
                'Check the test output above for specific error messages',
                'Review Jest documentation for testing best practices',
                'Use Node.js debugging tools for complex issues',
                'Consider pair programming for challenging problems'
            ],
            educational: true
        });
        
        // Set appropriate exit code for CI/CD pipeline integration
        EXIT_CODE = testResults.exitCode || 1;
        
    } catch (error) {
        logError(`${EDUCATIONAL_TEST_PREFIX} Failed to analyze test failures`, error);
        EXIT_CODE = 1;
    }
}

// =============================================================================
// CLEANUP OPERATIONS
// =============================================================================

/**
 * Cleans up test execution environment by stopping processes, clearing temporary files,
 * resetting test state, and performing educational cleanup with resource management demonstration
 * 
 * @returns {Promise} Promise resolving when cleanup is complete
 */
async function cleanupTestExecution() {
    const cleanupTimer = startTimer('test_cleanup');
    
    try {
        logInfo(`${EDUCATIONAL_TEST_PREFIX} Starting test execution cleanup`, {
            educational: true,
            operation: 'cleanup'
        });
        
        const cleanupResults = {
            processCleanup: false,
            environmentCleanup: false,
            resourceCleanup: false,
            educationalCleanup: false
        };
        
        // Stop any running Jest processes and child processes
        if (JEST_PROCESS && !JEST_PROCESS.killed) {
            try {
                logInfo(`${EDUCATIONAL_TEST_PREFIX} Stopping Jest process`, {
                    processId: JEST_PROCESS.pid
                });
                
                JEST_PROCESS.kill('SIGTERM');
                
                // Wait for graceful shutdown, then force kill if necessary
                setTimeout(() => {
                    if (JEST_PROCESS && !JEST_PROCESS.killed) {
                        logWarn(`${EDUCATIONAL_TEST_PREFIX} Force killing Jest process`);
                        JEST_PROCESS.kill('SIGKILL');
                    }
                }, 5000);
                
                cleanupResults.processCleanup = true;
                
            } catch (error) {
                logWarn(`${EDUCATIONAL_TEST_PREFIX} Failed to stop Jest process cleanly`, {
                    error: error.message
                });
            }
        }
        
        // Clean up temporary test files and resources
        try {
            const tempFiles = [
                path.resolve('.tmp'),
                path.resolve('test-temp'),
                path.resolve('*.tmp')
            ];
            
            // Note: In a real implementation, you would clean up actual temp files
            // For this tutorial, we're demonstrating the pattern
            logInfo(`${EDUCATIONAL_TEST_PREFIX} Cleaning up temporary files`, {
                tempDirectories: tempFiles,
                note: 'Educational demonstration of cleanup patterns'
            });
            
            cleanupResults.resourceCleanup = true;
            
        } catch (error) {
            logWarn(`${EDUCATIONAL_TEST_PREFIX} Temporary file cleanup encountered issues`, {
                error: error.message
            });
        }
        
        // Reset test environment using teardownTestEnvironment helper
        try {
            await teardownTestEnvironment();
            cleanupResults.environmentCleanup = true;
            
            logInfo(`${EDUCATIONAL_TEST_PREFIX} Test environment teardown completed`);
            
        } catch (error) {
            logWarn(`${EDUCATIONAL_TEST_PREFIX} Test environment teardown encountered issues`, {
                error: error.message
            });
        }
        
        // Clear performance monitoring data and timers
        try {
            // Reset global variables
            JEST_PROCESS = null;
            TEST_CONFIG = null;
            
            logInfo(`${EDUCATIONAL_TEST_PREFIX} Performance monitoring data cleared`);
            cleanupResults.educationalCleanup = true;
            
        } catch (error) {
            logWarn(`${EDUCATIONAL_TEST_PREFIX} Performance data cleanup encountered issues`, {
                error: error.message
            });
        }
        
        // Perform garbage collection hints for memory cleanup
        if (global.gc) {
            try {
                global.gc();
                logInfo(`${EDUCATIONAL_TEST_PREFIX} Garbage collection executed for memory cleanup`);
            } catch (error) {
                logInfo(`${EDUCATIONAL_TEST_PREFIX} Garbage collection not available (normal in production)`);
            }
        }
        
        const cleanupDuration = endTimer(cleanupTimer);
        
        // Log cleanup completion with educational context
        logInfo(`${EDUCATIONAL_TEST_PREFIX} Test execution cleanup completed`, {
            cleanupDuration,
            cleanupResults,
            educationalNote: 'Proper cleanup prevents resource leaks and ensures clean test environments',
            educational: true
        });
        
        return cleanupResults;
        
    } catch (error) {
        endTimer(cleanupTimer);
        logError(`${EDUCATIONAL_TEST_PREFIX} Test cleanup failed`, error, {
            troubleshooting: 'Manual cleanup may be required for system resources'
        });
        throw error;
    }
}

// =============================================================================
// MAIN EXECUTION FUNCTION
// =============================================================================

/**
 * Main test execution function that orchestrates the complete testing lifecycle including
 * environment setup, test execution, result analysis, and educational reporting for
 * the Node.js tutorial application
 * 
 * @returns {Promise} Promise resolving after complete test execution with appropriate exit code
 */
async function main() {
    // Initialize test execution with performance timing and educational context
    TEST_START_TIME = Date.now();
    const mainTimer = startTimer('main_test_execution');
    
    try {
        logServerEvent('test_execution_start', {
            timestamp: new Date().toISOString(),
            educational: true,
            tutorialApplication: 'Node.js HTTP Server Tutorial'
        });
        
        logInfo(`${EDUCATIONAL_TEST_PREFIX} Starting comprehensive test execution`, {
            nodeVersion: process.version,
            platform: process.platform,
            environment: environment,
            educational: true
        });
        
        // Parse command line arguments and configure test execution options
        const testOptions = parseCommandLineArguments(process.argv);
        TEST_CONFIG = testOptions;
        
        // Display educational test banner with configuration and learning objectives
        displayTestBanner(testOptions);
        
        // Validate test environment and dependencies with educational error handling
        await validateTestEnvironment();
        
        // Set up test environment using comprehensive test helpers
        await setupTestEnvironment();
        
        // Configure Jest execution with educational enhancements
        const jestConfig = configureTestExecution(testOptions);
        
        // Execute Jest tests with monitoring and real-time progress reporting
        const testResults = await executeJestTests(jestConfig);
        
        // Analyze test results including coverage and performance metrics
        let coverageAnalysis = null;
        if (testOptions.coverage.enabled) {
            try {
                coverageAnalysis = await analyzeCoverageResults(path.resolve('coverage'));
            } catch (error) {
                logWarn(`${EDUCATIONAL_TEST_PREFIX} Coverage analysis failed`, {
                    error: error.message,
                    note: 'Continuing without coverage analysis'
                });
            }
        }
        
        // Generate comprehensive educational test report with insights
        const educationalReport = await generateEducationalTestReport({
            ...testResults,
            coverage: coverageAnalysis
        }, {
            includePerformance: testOptions.performance.enabled,
            includeCoverage: testOptions.coverage.enabled,
            verboseMode: testOptions.educational.verboseOutput
        });
        
        // Handle test failures with educational guidance and troubleshooting
        if (!testResults.success) {
            handleTestFailures(testResults);
        } else {
            logInfo(`${EDUCATIONAL_TEST_PREFIX} All tests passed successfully! 🎉`, {
                totalDuration: Date.now() - TEST_START_TIME,
                testCount: educationalReport.summary?.totalTests || 0,
                coverage: educationalReport.coverage?.overall?.percentage || 0,
                educational: true,
                celebration: true
            });
            
            // Display educational success message
            console.log(`
${EDUCATIONAL_TEST_PREFIX} 🎓 CONGRATULATIONS! 🎓

Your Node.js tutorial application has passed all tests successfully!

ACHIEVEMENTS UNLOCKED:
✅ HTTP Server Testing Fundamentals
✅ Automated Test Execution
✅ Quality Metrics Analysis
✅ Professional Development Practices

WHAT YOU'VE LEARNED:
• How to set up and run comprehensive test suites
• Performance monitoring and benchmarking techniques
• Code coverage analysis and improvement strategies
• Professional debugging and troubleshooting skills

NEXT STEPS FOR CONTINUED LEARNING:
• Explore advanced testing patterns (integration, e2e)
• Learn about test-driven development (TDD)
• Study performance optimization techniques
• Practice with real-world application scenarios

Keep up the excellent work! 🚀
            `);
        }
        
        // Clean up test environment and resources
        await cleanupTestExecution();
        
        const totalExecutionTime = endTimer(mainTimer);
        
        // Exit with appropriate code and educational completion message
        logServerEvent('test_execution_complete', {
            success: testResults.success,
            totalExecutionTime,
            exitCode: EXIT_CODE,
            educational: true
        });
        
        logInfo(`${EDUCATIONAL_TEST_PREFIX} Test execution completed successfully`, {
            totalExecutionTime,
            exitCode: EXIT_CODE,
            educationalValue: 'Test execution demonstrates professional development workflow',
            educational: true
        });
        
        process.exit(EXIT_CODE);
        
    } catch (error) {
        endTimer(mainTimer);
        
        logError(`${EDUCATIONAL_TEST_PREFIX} Test execution failed with critical error`, error, {
            totalExecutionTime: Date.now() - TEST_START_TIME,
            troubleshooting: [
                'Check Node.js and npm installations',
                'Verify all dependencies are installed',
                'Ensure test environment is properly configured',
                'Review error messages for specific guidance'
            ],
            educational: true
        });
        
        // Clean up even after failure
        try {
            await cleanupTestExecution();
        } catch (cleanupError) {
            logError(`${EDUCATIONAL_TEST_PREFIX} Cleanup after failure also failed`, cleanupError);
        }
        
        // Display educational failure guidance
        console.log(`
${EDUCATIONAL_TEST_PREFIX} ❌ TEST EXECUTION ENCOUNTERED ISSUES

Don't worry! Encountering issues is part of the learning process.

LEARNING OPPORTUNITIES:
• Practice systematic debugging and troubleshooting
• Understand error messages and root cause analysis
• Learn about environment setup and configuration
• Experience real-world development challenges

TROUBLESHOOTING STEPS:
1. Read the error messages carefully
2. Check your Node.js and npm installations
3. Verify all dependencies are properly installed
4. Review the test configuration and setup

Remember: Every developer encounters issues. The key is learning how to resolve them systematically!
        `);
        
        process.exit(1);
    }
}

// =============================================================================
// MODULE EXECUTION
// =============================================================================

// Execute main function if this script is run directly
if (require.main === module) {
    main().catch((error) => {
        console.error('Unhandled error in test execution:', error);
        process.exit(1);
    });
}

// Handle process termination gracefully
process.on('SIGINT', async () => {
    logInfo(`${EDUCATIONAL_TEST_PREFIX} Received SIGINT, cleaning up...`);
    try {
        await cleanupTestExecution();
    } catch (error) {
        logError(`${EDUCATIONAL_TEST_PREFIX} Cleanup on SIGINT failed`, error);
    }
    process.exit(1);
});

process.on('SIGTERM', async () => {
    logInfo(`${EDUCATIONAL_TEST_PREFIX} Received SIGTERM, cleaning up...`);
    try {
        await cleanupTestExecution();
    } catch (error) {
        logError(`${EDUCATIONAL_TEST_PREFIX} Cleanup on SIGTERM failed`, error);
    }
    process.exit(1);
});

// Export main function for programmatic usage
module.exports = { main };