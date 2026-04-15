import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  await prisma.category.deleteMany({
    where: { name: "Redis", userId: null },
  });

  const redis = await prisma.category.create({
    data: {
      name: "Redis",
      icon: "⚡",
      color: "red",
      description: "Redis commands for strings, hashes, lists, sets, sorted sets, streams, pub/sub, transactions and server management",
      isPublic: true,
      snippets: {
        create: [
          // ── Connection & Server ───────────────────────────────────────────────
          {
            title: "Connection & Server",
            description: "Connect, authenticate, inspect and manage the Redis server",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Connect to Redis",
                  content: `# Default localhost
redis-cli

# Remote host and port
redis-cli -h redis.example.com -p 6379

# With password
redis-cli -h redis.example.com -p 6379 -a <password>

# TLS (Redis 6+)
redis-cli -h redis.example.com -p 6380 --tls

# One-shot command
redis-cli SET foo bar
redis-cli GET foo

# Connect to a specific database (0–15)
redis-cli -n 1`,
                },
                {
                  order: 1, language: "bash", label: "Server introspection",
                  content: `# Server info — memory, replication, stats
INFO
INFO server
INFO memory
INFO replication
INFO clients
INFO stats

# Ping — check connection
PING
PING "hello"   # returns PONG hello

# Select database (0–15, default 0)
SELECT 1

# Number of keys in current database
DBSIZE

# Server config
CONFIG GET maxmemory
CONFIG GET maxmemory-policy
CONFIG SET maxmemory 512mb
CONFIG SET maxmemory-policy allkeys-lru

# Real-time command monitor (dev only — high overhead)
MONITOR

# Slow query log
SLOWLOG GET 10
SLOWLOG LEN
SLOWLOG RESET

# Flush databases
FLUSHDB           # current database
FLUSHDB ASYNC
FLUSHALL          # ALL databases — dangerous in production!`,
                },
              ],
            },
          },
          // ── Keys ─────────────────────────────────────────────────────────────
          {
            title: "Keys",
            description: "Inspect, expire, rename and scan keys",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Key operations",
                  content: `# Check if key exists (returns 1 or 0)
EXISTS user:42
EXISTS user:42 session:abc   # returns count of existing keys

# Get key type
TYPE user:42          # string | hash | list | set | zset | stream

# Delete keys
DEL user:42
DEL user:42 user:43 user:44   # returns count deleted
UNLINK user:42                 # async delete (non-blocking)

# Rename key
RENAME  old:key new:key        # errors if old key doesn't exist
RENAMENX old:key new:key       # only rename if new key doesn't exist

# Move key to another database
MOVE user:42 1   # move to database 1

# Dump and restore (serialise / deserialise)
DUMP user:42
RESTORE new:user:42 0 <serialised-value>`,
                },
                {
                  order: 1, language: "bash", label: "Expiry / TTL",
                  content: `# Set expiry
EXPIRE  session:abc 3600         # seconds
PEXPIRE session:abc 3600000      # milliseconds
EXPIREAT  session:abc 1893456000 # Unix timestamp (seconds)
PEXPIREAT session:abc 1893456000000 # Unix timestamp (ms)

# Get remaining TTL
TTL  session:abc    # seconds  (-1 = no expiry, -2 = key gone)
PTTL session:abc    # milliseconds

# Remove expiry — make key persistent
PERSIST session:abc

# Set value and expiry atomically
SET session:abc "data" EX 3600          # seconds
SET session:abc "data" PX 3600000       # milliseconds
SET session:abc "data" EXAT 1893456000  # Unix timestamp
SETEX session:abc 3600 "data"           # older syntax
GETEX session:abc EX 3600               # get and reset TTL`,
                },
                {
                  order: 2, language: "bash", label: "SCAN — safe key iteration",
                  content: `# Never use KEYS * in production — it blocks the server!

# SCAN: cursor-based iteration (non-blocking)
SCAN 0                           # start (cursor 0), returns [next-cursor, keys]
SCAN 0 MATCH "user:*" COUNT 100  # filter + batch size hint
SCAN 0 MATCH "session:*" TYPE string COUNT 200

# Full iteration pattern (cursor returns 0 when done)
# redis-cli does this automatically with --scan
redis-cli --scan --pattern "user:*"
redis-cli --scan --pattern "cache:*" | xargs redis-cli DEL

# Collection-type scans
HSCAN  myhash  0 MATCH "field*" COUNT 50   # hash fields
SSCAN  myset   0 MATCH "prefix:*"          # set members
ZSCAN  myzset  0 MATCH "a*"                # sorted set members`,
                },
              ],
            },
          },
          // ── Strings ───────────────────────────────────────────────────────────
          {
            title: "Strings",
            description: "The fundamental Redis type — text, numbers, serialised JSON",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "GET, SET and variants",
                  content: `# Basic
SET  name "Alice"
GET  name                    # "Alice"
DEL  name

# Set options
SET key value EX 60          # expire in 60 seconds
SET key value NX             # set only if key does NOT exist
SET key value XX             # set only if key EXISTS
SET key value GET            # return old value while setting new one
SET key value NX EX 30       # atomic "set if absent with TTL" (distributed lock pattern)

# Get and modify
GETSET key newvalue          # return old value, set new (deprecated in Redis 6.2)
GETDEL key                   # return value and delete
GETEX  key EX 300            # return value and reset TTL

# Multiple keys at once
MSET name "Alice" age "30" city "Berlin"
MGET name age city           # ["Alice", "30", "Berlin"]
MSETNX k1 v1 k2 v2          # set all only if NONE of the keys exist

# String length
STRLEN name                  # 5

# Append to string
APPEND log "entry1\n"
APPEND log "entry2\n"`,
                },
                {
                  order: 1, language: "bash", label: "Numeric operations",
                  content: `# Increment / decrement integers
SET counter 10
INCR    counter          # 11 — atomic increment by 1
DECR    counter          # 10
INCRBY  counter 5        # 15
DECRBY  counter 3        # 12
INCR    counter          # returns new value atomically

# Floating point
SET price "9.99"
INCRBYFLOAT price 0.50   # "10.49"
INCRBYFLOAT price -1.00  # "9.49"

# Pattern: rate limiter
INCR    requests:user:42:2025-04-14
EXPIRE  requests:user:42:2025-04-14 86400   # expires at midnight

# Pattern: atomic counter with GETSET
SET visits:page:home 0
INCR visits:page:home    # atomic, race-condition safe`,
                },
              ],
            },
          },
          // ── Hashes ───────────────────────────────────────────────────────────
          {
            title: "Hashes",
            description: "Store objects as field-value pairs — ideal for user profiles, sessions",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Hash commands",
                  content: `# Set fields
HSET user:42 name "Alice" email "alice@example.com" age 30
HSETNX user:42 role "user"    # set only if field doesn't exist

# Get fields
HGET  user:42 name            # "Alice"
HMGET user:42 name email age  # ["Alice", "alice@example.com", "30"]
HGETALL user:42               # all fields and values (flat list)

# Check and delete
HEXISTS user:42 email         # 1
HDEL    user:42 legacy_field

# Numeric field operations
HSET     product:1 stock 100
HINCRBY  product:1 stock -1   # 99
HINCRBYFLOAT product:1 price 2.50

# Inspect
HLEN  user:42                 # number of fields
HKEYS user:42                 # field names only
HVALS user:42                 # values only

# Iterate fields (use over HGETALL for very large hashes)
HSCAN user:42 0 COUNT 50

# Pattern: store serialised session
HSET session:abc \
  userId    "42" \
  role      "admin" \
  createdAt "1713000000" \
  ip        "192.168.1.1"
EXPIRE session:abc 3600`,
                },
              ],
            },
          },
          // ── Lists ─────────────────────────────────────────────────────────────
          {
            title: "Lists",
            description: "Ordered sequences — queues, stacks, activity feeds",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "List commands",
                  content: `# Push — L = left (head), R = right (tail)
LPUSH jobs "task3" "task4"    # prepend — list: task4, task3
RPUSH jobs "task1" "task2"    # append  — list: task4, task3, task1, task2
LPUSHX jobs "only-if-exists"  # only push if key exists

# Pop
LPOP jobs                     # remove and return head
RPOP jobs                     # remove and return tail
LPOP jobs 3                   # pop up to 3 elements (Redis 6.2+)

# Blocking pop — wait until element available (great for queues)
BLPOP jobs 30                 # block up to 30 seconds
BRPOP jobs 30
BLPOP queue:high queue:low 0  # check multiple queues, 0 = block forever

# Read without removing
LRANGE jobs 0 -1              # all elements (0 = first, -1 = last)
LRANGE jobs 0 9               # first 10
LINDEX jobs 0                 # element at index
LLEN   jobs                   # list length

# Modify
LSET   jobs 0 "updated-task"  # set element at index
LINSERT jobs BEFORE "task1" "new-task"
LINSERT jobs AFTER  "task1" "new-task"
LREM   jobs 0 "task-to-remove" # remove all occurrences (0 = all)
LTRIM  jobs 0 99              # keep only elements 0-99 (trim to 100 items)

# Move between lists atomically
LMOVE source destination LEFT RIGHT   # pop left from src, push right to dst
BLMOVE source destination LEFT RIGHT 10  # blocking version`,
                },
              ],
            },
          },
          // ── Sets ─────────────────────────────────────────────────────────────
          {
            title: "Sets",
            description: "Unordered unique collections — tags, followers, online users",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Set commands",
                  content: `# Add / remove members
SADD  online:users "u1" "u2" "u3"   # returns count added
SREM  online:users "u1"             # returns count removed

# Check membership
SISMEMBER online:users "u2"         # 1 or 0
SMISMEMBER online:users "u1" "u2"   # [0, 1] — batch check

# Inspect
SMEMBERS online:users               # all members (unordered)
SCARD    online:users               # cardinality (count)

# Random
SRANDMEMBER online:users            # random member (no removal)
SRANDMEMBER online:users 3          # 3 random members
SPOP online:users                   # remove and return random member
SPOP online:users 3                 # remove and return 3 random members

# Move between sets
SMOVE source destination "member"

# Set operations
SUNION  set1 set2 set3             # union
SINTER  set1 set2                  # intersection
SDIFF   set1 set2                  # difference (in set1, not in set2)

# Store results in new key
SUNIONSTORE dest set1 set2
SINTERSTORE dest set1 set2
SDIFFSTORE  dest set1 set2

# Patterns:
# Tags: SADD post:42:tags "redis" "caching"
# Mutual friends: SINTER user:1:friends user:2:friends
# Online users: SADD online:users <id>  /  SREM online:users <id>`,
                },
              ],
            },
          },
          // ── Sorted Sets ───────────────────────────────────────────────────────
          {
            title: "Sorted Sets",
            description: "Members with scores — leaderboards, priority queues, rate limiting",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Sorted set commands",
                  content: `# Add members with scores
ZADD leaderboard 9500 "alice"
ZADD leaderboard 8200 "bob" 7100 "carol"
ZADD leaderboard NX 5000 "dave"          # add only if not exists
ZADD leaderboard XX 9600 "alice"         # update only if exists
ZADD leaderboard GT 9700 "alice"         # update only if new score > current
ZADD leaderboard LT 8000 "alice"         # update only if new score < current

# Get scores and ranks
ZSCORE  leaderboard "alice"              # 9700.0
ZRANK   leaderboard "alice"              # rank (0-indexed, ascending)
ZREVRANK leaderboard "alice"             # rank (0-indexed, descending = position from top)
ZINCRBY leaderboard 100 "alice"          # add to score atomically

# Range queries — by rank
ZRANGE    leaderboard 0 -1              # all (ascending by score)
ZRANGE    leaderboard 0 -1 REV         # descending (Redis 6.2+)
ZRANGE    leaderboard 0 9 WITHSCORES   # top 10 with scores
ZREVRANGE leaderboard 0 9 WITHSCORES   # top 10 highest (older syntax)
ZRANGE    leaderboard 0 9 REV WITHSCORES LIMIT 0 10

# Range queries — by score
ZRANGEBYSCORE  leaderboard 5000 9999             # score between 5000-9999
ZRANGEBYSCORE  leaderboard -inf +inf WITHSCORES
ZREVRANGEBYSCORE leaderboard +inf 5000 LIMIT 0 10
ZRANGEBYSCORE  leaderboard "(5000" 9999          # exclusive ( = strictly greater

# Range queries — by lexicographic order (equal scores)
ZRANGEBYLEX leaderboard "[a" "[z"
ZRANGEBYLEX leaderboard "-" "+"  # all members

# Count
ZCARD leaderboard                       # total members
ZCOUNT leaderboard 5000 9999            # count in score range
ZLEXCOUNT leaderboard "[a" "[f"

# Remove
ZREM      leaderboard "dave"
ZREMRANGEBYRANK  leaderboard 0 4        # remove bottom 5
ZREMRANGEBYSCORE leaderboard 0 4999     # remove below 5000
ZPOPMIN leaderboard 3                   # remove + return 3 lowest
ZPOPMAX leaderboard 1                   # remove + return highest
BZPOPMIN leaderboard 30                 # blocking pop lowest

# Set operations
ZUNIONSTORE out 2 zset1 zset2
ZINTERSTORE out 2 zset1 zset2 WEIGHTS 2 1  # weight scores before combining`,
                },
              ],
            },
          },
          // ── Pub/Sub & Streams ─────────────────────────────────────────────────
          {
            title: "Pub/Sub & Streams",
            description: "Real-time messaging with pub/sub and persistent event streams",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Pub/Sub",
                  content: `# SUBSCRIBE — blocks, listening for messages
SUBSCRIBE notifications
SUBSCRIBE orders:new orders:updated   # multiple channels

# Pattern subscribe — wildcard channel matching
PSUBSCRIBE "orders:*"
PSUBSCRIBE "user:*:events"

# PUBLISH — send message to channel (returns subscriber count)
PUBLISH notifications "New message from Alice"
PUBLISH orders:new '{"id":"101","total":99.99}'

# Unsubscribe (sent from subscriber client)
UNSUBSCRIBE notifications
PUNSUBSCRIBE "orders:*"

# List active channels and subscriber counts
PUBSUB CHANNELS            # all active channels
PUBSUB CHANNELS "orders:*" # matching pattern
PUBSUB NUMSUB notifications orders:new
PUBSUB NUMPAT              # number of pattern subscriptions

# Note: pub/sub is fire-and-forget — messages not persisted.
# Use Streams for durable, replayable messaging.`,
                },
                {
                  order: 1, language: "bash", label: "Streams",
                  content: `# XADD — append event to stream (* = auto-generate ID)
XADD orders:stream * userId 42 product "Widget" total 9.99
XADD orders:stream * userId 43 product "Gadget" total 24.99

# Capped stream — keep last 1000 entries
XADD orders:stream MAXLEN ~ 1000 * userId 44 product "Doohickey" total 4.99

# XLEN — number of entries
XLEN orders:stream

# XRANGE — read entries (oldest first)
XRANGE orders:stream - +               # all entries
XRANGE orders:stream - + COUNT 10      # first 10
XRANGE orders:stream 1713000000000-0 + # from timestamp

# XREVRANGE — newest first
XREVRANGE orders:stream + - COUNT 5

# XREAD — read new entries (polling)
XREAD COUNT 10 STREAMS orders:stream 0            # from beginning
XREAD COUNT 10 STREAMS orders:stream $            # only new entries
XREAD BLOCK 5000 COUNT 10 STREAMS orders:stream $ # block 5s for new entries

# Consumer Groups — multiple consumers, each gets a unique message
XGROUP CREATE orders:stream workers $ MKSTREAM    # $ = only new messages
XGROUP CREATE orders:stream workers 0             # 0 = from beginning

# Read as consumer
XREADGROUP GROUP workers consumer-1 COUNT 5 STREAMS orders:stream >

# Acknowledge processed message
XACK orders:stream workers <message-id>

# Check pending (unacknowledged) messages
XPENDING orders:stream workers - + 10

# Claim stale message from crashed consumer
XCLAIM orders:stream workers consumer-2 60000 <message-id>  # after 60s idle

# Trim old entries
XTRIM orders:stream MAXLEN 10000
XTRIM orders:stream MINID 1713000000000-0   # remove older than timestamp`,
                },
              ],
            },
          },
          // ── Transactions & Scripting ──────────────────────────────────────────
          {
            title: "Transactions & Scripting",
            description: "MULTI/EXEC, WATCH for optimistic locking and Lua scripts",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "MULTI/EXEC and WATCH",
                  content: `# MULTI / EXEC — queue commands and execute atomically
MULTI
  SET balance:alice 500
  SET balance:bob   300
  INCR transfers:total
EXEC                    # returns array of results

# DISCARD — cancel queued transaction
MULTI
  SET foo bar
DISCARD

# WATCH — optimistic locking (CAS — Check And Set)
# If watched key changes before EXEC, transaction aborts (returns nil)
WATCH balance:alice

# Read current value
val = GET balance:alice

MULTI
  SET balance:alice <new-value>
EXEC
# Returns nil if balance:alice changed between WATCH and EXEC
# Retry the whole operation in that case

# UNWATCH — cancel all watches
UNWATCH

# Note: errors inside MULTI don't abort the transaction.
# Only WATCH failures and EXEC-time errors abort it.`,
                },
                {
                  order: 1, language: "bash", label: "Lua scripting with EVAL",
                  content: `# EVAL — run Lua script atomically
# EVAL script numkeys key [key ...] arg [arg ...]

# Simple example: atomic get-or-set
EVAL "
  local val = redis.call('GET', KEYS[1])
  if val then
    return val
  end
  redis.call('SET', KEYS[1], ARGV[1], 'EX', ARGV[2])
  return ARGV[1]
" 1 mykey "default-value" 3600

# Rate limiter script (sliding window counter)
EVAL "
  local key     = KEYS[1]
  local limit   = tonumber(ARGV[1])
  local window  = tonumber(ARGV[2])
  local current = redis.call('INCR', key)
  if current == 1 then
    redis.call('EXPIRE', key, window)
  end
  if current > limit then
    return 0
  end
  return 1
" 1 ratelimit:user:42 100 60

# Load script and call by SHA (avoids sending script each time)
SCRIPT LOAD "return redis.call('GET', KEYS[1])"
# Returns SHA1 hash, e.g. "abc123..."
EVALSHA abc123... 1 mykey

# Manage scripts
SCRIPT EXISTS abc123...
SCRIPT FLUSH               # remove all cached scripts`,
                },
              ],
            },
          },
          // ── Persistence & Replication ─────────────────────────────────────────
          {
            title: "Persistence & Replication",
            description: "RDB snapshots, AOF, replica info and failover",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Persistence — RDB and AOF",
                  content: `# RDB — snapshot to disk
SAVE         # synchronous (blocks server — avoid in prod)
BGSAVE       # async background save
LASTSAVE     # Unix timestamp of last successful save

# AOF — Append Only File
CONFIG SET appendonly yes
CONFIG SET appendfsync everysec   # everysec | always | no

# Rewrite AOF to compact it
BGREWRITEAOF

# Config file options (redis.conf)
# save 900 1        — save if 1 key changed in 900s
# save 300 10       — save if 10 keys changed in 300s
# save 60 10000     — save if 10000 keys changed in 60s
# appendonly yes
# appendfsync everysec

# Check persistence status
INFO persistence
# aof_enabled, rdb_last_bgsave_status, aof_rewrite_in_progress...`,
                },
                {
                  order: 1, language: "bash", label: "Replication and cluster",
                  content: `# Replication info
INFO replication
# role: master/slave, connected_slaves, master_replid...

# Make server a replica of another
REPLICAOF <master-host> <master-port>
REPLICAOF NO ONE          # promote replica to primary

# Wait for replication (returns replicas that acknowledged)
WAIT 1 1000               # wait for 1 replica, timeout 1000ms

# Sentinel — query via sentinel
redis-cli -p 26379
SENTINEL masters
SENTINEL slaves mymaster
SENTINEL failover mymaster   # manually trigger failover

# Cluster info
CLUSTER INFO
CLUSTER NODES
CLUSTER KEYSLOT mykey        # which slot does key map to (0-16383)
CLUSTER GETKEYSINSLOT 0 10   # keys in slot 0`,
                },
              ],
            },
          },
          // ── Patterns ─────────────────────────────────────────────────────────
          {
            title: "Common Patterns",
            description: "Caching, distributed locks, rate limiting, sessions and leaderboards",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Caching patterns",
                  content: `# Cache-aside (read-through)
GET cache:user:42
# → miss → fetch from DB → SET cache:user:42 <json> EX 300

# Write-through: update cache on every write
SET user:42 <json>
SET cache:user:42 <json> EX 300

# Cache invalidation
DEL cache:user:42
DEL cache:post:*     # NOT valid — use SCAN + DEL

# Bulk invalidation by pattern (safe, use in scripts or CLI)
redis-cli --scan --pattern "cache:user:*" | xargs redis-cli UNLINK

# Cache stampede prevention — set + NX lock
SET lock:cache:user:42 1 NX EX 5    # only one process rebuilds cache
# If SET returns nil, wait and retry GET

# Probabilistic early expiration (check remaining TTL)
TTL cache:user:42    # if < 30s, probabilistically rebuild early`,
                },
                {
                  order: 1, language: "bash", label: "Distributed lock (Redlock pattern)",
                  content: `# Simple single-node lock
SET lock:job:send-email <random-token> NX EX 30
# → OK  : lock acquired
# → nil : already locked

# Release lock — only if token matches (atomic with Lua)
EVAL "
  if redis.call('GET', KEYS[1]) == ARGV[1] then
    return redis.call('DEL', KEYS[1])
  else
    return 0
  end
" 1 lock:job:send-email <random-token>

# Extend lock TTL (if job still running)
EVAL "
  if redis.call('GET', KEYS[1]) == ARGV[1] then
    return redis.call('EXPIRE', KEYS[1], ARGV[2])
  else
    return 0
  end
" 1 lock:job:send-email <random-token> 30`,
                },
                {
                  order: 2, language: "bash", label: "Rate limiting patterns",
                  content: `# Fixed window counter
INCR   ratelimit:user:42:2025-04-14-15   # key = user + hour
EXPIRE ratelimit:user:42:2025-04-14-15 3600

# Sliding window with sorted set (more accurate)
# Score = timestamp, member = request ID
ZADD   ratelimit:user:42 <now-ms> <uuid>
ZREMRANGEBYSCORE ratelimit:user:42 0 <now-ms - window-ms>
count = ZCARD ratelimit:user:42
EXPIRE ratelimit:user:42 <window-seconds>
# If count > limit → reject

# Token bucket with INCR + TTL
SET    tokens:user:42 100 NX EX 60    # 100 tokens per 60s window
DECR   tokens:user:42                  # consume token
# If result < 0 → rate limit hit`,
                },
                {
                  order: 3, language: "bash", label: "Session store and leaderboard",
                  content: `# Session store
HSET session:<token> userId 42 role admin ip "10.0.0.1"
EXPIRE session:<token> 86400   # 24h TTL

HGETALL session:<token>        # read session
HDEL session:<token> ip        # remove field
DEL session:<token>            # logout — destroy session

# Leaderboard with sorted set
ZADD  leaderboard:weekly 9500 "alice"
ZADD  leaderboard:weekly 8200 "bob"

# Get top 10
ZREVRANGE leaderboard:weekly 0 9 WITHSCORES

# Get user rank (0-indexed from top)
ZREVRANK leaderboard:weekly "alice"

# Increment user score
ZINCRBY leaderboard:weekly 100 "alice"

# Remove old leaderboard atomically
RENAME leaderboard:weekly leaderboard:last-week
DEL    leaderboard:weekly`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Redis cheatsheet: ${redis.name} (${redis.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
