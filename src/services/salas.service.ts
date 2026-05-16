import pool from "../config/db";

type DatosCrearSala = {
    codigo: string;
    nombre: string;
    areaFisica?: string;
    nivelCriticidad?: number;
    descripcion?: string;
};

type DatosActualizarSala = {
    codigo?: string;
    nombre?: string;
    areaFisica?: string;
    nivelCriticidad?: number;
    descripcion?: string;
};

type SalaCreada = {
    salaId: number;
    codigo: string;
    nombre: string;
    areaFisica: string | null;
    nivelCriticidad: number;
    descripcion: string | null;
    creadoEn: string;
    actualizadoEn: string;
};

type FilaSalaCreada = {
    sala_id: number;
    codigo: string;
    nombre: string;
    area_fisica: string | null;
    nivel_criticidad: number;
    descripcion: string | null;
    creado_en: Date;
    actualizado_en: Date;
};

const mapearSalaCreada = (fila: FilaSalaCreada): SalaCreada => ({
    salaId: fila.sala_id,
    codigo: fila.codigo,
    nombre: fila.nombre,
    areaFisica: fila.area_fisica,
    nivelCriticidad: fila.nivel_criticidad,
    descripcion: fila.descripcion,
    creadoEn: fila.creado_en.toISOString(),
    actualizadoEn: fila.actualizado_en.toISOString(),
});

const crearErrorHttp = (mensaje: string, estado: number): Error & { status: number } => {
    const error = new Error(mensaje) as Error & { status: number };
    error.status = estado;
    return error;
};

export const crearSalaServicio = async (datos: DatosCrearSala): Promise<SalaCreada> => {
    const resultado = await pool.query<FilaSalaCreada>(
        `
            INSERT INTO salas (codigo, nombre, area_fisica, nivel_criticidad, descripcion)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING sala_id, codigo, nombre, area_fisica, nivel_criticidad, descripcion, creado_en, actualizado_en
        `,
        [
            datos.codigo.trim(),
            datos.nombre.trim(),
            datos.areaFisica?.trim() || null,
            datos.nivelCriticidad ?? 1,
            datos.descripcion?.trim() || null,
        ],
    );

    const fila = resultado.rows[0];

    if (!fila) {
        throw new Error("No fue posible crear la sala.");
    }

    return mapearSalaCreada(fila);
};

export const obtenerSalaPorIdServicio = async (salaId: number): Promise<SalaCreada> => {
    const resultado = await pool.query<FilaSalaCreada>(
        `
            SELECT sala_id, codigo, nombre, area_fisica, nivel_criticidad, descripcion, creado_en, actualizado_en
            FROM salas
            WHERE sala_id = $1
            LIMIT 1
        `,
        [salaId],
    );

    const fila = resultado.rows[0];

    if (!fila) {
        throw crearErrorHttp("La sala no existe.", 404);
    }

    return mapearSalaCreada(fila);
};

export const actualizarSalaServicio = async (
    salaId: number,
    datos: DatosActualizarSala,
): Promise<SalaCreada> => {
    const columnas: string[] = [];
    const valores: Array<string | number | null> = [];

    if (datos.codigo !== undefined) {
        columnas.push(`codigo = $${columnas.length + 1}`);
        valores.push(datos.codigo.trim());
    }

    if (datos.nombre !== undefined) {
        columnas.push(`nombre = $${columnas.length + 1}`);
        valores.push(datos.nombre.trim());
    }

    if (datos.areaFisica !== undefined) {
        columnas.push(`area_fisica = $${columnas.length + 1}`);
        valores.push(datos.areaFisica.trim() || null);
    }

    if (datos.nivelCriticidad !== undefined) {
        columnas.push(`nivel_criticidad = $${columnas.length + 1}`);
        valores.push(datos.nivelCriticidad);
    }

    if (datos.descripcion !== undefined) {
        columnas.push(`descripcion = $${columnas.length + 1}`);
        valores.push(datos.descripcion.trim() || null);
    }

    const resultado = await pool.query<FilaSalaCreada>(
        `
            UPDATE salas
            SET ${columnas.join(", ")}, actualizado_en = NOW()
            WHERE sala_id = $${columnas.length + 1}
            RETURNING sala_id, codigo, nombre, area_fisica, nivel_criticidad, descripcion, creado_en, actualizado_en
        `,
        [...valores, salaId],
    );

    const fila = resultado.rows[0];

    if (!fila) {
        throw crearErrorHttp("La sala no existe.", 404);
    }

    return mapearSalaCreada(fila);
};

export const eliminarSalaServicio = async (salaId: number): Promise<void> => {
    const resultado = await pool.query<{ sala_id: number }>(
        `
            DELETE FROM salas
            WHERE sala_id = $1
            RETURNING sala_id
        `,
        [salaId],
    );

    if (!resultado.rows[0]) {
        throw crearErrorHttp("La sala no existe.", 404);
    }
};