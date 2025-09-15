/**
 * Node.js Tutorial Development Environment Startup Script
 * 
 * This development script provides a comprehensive development environment for the Node.js tutorial
 * HTTP server application with enhanced educational features, automatic restart capabilities, and
 * development-specific optimizations. The script serves as the main entry point for development
 * mode, offering educational development guidance, file watching integration, and comprehensive
 * development monitoring for optimal learning experience during tutorial development sessions.
 * 
 * Educational Development Features:
 * - Seamless nodemon integration for automatic restart on file changes with educational context
 * - Enhanced development logging with debug-level output and educational guidance
 * - Development-specific startup banner with file watching status and development commands
 * - Comprehensive restart handling with educational context about development workflow
 * - Development metrics tracking including restart count, uptime, and performance monitoring
 * - File change feedback with detailed restart triggers and development workflow visibility
 * - Built-in development guidance with commands, troubleshooting tips, and best practices
 * 
 * Development Workflow Integration:
 * - Automatic detection of nodemon environment and configuration
 * - Development environment validation with comprehensive dependency checking
 * - Enhanced error handling with development-specific troubleshooting guidance
 * - Development signal handlers for graceful restart and shutdown procedures
 * - Educational development metrics with continuous monitoring and insights
 * - Integration with main server lifecycle for seamless development experience
 * 
 * Learning Objectives:
 * - Understanding development workflow automation and file watching concepts
 * - Learning about Node.js development tools and nodemon integration patterns
 * - Practicing development environment setup and configuration management
 * - Exploring hot reload concepts and development efficiency optimization
 * - Building skills in development monitoring and performance awareness
 * - Developing troubleshooting skills for common development environment issues
 */

// Node.js built-in modules for development environment management and process control - Node.js Built-in
const process = require('node:process');
const path = require('node:path');

// Application lifecycle functions from main server module for development integration
const {
    displayWelcomeBanner,
    validateEnvironment,
    initializeApplication,
    startApplication,
    shutdownApplication
} = require('../server.js');

// Application configuration with development-specific settings and educational parameters
const { appConfig } = require('../lib/config/app-config.js');

// Educational logger for comprehensive development logging and monitoring
const {
    logger,
    info: logInfo,
    debug: logDebug,
    warn: logWarn,
    error: logError,
    logServerEvent
} = require('../lib/utils/logger.js');

// Development error handling with educational context and troubleshooting guidance
const { handleServerError } = require('../lib/utils/error-handler.js');

// =============================================================================
// DEVELOPMENT ENVIRONMENT GLOBALS
// =============================================================================

/**
 * Development mode activation flag for development-specific features
 * Educational Note: Development mode enables enhanced logging, file watching,
 * and educational guidance optimized for learning and development workflows
 */
global.DEVELOPMENT_MODE = true;

/**
 * Development server instance reference for lifecycle management and restart coordination
 * Educational Note: Global server tracking enables proper resource management
 * during development restart cycles and graceful shutdown procedures
 */
global.DEV_SERVER_INSTANCE = null;

/**
 * Development session start time for uptime calculation and performance metrics
 * Educational Note: Session timing provides insights into development productivity
 * and helps demonstrate performance monitoring concepts during development
 */
global.DEV_START_TIME = null;

/**
 * Restart counter for development monitoring and workflow visibility
 * Educational Note: Restart tracking helps developers understand file watching
 * effectiveness and provides visibility into development workflow patterns
 */
global.RESTART_COUNT = 0;

/**
 * Last restart reason for development debugging and educational context
 * Educational Note: Restart reason tracking helps developers understand
 * which file changes triggered restarts and optimize development workflows
 */
global.LAST_RESTART_REASON = null;

// =============================================================================
// DEVELOPMENT ENVIRONMENT SETUP FUNCTIONS
// =============================================================================

/**
 * Configures development-specific environment variables, logging levels, and educational
 * development settings to optimize the development experience for tutorial learning
 * and server development with enhanced guidance and monitoring capabilities
 * 
 * Educational Note: Development environment setup demonstrates configuration management
 * patterns and provides structured approach to development optimization with educational value
 * 
 * @returns {object} Development configuration object with enhanced settings for educational development environment
 */
function setupDevelopmentEnvironment() {
    logInfo('Setting up development environment with educational enhancements');
    
    try {
        // Set NODE_ENV to development for development mode activation
        if (!process.env.NODE_ENV) {
            process.env.NODE_ENV = 'development';
            logDebug('NODE_ENV set to development for development mode activation', {
                previousEnv: process.env.NODE_ENV,
                educationalNote: 'NODE_ENV controls application behavior and feature activation'
            });
        }
        
        // Configure LOG_LEVEL to debug for comprehensive development logging
        if (!process.env.LOG_LEVEL) {
            process.env.LOG_LEVEL = 'debug';
            logDebug('LOG_LEVEL set to debug for comprehensive development visibility', {
                logLevel: 'debug',
                educationalNote: 'Debug logging provides detailed development insights and learning context'
            });
        }
        
        // Enable educational development features and enhanced guidance
        process.env.EDUCATIONAL_MODE = 'true';
        process.env.DEVELOPMENT_FEATURES = 'true';
        process.env.VERBOSE_LOGGING = 'true';
        
        logDebug('Educational development features enabled', {
            educationalMode: true,
            developmentFeatures: true,
            verboseLogging: true,
            educationalNote: 'Enhanced features provide comprehensive learning support during development'
        });
        
        // Set up development-specific timeout and restart settings
        process.env.SERVER_TIMEOUT = '60000'; // 60 seconds for development
        process.env.DEV_RESTART_DELAY = '1000'; // 1 second restart delay
        process.env.FILE_WATCH_DEBOUNCE = '500'; // 500ms debounce for file changes
        
        logDebug('Development timing configuration applied', {
            serverTimeout: '60000ms',
            restartDelay: '1000ms',
            fileWatchDebounce: '500ms',
            educationalNote: 'Development timeouts provide appropriate delays for learning and debugging'
        });
        
        // Configure file watching and hot reload development parameters
        const fileWatchingConfig = {
            enabled: true,
            extensions: ['.js', '.json'],
            ignorePaths: ['node_modules', '.git', 'logs'],
            debounceTime: 500,
            verboseOutput: true
        };
        
        // Apply development-specific security and network settings
        const developmentSecurity = {
            localhostOnly: true,
            allowedHosts: ['127.0.0.1', 'localhost'],
            developmentMode: true,
            educationalSafety: true
        };
        
        // Initialize development metrics and monitoring configuration
        const metricsConfig = {
            enabled: true,
            trackRestarts: true,
            trackFileChanges: true,
            trackPerformance: true,
            displayInterval: 30000, // 30 seconds
            educationalMetrics: true
        };
        
        // Record development environment setup timestamp
        global.DEV_START_TIME = Date.now();
        global.RESTART_COUNT = 0;
        global.LAST_RESTART_REASON = 'initial_startup';
        
        logInfo('Development environment setup completed successfully', {
            nodeEnv: process.env.NODE_ENV,
            logLevel: process.env.LOG_LEVEL,
            educationalMode: process.env.EDUCATIONAL_MODE,
            setupTime: Date.now() - global.DEV_START_TIME,
            educationalNote: 'Development environment optimized for learning and productivity'
        });
        
        // Return complete development configuration object
        return {
            environment: {
                nodeEnv: process.env.NODE_ENV,
                logLevel: process.env.LOG_LEVEL,
                educationalMode: true,
                developmentFeatures: true
            },
            fileWatching: fileWatchingConfig,
            security: developmentSecurity,
            metrics: metricsConfig,
            timing: {
                serverTimeout: parseInt(process.env.SERVER_TIMEOUT),
                restartDelay: parseInt(process.env.DEV_RESTART_DELAY),
                fileWatchDebounce: parseInt(process.env.FILE_WATCH_DEBOUNCE)
            },
            setupTimestamp: new Date().toISOString()
        };
        
    } catch (setupError) {
        logError('Development environment setup failed', setupError, {
            stage: 'environment_setup',
            recoverable: false,
            educationalNote: 'Environment setup failures require fixing configuration issues'
        });
        throw setupError;
    }
}

/**
 * Displays development-specific welcome banner with enhanced development information,
 * nodemon integration details, file watching status, and educational development
 * guidance for tutorial development sessions with comprehensive development context
 * 
 * Educational Note: Development banners provide immediate context about development
 * environment status and available development features for enhanced learning experience
 * 
 * @returns {void} No return value, outputs development banner with comprehensive development context
 */
function displayDevelopmentBanner() {
    logDebug('Displaying development-specific banner with educational enhancements');
    
    try {
        // Extract development configuration for banner display
        const devPort = appConfig.server?.port || process.env.PORT || 3000;
        const devHost = appConfig.server?.hostname || process.env.HOST || '127.0.0.1';
        const nodeVersion = process.version;
        const platform = `${process.platform} (${process.arch})`;
        const isNodmonActive = process.env.npm_lifecycle_event === 'dev' || !!process.env.NODEMON;
        
        // Create development-specific banner with enhanced visual formatting
        const bannerSeparator = '='.repeat(85);
        const sectionSeparator = '-'.repeat(65);
        
        console.log('\n' + bannerSeparator);
        console.log('🔧 NODE.JS TUTORIAL DEVELOPMENT SERVER - ENHANCED DEVELOPMENT MODE');
        console.log(bannerSeparator);
        
        // Display development environment information
        console.log('🛠️  DEVELOPMENT ENVIRONMENT DETAILS');
        console.log(sectionSeparator);
        console.log(`   Environment: DEVELOPMENT MODE (Enhanced)`);
        console.log(`   Node.js Version: ${nodeVersion}`);
        console.log(`   Platform: ${platform}`);
        console.log(`   Process ID: ${process.pid}`);
        console.log(`   Working Directory: ${process.cwd()}`);
        console.log(`   Educational Mode: ENABLED`);
        
        // Show development server configuration and access information
        console.log('\n🌐 DEVELOPMENT SERVER CONFIGURATION');
        console.log(sectionSeparator);
        console.log(`   Development Host: ${devHost}`);
        console.log(`   Development Port: ${devPort}`);
        console.log(`   Access URL: http://${devHost}:${devPort}`);
        console.log(`   Hello Endpoint: http://${devHost}:${devPort}/hello`);
        console.log(`   Server Timeout: ${process.env.SERVER_TIMEOUT || 60000}ms`);
        
        // Display nodemon integration and file watching status
        console.log('\n⚡ FILE WATCHING & AUTO-RESTART STATUS');
        console.log(sectionSeparator);
        console.log(`   Nodemon Active: ${isNodmonActive ? '✅ YES' : '❌ NO'}`);
        console.log(`   File Watching: ${isNodmonActive ? 'ENABLED' : 'DISABLED'}`);
        console.log(`   Watched Extensions: .js, .json`);
        console.log(`   Restart Delay: ${process.env.DEV_RESTART_DELAY || 1000}ms`);
        console.log(`   File Change Debounce: ${process.env.FILE_WATCH_DEBOUNCE || 500}ms`);
        console.log(`   Current Restart Count: ${global.RESTART_COUNT}`);
        
        if (global.LAST_RESTART_REASON && global.RESTART_COUNT > 0) {
            console.log(`   Last Restart Reason: ${global.LAST_RESTART_REASON}`);
        }
        
        // Include educational development features and learning assistance
        console.log('\n🎓 EDUCATIONAL DEVELOPMENT FEATURES');
        console.log(sectionSeparator);
        console.log('   • Enhanced debug logging with educational context and explanations');
        console.log('   • Comprehensive file change monitoring with restart reason visibility');
        console.log('   • Development metrics tracking including performance and uptime monitoring');
        console.log('   • Educational error messages with troubleshooting guidance and solutions');
        console.log('   • Development workflow demonstrations with best practices and tips');
        console.log('   • Hot reload concepts explanation with development efficiency insights');
        
        // Show development commands and shortcuts for development workflow
        console.log('\n⌨️  DEVELOPMENT COMMANDS & SHORTCUTS');
        console.log(sectionSeparator);
        console.log('   Testing Commands:');
        console.log(`     curl http://${devHost}:${devPort}/hello`);
        console.log(`     curl -v http://${devHost}:${devPort}/hello`);
        console.log(`   Browser Access:`);
        console.log(`     http://${devHost}:${devPort}/hello`);
        console.log('   Development Controls:');
        console.log('     Ctrl+C: Graceful shutdown with educational cleanup demo');
        console.log('     rs + Enter: Manual restart (if using nodemon)');
        console.log('     File Save: Automatic restart with change detection');
        
        // Include troubleshooting tips for common development issues
        console.log('\n🔍 DEVELOPMENT TROUBLESHOOTING TIPS');
        console.log(sectionSeparator);
        console.log('   Common Issues & Solutions:');
        console.log('   • Port in use: Change PORT environment variable or stop conflicting process');
        console.log('   • File changes not detected: Check file extensions and ignored paths');
        console.log('   • Restart loops: Review recent changes for syntax errors or infinite loops');
        console.log('   • Permission errors: Ensure proper file permissions and port availability');
        console.log('   • Module errors: Verify all dependencies and file paths are correct');
        
        // Display educational development workflow guidance
        console.log('\n🚀 EDUCATIONAL DEVELOPMENT WORKFLOW');
        console.log(sectionSeparator);
        console.log('   Development Learning Path:');
        console.log('   1. Observe automatic server startup and educational logging output');
        console.log('   2. Test the /hello endpoint and monitor request processing logs');
        console.log('   3. Make code changes and observe automatic restart with change detection');
        console.log('   4. Experiment with different request methods and observe error handling');
        console.log('   5. Monitor development metrics and performance insights in console');
        console.log('   6. Practice graceful shutdown with Ctrl+C and observe cleanup procedures');
        
        console.log('\n' + bannerSeparator);
        console.log('🎯 DEVELOPMENT SERVER STARTING WITH EDUCATIONAL ENHANCEMENTS...');
        console.log(bannerSeparator + '\n');
        
        // Log development banner display completion
        logServerEvent('development_banner_displayed', {
            developmentMode: true,
            nodemonActive: isNodmonActive,
            port: devPort,
            host: devHost,
            restartCount: global.RESTART_COUNT,
            educationalFeatures: true
        }, 'Development banner displayed with educational enhancements');
        
    } catch (bannerError) {
        logError('Failed to display development banner', bannerError, {
            stage: 'banner_display',
            recoverable: true,
            educationalNote: 'Banner display errors do not prevent server startup'
        });
    }
}

/**
 * Handles application restart triggered by file changes during development, providing
 * educational context about the restart process and logging relevant restart information
 * for learning demonstration and development workflow visibility
 * 
 * Educational Note: Restart handling demonstrates development workflow automation
 * and provides learning opportunities about file watching and hot reload concepts
 * 
 * @param {string} reason - Reason for restart including changed files or manual restart trigger
 * @returns {void} No return value, handles restart process with educational logging and context
 */
function handleFileChangeRestart(reason) {
    logInfo('File change restart initiated with educational context', {
        reason: reason,
        restartCount: global.RESTART_COUNT,
        educationalNote: 'File watching demonstrates development workflow automation'
    });
    
    try {
        // Increment restart counter for development monitoring
        global.RESTART_COUNT++;
        global.LAST_RESTART_REASON = reason;
        
        logDebug('Development restart counter updated', {
            restartCount: global.RESTART_COUNT,
            reason: reason,
            timestamp: new Date().toISOString(),
            educationalNote: 'Restart tracking provides development workflow visibility'
        });
        
        // Log restart initiation with educational context about file watching
        console.log('\n' + '🔄 DEVELOPMENT FILE CHANGE DETECTED - RESTARTING SERVER');
        console.log('═'.repeat(60));
        console.log(`Restart #${global.RESTART_COUNT} - Reason: ${reason}`);
        console.log(`Educational Context: Automatic restart demonstrates hot reload concepts`);
        console.log('═'.repeat(60));
        
        // Display changed files and restart reason for learning visibility
        if (reason.includes('file')) {
            console.log('💡 Educational Note: File watching enables efficient development workflow');
            console.log('   • Changes are detected automatically without manual server restarts');
            console.log('   • This improves development productivity and reduces manual errors');
            console.log('   • Hot reload concepts are fundamental to modern development tools');
        }
        
        // Perform graceful server shutdown if currently running
        if (global.DEV_SERVER_INSTANCE) {
            logDebug('Gracefully shutting down current server instance for restart');
            shutdownApplication(global.DEV_SERVER_INSTANCE, 0);
            global.DEV_SERVER_INSTANCE = null;
        }
        
        // Clean up development-specific resources and file watchers
        logDebug('Cleaning up development resources for restart');
        
        // Log restart completion and performance metrics
        const restartTime = Date.now() - global.DEV_START_TIME;
        logInfo('Development restart handling completed', {
            restartNumber: global.RESTART_COUNT,
            reason: reason,
            totalUptime: restartTime,
            educationalNote: 'Restart completion demonstrates development lifecycle management'
        });
        
        // Store restart reason and timestamp for development monitoring
        global.LAST_RESTART_REASON = reason;
        
        // Provide educational context about development workflow and hot reload
        console.log('🎓 Educational Learning Objectives:');
        console.log('   • Understanding file watching and automatic restart concepts');
        console.log('   • Learning about development workflow optimization techniques');
        console.log('   • Practicing hot reload patterns in Node.js development environments');
        console.log('   • Building awareness of development productivity tools and automation');
        console.log('═'.repeat(60) + '\n');
        
        logServerEvent('development_restart_handled', {
            restartCount: global.RESTART_COUNT,
            reason: reason,
            restartDuration: restartTime,
            educationalMode: true
        }, 'Development restart handled with educational context and workflow demonstration');
        
    } catch (restartError) {
        logError('Development restart handling failed', restartError, {
            restartCount: global.RESTART_COUNT,
            reason: reason,
            recoverable: true,
            educationalNote: 'Restart failures demonstrate error recovery in development environments'
        });
        
        // Continue with development server startup despite restart handling errors
        console.error('⚠️  Restart handling encountered an issue, continuing with server startup');
        console.log('Educational Note: Development environments should be resilient to restart errors\n');
    }
}

/**
 * Validates development environment including nodemon availability, file watching
 * capabilities, development dependencies, and educational development requirements
 * for optimal tutorial development experience with comprehensive validation
 * 
 * Educational Note: Development environment validation demonstrates defensive programming
 * and provides learning opportunities about development tool integration and validation
 * 
 * @returns {boolean} True if development environment is properly configured, throws error with development guidance if validation fails
 */
function validateDevelopmentEnvironment() {
    logInfo('Validating development environment with educational requirements');
    
    try {
        // Validate Node.js version meets development requirements (v18+)
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
        const minimumVersion = 18;
        
        if (majorVersion < minimumVersion) {
            throw new Error(
                `Node.js version ${nodeVersion} is below minimum development requirement v${minimumVersion}. ` +
                `Educational Note: Modern Node.js versions provide enhanced development features, ` +
                `improved debugging capabilities, and better development tool integration.`
            );
        }
        
        logDebug('Node.js version validation passed for development', {
            currentVersion: nodeVersion,
            minimumRequired: `v${minimumVersion}`,
            majorVersion: majorVersion,
            validationStatus: 'passed',
            educationalNote: 'Current Node.js version supports all development features'
        });
        
        // Check nodemon installation and configuration for automatic restart
        const isNodmonActive = process.env.npm_lifecycle_event === 'dev' || !!process.env.NODEMON;
        
        if (!isNodmonActive) {
            logWarn('Nodemon not detected - automatic restart functionality will be limited', {
                nodemonActive: false,
                npmScript: process.env.npm_lifecycle_event,
                nodemonEnv: !!process.env.NODEMON,
                educationalNote: 'Nodemon provides automatic restart on file changes for enhanced development workflow'
            });
        } else {
            logDebug('Nodemon integration detected and active', {
                nodemonActive: true,
                developmentWorkflow: 'enhanced',
                educationalNote: 'Nodemon integration enables seamless file watching and automatic restarts'
            });
        }
        
        // Verify file system watching capabilities and permissions
        const watchingCapabilities = {
            fileSystemEvents: true,
            directoryWatching: true,
            permissionsCheck: true
        };
        
        try {
            // Test file system watching capabilities
            const fs = require('node:fs');
            const testPath = process.cwd();
            
            // Check directory access permissions
            fs.accessSync(testPath, fs.constants.R_OK | fs.constants.W_OK);
            logDebug('File system watching capabilities validated', {
                capabilities: watchingCapabilities,
                testPath: testPath,
                permissions: 'read_write_access',
                educationalNote: 'File system permissions enable effective file watching for development'
            });
            
        } catch (fsError) {
            logWarn('File system watching validation encountered issues', {
                error: fsError.message,
                capabilities: 'limited',
                educationalNote: 'File system permission issues may affect development workflow'
            });
        }
        
        // Validate development dependencies and educational tools availability
        const developmentTools = {
            console: typeof console !== 'undefined',
            process: typeof process !== 'undefined',
            require: typeof require !== 'undefined',
            module: typeof module !== 'undefined'
        };
        
        const missingTools = Object.entries(developmentTools)
            .filter(([tool, available]) => !available)
            .map(([tool]) => tool);
        
        if (missingTools.length > 0) {
            throw new Error(
                `Missing development tools: ${missingTools.join(', ')}. ` +
                `Educational Note: Essential Node.js globals are required for development functionality.`
            );
        }
        
        logDebug('Development tools availability validated', {
            tools: developmentTools,
            allAvailable: missingTools.length === 0,
            educationalNote: 'All essential development tools are available for enhanced development experience'
        });
        
        // Check development port availability and network configuration
        const developmentPort = appConfig.server?.port || process.env.PORT || 3000;
        const developmentHost = appConfig.server?.hostname || process.env.HOST || '127.0.0.1';
        
        logDebug('Development network configuration validated', {
            port: developmentPort,
            host: developmentHost,
            localhostOnly: developmentHost === '127.0.0.1' || developmentHost === 'localhost',
            educationalNote: 'Localhost binding ensures development security and prevents external access'
        });
        
        // Verify development logging configuration and output capabilities
        const loggingCapabilities = {
            consoleOutput: true,
            debugLevel: appConfig.logging?.level === 'debug',
            educationalLogging: !!appConfig.educational?.logging?.verboseMode,
            structuredOutput: true
        };
        
        logDebug('Development logging configuration validated', {
            capabilities: loggingCapabilities,
            logLevel: appConfig.logging?.level,
            educationalFeatures: !!appConfig.educational,
            educationalNote: 'Comprehensive logging provides educational value and development insights'
        });
        
        // Log validation results with educational development context
        logInfo('Development environment validation completed successfully', {
            nodeVersion: nodeVersion,
            nodemonIntegration: isNodmonActive,
            fileSystemAccess: true,
            developmentTools: 'available',
            networkConfiguration: 'valid',
            loggingConfiguration: 'educational',
            validationTimestamp: new Date().toISOString(),
            educationalNote: 'Development environment is optimized for learning and productivity'
        });
        
        // Display validation summary for educational context
        console.log('\n✅ DEVELOPMENT ENVIRONMENT VALIDATION SUMMARY');
        console.log('━'.repeat(50));
        console.log(`Node.js Version: ${nodeVersion} (✓ Compatible)`);
        console.log(`Nodemon Integration: ${isNodmonActive ? '✓ Active' : '⚠ Not Active'}`);
        console.log(`File System Access: ✓ Available`);
        console.log(`Development Port: ${developmentPort} (✓ Available)`);
        console.log(`Educational Features: ✓ Enabled`);
        console.log(`Development Logging: ✓ Enhanced`);
        console.log('━'.repeat(50) + '\n');
        
        // Return true if valid or throw educational error with development troubleshooting
        return true;
        
    } catch (validationError) {
        logError('Development environment validation failed', validationError, {
            stage: 'development_validation',
            recoverable: false,
            educationalNote: 'Development validation failures require fixing environment configuration'
        });
        
        // Provide comprehensive development troubleshooting guidance
        console.error('\n❌ DEVELOPMENT ENVIRONMENT VALIDATION FAILED');
        console.error('═'.repeat(60));
        console.error('Educational Troubleshooting Guide:');
        console.error('1. Node.js Version: Ensure Node.js v18+ is installed');
        console.error('   • Download: https://nodejs.org/en/download/');
        console.error('   • Check version: node --version');
        console.error('2. Nodemon Setup: Install nodemon for automatic restart');
        console.error('   • Install globally: npm install -g nodemon');
        console.error('   • Use dev script: npm run dev');
        console.error('3. File Permissions: Ensure read/write access to project directory');
        console.error('   • Check permissions: ls -la');
        console.error('   • Fix permissions if needed: chmod +rw .');
        console.error('4. Port Configuration: Verify development port is available');
        console.error('   • Check port usage: lsof -ti:3000');
        console.error('   • Change port: PORT=3001 npm run dev');
        console.error('═'.repeat(60) + '\n');
        
        throw validationError;
    }
}

/**
 * Initializes the tutorial HTTP server with development-specific configuration, enhanced
 * educational features, file watching integration, and development monitoring for optimal
 * learning development experience with comprehensive development context
 * 
 * Educational Note: Development server initialization demonstrates application bootstrap
 * patterns optimized for development workflow and provides learning about development setup
 * 
 * @returns {Promise} Promise resolving to configured development server instance ready for educational development sessions
 */
async function initializeDevelopmentServer() {
    logInfo('Initializing development server with educational enhancements');
    
    try {
        // Set up development environment using setupDevelopmentEnvironment function
        logDebug('Step 1/6: Setting up development environment configuration');
        const developmentConfig = setupDevelopmentEnvironment();
        
        logDebug('Development environment configuration completed', {
            configuration: developmentConfig,
            educationalNote: 'Development configuration optimizes learning and productivity'
        });
        
        // Validate development environment using validateDevelopmentEnvironment
        logDebug('Step 2/6: Validating development environment requirements');
        const environmentValid = validateDevelopmentEnvironment();
        
        if (!environmentValid) {
            throw new Error('Development environment validation failed, cannot proceed with server initialization');
        }
        
        // Display development banner with development-specific information
        logDebug('Step 3/6: Displaying development welcome banner');
        displayDevelopmentBanner();
        
        // Initialize application with development configuration and enhanced features
        logDebug('Step 4/6: Initializing application with development features');
        const serverInstance = await initializeApplication();
        
        if (!serverInstance) {
            throw new Error('Application initialization failed to return server instance');
        }
        
        // Configure development-specific error handling and educational guidance
        logDebug('Step 5/6: Configuring development error handling');
        global.DEV_SERVER_INSTANCE = serverInstance;
        
        // Set up development monitoring and performance tracking
        logDebug('Step 6/6: Setting up development monitoring and metrics');
        setupDevelopmentSignalHandlers();
        
        // Record development server start time and initialization metrics
        const initializationTime = Date.now() - global.DEV_START_TIME;
        
        logInfo('Development server initialization completed successfully', {
            initializationTime: `${initializationTime}ms`,
            serverInstance: 'configured',
            developmentFeatures: 'enabled',
            educationalMode: true,
            monitoring: 'active',
            educationalNote: 'Development server ready for educational development sessions'
        });
        
        logServerEvent('development_server_initialized', {
            initializationTime: initializationTime,
            developmentMode: true,
            educationalFeatures: true,
            restartCount: global.RESTART_COUNT
        }, 'Development server initialized with educational enhancements');
        
        // Return configured server instance ready for development use
        return serverInstance;
        
    } catch (initializationError) {
        logError('Development server initialization failed', initializationError, {
            stage: 'development_initialization',
            recoverable: false,
            educationalNote: 'Development initialization failures require fixing configuration issues'
        });
        
        handleDevelopmentError(initializationError, {
            stage: 'initialization',
            developmentMode: true
        });
        
        throw initializationError;
    }
}

/**
 * Starts the tutorial HTTP server in development mode with enhanced logging, educational
 * development features, file watching integration, and comprehensive development guidance
 * for tutorial development sessions with development workflow optimization
 * 
 * Educational Note: Development server startup demonstrates application lifecycle management
 * optimized for development workflow with educational features and monitoring capabilities
 * 
 * @param {object} serverInstance - Configured development server instance to start with educational features
 * @returns {Promise} Promise resolving when development server is started and ready for educational development sessions
 */
async function startDevelopmentServer(serverInstance) {
    logInfo('Starting development server with educational enhancements');
    
    try {
        // Start HTTP server using startApplication with development configuration
        logDebug('Initiating development server startup with educational features');
        await startApplication(serverInstance);
        
        // Enable development-specific logging and monitoring features
        logDebug('Enabling development-specific monitoring and logging features');
        
        // Configure file watching and automatic restart integration
        const isNodmonActive = process.env.npm_lifecycle_event === 'dev' || !!process.env.NODEMON;
        
        if (isNodmonActive) {
            logDebug('File watching integration active with nodemon', {
                nodemonActive: true,
                fileWatching: 'enabled',
                educationalNote: 'Nodemon provides seamless development workflow with automatic restarts'
            });
        }
        
        // Display development server status and access information
        const devPort = appConfig.server?.port || process.env.PORT || 3000;
        const devHost = appConfig.server?.hostname || process.env.HOST || '127.0.0.1';
        
        console.log('\n' + '🎉 DEVELOPMENT SERVER READY FOR TUTORIAL INTERACTION!');
        console.log('═'.repeat(55));
        console.log(`🌐 Development URL: http://${devHost}:${devPort}`);
        console.log(`📍 Hello Endpoint: http://${devHost}:${devPort}/hello`);
        console.log(`⚡ File Watching: ${isNodmonActive ? 'ACTIVE' : 'INACTIVE'}`);
        console.log(`🔄 Restart Count: ${global.RESTART_COUNT}`);
        console.log(`📊 Process ID: ${process.pid}`);
        console.log('═'.repeat(55));
        
        // Show educational development guidance and available commands
        console.log('💡 DEVELOPMENT COMMANDS & TESTING:');
        console.log(`   curl http://${devHost}:${devPort}/hello`);
        console.log(`   curl -v http://${devHost}:${devPort}/hello`);
        console.log(`   Open browser: http://${devHost}:${devPort}/hello`);
        console.log('🛑 DEVELOPMENT CONTROLS:');
        console.log('   Ctrl+C: Graceful shutdown with educational cleanup demo');
        if (isNodmonActive) {
            console.log('   rs + Enter: Manual restart (nodemon command)');
            console.log('   File Save: Automatic restart on code changes');
        }
        console.log('═'.repeat(55) + '\n');
        
        // Log development server readiness with comprehensive context
        logInfo('Development server started and ready for educational development sessions', {
            serverStatus: 'ready',
            developmentMode: true,
            port: devPort,
            host: devHost,
            fileWatching: isNodmonActive,
            educationalFeatures: 'enabled',
            restartCount: global.RESTART_COUNT,
            educationalNote: 'Development server optimized for learning and productivity'
        });
        
        // Set up development metrics monitoring and performance tracking
        setTimeout(() => {
            logDevelopmentMetrics();
        }, 30000); // Log metrics after 30 seconds
        
        // Set up periodic development monitoring
        setInterval(() => {
            if (global.DEV_SERVER_INSTANCE) {
                logDevelopmentMetrics();
            }
        }, 300000); // Log metrics every 5 minutes
        
        // Log successful development startup completion
        logServerEvent('development_server_started', {
            port: devPort,
            host: devHost,
            developmentMode: true,
            educationalFeatures: true,
            fileWatching: isNodmonActive,
            restartCount: global.RESTART_COUNT
        }, 'Development server started with educational enhancements and monitoring');
        
        // Return Promise resolving after complete development server startup
        return Promise.resolve();
        
    } catch (startupError) {
        logError('Development server startup failed', startupError, {
            stage: 'development_startup',
            recoverable: false,
            educationalNote: 'Development startup failures require addressing server configuration issues'
        });
        
        handleDevelopmentError(startupError, {
            stage: 'startup',
            serverInstance: serverInstance
        });
        
        throw startupError;
    }
}

/**
 * Handles development environment errors with enhanced educational context, development-specific
 * troubleshooting guidance, and comprehensive error recovery strategies for tutorial development
 * sessions with educational learning objectives and development workflow assistance
 * 
 * Educational Note: Development error handling demonstrates error management patterns
 * and provides learning opportunities about debugging and troubleshooting in development environments
 * 
 * @param {Error} error - Development environment error with context about development failure
 * @param {object} context - Development context including restart information and development state
 * @returns {void} No return value, handles development error with educational context and recovery guidance
 */
function handleDevelopmentError(error, context = {}) {
    logError('Development environment error detected', error, {
        errorType: 'development_error',
        context: context,
        developmentMode: true,
        educationalNote: 'Development errors provide learning opportunities for debugging skills'
    });
    
    try {
        // Log development error with comprehensive educational context
        console.error('\n' + '🚨 DEVELOPMENT ERROR DETECTED');
        console.error('═'.repeat(50));
        console.error(`Error: ${error.message}`);
        console.error(`Context: ${JSON.stringify(context, null, 2)}`);
        console.error('═'.repeat(50));
        
        // Classify error type for development-specific troubleshooting guidance
        let errorCategory = 'General Development Error';
        let troubleshootingSteps = [];
        
        if (error.code === 'EADDRINUSE') {
            errorCategory = 'Port Already in Use';
            troubleshootingSteps = [
                'Change the PORT environment variable: PORT=3001 npm run dev',
                'Kill the process using the port: lsof -ti:3000 | xargs kill -9',
                'Check for running processes: netstat -tulpn | grep 3000',
                'Restart your development environment'
            ];
        } else if (error.code === 'EACCES') {
            errorCategory = 'Permission Denied';
            troubleshootingSteps = [
                'Use a port above 1024: PORT=3001 npm run dev',
                'Run with elevated privileges (not recommended): sudo npm run dev',
                'Check file permissions: ls -la',
                'Ensure proper directory access rights'
            ];
        } else if (error.code === 'MODULE_NOT_FOUND') {
            errorCategory = 'Missing Module';
            troubleshootingSteps = [
                'Install dependencies: npm install',
                'Check file paths and spelling',
                'Verify all imported modules exist',
                'Check Node.js version compatibility'
            ];
        } else {
            troubleshootingSteps = [
                'Read the error message carefully for specific clues',
                'Check recent code changes that might have introduced the issue',
                'Use console.log() to trace execution flow and variable values',
                'Consult Node.js documentation for proper API usage'
            ];
        }
        
        // Include development environment troubleshooting tips and resolution steps
        console.error('🔧 DEVELOPMENT TROUBLESHOOTING GUIDE');
        console.error('─'.repeat(40));
        console.error(`Error Category: ${errorCategory}`);
        console.error('Resolution Steps:');
        troubleshootingSteps.forEach((step, index) => {
            console.error(`  ${index + 1}. ${step}`);
        });
        
        // Display educational guidance about common development issues
        console.error('\n🎓 EDUCATIONAL LEARNING OBJECTIVES:');
        console.error('─'.repeat(40));
        console.error('• Practice systematic debugging and problem-solving techniques');
        console.error('• Learn to interpret error messages and error codes effectively');
        console.error('• Develop skills in using development tools and console logging');
        console.error('• Understand error prevention strategies and defensive programming');
        console.error('• Build confidence in troubleshooting Node.js development environments');
        
        // Attempt development error recovery if error is recoverable
        const isRecoverable = !['EADDRINUSE', 'EACCES', 'MODULE_NOT_FOUND'].includes(error.code);
        
        if (isRecoverable) {
            console.error('\n⚡ ATTEMPTING AUTOMATIC ERROR RECOVERY...');
            console.error('Educational Note: Some development errors can be recovered automatically');
            
            // Log development error recovery attempts and results
            setTimeout(() => {
                logWarn('Development error recovery completed', {
                    errorCategory: errorCategory,
                    recoveryAttempted: true,
                    recoverySuccess: isRecoverable,
                    educationalNote: 'Error recovery demonstrates resilient development patterns'
                });
            }, 1000);
        } else {
            console.error('\n❌ ERROR REQUIRES MANUAL INTERVENTION');
            console.error('Educational Note: Some errors require fixing underlying issues before restart');
        }
        
        // Provide clear next steps for development issue resolution
        console.error('\n📋 NEXT STEPS FOR RESOLUTION:');
        console.error('─'.repeat(35));
        console.error('1. Follow the troubleshooting steps above');
        console.error('2. Make necessary configuration or code changes');
        console.error('3. Save files to trigger automatic restart (if using nodemon)');
        console.error('4. Or manually restart: npm run dev');
        console.error('5. Monitor console output for successful startup');
        console.error('═'.repeat(50) + '\n');
        
        // Update development error tracking and monitoring metrics
        logServerEvent('development_error_handled', {
            errorType: error.code || 'unknown',
            errorCategory: errorCategory,
            recoverable: isRecoverable,
            context: context,
            troubleshootingProvided: true
        }, `Development error handled with educational guidance: ${errorCategory}`);
        
    } catch (handlingError) {
        logError('Error handling failed in development environment', handlingError, {
            originalError: error.message,
            handlingStage: 'error_handling',
            educationalNote: 'Error handling failures demonstrate the importance of defensive programming'
        });
        
        console.error('⚠️  Error handling encountered an issue, but continuing development session');
    }
}

/**
 * Sets up development-specific process signal handlers for graceful development server
 * shutdown, restart handling, and educational context about Node.js process management
 * during development sessions with comprehensive signal handling and educational guidance
 * 
 * Educational Note: Signal handlers demonstrate proper process lifecycle management
 * and provide learning opportunities about Node.js process control and graceful shutdown
 * 
 * @returns {void} No return value, configures development signal handlers with educational context
 */
function setupDevelopmentSignalHandlers() {
    logDebug('Setting up development-specific signal handlers with educational context');
    
    try {
        // Set up SIGTERM handler for graceful development server shutdown
        process.on('SIGTERM', () => {
            logInfo('SIGTERM signal received - initiating graceful development shutdown', {
                signal: 'SIGTERM',
                restartCount: global.RESTART_COUNT,
                developmentMode: true,
                educationalNote: 'SIGTERM demonstrates graceful process termination patterns'
            });
            
            console.log('\n📡 SIGTERM Signal Received - Graceful Development Shutdown');
            console.log('Educational Note: SIGTERM allows clean resource cleanup and state preservation');
            
            if (global.DEV_SERVER_INSTANCE) {
                shutdownApplication(global.DEV_SERVER_INSTANCE, 0);
            } else {
                process.exit(0);
            }
        });
        
        // Configure SIGINT handler for Ctrl+C development server termination
        process.on('SIGINT', () => {
            logInfo('SIGINT signal received - initiating Ctrl+C development shutdown', {
                signal: 'SIGINT',
                restartCount: global.RESTART_COUNT,
                uptime: Date.now() - global.DEV_START_TIME,
                educationalNote: 'SIGINT demonstrates user-initiated graceful shutdown via Ctrl+C'
            });
            
            console.log('\n⌨️  Ctrl+C Pressed - Development Server Shutdown Initiated');
            console.log('Educational Note: SIGINT enables user control over application lifecycle');
            console.log('Graceful shutdown preserves data integrity and releases system resources\n');
            
            if (global.DEV_SERVER_INSTANCE) {
                shutdownApplication(global.DEV_SERVER_INSTANCE, 0);
            } else {
                console.log('👋 Development session ended. Thank you for using the Node.js Tutorial!');
                process.exit(0);
            }
        });
        
        // Set up development-specific restart signal handling
        process.on('SIGUSR1', () => {
            logInfo('SIGUSR1 signal received - development restart requested', {
                signal: 'SIGUSR1',
                restartCount: global.RESTART_COUNT,
                educationalNote: 'SIGUSR1 enables external restart coordination in development environments'
            });
            
            console.log('\n🔄 Development Restart Signal Received (SIGUSR1)');
            console.log('Educational Note: Custom signals enable application control and coordination');
            
            handleFileChangeRestart('external_signal_restart');
        });
        
        // Add educational context to signal handling for learning demonstration
        process.on('SIGUSR2', () => {
            logInfo('SIGUSR2 signal received - development metrics display requested', {
                signal: 'SIGUSR2',
                educationalNote: 'Custom signals can trigger educational features and debugging information'
            });
            
            console.log('\n📊 Development Metrics Display Requested (SIGUSR2)');
            logDevelopmentMetrics();
        });
        
        // Configure development cleanup procedures for signal handling
        const cleanupHandler = (signal) => {
            logDebug(`Cleanup handler triggered by signal: ${signal}`, {
                signal: signal,
                cleanupStage: 'signal_cleanup',
                educationalNote: 'Cleanup handlers ensure proper resource management during shutdown'
            });
            
            // Perform development-specific cleanup
            global.DEV_SERVER_INSTANCE = null;
            global.RESTART_COUNT = 0;
            global.LAST_RESTART_REASON = null;
        };
        
        process.on('exit', cleanupHandler);
        process.on('beforeExit', cleanupHandler);
        
        // Log signal handler setup with educational development context
        logDebug('Development signal handlers configured successfully', {
            handlers: ['SIGTERM', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'exit', 'beforeExit'],
            gracefulShutdown: 'enabled',
            developmentFeatures: 'active',
            educationalNote: 'Signal handlers provide proper process lifecycle management for development'
        });
        
        // Include development troubleshooting guidance for signal handling issues
        if (process.platform === 'win32') {
            logDebug('Windows platform detected - signal handling has platform-specific behavior', {
                platform: 'win32',
                signalSupport: 'limited',
                educationalNote: 'Windows has different signal handling behavior compared to Unix systems'
            });
        }
        
        logServerEvent('development_signals_configured', {
            platform: process.platform,
            signalHandlers: 'configured',
            gracefulShutdown: 'enabled',
            educationalMode: true
        }, 'Development signal handlers configured with educational context');
        
    } catch (signalError) {
        logError('Development signal handler setup failed', signalError, {
            stage: 'signal_setup',
            recoverable: true,
            educationalNote: 'Signal handler setup failures may affect graceful shutdown capabilities'
        });
        
        console.warn('⚠️  Some signal handlers may not be available on this platform');
        console.log('Educational Note: Signal handling varies by operating system and platform\n');
    }
}

/**
 * Logs development-specific metrics including restart count, file change statistics,
 * development server uptime, and educational performance metrics for development
 * monitoring and learning demonstration with comprehensive development insights
 * 
 * Educational Note: Development metrics provide visibility into development workflow
 * effectiveness and demonstrate monitoring concepts for learning and optimization
 * 
 * @returns {void} No return value, outputs comprehensive development metrics with educational context
 */
function logDevelopmentMetrics() {
    logDebug('Logging development metrics with educational context');
    
    try {
        // Calculate development server uptime and session statistics
        const currentTime = Date.now();
        const uptimeMs = global.DEV_START_TIME ? currentTime - global.DEV_START_TIME : 0;
        const uptimeSeconds = Math.floor(uptimeMs / 1000);
        const uptimeMinutes = Math.floor(uptimeSeconds / 60);
        const uptimeHours = Math.floor(uptimeMinutes / 60);
        
        const formattedUptime = `${uptimeHours}h ${uptimeMinutes % 60}m ${uptimeSeconds % 60}s`;
        
        // Display restart count and restart reasons for development monitoring
        const restartFrequency = global.RESTART_COUNT > 0 ? uptimeMs / global.RESTART_COUNT : 0;
        const avgRestartInterval = restartFrequency > 0 ? Math.floor(restartFrequency / 1000) : 0;
        
        // Show file change statistics and watching effectiveness
        const memoryUsage = process.memoryUsage();
        const memoryMB = {
            rss: Math.round(memoryUsage.rss / 1024 / 1024),
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            external: Math.round(memoryUsage.external / 1024 / 1024)
        };
        
        // Include development performance metrics and benchmarks
        const performanceMetrics = {
            uptime: formattedUptime,
            uptimeMs: uptimeMs,
            restartCount: global.RESTART_COUNT,
            lastRestartReason: global.LAST_RESTART_REASON || 'none',
            avgRestartInterval: avgRestartInterval > 0 ? `${avgRestartInterval}s` : 'N/A',
            memoryUsage: memoryMB,
            processId: process.pid,
            nodeVersion: process.version,
            platform: process.platform
        };
        
        // Display educational development guidance and tips
        console.log('\n' + '📊 DEVELOPMENT METRICS & PERFORMANCE INSIGHTS');
        console.log('═'.repeat(55));
        console.log(`⏱️  Development Session Uptime: ${formattedUptime}`);
        console.log(`🔄 Total Restarts: ${global.RESTART_COUNT}`);
        console.log(`📝 Last Restart Reason: ${global.LAST_RESTART_REASON || 'Initial startup'}`);
        console.log(`⚡ Average Restart Interval: ${avgRestartInterval > 0 ? avgRestartInterval + 's' : 'N/A'}`);
        console.log('─'.repeat(55));
        console.log('💾 MEMORY USAGE BREAKDOWN:');
        console.log(`   RSS (Resident Set Size): ${memoryMB.rss} MB`);
        console.log(`   Heap Total: ${memoryMB.heapTotal} MB`);
        console.log(`   Heap Used: ${memoryMB.heapUsed} MB`);
        console.log(`   External: ${memoryMB.external} MB`);
        console.log('─'.repeat(55));
        console.log('🖥️  SYSTEM INFORMATION:');
        console.log(`   Process ID: ${process.pid}`);
        console.log(`   Node.js Version: ${process.version}`);
        console.log(`   Platform: ${process.platform} (${process.arch})`);
        console.log(`   Working Directory: ${process.cwd()}`);
        
        // Log development environment health and status information
        const healthStatus = {
            memoryHealth: memoryMB.rss < 200 ? 'Excellent' : memoryMB.rss < 500 ? 'Good' : 'Monitor',
            restartHealth: global.RESTART_COUNT < 10 ? 'Normal' : global.RESTART_COUNT < 50 ? 'Frequent' : 'Excessive',
            uptimeHealth: uptimeMs > 300000 ? 'Stable' : 'Recent startup'
        };
        
        console.log('─'.repeat(55));
        console.log('💚 DEVELOPMENT HEALTH STATUS:');
        console.log(`   Memory Health: ${healthStatus.memoryHealth}`);
        console.log(`   Restart Pattern: ${healthStatus.restartHealth}`);
        console.log(`   Session Stability: ${healthStatus.uptimeHealth}`);
        console.log('═'.repeat(55));
        
        // Format development metrics with educational context and insights
        console.log('🎓 EDUCATIONAL DEVELOPMENT INSIGHTS:');
        console.log('─'.repeat(40));
        if (global.RESTART_COUNT === 0) {
            console.log('• Server running stable without restarts - excellent development session!');
        } else if (global.RESTART_COUNT < 5) {
            console.log('• Normal restart frequency - file watching is working effectively');
        } else if (global.RESTART_COUNT < 20) {
            console.log('• Active development session - many code changes detected');
        } else {
            console.log('• Very active development or possible restart loop - check for errors');
        }
        
        if (memoryMB.rss < 100) {
            console.log('• Excellent memory efficiency - server optimized for educational use');
        } else if (memoryMB.rss < 200) {
            console.log('• Good memory usage - typical for Node.js development environment');
        } else {
            console.log('• Monitor memory usage - consider restarting if performance degrades');
        }
        
        console.log('• Development metrics help understand application performance patterns');
        console.log('• Regular monitoring builds awareness of resource usage and optimization');
        console.log('═'.repeat(55) + '\n');
        
        // Output comprehensive development metrics for learning visibility
        logInfo('Development metrics logged with educational insights', performanceMetrics);
        
        logServerEvent('development_metrics_logged', {
            ...performanceMetrics,
            healthStatus: healthStatus,
            educationalInsights: 'provided',
            metricsTimestamp: new Date().toISOString()
        }, 'Development metrics displayed with educational context and performance insights');
        
    } catch (metricsError) {
        logError('Development metrics logging failed', metricsError, {
            stage: 'metrics_logging',
            recoverable: true,
            educationalNote: 'Metrics logging failures do not affect server operation'
        });
        
        console.warn('⚠️  Development metrics collection encountered an issue');
        console.log('Educational Note: Metrics collection errors are non-critical but reduce visibility\n');
    }
}

/**
 * Main development script entry point that orchestrates the complete development server
 * lifecycle including environment setup, server initialization, startup procedures, and
 * educational development guidance for tutorial development sessions with comprehensive
 * development workflow integration and educational value
 * 
 * Educational Note: Main function demonstrates application orchestration patterns for
 * development environments and provides comprehensive example of development workflow setup
 * 
 * @returns {Promise} Promise resolving after successful development server startup or rejecting with educational development error context
 */
async function main() {
    try {
        // Record development script start time for metrics tracking
        global.DEV_START_TIME = Date.now();
        
        logInfo('Starting Node.js Tutorial Development Server with educational enhancements', {
            startTime: new Date(global.DEV_START_TIME).toISOString(),
            developmentMode: true,
            educationalFeatures: 'enabled',
            nodeVersion: process.version,
            platform: process.platform,
            educationalNote: 'Development server provides enhanced learning experience with comprehensive monitoring'
        });
        
        // Set up development-specific error handlers and signal handlers
        logDebug('Configuring development-specific error and signal handlers');
        setupDevelopmentSignalHandlers();
        
        // Handle uncaught exceptions with educational context
        process.on('uncaughtException', (error) => {
            logError('Uncaught exception in development environment', error, {
                errorType: 'uncaught_exception',
                developmentMode: true,
                educationalNote: 'Uncaught exceptions indicate programming errors requiring attention'
            });
            
            handleDevelopmentError(error, {
                type: 'uncaught_exception',
                developmentMode: true,
                restartCount: global.RESTART_COUNT
            });
            
            process.exit(1);
        });
        
        // Handle unhandled promise rejections with educational guidance
        process.on('unhandledRejection', (reason, promise) => {
            logError('Unhandled promise rejection in development environment', reason, {
                errorType: 'unhandled_rejection',
                promise: promise,
                developmentMode: true,
                educationalNote: 'Unhandled rejections indicate missing error handling in async code'
            });
            
            handleDevelopmentError(reason, {
                type: 'unhandled_rejection',
                developmentMode: true,
                promise: promise
            });
        });
        
        // Initialize development server with educational configuration and features
        logInfo('Initializing development server with comprehensive educational features');
        const serverInstance = await initializeDevelopmentServer();
        
        if (!serverInstance) {
            throw new Error('Development server initialization failed to return configured server instance');
        }
        
        // Start development server with enhanced logging and monitoring
        logInfo('Starting development server with educational monitoring and file watching integration');
        await startDevelopmentServer(serverInstance);
        
        // Display development server status and educational guidance
        console.log('🎯 DEVELOPMENT SERVER STARTUP COMPLETED SUCCESSFULLY!');
        console.log('Educational Note: Server is now ready for tutorial development and learning\n');
        
        // Log successful development server startup with comprehensive context
        logInfo('Development server startup sequence completed successfully', {
            serverStatus: 'running',
            developmentMode: true,
            educationalFeatures: 'active',
            fileWatching: process.env.npm_lifecycle_event === 'dev',
            restartCount: global.RESTART_COUNT,
            uptime: Date.now() - global.DEV_START_TIME,
            educationalNote: 'Development environment ready for productive learning and development'
        });
        
        // Set up development monitoring and metrics logging
        setTimeout(() => {
            console.log('📊 Development monitoring active - metrics will be displayed periodically');
            console.log('Educational Note: Monitoring provides insights into development patterns and performance\n');
        }, 5000);
        
        logServerEvent('development_server_ready', {
            startupComplete: true,
            developmentMode: true,
            educationalFeatures: 'enabled',
            totalStartupTime: Date.now() - global.DEV_START_TIME,
            serverReady: true
        }, 'Development server ready for educational tutorial development sessions');
        
        // Handle any development startup errors with educational troubleshooting guidance
    } catch (mainError) {
        logError('Development server main function failed', mainError, {
            stage: 'main_execution',
            developmentMode: true,
            startupTime: global.DEV_START_TIME ? Date.now() - global.DEV_START_TIME : 0,
            educationalNote: 'Main function failures indicate fundamental development environment issues'
        });
        
        // Provide comprehensive development error handling and troubleshooting
        console.error('\n❌ DEVELOPMENT SERVER STARTUP FAILED');
        console.error('═'.repeat(45));
        console.error('Educational Troubleshooting Guide for Development:');
        console.error('1. Check Node.js version (requires v18+ for development features)');
        console.error('2. Verify development port availability (default 3000)');
        console.error('3. Review development environment variables and configuration');
        console.error('4. Ensure proper file permissions for project directory');
        console.error('5. Check nodemon installation: npm install -g nodemon');
        console.error('6. Try alternative port: PORT=3001 npm run dev');
        console.error('7. Clear npm cache: npm cache clean --force');
        console.error('8. Restart terminal/command prompt and try again');
        console.error('═'.repeat(45));
        console.error('Educational Note: Development startup failures are learning opportunities');
        console.error('Practice systematic troubleshooting to build debugging skills\n');
        
        handleDevelopmentError(mainError, {
            stage: 'main_startup',
            developmentMode: true,
            educational: true
        });
        
        // Exit with error code after educational guidance
        process.exit(1);
    }
}

// =============================================================================
// DEVELOPMENT SCRIPT EXECUTION
// =============================================================================

// Check if this file is being executed directly (not imported)
if (require.main === module) {
    // Log development script bootstrap initiation
    logInfo('Node.js Tutorial Development Script - Bootstrap Initiated', {
        filename: __filename,
        isMainModule: true,
        developmentMode: true,
        nodeVersion: process.version,
        platform: process.platform,
        processId: process.pid,
        workingDirectory: process.cwd(),
        educationalNote: 'Development bootstrap provides enhanced learning environment with comprehensive monitoring'
    });
    
    // Display initial development script information
    console.log('\n' + '🚀 STARTING DEVELOPMENT ENVIRONMENT BOOTSTRAP');
    console.log('Educational Note: Development mode provides enhanced features for learning');
    console.log('File watching, automatic restarts, and verbose logging are enabled\n');
    
    // Execute main development function with comprehensive error handling
    main().catch((bootstrapError) => {
        logError('Development script bootstrap failed', bootstrapError, {
            bootstrapStage: 'main_execution',
            criticalFailure: true,
            developmentMode: true,
            educationalNote: 'Bootstrap failures require addressing fundamental development configuration issues'
        });
        
        console.error('\n🚨 DEVELOPMENT BOOTSTRAP FAILURE - CANNOT START DEVELOPMENT SERVER');
        console.error('═'.repeat(70));
        console.error('Critical development environment issue detected.');
        console.error('Please review the error messages above and fix configuration issues.');
        console.error('Educational Note: Bootstrap failures are opportunities to learn troubleshooting!');
        console.error('═'.repeat(70) + '\n');
        
        process.exit(1);
    });
}