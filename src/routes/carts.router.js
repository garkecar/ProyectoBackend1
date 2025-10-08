import { Router } from "express";
import CartManager from "../managers/CartManager.js";
import ProductManager from "../managers/ProductManager.js";

const router = Router();
const cm = new CartManager();
const pm = new ProductManager();

router.post("/", async (req, res) => {
  try {
    const cart = await cm.createCart();
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ error: "Error al crear carrito" });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const cart = await cm.getCartById(req.params.cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
    res.json(cart.products);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener carrito" });
  }
});

router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const product = await pm.getProductById(pid);
    if (!product)
      return res.status(404).json({ error: "Producto no encontrado" });

    const quantity = req.body?.quantity ?? 1;
    const updatedCart = await cm.addProductToCart(cid, pid, quantity);
    res.status(201).json(updatedCart);
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Error al agregar producto al carrito" });
  }
});

export default router;
