import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { iniciarSesionServicio } from "../../services/auth.service";

const esquemaInicioSesion = z.object({
    email: z.email("Debes enviar un correo valido.").trim(),
    password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres."),
});

export const iniciarSesionControlador = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const resultadoValidacion = esquemaInicioSesion.safeParse(req.body);

    if (!resultadoValidacion.success) {
        res.status(400).json({
            success: false,
            message: resultadoValidacion.error.issues[0]?.message ?? "Datos invalidos.",
        });
        return;
    }

    try {
        const respuesta = await iniciarSesionServicio(resultadoValidacion.data);

        res.status(200).json({
            success: true,
            message: "Inicio de sesion exitoso.",
            data: respuesta,
        });
    } catch (error) {
        next(error);
    }
};