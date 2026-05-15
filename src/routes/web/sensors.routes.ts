import { Router } from "express";
import { crearSensor, eliminarSensor, obtenerSensores, obtenerSensorPorId } from "../../controllers/web/sensors.controllers";

const sensorsRoutes = Router();

sensorsRoutes.post("/",crearSensor);

sensorsRoutes.get("/", obtenerSensores);

sensorsRoutes.get("/:id", obtenerSensorPorId);

sensorsRoutes.delete("/:id", eliminarSensor);

export default sensorsRoutes;
