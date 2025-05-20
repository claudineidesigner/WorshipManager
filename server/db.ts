import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Verificar se a variável de ambiente DATABASE_URL existe
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não está definida");
}

// Configuração da conexão com o banco de dados
const connectionString = process.env.DATABASE_URL;
// Conexão para consultas sql
const queryClient = postgres(connectionString);
// Inicialização do Drizzle ORM
export const db = drizzle(queryClient);