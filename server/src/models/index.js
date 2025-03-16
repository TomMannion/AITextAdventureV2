import { PrismaClient } from "@prisma/client";
import logger from "../utils/logger.js";

// Initialize Prisma Client
const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "event",
      level: "error",
    },
    {
      emit: "event",
      level: "info",
    },
    {
      emit: "event",
      level: "warn",
    },
  ],
});

// Log slow queries
prisma.$on("query", (e) => {
  if (e.duration > 500) {
    // Log queries taking more than 500ms
    logger.warn(`Slow query (${e.duration}ms): ${e.query}`);
  }
});

// Log Prisma errors
prisma.$on("error", (e) => {
  logger.error("Prisma error:", e);
});

// Handle Prisma disconnect on app termination
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
