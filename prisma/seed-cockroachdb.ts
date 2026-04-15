import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.category.deleteMany({ where: { name: "CockroachDB", userId: null } });

  const crdb = await prisma.category.create({
    data: {
      name: "CockroachDB",
      icon: "🪳",
      color: "green",
      description: "CockroachDB: SQL, transactions, multi-region, changefeeds, cluster operations, and tuning",
      isPublic: true,
      snippets: {
        create: [
          // ── Connection & CLI ──────────────────────────────────────────────
          {
            title: "Connection & CLI",
            description: "Connect with cockroach sql and manage the cluster CLI",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Connect with cockroach sql",
                  content: `# Connect to a local insecure node
cockroach sql --insecure

# Connect to a local secure node
cockroach sql --certs-dir=certs

# Connect to a remote cluster
cockroach sql --url "postgresql://user:pass@host:26257/defaultdb?sslmode=verify-full"

# Connect with individual flags
cockroach sql \\
  --host=10.0.0.1 \\
  --port=26257 \\
  --user=myuser \\
  --database=mydb \\
  --certs-dir=certs

# Execute a SQL statement directly
cockroach sql --insecure -e "SHOW DATABASES"
cockroach sql --url "$COCKROACH_URL" -e "SELECT version()"

# Execute a SQL file
cockroach sql --insecure -f schema.sql
cockroach sql --url "$COCKROACH_URL" -f migration.sql

# Connect via standard PostgreSQL drivers (CockroachDB is wire-compatible)
psql "postgresql://user:pass@host:26257/mydb?sslmode=verify-full"`,
                },
                {
                  order: 1, language: "bash", label: "cockroach CLI essentials",
                  content: `# Start a single-node dev cluster (insecure)
cockroach start-single-node --insecure --listen-addr=localhost:26257 --http-addr=localhost:8080

# Start a secure single-node cluster
cockroach start-single-node --certs-dir=certs --listen-addr=localhost:26257

# Start a multi-node cluster node
cockroach start \\
  --insecure \\
  --store=node1 \\
  --listen-addr=localhost:26257 \\
  --http-addr=localhost:8080 \\
  --join=localhost:26257,localhost:26258,localhost:26259

# Init a new cluster (run once after all nodes start)
cockroach init --insecure --host=localhost:26257

# Create a user
cockroach sql --insecure -e "CREATE USER alice WITH PASSWORD 'secret'"

# Create TLS certs (secure mode)
cockroach cert create-ca --certs-dir=certs --ca-key=certs/ca.key
cockroach cert create-node localhost $(hostname) --certs-dir=certs --ca-key=certs/ca.key
cockroach cert create-client root --certs-dir=certs --ca-key=certs/ca.key`,
                },
              ],
            },
          },
          // ── Databases & Schemas ───────────────────────────────────────────
          {
            title: "Databases & Schemas",
            description: "Create and manage databases, schemas, and users",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "Databases & schemas",
                  content: `-- List databases
SHOW DATABASES;

-- Create a database
CREATE DATABASE mydb;
CREATE DATABASE IF NOT EXISTS mydb;

-- Switch database
USE mydb;
SET database = mydb;

-- Drop database
DROP DATABASE mydb;
DROP DATABASE IF EXISTS mydb CASCADE;  -- also drops all tables

-- Schemas (CockroachDB supports PostgreSQL-style schemas)
CREATE SCHEMA mydb.analytics;
SHOW SCHEMAS FROM mydb;
SET search_path = analytics, public;

-- Current database / schema
SELECT current_database(), current_schema();`,
                },
                {
                  order: 1, language: "sql", label: "Users, roles & grants",
                  content: `-- Create users
CREATE USER alice WITH PASSWORD 'secret';
CREATE USER bob;   -- no password (cert-based auth)

-- Create a role
CREATE ROLE readonly;
CREATE ROLE readwrite;

-- Grant privileges
GRANT SELECT ON DATABASE mydb TO readonly;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE mydb.public.orders TO readwrite;
GRANT ALL ON DATABASE mydb TO alice;
GRANT readonly TO alice;          -- assign role to user

-- Grant schema usage
GRANT USAGE ON SCHEMA analytics TO alice;

-- Show grants
SHOW GRANTS ON DATABASE mydb;
SHOW GRANTS ON TABLE orders;
SHOW GRANTS FOR alice;

-- Revoke
REVOKE SELECT ON TABLE orders FROM readonly;

-- Drop user / role
DROP USER alice;
DROP ROLE readonly;`,
                },
              ],
            },
          },
          // ── DDL ───────────────────────────────────────────────────────────
          {
            title: "DDL — Tables & Indexes",
            description: "Create, alter, and drop tables and indexes",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "Tables",
                  content: `-- Basic table (UUID primary key — recommended)
CREATE TABLE users (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  email      STRING      NOT NULL UNIQUE,
  name       STRING      NOT NULL,
  age        INT,
  active     BOOL        DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Composite primary key
CREATE TABLE order_items (
  order_id   UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity   INT  NOT NULL,
  price      DECIMAL(10,2),
  PRIMARY KEY (order_id, product_id)
);

-- With foreign key
CREATE TABLE orders (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total       DECIMAL(10,2),
  status      STRING      DEFAULT 'pending',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Show table schema
SHOW CREATE TABLE users;

-- List tables
SHOW TABLES FROM mydb;

-- Drop table
DROP TABLE users;
DROP TABLE IF EXISTS users CASCADE;`,
                },
                {
                  order: 1, language: "sql", label: "ALTER TABLE",
                  content: `-- Add column
ALTER TABLE users ADD COLUMN phone STRING;
ALTER TABLE users ADD COLUMN score FLOAT DEFAULT 0.0 NOT NULL;

-- Drop column
ALTER TABLE users DROP COLUMN phone;

-- Rename column
ALTER TABLE users RENAME COLUMN name TO full_name;

-- Rename table
ALTER TABLE users RENAME TO app_users;

-- Add / drop constraint
ALTER TABLE orders ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE orders DROP CONSTRAINT fk_user;

-- Set / drop default
ALTER TABLE users ALTER COLUMN active SET DEFAULT false;
ALTER TABLE users ALTER COLUMN active DROP DEFAULT;

-- Set NOT NULL
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Change column type (CockroachDB is cautious — compatible types only)
ALTER TABLE users ALTER COLUMN age TYPE BIGINT;`,
                },
                {
                  order: 2, language: "sql", label: "Indexes",
                  content: `-- Single-column index
CREATE INDEX ON users (email);
CREATE INDEX users_email_idx ON users (email);

-- Multi-column index
CREATE INDEX ON orders (user_id, created_at DESC);

-- Unique index
CREATE UNIQUE INDEX ON users (email);

-- Partial index (only index rows matching condition)
CREATE INDEX ON orders (user_id) WHERE status = 'pending';

-- Inverted index (for JSONB / arrays)
CREATE INVERTED INDEX ON products (attributes);

-- Storing index (include extra columns to avoid table lookup)
CREATE INDEX ON orders (user_id) STORING (total, status);

-- Show indexes on a table
SHOW INDEXES FROM orders;

-- Drop index
DROP INDEX users_email_idx;
DROP INDEX IF EXISTS orders@orders_user_id_idx;`,
                },
              ],
            },
          },
          // ── DML ───────────────────────────────────────────────────────────
          {
            title: "DML — CRUD",
            description: "Insert, select, update, upsert, and delete",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "INSERT & UPSERT",
                  content: `-- Basic insert
INSERT INTO users (email, name, age) VALUES ('alice@example.com', 'Alice', 30);

-- Multiple rows
INSERT INTO users (email, name) VALUES
  ('bob@example.com', 'Bob'),
  ('carol@example.com', 'Carol');

-- Insert with auto-generated UUID
INSERT INTO users (id, email, name)
VALUES (gen_random_uuid(), 'dave@example.com', 'Dave');

-- Return inserted row
INSERT INTO users (email, name) VALUES ('eve@example.com', 'Eve')
RETURNING id, created_at;

-- UPSERT (insert or replace on PK/unique conflict)
UPSERT INTO users (id, email, name) VALUES ('some-uuid', 'alice@example.com', 'Alice Updated');

-- INSERT ON CONFLICT (PostgreSQL-style)
INSERT INTO users (email, name) VALUES ('alice@example.com', 'Alice')
ON CONFLICT (email) DO UPDATE SET name = excluded.name;

-- Insert and do nothing on conflict
INSERT INTO users (email, name) VALUES ('alice@example.com', 'Alice')
ON CONFLICT (email) DO NOTHING;`,
                },
                {
                  order: 1, language: "sql", label: "SELECT",
                  content: `-- Basic select
SELECT * FROM users WHERE active = true;
SELECT id, name, email FROM users WHERE age > 25 ORDER BY name LIMIT 10;

-- Keyset pagination (efficient — avoids OFFSET on large tables)
SELECT id, name FROM users
WHERE id > 'last-seen-uuid'
ORDER BY id
LIMIT 20;

-- Aggregation
SELECT status, COUNT(*), SUM(total), AVG(total)
FROM orders
GROUP BY status
HAVING COUNT(*) > 5;

-- JOIN
SELECT u.name, o.id, o.total
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.status = 'shipped'
ORDER BY o.created_at DESC;

-- CTE
WITH recent_orders AS (
  SELECT user_id, COUNT(*) AS cnt
  FROM orders
  WHERE created_at > now() - INTERVAL '30 days'
  GROUP BY user_id
)
SELECT u.name, r.cnt
FROM users u
JOIN recent_orders r ON u.id = r.user_id
ORDER BY r.cnt DESC;

-- JSONB
SELECT id, attributes->>'color' AS color
FROM products
WHERE attributes @> '{"in_stock": true}';`,
                },
                {
                  order: 2, language: "sql", label: "UPDATE & DELETE",
                  content: `-- Update rows
UPDATE users SET active = false WHERE last_login < now() - INTERVAL '90 days';

-- Update with RETURNING
UPDATE orders SET status = 'shipped' WHERE id = 'some-uuid' RETURNING id, status;

-- Update with JOIN (using FROM)
UPDATE orders o
SET status = 'vip_shipped'
FROM users u
WHERE o.user_id = u.id AND u.tier = 'vip' AND o.status = 'pending';

-- Delete rows
DELETE FROM sessions WHERE expires_at < now();

-- Delete with RETURNING
DELETE FROM orders WHERE id = 'some-uuid' RETURNING *;

-- Truncate (fast delete all rows)
TRUNCATE TABLE sessions;
TRUNCATE TABLE sessions, cache;  -- multiple tables`,
                },
              ],
            },
          },
          // ── Transactions ──────────────────────────────────────────────────
          {
            title: "Transactions",
            description: "ACID transactions, savepoints, and retry handling",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "Transaction basics",
                  content: `-- Basic transaction
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 'a1';
  UPDATE accounts SET balance = balance + 100 WHERE id = 'a2';
COMMIT;

-- Rollback on error
BEGIN;
  INSERT INTO orders (id, user_id, total) VALUES (gen_random_uuid(), 'u1', 99.99);
  -- something fails...
ROLLBACK;

-- Isolation levels (CockroachDB default: SERIALIZABLE)
BEGIN ISOLATION LEVEL SERIALIZABLE;
BEGIN ISOLATION LEVEL READ COMMITTED;  -- available in v23.1+

-- Read-only transaction (optimized — no write intents)
BEGIN READ ONLY;
  SELECT * FROM products WHERE category = 'electronics';
COMMIT;

-- Savepoints
BEGIN;
  INSERT INTO users (email, name) VALUES ('x@example.com', 'X');
  SAVEPOINT my_savepoint;
  INSERT INTO orders (user_id, total) VALUES ('some-uuid', 50);
  -- roll back only to savepoint
  ROLLBACK TO SAVEPOINT my_savepoint;
  -- users insert is still active
COMMIT;`,
                },
                {
                  order: 1, language: "sql", label: "Client-side retry (recommended pattern)",
                  content: `-- CockroachDB may return a 40001 serialization error.
-- The recommended pattern is to retry the entire transaction.

-- Cockroach-specific: use SAVEPOINT cockroach_restart for automatic retries
BEGIN;
  SAVEPOINT cockroach_restart;
  -- execute statements...
  UPDATE accounts SET balance = balance - 100 WHERE id = 'a1';
  UPDATE accounts SET balance = balance + 100 WHERE id = 'a2';
  RELEASE SAVEPOINT cockroach_restart;
COMMIT;

-- If a 40001 error occurs, retry with:
ROLLBACK TO SAVEPOINT cockroach_restart;
-- then re-execute statements and RELEASE + COMMIT again

-- Show transaction priority (to reduce contention)
BEGIN PRIORITY HIGH;
BEGIN PRIORITY LOW;
BEGIN PRIORITY NORMAL;  -- default`,
                },
              ],
            },
          },
          // ── Multi-Region ──────────────────────────────────────────────────
          {
            title: "Multi-Region",
            description: "Survive zone/region failures and optimise data locality",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "Cluster regions & database locality",
                  content: `-- Show regions available in the cluster
SHOW REGIONS;
SHOW REGIONS FROM CLUSTER;

-- Show regions for a database
SHOW REGIONS FROM DATABASE mydb;

-- Add regions to a database
ALTER DATABASE mydb ADD REGION "us-east1";
ALTER DATABASE mydb ADD REGION "eu-west1";
ALTER DATABASE mydb ADD REGION "ap-southeast1";

-- Set the primary region
ALTER DATABASE mydb SET PRIMARY REGION "us-east1";

-- Drop a region
ALTER DATABASE mydb DROP REGION "ap-southeast1";

-- Survive zone failure (default)
ALTER DATABASE mydb SURVIVE ZONE FAILURE;

-- Survive region failure (requires 3+ regions)
ALTER DATABASE mydb SURVIVE REGION FAILURE;`,
                },
                {
                  order: 1, language: "sql", label: "Table locality",
                  content: `-- REGIONAL BY TABLE — whole table pinned to primary region (default)
ALTER TABLE orders SET LOCALITY REGIONAL BY TABLE IN PRIMARY REGION;
ALTER TABLE orders SET LOCALITY REGIONAL BY TABLE IN "us-east1";

-- REGIONAL BY ROW — each row stored near its home region
--   requires a hidden or explicit crdb_region column
ALTER TABLE users SET LOCALITY REGIONAL BY ROW;

-- With explicit region column
ALTER TABLE users ADD COLUMN region crdb_internal_region
  NOT VISIBLE DEFAULT default_to_database_primary_region(gateway_region())::crdb_internal_region;
ALTER TABLE users SET LOCALITY REGIONAL BY ROW AS region;

-- Insert into a specific region
INSERT INTO users (email, name, region)
VALUES ('alice@example.com', 'Alice', 'us-east1');

-- GLOBAL — low-latency reads everywhere (replicated to all regions)
-- Best for reference tables (currencies, countries, config)
ALTER TABLE currencies SET LOCALITY GLOBAL;

-- Show table locality
SHOW CREATE TABLE users;
SHOW LOCALITY OF TABLE users;`,
                },
              ],
            },
          },
          // ── Changefeeds ───────────────────────────────────────────────────
          {
            title: "Changefeeds (CDC)",
            description: "Stream row-level changes to Kafka, GCS, S3, and webhooks",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "Create & manage changefeeds",
                  content: `-- Core changefeed (prints to SQL client — for testing)
CREATE CHANGEFEED FOR TABLE orders;

-- Enterprise changefeed to Kafka
CREATE CHANGEFEED FOR TABLE orders, users
INTO 'kafka://broker:9092'
WITH updated, resolved = '10s', key_in_value;

-- Changefeed to GCS
CREATE CHANGEFEED FOR TABLE orders
INTO 'gs://my-bucket/crdb-feed?AUTH=implicit'
WITH updated, resolved = '30s', format = csv;

-- Changefeed to S3
CREATE CHANGEFEED FOR TABLE orders
INTO 's3://my-bucket/feed?AWS_ACCESS_KEY_ID=xxx&AWS_SECRET_ACCESS_KEY=yyy'
WITH updated, resolved, format = json;

-- Changefeed to webhook
CREATE CHANGEFEED FOR TABLE orders
INTO 'webhook-https://my-service.example.com/events'
WITH updated, format = json;

-- Show all changefeeds
SHOW CHANGEFEED JOBS;
SHOW JOBS (SELECT job_id FROM [SHOW CHANGEFEED JOBS]);

-- Pause / resume / cancel
PAUSE JOB <job-id>;
RESUME JOB <job-id>;
CANCEL JOB <job-id>;`,
                },
              ],
            },
          },
          // ── Backup & Restore ──────────────────────────────────────────────
          {
            title: "Backup & Restore",
            description: "Full, incremental, and point-in-time backup and restore",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "Backup",
                  content: `-- Full cluster backup to S3
BACKUP INTO 's3://my-bucket/backups?AWS_ACCESS_KEY_ID=xxx&AWS_SECRET_ACCESS_KEY=yyy';

-- Full database backup
BACKUP DATABASE mydb INTO 's3://my-bucket/mydb-backup';

-- Full table backup
BACKUP TABLE mydb.orders INTO 's3://my-bucket/orders-backup';

-- Incremental backup (appended to an existing full backup)
BACKUP INTO LATEST IN 's3://my-bucket/backups';

-- Scheduled backup (full weekly, incremental daily)
CREATE SCHEDULE daily_backup
FOR BACKUP INTO 's3://my-bucket/backups'
  RECURRING '@daily'
  FULL BACKUP '@weekly'
  WITH SCHEDULE OPTIONS first_run = 'now';

-- Show backup schedules
SHOW SCHEDULES;
SHOW SCHEDULE <schedule-id>;

-- Pause / resume a schedule
PAUSE SCHEDULE <schedule-id>;
RESUME SCHEDULE <schedule-id>;`,
                },
                {
                  order: 1, language: "sql", label: "Restore",
                  content: `-- Restore full cluster
RESTORE FROM LATEST IN 's3://my-bucket/backups';

-- Restore a database
RESTORE DATABASE mydb FROM LATEST IN 's3://my-bucket/backups';

-- Restore a table (into existing database)
RESTORE TABLE mydb.orders FROM LATEST IN 's3://my-bucket/backups';

-- Restore to a new table name
RESTORE TABLE mydb.orders FROM LATEST IN 's3://my-bucket/backups'
WITH into_db = 'mydb_restore';

-- Point-in-time restore (as-of-system-time)
RESTORE DATABASE mydb FROM 's3://my-bucket/backups'
AS OF SYSTEM TIME '2024-06-15 12:00:00';

-- Show restore jobs
SHOW JOBS WHERE job_type = 'RESTORE';`,
                },
              ],
            },
          },
          // ── Query Tuning ──────────────────────────────────────────────────
          {
            title: "Query Tuning",
            description: "EXPLAIN, optimizer hints, and session variables",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "EXPLAIN & EXPLAIN ANALYZE",
                  content: `-- Show query plan (logical)
EXPLAIN SELECT * FROM orders WHERE user_id = 'u1';

-- Verbose plan with estimated row counts and costs
EXPLAIN (VERBOSE) SELECT * FROM orders WHERE user_id = 'u1';

-- Show plan as JSON
EXPLAIN (FORMAT JSON) SELECT * FROM orders o JOIN users u ON o.user_id = u.id;

-- EXPLAIN ANALYZE — run query and show actual stats
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 'u1';

-- EXPLAIN ANALYZE with full plan details
EXPLAIN ANALYZE (VERBOSE) SELECT * FROM orders WHERE user_id = 'u1';

-- Debug plan (most detail, slowest)
EXPLAIN ANALYZE (DEBUG) SELECT * FROM orders WHERE user_id = 'u1';

-- Show table statistics (used by optimizer)
SHOW STATISTICS FOR TABLE orders;

-- Manually update table statistics
ANALYZE orders;
ANALYZE;   -- all tables`,
                },
                {
                  order: 1, language: "sql", label: "Optimizer hints & session settings",
                  content: `-- Force an index
SELECT * FROM orders@orders_user_id_idx WHERE user_id = 'u1';

-- Disable index (force table scan)
SELECT * FROM orders@{NO_INDEX_JOIN} WHERE status = 'pending';

-- Force a join algorithm
SELECT /*+ HASH JOIN */ * FROM orders o JOIN users u ON o.user_id = u.id;
SELECT /*+ LOOKUP JOIN */ * FROM orders o JOIN users u ON o.user_id = u.id;
SELECT /*+ MERGE JOIN */ * FROM orders o JOIN users u ON o.user_id = u.id;

-- AS OF SYSTEM TIME — read historical data (no contention)
SELECT * FROM orders AS OF SYSTEM TIME '-10s';
SELECT * FROM orders AS OF SYSTEM TIME '2024-06-15 12:00:00';
SELECT * FROM orders AS OF SYSTEM TIME follower_read_timestamp();

-- Session variables
SET statement_timeout = '30s';
SET idle_in_transaction_session_timeout = '60s';
SHOW statement_timeout;

-- Vectorized execution (default on)
SET vectorize = on;
SET vectorize = off;`,
                },
              ],
            },
          },
          // ── Cluster Operations ────────────────────────────────────────────
          {
            title: "Cluster Operations",
            description: "Node management, cluster settings, and jobs",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "Nodes & cluster settings",
                  content: `-- Show all nodes
SHOW NODES;

-- Show node locality and status
SELECT node_id, address, locality, is_available, is_live FROM crdb_internal.gossip_nodes;

-- Show cluster settings
SHOW CLUSTER SETTING kv.rangefeed.enabled;
SHOW ALL CLUSTER SETTINGS;

-- Change a cluster setting
SET CLUSTER SETTING kv.rangefeed.enabled = true;
SET CLUSTER SETTING server.time_until_store_dead = '5m';
SET CLUSTER SETTING sql.defaults.default_int_size = 8;

-- Show active sessions
SHOW SESSIONS;
SHOW LOCAL SESSIONS;

-- Kill a session
CANCEL SESSION '<session-id>';

-- Show active queries
SHOW QUERIES;
CANCEL QUERY '<query-id>';

-- Show all jobs (backups, imports, schema changes)
SHOW JOBS;
SHOW AUTOMATIC JOBS;`,
                },
                {
                  order: 1, language: "bash", label: "cockroach node & debug CLI",
                  content: `# List nodes
cockroach node ls --insecure --host=localhost:26257

# Show node status
cockroach node status --insecure --host=localhost:26257

# Decommission a node (drain + remove from cluster)
cockroach node decommission <node-id> --insecure --host=localhost:26257

# Recommission a node
cockroach node recommission <node-id> --insecure --host=localhost:26257

# Drain a node (for graceful shutdown)
cockroach node drain <node-id> --insecure --host=localhost:26257

# Dump a database schema
cockroach dump mydb --insecure --host=localhost:26257 --dump-mode=schema > schema.sql

# Dump data
cockroach dump mydb --insecure --host=localhost:26257 --dump-mode=data > data.sql

# Debug zip (collect diagnostics)
cockroach debug zip ./debug.zip --insecure --host=localhost:26257`,
                },
              ],
            },
          },
          // ── Import & Export ───────────────────────────────────────────────
          {
            title: "Import & Export",
            description: "Bulk import from CSV/Postgres and export data",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "IMPORT & EXPORT",
                  content: `-- Import CSV from S3 into a new table
IMPORT INTO users (id, email, name)
CSV DATA ('s3://my-bucket/users.csv?AWS_ACCESS_KEY_ID=xxx&AWS_SECRET_ACCESS_KEY=yyy')
WITH skip = '1',   -- skip header row
     nullif = '';

-- Import CSV from a nodelocal file
IMPORT INTO users (id, email, name)
CSV DATA ('nodelocal://1/users.csv')
WITH skip = '1';

-- Import a PostgreSQL dump
IMPORT PGDUMP 's3://my-bucket/dump.sql'
WITH ignore_unsupported_statements;

-- Import a table from a pgdump
IMPORT TABLE users FROM PGDUMP 's3://my-bucket/dump.sql';

-- Export to CSV on S3
EXPORT INTO CSV 's3://my-bucket/export?AWS_ACCESS_KEY_ID=xxx&AWS_SECRET_ACCESS_KEY=yyy'
FROM TABLE orders;

-- Export a query result
EXPORT INTO CSV 's3://my-bucket/pending-orders'
FROM SELECT * FROM orders WHERE status = 'pending';

-- Export to Parquet
EXPORT INTO PARQUET 's3://my-bucket/orders-parquet' FROM TABLE orders;`,
                },
              ],
            },
          },
          // ── Useful Patterns ───────────────────────────────────────────────
          {
            title: "Useful Patterns",
            description: "UUID keys, follower reads, schema changes, and contention tips",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "UUID keys & sequences",
                  content: `-- Preferred: gen_random_uuid() — avoids hotspots from sequential IDs
CREATE TABLE events (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL,
  event_type STRING NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Also available: uuid_generate_v4()
INSERT INTO events (id, user_id, event_type) VALUES (gen_random_uuid(), 'u1', 'click');

-- Sequence (use UUID or hash-sharded keys instead for high-write tables)
CREATE SEQUENCE order_num_seq START 1000 INCREMENT 1;
SELECT nextval('order_num_seq');

-- Hash-sharded index — avoids write hotspots on sequential keys
CREATE TABLE logs (
  id         INT DEFAULT unique_rowid() PRIMARY KEY,
  message    STRING,
  created_at TIMESTAMPTZ DEFAULT now()
) WITH (bucket_count = 8);

CREATE INDEX ON logs (created_at) USING HASH WITH (bucket_count = 8);`,
                },
                {
                  order: 1, language: "sql", label: "Follower reads & contention",
                  content: `-- Follower reads (stale, ~4.8s behind, served from nearest replica — zero contention)
SELECT * FROM orders AS OF SYSTEM TIME follower_read_timestamp()
WHERE user_id = 'u1';

-- Bounded staleness (CockroachDB 21.2+)
SELECT * FROM orders AS OF SYSTEM TIME with_max_staleness('10s')
WHERE user_id = 'u1';

-- Exact staleness
SELECT * FROM orders AS OF SYSTEM TIME '-30s';

-- Detect contention
SELECT * FROM crdb_internal.cluster_contention_events LIMIT 20;

-- Find hot ranges
SELECT range_id, lease_holder, queries_per_second
FROM crdb_internal.ranges
ORDER BY queries_per_second DESC
LIMIT 10;

-- Online schema changes (non-blocking — CockroachDB runs these async)
-- Safe to run without locking the table:
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB;
CREATE INDEX CONCURRENTLY ON orders (status);

-- Show schema change jobs
SHOW JOBS WHERE job_type = 'SCHEMA CHANGE';`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created CockroachDB cheatsheet: ${crdb.name} (${crdb.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
