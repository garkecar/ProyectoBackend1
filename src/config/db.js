import mongoose from "mongoose";

const MONGO_URI =
  "mongodb+srv://admin:123pass456@ecommerce-entrega.bl2tkrk.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=ecommerce-entrega";

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Conectado a MongoDB Atlas");
  } catch (err) {
    console.error("❌ Error conectando a MongoDB", err);
    process.exit(1);
  }
}
