/**
 * Node.js Tutorial HTTP Server - Main Application Entry Point
 * 
 * This file serves as the main entry point and application bootstrap for the Node.js tutorial 
 * HTTP server application. It demonstrates fundamental web server concepts through a simple 
 * '/hello' endpoint while providing comprehensive educational features including application 
 * lifecycle management, graceful shutdown procedures, and extensive educational logging.
 * 
 * The server orchestrates the complete application lifecycle from initialization through startup
 * to graceful shutdown, integrating all application components to provide a comprehensive 
 * learning example of Node.js built-in HTTP module capabilities and best practices.
 * 
 * Educational Features:
 * - Complete application lifecycle demonstration from initialization to shutdown
 * - Comprehensive startup banner with learning objectives and configuration transparency
 * - Educational error handling including uncaught exceptions and unhandled promise rejections
 * - Process lifecycle management with signal handling and graceful shutdown procedures
 * - Performance monitoring and resource usage tracking for educational awareness
 * - Structured logging throughout application lifecycle with troubleshooting guidance
 * - Environment validation and configuration transparency for learning enhancement
 * 
 * Integration Architecture:
 * - HTTP Server: Integrates with http-server.js for complete server lifecycle management
 * - Configuration: Uses app-config.js for centralized application settings and environment detection
 * - Logging: Utilizes educational logger for comprehensive application lifecycle visibility
 * - Error Handling: Implements centralized error handling with educational context and guidance
 * - Process Management: Demonstrates proper Node.js process lifecycle with signal handling
 * 
 * Learning Objectives:
 * - Understanding Node.js application entry point patterns and bootstrap procedures
 * - Learning HTTP server lifecycle management and configuration best practices
 * - Practicing error handling patterns including process-level error management
 * - Exploring logging and monitoring concepts for application observability
 * - Demonstrating graceful shutdown procedures and resource cleanup techniques
 * - Building foundation for scalable Node.js application architecture patterns
 */

// Node.js built-in modules for process management and signal handling - Node.js Built-in
const process = require('node:process');

// HTTP server lifecycle management functions from tutorial server module
const { 
    createHTTPServer, 
    startServer, 
    stopServer, 
    setupGracefulShutdown,
    getServerStatus 
} = require('./lib/server/http-server.js');

// Application configuration with educational settings and environment detection
const { appConfig } = require('./lib/config/app-config.js');

// Educational logger for comprehensive application lifecycle logging and monitoring
const { logger } = require('./lib/utils/logger.js');

// Centralized error handling with educational context and troubleshooting guidance
const { handleServerError } = require('./lib/utils/error-handler.js');

// =============================================================================
// GLOBAL STATE VARIABLES
// =============================================================================

/**
 * Global server instance reference for application lifecycle management
 * Educational Note: Global state tracking enables proper resource management
 * and demonstrates singleton pattern for server instance management
 */
let SERVER_INSTANCE = null;

/**
 * Current application state for lifecycle tracking and educational monitoring
 * Educational Note: State tracking provides visibility into application lifecycle
 * and enables proper state transitions during startup and shutdown procedures
 */
let APPLICATION_STATE = 'initializing';

/**
 * Application startup timestamp for performance monitoring and uptime calculation
 * Educational Note: Timing metrics provide educational insight into application
 * performance and demonstrate monitoring best practices for production applications
 */
let STARTUP_TIMESTAMP = null;

/**
 * Shutdown in progress flag to prevent duplicate shutdown procedures
 * Educational Note: Shutdown coordination prevents race conditions and ensures
 * graceful application termination with proper resource cleanup procedures
 */
let SHUTDOWN_IN_PROGRESS = false;

// =============================================================================
// EDUCATIONAL WELCOME AND INITIALIZATION FUNCTIONS
// =============================================================================

/**
 * Displays an educational welcome banner with tutorial information, learning objectives,
 * server configuration details, and usage instructions to provide clear context for
 * learners starting the Node.js tutorial application
 * 
 * Educational Note: Welcome banners provide immediate context and learning objectives
 * while demonstrating professional application presentation and user experience design
 * 
 * @param {object} config - Application configuration object containing app metadata and educational settings
 * @returns {void} No return value, outputs welcome banner to console with educational formatting
 */
function displayWelcomeBanner(config) {
    // Extract application metadata and configuration for banner display
    const appName = config.app?.name || 'Node.js Tutorial HTTP Server';
    const appVersion = config.app?.version || '1.0.0';
    const appDescription = config.app?.description || 'Educational HTTP server demonstration';
    const serverPort = config.server?.port || 3000;
    const serverHost = config.server?.host || '127.0.0.1';
    const environment = config.environment || 'development';
    
    // Create formatted welcome banner with educational branding and visual separation
    const bannerSeparator = '='.repeat(80);
    const sectionSeparator = '-'.repeat(60);
    
    console.log('\n' + bannerSeparator);
    console.log('🎓 NODE.JS TUTORIAL HTTP SERVER - EDUCATIONAL DEMONSTRATION');
    console.log(bannerSeparator);
    
    // Display application metadata and configuration with educational context
    console.log('📋 APPLICATION INFORMATION');
    console.log(sectionSeparator);
    console.log(`   Name: ${appName}`);
    console.log(`   Version: ${appVersion}`);
    console.log(`   Description: ${appDescription}`);
    console.log(`   Environment: ${environment.toUpperCase()}`);
    console.log(`   Node.js Version: ${process.version}`);
    console.log(`   Platform: ${process.platform} (${process.arch})`);
    
    // Show server configuration including network settings and endpoint information
    console.log('\n🌐 SERVER CONFIGURATION');
    console.log(sectionSeparator);
    console.log(`   Host: ${serverHost}`);
    console.log(`   Port: ${serverPort}`);
    console.log(`   Protocol: HTTP/1.1`);
    console.log(`   Access URL: http://${serverHost}:${serverPort}`);
    console.log(`   Primary Endpoint: http://${serverHost}:${serverPort}/hello`);
    
    // Display learning objectives and educational goals for tutorial context
    console.log('\n🎯 LEARNING OBJECTIVES');
    console.log(sectionSeparator);
    console.log('   • Understanding Node.js HTTP server fundamentals and built-in capabilities');
    console.log('   • Learning application lifecycle management and bootstrap procedures');
    console.log('   • Practicing error handling patterns and graceful shutdown techniques');
    console.log('   • Exploring configuration management and environment variable usage');
    console.log('   • Building foundation for scalable web application development');
    
    // Include usage instructions and tutorial guidance for immediate learner assistance
    console.log('\n📖 USAGE INSTRUCTIONS');
    console.log(sectionSeparator);
    console.log('   1. Server will start automatically after initialization completes');
    console.log(`   2. Open browser or use curl: curl http://${serverHost}:${serverPort}/hello`);
    console.log('   3. Observe server logs for educational insights and request processing');
    console.log('   4. Use Ctrl+C for graceful shutdown with educational cleanup demonstration');
    console.log('   5. Review source code comments for detailed explanations and learning notes');
    
    // Add troubleshooting tips and development guidance for problem resolution
    console.log('\n🔧 TROUBLESHOOTING TIPS');
    console.log(sectionSeparator);
    console.log('   • Port in use? Change port: PORT=3001 node server.js');
    console.log('   • Permission denied? Use port above 1024 or run with elevated privileges');
    console.log('   • Module errors? Verify Node.js version 18+ and check file paths');
    console.log('   • Network issues? Check firewall settings and localhost connectivity');
    
    console.log('\n' + bannerSeparator);
    console.log('🚀 STARTING TUTORIAL APPLICATION...\n');
    
    // Log banner display completion for educational lifecycle tracking
    logger.logServerEvent('welcome_banner_displayed', {
        appName,
        appVersion,
        environment,
        serverPort,
        serverHost
    }, 'Educational welcome banner displayed successfully');
}

/**
 * Validates the runtime environment including Node.js version, required dependencies,
 * system resources, and configuration settings to ensure proper tutorial application execution
 * 
 * Educational Note: Environment validation demonstrates defensive programming practices
 * and provides early error detection for common configuration and system issues
 * 
 * @returns {boolean} True if environment is valid and ready, throws error with educational guidance if validation fails
 */
function validateEnvironment() {
    logger.info('Starting environment validation for tutorial application');
    
    try {
        // Check Node.js version against minimum requirements with educational context
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
        const minimumNodeVersion = 18;
        
        if (majorVersion < minimumNodeVersion) {
            throw new Error(
                `Node.js version ${nodeVersion} is not supported. ` +
                `Minimum required version is ${minimumNodeVersion}.x. ` +
                `Educational Note: Modern Node.js versions provide improved security, ` +
                `performance, and JavaScript features essential for current development practices.`
            );
        }
        
        logger.info(`Node.js version validation passed: ${nodeVersion}`, {
            majorVersion,
            minimumRequired: minimumNodeVersion,
            validationStatus: 'passed'
        });
        
        // Verify npm package manager availability for educational development workflow
        try {
            const npmVersion = process.env.npm_version || 'Not available in environment';
            logger.info(`Package manager validation: npm ${npmVersion}`, {
                npmVersion,
                validationNote: 'npm availability indicates proper Node.js installation'
            });
        } catch (npmError) {
            logger.warn('npm version detection failed, continuing with validation', {
                error: npmError.message,
                educationalNote: 'npm not required for basic HTTP server functionality'
            });
        }
        
        // Check system memory availability for stable application operation
        const memoryUsage = process.memoryUsage();
        const availableMemoryMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
        const minimumMemoryMB = 50;
        
        if (availableMemoryMB < minimumMemoryMB) {
            logger.warn(`Low memory detected: ${availableMemoryMB}MB available`, {
                availableMemory: availableMemoryMB,
                minimumRecommended: minimumMemoryMB,
                educationalNote: 'Low memory may affect application performance'
            });
        }
        
        logger.info(`System resource validation passed`, {
            memoryUsage: {
                heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
                heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
                external: Math.round(memoryUsage.external / 1024 / 1024) + 'MB'
            },
            validationStatus: 'passed'
        });
        
        // Validate port availability for server binding with educational guidance
        const configuredPort = appConfig.server?.port || 3000;
        const configuredHost = appConfig.server?.host || '127.0.0.1';
        
        // Educational Note: Port validation helps prevent common server startup failures
        if (configuredPort < 1024 && process.getuid && process.getuid() !== 0) {
            logger.warn(`Port ${configuredPort} requires elevated privileges`, {
                port: configuredPort,
                currentUser: process.getuid(),
                educationalNote: 'Ports below 1024 require root privileges on Unix systems'
            });
        }
        
        logger.info('Network configuration validation passed', {
            host: configuredHost,
            port: configuredPort,
            validationStatus: 'passed'
        });
        
        // Verify application configuration completeness and correctness
        const requiredConfigSections = ['app', 'server', 'logging'];
        const missingConfigurations = requiredConfigSections.filter(section => !appConfig[section]);
        
        if (missingConfigurations.length > 0) {
            throw new Error(
                `Missing required configuration sections: ${missingConfigurations.join(', ')}. ` +
                `Educational Note: Complete configuration ensures predictable application behavior ` +
                `and demonstrates proper configuration management patterns.`
            );
        }
        
        logger.info('Application configuration validation passed', {
            configSections: Object.keys(appConfig),
            validationStatus: 'passed',
            educationalNote: 'Complete configuration enables robust application operation'
        });
        
        // Log successful environment validation with comprehensive context
        logger.info('Environment validation completed successfully', {
            nodeVersion,
            memoryStatus: 'adequate',
            configurationStatus: 'complete',
            validationTimestamp: new Date().toISOString(),
            educationalNote: 'Environment validation demonstrates defensive programming practices'
        });
        
        return true;
        
    } catch (validationError) {
        // Handle validation failures with educational error context and resolution guidance
        logger.error('Environment validation failed', validationError, {
            validationStage: 'environment_check',
            recoverable: false,
            educationalNote: 'Environment validation failures require configuration fixes before startup'
        });
        
        // Provide educational troubleshooting guidance for common validation failures
        console.log('\n' + '='.repeat(60));
        console.log('ENVIRONMENT VALIDATION FAILURE - EDUCATIONAL GUIDANCE');
        console.log('='.repeat(60));
        console.log('Common Resolution Steps:');
        console.log('1. Update Node.js: Visit https://nodejs.org for latest version');
        console.log('2. Check permissions: Use ports above 1024 or run with sudo');
        console.log('3. Free memory: Close unused applications or restart system');
        console.log('4. Configuration: Review config files for missing or invalid settings');
        console.log('5. Dependencies: Ensure all required modules are available');
        console.log('='.repeat(60) + '\n');
        
        throw validationError;
    }
}

/**
 * Initializes the complete tutorial application including configuration loading,
 * environment validation, server creation, and educational setup with comprehensive
 * error handling and logging
 * 
 * Educational Note: Application initialization demonstrates bootstrap patterns and
 * provides structured approach to application startup with proper error handling
 * 
 * @returns {Promise} Promise resolving to configured server instance or rejecting with educational error details
 */
async function initializeApplication() {
    try {
        // Set application state and record initialization start time
        APPLICATION_STATE = 'initializing';
        const initializationStartTime = Date.now();
        
        logger.info('Starting Node.js tutorial application initialization', {
            timestamp: new Date().toISOString(),
            applicationState: APPLICATION_STATE,
            processId: process.pid,
            educationalNote: 'Application initialization demonstrates structured startup procedures'
        });
        
        // Validate runtime environment with educational error handling
        logger.info('Step 1/5: Validating runtime environment');
        const environmentValid = validateEnvironment();
        
        if (!environmentValid) {
            throw new Error('Environment validation failed, cannot proceed with initialization');
        }
        
        // Display educational welcome banner with configuration transparency
        logger.info('Step 2/5: Displaying educational welcome banner');
        displayWelcomeBanner(appConfig);
        
        // Load and validate complete application configuration
        logger.info('Step 3/5: Loading and validating application configuration');
        logger.info('Application configuration loaded successfully', {
            appName: appConfig.app?.name,
            appVersion: appConfig.app?.version,
            environment: appConfig.environment,
            serverPort: appConfig.server?.port,
            serverHost: appConfig.server?.host,
            educationalMode: appConfig.educational?.enabled,
            loggingLevel: appConfig.logging?.level
        });
        
        // Create HTTP server instance with educational features and error handling
        logger.info('Step 4/5: Creating HTTP server instance with educational features');
        const serverInstance = await createHTTPServer(appConfig);
        
        if (!serverInstance) {
            throw new Error('Failed to create HTTP server instance');
        }
        
        // Store server reference for lifecycle management
        SERVER_INSTANCE = serverInstance;
        
        logger.info('HTTP server instance created successfully', {
            serverType: 'Node.js HTTP Server',
            hasListeners: serverInstance.listenerCount('request') > 0,
            educationalFeatures: 'enabled'
        });
        
        // Configure graceful shutdown procedures with educational context
        logger.info('Step 5/5: Setting up graceful shutdown procedures');
        setupGracefulShutdown(serverInstance, shutdownApplication);
        
        // Calculate and log initialization timing metrics
        const initializationDuration = Date.now() - initializationStartTime;
        APPLICATION_STATE = 'initialized';
        
        logger.info('Application initialization completed successfully', {
            applicationState: APPLICATION_STATE,
            initializationDuration: `${initializationDuration}ms`,
            serverInstance: 'created',
            gracefulShutdown: 'configured',
            educationalNote: 'Initialization timing provides performance awareness'
        });
        
        // Log educational summary of initialization process
        logger.logServerEvent('application_initialized', {
            duration: initializationDuration,
            configurationValid: true,
            serverCreated: true,
            shutdownConfigured: true
        }, 'Tutorial application initialization completed with educational features');
        
        return serverInstance;
        
    } catch (initializationError) {
        // Handle initialization failures with educational context and troubleshooting
        APPLICATION_STATE = 'initialization_failed';
        
        logger.error('Application initialization failed', initializationError, {
            applicationState: APPLICATION_STATE,
            initializationStage: 'unknown',
            recoverable: false,
            educationalNote: 'Initialization failures require fixing underlying issues'
        });
        
        // Provide educational error handling and troubleshooting guidance
        handleServerError(initializationError, {
            stage: 'initialization',
            applicationState: APPLICATION_STATE,
            educationalContext: 'Application bootstrap failure demonstrates error handling patterns'
        });
        
        throw initializationError;
    }
}

/**
 * Starts the tutorial HTTP server application with comprehensive startup procedures,
 * educational logging, error handling, and readiness confirmation for learning demonstration
 * 
 * Educational Note: Application startup demonstrates server lifecycle management and
 * provides visibility into network binding and service readiness procedures
 * 
 * @param {object} serverInstance - Configured HTTP server instance to start
 * @returns {Promise} Promise resolving when server is successfully started and ready for requests
 */
async function startApplication(serverInstance) {
    try {
        // Set application state and record startup initiation
        APPLICATION_STATE = 'starting';
        STARTUP_TIMESTAMP = Date.now();
        
        logger.info('Starting Node.js tutorial HTTP server application', {
            applicationState: APPLICATION_STATE,
            startupTimestamp: new Date(STARTUP_TIMESTAMP).toISOString(),
            educationalNote: 'Server startup demonstrates network service activation'
        });
        
        // Extract server configuration for startup procedures
        const serverPort = appConfig.server?.port || 3000;
        const serverHost = appConfig.server?.host || '127.0.0.1';
        const serverBacklog = appConfig.server?.backlog || 511;
        
        logger.info('Server configuration extracted for startup', {
            port: serverPort,
            host: serverHost,
            backlog: serverBacklog,
            educationalNote: 'Server configuration determines network binding parameters'
        });
        
        // Start HTTP server with port binding and educational error handling
        logger.info('Initiating server startup and port binding');
        await startServer(serverInstance, serverPort, serverHost);
        
        // Calculate startup timing for educational performance awareness
        const startupDuration = Date.now() - STARTUP_TIMESTAMP;
        APPLICATION_STATE = 'running';
        
        logger.info('HTTP server started successfully and accepting connections', {
            applicationState: APPLICATION_STATE,
            serverPort: serverPort,
            serverHost: serverHost,
            startupDuration: `${startupDuration}ms`,
            accessUrl: `http://${serverHost}:${serverPort}`,
            primaryEndpoint: `http://${serverHost}:${serverPort}/hello`
        });
        
        // Display server readiness information with educational context
        console.log('\n' + '🎉 SERVER READY FOR TUTORIAL INTERACTION!');
        console.log('═'.repeat(50));
        console.log(`🌐 Server URL: http://${serverHost}:${serverPort}`);
        console.log(`📍 Hello Endpoint: http://${serverHost}:${serverPort}/hello`);
        console.log(`⏱️  Startup Time: ${startupDuration}ms`);
        console.log(`📊 Process ID: ${process.pid}`);
        console.log('═'.repeat(50));
        console.log('💡 Try these commands:');
        console.log(`   curl http://${serverHost}:${serverPort}/hello`);
        console.log(`   Open browser: http://${serverHost}:${serverPort}/hello`);
        console.log('🛑 Press Ctrl+C for graceful shutdown demonstration\n');
        
        // Log educational startup completion event with comprehensive metrics
        logger.logServerEvent('server_started', {
            port: serverPort,
            host: serverHost,
            startupDuration: startupDuration,
            accessUrl: `http://${serverHost}:${serverPort}`,
            memoryUsage: process.memoryUsage()
        }, 'Tutorial HTTP server started and ready for educational interaction');
        
        // Display server status for educational monitoring demonstration
        const serverStatus = getServerStatus(serverInstance);
        logger.info('Server status and health check', serverStatus);
        
    } catch (startupError) {
        // Handle startup failures with educational error context
        APPLICATION_STATE = 'startup_failed';
        
        logger.error('Server startup failed', startupError, {
            applicationState: APPLICATION_STATE,
            startupDuration: STARTUP_TIMESTAMP ? Date.now() - STARTUP_TIMESTAMP : 0,
            recoverable: false,
            educationalNote: 'Startup failures require addressing configuration or system issues'
        });
        
        // Provide educational error handling for startup failures
        handleServerError(startupError, {
            stage: 'startup',
            port: appConfig.server?.port,
            host: appConfig.server?.host,
            educationalContext: 'Server startup failure demonstrates error recovery patterns'
        });
        
        throw startupError;
    }
}

/**
 * Gracefully shuts down the tutorial application including connection draining,
 * resource cleanup, educational logging, and proper process termination for
 * demonstration of Node.js lifecycle management
 * 
 * Educational Note: Graceful shutdown demonstrates proper resource management and
 * provides learning opportunities about application lifecycle and cleanup procedures
 * 
 * @param {object} serverInstance - HTTP server instance to shutdown gracefully
 * @param {number} exitCode - Process exit code for application termination, defaults to 0
 * @returns {Promise} Promise resolving after complete application shutdown with cleanup confirmation
 */
async function shutdownApplication(serverInstance = SERVER_INSTANCE, exitCode = 0) {
    // Prevent duplicate shutdown procedures with coordination flag
    if (SHUTDOWN_IN_PROGRESS) {
        logger.warn('Shutdown already in progress, ignoring duplicate shutdown request', {
            shutdownInProgress: true,
            educationalNote: 'Shutdown coordination prevents resource cleanup conflicts'
        });
        return;
    }
    
    SHUTDOWN_IN_PROGRESS = true;
    APPLICATION_STATE = 'shutting-down';
    const shutdownStartTime = Date.now();
    
    try {
        logger.info('Initiating graceful application shutdown', {
            applicationState: APPLICATION_STATE,
            exitCode: exitCode,
            shutdownTimestamp: new Date().toISOString(),
            educationalNote: 'Graceful shutdown demonstrates proper application lifecycle management'
        });
        
        // Calculate application uptime for educational metrics
        const uptime = STARTUP_TIMESTAMP ? Math.floor((Date.now() - STARTUP_TIMESTAMP) / 1000) : 0;
        const uptimeFormatted = `${Math.floor(uptime / 60)}m ${uptime % 60}s`;
        
        logger.info('Application runtime statistics', {
            uptimeSeconds: uptime,
            uptimeFormatted: uptimeFormatted,
            startupTimestamp: STARTUP_TIMESTAMP ? new Date(STARTUP_TIMESTAMP).toISOString() : 'unknown',
            educationalNote: 'Runtime metrics provide operational awareness and monitoring experience'
        });
        
        // Stop HTTP server gracefully with connection draining
        if (serverInstance) {
            logger.info('Stopping HTTP server with connection draining');
            await stopServer(serverInstance);
            logger.info('HTTP server stopped successfully with graceful connection handling');
        } else {
            logger.warn('No server instance available for shutdown', {
                serverInstance: serverInstance,
                educationalNote: 'Server instance tracking enables proper resource cleanup'
            });
        }
        
        // Clean up application resources and global references
        logger.info('Cleaning up application resources and global state');
        SERVER_INSTANCE = null;
        STARTUP_TIMESTAMP = null;
        
        // Calculate and log shutdown timing metrics
        const shutdownDuration = Date.now() - shutdownStartTime;
        APPLICATION_STATE = 'stopped';
        
        logger.info('Application shutdown completed successfully', {
            applicationState: APPLICATION_STATE,
            shutdownDuration: `${shutdownDuration}ms`,
            uptimeFormatted: uptimeFormatted,
            exitCode: exitCode,
            educationalNote: 'Shutdown timing demonstrates cleanup efficiency'
        });
        
        // Display educational shutdown summary with learning context
        console.log('\n' + '👋 GRACEFUL SHUTDOWN COMPLETED');
        console.log('═'.repeat(40));
        console.log(`⏱️  Application Uptime: ${uptimeFormatted}`);
        console.log(`🔄 Shutdown Duration: ${shutdownDuration}ms`);
        console.log(`✅ Exit Code: ${exitCode}`);
        console.log('═'.repeat(40));
        console.log('🎓 Educational Learning Summary:');
        console.log('   • HTTP server lifecycle management');
        console.log('   • Graceful shutdown procedures');
        console.log('   • Resource cleanup and memory management');
        console.log('   • Process signal handling and coordination');
        console.log('═'.repeat(40));
        console.log('📚 Thank you for using the Node.js Tutorial!');
        console.log('💡 Continue learning: https://nodejs.org/docs\n');
        
        // Log final educational event before process termination
        logger.logServerEvent('application_shutdown', {
            uptimeSeconds: uptime,
            shutdownDuration: shutdownDuration,
            exitCode: exitCode,
            gracefulShutdown: true
        }, 'Tutorial application shutdown completed with educational demonstration');
        
        // Allow brief time for final log output before process termination
        setTimeout(() => {
            process.exit(exitCode);
        }, 100);
        
    } catch (shutdownError) {
        // Handle shutdown errors with educational context while ensuring process termination
        APPLICATION_STATE = 'shutdown_failed';
        
        logger.error('Error during application shutdown', shutdownError, {
            applicationState: APPLICATION_STATE,
            shutdownDuration: Date.now() - shutdownStartTime,
            exitCode: exitCode,
            educationalNote: 'Shutdown errors demonstrate error handling in cleanup procedures'
        });
        
        // Force process termination with error code despite shutdown failure
        console.error('\n❌ SHUTDOWN ERROR - FORCING PROCESS TERMINATION');
        console.error('Educational Note: Forced termination demonstrates error recovery patterns');
        
        setTimeout(() => {
            process.exit(1);
        }, 100);
    }
}

/**
 * Handles uncaught exceptions with comprehensive error logging, educational context,
 * graceful shutdown procedures, and proper process termination to demonstrate Node.js
 * error handling best practices
 * 
 * Educational Note: Uncaught exception handling demonstrates critical error management
 * and provides learning opportunities about application stability and error recovery
 * 
 * @param {Error} error - Uncaught exception Error object with stack trace and details
 * @returns {void} No return value, logs error and initiates graceful shutdown with educational context
 */
function handleUncaughtException(error) {
    logger.error('Uncaught exception detected - initiating emergency shutdown', error, {
        errorType: 'uncaught_exception',
        applicationState: APPLICATION_STATE,
        criticalError: true,
        recoverable: false,
        educationalNote: 'Uncaught exceptions indicate programming errors requiring process restart'
    });
    
    // Add educational context about uncaught exception handling in Node.js
    console.error('\n' + '🚨 CRITICAL ERROR - UNCAUGHT EXCEPTION DETECTED');
    console.error('═'.repeat(60));
    console.error('Educational Context:');
    console.error('• Uncaught exceptions indicate programming errors');
    console.error('• Process restart is required for application stability');
    console.error('• Always handle errors with try/catch or .catch() for Promises');
    console.error('• Use process event handlers for educational monitoring');
    console.error('═'.repeat(60));
    console.error('Error Details:', error.message);
    console.error('Stack Trace:', error.stack);
    console.error('═'.repeat(60) + '\n');
    
    // Log application state at time of critical error for debugging context
    logger.error('Application state at uncaught exception', {
        applicationState: APPLICATION_STATE,
        serverInstance: SERVER_INSTANCE ? 'active' : 'inactive',
        uptime: STARTUP_TIMESTAMP ? Math.floor((Date.now() - STARTUP_TIMESTAMP) / 1000) : 0,
        memoryUsage: process.memoryUsage(),
        processId: process.pid,
        educationalNote: 'State information assists in error analysis and debugging'
    });
    
    // Attempt graceful shutdown with educational error context
    if (!SHUTDOWN_IN_PROGRESS) {
        logger.info('Attempting graceful shutdown after uncaught exception');
        shutdownApplication(SERVER_INSTANCE, 1);
    } else {
        // Force immediate termination if shutdown already in progress
        logger.error('Shutdown already in progress, forcing immediate termination');
        console.error('🆘 FORCING IMMEDIATE PROCESS TERMINATION\n');
        setTimeout(() => process.exit(1), 100);
    }
}

/**
 * Handles unhandled promise rejections with educational logging, troubleshooting guidance,
 * and appropriate error management to demonstrate Promise error handling patterns in Node.js
 * 
 * Educational Note: Unhandled promise rejection handling demonstrates asynchronous error
 * management and provides learning opportunities about Promise error handling best practices
 * 
 * @param {any} reason - Rejection reason which could be Error object or any value
 * @param {Promise} promise - Promise that was rejected without handling
 * @returns {void} No return value, logs rejection details and provides educational guidance
 */
function handleUnhandledRejection(reason, promise) {
    logger.error('Unhandled promise rejection detected', reason, {
        errorType: 'unhandled_rejection',
        applicationState: APPLICATION_STATE,
        promiseInfo: promise ? promise.constructor.name : 'unknown',
        criticalError: true,
        educationalNote: 'Unhandled promise rejections indicate missing error handling in async code'
    });
    
    // Add educational context about Promise rejection handling in Node.js
    console.error('\n' + '⚠️  UNHANDLED PROMISE REJECTION DETECTED');
    console.error('═'.repeat(50));
    console.error('Educational Guidance:');
    console.error('• Always use .catch() with Promise chains');
    console.error('• Use try/catch blocks with async/await functions');
    console.error('• Check for missing error handling in asynchronous operations');
    console.error('• Consider using Promise.allSettled() for multiple promises');
    console.error('═'.repeat(50));
    console.error('Rejection Reason:', reason);
    console.error('Promise:', promise);
    console.error('═'.repeat(50) + '\n');
    
    // Log application state for debugging context
    logger.warn('Application state at promise rejection', {
        applicationState: APPLICATION_STATE,
        uptime: STARTUP_TIMESTAMP ? Math.floor((Date.now() - STARTUP_TIMESTAMP) / 1000) : 0,
        activeHandles: process._getActiveHandles ? process._getActiveHandles().length : 'unknown',
        activeRequests: process._getActiveRequests ? process._getActiveRequests().length : 'unknown',
        educationalNote: 'Promise rejection debugging requires understanding async operation state'
    });
    
    // For educational purposes, log troubleshooting guidance but continue operation
    if (appConfig.educational?.strictErrorHandling) {
        logger.warn('Strict error handling enabled, initiating graceful shutdown');
        shutdownApplication(SERVER_INSTANCE, 1);
    } else {
        logger.warn('Continuing operation with warning - implement proper Promise error handling', {
            educationalNote: 'Production applications should handle all Promise rejections appropriately',
            troubleshootingTip: 'Add .catch() handlers to all Promise chains and async/await blocks'
        });
    }
}

/**
 * Main application entry point function that orchestrates the complete tutorial application
 * lifecycle including initialization, startup, error handling setup, and educational
 * demonstration of Node.js HTTP server concepts
 * 
 * Educational Note: Main function demonstrates application orchestration patterns and
 * provides comprehensive example of Node.js application structure and lifecycle management
 * 
 * @returns {Promise} Promise resolving after successful application startup or rejecting with educational error context
 */
async function main() {
    try {
        // Set up global error handlers before application initialization
        logger.info('Setting up global error handlers for educational error management');
        
        process.on('uncaughtException', handleUncaughtException);
        process.on('unhandledRejection', handleUnhandledRejection);
        
        logger.info('Global error handlers configured for educational error demonstration', {
            uncaughtExceptionHandler: 'configured',
            unhandledRejectionHandler: 'configured',
            educationalNote: 'Process-level error handling demonstrates application resilience'
        });
        
        // Initialize application with comprehensive setup and educational features
        logger.info('Starting main application initialization sequence');
        const serverInstance = await initializeApplication();
        
        if (!serverInstance) {
            throw new Error('Application initialization failed to return server instance');
        }
        
        // Start application with server binding and educational readiness confirmation
        logger.info('Starting application server with educational monitoring');
        await startApplication(serverInstance);
        
        // Log successful startup with educational context and monitoring information
        logger.info('Tutorial application startup completed successfully', {
            applicationState: APPLICATION_STATE,
            serverReady: true,
            errorHandlersActive: true,
            educationalFeatures: 'enabled',
            learningObjectives: [
                'HTTP server fundamentals',
                'Application lifecycle management',
                'Error handling patterns',
                'Configuration management',
                'Process lifecycle and signal handling'
            ]
        });
        
        // Display server status and health information for educational monitoring
        const serverStatus = getServerStatus(serverInstance);
        logger.logServerEvent('application_ready', {
            ...serverStatus,
            startupComplete: true,
            educationalMode: true
        }, 'Tutorial application ready for educational interaction and learning');
        
        // Log continuous educational guidance for ongoing learning
        setTimeout(() => {
            logger.info('Tutorial application running - educational monitoring active', {
                uptime: Math.floor((Date.now() - STARTUP_TIMESTAMP) / 1000),
                memoryUsage: process.memoryUsage(),
                educationalTip: 'Monitor server logs for request processing educational insights'
            });
        }, 5000);
        
    } catch (mainError) {
        // Handle main function errors with comprehensive educational context
        logger.error('Main application function failed', mainError, {
            applicationState: APPLICATION_STATE,
            startupFailed: true,
            recoverable: false,
            educationalNote: 'Main function failures indicate fundamental application issues'
        });
        
        // Provide educational error handling and troubleshooting guidance
        handleServerError(mainError, {
            stage: 'main_execution',
            applicationState: APPLICATION_STATE,
            educationalContext: 'Main function error demonstrates top-level error handling patterns'
        });
        
        // Display educational troubleshooting summary
        console.error('\n' + '❌ APPLICATION STARTUP FAILED');
        console.error('═'.repeat(40));
        console.error('Educational Troubleshooting Steps:');
        console.error('1. Check Node.js version (requires 18+)');
        console.error('2. Verify port availability (default 3000)');
        console.error('3. Review configuration files and environment variables');
        console.error('4. Check file paths and module dependencies');
        console.error('5. Examine error messages and stack traces carefully');
        console.error('═'.repeat(40) + '\n');
        
        // Exit with error code after educational guidance
        process.exit(1);
    }
}

// =============================================================================
// APPLICATION BOOTSTRAP AND EXECUTION
// =============================================================================

/**
 * Bootstrap the Node.js tutorial application by executing the main function
 * Educational Note: Immediate function execution demonstrates common Node.js
 * application bootstrap patterns and entry point execution
 */
if (require.main === module) {
    // Log application bootstrap initiation
    logger.info('Node.js Tutorial HTTP Server - Application Bootstrap', {
        filename: __filename,
        isMainModule: true,
        nodeVersion: process.version,
        platform: process.platform,
        processId: process.pid,
        educationalNote: 'Application bootstrap demonstrates Node.js module loading and execution patterns'
    });
    
    // Execute main application function with educational error handling
    main().catch((bootstrapError) => {
        logger.error('Application bootstrap failed', bootstrapError, {
            bootstrapStage: 'main_execution',
            criticalFailure: true,
            educationalNote: 'Bootstrap failures require addressing fundamental configuration issues'
        });
        
        console.error('\n🚨 BOOTSTRAP FAILURE - APPLICATION CANNOT START');
        console.error('Check the error messages above and resolve configuration issues.\n');
        
        process.exit(1);
    });
}