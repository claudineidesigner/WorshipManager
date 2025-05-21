import type { Request, Response, NextFunction } from "express";

// Redirecionando para o arquivo replitAuth.ts
// Este arquivo é mantido para compatibilidade com o código existente
import { isAuthenticated as authMiddleware } from "./replitAuth";

// Middleware para verificar se o usuário está autenticado
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  return authMiddleware(req, res, next);
}

// Definindo tipos para sessão
declare module "express-session" {
  interface SessionData {
    passport: {
      user: any;
    };
  }
}
