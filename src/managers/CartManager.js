import { readJSON, writeJSON, resolveDataPath } from "../utils/fileUtils.js";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  10
);

export default class CartManager {
  constructor(filename = "carts.json") {
    this.path = resolveDataPath(filename);
  }

  async getCarts() {
    return await readJSON(this.path);
  }

  async createCart() {
    const carts = await this.getCarts();
    const newCart = { id: nanoid(), products: [] };
    carts.push(newCart);
    await writeJSON(this.path, carts);
    return newCart;
  }

  async getCartById(id) {
    const carts = await this.getCarts();
    return carts.find((c) => String(c.id) === String(id)) || null;
  }

  async addProductToCart(cartId, productId, quantity = 1) {
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      const err = new Error("quantity debe ser un entero >= 1");
      err.status = 400;
      throw err;
    }

    const carts = await this.getCarts();
    const idx = carts.findIndex((c) => String(c.id) === String(cartId));
    if (idx === -1) {
      const err = new Error("Carrito no encontrado");
      err.status = 404;
      throw err;
    }

    const cart = carts[idx];
    const existing = cart.products.find(
      (p) => String(p.product) === String(productId)
    );
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.products.push({ product: String(productId), quantity: qty });
    }

    carts[idx] = cart;
    await writeJSON(this.path, carts);
    return cart;
  }
}
