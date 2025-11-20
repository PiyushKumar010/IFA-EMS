import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies?.ems_token;
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET not configured");
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: "Unauthorized - Invalid Token" });
    }

    // Fetch user from DB
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Attach both decoded token + DB user
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      roles: decoded.roles || user.roles || [],  // Fallback to DB roles if JWT roles are missing
      name: decoded.name,
      picture: decoded.picture,
      // approved field removed
      db: user
    };

    console.log("Auth middleware - User authenticated:", {
      userId: decoded.userId,
      email: decoded.email,
      jwtRoles: decoded.roles,
      dbRoles: user.roles,
      finalRoles: req.user.roles
    });

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
