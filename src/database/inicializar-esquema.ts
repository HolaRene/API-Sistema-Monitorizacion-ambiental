import { readdir, readFile } from "node:fs/promises";
import pool from "../config/db";

let promesaInicializacion: Promise<void> | null = null;

const obtenerArchivosSql = async (): Promise<string[]> => {
    const rutaDirectorio = new URL("./", import.meta.url);
    const nombresArchivos = await readdir(rutaDirectorio, { encoding: "utf-8" });

    return nombresArchivos
        .filter((nombreArchivo) => /^\d+_.*\.sql$/i.test(nombreArchivo))
        .sort((archivoA, archivoB) => archivoA.localeCompare(archivoB));
};

const ejecutarInicializacion = async (): Promise<void> => {
    const archivosSql = await obtenerArchivosSql();

    for (const archivoSql of archivosSql) {
        const rutaArchivo = new URL(`./${archivoSql}`, import.meta.url);
        const contenidoSql = await readFile(rutaArchivo, "utf-8");
        await pool.query(contenidoSql);
    }
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