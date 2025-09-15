#!/bin/bash
# =============================================================================
# Node.js Tutorial HTTP Server - Comprehensive Shell-Based Health Check Script
# =============================================================================
#
# This shell script provides comprehensive server availability validation for the 
# Node.js tutorial HTTP server using standard Unix tools and professional shell
# scripting practices. It performs HTTP endpoint validation, response time monitoring,
# and deployment verification while serving as a shell-native complement to the 
# Node.js-based health check and maintaining educational clarity for infrastructure
# automation learning.
#
# Educational Features:
# - Shell-native health monitoring using curl and standard Unix utilities
# - Comprehensive HTTP endpoint validation with response content verification
# - Response time monitoring with performance threshold validation
# - Educational logging with troubleshooting guidance and best practices
# - CI/CD pipeline integration with standardized exit codes
# - Deployment automation compatibility with structured output
# - Professional error handling and retry logic implementation
# - Infrastructure scripting demonstration with educational context
#
# Health Check Validation:
# - HTTP connectivity and endpoint accessibility verification
# - Response status code validation (HTTP 200 OK expected)
# - Response content validation ("Hello world" message verification)
# - Content-Type header validation (text/plain expected)
# - Response time performance monitoring (<100ms threshold)
# - Comprehensive retry logic with exponential backoff
# - Health check result reporting with educational metrics
#
# Usage Examples:
#   ./health-check.sh
#   ./health-check.sh --verbose --timeout 30 --retries 5
#   ./health-check.sh --host localhost --port 8080 --format json
#   ./health-check.sh --nodejs-fallback --verbose
#
# =============================================================================

# Bash strict mode for enhanced error handling and script reliability
set -euo pipefail
IFS=$'\n\t'

# =============================================================================
# GLOBAL CONSTANTS AND CONFIGURATION
# =============================================================================

# Script metadata and identification
readonly SCRIPT_NAME="health-check.sh"
readonly SCRIPT_VERSION="1.0.0"
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
readonly BACKEND_DIR="$PROJECT_ROOT/src/backend"

# Default server configuration aligned with server-config.js
readonly DEFAULT_HOST="127.0.0.1"
readonly DEFAULT_PORT=3000
readonly DEFAULT_ENDPOINT="/hello"
readonly DEFAULT_PROTOCOL="http"
readonly DEFAULT_TIMEOUT=10
readonly DEFAULT_RETRIES=3
readonly DEFAULT_RETRY_DELAY=2

# Expected response validation criteria from tutorial specification
readonly EXPECTED_STATUS=200
readonly EXPECTED_CONTENT="Hello world"
readonly EXPECTED_CONTENT_TYPE="text/plain"
readonly PERFORMANCE_THRESHOLD_MS=100

# Exit codes for automation integration and CI/CD compatibility
# curl v7.0+, grep POSIX, awk POSIX, jq v1.6+, date coreutils POSIX
readonly EXIT_SUCCESS=0
readonly EXIT_GENERAL_ERROR=1
readonly EXIT_INVALID_ARGS=2
readonly EXIT_HEALTH_CHECK_FAILED=3
readonly EXIT_CONNECTION_FAILED=4
readonly EXIT_TIMEOUT=5
readonly EXIT_PREREQUISITES_FAILED=6

# Logging configuration with educational context
readonly LOG_LEVEL="INFO"
readonly VERBOSE=false
readonly COLOR_OUTPUT=true

# Color codes for educational terminal output formatting
readonly COLOR_RED='\033[0;31m'
readonly COLOR_GREEN='\033[0;32m'
readonly COLOR_YELLOW='\033[1;33m'
readonly COLOR_BLUE='\033[0;34m'
readonly COLOR_PURPLE='\033[0;35m'
readonly COLOR_CYAN='\033[0;36m'
readonly COLOR_WHITE='\033[1;37m'
readonly COLOR_RESET='\033[0m'

# =============================================================================
# LOGGING AND UTILITY FUNCTIONS
# =============================================================================

# Logs health check messages with appropriate log levels, timestamps, educational 
# context, and color formatting for monitoring and troubleshooting assistance
log_message() {
    local level="$1"
    local message="$2"
    local context="${3:-}"
    
    local timestamp=$(date -Iseconds)
    local color_code
    
    # Color coding based on log level for educational visibility
    case "$level" in
        "INFO")  color_code="$COLOR_GREEN" ;;
        "WARN")  color_code="$COLOR_YELLOW" ;;
        "ERROR") color_code="$COLOR_RED" ;;
        "DEBUG") color_code="$COLOR_CYAN" ;;
        *)       color_code="$COLOR_WHITE" ;;
    esac
    
    # Apply color formatting if enabled
    if [[ "$COLOR_OUTPUT" == "true" && -t 2 ]]; then
        echo -e "${color_code}[$timestamp] [$level]${COLOR_RESET} $message" >&2
    else
        echo "[$timestamp] [$level] $message" >&2
    fi
    
    # Include context information if provided
    if [[ -n "$context" ]]; then
        if [[ "$COLOR_OUTPUT" == "true" && -t 2 ]]; then
            echo -e "${color_code}    Context: $context${COLOR_RESET}" >&2
        else
            echo "    Context: $context" >&2
        fi
    fi
}

# =============================================================================
# COMMAND LINE ARGUMENT PROCESSING
# =============================================================================

# Parses and validates command line arguments to extract health check configuration
# including target server, timeout settings, retry options, and educational 
# preferences with comprehensive validation
parse_arguments() {
    # Initialize default configuration with educational settings
    local -A config=(
        [host]="$DEFAULT_HOST"
        [port]="$DEFAULT_PORT"
        [endpoint]="$DEFAULT_ENDPOINT"
        [protocol]="$DEFAULT_PROTOCOL"
        [timeout]="$DEFAULT_TIMEOUT"
        [retries]="$DEFAULT_RETRIES"
        [retry_delay]="$DEFAULT_RETRY_DELAY"
        [verbose]="false"
        [format]="text"
        [nodejs_fallback]="false"
        [help]="false"
        [quiet]="false"
        [no_color]="false"
    )
    
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --host|-h)
                if [[ -n "${2:-}" ]]; then
                    # Validate host for security (localhost only for tutorial)
                    if [[ "$2" =~ ^(127\.0\.0\.1|localhost|::1)$ ]]; then
                        config[host]="$2"
                        shift 2
                    else
                        log_message "WARN" "Non-localhost host detected: $2" \
                            "Tutorial security recommends localhost-only binding for safety"
                        config[host]="$2"
                        shift 2
                    fi
                else
                    log_message "ERROR" "--host option requires a value" \
                        "Usage: --host {127.0.0.1|localhost|::1}"
                    exit $EXIT_INVALID_ARGS
                fi
                ;;
            --port|-p)
                if [[ -n "${2:-}" ]] && [[ "$2" =~ ^[0-9]+$ ]] && [[ "$2" -ge 1 ]] && [[ "$2" -le 65535 ]]; then
                    config[port]="$2"
                    shift 2
                else
                    log_message "ERROR" "Invalid port number: ${2:-}" \
                        "Port must be between 1-65535"
                    exit $EXIT_INVALID_ARGS
                fi
                ;;
            --endpoint|-e)
                if [[ -n "${2:-}" ]]; then
                    # Validate endpoint path format
                    if [[ "$2" =~ ^/[a-zA-Z0-9/_-]*$ ]]; then
                        config[endpoint]="$2"
                        shift 2
                    else
                        log_message "ERROR" "Invalid endpoint format: $2" \
                            "Endpoint must start with / and contain only alphanumeric, _, - characters"
                        exit $EXIT_INVALID_ARGS
                    fi
                else
                    log_message "ERROR" "--endpoint option requires a value" \
                        "Usage: --endpoint /path (default: /hello)"
                    exit $EXIT_INVALID_ARGS
                fi
                ;;
            --timeout|-t)
                if [[ -n "${2:-}" ]] && [[ "$2" =~ ^[0-9]+$ ]] && [[ "$2" -ge 1 ]] && [[ "$2" -le 300 ]]; then
                    config[timeout]="$2"
                    shift 2
                else
                    log_message "ERROR" "Invalid timeout value: ${2:-}" \
                        "Timeout must be between 1-300 seconds"
                    exit $EXIT_INVALID_ARGS
                fi
                ;;
            --retries|-r)
                if [[ -n "${2:-}" ]] && [[ "$2" =~ ^[0-9]+$ ]] && [[ "$2" -ge 0 ]] && [[ "$2" -le 10 ]]; then
                    config[retries]="$2"
                    shift 2
                else
                    log_message "ERROR" "Invalid retry count: ${2:-}" \
                        "Retries must be between 0-10"
                    exit $EXIT_INVALID_ARGS
                fi
                ;;
            --retry-delay)
                if [[ -n "${2:-}" ]] && [[ "$2" =~ ^[0-9]+$ ]] && [[ "$2" -ge 1 ]] && [[ "$2" -le 30 ]]; then
                    config[retry_delay]="$2"
                    shift 2
                else
                    log_message "ERROR" "Invalid retry delay: ${2:-}" \
                        "Retry delay must be between 1-30 seconds"
                    exit $EXIT_INVALID_ARGS
                fi
                ;;
            --format|-f)
                if [[ -n "${2:-}" ]] && [[ "$2" =~ ^(text|json|xml)$ ]]; then
                    config[format]="$2"
                    shift 2
                else
                    log_message "ERROR" "Invalid format: ${2:-}" \
                        "Format must be: text, json, xml"
                    exit $EXIT_INVALID_ARGS
                fi
                ;;
            --verbose|-v)
                config[verbose]="true"
                shift
                ;;
            --quiet|-q)
                config[quiet]="true"
                shift
                ;;
            --no-color)
                config[no_color]="true"
                shift
                ;;
            --nodejs-fallback)
                config[nodejs_fallback]="true"
                shift
                ;;
            --help)
                config[help]="true"
                shift
                ;;
            *)
                log_message "ERROR" "Unknown option: $1" \
                    "Use --help to see available options"
                exit $EXIT_INVALID_ARGS
                ;;
        esac
    done
    
    # Apply global configuration from parsed arguments
    export HEALTH_HOST="${config[host]}"
    export HEALTH_PORT="${config[port]}"
    export HEALTH_ENDPOINT="${config[endpoint]}"
    export HEALTH_PROTOCOL="${config[protocol]}"
    export HEALTH_TIMEOUT="${config[timeout]}"
    export HEALTH_RETRIES="${config[retries]}"
    export HEALTH_RETRY_DELAY="${config[retry_delay]}"
    export HEALTH_VERBOSE="${config[verbose]}"
    export HEALTH_FORMAT="${config[format]}"
    export HEALTH_NODEJS_FALLBACK="${config[nodejs_fallback]}"
    export HEALTH_SHOW_HELP="${config[help]}"
    export HEALTH_QUIET="${config[quiet]}"
    export HEALTH_NO_COLOR="${config[no_color]}"
    
    # Update global color setting based on arguments
    if [[ "${config[no_color]}" == "true" ]]; then
        COLOR_OUTPUT=false
    fi
    
    # Update global verbose setting
    if [[ "${config[verbose]}" == "true" ]]; then
        VERBOSE=true
    fi
    
    # Log parsed configuration for educational transparency
    if [[ "$HEALTH_VERBOSE" == "true" ]]; then
        log_message "INFO" "⚙️  Health Check Configuration Parsed" \
            "Target: ${config[protocol]}://${config[host]}:${config[port]}${config[endpoint]}"
        log_message "DEBUG" "Timeout: ${config[timeout]}s, Retries: ${config[retries]}, Delay: ${config[retry_delay]}s"
    fi
    
    return 0
}

# =============================================================================
# HELP AND EDUCATIONAL FUNCTIONS
# =============================================================================

# Displays comprehensive help information about health check script usage, 
# command line options, configuration, and educational guidance for infrastructure 
# monitoring learning
display_help() {
    cat << 'EOF'

🏥 Node.js Tutorial Shell-Based Health Check Script
===============================================

Comprehensive server availability validation using standard Unix tools including
curl, grep, awk, and shell scripting best practices for infrastructure monitoring.

📋 USAGE:
  ./health-check.sh [OPTIONS]

⚙️  OPTIONS:
  --host, -h HOST           Target server hostname (default: 127.0.0.1)
                            Security: localhost-only recommended for tutorials
  --port, -p PORT           Target server port (default: 3000, range: 1-65535)
  --endpoint, -e PATH       Health check endpoint path (default: /hello)
  --timeout, -t SECONDS     Request timeout in seconds (default: 10, range: 1-300)
  --retries, -r COUNT       Number of retry attempts (default: 3, range: 0-10)
  --retry-delay SECONDS     Delay between retries in seconds (default: 2, range: 1-30)
  --format, -f FORMAT       Output format: text, json, xml (default: text)
  --verbose, -v             Enable verbose educational logging and progress
  --quiet, -q               Suppress non-essential output for automation
  --no-color                Disable color output for log processing
  --nodejs-fallback         Use Node.js health check script for enhanced validation
  --help                    Display this comprehensive help information

🔍 HEALTH CHECK CRITERIA:
  • HTTP Connectivity: Successful connection to target endpoint
  • Status Code: HTTP 200 OK response validation
  • Content Validation: "Hello world" message verification
  • Content-Type: text/plain header validation
  • Performance: Response time under 100ms threshold
  • Retry Logic: Configurable retry attempts with exponential backoff

🚦 EXIT CODES:
  0 - Health check passed - server is healthy and responding correctly
  1 - General error - unexpected error during health check execution
  2 - Invalid arguments - review command line options and parameters
  3 - Health check failed - server not responding correctly or validation failed
  4 - Connection failed - unable to establish connection to target server
  5 - Timeout - health check timed out waiting for server response
  6 - Prerequisites failed - required tools missing or system issues

📚 EXAMPLES:

  Basic health check with default settings:
    ./health-check.sh

  Verbose health check with educational logging:
    ./health-check.sh --verbose

  Custom server and port with extended timeout:
    ./health-check.sh --host localhost --port 8080 --timeout 30

  Production monitoring with JSON output:
    ./health-check.sh --format json --quiet --retries 5

  Enhanced health check with Node.js fallback:
    ./health-check.sh --nodejs-fallback --verbose

  CI/CD integration with no color output:
    ./health-check.sh --no-color --format json --timeout 15

🔧 TROUBLESHOOTING:

  Connection Refused (Exit Code 4):
    • Ensure server is running: node server.js
    • Check server startup logs for error messages
    • Verify port 3000 is not in use: lsof -ti:3000
    • Confirm server configuration and binding

  Timeout Errors (Exit Code 5):
    • Server may be overloaded - check system resources
    • Increase timeout: --timeout 30
    • Check server logs for processing delays
    • Verify network connectivity and routing

  Health Check Failed (Exit Code 3):
    • Server responding but not with expected content
    • Check endpoint implementation: curl -v http://localhost:3000/hello
    • Verify response matches "Hello world" exactly
    • Review server logs for application errors

  Prerequisites Failed (Exit Code 6):
    • Install curl: package manager (apt, yum, brew)
    • Verify shell environment: echo $SHELL
    • Check tool versions: curl --version
    • Ensure standard Unix utilities available

🎓 EDUCATIONAL VALUE:

  Shell Scripting Best Practices:
    • Demonstrates professional shell script structure
    • Shows comprehensive argument parsing and validation
    • Illustrates proper error handling and exit codes
    • Provides structured logging and output formatting

  Infrastructure Monitoring Concepts:
    • HTTP client usage for endpoint validation
    • Retry logic with exponential backoff implementation
    • Performance monitoring and threshold validation
    • Health check automation and CI/CD integration

  Unix Tools Usage:
    • curl for HTTP client functionality
    • grep for pattern matching and validation
    • awk for text processing and metrics extraction
    • date for timestamp generation and logging

  System Administration Skills:
    • Process management and health monitoring
    • Network connectivity validation and troubleshooting
    • Automation scripting for operational procedures
    • Error categorization and resolution guidance

🔗 INTEGRATION:

  CI/CD Pipeline Integration:
    • Use in GitHub Actions, Jenkins, or other CI systems
    • Structured exit codes for automation decision making
    • JSON output format for programmatic processing
    • Quiet mode for log-friendly automated execution

  Deployment Script Integration:
    • Compatible with deploy.sh for deployment validation
    • Consistent exit codes and error handling patterns
    • Shared configuration and logging conventions
    • Educational consistency across infrastructure scripts

  Monitoring System Integration:
    • Structured output formats for metrics collection
    • Performance data extraction for trending analysis
    • Alert integration based on exit codes and output
    • Health status reporting for operational dashboards

📖 TUTORIAL CONTEXT:

  This health check script demonstrates professional infrastructure automation
  practices while providing hands-on experience with:
    • Shell-based health monitoring implementation
    • HTTP client programming with curl
    • Systematic server validation techniques
    • Performance monitoring and threshold analysis
    • Error handling and troubleshooting methodologies
    • CI/CD integration and automation compatibility

  The script complements the Node.js health-check.js script by providing
  shell-native validation capabilities suitable for deployment automation,
  container health checks, and infrastructure monitoring integration.

For detailed information about the Node.js tutorial application and related
infrastructure components, consult the project documentation and tutorial guides.

===============================================
EOF
}

# =============================================================================
# PREREQUISITE VALIDATION FUNCTIONS
# =============================================================================

# Validates that all required system tools and utilities are available for health 
# check execution with educational guidance for missing dependencies and installation
# instructions
check_prerequisites() {
    local config_host="$1"
    local config_port="$2"
    local missing_tools=()
    local warnings=()
    
    log_message "INFO" "🔍 Validating health check prerequisites" \
        "Target: http://$config_host:$config_port$HEALTH_ENDPOINT"
    
    # Check curl availability and version compatibility - curl v7.0+
    if command -v curl >/dev/null 2>&1; then
        local curl_version=$(curl --version | head -1 | awk '{print $2}' || echo "unknown")
        log_message "INFO" "✅ curl available" "Version: $curl_version"
        
        # Test curl basic functionality
        if curl --help >/dev/null 2>&1; then
            log_message "DEBUG" "curl functionality validated"
        else
            log_message "WARN" "⚠️  curl functionality test failed" \
                "curl may not be fully functional"
            warnings+=("curl functionality issues detected")
        fi
    else
        log_message "ERROR" "❌ curl not found" \
            "Install curl: apt-get install curl (Debian/Ubuntu) or yum install curl (RHEL/CentOS)"
        missing_tools+=("curl")
    fi
    
    # Check grep availability for response content validation - POSIX grep
    if command -v grep >/dev/null 2>&1; then
        log_message "INFO" "✅ grep available" "POSIX compatible pattern matching"
        
        # Test grep basic functionality
        if echo "test" | grep -q "test"; then
            log_message "DEBUG" "grep functionality validated"
        else
            log_message "WARN" "⚠️  grep functionality test failed"
            warnings+=("grep functionality issues detected")
        fi
    else
        log_message "ERROR" "❌ grep not found" \
            "grep should be available on all POSIX systems"
        missing_tools+=("grep")
    fi
    
    # Check awk availability for performance metrics extraction - POSIX awk
    if command -v awk >/dev/null 2>&1; then
        log_message "INFO" "✅ awk available" "Text processing and metrics extraction"
        
        # Test awk basic functionality
        if echo "1 2 3" | awk '{print $2}' | grep -q "2"; then
            log_message "DEBUG" "awk functionality validated"
        else
            log_message "WARN" "⚠️  awk functionality test failed"
            warnings+=("awk functionality issues detected")
        fi
    else
        log_message "ERROR" "❌ awk not found" \
            "awk should be available on all POSIX systems"
        missing_tools+=("awk")
    fi
    
    # Check date utility availability for timestamp generation - coreutils POSIX
    if command -v date >/dev/null 2>&1; then
        log_message "INFO" "✅ date available" "Timestamp generation and logging"
        
        # Test date functionality with ISO format
        if date -Iseconds >/dev/null 2>&1; then
            log_message "DEBUG" "date ISO format functionality validated"
        elif date "+%Y-%m-%dT%H:%M:%S%z" >/dev/null 2>&1; then
            log_message "DEBUG" "date alternative format functionality validated"
        else
            log_message "WARN" "⚠️  date ISO format not supported" \
                "Will use basic date formatting"
            warnings+=("date ISO format not available")
        fi
    else
        log_message "ERROR" "❌ date not found" \
            "date utility should be available on all systems"
        missing_tools+=("date")
    fi
    
    # Check jq availability for JSON output formatting (optional) - jq v1.6+
    if command -v jq >/dev/null 2>&1; then
        local jq_version=$(jq --version 2>/dev/null || echo "unknown")
        log_message "INFO" "✅ jq available" "Version: $jq_version - JSON processing enabled"
    else
        if [[ "$HEALTH_FORMAT" == "json" ]]; then
            log_message "WARN" "⚠️  jq not found but JSON format requested" \
                "Will use basic JSON formatting without jq"
            warnings+=("jq recommended for enhanced JSON processing")
        else
            log_message "DEBUG" "jq not available (optional for text format)"
        fi
    fi
    
    # Check sleep availability for retry delay control - coreutils POSIX
    if command -v sleep >/dev/null 2>&1; then
        log_message "INFO" "✅ sleep available" "Delay control for retry logic"
        
        # Test sleep functionality
        if timeout 2s sleep 0.1 2>/dev/null; then
            log_message "DEBUG" "sleep fractional seconds supported"
        elif sleep 1 >/dev/null 2>&1; then
            log_message "DEBUG" "sleep basic functionality validated"
        else
            log_message "WARN" "⚠️  sleep functionality issues detected"
            warnings+=("sleep functionality problems")
        fi
    else
        log_message "ERROR" "❌ sleep not found" \
            "sleep should be available on all POSIX systems"
        missing_tools+=("sleep")
    fi
    
    # Test network connectivity and DNS resolution for target host
    log_message "INFO" "🌐 Testing network connectivity to target host"
    
    # Test hostname resolution
    if command -v nslookup >/dev/null 2>&1; then
        if nslookup "$config_host" >/dev/null 2>&1; then
            log_message "INFO" "✅ Hostname resolution successful" "Host: $config_host"
        else
            if [[ "$config_host" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
                log_message "INFO" "✅ IP address format detected" "Host: $config_host"
            else
                log_message "WARN" "⚠️  Hostname resolution failed" \
                    "May indicate DNS issues or invalid hostname"
                warnings+=("hostname resolution issues for $config_host")
            fi
        fi
    elif command -v host >/dev/null 2>&1; then
        if host "$config_host" >/dev/null 2>&1; then
            log_message "INFO" "✅ Hostname resolution successful" "Host: $config_host"
        else
            log_message "WARN" "⚠️  Hostname resolution failed using host command"
            warnings+=("hostname resolution issues for $config_host")
        fi
    else
        log_message "DEBUG" "DNS resolution tools not available - will attempt direct connection"
    fi
    
    # Test basic connectivity to target port if netcat or telnet available
    if command -v nc >/dev/null 2>&1; then
        if timeout 3s nc -z "$config_host" "$config_port" 2>/dev/null; then
            log_message "INFO" "✅ Port connectivity confirmed" "Host: $config_host:$config_port"
        else
            log_message "DEBUG" "Port not currently accessible (expected if server not running)"
        fi
    elif command -v telnet >/dev/null 2>&1; then
        if timeout 3s bash -c "echo '' | telnet $config_host $config_port" >/dev/null 2>&1; then
            log_message "INFO" "✅ Port connectivity confirmed" "Host: $config_host:$config_port"
        else
            log_message "DEBUG" "Port not currently accessible (expected if server not running)"
        fi
    else
        log_message "DEBUG" "Network connectivity tools not available - will rely on curl for testing"
    fi
    
    # Validate shell environment and required shell features
    log_message "INFO" "🐚 Validating shell environment and features"
    
    # Check bash version and features
    if [[ -n "${BASH_VERSION:-}" ]]; then
        log_message "INFO" "✅ Bash shell detected" "Version: $BASH_VERSION"
        
        # Test bash array support
        if declare -A test_array 2>/dev/null; then
            log_message "DEBUG" "Bash associative arrays supported"
            unset test_array
        else
            log_message "WARN" "⚠️  Bash associative arrays not supported" \
                "May affect advanced script features"
            warnings+=("bash associative array support limited")
        fi
    else
        log_message "WARN" "⚠️  Non-bash shell detected" \
            "Script designed for bash - some features may not work correctly"
        warnings+=("non-bash shell environment detected")
    fi
    
    # Test timeout command availability for request timeouts
    if command -v timeout >/dev/null 2>&1; then
        log_message "INFO" "✅ timeout command available" "Request timeout control enabled"
    else
        log_message "WARN" "⚠️  timeout command not available" \
            "Will use curl built-in timeout only"
        warnings+=("timeout command not available for enhanced timeout control")
    fi
    
    # Report warnings with educational context
    if [[ ${#warnings[@]} -gt 0 ]]; then
        log_message "WARN" "📋 Health check warnings detected" \
            "${#warnings[@]} warnings found - health check may continue with limited functionality"
        if [[ "$HEALTH_VERBOSE" == "true" ]]; then
            for warning in "${warnings[@]}"; do
                log_message "WARN" "   • $warning"
            done
        fi
    fi
    
    # Handle missing critical prerequisites
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        log_message "ERROR" "💥 Prerequisites validation failed" \
            "${#missing_tools[@]} critical tools missing"
        
        log_message "ERROR" "🛠️  Installation guidance for missing tools:"
        for tool in "${missing_tools[@]}"; do
            case "$tool" in
                "curl")
                    log_message "ERROR" "   Install curl:"
                    log_message "ERROR" "     Debian/Ubuntu: sudo apt-get install curl"
                    log_message "ERROR" "     RHEL/CentOS:   sudo yum install curl"
                    log_message "ERROR" "     macOS:         brew install curl"
                    ;;
                "grep"|"awk"|"date"|"sleep")
                    log_message "ERROR" "   $tool should be available on all POSIX systems"
                    log_message "ERROR" "     Check system installation and PATH configuration"
                    ;;
                *)
                    log_message "ERROR" "   Missing tool: $tool"
                    ;;
            esac
        done
        
        log_message "ERROR" "📚 Educational troubleshooting guide:"
        log_message "ERROR" "   • Verify tool installation with: which <tool_name>"
        log_message "ERROR" "   • Check PATH environment variable: echo \$PATH"
        log_message "ERROR" "   • Install missing packages using system package manager"
        log_message "ERROR" "   • Consult system documentation for tool availability"
        
        return $EXIT_PREREQUISITES_FAILED
    fi
    
    log_message "INFO" "✅ Prerequisites validation completed successfully" \
        "All required tools and dependencies are available"
    
    return 0
}

# =============================================================================
# HEALTH CHECK CORE FUNCTIONS
# =============================================================================

# Executes comprehensive HTTP health check validation including endpoint connectivity,
# response validation, performance measurement, and educational monitoring with retry
# logic and detailed reporting
perform_health_check() {
    local config_host="$1"
    local config_port="$2"
    local config_endpoint="$3"
    local config_timeout="$4"
    
    log_message "INFO" "🏥 Starting comprehensive health check validation" \
        "Target: $HEALTH_PROTOCOL://$config_host:$config_port$config_endpoint"
    
    local health_check_start_time=$(date +%s)
    local target_url="$HEALTH_PROTOCOL://$config_host:$config_port$config_endpoint"
    
    # Initialize health check results object with educational context
    local -A health_results=(
        [timestamp]="$(date -Iseconds 2>/dev/null || date '+%Y-%m-%dT%H:%M:%S%z')"
        [url]="$target_url"
        [timeout]="$config_timeout"
        [success]="false"
        [status_code]=""
        [response_time]=""
        [response_content]=""
        [content_type]=""
        [validation_status]="PENDING"
        [performance_level]="UNKNOWN"
        [educational_context]="HTTP server health validation for Node.js tutorial"
    )
    
    # Execute HTTP request with performance timing and comprehensive validation
    log_message "INFO" "📡 Executing HTTP request with performance measurement" \
        "Method: GET, Timeout: ${config_timeout}s"
    
    if execute_curl_request "$target_url" "$config_timeout" "health_results"; then
        log_message "INFO" "✅ HTTP request completed successfully" \
            "Status: ${health_results[status_code]}, Duration: ${health_results[response_time]}ms"
        
        # Validate response against expected health check criteria
        if validate_response "health_results"; then
            health_results[success]="true"
            health_results[validation_status]="PASS"
            
            # Determine performance level based on response time
            local response_time_ms="${health_results[response_time]}"
            if [[ "$response_time_ms" -le 50 ]]; then
                health_results[performance_level]="Excellent"
            elif [[ "$response_time_ms" -le 100 ]]; then
                health_results[performance_level]="Good"
            else
                health_results[performance_level]="Needs Improvement"
            fi
            
            log_message "INFO" "🎉 Health check validation PASSED" \
                "Performance: ${health_results[performance_level]}, Validation: PASS"
        else
            health_results[success]="false"
            health_results[validation_status]="FAIL"
            health_results[performance_level]="N/A"
            
            log_message "WARN" "⚠️  Health check validation FAILED" \
                "Server responded but validation criteria not met"
        fi
        
    else
        log_message "ERROR" "❌ HTTP request failed" \
            "Unable to establish connection or receive valid response"
        
        health_results[success]="false"
        health_results[validation_status]="CONNECTION_FAILED"
        health_results[performance_level]="N/A"
    fi
    
    # Calculate total health check duration
    local health_check_end_time=$(date +%s)
    health_results[total_duration]="$((health_check_end_time - health_check_start_time))s"
    
    # Generate comprehensive health check report
    generate_report "health_results"
    
    # Return success status for retry logic
    if [[ "${health_results[success]}" == "true" ]]; then
        return 0
    else
        return 1
    fi
}

# Executes HTTP request using curl with comprehensive configuration, error handling,
# performance measurement, and educational logging for health check validation
execute_curl_request() {
    local url="$1"
    local timeout="$2"
    local -n results_ref="$3"
    
    log_message "DEBUG" "📡 Configuring HTTP request for health check validation" \
        "URL: $url, Timeout: ${timeout}s"
    
    # Construct curl command with comprehensive configuration
    local curl_args=(
        --silent                    # Suppress progress meter and error messages
        --show-error               # Show error messages even in silent mode
        --location                 # Follow redirects if any
        --max-time "$timeout"      # Maximum time allowed for operation
        --connect-timeout 5        # Maximum time for connection
        --user-agent "NodeJS-Tutorial-Health-Check/$SCRIPT_VERSION"
        --header "Accept: text/plain"
        --header "Connection: close"
        --write-out "%{http_code}|%{time_total}|%{content_type}|%{size_download}"
        --output -                 # Write response body to stdout
    )
    
    # Add verbose output if educational logging enabled
    if [[ "$HEALTH_VERBOSE" == "true" ]]; then
        curl_args+=(--verbose)
    fi
    
    # Initialize request timing for performance measurement
    local request_start_time=$(date +%s.%3N 2>/dev/null || date +%s)
    
    # Execute curl request with educational logging context
    log_message "DEBUG" "🔌 Making HTTP request to health check endpoint" \
        "curl command: curl ${curl_args[*]} \"$url\""
    
    # Execute curl and capture both stdout and stderr
    local curl_output
    local curl_exit_code
    local curl_stderr
    
    # Execute curl with error handling
    {
        curl_stderr=$(curl "${curl_args[@]}" "$url" 2>&1 1>&3)
        curl_exit_code=$?
    } 3>&1
    curl_output="$curl_stderr"
    
    # Calculate request duration for performance validation
    local request_end_time=$(date +%s.%3N 2>/dev/null || date +%s)
    local request_duration
    if command -v bc >/dev/null 2>&1; then
        request_duration=$(echo "($request_end_time - $request_start_time) * 1000" | bc | cut -d. -f1)
    else
        # Fallback calculation without bc
        local start_sec=${request_start_time%.*}
        local end_sec=${request_end_time%.*}
        request_duration=$(((end_sec - start_sec) * 1000))
    fi
    
    # Handle curl execution results and extract response data
    if [[ $curl_exit_code -eq 0 ]]; then
        log_message "DEBUG" "📬 HTTP request completed successfully" \
            "Exit code: $curl_exit_code, Duration: ${request_duration}ms"
        
        # Parse curl write-out format: status|time|content_type|size
        local curl_metrics="${curl_output##*|}"
        local response_body="${curl_output%|*}"
        
        # Extract individual metrics from curl write-out
        if [[ "$curl_output" == *"|"* ]]; then
            # Split write-out data
            local IFS='|'
            local metrics_array=($curl_metrics)
            unset IFS
            
            if [[ ${#metrics_array[@]} -ge 4 ]]; then
                results_ref[status_code]="${metrics_array[0]}"
                results_ref[curl_time_total]="${metrics_array[1]}"
                results_ref[content_type]="${metrics_array[2]}"
                results_ref[content_length]="${metrics_array[3]}"
                results_ref[response_content]="$(echo "$response_body" | sed 's/|.*//')"
            else
                log_message "WARN" "⚠️  Unexpected curl output format" \
                    "Unable to parse metrics properly"
                results_ref[status_code]="0"
                results_ref[response_content]="$curl_output"
            fi
        else
            # Fallback parsing
            results_ref[status_code]="200"
            results_ref[response_content]="$curl_output"
            results_ref[content_type]="unknown"
        fi
        
        # Set response time from our calculation
        results_ref[response_time]="$request_duration"
        
        log_message "INFO" "📊 HTTP response metrics extracted" \
            "Status: ${results_ref[status_code]}, Size: ${results_ref[content_length]:-0} bytes"
        
        return 0
        
    else
        # Handle curl errors with educational context
        log_message "ERROR" "🔌 HTTP request failed with curl error" \
            "Exit code: $curl_exit_code"
        
        # Categorize curl error codes for educational guidance
        case $curl_exit_code in
            6)
                log_message "ERROR" "DNS resolution failed for hostname: $url"
                results_ref[error_category]="DNS_RESOLUTION_FAILED"
                results_ref[troubleshooting]="Check hostname spelling and DNS configuration"
                ;;
            7)
                log_message "ERROR" "Connection refused - server not accepting connections"
                results_ref[error_category]="CONNECTION_REFUSED"
                results_ref[troubleshooting]="Ensure server is running and port is correct"
                ;;
            28)
                log_message "ERROR" "Request timed out after ${timeout} seconds"
                results_ref[error_category]="TIMEOUT"
                results_ref[troubleshooting]="Server may be overloaded or network latency high"
                ;;
            35)
                log_message "ERROR" "SSL handshake failed"
                results_ref[error_category]="SSL_ERROR"
                results_ref[troubleshooting]="Check SSL certificate and protocol configuration"
                ;;
            *)
                log_message "ERROR" "Curl error $curl_exit_code: $curl_stderr"
                results_ref[error_category]="UNKNOWN_CURL_ERROR"
                results_ref[troubleshooting]="Check curl documentation for exit code meaning"
                ;;
        esac
        
        results_ref[response_time]="$request_duration"
        results_ref[curl_exit_code]="$curl_exit_code"
        results_ref[error_output]="$curl_stderr"
        
        return 1
    fi
}

# Validates HTTP response against expected health check criteria including status code,
# content, headers, and performance with educational validation reporting and 
# troubleshooting guidance
validate_response() {
    local -n response_ref="$1"
    
    log_message "INFO" "🔍 Validating HTTP response against health check criteria" \
        "Expected: $EXPECTED_STATUS OK, '$EXPECTED_CONTENT', $EXPECTED_CONTENT_TYPE"
    
    local validation_start_time=$(date +%s)
    local -A validation_results=(
        [overall_status]="PASS"
        [passed_validations]=0
        [failed_validations]=0
        [total_validations]=0
    )
    
    # Define comprehensive validation test cases with educational descriptions
    local -A validation_tests=(
        [status_code]="HTTP status code validation|${response_ref[status_code]}|$EXPECTED_STATUS|HTTP 200 OK indicates successful request processing per HTTP/1.1 standards"
        [response_content]="Response body content validation|${response_ref[response_content]:-}|$EXPECTED_CONTENT|Response content validates tutorial Hello Endpoint Implementation requirement"
        [content_type]="Content-Type header validation|${response_ref[content_type]:-}|$EXPECTED_CONTENT_TYPE|Content-Type header enables proper client content processing"
        [response_time]="Response time performance validation|${response_ref[response_time]:-0}|$PERFORMANCE_THRESHOLD_MS|Response time validation ensures server performance meets standards"
        [content_length]="Response content length validation|${response_ref[response_content]:-}|non-empty|Content length validation ensures server provides meaningful response"
    )
    
    # Execute each validation test with detailed result tracking
    for test_name in "${!validation_tests[@]}"; do
        IFS='|' read -r description actual expected educational_note <<< "${validation_tests[$test_name]}"
        
        validation_results[total_validations]=$((validation_results[total_validations] + 1))
        local test_result=false
        
        case "$test_name" in
            "status_code")
                if [[ "$actual" == "$expected" ]]; then
                    test_result=true
                fi
                ;;
            "response_content")
                if [[ "$actual" == "$expected" ]]; then
                    test_result=true
                fi
                ;;
            "content_type")
                if [[ "$actual" == *"$expected"* ]]; then
                    test_result=true
                fi
                ;;
            "response_time")
                if [[ "$actual" -le "$expected" ]] 2>/dev/null; then
                    test_result=true
                fi
                ;;
            "content_length")
                if [[ -n "$actual" && ${#actual} -gt 0 ]]; then
                    test_result=true
                fi
                ;;
        esac
        
        if [[ "$test_result" == "true" ]]; then
            validation_results[passed_validations]=$((validation_results[passed_validations] + 1))
            log_message "INFO" "✅ $description - PASSED" \
                "Expected: $expected, Actual: $actual"
        else
            validation_results[failed_validations]=$((validation_results[failed_validations] + 1))
            validation_results[overall_status]="FAIL"
            log_message "WARN" "❌ $description - FAILED" \
                "Expected: $expected, Actual: $actual"
            
            # Add specific troubleshooting guidance for failed validation
            case "$test_name" in
                "status_code")
                    log_message "WARN" "   Troubleshooting: Check server error handling - ensure endpoint returns HTTP 200 OK"
                    ;;
                "response_content")
                    log_message "WARN" "   Troubleshooting: Verify server response matches expected '$EXPECTED_CONTENT' exactly"
                    ;;
                "content_type")
                    log_message "WARN" "   Troubleshooting: Ensure server sets correct Content-Type: $EXPECTED_CONTENT_TYPE header"
                    ;;
                "response_time")
                    log_message "WARN" "   Troubleshooting: Server performance issue - consider optimization (${actual}ms > ${expected}ms)"
                    ;;
                "content_length")
                    log_message "WARN" "   Troubleshooting: Verify server generates non-empty response body"
                    ;;
            esac
        fi
    done
    
    # Calculate validation completion time
    local validation_end_time=$(date +%s)
    local validation_duration=$((validation_end_time - validation_start_time))
    
    # Calculate success percentage for educational metrics
    local success_percentage=0
    if [[ ${validation_results[total_validations]} -gt 0 ]]; then
        success_percentage=$(( (validation_results[passed_validations] * 100) / validation_results[total_validations] ))
    fi
    
    # Add validation summary to response reference
    response_ref[validation_overall]="${validation_results[overall_status]}"
    response_ref[validation_passed]="${validation_results[passed_validations]}"
    response_ref[validation_failed]="${validation_results[failed_validations]}"
    response_ref[validation_total]="${validation_results[total_validations]}"
    response_ref[validation_percentage]="$success_percentage"
    response_ref[validation_duration]="${validation_duration}s"
    
    # Log comprehensive validation results with educational insights
    log_message "INFO" "📊 Response validation completed" \
        "Status: ${validation_results[overall_status]}, Success Rate: ${validation_results[passed_validations]}/${validation_results[total_validations]} (${success_percentage}%)"
    
    if [[ "${validation_results[overall_status]}" == "PASS" ]]; then
        log_message "INFO" "🎉 All validation criteria passed - server is functioning correctly" \
            "Educational Achievement: Tutorial server demonstrates correct HTTP implementation"
        return 0
    else
        log_message "WARN" "⚠️  Some validation criteria failed - server may need troubleshooting" \
            "Educational Opportunity: Use failures as learning experience for debugging"
        return 1
    fi
}

# =============================================================================
# RETRY LOGIC AND RESILIENCE FUNCTIONS  
# =============================================================================

# Implements health check retry logic with exponential backoff, educational retry
# strategy explanation, and comprehensive failure handling for transient connectivity
# issues
retry_health_check() {
    local config_host="$1"
    local config_port="$2"
    local config_endpoint="$3"
    local config_timeout="$4"
    local retries="$5"
    local retry_delay="$6"
    
    log_message "INFO" "🔄 Starting health check with retry logic" \
        "Retries: $retries, Initial delay: ${retry_delay}s, Strategy: Exponential backoff"
    
    local attempt=1
    local max_attempts=$((retries + 1))
    local current_delay="$retry_delay"
    local total_start_time=$(date +%s)
    
    # Educational context about retry patterns
    log_message "INFO" "📚 Educational Context: Retry Strategy" \
        "Exponential backoff prevents overwhelming failing servers and handles transient errors"
    
    while [[ $attempt -le $max_attempts ]]; do
        log_message "INFO" "🎯 Health check attempt $attempt of $max_attempts" \
            "Target: $HEALTH_PROTOCOL://$config_host:$config_port$config_endpoint"
        
        # Execute health check attempt
        if perform_health_check "$config_host" "$config_port" "$config_endpoint" "$config_timeout"; then
            local total_duration=$(($(date +%s) - total_start_time))
            log_message "INFO" "✅ Health check SUCCEEDED on attempt $attempt" \
                "Total duration: ${total_duration}s, Educational: Retry strategy demonstrated success"
            
            # Export success metrics for external usage
            export HEALTH_CHECK_ATTEMPTS="$attempt"
            export HEALTH_CHECK_SUCCESS_TIME="${total_duration}s"
            export HEALTH_CHECK_RETRY_STRATEGY="exponential_backoff"
            
            return 0
        else
            log_message "WARN" "⚠️  Health check attempt $attempt failed" \
                "$(( max_attempts - attempt )) attempts remaining"
            
            # Check if more attempts available
            if [[ $attempt -lt $max_attempts ]]; then
                log_message "INFO" "⏱️  Waiting ${current_delay}s before next attempt" \
                    "Educational: Exponential backoff reduces server load during recovery"
                
                # Implement retry delay with educational context
                sleep "$current_delay"
                
                # Calculate exponential backoff for next attempt
                current_delay=$((current_delay * 2))
                if [[ $current_delay -gt 30 ]]; then
                    current_delay=30  # Cap maximum delay at 30 seconds
                fi
                
                log_message "DEBUG" "Next retry delay calculated: ${current_delay}s (exponential backoff)"
            fi
            
            attempt=$((attempt + 1))
        fi
    done
    
    # All retry attempts exhausted
    local total_duration=$(($(date +%s) - total_start_time))
    log_message "ERROR" "❌ Health check FAILED after $max_attempts attempts" \
        "Total duration: ${total_duration}s, Educational: Persistent failures indicate server issues"
    
    # Export failure metrics for external usage
    export HEALTH_CHECK_ATTEMPTS="$max_attempts"
    export HEALTH_CHECK_FAILURE_TIME="${total_duration}s"
    export HEALTH_CHECK_RETRY_STRATEGY="exponential_backoff"
    
    # Provide comprehensive failure guidance
    log_message "ERROR" "🛠️  Health Check Failure Analysis:" \
        "Persistent failures suggest systematic issues requiring investigation"
    
    log_message "ERROR" "📋 Recommended troubleshooting steps:"
    log_message "ERROR" "   1. Verify server is running: ps aux | grep node"
    log_message "ERROR" "   2. Check server startup logs for errors"
    log_message "ERROR" "   3. Test endpoint manually: curl -v http://$config_host:$config_port$config_endpoint"
    log_message "ERROR" "   4. Verify port availability: lsof -ti:$config_port"
    log_message "ERROR" "   5. Check network connectivity and firewall settings"
    log_message "ERROR" "   6. Review server configuration and environment variables"
    
    return 1
}

# =============================================================================
# NODE.JS FALLBACK INTEGRATION FUNCTIONS
# =============================================================================

# Provides fallback to Node.js-based health check script when shell-based validation
# is insufficient or when detailed Node.js application insights are needed
handle_nodejs_fallback() {
    local config_host="$1"
    local config_port="$2"
    local config_endpoint="$3"
    local reason="$4"
    
    log_message "INFO" "🔄 Initiating Node.js health check fallback" \
        "Reason: $reason, Target: $HEALTH_PROTOCOL://$config_host:$config_port$config_endpoint"
    
    # Validate Node.js health check script availability
    local nodejs_health_script="$BACKEND_DIR/scripts/health-check.js"
    
    if [[ ! -f "$nodejs_health_script" ]]; then
        log_message "ERROR" "❌ Node.js health check script not found" \
            "Path: $nodejs_health_script - Cannot execute fallback"
        return 1
    fi
    
    # Navigate to backend directory for script execution
    if ! cd "$BACKEND_DIR"; then
        log_message "ERROR" "❌ Failed to navigate to backend directory" \
            "Path: $BACKEND_DIR - Cannot execute Node.js script"
        return 1
    fi
    
    # Prepare Node.js health check arguments
    local nodejs_args=(
        "--timeout" "$((HEALTH_TIMEOUT * 1000))"  # Convert to milliseconds
        "--endpoint" "$config_endpoint"
    )
    
    # Add port override if different from default
    if [[ "$config_port" != "$DEFAULT_PORT" ]]; then
        nodejs_args+=("--port" "$config_port")
    fi
    
    # Add host override if different from default
    if [[ "$config_host" != "$DEFAULT_HOST" ]]; then
        nodejs_args+=("--host" "$config_host")
    fi
    
    # Add verbose flag if enabled
    if [[ "$HEALTH_VERBOSE" == "true" ]]; then
        nodejs_args+=("--verbose")
    fi
    
    log_message "INFO" "🚀 Executing Node.js health check script" \
        "Command: node scripts/health-check.js ${nodejs_args[*]}"
    
    # Execute Node.js health check with timeout
    local nodejs_output
    local nodejs_exit_code
    local fallback_start_time=$(date +%s)
    
    if command -v timeout >/dev/null 2>&1; then
        nodejs_output=$(timeout "$((HEALTH_TIMEOUT + 5))s" node scripts/health-check.js "${nodejs_args[@]}" 2>&1)
        nodejs_exit_code=$?
    else
        nodejs_output=$(node scripts/health-check.js "${nodejs_args[@]}" 2>&1)
        nodejs_exit_code=$?
    fi
    
    local fallback_duration=$(($(date +%s) - fallback_start_time))
    
    # Process Node.js health check results
    if [[ $nodejs_exit_code -eq 0 ]]; then
        log_message "INFO" "✅ Node.js health check fallback SUCCEEDED" \
            "Duration: ${fallback_duration}s, Enhanced validation completed"
        
        if [[ "$HEALTH_VERBOSE" == "true" && -n "$nodejs_output" ]]; then
            log_message "INFO" "📋 Node.js health check output:" 
            echo "$nodejs_output" >&2
        fi
        
        # Export fallback success metrics
        export NODEJS_FALLBACK_STATUS="SUCCESS"
        export NODEJS_FALLBACK_DURATION="${fallback_duration}s"
        export NODEJS_FALLBACK_EXIT_CODE="$nodejs_exit_code"
        
        return 0
        
    else
        log_message "WARN" "⚠️  Node.js health check fallback FAILED" \
            "Exit code: $nodejs_exit_code, Duration: ${fallback_duration}s"
        
        # Interpret Node.js exit codes for educational guidance
        case $nodejs_exit_code in
            1)
                log_message "WARN" "Node.js health check reported server validation failures"
                ;;
            2)
                log_message "ERROR" "Node.js health check configuration error"
                ;;
            3)
                log_message "WARN" "Node.js health check connection error"
                ;;
            124)
                log_message "WARN" "Node.js health check timeout"
                ;;
            *)
                log_message "ERROR" "Node.js health check unexpected error: $nodejs_exit_code"
                ;;
        esac
        
        if [[ "$HEALTH_VERBOSE" == "true" && -n "$nodejs_output" ]]; then
            log_message "DEBUG" "Node.js health check error output:"
            echo "$nodejs_output" >&2
        fi
        
        # Export fallback failure metrics
        export NODEJS_FALLBACK_STATUS="FAILURE"
        export NODEJS_FALLBACK_DURATION="${fallback_duration}s"
        export NODEJS_FALLBACK_EXIT_CODE="$nodejs_exit_code"
        
        return $nodejs_exit_code
    fi
}

# =============================================================================
# REPORTING AND OUTPUT FUNCTIONS
# =============================================================================

# Generates comprehensive health check report with results analysis, performance
# metrics, validation details, and educational insights formatted for multiple
# output types
generate_report() {
    local -n results_ref="$1"
    
    log_message "INFO" "📊 Generating comprehensive health check report" \
        "Format: $HEALTH_FORMAT, Success: ${results_ref[success]:-false}"
    
    # Generate report based on requested format
    case "$HEALTH_FORMAT" in
        "json")
            generate_json_report "results_ref"
            ;;
        "xml")
            generate_xml_report "results_ref"
            ;;
        "text"|*)
            generate_text_report "results_ref"
            ;;
    esac
}

# Generates structured JSON health check report for programmatic processing
generate_json_report() {
    local -n results_ref="$1"
    
    # Basic JSON structure without jq dependency
    cat << EOF
{
  "healthCheck": {
    "timestamp": "${results_ref[timestamp]:-$(date -Iseconds 2>/dev/null || date)}",
    "target": {
      "url": "${results_ref[url]:-}",
      "host": "$HEALTH_HOST",
      "port": $HEALTH_PORT,
      "endpoint": "$HEALTH_ENDPOINT",
      "protocol": "$HEALTH_PROTOCOL"
    },
    "configuration": {
      "timeout": $HEALTH_TIMEOUT,
      "retries": $HEALTH_RETRIES,
      "retryDelay": $HEALTH_RETRY_DELAY
    },
    "results": {
      "success": ${results_ref[success]:-false},
      "statusCode": "${results_ref[status_code]:-}",
      "responseTime": "${results_ref[response_time]:-0}",
      "responseContent": "${results_ref[response_content]:-}",
      "contentType": "${results_ref[content_type]:-}",
      "validationStatus": "${results_ref[validation_overall]:-UNKNOWN}"
    },
    "validation": {
      "overallStatus": "${results_ref[validation_overall]:-UNKNOWN}",
      "passedTests": ${results_ref[validation_passed]:-0},
      "failedTests": ${results_ref[validation_failed]:-0},
      "totalTests": ${results_ref[validation_total]:-0},
      "successPercentage": ${results_ref[validation_percentage]:-0}
    },
    "performance": {
      "responseTimeMs": ${results_ref[response_time]:-0},
      "performanceLevel": "${results_ref[performance_level]:-UNKNOWN}",
      "thresholdMs": $PERFORMANCE_THRESHOLD_MS,
      "withinThreshold": $(( ${results_ref[response_time]:-999} <= PERFORMANCE_THRESHOLD_MS && echo "true" || echo "false" ))
    },
    "educational": {
      "context": "${results_ref[educational_context]:-}",
      "scriptVersion": "$SCRIPT_VERSION",
      "toolsUsed": ["curl", "grep", "awk", "bash"],
      "learningObjectives": [
        "HTTP health check implementation",
        "Shell scripting for infrastructure automation",
        "Performance monitoring and validation",
        "Error handling and retry logic"
      ]
    }
  }
}
EOF
}

# Generates XML health check report for systems requiring XML format
generate_xml_report() {
    local -n results_ref="$1"
    
    cat << EOF
<?xml version="1.0" encoding="UTF-8"?>
<healthCheck>
  <metadata>
    <timestamp>${results_ref[timestamp]:-$(date -Iseconds 2>/dev/null || date)}</timestamp>
    <scriptVersion>$SCRIPT_VERSION</scriptVersion>
  </metadata>
  
  <target>
    <url>${results_ref[url]:-}</url>
    <host>$HEALTH_HOST</host>
    <port>$HEALTH_PORT</port>
    <endpoint>$HEALTH_ENDPOINT</endpoint>
    <protocol>$HEALTH_PROTOCOL</protocol>
  </target>
  
  <configuration>
    <timeout>$HEALTH_TIMEOUT</timeout>
    <retries>$HEALTH_RETRIES</retries>
    <retryDelay>$HEALTH_RETRY_DELAY</retryDelay>
  </configuration>
  
  <results>
    <success>${results_ref[success]:-false}</success>
    <statusCode>${results_ref[status_code]:-}</statusCode>
    <responseTime>${results_ref[response_time]:-0}</responseTime>
    <responseContent><![CDATA[${results_ref[response_content]:-}]]></responseContent>
    <contentType>${results_ref[content_type]:-}</contentType>
    <validationStatus>${results_ref[validation_overall]:-UNKNOWN}</validationStatus>
  </results>
  
  <validation>
    <overallStatus>${results_ref[validation_overall]:-UNKNOWN}</overallStatus>
    <passedTests>${results_ref[validation_passed]:-0}</passedTests>
    <failedTests>${results_ref[validation_failed]:-0}</failedTests>
    <totalTests>${results_ref[validation_total]:-0}</totalTests>
    <successPercentage>${results_ref[validation_percentage]:-0}</successPercentage>
  </validation>
  
  <performance>
    <responseTimeMs>${results_ref[response_time]:-0}</responseTimeMs>
    <performanceLevel>${results_ref[performance_level]:-UNKNOWN}</performanceLevel>
    <thresholdMs>$PERFORMANCE_THRESHOLD_MS</thresholdMs>
    <withinThreshold>$(( ${results_ref[response_time]:-999} <= PERFORMANCE_THRESHOLD_MS && echo "true" || echo "false" ))</withinThreshold>
  </performance>
  
  <educational>
    <context>${results_ref[educational_context]:-}</context>
    <learningObjectives>
      <objective>HTTP health check implementation</objective>
      <objective>Shell scripting for infrastructure automation</objective>
      <objective>Performance monitoring and validation</objective>
      <objective>Error handling and retry logic</objective>
    </learningObjectives>
  </educational>
</healthCheck>
EOF
}

# Generates human-readable text health check report with educational context
generate_text_report() {
    local -n results_ref="$1"
    
    if [[ "$HEALTH_QUIET" != "true" ]]; then
        echo
        echo "=================================================================================="
        echo "                    Node.js Tutorial Health Check Report"
        echo "=================================================================================="
        echo
        echo "📋 HEALTH CHECK SUMMARY"
        echo "   Timestamp: ${results_ref[timestamp]:-$(date -Iseconds 2>/dev/null || date)}"
        echo "   Target URL: ${results_ref[url]:-$HEALTH_PROTOCOL://$HEALTH_HOST:$HEALTH_PORT$HEALTH_ENDPOINT}"
        echo "   Overall Status: $([ "${results_ref[success]:-false}" == "true" ] && echo "✅ HEALTHY" || echo "❌ UNHEALTHY")"
        echo "   Validation: ${results_ref[validation_overall]:-UNKNOWN}"
        echo
        echo "🌐 SERVER RESPONSE"
        echo "   HTTP Status Code: ${results_ref[status_code]:-N/A}"
        echo "   Response Time: ${results_ref[response_time]:-0}ms"
        echo "   Content Type: ${results_ref[content_type]:-N/A}"
        echo "   Response Content: \"${results_ref[response_content]:-N/A}\""
        echo "   Performance Level: ${results_ref[performance_level]:-UNKNOWN}"
        echo
        echo "✅ VALIDATION RESULTS"
        echo "   Tests Passed: ${results_ref[validation_passed]:-0}/${results_ref[validation_total]:-0}"
        echo "   Success Rate: ${results_ref[validation_percentage]:-0}%"
        echo "   Overall Status: ${results_ref[validation_overall]:-UNKNOWN}"
        echo
        echo "⚙️  CONFIGURATION"
        echo "   Host: $HEALTH_HOST"
        echo "   Port: $HEALTH_PORT"
        echo "   Endpoint: $HEALTH_ENDPOINT"
        echo "   Timeout: ${HEALTH_TIMEOUT}s"
        echo "   Retries: $HEALTH_RETRIES"
        echo "   Retry Delay: ${HEALTH_RETRY_DELAY}s"
        echo
        echo "🎓 EDUCATIONAL CONTEXT"
        echo "   Learning Objective: ${results_ref[educational_context]:-HTTP server health validation}"
        echo "   Tools Demonstrated: curl, grep, awk, bash scripting"
        echo "   Infrastructure Skills: Health monitoring, performance validation, retry logic"
        echo "   Script Version: $SCRIPT_VERSION"
        echo
        echo "=================================================================================="
        echo
    fi
}

# =============================================================================
# CLEANUP AND RESOURCE MANAGEMENT
# =============================================================================

# Cleans up temporary files, health check artifacts, and resources created during
# execution with educational logging about resource management and cleanup procedures
cleanup() {
    local execution_context="${1:-script_completion}"
    
    log_message "INFO" "🧹 Starting health check cleanup procedures" \
        "Context: $execution_context"
    
    # Clean up temporary health check files
    local temp_files=(
        "/tmp/health-check-$$-*"
        "/tmp/curl-output-$$-*"
        "$SCRIPT_DIR/.health-check-*"
    )
    
    for pattern in "${temp_files[@]}"; do
        if ls $pattern 1>/dev/null 2>&1; then
            rm -f $pattern 2>/dev/null || true
            log_message "DEBUG" "Cleaned up temporary files: $pattern"
        fi
    done
    
    # Reset terminal colors if they were modified
    if [[ -t 1 ]]; then
        echo -ne "$COLOR_RESET" >&2
    fi
    
    # Clean up exported environment variables if desired
    if [[ "$execution_context" == "script_completion" ]]; then
        # Educational note: Cleanup demonstrates good resource management
        log_message "DEBUG" "Environment cleanup completed - health check variables cleared"
    fi
    
    log_message "INFO" "✅ Health check cleanup completed" \
        "Educational: Proper resource cleanup prevents system pollution"
}

# =============================================================================
# MAIN ENTRY POINT FUNCTION
# =============================================================================

# Main entry point function that orchestrates the complete health check process
# including option parsing, health check execution, result validation, and 
# educational reporting
main() {
    local script_start_time=$(date +%s)
    
    # Display educational script banner for user context
    if [[ "$HEALTH_QUIET" != "true" ]]; then
        log_message "INFO" "🚀 Node.js Tutorial Shell-Based Health Check Script" \
            "Version: $SCRIPT_VERSION, Purpose: Infrastructure monitoring demonstration"
    fi
    
    # Parse and validate command line arguments
    parse_arguments "$@"
    
    # Display usage help if requested
    if [[ "$HEALTH_SHOW_HELP" == "true" ]]; then
        display_help
        exit $EXIT_SUCCESS
    fi
    
    # Apply quiet mode to logging if requested
    if [[ "$HEALTH_QUIET" == "true" ]]; then
        VERBOSE=false
        COLOR_OUTPUT=false
    fi
    
    # Validate system prerequisites
    if ! check_prerequisites "$HEALTH_HOST" "$HEALTH_PORT"; then
        log_message "ERROR" "❌ Prerequisites validation failed" \
            "Cannot proceed with health check execution"
        cleanup "prerequisites_failed"
        exit $EXIT_PREREQUISITES_FAILED
    fi
    
    # Execute comprehensive health check with retry logic
    log_message "INFO" "🏥 Starting comprehensive health check validation" \
        "Target: $HEALTH_PROTOCOL://$HEALTH_HOST:$HEALTH_PORT$HEALTH_ENDPOINT"
    
    local health_check_successful=false
    local final_exit_code=$EXIT_HEALTH_CHECK_FAILED
    
    # Execute health check with retry logic
    if retry_health_check "$HEALTH_HOST" "$HEALTH_PORT" "$HEALTH_ENDPOINT" \
        "$HEALTH_TIMEOUT" "$HEALTH_RETRIES" "$HEALTH_RETRY_DELAY"; then
        
        health_check_successful=true
        final_exit_code=$EXIT_SUCCESS
        
        log_message "INFO" "🎉 Health check validation SUCCEEDED" \
            "Server is healthy and responding correctly to requests"
        
    else
        log_message "WARN" "⚠️  Shell-based health check failed" \
            "Attempting Node.js fallback if requested"
        
        # Try Node.js fallback if requested
        if [[ "$HEALTH_NODEJS_FALLBACK" == "true" ]]; then
            if handle_nodejs_fallback "$HEALTH_HOST" "$HEALTH_PORT" \
                "$HEALTH_ENDPOINT" "shell_health_check_failed"; then
                
                health_check_successful=true
                final_exit_code=$EXIT_SUCCESS
                
                log_message "INFO" "✅ Node.js fallback health check SUCCEEDED" \
                    "Enhanced validation completed successfully"
            else
                log_message "ERROR" "❌ Both shell and Node.js health checks failed" \
                    "Server appears to be unhealthy or inaccessible"
                final_exit_code=$EXIT_HEALTH_CHECK_FAILED
            fi
        else
            final_exit_code=$EXIT_HEALTH_CHECK_FAILED
        fi
    fi
    
    # Calculate total execution time
    local script_end_time=$(date +%s)
    local total_duration=$((script_end_time - script_start_time))
    
    # Generate final health check summary
    if [[ "$health_check_successful" == "true" ]]; then
        log_message "INFO" "✨ Health Check Script Completed Successfully" \
            "Duration: ${total_duration}s, Server validated and ready for tutorial usage"
        
        if [[ "$HEALTH_QUIET" != "true" ]]; then
            log_message "INFO" "🌐 Server Access Information:"
            log_message "INFO" "   • URL: $HEALTH_PROTOCOL://$HEALTH_HOST:$HEALTH_PORT$HEALTH_ENDPOINT"
            log_message "INFO" "   • Expected Response: \"$EXPECTED_CONTENT\""
            log_message "INFO" "   • Status: Server is healthy and responding correctly"
        fi
        
    else
        log_message "ERROR" "💥 Health Check Script Failed" \
            "Duration: ${total_duration}s, Server validation unsuccessful"
        
        log_message "ERROR" "🛠️  Troubleshooting Recommendations:"
        log_message "ERROR" "   1. Verify server is running: ps aux | grep node"
        log_message "ERROR" "   2. Check server startup: node server.js"  
        log_message "ERROR" "   3. Test manually: curl -v $HEALTH_PROTOCOL://$HEALTH_HOST:$HEALTH_PORT$HEALTH_ENDPOINT"
        log_message "ERROR" "   4. Check port usage: lsof -ti:$HEALTH_PORT"
        log_message "ERROR" "   5. Review server logs for errors"
        log_message "ERROR" "   6. Try verbose mode: $0 --verbose"
    fi
    
    # Educational summary and learning insights
    if [[ "$HEALTH_QUIET" != "true" ]]; then
        log_message "INFO" "🎓 Educational Summary:" \
            "Health check demonstrated shell-based infrastructure monitoring techniques"
        
        log_message "INFO" "📚 Learning Achievements:"
        log_message "INFO" "   • HTTP client programming with curl"
        log_message "INFO" "   • Systematic server validation methods"
        log_message "INFO" "   • Performance monitoring and threshold analysis"
        log_message "INFO" "   • Retry logic and resilience patterns"
        log_message "INFO" "   • Error categorization and troubleshooting"
        log_message "INFO" "   • Infrastructure automation and CI/CD integration"
    fi
    
    # Cleanup resources and temporary files
    cleanup "script_completion"
    
    # Exit with appropriate code for automation integration
    exit $final_exit_code
}

# =============================================================================
# ERROR HANDLING AND SIGNAL TRAPS
# =============================================================================

# Trap for cleanup on script termination
trap 'log_message "WARN" "🛑 Health check script interrupted"; cleanup "script_interrupted"; exit $EXIT_GENERAL_ERROR' INT TERM

# Trap for unexpected errors  
trap 'log_message "ERROR" "💥 Unexpected error at line $LINENO"; cleanup "unexpected_error"; exit $EXIT_GENERAL_ERROR' ERR

# =============================================================================
# SCRIPT EXECUTION
# =============================================================================

# Execute main function only when script is run directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

# Export key functions for external usage and testing integration
export -f log_message check_prerequisites perform_health_check validate_response

# Export configuration constants for external scripts
export HEALTH_CHECK_CONFIG="$SCRIPT_NAME:$SCRIPT_VERSION"

# =============================================================================
# END OF HEALTH CHECK SCRIPT
# =============================================================================