import { Router } from "express";
import Product from "../dao/models/product.model.js";
import { authenticateJWT, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * GET /api/products
 * Query params:
 *  - limit (default 10)
 *  - page (default 1)
 *  - sort: 'asc' | 'desc' por precio
 *  - query: filtro (category:xxx o status:true/false)
 *
 * Devuelve:
 * {
 *   status: 'success' | 'error',
 *   payload: [...],
 *   totalPages,
 *   prevPage,
 *   nextPage,
 *   page,
 *   hasPrevPage,
 *   hasNextPage,
 *   prevLink,
 *   nextLink
 * }
 */
router.get("/", async (req, res, next) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    const limitNum = Number(limit) || 10;
    const pageNum = Number(page) || 1;

    // Filtro
    const filter = {};
    if (query) {
      // Formato: category:Electrónica o status:true
      const [field, value] = String(query).split(":");
      if (field && value !== undefined) {
        if (field === "status") {
          filter.status = value === "true";
        } else if (field === "category") {
          filter.category = value;
        }
      }
    }

    // Orden
    const sortOption = {};
    if (sort === "asc") sortOption.price = 1;
    if (sort === "desc") sortOption.price = -1;

    const skip = (pageNum - 1) * limitNum;

    const [docs, totalDocs] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalDocs / limitNum) || 1;
    const hasPrevPage = pageNum > 1;
    const hasNextPage = pageNum < totalPages;
    const prevPage = hasPrevPage ? pageNum - 1 : null;
    const nextPage = hasNextPage ? pageNum + 1 : null;

    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
    const buildLink = (p) => {
      if (!p) return null;
      const params = new URLSearchParams();
      params.set("page", p);
      params.set("limit", limitNum);
      if (sort) params.set("sort", sort);
      if (query) params.set("query", query);
      return `${baseUrl}?${params.toString()}`;
    };

    return res.json({
      status: "success",
      payload: docs,
      totalPages,
      prevPage,
      nextPage,
      page: pageNum,
      hasPrevPage,
      hasNextPage,
      prevLink: hasPrevPage ? buildLink(prevPage) : null,
      nextLink: hasNextPage ? buildLink(nextPage) : null,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      error: err.message,
    });
  }
});

router.get("/:pid", async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.pid).lean();
    if (!p)
      return res
        .status(404)
        .json({ status: "error", error: "Producto no encontrado" });
    res.json({ status: "success", payload: p });
  } catch (e) {
    next(e);
  }
});

router.post("/", authenticateJWT, authorize("admin"), async (req, res) => {
  try {
    const created = await Product.create(req.body || {});
    // Emitir a WebSocket
    const allProducts = await Product.find().lean();
    req.app?.locals?.io?.emit("products:list", allProducts);
    res.status(201).json({ status: "success", payload: created });
  } catch (e) {
    res.status(400).json({ status: "error", error: e.message });
  }
});

router.put("/:pid", authenticateJWT, authorize("admin"), async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.pid,
      req.body || {},
      { new: true, runValidators: true }
    ).lean();
    if (!updated)
      return res
        .status(404)
        .json({ status: "error", error: "Producto no encontrado" });

    // Emitir a WebSocket
    const allProducts = await Product.find().lean();
    req.app?.locals?.io?.emit("products:list", allProducts);
    res.json({ status: "success", payload: updated });
  } catch (e) {
    res.status(400).json({ status: "error", error: e.message });
  }
});

router.delete(
  "/:pid",
  authenticateJWT,
  authorize("admin"),
  async (req, res) => {
    try {
      const deleted = await Product.findByIdAndDelete(req.params.pid);
      if (!deleted)
        return res
          .status(404)
          .json({ status: "error", error: "Producto no encontrado" });

      // Emitir a WebSocket
      const allProducts = await Product.find().lean();
      req.app?.locals?.io?.emit("products:list", allProducts);
      res.json({ status: "success", message: "Producto eliminado" });
    } catch (e) {
      res.status(404).json({ status: "error", error: e.message });
    }
  }
);

export default router;
