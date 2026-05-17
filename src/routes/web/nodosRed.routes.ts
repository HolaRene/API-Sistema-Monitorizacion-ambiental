import { Router } from "express";
import { autenticarUsuario } from "../../middlewares/auth.middleware";
import {
    actualizarNodoRedControlador,
    crearNodoRedControlador,
    eliminarNodoRedControlador,
    obtenerNodoRedPorIdControlador,
} from "../../controllers/web/nodosRed.controllers";

const nodosRedRoutes = Router();

nodosRedRoutes.post("/", autenticarUsuario, crearNodoRedControlador);
nodosRedRoutes.get("/:id", obtenerNodoRedPorIdControlador);
nodosRedRoutes.put("/:id", autenticarUsuario, actualizarNodoRedControlador);
nodosRedRoutes.delete("/:id", autenticarUsuario, eliminarNodoRedControlador);

export default nodosRedRoutes;