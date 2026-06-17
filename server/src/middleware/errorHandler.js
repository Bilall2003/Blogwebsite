export function notFound(req, res) {
  res.status(404).json({ message: "Route not found." });
}

// Centralized error handler so controllers can simply `next(err)`.
export function errorHandler(err, req, res, _next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Internal server error.",
  });
}
