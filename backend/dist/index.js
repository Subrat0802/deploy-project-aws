import express, {} from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { isUser } from "./middleware/middleware.js";
import cors from "cors";
import { dbConnected } from "./config/db.js";
dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
dbConnected();
const prisma = new PrismaClient();
app.post("/signup", async (req, res) => {
    try {
        const { email, username, password } = req.body;
        if (!email || !password || !username) {
            return res.status(400).json({
                message: "All fields are required",
                success: false,
            });
        }
        const findEmail = await prisma.user.findUnique({
            where: {
                email
            }
        });
        if (findEmail) {
            return res.status(400).json({
                message: "User already registered",
                success: false,
            });
        }
        const hashPass = await bcrypt.hash(password, 10);
        const response = await prisma.user.create({
            data: {
                email: email,
                username: username,
                password: hashPass,
            },
        });
        if (!response) {
            return res.status(404).json({
                message: "Error while signup",
                success: false,
            });
        }
        const user = await prisma.user.findUnique({
            where: {
                email
            },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true
            }
        });
        return res.status(200).json({
            message: "user signup successfully",
            success: true,
            user: user,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Server error while signup",
            success: false,
        });
    }
});
app.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required",
                success: false,
            });
        }
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        if (!existingUser) {
            return res.status(400).json({
                message: "User not registered, please signup first",
                success: false,
            });
        }
        const checkPassword = await bcrypt.compare(password, existingUser.password);
        if (!checkPassword) {
            return res.status(400).json({
                message: "Incorrect password",
                success: false,
            });
        }
        if (!process.env.JWT_TOKEN) {
            throw new Error("JWT_TOKEN is required");
        }
        const token = jwt.sign({
            id: existingUser.id,
            email: existingUser.email,
        }, process.env.JWT_TOKEN, { expiresIn: "2h" });
        const options = {
            expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
            httpOnly: true,
        };
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                username: true,
                email: true,
                createdAt: true,
            },
        });
        return res.cookie("token", token, options).status(200).json({
            message: "user signin successfully",
            user: user,
            success: true,
            token: token,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Server error while signin",
            success: false,
        });
    }
});
app.post("/todo", isUser, async (req, res) => {
    try {
        const { title } = req.body;
        const id = req.user?.id;
        console.log("id", id);
        if (!id) {
            return res.status(500).json({
                message: "server configration error",
                success: false,
            });
        }
        if (!title) {
            return res.status(400).json({
                message: "Title fields are required",
                success: false,
            });
        }
        const createTodo = await prisma.todo.create({
            data: {
                title: title,
                userId: id,
            },
        });
        if (!createTodo) {
            return res.status(404).json({
                message: "Error while creating todo, try again",
                success: false,
            });
        }
        return res.status(200).json({
            message: "Todo is created",
            data: createTodo,
            success: true,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Server error while creating todo",
            success: false,
        });
    }
});
app.get("/todos", isUser, async (req, res) => {
    try {
        const id = req.user?.id;
        if (!id) {
            return res.status(500).json({
                message: "server configration error",
                success: false,
            });
        }
        const response = await prisma.todo.findMany({
            where: {
                userId: id,
            },
        });
        if (!response) {
            return res.status(404).json({
                message: "Unable to find user todos",
                success: false,
            });
        }
        return res.status(200).json({
            message: "All todos",
            data: response
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Server error while getting all user todos",
            success: false,
        });
    }
});
app.listen("3001", () => {
    console.log("App is connected to port 3001");
});
//# sourceMappingURL=index.js.map