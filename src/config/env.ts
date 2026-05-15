import { config } from "dotenv";

config({
    path: `.env.${process.env.NODE_ENV || "development"}.local`,// Carga el archivo de configuración específico para el entorno
});

export const { PORT, DATABASE_URL } = process.env;