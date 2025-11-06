import { Router } from "express";
import CartManager from "../managers/CartManager.js";
const router = Router();
const cm = new CartManager();
router.post("/", async (req, res, next) => {
  try {
    const cart = await cm.createCart();
    res.status(201).json(cart);
  } catch (e) {
    next(e);
  }
});
router.get("/:cid", async (req, res, next) => {
  try {
    const cart = await cm.getCartById(req.params.cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
    res.json(cart);
  } catch (e) {
    next(e);
  }
});
router.post("/:cid/product/:pid", async (req, res, next) => {
  try {
    const qty = Number(req.body?.quantity || 1);
    const cart = await cm.addProductToCart(req.params.cid, req.params.pid, qty);
    res.status(201).json(cart);
  } catch (e) {
    next(e);
  }
});
export default router;
