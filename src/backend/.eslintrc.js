/**
 * ESLint Configuration for Node.js Tutorial Application
 * 
 * This configuration enforces comprehensive JavaScript code quality rules,
 * linting standards, and educational development practices for the Node.js
 * tutorial application. The configuration balances strict code quality with
 * educational accessibility to support learning objectives while demonstrating
 * professional Node.js development patterns.
 * 
 * Educational Features:
 * - Beginner-friendly rules with warnings instead of errors for complex concepts
 * - Comprehensive coverage of JavaScript best practices and Node.js patterns
 * - Integration with Jest testing framework for complete development workflow
 * - Progressive strictness through override configurations for different file types
 * 
 * Integration Points:
 * - Coordinates with Jest configuration for testing environment rules
 * - Works with package.json scripts for automated linting workflow
 * - Supports VS Code and other IDEs for real-time linting feedback
 * - Enables pre-commit hooks for code quality enforcement
 * 
 * @version 1.0.0
 * @author Node.js Tutorial Team
 * @license MIT
 */

module.exports = {
    // Environment Configuration
    // Defines the JavaScript environments where the code will run
    env: {
        // Node.js global variables and Node.js scoping
        node: true,
        // ECMAScript 2022 globals
        es2022: true,
        // Jest global variables for testing files
        jest: true,
        // CommonJS global variables and CommonJS scoping
        commonjs: true
    },

    // Extended Configurations
    // Base configurations that this config extends
    extends: [
        // ESLint's recommended rules for error prevention and best practices
        'eslint:recommended',
        // New ESLint JS recommended configuration
        '@eslint/js',
        // Node.js specific recommended rules
        'plugin:node/recommended'
    ],

    // Parser Options
    // Specifies the JavaScript language options to support
    parserOptions: {
        // ECMAScript version to use (2022 for modern features)
        ecmaVersion: 2022,
        // Module system type (CommonJS for Node.js compatibility)
        sourceType: 'commonjs',
        // Prevents import/export statements in non-module contexts
        allowImportExportEverywhere: false,
        // ECMAScript feature configuration
        ecmaFeatures: {
            // Disallows return statements in the global scope
            globalReturn: false
        }
    },

    // Custom Rule Configurations
    // Defines specific linting rules tailored for educational Node.js development
    rules: {
        // =================================================================
        // ERROR PREVENTION RULES
        // Rules that catch potential runtime errors and bugs
        // =================================================================
        
        // Allow console.log statements for educational purposes (debugging)
        'no-console': 'off',
        
        // Warn about unused variables instead of error (educational flexibility)
        'no-unused-vars': ['warn', {
            // Ignore variables starting with underscore (convention for intentionally unused)
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_'
        }],
        
        // Prevent use of undeclared variables (potential typos)
        'no-undef': 'error',
        
        // Prevent variable redeclaration (can cause confusion)
        'no-redeclare': 'error',
        
        // Prevent unreachable code after return, throw, continue, break
        'no-unreachable': 'error',

        // =================================================================
        // BEST PRACTICES RULES
        // Rules that enforce JavaScript and Node.js best practices
        // =================================================================
        
        // Require const for variables that are never reassigned
        'prefer-const': 'error',
        
        // Disallow var declarations (use let/const instead)
        'no-var': 'error',
        
        // Require === and !== instead of == and !=
        'eqeqeq': ['error', 'always'],
        
        // Require curly braces around all control statements
        'curly': ['error', 'all'],
        
        // Enforce dot notation whenever possible (obj.prop vs obj['prop'])
        'dot-notation': 'error',

        // =================================================================
        // CODE STYLE RULES
        // Rules that ensure consistent code formatting and style
        // =================================================================
        
        // Enforce consistent indentation (4 spaces for readability)
        'indent': ['error', 4, {
            // Consistent indentation for switch statements
            SwitchCase: 1
        }],
        
        // Enforce single quotes for string literals
        'quotes': ['error', 'single', {
            // Allow double quotes to avoid escaping
            avoidEscape: true,
            // Allow template literals
            allowTemplateLiterals: true
        }],
        
        // Require semicolons at the end of statements
        'semi': ['error', 'always'],
        
        // Disallow trailing commas in objects and arrays
        'comma-dangle': ['error', 'never'],
        
        // Enforce one true brace style (opening brace on same line)
        'brace-style': ['error', '1tbs', {
            // Allow single-line blocks
            allowSingleLine: true
        }],

        // =================================================================
        // EDUCATIONAL RULES
        // Rules specifically chosen to teach good programming practices
        // =================================================================
        
        // Warn about complex functions (complexity threshold: 10)
        'complexity': ['warn', {
            max: 10
        }],
        
        // Warn about files with too many lines (educational maintainability)
        'max-lines': ['warn', {
            max: 300,
            // Skip blank lines and comments in count
            skipBlankLines: true,
            skipComments: true
        }],
        
        // Warn about functions with too many parameters
        'max-params': ['warn', {
            max: 4
        }],
        
        // Warn about magic numbers (improve code readability)
        'no-magic-numbers': ['warn', {
            // Allow common numbers
            ignore: [0, 1, -1, 3000],
            // Ignore magic numbers in array indexes
            ignoreArrayIndexes: true,
            // Ignore in default parameters
            ignoreDefaultValues: true
        }],

        // =================================================================
        // NODE.JS SPECIFIC RULES
        // Rules tailored for Node.js server-side development
        // =================================================================
        
        // Allow unpublished requires for development and testing
        'node/no-unpublished-require': 'off',
        
        // Ensure all required modules exist
        'node/no-missing-require': 'error',
        
        // Warn about deprecated Node.js APIs
        'node/no-deprecated-api': 'warn',
        
        // Prefer global process over require('process')
        'node/prefer-global/process': 'error',
        
        // Prefer global Buffer over require('buffer').Buffer
        'node/prefer-global/buffer': 'error'
    },

    // Ignore Patterns
    // Files and directories to exclude from linting
    ignorePatterns: [
        // Node.js modules directory
        'node_modules/',
        // Code coverage reports
        'coverage/',
        // Log files and directories
        'logs/',
        // Individual log files
        '*.log',
        // Environment configuration files (may contain sensitive data)
        '.env'
    ],

    // Override Configurations
    // Specific configurations for different file types or directories
    overrides: [
        // =================================================================
        // TEST FILE CONFIGURATIONS
        // Special rules for Jest test files
        // =================================================================
        {
            // Target test files with common naming patterns
            files: [
                '**/*.test.js',
                '**/*.spec.js',
                '**/__tests__/**/*.js'
            ],
            env: {
                // Enable Jest globals for test files
                jest: true
            },
            rules: {
                // Relax rules for test files to improve test readability
                
                // Allow magic numbers in tests (test data often uses specific values)
                'no-magic-numbers': 'off',
                
                // Allow longer test files (comprehensive test suites)
                'max-lines': 'off',
                
                // Prefer const is less critical in tests, use warning
                'prefer-const': 'warn'
            }
        },
        
        // =================================================================
        // SCRIPT FILE CONFIGURATIONS
        // Special rules for utility and build scripts
        // =================================================================
        {
            // Target script files in scripts directory
            files: ['scripts/**/*.js'],
            rules: {
                // Allow console output in scripts (intended for CLI usage)
                'no-console': 'off',
                
                // Allow process.exit() in scripts (common pattern)
                'node/no-process-exit': 'off'
            }
        },
        
        // =================================================================
        // CONFIGURATION FILE CONFIGURATIONS
        // Special rules for configuration files
        // =================================================================
        {
            // Target configuration files
            files: [
                '*.config.js',
                'jest.config.js',
                '.eslintrc.js'
            ],
            env: {
                // Configuration files run in Node.js environment
                node: true
            },
            rules: {
                // Allow magic numbers in configuration (ports, timeouts, etc.)
                'no-magic-numbers': 'off'
            }
        }
    ]
};