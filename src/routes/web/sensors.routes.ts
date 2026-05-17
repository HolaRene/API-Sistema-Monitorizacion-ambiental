import { Router } from "express";
import { autenticarUsuario } from "../../middlewares/auth.middleware";
import { actualizarSensor, crearSensor, eliminarSensor, obtenerSensores, obtenerSensorPorId } from "../../controllers/web/sensors.controllers";

const sensorsRoutes = Router();

sensorsRoutes.post("/", autenticarUsuario, crearSensor);

sensorsRoutes.get("/", obtenerSensores);

sensorsRoutes.get("/:id", obtenerSensorPorId);

sensorsRoutes.put("/:id", autenticarUsuario, actualizarSensor);

sensorsRoutes.delete("/:id", autenticarUsuario, eliminarSensor);

export default sensorsRoutes;
