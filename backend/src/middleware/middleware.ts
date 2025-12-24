import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const isUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "Authentication token is missing",
        success: false,
      });
    }

    const jwtSecret = process.env.JWT_TOKEN;
    if (!jwtSecret) {
      return res.status(500).json({
        message: "Server configuration error",
        success: false,
      });
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = decoded; 

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token",
      success: false,
    });
  }
};
