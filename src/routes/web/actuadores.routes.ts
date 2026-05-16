import { Router } from "express";
import {
	actualizarActuadorControlador,
	crearActuadorControlador,
	eliminarActuadorControlador,
	obtenerActuadorPorIdControlador,
} from "../../controllers/web/actuadores.controllers";

const actuadoresRoutes = Router();

actuadoresRoutes.post("/", crearActuadorControlador);
actuadoresRoutes.get("/:id", obtenerActuadorPorIdControlador);
actuadoresRoutes.put("/:id", actualizarActuadorControlador);
actuadoresRoutes.delete("/:id", eliminarActuadorControlador);

export default actuadoresRoutes;