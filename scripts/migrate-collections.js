// Script Node.js pour copier toutes les collections de 'asmyn-group' vers 'asmyne'
const { MongoClient } = require('mongodb');

const uri = 'process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL || ""';
const sourceDbName = 'asmyn-group';
const targetDbName = 'asmyne';
const collectionName = 'collections';

async function migrateCollections() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const sourceDb = client.db(sourceDbName);
    const targetDb = client.db(targetDbName);

    const docs = await sourceDb.collection(collectionName).find({}).toArray();
    if (docs.length === 0) {
      console.log('Aucune collection à migrer.');
      return;
    }
    await targetDb.collection(collectionName).insertMany(docs);
    console.log(`${docs.length} collections copiées de '${sourceDbName}' vers '${targetDbName}'.`);
  } finally {
    await client.close();
  }
}

migrateCollections().catch(console.error);