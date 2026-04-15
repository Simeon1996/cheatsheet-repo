import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  await prisma.category.deleteMany({
    where: { name: "MCP (Model Context Protocol)", userId: null },
  });

  const result = await prisma.category.create({
    data: {
      name: "MCP (Model Context Protocol)",
      icon: "🔌",
      color: "cyan",
      description: "Model Context Protocol reference: architecture, primitives, server config, building servers, tools/resources/prompts, transports, auth, and debugging.",
      isPublic: true,
      snippets: {
        create: [
          {
            title: "Protocol Overview & Architecture",
            description: "What MCP is, how clients and servers relate, and the two transport types.",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Architecture overview",
                  content: `MCP — Model Context Protocol
  Open standard for connecting AI applications to external tools and data.
  Think of it as "USB-C for AI" — one interface, many peripherals.

ROLES
  MCP Host    AI application that embeds an MCP client
              (Claude Desktop, Claude Code, VS Code, Cursor …)
  MCP Client  Component inside the host managing one server connection
  MCP Server  Process exposing tools / resources / prompts via MCP

  Host ←──── MCP Client ────→ MCP Server (filesystem)
         ←──── MCP Client ────→ MCP Server (GitHub)
         ←──── MCP Client ────→ MCP Server (Postgres)

  One host can connect to many servers simultaneously.
  Each connection is a dedicated client instance.

WIRE PROTOCOL
  JSON-RPC 2.0 over the chosen transport.
  Messages: Request → Response  |  Notification (fire-and-forget)

TRANSPORT OPTIONS
  stdio           stdin / stdout — local only, zero network overhead
  Streamable HTTP POST for client→server, optional SSE for streaming
                  supports standard HTTP auth, multi-client, remote`,
                },
              ],
            },
          },
          {
            title: "MCP Primitives",
            description: "The five building blocks servers and clients expose: Tools, Resources, Prompts, Sampling, and Roots.",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Server-side primitives",
                  content: `PRIMITIVE   WHO DECIDES TO USE IT   WHAT IT IS
──────────────────────────────────────────────────────────────────────
Tools       The model (AI)          Executable functions the LLM can call
                                    e.g. searchFlights(), queryDatabase()
                                    Protocol: tools/list  tools/call

Resources   The application         Read-only data sources for context
                                    e.g. file contents, DB schemas, API docs
                                    Direct (fixed URI) or Template (parameterised)
                                    Protocol: resources/list  resources/read
                                              resources/templates/list
                                              resources/subscribe

Prompts     The user                Reusable instruction templates with parameters
                                    e.g. "Plan a vacation" with destination/days args
                                    Protocol: prompts/list  prompts/get

CLIENT-SIDE PRIMITIVES (what servers can request from the host)
──────────────────────────────────────────────────────────────────────
Sampling    Server asks client to run an LLM completion
            sampling/complete — lets servers leverage the host model

Roots       Client tells server which filesystem roots it may access
            Servers should respect roots for path-based operations`,
                },
              ],
            },
          },
          {
            title: "Server Configuration",
            description: "JSON config format for Claude Desktop, Claude Code, and other MCP clients.",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Config file locations",
                  content: `CLIENT              CONFIG FILE LOCATION
──────────────────────────────────────────────────────────────────────
Claude Desktop      ~/Library/Application Support/Claude/claude_desktop_config.json  (macOS)
                    %APPDATA%\\Claude\\claude_desktop_config.json                      (Windows)
Claude Code         ~/.claude/settings.json  (mcpServers key)
                    or  .claude/settings.json  (project-level)
                    or  --mcp-config <path>    (CLI flag per session)
VS Code / Cursor    .vscode/mcp.json  or workspace settings`,
                },
                {
                  order: 1,
                  language: "json",
                  label: "Full config example",
                  content: `{
  "mcpServers": {

    // Local stdio server — runs a child process
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/docs"],
      "env": {}
    },

    // Python server via uv (recommended for Python projects)
    "weather": {
      "command": "uv",
      "args": ["--directory", "/absolute/path/to/weather-server", "run", "weather.py"],
      "env": {
        "WEATHER_API_KEY": "sk_live_abc123"
      }
    },

    // Remote HTTP/SSE server
    "my-api": {
      "type": "sse",
      "url": "https://mcp.example.com/sse",
      "headers": {
        "Authorization": "Bearer \${MY_TOKEN}"
      }
    },

    // Streamable HTTP (newer standard)
    "remote-tools": {
      "type": "http",
      "url": "https://mcp.example.com/mcp",
      "headers": {
        "X-API-Key": "\${REMOTE_API_KEY}"
      }
    }
  }
}

// IMPORTANT: Always use absolute paths — relative paths often fail
// because the client's working directory is undefined at launch.`,
                },
              ],
            },
          },
          {
            title: "Building an MCP Server — TypeScript",
            description: "Creating an MCP server with the official TypeScript SDK.",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "bash",
                  label: "Setup",
                  content: `# Initialise project
mkdir my-mcp-server && cd my-mcp-server
npm init -y

# Install SDK
npm install @modelcontextprotocol/sdk zod

# TypeScript tooling
npm install -D typescript @types/node tsx

# package.json — add type & bin
# "type": "module"
# "bin": { "my-server": "dist/index.js" }`,
                },
                {
                  order: 1,
                  language: "typescript",
                  label: "Minimal server (stdio)",
                  content: `// src/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "my-server",
  version: "1.0.0",
});

// Register a tool
server.tool(
  "add",
  "Add two numbers",
  { a: z.number(), b: z.number() },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }],
  })
);

// Register a resource
server.resource(
  "config",
  "config://app",
  async (uri) => ({
    contents: [{ uri: uri.href, text: "port=3000\ndebug=false" }],
  })
);

// Register a prompt
server.prompt(
  "review-code",
  { code: z.string() },
  ({ code }) => ({
    messages: [{
      role: "user",
      content: { type: "text", text: \`Review this code:\\n\${code}\` },
    }],
  })
);

// Start
const transport = new StdioServerTransport();
await server.connect(transport);
// NEVER log to stdout in stdio servers — it corrupts JSON-RPC
// Use console.error() or process.stderr.write() instead`,
                },
                {
                  order: 2,
                  language: "typescript",
                  label: "HTTP server (multi-client)",
                  content: `// src/http-server.ts
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const app = express();
app.use(express.json());

const server = new McpServer({ name: "remote-server", version: "1.0.0" });
// ... register tools/resources/prompts ...

const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
await server.connect(transport);

app.post("/mcp", (req, res) => transport.handleRequest(req, res));
app.get("/mcp", (req, res) => transport.handleRequest(req, res));  // SSE
app.delete("/mcp", (req, res) => transport.handleRequest(req, res));

app.listen(3000);`,
                },
              ],
            },
          },
          {
            title: "Building an MCP Server — Python",
            description: "Creating an MCP server with the official Python SDK using FastMCP.",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "bash",
                  label: "Setup",
                  content: `# Using uv (recommended)
uv init my-mcp-server
cd my-mcp-server
uv add "mcp[cli]"

# Or pip
pip install "mcp[cli]"

# Scaffold a new server interactively
mcp new my-server

# Run during development
mcp dev server.py

# Install into Claude Desktop
mcp install server.py`,
                },
                {
                  order: 1,
                  language: "python",
                  label: "FastMCP server (decorator style)",
                  content: `# server.py
from mcp.server.fastmcp import FastMCP
from mcp.types import Resource, TextContent

mcp = FastMCP("weather")

# ── TOOL ──────────────────────────────────────────────
@mcp.tool()
async def get_forecast(city: str, days: int = 3) -> str:
    """Get a weather forecast for a city."""
    # implementation …
    return f"Forecast for {city}: sunny for {days} days"

# ── RESOURCE ──────────────────────────────────────────
@mcp.resource("config://settings")
def get_settings() -> str:
    """Application settings."""
    return "theme=dark\\nlocale=en"

# Dynamic resource with URI template
@mcp.resource("weather://{city}/current")
def current_weather(city: str) -> str:
    """Current conditions for a city."""
    return f"Current weather in {city}: 22°C, partly cloudy"

# ── PROMPT ────────────────────────────────────────────
@mcp.prompt()
def weather_report(city: str) -> str:
    """Generate a weather briefing prompt."""
    return f"Write a friendly weather report for {city}."

# ── RUN ───────────────────────────────────────────────
if __name__ == "__main__":
    mcp.run()          # defaults to stdio
    # mcp.run(transport="streamable-http")  # for remote`,
                },
              ],
            },
          },
          {
            title: "Tool Definition Deep-Dive",
            description: "How to define tools with JSON Schema input validation and proper return types.",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "typescript",
                  label: "Tool with full JSON Schema",
                  content: `// Using low-level server API for full schema control
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "search_flights",
    title: "Flight Search",          // human-readable display name
    description: "Search available flights between two cities.",
    inputSchema: {
      type: "object",
      properties: {
        origin:      { type: "string",  description: "IATA departure code, e.g. JFK" },
        destination: { type: "string",  description: "IATA arrival code, e.g. LHR" },
        date:        { type: "string",  format: "date", description: "ISO 8601 date" },
        class:       { type: "string",  enum: ["economy","business","first"],
                       default: "economy" },
        max_price:   { type: "number",  description: "Max price in USD" },
      },
      required: ["origin", "destination", "date"],
    },
  }],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  if (req.params.name === "search_flights") {
    const { origin, destination, date, class: cls = "economy" } = req.params.arguments;
    const results = await flightApi.search(origin, destination, date, cls);
    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      isError: false,
    };
  }
});

// RETURN TYPES
// content is an array of:
//   { type: "text",  text: string }
//   { type: "image", data: base64, mimeType: "image/png" }
//   { type: "resource", resource: { uri, text | blob } }`,
                },
              ],
            },
          },
          {
            title: "Resources & Prompts",
            description: "Defining static and dynamic resources, and reusable prompt templates.",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "typescript",
                  label: "Resources — static & template",
                  content: `// Static resource (fixed URI)
server.resource(
  "app-config",
  "config://app",
  { mimeType: "application/json", description: "App configuration" },
  async () => ({
    contents: [{
      uri: "config://app",
      mimeType: "application/json",
      text: JSON.stringify({ port: 3000, debug: false }),
    }],
  })
);

// Dynamic resource (URI template)
server.resource(
  "user-profile",
  new ResourceTemplate("users://{userId}/profile", { list: undefined }),
  { mimeType: "application/json", description: "User profile by ID" },
  async (uri, { userId }) => ({
    contents: [{
      uri: uri.href,
      mimeType: "application/json",
      text: JSON.stringify(await db.getUser(userId)),
    }],
  })
);

// PROTOCOL METHODS
// resources/list                → list direct resources
// resources/templates/list      → list URI templates
// resources/read  { uri }       → fetch contents
// resources/subscribe { uri }   → stream updates
// notifications/resources/updated  → server-push on change`,
                },
                {
                  order: 1,
                  language: "typescript",
                  label: "Prompts — parameterised templates",
                  content: `server.prompt(
  "code-review",
  "Review code for issues and improvements",
  {
    code:     z.string().describe("Source code to review"),
    language: z.string().optional().describe("Programming language"),
    focus:    z.enum(["security","performance","readability"]).optional(),
  },
  ({ code, language = "unknown", focus = "all" }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: \`Review the following \${language} code focusing on \${focus}:\\n\\n\${code}\`,
        },
      },
    ],
  })
);

// PROTOCOL METHODS
// prompts/list              → discover available prompts
// prompts/get { name, args} → get rendered prompt messages`,
                },
              ],
            },
          },
          {
            title: "Transport Types",
            description: "stdio vs Streamable HTTP — when to use each and how they work.",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Transport comparison",
                  content: `FEATURE             STDIO                     STREAMABLE HTTP
──────────────────────────────────────────────────────────────────────
Where               Local machine only        Local or remote
Clients             Single (1:1)              Multiple (1:N)
Network overhead    None                      Minimal (HTTP/2)
Auth                Env vars / process perms  Bearer token, API key, headers
Setup complexity    Low                       Medium
Streaming           N/A (synchronous)         Server-Sent Events (SSE)
Session state       Process lifetime          Mcp-Session-Id header
Use for             Local tools (fs, git, db) Cloud services, shared servers
Logging             stderr ONLY               stdout or SSE notifications

STDIO GOLDEN RULE
  Never write to stdout inside a stdio server.
  stdout is the JSON-RPC channel — any stray bytes corrupt the protocol.
  Use: console.error(), process.stderr.write(), logging to a file.

HTTP SESSION LIFECYCLE
  1. Client POST /mcp  with Initialize request
  2. Server returns Mcp-Session-Id header
  3. Client includes Mcp-Session-Id on all subsequent requests
  4. Client DELETE /mcp to terminate session`,
                },
                {
                  order: 1,
                  language: "typescript",
                  label: "Choosing & starting a transport",
                  content: `// ── STDIO ─────────────────────────────────────────────
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const transport = new StdioServerTransport();
await server.connect(transport);


// ── STREAMABLE HTTP ────────────────────────────────────
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "crypto";

const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: () => randomUUID(),    // stateful sessions
  // sessionIdGenerator: undefined,          // stateless (simpler)
  onsessioninitialized: (sessionId) => {
    sessions.set(sessionId, transport);
  },
});
await server.connect(transport);

app.post("/mcp",   (req, res) => transport.handleRequest(req, res, req.body));
app.get("/mcp",    (req, res) => transport.handleRequest(req, res));   // SSE
app.delete("/mcp", (req, res) => transport.handleRequest(req, res));


// ── PYTHON FastMCP ─────────────────────────────────────
mcp.run()                               # stdio (default)
mcp.run(transport="streamable-http")    # HTTP`,
                },
              ],
            },
          },
          {
            title: "Authentication & Security",
            description: "How auth works with MCP servers and key security considerations.",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Auth patterns",
                  content: `STDIO SERVERS
  Auth is implicit — the server inherits the process owner's permissions.
  API keys go in env vars in the config file:
    "env": { "GITHUB_TOKEN": "ghp_abc123" }
  Access them in the server: process.env.GITHUB_TOKEN

HTTP SERVERS — OPTIONS
  API Key (simplest)
    Client sends header:  Authorization: Bearer <token>
    Server validates against a known key or secret.

  OAuth 2.0 (third-party APIs)
    MCP spec uses OAuth 2.0 with dynamic client registration.
    Flow: client registers → user consents → server gets token.
    Server validates the token was issued TO IT, not just forwarded.

  mTLS (high-security internal services)
    Client and server both present certificates.

SECURITY RULES
  ✗ Never hardcode secrets in source code
  ✗ Never blindly forward client tokens to third-party APIs
       ("token passthrough" — confused deputy attack)
  ✓ Validate tokens were issued for your server's audience
  ✓ Use HTTPS for all remote HTTP transport in production
  ✓ Implement per-client OAuth consent, not shared static IDs
  ✓ Apply minimal scope — request only what each operation needs`,
                },
                {
                  order: 1,
                  language: "typescript",
                  label: "HTTP auth middleware example",
                  content: `// Express middleware to validate Bearer token
app.use("/mcp", (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }
  const token = auth.slice(7);
  if (!isValidToken(token)) {           // your validation logic
    return res.status(403).json({ error: "Invalid token" });
  }
  next();
});

// Block SSRF — private IP ranges in fetch-based servers
const BLOCKED = [
  /^127\\./, /^10\\./, /^192\\.168\\./, /^172\\.(1[6-9]|2\\d|3[01])\\./,
  /^169\\.254\\./,  // link-local / AWS metadata
];
function isSafeUrl(url: string): boolean {
  const { hostname } = new URL(url);
  return !BLOCKED.some(re => re.test(hostname));
}`,
                },
              ],
            },
          },
          {
            title: "Notable MCP Servers",
            description: "Official and community MCP servers worth knowing about.",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "text",
                  label: "Official reference servers",
                  content: `SERVER              PACKAGE                                      WHAT IT DOES
──────────────────────────────────────────────────────────────────────────────
filesystem          @modelcontextprotocol/server-filesystem     Read/write/search local files
git                 @modelcontextprotocol/server-git             Git log, diff, status, clone
github              @modelcontextprotocol/server-github          Issues, PRs, repos, code search
gitlab              @modelcontextprotocol/server-gitlab          GitLab API equivalents
postgres            @modelcontextprotocol/server-postgres        SQL queries, schema inspection
sqlite              @modelcontextprotocol/server-sqlite          SQLite queries
memory              @modelcontextprotocol/server-memory          Persistent knowledge graph
fetch               @modelcontextprotocol/server-fetch           Web content retrieval + HTML→MD
brave-search        @modelcontextprotocol/server-brave-search    Web search via Brave API
puppeteer           @modelcontextprotocol/server-puppeteer       Browser automation, screenshots
time                @modelcontextprotocol/server-time            Time, timezone conversions
slack               @modelcontextprotocol/server-slack           Slack channels, messages

INSTALL ANY VIA npx (no install needed)
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"]`,
                },
                {
                  order: 1,
                  language: "text",
                  label: "Popular third-party servers",
                  content: `SERVER              SOURCE                       WHAT IT DOES
──────────────────────────────────────────────────────────────────────
AWS KB Retrieval    awslabs/mcp                  Query AWS Bedrock Knowledge Bases
Cloudflare          cloudflare/mcp-server-cf     Workers, KV, R2, D1 management
Stripe              stripe/agent-toolkit         Payments, customers, subscriptions
Sentry              getsentry/sentry-mcp         Issues, events, performance data
Linear              linear-mcp                   Issues, projects, teams
Jira                atlassian/mcp-atlassian      Jira issues, Confluence pages
Grafana             grafana-mcp                  Dashboards, alerts, datasources
Docker              mcp-docker                   Container management
Kubernetes          mcp-kubernetes               Cluster resources, logs, pods
Redis               redis/mcp-server-redis       Get/set/query Redis
Qdrant              qdrant-mcp                   Vector search and storage
Playwright          mcp-playwright               Browser automation (alt to Puppeteer)

DISCOVERY
  https://github.com/modelcontextprotocol/servers  — official list
  https://mcp.so                                   — community directory`,
                },
              ],
            },
          },
          {
            title: "Debugging & Testing",
            description: "MCP Inspector, log locations, and common errors.",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "bash",
                  label: "MCP Inspector",
                  content: `# Launch Inspector against a local stdio server
npx @modelcontextprotocol/inspector npx @modelcontextprotocol/server-filesystem /tmp

# Custom port
npx @modelcontextprotocol/inspector --port 5174 node dist/index.js

# Against an HTTP server
npx @modelcontextprotocol/inspector --transport http --url http://localhost:3000/mcp

# Python server via uv
npx @modelcontextprotocol/inspector uv run server.py

# Inspector features (runs at http://localhost:5173 by default)
#   • List and call tools interactively
#   • Browse resources and templates
#   • Invoke prompts with arguments
#   • View raw JSON-RPC messages
#   • Inspect server capabilities and version`,
                },
                {
                  order: 1,
                  language: "bash",
                  label: "Log locations & common errors",
                  content: `# Claude Desktop log files
tail -f ~/Library/Logs/Claude/mcp*.log                   # macOS
# %APPDATA%\\Claude\\logs\\mcp*.log                       # Windows

# Claude Code (stdio server stderr goes here)
journalctl -f   # or check terminal output

# Python FastMCP dev mode — shows all messages
mcp dev server.py

COMMON ERRORS & FIXES
──────────────────────────────────────────────────────────────
"spawn ENOENT"              command not found — use absolute path
                            or ensure executable is on PATH

"JSON parse error"          server wrote to stdout (stdio transport)
                            Move all logging to stderr

"Protocol version mismatch" SDK version mismatch between client/server
                            Update both to same MCP spec version

"ECONNREFUSED"              HTTP server not running on expected port
                            Check port and that server started

"Timeout"                   Tool handler too slow
                            Add timeouts; return partial results early

Config not loading          Restart the MCP host after editing config
                            Check JSON syntax (no trailing commas)`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created MCP cheatsheet: ${result.name} (${result.id})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
