import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import {
    actualizarActuadorServicio,
    crearActuadorComoUsuarioServicio,
    eliminarActuadorComoUsuarioServicio,
    obtenerActuadorPorIdServicio,
} from "../../services/actuadores.service";

const esquemaIdActuador = z.object({
    id: z.coerce.number().int("El identificador del actuador debe ser un numero entero.").positive("El actuador debe ser valido."),
});

const esquemaCrearActuador = z.object({
    codigo: z.string().trim().min(1, "El codigo es obligatorio.").max(60, "El codigo excede el limite permitido."),
    tipoActuador: z.enum(["led", "buzzer", "ventilador"], {
        error: "El tipo de actuador debe ser led, buzzer o ventilador.",
    }),
    salaId: z.number().int("El identificador de sala debe ser un entero.").positive("La sala debe ser valida.").optional(),
    nodoRedId: z
        .number()
        .int("El identificador del nodo de red debe ser un entero.")
        .positive("El nodo de red debe ser valido.")
        .optional(),
    pin: z.string().trim().max(30, "El pin excede el limite permitido.").optional(),
    modelo: z.string().trim().max(80, "El modelo excede el limite permitido.").optional(),
    estaActivo: z.boolean().optional(),
});

const esquemaActualizarActuador = z
    .object({
        codigo: z.string().trim().min(1, "El codigo es obligatorio.").max(60, "El codigo excede el limite permitido.").optional(),
        tipoActuador: z
            .enum(["led", "buzzer", "ventilador"], {
                error: "El tipo de actuador debe ser led, buzzer o ventilador.",
            })
            .optional(),
        salaId: z.number().int("El identificador de sala debe ser un entero.").positive("La sala debe ser valida.").optional(),
        nodoRedId: z
            .number()
            .int("El identificador del nodo de red debe ser un entero.")
            .positive("El nodo de red debe ser valido.")
            .optional(),
        pin: z.string().trim().max(30, "El pin excede el limite permitido.").optional(),
        modelo: z.string().trim().max(80, "El modelo excede el limite permitido.").optional(),
        estaActivo: z.boolean().optional(),
    })
    .refine((datos) => Object.keys(datos).length > 0, {
        message: "Debes enviar al menos un campo para actualizar el actuador.",
    });

export const crearActuadorControlador = async (
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

    const validacion = esquemaCrearActuador.safeParse(req.body);

    if (!validacion.success) {
        return res.status(400).json({
            success: false,
            message: validacion.error.issues[0]?.message ?? "Datos invalidos para crear el actuador.",
        });
    }

    try {
        const actuador = await crearActuadorComoUsuarioServicio(validacion.data, usuarioAutenticado);

        return res.status(201).json({
            success: true,
            message: "Actuador creado correctamente.",
            data: actuador,
        });
    } catch (error) {
        return next(error);
    }
};

export const obtenerActuadorPorIdControlador = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    const validacionId = esquemaIdActuador.safeParse(req.params);

    if (!validacionId.success) {
        return res.status(400).json({
            success: false,
            message: validacionId.error.issues[0]?.message ?? "Identificador del actuador invalido.",
        });
    }

    try {
        const actuador = await obtenerActuadorPorIdServicio(validacionId.data.id);

        return res.status(200).json({
            success: true,
            data: actuador,
        });
    } catch (error) {
        return next(error);
    }
};

export const actualizarActuadorControlador = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    const validacionId = esquemaIdActuador.safeParse(req.params);

    if (!validacionId.success) {
        return res.status(400).json({
            success: false,
            message: validacionId.error.issues[0]?.message ?? "Identificador del actuador invalido.",
        });
    }

    const validacionBody = esquemaActualizarActuador.safeParse(req.body);

    if (!validacionBody.success) {
        return res.status(400).json({
            success: false,
            message: validacionBody.error.issues[0]?.message ?? "Datos invalidos para actualizar el actuador.",
        });
    }

    try {
        const actuador = await actualizarActuadorServicio(validacionId.data.id, validacionBody.data);

        return res.status(200).json({
            success: true,
            message: "Actuador actualizado correctamente.",
            data: actuador,
        });
    } catch (error) {
        return next(error);
    }
};

export const eliminarActuadorControlador = async (
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

    const validacionId = esquemaIdActuador.safeParse(req.params);

    if (!validacionId.success) {
        return res.status(400).json({
            success: false,
            message: validacionId.error.issues[0]?.message ?? "Identificador del actuador invalido.",
        });
    }

    try {
        await eliminarActuadorComoUsuarioServicio(validacionId.data.id, usuarioAutenticado);

        return res.status(200).json({
            success: true,
            message: "Actuador eliminado correctamente.",
        });
    } catch (error) {
        return next(error);
    }
};