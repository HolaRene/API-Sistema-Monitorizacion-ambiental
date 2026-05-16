import { Router } from "express";
import {
	actualizarSalaControlador,
	crearSalaControlador,
	eliminarSalaControlador,
	obtenerSalaPorIdControlador,
} from "../../controllers/web/salas.controllers";

const salasRoutes = Router();

salasRoutes.post("/", crearSalaControlador);
salasRoutes.get("/:id", obtenerSalaPorIdControlador);
salasRoutes.put("/:id", actualizarSalaControlador);
salasRoutes.delete("/:id", eliminarSalaControlador);

export default salasRoutes;