import express from "express";
import morgan from "morgan";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Rutas base según consigna
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// Healthcheck opcional
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "ecommerce-api-fs" });
});

// Manejo de errores genéricos
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Error interno del servidor" });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
