/**
 * Node.js Tutorial Server Configuration Module
 * 
 * This module provides centralized HTTP server configuration constants and settings
 * for the Node.js tutorial application. It defines default server parameters including
 * port, hostname, timeout values, and educational server options while ensuring
 * localhost-only binding for security and providing comprehensive server configuration
 * management for the tutorial HTTP server implementation.
 * 
 * Educational Features:
 * - Configuration transparency for learning visibility
 * - Localhost-only binding for tutorial security
 * - Comprehensive validation with educational error messages
 * - Environment variable support with validation
 * - Educational defaults optimized for tutorial learning
 */

// Node.js built-in process module - v18+ built-in
const process = require('node:process');

// =============================================================================
// GLOBAL CONFIGURATION CONSTANTS
// =============================================================================

/**
 * Default port number for HTTP server binding in tutorial environment
 * Educational Note: Port 3000 is commonly used for development servers as it's
 * non-privileged (above 1024) and widely accepted in the development community
 */
const TUTORIAL_DEFAULT_PORT = 3000;

/**
 * Default hostname for localhost-only server binding ensuring educational security
 * Educational Note: 127.0.0.1 is the IPv4 loopback address that ensures the server
 * is only accessible from the local machine, providing security for tutorial learning
 */
const TUTORIAL_HOSTNAME = '127.0.0.1';

/**
 * Default server timeout value in milliseconds for educational environment
 * Educational Note: 30 seconds provides reasonable time for learning and experimentation
 * without being too permissive for production environments
 */
const EDUCATIONAL_TIMEOUT = 30000;

/**
 * Educational message explaining localhost binding security rationale
 * Educational Note: This message helps learners understand why localhost binding
 * is important for security during tutorial sessions
 */
const LOCALHOST_BINDING_MESSAGE = 'Server bound to localhost for educational security';

// =============================================================================
// NETWORK CONFIGURATION CONSTANTS
// =============================================================================

/**
 * Default port number (3000) for HTTP server binding in tutorial environment
 */
const DEFAULT_PORT = TUTORIAL_DEFAULT_PORT;

/**
 * Default hostname (127.0.0.1) for localhost-only server binding ensuring educational security
 */
const DEFAULT_HOSTNAME = TUTORIAL_HOSTNAME;

/**
 * Default server timeout (30000ms) for request handling in educational environment
 */
const SERVER_TIMEOUT = EDUCATIONAL_TIMEOUT;

/**
 * Maximum concurrent connections limit appropriate for tutorial server load
 * Educational Note: 100 connections provides sufficient capacity for tutorial use
 * while preventing resource exhaustion in educational environments
 */
const MAX_CONNECTIONS = 100;

/**
 * Keep-alive timeout for HTTP connections in educational server environment
 * Educational Note: 60 seconds allows for reasonable connection reuse while
 * preventing resource leaks in tutorial scenarios
 */
const KEEP_ALIVE_TIMEOUT = 60000;

// =============================================================================
// EDUCATIONAL SERVER OPTIONS
// =============================================================================

/**
 * Educational server options for enhanced tutorial learning experience
 * These options enable additional educational features and verbose logging
 * to help learners understand server behavior and configuration
 */
const EDUCATIONAL_SERVER_OPTIONS = {
    /**
     * Show startup banner with configuration information
     * Educational Note: Helps learners see server initialization details
     */
    showStartupBanner: true,
    
    /**
     * Enable verbose logging for educational transparency
     * Educational Note: Provides detailed information about server operations
     */
    verboseLogging: true,
    
    /**
     * Include timing information in responses for performance awareness
     * Educational Note: Helps learners understand performance characteristics
     */
    includeTimingInfo: true,
    
    /**
     * Show configuration information on startup
     * Educational Note: Displays all configuration values for transparency
     */
    showConfigurationInfo: true,
    
    /**
     * Enable debug headers in HTTP responses
     * Educational Note: Adds educational headers to help understand HTTP protocol
     */
    enableDebugHeaders: true,
    
    /**
     * Display request information for educational purposes
     * Educational Note: Shows incoming request details for learning
     */
    displayRequestInfo: true
};

// =============================================================================
// ADVANCED CONFIGURATION CONSTANTS
// =============================================================================

/**
 * Configuration constants for network settings
 * Educational Note: These provide comprehensive network configuration options
 */
const NETWORK_SETTINGS = {
    DEFAULT_PORT: 3000,
    DEFAULT_HOSTNAME: '127.0.0.1',
    LOCALHOST_ALIASES: ['localhost', '127.0.0.1', '::1'],
    ALLOWED_HOSTS: ['127.0.0.1', 'localhost'],
    EDUCATIONAL_PORT_RANGE: {
        min: 3000,
        max: 8080
    }
};

/**
 * Configuration constants for timeout settings
 * Educational Note: These provide comprehensive timeout management
 */
const TIMEOUT_SETTINGS = {
    SERVER_TIMEOUT: 30000,
    KEEP_ALIVE_TIMEOUT: 60000,
    CONNECTION_TIMEOUT: 120000,
    REQUEST_TIMEOUT: 10000,
    EDUCATIONAL_MIN_TIMEOUT: 5000,
    EDUCATIONAL_MAX_TIMEOUT: 120000
};

/**
 * Configuration constants for connection settings
 * Educational Note: These provide comprehensive connection management
 */
const CONNECTION_SETTINGS = {
    MAX_CONNECTIONS: 100,
    MAX_HEADERS_COUNT: 100,
    MAX_HEADER_SIZE: 16384,
    BACKLOG: 511,
    EDUCATIONAL_CONNECTION_LIMIT: 50
};

// =============================================================================
// SERVER CONFIGURATION FUNCTIONS
// =============================================================================

/**
 * Retrieves the server port from environment variables or returns the default tutorial port
 * with validation for educational use
 * 
 * Educational Note: This function demonstrates how to safely handle environment variables
 * while providing educational defaults and validation for tutorial environments
 * 
 * @returns {number} Valid port number between 1 and 65535, defaults to 3000 for tutorial consistency
 */
function getServerPort() {
    // Check for PORT environment variable override
    const envPort = process.env.PORT;
    
    // If no environment variable, return educational default
    if (!envPort) {
        if (EDUCATIONAL_SERVER_OPTIONS.verboseLogging) {
            console.log(`[CONFIG] Using default tutorial port: ${DEFAULT_PORT}`);
            console.log(`[EDUCATION] Port 3000 is commonly used for development servers`);
        }
        return DEFAULT_PORT;
    }
    
    // Validate port number is within valid range (1-65535)
    const port = parseInt(envPort, 10);
    
    // Check if port is a valid number
    if (isNaN(port)) {
        if (EDUCATIONAL_SERVER_OPTIONS.verboseLogging) {
            console.warn(`[CONFIG] Invalid PORT environment variable: ${envPort}, using default: ${DEFAULT_PORT}`);
            console.log(`[EDUCATION] PORT must be a valid number between 1 and 65535`);
        }
        return DEFAULT_PORT;
    }
    
    // Ensure port is within valid range
    if (port < 1 || port > 65535) {
        if (EDUCATIONAL_SERVER_OPTIONS.verboseLogging) {
            console.warn(`[CONFIG] Port ${port} out of valid range (1-65535), using default: ${DEFAULT_PORT}`);
            console.log(`[EDUCATION] Valid port range is 1-65535, with non-privileged ports above 1024 recommended`);
        }
        return DEFAULT_PORT;
    }
    
    // Ensure port is not a privileged port (<1024) for educational safety
    if (port < 1024) {
        if (EDUCATIONAL_SERVER_OPTIONS.verboseLogging) {
            console.warn(`[CONFIG] Port ${port} is privileged (requires root), using default: ${DEFAULT_PORT}`);
            console.log(`[EDUCATION] Privileged ports (< 1024) require administrator privileges`);
        }
        return DEFAULT_PORT;
    }
    
    // Ensure port is within educational range for consistency
    if (port < NETWORK_SETTINGS.EDUCATIONAL_PORT_RANGE.min || port > NETWORK_SETTINGS.EDUCATIONAL_PORT_RANGE.max) {
        if (EDUCATIONAL_SERVER_OPTIONS.verboseLogging) {
            console.warn(`[CONFIG] Port ${port} outside educational range (${NETWORK_SETTINGS.EDUCATIONAL_PORT_RANGE.min}-${NETWORK_SETTINGS.EDUCATIONAL_PORT_RANGE.max}), using default: ${DEFAULT_PORT}`);
            console.log(`[EDUCATION] Educational port range provides consistency for tutorial environments`);
        }
        return DEFAULT_PORT;
    }
    
    // Log port selection for educational transparency
    if (EDUCATIONAL_SERVER_OPTIONS.verboseLogging) {
        console.log(`[CONFIG] Using environment port: ${port}`);
        console.log(`[EDUCATION] Environment variable PORT override applied successfully`);
    }
    
    return port;
}

/**
 * Retrieves the server hostname from environment variables or returns localhost
 * with security validation for educational deployment
 * 
 * Educational Note: This function enforces localhost-only binding for tutorial security
 * while demonstrating proper hostname validation and environment variable handling
 * 
 * @returns {string} Valid hostname, defaults to localhost (127.0.0.1) for security
 */
function getServerHostname() {
    // Check for HOST or HOSTNAME environment variable override
    const envHostname = process.env.HOST || process.env.HOSTNAME;
    
    // If no environment variable, return educational default
    if (!envHostname) {
        if (EDUCATIONAL_SERVER_OPTIONS.verboseLogging) {
            console.log(`[CONFIG] Using default tutorial hostname: ${DEFAULT_HOSTNAME}`);
            console.log(`[EDUCATION] ${LOCALHOST_BINDING_MESSAGE}`);
        }
        return DEFAULT_HOSTNAME;
    }
    
    // Validate hostname format and security constraints
    const hostname = envHostname.trim().toLowerCase();
    
    // Ensure hostname is localhost or 127.0.0.1 for tutorial security
    if (!NETWORK_SETTINGS.ALLOWED_HOSTS.includes(hostname)) {
        if (EDUCATIONAL_SERVER_OPTIONS.verboseLogging) {
            console.warn(`[CONFIG] Hostname '${hostname}' not allowed for tutorial security, using default: ${DEFAULT_HOSTNAME}`);
            console.log(`[EDUCATION] Only localhost hostnames allowed: ${NETWORK_SETTINGS.ALLOWED_HOSTS.join(', ')}`);
            console.log(`[SECURITY] External hostnames prevented for educational safety`);
        }
        return DEFAULT_HOSTNAME;
    }
    
    // Convert localhost variants to IP address for consistency
    if (hostname === 'localhost') {
        if (EDUCATIONAL_SERVER_OPTIONS.verboseLogging) {
            console.log(`[CONFIG] Converting 'localhost' to '${DEFAULT_HOSTNAME}' for consistency`);
            console.log(`[EDUCATION] Using IP address provides explicit localhost binding`);
        }
        return DEFAULT_HOSTNAME;
    }
    
    // Log hostname selection for educational awareness
    if (EDUCATIONAL_SERVER_OPTIONS.verboseLogging) {
        console.log(`[CONFIG] Using environment hostname: ${hostname}`);
        console.log(`[EDUCATION] Localhost binding enforced for tutorial security`);
    }
    
    return hostname;
}

/**
 * Retrieves server timeout configuration from environment variables or returns
 * educational default timeout value
 * 
 * Educational Note: This function demonstrates timeout configuration management
 * with educational limits and validation for safe tutorial environments
 * 
 * @returns {number} Timeout value in milliseconds, defaults to 30000ms (30 seconds)
 */
function getServerTimeout() {
    // Check for SERVER_TIMEOUT environment variable override
    const envTimeout = process.env.SERVER_TIMEOUT;
    
    // If no environment variable, return educational default
    if (!envTimeout) {
        if (EDUCATIONAL_SERVER_OPTIONS.verboseLogging) {
            console.log(`[CONFIG] Using default tutorial timeout: ${SERVER_TIMEOUT}ms`);
            console.log(`[EDUCATION] 30 second timeout provides reasonable learning time`);
        }
        return SERVER_TIMEOUT;
    }
    
    // Validate timeout is a positive integer
    const timeout = parseInt(envTimeout, 10);
    
    // Check if timeout is a valid number
    if (isNaN(timeout)) {
        if (EDUCATIONAL_SERVER_OPTIONS.verboseLogging) {
            console.warn(`[CONFIG] Invalid SERVER_TIMEOUT environment variable: ${envTimeout}, using default: ${SERVER_TIMEOUT}ms`);
            console.log(`[EDUCATION] SERVER_TIMEOUT must be a valid positive integer in milliseconds`);
        }
        return SERVER_TIMEOUT;
    }
    
    // Ensure timeout is within reasonable range for tutorial use
    if (timeout < TIMEOUT_SETTINGS.EDUCATIONAL_MIN_TIMEOUT || timeout > TIMEOUT_SETTINGS.EDUCATIONAL_MAX_TIMEOUT) {
        if (EDUCATIONAL_SERVER_OPTIONS.verboseLogging) {
            console.warn(`[CONFIG] Timeout ${timeout}ms outside educational range (${TIMEOUT_SETTINGS.EDUCATIONAL_MIN_TIMEOUT}-${TIMEOUT_SETTINGS.EDUCATIONAL_MAX_TIMEOUT}ms), using default: ${SERVER_TIMEOUT}ms`);
            console.log(`[EDUCATION] Educational timeout range balances learning time with resource management`);
        }
        return SERVER_TIMEOUT;
    }
    
    // Log timeout configuration for educational context
    if (EDUCATIONAL_SERVER_OPTIONS.verboseLogging) {
        console.log(`[CONFIG] Using environment timeout: ${timeout}ms`);
        console.log(`[EDUCATION] Timeout configuration allows ${timeout / 1000} seconds for request processing`);
    }
    
    return timeout;
}

/**
 * Validates complete server configuration object to ensure all settings are
 * appropriate for educational tutorial environment
 * 
 * Educational Note: This function provides comprehensive configuration validation
 * with educational error messages and guidance for troubleshooting
 * 
 * @param {object} config - Server configuration object to validate
 * @returns {object} Validation result with isValid boolean and educational error messages
 */
function validateServerConfig(config) {
    // Initialize validation result object
    const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        educational: []
    };
    
    // Validate port is within acceptable range and available
    if (!config.port || typeof config.port !== 'number') {
        validation.isValid = false;
        validation.errors.push('Port is required and must be a number');
        validation.educational.push('PORT: Server needs a valid port number to bind to network interface');
    } else if (config.port < 1 || config.port > 65535) {
        validation.isValid = false;
        validation.errors.push(`Port ${config.port} is outside valid range (1-65535)`);
        validation.educational.push('PORT RANGE: Valid ports are 1-65535, with non-privileged ports (>1024) recommended');
    } else if (config.port < 1024) {
        validation.warnings.push(`Port ${config.port} is privileged and may require administrator rights`);
        validation.educational.push('PRIVILEGED PORTS: Ports below 1024 require elevated permissions');
    }
    
    // Check hostname is localhost for tutorial security requirements
    if (!config.hostname || typeof config.hostname !== 'string') {
        validation.isValid = false;
        validation.errors.push('Hostname is required and must be a string');
        validation.educational.push('HOSTNAME: Server needs a valid hostname for network binding');
    } else if (!NETWORK_SETTINGS.ALLOWED_HOSTS.includes(config.hostname.toLowerCase())) {
        validation.isValid = false;
        validation.errors.push(`Hostname '${config.hostname}' not allowed for tutorial security`);
        validation.educational.push(`SECURITY: Only localhost hostnames allowed: ${NETWORK_SETTINGS.ALLOWED_HOSTS.join(', ')}`);
    }
    
    // Verify timeout values are reasonable for educational use
    if (config.timeout !== undefined) {
        if (typeof config.timeout !== 'number' || config.timeout <= 0) {
            validation.isValid = false;
            validation.errors.push('Timeout must be a positive number');
            validation.educational.push('TIMEOUT: Server timeout must be positive milliseconds value');
        } else if (config.timeout < TIMEOUT_SETTINGS.EDUCATIONAL_MIN_TIMEOUT) {
            validation.warnings.push(`Timeout ${config.timeout}ms is very short for educational use`);
            validation.educational.push(`TIMEOUT RANGE: Educational minimum is ${TIMEOUT_SETTINGS.EDUCATIONAL_MIN_TIMEOUT}ms (${TIMEOUT_SETTINGS.EDUCATIONAL_MIN_TIMEOUT / 1000} seconds)`);
        } else if (config.timeout > TIMEOUT_SETTINGS.EDUCATIONAL_MAX_TIMEOUT) {
            validation.warnings.push(`Timeout ${config.timeout}ms is very long for educational use`);
            validation.educational.push(`TIMEOUT RANGE: Educational maximum is ${TIMEOUT_SETTINGS.EDUCATIONAL_MAX_TIMEOUT}ms (${TIMEOUT_SETTINGS.EDUCATIONAL_MAX_TIMEOUT / 1000} seconds)`);
        }
    }
    
    // Ensure all required configuration properties are present
    const requiredProperties = ['port', 'hostname'];
    for (const prop of requiredProperties) {
        if (!(prop in config)) {
            validation.isValid = false;
            validation.errors.push(`Missing required configuration property: ${prop}`);
            validation.educational.push(`REQUIRED: ${prop.toUpperCase()} is essential for server initialization`);
        }
    }
    
    // Check for conflicting or unsafe configuration combinations
    if (config.port && config.hostname) {
        if (config.hostname !== '127.0.0.1' && config.hostname !== 'localhost') {
            if (config.port < 8000) {
                validation.warnings.push('External hostname with low port number may indicate security risk');
                validation.educational.push('SECURITY: External binding requires careful security consideration');
            }
        }
    }
    
    // Add educational guidance based on validation results
    if (validation.isValid) {
        validation.educational.push('CONFIGURATION: All required settings validated successfully');
        validation.educational.push(`SERVER: Will bind to ${config.hostname}:${config.port} with ${config.timeout || SERVER_TIMEOUT}ms timeout`);
    } else {
        validation.educational.push('TROUBLESHOOTING: Fix configuration errors before starting server');
        validation.educational.push('HELP: Check error messages and ensure all required settings are valid');
    }
    
    // Log validation results for educational transparency
    if (EDUCATIONAL_SERVER_OPTIONS.verboseLogging) {
        console.log(`[VALIDATION] Configuration validation ${validation.isValid ? 'PASSED' : 'FAILED'}`);
        if (validation.errors.length > 0) {
            console.error('[VALIDATION] Errors:', validation.errors);
        }
        if (validation.warnings.length > 0) {
            console.warn('[VALIDATION] Warnings:', validation.warnings);
        }
        if (validation.educational.length > 0) {
            console.log('[EDUCATION] Guidance:', validation.educational);
        }
    }
    
    return validation;
}

/**
 * Creates complete server configuration object by merging environment variables,
 * defaults, and validation for tutorial HTTP server
 * 
 * Educational Note: This function demonstrates comprehensive configuration management
 * with environment variable support, validation, and educational features
 * 
 * @param {object} overrides - Optional configuration overrides for testing or customization
 * @returns {object} Complete server configuration object with all required settings for HTTP server
 */
function createServerConfig(overrides = {}) {
    // Initialize configuration with tutorial defaults
    const config = {
        port: DEFAULT_PORT,
        hostname: DEFAULT_HOSTNAME,
        timeout: SERVER_TIMEOUT,
        maxConnections: MAX_CONNECTIONS,
        keepAliveTimeout: KEEP_ALIVE_TIMEOUT,
        educational: EDUCATIONAL_SERVER_OPTIONS,
        networkSettings: NETWORK_SETTINGS,
        timeoutSettings: TIMEOUT_SETTINGS,
        connectionSettings: CONNECTION_SETTINGS
    };
    
    // Apply environment variable overrides using getter functions
    config.port = getServerPort();
    config.hostname = getServerHostname();
    config.timeout = getServerTimeout();
    
    // Apply any provided configuration overrides
    if (overrides && typeof overrides === 'object') {
        // Merge overrides with validation
        Object.keys(overrides).forEach(key => {
            if (overrides[key] !== undefined) {
                config[key] = overrides[key];
                if (EDUCATIONAL_SERVER_OPTIONS.verboseLogging) {
                    console.log(`[CONFIG] Override applied: ${key} = ${overrides[key]}`);
                }
            }
        });
    }
    
    // Validate final configuration using validateServerConfig
    const validation = validateServerConfig(config);
    
    // Add validation results to configuration
    config.validation = validation;
    
    // Add educational metadata and tutorial context
    config.educational = {
        ...EDUCATIONAL_SERVER_OPTIONS,
        configurationTransparency: true,
        localhostSecurity: LOCALHOST_BINDING_MESSAGE,
        tutorialOptimized: true,
        educationalDefaults: {
            port: DEFAULT_PORT,
            hostname: DEFAULT_HOSTNAME,
            timeout: SERVER_TIMEOUT
        },
        environmentSupport: {
            PORT: 'Override server port',
            HOST: 'Override server hostname (localhost only)',
            HOSTNAME: 'Alternative hostname variable',
            SERVER_TIMEOUT: 'Override server timeout'
        }
    };
    
    // Add startup timestamp for educational context
    config.createdAt = new Date().toISOString();
    config.nodeVersion = process.version;
    config.platform = process.platform;
    
    // Log configuration summary for educational transparency
    if (EDUCATIONAL_SERVER_OPTIONS.verboseLogging && EDUCATIONAL_SERVER_OPTIONS.showConfigurationInfo) {
        console.log('\n' + '='.repeat(60));
        console.log('EDUCATIONAL SERVER CONFIGURATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`Server Address: http://${config.hostname}:${config.port}/`);
        console.log(`Request Timeout: ${config.timeout}ms (${config.timeout / 1000} seconds)`);
        console.log(`Max Connections: ${config.maxConnections}`);
        console.log(`Keep-Alive Timeout: ${config.keepAliveTimeout}ms`);
        console.log(`Configuration Created: ${config.createdAt}`);
        console.log(`Node.js Version: ${config.nodeVersion}`);
        console.log(`Platform: ${config.platform}`);
        console.log(`Localhost Security: ${config.educational.localhostSecurity}`);
        console.log('='.repeat(60) + '\n');
    }
    
    // Return validated and complete server configuration object
    return config;
}

// =============================================================================
// MODULE EXPORTS
// =============================================================================

module.exports = {
    // Core configuration constants
    DEFAULT_PORT,
    DEFAULT_HOSTNAME,
    SERVER_TIMEOUT,
    MAX_CONNECTIONS,
    KEEP_ALIVE_TIMEOUT,
    
    // Educational server options
    EDUCATIONAL_SERVER_OPTIONS,
    
    // Configuration getter functions
    getServerPort,
    getServerHostname,
    getServerTimeout,
    validateServerConfig,
    createServerConfig,
    
    // Advanced configuration constants
    NETWORK_SETTINGS,
    TIMEOUT_SETTINGS,
    CONNECTION_SETTINGS,
    
    // Educational constants
    TUTORIAL_DEFAULT_PORT,
    TUTORIAL_HOSTNAME,
    EDUCATIONAL_TIMEOUT,
    LOCALHOST_BINDING_MESSAGE,
    
    // Configuration metadata
    CONFIG_VERSION: '1.0.0',
    EDUCATIONAL_MODE: true,
    TUTORIAL_OPTIMIZED: true
};