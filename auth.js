import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // Check if Authorization header is present and starts with "Bearer"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "Authorization header missing or invalid" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded && decoded.userId) {
      req.userId = decoded.userId;
      next();
    } else {
      return res.status(403).json({ message: "Invalid token payload" });
    }
  } catch (err) {
    return res.status(403).json({ message: "Token verification failed", error: err.message });
  }
}

export default authMiddleware;
