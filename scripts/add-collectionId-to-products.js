// Ce script ajoute le champ collectionId à tous les produits qui ne l'ont pas.
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL || ""';
const dbName = process.env.MONGODB_DB || 'asmyn';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const products = db.collection('products');

  const res = await products.updateMany(
    { collectionId: { $exists: false } },
    { $set: { collectionId: '' } }
  );
  console.log(`Produits modifiés : ${res.modifiedCount}`);
  await client.close();
}

main().catch(e => { console.error(e); process.exit(1); });
