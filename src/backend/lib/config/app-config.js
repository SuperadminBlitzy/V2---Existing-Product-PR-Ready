/**
 * Node.js Tutorial Application Configuration Module
 * 
 * This module provides centralized configuration management for the Node.js tutorial HTTP server
 * application. It manages application metadata, environment settings, logging configuration, and
 * educational parameters while integrating with environment variables and server configuration to
 * provide a unified configuration interface for the entire tutorial application.
 * 
 * Educational Features:
 * - Comprehensive configuration transparency for learning visibility
 * - Educational error messaging and troubleshooting guidance
 * - Tutorial-specific settings optimized for learning experience
 * - Environment variable integration with validation and educational defaults
 * - Centralized configuration management demonstrating best practices
 * 
 * Integration Points:
 * - Server configuration integration via server-config.js module
 * - Environment variable override support with educational validation
 * - Logging configuration providing educational observability
 * - Educational mode settings for enhanced tutorial experience
 */

// Node.js built-in process module - Node.js Built-in
const process = require('node:process');

// Internal server configuration module integration
const { DEFAULT_PORT, DEFAULT_HOSTNAME, SERVER_TIMEOUT } = require('./server-config.js');

// =============================================================================
// GLOBAL APPLICATION CONSTANTS
// =============================================================================

/**
 * Application name constant for tutorial identification and branding
 * Educational Note: Clear application naming helps with process identification
 * and provides context for learning about application metadata management
 */
const APP_NAME = 'Node.js Tutorial HTTP Server';

/**
 * Application version following semantic versioning standards (MAJOR.MINOR.PATCH)
 * Educational Note: Semantic versioning provides clear version communication
 * and helps learners understand software versioning best practices
 */
const APP_VERSION = '1.0.0';

/**
 * Application description explaining the tutorial's educational purpose and scope
 * Educational Note: Clear descriptions help users understand application purpose
 * and provide context for the learning experience
 */
const APP_DESCRIPTION = 'Educational Node.js HTTP server demonstrating fundamental web server concepts';

/**
 * Default environment for safe tutorial operation with educational safeguards
 * Educational Note: Development environment provides safe defaults for learning
 * with enhanced error messages and debugging capabilities
 */
const DEFAULT_ENVIRONMENT = 'development';

/**
 * Educational mode flag enabling tutorial-specific features and guidance
 * Educational Note: Educational mode activates learning-focused features like
 * verbose logging, startup guidance, and educational error messages
 */
const EDUCATIONAL_MODE = true;

// =============================================================================
// APPLICATION METADATA OBJECT
// =============================================================================

/**
 * Complete application metadata object containing all essential application information
 * Educational Note: Centralizing metadata provides single source of truth for
 * application information and demonstrates configuration organization best practices
 */
const APP_METADATA = {
    name: APP_NAME,
    version: APP_VERSION,
    description: APP_DESCRIPTION,
    author: 'Tutorial Developer',
    repository: 'nodejs-tutorial-server',
    license: 'MIT',
    keywords: ['nodejs', 'tutorial', 'http-server', 'educational', 'web-development'],
    tutorial: {
        objectives: [
            'Demonstrate Node.js HTTP server creation using built-in modules',
            'Show fundamental request-response patterns in web development',
            'Illustrate basic routing concepts and URL path handling',
            'Teach proper error handling and HTTP status code usage',
            'Demonstrate configuration management and environment variables'
        ],
        endpoints: ['/hello'],
        learning_goals: [
            'Understanding Node.js HTTP server fundamentals',
            'Mastering basic web server concepts and architecture',
            'Learning event-driven programming patterns',
            'Practicing configuration management techniques',
            'Developing troubleshooting and debugging skills'
        ],
        difficulty_level: 'Beginner',
        estimated_duration: '30-60 minutes',
        prerequisites: [
            'Basic JavaScript knowledge',
            'Node.js installation',
            'Command line familiarity'
        ]
    },
    technical: {
        node_version_required: '18.0.0',
        node_version_recommended: '24.8.0',
        platform_support: ['linux', 'darwin', 'win32'],
        memory_requirements: '512MB minimum',
        disk_space: '100MB available'
    }
};

// =============================================================================
// CONFIGURATION UTILITY FUNCTIONS
// =============================================================================

/**
 * Determines the current application environment from process environment variables
 * with fallback to development mode for educational purposes and safety
 * 
 * Educational Note: Environment detection is crucial for configuration management
 * and allows applications to behave differently in development vs production
 * 
 * @returns {string} Current environment string (development, production, test, or educational)
 */
function getEnvironment() {
    // Check NODE_ENV environment variable for explicit environment setting
    const nodeEnv = process.env.NODE_ENV;
    
    // Educational logging for transparency about environment detection
    if (EDUCATIONAL_MODE) {
        console.log('[CONFIG] Detecting application environment...');
    }
    
    // If no environment variable set, default to development for tutorial safety
    if (!nodeEnv) {
        if (EDUCATIONAL_MODE) {
            console.log('[CONFIG] No NODE_ENV set, defaulting to development for tutorial safety');
            console.log('[EDUCATION] NODE_ENV environment variable controls application behavior');
        }
        return DEFAULT_ENVIRONMENT;
    }
    
    // Validate environment value against supported environments list
    const supportedEnvironments = ['development', 'production', 'test', 'educational'];
    const environment = nodeEnv.toLowerCase().trim();
    
    // Check if provided environment is supported
    if (!supportedEnvironments.includes(environment)) {
        if (EDUCATIONAL_MODE) {
            console.warn(`[CONFIG] Unsupported environment '${environment}', using default: ${DEFAULT_ENVIRONMENT}`);
            console.log(`[EDUCATION] Supported environments: ${supportedEnvironments.join(', ')}`);
        }
        return DEFAULT_ENVIRONMENT;
    }
    
    // Apply educational mode detection based on tutorial context
    if (environment === 'educational' || EDUCATIONAL_MODE) {
        if (EDUCATIONAL_MODE) {
            console.log('[CONFIG] Educational mode detected, activating tutorial features');
        }
        return 'educational';
    }
    
    // Log successful environment detection
    if (EDUCATIONAL_MODE) {
        console.log(`[CONFIG] Environment detected: ${environment}`);
    }
    
    // Return validated environment string for application configuration
    return environment;
}

/**
 * Creates logging configuration object based on environment and educational settings
 * with appropriate log levels and formatting options
 * 
 * Educational Note: Logging configuration varies by environment to provide appropriate
 * verbosity for development vs production while maintaining educational value
 * 
 * @param {string} environment - Current application environment for logging level determination
 * @returns {object} Logging configuration object with level, format, and educational settings
 */
function createLoggingConfig(environment) {
    // Determine appropriate log level based on environment
    let logLevel = 'info';
    if (environment === 'development' || environment === 'educational') {
        logLevel = 'debug';
    } else if (environment === 'production') {
        logLevel = 'warn';
    } else if (environment === 'test') {
        logLevel = 'error';
    }
    
    // Set up educational logging options for tutorial mode
    const educationalOptions = {
        showRequestDetails: environment === 'development' || environment === 'educational',
        includeEducationalPrefixes: EDUCATIONAL_MODE || environment === 'educational',
        enableTroubleshootingTips: environment === 'development' || environment === 'educational',
        verboseServerEvents: environment === 'educational',
        showConfigurationInfo: EDUCATIONAL_MODE || environment === 'educational',
        displayStartupGuidance: environment === 'educational'
    };
    
    // Configure console output formatting for clarity
    const formatting = {
        colorOutput: true,
        includeTimestamp: true,
        includeLogLevel: true,
        timestampFormat: 'ISO',
        messageFormat: 'structured'
    };
    
    // Enable color coding based on terminal support
    if (process.stdout && !process.stdout.isTTY) {
        formatting.colorOutput = false;
    }
    
    // Set up request/response logging for HTTP demonstrations
    const requestLogging = {
        enabled: environment === 'development' || environment === 'educational',
        includeHeaders: environment === 'educational',
        includeBody: environment === 'educational',
        includeResponseTime: true,
        includeDemoInfo: environment === 'educational'
    };
    
    // Configure educational message formatting and prefixes
    const educationalFormatting = {
        prefixes: {
            config: '[CONFIG]',
            education: '[EDUCATION]',
            tutorial: '[TUTORIAL]',
            demo: '[DEMO]',
            help: '[HELP]',
            tip: '[TIP]'
        },
        colors: {
            config: 'blue',
            education: 'green',
            tutorial: 'cyan',
            demo: 'yellow',
            help: 'magenta',
            tip: 'gray'
        }
    };
    
    // Apply debug settings for development environment
    const debugSettings = {
        enabled: environment === 'development' || environment === 'educational',
        showStackTraces: environment === 'development' || environment === 'educational',
        verboseErrors: environment !== 'production',
        includeSourceInfo: environment === 'development'
    };
    
    // Log configuration creation for educational transparency
    if (EDUCATIONAL_MODE) {
        console.log(`[CONFIG] Creating logging configuration for environment: ${environment}`);
        console.log(`[EDUCATION] Log level set to: ${logLevel}`);
    }
    
    // Return complete logging configuration object
    return {
        level: logLevel,
        format: formatting,
        educational: educationalOptions,
        request: requestLogging,
        formatting: educationalFormatting,
        debug: debugSettings,
        targets: {
            console: {
                enabled: true,
                level: logLevel,
                colorize: formatting.colorOutput
            },
            file: {
                enabled: false, // File logging disabled for tutorial simplicity
                level: 'info',
                filename: 'tutorial-server.log'
            }
        }
    };
}

/**
 * Creates server-specific configuration by merging server defaults with application
 * overrides and environment variables for unified server settings
 * 
 * Educational Note: Server configuration integration demonstrates how to merge
 * multiple configuration sources while maintaining educational safety defaults
 * 
 * @returns {object} Server configuration object with port, hostname, timeout, and educational settings
 */
function createServerConfig() {
    // Load base server configuration from serverConfig module
    const baseConfig = {
        port: DEFAULT_PORT,
        hostname: DEFAULT_HOSTNAME,
        timeout: SERVER_TIMEOUT
    };
    
    // Apply environment variable overrides for PORT and HOST
    if (process.env.PORT) {
        const envPort = parseInt(process.env.PORT, 10);
        if (!isNaN(envPort) && envPort > 0 && envPort <= 65535) {
            baseConfig.port = envPort;
            if (EDUCATIONAL_MODE) {
                console.log(`[CONFIG] Port override from environment: ${envPort}`);
            }
        } else if (EDUCATIONAL_MODE) {
            console.warn(`[CONFIG] Invalid PORT environment variable: ${process.env.PORT}`);
        }
    }
    
    if (process.env.HOST || process.env.HOSTNAME) {
        const envHost = (process.env.HOST || process.env.HOSTNAME).toLowerCase();
        // Ensure only localhost variants for tutorial security
        if (envHost === 'localhost' || envHost === '127.0.0.1') {
            baseConfig.hostname = '127.0.0.1'; // Always use IP for consistency
            if (EDUCATIONAL_MODE) {
                console.log(`[CONFIG] Hostname override (localhost only): ${baseConfig.hostname}`);
            }
        } else if (EDUCATIONAL_MODE) {
            console.warn(`[CONFIG] Hostname override rejected for security: ${envHost}`);
            console.log('[EDUCATION] Only localhost hostnames allowed for tutorial safety');
        }
    }
    
    // Set educational timeout values appropriate for tutorial use
    const environment = getEnvironment();
    let timeoutValue = SERVER_TIMEOUT;
    
    if (environment === 'educational') {
        timeoutValue = 60000; // 60 seconds for educational demonstration
    } else if (environment === 'development') {
        timeoutValue = 30000; // 30 seconds for development
    }
    
    if (process.env.SERVER_TIMEOUT) {
        const envTimeout = parseInt(process.env.SERVER_TIMEOUT, 10);
        if (!isNaN(envTimeout) && envTimeout >= 5000 && envTimeout <= 300000) {
            timeoutValue = envTimeout;
            if (EDUCATIONAL_MODE) {
                console.log(`[CONFIG] Timeout override from environment: ${envTimeout}ms`);
            }
        }
    }
    
    baseConfig.timeout = timeoutValue;
    
    // Configure localhost-only binding for educational security
    const securitySettings = {
        localhostOnly: true,
        allowedHosts: ['127.0.0.1', 'localhost'],
        preventExternalAccess: true,
        educationalSecurity: true
    };
    
    // Apply educational server optimization settings
    const optimizations = {
        keepAlive: true,
        keepAliveTimeout: 65000,
        headersTimeout: 66000,
        maxConnections: 100,
        maxHeadersCount: 100,
        maxHeaderSize: 16384
    };
    
    // Set up connection limits appropriate for tutorial environment
    const connectionLimits = {
        maxConcurrentConnections: 50,
        requestTimeout: 10000,
        connectionTimeout: 120000,
        educational: true
    };
    
    // Include tutorial-specific server configuration options
    const educationalOptions = {
        showStartupBanner: environment === 'educational',
        verboseLogging: environment === 'development' || environment === 'educational',
        includeTimingInfo: environment === 'educational',
        showConfigurationInfo: EDUCATIONAL_MODE,
        enableDebugHeaders: environment === 'development' || environment === 'educational',
        displayRequestInfo: environment === 'educational'
    };
    
    // Log server configuration creation for educational transparency
    if (EDUCATIONAL_MODE) {
        console.log('[CONFIG] Creating server configuration with educational settings');
        console.log(`[CONFIG] Server will bind to: ${baseConfig.hostname}:${baseConfig.port}`);
        console.log(`[CONFIG] Request timeout: ${baseConfig.timeout}ms`);
    }
    
    // Return merged server configuration object
    return {
        ...baseConfig,
        security: securitySettings,
        performance: optimizations,
        limits: connectionLimits,
        educational: educationalOptions,
        networking: {
            family: 4, // IPv4 only for tutorial simplicity
            backlog: 511,
            exclusiveAddressUse: true
        }
    };
}

/**
 * Creates educational-specific configuration including tutorial settings, learning
 * objectives, and student-friendly options for enhanced learning experience
 * 
 * Educational Note: Educational configuration provides tutorial-specific features
 * that enhance learning by providing guidance, examples, and educational context
 * 
 * @param {string} environment - Current environment for educational setting adjustments
 * @returns {object} Educational configuration object with tutorial settings and learning parameters
 */
function createEducationalConfig(environment) {
    // Enable educational mode and tutorial-specific features
    const tutorialFeatures = {
        mode: EDUCATIONAL_MODE || environment === 'educational',
        showStartupGuidance: environment === 'educational',
        includeTroubleshootingHelp: environment === 'development' || environment === 'educational',
        enableVerboseErrorMessages: environment !== 'production',
        displayLearningObjectives: environment === 'educational',
        showPerformanceMetrics: environment === 'educational',
        includeUsageExamples: true
    };
    
    // Configure startup banner and tutorial information display
    const startupConfiguration = {
        showBanner: environment === 'educational',
        bannerStyle: 'educational',
        includeWelcomeMessage: true,
        showLearningObjectives: environment === 'educational',
        displayTutorialInfo: environment === 'educational',
        includeHelpText: true
    };
    
    // Set up educational error messaging and troubleshooting guidance
    const errorConfiguration = {
        verboseErrors: environment !== 'production',
        includeTroubleshootingTips: environment === 'development' || environment === 'educational',
        showCommonSolutions: true,
        includeEducationalContext: EDUCATIONAL_MODE,
        errorExamples: environment === 'educational',
        debuggingGuidance: environment === 'development' || environment === 'educational'
    };
    
    // Enable verbose logging for learning demonstration
    const loggingConfiguration = {
        verboseMode: environment === 'educational',
        showRequestFlow: environment === 'educational',
        includeExplanations: EDUCATIONAL_MODE,
        demonstratePatterns: environment === 'educational',
        showBestPractices: true
    };
    
    // Configure educational timing and performance display
    const performanceConfiguration = {
        showTimingInfo: environment === 'educational',
        includeMetrics: environment === 'educational',
        displayPerformanceTips: environment === 'educational',
        measureRequestDuration: environment !== 'production',
        showResourceUsage: environment === 'development' || environment === 'educational'
    };
    
    // Set up tutorial endpoint documentation and usage examples
    const documentationConfiguration = {
        includeEndpointDocs: true,
        showUsageExamples: true,
        provideCurlExamples: environment === 'educational',
        includeAPIDocumentation: environment === 'educational',
        showRequestExamples: true,
        demonstrateResponseFormats: environment === 'educational'
    };
    
    // Enable educational debugging features for learning assistance
    const debugConfiguration = {
        enableDebugMode: environment === 'development' || environment === 'educational',
        showInternalState: environment === 'educational',
        includeDebugHeaders: environment === 'development' || environment === 'educational',
        verboseDebugging: environment === 'educational',
        showCallStack: environment === 'development'
    };
    
    // Educational content and guidance
    const contentConfiguration = {
        learningPath: [
            'Start the server and observe startup messages',
            'Test the /hello endpoint using browser or curl',
            'Examine request/response flow in console output',
            'Try invalid endpoints to see error handling',
            'Stop server gracefully and review educational content'
        ],
        examples: {
            curl_commands: [
                'curl http://localhost:3000/hello',
                'curl -v http://localhost:3000/hello',
                'curl -X GET http://localhost:3000/hello'
            ],
            browser_urls: [
                'http://localhost:3000/hello',
                'http://127.0.0.1:3000/hello'
            ],
            common_issues: [
                'Port already in use: Change PORT environment variable',
                'Connection refused: Ensure server is running',
                'No response: Check hostname and port configuration'
            ]
        },
        tips: [
            'Use Ctrl+C to stop the server gracefully',
            'Check console output for educational messages and tips',
            'Experiment with different request methods to see error handling',
            'Monitor resource usage to understand server performance'
        ]
    };
    
    // Log educational configuration creation
    if (EDUCATIONAL_MODE) {
        console.log('[CONFIG] Creating educational configuration for enhanced learning');
        console.log(`[EDUCATION] Tutorial features enabled: ${tutorialFeatures.mode}`);
    }
    
    // Return complete educational configuration object
    return {
        tutorial: tutorialFeatures,
        startup: startupConfiguration,
        errors: errorConfiguration,
        logging: loggingConfiguration,
        performance: performanceConfiguration,
        documentation: documentationConfiguration,
        debugging: debugConfiguration,
        content: contentConfiguration,
        metadata: {
            created: new Date().toISOString(),
            environment: environment,
            educational_mode: EDUCATIONAL_MODE,
            version: APP_VERSION
        }
    };
}

/**
 * Validates the complete application configuration object to ensure all required
 * properties are present and values are within acceptable ranges for safe operation
 * 
 * Educational Note: Configuration validation prevents runtime errors and provides
 * educational feedback about configuration requirements and best practices
 * 
 * @param {object} config - Application configuration object to validate
 * @returns {boolean} True if configuration is valid, throws ConfigurationError if invalid
 * @throws {Error} ConfigurationError with educational guidance if validation fails
 */
function validateConfiguration(config) {
    // Initialize validation state and error collection
    const errors = [];
    const warnings = [];
    const educationalGuidance = [];
    
    if (EDUCATIONAL_MODE) {
        console.log('[CONFIG] Validating application configuration...');
    }
    
    // Validate application metadata properties (name, version, description)
    if (!config.app) {
        errors.push('Application metadata (app) section is required');
        educationalGuidance.push('APP SECTION: Configuration must include application metadata');
    } else {
        if (!config.app.name || typeof config.app.name !== 'string' || config.app.name.length < 3) {
            errors.push('Application name must be a string with at least 3 characters');
            educationalGuidance.push('APP NAME: Provide a descriptive application name for identification');
        }
        
        if (!config.app.version || typeof config.app.version !== 'string') {
            errors.push('Application version is required and must be a string');
            educationalGuidance.push('VERSION: Use semantic versioning format (MAJOR.MINOR.PATCH)');
        } else if (!/^\d+\.\d+\.\d+$/.test(config.app.version)) {
            warnings.push('Application version should follow semantic versioning format');
            educationalGuidance.push('SEMVER: Format should be X.Y.Z (e.g., 1.0.0)');
        }
        
        if (!config.app.description || typeof config.app.description !== 'string') {
            warnings.push('Application description should be provided for clarity');
            educationalGuidance.push('DESCRIPTION: Clear description helps users understand application purpose');
        }
    }
    
    // Check environment value is supported and appropriate
    if (!config.environment || typeof config.environment !== 'string') {
        errors.push('Environment setting is required and must be a string');
        educationalGuidance.push('ENVIRONMENT: Specify development, production, test, or educational');
    } else {
        const validEnvironments = ['development', 'production', 'test', 'educational'];
        if (!validEnvironments.includes(config.environment)) {
            errors.push(`Environment '${config.environment}' is not supported`);
            educationalGuidance.push(`ENVIRONMENT: Valid values are ${validEnvironments.join(', ')}`);
        }
    }
    
    // Validate server configuration properties and port ranges
    if (!config.server) {
        errors.push('Server configuration section is required');
        educationalGuidance.push('SERVER: Configuration must include server settings');
    } else {
        if (!config.server.port || typeof config.server.port !== 'number') {
            errors.push('Server port must be a number');
            educationalGuidance.push('PORT: Specify a valid port number (1-65535)');
        } else if (config.server.port < 1 || config.server.port > 65535) {
            errors.push('Server port must be between 1 and 65535');
            educationalGuidance.push('PORT RANGE: Valid port range is 1-65535');
        } else if (config.server.port < 1024 && config.environment !== 'test') {
            warnings.push('Port below 1024 may require administrator privileges');
            educationalGuidance.push('PRIVILEGED PORTS: Ports below 1024 require elevated permissions');
        }
        
        if (!config.server.hostname || typeof config.server.hostname !== 'string') {
            errors.push('Server hostname must be a string');
            educationalGuidance.push('HOSTNAME: Specify localhost (127.0.0.1) for tutorial security');
        } else if (config.server.hostname !== '127.0.0.1' && config.server.hostname !== 'localhost') {
            warnings.push('Non-localhost hostname may expose server externally');
            educationalGuidance.push('SECURITY: Use localhost binding for tutorial safety');
        }
        
        if (config.server.timeout && (typeof config.server.timeout !== 'number' || config.server.timeout <= 0)) {
            errors.push('Server timeout must be a positive number');
            educationalGuidance.push('TIMEOUT: Specify timeout in milliseconds (e.g., 30000 for 30 seconds)');
        }
    }
    
    // Verify logging configuration has required properties
    if (!config.logging) {
        errors.push('Logging configuration section is required');
        educationalGuidance.push('LOGGING: Configuration must include logging settings');
    } else {
        const validLevels = ['error', 'warn', 'info', 'debug'];
        if (!config.logging.level || !validLevels.includes(config.logging.level)) {
            errors.push('Logging level must be one of: error, warn, info, debug');
            educationalGuidance.push('LOG LEVEL: Choose appropriate verbosity for environment');
        }
    }
    
    // Ensure educational settings are properly configured
    if (!config.educational) {
        warnings.push('Educational configuration section is missing');
        educationalGuidance.push('EDUCATIONAL: Include educational settings for enhanced learning');
    }
    
    // Check for required configuration completeness
    const requiredSections = ['app', 'server', 'environment', 'logging'];
    for (const section of requiredSections) {
        if (!(section in config)) {
            errors.push(`Required configuration section missing: ${section}`);
            educationalGuidance.push(`REQUIRED: ${section.toUpperCase()} section is essential for operation`);
        }
    }
    
    // Validate configuration consistency between modules
    if (config.server && config.educational) {
        if (config.server.port !== DEFAULT_PORT && !process.env.PORT) {
            warnings.push('Server port differs from default without environment override');
            educationalGuidance.push('PORT CONSISTENCY: Ensure port configuration is intentional');
        }
    }
    
    // Log validation results for educational transparency
    if (EDUCATIONAL_MODE) {
        if (warnings.length > 0) {
            console.warn('[VALIDATION] Configuration warnings:', warnings);
        }
        if (educationalGuidance.length > 0) {
            console.log('[EDUCATION] Configuration guidance:', educationalGuidance);
        }
    }
    
    // Throw ConfigurationError with educational guidance if invalid
    if (errors.length > 0) {
        const errorMessage = `Configuration validation failed:\n${errors.join('\n')}`;
        const guidanceMessage = educationalGuidance.length > 0 
            ? `\n\nEducational Guidance:\n${educationalGuidance.join('\n')}` 
            : '';
        
        const fullMessage = errorMessage + guidanceMessage;
        
        if (EDUCATIONAL_MODE) {
            console.error('[VALIDATION] Configuration validation failed');
            console.error('[EDUCATION] Please fix the configuration errors above');
        }
        
        const error = new Error(fullMessage);
        error.name = 'ConfigurationError';
        error.errors = errors;
        error.warnings = warnings;
        error.guidance = educationalGuidance;
        throw error;
    }
    
    // Log successful validation
    if (EDUCATIONAL_MODE) {
        console.log('[CONFIG] Configuration validation passed successfully');
        if (warnings.length > 0) {
            console.log(`[CONFIG] ${warnings.length} warning(s) noted but configuration is valid`);
        }
    }
    
    // Return true if all validations pass successfully
    return true;
}

/**
 * Loads and merges configuration from environment variables, defaults, and server
 * configuration to create complete application configuration object
 * 
 * Educational Note: Configuration loading demonstrates how to merge multiple configuration
 * sources with proper precedence and validation for robust application setup
 * 
 * @returns {object} Complete application configuration object with all settings merged and validated
 */
function loadConfiguration() {
    if (EDUCATIONAL_MODE) {
        console.log('[CONFIG] Loading application configuration...');
        console.log('[EDUCATION] Configuration sources: defaults, server-config, environment variables');
    }
    
    // Initialize base configuration with application metadata
    const baseConfig = {
        app: { ...APP_METADATA },
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch
    };
    
    // Detect and set current environment using getEnvironment function
    const environment = getEnvironment();
    baseConfig.environment = environment;
    
    // Load server configuration from serverConfig module
    const serverConfig = createServerConfig();
    baseConfig.server = serverConfig;
    
    // Override with environment variables where provided
    const environmentOverrides = {};
    
    // Check for logging level override
    if (process.env.LOG_LEVEL) {
        environmentOverrides.logLevel = process.env.LOG_LEVEL.toLowerCase();
        if (EDUCATIONAL_MODE) {
            console.log(`[CONFIG] Log level override from environment: ${environmentOverrides.logLevel}`);
        }
    }
    
    // Check for educational mode override
    if (process.env.EDUCATIONAL_MODE !== undefined) {
        environmentOverrides.educationalMode = process.env.EDUCATIONAL_MODE.toLowerCase() === 'true';
        if (EDUCATIONAL_MODE) {
            console.log(`[CONFIG] Educational mode override: ${environmentOverrides.educationalMode}`);
        }
    }
    
    // Merge educational settings and tutorial-specific configuration
    const educationalConfig = createEducationalConfig(environment);
    baseConfig.educational = educationalConfig;
    
    // Apply environment-specific configuration adjustments
    const loggingConfig = createLoggingConfig(environment);
    baseConfig.logging = loggingConfig;
    
    // Apply environment overrides to logging configuration
    if (environmentOverrides.logLevel) {
        baseConfig.logging.level = environmentOverrides.logLevel;
    }
    
    if (environmentOverrides.educationalMode !== undefined) {
        baseConfig.educational.tutorial.mode = environmentOverrides.educationalMode;
    }
    
    // Add configuration metadata
    baseConfig.metadata = {
        created: baseConfig.timestamp,
        environment: environment,
        configVersion: '1.0.0',
        source: 'app-config.js',
        educational: EDUCATIONAL_MODE,
        validated: false
    };
    
    // Validate final configuration using validateConfiguration function
    try {
        validateConfiguration(baseConfig);
        baseConfig.metadata.validated = true;
        baseConfig.metadata.validatedAt = new Date().toISOString();
        
        if (EDUCATIONAL_MODE) {
            console.log('[CONFIG] Configuration loaded and validated successfully');
        }
    } catch (error) {
        if (EDUCATIONAL_MODE) {
            console.error('[CONFIG] Configuration validation failed during loading');
            console.error('[EDUCATION] Fix configuration errors before starting server');
        }
        throw error;
    }
    
    // Add runtime information for educational context
    baseConfig.runtime = {
        pid: process.pid,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        versions: process.versions,
        argv: process.argv,
        cwd: process.cwd()
    };
    
    // Log configuration summary for educational transparency
    if (EDUCATIONAL_MODE) {
        console.log('\n' + '='.repeat(80));
        console.log('APPLICATION CONFIGURATION SUMMARY');
        console.log('='.repeat(80));
        console.log(`Application: ${baseConfig.app.name} v${baseConfig.app.version}`);
        console.log(`Environment: ${baseConfig.environment}`);
        console.log(`Server: http://${baseConfig.server.hostname}:${baseConfig.server.port}/`);
        console.log(`Log Level: ${baseConfig.logging.level}`);
        console.log(`Educational Mode: ${baseConfig.educational.tutorial.mode}`);
        console.log(`Node.js Version: ${baseConfig.nodeVersion}`);
        console.log(`Platform: ${baseConfig.platform} (${baseConfig.architecture})`);
        console.log(`Configuration Loaded: ${baseConfig.timestamp}`);
        console.log('='.repeat(80) + '\n');
    }
    
    // Return complete merged configuration object
    return baseConfig;
}

// =============================================================================
// MAIN CONFIGURATION LOADING AND EXPORT
// =============================================================================

/**
 * Main application configuration object created by loading and merging all configuration sources
 * Educational Note: This provides the primary configuration interface for the entire application
 */
let appConfig;

try {
    // Load complete configuration with error handling
    appConfig = loadConfiguration();
    
    if (EDUCATIONAL_MODE) {
        console.log('[CONFIG] Application configuration initialized successfully');
    }
} catch (error) {
    // Handle configuration errors with educational guidance
    console.error('[CONFIG] Failed to initialize application configuration');
    console.error('[ERROR]', error.message);
    
    if (EDUCATIONAL_MODE && error.guidance) {
        console.log('\n[EDUCATION] Configuration Troubleshooting Guide:');
        error.guidance.forEach(guide => console.log(`  - ${guide}`));
        console.log('\nPlease fix the configuration issues and restart the server.\n');
    }
    
    // Exit process if configuration is invalid
    process.exit(1);
}

// =============================================================================
// MODULE EXPORTS
// =============================================================================

module.exports = {
    // Main application configuration object
    appConfig,
    
    // Configuration utility functions
    getEnvironment,
    loadConfiguration,
    validateConfiguration,
    
    // Configuration factory functions
    createLoggingConfig,
    createServerConfig,
    createEducationalConfig,
    
    // Application metadata
    APP_METADATA,
    
    // Global constants for external access
    APP_NAME,
    APP_VERSION,
    APP_DESCRIPTION,
    DEFAULT_ENVIRONMENT,
    EDUCATIONAL_MODE
};