// Script d'initialisation MongoDB pour toutes les collections critiques
// À lancer avec: node scripts/init-mongo.js

const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI || 'process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL || ""';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  // Vendors
  const vendorId = new ObjectId();
  await db.collection('vendors').insertOne({
    _id: vendorId,
    storeName: 'Test Vendor',
    email: 'test@vendor.com',
    password: 'hashed-password',
  });

  // Collections
  const collectionId = new ObjectId();
  await db.collection('collections').insertOne({
    _id: collectionId,
    vendorId: vendorId.toString(),
    name: 'Collection Test',
    description: 'Collection de test',
  });

  // Products
  await db.collection('products').insertOne({
    vendorId: vendorId.toString(),
    storeName: 'Test Vendor',
    name: 'Produit test',
    price: 10,
    category: 'Test',
    description: 'Produit d’initialisation',
    imageUrl: '',
    stock: 5,
    sold: 0,
    status: 'active',
    createdAt: new Date(),
  });

  console.log('Collections vendors, collections et products initialisées avec succès !');
  await client.close();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
