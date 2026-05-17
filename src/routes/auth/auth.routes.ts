import { Router } from "express";
import { iniciarSesionControlador, registrarUsuarioControlador } from "../../controllers/user/auth.controllers";

const authRoutes = Router();

authRoutes.post("/iniciar-sesion", iniciarSesionControlador);
authRoutes.post("/registro", registrarUsuarioControlador);

export default authRoutes;