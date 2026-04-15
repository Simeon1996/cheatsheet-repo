import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.category.deleteMany({ where: { name: "curl", userId: null } });

  const curl = await prisma.category.create({
    data: {
      name: "curl",
      icon: "🌐",
      color: "green",
      description: "curl: HTTP requests, authentication, headers, file transfer, and debugging",
      isPublic: true,
      snippets: {
        create: [
          // ── Basic Requests ────────────────────────────────────────────────
          {
            title: "Basic Requests",
            description: "GET, POST, PUT, PATCH, DELETE",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "GET",
                  content: `curl https://api.example.com/users

# Verbose output (headers + body)
curl -v https://api.example.com/users

# Silent (no progress bar)
curl -s https://api.example.com/users

# Follow redirects
curl -L https://example.com

# Limit redirect depth
curl -L --max-redirs 5 https://example.com`,
                },
                {
                  order: 1, language: "bash", label: "POST — JSON body",
                  content: `curl -X POST https://api.example.com/users \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Alice","email":"alice@example.com"}'

# From a file
curl -X POST https://api.example.com/users \\
  -H "Content-Type: application/json" \\
  -d @payload.json`,
                },
                {
                  order: 2, language: "bash", label: "PUT & PATCH",
                  content: `# PUT (replace)
curl -X PUT https://api.example.com/users/1 \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Alice Updated"}'

# PATCH (partial update)
curl -X PATCH https://api.example.com/users/1 \\
  -H "Content-Type: application/json" \\
  -d '{"email":"new@example.com"}'`,
                },
                {
                  order: 3, language: "bash", label: "DELETE",
                  content: `curl -X DELETE https://api.example.com/users/1

# With auth header
curl -X DELETE https://api.example.com/users/1 \\
  -H "Authorization: Bearer <token>"`,
                },
              ],
            },
          },
          // ── Headers & Output ─────────────────────────────────────────────
          {
            title: "Headers & Output",
            description: "Send and inspect headers, control output format",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Send custom headers",
                  content: `curl https://api.example.com \\
  -H "Authorization: Bearer <token>" \\
  -H "Accept: application/json" \\
  -H "X-Request-ID: abc123"

# Multiple headers with a variable
TOKEN="my-secret"
curl https://api.example.com \\
  -H "Authorization: Bearer $TOKEN"`,
                },
                {
                  order: 1, language: "bash", label: "Inspect response headers",
                  content: `# Show only response headers (HEAD request)
curl -I https://example.com

# Show response headers + body
curl -i https://api.example.com/users

# Write headers to a file, body to stdout
curl -D headers.txt https://api.example.com/users`,
                },
                {
                  order: 2, language: "bash", label: "Save & format output",
                  content: `# Save response to file
curl -o response.json https://api.example.com/users

# Save with remote filename
curl -O https://example.com/file.zip

# Pretty-print JSON (pipe to jq)
curl -s https://api.example.com/users | jq .

# Write only HTTP status code
curl -s -o /dev/null -w "%{http_code}" https://api.example.com/users`,
                },
              ],
            },
          },
          // ── Authentication ────────────────────────────────────────────────
          {
            title: "Authentication",
            description: "Basic auth, Bearer tokens, API keys, and client certificates",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Basic auth",
                  content: `# Username + password prompt
curl -u alice https://api.example.com

# Username + password inline (avoid in scripts — leaks in history)
curl -u alice:password https://api.example.com

# Encode manually
curl -H "Authorization: Basic $(echo -n alice:password | base64)" \\
  https://api.example.com`,
                },
                {
                  order: 1, language: "bash", label: "Bearer token & API key",
                  content: `# Bearer token
curl -H "Authorization: Bearer eyJhbGci..." https://api.example.com

# API key in header
curl -H "X-API-Key: my-key" https://api.example.com

# API key as query param
curl "https://api.example.com/data?api_key=my-key"`,
                },
                {
                  order: 2, language: "bash", label: "Client certificates (mTLS)",
                  content: `# Client cert + key
curl --cert client.crt --key client.key https://api.example.com

# PEM bundle (cert + key in one file)
curl --cert bundle.pem https://api.example.com

# Provide a CA cert to verify server
curl --cacert ca.crt https://api.example.com

# Skip TLS verification (testing only — insecure)
curl -k https://self-signed.example.com`,
                },
              ],
            },
          },
          // ── Form Data & File Upload ───────────────────────────────────────
          {
            title: "Form Data & File Upload",
            description: "URL-encoded forms, multipart uploads, and binary files",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "URL-encoded form",
                  content: `# Shorthand POST with form data
curl -d "username=alice&password=secret" https://example.com/login

# Explicit content-type
curl -X POST https://example.com/login \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  --data-urlencode "username=alice jones" \\
  --data-urlencode "password=secret"`,
                },
                {
                  order: 1, language: "bash", label: "Multipart file upload",
                  content: `# Upload a single file
curl -X POST https://api.example.com/upload \\
  -F "file=@photo.jpg"

# With extra form fields
curl -X POST https://api.example.com/upload \\
  -F "file=@photo.jpg;type=image/jpeg" \\
  -F "title=My Photo" \\
  -F "public=true"

# Upload multiple files
curl -X POST https://api.example.com/batch \\
  -F "files[]=@file1.txt" \\
  -F "files[]=@file2.txt"`,
                },
              ],
            },
          },
          // ── Query Params & URLs ───────────────────────────────────────────
          {
            title: "Query Params & URLs",
            description: "Build URLs, encode params, and use variables",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Query string",
                  content: `# Inline query string
curl "https://api.example.com/search?q=curl&limit=10&page=2"

# URL-encode individual params
curl -G https://api.example.com/search \\
  --data-urlencode "q=hello world" \\
  --data-urlencode "limit=10"`,
                },
                {
                  order: 1, language: "bash", label: "URL globbing (batch requests)",
                  content: `# Fetch multiple pages
curl "https://api.example.com/page/[1-5]"

# Fetch multiple endpoints
curl "https://api.example.com/{users,posts,comments}"

# Disable globbing if URL contains braces
curl -g "https://api.example.com/data{json}"`,
                },
              ],
            },
          },
          // ── Cookies ──────────────────────────────────────────────────────
          {
            title: "Cookies",
            description: "Send, save, and load cookies",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Send & persist cookies",
                  content: `# Send a cookie manually
curl -H "Cookie: session=abc123" https://example.com/dashboard

# Save cookies to a jar file
curl -c cookies.txt https://example.com/login \\
  -d "user=alice&pass=secret"

# Load cookies from jar and save updates
curl -b cookies.txt -c cookies.txt https://example.com/dashboard

# One-liner: log in then use session
curl -s -c cookies.txt -X POST https://example.com/login \\
  -d "user=alice&pass=secret" && \\
curl -s -b cookies.txt https://example.com/profile`,
                },
              ],
            },
          },
          // ── Timeouts & Retries ────────────────────────────────────────────
          {
            title: "Timeouts & Retries",
            description: "Control connection timeouts and automatic retries",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Timeouts",
                  content: `# Max time for the whole operation (seconds)
curl --max-time 10 https://api.example.com

# Connection timeout only
curl --connect-timeout 5 https://api.example.com

# Both
curl --connect-timeout 5 --max-time 30 https://api.example.com`,
                },
                {
                  order: 1, language: "bash", label: "Retries",
                  content: `# Retry on transient errors (up to 3 times)
curl --retry 3 https://api.example.com

# Retry with delay between attempts (seconds)
curl --retry 3 --retry-delay 2 https://api.example.com

# Retry on all errors including HTTP 5xx
curl --retry 3 --retry-all-errors https://api.example.com

# Retry with exponential backoff
curl --retry 5 --retry-delay 1 --retry-max-time 60 https://api.example.com`,
                },
              ],
            },
          },
          // ── Proxy & Tunneling ─────────────────────────────────────────────
          {
            title: "Proxy & Tunneling",
            description: "Route requests through HTTP, HTTPS, and SOCKS proxies",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Proxy settings",
                  content: `# HTTP proxy
curl -x http://proxy.example.com:8080 https://api.example.com

# SOCKS5 proxy
curl --socks5 127.0.0.1:1080 https://api.example.com

# Proxy with credentials
curl -x http://user:pass@proxy.example.com:8080 https://api.example.com

# Bypass proxy for specific hosts
curl --noproxy "localhost,internal.corp" -x http://proxy:8080 https://api.example.com

# Use environment variable
export https_proxy=http://proxy.example.com:8080
curl https://api.example.com`,
                },
              ],
            },
          },
          // ── Debugging ─────────────────────────────────────────────────────
          {
            title: "Debugging",
            description: "Verbose output, timing, and trace options",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Verbose & trace",
                  content: `# Verbose: shows request/response headers
curl -v https://api.example.com

# Extra verbose: also shows SSL handshake
curl -vv https://api.example.com

# Full wire trace (writes to stderr)
curl --trace - https://api.example.com

# Trace to a file
curl --trace trace.txt https://api.example.com`,
                },
                {
                  order: 1, language: "bash", label: "Timing breakdown",
                  content: `curl -s -o /dev/null -w "
    DNS lookup:     %{time_namelookup}s
    TCP connect:    %{time_connect}s
    TLS handshake:  %{time_appconnect}s
    TTFB:           %{time_starttransfer}s
    Total:          %{time_total}s
    HTTP status:    %{http_code}
    Downloaded:     %{size_download} bytes
" https://api.example.com`,
                },
                {
                  order: 2, language: "bash", label: "Dry-run & config",
                  content: `# Print the request curl would send, without sending it
curl --dry-run -X POST https://api.example.com \\
  -H "Content-Type: application/json" \\
  -d '{"key":"value"}'

# Load options from a config file (.curlrc)
curl --config my.curlrc https://api.example.com

# Sample .curlrc
# header = "Authorization: Bearer mytoken"
# silent
# max-time = 30`,
                },
              ],
            },
          },
          // ── File Download ─────────────────────────────────────────────────
          {
            title: "File Download",
            description: "Download files, resume interrupted transfers, and limit speed",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Download files",
                  content: `# Save with a custom name
curl -o archive.tar.gz https://example.com/releases/v1.0.tar.gz

# Save with the remote filename
curl -O https://example.com/releases/v1.0.tar.gz

# Download multiple files
curl -O https://example.com/file1.zip \\
     -O https://example.com/file2.zip

# Show progress bar
curl --progress-bar -O https://example.com/large.iso`,
                },
                {
                  order: 1, language: "bash", label: "Resume & speed",
                  content: `# Resume an interrupted download
curl -C - -O https://example.com/large.iso

# Limit download speed (bytes per second; k/m suffixes supported)
curl --limit-rate 500k -O https://example.com/large.iso

# Check remote file size without downloading
curl -sI https://example.com/large.iso | grep -i content-length`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created curl cheatsheet: ${curl.name} (${curl.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
