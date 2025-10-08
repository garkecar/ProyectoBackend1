import { readJSON, writeJSON, resolveDataPath } from "../utils/fileUtils.js";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  10
);

export default class ProductManager {
  constructor(filename = "products.json") {
    this.path = resolveDataPath(filename);
  }

  async getProducts() {
    return await readJSON(this.path);
  }

  async getProductById(id) {
    const products = await this.getProducts();
    return products.find((p) => String(p.id) === String(id)) || null;
  }

  async addProduct(productData) {
    const required = [
      "title",
      "description",
      "code",
      "price",
      "status",
      "stock",
      "category",
    ];
    for (const f of required) {
      if (productData[f] === undefined) {
        const err = new Error(`Falta el campo requerido: ${f}`);
        err.status = 400;
        throw err;
      }
    }

    const products = await this.getProducts();

    // Validar code único (usualmente se pide)
    if (products.some((p) => p.code === productData.code)) {
      const err = new Error("El código del producto ya existe");
      err.status = 400;
      throw err;
    }

    const newProduct = {
      id: nanoid(), // Autogenerado
      title: String(productData.title),
      description: String(productData.description),
      code: String(productData.code),
      price: Number(productData.price),
      status: Boolean(productData.status),
      stock: Number(productData.stock),
      category: String(productData.category),
      thumbnails: Array.isArray(productData.thumbnails)
        ? productData.thumbnails.map(String)
        : [],
    };

    products.push(newProduct);
    await writeJSON(this.path, products);
    return newProduct;
  }

  async updateProduct(id, updates) {
    if (!updates || typeof updates !== "object") {
      const err = new Error("Body inválido para actualización");
      err.status = 400;
      throw err;
    }

    // No permitir modificar id
    // eslint-disable-next-line no-unused-vars
    const { id: _ignored, ...safeUpdates } = updates;

    const products = await this.getProducts();
    const idx = products.findIndex((p) => String(p.id) === String(id));
    if (idx === -1) {
      const err = new Error("Producto no encontrado");
      err.status = 404;
      throw err;
    }

    const updated = { ...products[idx], ...safeUpdates };
    // Normalizaciones básicas si vinieron en update
    if (safeUpdates.price !== undefined)
      updated.price = Number(safeUpdates.price);
    if (safeUpdates.status !== undefined)
      updated.status = Boolean(safeUpdates.status);
    if (safeUpdates.stock !== undefined)
      updated.stock = Number(safeUpdates.stock);
    if (safeUpdates.thumbnails !== undefined) {
      updated.thumbnails = Array.isArray(safeUpdates.thumbnails)
        ? safeUpdates.thumbnails.map(String)
        : [];
    }

    products[idx] = updated;
    await writeJSON(this.path, products);
    return updated;
  }

  async deleteProduct(id) {
    const products = await this.getProducts();
    const initialLen = products.length;
    const filtered = products.filter((p) => String(p.id) !== String(id));
    if (filtered.length === initialLen) {
      const err = new Error("Producto no encontrado");
      err.status = 404;
      throw err;
    }
    await writeJSON(this.path, filtered);
    return true;
  }
}
