import jwt from "jsonwebtoken";

export default function authenticateAdmin(req, res, next) {
  const token = req.cookies.ems_token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.roles.includes("admin"))
      return res.status(403).json({ error: "Not admin" });

    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}