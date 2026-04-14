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
    where: { name: "MongoDB", userId: admin.id },
  });

  const mongo = await prisma.category.create({
    data: {
      name: "MongoDB",
      icon: "🍃",
      color: "green",
      description: "MongoDB shell and driver commands — CRUD, aggregation pipeline, indexes, transactions and Atlas Search",
      userId: admin.id,
      isPublic: true,
      snippets: {
        create: [
          // ── Shell & Database Setup ────────────────────────────────────────────
          {
            title: "Shell & Database Setup",
            description: "Connect, switch databases, inspect collections and stats",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "javascript", label: "Connect and navigate",
                  content: `// Connect via mongosh
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/mydb"

// Switch / create database
use mydb

// List databases
show dbs

// List collections
show collections

// Current database
db.getName()

// Drop database
db.dropDatabase()

// Collection stats
db.users.stats()
db.users.countDocuments()
db.users.estimatedDocumentCount()  // fast, uses metadata

// Server status
db.serverStatus()
db.runCommand({ connectionStatus: 1 })`,
                },
                {
                  order: 1, language: "javascript", label: "Collection management",
                  content: `// Create collection explicitly (optional — auto-created on insert)
db.createCollection("users")

// Create capped collection (fixed size, overwrites oldest docs)
db.createCollection("logs", {
  capped: true,
  size: 10485760,   // 10 MB max
  max: 5000,        // max 5000 documents
})

// Rename collection
db.users.renameCollection("customers")

// Drop collection
db.users.drop()

// Validate collection integrity
db.users.validate({ full: true })`,
                },
              ],
            },
          },
          // ── CRUD — Create ─────────────────────────────────────────────────────
          {
            title: "CRUD — Create",
            description: "Insert single and multiple documents",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "javascript", label: "insertOne and insertMany",
                  content: `// insertOne — returns { acknowledged, insertedId }
db.users.insertOne({
  name:      "Alice",
  email:     "alice@example.com",
  role:      "admin",
  age:       30,
  tags:      ["dev", "oss"],
  address: {
    city:    "Berlin",
    country: "DE",
  },
  createdAt: new Date(),
})

// insertMany — returns { acknowledged, insertedIds }
db.products.insertMany([
  { name: "Widget",  price: 9.99,  stock: 100, category: "tools" },
  { name: "Gadget",  price: 24.99, stock: 50,  category: "tools" },
  { name: "Doohickey", price: 4.99, stock: 200, category: "misc" },
], { ordered: false })
// ordered: false — continue inserting even if one fails`,
                },
              ],
            },
          },
          // ── CRUD — Read ───────────────────────────────────────────────────────
          {
            title: "CRUD — Read",
            description: "find, projection, sort, limit and query operators",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "javascript", label: "find and findOne",
                  content: `// Find all documents
db.users.find()
db.users.find().pretty()

// Find with filter
db.users.find({ role: "admin" })
db.users.findOne({ email: "alice@example.com" })

// Projection — include (1) or exclude (0) fields
db.users.find(
  { role: "admin" },
  { name: 1, email: 1, _id: 0 }   // include name+email, exclude _id
)

// Sort, limit, skip
db.products.find()
  .sort({ price: -1 })             // -1 = descending, 1 = ascending
  .limit(10)
  .skip(20)

// Count matching documents
db.orders.countDocuments({ status: "pending" })

// Check existence
db.users.findOne({ email: "alice@example.com" }) !== null`,
                },
                {
                  order: 1, language: "javascript", label: "Query operators",
                  content: `// Comparison
db.products.find({ price: { $gt: 10 } })          // >
db.products.find({ price: { $gte: 10 } })         // >=
db.products.find({ price: { $lt: 50 } })          // <
db.products.find({ price: { $lte: 50 } })         // <=
db.products.find({ price: { $ne: 9.99 } })        // !=
db.products.find({ price: { $in: [9.99, 24.99] } })
db.products.find({ price: { $nin: [9.99, 24.99] } })
db.products.find({ price: { $between: [10, 50] } }) // not real — use $gt + $lt

// Logical
db.products.find({ $and: [{ price: { $gt: 10 } }, { stock: { $gt: 0 } }] })
db.products.find({ $or:  [{ category: "tools" }, { category: "misc" }] })
db.products.find({ $nor: [{ price: { $lt: 5 } }, { stock: 0 }] })
db.products.find({ price: { $not: { $gt: 50 } } })

// Element
db.users.find({ phone: { $exists: true } })        // field exists
db.users.find({ phone: { $exists: false } })
db.users.find({ age:   { $type: "int" } })         // BSON type check
db.users.find({ tags:  { $type: "array" } })

// Evaluation
db.users.find({ name: { $regex: /^ali/i } })       // regex
db.users.find({ $expr: { $gt: ["$revenue", "$cost"] } }) // compare fields
db.users.find({ $where: "this.age > 18" })          // JS (slow, avoid)`,
                },
                {
                  order: 2, language: "javascript", label: "Array and embedded document queries",
                  content: `// Array — exact match (order sensitive)
db.users.find({ tags: ["dev", "oss"] })

// Array contains element
db.users.find({ tags: "dev" })

// Array contains all elements (any order)
db.users.find({ tags: { $all: ["dev", "oss"] } })

// Array element matches condition
db.orders.find({ amounts: { $elemMatch: { $gt: 100, $lt: 500 } } })

// Array size
db.users.find({ tags: { $size: 3 } })

// Query by array index
db.users.find({ "tags.0": "dev" })                 // first element

// Embedded document — dot notation
db.users.find({ "address.city": "Berlin" })
db.users.find({ "address.country": "DE", "address.city": "Berlin" })

// $elemMatch on array of objects
db.orders.find({
  items: {
    $elemMatch: {
      product: "Widget",
      quantity: { $gte: 2 },
    }
  }
})`,
                },
              ],
            },
          },
          // ── CRUD — Update ─────────────────────────────────────────────────────
          {
            title: "CRUD — Update",
            description: "updateOne, updateMany, findOneAndUpdate and update operators",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "javascript", label: "Update operators",
                  content: `// $set — set field values
db.users.updateOne(
  { email: "alice@example.com" },
  { $set: { name: "Alice Smith", updatedAt: new Date() } }
)

// $unset — remove fields
db.users.updateOne({ _id: id }, { $unset: { legacyField: "" } })

// $inc — increment / decrement
db.products.updateOne({ _id: id }, { $inc: { stock: -1, views: 1 } })

// $mul — multiply
db.products.updateMany({}, { $mul: { price: 1.1 } })  // 10% price increase

// $min / $max — only update if new value is smaller/larger
db.stats.updateOne({ _id: id }, { $min: { lowestPrice: 9.99 } })
db.stats.updateOne({ _id: id }, { $max: { highScore: 9999 } })

// $rename — rename a field
db.users.updateMany({}, { $rename: { "fname": "firstName" } })

// $currentDate — set to current date
db.users.updateOne({ _id: id }, { $currentDate: { updatedAt: true } })

// upsert — insert if no match
db.settings.updateOne(
  { userId: "u123" },
  { $set: { theme: "dark" }, $setOnInsert: { createdAt: new Date() } },
  { upsert: true }
)`,
                },
                {
                  order: 1, language: "javascript", label: "Array update operators",
                  content: `// $push — append to array
db.users.updateOne({ _id: id }, { $push: { tags: "typescript" } })

// $push with $each — append multiple
db.users.updateOne(
  { _id: id },
  { $push: { tags: { $each: ["go", "rust"], $sort: 1, $slice: 10 } } }
)

// $addToSet — add only if not already present (set semantics)
db.users.updateOne({ _id: id }, { $addToSet: { tags: "dev" } })
db.users.updateOne({ _id: id }, { $addToSet: { tags: { $each: ["a", "b"] } } })

// $pull — remove elements matching condition
db.users.updateOne({ _id: id }, { $pull: { tags: "deprecated" } })
db.orders.updateOne({ _id: id }, { $pull: { items: { qty: { $lt: 1 } } } })

// $pop — remove first (-1) or last (1) element
db.users.updateOne({ _id: id }, { $pop: { tags: 1 } })   // remove last
db.users.updateOne({ _id: id }, { $pop: { tags: -1 } })  // remove first

// $ positional — update first matching array element
db.orders.updateOne(
  { _id: id, "items.product": "Widget" },
  { $set: { "items.$.qty": 5 } }
)

// $[] — update all array elements
db.orders.updateMany({}, { $inc: { "items.$[].qty": 0 } })

// $[identifier] — filtered positional
db.orders.updateMany(
  { _id: id },
  { $set: { "items.$[item].discounted": true } },
  { arrayFilters: [{ "item.price": { $gt: 20 } }] }
)`,
                },
                {
                  order: 2, language: "javascript", label: "findOneAndUpdate, replaceOne",
                  content: `// findOneAndUpdate — atomically update and return document
const updated = db.users.findOneAndUpdate(
  { email: "alice@example.com" },
  { $set: { role: "moderator" }, $currentDate: { updatedAt: true } },
  {
    returnDocument: "after",   // "before" returns old doc
    upsert: false,
    projection: { name: 1, role: 1 },
  }
)

// findOneAndReplace — replace entire document
db.users.findOneAndReplace(
  { _id: id },
  { name: "Alice", email: "alice@example.com", role: "admin" },
  { returnDocument: "after" }
)

// findOneAndDelete
const deleted = db.users.findOneAndDelete({ email: "alice@example.com" })

// replaceOne — replace entire document (keeps _id)
db.users.replaceOne(
  { _id: id },
  { name: "Alice Smith", email: "alice@example.com" }
)

// updateMany
db.orders.updateMany(
  { status: "processing", updatedAt: { $lt: new Date("2025-01-01") } },
  { $set: { status: "stalled" } }
)`,
                },
              ],
            },
          },
          // ── CRUD — Delete ─────────────────────────────────────────────────────
          {
            title: "CRUD — Delete",
            description: "deleteOne, deleteMany and bulk operations",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "javascript", label: "Delete and bulk write",
                  content: `// deleteOne — delete first matching document
db.users.deleteOne({ email: "alice@example.com" })

// deleteMany
db.sessions.deleteMany({ expiresAt: { $lt: new Date() } })
db.logs.deleteMany({})   // delete all documents (keeps collection)

// bulkWrite — batch multiple operations efficiently
db.products.bulkWrite([
  { insertOne: { document: { name: "New Widget", price: 5.99 } } },
  {
    updateOne: {
      filter: { name: "Widget" },
      update: { $inc: { stock: -1 } },
    }
  },
  {
    updateMany: {
      filter: { stock: { $lt: 5 } },
      update: { $set: { lowStock: true } },
    }
  },
  { deleteOne: { filter: { discontinued: true } } },
  {
    replaceOne: {
      filter: { _id: id },
      replacement: { name: "Updated", price: 12.99 },
      upsert: true,
    }
  },
], { ordered: false })`,
                },
              ],
            },
          },
          // ── Aggregation Pipeline ──────────────────────────────────────────────
          {
            title: "Aggregation Pipeline",
            description: "$match, $group, $lookup, $project, $unwind and more",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "javascript", label: "Core pipeline stages",
                  content: `db.orders.aggregate([
  // $match — filter (put early to reduce documents)
  { $match: { status: "completed", createdAt: { $gte: new Date("2025-01-01") } } },

  // $group — aggregate by key
  {
    $group: {
      _id:          "$userId",
      totalSpent:   { $sum: "$total" },
      orderCount:   { $sum: 1 },
      avgOrder:     { $avg: "$total" },
      firstOrder:   { $min: "$createdAt" },
      lastOrder:    { $max: "$createdAt" },
      statuses:     { $addToSet: "$status" },
    }
  },

  // $project — shape output
  {
    $project: {
      userId:     "$_id",
      _id:        0,
      totalSpent: { $round: ["$totalSpent", 2] },
      orderCount: 1,
      avgOrder:   { $round: ["$avgOrder", 2] },
    }
  },

  // $sort — sort results
  { $sort: { totalSpent: -1 } },

  // $limit / $skip — pagination
  { $skip: 0 },
  { $limit: 20 },
])`,
                },
                {
                  order: 1, language: "javascript", label: "$lookup, $unwind and $addFields",
                  content: `// $lookup — left outer join to another collection
db.orders.aggregate([
  { $match: { status: "completed" } },

  // Simple lookup
  {
    $lookup: {
      from:         "users",
      localField:   "userId",
      foreignField: "_id",
      as:           "user",
    }
  },

  // $unwind — flatten array (lookup returns array)
  { $unwind: { path: "$user", preserveNullAndEmpty: true } },

  // Pipeline lookup (with conditions / sub-pipeline)
  {
    $lookup: {
      from: "products",
      let:  { itemIds: "$items.productId" },
      pipeline: [
        { $match: { $expr: { $in: ["$_id", "$$itemIds"] } } },
        { $project: { name: 1, price: 1 } },
      ],
      as: "productDetails",
    }
  },

  // $addFields — add or overwrite fields
  {
    $addFields: {
      fullName:    { $concat: ["$user.firstName", " ", "$user.lastName"] },
      itemCount:   { $size: "$items" },
      isLargeOrder: { $gt: ["$total", 500] },
    }
  },

  { $project: { "user.password": 0 } },  // exclude sensitive field
])`,
                },
                {
                  order: 2, language: "javascript", label: "$facet, $bucket and $sortByCount",
                  content: `// $facet — multiple aggregations in one pass
db.products.aggregate([
  { $match: { inStock: true } },
  {
    $facet: {
      // Category breakdown
      byCategory: [
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ],

      // Price distribution buckets
      priceRanges: [
        {
          $bucket: {
            groupBy:    "$price",
            boundaries: [0, 10, 25, 50, 100, 500],
            default:    "500+",
            output: {
              count:    { $sum: 1 },
              avgPrice: { $avg: "$price" },
            },
          }
        }
      ],

      // Total and summary
      summary: [
        {
          $group: {
            _id:      null,
            total:    { $sum: 1 },
            avgPrice: { $avg: "$price" },
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" },
          }
        }
      ],
    }
  },
])

// $sortByCount — shorthand for $group + $sort by count
db.orders.aggregate([
  { $unwind: "$tags" },
  { $sortByCount: "$tags" },  // most common tags first
])`,
                },
                {
                  order: 3, language: "javascript", label: "Aggregation expressions and operators",
                  content: `db.orders.aggregate([
  {
    $project: {
      // Arithmetic
      tax:          { $multiply: ["$subtotal", 0.2] },
      withTax:      { $add: ["$subtotal", { $multiply: ["$subtotal", 0.2] }] },
      discounted:   { $subtract: ["$total", "$discount"] },
      pricePerItem: { $divide: ["$total", "$itemCount"] },

      // String
      upperName:    { $toUpper: "$name" },
      slug:         { $toLower: { $replaceAll: { input: "$name", find: " ", replacement: "-" } } },
      initials:     { $substr: ["$name", 0, 1] },
      fullLabel:    { $concat: ["$code", " - ", "$name"] },

      // Date
      year:         { $year: "$createdAt" },
      month:        { $month: "$createdAt" },
      dayOfWeek:    { $dayOfWeek: "$createdAt" },
      formatted:    { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },

      // Conditional
      tier: {
        $switch: {
          branches: [
            { case: { $gte: ["$total", 1000] }, then: "platinum" },
            { case: { $gte: ["$total", 500] },  then: "gold" },
            { case: { $gte: ["$total", 100] },  then: "silver" },
          ],
          default: "bronze",
        }
      },

      // Type conversion
      totalNum: { $toDouble: "$totalString" },
      idStr:    { $toString: "$_id" },
    }
  },
])`,
                },
              ],
            },
          },
          // ── Indexes ───────────────────────────────────────────────────────────
          {
            title: "Indexes",
            description: "Create, inspect and manage indexes for performance",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "javascript", label: "Creating indexes",
                  content: `// List existing indexes
db.users.getIndexes()

// Single field
db.users.createIndex({ email: 1 })              // ascending
db.users.createIndex({ createdAt: -1 })         // descending

// Unique index
db.users.createIndex({ email: 1 }, { unique: true })

// Compound index — field order matters
db.orders.createIndex({ userId: 1, status: 1, createdAt: -1 })

// Sparse — only index documents where field exists
db.users.createIndex({ phone: 1 }, { sparse: true })

// Partial — only index documents matching condition
db.orders.createIndex(
  { userId: 1, total: -1 },
  { partialFilterExpression: { status: "completed" } }
)

// TTL — auto-delete documents after N seconds
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
db.logs.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }) // 30 days

// Text index — full-text search
db.posts.createIndex({ title: "text", body: "text" })
db.posts.createIndex({ title: "text", body: "text" }, { weights: { title: 10, body: 1 } })

// Wildcard index — all fields or a subtree
db.products.createIndex({ "metadata.$**": 1 })

// 2dsphere — geospatial
db.places.createIndex({ location: "2dsphere" })

// Named index
db.users.createIndex({ role: 1 }, { name: "idx_role" })

// Drop index
db.users.dropIndex("idx_role")
db.users.dropIndex({ email: 1 })`,
                },
                {
                  order: 1, language: "javascript", label: "explain() and index hints",
                  content: `// Analyse query execution plan
db.orders.find({ userId: "u123", status: "pending" }).explain("executionStats")

// Key fields in executionStats:
// executionStats.nReturned        — docs returned
// executionStats.totalDocsExamined — docs scanned (want close to nReturned)
// executionStats.totalKeysExamined — index keys examined
// executionStats.executionTimeMillis
// winningPlan.stage:
//   COLLSCAN  — full collection scan (no index)
//   IXSCAN    — index scan
//   FETCH     — fetch docs from heap after index lookup
//   PROJECTION — projection applied
//   SORT      — in-memory sort (can be slow for large sets)

// Force a specific index
db.orders.find({ userId: "u123" }).hint({ userId: 1, status: 1 })
db.orders.find({ userId: "u123" }).hint("userId_1_status_1")  // by name

// Force collection scan (bypass all indexes)
db.orders.find({ userId: "u123" }).hint({ $natural: 1 })`,
                },
              ],
            },
          },
          // ── Transactions ──────────────────────────────────────────────────────
          {
            title: "Transactions",
            description: "Multi-document ACID transactions across collections",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "javascript", label: "Multi-document transactions",
                  content: `// Transactions require a replica set or sharded cluster
const session = db.getMongo().startSession()

session.startTransaction({
  readConcern:  { level: "snapshot" },
  writeConcern: { w: "majority" },
})

try {
  const accounts = session.getDatabase("bank").accounts

  // Debit sender
  accounts.updateOne(
    { _id: "acc_sender", balance: { $gte: 500 } },
    { $inc: { balance: -500 } },
    { session }
  )

  // Credit receiver
  accounts.updateOne(
    { _id: "acc_receiver" },
    { $inc: { balance: 500 } },
    { session }
  )

  session.commitTransaction()
  console.log("Transfer committed")
} catch (err) {
  session.abortTransaction()
  console.error("Transaction aborted:", err)
} finally {
  session.endSession()
}`,
                },
                {
                  order: 1, language: "javascript", label: "Transactions in Node.js driver",
                  content: `import { MongoClient } from "mongodb"

const client = new MongoClient(process.env.MONGODB_URI)

async function transferFunds(fromId, toId, amount) {
  const session = client.startSession()

  try {
    await session.withTransaction(async () => {
      const accounts = client.db("bank").collection("accounts")

      const sender = await accounts.findOne(
        { _id: fromId },
        { session }
      )
      if (!sender || sender.balance < amount) {
        throw new Error("Insufficient funds")
      }

      await accounts.updateOne(
        { _id: fromId },
        { $inc: { balance: -amount } },
        { session }
      )

      await accounts.updateOne(
        { _id: toId },
        { $inc: { balance: amount } },
        { session }
      )

      // Audit log (same transaction)
      await client.db("bank").collection("transfers").insertOne({
        from:      fromId,
        to:        toId,
        amount,
        createdAt: new Date(),
      }, { session })
    }, {
      readConcern:  { level: "snapshot" },
      writeConcern: { w: "majority" },
      maxCommitTimeMS: 5000,
    })
  } finally {
    await session.endSession()
  }
}`,
                },
              ],
            },
          },
          // ── Node.js Driver ────────────────────────────────────────────────────
          {
            title: "Node.js Driver Patterns",
            description: "Connect, query and manage collections from Node.js",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "javascript", label: "Connection and singleton pattern",
                  content: `import { MongoClient, ServerApiVersion } from "mongodb"

const uri = process.env.MONGODB_URI

// Singleton — reuse across requests (critical in serverless)
let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In dev, use a global to survive HMR
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, {
    serverApi: {
      version:        ServerApiVersion.v1,
      strict:         true,
      deprecationErrors: true,
    },
  })
  clientPromise = client.connect()
}

export default clientPromise

// Usage in a route
const client = await clientPromise
const db     = client.db("mydb")
const users  = db.collection("users")`,
                },
                {
                  order: 1, language: "javascript", label: "Typed collection and common operations",
                  content: `import { ObjectId, type Collection, type WithId } from "mongodb"

interface User {
  _id?:      ObjectId
  name:      string
  email:     string
  role:      "user" | "admin"
  createdAt: Date
}

async function getUserById(db, id: string): Promise<WithId<User> | null> {
  return db.collection<User>("users").findOne({ _id: new ObjectId(id) })
}

async function createUser(db, data: Omit<User, "_id">) {
  const result = await db.collection<User>("users").insertOne({
    ...data,
    createdAt: new Date(),
  })
  return result.insertedId
}

// Cursor — iterate large result sets without loading all into memory
async function processAllUsers(db) {
  const cursor = db.collection("users").find({ role: "user" })
  for await (const user of cursor) {
    await processUser(user)
  }
}

// Aggregation with typed result
const pipeline = [
  { $match: { role: "user" } },
  { $group: { _id: "$country", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
]
const results = await db.collection("users")
  .aggregate<{ _id: string; count: number }>(pipeline)
  .toArray()`,
                },
              ],
            },
          },
          // ── Useful Patterns ───────────────────────────────────────────────────
          {
            title: "Useful Patterns",
            description: "Geospatial, full-text search, Change Streams and schema validation",
            userId: admin.id,
            isPublic: true,
            commands: {
              create: [
                {
                  order: 0, language: "javascript", label: "Geospatial queries",
                  content: `// Document must have a 2dsphere index and GeoJSON location field
// { location: { type: "Point", coordinates: [longitude, latitude] } }

// Near — sort by distance
db.places.find({
  location: {
    $near: {
      $geometry:    { type: "Point", coordinates: [-0.1278, 51.5074] },
      $maxDistance: 5000,   // metres
      $minDistance: 0,
    }
  }
})

// Within a polygon
db.places.find({
  location: {
    $geoWithin: {
      $geometry: {
        type: "Polygon",
        coordinates: [[
          [-0.15, 51.49], [-0.10, 51.49],
          [-0.10, 51.52], [-0.15, 51.52],
          [-0.15, 51.49],
        ]]
      }
    }
  }
})

// $geoNear aggregation stage — includes distance in output
db.places.aggregate([
  {
    $geoNear: {
      near:          { type: "Point", coordinates: [-0.1278, 51.5074] },
      distanceField: "distanceMetres",
      maxDistance:   2000,
      spherical:     true,
      query:         { category: "restaurant" },
    }
  },
  { $limit: 10 },
])`,
                },
                {
                  order: 1, language: "javascript", label: "Full-text search and Change Streams",
                  content: `// Text search (requires text index)
db.posts.find(
  { $text: { $search: "mongodb performance" } },
  { score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } })

// Phrase search and negation
db.posts.find({ $text: { $search: '"window functions" -basic' } })

// Change Streams — react to real-time collection changes
const changeStream = db.collection("orders").watch([
  { $match: { "operationType": { $in: ["insert", "update"] } } },
  { $match: { "fullDocument.status": "pending" } },
])

changeStream.on("change", (change) => {
  console.log("Operation:", change.operationType)
  console.log("Document:",  change.fullDocument)
  console.log("Updated fields:", change.updateDescription?.updatedFields)
})

// Resume after disconnect using resume token
const token = changeStream.resumeToken
const resumed = db.collection("orders").watch([], { resumeAfter: token })`,
                },
                {
                  order: 2, language: "javascript", label: "Schema validation",
                  content: `// Enforce structure at the database level
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "role"],
      properties: {
        name: {
          bsonType:    "string",
          minLength:   1,
          maxLength:   100,
          description: "must be a string",
        },
        email: {
          bsonType: "string",
          pattern:  "^[\\\\w.-]+@[\\\\w.-]+\\\\.[a-z]{2,}$",
        },
        role: {
          enum:        ["user", "admin", "moderator"],
          description: "must be one of the allowed values",
        },
        age: {
          bsonType:    "int",
          minimum:     0,
          maximum:     150,
        },
        tags: {
          bsonType: "array",
          items:    { bsonType: "string" },
        },
      },
      additionalProperties: false,
    }
  },
  validationLevel:  "strict",   // "strict" | "moderate"
  validationAction: "error",    // "error" | "warn"
})

// Add / update validator on existing collection
db.runCommand({
  collMod:          "users",
  validator:        { $jsonSchema: { /* ... */ } },
  validationLevel:  "moderate",
})`,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created MongoDB cheatsheet: ${mongo.name} (${mongo.id})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
