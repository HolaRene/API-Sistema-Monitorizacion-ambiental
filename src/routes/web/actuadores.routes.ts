import { Router } from "express";
import { autenticarUsuario } from "../../middlewares/auth.middleware";
import {
	actualizarActuadorControlador,
	crearActuadorControlador,
	eliminarActuadorControlador,
	obtenerActuadorPorIdControlador,
} from "../../controllers/web/actuadores.controllers";

const actuadoresRoutes = Router();

actuadoresRoutes.post("/", autenticarUsuario, crearActuadorControlador);
actuadoresRoutes.get("/:id", obtenerActuadorPorIdControlador);
actuadoresRoutes.put("/:id", autenticarUsuario, actualizarActuadorControlador);
actuadoresRoutes.delete("/:id", autenticarUsuario, eliminarActuadorControlador);

export default actuadoresRoutes;