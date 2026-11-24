// Script pour lister tous les produits de la collection products marketplace-global
// Place ce fichier à la racine et lance-le avec: node list-marketplace-products.js

const { MongoClient } = require('mongodb');

const uri = 'process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL || ""';

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('test');
    const collection = db.collection('products marketplace-global');
    const products = await collection.find({}).toArray();
    console.log('Nombre de produits trouvés :', products.length);
    products.forEach((p, i) => {
      console.log(`--- Produit #${i+1} ---`);
      console.log(p);
    });
  } catch (err) {
    console.error('❌ Erreur MongoDB:', err);
  } finally {
    await client.close();
  }
}

main();
