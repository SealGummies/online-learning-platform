const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

// Test connection to MongoDB Atlas
const testAtlasConnection = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ MONGODB_URI not found in environment variables");
    console.log("Please set your MongoDB Atlas connection string in .env file");
    return;
  }

  if (!uri.includes("mongodb+srv://")) {
    console.log("ℹ️  Local MongoDB URI detected, skipping Atlas test");
    return;
  }

  console.log("🔗 Testing MongoDB Atlas connection...");

  // Create a MongoClient with a MongoClientOptions object to set the Stable API version
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    // Connect the client to the server
    await client.connect();

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });

    console.log("✅ Successfully connected to MongoDB Atlas!");

    // Test database operations
    const db = client.db("online-learning-platform");
    const collections = await db.listCollections().toArray();
    console.log(`📊 Database has ${collections.length} collections`);

    if (collections.length > 0) {
      console.log("📋 Collections:", collections.map((c) => c.name).join(", "));
    }
  } catch (error) {
    console.error("❌ Atlas connection failed:", error.message);
    console.log("\n🔧 Troubleshooting steps:");
    console.log("1. Check your username and password in the connection string");
    console.log("2. Ensure your IP address is whitelisted in MongoDB Atlas");
    console.log("3. Verify your cluster is running and accessible");
    console.log("4. Check your network connection");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
};

// Also test with Mongoose (our actual connection method)
const testMongooseConnection = async () => {
  const mongoose = require("mongoose");
  const uri = process.env.MONGODB_URI;

  if (!uri || !uri.includes("mongodb+srv://")) {
    console.log("ℹ️  Skipping Mongoose Atlas test (using local MongoDB)");
    return;
  }

  console.log("\n🔗 Testing Mongoose connection to Atlas...");

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Mongoose connected to MongoDB Atlas successfully!");
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("❌ Mongoose connection failed:", error.message);
  } finally {
    await mongoose.connection.close();
  }
};

const runTests = async () => {
  console.log("🧪 MongoDB Atlas Connection Test\n");

  await testAtlasConnection();
  await testMongooseConnection();

  console.log("\n✨ Test completed");
};

runTests().catch(console.dir);
