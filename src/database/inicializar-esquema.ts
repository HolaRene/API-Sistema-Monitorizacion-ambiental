import { readFile } from "node:fs/promises";
import pool from "../config/db";

let promesaInicializacion: Promise<void> | null = null;

const cargarEsquemaSql = async (): Promise<string> => {
    const rutaEsquema = new URL("./001_esquema_iot.sql", import.meta.url);
    return readFile(rutaEsquema, "utf-8");
};

const ejecutarInicializacion = async (): Promise<void> => {
    const esquemaSql = await cargarEsquemaSql();
    await pool.query(esquemaSql);
};

export const asegurarEsquemaInicializado = async (): Promise<void> => {
    if (!promesaInicializacion) {
        promesaInicializacion = ejecutarInicializacion().catch((error: unknown) => {
            promesaInicializacion = null;
            throw error;
        });
    }

    await promesaInicializacion;
};