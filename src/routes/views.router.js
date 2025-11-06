import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";
const router = Router();
const pm = new ProductManager();
router.get("/", async (req, res, next) => {
  try {
    const products = await pm.getProducts();
    res.render("home", { title: "Home", products });
  } catch (e) {
    next(e);
  }
});
router.get("/realtimeproducts", async (req, res, next) => {
  try {
    const products = await pm.getProducts();
    res.render("realTimeProducts", { title: "Real-Time", products });
  } catch (e) {
    next(e);
  }
});
router.get("/products/:pid", async (req, res, next) => {
  try {
    const product = await pm.getProductById(req.params.pid);
    if (!product)
      return res.status(404).render("404", { title: "No encontrado" });
    res.render("product", { title: product.title, product });
  } catch (e) {
    next(e);
  }
});
export default router;
