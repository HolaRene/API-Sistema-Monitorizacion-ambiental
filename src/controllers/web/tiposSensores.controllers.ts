import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import {
    actualizarTipoSensorServicio,
    crearTipoSensorComoUsuarioServicio,
    eliminarTipoSensorComoUsuarioServicio,
    obtenerTipoSensorPorIdServicio,
} from "../../services/tiposSensores.service";

const esquemaIdTipoSensor = z.object({
    id: z
        .coerce.number()
        .int("El identificador del tipo de sensor debe ser un numero entero.")
        .positive("El tipo de sensor debe ser valido."),
});

const esquemaCrearTipoSensor = z.object({
    codigo: z.string().trim().min(1, "El codigo es obligatorio.").max(50, "El codigo excede el limite permitido."),
    nombre: z.string().trim().min(1, "El nombre es obligatorio.").max(120, "El nombre excede el limite permitido."),
    categoria: z.string().trim().min(1, "La categoria es obligatoria.").max(60, "La categoria excede el limite permitido."),
    unidadMedida: z
        .string()
        .trim()
        .min(1, "La unidad de medida es obligatoria.")
        .max(30, "La unidad de medida excede el limite permitido."),
    descripcion: z.string().trim().optional(),
});

const esquemaActualizarTipoSensor = z
    .object({
        codigo: z.string().trim().min(1, "El codigo es obligatorio.").max(50, "El codigo excede el limite permitido.").optional(),
        nombre: z.string().trim().min(1, "El nombre es obligatorio.").max(120, "El nombre excede el limite permitido.").optional(),
        categoria: z.string().trim().min(1, "La categoria es obligatoria.").max(60, "La categoria excede el limite permitido.").optional(),
        unidadMedida: z
            .string()
            .trim()
            .min(1, "La unidad de medida es obligatoria.")
            .max(30, "La unidad de medida excede el limite permitido.")
            .optional(),
        descripcion: z.string().trim().optional(),
    })
    .refine((datos) => Object.keys(datos).length > 0, {
        message: "Debes enviar al menos un campo para actualizar el tipo de sensor.",
    });

export const crearTipoSensorControlador = async (
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

    const validacion = esquemaCrearTipoSensor.safeParse(req.body);

    if (!validacion.success) {
        return res.status(400).json({
            success: false,
            message: validacion.error.issues[0]?.message ?? "Datos invalidos para crear el tipo de sensor.",
        });
    }

    try {
        const tipoSensor = await crearTipoSensorComoUsuarioServicio(validacion.data, usuarioAutenticado);

        return res.status(201).json({
            success: true,
            message: "Tipo de sensor creado correctamente.",
            data: tipoSensor,
        });
    } catch (error) {
        return next(error);
    }
};

export const obtenerTipoSensorPorIdControlador = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    const validacionId = esquemaIdTipoSensor.safeParse(req.params);

    if (!validacionId.success) {
        return res.status(400).json({
            success: false,
            message: validacionId.error.issues[0]?.message ?? "Identificador del tipo de sensor invalido.",
        });
    }

    try {
        const tipoSensor = await obtenerTipoSensorPorIdServicio(validacionId.data.id);

        return res.status(200).json({
            success: true,
            data: tipoSensor,
        });
    } catch (error) {
        return next(error);
    }
};

export const actualizarTipoSensorControlador = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    const validacionId = esquemaIdTipoSensor.safeParse(req.params);

    if (!validacionId.success) {
        return res.status(400).json({
            success: false,
            message: validacionId.error.issues[0]?.message ?? "Identificador del tipo de sensor invalido.",
        });
    }

    const validacionBody = esquemaActualizarTipoSensor.safeParse(req.body);

    if (!validacionBody.success) {
        return res.status(400).json({
            success: false,
            message: validacionBody.error.issues[0]?.message ?? "Datos invalidos para actualizar el tipo de sensor.",
        });
    }

    try {
        const tipoSensor = await actualizarTipoSensorServicio(validacionId.data.id, validacionBody.data);

        return res.status(200).json({
            success: true,
            message: "Tipo de sensor actualizado correctamente.",
            data: tipoSensor,
        });
    } catch (error) {
        return next(error);
    }
};

export const eliminarTipoSensorControlador = async (
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

    const validacionId = esquemaIdTipoSensor.safeParse(req.params);

    if (!validacionId.success) {
        return res.status(400).json({
            success: false,
            message: validacionId.error.issues[0]?.message ?? "Identificador del tipo de sensor invalido.",
        });
    }

    try {
        await eliminarTipoSensorComoUsuarioServicio(validacionId.data.id, usuarioAutenticado);

        return res.status(200).json({
            success: true,
            message: "Tipo de sensor eliminado correctamente.",
        });
    } catch (error) {
        return next(error);
    }
};