const jwt = require("jsonwebtoken");

const authMiddleware = (requiredRoles = []) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token" });
      }
      req.user = decoded;
      if (
        requiredRoles.length > 0 &&
        !requiredRoles.some((role) => req.user.role.includes(role))
      ) {
        return res
          .status(403)
          .json({ message: "Forbidden: You do not have the required role" });
      }

      next();
    });
  };
};

module.exports = authMiddleware;
