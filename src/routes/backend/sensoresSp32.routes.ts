import { Router } from "express";


const sensorsRoutesSp32 = Router();

sensorsRoutesSp32.post("/", (req, res) => {
    try {
        const { sensorId, value } = req.body;
        if (!sensorId || value === undefined) {
            return res.status(400).json({ 
                success: false,
                 message: "Faltan datos del sensor"
                });
        }
        
        
        return res.status(201).json({ success: true, message: "Sensor SP32 leído exitosamente" });
    } catch (error) {
        console.error("Error al leer el sensor SP32:", error);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: "Error al leer el sensor SP32" });
        }
    }
});

export default sensorsRoutesSp32;



