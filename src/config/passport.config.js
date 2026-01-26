import dotenv from "dotenv";
dotenv.config();
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import User from "../dao/models/user.model.js";

// Función para extraer JWT de cookies
const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["token"];
  }
  return token;
};

// Opciones para la estrategia JWT
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
  secretOrKey: process.env.JWT_SECRET,
};

// Estrategia JWT
passport.use(
  "jwt",
  new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id).populate("cart");
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Estrategia "current" para validar usuario logueado
passport.use(
  "current",
  new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id)
        .select("-password")
        .populate("cart");

      if (user) {
        return done(null, user);
      }
      return done(null, false, {
        message: "Token inválido o usuario no encontrado",
      });
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;
