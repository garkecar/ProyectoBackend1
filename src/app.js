import express from "express";
import morgan from "morgan";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server as SocketIOServer } from "socket.io";

import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";
import ProductManager from "./managers/ProductManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/public", express.static(path.join(__dirname, "public")));

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.locals.io = io;

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

app.get("/health", (req, res) => res.json({ status: "ok" }));

const pm = new ProductManager();
io.on("connection", async (socket) => {
  const products = await pm.getProducts();
  socket.emit("products:list", products);

  socket.on("product:create", async (payload, cb) => {
    try {
      const created = await pm.addProduct(payload || {});
      io.emit("products:list", await pm.getProducts());
      cb && cb({ ok: true, product: created });
    } catch (e) {
      cb && cb({ ok: false, error: e.message });
    }
  });

  socket.on("product:delete", async ({ id }, cb) => {
    try {
      await pm.deleteProduct(id);
      io.emit("products:list", await pm.getProducts());
      cb && cb({ ok: true });
    } catch (e) {
      cb && cb({ ok: false, error: e.message });
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal error" });
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Servidor HTTP+WS en http://localhost:${PORT}`);
});
