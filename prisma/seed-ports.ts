import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await hash(process.env.ADMIN_PASSWORD ?? "changeme", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@cheatsheet.dev" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@cheatsheet.dev",
      hashedPassword,
      role: "ADMIN",
    },
  });

  await prisma.category.deleteMany({
    where: { name: "Common Ports", userId: admin.id },
  });

  const ports = await prisma.category.create({
    data: {
      name: "Common Ports",
      icon: "🔌",
      color: "gray",
      description: "Well-known and registered TCP/UDP port numbers for web, databases, email, file transfer, remote access, messaging, and monitoring services",
      userId: admin.id,
      isPublic: true,
      snippets: {
        create: [
          // ── Port Ranges Overview ──────────────────────────────────────────
          {
            title: "Port Ranges & Concepts",
            description: "Port number ranges, TCP vs UDP, and how to check open ports",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Port number ranges",
                  content: `PORT NUMBER RANGES  (IANA classification)
  ─────────────────────────────────────────────────────────────
  Range            Name               Who assigns
  ─────────────────────────────────────────────────────────────
  0 – 1023         Well-Known Ports   IANA; require root/admin to bind
  1024 – 49151     Registered Ports   IANA registration; no root needed
  49152 – 65535    Dynamic/Private    OS assigns for ephemeral client ports
  ─────────────────────────────────────────────────────────────

TCP vs UDP
  TCP  — connection-oriented, reliable, ordered delivery
         Three-way handshake (SYN → SYN-ACK → ACK)
         Used by: HTTP, HTTPS, SSH, FTP, SMTP, databases
  UDP  — connectionless, no guarantee of delivery or order
         Low overhead, faster; used where speed > reliability
         Used by: DNS, DHCP, NTP, SNMP, VoIP, gaming, streaming

BOTH TCP AND UDP
  Many services listen on the same port number for both protocols.
  DNS (53) is the most common example — UDP for queries, TCP for zone transfers.`,
                },
                {
                  order: 1, language: "bash", label: "Check open ports",
                  content: `# List all listening ports
ss -tlnp          # TCP listening, with process name
ss -ulnp          # UDP listening
ss -tlnp | grep :80

# Older alternative
netstat -tlnp
netstat -an | grep LISTEN

# Scan ports on a remote host (nmap)
nmap 192.168.1.1                    # common ports
nmap -p 1-1024 192.168.1.1          # range
nmap -p 22,80,443 192.168.1.1       # specific ports
nmap -sU 192.168.1.1                # UDP scan
nmap -sV 192.168.1.1                # detect service versions
nmap -A 192.168.1.1                 # aggressive: OS + version + scripts

# Test if a specific port is open
nc -zv 192.168.1.1 80               # TCP
nc -zvu 192.168.1.1 53              # UDP
curl -v telnet://192.168.1.1:22

# Check what process is using a port
lsof -i :8080
fuser 8080/tcp
ss -tlnp | grep :8080`,
                },
              ],
            },
          },
          // ── Web & HTTP ────────────────────────────────────────────────────
          {
            title: "Web & HTTP",
            description: "HTTP, HTTPS, HTTP/3, proxies, and web server ports",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Web ports",
                  content: `PORT   PROTO  SERVICE         NOTES
─────────────────────────────────────────────────────────────────────
80     TCP    HTTP            Unencrypted web traffic; redirect to 443 in prod
443    TCP    HTTPS           TLS-encrypted HTTP/1.1 and HTTP/2
8080   TCP    HTTP alt        Common for dev servers, proxies, Tomcat
8443   TCP    HTTPS alt       TLS alternative; used by Tomcat, Jenkins
8000   TCP    HTTP dev        Django, Python http.server default
3000   TCP    HTTP dev        Node.js/Express, React dev server default
4200   TCP    HTTP dev        Angular CLI dev server default
5173   TCP    HTTP dev        Vite dev server default
5000   TCP    HTTP dev        Flask default
4000   TCP    HTTP dev        Phoenix (Elixir) default
8888   TCP    Jupyter         Jupyter Notebook / JupyterLab default
─────────────────────────────────────────────────────────────────────

HTTP/3 & QUIC
  443    UDP    HTTP/3 / QUIC   HTTP/3 runs over QUIC (UDP-based)
                                Announced via Alt-Svc response header

PROXY / TUNNEL
  1080   TCP    SOCKS proxy     SOCKS4/5 proxy protocol
  3128   TCP    HTTP proxy      Squid proxy default
  8118   TCP    HTTP proxy      Privoxy default`,
                },
              ],
            },
          },
          // ── Remote Access ─────────────────────────────────────────────────
          {
            title: "Remote Access & File Transfer",
            description: "SSH, Telnet, RDP, VNC, FTP, SFTP, and SCP",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Remote access ports",
                  content: `PORT   PROTO  SERVICE         NOTES
─────────────────────────────────────────────────────────────────────
22     TCP    SSH / SFTP      Secure Shell, SFTP, and SCP all use port 22
                              Change default port to reduce brute-force noise
23     TCP    Telnet          Unencrypted remote shell — avoid in production
2222   TCP    SSH alt         Common non-standard SSH port
3389   TCP    RDP             Windows Remote Desktop Protocol
5900   TCP    VNC             Virtual Network Computing (remote desktop)
5901+  TCP    VNC displays    :1 = 5901, :2 = 5902, etc.
─────────────────────────────────────────────────────────────────────

PORT   PROTO  SERVICE         NOTES
─────────────────────────────────────────────────────────────────────
20     TCP    FTP data        Active mode data transfer channel
21     TCP    FTP control     Commands and authentication (plaintext)
69     UDP    TFTP            Trivial FTP — no auth, used for PXE boot/firmware
115    TCP    SFTP (old)      Simple FTP — not the SSH-based SFTP on port 22
989    TCP    FTPS data       FTP over TLS — data channel
990    TCP    FTPS control    FTP over TLS — command channel
─────────────────────────────────────────────────────────────────────

NOTE: SFTP (SSH File Transfer Protocol) uses port 22, NOT 115.
      It is a completely separate protocol from FTP, built on SSH.`,
                },
              ],
            },
          },
          // ── Email ─────────────────────────────────────────────────────────
          {
            title: "Email",
            description: "SMTP, POP3, IMAP — submission, retrieval, and TLS variants",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Email ports",
                  content: `PORT   PROTO  SERVICE         NOTES
─────────────────────────────────────────────────────────────────────
25     TCP    SMTP            Server-to-server mail relay; blocked by ISPs for clients
465    TCP    SMTPS           SMTP over implicit TLS (deprecated then revived)
                              Use for client submission with SSL/TLS from the start
587    TCP    SMTP submission  Recommended port for client-to-server submission
                              Supports STARTTLS; requires authentication
2525   TCP    SMTP alt        Used when 587 is blocked; not an official standard

110    TCP    POP3            Retrieve email — deletes from server by default
995    TCP    POP3S           POP3 over TLS

143    TCP    IMAP            Retrieve & sync email — keeps messages on server
993    TCP    IMAPS           IMAP over TLS (implicit); use this in production
─────────────────────────────────────────────────────────────────────

WHICH SMTP PORT TO USE?
  25   — server-to-server relay only (MTA to MTA)
  587  — client submission (Outlook, Thunderbird, apps) — STARTTLS
  465  — client submission — implicit TLS (older clients, some providers)

STARTTLS vs Implicit TLS
  STARTTLS:      Connect plaintext → upgrade to TLS mid-connection (ports 587, 143, 110)
  Implicit TLS:  Start TLS immediately on connect (ports 465, 993, 995)
  Implicit TLS is simpler and preferred when available.`,
                },
              ],
            },
          },
          // ── DNS, DHCP & Network Services ──────────────────────────────────
          {
            title: "DNS, DHCP & Network Services",
            description: "DNS, DHCP, NTP, SNMP, LDAP, and network infrastructure ports",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Network services ports",
                  content: `PORT   PROTO     SERVICE         NOTES
─────────────────────────────────────────────────────────────────────
53     TCP/UDP   DNS             UDP for queries (<512 bytes); TCP for large responses
                                 and zone transfers (AXFR)
67     UDP       DHCP server     Server listens for client discover/requests
68     UDP       DHCP client     Client listens for server offers/acks
123    UDP       NTP             Network Time Protocol — clock synchronisation
161    UDP       SNMP            Simple Network Management Protocol — polling agents
162    UDP       SNMP trap       Agents send unsolicited alerts to manager
─────────────────────────────────────────────────────────────────────

PORT   PROTO     SERVICE         NOTES
─────────────────────────────────────────────────────────────────────
389    TCP/UDP   LDAP            Lightweight Directory Access Protocol (plaintext)
636    TCP       LDAPS           LDAP over TLS
3268   TCP       LDAP Global     Active Directory Global Catalog
3269   TCP       LDAPS Global    AD Global Catalog over TLS
88     TCP/UDP   Kerberos        Authentication protocol (Active Directory)
445    TCP       SMB             Windows file sharing (Samba); direct over TCP
139    TCP       NetBIOS         Older Windows file sharing over NetBIOS
137    UDP       NetBIOS NS      NetBIOS Name Service
138    UDP       NetBIOS DG      NetBIOS Datagram Service
─────────────────────────────────────────────────────────────────────

DNS-OVER-TLS / DNS-OVER-HTTPS
  853    TCP    DoT    DNS over TLS (RFC 7858)
  443    TCP    DoH    DNS over HTTPS — uses standard HTTPS port`,
                },
              ],
            },
          },
          // ── Databases ─────────────────────────────────────────────────────
          {
            title: "Databases",
            description: "Default ports for relational databases, NoSQL stores, and caches",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Relational databases",
                  content: `PORT   PROTO  DATABASE        NOTES
─────────────────────────────────────────────────────────────────────
1433   TCP    Microsoft SQL   SQL Server default instance
1434   UDP    SQL Server      SQL Server Browser Service (instance discovery)
1521   TCP    Oracle DB       Oracle Database listener default
3306   TCP    MySQL           MySQL and MariaDB default
5432   TCP    PostgreSQL      PostgreSQL default
21050  TCP    Impala          Apache Impala (HiveServer2 protocol)
─────────────────────────────────────────────────────────────────────`,
                },
                {
                  order: 1, language: "text", label: "NoSQL, cache & search",
                  content: `PORT   PROTO  SERVICE         NOTES
─────────────────────────────────────────────────────────────────────
27017  TCP    MongoDB         Default port; 27018 = shard, 27019 = config server
27018  TCP    MongoDB shard
27019  TCP    MongoDB config
6379   TCP    Redis           Default; no auth by default — bind to 127.0.0.1
6380   TCP    Redis TLS       Redis over TLS
11211  TCP/UDP Memcached      No auth by default — never expose publicly
9200   TCP    Elasticsearch   HTTP REST API
9300   TCP    Elasticsearch   Inter-node cluster communication (transport layer)
5601   TCP    Kibana          Elasticsearch visualisation dashboard
9042   TCP    Cassandra       CQL native transport port
7000   TCP    Cassandra       Inter-node cluster communication
7001   TCP    Cassandra TLS   Cluster communication over TLS
8529   TCP    ArangoDB        HTTP and WebSocket API
5984   TCP    CouchDB         HTTP REST API
8086   TCP    InfluxDB        HTTP API (v1 and v2)
8088   TCP    InfluxDB RPC    Internal RPC port (v1)
7474   TCP    Neo4j HTTP      Browser and REST API
7473   TCP    Neo4j HTTPS     Browser and REST API over TLS
7687   TCP    Neo4j Bolt      Binary Bolt protocol (drivers)
─────────────────────────────────────────────────────────────────────`,
                },
                {
                  order: 2, language: "text", label: "Message queues & streaming",
                  content: `PORT   PROTO  SERVICE         NOTES
─────────────────────────────────────────────────────────────────────
5672   TCP    AMQP            RabbitMQ default (AMQP 0-9-1)
5671   TCP    AMQPS           RabbitMQ over TLS
15672  TCP    RabbitMQ Mgmt   RabbitMQ management web UI and HTTP API
15671  TCP    RabbitMQ Mgmt   Management UI over TLS
25672  TCP    Erlang dist.    RabbitMQ inter-node / CLI communication

9092   TCP    Kafka           Broker client communication (producer/consumer)
9093   TCP    Kafka TLS       Kafka over TLS
9094   TCP    Kafka SASL      Kafka with SASL authentication
2181   TCP    ZooKeeper       Client connections (Kafka's older dependency)
2888   TCP    ZooKeeper       Follower connects to leader
3888   TCP    ZooKeeper       Leader election

4222   TCP    NATS            Client connections
6222   TCP    NATS cluster    Inter-server routing
8222   TCP    NATS monitoring HTTP monitoring endpoint

1883   TCP    MQTT            Message Queue Telemetry Transport (IoT)
8883   TCP    MQTTS           MQTT over TLS
9000   TCP    ActiveMQ        Openwire protocol (also 61616)
61616  TCP    ActiveMQ        Default OpenWire port
─────────────────────────────────────────────────────────────────────`,
                },
              ],
            },
          },
          // ── Containers & Orchestration ────────────────────────────────────
          {
            title: "Containers & Orchestration",
            description: "Docker, Kubernetes, etcd, Consul, and container registry ports",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Docker & container runtime",
                  content: `PORT   PROTO  SERVICE         NOTES
─────────────────────────────────────────────────────────────────────
2375   TCP    Docker daemon   Unencrypted — NEVER expose publicly (full root access!)
2376   TCP    Docker daemon   TLS-encrypted Docker daemon API
2377   TCP    Docker Swarm    Swarm cluster management communications
4789   UDP    Docker VXLAN    Overlay network data traffic (Swarm)
7946   TCP/UDP Docker Swarm   Container network discovery

5000   TCP    Docker Registry Private Docker registry (Distribution) HTTP
443    TCP    Docker Hub      Docker Hub pull/push over HTTPS
─────────────────────────────────────────────────────────────────────`,
                },
                {
                  order: 1, language: "text", label: "Kubernetes",
                  content: `PORT   PROTO  SERVICE         NOTES
─────────────────────────────────────────────────────────────────────
6443   TCP    kube-apiserver  Kubernetes API server (HTTPS) — main entry point
2379   TCP    etcd client     etcd client requests (key-value store for cluster state)
2380   TCP    etcd peer       etcd peer communication (leader election, replication)
10250  TCP    kubelet         API that kube-apiserver and kubectl exec/logs talk to
10259  TCP    kube-scheduler  HTTPS port for scheduler
10257  TCP    kube-controller HTTPS port for controller manager
10256  TCP    kube-proxy      Health check port for kube-proxy
30000- TCP    NodePort        Kubernetes NodePort service range (default)
32767

179    TCP    BGP             Calico / BGP routing between nodes
4789   UDP    VXLAN           Flannel / Calico VXLAN overlay network
8472   UDP    VXLAN           Flannel VXLAN (alternative)
51820  UDP    WireGuard       Calico WireGuard encrypted overlay
─────────────────────────────────────────────────────────────────────`,
                },
                {
                  order: 2, language: "text", label: "Service mesh & discovery",
                  content: `PORT   PROTO  SERVICE         NOTES
─────────────────────────────────────────────────────────────────────
8500   TCP    Consul HTTP     Consul HTTP API and web UI
8501   TCP    Consul HTTPS    Consul HTTPS API
8502   TCP    Consul gRPC     Consul gRPC API (Envoy xDS)
8600   TCP/UDP Consul DNS     Consul built-in DNS server
8300   TCP    Consul server   RPC: server-to-server communication
8301   TCP/UDP Consul LAN     Serf LAN gossip between cluster members
8302   TCP/UDP Consul WAN     Serf WAN gossip between datacentres

15000  TCP    Envoy admin     Envoy proxy admin interface
15001  TCP    Envoy outbound  Istio: all outbound traffic intercepted
15006  TCP    Envoy inbound   Istio: all inbound traffic intercepted
15008  TCP    Envoy HBONE     Istio ambient mesh tunnel
15010  TCP    istiod gRPC     Istiod plaintext (xDS, registration)
15012  TCP    istiod HTTPS    Istiod secure xDS
15014  TCP    istiod monitor  Istiod control-plane monitoring
15021  TCP    Istio health    Istio sidecar health check
─────────────────────────────────────────────────────────────────────`,
                },
              ],
            },
          },
          // ── Monitoring & Observability ─────────────────────────────────────
          {
            title: "Monitoring & Observability",
            description: "Prometheus, Grafana, Jaeger, Zipkin, and metrics collection ports",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "Metrics & tracing",
                  content: `PORT   PROTO  SERVICE         NOTES
─────────────────────────────────────────────────────────────────────
9090   TCP    Prometheus      Prometheus server HTTP (metrics query + scrape)
9091   TCP    Pushgateway     Prometheus Pushgateway (push metrics from batch jobs)
9093   TCP    Alertmanager    Prometheus Alertmanager HTTP API and UI
9094   TCP    Alertmanager    Alertmanager cluster communication (mesh)
9100   TCP    Node Exporter   Host hardware and OS metrics for Prometheus
9113   TCP    Nginx Exporter  Nginx metrics exporter for Prometheus
9121   TCP    Redis Exporter  Redis metrics exporter for Prometheus
9187   TCP    Postgres Exp.   PostgreSQL metrics exporter for Prometheus
9104   TCP    MySQL Exporter  MySQL metrics exporter for Prometheus

3000   TCP    Grafana         Grafana dashboard UI (default)
3100   TCP    Loki            Grafana Loki log aggregation HTTP API
9095   TCP    Loki gRPC       Loki gRPC port
4317   TCP    OTLP gRPC       OpenTelemetry collector gRPC receiver
4318   TCP    OTLP HTTP       OpenTelemetry collector HTTP receiver

14250  TCP    Jaeger gRPC     Jaeger collector gRPC (model.proto)
14268  TCP    Jaeger HTTP     Jaeger collector HTTP (Thrift)
16686  TCP    Jaeger UI       Jaeger query service web UI
9411   TCP    Zipkin          Zipkin distributed tracing HTTP API
─────────────────────────────────────────────────────────────────────`,
                },
              ],
            },
          },
          // ── VPN & Security ────────────────────────────────────────────────
          {
            title: "VPN, Security & Networking Tools",
            description: "VPN protocols, IDS/IPS, certificate services, and security tool ports",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "VPN protocols",
                  content: `PORT   PROTO     SERVICE         NOTES
─────────────────────────────────────────────────────────────────────
1194   TCP/UDP   OpenVPN         Default; UDP preferred for performance
1723   TCP       PPTP            Point-to-Point Tunneling — insecure, avoid
500    UDP       IKEv1/IKEv2     IPsec key exchange (ISAKMP)
4500   UDP       IPsec NAT-T     IPsec NAT traversal (ESP over UDP)
51820  UDP       WireGuard       Modern, fast VPN — default port
1701   UDP       L2TP            L2TP tunneling (used with IPsec)
443    TCP       SSL VPN         Many commercial VPNs tunnel over HTTPS
─────────────────────────────────────────────────────────────────────

PORT   PROTO     SERVICE         NOTES
─────────────────────────────────────────────────────────────────────
8140   TCP       Puppet          Puppet master agent communication
2376   TCP       Docker TLS      (see containers section)
8443   TCP       Various         Common alt-HTTPS for admin UIs
4848   TCP       GlassFish       GlassFish admin console
8834   TCP       Nessus          Nessus vulnerability scanner web UI
9390   TCP       OpenVAS         OpenVAS manager
9391   TCP       OpenVAS         OpenVAS administrator

CERTIFICATE & PKI
  80    TCP    OCSP/CRL HTTP    Certificate revocation list download, OCSP check
  389   TCP    LDAP             Certificate publication in directory
  636   TCP    LDAPS            Secure LDAP for certificate operations`,
                },
              ],
            },
          },
          // ── CI/CD & Developer Tools ───────────────────────────────────────
          {
            title: "CI/CD & Developer Tools",
            description: "Jenkins, GitLab, Vault, and common developer service ports",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "text", label: "CI/CD & DevOps tools",
                  content: `PORT   PROTO  SERVICE         NOTES
─────────────────────────────────────────────────────────────────────
8080   TCP    Jenkins         Jenkins web UI (default)
50000  TCP    Jenkins agent   JNLP agent inbound connection port
9000   TCP    SonarQube       SonarQube web UI (also used by Portainer)

80/443 TCP    GitLab          GitLab web UI over HTTP/HTTPS
22     TCP    GitLab SSH      Git over SSH (same as system SSH or alt port 2222)
8080   TCP    GitLab Puma     Puma web server (internal)

3000   TCP    Gitea           Gitea web UI default
3000   TCP    Grafana         (same port — conflict if co-hosted)

8200   TCP    Vault           HashiCorp Vault HTTP API and UI
8201   TCP    Vault cluster   Vault cluster request forwarding

4646   TCP    Nomad HTTP      HashiCorp Nomad HTTP API
4647   TCP    Nomad RPC       Nomad RPC
4648   TCP    Nomad Serf      Nomad Serf WAN gossip

8761   TCP    Eureka          Netflix Eureka service discovery
8500   TCP    Consul          (see containers section)
2181   TCP    ZooKeeper       (see messaging section)
─────────────────────────────────────────────────────────────────────`,
                },
                {
                  order: 1, language: "text", label: "Quick reference — all ports at a glance",
                  content: `QUICK REFERENCE — MOST COMMON PORTS
  ──────────────────────────────────────────────────────────
  Port   Service               Port   Service
  ──────────────────────────────────────────────────────────
  20     FTP data              3000   Grafana / Node dev
  21     FTP control           3306   MySQL / MariaDB
  22     SSH / SFTP / SCP      3389   RDP (Windows)
  23     Telnet (insecure)     5432   PostgreSQL
  25     SMTP (relay)          5672   AMQP (RabbitMQ)
  53     DNS                   5900   VNC
  67/68  DHCP                  6379   Redis
  80     HTTP                  6443   Kubernetes API
  88     Kerberos              8080   HTTP alt / Jenkins
  110    POP3                  8200   HashiCorp Vault
  123    NTP                   8443   HTTPS alt
  143    IMAP                  8883   MQTT over TLS
  161    SNMP                  9042   Cassandra CQL
  179    BGP                   9090   Prometheus
  389    LDAP                  9092   Kafka
  443    HTTPS / HTTP/3 UDP    9200   Elasticsearch
  445    SMB                   9300   Elasticsearch cluster
  465    SMTPS                 9411   Zipkin
  500    IKEv2 (IPsec)         15672  RabbitMQ Mgmt UI
  514    Syslog (UDP)          16686  Jaeger UI
  587    SMTP submission       27017  MongoDB
  636    LDAPS                 51820  WireGuard
  993    IMAPS                 50000  Jenkins agent
  995    POP3S
  1194   OpenVPN
  1433   SQL Server
  1883   MQTT
  ──────────────────────────────────────────────────────────`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Common Ports cheatsheet: ${ports.name} (${ports.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
