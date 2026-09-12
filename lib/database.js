const { MongoClient } = require('mongodb');

let clientPromise;

function getDatabase() {
  const uri = process.env.MONGODB_URI;
  const databaseName = process.env.MONGODB_DB_NAME || 'markecia';
  if (!uri) throw Object.assign(new Error('La base de datos no está configurada'), { statusCode: 503 });
  if (!clientPromise) {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000, maxPoolSize: 10 });
    clientPromise = client.connect();
  }
  return clientPromise.then((client) => client.db(databaseName));
}

async function getCollections() {
  const db = await getDatabase();
  return { users: db.collection('users'), products: db.collection('products'), carts: db.collection('carts'), orders: db.collection('orders') };
}

module.exports = { getDatabase, getCollections };
