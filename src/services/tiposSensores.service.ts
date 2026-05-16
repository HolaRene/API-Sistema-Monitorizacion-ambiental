import pool from "../config/db";

type DatosCrearTipoSensor = {
    codigo: string;
    nombre: string;
    categoria: string;
    unidadMedida: string;
    descripcion?: string;
};

type DatosActualizarTipoSensor = {
    codigo?: string;
    nombre?: string;
    categoria?: string;
    unidadMedida?: string;
    descripcion?: string;
};

type TipoSensorCreado = {
    tipoSensorId: number;
    codigo: string;
    nombre: string;
    categoria: string;
    unidadMedida: string;
    descripcion: string | null;
    creadoEn: string;
    actualizadoEn: string;
};

type FilaTipoSensorCreado = {
    tipo_sensor_id: number;
    codigo: string;
    nombre: string;
    categoria: string;
    unidad_medida: string;
    descripcion: string | null;
    creado_en: Date;
    actualizado_en: Date;
};

const mapearTipoSensorCreado = (fila: FilaTipoSensorCreado): TipoSensorCreado => ({
    tipoSensorId: fila.tipo_sensor_id,
    codigo: fila.codigo,
    nombre: fila.nombre,
    categoria: fila.categoria,
    unidadMedida: fila.unidad_medida,
    descripcion: fila.descripcion,
    creadoEn: fila.creado_en.toISOString(),
    actualizadoEn: fila.actualizado_en.toISOString(),
});

const crearErrorHttp = (mensaje: string, estado: number): Error & { status: number } => {
    const error = new Error(mensaje) as Error & { status: number };
    error.status = estado;
    return error;
};

export const crearTipoSensorServicio = async (
    datos: DatosCrearTipoSensor,
): Promise<TipoSensorCreado> => {
    const resultado = await pool.query<FilaTipoSensorCreado>(
        `
            INSERT INTO tipo_sensores (codigo, nombre, categoria, unidad_medida, descripcion)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING tipo_sensor_id, codigo, nombre, categoria, unidad_medida, descripcion, creado_en, actualizado_en
        `,
        [
            datos.codigo.trim(),
            datos.nombre.trim(),
            datos.categoria.trim(),
            datos.unidadMedida.trim(),
            datos.descripcion?.trim() || null,
        ],
    );

    const fila = resultado.rows[0];

    if (!fila) {
        throw new Error("No fue posible crear el tipo de sensor.");
    }

    return mapearTipoSensorCreado(fila);
};

export const obtenerTipoSensorPorIdServicio = async (
    tipoSensorId: number,
): Promise<TipoSensorCreado> => {
    const resultado = await pool.query<FilaTipoSensorCreado>(
        `
            SELECT tipo_sensor_id, codigo, nombre, categoria, unidad_medida, descripcion, creado_en, actualizado_en
            FROM tipo_sensores
            WHERE tipo_sensor_id = $1
            LIMIT 1
        `,
        [tipoSensorId],
    );

    const fila = resultado.rows[0];

    if (!fila) {
        throw crearErrorHttp("El tipo de sensor no existe.", 404);
    }

    return mapearTipoSensorCreado(fila);
};

export const actualizarTipoSensorServicio = async (
    tipoSensorId: number,
    datos: DatosActualizarTipoSensor,
): Promise<TipoSensorCreado> => {
    const columnas: string[] = [];
    const valores: Array<string | null> = [];

    if (datos.codigo !== undefined) {
        columnas.push(`codigo = $${columnas.length + 1}`);
        valores.push(datos.codigo.trim());
    }

    if (datos.nombre !== undefined) {
        columnas.push(`nombre = $${columnas.length + 1}`);
        valores.push(datos.nombre.trim());
    }

    if (datos.categoria !== undefined) {
        columnas.push(`categoria = $${columnas.length + 1}`);
        valores.push(datos.categoria.trim());
    }

    if (datos.unidadMedida !== undefined) {
        columnas.push(`unidad_medida = $${columnas.length + 1}`);
        valores.push(datos.unidadMedida.trim());
    }

    if (datos.descripcion !== undefined) {
        columnas.push(`descripcion = $${columnas.length + 1}`);
        valores.push(datos.descripcion.trim() || null);
    }

    const resultado = await pool.query<FilaTipoSensorCreado>(
        `
            UPDATE tipo_sensores
            SET ${columnas.join(", ")}, actualizado_en = NOW()
            WHERE tipo_sensor_id = $${columnas.length + 1}
            RETURNING tipo_sensor_id, codigo, nombre, categoria, unidad_medida, descripcion, creado_en, actualizado_en
        `,
        [...valores, String(tipoSensorId)],
    );

    const fila = resultado.rows[0];

    if (!fila) {
        throw crearErrorHttp("El tipo de sensor no existe.", 404);
    }

    return mapearTipoSensorCreado(fila);
};

export const eliminarTipoSensorServicio = async (tipoSensorId: number): Promise<void> => {
    const resultado = await pool.query<{ tipo_sensor_id: number }>(
        `
            DELETE FROM tipo_sensores
            WHERE tipo_sensor_id = $1
            RETURNING tipo_sensor_id
        `,
        [tipoSensorId],
    );

    if (!resultado.rows[0]) {
        throw crearErrorHttp("El tipo de sensor no existe.", 404);
    }
};