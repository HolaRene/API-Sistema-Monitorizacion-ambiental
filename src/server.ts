import express from "express";
import { getDb } from "./config/db";
import sensorsRoutes from "./routes/web/sensors.routes";
import  errorMiddleware from "./middlewares/error.middleware";
import { PORT } from "./config/env";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//Usar rutas para la web
app.use("/api/v1/sensors", sensorsRoutes);
// Usar rutas para la api a esp32

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