import { nanoid } from "nanoid";
import { readJSON, writeJSON } from "../utils/fileUtils.js";
import ProductManager from "./ProductManager.js";
const CARTS_FILE = "src/data/carts.json";
const pm = new ProductManager();
export default class CartManager {
  async getCarts() {
    const data = await readJSON(CARTS_FILE);
    return Array.isArray(data) ? data : [];
  }
  async getCartById(id) {
    const list = await this.getCarts();
    return list.find((c) => c.id === id);
  }
  async createCart() {
    const list = await this.getCarts();
    const cart = { id: nanoid(10), products: [] };
    list.push(cart);
    await writeJSON(CARTS_FILE, list);
    return cart;
  }
  async addProductToCart(cartId, productId, quantity = 1) {
    const list = await this.getCarts();
    const cidx = list.findIndex((c) => c.id === cartId);
    if (cidx === -1) throw new Error("Carrito no encontrado");
    const product = await pm.getProductById(productId);
    if (!product) throw new Error("Producto no existe");
    const cart = list[cidx];
    const pidx = cart.products.findIndex((p) => p.product === productId);
    if (pidx === -1)
      cart.products.push({
        product: productId,
        quantity: Number(quantity) || 1,
      });
    else cart.products[pidx].quantity += Number(quantity) || 1;
    list[cidx] = cart;
    await writeJSON(CARTS_FILE, list);
    return cart;
  }
}
