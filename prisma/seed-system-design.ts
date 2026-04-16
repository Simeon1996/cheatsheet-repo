import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.category.deleteMany({
    where: { name: "System Design", userId: null },
  });

  const systemDesign = await prisma.category.create({
    data: {
      name: "System Design",
      icon: "🏗️",
      color: "blue",
      description:
        "Cheatsheet for optimal system design — scalability, caching, databases, load balancing, consistency models, and common patterns",
      isPublic: true,
      snippets: {
        create: [
          // ── Core Principles ───────────────────────────────────────────────────
          {
            title: "Core Principles",
            description: "Fundamental properties every distributed system must balance",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "markdown",
                  label: "Key properties",
                  content: `# Core System Design Properties

| Property       | Description                                             |
|----------------|---------------------------------------------------------|
| Scalability    | Handle growth without redesign                          |
| Availability   | Uptime target (99.99% = ~52 min downtime/year)          |
| Consistency    | All nodes see the same data at the same time            |
| Durability     | Data survives failures                                  |
| Latency        | Response time — track p50, p95, p99                     |
| Throughput     | Requests handled per second (RPS)                       |

# CAP Theorem
Pick 2: Consistency · Availability · Partition Tolerance
Partition tolerance is mandatory in real distributed systems.
→ Choose CP (banks, inventory) or AP (social feeds, DNS).

# PACELC Extension
If Partition → choose P or A
Else (no partition) → choose Latency or Consistency`,
                },
                {
                  order: 1,
                  language: "markdown",
                  label: "Availability tiers",
                  content: `# Availability Tiers (nines)

| SLA      | Downtime / year | Downtime / month |
|----------|-----------------|------------------|
| 99%      | 3.65 days       | 7.2 hours        |
| 99.9%    | 8.76 hours      | 43.2 minutes     |
| 99.99%   | 52.6 minutes    | 4.3 minutes      |
| 99.999%  | 5.3 minutes     | 26 seconds       |
| 99.9999% | 31.5 seconds    | 2.6 seconds      |

# Failure Rate Arithmetic
Combined availability of N sequential dependencies:
  A_total = A1 × A2 × ... × An
  3 × 99.9% services in series → 99.7% combined

Parallel (redundant) services:
  A_total = 1 − (1 − A)^N
  2 × 99% in parallel → 99.99%`,
                },
              ],
            },
          },
          // ── Estimation ────────────────────────────────────────────────────────
          {
            title: "Back-of-Envelope Estimation",
            description: "Quick reference numbers for capacity and latency estimation",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "markdown",
                  label: "RPS and storage rules of thumb",
                  content: `# Request Rate Conversions
1 million  req/day  →  ~12 RPS
10 million req/day  →  ~115 RPS
100M req/day        →  ~1,160 RPS
1 billion  req/day  →  ~11,600 RPS

# Storage Rules of Thumb
1 KB × 1M users     →  ~1 GB
1 MB × 1M users     →  ~1 TB
1 GB × 1M users     →  ~1 PB

# Bandwidth
1 Gbps link         →  ~125 MB/s throughput
CDN edge node       →  10–100 Gbps capacity

# Quick conversions
1 KB = 10^3 bytes   (text message, small JSON)
1 MB = 10^6 bytes   (photo thumbnail)
1 GB = 10^9 bytes   (HD video minute)
1 TB = 10^12 bytes  (personal laptop disk)`,
                },
                {
                  order: 1,
                  language: "markdown",
                  label: "Latency reference table",
                  content: `# Latency Numbers (approximate, 2024)

| Operation                   | Latency        |
|-----------------------------|----------------|
| L1 cache reference          | 1 ns           |
| L2 cache reference          | 4 ns           |
| L3 cache reference          | 40 ns          |
| Main memory (RAM) access    | 100 ns         |
| Compress 1 KB (Snappy)      | 3 µs           |
| Read 1 MB from RAM          | 10 µs          |
| SSD random read             | 100 µs         |
| Read 1 MB from SSD          | 200 µs         |
| Round trip within datacenter| 500 µs – 1 ms  |
| HDD seek                    | 5–10 ms        |
| Network RTT same region     | 1–2 ms         |
| Network RTT cross-region    | 50–150 ms      |
| Network RTT cross-continent | 100–300 ms     |

Rule: RAM is 100× faster than SSD; SSD is 100× faster than HDD.`,
                },
              ],
            },
          },
          // ── Scaling Patterns ─────────────────────────────────────────────────
          {
            title: "Scaling Patterns",
            description: "Vertical vs horizontal scaling, sharding, and partitioning strategies",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "markdown",
                  label: "Vertical vs horizontal scaling",
                  content: `# Vertical Scaling (Scale Up)
→ Bigger CPU, more RAM, faster disk on one machine
+ Simple — no code changes, no distribution overhead
- Hard ceiling (largest machine available)
- Single point of failure
- Expensive at high end

# Horizontal Scaling (Scale Out)
→ More machines, distribute load
+ No ceiling, add machines on demand
+ Fault tolerant (N-1 redundancy)
- Requires stateless services or distributed state
- Adds coordination complexity

# Rule of Thumb
Scale vertically first (cheap, fast, good ROI).
Switch to horizontal when vertical ceiling approaches
or when fault tolerance requirements exceed what one
machine can provide.`,
                },
                {
                  order: 1,
                  language: "markdown",
                  label: "Database scaling strategies",
                  content: `# Database Scaling Decision Tree

Read-heavy workload
  → Add read replicas (primary handles writes, replicas serve reads)
  → Add a caching layer (Redis/Memcached) in front
  → Denormalise hot query paths

Write-heavy workload
  → Sharding (partition data across multiple primaries)
  → CQRS — separate write model from read model
  → Event sourcing + async projections

Large tables
  → Vertical partitioning — split rarely-used columns to separate table
  → Horizontal partitioning — split rows by range/hash
  → Archive old data to cold storage

# Read Replica Lag
Replica lag = async replication delay (ms to seconds).
Always read from primary for read-your-writes consistency.
Send analytics / reporting queries to replicas.`,
                },
                {
                  order: 2,
                  language: "markdown",
                  label: "Sharding strategies",
                  content: `# Sharding Strategies

| Strategy         | How                              | Best For              | Watch Out For        |
|------------------|----------------------------------|-----------------------|----------------------|
| Hash sharding    | shard = hash(key) % N            | Even distribution     | Resharding is painful|
| Range sharding   | shard by key range               | Range/sorted queries  | Hot spots (popular ranges) |
| Directory sharding | lookup table → shard           | Flexible mapping      | Extra hop per query  |
| Geo sharding     | shard by region/country          | Data locality, GDPR   | Cross-region queries |
| Consistent hashing | hash ring, virtual nodes       | Elastic clusters      | Complexity           |

# Consistent Hashing (key insight)
When a shard is added/removed, only K/N keys need to be remapped
(K = total keys, N = number of shards).
Used by: Cassandra, DynamoDB, Redis Cluster.

# Hotspot Mitigation
Append random suffix to hot keys → spread across shards.
Batch writes and fan out with a background job.`,
                },
              ],
            },
          },
          // ── Caching ───────────────────────────────────────────────────────────
          {
            title: "Caching",
            description: "Where to cache, invalidation strategies, and common cache failure modes",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "markdown",
                  label: "Cache hierarchy",
                  content: `# Cache Hierarchy (fastest → slowest)

Client-side      Browser cache, service worker
                 → near-zero latency, no server hit

CDN / Edge       Cloudflare, Akamai, Fastly
                 → global PoPs, cache static + dynamic content

App-layer        In-process LRU map (e.g. node-lru-cache)
                 → sub-millisecond, evicted on restart

Distributed      Redis, Memcached
                 → shared across service instances, ~1 ms

Database         Query cache, materialized views
                 → pre-computed join results

# Cache Hit Rate Impact
Hit rate 99% → DB handles 1% of queries
Hit rate 90% → DB handles 10% of queries  ← 10× more load
Hit rate 80% → DB handles 20% of queries  ← 20× more load

A 1% improvement in hit rate → ~11% reduction in DB load.`,
                },
                {
                  order: 1,
                  language: "markdown",
                  label: "Invalidation strategies",
                  content: `# Cache Invalidation Strategies

| Pattern        | Write Path                           | Read Path                | Trade-off                  |
|----------------|--------------------------------------|--------------------------|----------------------------|
| Cache-aside    | Write to DB only; invalidate cache   | App checks cache, DB miss| Simple; brief inconsistency|
| Read-through   | Write to DB only                     | Cache fetches DB on miss | Cache owns data fetch logic|
| Write-through  | Write to cache AND DB synchronously  | Always hit cache         | Writes slower; consistent  |
| Write-behind   | Write to cache; async flush to DB    | Always hit cache         | Fast writes; risk of loss  |
| Refresh-ahead  | Proactively refresh near-expiry keys | Always hit cache         | Complex; wastes if not read|

# TTL Guidelines
User profile / session:   5–30 minutes
Product catalog:          1–24 hours
Static assets (CDN):      1 day – 1 year (with content hashing)
Rate limit counters:      1 second – 1 minute (sliding window)
Never cache:              Financial balances, inventory counts (consistency-critical)`,
                },
                {
                  order: 2,
                  language: "markdown",
                  label: "Cache failure modes",
                  content: `# Cache Failure Modes and Mitigations

## Cache Stampede (thundering herd)
Problem: Many requests hit DB simultaneously after cache expires.
Fix:
  1. Mutex/lock: only one worker rebuilds the cache
  2. Probabilistic early expiry: refresh before TTL expires
  3. Background refresh: serve stale while refreshing async

## Cache Penetration
Problem: Requests for non-existent keys bypass cache every time.
Fix:
  1. Cache null/empty results with short TTL
  2. Bloom filter: reject known non-existent keys at the edge

## Cache Avalanche
Problem: Many keys expire at the same time → DB overload.
Fix:
  1. Jitter TTLs: TTL = base + random(0, base*0.1)
  2. Pre-warm cache on startup / after deployment
  3. Circuit breaker: shed load if DB latency spikes

## Cache Inconsistency
Problem: Cache and DB diverge (stale reads).
Fix:
  1. Short TTLs + accept eventual consistency
  2. Write-through for critical data paths
  3. Event-driven invalidation (CDC → delete cache key)`,
                },
              ],
            },
          },
          // ── Load Balancing ────────────────────────────────────────────────────
          {
            title: "Load Balancing",
            description: "Layer 4 vs Layer 7, algorithms, health checks and sticky sessions",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "markdown",
                  label: "L4 vs L7 load balancing",
                  content: `# Layer 4 (Transport) Load Balancer
Operates on: TCP/UDP — routes by IP + port only
Examples: AWS NLB, HAProxy (TCP mode), IPVS
Pros:  Very fast (no packet inspection), handles any protocol
Cons:  No routing by URL/header/cookie

# Layer 7 (Application) Load Balancer
Operates on: HTTP/HTTPS — can inspect request content
Examples: AWS ALB, Nginx, Envoy, Traefik
Pros:  Route by path, host, header, cookie; SSL termination;
       WebSocket; gRPC; sticky sessions; canary deployments
Cons:  Slightly more overhead; only HTTP/gRPC

# When to use which
L4: raw TCP services, databases, anything non-HTTP
L7: web APIs, microservices, anything HTTP — almost always the right choice

# DNS Load Balancing
Cheapest option: return multiple A records (round-robin DNS).
Limitation: clients cache DNS; slow failover; no health checks.
Use for: multi-region active-active with GeoDNS.`,
                },
                {
                  order: 1,
                  language: "markdown",
                  label: "LB algorithms and sticky sessions",
                  content: `# Load Balancing Algorithms

| Algorithm             | How                                    | Best For                      |
|-----------------------|----------------------------------------|-------------------------------|
| Round Robin           | Rotate through servers in order        | Homogeneous servers           |
| Weighted Round Robin  | Round robin with capacity weights      | Mixed server sizes            |
| Least Connections     | Route to server with fewest active     | Long-lived connections        |
| Least Response Time   | Route to fastest-responding server     | Latency-sensitive workloads   |
| IP Hash               | hash(client_ip) % N → same server      | Simple sticky sessions        |
| Random                | Pick a random server                   | Simple, low overhead          |
| Resource-Based        | Route based on server CPU/mem metrics  | Heterogeneous loads           |

# Sticky Sessions (Session Affinity)
Purpose: Route same client to same server (stateful apps).
Methods:
  1. Cookie-based (preferred): LB injects a routing cookie
  2. IP hash: consistent but breaks with NAT / mobile clients
Downside: Uneven load if one client is heavy.
Better alternative: Move state out of the server (Redis sessions).

# Health Checks
Active:  LB pings /health endpoint every N seconds
Passive: LB tracks error rates and removes bad backends
Graceful drain: stop sending new requests, let in-flight finish`,
                },
              ],
            },
          },
          // ── Databases ────────────────────────────────────────────────────────
          {
            title: "Database Selection",
            description: "Choosing the right database for the job and key trade-offs",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "markdown",
                  label: "Database types and use cases",
                  content: `# Database Selection Guide

| Category          | Options                         | Best For                                    |
|-------------------|---------------------------------|---------------------------------------------|
| Relational (ACID) | PostgreSQL, MySQL, CockroachDB  | Structured data, transactions, joins        |
| Wide-column       | Cassandra, DynamoDB, HBase      | High write throughput, time-series, IoT     |
| Document          | MongoDB, CouchDB, Firestore     | Flexible schema, JSON-native, nested objects|
| Key-Value         | Redis, DynamoDB, etcd           | Sessions, caching, feature flags, locks     |
| Graph             | Neo4j, Amazon Neptune, ArangoDB | Social graphs, recommendations, fraud detect|
| Full-text search  | Elasticsearch, OpenSearch       | Log analytics, search-as-you-type           |
| Time-series       | InfluxDB, TimescaleDB, Prometheus| Metrics, telemetry, financial tick data     |
| Data warehouse    | BigQuery, Redshift, Snowflake   | OLAP, reporting, ML feature stores          |
| NewSQL            | CockroachDB, Spanner, YugabyteDB| Global ACID with horizontal scale           |

# Relational vs NoSQL Decision
Use relational when:
  - You need ACID transactions across multiple entities
  - Data is highly structured with stable schema
  - Complex join queries are common
Use NoSQL when:
  - Schema evolves rapidly
  - Write throughput exceeds what one primary can handle
  - Data access pattern is always by primary key (no joins)`,
                },
                {
                  order: 1,
                  language: "markdown",
                  label: "ACID vs BASE",
                  content: `# ACID (Relational databases)
Atomicity   — all operations in a transaction succeed or all fail
Consistency — transaction brings DB from one valid state to another
Isolation   — concurrent transactions don't see each other's interim state
Durability  — committed data survives crashes (written to disk/WAL)

# BASE (Most NoSQL systems)
Basically Available    — system remains available even during failures
Soft state             — state may change over time without input
Eventually Consistent  — replicas converge to same state eventually

# Isolation Levels (weakest → strongest)
Read Uncommitted  → dirty reads possible
Read Committed    → no dirty reads; non-repeatable reads possible (PostgreSQL default)
Repeatable Read   → no dirty/non-repeatable reads; phantom reads possible
Serializable      → full isolation; highest consistency, lowest throughput

# When eventual consistency is acceptable
- Social media feeds, likes, view counts
- Product recommendations
- DNS propagation
- Shopping cart reads (not checkout)

When it is NOT acceptable
- Bank transfers, debit/credit balance
- Inventory reservation ("only 1 item left")
- Seat/ticket booking systems`,
                },
                {
                  order: 2,
                  language: "markdown",
                  label: "Indexing strategies",
                  content: `# Indexing Strategies

# B-Tree index (default in most RDBMS)
→ Efficient for equality, range, ORDER BY, prefix LIKE
→ Penalty: slower writes; extra storage per index

# Hash index
→ Exact equality lookups only — O(1)
→ Cannot do range queries or sort

# Composite index
CREATE INDEX idx ON orders (user_id, created_at DESC);
Rule: put equality columns first, range/sort column last.
"Left-prefix rule" — query must use leading columns.

# Covering index
Index includes all columns the query needs → no table row lookup.

# Partial index (PostgreSQL)
CREATE INDEX idx ON orders (user_id) WHERE status = 'pending';
→ Small index; only indexes relevant rows.

# Tips
- Every query's WHERE + JOIN + ORDER BY clause needs an index plan
- Too many indexes slow writes (every insert updates all indexes)
- Use EXPLAIN ANALYZE to confirm index is actually used
- Hot read path with no index → full table scan → latency spike at scale`,
                },
              ],
            },
          },
          // ── Consistency Models ────────────────────────────────────────────────
          {
            title: "Consistency Models",
            description: "Spectrum from eventual to linearizable — when to use each",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "markdown",
                  label: "Consistency spectrum",
                  content: `# Consistency Models (weakest → strongest)

Eventual Consistency
  - Replicas converge eventually if no new writes
  - Examples: DNS, Cassandra (default), DynamoDB (default)
  - Use: social feeds, view counts, recommendations

Monotonic Read Consistency
  - If you read a value, future reads never return older values
  - Examples: sticky-session reads on replica set

Read-Your-Writes Consistency
  - After you write, you always see your own write
  - Examples: read from primary after write; or route same user to same replica

Causal Consistency
  - Causally related operations are seen in order by all nodes
  - Examples: CockroachDB, MongoDB causal sessions

Sequential Consistency
  - All operations appear to execute in some global sequential order
  - All nodes agree on that order

Linearizability (Strict Consistency)
  - Strongest: every operation appears to take effect atomically at a single point
  - Examples: etcd, ZooKeeper, Google Spanner
  - Cost: high latency (consensus round-trips); low throughput

# Rule of thumb
Most web apps: read-your-writes + eventual consistency is enough.
Financial transactions: serializable isolation.
Distributed coordination (leader election, locks): linearizable.`,
                },
              ],
            },
          },
          // ── Communication Patterns ────────────────────────────────────────────
          {
            title: "Communication Patterns",
            description: "Sync vs async, REST vs gRPC, message queues and event streaming",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "markdown",
                  label: "Sync vs async communication",
                  content: `# Synchronous Communication
Client sends request → waits for response → continues.
Examples: REST HTTP, gRPC, GraphQL
Pros:  Simple mental model; easy error handling; immediate feedback
Cons:  Caller blocks; cascading failures if downstream is slow/down
       Tight coupling; hard to scale independently

# Asynchronous Communication
Producer sends message → returns immediately → consumer processes later.
Examples: Kafka, RabbitMQ, SQS, AWS SNS, Redis Streams
Pros:  Decoupled; handles traffic spikes (queue absorbs bursts)
       Retry on failure; temporal decoupling; easier fan-out
Cons:  Eventual consistency; harder to debug; ordering challenges

# When to use async
- Non-blocking side effects (send email, push notification)
- Fan-out to multiple consumers (order placed → billing + inventory + email)
- Smoothing traffic bursts (e-commerce flash sale)
- Cross-service workflows that can tolerate delay

# REST vs gRPC
REST:   JSON over HTTP/1.1; human-readable; universal client support
gRPC:   Protobuf over HTTP/2; strongly typed; 5–10× smaller payload
        bidirectional streaming; great for internal microservice calls`,
                },
                {
                  order: 1,
                  language: "markdown",
                  label: "Message queues vs event streaming",
                  content: `# Message Queue (RabbitMQ, SQS, ActiveMQ)
- Message delivered to ONE consumer (competing consumers)
- Message deleted after acknowledgment
- Use for: task queues, job workers, order processing

# Event Streaming (Kafka, Kinesis, Pulsar)
- Message retained for configurable period (days/weeks)
- Multiple consumer groups each read ALL messages independently
- Ordered within a partition
- Use for: audit logs, event sourcing, CDC, analytics pipelines

# At-most-once vs At-least-once vs Exactly-once

At-most-once   → fire and forget; message may be lost
               Use: metrics/telemetry where loss is acceptable

At-least-once  → retry on failure; message may be processed twice
               Use: most systems (make consumers idempotent)

Exactly-once   → guaranteed exactly one delivery
               Use: financial transactions
               Cost: significant overhead; requires transactions + dedup

# Idempotency
Design consumers to handle duplicate messages safely:
  - Track processed message IDs in Redis/DB
  - Use natural idempotency keys (order ID, event ID)
  - "SET inventory:sku:123 50" is idempotent; "DECR inventory:sku:123" is not`,
                },
              ],
            },
          },
          // ── Common Patterns ───────────────────────────────────────────────────
          {
            title: "Common Architectural Patterns",
            description: "Rate limiting, circuit breaker, CQRS, saga and distributed locking",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "markdown",
                  label: "Rate limiting algorithms",
                  content: `# Rate Limiting Algorithms

## Token Bucket
- Bucket holds N tokens; refilled at R tokens/second
- Each request consumes 1 token; reject if bucket empty
- Allows bursts up to bucket size
- Use: API rate limiting per user

## Leaky Bucket
- Requests enter a fixed-size queue; processed at fixed rate
- Excess requests dropped immediately
- Smooths bursty traffic into steady output rate
- Use: enforcing constant throughput (e.g., payment gateway)

## Fixed Window Counter
- Count requests per time window (e.g., per minute)
- Simple; can allow 2× limit at window boundary
- Use: coarse-grained limits (1000 req/day)

## Sliding Window Log
- Store timestamp of each request; count in last N seconds
- Accurate but high memory usage per user
- Use: when precision matters

## Sliding Window Counter
- Hybrid: uses fixed counters with weighted boundary overlap
- Low memory; near-exact
- Use: production rate limiting at scale (Cloudflare, Stripe)

# Implementation
Store counters in Redis (atomic INCR + EXPIRE).
Distribute key as: ratelimit:{userId}:{window}`,
                },
                {
                  order: 1,
                  language: "markdown",
                  label: "Circuit breaker and bulkhead",
                  content: `# Circuit Breaker Pattern
Prevents cascading failures by stopping calls to a failing service.

States:
  CLOSED   → Normal. Requests pass through. Track error rate.
  OPEN     → Tripped. Reject all requests immediately (fast fail).
  HALF-OPEN → After cool-down, allow a probe request.
             If succeeds → CLOSED. If fails → OPEN again.

Thresholds (tune to your SLO):
  Error rate > 50% in last 10 requests → trip to OPEN
  Cool-down period: 30–60 seconds

Libraries: Resilience4j (Java), Hystrix (deprecated), Polly (.NET), opossum (Node)

# Bulkhead Pattern
Isolate resources so one failing component can't exhaust shared resources.
Example: separate thread pools / connection pools per downstream service.
If Service A is slow, it only exhausts its own pool, not Service B's.

# Retry with Exponential Backoff + Jitter
delay = min(cap, base * 2^attempt) + random(0, jitter)
Example: 100ms, 200ms, 400ms, 800ms ± random
Always cap max retries (3–5) and max delay (30s).
Always use jitter to avoid retry storms (synchronized retries amplify load).`,
                },
                {
                  order: 2,
                  language: "markdown",
                  label: "CQRS and Event Sourcing",
                  content: `# CQRS (Command Query Responsibility Segregation)
Separate the write model (commands) from the read model (queries).

Write side:  Receives commands → validates → updates source of truth
Read side:   Pre-built, denormalised views optimised for specific queries

Benefits:
  - Scale read and write sides independently
  - Read model can be rebuilt from events at any time
  - Multiple read models for different use cases (mobile, web, analytics)

Complexity cost:
  - Eventual consistency between write and read sides
  - More moving parts; harder to debug

# Event Sourcing
Store state as an immutable sequence of events, not current values.
Current state = replay all events from the beginning (or snapshot + recent events).

Benefits:
  - Complete audit log for free
  - Time-travel debugging (replay to any point)
  - Easy to add new projections retroactively

When to use CQRS + Event Sourcing together:
  - Complex domains with rich business logic (DDD)
  - Audit/compliance requirements
  - Systems that need to rebuild read models
Overkill for: CRUD apps, simple APIs, early-stage products`,
                },
                {
                  order: 3,
                  language: "markdown",
                  label: "Saga pattern for distributed transactions",
                  content: `# Saga Pattern
Manages multi-step distributed transactions without 2PC.
Each step has a compensating transaction to undo it on failure.

## Choreography Saga
Each service listens for events and emits its own events.
OrderService → emits OrderPlaced
  PaymentService → listens → emits PaymentProcessed or PaymentFailed
    InventoryService → listens → emits InventoryReserved
      ShippingService → listens → emits ShipmentCreated

On failure: each service listens for failure events and runs compensation.
Pro: fully decoupled   Con: hard to track overall state; debugging is painful

## Orchestration Saga
A central orchestrator sends commands and listens for replies.
SagaOrchestrator → COMMAND: ProcessPayment → PaymentService
                 → REPLY: PaymentProcessed
                 → COMMAND: ReserveInventory → InventoryService
                 → REPLY: InventoryReserved
                 → COMMAND: CreateShipment → ShippingService

On failure: orchestrator issues compensating commands in reverse order.
Pro: clear control flow; easy to monitor   Con: orchestrator is a bottleneck

# Distributed Lock
Use Redis SET NX EX for short-lived locks.
Always include a random token — release only your own lock (Lua script).
Redlock: acquire majority of N Redis nodes → safer for critical sections.`,
                },
              ],
            },
          },
          // ── CDN & DNS ─────────────────────────────────────────────────────────
          {
            title: "CDN, DNS & Networking",
            description: "Content delivery, DNS resolution, and networking fundamentals",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "markdown",
                  label: "CDN and DNS",
                  content: `# CDN (Content Delivery Network)
Caches content at Points of Presence (PoPs) geographically close to users.

Cache static assets: JS, CSS, images, fonts, videos → set long TTL + content hash
Cache dynamic API responses: short TTL (1–60s) with stale-while-revalidate
Edge compute: run code at the CDN edge (Cloudflare Workers, Lambda@Edge)

CDN reduces:
  - Origin server load (offloads 80–95% of static traffic)
  - Latency (user fetches from nearest PoP instead of origin)
  - Bandwidth costs (CDN egress is cheaper than origin egress)

# DNS Resolution Flow
1. Browser checks local DNS cache
2. OS checks /etc/hosts + local resolver cache
3. Recursive resolver (ISP or 8.8.8.8) checks its cache
4. If miss → queries root nameserver → TLD nameserver → authoritative nameserver
5. Answer cached at each layer with TTL

TTL guidelines:
  Low TTL (60s)   → easy failover; more DNS queries; use during deployments
  High TTL (3600s)→ fewer queries; cached everywhere; slow failover

# GeoDNS
Return different IP per region based on client's resolver IP.
Use for: multi-region active-active; data residency compliance.`,
                },
              ],
            },
          },
          // ── Design Interview Framework ─────────────────────────────────────────
          {
            title: "System Design Interview Framework",
            description: "Step-by-step approach for tackling system design interview questions",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0,
                  language: "markdown",
                  label: "Interview step-by-step",
                  content: `# System Design Interview — 45-Minute Framework

## Step 1: Clarify Requirements (5 min)
Functional:   What does the system do? Core features only.
Non-functional: Scale? Latency SLA? Availability? Consistency?
Out of scope:   Explicitly exclude features you won't design.

Example questions:
  "How many users? DAU/MAU?"
  "Read-heavy or write-heavy?"
  "Global or single-region?"
  "Strong consistency required?"

## Step 2: Capacity Estimation (3 min)
- Estimate DAU, RPS (reads + writes)
- Estimate storage per day / year
- Estimate bandwidth in/out

## Step 3: High-Level Design (10 min)
Draw boxes: Client → CDN → LB → API Servers → Cache → DB
- Identify the core data model (2–3 tables/entities)
- Choose DB type and justify it
- Identify stateless vs stateful components

## Step 4: Deep Dive on Critical Components (20 min)
Pick the hardest/most interesting part (usually what the interviewer wants).
- How does the DB scale? (sharding, replicas)
- How does the cache work? (invalidation, TTL)
- How is consistency guaranteed? (CAP trade-off)
- How does the system handle failures?

## Step 5: Address Bottlenecks & Trade-offs (5 min)
- Single points of failure → add redundancy
- Hot spots → sharding + caching
- Latency → CDN, read replicas, async
- Cost trade-offs → mention but don't over-engineer

## Step 6: Summarise (2 min)
Restate design, key decisions, and trade-offs made.`,
                },
                {
                  order: 1,
                  language: "markdown",
                  label: "Common system design questions cheatsheet",
                  content: `# Common Design Questions — Key Decisions

## URL Shortener (bit.ly)
- ID generation: base62 encode auto-increment or hash(long_url)
- DB: key-value (Redis or DynamoDB) — short → long URL
- Redirects: 301 (permanent, browser caches) vs 302 (count every click)
- Scale: read-heavy → cache popular URLs

## Social Media Feed (Twitter/Instagram)
- Fan-out on write: push posts to all follower inboxes on post
  Good for: low follower counts; fast reads
- Fan-out on read: pull from followees on feed request
  Good for: celebrities with millions of followers
- Hybrid: fan-out on write for ≤10K followers; on read above that

## Distributed Key-Value Store
- Consistent hashing for sharding
- Replication factor 3; quorum reads/writes (W + R > N)
- Conflict resolution: last-write-wins (timestamp) or vector clocks

## Rate Limiter
- Redis sliding window counter per user per endpoint
- Return 429 Too Many Requests with Retry-After header
- Distribute config via centralised store

## Notification Service
- Fan-out via message queue (Kafka/SQS)
- Idempotency key per notification (deduplicate retries)
- Separate workers per channel (push, email, SMS)
- Store notification history in DB; mark delivered

## Search Autocomplete
- Trie structure for prefix matching
- Precompute top-K suggestions per prefix
- Cache in Redis; update offline (batch job)
- For scale: shard trie by first letter`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created System Design cheatsheet: ${systemDesign.name} (${systemDesign.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
