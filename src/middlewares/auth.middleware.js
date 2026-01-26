import passport from "passport";

// Middleware para autenticar con JWT
export const authenticateJWT = passport.authenticate("jwt", { session: false });

// Middleware para verificar roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "No autenticado",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: "No tienes permisos para acceder a este recurso",
      });
    }

    next();
  };
};
