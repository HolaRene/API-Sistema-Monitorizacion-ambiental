import { Router } from "express";
import { registrarUsuarioControlador } from "../../controllers/user/users.controllers";

const usersRoutes = Router();

usersRoutes.post("/register", registrarUsuarioControlador);

export default usersRoutes;