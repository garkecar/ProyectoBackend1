import { Router } from "express";
import { CartModel } from "../dao/models/cart.model.js";
import { ProductModel } from "../dao/models/product.model.js";

const router = Router();

// Crear carrito
router.post("/", async (req, res, next) => {
  try {
    const cart = await CartModel.create({ products: [] });
    res.status(201).json({ status: "success", payload: cart });
  } catch (e) {
    next(e);
  }
});

// GET /api/carts/:cid -> con populate
router.get("/:cid", async (req, res, next) => {
  try {
    const cart = await CartModel.findById(req.params.cid)
      .populate("products.product")
      .lean();

    if (!cart) {
      return res
        .status(404)
        .json({ status: "error", error: "Carrito no encontrado" });
    }

    res.json({ status: "success", payload: cart });
  } catch (e) {
    next(e);
  }
});

// POST /api/carts/:cid/product/:pid -> agregar producto
router.post("/:cid/product/:pid", async (req, res, next) => {
  try {
    const { cid, pid } = req.params;
    const qty = Number(req.body?.quantity || 1);

    const cart = await CartModel.findById(cid);
    if (!cart)
      return res
        .status(404)
        .json({ status: "error", error: "Carrito no encontrado" });

    const product = await ProductModel.findById(pid);
    if (!product)
      return res
        .status(404)
        .json({ status: "error", error: "Producto no existe" });

    const idx = cart.products.findIndex((p) => p.product.toString() === pid);
    if (idx === -1) {
      cart.products.push({ product: pid, quantity: qty });
    } else {
      cart.products[idx].quantity += qty;
    }

    await cart.save();
    res.status(201).json({ status: "success", payload: cart });
  } catch (e) {
    next(e);
  }
});

/**
 * NUEVO: DELETE api/carts/:cid/products/:pid
 * Eliminar del carrito el producto seleccionado
 */
router.delete("/:cid/products/:pid", async (req, res, next) => {
  try {
    const { cid, pid } = req.params;
    const cart = await CartModel.findById(cid);
    if (!cart)
      return res
        .status(404)
        .json({ status: "error", error: "Carrito no encontrado" });

    cart.products = cart.products.filter((p) => p.product.toString() !== pid);

    await cart.save();
    res.json({ status: "success", payload: cart });
  } catch (e) {
    next(e);
  }
});

/**
 * NUEVO: PUT api/carts/:cid
 * Actualizar TODOS los productos del carrito con un arreglo de productos
 * Body esperado: { products: [{ product: "<id>", quantity: 2 }, ...] }
 */
router.put("/:cid", async (req, res, next) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;

    if (!Array.isArray(products)) {
      return res
        .status(400)
        .json({ status: "error", error: "products debe ser un array" });
    }

    const cart = await CartModel.findById(cid);
    if (!cart)
      return res
        .status(404)
        .json({ status: "error", error: "Carrito no encontrado" });

    cart.products = products.map((p) => ({
      product: p.product,
      quantity: p.quantity || 1,
    }));

    await cart.save();
    res.json({ status: "success", payload: cart });
  } catch (e) {
    next(e);
  }
});

/**
 * NUEVO: PUT api/carts/:cid/products/:pid
 * Actualizar SOLO la cantidad de ese producto
 * Body: { quantity: <number> }
 */
router.put("/:cid/products/:pid", async (req, res, next) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    const qty = Number(quantity);

    if (Number.isNaN(qty) || qty < 1) {
      return res
        .status(400)
        .json({ status: "error", error: "quantity inválida" });
    }

    const cart = await CartModel.findById(cid);
    if (!cart)
      return res
        .status(404)
        .json({ status: "error", error: "Carrito no encontrado" });

    const idx = cart.products.findIndex((p) => p.product.toString() === pid);
    if (idx === -1) {
      return res
        .status(404)
        .json({ status: "error", error: "Producto no está en el carrito" });
    }

    cart.products[idx].quantity = qty;
    await cart.save();

    res.json({ status: "success", payload: cart });
  } catch (e) {
    next(e);
  }
});

/**
 * NUEVO: DELETE api/carts/:cid
 * Vaciar el carrito
 */
router.delete("/:cid", async (req, res, next) => {
  try {
    const { cid } = req.params;
    const cart = await CartModel.findById(cid);
    if (!cart)
      return res
        .status(404)
        .json({ status: "error", error: "Carrito no encontrado" });

    cart.products = [];
    await cart.save();

    res.json({ status: "success", payload: cart });
  } catch (e) {
    next(e);
  }
});

export default router;
