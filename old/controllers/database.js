const config = require("../config.json");
const { MongoClient } = require("mongodb");
const uri = config.mongoDBURL;

// Create a MongoDB client with connection pooling
const client = new MongoClient(uri, {
  useUnifiedTopology: true,
  // Maximum number of connections in the pool
  maxPoolSize: 10,
  // Minimum number of connections in the pool
  minPoolSize: 1,
  // Server selection timeout
  serverSelectionTimeoutMS: 5000,
  // Socket timeout
  socketTimeoutMS: 45000,
  // Connection timeout
  connectTimeoutMS: 10000,
});

// Database and collections references
let db;
let users;
let shinies;
let questions;

// Initialize the database connection
async function initializeDB() {
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log("Connected to MongoDB");

    // Get database and collections
    db = client.db(config.mongoDBName);
    users = db.collection("users");
    shinies = db.collection("shinies");
    questions = db.collection("questions");

    // Create indexes if needed
    await users.createIndex({ id: 1 }, { unique: true });
    await shinies.createIndex({ title: 1 }, { unique: true });

    return true;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    return false;
  }
}

// Initialize the database connection when the module is loaded
initializeDB().catch(console.error);

// Handle application shutdown
process.on('SIGINT', async () => {
  try {
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error during MongoDB connection closure:', error);
    process.exit(1);
  }
});

// User operations
const addUser = async function (user_id) {
  try {
    const obj = { id: user_id, points: config.startingPoints };
    await users.insertOne(obj);
    return true;
  } catch (error) {
    console.error("Error adding user:", error);
    return false;
  }
};

const updateBalance = async function (user_id, score) {
  try {
    const filter = { id: user_id };
    const updatePoints = { $inc: { points: score } };
    const result = await users.updateOne(filter, updatePoints);
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error updating balance:", error);
    return false;
  }
};

const getBalance = async function (user_id) {
  try {
    const query = { id: user_id };
    const result = await users.findOne(query);
    return result ? result.points : null;
  } catch (error) {
    console.error("Error getting balance:", error);
    return null;
  }
};

const userExists = async function (user_id) {
  try {
    const query = { id: user_id };
    const result = await users.findOne(query);
    return !!result;
  } catch (error) {
    console.error("Error checking if user exists:", error);
    return false;
  }
};

// Shiny operations
const addShiny = async function (pokemon) {
  try {
    const obj = { title: pokemon };
    const result = await shinies.insertOne(obj);
    return result;
  } catch (error) {
    console.error("Error adding shiny:", error);
    return null;
  }
};

const removeShiny = async function (pokemon) {
  try {
    const query = { title: pokemon };
    const result = await shinies.deleteOne(query);
    return result;
  } catch (error) {
    console.error("Error removing shiny:", error);
    return null;
  }
};

const shinyExists = async function (pokemon) {
  try {
    const query = { title: pokemon };
    const result = await shinies.findOne(query);
    return !!result;
  } catch (error) {
    console.error("Error checking if shiny exists:", error);
    return false;
  }
};

const getShinies = async function () {
  try {
    const result = await shinies.find({}).toArray();
    const filtered_result = result.map((data) => data.title).join(", ");
    return filtered_result;
  } catch (error) {
    console.error("Error getting shinies:", error);
    return "";
  }
};

// Question operations
const addQuestion = async function (question) {
  try {
    const obj = { text: question };
    await questions.insertOne(obj);
    return true;
  } catch (error) {
    console.error("Error adding question:", error);
    return false;
  }
};

const questionExists = async function (question) {
  try {
    const query = { text: question };
    const result = await questions.findOne(query);
    return !!result;
  } catch (error) {
    console.error("Error checking if question exists:", error);
    return false;
  }
};

module.exports = {
  addShiny,
  addUser,
  addQuestion,
  removeShiny,
  getShinies,
  getBalance,
  updateBalance,
  userExists,
  shinyExists,
  questionExists,
  initializeDB,
};
