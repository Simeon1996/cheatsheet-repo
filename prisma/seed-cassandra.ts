import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.category.deleteMany({ where: { name: "Cassandra", userId: null } });

  const cassandra = await prisma.category.create({
    data: {
      name: "Cassandra",
      icon: "💿",
      color: "cyan",
      description: "Apache Cassandra: CQL, keyspaces, tables, indexes, TTL, partitioning, and cluster operations",
      isPublic: true,
      snippets: {
        create: [
          // ── cqlsh & Connection ────────────────────────────────────────────
          {
            title: "cqlsh & Connection",
            description: "Connect, authenticate, and navigate the CQL shell",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Connect with cqlsh",
                  content: `# Connect to localhost
cqlsh

# Connect to a remote host
cqlsh 10.0.0.1 9042

# Connect with credentials
cqlsh 10.0.0.1 -u cassandra -p cassandra

# Connect with SSL
cqlsh 10.0.0.1 --ssl \\
  --certfile /path/to/ca.crt \\
  --userkey /path/to/client.key \\
  --usercert /path/to/client.crt

# Execute a CQL file
cqlsh -f schema.cql
cqlsh 10.0.0.1 -f schema.cql

# Execute inline CQL
cqlsh -e "DESCRIBE KEYSPACES"

# Set consistency level for the session
cqlsh --request-timeout=30`,
                },
                {
                  order: 1, language: "sql", label: "cqlsh shell commands",
                  content: `-- Show all keyspaces
DESCRIBE KEYSPACES;

-- Show all tables in current keyspace
DESCRIBE TABLES;

-- Show table schema
DESCRIBE TABLE users;
DESCRIBE TABLE my_keyspace.users;

-- Show keyspace schema
DESCRIBE KEYSPACE my_keyspace;

-- Switch keyspace
USE my_keyspace;

-- Show cluster info
DESCRIBE CLUSTER;

-- Show current session info
SHOW VERSION;
SHOW HOST;

-- Tracing — show execution details for next query
TRACING ON;
SELECT * FROM users WHERE user_id = 'u1';
TRACING OFF;

-- Paging
PAGING ON;
PAGING 50;    -- set page size
PAGING OFF;

-- Timing — show query execution time
TIMING ON;`,
                },
              ],
            },
          },
          // ── Keyspaces ─────────────────────────────────────────────────────
          {
            title: "Keyspaces",
            description: "Create, alter, and drop keyspaces with replication strategies",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "Create & alter keyspaces",
                  content: `-- SimpleStrategy (single DC / development only)
CREATE KEYSPACE my_keyspace
  WITH replication = {
    'class': 'SimpleStrategy',
    'replication_factor': 3
  };

-- NetworkTopologyStrategy (production, multi-DC)
CREATE KEYSPACE my_keyspace
  WITH replication = {
    'class': 'NetworkTopologyStrategy',
    'dc1': 3,
    'dc2': 2
  }
  AND durable_writes = true;

-- Create if not exists
CREATE KEYSPACE IF NOT EXISTS my_keyspace
  WITH replication = {'class':'SimpleStrategy','replication_factor':1};

-- Alter replication factor
ALTER KEYSPACE my_keyspace
  WITH replication = {
    'class': 'NetworkTopologyStrategy',
    'dc1': 3,
    'dc2': 3
  };

-- Drop keyspace
DROP KEYSPACE my_keyspace;
DROP KEYSPACE IF EXISTS my_keyspace;`,
                },
              ],
            },
          },
          // ── Tables ────────────────────────────────────────────────────────
          {
            title: "Tables",
            description: "Create, alter, and drop tables with various key designs",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "Create tables",
                  content: `-- Simple table (partition key only)
CREATE TABLE users (
  user_id   UUID PRIMARY KEY,
  name      TEXT,
  email     TEXT,
  age       INT,
  active    BOOLEAN,
  created   TIMESTAMP
);

-- Composite primary key (partition + clustering)
CREATE TABLE orders_by_customer (
  customer_id  UUID,
  order_id     TIMEUUID,
  status       TEXT,
  total        DECIMAL,
  created_at   TIMESTAMP,
  PRIMARY KEY (customer_id, order_id)
) WITH CLUSTERING ORDER BY (order_id DESC);

-- Compound partition key (spreads load across nodes)
CREATE TABLE events_by_day (
  sensor_id   TEXT,
  date        DATE,
  event_time  TIMESTAMP,
  value       DOUBLE,
  PRIMARY KEY ((sensor_id, date), event_time)
) WITH CLUSTERING ORDER BY (event_time DESC);

-- Create if not exists
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY,
  name    TEXT
);`,
                },
                {
                  order: 1, language: "sql", label: "Alter & drop tables",
                  content: `-- Add a column
ALTER TABLE users ADD phone TEXT;
ALTER TABLE users ADD tags LIST<TEXT>;

-- Drop a column
ALTER TABLE users DROP phone;

-- Rename a column (only clustering columns)
ALTER TABLE orders_by_customer RENAME order_id TO id;

-- Change table options
ALTER TABLE users
  WITH gc_grace_seconds = 86400
  AND compaction = {
    'class': 'LeveledCompactionStrategy',
    'sstable_size_in_mb': 160
  };

-- Truncate (delete all rows, keep schema)
TRUNCATE TABLE users;
TRUNCATE users;

-- Drop table
DROP TABLE users;
DROP TABLE IF EXISTS users;`,
                },
              ],
            },
          },
          // ── Data Types ────────────────────────────────────────────────────
          {
            title: "Data Types & Collections",
            description: "Scalar types, collections, tuples, and UDTs",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "Scalar & UUID types",
                  content: `-- Common scalar types
-- UUID     — random UUID:          UUID DEFAULT uuid()
-- TIMEUUID — time-based UUID:      TIMEUUID (sortable, embeds timestamp)
-- TEXT     — UTF-8 string
-- INT      — 32-bit integer
-- BIGINT   — 64-bit integer
-- FLOAT    — 32-bit float
-- DOUBLE   — 64-bit float
-- DECIMAL  — arbitrary precision
-- BOOLEAN  — true/false
-- TIMESTAMP — date + time (ms precision)
-- DATE     — date only (no time)
-- TIME     — time of day (nanosecond precision)
-- BLOB     — arbitrary bytes
-- INET     — IPv4 or IPv6 address
-- COUNTER  — distributed counter (special rules)
-- DURATION — ISO 8601 duration (e.g. 1h30m)

-- Generate IDs in queries
INSERT INTO users (user_id, name) VALUES (uuid(), 'Alice');
INSERT INTO events (event_id, ts) VALUES (now(), toTimestamp(now()));

-- Extract timestamp from a TIMEUUID
SELECT toTimestamp(event_id) FROM events;
SELECT dateOf(event_id) FROM events;       -- Cassandra 3.x`,
                },
                {
                  order: 1, language: "sql", label: "Collections & tuples",
                  content: `-- List (ordered, duplicates allowed)
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY,
  emails  LIST<TEXT>,
  scores  LIST<INT>
);

-- Set (unordered, unique values)
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY,
  tags    SET<TEXT>,
  roles   SET<TEXT>
);

-- Map (key-value pairs)
CREATE TABLE profiles (
  user_id    UUID PRIMARY KEY,
  attributes MAP<TEXT, TEXT>,
  counts     MAP<TEXT, INT>
);

-- Tuple (fixed-length, mixed types)
CREATE TABLE readings (
  device_id UUID PRIMARY KEY,
  location  TUPLE<FLOAT, FLOAT>   -- (lat, lng)
);

-- User-Defined Type (UDT)
CREATE TYPE address (
  street TEXT,
  city   TEXT,
  zip    TEXT,
  country TEXT
);

CREATE TABLE customers (
  id      UUID PRIMARY KEY,
  name    TEXT,
  address FROZEN<address>
);`,
                },
              ],
            },
          },
          // ── CRUD ──────────────────────────────────────────────────────────
          {
            title: "CRUD — INSERT, SELECT, UPDATE, DELETE",
            description: "Insert, read, update, and delete rows",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "INSERT",
                  content: `-- Basic insert
INSERT INTO users (user_id, name, email, age)
VALUES (uuid(), 'Alice', 'alice@example.com', 30);

-- Insert with TTL (row expires after N seconds)
INSERT INTO sessions (session_id, user_id, data)
VALUES (uuid(), 'u1', 'payload')
USING TTL 3600;

-- Insert with a specific timestamp (microseconds)
INSERT INTO events (event_id, data)
VALUES (now(), 'click')
USING TIMESTAMP 1718000000000000;

-- Insert only if row does NOT exist (lightweight transaction)
INSERT INTO users (user_id, email)
VALUES (uuid(), 'bob@example.com')
IF NOT EXISTS;

-- Insert into a collection
INSERT INTO profiles (user_id, tags, attributes)
VALUES (uuid(), {'admin','beta'}, {'plan':'pro','region':'us-east'});`,
                },
                {
                  order: 1, language: "sql", label: "SELECT",
                  content: `-- Fetch all columns for a partition
SELECT * FROM users WHERE user_id = 'some-uuid';

-- Specific columns
SELECT name, email FROM users WHERE user_id = 'some-uuid';

-- Clustering column range
SELECT * FROM orders_by_customer
WHERE customer_id = 'cid'
  AND order_id >= minTimeuuid('2024-01-01')
  AND order_id <= maxTimeuuid('2024-12-31');

-- Allow filtering (use sparingly — full scan)
SELECT * FROM users WHERE age > 25 ALLOW FILTERING;

-- Limit results
SELECT * FROM orders_by_customer
WHERE customer_id = 'cid'
LIMIT 10;

-- Token-based pagination (consistent paging)
SELECT * FROM users WHERE token(user_id) > token('last-seen-id') LIMIT 100;

-- Count rows (expensive on large partitions)
SELECT COUNT(*) FROM orders_by_customer WHERE customer_id = 'cid';

-- TTL and write time of a column
SELECT name, TTL(name), WRITETIME(name) FROM users WHERE user_id = 'some-uuid';`,
                },
                {
                  order: 2, language: "sql", label: "UPDATE & DELETE",
                  content: `-- Update specific columns
UPDATE users SET name = 'Alice Smith', age = 31
WHERE user_id = 'some-uuid';

-- Update with TTL
UPDATE sessions USING TTL 1800
SET data = 'new-payload'
WHERE session_id = 'sid';

-- Conditional update (lightweight transaction)
UPDATE users SET name = 'Alice B.'
WHERE user_id = 'some-uuid'
IF name = 'Alice';

-- Increment a counter
UPDATE page_views SET views = views + 1
WHERE page_id = 'home';

-- Append to a list
UPDATE profiles SET emails = emails + ['new@example.com']
WHERE user_id = 'some-uuid';

-- Add to a set
UPDATE profiles SET tags = tags + {'vip'}
WHERE user_id = 'some-uuid';

-- Update a map entry
UPDATE profiles SET attributes['plan'] = 'enterprise'
WHERE user_id = 'some-uuid';

-- Delete a row
DELETE FROM users WHERE user_id = 'some-uuid';

-- Delete specific columns
DELETE name, email FROM users WHERE user_id = 'some-uuid';

-- Delete a range of clustering rows
DELETE FROM orders_by_customer
WHERE customer_id = 'cid'
  AND order_id < minTimeuuid('2023-01-01');

-- Conditional delete (LWT)
DELETE FROM users WHERE user_id = 'some-uuid' IF EXISTS;`,
                },
              ],
            },
          },
          // ── Batches ───────────────────────────────────────────────────────
          {
            title: "Batches",
            description: "LOGGED, UNLOGGED, and COUNTER batches",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "BATCH statements",
                  content: `-- Logged batch (atomic — use sparingly, adds coordinator overhead)
BEGIN BATCH
  INSERT INTO users (user_id, name) VALUES (uuid(), 'Alice');
  INSERT INTO users_by_email (email, user_id) VALUES ('alice@example.com', 'some-uuid');
APPLY BATCH;

-- Unlogged batch (no atomicity guarantee — best for same-partition writes)
BEGIN UNLOGGED BATCH
  UPDATE orders SET status = 'shipped' WHERE customer_id = 'c1' AND order_id = 'o1';
  UPDATE orders SET status = 'shipped' WHERE customer_id = 'c1' AND order_id = 'o2';
APPLY BATCH;

-- Counter batch
BEGIN COUNTER BATCH
  UPDATE page_views SET views = views + 1 WHERE page_id = 'home';
  UPDATE page_views SET views = views + 1 WHERE page_id = 'about';
APPLY BATCH;

-- Batch with USING TIMESTAMP (all statements share the timestamp)
BEGIN BATCH USING TIMESTAMP 1718000000000000
  INSERT INTO a (id, v) VALUES ('1', 'x');
  INSERT INTO b (id, v) VALUES ('2', 'y');
APPLY BATCH;`,
                },
              ],
            },
          },
          // ── Indexes ───────────────────────────────────────────────────────
          {
            title: "Indexes",
            description: "Secondary indexes, SASI indexes, and materialized views",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "Secondary & SASI indexes",
                  content: `-- Secondary index (avoid on high-cardinality columns)
CREATE INDEX ON users (email);
CREATE INDEX users_email_idx ON users (email);

-- Index on a collection value
CREATE INDEX ON profiles (VALUES(tags));
CREATE INDEX ON profiles (KEYS(attributes));
CREATE INDEX ON profiles (ENTRIES(attributes));

-- SASI index (Cassandra 3.4+) — supports LIKE and range on text
CREATE CUSTOM INDEX ON users (name)
  USING 'org.apache.cassandra.index.sasi.SASIIndex'
  WITH OPTIONS = {
    'mode': 'CONTAINS',
    'analyzer_class': 'org.apache.cassandra.index.sasi.analyzer.NonTokenizingAnalyzer',
    'case_sensitive': 'false'
  };

-- Query using SASI
SELECT * FROM users WHERE name LIKE '%alice%';

-- Drop an index
DROP INDEX users_email_idx;
DROP INDEX IF EXISTS users_email_idx;`,
                },
                {
                  order: 1, language: "sql", label: "Materialized Views",
                  content: `-- Base table
CREATE TABLE users (
  user_id UUID PRIMARY KEY,
  email   TEXT,
  country TEXT,
  name    TEXT
);

-- Materialized view partitioned by country
CREATE MATERIALIZED VIEW users_by_country AS
  SELECT * FROM users
  WHERE country IS NOT NULL AND user_id IS NOT NULL
  PRIMARY KEY (country, user_id)
  WITH CLUSTERING ORDER BY (user_id ASC);

-- Query the view
SELECT * FROM users_by_country WHERE country = 'US';

-- Alter a materialized view (only table properties)
ALTER MATERIALIZED VIEW users_by_country
  WITH gc_grace_seconds = 86400;

-- Drop a materialized view
DROP MATERIALIZED VIEW users_by_country;`,
                },
              ],
            },
          },
          // ── TTL & Tombstones ──────────────────────────────────────────────
          {
            title: "TTL & Tombstones",
            description: "Set, check, and manage time-to-live and tombstone tuning",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "TTL operations",
                  content: `-- Insert with TTL (seconds)
INSERT INTO sessions (id, token) VALUES ('s1', 'abc') USING TTL 3600;

-- Update with TTL
UPDATE sessions USING TTL 1800 SET token = 'xyz' WHERE id = 's1';

-- Set default TTL on a table
CREATE TABLE cache (
  key   TEXT PRIMARY KEY,
  value TEXT
) WITH default_time_to_live = 86400;   -- 24 hours

ALTER TABLE cache WITH default_time_to_live = 43200;

-- Check remaining TTL on a column
SELECT TTL(token) FROM sessions WHERE id = 's1';

-- Check write timestamp (microseconds since epoch)
SELECT WRITETIME(token) FROM sessions WHERE id = 's1';

-- Remove TTL from a column (set to 0)
UPDATE sessions USING TTL 0 SET token = 'permanent' WHERE id = 's1';`,
                },
              ],
            },
          },
          // ── Consistency Levels ────────────────────────────────────────────
          {
            title: "Consistency Levels",
            description: "Read and write consistency level reference",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "Set consistency in cqlsh",
                  content: `-- Check current consistency level
CONSISTENCY;

-- Set consistency level for the session
CONSISTENCY ONE;
CONSISTENCY QUORUM;
CONSISTENCY ALL;
CONSISTENCY LOCAL_QUORUM;
CONSISTENCY EACH_QUORUM;

-- Set serial consistency (for lightweight transactions)
SERIAL CONSISTENCY LOCAL_SERIAL;

/*
Consistency level reference:

Write levels:
  ANY           — at least 1 node (even hinted handoff)
  ONE           — 1 replica acknowledges
  TWO           — 2 replicas acknowledge
  THREE         — 3 replicas acknowledge
  QUORUM        — majority of replicas (RF/2 + 1)
  LOCAL_QUORUM  — quorum in local DC only
  EACH_QUORUM   — quorum in every DC
  ALL           — all replicas must acknowledge

Read levels:
  ONE           — 1 replica responds
  TWO / THREE   — 2 / 3 replicas respond
  QUORUM        — majority of replicas
  LOCAL_QUORUM  — quorum in local DC
  ALL           — all replicas respond
  SERIAL        — linearizable read (LWT)
  LOCAL_SERIAL  — linearizable in local DC

Strong consistency: write ALL + read ONE  or  write QUORUM + read QUORUM
*/`,
                },
              ],
            },
          },
          // ── nodetool ─────────────────────────────────────────────────────
          {
            title: "nodetool — Cluster Operations",
            description: "Monitor, repair, compact, and manage Cassandra nodes",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Cluster status & info",
                  content: `# Ring status — shows node health, load, token ownership
nodetool status

# Status for a specific keyspace
nodetool status my_keyspace

# Show gossip info for all nodes
nodetool gossipinfo

# Show node info (uptime, load, heap usage)
nodetool info

# Show token ranges owned by this node
nodetool ring

# Show datacenter / rack topology
nodetool describecluster

# List all keyspaces and tables
nodetool describering my_keyspace

# Thread pool stats (useful to spot overload)
nodetool tpstats

# Compaction stats
nodetool compactionstats

# Show table-level stats (read/write latency, bloom filter, etc.)
nodetool tablestats my_keyspace.users
nodetool cfstats my_keyspace.users   # older alias`,
                },
                {
                  order: 1, language: "bash", label: "Repair, flush & compact",
                  content: `# Full repair (anti-entropy — run regularly)
nodetool repair

# Repair a specific keyspace
nodetool repair my_keyspace

# Repair a specific table
nodetool repair my_keyspace users

# Incremental repair (only unrepaired data)
nodetool repair --incremental my_keyspace

# Flush memtables to SSTables
nodetool flush
nodetool flush my_keyspace users

# Major compaction (merge all SSTables — can be slow)
nodetool compact
nodetool compact my_keyspace users

# Compact a single partition key
nodetool compact my_keyspace users some-partition-key

# Scrub SSTables (detect and remove corrupted rows)
nodetool scrub my_keyspace users

# Upgrade SSTables to current format
nodetool upgradesstables my_keyspace`,
                },
                {
                  order: 2, language: "bash", label: "Node lifecycle",
                  content: `# Drain node before shutdown (flushes, stops accepting writes)
nodetool drain

# Graceful shutdown after drain
nodetool drain && sudo systemctl stop cassandra

# Decommission (remove node from ring, stream data to others)
nodetool decommission

# Remove a dead node by host ID
nodetool removenode <host-id>
nodetool status   # get host-id from here

# Bootstrap a replacement node
# Set in cassandra.yaml: replace_address_first_boot: <dead-node-ip>

# Rebuild a node from peers (after replacing)
nodetool rebuild -- <source-datacenter>

# Move a node to a new token (rarely needed with vnodes)
nodetool move <new-token>

# Pause / resume compaction
nodetool disableautocompaction my_keyspace
nodetool enableautocompaction my_keyspace`,
                },
              ],
            },
          },
          // ── Performance & Tuning ──────────────────────────────────────────
          {
            title: "Performance & Tuning",
            description: "Compaction strategies, caching, and key design tips",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "Table tuning options",
                  content: `-- Compaction strategy
ALTER TABLE users WITH compaction = {
  'class': 'LeveledCompactionStrategy',
  'sstable_size_in_mb': 160
};

ALTER TABLE time_series WITH compaction = {
  'class': 'TimeWindowCompactionStrategy',
  'compaction_window_unit': 'DAYS',
  'compaction_window_size': 1
};

ALTER TABLE write_heavy WITH compaction = {
  'class': 'SizeTieredCompactionStrategy',
  'min_threshold': 4,
  'max_threshold': 32
};

-- Caching
ALTER TABLE users WITH caching = {
  'keys': 'ALL',
  'rows_per_partition': '100'
};

-- Compression
ALTER TABLE users WITH compression = {
  'class': 'LZ4Compressor',
  'chunk_length_in_kb': 64
};

-- gc_grace_seconds (tombstone expiry — must be > repair interval)
ALTER TABLE users WITH gc_grace_seconds = 864000;   -- 10 days

-- Bloom filter false-positive chance (lower = more memory, fewer disk reads)
ALTER TABLE users WITH bloom_filter_fp_chance = 0.01;`,
                },
                {
                  order: 1, language: "bash", label: "cassandra-stress (load testing)",
                  content: `# Basic write stress test
cassandra-stress write n=1000000 \\
  -node 10.0.0.1 \\
  -rate threads=50

# Read stress test
cassandra-stress read n=500000 \\
  -node 10.0.0.1 \\
  -rate threads=50

# Mixed workload (70% read / 30% write)
cassandra-stress mixed ratio\\(write=3,read=7\\) n=1000000 \\
  -node 10.0.0.1 \\
  -rate threads=100

# Use a custom YAML profile
cassandra-stress user \\
  profile=stress-profile.yaml \\
  ops\\(insert=1,read=3\\) \\
  n=500000 \\
  -node 10.0.0.1

# Print stats every 10 seconds
cassandra-stress write n=1000000 -node 10.0.0.1 -log interval=10`,
                },
              ],
            },
          },
          // ── Schema Migration Patterns ─────────────────────────────────────
          {
            title: "Schema & Migration Patterns",
            description: "Schema export, zero-downtime changes, and query-driven design tips",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Export & compare schema",
                  content: `# Export full schema to a file
cqlsh -e "DESCRIBE SCHEMA" > full_schema.cql

# Export a single keyspace
cqlsh -e "DESCRIBE KEYSPACE my_keyspace" > my_keyspace.cql

# Export a single table
cqlsh -e "DESCRIBE TABLE my_keyspace.users" > users_table.cql

# Apply a schema file
cqlsh -f schema_changes.cql

# Apply with host and credentials
cqlsh 10.0.0.1 -u cassandra -p cassandra -f migration.cql

# Diff two schema files
diff schema_before.cql schema_after.cql`,
                },
                {
                  order: 1, language: "sql", label: "Zero-downtime schema changes",
                  content: `-- Safe: add a nullable column (no backfill needed)
ALTER TABLE users ADD last_login TIMESTAMP;

-- Safe: add a new table for a new access pattern
CREATE TABLE users_by_email (
  email   TEXT PRIMARY KEY,
  user_id UUID
);

-- Safe: add an index (built asynchronously)
CREATE INDEX IF NOT EXISTS ON users (country);

-- Dual-write migration pattern:
-- 1. Add new column to existing table
ALTER TABLE orders ADD new_status TEXT;

-- 2. Write to both old and new columns in application
-- 3. Backfill new column (small batches to avoid pressure)

-- 4. Switch reads to new column
-- 5. Drop old column after gc_grace_seconds has passed
ALTER TABLE orders DROP status;

/*
Key query-driven design rules:
  - Model tables around query patterns, not entities
  - Each query should hit exactly one partition
  - Avoid ALLOW FILTERING in production
  - Avoid large partitions (> 100 MB or > 100K rows)
  - Denormalize: duplicate data across tables is normal
  - Use TIMEUUID for time-ordered clustering keys
*/`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Cassandra cheatsheet: ${cassandra.name} (${cassandra.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
