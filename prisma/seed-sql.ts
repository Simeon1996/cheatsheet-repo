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
    where: { name: "SQL", userId: admin.id },
  });

  const sql = await prisma.category.create({
    data: {
      name: "SQL",
      icon: "🗄️",
      color: "blue",
      description: "SQL fundamentals — querying, joins, aggregation, window functions, indexes, CTEs and performance patterns",
      userId: admin.id,
      isPublic: true,
      snippets: {
        create: [
          // ── SELECT & Filtering ────────────────────────────────────────────────
          {
            title: "SELECT & Filtering",
            description: "Query rows, filter with WHERE, sort and limit results",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "SELECT basics",
                  content: `-- All columns
SELECT * FROM users;

-- Specific columns
SELECT id, name, email FROM users;

-- Column aliases
SELECT
  id,
  first_name || ' ' || last_name AS full_name,
  created_at                     AS joined_at
FROM users;

-- Distinct values
SELECT DISTINCT country FROM users;
SELECT DISTINCT ON (country) country, name FROM users ORDER BY country, name;

-- Limit and offset
SELECT * FROM products ORDER BY created_at DESC LIMIT 20 OFFSET 40;

-- Conditional expression
SELECT
  name,
  CASE
    WHEN age < 18 THEN 'minor'
    WHEN age < 65 THEN 'adult'
    ELSE 'senior'
  END AS age_group
FROM users;`,
                },
                {
                  order: 1, language: "sql", label: "WHERE — filtering rows",
                  content: `-- Comparison operators
SELECT * FROM orders WHERE status = 'pending';
SELECT * FROM orders WHERE total > 100;
SELECT * FROM orders WHERE total BETWEEN 50 AND 200;
SELECT * FROM users  WHERE age != 30;
SELECT * FROM users  WHERE name IS NULL;
SELECT * FROM users  WHERE name IS NOT NULL;

-- Logical operators
SELECT * FROM orders
WHERE status = 'pending'
  AND total > 100
  AND created_at >= '2025-01-01';

SELECT * FROM users WHERE role = 'admin' OR role = 'moderator';

-- IN and NOT IN
SELECT * FROM orders WHERE status IN ('pending', 'processing', 'shipped');
SELECT * FROM users  WHERE id NOT IN (SELECT user_id FROM banned_users);

-- LIKE — pattern matching
SELECT * FROM users WHERE email LIKE '%@gmail.com';
SELECT * FROM users WHERE name  LIKE 'Al%';     -- starts with Al
SELECT * FROM users WHERE name  ILIKE 'alice%'; -- case-insensitive (PostgreSQL)
SELECT * FROM users WHERE phone LIKE '___-____'; -- _ matches one char

-- EXISTS
SELECT * FROM users u
WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.total > 500
);`,
                },
                {
                  order: 2, language: "sql", label: "ORDER BY, LIMIT and NULL handling",
                  content: `-- Sort ascending (default) and descending
SELECT * FROM products ORDER BY price ASC;
SELECT * FROM products ORDER BY price DESC;

-- Multiple sort keys
SELECT * FROM users ORDER BY country ASC, name ASC;

-- NULL placement (PostgreSQL)
SELECT * FROM users ORDER BY last_login DESC NULLS LAST;
SELECT * FROM users ORDER BY last_login ASC  NULLS FIRST;

-- Top N per group using LIMIT
SELECT * FROM orders ORDER BY total DESC LIMIT 10;

-- COALESCE — return first non-NULL value
SELECT COALESCE(nickname, first_name, 'Anonymous') AS display_name FROM users;

-- NULLIF — return NULL if two values are equal (avoids division by zero)
SELECT revenue / NULLIF(sessions, 0) AS revenue_per_session FROM stats;`,
                },
              ],
            },
          },
          // ── JOINs ─────────────────────────────────────────────────────────────
          {
            title: "JOINs",
            description: "Combine rows from multiple tables",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "INNER, LEFT, RIGHT and FULL JOIN",
                  content: `-- INNER JOIN — only matching rows from both tables
SELECT o.id, u.name, o.total
FROM orders o
INNER JOIN users u ON o.user_id = u.id;

-- LEFT JOIN — all rows from left, matched from right (NULL if no match)
SELECT u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name;

-- RIGHT JOIN — all rows from right, matched from left
SELECT o.id, u.name
FROM orders o
RIGHT JOIN users u ON o.user_id = u.id;

-- FULL OUTER JOIN — all rows from both sides
SELECT u.name, o.id AS order_id
FROM users u
FULL OUTER JOIN orders o ON o.user_id = u.id;

-- CROSS JOIN — every combination (Cartesian product)
SELECT p.name AS product, c.name AS colour
FROM products p
CROSS JOIN colours c;`,
                },
                {
                  order: 1, language: "sql", label: "Self join, multi-table and join filters",
                  content: `-- Self join — join a table to itself
SELECT
  e.name        AS employee,
  m.name        AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;

-- Three-table join
SELECT
  o.id          AS order_id,
  u.name        AS customer,
  p.name        AS product,
  oi.quantity,
  oi.unit_price
FROM orders       o
JOIN users        u  ON o.user_id    = u.id
JOIN order_items  oi ON oi.order_id  = o.id
JOIN products     p  ON oi.product_id = p.id
WHERE o.status = 'completed';

-- Filter on JOIN condition vs WHERE (different results with LEFT JOIN)
-- Filter in ON  — filters before join (keeps all left rows)
SELECT u.name, o.total
FROM users u
LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'completed';

-- Filter in WHERE — filters after join (removes non-matching left rows)
SELECT u.name, o.total
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.status = 'completed'; -- turns it into an INNER JOIN effectively`,
                },
              ],
            },
          },
          // ── Aggregation & Grouping ────────────────────────────────────────────
          {
            title: "Aggregation & Grouping",
            description: "GROUP BY, aggregate functions and HAVING",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "Aggregate functions",
                  content: `-- COUNT
SELECT COUNT(*)          FROM orders;             -- all rows including NULLs
SELECT COUNT(1)          FROM orders;             -- same
SELECT COUNT(coupon_id)  FROM orders;             -- non-NULL coupon_id only
SELECT COUNT(DISTINCT user_id) FROM orders;       -- unique users who ordered

-- SUM, AVG, MIN, MAX
SELECT
  SUM(total)             AS revenue,
  AVG(total)             AS avg_order_value,
  MIN(total)             AS smallest_order,
  MAX(total)             AS largest_order,
  ROUND(AVG(total), 2)   AS avg_rounded
FROM orders
WHERE status = 'completed';

-- String aggregation (PostgreSQL)
SELECT
  user_id,
  STRING_AGG(tag, ', ' ORDER BY tag) AS tags
FROM user_tags
GROUP BY user_id;

-- Array aggregation (PostgreSQL)
SELECT user_id, ARRAY_AGG(product_id ORDER BY created_at) AS product_ids
FROM order_items
GROUP BY user_id;`,
                },
                {
                  order: 1, language: "sql", label: "GROUP BY and HAVING",
                  content: `-- Basic grouping
SELECT status, COUNT(*) AS count
FROM orders
GROUP BY status;

-- Multiple group keys
SELECT
  DATE_TRUNC('month', created_at) AS month,
  status,
  COUNT(*)                        AS count,
  SUM(total)                      AS revenue
FROM orders
GROUP BY 1, 2           -- reference by column position
ORDER BY 1 DESC, 2;

-- HAVING — filter on aggregate (WHERE runs before GROUP BY, HAVING after)
SELECT user_id, COUNT(*) AS order_count, SUM(total) AS total_spent
FROM orders
GROUP BY user_id
HAVING COUNT(*) >= 5             -- only users with 5+ orders
   AND SUM(total) > 1000
ORDER BY total_spent DESC;

-- FILTER clause (PostgreSQL) — conditional aggregation
SELECT
  COUNT(*)                                      AS total_orders,
  COUNT(*) FILTER (WHERE status = 'completed')  AS completed,
  COUNT(*) FILTER (WHERE status = 'refunded')   AS refunded,
  SUM(total) FILTER (WHERE status = 'completed') AS completed_revenue
FROM orders;`,
                },
              ],
            },
          },
          // ── Subqueries & CTEs ─────────────────────────────────────────────────
          {
            title: "Subqueries & CTEs",
            description: "Nested queries, WITH clauses and recursive CTEs",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "Subqueries",
                  content: `-- Scalar subquery — returns single value
SELECT name, salary,
  (SELECT AVG(salary) FROM employees) AS company_avg
FROM employees;

-- Subquery in WHERE
SELECT * FROM products
WHERE price > (SELECT AVG(price) FROM products);

-- Subquery in FROM (derived table / inline view)
SELECT dept, avg_salary
FROM (
  SELECT department AS dept, AVG(salary) AS avg_salary
  FROM employees
  GROUP BY department
) AS dept_stats
WHERE avg_salary > 80000;

-- Correlated subquery — references outer query row by row
SELECT name, salary
FROM employees e
WHERE salary > (
  SELECT AVG(salary)
  FROM employees
  WHERE department = e.department  -- correlated to outer row
);

-- ANY / ALL
SELECT name FROM products
WHERE price > ANY (SELECT price FROM products WHERE category = 'budget');

SELECT name FROM products
WHERE price > ALL (SELECT price FROM products WHERE category = 'budget');`,
                },
                {
                  order: 1, language: "sql", label: "CTEs — WITH clause",
                  content: `-- Basic CTE
WITH active_users AS (
  SELECT id, name, email
  FROM users
  WHERE last_login > NOW() - INTERVAL '30 days'
)
SELECT u.name, COUNT(o.id) AS recent_orders
FROM active_users u
LEFT JOIN orders o ON o.user_id = u.id
  AND o.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.id, u.name;

-- Multiple CTEs
WITH
  monthly_revenue AS (
    SELECT
      DATE_TRUNC('month', created_at) AS month,
      SUM(total) AS revenue
    FROM orders
    WHERE status = 'completed'
    GROUP BY 1
  ),
  ranked AS (
    SELECT *,
      LAG(revenue) OVER (ORDER BY month) AS prev_revenue
    FROM monthly_revenue
  )
SELECT
  month,
  revenue,
  prev_revenue,
  ROUND((revenue - prev_revenue) / NULLIF(prev_revenue, 0) * 100, 1) AS pct_change
FROM ranked
ORDER BY month;

-- Recursive CTE — walk a hierarchy
WITH RECURSIVE org_tree AS (
  -- Base case: top-level managers
  SELECT id, name, manager_id, 0 AS depth
  FROM employees
  WHERE manager_id IS NULL

  UNION ALL

  -- Recursive case: employees reporting to previous level
  SELECT e.id, e.name, e.manager_id, t.depth + 1
  FROM employees e
  JOIN org_tree t ON e.manager_id = t.id
)
SELECT depth, name FROM org_tree ORDER BY depth, name;`,
                },
              ],
            },
          },
          // ── Window Functions ──────────────────────────────────────────────────
          {
            title: "Window Functions",
            description: "ROW_NUMBER, RANK, LAG, LEAD, running totals and percentiles",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "Ranking functions",
                  content: `-- ROW_NUMBER — unique sequential number per partition
SELECT
  name,
  department,
  salary,
  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS row_num
FROM employees;

-- RANK — same rank for ties, gaps after ties (1,2,2,4)
SELECT name, score,
  RANK() OVER (ORDER BY score DESC) AS rank
FROM leaderboard;

-- DENSE_RANK — same rank for ties, no gaps (1,2,2,3)
SELECT name, score,
  DENSE_RANK() OVER (ORDER BY score DESC) AS dense_rank
FROM leaderboard;

-- NTILE — divide rows into N buckets
SELECT name, salary,
  NTILE(4) OVER (ORDER BY salary) AS quartile  -- 1=bottom 4=top
FROM employees;

-- Top 1 per group using ROW_NUMBER
SELECT department, name, salary
FROM (
  SELECT department, name, salary,
    ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn
  FROM employees
) ranked
WHERE rn = 1;`,
                },
                {
                  order: 1, language: "sql", label: "LAG, LEAD, running totals and frames",
                  content: `-- LAG / LEAD — access previous / next row value
SELECT
  month,
  revenue,
  LAG(revenue, 1, 0) OVER (ORDER BY month)  AS prev_month_revenue,
  LEAD(revenue, 1)   OVER (ORDER BY month)  AS next_month_revenue,
  revenue - LAG(revenue) OVER (ORDER BY month) AS month_over_month_change
FROM monthly_revenue;

-- Running total (cumulative sum)
SELECT
  created_at::date AS day,
  daily_revenue,
  SUM(daily_revenue) OVER (ORDER BY created_at) AS running_total
FROM daily_stats;

-- Moving average (7-day)
SELECT
  day,
  revenue,
  AVG(revenue) OVER (
    ORDER BY day
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) AS moving_avg_7d
FROM daily_revenue;

-- FIRST_VALUE / LAST_VALUE
SELECT
  name, salary, department,
  FIRST_VALUE(name) OVER (
    PARTITION BY department ORDER BY salary DESC
  ) AS highest_earner
FROM employees;

-- PERCENT_RANK and CUME_DIST
SELECT name, score,
  ROUND(PERCENT_RANK() OVER (ORDER BY score)::numeric, 2) AS percentile,
  ROUND(CUME_DIST()    OVER (ORDER BY score)::numeric, 2) AS cumulative_dist
FROM results;`,
                },
              ],
            },
          },
          // ── DDL — Schema Definition ───────────────────────────────────────────
          {
            title: "DDL — Schema Definition",
            description: "CREATE, ALTER, DROP tables, columns and constraints",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "CREATE TABLE with constraints",
                  content: `CREATE TABLE users (
  id           BIGSERIAL    PRIMARY KEY,
  email        TEXT         NOT NULL UNIQUE,
  name         TEXT         NOT NULL,
  role         TEXT         NOT NULL DEFAULT 'user'
                            CHECK (role IN ('user', 'admin', 'moderator')),
  age          INT          CHECK (age >= 0 AND age <= 150),
  metadata     JSONB,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
  id           BIGSERIAL    PRIMARY KEY,
  user_id      BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status       TEXT         NOT NULL DEFAULT 'pending',
  total        NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  -- Named table constraint
  CONSTRAINT orders_status_check
    CHECK (status IN ('pending','processing','shipped','completed','refunded'))
);

-- If not exists
CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  user_id    BIGINT REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL
);`,
                },
                {
                  order: 1, language: "sql", label: "ALTER TABLE — modify schema",
                  content: `-- Add column
ALTER TABLE users ADD COLUMN phone TEXT;
ALTER TABLE users ADD COLUMN verified_at TIMESTAMPTZ;

-- Add with default (PostgreSQL rewrites table — use batched backfill for large tables)
ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Drop column
ALTER TABLE users DROP COLUMN phone;
ALTER TABLE users DROP COLUMN IF EXISTS legacy_field;

-- Rename column
ALTER TABLE users RENAME COLUMN name TO full_name;

-- Change type
ALTER TABLE products ALTER COLUMN price TYPE NUMERIC(12,2);

-- Set / drop default
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;

-- Set / drop NOT NULL
ALTER TABLE users ALTER COLUMN phone SET NOT NULL;
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;

-- Add constraint
ALTER TABLE orders ADD CONSTRAINT fk_user
  FOREIGN KEY (user_id) REFERENCES users(id);

-- Drop constraint
ALTER TABLE orders DROP CONSTRAINT fk_user;

-- Rename table
ALTER TABLE user_sessions RENAME TO sessions;`,
                },
              ],
            },
          },
          // ── Indexes ───────────────────────────────────────────────────────────
          {
            title: "Indexes",
            description: "Create, choose and analyse indexes for query performance",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "Creating indexes",
                  content: `-- Basic index
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- Unique index (enforces uniqueness like a constraint)
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Composite index — column order matters
-- Useful for: WHERE user_id = ? AND status = ?
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- Partial index — index a subset of rows
CREATE INDEX idx_orders_pending ON orders(created_at)
WHERE status = 'pending';

-- Index on expression
CREATE INDEX idx_users_email_lower ON users(LOWER(email));
-- Enables: WHERE LOWER(email) = LOWER('User@Example.com')

-- JSONB index (PostgreSQL)
CREATE INDEX idx_users_meta ON users USING GIN(metadata);

-- Full-text search index
CREATE INDEX idx_posts_search ON posts USING GIN(to_tsvector('english', title || ' ' || body));

-- Concurrent index build (no table lock)
CREATE INDEX CONCURRENTLY idx_orders_created ON orders(created_at);

-- Drop index
DROP INDEX IF EXISTS idx_orders_user_id;
DROP INDEX CONCURRENTLY idx_orders_created;`,
                },
                {
                  order: 1, language: "sql", label: "EXPLAIN and query analysis",
                  content: `-- Show query plan (no execution)
EXPLAIN
SELECT * FROM orders WHERE user_id = 42 AND status = 'pending';

-- Execute and show actual timing and row counts
EXPLAIN ANALYZE
SELECT * FROM orders WHERE user_id = 42;

-- Full detail — buffers, I/O, format
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT o.id, u.name
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.created_at > NOW() - INTERVAL '7 days';

-- Key terms in EXPLAIN output:
-- Seq Scan    — full table scan (no index used)
-- Index Scan  — uses index to find rows then fetches from heap
-- Index Only Scan — all needed columns in index (fastest)
-- Bitmap Scan — multi-index combine, good for large result sets
-- Hash Join   — good for large unsorted datasets
-- Nested Loop — good for small inner datasets
-- Sort        — check if it could be eliminated with an index
-- cost=X..Y   — estimated startup..total cost (arbitrary units)
-- rows=N      — estimated row count (check against actual)
-- actual time=X..Y rows=N — actual execution data (ANALYZE only)`,
                },
              ],
            },
          },
          // ── Data Modification ─────────────────────────────────────────────────
          {
            title: "Data Modification",
            description: "INSERT, UPDATE, DELETE, UPSERT and RETURNING",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "INSERT",
                  content: `-- Single row
INSERT INTO users (name, email, role)
VALUES ('Alice', 'alice@example.com', 'admin');

-- Multiple rows
INSERT INTO tags (name, slug) VALUES
  ('JavaScript', 'javascript'),
  ('Python',     'python'),
  ('Rust',       'rust');

-- Insert from SELECT
INSERT INTO archived_orders (id, user_id, total, created_at)
SELECT id, user_id, total, created_at
FROM orders
WHERE created_at < NOW() - INTERVAL '1 year';

-- RETURNING — get back inserted values
INSERT INTO users (name, email)
VALUES ('Bob', 'bob@example.com')
RETURNING id, created_at;

-- ON CONFLICT (UPSERT)
INSERT INTO user_settings (user_id, theme, notifications)
VALUES (42, 'dark', true)
ON CONFLICT (user_id) DO UPDATE
  SET theme         = EXCLUDED.theme,
      notifications = EXCLUDED.notifications,
      updated_at    = NOW();

-- ON CONFLICT DO NOTHING
INSERT INTO event_log (event_id, user_id)
VALUES (101, 42)
ON CONFLICT (event_id, user_id) DO NOTHING;`,
                },
                {
                  order: 1, language: "sql", label: "UPDATE and DELETE",
                  content: `-- UPDATE single column
UPDATE users SET name = 'Alice Smith' WHERE id = 42;

-- UPDATE multiple columns
UPDATE orders
SET status     = 'shipped',
    shipped_at = NOW(),
    updated_at = NOW()
WHERE id = 101;

-- UPDATE with JOIN (PostgreSQL — use FROM)
UPDATE orders o
SET status = 'vip_pending'
FROM users u
WHERE o.user_id = u.id
  AND u.role = 'vip'
  AND o.status = 'pending';

-- UPDATE with subquery
UPDATE products
SET price = price * 1.10
WHERE category_id IN (
  SELECT id FROM categories WHERE name = 'Electronics'
);

-- UPDATE RETURNING
UPDATE users SET verified_at = NOW()
WHERE email_token = 'abc123'
RETURNING id, email, verified_at;

-- DELETE
DELETE FROM sessions WHERE expires_at < NOW();
DELETE FROM users WHERE id = 42;

-- DELETE with JOIN (PostgreSQL)
DELETE FROM order_items oi
USING orders o
WHERE oi.order_id = o.id AND o.status = 'cancelled';

-- DELETE RETURNING
DELETE FROM notifications WHERE read = true
RETURNING id;

-- TRUNCATE — fast full table delete (no WHERE, no RETURNING)
TRUNCATE TABLE sessions;
TRUNCATE TABLE orders, order_items CASCADE; -- truncate dependents too`,
                },
              ],
            },
          },
          // ── Transactions ──────────────────────────────────────────────────────
          {
            title: "Transactions & Locking",
            description: "ACID transactions, savepoints, isolation levels and locking",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "Transactions and savepoints",
                  content: `-- Basic transaction
BEGIN;
  UPDATE accounts SET balance = balance - 500 WHERE id = 1;
  UPDATE accounts SET balance = balance + 500 WHERE id = 2;
COMMIT;

-- Rollback on error
BEGIN;
  INSERT INTO orders (user_id, total) VALUES (42, 99.99);
  -- something goes wrong
ROLLBACK;

-- Savepoints — partial rollback within a transaction
BEGIN;
  INSERT INTO orders (user_id, total) VALUES (42, 99.99) RETURNING id;

  SAVEPOINT after_order;

  INSERT INTO payments (order_id, amount) VALUES (1001, 99.99);
  -- payment fails
  ROLLBACK TO SAVEPOINT after_order;

  -- try alternative payment
  INSERT INTO payment_attempts (order_id, error) VALUES (1001, 'card_declined');
COMMIT;

-- Isolation levels (ascending strictness)
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;   -- default in PostgreSQL
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;     -- strongest, slowest`,
                },
                {
                  order: 1, language: "sql", label: "Locking — SELECT FOR UPDATE and advisory locks",
                  content: `-- SELECT FOR UPDATE — lock rows for update within transaction
BEGIN;
  SELECT balance FROM accounts WHERE id = 1 FOR UPDATE;
  -- no other transaction can update this row until COMMIT/ROLLBACK
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
COMMIT;

-- SKIP LOCKED — skip rows locked by other transactions (queue pattern)
BEGIN;
  SELECT * FROM job_queue
  WHERE status = 'pending'
  ORDER BY created_at
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
COMMIT;

-- FOR SHARE — allow other readers but block writers
SELECT * FROM products WHERE id = 42 FOR SHARE;

-- Advisory locks — application-level locks (PostgreSQL)
-- Useful for ensuring only one process runs a job
SELECT pg_try_advisory_lock(42);         -- returns true if acquired
SELECT pg_advisory_lock(42);             -- blocks until acquired
SELECT pg_advisory_unlock(42);           -- release
SELECT pg_advisory_unlock_all();         -- release all for this session

-- Session-level advisory lock pattern
BEGIN;
  SELECT pg_advisory_xact_lock(hashtext('send_weekly_email'));
  -- only one process enters here at a time
  -- lock released automatically at transaction end
COMMIT;`,
                },
              ],
            },
          },
          // ── Useful Patterns ───────────────────────────────────────────────────
          {
            title: "Useful Patterns",
            description: "Pagination, pivot, gaps, deduplication and full-text search",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "sql", label: "Pagination — offset vs keyset",
                  content: `-- OFFSET pagination (simple but slow on large pages)
SELECT * FROM posts
ORDER BY created_at DESC
LIMIT 20 OFFSET 200; -- gets slower as offset grows

-- Keyset (cursor) pagination — fast regardless of depth
-- Page 1
SELECT id, title, created_at FROM posts
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- Next page — pass last row's (created_at, id) as cursor
SELECT id, title, created_at FROM posts
WHERE (created_at, id) < ('2025-03-01 12:00:00', 9876)
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- Total count alongside results (CTE pattern)
WITH filtered AS (
  SELECT id, title, created_at
  FROM posts
  WHERE author_id = 42
),
counted AS (SELECT COUNT(*) AS total FROM filtered)
SELECT f.*, c.total
FROM filtered f, counted c
ORDER BY f.created_at DESC
LIMIT 20 OFFSET 0;`,
                },
                {
                  order: 1, language: "sql", label: "Pivot / crosstab and conditional aggregation",
                  content: `-- Conditional aggregation — manual pivot
SELECT
  DATE_TRUNC('month', created_at)::date             AS month,
  COUNT(*) FILTER (WHERE status = 'completed')      AS completed,
  COUNT(*) FILTER (WHERE status = 'refunded')       AS refunded,
  COUNT(*) FILTER (WHERE status = 'pending')        AS pending,
  SUM(total) FILTER (WHERE status = 'completed')    AS revenue
FROM orders
GROUP BY 1
ORDER BY 1;

-- Find gaps in a sequence (missing IDs)
SELECT s.id AS missing_id
FROM generate_series(1, (SELECT MAX(id) FROM orders)) AS s(id)
LEFT JOIN orders o ON o.id = s.id
WHERE o.id IS NULL;

-- Deduplicate — keep one row per duplicate group
DELETE FROM users
WHERE id NOT IN (
  SELECT MIN(id)
  FROM users
  GROUP BY email   -- keep the oldest row per email
);

-- OR using CTE with ROW_NUMBER (safer — preview before deleting)
WITH dupes AS (
  SELECT id,
    ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) AS rn
  FROM users
)
DELETE FROM users WHERE id IN (SELECT id FROM dupes WHERE rn > 1);`,
                },
                {
                  order: 2, language: "sql", label: "Full-text search (PostgreSQL)",
                  content: `-- to_tsvector converts text to lexemes
-- to_tsquery parses a search query

-- Basic search
SELECT title, body
FROM posts
WHERE to_tsvector('english', title || ' ' || body)
   @@ to_tsquery('english', 'database & performance');

-- plainto_tsquery — plain text input (no operators needed)
SELECT title FROM posts
WHERE to_tsvector('english', title) @@ plainto_tsquery('english', 'sql tutorial');

-- websearch_to_tsquery — Google-style syntax
SELECT * FROM posts
WHERE fts_vector @@ websearch_to_tsquery('english', '"window functions" -basic');

-- Rank results by relevance
SELECT title,
  ts_rank(to_tsvector('english', title || ' ' || body),
          to_tsquery('english', 'index & performance')) AS rank
FROM posts
WHERE to_tsvector('english', title || ' ' || body)
   @@ to_tsquery('english', 'index & performance')
ORDER BY rank DESC;

-- Highlight matching terms
SELECT ts_headline('english', body,
  to_tsquery('english', 'window & function'),
  'StartSel=<mark>, StopSel=</mark>, MaxWords=30'
) AS excerpt
FROM posts;`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created SQL cheatsheet: ${sql.name} (${sql.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
