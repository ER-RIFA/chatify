import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import fs from "fs";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import User from "./models/User.js";
import jwt from "jsonwebtoken";

const app = express();
const server = http.createServer(app);

const PORT = ENV.PORT || 3000;

const __dirname = path.resolve();

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

/* =========================
   CORS
========================= */

const allowedOrigins = [
    "http://localhost:5173",
    "https://chatify-dwc6.onrender.com",
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

/* =========================
   API ROUTES
========================= */

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

/* =========================
   SOCKET.IO
========================= */

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
});

/* Socket authentication */

io.use(async (socket, next) => {
    try {
        const cookieHeader = socket.handshake.headers.cookie;

        if (!cookieHeader) {
            return next(new Error("Unauthorized - No cookie"));
        }

        const token = cookieHeader
            .split("; ")
            .find((row) => row.startsWith("jwt="))
            ?.split("=")[1];

        if (!token) {
            return next(new Error("Unauthorized - No token"));
        }

        const decoded = jwt.verify(token, ENV.JWT_SECRET);

        const user = await User.findById(decoded.userId).select(
            "-password"
        );

        if (!user) {
            return next(new Error("User not found"));
        }

        socket.user = user;
        socket.userId = user._id.toString();

        next();
    } catch (error) {
        console.log(
            "Socket authentication error:",
            error.message
        );

        next(new Error("Unauthorized"));
    }
});

/* Online users */

const userSocketMap = {};

export const getReceiverSocketId = (userId) => {
    return userSocketMap[userId];
};

io.on("connection", (socket) => {
    console.log(
        "User connected:",
        socket.user.fullName,
        socket.id
    );

    const userId = socket.userId;

    userSocketMap[userId] = socket.id;

    io.emit(
        "getOnlineUsers",
        Object.keys(userSocketMap)
    );

    socket.on("disconnect", () => {
        console.log(
            "User disconnected:",
            socket.user.fullName
        );

        delete userSocketMap[userId];

        io.emit(
            "getOnlineUsers",
            Object.keys(userSocketMap)
        );
    });
});

/* =========================
   SERVE FRONTEND
========================= */

const frontendPath = path.join(
    __dirname,
    "../frontend/dist"
);

if (fs.existsSync(frontendPath)) {
    console.log(
        "Frontend found at:",
        frontendPath
    );

    app.use(express.static(frontendPath));

    app.get("*", (req, res) => {
        if (req.path.startsWith("/api")) {
            return res.status(404).json({
                message: "API route not found",
            });
        }

        res.sendFile(
            path.join(frontendPath, "index.html")
        );
    });
} else {
    console.log(
        "WARNING: Frontend dist folder not found:",
        frontendPath
    );

    app.get("/", (_, res) => {
        res.send("Chatify backend is running");
    });
}

/* =========================
   START SERVER
========================= */

server.listen(PORT, () => {
    console.log(
        `Server running on port: ${PORT}`
    );

    connectDB();
});