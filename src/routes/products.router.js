import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";
const router = Router();
const pm = new ProductManager();

router.get("/", async (req, res, next) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    let products = await pm.getProducts();
    if (limit && !Number.isNaN(limit)) products = products.slice(0, limit);
    res.json(products);
  } catch (e) {
    next(e);
  }
});
router.get("/:pid", async (req, res, next) => {
  try {
    const p = await pm.getProductById(req.params.pid);
    if (!p) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(p);
  } catch (e) {
    next(e);
  }
});
router.post("/", async (req, res) => {
  try {
    const created = await pm.addProduct(req.body || {});
    req.app?.locals?.io?.emit("products:list", await pm.getProducts());
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
router.put("/:pid", async (req, res) => {
  try {
    const updated = await pm.updateProduct(req.params.pid, req.body || {});
    req.app?.locals?.io?.emit("products:list", await pm.getProducts());
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
router.delete("/:pid", async (req, res) => {
  try {
    await pm.deleteProduct(req.params.pid);
    req.app?.locals?.io?.emit("products:list", await pm.getProducts());
    res.json({ message: "Producto eliminado" });
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});
export default router;
