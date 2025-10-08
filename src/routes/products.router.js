import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";

const router = Router();
const pm = new ProductManager();

router.get("/", async (req, res, next) => {
  try {
    const products = await pm.getProducts();
    res.json(products);
  } catch (err) {
    next(err);
  }
});

router.get("/:pid", async (req, res) => {
  try {
    const product = await pm.getProductById(req.params.pid);
    if (!product)
      return res.status(404).json({ error: "Producto no encontrado" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener producto" });
  }
});

router.post("/", async (req, res) => {
  try {
    const created = await pm.addProduct(req.body || {});
    res.status(201).json(created);
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Error al crear producto" });
  }
});

router.put("/:pid", async (req, res) => {
  try {
    const updated = await pm.updateProduct(req.params.pid, req.body || {});
    res.json(updated);
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Error al actualizar producto" });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    await pm.deleteProduct(req.params.pid);
    res.json({ message: "Producto eliminado" });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Error al eliminar producto" });
  }
});

export default router;
