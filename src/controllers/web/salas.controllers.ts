import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import {
    actualizarSalaServicio,
    crearSalaComoUsuarioServicio,
    eliminarSalaComoUsuarioServicio,
    obtenerSalaPorIdServicio,
} from "../../services/salas.service";

const esquemaIdSala = z.object({
    id: z.coerce.number().int("El identificador de la sala debe ser un numero entero.").positive("La sala debe ser valida."),
});

const esquemaCrearSala = z.object({
    codigo: z.string().trim().min(1, "El codigo es obligatorio.").max(50, "El codigo excede el limite permitido."),
    nombre: z.string().trim().min(1, "El nombre es obligatorio.").max(120, "El nombre excede el limite permitido."),
    areaFisica: z.string().trim().max(160, "El area fisica excede el limite permitido.").optional(),
    nivelCriticidad: z
        .number({ error: "El nivel de criticidad es obligatorio." })
        .int("El nivel de criticidad debe ser un numero entero.")
        .min(1, "El nivel de criticidad minimo es 1.")
        .max(5, "El nivel de criticidad maximo es 5.")
        .optional(),
    descripcion: z.string().trim().optional(),
});

const esquemaActualizarSala = z
    .object({
        codigo: z.string().trim().min(1, "El codigo es obligatorio.").max(50, "El codigo excede el limite permitido.").optional(),
        nombre: z.string().trim().min(1, "El nombre es obligatorio.").max(120, "El nombre excede el limite permitido.").optional(),
        areaFisica: z.string().trim().max(160, "El area fisica excede el limite permitido.").optional(),
        nivelCriticidad: z
            .number()
            .int("El nivel de criticidad debe ser un numero entero.")
            .min(1, "El nivel de criticidad minimo es 1.")
            .max(5, "El nivel de criticidad maximo es 5.")
            .optional(),
        descripcion: z.string().trim().optional(),
    })
    .refine((datos) => Object.keys(datos).length > 0, {
        message: "Debes enviar al menos un campo para actualizar la sala.",
    });

export const crearSalaControlador = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    const usuarioAutenticado = req.usuarioAutenticado;

    if (!usuarioAutenticado) {
        return res.status(401).json({
            success: false,
            message: "Debes iniciar sesion para crear recursos.",
        });
    }

    const validacion = esquemaCrearSala.safeParse(req.body);

    if (!validacion.success) {
        return res.status(400).json({
            success: false,
            message: validacion.error.issues[0]?.message ?? "Datos invalidos para crear la sala.",
        });
    }

    try {
        const sala = await crearSalaComoUsuarioServicio(validacion.data, usuarioAutenticado);

        return res.status(201).json({
            success: true,
            message: "Sala creada correctamente.",
            data: sala,
        });
    } catch (error) {
        return next(error);
    }
};

export const obtenerSalaPorIdControlador = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    const validacionId = esquemaIdSala.safeParse(req.params);

    if (!validacionId.success) {
        return res.status(400).json({
            success: false,
            message: validacionId.error.issues[0]?.message ?? "Identificador de sala invalido.",
        });
    }

    try {
        const sala = await obtenerSalaPorIdServicio(validacionId.data.id);

        return res.status(200).json({
            success: true,
            data: sala,
        });
    } catch (error) {
        return next(error);
    }
};

export const actualizarSalaControlador = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    const validacionId = esquemaIdSala.safeParse(req.params);

    if (!validacionId.success) {
        return res.status(400).json({
            success: false,
            message: validacionId.error.issues[0]?.message ?? "Identificador de sala invalido.",
        });
    }

    const validacionBody = esquemaActualizarSala.safeParse(req.body);

    if (!validacionBody.success) {
        return res.status(400).json({
            success: false,
            message: validacionBody.error.issues[0]?.message ?? "Datos invalidos para actualizar la sala.",
        });
    }

    try {
        const sala = await actualizarSalaServicio(validacionId.data.id, validacionBody.data);

        return res.status(200).json({
            success: true,
            message: "Sala actualizada correctamente.",
            data: sala,
        });
    } catch (error) {
        return next(error);
    }
};

export const eliminarSalaControlador = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    const usuarioAutenticado = req.usuarioAutenticado;

    if (!usuarioAutenticado) {
        return res.status(401).json({
            success: false,
            message: "Debes iniciar sesion para eliminar recursos.",
        });
    }

    const validacionId = esquemaIdSala.safeParse(req.params);

    if (!validacionId.success) {
        return res.status(400).json({
            success: false,
            message: validacionId.error.issues[0]?.message ?? "Identificador de sala invalido.",
        });
    }

    try {
        await eliminarSalaComoUsuarioServicio(validacionId.data.id, usuarioAutenticado);

        return res.status(200).json({
            success: true,
            message: "Sala eliminada correctamente.",
        });
    } catch (error) {
        return next(error);
    }
};