import { Request, Response } from "express";

const leerSensorSp32 = (req: Request, res: Response) => {
  // Aquí puedes agregar la lógica para manejar la creación de un nuevo sensor
  res.status(201).json({ message: "Leyendo sensor de SP32" });
}