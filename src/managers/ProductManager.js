import { nanoid } from "nanoid";
import { readJSON, writeJSON } from "../utils/fileUtils.js";
const PRODUCTS_FILE = "src/data/products.json";
export default class ProductManager {
  async getProducts() {
    const data = await readJSON(PRODUCTS_FILE);
    return Array.isArray(data) ? data : [];
  }
  async getProductById(id) {
    const list = await this.getProducts();
    return list.find((p) => p.id === id);
  }
  async addProduct(p) {
    const required = [
      "title",
      "description",
      "code",
      "price",
      "status",
      "stock",
      "category",
    ];
    for (const k of required) {
      if (p[k] === undefined || p[k] === null || p[k] === "")
        throw new Error(`Falta campo: ${k}`);
    }
    const list = await this.getProducts();
    if (list.some((x) => x.code === p.code))
      throw new Error("Código duplicado");
    const newP = {
      id: nanoid(10),
      title: String(p.title),
      description: String(p.description),
      code: String(p.code),
      price: Number(p.price),
      status: Boolean(p.status),
      stock: Number(p.stock),
      category: String(p.category),
      thumbnails: Array.isArray(p.thumbnails) ? p.thumbnails : [],
    };
    list.push(newP);
    await writeJSON(PRODUCTS_FILE, list);
    return newP;
  }
  async updateProduct(id, patch) {
    const list = await this.getProducts();
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Producto no encontrado");
    const current = list[idx];
    const updated = { ...current, ...patch };
    if (updated.price != null) updated.price = Number(updated.price);
    if (updated.stock != null) updated.stock = Number(updated.stock);
    list[idx] = updated;
    await writeJSON(PRODUCTS_FILE, list);
    return updated;
  }
  async deleteProduct(id) {
    const list = await this.getProducts();
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Producto no encontrado");
    list.splice(idx, 1);
    await writeJSON(PRODUCTS_FILE, list);
    return true;
  }
}
