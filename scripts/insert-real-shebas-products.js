// Script d'insertion de vrais produits Shebas dans MongoDB Atlas
const { MongoClient } = require("mongodb");

const uri = "process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL || """;
const client = new MongoClient(uri);

const products = [
  {
    id: "shebas-hair-solutions-pomada",
    name: "Shebas Hair Solutions ✨ (Pomada)",
    price: 500,
    image: "/uploads/cover/pomada.png",
    description: "Ayuda al crecimiento del cabello, Regenera y fortalece el pelo, Ayuda a frenar la caída, Nutre profundamente desde la raíz, Protege y da brillo natural.",
    stock: 100,
    category: "hair-solutions"
  },
  {
    id: "shebas-hair-solutions",
    name: "Shebas Hair Solutions ✨",
    price: 750,
    image: "/uploads/cover/shebas-hair-solutions.png",
    description: "Ayuda al crecimiento del cabello, Regenera y fortalece el pelo, Ayuda a frenar la caída, Nutre profundamente desde la raíz, Protege y da brillo natural.",
    stock: 100,
    category: "hair-solutions"
  },
  {
    id: "shebas-hair-solutions-aceite",
    name: "Shebas Hair Solutions ✨ (Aceite)",
    price: 850,
    image: "/uploads/cover/aceite.png",
    description: "Ayuda al crecimiento del cabello, Regenera y fortalece el pelo, Ayuda a frenar la caída, Nutre profundamente desde la raíz, Protege y da brillo natural.",
    stock: 100,
    category: "hair-solutions"
  }
];

async function main() {
  await client.connect();
  const db = client.db();
  const collection = db.collection("products");

  for (const prod of products) {
    await collection.updateOne(
      { id: prod.id },
      { $set: prod },
      { upsert: true }
    );
    console.log(`Produit inséré/mis à jour : ${prod.name}`);
  }
  await client.close();
  console.log("Tous les produits sont insérés !");
}

main().catch(console.error);
