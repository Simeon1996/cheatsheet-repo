import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@cheatsheet.dev" },
    update: {},
    create: {
      email: "admin@cheatsheet.dev",
      name: "Admin",
      hashedPassword: "not-a-real-password",
    },
  });

  await prisma.category.deleteMany({
    where: { name: "Claude Code", userId: admin.id },
  });

  const result = await prisma.category.create({
    data: {
      name: "Claude Code",
      icon: "🤖",
      color: "violet",
      description: "Claude Code CLI reference: slash commands, keyboard shortcuts, permissions, hooks, CLAUDE.md, MCP, and settings.",
      userId: admin.id,
      isPublic: true,
      snippets: {
        create: [
          {
            title: "CLI Flags & Invocation",
            description: "Core flags for invoking Claude Code from the terminal.",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "bash",
                  label: "Basic usage",
                  content: `# Interactive session
claude

# Start with an initial prompt
claude "explain this codebase"

# Non-interactive (print mode) — query then exit
claude -p "summarize README.md"

# Pipe content
cat error.log | claude -p "what's wrong here?"

# Continue most recent conversation
claude -c

# Resume a specific session by ID or name
claude -r "my-session-name"

# Update Claude Code
claude update`,
                },
                {
                  order: 1,
                  language: "bash",
                  label: "Model & behaviour flags",
                  content: `# Set model
claude --model claude-opus-4-6
claude --model sonnet
claude --model opus

# Set effort level (Opus 4.6 only)
claude --effort low|medium|high|max

# Set permission mode at startup
claude --permission-mode default|acceptEdits|plan|auto|bypassPermissions

# Restrict available tools
claude --tools "Read,Grep,Glob"    # only these tools
claude --tools ""                  # disable all tools

# Pre-approve tools
claude --allowedTools "Bash(npm run *)" --allowedTools "Read"

# Block tools
claude --disallowedTools "Bash"

# Limit agentic turns
claude --max-turns 10

# Max spend (print mode)
claude --max-budget-usd 0.50`,
                },
                {
                  order: 2,
                  language: "bash",
                  label: "System prompt & output flags",
                  content: `# Replace system prompt entirely
claude --system-prompt "You are a Python expert."

# Append to default system prompt
claude --append-system-prompt "Always respond in bullet points."

# Load system prompt from file
claude --system-prompt-file prompt.txt

# Output format (print mode)
claude -p "query" --output-format text
claude -p "query" --output-format json
claude -p "query" --output-format stream-json

# Add additional working directories
claude --add-dir /path/to/other/repo

# Run in isolated git worktree
claude --worktree my-feature

# Name a session
claude -n "auth-refactor"

# Load settings from file or inline JSON
claude --settings .claude/custom-settings.json`,
                },
              ],
            },
          },
          {
            title: "Slash Commands",
            description: "Interactive commands typed during a Claude Code session.",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "All slash commands",
                  content: `COMMAND             DESCRIPTION
──────────────────────────────────────────────────────────────────
/help               Show all available commands
/clear              Clear conversation and start a fresh session
/compact            Summarize conversation to free context window
/memory             View and edit CLAUDE.md and auto-memory files
/config             Open settings UI (model, effort, editor, etc.)
/permissions        View and manage permission rules
/cost               Show token usage and cost for this session
/doctor             Diagnose setup issues and config problems
/init               Generate or improve CLAUDE.md for the project
/rename <name>      Rename the current session
/resume             Show session picker to switch sessions
/review             Run the code review skill
/skills             List all available skills
/agents             List available subagents
/add-dir <path>     Add a working directory mid-session
/theme              Choose display theme
/terminal-setup     Configure terminal for multiline input
/rewind             Undo recent changes or restore checkpoint
/btw                Ask a side question without adding to history
/debug-hooks        Troubleshoot hook configuration
/fast               Toggle fast mode (faster Opus 4.6 output)

TIP: Type / alone to see all commands with fuzzy filtering.
     Type ! to enter bash mode and run shell commands directly.`,
                },
              ],
            },
          },
          {
            title: "Keyboard Shortcuts",
            description: "Keyboard shortcuts available in interactive Claude Code sessions.",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Session controls",
                  content: `SHORTCUT              ACTION
──────────────────────────────────────────────────────────────────
Ctrl+C                Cancel current input or stop generation
Ctrl+D                Exit the session
Escape (×2)           Rewind or summarize conversation
Shift+Tab / Alt+M     Cycle through permission modes
Option+P / Alt+P      Switch model
Option+O / Alt+O      Toggle fast mode
Option+T / Alt+T      Toggle extended thinking
Ctrl+B                Background a running task
Ctrl+T                Toggle background task list
Ctrl+X, Ctrl+K        Kill all background agents (press twice)
Ctrl+O                Toggle transcript viewer`,
                },
                {
                  order: 1,
                  language: "text",
                  label: "Input & editing",
                  content: `SHORTCUT              ACTION
──────────────────────────────────────────────────────────────────
Up / Down arrows      Navigate command history
Ctrl+R                Reverse search command history
Ctrl+K                Delete from cursor to end of line
Ctrl+U                Delete from cursor to start of line
Ctrl+Y                Paste deleted text
Alt+Y                 Cycle paste history (after Ctrl+Y)
Alt+B                 Move cursor back one word
Alt+F                 Move cursor forward one word
Ctrl+G / Ctrl+X+E     Open input in $EDITOR
Ctrl+V / Cmd+V        Paste image from clipboard (terminal-dependent)

MULTILINE INPUT
  \\ + Enter            Works in all terminals
  Option+Enter          macOS default
  Shift+Enter           iTerm2, WezTerm, Ghostty, Kitty
  Ctrl+J                Line feed character

VOICE INPUT
  Hold Space            Push-to-talk dictation (when enabled)`,
                },
              ],
            },
          },
          {
            title: "CLAUDE.md — Persistent Instructions",
            description: "How CLAUDE.md files work, where they live, and what to put in them.",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "File locations & load order",
                  content: `SCOPE          LOCATION                           SHARED VIA GIT?
──────────────────────────────────────────────────────────────────
Organization   /etc/claude-code/CLAUDE.md         Yes (all users)
User           ~/.claude/CLAUDE.md                No (this machine)
Project        ./CLAUDE.md  or  ./.claude/CLAUDE.md  Yes
Local          ./CLAUDE.local.md                  No (gitignored)
Rules          ./.claude/rules/*.md               Yes (path-scoped)

LOAD BEHAVIOUR
  • Loads from working directory upward through ancestors
  • Nested CLAUDE.md files in subdirectories load on demand
  • .claude/rules/ files load when a matching file is opened
  • All loaded files are concatenated into the system prompt

GENERATE IT
  /init   — Claude reads the project and writes a good CLAUDE.md`,
                },
                {
                  order: 1,
                  language: "markdown",
                  label: "CLAUDE.md structure & imports",
                  content: `# Project Instructions

## Build & Test Commands
- Build: \`npm run build\`
- Test:  \`npm test\`
- Lint:  \`npm run lint\`

## Code Conventions
- Use TypeScript strict mode
- Prefer named exports over default exports
- Always handle errors explicitly

## Architecture Notes
- API routes live in src/app/api/
- Database access via Prisma in src/lib/db.ts

## What to Avoid
- Do not modify prisma/schema.prisma without asking
- Never commit .env files

# File Imports (load external files into context)
@README.md
@package.json
@src/lib/db.ts

# Path-scoped rule frontmatter (in .claude/rules/api.md)
# ---
# paths:
#   - "src/app/api/**/*.ts"
# ---`,
                },
              ],
            },
          },
          {
            title: "Permissions System",
            description: "How to allow, ask, and deny tool usage — patterns and permission modes.",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Permission rule patterns",
                  content: `PATTERN                             EFFECT
──────────────────────────────────────────────────────────────────
Bash                                All Bash commands
Bash(npm run build)                 Exact command match
Bash(npm run *)                     Prefix/glob match
Bash(git * main)                    Wildcard anywhere
Read(./.env)                        Specific file
Read(/src/**)                       Directory recursively
Edit(/docs/**)                      Edit files matching pattern
WebFetch(domain:example.com)        Fetch from domain
mcp__puppeteer                      Any tool from server
mcp__puppeteer__puppeteer_navigate  Specific MCP tool
Agent(Explore)                      Named subagent

EVALUATION ORDER (deny wins)
  1. permissions.deny   ← highest priority
  2. permissions.ask
  3. permissions.allow  ← lowest priority

SETTINGS.JSON EXAMPLE
  "permissions": {
    "allow": ["Bash(npm run *)", "Read(**)", "Edit(src/**)"],
    "ask":   ["Bash(git push *)"],
    "deny":  ["Bash(rm -rf *)"]
  }`,
                },
                {
                  order: 1,
                  language: "text",
                  label: "Permission modes",
                  content: `MODE                BEHAVIOUR
──────────────────────────────────────────────────────────────────
default             Prompt on first use of each tool
acceptEdits         Auto-accept file edits; prompt for Bash
plan                Read-only analysis — no modifications
auto                Auto-approve with safety heuristics
dontAsk             Auto-deny unless tool is pre-approved
bypassPermissions   Skip all prompts (use with caution)

CYCLE MODES INTERACTIVELY
  Shift+Tab or Alt+M to rotate through modes mid-session

SET MODE AT STARTUP
  claude --permission-mode auto

SET IN SETTINGS
  "defaultMode": "acceptEdits"`,
                },
              ],
            },
          },
          {
            title: "Hooks",
            description: "Lifecycle hooks that run before/after tool calls to enforce policies or trigger side effects.",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Hook events & types",
                  content: `HOOK EVENT         WHEN IT FIRES
──────────────────────────────────────────────────────────────────
PreToolUse         Before any tool executes
PostToolUse        After a tool completes
InstructionsLoaded After all CLAUDE.md files have loaded
PermissionDenied   When auto mode denies an action

HOOK TYPES
  command   Shell command — receives JSON on stdin, decision via exit code
  http      HTTP POST to a URL endpoint
  prompt    Single-turn Claude eval returning yes/no
  agent     Spawn subagent with full tool access to verify conditions

EXIT CODE SEMANTICS (command hooks)
  0    Success — process JSON output from stdout
  2    Blocking — block the action, show stderr to user
  1+   Non-blocking — log error, execution continues

COMMON FIELDS (all hook types)
  if             Permission rule filter: "Bash(git *)"
  timeout        Seconds before cancelling
  statusMessage  Custom spinner label shown to user
  once           Run only once per session (skills)`,
                },
                {
                  order: 1,
                  language: "json",
                  label: "Hook configuration examples",
                  content: `// In .claude/settings.json → "hooks" key

{
  "hooks": {
    "PreToolUse": [
      {
        "if": "Bash(git push *)",
        "type": "command",
        "command": "bash .claude/hooks/check-branch.sh",
        "statusMessage": "Checking branch policy…",
        "timeout": 10
      }
    ],
    "PostToolUse": [
      {
        "if": "Edit(**/*.ts)",
        "type": "command",
        "command": "npx tsc --noEmit",
        "statusMessage": "Type-checking…"
      }
    ],
    "InstructionsLoaded": [
      {
        "type": "command",
        "command": "echo 'Session started' >> ~/.claude/session.log",
        "once": true
      }
    ]
  }
}`,
                },
                {
                  order: 2,
                  language: "bash",
                  label: "Example hook script (PreToolUse)",
                  content: `#!/usr/bin/env bash
# .claude/hooks/check-branch.sh
# Blocks git push to main unless on a feature branch

INPUT=$(cat)   # JSON from stdin
COMMAND=$(echo "\$INPUT" | jq -r '.command // ""')

if echo "\$COMMAND" | grep -q "git push.*main"; then
  BRANCH=$(git rev-parse --abbrev-ref HEAD)
  if [ "\$BRANCH" = "main" ]; then
    echo "Direct push to main is not allowed. Use a feature branch." >&2
    exit 2   # Block the action
  fi
fi

exit 0  # Allow`,
                },
              ],
            },
          },
          {
            title: "MCP — Model Context Protocol",
            description: "Connecting external tools and data sources via MCP servers.",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "bash",
                  label: "MCP CLI commands",
                  content: `# Open MCP configuration menu
claude mcp

# Install a plugin from the marketplace
claude plugin install @anthropic/puppeteer

# List installed plugins
claude plugins

# Load MCP config from a file at startup
claude --mcp-config .claude/mcp-servers.json

# Use ONLY the specified servers (ignore others)
claude --mcp-config .claude/mcp-servers.json --strict-mcp-config`,
                },
                {
                  order: 1,
                  language: "json",
                  label: "MCP server config format",
                  content: `// .claude/mcp-servers.json
{
  "mcpServers": {
    "puppeteer": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"],
      "env": {}
    },
    "postgres": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://localhost/mydb"
      }
    },
    "my-api": {
      "type": "sse",
      "url": "https://my-mcp-server.example.com/sse",
      "headers": {
        "Authorization": "Bearer \${MY_API_KEY}"
      }
    }
  }
}`,
                },
                {
                  order: 2,
                  language: "text",
                  label: "MCP permission patterns",
                  content: `MCP TOOL PERMISSION PATTERNS

  mcp__<server>                    Any tool from that server
  mcp__<server>__<tool>            Specific tool from server

EXAMPLES (in permissions.allow / deny)
  "mcp__puppeteer"                     All puppeteer tools
  "mcp__puppeteer__puppeteer_navigate" Only the navigate tool
  "mcp__postgres__query"               Only postgres query tool

ENVIRONMENT VARIABLES IN MCP CONFIG
  Values like "\${MY_SECRET}" in the config JSON are expanded
  from the environment when Claude Code loads the config.`,
                },
              ],
            },
          },
          {
            title: "Settings & Environment Variables",
            description: "settings.json fields and environment variables that control Claude Code behaviour.",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Settings precedence",
                  content: `SETTINGS LOAD ORDER (last wins, except deny)
  1. Managed/org settings        (cannot be overridden)
  2. CLI flags                   (session only)
  3. .claude/settings.local.json (local project, gitignored)
  4. .claude/settings.json       (shared project, in git)
  5. ~/.claude/settings.json     (user-wide default)

FILE LOCATIONS
  User settings:    ~/.claude/settings.json
  Project shared:   .claude/settings.json
  Project local:    .claude/settings.local.json`,
                },
                {
                  order: 1,
                  language: "json",
                  label: "settings.json reference",
                  content: `{
  // Model & performance
  "model": "claude-sonnet-4-6",
  "effortLevel": "high",             // low | medium | high | max
  "defaultMode": "acceptEdits",      // default | acceptEdits | plan | auto

  // Permissions
  "permissions": {
    "allow":  ["Bash(npm run *)", "Read(**)", "Edit(src/**)"],
    "ask":    ["Bash(git push *)"],
    "deny":   ["Bash(rm -rf *)"],
    "disableBypassPermissionsMode": false,
    "disableAutoMode": false
  },

  // Directories
  "additionalDirectories": ["/shared/utils"],
  "autoMemoryDirectory": "~/.claude/projects/myapp/memory",
  "claudeMdExcludes": ["**/node_modules/**"],

  // Features
  "autoMemoryEnabled": true,
  "enabledPlugins": ["@anthropic/puppeteer"],

  // Environment variable overrides
  "env": {
    "NODE_ENV": "development"
  },

  // Hooks (see Hooks snippet for details)
  "hooks": {}
}`,
                },
                {
                  order: 2,
                  language: "text",
                  label: "Key environment variables",
                  content: `VARIABLE                              PURPOSE
──────────────────────────────────────────────────────────────────────
ANTHROPIC_API_KEY                     API key for direct API auth
ANTHROPIC_BASE_URL                    Override API endpoint
ANTHROPIC_MODEL                       Default model
CLAUDE_CONFIG_DIR                     Override config dir (default ~/.claude)

CLAUDE_CODE_DISABLE_AUTO_MEMORY       Disable auto memory (set to 1)
CLAUDE_CODE_DISABLE_CLAUDE_MDS        Skip all CLAUDE.md loading
CLAUDE_CODE_DISABLE_BACKGROUND_TASKS  Disable background task execution
CLAUDE_CODE_DISABLE_FAST_MODE         Disable fast mode globally
CLAUDE_CODE_DISABLE_THINKING          Force-disable extended thinking
DISABLE_AUTO_COMPACT                  Disable automatic compaction
DISABLE_TELEMETRY                     Opt out of telemetry

BASH_DEFAULT_TIMEOUT_MS               Bash command timeout (default 120000)
BASH_MAX_OUTPUT_LENGTH                Max chars from bash output
API_TIMEOUT_MS                        API request timeout (default 600000)
MAX_THINKING_TOKENS                   Extended thinking token budget

CLAUDE_CODE_NO_FLICKER                Enable fullscreen rendering
CLAUDE_CODE_SCROLL_SPEED              Mouse wheel scroll multiplier
CLAUDE_CODE_SHELL                     Override shell detection`,
                },
              ],
            },
          },
          {
            title: "Auto Memory System",
            description: "How Claude Code automatically remembers project context across sessions.",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "How auto memory works",
                  content: `AUTO MEMORY OVERVIEW
  Claude saves notes about your project between sessions so it doesn't
  need to re-derive the same context every time.

STORAGE LOCATION
  ~/.claude/projects/<project-hash>/memory/
  ├── MEMORY.md          ← Index (loaded at every session start)
  ├── build-commands.md  ← Topic file (loaded on demand)
  ├── conventions.md     ← Topic file (loaded on demand)
  └── debugging.md       ← Topic file (loaded on demand)

WHAT CLAUDE SAVES
  • Build and test commands
  • Code conventions and preferences
  • Architecture decisions
  • Debugging patterns discovered
  • Things you explicitly ask it to remember

CONTEXT BUDGET
  First 200 lines (or 25 KB) of MEMORY.md loads automatically.
  Lines beyond 200 are truncated — keep MEMORY.md as an index only.
  Topic files load when referenced (on demand).

SCOPE
  Per git repository — all worktrees of the same repo share memory.

MANAGE MEMORY
  /memory              Browse, open, and edit memory files
  "remember that X"   Claude saves X to memory immediately
  "forget X"          Claude removes X from memory`,
                },
                {
                  order: 1,
                  language: "text",
                  label: "Disable / configure memory",
                  content: `DISABLE AUTO MEMORY
  # Per session
  CLAUDE_CODE_DISABLE_AUTO_MEMORY=1 claude

  # Persistently (settings.json)
  { "autoMemoryEnabled": false }

OVERRIDE MEMORY LOCATION
  # settings.json
  { "autoMemoryDirectory": "/custom/path/to/memory" }

MEMORY FILE FORMAT (topic files)
  ---
  name: build-commands
  description: How to build and test this project
  type: project
  ---

  Run: npm run build
  Test: npm test -- --watch
  Lint: npm run lint --fix

MEMORY TYPES CLAUDE USES
  user      Who you are, your expertise and preferences
  feedback  How you want Claude to behave (corrections, confirmations)
  project   Ongoing work, decisions, deadlines
  reference Pointers to external systems (Jira, Slack, dashboards)`,
                },
              ],
            },
          },
          {
            title: "Non-Interactive & Scripting",
            description: "Using Claude Code in scripts, CI pipelines, and programmatic workflows.",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "bash",
                  label: "Print mode scripting",
                  content: `# Basic print mode (-p / --print)
claude -p "what does main() do in main.go?"

# Pipe in file content
cat src/api/auth.ts | claude -p "list all security issues"

# JSON output for scripting
claude -p "list files changed" --output-format json | jq '.result'

# Stream JSON (line-delimited events)
claude -p "explain this" --output-format stream-json

# Restrict tools in a script (read-only analysis)
claude -p "review this PR" --tools "Read,Grep,Glob"

# Set a spending cap for automated runs
claude -p "generate release notes" --max-budget-usd 0.25

# Non-interactive with pre-approved tools
claude -p "run tests and fix failures" \
  --allowedTools "Bash(npm test)" \
  --allowedTools "Edit(src/**)"`,
                },
                {
                  order: 1,
                  language: "bash",
                  label: "CI / GitHub Actions example",
                  content: `# .github/workflows/ai-review.yml (excerpt)
# Run Claude Code as a PR reviewer

- name: AI Code Review
  env:
    ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }}
  run: |
    git diff origin/main...HEAD > diff.patch
    cat diff.patch | claude -p "
      Review this diff for:
      1. Security vulnerabilities
      2. Logic errors
      3. Missing tests
      Output as JSON with keys: issues, severity, suggestions
    " --output-format json > review.json
    cat review.json`,
                },
              ],
            },
          },
          {
            title: "Tips & Best Practices",
            description: "Practical tips to get the most out of Claude Code.",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Prompting tips",
                  content: `BE SPECIFIC ABOUT SCOPE
  Bad:  "fix the bug"
  Good: "fix the null pointer in src/api/auth.ts:42 — the session
         can be undefined when the token has expired"

GIVE CONTEXT UP FRONT
  "I'm refactoring the payment module. Don't touch the legacy
   StripeV1 client — we're migrating to StripeV2 only."

USE /init TO BOOTSTRAP CLAUDE.MD
  Run /init in a new project so Claude reads your code and writes
  a CLAUDE.md with build commands, conventions, and architecture.

COMPACT WHEN CONTEXT GROWS
  Run /compact when the session gets long. Claude summarises what
  happened so it can continue with a fresh context window.

ASK FOR A PLAN FIRST (complex tasks)
  "Before making any changes, describe your plan for refactoring
   the auth middleware." Review the plan, then say "proceed."

USE PERMISSION MODES WISELY
  • acceptEdits — day-to-day coding (auto-approve file edits)
  • plan        — explore and design without any side effects
  • auto        — automated tasks where you trust the scope
  • default     — when working in unfamiliar territory`,
                },
                {
                  order: 1,
                  language: "text",
                  label: "Workflow patterns",
                  content: `EXPLORE → PLAN → IMPLEMENT
  1. "Explore the auth module and summarise how it works."
  2. "Plan how to add OAuth support without breaking existing auth."
  3. "Implement the plan."

WORKTREES FOR ISOLATION
  claude --worktree feature-oauth
  # Claude works in a separate git worktree — main branch untouched
  # Review changes before merging

MULTI-REPO WORK
  claude --add-dir ../shared-utils "update usages of formatDate"
  # Claude can read/edit files across both directories

LOCK DOWN PATHS IN CI
  claude --tools "Read,Grep,Glob" --allowedTools "Bash(npm test)"
  # Prevents accidental writes; only test execution allowed

BACKGROUND LONG TASKS
  Ctrl+B — move a running task to the background
  Ctrl+T — check background task status
  # Start a second query while the first task runs`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Claude Code cheatsheet: ${result.name} (${result.id})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
