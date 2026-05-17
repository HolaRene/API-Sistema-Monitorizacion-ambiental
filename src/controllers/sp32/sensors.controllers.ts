import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { registrarLecturaSensorServicio } from "../../services/sensores.service";

const esquemaLecturaSp32 = z.object({
    sensorId: z.coerce.number().int("El sensor debe ser un numero entero.").positive("El sensor debe ser valido."),
    value: z.number("Debes enviar un valor numerico para la lectura."),
});

export const leerSensorSp32 = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> => {
    const validacion = esquemaLecturaSp32.safeParse(req.body);

    if (!validacion.success) {
        return res.status(400).json({
            success: false,
            message: validacion.error.issues[0]?.message ?? "Faltan datos del sensor.",
        });
    }

    try {
        const lectura = await registrarLecturaSensorServicio({
            sensorId: validacion.data.sensorId,
            valor: validacion.data.value,
        });

        return res.status(201).json({
            success: true,
            message: "Sensor SP32 leido exitosamente.",
            data: lectura,
        });
    } catch (error) {
        return next(error);
    }
};