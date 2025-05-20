import { db } from "./db";
import { 
  users, 
  type User,
  type UpsertUser
} from "@shared/schema";
import { eq } from "drizzle-orm";

// Interface para operações de armazenamento com PostgreSQL
export class DatabaseStorage {
  // Operações de usuário (obrigatórias para autenticação Replit)
  
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Outras operações com o banco de dados podem ser adicionadas aqui
}