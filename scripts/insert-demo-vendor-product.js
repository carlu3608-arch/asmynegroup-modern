// Script d'insertion d'un vendeur et d'un produit de démonstration dans la base MongoDB
const { MongoClient } = require('mongodb');

const uri = 'process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL || ""';

(async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();

    // 1. Insérer un vendeur
    const vendor = {
      storeName: 'Ma Boutique Démo',
      email: 'vendeur@exemple.com',
      createdAt: new Date()
    };
    const vendorResult = await db.collection('vendors').insertOne(vendor);
    const vendorId = vendorResult.insertedId.toString();
    console.log('Vendeur inséré avec _id:', vendorId);

    // 2. Insérer un produit lié à ce vendeur
    const product = {
      vendorId,
      storeName: vendor.storeName,
      name: 'Produit Test',
      price: 100,
      category: 'test',
      description: 'Un produit de test',
      imageUrl: '',
      stock: 10,
      sold: 0,
      status: 'active',
      createdAt: new Date()
    };
    const prodResult = await db.collection('products').insertOne(product);
    console.log('Produit inséré avec _id:', prodResult.insertedId.toString());
  } catch (e) {
    console.error('Erreur:', e);
  } finally {
    await client.close();
  }
})();
