import express, { NextFunction, Request, Response } from "express";
import { getDb } from "./config/db";
import pool from "./config/db";
import sensorsRoutes from "./routes/web/sensors.routes";
import  errorMiddleware from "./middlewares/error.middleware";
import { API_KEYS, PORT } from "./config/env";
import sensorsRoutesSp32 from "./routes/backend/sensoresSp32.routes";
import authRoutes from "./routes/auth/auth.routes";
import usersRoutes from "./routes/users/users.routes";
import { extractClientIp } from "./shared/network";
import salasRoutes from "./routes/web/salas.routes";
import tiposSensoresRoutes from "./routes/web/tiposSensores.routes";
import actuadoresRoutes from "./routes/web/actuadores.routes";
import nodosRedRoutes from "./routes/web/nodosRed.routes";

const app = express();

app.set("trust proxy", true);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Ruta de salud para monitoreo y diagnóstico
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      status: "ok",
      service: "api",
      database: "up",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      ip: extractClientIp(req),
    });
  } catch {
    res.status(503).json({
      status: "degraded",
      service: "api",
      database: "down",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      ip: extractClientIp(req),
    });
  }
});

// Middleware para validar API Key en rutas protegidas
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header('x-api-key');

  console.log(`Received request from IP: ${extractClientIp(req)}, API Key: ${apiKey}`);
  
  if (!apiKey || apiKey !== API_KEYS) {
    res.status(401).json({
      success: false,
      message: "Invalid or missing API key.",
    });
    return;
  }
  
  next();
};

app.use("/api/v1/esp32", validateApiKey);


//Usar rutas para la web
app.use("/api/v1/sensors", sensorsRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/salas", salasRoutes);
app.use("/api/v1/tipos-sensores", tiposSensoresRoutes);
app.use("/api/v1/actuadores", actuadoresRoutes);
app.use("/api/v1/nodos-red", nodosRedRoutes);
// Usar rutas para la api a esp32
app.use("/api/v1/esp32/sensors", sensorsRoutesSp32);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Manejador de errores (debe ir al final)
app.use(errorMiddleware);

app.listen(PORT, async  () => {
  console.log(`Servidor corriendo por el puerto ${PORT}`);
  await getDb();
});