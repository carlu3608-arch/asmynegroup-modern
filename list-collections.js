// Script pour vérifier le contenu de la collection 'collections' dans la base asmyne
// Place ce fichier à la racine et lance-le avec: node list-collections.js

const { MongoClient } = require('mongodb');

const uri = 'process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL || ""';

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('asmyne');
    const collections = await db.collection('collections').find({}).toArray();
    console.log('Nombre de collections trouvées :', collections.length);
    collections.forEach((c, i) => {
      console.log(`--- Collection #${i+1} ---`);
      console.log(c);
    });
  } catch (err) {
    console.error('❌ Erreur MongoDB:', err);
  } finally {
    await client.close();
  }
}

main();
