import { Request, Response  } from "express";

export const crearSensor = (req: Request, res: Response) => {
  // Aquí puedes agregar la lógica para manejar la creación de un nuevo sensor
  res.status(201).json({ message: "Sensor creado exitosamente" });
}

export const obtenerSensorPorId = (req: Request, res: Response) => {
  const id = req.params.id;
  res.status(200).json({ message: `Sensor ${id} obtenido exitosamente` });
}

export const obtenerSensores = (req: Request, res: Response) => {
  res.status(200).json({ message: "Lista de sensores" });
}

export const eliminarSensor = (req: Request, res: Response) => {
  const id = req.params.id;
  res.status(200).json({ message: `Sensor ${id} eliminado exitosamente` });
}