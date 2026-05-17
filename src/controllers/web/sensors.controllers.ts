import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import {
  actualizarSensorComoUsuarioServicio,
  crearSensorComoUsuarioServicio,
  eliminarSensorComoUsuarioServicio,
  obtenerSensorPorIdServicio,
  obtenerSensoresServicio,
} from "../../services/sensores.service";

const esquemaIdSensor = z.object({
  id: z.coerce.number().int("El identificador del sensor debe ser un numero entero.").positive("El sensor debe ser valido."),
});

const esquemaCrearSensor = z.object({
  codigo: z.string().trim().min(1, "El codigo es obligatorio.").max(60, "El codigo excede el limite permitido."),
  tipoSensorId: z.number().int("El tipo de sensor debe ser un entero.").positive("El tipo de sensor debe ser valido."),
  salaId: z.number().int("La sala debe ser un entero.").positive("La sala debe ser valida.").optional(),
  nodoRedId: z.number().int("El nodo de red debe ser un entero.").positive("El nodo de red debe ser valido.").optional(),
  pin: z.string().trim().max(30, "El pin excede el limite permitido.").optional(),
  modelo: z.string().trim().max(80, "El modelo excede el limite permitido.").optional(),
  estaActivo: z.boolean().optional(),
});

const esquemaActualizarSensor = z.object({
  codigo: z.string().trim().min(1, "El codigo es obligatorio.").max(60, "El codigo excede el limite permitido.").optional(),
  tipoSensorId: z.number().int("El tipo de sensor debe ser un entero.").positive("El tipo de sensor debe ser valido.").optional(),
  salaId: z.number().int("La sala debe ser un entero.").positive("La sala debe ser valida.").optional(),
  nodoRedId: z.number().int("El nodo de red debe ser un entero.").positive("El nodo de red debe ser valido.").optional(),
  pin: z.string().trim().max(30, "El pin excede el limite permitido.").optional(),
  modelo: z.string().trim().max(80, "El modelo excede el limite permitido.").optional(),
  estaActivo: z.boolean().optional(),
}).refine((datos) => Object.keys(datos).length > 0, {
  message: "Debes enviar al menos un campo para actualizar el sensor.",
});

export const crearSensor = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  if (!req.usuarioAutenticado) {
    return res.status(401).json({ success: false, message: "Debes iniciar sesion para crear recursos." });
  }

  const validacion = esquemaCrearSensor.safeParse(req.body);

  if (!validacion.success) {
    return res.status(400).json({
      success: false,
      message: validacion.error.issues[0]?.message ?? "Datos invalidos para crear el sensor.",
    });
  }

  try {
    const sensor = await crearSensorComoUsuarioServicio(validacion.data, req.usuarioAutenticado);

    return res.status(201).json({
      success: true,
      message: "Sensor creado correctamente.",
      data: sensor,
    });
  } catch (error) {
    return next(error);
  }
};

export const obtenerSensorPorId = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const validacionId = esquemaIdSensor.safeParse(req.params);

  if (!validacionId.success) {
    return res.status(400).json({
      success: false,
      message: validacionId.error.issues[0]?.message ?? "Identificador del sensor invalido.",
    });
  }

  try {
    const sensor = await obtenerSensorPorIdServicio(validacionId.data.id);

    return res.status(200).json({
      success: true,
      data: sensor,
    });
  } catch (error) {
    return next(error);
  }
};

export const obtenerSensores = async (_req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const sensores = await obtenerSensoresServicio();

    return res.status(200).json({
      success: true,
      data: sensores,
    });
  } catch (error) {
    return next(error);
  }
};

export const actualizarSensor = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  if (!req.usuarioAutenticado) {
    return res.status(401).json({ success: false, message: "Debes iniciar sesion para actualizar recursos." });
  }

  const validacionId = esquemaIdSensor.safeParse(req.params);

  if (!validacionId.success) {
    return res.status(400).json({
      success: false,
      message: validacionId.error.issues[0]?.message ?? "Identificador del sensor invalido.",
    });
  }

  const validacion = esquemaActualizarSensor.safeParse(req.body);

  if (!validacion.success) {
    return res.status(400).json({
      success: false,
      message: validacion.error.issues[0]?.message ?? "Datos invalidos para actualizar el sensor.",
    });
  }

  try {
    const sensor = await actualizarSensorComoUsuarioServicio(
      validacionId.data.id,
      validacion.data,
      req.usuarioAutenticado,
    );

    return res.status(200).json({
      success: true,
      message: "Sensor actualizado correctamente.",
      data: sensor,
    });
  } catch (error) {
    return next(error);
  }
};

export const eliminarSensor = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  if (!req.usuarioAutenticado) {
    return res.status(401).json({ success: false, message: "Debes iniciar sesion para eliminar recursos." });
  }

  const validacionId = esquemaIdSensor.safeParse(req.params);

  if (!validacionId.success) {
    return res.status(400).json({
      success: false,
      message: validacionId.error.issues[0]?.message ?? "Identificador del sensor invalido.",
    });
  }

  try {
    await eliminarSensorComoUsuarioServicio(validacionId.data.id, req.usuarioAutenticado);

    return res.status(200).json({
      success: true,
      message: "Sensor eliminado correctamente.",
    });
  } catch (error) {
    return next(error);
  }
};