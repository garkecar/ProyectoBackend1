import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Encriptar contraseña
export const hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

// Comparar contraseña
export const comparePassword = (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
};

// Generar token JWT
export const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION || "24h",
  });
};
