import jwt from "jsonwebtoken";

// Verifies the JWT from the Authorization header and attaches the user payload
// to req.user. Rejects the request when no valid token is provided.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, username: payload.username };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

// Attaches req.user when a valid token is present, but does not reject the
// request otherwise. Useful for endpoints that behave differently for
// authenticated users (e.g. showing whether the current user liked a post).
export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: payload.id, username: payload.username };
    } catch {
      // Ignore invalid token for optional auth.
    }
  }
  next();
}
