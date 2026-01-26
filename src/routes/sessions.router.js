import { Router } from "express";
import passport from "passport";
import User from "../dao/models/user.model.js";
import Cart from "../dao/models/cart.model.js";
import {
  hashPassword,
  comparePassword,
  generateToken,
} from "../utils/auth.utils.js";

const router = Router();

// POST /api/sessions/register - Registro de usuario
router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;

    // Validar campos requeridos
    if (!first_name || !last_name || !email || !age || !password) {
      return res.status(400).json({
        status: "error",
        message: "Todos los campos son requeridos",
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "El email ya está registrado",
      });
    }

    // Crear carrito para el usuario
    const newCart = await Cart.create({ products: [] });

    // Encriptar contraseña y crear usuario
    const hashedPassword = hashPassword(password);
    const newUser = await User.create({
      first_name,
      last_name,
      email,
      age,
      password: hashedPassword,
      cart: newCart._id,
      role: "user",
    });

    // Generar token JWT
    const token = generateToken(newUser);

    // Guardar token en cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    });

    res.status(201).json({
      status: "success",
      message: "Usuario registrado exitosamente",
      token,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al registrar usuario",
      error: error.message,
    });
  }
});

// POST /api/sessions/login - Login de usuario
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email y contraseña son requeridos",
      });
    }

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Credenciales inválidas",
      });
    }

    // Verificar contraseña
    const isValidPassword = comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        status: "error",
        message: "Credenciales inválidas",
      });
    }

    // Generar token JWT
    const token = generateToken(user);

    // Guardar token en cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    });

    res.json({
      status: "success",
      message: "Login exitoso",
      token,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al iniciar sesión",
      error: error.message,
    });
  }
});

// GET /api/sessions/current - Obtener usuario actual (estrategia "current")
router.get(
  "/current",
  passport.authenticate("current", { session: false }),
  (req, res) => {
    res.json({
      status: "success",
      payload: {
        id: req.user._id,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        age: req.user.age,
        role: req.user.role,
        cart: req.user.cart,
      },
    });
  }
);

// POST /api/sessions/logout - Cerrar sesión
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({
    status: "success",
    message: "Sesión cerrada exitosamente",
  });
});

export default router;
