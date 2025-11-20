import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import Message from "./models/message.js";

let ioInstance = null;

const parseOrigins = (raw) =>
  (raw || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const DEFAULT_ORIGINS = ["https://ifa-frt.onrender.com"];
const configuredOrigins = parseOrigins(process.env.CORS_ORIGINS);
const fallbackOrigins = parseOrigins(process.env.FRONTEND_URL);
const allowedOrigins = configuredOrigins.length
  ? configuredOrigins
  : fallbackOrigins.length
    ? fallbackOrigins
    : DEFAULT_ORIGINS;

const getCookieValue = (cookieHeader = "", name) => {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const [key, ...rest] = part.split("=");
      if (key === name) {
        acc = rest.join("=");
      }
      return acc;
    }, null);
};

export const initSocketServer = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  ioInstance.use((socket, next) => {
    try {
      const cookieHeader = socket.request.headers.cookie || "";
      const token = getCookieValue(cookieHeader, "ems_token");
      if (!token) {
        return next(new Error("Unauthorized"));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = {
        userId: decoded.userId,
        roles: decoded.roles,
      };
      next();
    } catch (err) {
      next(err);
    }
  });

  ioInstance.on("connection", (socket) => {
    const userId = socket.user?.userId?.toString();
    if (userId) {
      socket.join(userId);
      console.log(`Socket connected for user ${userId}`);
    }

    socket.on("disconnect", () => {
      if (userId) {
        console.log(`Socket disconnected for user ${userId}`);
      }
    });
  });

  return ioInstance;
};

export const getIO = () => ioInstance;

export const emitMessages = async (messages) => {
  if (!ioInstance) return;
  const items = Array.isArray(messages) ? messages : [messages];
  const populated = await Message.populate(items, {
    path: "sender",
    select: "name email picture roles",
  });

  populated.forEach((msg) => {
    const payload = msg.toObject ? msg.toObject() : msg;
    const senderId =
      payload.sender?._id?.toString?.() ?? payload.sender?._id ?? payload.sender;
    const receiverId =
      payload.receiver?._id?.toString?.() ??
      payload.receiver?._id ??
      payload.receiver;

    if (senderId) {
      ioInstance.to(senderId.toString()).emit("message:new", payload);
    }
    if (receiverId) {
      ioInstance.to(receiverId.toString()).emit("message:new", payload);
    }
  });
};


