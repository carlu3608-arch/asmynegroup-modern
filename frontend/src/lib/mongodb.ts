import { Db, MongoClient } from "mongodb";

declare global {
  var __asmyneMongoClient: MongoClient | undefined;
}

export async function getMongoDb() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing.");
  }

  const client = global.__asmyneMongoClient ?? new MongoClient(uri);

  if (!global.__asmyneMongoClient) {
    await client.connect();
    global.__asmyneMongoClient = client;
  }

  const dbName = process.env.MONGODB_DB || "asmyne";
  return client.db(dbName) as Db;
}
