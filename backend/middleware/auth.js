const jwt = require("jsonwebtoken")

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access token required",
    })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: "Invalid or expired token",
      })
    }
    req.user = user
    next()
  })
}

const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      error: "Super admin access required",
    })
  }
  next()
}

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      error: "Admin access required",
    })
  }
  next()
}

module.exports = {
  authenticateToken,
  requireSuperAdmin,
  requireAdmin,
}
