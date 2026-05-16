import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { iniciarSesionServicio, registrarUsuarioServicio } from "../../services/auth.service";

const esquemaRegistroUsuario = z.object({
    nombres: z.string().trim().min(1, "Los nombres son obligatorios."),
    apellidos: z.string().trim().min(1, "Los apellidos son obligatorios."),
    email: z.email("Debes proporcionar un correo valido.").transform((valor) => valor.trim().toLowerCase()),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
    rol: z.enum(["admin", "operador", "visor"]).optional(),
});

const esquemaInicioSesion = z.object({
    email: z.email("Debes proporcionar un correo valido.").transform((valor) => valor.trim().toLowerCase()),
    password: z.string().min(1, "La contraseña es obligatoria."),
});

export const registrarUsuarioControlador = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    const validacion = esquemaRegistroUsuario.safeParse(req.body);

    if (!validacion.success) {
        return res.status(400).json({
            success: false,
            data: {
                nombres: req.body.nombres,
                apellidos: req.body.apellidos,
                email: req.body.email,
                rol: req.body.rol,
                password: req.body.password ? "********" : undefined,
            },
            message: validacion.error.issues[0]?.message ?? "Datos de registro invalidos.",
        });
    }

    try {
        const resultado = await registrarUsuarioServicio(validacion.data);

        return res.status(201).json({
            success: true,
            message: "Usuario registrado correctamente.",
            data: resultado,
        });
    } catch (error) {
        return next(error);
    }
};

export const iniciarSesionControlador = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    const validacion = esquemaInicioSesion.safeParse(req.body);

    if (!validacion.success) {
        return res.status(400).json({
            success: false,
            message: validacion.error.issues[0]?.message ?? "Datos de inicio de sesion invalidos.",
        });
    }

    try {
        const resultado = await iniciarSesionServicio(validacion.data);

        return res.status(200).json({
            success: true,
            message: "Inicio de sesion exitoso.",
            data: resultado,
        });
    } catch (error) {
        return next(error);
    }
};