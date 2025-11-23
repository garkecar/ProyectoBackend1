import { Router } from "express";
import { ProductModel } from "../dao/models/product.model.js";
import { CartModel } from "../dao/models/cart.model.js";

const router = Router();

// Ruta raíz redirige a /products
router.get("/", (req, res) => {
  res.redirect("/products");
});

// LISTA de productos con paginación -> usa vista "products"
router.get("/products", async (req, res, next) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;
    const limitNum = Number(limit) || 10;
    const pageNum = Number(page) || 1;

    // Filtro
    const filter = {};
    if (query) {
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
      ProductModel.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ProductModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalDocs / limitNum) || 1;
    const hasPrevPage = pageNum > 1;
    const hasNextPage = pageNum < totalPages;

    // IMPORTANTE: aquí va "products", NO "productDetail"
    res.render("products", {
      title: "Productos",
      products: docs,
      paging: {
        totalPages,
        page: pageNum,
        hasPrevPage,
        hasNextPage,
        prevPage: hasPrevPage ? pageNum - 1 : null,
        nextPage: hasNextPage ? pageNum + 1 : null,
        limit: limitNum,
        sort,
        query,
      },
      // Para el botón "Agregar al carrito" en la lista:
      // Pon aquí un carrito REAL que hayas creado por API
      cartId: "6920e6da8d8c351fe45c0e19", // cambia por tu cid real
    });
  } catch (e) {
    next(e);
  }
});

// Vista realtime (lista en tiempo real)
router.get("/realtimeproducts", async (req, res, next) => {
  try {
    const products = await ProductModel.find().lean();
    res.render("realTimeProducts", { title: "Real-Time", products });
  } catch (e) {
    next(e);
  }
});

// DETALLE de producto -> usa vista "productDetail"
router.get("/products/:pid", async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.pid).lean();
    if (!product) {
      return res.status(404).render("404", { title: "Producto no encontrado" });
    }

    res.render("productDetail", {
      title: product.title,
      product,
    });
  } catch (e) {
    next(e);
  }
});

// Vista de carrito -> usa vista "cart"
router.get("/carts/:cid", async (req, res, next) => {
  try {
    const cart = await CartModel.findById(req.params.cid)
      .populate("products.product")
      .lean();

    if (!cart) {
      return res.status(404).render("404", { title: "Carrito no encontrado" });
    }

    res.render("cart", {
      title: `Carrito ${cart._id}`,
      cart,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
