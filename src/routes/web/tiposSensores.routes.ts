import { Router } from "express";
import { autenticarUsuario } from "../../middlewares/auth.middleware";
import {
	actualizarTipoSensorControlador,
	crearTipoSensorControlador,
	eliminarTipoSensorControlador,
	obtenerTipoSensorPorIdControlador,
} from "../../controllers/web/tiposSensores.controllers";

const tiposSensoresRoutes = Router();

tiposSensoresRoutes.post("/", autenticarUsuario, crearTipoSensorControlador);
tiposSensoresRoutes.get("/:id", obtenerTipoSensorPorIdControlador);
tiposSensoresRoutes.put("/:id", autenticarUsuario, actualizarTipoSensorControlador);
tiposSensoresRoutes.delete("/:id", autenticarUsuario, eliminarTipoSensorControlador);

export default tiposSensoresRoutes;