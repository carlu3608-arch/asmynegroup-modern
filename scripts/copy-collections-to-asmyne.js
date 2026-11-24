const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || "process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL || """;

(async function(){
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const src = client.db('asmnye');
    const dst = client.db('asmyne');
    const docs = await src.collection('collections').find().toArray();
    console.log('Found', docs.length, 'collections in asmnye');
    for (const d of docs) {
      const filter = { title: d.title };
      // avoid overwriting createdAt when upserting
      const { createdAt, _id, ...rest } = d;
      const update = { $set: { ...rest, updatedAt: new Date() }, $setOnInsert: { createdAt: createdAt || new Date() } };
      await dst.collection('collections').updateOne(filter, update, { upsert: true });
    }
    console.log('Copied collections to asmyne DB');
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
})();
