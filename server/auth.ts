import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import bcrypt from "bcrypt";

// Middleware to check if the user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session.user) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Function to authenticate a user
export async function authenticateUser(username: string, password: string) {
  const user = await storage.getUserByUsername(username);
  
  if (!user) {
    return null;
  }
  
  const passwordMatch = await bcrypt.compare(password, user.password);
  
  if (!passwordMatch) {
    return null;
  }
  
  return user;
}

// Add session type definitions
declare module "express-session" {
  interface SessionData {
    user: {
      id: number;
      username: string;
      email: string;
      firstName?: string;
      lastName?: string;
      profileImage?: string;
      role?: string;
    };
  }
}
