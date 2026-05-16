import { Router } from "express";
import {
	actualizarTipoSensorControlador,
	crearTipoSensorControlador,
	eliminarTipoSensorControlador,
	obtenerTipoSensorPorIdControlador,
} from "../../controllers/web/tiposSensores.controllers";

const tiposSensoresRoutes = Router();

tiposSensoresRoutes.post("/", crearTipoSensorControlador);
tiposSensoresRoutes.get("/:id", obtenerTipoSensorPorIdControlador);
tiposSensoresRoutes.put("/:id", actualizarTipoSensorControlador);
tiposSensoresRoutes.delete("/:id", eliminarTipoSensorControlador);

export default tiposSensoresRoutes;