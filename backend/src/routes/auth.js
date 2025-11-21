import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const router = express.Router();
const ADMIN_EMAILS = ["piyush31221@gmail.com","harshitbali320@gmail.com"]; // Your admin emails

const isProduction = process.env.NODE_ENV === "production";
const cookieSameSite =
  (process.env.COOKIE_SAME_SITE || "").toLowerCase() ||
  (isProduction ? "none" : "lax");
const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

const buildCookieOptions = (overrides = {}) => ({
  secure: isProduction,
  sameSite: cookieSameSite,
  ...(cookieDomain ? { domain: cookieDomain } : {}),
  ...overrides,
});

async function verifyGoogleToken(token) {
  const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
  if (!response.data.aud || response.data.aud !== process.env.GOOGLE_CLIENT_ID) {
    throw new Error("Invalid Google Client ID.");
  }
  return {
    email: response.data.email,
    name: response.data.name,
    picture: response.data.picture
  };
}

router.post("/google", async (req, res) => {
  try {
    const { googleToken, role, employeeType } = req.body;
    if (!googleToken || !role) return res.status(400).json({ error: "Missing token or role" });

    const user = await verifyGoogleToken(googleToken);

    const isAdmin = ADMIN_EMAILS.includes(user.email);

    if (role === "admin" && !isAdmin) {
      return res.status(403).json({ error: "Unauthorized for admin access" });
    }

    // Special handling for hackathon applicants
    if (role === "employee" && employeeType === "hackathon-applicant") {
      // For hackathon applicants, we use a simpler flow with automatic approval
      let dbUser = await User.findOne({ email: user.email });
      
      if (!dbUser) {
        dbUser = new User({ 
          email: user.email, 
          roles: ["hackathon-applicant"], 
          name: user.name, 
          picture: user.picture,
          lastLogin: Date.now(),
          status: "approved", // Auto-approve hackathon applicants
        });
        await dbUser.save();
      } else {
        // Update existing user
        dbUser.lastLogin = Date.now();
        dbUser.name = user.name;
        dbUser.picture = user.picture;
        if (!dbUser.roles.includes("hackathon-applicant")) {
          dbUser.roles.push("hackathon-applicant");
        }
        await dbUser.save();
      }

      // Create JWT token for hackathon applicant
      const JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is not set in environment variables");
      }
      
      const tokenPayload = { 
        userId: dbUser._id, 
        email: user.email, 
        roles: dbUser.roles, 
        name: user.name, 
        picture: user.picture 
      };
      const jwtToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "1d" });

      // Set cookies
      res.cookie(
        "ems_token",
        jwtToken,
        buildCookieOptions({
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        }),
      );
      res.cookie(
        "ems_role",
        "hackathon-applicant",
        buildCookieOptions({
          httpOnly: false,
          maxAge: 24 * 60 * 60 * 1000,
        }),
      );

      return res.json({ success: true, ...tokenPayload });
    }

    // find user in database 
    let dbUser = await User.findOne({ email: user.email });
    let isNewUser = false;

    // if user is not in database create user 
    if (!dbUser) {
      isNewUser = true;
      // Set status before creating user - employees default to pending
      const initialStatus = (isAdmin || role === "client") ? "approved" : "pending";
      
      dbUser = new User({ 
        email: user.email, 
        roles: [role], 
        name: user.name, 
        picture: user.picture,
        lastLogin: Date.now(),
        status: initialStatus,
      });

      await dbUser.save();

      // if new employee and not admin -- redirect to pending approval
      // Re-fetch to ensure we have the actual saved status (after pre-save hook)
      dbUser = await User.findById(dbUser._id);
      
      // For new employees, check if they need approval
      // All new employees (except admins signing in as employee) need approval
      if (role === "employee") {
        console.log("New employee sign-in - Status:", dbUser.status, "isAdmin:", isAdmin, "Email:", user.email);
        // Only allow sign-in if status is "approved" OR if user is an admin email
        if (dbUser.status !== "approved" && !isAdmin) {
          console.log("Blocking sign-in - employee not approved");
          // Clear any cookies that might have been set
          res.clearCookie("ems_token", buildCookieOptions({ httpOnly: true }));
          res.clearCookie("ems_role", buildCookieOptions());
          console.log("Returning pending response for new employee");
          return res.json({
            success: false,
            pending: true,
            message: "Your account is pending approval by admin.",
          });
        } else {
          console.log("Allowing sign-in - employee approved or is admin");
        }
      }
    } else {
      // Update existing user
      dbUser.lastLogin = Date.now();
      dbUser.name = user.name;
      dbUser.picture = user.picture;
      if (!dbUser.roles.includes(role)) dbUser.roles.push(role);
      await dbUser.save();

      // Re-fetch to ensure we have the latest status
      dbUser = await User.findById(dbUser._id);
      
      // Check if existing employee is approved - must be approved to sign in
      if (role === "employee") {
        console.log("Existing employee sign-in - Status:", dbUser.status);
        if (dbUser.status !== "approved") {
          // Clear any cookies that might have been set
          res.clearCookie("ems_token", buildCookieOptions({ httpOnly: true }));
          res.clearCookie("ems_role", buildCookieOptions());
          console.log("Returning pending response for existing employee");
          return res.json({
            success: false,
            pending: true,
            message: "Your account is pending approval by admin.",
          });
        }
      }
    }

    // Create JWT token - read JWT_SECRET at runtime
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not set in environment variables");
    }
    const tokenPayload = { userId: dbUser._id, email: user.email, roles: dbUser.roles, name: user.name, picture: user.picture };
    const jwtToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "1d" });

    // Set cookies. In production we default to SameSite=None for cross-domain deployments (Render + Vercel).
    res.cookie(
      "ems_token",
      jwtToken,
      buildCookieOptions({
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      }),
    );
    res.cookie(
      "ems_role",
      role,
      buildCookieOptions({
        httpOnly: false,
        maxAge: 24 * 60 * 60 * 1000,
      }),
    );

    res.json({ success: true, ...tokenPayload });

  } catch (error) {
    console.error(error);
    res.status(401).json({ error: "Token validation failed" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("ems_token", buildCookieOptions({ httpOnly: true }));
  res.clearCookie("ems_role", buildCookieOptions());
  res.json({ success: true });
});

// Get user profile
router.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1] || req.cookies.ems_token;
    
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not set in environment variables");
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        roles: user.roles,
        status: user.status
      }
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
