import { Request, Response } from "express";

export const leerSensorSp32 = (req: Request, res: Response) => {
    try {
        const { sensorId, value } = req.body;
        if (!sensorId || value === undefined) {
            return res.status(400).json({ 
                success: false,
                 message: "Faltan datos del sensor"
                });
        }
               
        return res.status(201).json({ 
          success: true,
          message: "Sensor SP32 leído exitosamente",
          data: {
            sensorId,
            value
          }
         });
    } catch (error) {
        console.error("Error al leer el sensor SP32:", error);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: "Error al leer el sensor SP32" });
        }
    }
}