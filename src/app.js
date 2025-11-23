import express from "express";
import { engine } from "express-handlebars";
import { Server as SocketServer } from "socket.io";
import { createServer } from "http";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";

import { ProductModel } from "./dao/models/product.model.js";
import { connectDB } from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new SocketServer(server);

app.locals.io = io;

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  // Enviar lista inicial de productos desde Mongo
  ProductModel.find()
    .lean()
    .then((products) => {
      socket.emit("products:list", products);
    })
    .catch((err) => {
      console.error("Error obteniendo productos para WS:", err);
    });

  socket.on("product:create", async (data, ack) => {
    try {
      await ProductModel.create(data);
      const products = await ProductModel.find().lean();
      io.emit("products:list", products);
      ack?.({ ok: true });
    } catch (e) {
      ack?.({ ok: false, error: e.message });
    }
  });

  socket.on("product:delete", async (data, ack) => {
    try {
      await ProductModel.findByIdAndDelete(data.id);
      const products = await ProductModel.find().lean();
      io.emit("products:list", products);
      ack?.({ ok: true });
    } catch (e) {
      ack?.({ ok: false, error: e.message });
    }
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

const PORT = 8080;

async function start() {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Servidor HTTP+WS en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Error al iniciar la app:", err);
    process.exit(1);
  }
}

start();
