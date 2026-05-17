import { Request, Response  } from "express";

export const crearSensor = (req: Request, res: Response) => {
  if (!req.usuarioAutenticado) {
    return res.status(401).json({ success: false, message: "Debes iniciar sesion para crear recursos." });
  }

  // Aquí puedes agregar la lógica para manejar la creación de un nuevo sensor
  return res.status(201).json({ message: "Sensor creado exitosamente" });
}

export const obtenerSensorPorId = (req: Request, res: Response) => {
  const id = req.params.id;
  res.status(200).json({ message: `Sensor ${id} obtenido exitosamente` });
}

export const obtenerSensores = (req: Request, res: Response) => {
  res.status(200).json({ message: "Lista de sensores" });
}

export const eliminarSensor = (req: Request, res: Response) => {
  if (!req.usuarioAutenticado) {
    return res.status(401).json({ success: false, message: "Debes iniciar sesion para eliminar recursos." });
  }

  const id = req.params.id;
  return res.status(200).json({ message: `Sensor ${id} eliminado exitosamente` });
}