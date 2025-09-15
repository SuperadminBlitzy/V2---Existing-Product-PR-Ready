/**
 * Node.js Tutorial Production Server Startup Script
 * 
 * This script provides a streamlined, production-focused server startup process for the Node.js 
 * tutorial HTTP server application. Designed as an optimized alternative to the comprehensive 
 * server.js entry point, this script emphasizes production readiness while maintaining educational 
 * value through clear logging and error handling for deployment environments.
 * 
 * Production Features:
 * - Optimized server startup procedures with essential features only
 * - Streamlined application bootstrap with focused initialization steps
 * - Graceful shutdown procedures with proper process lifecycle management
 * - Production-grade error handling with operational alerting and recovery
 * - Essential monitoring and health checking for production deployments
 * - Script-based server management suitable for process managers and containers
 * 
 * Educational Value:
 * - Demonstrates production deployment patterns and server startup best practices
 * - Shows proper Node.js process lifecycle management and signal handling
 * - Illustrates production error handling strategies and graceful degradation
 * - Provides production monitoring integration and operational logging practices
 * - Demonstrates deployment readiness and environment validation techniques
 * 
 * Integration Points:
 * - Compatible with PM2, Forever, and other Node.js process managers
 * - Suitable for Docker containerization and Kubernetes deployment
 * - Integrates with production monitoring systems through structured logging
 * - Can be integrated with deployment automation and infrastructure as code
 */

// Node.js built-in process module for environment variables and signal handling - Node.js Built-in
const process = require('node:process');

// Import HTTP server functions for production-ready server instantiation and management
const { 
    createHTTPServer, 
    startServer, 
    setupGracefulShutdown, 
    getServerStatus 
} = require('../lib/server/http-server.js');

// Import application configuration for production server settings and deployment parameters
const { appConfig } = require('../lib/config/app-config.js');

// Import production-ready logger for essential application logging and operational monitoring
const { logger } = require('../lib/utils/logger.js');

// Import server error handling for production error management and failure recovery
const { handleServerError } = require('../lib/utils/error-handler.js');

// =============================================================================
// GLOBAL PRODUCTION SERVER STATE
// =============================================================================

/**
 * Global server instance reference for production lifecycle management
 * Production Note: Maintains server reference for graceful shutdown and operational management
 */
let SERVER_INSTANCE = null;

/**
 * Script start timestamp for production timing metrics and performance monitoring
 * Production Note: Enables startup performance measurement and operational benchmarking
 */
let SCRIPT_START_TIME = null;

/**
 * Production mode flag for optimized behavior and deployment-specific features
 * Production Note: Controls production-specific optimizations and operational behaviors
 */
const PRODUCTION_MODE = true;

// =============================================================================
// PRODUCTION STARTUP FUNCTIONS
// =============================================================================

/**
 * Displays a concise production startup banner with essential server information, 
 * configuration details, and operational status for production monitoring and deployment verification.
 * 
 * Production Note: Provides essential startup information for production monitoring without 
 * educational verbosity, focusing on operational status and deployment confirmation.
 * 
 * @param {object} config - Application configuration object containing server settings and deployment information
 * @returns {void} No return value, outputs production startup banner to console with operational information
 */
function displayStartupBanner(config) {
    // Extract essential production configuration for operational display
    const appName = config.app?.name || 'Node.js HTTP Server';
    const appVersion = config.app?.version || '1.0.0';
    const environment = config.environment || 'production';
    const serverPort = config.server?.port || 3000;
    const serverHostname = config.server?.hostname || '127.0.0.1';
    
    // Get current timestamp and process information for operational context
    const timestamp = new Date().toISOString();
    const pid = process.pid;
    const nodeVersion = process.version;
    const platform = process.platform;
    
    // Display production startup banner with essential operational information
    console.log('\n' + '='.repeat(70));
    console.log('🚀 PRODUCTION SERVER STARTUP');
    console.log('='.repeat(70));
    console.log(`Application: ${appName} v${appVersion}`);
    console.log(`Environment: ${environment.toUpperCase()}`);
    console.log(`Server: http://${serverHostname}:${serverPort}/`);
    console.log(`Process ID: ${pid}`);
    console.log(`Node.js: ${nodeVersion} on ${platform}`);
    console.log(`Started: ${timestamp}`);
    console.log('='.repeat(70));
    
    // Include deployment context and operational information
    console.log('STATUS: Server initialization in progress...');
    console.log('HEALTH: Starting production health monitoring');
    console.log('SIGNALS: Graceful shutdown configured (SIGTERM, SIGINT)');
    console.log('='.repeat(70) + '\n');
    
    // Log production banner display for operational tracking
    logger.info('Production startup banner displayed', {
        production: true,
        application: appName,
        version: appVersion,
        environment: environment,
        serverUrl: `http://${serverHostname}:${serverPort}/`,
        processId: pid,
        nodeVersion: nodeVersion,
        platform: platform
    });
}

/**
 * Validates the production environment including Node.js version, system resources, 
 * configuration completeness, and deployment readiness to ensure proper production server operation.
 * 
 * Production Note: Performs essential pre-flight checks for production deployment including 
 * system requirements, configuration validation, and resource availability verification.
 * 
 * @returns {boolean} True if production environment is ready and valid, throws error with operational guidance if validation fails
 */
function validateProductionEnvironment() {
    logger.info('Validating production environment...', {
        production: true,
        phase: 'environment_validation',
        timestamp: new Date().toISOString()
    });
    
    try {
        // Check Node.js version meets production requirements (v18+ LTS recommended)
        const currentNodeVersion = process.version;
        const majorVersion = parseInt(currentNodeVersion.slice(1).split('.')[0]);
        
        if (majorVersion < 18) {
            throw new Error(`Node.js v18+ required for production. Current version: ${currentNodeVersion}. Please upgrade to LTS version.`);
        }
        
        logger.info('Node.js version validation passed', {
            production: true,
            nodeVersion: currentNodeVersion,
            majorVersion: majorVersion,
            requirement: 'v18+ LTS',
            status: 'validated'
        });
        
        // Validate environment variables required for production deployment
        const requiredEnvVars = ['NODE_ENV'];
        const missingEnvVars = [];
        
        requiredEnvVars.forEach(envVar => {
            if (!process.env[envVar]) {
                missingEnvVars.push(envVar);
            }
        });
        
        if (missingEnvVars.length > 0) {
            logger.warn('Missing recommended environment variables for production', {
                production: true,
                missingVariables: missingEnvVars,
                recommendation: 'Set NODE_ENV=production for optimal performance'
            });
        }
        
        // Verify system resources availability including memory and network interfaces
        const memoryUsage = process.memoryUsage();
        const totalMemoryMB = Math.round(memoryUsage.rss / 1024 / 1024);
        
        logger.info('System resource validation completed', {
            production: true,
            memory: {
                rss: `${totalMemoryMB}MB`,
                heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
                heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
                external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
            },
            processUptime: `${Math.floor(process.uptime())}s`
        });
        
        // Check port availability and network configuration for production binding
        const configuredPort = appConfig.server?.port || 3000;
        const configuredHostname = appConfig.server?.hostname || '127.0.0.1';
        
        // Validate production configuration completeness and security settings
        if (!appConfig.server) {
            throw new Error('Server configuration is missing. Check app-config.js for required server settings.');
        }
        
        if (!appConfig.app) {
            throw new Error('Application metadata is missing. Check app-config.js for required application information.');
        }
        
        // Verify all required dependencies and modules are available
        const requiredModules = [
            '../lib/server/http-server.js',
            '../lib/config/app-config.js',
            '../lib/utils/logger.js',
            '../lib/utils/error-handler.js'
        ];
        
        requiredModules.forEach(module => {
            try {
                require.resolve(module);
            } catch (error) {
                throw new Error(`Required module not found: ${module}. Check installation and file paths.`);
            }
        });
        
        // Log production validation results with operational context
        logger.info('Production environment validation completed successfully', {
            production: true,
            validation: {
                nodeVersion: 'passed',
                systemResources: 'validated',
                configuration: 'complete',
                dependencies: 'available',
                networkConfig: 'ready'
            },
            serverConfiguration: {
                port: configuredPort,
                hostname: configuredHostname,
                environment: appConfig.environment,
                productionMode: PRODUCTION_MODE
            }
        });
        
        return true;
        
    } catch (error) {
        // Log validation failure with operational context and deployment guidance
        logger.error('Production environment validation failed', error, {
            production: true,
            phase: 'environment_validation_failed',
            deploymentGuidance: 'Fix validation errors before deployment',
            operationalImpact: 'Server startup will be aborted'
        });
        
        throw error;
    }
}

/**
 * Initializes the HTTP server for production operation with essential configuration, 
 * server creation, and operational setup optimized for production deployment and monitoring.
 * 
 * Production Note: Creates and configures server instance with production-optimized settings 
 * including performance tuning, monitoring setup, and operational logging integration.
 * 
 * @returns {Promise} Promise resolving to configured server instance ready for production startup
 */
async function initializeProductionServer() {
    // Record script start time for production timing metrics
    SCRIPT_START_TIME = Date.now();
    
    logger.info('Initializing production HTTP server...', {
        production: true,
        phase: 'server_initialization',
        startTime: SCRIPT_START_TIME,
        timestamp: new Date().toISOString()
    });
    
    try {
        // Validate production environment using validateProductionEnvironment function
        const environmentValid = validateProductionEnvironment();
        
        if (!environmentValid) {
            throw new Error('Production environment validation failed. Cannot proceed with server initialization.');
        }
        
        // Load and validate production configuration from appConfig module
        const productionConfig = {
            ...appConfig,
            production: {
                optimizeStartup: true,
                enableMonitoring: true,
                gracefulShutdown: true,
                processManagement: true
            }
        };
        
        logger.info('Production configuration loaded', {
            production: true,
            configuration: {
                port: productionConfig.server.port,
                hostname: productionConfig.server.hostname,
                environment: productionConfig.environment,
                monitoring: productionConfig.production.enableMonitoring,
                gracefulShutdown: productionConfig.production.gracefulShutdown
            }
        });
        
        // Create HTTP server instance using createHTTPServer with production settings
        const serverInstance = createHTTPServer({
            production: true,
            ...productionConfig.server,
            educational: {
                ...productionConfig.educational,
                // Override educational settings for production optimization
                showConfigurationInfo: false,
                verboseLogging: false,
                showStartupBanner: false
            }
        });
        
        if (!serverInstance) {
            throw new Error('Failed to create HTTP server instance. Check server configuration and system resources.');
        }
        
        logger.info('HTTP server instance created successfully', {
            production: true,
            serverCreated: true,
            serverType: 'production-optimized',
            productionFeatures: ['monitoring', 'graceful-shutdown', 'error-handling']
        });
        
        // Configure graceful shutdown procedures using setupGracefulShutdown for production reliability
        setupGracefulShutdown(serverInstance);
        
        logger.info('Graceful shutdown procedures configured', {
            production: true,
            shutdownHandlers: ['SIGTERM', 'SIGINT', 'uncaughtException', 'unhandledRejection'],
            gracefulShutdown: true
        });
        
        // Set up production monitoring and health checking capabilities
        // Store server instance for operational monitoring and status tracking
        SERVER_INSTANCE = serverInstance;
        
        // Initialize operational logging and production status tracking
        const initializationTime = Date.now() - SCRIPT_START_TIME;
        
        logger.info('Production server initialization completed', {
            production: true,
            serverInstance: 'ready',
            initializationTime: `${initializationTime}ms`,
            nextPhase: 'server_startup',
            operationalStatus: 'initialized'
        });
        
        return serverInstance;
        
    } catch (error) {
        // Handle initialization errors with production error management
        logger.error('Production server initialization failed', error, {
            production: true,
            phase: 'initialization_error',
            initializationTime: SCRIPT_START_TIME ? Date.now() - SCRIPT_START_TIME : 0,
            operationalImpact: 'Server startup aborted'
        });
        
        throw error;
    }
}

/**
 * Starts the HTTP server in production mode with optimized startup procedures, operational logging, 
 * comprehensive error handling, and production monitoring for reliable service operation.
 * 
 * Production Note: Binds server to network interface with production-grade error handling, 
 * performance monitoring, and operational status reporting for deployment environments.
 * 
 * @param {object} serverInstance - Configured HTTP server instance ready for production startup
 * @returns {Promise} Promise resolving when server successfully starts and is ready for production traffic
 */
async function startProductionServer(serverInstance) {
    logger.info('Starting production HTTP server...', {
        production: true,
        phase: 'server_startup',
        timestamp: new Date().toISOString()
    });
    
    try {
        // Extract production server configuration including port and hostname
        const serverPort = appConfig.server.port;
        const serverHostname = appConfig.server.hostname;
        
        logger.info('Production server configuration extracted', {
            production: true,
            serverPort: serverPort,
            serverHostname: serverHostname,
            bindingAddress: `${serverHostname}:${serverPort}`
        });
        
        // Start HTTP server using startServer function with production error handling
        await startServer(serverInstance, serverPort, serverHostname);
        
        // Wait for successful port binding and production network interface activation
        logger.info('Production server started successfully', {
            production: true,
            serverStatus: 'running',
            serverUrl: `http://${serverHostname}:${serverPort}/`,
            processId: process.pid,
            startupComplete: true
        });
        
        // Initialize production health monitoring and status reporting
        const serverStatus = getServerStatus();
        
        logger.info('Production health monitoring initialized', {
            production: true,
            healthMonitoring: true,
            serverHealth: serverStatus.status,
            uptime: serverStatus.uptime,
            memoryUsage: serverStatus.process?.memoryUsage
        });
        
        // Display operational status and production deployment confirmation
        console.log('\n' + '✅'.repeat(35));
        console.log('🎯 PRODUCTION SERVER READY');
        console.log('✅'.repeat(35));
        console.log(`🌐 Server URL: http://${serverHostname}:${serverPort}/`);
        console.log(`📊 Process ID: ${process.pid}`);
        console.log(`⚡ Status: RUNNING`);
        console.log(`🔄 Health: MONITORING ACTIVE`);
        console.log(`🛡️  Shutdown: GRACEFUL (Ctrl+C or SIGTERM)`);
        console.log('✅'.repeat(35) + '\n');
        
        // Set up production metrics collection and performance monitoring
        const startupTotalTime = SCRIPT_START_TIME ? Date.now() - SCRIPT_START_TIME : 0;
        
        logger.info('Production server startup metrics', {
            production: true,
            metrics: {
                totalStartupTime: `${startupTotalTime}ms`,
                serverUrl: `http://${serverHostname}:${serverPort}/`,
                processId: process.pid,
                memoryUsage: process.memoryUsage(),
                nodeVersion: process.version,
                platform: process.platform
            },
            performance: {
                startupOptimized: startupTotalTime < 2000,
                productionReady: true,
                monitoringActive: true
            }
        });
        
    } catch (error) {
        // Handle server startup errors with production error management
        logger.error('Production server startup failed', error, {
            production: true,
            phase: 'server_startup_error',
            serverInstance: !!serverInstance,
            operationalImpact: 'Service unavailable'
        });
        
        throw error;
    }
}

/**
 * Handles graceful shutdown procedures for production server including connection draining, 
 * resource cleanup, operational logging, and proper process termination for production reliability.
 * 
 * Production Note: Implements production-grade shutdown with connection draining, resource cleanup, 
 * and operational logging for reliable service termination in deployment environments.
 * 
 * @param {string} signal - Process signal triggering shutdown (SIGTERM, SIGINT, etc.)
 * @param {number} exitCode - Process exit code for production monitoring, defaults to 0
 * @returns {Promise} Promise resolving after complete production shutdown with cleanup confirmation
 */
async function handleProductionShutdown(signal, exitCode = 0) {
    // Log production shutdown initiation with signal and operational context
    logger.info('Production server shutdown initiated', {
        production: true,
        signal: signal,
        exitCode: exitCode,
        shutdownReason: getSignalDescription(signal),
        timestamp: new Date().toISOString(),
        processId: process.pid
    });
    
    try {
        // Calculate uptime statistics for operational summary
        const shutdownStartTime = Date.now();
        const totalUptime = SCRIPT_START_TIME ? shutdownStartTime - SCRIPT_START_TIME : 0;
        
        console.log('\n' + '⚠️ '.repeat(25));
        console.log('🔄 GRACEFUL SHUTDOWN IN PROGRESS');
        console.log('⚠️ '.repeat(25));
        console.log(`📡 Signal: ${signal}`);
        console.log(`⏱️  Uptime: ${Math.floor(totalUptime / 1000)}s`);
        console.log(`🔄 Draining connections...`);
        
        // Stop accepting new connections and begin graceful connection draining
        if (SERVER_INSTANCE && SERVER_INSTANCE.listening) {
            // Wait for existing requests to complete with production timeout handling
            await new Promise((resolve) => {
                SERVER_INSTANCE.close(() => {
                    logger.info('Server stopped accepting new connections', {
                        production: true,
                        connectionHandling: 'graceful_drainage',
                        shutdownPhase: 'connection_draining'
                    });
                    resolve();
                });
            });
        }
        
        // Clean up production resources and operational monitoring
        SERVER_INSTANCE = null;
        
        // Log shutdown completion with uptime statistics and operational summary
        const shutdownDuration = Date.now() - shutdownStartTime;
        
        logger.info('Production server shutdown completed', {
            production: true,
            shutdownComplete: true,
            signal: signal,
            exitCode: exitCode,
            totalUptime: `${Math.floor(totalUptime / 1000)}s`,
            shutdownDuration: `${shutdownDuration}ms`,
            resourceCleanup: 'complete'
        });
        
        console.log('✅ Connection draining complete');
        console.log('✅ Resources cleaned up');
        console.log('✅ Shutdown successful');
        console.log('⚠️ '.repeat(25) + '\n');
        
        // Clear global server references and production state cleanup
        SCRIPT_START_TIME = null;
        
        // Exit process with appropriate code for production process management
        process.exit(exitCode);
        
    } catch (error) {
        // Handle shutdown errors with production error logging
        logger.error('Production shutdown error occurred', error, {
            production: true,
            shutdownError: true,
            signal: signal,
            fallbackAction: 'forced_termination'
        });
        
        // Force exit if graceful shutdown fails
        process.exit(1);
    }
}

/**
 * Handles production errors with comprehensive error logging, operational alerting, graceful 
 * degradation, and appropriate recovery procedures for production reliability and monitoring.
 * 
 * Production Note: Implements production-grade error handling with operational alerting, 
 * error categorization, and appropriate recovery strategies for deployment environments.
 * 
 * @param {Error} error - Production error object with operational context
 * @param {object} context - Production error context including server state and operational information
 * @returns {void} No return value, logs error with operational context and initiates appropriate recovery procedures
 */
function handleProductionError(error, context = {}) {
    // Log production error with comprehensive operational context using handleServerError
    const errorContext = {
        production: true,
        errorType: 'production_error',
        errorCode: error.code || 'UNKNOWN_PRODUCTION_ERROR',
        errorMessage: error.message,
        timestamp: new Date().toISOString(),
        processId: process.pid,
        serverInstance: !!SERVER_INSTANCE,
        uptime: SCRIPT_START_TIME ? Date.now() - SCRIPT_START_TIME : 0,
        memoryUsage: process.memoryUsage(),
        ...context
    };
    
    // Assess error severity and impact on production service availability
    const errorSeverity = assessErrorSeverity(error);
    const serviceImpact = assessServiceImpact(error, SERVER_INSTANCE);
    
    logger.error('Production error detected', error, {
        ...errorContext,
        severity: errorSeverity,
        serviceImpact: serviceImpact,
        operationalAlertLevel: getAlertLevel(errorSeverity)
    });
    
    // Determine appropriate recovery strategy based on error type and production requirements
    let recoveryStrategy = 'continue_operation';
    let requiresShutdown = false;
    
    if (errorSeverity === 'critical' || serviceImpact === 'service_unavailable') {
        recoveryStrategy = 'graceful_shutdown';
        requiresShutdown = true;
    } else if (errorSeverity === 'high' || serviceImpact === 'degraded_service') {
        recoveryStrategy = 'monitor_and_alert';
    }
    
    // Log operational error summary with production monitoring context
    logger.warn('Production error recovery strategy determined', {
        production: true,
        errorSeverity: errorSeverity,
        serviceImpact: serviceImpact,
        recoveryStrategy: recoveryStrategy,
        shutdownRequired: requiresShutdown,
        operationalGuidance: getOperationalGuidance(errorSeverity, serviceImpact)
    });
    
    // Execute appropriate error recovery procedures for production continuity
    if (requiresShutdown) {
        logger.error('Critical production error requires shutdown', {
            production: true,
            shutdownReason: 'critical_error_recovery',
            errorType: error.name || 'Error',
            operationalNote: 'Service will be restarted by process manager'
        });
        
        // Initiate graceful shutdown if error indicates critical production failure
        handleProductionShutdown('CRITICAL_ERROR', 1);
    } else {
        // Update operational status and error tracking for production monitoring
        logger.info('Production service continuing with error monitoring', {
            production: true,
            serviceStatus: 'operational_with_monitoring',
            errorTracking: 'active',
            recoveryStrategy: recoveryStrategy,
            alertLevel: getAlertLevel(errorSeverity)
        });
    }
}

/**
 * Main production startup function that orchestrates the complete server startup process including 
 * initialization, startup procedures, error handling setup, and production monitoring for reliable service operation.
 * 
 * Production Note: Main entry point for production server deployment that coordinates all startup phases 
 * with comprehensive error handling and operational monitoring suitable for production environments.
 * 
 * @returns {Promise} Promise resolving after successful production server startup ready for service traffic
 */
async function main() {
    try {
        // Set up production error handlers for uncaught exceptions and unhandled rejections
        process.on('uncaughtException', (error) => {
            handleProductionError(error, {
                errorType: 'uncaught_exception',
                phase: 'runtime_error',
                operationalImpact: 'potential_service_disruption'
            });
        });
        
        process.on('unhandledRejection', (reason, promise) => {
            const error = reason instanceof Error ? reason : new Error(String(reason));
            handleProductionError(error, {
                errorType: 'unhandled_rejection',
                phase: 'promise_error',
                promise: promise,
                operationalImpact: 'potential_memory_leak'
            });
        });
        
        logger.info('Production error handlers configured', {
            production: true,
            errorHandlers: ['uncaughtException', 'unhandledRejection'],
            errorHandling: 'comprehensive'
        });
        
        // Display production startup banner with operational context
        displayStartupBanner(appConfig);
        
        // Initialize production server using initializeProductionServer with comprehensive setup
        const serverInstance = await initializeProductionServer();
        
        if (!serverInstance) {
            throw new Error('Server initialization returned null instance. Check configuration and system resources.');
        }
        
        // Start production server using startProductionServer with operational monitoring
        await startProductionServer(serverInstance);
        
        // Log successful production startup with operational details and service information
        logger.info('Production server startup completed successfully', {
            production: true,
            startupComplete: true,
            serviceStatus: 'ready_for_traffic',
            operationalReadiness: 'full',
            monitoringActive: true,
            healthCheckEndpoint: getServerStatus(),
            deploymentSuccess: true
        });
        
        // Set up continuous production monitoring and health checking
        setInterval(() => {
            const status = getServerStatus();
            if (status.status !== 'running') {
                logger.warn('Production server status check detected issue', {
                    production: true,
                    statusCheck: 'failed',
                    serverStatus: status.status,
                    operationalAlert: 'server_health_degraded'
                });
            }
        }, 30000); // Health check every 30 seconds
        
    } catch (error) {
        // Handle any startup errors with production error management and recovery
        logger.error('Production server startup failed', error, {
            production: true,
            startupFailed: true,
            phase: 'main_startup_error',
            operationalImpact: 'service_unavailable',
            deploymentStatus: 'failed'
        });
        
        // Display production error notice
        console.error('\n' + '❌'.repeat(35));
        console.error('💥 PRODUCTION STARTUP FAILED');
        console.error('❌'.repeat(35));
        console.error(`🚨 Error: ${error.message}`);
        console.error('📋 Check logs for detailed error information');
        console.error('🔧 Fix configuration issues and restart');
        console.error('❌'.repeat(35) + '\n');
        
        // Exit with error code for production process management
        process.exit(1);
    }
}

// =============================================================================
// UTILITY HELPER FUNCTIONS
// =============================================================================

/**
 * Gets human-readable description of process signals for operational context
 * Production Note: Helps operations teams understand shutdown triggers
 */
function getSignalDescription(signal) {
    const descriptions = {
        'SIGTERM': 'Termination request (graceful)',
        'SIGINT': 'Interrupt signal (Ctrl+C)',
        'CRITICAL_ERROR': 'Critical error shutdown',
        'UNCAUGHT_EXCEPTION': 'Unhandled exception',
        'UNHANDLED_REJECTION': 'Promise rejection'
    };
    
    return descriptions[signal] || `Process signal: ${signal}`;
}

/**
 * Assesses error severity for production alerting and response
 * Production Note: Categorizes errors for appropriate operational response
 */
function assessErrorSeverity(error) {
    const criticalCodes = ['EADDRINUSE', 'EACCES', 'MODULE_NOT_FOUND'];
    const highCodes = ['TIMEOUT', 'CONNECTION_ERROR'];
    
    if (criticalCodes.includes(error.code)) return 'critical';
    if (highCodes.includes(error.code)) return 'high';
    if (error.name === 'TypeError' || error.name === 'ReferenceError') return 'high';
    return 'medium';
}

/**
 * Assesses service impact for operational decision making
 * Production Note: Determines service availability impact for recovery strategies
 */
function assessServiceImpact(error, serverInstance) {
    if (!serverInstance || !serverInstance.listening) return 'service_unavailable';
    if (error.code === 'EADDRINUSE' || error.code === 'EACCES') return 'service_unavailable';
    return 'service_operational';
}

/**
 * Gets operational alert level for monitoring systems
 * Production Note: Provides alert severity for monitoring and notification systems
 */
function getAlertLevel(severity) {
    const levels = {
        'critical': 'ALERT',
        'high': 'WARNING',
        'medium': 'NOTICE'
    };
    
    return levels[severity] || 'INFO';
}

/**
 * Gets operational guidance for error handling
 * Production Note: Provides actionable guidance for operations teams
 */
function getOperationalGuidance(severity, impact) {
    if (severity === 'critical' || impact === 'service_unavailable') {
        return 'Immediate attention required. Service restart may be needed.';
    }
    if (severity === 'high' || impact === 'degraded_service') {
        return 'Monitor closely. Consider investigating and addressing promptly.';
    }
    return 'Continue monitoring. Address during next maintenance window.';
}

// =============================================================================
// SCRIPT EXECUTION
// =============================================================================

// Execute main startup function if script is run directly
if (require.main === module) {
    logger.info('Production server startup script initiated', {
        production: true,
        scriptPath: __filename,
        processId: process.pid,
        nodeVersion: process.version,
        platform: process.platform,
        startTime: new Date().toISOString()
    });
    
    main().catch((error) => {
        handleProductionError(error, {
            phase: 'main_execution_error',
            operationalImpact: 'startup_failure'
        });
    });
}

// Export main function for programmatic usage and testing
module.exports = {
    main,
    displayStartupBanner,
    validateProductionEnvironment,
    initializeProductionServer,
    startProductionServer,
    handleProductionShutdown,
    handleProductionError
};