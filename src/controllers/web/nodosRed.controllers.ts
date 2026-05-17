import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import {
    actualizarNodoRedServicio,
    crearNodoRedComoUsuarioServicio,
    eliminarNodoRedComoUsuarioServicio,
    obtenerNodoRedPorIdServicio,
} from "../../services/nodosRed.service";

const esquemaIdNodoRed = z.object({
    id: z.coerce.number().int("El identificador del nodo de red debe ser un numero entero.").positive("El nodo de red debe ser valido."),
});

const esquemaMacAddress = z
    .string()
    .trim()
    .regex(/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/, "La direccion MAC no tiene un formato valido.");

const esquemaCrearNodoRed = z.object({
    nodeId: z.string().trim().min(1, "El nodeId es obligatorio.").max(80, "El nodeId excede el limite permitido."),
    salaId: z.number().int("El identificador de la sala debe ser un entero.").positive("La sala debe ser valida.").optional(),
    ip: z.string().trim().max(45, "La direccion IP excede el limite permitido.").optional(),
    macAddress: esquemaMacAddress.optional(),
    firmwareVersion: z.string().trim().max(40, "La version de firmware excede el limite permitido.").optional(),
    ultimoPingEn: z.string().datetime("La fecha del ultimo ping no tiene un formato valido.").optional(),
    estaActivo: z.boolean().optional(),
});

const esquemaActualizarNodoRed = z
    .object({
        nodeId: z.string().trim().min(1, "El nodeId es obligatorio.").max(80, "El nodeId excede el limite permitido.").optional(),
        salaId: z.number().int("El identificador de la sala debe ser un entero.").positive("La sala debe ser valida.").optional(),
        ip: z.string().trim().max(45, "La direccion IP excede el limite permitido.").optional(),
        macAddress: esquemaMacAddress.optional(),
        firmwareVersion: z.string().trim().max(40, "La version de firmware excede el limite permitido.").optional(),
        ultimoPingEn: z.string().datetime("La fecha del ultimo ping no tiene un formato valido.").optional(),
        estaActivo: z.boolean().optional(),
    })
    .refine((datos) => Object.keys(datos).length > 0, {
        message: "Debes enviar al menos un campo para actualizar el nodo de red.",
    });

export const crearNodoRedControlador = async (
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

    const validacion = esquemaCrearNodoRed.safeParse(req.body);

    if (!validacion.success) {
        return res.status(400).json({
            success: false,
            message: validacion.error.issues[0]?.message ?? "Datos invalidos para crear el nodo de red.",
        });
    }

    try {
        const nodoRed = await crearNodoRedComoUsuarioServicio(validacion.data, usuarioAutenticado);

        return res.status(201).json({
            success: true,
            message: "Nodo de red creado correctamente.",
            data: nodoRed,
        });
    } catch (error) {
        return next(error);
    }
};

export const obtenerNodoRedPorIdControlador = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    const validacionId = esquemaIdNodoRed.safeParse(req.params);

    if (!validacionId.success) {
        return res.status(400).json({
            success: false,
            message: validacionId.error.issues[0]?.message ?? "Identificador del nodo de red invalido.",
        });
    }

    try {
        const nodoRed = await obtenerNodoRedPorIdServicio(validacionId.data.id);

        return res.status(200).json({
            success: true,
            data: nodoRed,
        });
    } catch (error) {
        return next(error);
    }
};

export const actualizarNodoRedControlador = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    const validacionId = esquemaIdNodoRed.safeParse(req.params);

    if (!validacionId.success) {
        return res.status(400).json({
            success: false,
            message: validacionId.error.issues[0]?.message ?? "Identificador del nodo de red invalido.",
        });
    }

    const validacionBody = esquemaActualizarNodoRed.safeParse(req.body);

    if (!validacionBody.success) {
        return res.status(400).json({
            success: false,
            message: validacionBody.error.issues[0]?.message ?? "Datos invalidos para actualizar el nodo de red.",
        });
    }

    try {
        const nodoRed = await actualizarNodoRedServicio(validacionId.data.id, validacionBody.data);

        return res.status(200).json({
            success: true,
            message: "Nodo de red actualizado correctamente.",
            data: nodoRed,
        });
    } catch (error) {
        return next(error);
    }
};

export const eliminarNodoRedControlador = async (
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

    const validacionId = esquemaIdNodoRed.safeParse(req.params);

    if (!validacionId.success) {
        return res.status(400).json({
            success: false,
            message: validacionId.error.issues[0]?.message ?? "Identificador del nodo de red invalido.",
        });
    }

    try {
        await eliminarNodoRedComoUsuarioServicio(validacionId.data.id, usuarioAutenticado);

        return res.status(200).json({
            success: true,
            message: "Nodo de red eliminado correctamente.",
        });
    } catch (error) {
        return next(error);
    }
};