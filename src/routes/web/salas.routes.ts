import { Router } from "express";
import { autenticarUsuario } from "../../middlewares/auth.middleware";
import {
	actualizarSalaControlador,
	crearSalaControlador,
	eliminarSalaControlador,
	obtenerSalaPorIdControlador,
} from "../../controllers/web/salas.controllers";

const salasRoutes = Router();

salasRoutes.post("/", autenticarUsuario, crearSalaControlador);
salasRoutes.get("/:id", obtenerSalaPorIdControlador);
salasRoutes.put("/:id", autenticarUsuario, actualizarSalaControlador);
salasRoutes.delete("/:id", autenticarUsuario, eliminarSalaControlador);

export default salasRoutes;