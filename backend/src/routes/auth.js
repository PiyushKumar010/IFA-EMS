import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const router = express.Router();
const ADMIN_EMAILS = ["piyush31221@gmail.com","harshitbali320@gmail.com"]; // Your admin emails

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
    const { googleToken, role } = req.body;
    if (!googleToken || !role) return res.status(400).json({ error: "Missing token or role" });

    const user = await verifyGoogleToken(googleToken);

    const isAdmin = ADMIN_EMAILS.includes(user.email)

    if (role === "admin" && !isAdmin) {
      return res.status(403).json({ error: "Unauthorized for admin access" });
    }

    // find user in database 
    let dbUser = await User.findOne({ email: user.email });

    // if user is not in database create user 
    if (!dbUser) {
      dbUser = new User({ 
        email: user.email, 
        roles: [role], 
        name: user.name, 
        picture: user.picture,
        lastLogin: Date.now(),
        status:(isAdmin || role === "client") ? "approved" : "pending",
      });

      await dbUser.save();

      // if employee -- back login 
      if(!isAdmin && role ==="employee"){
        return res.json({
          success:false,
          pending:true,
          message:"Your account is pending approval by admin.",
        });
      }

      // dbUser.lastLogin = Date.now();
      // if (!dbUser.roles.includes(role)) dbUser.roles.push(role);
      // dbUser.name = user.name;
      // dbUser.picture = user.picture;
      // Approval system removed
    } 
    // else {
    //   dbUser.lastLogin = Date.now();
    //   if (!dbUser.roles.includes(role)) dbUser.roles.push(role);
    //   dbUser.name = user.name;
    //   dbUser.picture = user.picture;
    //   // Approval system removed
    // }


    //update existing user 

    dbUser.lastLogin = Date.now();
    dbUser.name = user.name;
    dbUser.picture = user.picture;
    if (!dbUser.roles.includes(role)) dbUser.roles.push(role);

    await dbUser.save();


    if(role === "employee" && dbUser.status!=="approved"){
      return res.json({
        success:false,
        pending:true,
        message:"Your account is pending approval by admin."
      })
    }

    // Create JWT token - read JWT_SECRET at runtime
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not set in environment variables");
    }
    const tokenPayload = { userId: dbUser._id, email: user.email, roles: dbUser.roles, name: user.name, picture: user.picture };
    const jwtToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "1d" });

    // Set cookies. In development we must not set `secure: true` so cookies are allowed over http.
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("ems_token", jwtToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "strict" : "lax",
      maxAge: 24 * 60 * 60 * 1000
    });
    res.cookie("ems_role", role, {
      httpOnly: false,
      secure: isProd,
      sameSite: isProd ? "strict" : "lax",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({ success: true, ...tokenPayload });

  } catch (error) {
    console.error(error);
    res.status(401).json({ error: "Token validation failed" });
  }
});

router.post("/logout", (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("ems_token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax"
  });
  res.clearCookie("ems_role", {
    httpOnly: false,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax"
  });
  res.json({ success: true });
});

export default router;
