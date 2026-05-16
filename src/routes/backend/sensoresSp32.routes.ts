import { Router } from "express";
import { leerSensorSp32 } from "../../controllers/sp32/sensors.controllers";


const sensorsRoutesSp32 = Router();

sensorsRoutesSp32.post("/", leerSensorSp32);

export default sensorsRoutesSp32;



