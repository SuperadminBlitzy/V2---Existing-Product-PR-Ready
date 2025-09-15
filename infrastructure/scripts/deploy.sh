#!/bin/bash
# =============================================================================
# Node.js Tutorial HTTP Server - Comprehensive Deployment Automation Script
# =============================================================================
#
# This shell script provides comprehensive deployment automation for the Node.js 
# tutorial HTTP server that orchestrates multiple deployment strategies including 
# direct Node.js execution, Docker containerization, and Docker Compose orchestration. 
# This script demonstrates infrastructure deployment best practices while maintaining 
# the tutorial's focus on Node.js fundamentals and providing production-ready 
# deployment patterns for learning purposes.
#
# Educational Features:
# - Multi-strategy deployment automation (direct, Docker, Docker Compose)
# - Comprehensive validation and health checking integration
# - Educational logging with troubleshooting guidance
# - Rollback capabilities and failure recovery procedures
# - CI/CD pipeline integration with standardized exit codes
# - Infrastructure demonstration with best practices
# - Performance monitoring and deployment metrics
# - Security-focused deployment with localhost binding
#
# Deployment Strategies:
# - direct: Direct Node.js execution on host system
# - docker: Containerized deployment with Docker Engine
# - docker-compose: Orchestrated multi-service deployment
#
# Usage Examples:
#   ./deploy.sh --strategy direct --env development
#   ./deploy.sh --strategy docker --port 8080 --verbose
#   ./deploy.sh --strategy docker-compose --cleanup --timeout 300
#
# =============================================================================

# Bash strict mode for enhanced error handling and script reliability
set -euo pipefail
IFS=$'\n\t'

# =============================================================================
# GLOBAL CONSTANTS AND CONFIGURATION
# =============================================================================

# Script directory detection for reliable path resolution
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
readonly BACKEND_DIR="$PROJECT_ROOT/src/backend"
readonly INFRASTRUCTURE_DIR="$PROJECT_ROOT/infrastructure"

# Default deployment configuration with educational settings
readonly DEFAULT_DEPLOYMENT_TYPE="development"
readonly SUPPORTED_STRATEGIES=("direct" "docker" "docker-compose")
readonly DEFAULT_PORT=3000
readonly DEFAULT_HOST="127.0.0.1"
readonly HEALTH_CHECK_ENDPOINT="/hello"
readonly EXPECTED_RESPONSE="Hello world"

# Timeout and retry configuration for deployment validation
readonly DEPLOYMENT_TIMEOUT=120
readonly HEALTH_CHECK_RETRIES=5
readonly HEALTH_CHECK_DELAY=2

# Container and service naming conventions
readonly CONTAINER_NAME_PREFIX="nodejs-tutorial"
readonly COMPOSE_PROJECT_NAME="nodejs-tutorial"

# Logging configuration with educational context
readonly LOG_LEVEL="INFO"

# Exit codes for automation integration and monitoring systems
# Docker v20.10+, docker-compose v2.0+, Node.js v18+, npm v8+, curl v7.0+, jq v1.6+
readonly EXIT_SUCCESS=0
readonly EXIT_FAILURE=1
readonly EXIT_INVALID_ARGS=2
readonly EXIT_DEPLOYMENT_FAILED=3
readonly EXIT_HEALTH_CHECK_FAILED=4
readonly EXIT_PREREQUISITE_FAILED=5

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

# Logs deployment messages with appropriate log levels, timestamps, educational 
# context, and structured formatting for deployment monitoring and troubleshooting
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
    
    # Output structured log message with educational formatting
    echo -e "${color_code}[$timestamp] [$level]${COLOR_RESET} $message" >&2
    
    if [[ -n "$context" ]]; then
        echo -e "${color_code}    Context: $context${COLOR_RESET}" >&2
    fi
}

# =============================================================================
# COMMAND LINE ARGUMENT PROCESSING
# =============================================================================

# Parses and validates command line arguments to extract deployment configuration 
# including strategy selection, environment settings, port overrides, and educational 
# options with comprehensive validation
parse_arguments() {
    local -A config=(
        [strategy]="direct"
        [environment]="development"
        [port]="$DEFAULT_PORT"
        [host]="$DEFAULT_HOST"
        [timeout]="$DEPLOYMENT_TIMEOUT"
        [health_retries]="$HEALTH_CHECK_RETRIES"
        [health_delay]="$HEALTH_CHECK_DELAY"
        [verbose]="false"
        [dry_run]="false"
        [force]="false"
        [cleanup]="false"
        [help]="false"
    )
    
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --strategy|-s)
                if [[ -n "${2:-}" ]]; then
                    local strategy="$2"
                    if [[ " ${SUPPORTED_STRATEGIES[*]} " == *" $strategy "* ]]; then
                        config[strategy]="$strategy"
                        shift 2
                    else
                        log_message "ERROR" "Invalid deployment strategy: $strategy" \
                            "Supported strategies: ${SUPPORTED_STRATEGIES[*]}"
                        exit $EXIT_INVALID_ARGS
                    fi
                else
                    log_message "ERROR" "--strategy option requires a value" \
                        "Usage: --strategy {direct|docker|docker-compose}"
                    exit $EXIT_INVALID_ARGS
                fi
                ;;
            --env|-e)
                if [[ -n "${2:-}" ]]; then
                    if [[ "$2" =~ ^(development|production|test)$ ]]; then
                        config[environment]="$2"
                        shift 2
                    else
                        log_message "ERROR" "Invalid environment: $2" \
                            "Valid environments: development, production, test"
                        exit $EXIT_INVALID_ARGS
                    fi
                else
                    log_message "ERROR" "--env option requires a value" \
                        "Usage: --env {development|production|test}"
                    exit $EXIT_INVALID_ARGS
                fi
                ;;
            --port|-p)
                if [[ -n "${2:-}" ]] && [[ "$2" =~ ^[0-9]+$ ]] && [[ "$2" -ge 1024 ]] && [[ "$2" -le 65535 ]]; then
                    config[port]="$2"
                    shift 2
                else
                    log_message "ERROR" "Invalid port number: ${2:-}" \
                        "Port must be between 1024-65535"
                    exit $EXIT_INVALID_ARGS
                fi
                ;;
            --host|-h)
                if [[ -n "${2:-}" ]]; then
                    # Security validation for localhost-only access
                    if [[ "$2" =~ ^(127\.0\.0\.1|localhost|::1)$ ]]; then
                        config[host]="$2"
                        shift 2
                    else
                        log_message "WARN" "Non-localhost host detected: $2" \
                            "Tutorial security recommends localhost-only binding"
                        config[host]="$2"
                        shift 2
                    fi
                else
                    log_message "ERROR" "--host option requires a value" \
                        "Usage: --host {127.0.0.1|localhost|::1}"
                    exit $EXIT_INVALID_ARGS
                fi
                ;;
            --timeout|-t)
                if [[ -n "${2:-}" ]] && [[ "$2" =~ ^[0-9]+$ ]] && [[ "$2" -gt 0 ]]; then
                    config[timeout]="$2"
                    shift 2
                else
                    log_message "ERROR" "Invalid timeout value: ${2:-}" \
                        "Timeout must be positive integer in seconds"
                    exit $EXIT_INVALID_ARGS
                fi
                ;;
            --health-retries)
                if [[ -n "${2:-}" ]] && [[ "$2" =~ ^[0-9]+$ ]] && [[ "$2" -gt 0 ]]; then
                    config[health_retries]="$2"
                    shift 2
                else
                    log_message "ERROR" "Invalid health check retries: ${2:-}" \
                        "Retries must be positive integer"
                    exit $EXIT_INVALID_ARGS
                fi
                ;;
            --health-delay)
                if [[ -n "${2:-}" ]] && [[ "$2" =~ ^[0-9]+$ ]] && [[ "$2" -gt 0 ]]; then
                    config[health_delay]="$2"
                    shift 2
                else
                    log_message "ERROR" "Invalid health check delay: ${2:-}" \
                        "Delay must be positive integer in seconds"
                    exit $EXIT_INVALID_ARGS
                fi
                ;;
            --verbose|-v)
                config[verbose]="true"
                shift
                ;;
            --dry-run)
                config[dry_run]="true"
                shift
                ;;
            --force)
                config[force]="true"
                shift
                ;;
            --cleanup)
                config[cleanup]="true"
                shift
                ;;
            --help)
                config[help]="true"
                shift
                ;;
            *)
                log_message "ERROR" "Unknown option: $1" \
                    "Use --help for usage information"
                exit $EXIT_INVALID_ARGS
                ;;
        esac
    done
    
    # Export configuration as global variables for function access
    export DEPLOYMENT_STRATEGY="${config[strategy]}"
    export DEPLOYMENT_ENVIRONMENT="${config[environment]}"
    export DEPLOYMENT_PORT="${config[port]}"
    export DEPLOYMENT_HOST="${config[host]}"
    export DEPLOYMENT_TIMEOUT_VAL="${config[timeout]}"
    export HEALTH_RETRIES="${config[health_retries]}"
    export HEALTH_DELAY="${config[health_delay]}"
    export VERBOSE_LOGGING="${config[verbose]}"
    export DRY_RUN_MODE="${config[dry_run]}"
    export FORCE_DEPLOYMENT="${config[force]}"
    export CLEANUP_ARTIFACTS="${config[cleanup]}"
    export SHOW_HELP="${config[help]}"
    
    return 0
}

# =============================================================================
# HELP AND BANNER FUNCTIONS
# =============================================================================

# Displays comprehensive help information about deployment script usage, command 
# line options, deployment strategies, and educational guidance for infrastructure 
# deployment learning
display_help() {
    cat << 'EOF'

🚀 Node.js Tutorial Deployment Automation Script
==============================================

Comprehensive deployment automation for Node.js tutorial HTTP server with multiple
deployment strategies, health checking, and educational infrastructure demonstration.

📋 USAGE:
  ./deploy.sh [OPTIONS]

⚙️  OPTIONS:
  --strategy, -s STRATEGY    Deployment strategy: direct, docker, docker-compose
                             Default: direct
  --env, -e ENVIRONMENT      Environment type: development, production, test
                             Default: development
  --port, -p PORT            Server port override (1024-65535)
                             Default: 3000
  --host, -h HOST            Server hostname (localhost-only for security)
                             Default: 127.0.0.1
  --timeout, -t SECONDS      Deployment timeout in seconds
                             Default: 120
  --health-retries COUNT     Health check retry attempts
                             Default: 5
  --health-delay SECONDS     Delay between health check retries
                             Default: 2
  --verbose, -v              Enable verbose educational logging
  --dry-run                  Validate configuration without deployment
  --force                    Force deployment even if health checks fail
  --cleanup                  Clean up deployment artifacts after completion
  --help                     Display this help information

🏗️  DEPLOYMENT STRATEGIES:

  direct:
    Deploys Node.js server directly on host system using npm and Node.js runtime.
    - Fastest deployment with minimal resource usage
    - Direct system access for easy debugging
    - Ideal for local development and educational tutorials

  docker:
    Deploys server in Docker container for isolation and portability.
    - Environment isolation with consistent runtime
    - Production-like container environment
    - Easy cleanup and resource management

  docker-compose:
    Orchestrated deployment using Docker Compose for multi-service architecture.
    - Service orchestration with network and volume management
    - Scalable architecture demonstration
    - Production-ready deployment patterns

📚 EXAMPLES:

  Basic direct deployment:
    ./deploy.sh --strategy direct

  Docker deployment with custom port:
    ./deploy.sh --strategy docker --port 8080 --verbose

  Docker Compose with production settings:
    ./deploy.sh --strategy docker-compose --env production --cleanup

  Dry run validation:
    ./deploy.sh --dry-run --strategy docker --verbose

🚦 EXIT CODES:
  0 - Deployment completed successfully
  1 - General deployment failure
  2 - Invalid command line arguments
  3 - Deployment strategy execution failed
  4 - Health check validation failed
  5 - Prerequisites check failed

🔧 TROUBLESHOOTING:

  Port conflicts:
    - Use different port: --port 3001
    - Check running processes: lsof -i :3000

  Docker issues:
    - Check Docker status: systemctl status docker
    - Verify Docker installation: docker --version

  Health check failures:
    - Increase timeout: --health-retries 10 --health-delay 5
    - Check application logs for errors

📖 EDUCATIONAL VALUE:
  - Demonstrates infrastructure automation best practices
  - Shows multiple deployment strategy implementation
  - Illustrates comprehensive validation and health checking
  - Provides hands-on experience with CI/CD integration patterns
  - Teaches error handling and rollback procedures

🌐 INTEGRATION:
  - Compatible with CI/CD pipelines (GitHub Actions, Jenkins)
  - Supports monitoring system integration with structured exit codes
  - Enables automated deployment validation and reporting

For more information, check the tutorial documentation or use --verbose for
detailed deployment information and educational insights.

==============================================
EOF
}

# Displays comprehensive deployment banner with tutorial information, deployment 
# strategy context, configuration summary, and educational objectives for 
# infrastructure learning
display_banner() {
    local config_strategy="$1"
    local config_env="$2"
    local config_port="$3"
    local config_host="$4"
    
    cat << EOF

${COLOR_CYAN}
╔══════════════════════════════════════════════════════════════════════════════╗
║                    🚀 Node.js Tutorial Deployment                            ║
║                     Infrastructure Automation Script                         ║
╚══════════════════════════════════════════════════════════════════════════════╝
${COLOR_RESET}

${COLOR_GREEN}📋 DEPLOYMENT CONFIGURATION${COLOR_RESET}
   Strategy: ${COLOR_YELLOW}$config_strategy${COLOR_RESET}
   Environment: ${COLOR_YELLOW}$config_env${COLOR_RESET}
   Target: ${COLOR_YELLOW}http://$config_host:$config_port${COLOR_RESET}
   Endpoint: ${COLOR_YELLOW}$HEALTH_CHECK_ENDPOINT${COLOR_RESET}
   Expected Response: ${COLOR_YELLOW}"$EXPECTED_RESPONSE"${COLOR_RESET}

${COLOR_BLUE}🎓 EDUCATIONAL OBJECTIVES${COLOR_RESET}
   • Demonstrate infrastructure deployment automation
   • Show multiple deployment strategy implementation
   • Practice health checking and validation techniques
   • Experience CI/CD integration patterns
   • Learn rollback and failure recovery procedures

${COLOR_PURPLE}⏱️  DEPLOYMENT TIMELINE${COLOR_RESET}
   Timeout: ${DEPLOYMENT_TIMEOUT_VAL} seconds
   Health Check Retries: $HEALTH_RETRIES (${HEALTH_DELAY}s intervals)
   Expected Duration: $(get_expected_duration "$config_strategy")

${COLOR_CYAN}═══════════════════════════════════════════════════════════════════════════════${COLOR_RESET}

EOF
}

# Get expected deployment duration based on strategy
get_expected_duration() {
    local strategy="$1"
    case "$strategy" in
        "direct") echo "15-30 seconds" ;;
        "docker") echo "60-180 seconds (including build)" ;;
        "docker-compose") echo "90-300 seconds (including orchestration)" ;;
        *) echo "Variable duration" ;;
    esac
}

# =============================================================================
# PREREQUISITE VALIDATION FUNCTIONS
# =============================================================================

# Validates that all required system tools, runtime dependencies, and configuration 
# prerequisites are available for successful deployment with educational guidance 
# for missing requirements
check_prerequisites() {
    local strategy="$1"
    local config_port="$2"
    local missing_tools=()
    local warnings=()
    
    log_message "INFO" "🔍 Validating deployment prerequisites" \
        "Strategy: $strategy, Port: $config_port"
    
    # Check Node.js availability and version
    if command -v node >/dev/null 2>&1; then
        local node_version=$(node --version | sed 's/v//')
        local required_version="18.0.0"
        
        if [[ "$(printf '%s\n' "$required_version" "$node_version" | sort -V | head -n1)" == "$required_version" ]]; then
            log_message "INFO" "✅ Node.js version validated" "Version: $node_version (>= $required_version)"
        else
            log_message "ERROR" "❌ Node.js version too old" \
                "Found: $node_version, Required: >= $required_version. Install from https://nodejs.org"
            missing_tools+=("nodejs-current")
        fi
    else
        log_message "ERROR" "❌ Node.js not found" \
            "Install Node.js from https://nodejs.org or use package manager"
        missing_tools+=("nodejs")
    fi
    
    # Check npm availability and version
    if command -v npm >/dev/null 2>&1; then
        local npm_version=$(npm --version)
        log_message "INFO" "✅ npm available" "Version: $npm_version"
    else
        log_message "ERROR" "❌ npm not found" \
            "npm should be included with Node.js installation"
        missing_tools+=("npm")
    fi
    
    # Strategy-specific prerequisite checks
    case "$strategy" in
        "docker"|"docker-compose")
            # Check Docker Engine
            if command -v docker >/dev/null 2>&1; then
                if docker info >/dev/null 2>&1; then
                    local docker_version=$(docker --version | awk '{print $3}' | sed 's/,//')
                    log_message "INFO" "✅ Docker Engine available" "Version: $docker_version"
                else
                    log_message "ERROR" "❌ Docker daemon not running" \
                        "Start Docker service: sudo systemctl start docker"
                    missing_tools+=("docker-daemon")
                fi
            else
                log_message "ERROR" "❌ Docker not found" \
                    "Install Docker from https://docs.docker.com/get-docker/"
                missing_tools+=("docker")
            fi
            
            if [[ "$strategy" == "docker-compose" ]]; then
                # Check Docker Compose
                if command -v docker-compose >/dev/null 2>&1 || docker compose version >/dev/null 2>&1; then
                    local compose_version
                    if command -v docker-compose >/dev/null 2>&1; then
                        compose_version=$(docker-compose --version | awk '{print $3}' | sed 's/,//')
                    else
                        compose_version=$(docker compose version --short)
                    fi
                    log_message "INFO" "✅ Docker Compose available" "Version: $compose_version"
                else
                    log_message "ERROR" "❌ Docker Compose not found" \
                        "Install Docker Compose or use Docker Desktop"
                    missing_tools+=("docker-compose")
                fi
            fi
            ;;
    esac
    
    # Check HTTP utilities for health checking
    if command -v curl >/dev/null 2>&1; then
        log_message "INFO" "✅ curl available for health checking"
    else
        log_message "WARN" "⚠️  curl not found" \
            "Health checking will use Node.js script only"
        warnings+=("curl recommended for additional health check capabilities")
    fi
    
    # Check JSON processing utility
    if command -v jq >/dev/null 2>&1; then
        log_message "INFO" "✅ jq available for JSON processing"
    else
        log_message "WARN" "⚠️  jq not found" \
            "JSON processing will be limited"
        warnings+=("jq recommended for enhanced JSON processing")
    fi
    
    # Check port availability
    if command -v lsof >/dev/null 2>&1; then
        if lsof -ti:"$config_port" >/dev/null 2>&1; then
            local process_info=$(lsof -ti:"$config_port" | head -1)
            log_message "WARN" "⚠️  Port $config_port is in use" \
                "Process: $process_info. Consider using --port option"
            warnings+=("Port $config_port conflict may prevent deployment")
        else
            log_message "INFO" "✅ Port $config_port available"
        fi
    elif command -v netstat >/dev/null 2>&1; then
        if netstat -tuln | grep ":$config_port " >/dev/null 2>&1; then
            log_message "WARN" "⚠️  Port $config_port appears to be in use" \
                "Consider using --port option"
            warnings+=("Port $config_port conflict may prevent deployment")
        else
            log_message "INFO" "✅ Port $config_port appears available"
        fi
    else
        log_message "WARN" "⚠️  Cannot check port availability" \
            "lsof or netstat not available"
        warnings+=("Unable to validate port availability")
    fi
    
    # Validate project structure
    local required_files=(
        "$BACKEND_DIR/package.json"
        "$BACKEND_DIR/server.js"
        "$BACKEND_DIR/scripts/health-check.js"
    )
    
    for file in "${required_files[@]}"; do
        if [[ -f "$file" ]]; then
            log_message "INFO" "✅ Required file exists: $(basename "$file")"
        else
            log_message "ERROR" "❌ Missing required file: $file"
            missing_tools+=("project-files")
        fi
    done
    
    # Strategy-specific file validation
    case "$strategy" in
        "docker")
            if [[ -f "$INFRASTRUCTURE_DIR/docker/Dockerfile.backend" ]]; then
                log_message "INFO" "✅ Docker build file available"
            else
                log_message "ERROR" "❌ Missing Dockerfile.backend"
                missing_tools+=("dockerfile")
            fi
            ;;
        "docker-compose")
            if [[ -f "$INFRASTRUCTURE_DIR/docker/docker-compose.yml" ]]; then
                log_message "INFO" "✅ Docker Compose configuration available"
            else
                log_message "ERROR" "❌ Missing docker-compose.yml"
                missing_tools+=("docker-compose-file")
            fi
            ;;
    esac
    
    # Report warnings with educational context
    if [[ ${#warnings[@]} -gt 0 ]]; then
        log_message "WARN" "📋 Deployment warnings detected" \
            "${#warnings[@]} warnings found - deployment may continue"
        for warning in "${warnings[@]}"; do
            log_message "WARN" "   • $warning"
        done
    fi
    
    # Handle missing prerequisites
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        log_message "ERROR" "💥 Prerequisites validation failed" \
            "${#missing_tools[@]} critical issues found"
        
        for tool in "${missing_tools[@]}"; do
            case "$tool" in
                "nodejs") 
                    log_message "ERROR" "   Install Node.js: https://nodejs.org/en/download/" 
                    ;;
                "nodejs-current")
                    log_message "ERROR" "   Upgrade Node.js: https://nodejs.org/en/download/current/"
                    ;;
                "npm")
                    log_message "ERROR" "   npm included with Node.js - reinstall Node.js"
                    ;;
                "docker")
                    log_message "ERROR" "   Install Docker: https://docs.docker.com/get-docker/"
                    ;;
                "docker-daemon")
                    log_message "ERROR" "   Start Docker: sudo systemctl start docker"
                    ;;
                "docker-compose")
                    log_message "ERROR" "   Install Docker Compose: https://docs.docker.com/compose/install/"
                    ;;
                *)
                    log_message "ERROR" "   Missing: $tool"
                    ;;
            esac
        done
        
        log_message "ERROR" "🛠️  Educational troubleshooting guide:" \
            "Review installation requirements and try again"
        exit $EXIT_PREREQUISITE_FAILED
    fi
    
    log_message "INFO" "✅ Prerequisites validation completed successfully" \
        "All required tools and dependencies are available"
    
    return 0
}

# =============================================================================
# DEPLOYMENT STRATEGY FUNCTIONS  
# =============================================================================

# Executes direct Node.js deployment strategy by installing dependencies, configuring 
# environment, starting application server, and validating deployment with educational 
# monitoring and logging
deploy_direct() {
    local config_port="$1"
    local config_env="$2"
    local config_host="$3"
    
    log_message "INFO" "🚀 Starting direct Node.js deployment strategy" \
        "Environment: $config_env, Port: $config_port"
    
    local deployment_start_time=$(date +%s)
    local deployment_result=()
    
    # Navigate to backend directory
    if cd "$BACKEND_DIR"; then
        log_message "INFO" "📂 Changed to backend directory" "Path: $BACKEND_DIR"
    else
        log_message "ERROR" "❌ Failed to navigate to backend directory" "Path: $BACKEND_DIR"
        return $EXIT_DEPLOYMENT_FAILED
    fi
    
    # Install production dependencies
    log_message "INFO" "📦 Installing production dependencies"
    if npm ci --only=production --no-audit --no-fund --silent; then
        log_message "INFO" "✅ Dependencies installed successfully"
    else
        log_message "ERROR" "❌ Failed to install dependencies" \
            "Check package.json and npm configuration"
        return $EXIT_DEPLOYMENT_FAILED
    fi
    
    # Configure environment variables
    export NODE_ENV="$config_env"
    export PORT="$config_port"
    export HOST="$config_host"
    export LOG_LEVEL="${VERBOSE_LOGGING:-false}" == "true" && echo "debug" || echo "info"
    
    log_message "INFO" "⚙️  Environment configured" \
        "NODE_ENV=$config_env, PORT=$config_port, HOST=$config_host"
    
    # Start Node.js server in background
    log_message "INFO" "🚀 Starting Node.js HTTP server"
    
    if [[ "$DRY_RUN_MODE" == "true" ]]; then
        log_message "INFO" "🏃 Dry run mode - would start: node server.js"
        local server_pid="DRY_RUN"
    else
        # Start server and capture PID
        nohup node server.js > "deployment-${deployment_start_time}.log" 2>&1 &
        local server_pid=$!
        
        # Allow server startup time
        sleep 3
        
        # Verify process is running
        if kill -0 "$server_pid" 2>/dev/null; then
            log_message "INFO" "✅ Node.js server started successfully" \
                "PID: $server_pid, Logs: deployment-${deployment_start_time}.log"
        else
            log_message "ERROR" "❌ Failed to start Node.js server" \
                "Check logs: deployment-${deployment_start_time}.log"
            return $EXIT_DEPLOYMENT_FAILED
        fi
    fi
    
    # Calculate deployment duration
    local deployment_end_time=$(date +%s)
    local deployment_duration=$((deployment_end_time - deployment_start_time))
    
    # Build deployment result object
    deployment_result=(
        "strategy=direct"
        "status=success" 
        "pid=$server_pid"
        "port=$config_port"
        "host=$config_host"
        "environment=$config_env"
        "duration=${deployment_duration}s"
        "log_file=deployment-${deployment_start_time}.log"
    )
    
    log_message "INFO" "🎉 Direct deployment completed successfully" \
        "Duration: ${deployment_duration}s, PID: $server_pid"
    
    # Export deployment info for health checking
    export DEPLOYMENT_INFO="$(IFS=,; echo "${deployment_result[*]}")"
    export DEPLOYMENT_PID="$server_pid"
    
    return 0
}

# Executes Docker containerized deployment strategy by building container image, 
# configuring container runtime, starting containerized application, and validating 
# deployment with container monitoring
deploy_docker() {
    local config_port="$1"
    local config_env="$2"
    local config_host="$3"
    
    log_message "INFO" "🐳 Starting Docker containerized deployment strategy" \
        "Environment: $config_env, Port: $config_port"
    
    local deployment_start_time=$(date +%s)
    local deployment_result=()
    local image_name="$CONTAINER_NAME_PREFIX-backend:latest"
    local container_name="$CONTAINER_NAME_PREFIX-backend-$(date +%s)"
    
    # Navigate to project root for build context
    if cd "$PROJECT_ROOT"; then
        log_message "INFO" "📂 Changed to project root for Docker build context"
    else
        log_message "ERROR" "❌ Failed to navigate to project root" 
        return $EXIT_DEPLOYMENT_FAILED
    fi
    
    # Build Docker image
    log_message "INFO" "🏗️  Building Docker image" "Name: $image_name"
    
    local build_args=(
        "--file" "$INFRASTRUCTURE_DIR/docker/Dockerfile.backend"
        "--tag" "$image_name"
        "--target" "final"
        "--build-arg" "NODE_VERSION=22"
        "--build-arg" "WORKDIR=/usr/src/app"
    )
    
    if [[ "$VERBOSE_LOGGING" == "true" ]]; then
        build_args+=("--progress=plain")
    else
        build_args+=("--quiet")
    fi
    
    if [[ "$DRY_RUN_MODE" == "true" ]]; then
        log_message "INFO" "🏃 Dry run mode - would build: docker build ${build_args[*]} ."
    else
        if docker build "${build_args[@]}" .; then
            log_message "INFO" "✅ Docker image built successfully" "Image: $image_name"
        else
            log_message "ERROR" "❌ Failed to build Docker image" \
                "Check Dockerfile and build context"
            return $EXIT_DEPLOYMENT_FAILED
        fi
    fi
    
    # Configure container runtime environment
    local container_args=(
        "--detach"
        "--name" "$container_name"
        "--hostname" "tutorial-backend"
        "--publish" "$config_host:$config_port:3000"
        "--env" "NODE_ENV=$config_env"
        "--env" "PORT=3000"
        "--env" "HOST=0.0.0.0"
        "--env" "LOG_LEVEL=$([ "$VERBOSE_LOGGING" == "true" ] && echo "debug" || echo "info")"
        "--env" "TUTORIAL_MODE=docker"
        "--env" "CONTAINER_NAME=$container_name"
        "--restart" "unless-stopped"
        "--memory" "128m"
        "--cpus" "0.5"
        "--init"
    )
    
    # Start Docker container
    log_message "INFO" "🚀 Starting Docker container" "Name: $container_name"
    
    if [[ "$DRY_RUN_MODE" == "true" ]]; then
        log_message "INFO" "🏃 Dry run mode - would run: docker run ${container_args[*]} $image_name"
        local container_id="DRY_RUN"
    else
        if container_id=$(docker run "${container_args[@]}" "$image_name"); then
            log_message "INFO" "✅ Docker container started successfully" \
                "Container ID: ${container_id:0:12}, Name: $container_name"
            
            # Wait for container to be ready
            sleep 5
            
            # Verify container is running
            if docker ps | grep -q "$container_name"; then
                log_message "INFO" "🔍 Container health verified" "Status: Running"
            else
                log_message "ERROR" "❌ Container failed to start properly" \
                    "Check container logs: docker logs $container_name"
                return $EXIT_DEPLOYMENT_FAILED
            fi
        else
            log_message "ERROR" "❌ Failed to start Docker container" \
                "Check Docker configuration and image availability"
            return $EXIT_DEPLOYMENT_FAILED
        fi
    fi
    
    # Calculate deployment duration
    local deployment_end_time=$(date +%s)
    local deployment_duration=$((deployment_end_time - deployment_start_time))
    
    # Build deployment result object
    deployment_result=(
        "strategy=docker"
        "status=success"
        "container_id=${container_id:0:12}"
        "container_name=$container_name"
        "image=$image_name"
        "port=$config_port"
        "host=$config_host"
        "environment=$config_env"
        "duration=${deployment_duration}s"
    )
    
    log_message "INFO" "🎉 Docker deployment completed successfully" \
        "Duration: ${deployment_duration}s, Container: ${container_id:0:12}"
    
    # Export deployment info for health checking
    export DEPLOYMENT_INFO="$(IFS=,; echo "${deployment_result[*]}")"
    export DEPLOYMENT_CONTAINER="$container_name"
    
    return 0
}

# Executes Docker Compose orchestrated deployment strategy by building services, 
# configuring multi-container architecture, starting service stack, and validating 
# comprehensive deployment health
deploy_docker_compose() {
    local config_port="$1"
    local config_env="$2"
    local config_host="$3"
    
    log_message "INFO" "🐙 Starting Docker Compose orchestrated deployment" \
        "Environment: $config_env, Port: $config_port"
    
    local deployment_start_time=$(date +%s)
    local deployment_result=()
    local compose_file="$INFRASTRUCTURE_DIR/docker/docker-compose.yml"
    local compose_project="$COMPOSE_PROJECT_NAME-$(date +%s)"
    
    # Navigate to Docker infrastructure directory
    if cd "$INFRASTRUCTURE_DIR/docker"; then
        log_message "INFO" "📂 Changed to Docker infrastructure directory"
    else
        log_message "ERROR" "❌ Failed to navigate to Docker directory"
        return $EXIT_DEPLOYMENT_FAILED
    fi
    
    # Validate Docker Compose configuration
    log_message "INFO" "🔍 Validating Docker Compose configuration"
    
    local compose_cmd="docker-compose"
    if ! command -v docker-compose >/dev/null 2>&1; then
        if docker compose version >/dev/null 2>&1; then
            compose_cmd="docker compose"
        else
            log_message "ERROR" "❌ Docker Compose not available"
            return $EXIT_DEPLOYMENT_FAILED
        fi
    fi
    
    local compose_args=(
        "--file" "docker-compose.yml"
        "--project-name" "$compose_project"
    )
    
    if [[ "$DRY_RUN_MODE" == "true" ]]; then
        log_message "INFO" "🏃 Dry run mode - would validate: $compose_cmd ${compose_args[*]} config"
    else
        if $compose_cmd "${compose_args[@]}" config >/dev/null 2>&1; then
            log_message "INFO" "✅ Docker Compose configuration validated"
        else
            log_message "ERROR" "❌ Invalid Docker Compose configuration" \
                "Check docker-compose.yml syntax and services"
            return $EXIT_DEPLOYMENT_FAILED
        fi
    fi
    
    # Build all required services
    log_message "INFO" "🏗️  Building Docker Compose services"
    
    if [[ "$DRY_RUN_MODE" == "true" ]]; then
        log_message "INFO" "🏃 Dry run mode - would build: $compose_cmd ${compose_args[*]} build"
    else
        local build_flags=()
        if [[ "$VERBOSE_LOGGING" != "true" ]]; then
            build_flags+=("--quiet")
        fi
        
        if $compose_cmd "${compose_args[@]}" build "${build_flags[@]}"; then
            log_message "INFO" "✅ Docker Compose services built successfully"
        else
            log_message "ERROR" "❌ Failed to build Docker Compose services" \
                "Check service definitions and build context"
            return $EXIT_DEPLOYMENT_FAILED
        fi
    fi
    
    # Configure orchestration environment
    export COMPOSE_PROJECT_NAME="$compose_project"
    export TUTORIAL_PORT="$config_port"
    export TUTORIAL_HOST="$config_host"
    export TUTORIAL_ENV="$config_env"
    export TUTORIAL_LOG_LEVEL=$([ "$VERBOSE_LOGGING" == "true" ] && echo "debug" || echo "info")
    
    log_message "INFO" "⚙️  Orchestration environment configured" \
        "Project: $compose_project, Environment: $config_env"
    
    # Start complete service stack
    log_message "INFO" "🚀 Starting Docker Compose service stack"
    
    if [[ "$DRY_RUN_MODE" == "true" ]]; then
        log_message "INFO" "🏃 Dry run mode - would start: $compose_cmd ${compose_args[*]} up -d"
    else
        local up_flags=("--detach")
        if [[ "$VERBOSE_LOGGING" != "true" ]]; then
            up_flags+=("--quiet-pull")
        fi
        
        if $compose_cmd "${compose_args[@]}" up "${up_flags[@]}"; then
            log_message "INFO" "✅ Docker Compose services started successfully"
            
            # Wait for services to be ready
            sleep 10
            
            # Verify service status
            local service_status=$($compose_cmd "${compose_args[@]}" ps --services --filter status=running)
            if [[ -n "$service_status" ]]; then
                log_message "INFO" "🔍 Service health verified" \
                    "Running services: $(echo "$service_status" | tr '\n' ' ')"
            else
                log_message "ERROR" "❌ No services are running" \
                    "Check service logs: $compose_cmd ${compose_args[*]} logs"
                return $EXIT_DEPLOYMENT_FAILED
            fi
        else
            log_message "ERROR" "❌ Failed to start Docker Compose services" \
                "Check service configuration and dependencies"
            return $EXIT_DEPLOYMENT_FAILED
        fi
    fi
    
    # Calculate deployment duration
    local deployment_end_time=$(date +%s)
    local deployment_duration=$((deployment_end_time - deployment_start_time))
    
    # Build deployment result object
    deployment_result=(
        "strategy=docker-compose"
        "status=success"
        "project=$compose_project"
        "services=$service_status"
        "port=$config_port"
        "host=$config_host"
        "environment=$config_env"
        "duration=${deployment_duration}s"
        "compose_file=$compose_file"
    )
    
    log_message "INFO" "🎉 Docker Compose deployment completed successfully" \
        "Duration: ${deployment_duration}s, Project: $compose_project"
    
    # Export deployment info for health checking
    export DEPLOYMENT_INFO="$(IFS=,; echo "${deployment_result[*]}")"
    export DEPLOYMENT_PROJECT="$compose_project"
    export COMPOSE_COMMAND="$compose_cmd"
    
    return 0
}

# =============================================================================
# HEALTH CHECK FUNCTIONS
# =============================================================================

# Executes comprehensive health check validation using integrated Node.js health-check.js 
# script with retry logic, timeout management, and educational health monitoring reporting
perform_health_checks() {
    local config_port="$1"
    local config_host="$2"
    local retries="$3"
    local delay="$4"
    
    log_message "INFO" "🏥 Starting comprehensive health check validation" \
        "Target: http://$config_host:$config_port$HEALTH_CHECK_ENDPOINT"
    
    local health_check_start_time=$(date +%s)
    local attempt=1
    local max_attempts=$retries
    
    # Construct health check URL
    local target_url="http://$config_host:$config_port$HEALTH_CHECK_ENDPOINT"
    
    while [[ $attempt -le $max_attempts ]]; do
        log_message "INFO" "🔍 Health check attempt $attempt/$max_attempts"
        
        # Wait before retry (except first attempt)
        if [[ $attempt -gt 1 ]]; then
            log_message "INFO" "⏱️  Waiting ${delay}s before retry"
            sleep "$delay"
        fi
        
        # Execute Node.js health check script
        if execute_nodejs_health_check "$target_url" "$DEPLOYMENT_TIMEOUT_VAL" "$attempt"; then
            local health_check_end_time=$(date +%s)
            local health_check_duration=$((health_check_end_time - health_check_start_time))
            
            log_message "INFO" "✅ Health check validation completed successfully" \
                "Duration: ${health_check_duration}s, Attempt: $attempt/$max_attempts"
            
            # Export health check results
            export HEALTH_CHECK_STATUS="PASS"
            export HEALTH_CHECK_DURATION="${health_check_duration}s"
            export HEALTH_CHECK_ATTEMPTS="$attempt"
            
            return 0
        else
            log_message "WARN" "⚠️  Health check attempt $attempt failed" \
                "Will retry if attempts remaining"
            attempt=$((attempt + 1))
        fi
    done
    
    # All health check attempts failed
    local health_check_end_time=$(date +%s)
    local health_check_duration=$((health_check_end_time - health_check_start_time))
    
    log_message "ERROR" "❌ Health check validation failed after $max_attempts attempts" \
        "Total duration: ${health_check_duration}s"
    
    # Export health check results
    export HEALTH_CHECK_STATUS="FAIL"
    export HEALTH_CHECK_DURATION="${health_check_duration}s"
    export HEALTH_CHECK_ATTEMPTS="$max_attempts"
    
    return $EXIT_HEALTH_CHECK_FAILED
}

# Executes the Node.js-based health check script with proper configuration, timeout 
# handling, and educational result parsing for comprehensive deployment validation
execute_nodejs_health_check() {
    local target_url="$1"
    local timeout="$2"
    local attempt="$3"
    
    local health_script="$BACKEND_DIR/scripts/health-check.js"
    local timeout_ms=$((timeout * 1000))
    
    log_message "INFO" "🩺 Executing Node.js health check script" \
        "Script: $health_script, Timeout: ${timeout}s"
    
    # Navigate to backend directory for script execution
    if cd "$BACKEND_DIR"; then
        log_message "DEBUG" "📂 Changed to backend directory for health check"
    else
        log_message "ERROR" "❌ Failed to navigate to backend directory"
        return 1
    fi
    
    # Prepare health check command arguments
    local health_args=(
        "--timeout" "$timeout_ms"
        "--endpoint" "$HEALTH_CHECK_ENDPOINT"
    )
    
    if [[ "$VERBOSE_LOGGING" == "true" ]]; then
        health_args+=("--verbose")
    fi
    
    # Execute health check script with timeout
    local health_output
    local health_exit_code
    
    if [[ "$DRY_RUN_MODE" == "true" ]]; then
        log_message "INFO" "🏃 Dry run mode - would execute: node scripts/health-check.js ${health_args[*]}"
        health_output="DRY RUN: Health check would be executed"
        health_exit_code=0
    else
        # Execute with timeout using built-in timeout command
        if command -v timeout >/dev/null 2>&1; then
            health_output=$(timeout "${timeout}s" node scripts/health-check.js "${health_args[@]}" 2>&1)
            health_exit_code=$?
        else
            # Fallback without timeout command
            health_output=$(node scripts/health-check.js "${health_args[@]}" 2>&1)
            health_exit_code=$?
        fi
    fi
    
    # Validate health check output
    if validate_health_check_output "$health_exit_code" "$health_output" ""; then
        log_message "INFO" "✅ Node.js health check passed" \
            "Exit code: $health_exit_code, Attempt: $attempt"
        return 0
    else
        log_message "WARN" "⚠️  Node.js health check failed" \
            "Exit code: $health_exit_code, Attempt: $attempt"
        
        # Log health check output for troubleshooting
        if [[ "$VERBOSE_LOGGING" == "true" && -n "$health_output" ]]; then
            log_message "DEBUG" "Health check output: $health_output"
        fi
        
        return 1
    fi
}

# Validates and parses output from Node.js health check script execution including 
# exit codes, output parsing, and educational result interpretation
validate_health_check_output() {
    local exit_code="$1"
    local stdout_output="$2"
    local stderr_output="$3"
    
    log_message "DEBUG" "🔍 Validating health check script output" \
        "Exit code: $exit_code"
    
    # Interpret health check exit code
    case "$exit_code" in
        0)
            log_message "INFO" "✅ Health check script succeeded" \
                "Server is responding correctly"
            
            # Parse successful output for metrics if available
            if [[ "$VERBOSE_LOGGING" == "true" && -n "$stdout_output" ]]; then
                log_message "DEBUG" "Health check success output: $stdout_output"
            fi
            
            return 0
            ;;
        1)
            log_message "WARN" "⚠️  Health check script reported server issues" \
                "Server may be unhealthy or unresponsive"
            ;;
        2)
            log_message "ERROR" "❌ Health check script configuration error" \
                "Invalid health check parameters or setup"
            ;;
        3)
            log_message "WARN" "⚠️  Health check script connection error" \
                "Unable to connect to server endpoint"
            ;;
        124)
            log_message "WARN" "⏱️  Health check script timeout" \
                "Server response time exceeded timeout threshold"
            ;;
        *)
            log_message "ERROR" "❓ Unexpected health check exit code: $exit_code" \
                "Unknown health check result"
            ;;
    esac
    
    # Log error output if available
    if [[ -n "$stderr_output" ]]; then
        log_message "DEBUG" "Health check error output: $stderr_output"
    fi
    
    # Educational interpretation based on exit code
    case "$exit_code" in
        0) 
            export HEALTH_CHECK_INTERPRETATION="Server is healthy and responding correctly"
            ;;
        1)
            export HEALTH_CHECK_INTERPRETATION="Server validation failed - check endpoint functionality"
            ;;
        2)
            export HEALTH_CHECK_INTERPRETATION="Configuration error - review health check parameters"
            ;;
        3)
            export HEALTH_CHECK_INTERPRETATION="Connection error - verify server is running and accessible"
            ;;
        *)
            export HEALTH_CHECK_INTERPRETATION="Unexpected health check result - investigate server status"
            ;;
    esac
    
    return $([ "$exit_code" -eq 0 ] && echo 0 || echo 1)
}

# =============================================================================
# DEPLOYMENT LIFECYCLE FUNCTIONS
# =============================================================================

# Gracefully stops running deployment using strategy-appropriate shutdown procedures 
# including process termination, container stopping, and service orchestration cleanup 
# with educational lifecycle demonstration
stop_deployment() {
    local strategy="$1"
    local deployment_info="$2"
    
    log_message "INFO" "🛑 Initiating graceful deployment shutdown" \
        "Strategy: $strategy"
    
    case "$strategy" in
        "direct")
            if [[ -n "${DEPLOYMENT_PID:-}" && "$DEPLOYMENT_PID" != "DRY_RUN" ]]; then
                log_message "INFO" "🔌 Stopping Node.js process" "PID: $DEPLOYMENT_PID"
                
                # Send SIGTERM for graceful shutdown
                if kill -TERM "$DEPLOYMENT_PID" 2>/dev/null; then
                    sleep 3
                    
                    # Check if process stopped gracefully
                    if ! kill -0 "$DEPLOYMENT_PID" 2>/dev/null; then
                        log_message "INFO" "✅ Node.js process stopped gracefully"
                    else
                        # Force kill if still running
                        log_message "WARN" "⚠️  Forcing process termination"
                        kill -KILL "$DEPLOYMENT_PID" 2>/dev/null || true
                    fi
                else
                    log_message "INFO" "ℹ️  Process already stopped or not found"
                fi
            fi
            ;;
            
        "docker")
            if [[ -n "${DEPLOYMENT_CONTAINER:-}" && "$DEPLOYMENT_CONTAINER" != "DRY_RUN" ]]; then
                log_message "INFO" "🐳 Stopping Docker container" "Name: $DEPLOYMENT_CONTAINER"
                
                if docker stop "$DEPLOYMENT_CONTAINER" >/dev/null 2>&1; then
                    log_message "INFO" "✅ Docker container stopped"
                    
                    # Remove container for cleanup
                    if docker rm "$DEPLOYMENT_CONTAINER" >/dev/null 2>&1; then
                        log_message "INFO" "🗑️  Docker container removed"
                    fi
                else
                    log_message "WARN" "⚠️  Container may not be running"
                fi
            fi
            ;;
            
        "docker-compose")
            if [[ -n "${DEPLOYMENT_PROJECT:-}" && "$DEPLOYMENT_PROJECT" != "DRY_RUN" ]]; then
                log_message "INFO" "🐙 Stopping Docker Compose services" "Project: $DEPLOYMENT_PROJECT"
                
                local compose_cmd="${COMPOSE_COMMAND:-docker-compose}"
                local compose_dir="$INFRASTRUCTURE_DIR/docker"
                
                if cd "$compose_dir"; then
                    local compose_args=(
                        "--file" "docker-compose.yml"
                        "--project-name" "$DEPLOYMENT_PROJECT"
                    )
                    
                    if $compose_cmd "${compose_args[@]}" down --remove-orphans >/dev/null 2>&1; then
                        log_message "INFO" "✅ Docker Compose services stopped"
                    else
                        log_message "WARN" "⚠️  Some services may still be running"
                    fi
                else
                    log_message "WARN" "⚠️  Could not navigate to Docker directory"
                fi
            fi
            ;;
    esac
    
    log_message "INFO" "✅ Deployment shutdown completed" \
        "Strategy: $strategy shutdown procedures executed"
    
    return 0
}

# Performs deployment rollback procedures for failed deployments including cleanup, 
# restoration of previous state, and educational failure recovery demonstration with 
# comprehensive logging
rollback_deployment() {
    local strategy="$1"
    local failure_context="$2"
    
    log_message "WARN" "🔄 Initiating deployment rollback procedures" \
        "Strategy: $strategy, Reason: $failure_context"
    
    # Stop any running deployment components
    stop_deployment "$strategy" "${DEPLOYMENT_INFO:-}"
    
    # Strategy-specific rollback procedures
    case "$strategy" in
        "direct")
            # Clean up log files and temporary artifacts
            if [[ -d "$BACKEND_DIR" ]]; then
                cd "$BACKEND_DIR"
                rm -f deployment-*.log nohup.out 2>/dev/null || true
                log_message "INFO" "🧹 Cleaned up direct deployment artifacts"
            fi
            ;;
            
        "docker")
            # Remove failed containers and images if requested
            if [[ "$CLEANUP_ARTIFACTS" == "true" ]]; then
                log_message "INFO" "🧹 Cleaning up Docker artifacts"
                
                # Remove containers matching pattern
                docker ps -a --filter "name=$CONTAINER_NAME_PREFIX" --format "{{.Names}}" | \
                    xargs -r docker rm -f 2>/dev/null || true
                
                # Remove images if no other containers using them
                docker image prune --filter "label=tutorial.name=nodejs-http-server" -f >/dev/null 2>&1 || true
            fi
            ;;
            
        "docker-compose")
            # Clean up compose project resources
            if [[ "$CLEANUP_ARTIFACTS" == "true" && -n "${DEPLOYMENT_PROJECT:-}" ]]; then
                local compose_cmd="${COMPOSE_COMMAND:-docker-compose}"
                local compose_dir="$INFRASTRUCTURE_DIR/docker"
                
                if cd "$compose_dir"; then
                    local compose_args=(
                        "--file" "docker-compose.yml"
                        "--project-name" "$DEPLOYMENT_PROJECT"
                    )
                    
                    log_message "INFO" "🧹 Cleaning up Docker Compose resources"
                    $compose_cmd "${compose_args[@]}" down --volumes --remove-orphans >/dev/null 2>&1 || true
                fi
            fi
            ;;
    esac
    
    # General cleanup
    cleanup ""
    
    log_message "INFO" "✅ Deployment rollback completed" \
        "Failed deployment components have been cleaned up"
    
    return 0
}

# =============================================================================
# REPORTING AND CLEANUP FUNCTIONS
# =============================================================================

# Generates comprehensive deployment report including strategy analysis, performance 
# metrics, configuration summary, health check results, and educational insights 
# for learning and troubleshooting
generate_deployment_report() {
    local deployment_result="$1"
    local config_summary="$2"
    
    log_message "INFO" "📊 Generating comprehensive deployment report"
    
    local report_timestamp=$(date -Iseconds)
    local report_file="deployment-report-$(date +%s).txt"
    
    cat > "$report_file" << EOF
================================================================================
Node.js Tutorial Deployment Report
================================================================================

Report Generated: $report_timestamp
Deployment Strategy: $DEPLOYMENT_STRATEGY
Environment: $DEPLOYMENT_ENVIRONMENT
Target: http://$DEPLOYMENT_HOST:$DEPLOYMENT_PORT

================================================================================
DEPLOYMENT CONFIGURATION
================================================================================

Strategy: $DEPLOYMENT_STRATEGY
Environment: $DEPLOYMENT_ENVIRONMENT  
Port: $DEPLOYMENT_PORT
Host: $DEPLOYMENT_HOST
Timeout: ${DEPLOYMENT_TIMEOUT_VAL}s
Health Check Retries: $HEALTH_RETRIES
Health Check Delay: ${HEALTH_DELAY}s
Verbose Logging: $VERBOSE_LOGGING
Dry Run Mode: $DRY_RUN_MODE
Cleanup Artifacts: $CLEANUP_ARTIFACTS

================================================================================
DEPLOYMENT RESULTS
================================================================================

$deployment_result

================================================================================
HEALTH CHECK RESULTS  
================================================================================

Status: ${HEALTH_CHECK_STATUS:-NOT_EXECUTED}
Duration: ${HEALTH_CHECK_DURATION:-N/A}
Attempts: ${HEALTH_CHECK_ATTEMPTS:-N/A}
Interpretation: ${HEALTH_CHECK_INTERPRETATION:-N/A}

================================================================================
EDUCATIONAL INSIGHTS
================================================================================

Deployment Strategy Benefits:
$(get_strategy_benefits "$DEPLOYMENT_STRATEGY")

Learning Outcomes Achieved:
- Infrastructure deployment automation experience
- Multi-strategy deployment pattern understanding
- Health checking and validation technique practice  
- Error handling and rollback procedure implementation
- CI/CD integration pattern demonstration

================================================================================
TROUBLESHOOTING GUIDANCE
================================================================================

Common Issues and Solutions:
$(get_troubleshooting_guidance_report "$DEPLOYMENT_STRATEGY")

================================================================================
NEXT STEPS
================================================================================

$(get_next_steps_guidance "$DEPLOYMENT_STRATEGY" "${HEALTH_CHECK_STATUS:-UNKNOWN}")

================================================================================
End of Report
================================================================================
EOF

    log_message "INFO" "📋 Deployment report generated" "File: $report_file"
    
    # Display summary to console
    if [[ "$VERBOSE_LOGGING" == "true" ]]; then
        log_message "INFO" "📖 Deployment Report Summary:"
        echo "Strategy: $DEPLOYMENT_STRATEGY | Status: ${HEALTH_CHECK_STATUS:-UNKNOWN}"
        echo "Duration: ${HEALTH_CHECK_DURATION:-N/A} | Attempts: ${HEALTH_CHECK_ATTEMPTS:-N/A}"
        echo "Report File: $report_file"
    fi
    
    echo "$report_file"
}

# Get strategy-specific benefits for report
get_strategy_benefits() {
    local strategy="$1"
    case "$strategy" in
        "direct")
            echo "- Fastest deployment with minimal resource usage"
            echo "- Direct system access for easy debugging"
            echo "- Ideal for local development and learning"
            ;;
        "docker")
            echo "- Environment isolation and consistency"
            echo "- Production-like containerized environment"
            echo "- Easy cleanup and resource management"
            ;;
        "docker-compose")
            echo "- Service orchestration and management"
            echo "- Scalable multi-service architecture"
            echo "- Production-ready deployment patterns"
            ;;
    esac
}

# Get troubleshooting guidance for report
get_troubleshooting_guidance_report() {
    local strategy="$1"
    case "$strategy" in
        "direct")
            echo "- Check Node.js installation: node --version"
            echo "- Verify port availability: lsof -i :$DEPLOYMENT_PORT"
            echo "- Review application logs for errors"
            ;;
        "docker")
            echo "- Verify Docker daemon: docker info"
            echo "- Check container logs: docker logs \$CONTAINER_NAME"
            echo "- Validate Dockerfile syntax and build context"
            ;;
        "docker-compose")
            echo "- Validate compose file: docker-compose config"
            echo "- Check service status: docker-compose ps"
            echo "- Review service logs: docker-compose logs"
            ;;
    esac
}

# Get next steps guidance based on deployment result
get_next_steps_guidance() {
    local strategy="$1"
    local health_status="$2"
    
    if [[ "$health_status" == "PASS" ]]; then
        echo "✅ Deployment successful - server is ready for tutorial usage"
        echo "- Access endpoint: http://$DEPLOYMENT_HOST:$DEPLOYMENT_PORT$HEALTH_CHECK_ENDPOINT"
        echo "- Expected response: \"$EXPECTED_RESPONSE\""
        echo "- Experiment with different HTTP methods and endpoints"
    else
        echo "❌ Deployment failed or health check issues detected"
        echo "- Review deployment logs and error messages"
        echo "- Check server configuration and prerequisites"
        echo "- Use --verbose flag for detailed troubleshooting information"
    fi
}

# Cleans up temporary files, deployment artifacts, and resources created during 
# deployment execution with educational logging about resource management and 
# cleanup procedures
cleanup() {
    local deployment_context="$1"
    
    log_message "INFO" "🧹 Starting deployment cleanup procedures"
    
    # Clean up temporary log files
    if [[ -d "$BACKEND_DIR" ]]; then
        cd "$BACKEND_DIR"
        local temp_files=(deployment-*.log nohup.out .deployment-*)
        for pattern in "${temp_files[@]}"; do
            if ls $pattern 1> /dev/null 2>&1; then
                rm -f $pattern
                log_message "DEBUG" "Removed temporary files: $pattern"
            fi
        done
    fi
    
    # Clean up Docker resources if cleanup requested
    if [[ "$CLEANUP_ARTIFACTS" == "true" ]]; then
        log_message "INFO" "🐳 Cleaning up Docker resources"
        
        # Remove stopped containers
        docker container prune --filter "label=tutorial.name=nodejs-http-server" -f >/dev/null 2>&1 || true
        
        # Remove unused images
        docker image prune --filter "label=tutorial.name=nodejs-http-server" -f >/dev/null 2>&1 || true
        
        # Remove unused volumes
        docker volume prune --filter "label=tutorial.component=storage" -f >/dev/null 2>&1 || true
        
        # Remove unused networks
        docker network prune --filter "label=tutorial.component=networking" -f >/dev/null 2>&1 || true
    fi
    
    log_message "INFO" "✅ Deployment cleanup completed" \
        "Temporary resources and artifacts have been cleaned up"
}

# =============================================================================
# MAIN ORCHESTRATION FUNCTION
# =============================================================================

# Main deployment orchestration function that processes command line arguments, 
# validates prerequisites, executes deployment strategies, and performs comprehensive 
# health checking with educational logging and error handling
main() {
    local script_start_time=$(date +%s)
    
    # Parse and validate command line arguments
    parse_arguments "$@"
    
    # Display help if requested
    if [[ "$SHOW_HELP" == "true" ]]; then
        display_help
        exit $EXIT_SUCCESS
    fi
    
    # Display educational deployment banner
    display_banner "$DEPLOYMENT_STRATEGY" "$DEPLOYMENT_ENVIRONMENT" \
        "$DEPLOYMENT_PORT" "$DEPLOYMENT_HOST"
    
    # Validate deployment prerequisites
    log_message "INFO" "🔍 Starting prerequisite validation"
    if ! check_prerequisites "$DEPLOYMENT_STRATEGY" "$DEPLOYMENT_PORT"; then
        log_message "ERROR" "❌ Prerequisites validation failed" \
            "Cannot proceed with deployment"
        exit $EXIT_PREREQUISITE_FAILED
    fi
    
    # Execute deployment strategy
    log_message "INFO" "🚀 Executing $DEPLOYMENT_STRATEGY deployment strategy"
    
    local deployment_success=false
    local deployment_result=""
    
    case "$DEPLOYMENT_STRATEGY" in
        "direct")
            if deploy_direct "$DEPLOYMENT_PORT" "$DEPLOYMENT_ENVIRONMENT" "$DEPLOYMENT_HOST"; then
                deployment_success=true
                deployment_result="Direct deployment completed successfully"
            else
                log_message "ERROR" "❌ Direct deployment failed"
                rollback_deployment "direct" "deployment_execution_failed"
                exit $EXIT_DEPLOYMENT_FAILED
            fi
            ;;
            
        "docker")
            if deploy_docker "$DEPLOYMENT_PORT" "$DEPLOYMENT_ENVIRONMENT" "$DEPLOYMENT_HOST"; then
                deployment_success=true  
                deployment_result="Docker deployment completed successfully"
            else
                log_message "ERROR" "❌ Docker deployment failed"
                rollback_deployment "docker" "deployment_execution_failed"
                exit $EXIT_DEPLOYMENT_FAILED
            fi
            ;;
            
        "docker-compose")
            if deploy_docker_compose "$DEPLOYMENT_PORT" "$DEPLOYMENT_ENVIRONMENT" "$DEPLOYMENT_HOST"; then
                deployment_success=true
                deployment_result="Docker Compose deployment completed successfully"
            else
                log_message "ERROR" "❌ Docker Compose deployment failed"
                rollback_deployment "docker-compose" "deployment_execution_failed"  
                exit $EXIT_DEPLOYMENT_FAILED
            fi
            ;;
            
        *)
            log_message "ERROR" "❌ Unsupported deployment strategy: $DEPLOYMENT_STRATEGY"
            exit $EXIT_INVALID_ARGS
            ;;
    esac
    
    # Perform comprehensive health checking
    if [[ "$deployment_success" == "true" && "$DRY_RUN_MODE" != "true" ]]; then
        log_message "INFO" "🏥 Starting comprehensive health check validation"
        
        if perform_health_checks "$DEPLOYMENT_PORT" "$DEPLOYMENT_HOST" \
            "$HEALTH_RETRIES" "$HEALTH_DELAY"; then
            log_message "INFO" "✅ Health check validation passed"
        else
            log_message "ERROR" "❌ Health check validation failed"
            
            if [[ "$FORCE_DEPLOYMENT" != "true" ]]; then
                log_message "ERROR" "🛑 Deployment failed health validation"
                rollback_deployment "$DEPLOYMENT_STRATEGY" "health_check_failed"
                exit $EXIT_HEALTH_CHECK_FAILED
            else
                log_message "WARN" "⚠️  Proceeding despite health check failure (force mode)"
            fi
        fi
    else
        log_message "INFO" "⏭️  Skipping health checks" \
            "Dry run mode or deployment failed"
    fi
    
    # Generate comprehensive deployment report
    local report_file
    report_file=$(generate_deployment_report "$deployment_result" \
        "Strategy: $DEPLOYMENT_STRATEGY, Environment: $DEPLOYMENT_ENVIRONMENT")
    
    # Calculate total script execution time
    local script_end_time=$(date +%s)
    local total_duration=$((script_end_time - script_start_time))
    
    # Final deployment summary with educational insights
    log_message "INFO" "🎉 Deployment script completed successfully" \
        "Total duration: ${total_duration}s"
    
    log_message "INFO" "📚 Educational Summary:" \
        "Deployment automation demonstrated infrastructure best practices"
    
    if [[ "$DRY_RUN_MODE" != "true" ]]; then
        log_message "INFO" "🌐 Server Access Information:"
        log_message "INFO" "   • URL: http://$DEPLOYMENT_HOST:$DEPLOYMENT_PORT$HEALTH_CHECK_ENDPOINT"
        log_message "INFO" "   • Expected Response: \"$EXPECTED_RESPONSE\""
        log_message "INFO" "   • Strategy: $DEPLOYMENT_STRATEGY deployment"
        
        # Show cleanup instructions
        case "$DEPLOYMENT_STRATEGY" in
            "direct")
                log_message "INFO" "🛑 To stop server: kill ${DEPLOYMENT_PID:-\$PID} or Ctrl+C if running in foreground"
                ;;
            "docker")
                log_message "INFO" "🛑 To stop container: docker stop ${DEPLOYMENT_CONTAINER:-\$CONTAINER_NAME}"
                ;;
            "docker-compose")  
                log_message "INFO" "🛑 To stop services: docker-compose --project-name ${DEPLOYMENT_PROJECT:-\$PROJECT} down"
                ;;
        esac
    fi
    
    # Cleanup if requested
    if [[ "$CLEANUP_ARTIFACTS" == "true" ]]; then
        cleanup "main_completion"
    fi
    
    log_message "INFO" "📊 Deployment report: $report_file"
    
    # Export final status for external integration
    export FINAL_DEPLOYMENT_STATUS="SUCCESS"
    export FINAL_HEALTH_CHECK_STATUS="${HEALTH_CHECK_STATUS:-SKIPPED}"
    export FINAL_REPORT_FILE="$report_file"
    
    exit $EXIT_SUCCESS
}

# =============================================================================
# SCRIPT EXECUTION AND ERROR HANDLING
# =============================================================================

# Trap for cleanup on script termination
trap 'log_message "WARN" "🛑 Deployment script interrupted"; cleanup "script_interrupted"; exit $EXIT_FAILURE' INT TERM

# Trap for unexpected errors
trap 'log_message "ERROR" "💥 Unexpected error at line $LINENO"; cleanup "unexpected_error"; exit $EXIT_FAILURE' ERR

# Execute main function with all command line arguments
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

# =============================================================================
# END OF DEPLOYMENT SCRIPT
# =============================================================================