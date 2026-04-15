import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.category.deleteMany({ where: { name: "DynamoDB", userId: null } });

  const ddb = await prisma.category.create({
    data: {
      name: "DynamoDB",
      icon: "🗄️",
      color: "orange",
      description: "AWS DynamoDB: tables, CRUD, queries, scans, indexes, streams, and CLI operations",
      isPublic: true,
      snippets: {
        create: [
          // ── Table Management ──────────────────────────────────────────────
          {
            title: "Table Management",
            description: "Create, describe, update, and delete tables",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Create a table",
                  content: `# Simple table with partition key only
aws dynamodb create-table \\
  --table-name Users \\
  --attribute-definitions AttributeName=userId,AttributeType=S \\
  --key-schema AttributeName=userId,KeyType=HASH \\
  --billing-mode PAY_PER_REQUEST

# Table with partition key + sort key
aws dynamodb create-table \\
  --table-name Orders \\
  --attribute-definitions \\
      AttributeName=customerId,AttributeType=S \\
      AttributeName=orderId,AttributeType=S \\
  --key-schema \\
      AttributeName=customerId,KeyType=HASH \\
      AttributeName=orderId,KeyType=RANGE \\
  --billing-mode PAY_PER_REQUEST

# Provisioned throughput (instead of on-demand)
aws dynamodb create-table \\
  --table-name Events \\
  --attribute-definitions AttributeName=eventId,AttributeType=S \\
  --key-schema AttributeName=eventId,KeyType=HASH \\
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5

# Wait until table is active
aws dynamodb wait table-exists --table-name Users`,
                },
                {
                  order: 1, language: "bash", label: "Describe, list & delete",
                  content: `# Describe a table (schema, throughput, status)
aws dynamodb describe-table --table-name Users

# Get just the table status
aws dynamodb describe-table \\
  --table-name Users \\
  --query "Table.TableStatus" --output text

# List all tables
aws dynamodb list-tables

# List all tables (paginate through all)
aws dynamodb list-tables --query "TableNames[]" --output text

# Update provisioned capacity
aws dynamodb update-table \\
  --table-name Events \\
  --provisioned-throughput ReadCapacityUnits=20,WriteCapacityUnits=10

# Switch to on-demand billing
aws dynamodb update-table \\
  --table-name Events \\
  --billing-mode PAY_PER_REQUEST

# Enable TTL on a table
aws dynamodb update-time-to-live \\
  --table-name Sessions \\
  --time-to-live-specification Enabled=true,AttributeName=ttl

# Delete a table
aws dynamodb delete-table --table-name Users
aws dynamodb wait table-not-exists --table-name Users`,
                },
              ],
            },
          },
          // ── CRUD Operations ───────────────────────────────────────────────
          {
            title: "CRUD Operations",
            description: "PutItem, GetItem, UpdateItem, and DeleteItem",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "PutItem",
                  content: `# Write an item (creates or fully replaces)
aws dynamodb put-item \\
  --table-name Users \\
  --item '{"userId":{"S":"u1"},"name":{"S":"Alice"},"age":{"N":"30"},"active":{"BOOL":true}}'

# Conditional put — only if item does NOT exist
aws dynamodb put-item \\
  --table-name Users \\
  --item '{"userId":{"S":"u1"},"name":{"S":"Alice"}}' \\
  --condition-expression "attribute_not_exists(userId)"

# Put with return values
aws dynamodb put-item \\
  --table-name Users \\
  --item '{"userId":{"S":"u2"},"name":{"S":"Bob"}}' \\
  --return-values ALL_OLD`,
                },
                {
                  order: 1, language: "bash", label: "GetItem",
                  content: `# Get a single item by primary key
aws dynamodb get-item \\
  --table-name Users \\
  --key '{"userId":{"S":"u1"}}'

# With sort key
aws dynamodb get-item \\
  --table-name Orders \\
  --key '{"customerId":{"S":"c1"},"orderId":{"S":"ord-001"}}'

# Project specific attributes
aws dynamodb get-item \\
  --table-name Users \\
  --key '{"userId":{"S":"u1"}}' \\
  --projection-expression "name, age"

# Strongly consistent read
aws dynamodb get-item \\
  --table-name Users \\
  --key '{"userId":{"S":"u1"}}' \\
  --consistent-read`,
                },
                {
                  order: 2, language: "bash", label: "UpdateItem",
                  content: `# Set / add attributes
aws dynamodb update-item \\
  --table-name Users \\
  --key '{"userId":{"S":"u1"}}' \\
  --update-expression "SET #n = :name, age = :age" \\
  --expression-attribute-names '{"#n":"name"}' \\
  --expression-attribute-values '{":name":{"S":"Alice Smith"},":age":{"N":"31"}}' \\
  --return-values ALL_NEW

# Increment a counter atomically
aws dynamodb update-item \\
  --table-name Posts \\
  --key '{"postId":{"S":"p1"}}' \\
  --update-expression "ADD viewCount :inc" \\
  --expression-attribute-values '{":inc":{"N":"1"}}'

# Remove an attribute
aws dynamodb update-item \\
  --table-name Users \\
  --key '{"userId":{"S":"u1"}}' \\
  --update-expression "REMOVE tempToken"

# Conditional update — only if version matches
aws dynamodb update-item \\
  --table-name Users \\
  --key '{"userId":{"S":"u1"}}' \\
  --update-expression "SET version = :newV, #n = :name" \\
  --condition-expression "version = :oldV" \\
  --expression-attribute-names '{"#n":"name"}' \\
  --expression-attribute-values '{":newV":{"N":"2"},":name":{"S":"Alice"},":oldV":{"N":"1"}}'`,
                },
                {
                  order: 3, language: "bash", label: "DeleteItem",
                  content: `# Delete an item by primary key
aws dynamodb delete-item \\
  --table-name Users \\
  --key '{"userId":{"S":"u1"}}'

# Conditional delete — only if attribute matches
aws dynamodb delete-item \\
  --table-name Users \\
  --key '{"userId":{"S":"u1"}}' \\
  --condition-expression "active = :false" \\
  --expression-attribute-values '{":false":{"BOOL":false}}'

# Return the item that was deleted
aws dynamodb delete-item \\
  --table-name Users \\
  --key '{"userId":{"S":"u1"}}' \\
  --return-values ALL_OLD`,
                },
              ],
            },
          },
          // ── Batch Operations ──────────────────────────────────────────────
          {
            title: "Batch & Transact Operations",
            description: "BatchGet, BatchWrite, TransactGet, and TransactWrite",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "BatchGetItem & BatchWriteItem",
                  content: `# Read up to 100 items in one call
aws dynamodb batch-get-item \\
  --request-items '{
    "Users": {
      "Keys": [
        {"userId":{"S":"u1"}},
        {"userId":{"S":"u2"}}
      ],
      "ProjectionExpression": "userId, #n",
      "ExpressionAttributeNames": {"#n": "name"}
    }
  }'

# Write (put/delete) up to 25 items in one call
aws dynamodb batch-write-item \\
  --request-items '{
    "Users": [
      {"PutRequest": {"Item": {"userId":{"S":"u3"},"name":{"S":"Carol"}}}},
      {"PutRequest": {"Item": {"userId":{"S":"u4"},"name":{"S":"Dave"}}}},
      {"DeleteRequest": {"Key": {"userId":{"S":"u0"}}}}
    ]
  }'`,
                },
                {
                  order: 1, language: "bash", label: "TransactGet & TransactWrite",
                  content: `# Read up to 100 items atomically across tables
aws dynamodb transact-get-items \\
  --transact-items '[
    {"Get": {"TableName":"Users","Key":{"userId":{"S":"u1"}}}},
    {"Get": {"TableName":"Accounts","Key":{"accountId":{"S":"a1"}}}}
  ]'

# Write up to 100 items atomically (all or nothing)
aws dynamodb transact-write-items \\
  --transact-items '[
    {
      "Put": {
        "TableName": "Orders",
        "Item": {"orderId":{"S":"ord-1"},"status":{"S":"placed"}},
        "ConditionExpression": "attribute_not_exists(orderId)"
      }
    },
    {
      "Update": {
        "TableName": "Inventory",
        "Key": {"itemId":{"S":"sku-1"}},
        "UpdateExpression": "ADD stock :dec",
        "ConditionExpression": "stock >= :min",
        "ExpressionAttributeValues": {":dec":{"N":"-1"},":min":{"N":"1"}}
      }
    }
  ]'`,
                },
              ],
            },
          },
          // ── Query ─────────────────────────────────────────────────────────
          {
            title: "Query",
            description: "Efficiently retrieve items by partition key and sort key conditions",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Basic query",
                  content: `# All items for a partition key
aws dynamodb query \\
  --table-name Orders \\
  --key-condition-expression "customerId = :cid" \\
  --expression-attribute-values '{":cid":{"S":"c1"}}'

# Partition key + sort key begins_with
aws dynamodb query \\
  --table-name Orders \\
  --key-condition-expression "customerId = :cid AND begins_with(orderId, :prefix)" \\
  --expression-attribute-values '{":cid":{"S":"c1"},":prefix":{"S":"2024-"}}'

# Partition key + sort key range
aws dynamodb query \\
  --table-name Events \\
  --key-condition-expression "userId = :uid AND #ts BETWEEN :start AND :end" \\
  --expression-attribute-names '{"#ts":"timestamp"}' \\
  --expression-attribute-values '{
    ":uid":{"S":"u1"},
    ":start":{"S":"2024-01-01"},
    ":end":{"S":"2024-12-31"}
  }'`,
                },
                {
                  order: 1, language: "bash", label: "Query options",
                  content: `# Filter results after retrieval (does not reduce RCUs)
aws dynamodb query \\
  --table-name Orders \\
  --key-condition-expression "customerId = :cid" \\
  --filter-expression "#s = :status" \\
  --expression-attribute-names '{"#s":"status"}' \\
  --expression-attribute-values '{":cid":{"S":"c1"},":status":{"S":"shipped"}}'

# Reverse sort order (newest first)
aws dynamodb query \\
  --table-name Orders \\
  --key-condition-expression "customerId = :cid" \\
  --expression-attribute-values '{":cid":{"S":"c1"}}' \\
  --scan-index-forward false

# Limit number of items evaluated
aws dynamodb query \\
  --table-name Orders \\
  --key-condition-expression "customerId = :cid" \\
  --expression-attribute-values '{":cid":{"S":"c1"}}' \\
  --limit 10

# Project specific attributes
aws dynamodb query \\
  --table-name Orders \\
  --key-condition-expression "customerId = :cid" \\
  --expression-attribute-values '{":cid":{"S":"c1"}}' \\
  --projection-expression "orderId, #s, total" \\
  --expression-attribute-names '{"#s":"status"}'

# Count only (no item data returned)
aws dynamodb query \\
  --table-name Orders \\
  --key-condition-expression "customerId = :cid" \\
  --expression-attribute-values '{":cid":{"S":"c1"}}' \\
  --select COUNT`,
                },
              ],
            },
          },
          // ── Scan ─────────────────────────────────────────────────────────
          {
            title: "Scan",
            description: "Full table scans with filters and parallel execution",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Scan with filters",
                  content: `# Full table scan (expensive — avoid on large tables)
aws dynamodb scan --table-name Users

# Filter by attribute (applied after reading — still consumes full RCUs)
aws dynamodb scan \\
  --table-name Users \\
  --filter-expression "age > :min AND active = :true" \\
  --expression-attribute-values '{":min":{"N":"25"},":true":{"BOOL":true}}'

# Project specific attributes
aws dynamodb scan \\
  --table-name Users \\
  --projection-expression "userId, #n" \\
  --expression-attribute-names '{"#n":"name"}'

# Count matching items
aws dynamodb scan \\
  --table-name Users \\
  --filter-expression "active = :true" \\
  --expression-attribute-values '{":true":{"BOOL":true}}' \\
  --select COUNT`,
                },
                {
                  order: 1, language: "bash", label: "Parallel scan",
                  content: `# Split table into N segments and scan in parallel
# Run these in parallel (e.g. in a script with & )

# Segment 0 of 4
aws dynamodb scan \\
  --table-name LargeTable \\
  --total-segments 4 \\
  --segment 0

# Segment 1 of 4
aws dynamodb scan \\
  --table-name LargeTable \\
  --total-segments 4 \\
  --segment 1

# Paginate with ExclusiveStartKey
LAST_KEY=$(aws dynamodb scan --table-name Users --limit 100 \\
  --query "LastEvaluatedKey" --output json)

aws dynamodb scan \\
  --table-name Users \\
  --limit 100 \\
  --exclusive-start-key "$LAST_KEY"`,
                },
              ],
            },
          },
          // ── Indexes ───────────────────────────────────────────────────────
          {
            title: "Indexes (GSI & LSI)",
            description: "Create and query Global and Local Secondary Indexes",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Create GSI on new table",
                  content: `# Table with a Global Secondary Index
aws dynamodb create-table \\
  --table-name Orders \\
  --attribute-definitions \\
      AttributeName=customerId,AttributeType=S \\
      AttributeName=orderId,AttributeType=S \\
      AttributeName=status,AttributeType=S \\
      AttributeName=createdAt,AttributeType=S \\
  --key-schema \\
      AttributeName=customerId,KeyType=HASH \\
      AttributeName=orderId,KeyType=RANGE \\
  --global-secondary-indexes '[
    {
      "IndexName": "status-createdAt-index",
      "KeySchema": [
        {"AttributeName":"status","KeyType":"HASH"},
        {"AttributeName":"createdAt","KeyType":"RANGE"}
      ],
      "Projection": {"ProjectionType":"ALL"}
    }
  ]' \\
  --billing-mode PAY_PER_REQUEST`,
                },
                {
                  order: 1, language: "bash", label: "Add GSI to existing table",
                  content: `# Add a GSI after table creation
aws dynamodb update-table \\
  --table-name Orders \\
  --attribute-definitions \\
      AttributeName=status,AttributeType=S \\
      AttributeName=createdAt,AttributeType=S \\
  --global-secondary-index-updates '[
    {
      "Create": {
        "IndexName": "status-createdAt-index",
        "KeySchema": [
          {"AttributeName":"status","KeyType":"HASH"},
          {"AttributeName":"createdAt","KeyType":"RANGE"}
        ],
        "Projection": {"ProjectionType":"INCLUDE","NonKeyAttributes":["orderId","total"]},
        "ProvisionedThroughput": {"ReadCapacityUnits":5,"WriteCapacityUnits":5}
      }
    }
  ]'

# Delete a GSI
aws dynamodb update-table \\
  --table-name Orders \\
  --global-secondary-index-updates '[{"Delete":{"IndexName":"status-createdAt-index"}}]'`,
                },
                {
                  order: 2, language: "bash", label: "Query a GSI",
                  content: `# Query using a GSI
aws dynamodb query \\
  --table-name Orders \\
  --index-name status-createdAt-index \\
  --key-condition-expression "#s = :status AND createdAt > :since" \\
  --expression-attribute-names '{"#s":"status"}' \\
  --expression-attribute-values '{
    ":status":{"S":"shipped"},
    ":since":{"S":"2024-01-01"}
  }' \\
  --scan-index-forward false

# Scan a GSI
aws dynamodb scan \\
  --table-name Orders \\
  --index-name status-createdAt-index \\
  --filter-expression "#s = :status" \\
  --expression-attribute-names '{"#s":"status"}' \\
  --expression-attribute-values '{":status":{"S":"pending"}}'`,
                },
              ],
            },
          },
          // ── Streams ───────────────────────────────────────────────────────
          {
            title: "DynamoDB Streams",
            description: "Enable, describe, and read change streams",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Enable & describe streams",
                  content: `# Enable streams on a table
aws dynamodb update-table \\
  --table-name Orders \\
  --stream-specification StreamEnabled=true,StreamViewType=NEW_AND_OLD_IMAGES
# StreamViewType options:
#   KEYS_ONLY          — only key attributes
#   NEW_IMAGE          — new item state
#   OLD_IMAGE          — old item state (before change)
#   NEW_AND_OLD_IMAGES — both states

# Get stream ARN
aws dynamodb describe-table \\
  --table-name Orders \\
  --query "Table.LatestStreamArn" --output text

# List all streams
aws dynamodbstreams list-streams
aws dynamodbstreams list-streams --table-name Orders

# Describe a stream (get shard info)
aws dynamodbstreams describe-stream \\
  --stream-arn arn:aws:dynamodb:us-east-1:123456789012:table/Orders/stream/2024-01-01T00:00:00.000

# Disable streams
aws dynamodb update-table \\
  --table-name Orders \\
  --stream-specification StreamEnabled=false`,
                },
                {
                  order: 1, language: "bash", label: "Read stream records",
                  content: `# 1. Get shard iterator
STREAM_ARN=$(aws dynamodb describe-table \\
  --table-name Orders \\
  --query "Table.LatestStreamArn" --output text)

SHARD_ID=$(aws dynamodbstreams describe-stream \\
  --stream-arn $STREAM_ARN \\
  --query "StreamDescription.Shards[0].ShardId" --output text)

ITERATOR=$(aws dynamodbstreams get-shard-iterator \\
  --stream-arn $STREAM_ARN \\
  --shard-id $SHARD_ID \\
  --shard-iterator-type TRIM_HORIZON \\
  --query "ShardIterator" --output text)
# ShardIteratorType options: TRIM_HORIZON | LATEST | AT_SEQUENCE_NUMBER | AFTER_SEQUENCE_NUMBER

# 2. Read records using the iterator
aws dynamodbstreams get-records --shard-iterator $ITERATOR`,
                },
              ],
            },
          },
          // ── Backup & Restore ──────────────────────────────────────────────
          {
            title: "Backup & Restore",
            description: "On-demand backups, PITR, and table restore",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "On-demand backups",
                  content: `# Create an on-demand backup
aws dynamodb create-backup \\
  --table-name Orders \\
  --backup-name orders-backup-2024

# List backups for a table
aws dynamodb list-backups --table-name Orders

# List all backups
aws dynamodb list-backups

# Describe a backup
aws dynamodb describe-backup \\
  --backup-arn arn:aws:dynamodb:us-east-1:123:table/Orders/backup/01234567890

# Restore to a new table from backup
aws dynamodb restore-table-from-backup \\
  --target-table-name Orders-Restored \\
  --backup-arn arn:aws:dynamodb:us-east-1:123:table/Orders/backup/01234567890

# Delete a backup
aws dynamodb delete-backup \\
  --backup-arn arn:aws:dynamodb:us-east-1:123:table/Orders/backup/01234567890`,
                },
                {
                  order: 1, language: "bash", label: "Point-in-time recovery (PITR)",
                  content: `# Enable PITR (retains last 35 days)
aws dynamodb update-continuous-backups \\
  --table-name Orders \\
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true

# Check PITR status and restore window
aws dynamodb describe-continuous-backups --table-name Orders

# Restore to a specific point in time
aws dynamodb restore-table-to-point-in-time \\
  --source-table-name Orders \\
  --target-table-name Orders-PITR-Restore \\
  --restore-date-time 2024-06-15T12:00:00Z

# Restore to latest restorable time
aws dynamodb restore-table-to-point-in-time \\
  --source-table-name Orders \\
  --target-table-name Orders-Latest-Restore \\
  --use-latest-restorable-time`,
                },
              ],
            },
          },
          // ── PartiQL ───────────────────────────────────────────────────────
          {
            title: "PartiQL",
            description: "SQL-compatible query language for DynamoDB",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "PartiQL statements",
                  content: `# SELECT — query items (uses GSI/table key conditions)
aws dynamodb execute-statement \\
  --statement "SELECT * FROM Users WHERE userId = 'u1'"

aws dynamodb execute-statement \\
  --statement "SELECT userId, name FROM Users WHERE userId = 'u1'"

# INSERT
aws dynamodb execute-statement \\
  --statement "INSERT INTO Users VALUE {'userId':'u5','name':'Eve','age':28}"

# UPDATE
aws dynamodb execute-statement \\
  --statement "UPDATE Users SET name='Eve Smith' WHERE userId='u5'"

# DELETE
aws dynamodb execute-statement \\
  --statement "DELETE FROM Users WHERE userId='u5'"

# Parameterized (safe — avoids injection)
aws dynamodb execute-statement \\
  --statement "SELECT * FROM Orders WHERE customerId = ? AND begins_with(orderId, ?)" \\
  --parameters '[{"S":"c1"},{"S":"2024"}]'`,
                },
                {
                  order: 1, language: "bash", label: "Batch PartiQL",
                  content: `# Run multiple statements atomically
aws dynamodb batch-execute-statement \\
  --statements '[
    {"Statement": "SELECT * FROM Users WHERE userId = '\''u1'\''"},
    {"Statement": "SELECT * FROM Orders WHERE customerId = '\''c1'\''"}
  ]'

# Transactional PartiQL (all or nothing)
aws dynamodb execute-transaction \\
  --transact-statements '[
    {
      "Statement": "UPDATE Inventory SET stock = stock - 1 WHERE itemId = '\''sku-1'\'' AND stock > 0"
    },
    {
      "Statement": "INSERT INTO Orders VALUE {'\''orderId'\'':'\''ord-99'\'','\''status'\'':'\''placed'\''}"
    }
  ]'`,
                },
              ],
            },
          },
          // ── Useful Patterns ───────────────────────────────────────────────
          {
            title: "Useful Patterns",
            description: "Single-table design, optimistic locking, and pagination",
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "bash", label: "Single-table design keys",
                  content: `# Single-table design: store multiple entity types in one table
# Common pattern: PK = entity type + ID, SK = entity type + ID or sub-type

# Users:    PK=USER#u1        SK=PROFILE
# Orders:   PK=CUSTOMER#c1   SK=ORDER#2024-06-01#ord-1
# Products: PK=PRODUCT#p1    SK=DETAILS

# Put user
aws dynamodb put-item --table-name App \\
  --item '{"PK":{"S":"USER#u1"},"SK":{"S":"PROFILE"},"name":{"S":"Alice"},"type":{"S":"user"}}'

# Put order for customer
aws dynamodb put-item --table-name App \\
  --item '{"PK":{"S":"CUSTOMER#c1"},"SK":{"S":"ORDER#2024-06-01#ord-1"},"total":{"N":"99.99"},"type":{"S":"order"}}'

# Get all orders for a customer
aws dynamodb query \\
  --table-name App \\
  --key-condition-expression "PK = :pk AND begins_with(SK, :prefix)" \\
  --expression-attribute-values '{":pk":{"S":"CUSTOMER#c1"},":prefix":{"S":"ORDER#"}}'`,
                },
                {
                  order: 1, language: "bash", label: "Optimistic locking & pagination",
                  content: `# Optimistic locking with a version attribute
# Read current version, then update only if it hasn't changed

# Step 1: read item and note version
aws dynamodb get-item --table-name Products \\
  --key '{"productId":{"S":"p1"}}' \\
  --query "Item.version"

# Step 2: conditional update
aws dynamodb update-item \\
  --table-name Products \\
  --key '{"productId":{"S":"p1"}}' \\
  --update-expression "SET price = :newPrice, version = :newV" \\
  --condition-expression "version = :oldV" \\
  --expression-attribute-values '{":newPrice":{"N":"49.99"},":newV":{"N":"3"},":oldV":{"N":"2"}}'

# Paginate through all results (bash loop)
LAST_KEY=""
while true; do
  ARGS="--table-name Users"
  [ -n "$LAST_KEY" ] && ARGS="$ARGS --exclusive-start-key $LAST_KEY"
  RESULT=$(aws dynamodb scan $ARGS --limit 100)
  echo "$RESULT" | jq -r '.Items[].userId.S'
  LAST_KEY=$(echo "$RESULT" | jq -r '.LastEvaluatedKey // empty')
  [ -z "$LAST_KEY" ] && break
done`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created DynamoDB cheatsheet: ${ddb.name} (${ddb.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
