---
name: 🐛 Bug Report
about: Create a report to help us improve the Node.js tutorial application
title: '[BUG] Brief description of the issue'
labels: ['bug', 'needs-triage', 'help wanted']
assignees: []
---

## Bug Summary

**Bug Description:**
A clear and concise description of what the bug is and how it affects the tutorial learning experience.

**Impact Level:** (Select one)
- [ ] 🔴 Critical (Tutorial cannot be completed / Server won't start)
- [ ] 🟡 High (Major functionality broken / Learning objectives compromised)
- [ ] 🟠 Medium (Minor functionality issue / Confusing behavior)
- [ ] 🟢 Low (Documentation issue / Minor inconsistency)

**Affected Learning Objective:** (Select all that apply)
- [ ] Understanding Node.js built-in HTTP module usage
- [ ] Learning event-driven programming patterns
- [ ] Demonstrating HTTP request-response cycles
- [ ] Teaching development workflow and tooling
- [ ] Understanding testing and debugging practices
- [ ] Other: _______________

## Environment Information

**System Environment:**
- Operating System: [e.g., Windows 11, macOS 14, Ubuntu 22.04]
- Architecture: [e.g., x64, arm64]
- Terminal/Shell: [e.g., PowerShell, Bash, Zsh]

**Node.js Environment:**
- Node.js Version: [Run `node --version`]
- NPM Version: [Run `npm --version`]
- Installation Method: [e.g., Official installer, nvm, Homebrew]

**Application Environment:**
- Tutorial Application Version: [Check package.json version]
- Installation Method: [e.g., Git clone, ZIP download]
- Working Directory: [Full path to project folder]
- Port Configuration: [Default 3000 or custom port]

**Dependencies:**
- Are dependencies installed? [Run `npm list` in src/backend/]
- Any dependency warnings? [Copy output from `npm install`]
- Lock file present? [Check if package-lock.json exists]

## Reproduction Steps

**Steps to Reproduce:**
1. [First step - e.g., Clone the repository]
2. [Second step - e.g., Navigate to src/backend directory]
3. [Third step - e.g., Run npm install]
4. [Fourth step - e.g., Run npm start]
5. [Specific action that triggers the bug]

**Command Line Steps:**
```bash
# Paste the exact commands you ran here
# Include the full output, especially error messages
```

**Reproduction Consistency:**
- [ ] This bug happens every time
- [ ] This bug happens sometimes (intermittent)
- [ ] This bug happened only once
- [ ] I haven't tried to reproduce it multiple times

**Minimal Reproduction:**
Can you reproduce this bug with a fresh clone of the repository?
- [ ] Yes, fresh clone reproduces the issue
- [ ] No, works fine with fresh clone
- [ ] Haven't tested with fresh clone
- [ ] Not applicable

## Expected vs Actual Behavior

**Expected Behavior:**
A clear and concise description of what you expected to happen based on the tutorial documentation.

For the '/hello' endpoint specifically:
- Expected Response: `Hello world`
- Expected Status Code: `200 OK`
- Expected Content-Type: `text/plain`
- Expected Server Startup: Server should start and listen on port 3000

**Actual Behavior:**
A clear and concise description of what actually happened.

**Error Messages:**
```
# Paste any error messages, stack traces, or unexpected output here
# Include both console output and any browser error messages
```

**Screenshots/Output:** (if applicable)
<!-- Add screenshots of error messages, browser output, or terminal output -->

**Logs:** (if available)
```
# Include relevant log output from the application
# Check for any log files or additional debug output
```

## Component Analysis

**Affected Components:** (Check all that seem relevant)
- [ ] 🌐 HTTP Server (`src/backend/lib/server/http-server.js`)
- [ ] 🔀 Request Router (`src/backend/lib/router/request-router.js`)
- [ ] 👋 Hello Handler (`src/backend/lib/handlers/hello-handler.js`)
- [ ] 📤 Response Generator (`src/backend/lib/response/response-generator.js`)
- [ ] ⚙️ Configuration (`src/backend/lib/config/`)
- [ ] 🛠️ Utilities (`src/backend/lib/utils/`)
- [ ] 🔧 Middleware (`src/backend/lib/middleware/`)
- [ ] 📝 Scripts (`src/backend/scripts/`)
- [ ] 📦 Package Configuration (`package.json`, `package-lock.json`)
- [ ] 🔧 Development Tools (nodemon, ESLint, Jest)
- [ ] 🗃️ Other: _______________

**Error Location Analysis:**
- Where did the error first appear? (Browser, Terminal, Specific file)
- Does the error happen during startup, request processing, or response generation?
- Are there any related warnings or messages in other components?

**Network Analysis:** (for HTTP-related issues)
- Can you access http://localhost:3000 in browser?
- What happens when you visit http://localhost:3000/hello?
- Does `curl http://localhost:3000/hello` work from command line?
- Is the port 3000 available? (Check with `netstat` or `lsof`)

## Troubleshooting Attempted

**Troubleshooting Steps Tried:** (Check all that apply)
- [ ] Restarted the application (`Ctrl+C` then `npm start`)
- [ ] Reinstalled dependencies (`rm -rf node_modules package-lock.json && npm install`)
- [ ] Tried different Node.js version
- [ ] Checked if port 3000 is available (`netstat -an | grep 3000`)
- [ ] Tested with fresh clone of repository
- [ ] Cleared npm cache (`npm cache clean --force`)
- [ ] Checked for antivirus/firewall interference
- [ ] Ran application health check (`npm run health`)
- [ ] Checked application logs for additional errors
- [ ] Tried running with elevated permissions (sudo/admin)
- [ ] Tested on different network/computer
- [ ] Other: _______________

**Results of Troubleshooting:**
- Which steps helped or provided more information?
- Which steps didn't change anything?
- Any new error messages discovered?

**Workarounds Found:**
- Have you found any temporary workarounds?
- Can you complete the tutorial despite this bug?
- Are there alternative approaches that work?

## Learning Impact

**Educational Impact:** (Select all that apply)
- [ ] 📚 Cannot complete tutorial as written
- [ ] 🤔 Creates confusion about Node.js concepts
- [ ] 📖 Conflicts with documentation or README
- [ ] 🎯 Prevents understanding of learning objectives
- [ ] 🛠️ Interferes with development workflow learning
- [ ] 🧪 Breaks testing or quality assurance examples
- [ ] 📊 No significant educational impact

**Learning Context:**
- Are you following the tutorial step-by-step or exploring independently?
- Is this your first time with Node.js development?
- What is your experience level with web development?
- Are you using this for a course, self-study, or teaching others?

**Educational Confusion:**
- Does this bug make it unclear how Node.js HTTP servers work?
- Are there concepts that are harder to understand because of this issue?
- Would fixing this bug improve the learning experience significantly?

**Documentation Discrepancy:**
- Does the observed behavior differ from what's documented?
- Are there README instructions that don't work as written?
- Should documentation be updated along with any bug fix?

## Additional Context

**Additional Information:**
- When did this issue first appear?
- Does this happen with other similar applications?
- Any recent system updates or changes?
- Working with any corporate firewalls or proxies?
- Any other relevant environmental factors?

**Related Issues:**
- Link to any similar issues or discussions
- Reference to relevant Stack Overflow posts
- Related GitHub issues in other projects

**Log Files:** (if available)
```
# Include contents of any relevant log files
# Check src/backend/logs/ directory if it exists
```

**Configuration Files:**
```json
# Include relevant configuration if modified
# .env file contents (remove sensitive information)
# Any custom settings or modifications
```

**Network Information:** (for connectivity issues)
- Are you behind a corporate firewall?
- Using any VPN or proxy settings?
- Any unusual network configuration?
- IPv4 vs IPv6 connectivity issues?

## Verification Checklist

**Before submitting this bug report:** (Check all that apply)
- [ ] I have searched existing issues to avoid duplicates
- [ ] I have read the README and followed the setup instructions exactly
- [ ] I have verified my Node.js version meets requirements (18+)
- [ ] I have tried the basic troubleshooting steps listed above
- [ ] I have included complete environment information
- [ ] I have provided detailed reproduction steps
- [ ] I have included relevant error messages and output
- [ ] I understand this is an educational project with specific scope
- [ ] I am willing to provide additional information if requested
- [ ] I have considered whether this affects the educational objectives
- [ ] I have checked if this issue occurs with a fresh repository clone

**Submission Readiness:**
- [ ] All required sections are completed
- [ ] Error messages and output are included
- [ ] Reproduction steps are clear and detailed
- [ ] Environment information is complete
- [ ] I am prepared to test potential fixes or provide more information