import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.category.deleteMany({ where: { name: "Networking", userId: null } });

  const net = await prisma.category.create({
    data: {
      name: "Networking",
      icon: "🔌",
      color: "blue",
      description: "Linux networking: interfaces, DNS, routing, firewall, diagnostics, and packet capture",
      isPublic: true,
      snippets: {
        create: [
          // ── Interfaces & Addresses ────────────────────────────────────────
          {
            title: "Interfaces & Addresses",
            description: "View and configure network interfaces with ip and ifconfig",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "ip addr — show addresses",
                  content: `# Show all interfaces and addresses
ip addr show
ip a              # shorthand

# Show a specific interface
ip addr show eth0

# Add an IP address
sudo ip addr add 192.168.1.100/24 dev eth0

# Remove an IP address
sudo ip addr del 192.168.1.100/24 dev eth0

# Show only IPv4
ip -4 addr show

# Show only IPv6
ip -6 addr show`,
                },
                {
                  order: 1, language: "bash", label: "ip link — manage interfaces",
                  content: `# List all interfaces (with state)
ip link show
ip -s link show eth0    # with statistics

# Bring interface up/down
sudo ip link set eth0 up
sudo ip link set eth0 down

# Set MTU
sudo ip link set eth0 mtu 9000

# Set MAC address
sudo ip link set eth0 address 02:00:00:00:00:01

# Create VLAN interface
sudo ip link add link eth0 name eth0.10 type vlan id 10
sudo ip link set eth0.10 up`,
                },
                {
                  order: 2, language: "bash", label: "ifconfig (legacy)",
                  content: `# Show all interfaces
ifconfig -a

# Show specific interface
ifconfig eth0

# Bring up / down
sudo ifconfig eth0 up
sudo ifconfig eth0 down

# Assign IP and netmask
sudo ifconfig eth0 192.168.1.100 netmask 255.255.255.0

# Set MTU
sudo ifconfig eth0 mtu 1500`,
                },
              ],
            },
          },
          // ── Routing ───────────────────────────────────────────────────────
          {
            title: "Routing",
            description: "View and modify the kernel routing table",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "ip route — view & modify routes",
                  content: `# Show routing table
ip route show
ip r             # shorthand

# Show route for a specific destination
ip route get 8.8.8.8

# Add a static route
sudo ip route add 10.0.0.0/8 via 192.168.1.1 dev eth0

# Add default gateway
sudo ip route add default via 192.168.1.1

# Delete a route
sudo ip route del 10.0.0.0/8

# Replace (add or update)
sudo ip route replace 10.0.0.0/8 via 10.1.1.1`,
                },
                {
                  order: 1, language: "bash", label: "route (legacy) & netstat -r",
                  content: `# Show routing table
route -n          # numeric (no DNS resolution)
netstat -rn       # alternative

# Add / delete (legacy)
sudo route add -net 10.0.0.0/8 gw 192.168.1.1
sudo route del -net 10.0.0.0/8`,
                },
              ],
            },
          },
          // ── DNS ───────────────────────────────────────────────────────────
          {
            title: "DNS",
            description: "Query DNS records with dig, nslookup, and host",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "dig",
                  content: `# A record (default)
dig example.com

# Specific record type
dig example.com MX
dig example.com AAAA
dig example.com TXT
dig example.com NS
dig example.com CNAME
dig example.com SOA

# Short answer only
dig +short example.com

# Query a specific DNS server
dig @8.8.8.8 example.com

# Reverse lookup (PTR)
dig -x 93.184.216.34

# Full trace from root servers
dig +trace example.com

# Check DNSSEC
dig +dnssec example.com`,
                },
                {
                  order: 1, language: "bash", label: "nslookup & host",
                  content: `# Basic lookup
nslookup example.com

# Query specific server
nslookup example.com 8.8.8.8

# Reverse lookup
nslookup 93.184.216.34

# host (simpler output)
host example.com
host -t MX example.com
host 93.184.216.34        # reverse lookup

# All record types
host -a example.com`,
                },
                {
                  order: 2, language: "bash", label: "systemd-resolve & resolvectl",
                  content: `# Query with system resolver
resolvectl query example.com
resolvectl query --type=MX example.com

# Show DNS configuration per interface
resolvectl status

# Flush DNS cache
sudo resolvectl flush-caches

# Show cache stats
resolvectl statistics`,
                },
              ],
            },
          },
          // ── Connectivity & Diagnostics ────────────────────────────────────
          {
            title: "Connectivity & Diagnostics",
            description: "ping, traceroute, mtr, and path diagnostics",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "ping",
                  content: `# Basic ping
ping example.com

# Limit to N packets
ping -c 4 example.com

# Set interval (seconds)
ping -i 0.2 example.com

# Set packet size
ping -s 1400 example.com

# IPv6
ping6 example.com
ping -6 example.com

# Flood ping (requires root — stress test)
sudo ping -f example.com

# Set TTL
ping -t 64 example.com`,
                },
                {
                  order: 1, language: "bash", label: "traceroute & tracepath",
                  content: `# Traceroute (ICMP by default on Linux — may need sudo)
traceroute example.com

# Use UDP (default on some systems)
traceroute -U example.com

# Use TCP SYN (bypasses some firewalls)
traceroute -T -p 443 example.com

# No DNS resolution (faster)
traceroute -n example.com

# Set max hops
traceroute -m 20 example.com

# tracepath — no root required, shows MTU
tracepath example.com
tracepath6 example.com`,
                },
                {
                  order: 2, language: "bash", label: "mtr — real-time traceroute",
                  content: `# Interactive real-time view
mtr example.com

# Non-interactive report (10 cycles)
mtr --report example.com
mtr -r -c 10 example.com

# No DNS resolution
mtr -n example.com

# Use TCP instead of ICMP
mtr --tcp --port 443 example.com

# JSON output
mtr --json example.com`,
                },
              ],
            },
          },
          // ── Open Ports & Connections ──────────────────────────────────────
          {
            title: "Open Ports & Connections",
            description: "Inspect active connections and listening ports with ss and netstat",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "ss — socket statistics",
                  content: `# All listening TCP ports
ss -tlnp

# All listening UDP ports
ss -ulnp

# All established TCP connections
ss -tn state established

# All connections (TCP + UDP)
ss -tunap

# Find what's listening on a port
ss -tlnp | grep :80

# Connections to a remote host
ss -tn dst 93.184.216.34

# Show sockets for a specific process
ss -tlnp | grep nginx

# Socket summary
ss -s`,
                },
                {
                  order: 1, language: "bash", label: "netstat (legacy)",
                  content: `# All listening ports (TCP + UDP, numeric)
netstat -tlunp

# All active connections
netstat -anp

# Show routing table
netstat -rn

# Show interface statistics
netstat -i

# Find process using a port
netstat -tlnp | grep :443`,
                },
                {
                  order: 2, language: "bash", label: "lsof — list open files/sockets",
                  content: `# All network connections
sudo lsof -i

# Specific port
sudo lsof -i :80
sudo lsof -i :80,443

# TCP only
sudo lsof -i TCP

# Connections by PID
sudo lsof -i -p 1234

# What process is using a port
sudo lsof -i :3000 | grep LISTEN`,
                },
              ],
            },
          },
          // ── nmap ─────────────────────────────────────────────────────────
          {
            title: "nmap — Port Scanning",
            description: "Scan hosts, discover services, and detect OS/versions",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Host & port discovery",
                  content: `# Scan common ports on a host
nmap 192.168.1.1

# Scan specific ports
nmap -p 22,80,443 192.168.1.1

# Scan a port range
nmap -p 1-1024 192.168.1.1

# Scan all 65535 ports
nmap -p- 192.168.1.1

# Scan a subnet
nmap 192.168.1.0/24

# Ping sweep (host discovery only, no port scan)
nmap -sn 192.168.1.0/24

# Fast scan (top 100 ports)
nmap -F 192.168.1.1`,
                },
                {
                  order: 1, language: "bash", label: "Service & OS detection",
                  content: `# Detect service versions
nmap -sV 192.168.1.1

# OS detection (requires root)
sudo nmap -O 192.168.1.1

# Aggressive scan (OS + version + scripts + traceroute)
sudo nmap -A 192.168.1.1

# Run default scripts
nmap -sC 192.168.1.1

# UDP scan (slow — requires root)
sudo nmap -sU -p 53,161,162 192.168.1.1

# Stealth SYN scan (requires root)
sudo nmap -sS 192.168.1.1`,
                },
                {
                  order: 2, language: "bash", label: "Output & timing",
                  content: `# Save output to file
nmap -oN scan.txt 192.168.1.1      # normal
nmap -oX scan.xml 192.168.1.1      # XML
nmap -oG scan.gnmap 192.168.1.1    # greppable
nmap -oA scan 192.168.1.1          # all three formats

# Timing templates (0=slowest, 5=fastest)
nmap -T4 192.168.1.0/24            # aggressive (fast, more noise)
nmap -T2 192.168.1.1               # polite (slower, less noise)

# Verbose output
nmap -v 192.168.1.1
nmap -vv 192.168.1.1`,
                },
              ],
            },
          },
          // ── tcpdump ───────────────────────────────────────────────────────
          {
            title: "tcpdump — Packet Capture",
            description: "Capture and filter network traffic on the command line",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Basic capture",
                  content: `# Capture on default interface
sudo tcpdump

# Capture on a specific interface
sudo tcpdump -i eth0

# Capture on all interfaces
sudo tcpdump -i any

# Limit packet count
sudo tcpdump -c 100 -i eth0

# Save to file
sudo tcpdump -i eth0 -w capture.pcap

# Read from file
tcpdump -r capture.pcap

# Don't resolve hostnames/ports (faster)
sudo tcpdump -n -i eth0`,
                },
                {
                  order: 1, language: "bash", label: "Filters",
                  content: `# Filter by host
sudo tcpdump -i eth0 host 192.168.1.1

# Filter by source or destination
sudo tcpdump -i eth0 src 192.168.1.1
sudo tcpdump -i eth0 dst 8.8.8.8

# Filter by port
sudo tcpdump -i eth0 port 443
sudo tcpdump -i eth0 port 80 or port 443

# Filter by protocol
sudo tcpdump -i eth0 tcp
sudo tcpdump -i eth0 udp
sudo tcpdump -i eth0 icmp

# Combine filters
sudo tcpdump -i eth0 host 10.0.0.1 and port 22

# Exclude a port
sudo tcpdump -i eth0 not port 22

# Capture HTTP traffic and show payload
sudo tcpdump -i eth0 -A port 80`,
                },
              ],
            },
          },
          // ── Netcat ────────────────────────────────────────────────────────
          {
            title: "Netcat (nc)",
            description: "TCP/UDP connections, port scanning, and simple data transfer",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Connect & listen",
                  content: `# Connect to a TCP port
nc host.example.com 80

# Listen on a port
nc -l 9000

# Listen and keep open after client disconnects
nc -lk 9000

# UDP mode
nc -u host.example.com 53
nc -ul 5005             # listen UDP`,
                },
                {
                  order: 1, language: "bash", label: "Port scanning & transfer",
                  content: `# Quick port scan (TCP)
nc -zv 192.168.1.1 20-25
nc -zv 192.168.1.1 80 443 8080

# UDP port scan
nc -zuv 192.168.1.1 53 161

# Transfer a file (receiver first)
# Receiver:
nc -l 9000 > received_file.tar.gz
# Sender:
nc 192.168.1.2 9000 < file.tar.gz

# Simple HTTP request
printf "GET / HTTP/1.0\r\nHost: example.com\r\n\r\n" | nc example.com 80`,
                },
              ],
            },
          },
          // ── SSH Tunnels ───────────────────────────────────────────────────
          {
            title: "SSH Tunnels & Port Forwarding",
            description: "Local, remote, and dynamic (SOCKS) SSH tunnels",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Local & remote forwarding",
                  content: `# Local forward: access remote service locally
# Forwards localhost:8080 → remote_host:80 via jump.example.com
ssh -L 8080:remote_host:80 user@jump.example.com

# Access a DB behind a bastion
ssh -L 5432:db.internal:5432 user@bastion.example.com

# Remote forward: expose local service on remote server
# Opens port 9090 on the remote, forwarding to localhost:3000
ssh -R 9090:localhost:3000 user@remote.example.com

# Keep tunnel open with no shell
ssh -N -L 8080:internal:80 user@jump.example.com

# Background the tunnel
ssh -f -N -L 8080:internal:80 user@jump.example.com`,
                },
                {
                  order: 1, language: "bash", label: "Dynamic (SOCKS) proxy",
                  content: `# Start a SOCKS5 proxy on localhost:1080
ssh -D 1080 user@remote.example.com

# Background, no shell
ssh -f -N -D 1080 user@remote.example.com

# Use with curl
curl --socks5 127.0.0.1:1080 https://internal.example.com

# Jump host (-J) — proxy through a bastion
ssh -J user@bastion.example.com user@target.internal

# Multi-hop
ssh -J user@hop1,user@hop2 user@final.internal`,
                },
              ],
            },
          },
          // ── Firewall — iptables ───────────────────────────────────────────
          {
            title: "Firewall — iptables",
            description: "List, add, and delete iptables rules",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "View rules",
                  content: `# List rules with line numbers and packet counts
sudo iptables -L -v -n --line-numbers

# Show rules for a specific chain
sudo iptables -L INPUT -v -n

# Show NAT table
sudo iptables -t nat -L -v -n

# Show all tables
for t in filter nat mangle raw; do
  echo "=== $t ===" && sudo iptables -t $t -L -n -v
done`,
                },
                {
                  order: 1, language: "bash", label: "Allow & deny rules",
                  content: `# Allow SSH
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Allow HTTP and HTTPS
sudo iptables -A INPUT -p tcp -m multiport --dports 80,443 -j ACCEPT

# Allow established/related connections
sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Drop all other INPUT (default deny)
sudo iptables -P INPUT DROP

# Allow from a specific IP
sudo iptables -A INPUT -s 10.0.0.0/8 -j ACCEPT

# Block an IP
sudo iptables -A INPUT -s 1.2.3.4 -j DROP

# Delete a rule by line number
sudo iptables -D INPUT 3

# Flush all rules (reset)
sudo iptables -F`,
                },
                {
                  order: 2, language: "bash", label: "NAT & masquerade",
                  content: `# Enable IP forwarding
echo 1 | sudo tee /proc/sys/net/ipv4/ip_forward

# Masquerade (SNAT for internet sharing)
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

# DNAT — forward external port to internal host
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 \\
  -j DNAT --to-destination 192.168.1.10:8080

# Save rules (Debian/Ubuntu)
sudo iptables-save > /etc/iptables/rules.v4

# Restore rules
sudo iptables-restore < /etc/iptables/rules.v4`,
                },
              ],
            },
          },
          // ── Network Performance ───────────────────────────────────────────
          {
            title: "Network Performance",
            description: "Bandwidth testing with iperf3 and interface statistics",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "iperf3 — bandwidth testing",
                  content: `# Start server
iperf3 -s

# Start server on specific port
iperf3 -s -p 5202

# Run client test (10 seconds)
iperf3 -c 192.168.1.1

# UDP test (measure packet loss & jitter)
iperf3 -c 192.168.1.1 -u -b 100M

# Parallel streams
iperf3 -c 192.168.1.1 -P 4

# Reverse (server sends to client)
iperf3 -c 192.168.1.1 -R

# Set duration (seconds)
iperf3 -c 192.168.1.1 -t 30

# JSON output
iperf3 -c 192.168.1.1 -J`,
                },
                {
                  order: 1, language: "bash", label: "Interface stats & bandwidth",
                  content: `# Snapshot of interface counters
cat /proc/net/dev
ip -s link show eth0

# Watch live bandwidth (requires ifstat)
ifstat -i eth0 1

# nload — live per-interface graph
nload eth0

# vnstat — historical bandwidth usage
vnstat -i eth0
vnstat -i eth0 -h    # hourly
vnstat -i eth0 -d    # daily
vnstat -i eth0 -m    # monthly`,
                },
              ],
            },
          },
          // ── TLS / SSL ─────────────────────────────────────────────────────
          {
            title: "TLS / SSL Inspection",
            description: "Check certificates and test TLS with openssl",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Inspect remote certificates",
                  content: `# Show full certificate chain
echo | openssl s_client -connect example.com:443 2>/dev/null | openssl x509 -noout -text

# Show expiry date only
echo | openssl s_client -connect example.com:443 2>/dev/null \\
  | openssl x509 -noout -dates

# Check subject and issuer
echo | openssl s_client -connect example.com:443 2>/dev/null \\
  | openssl x509 -noout -subject -issuer

# Test specific TLS version
openssl s_client -connect example.com:443 -tls1_2
openssl s_client -connect example.com:443 -tls1_3

# Show supported ciphers
openssl s_client -connect example.com:443 -cipher 'ECDHE-RSA-AES256-GCM-SHA384'`,
                },
                {
                  order: 1, language: "bash", label: "Inspect local certificate files",
                  content: `# View a certificate file
openssl x509 -in cert.pem -noout -text

# Check expiry
openssl x509 -in cert.pem -noout -dates

# Verify cert matches private key (hashes must match)
openssl x509 -noout -modulus -in cert.pem | openssl md5
openssl rsa -noout -modulus -in key.pem | openssl md5

# Verify cert chain
openssl verify -CAfile ca.pem cert.pem

# Convert PEM to DER
openssl x509 -in cert.pem -outform DER -out cert.der

# Convert PFX/PKCS12 to PEM
openssl pkcs12 -in bundle.pfx -nokeys -out cert.pem
openssl pkcs12 -in bundle.pfx -nocerts -nodes -out key.pem`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Networking cheatsheet: ${net.name} (${net.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
