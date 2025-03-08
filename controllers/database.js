const config = require("../config.json");
const { MongoClient } = require("mongodb");
const uri = config.mongoDBURL;

const addUser = async function (user_id) {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const db = client.db(config.mongoDBName);
    const users = db.collection("users");
    const obj = { id: user_id, points: config.startingPoints };
    await users.insertOne(obj);
  } finally {
    await client.close();
  }
};

const addShiny = async function (pokemon) {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const db = client.db(config.mongoDBName);
    const shinies = db.collection("shinies");
    const obj = { title: pokemon };
    const result = await shinies.insertOne(obj);
    return result;
  } finally {
    await client.close();
  }
};

const addQuestion = async function (question) {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const db = client.db(config.mongoDBName);
    const questions = db.collection("questions");
    const obj = { text: question };

    await questions.insertOne(obj);
  } finally {
    await client.close();
  }
};

const removeShiny = async function (pokemon) {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const db = client.db(config.mongoDBName);
    const shinies = db.collection("shinies");
    const query = { title: pokemon };
    const result = await shinies.deleteOne(query);

    return result;
  } finally {
    await client.close();
  }
};

const updateBalance = async function (user_id, score) {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const db = client.db(config.mongoDBName);
    const users = db.collection("users");
    const filter = { id: user_id };
    const updatePoints = { $inc: { points: score } };

    await users.updateOne(filter, updatePoints);
  } finally {
    await client.close();
  }
};

const getBalance = async function (user_id) {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const db = client.db(config.mongoDBName);
    const users = db.collection("users");
    const query = { id: user_id };
    const result = await users.findOne(query);

    return result.points;
  } finally {
    await client.close();
  }
};

const userExists = async function (user_id) {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const db = client.db(config.mongoDBName);
    const users = db.collection("users");
    const query = { id: user_id };
    const result = await users.findOne(query);

    if (result) {
      return true;
    } else {
      return false;
    }
  } finally {
    await client.close();
  }
};

const shinyExists = async function (pokemon) {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const db = client.db(config.mongoDBName);
    const shinies = db.collection("shinies");
    const query = { title: pokemon };
    const result = await shinies.findOne(query);

    if (result) {
      return true;
    } else {
      return false;
    }
  } finally {
    await client.close();
  }
};

const getShinies = async function () {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const db = client.db(config.mongoDBName);
    const shinies = db.collection("shinies");
    const result = await shinies.find({}).toArray();
    const filtered_result = result.map((data) => { return data.title; }).join(', ');

    return filtered_result;
  } finally {
    await client.close();
  }
};

const questionExists = async function (question) {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const db = client.db(config.mongoDBName);
    const questions = db.collection("questions");
    const query = { text: question };
    const result = await questions.findOne(query);

    return result;
  } finally {
    await client.close();
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
};
