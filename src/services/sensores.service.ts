import pool from "../config/db";
import { asegurarEsquemaInicializado } from "../database/inicializar-esquema";
import {
    construirRestriccionPropietario,
    type ContextoAutorizacion,
    validarResultadoEliminacion,
} from "./autorizacion.service";

type DatosCrearSensor = {
    codigo: string;
    tipoSensorId: number;
    salaId?: number;
    nodoRedId?: number;
    pin?: string;
    modelo?: string;
    estaActivo?: boolean;
};

type DatosActualizarSensor = {
    codigo?: string;
    tipoSensorId?: number;
    salaId?: number;
    nodoRedId?: number;
    pin?: string;
    modelo?: string;
    estaActivo?: boolean;
};

type Sensor = {
    sensorId: number;
    codigo: string;
    tipoSensorId: number;
    salaId: number | null;
    nodoRedId: number | null;
    pin: string | null;
    modelo: string | null;
    estaActivo: boolean;
    creadoEn: string;
    actualizadoEn: string;
};

type DatosRegistrarLecturaSensor = {
    sensorId: number;
    valor: number;
};

type LecturaSensorRegistrada = {
    lecturaId: number;
    sensorId: number;
    nodoRedId: number | null;
    salaId: number | null;
    valor: number;
    unidadMedida: string | null;
    calidadDato: string;
    leidoEn: string;
};

type FilaSensor = {
    sensor_id: number;
    codigo: string;
    tipo_sensor_id: number;
    sala_id: number | null;
    nodo_red_id: number | null;
    pin: string | null;
    modelo: string | null;
    esta_activo: boolean;
    creado_en: Date;
    actualizado_en: Date;
};

type FilaSensorLectura = {
    sensor_id: number;
    nodo_red_id: number | null;
    sala_id: number | null;
    esta_activo: boolean;
    unidad_medida: string | null;
};

type FilaLecturaSensorRegistrada = {
    lectura_id: number;
    sensor_id: number;
    nodo_red_id: number | null;
    sala_id: number | null;
    valor: string;
    unidad_medida: string | null;
    calidad_dato: string;
    leido_en: Date;
};

const crearErrorHttp = (mensaje: string, estado: number): Error & { status: number } => {
    const error = new Error(mensaje) as Error & { status: number };
    error.status = estado;
    return error;
};

const mapearSensor = (fila: FilaSensor): Sensor => ({
    sensorId: fila.sensor_id,
    codigo: fila.codigo,
    tipoSensorId: fila.tipo_sensor_id,
    salaId: fila.sala_id,
    nodoRedId: fila.nodo_red_id,
    pin: fila.pin,
    modelo: fila.modelo,
    estaActivo: fila.esta_activo,
    creadoEn: fila.creado_en.toISOString(),
    actualizadoEn: fila.actualizado_en.toISOString(),
});

const mapearLecturaSensorRegistrada = (
    fila: FilaLecturaSensorRegistrada,
): LecturaSensorRegistrada => ({
    lecturaId: fila.lectura_id,
    sensorId: fila.sensor_id,
    nodoRedId: fila.nodo_red_id,
    salaId: fila.sala_id,
    valor: Number(fila.valor),
    unidadMedida: fila.unidad_medida,
    calidadDato: fila.calidad_dato,
    leidoEn: fila.leido_en.toISOString(),
});

export const crearSensorServicio = async (datos: DatosCrearSensor): Promise<Sensor> => {
    await asegurarEsquemaInicializado();

    const resultado = await pool.query<FilaSensor>(
        `
            INSERT INTO sensores (
                codigo,
                tipo_sensor_id,
                sala_id,
                nodo_red_id,
                pin,
                modelo,
                esta_activo,
                creado_por_usuario_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING
                sensor_id,
                codigo,
                tipo_sensor_id,
                sala_id,
                nodo_red_id,
                pin,
                modelo,
                esta_activo,
                creado_en,
                actualizado_en
        `,
        [
            datos.codigo.trim(),
            datos.tipoSensorId,
            datos.salaId ?? null,
            datos.nodoRedId ?? null,
            datos.pin?.trim() || null,
            datos.modelo?.trim() || null,
            datos.estaActivo ?? true,
            null,
        ],
    );

    const fila = resultado.rows[0];

    if (!fila) {
        throw crearErrorHttp("No fue posible crear el sensor.", 500);
    }

    return mapearSensor(fila);
};

export const crearSensorComoUsuarioServicio = async (
    datos: DatosCrearSensor,
    contexto: ContextoAutorizacion,
): Promise<Sensor> => {
    await asegurarEsquemaInicializado();

    const resultado = await pool.query<FilaSensor>(
        `
            INSERT INTO sensores (
                codigo,
                tipo_sensor_id,
                sala_id,
                nodo_red_id,
                pin,
                modelo,
                esta_activo,
                creado_por_usuario_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING
                sensor_id,
                codigo,
                tipo_sensor_id,
                sala_id,
                nodo_red_id,
                pin,
                modelo,
                esta_activo,
                creado_en,
                actualizado_en
        `,
        [
            datos.codigo.trim(),
            datos.tipoSensorId,
            datos.salaId ?? null,
            datos.nodoRedId ?? null,
            datos.pin?.trim() || null,
            datos.modelo?.trim() || null,
            datos.estaActivo ?? true,
            contexto.usuarioId,
        ],
    );

    const fila = resultado.rows[0];

    if (!fila) {
        throw crearErrorHttp("No fue posible crear el sensor.", 500);
    }

    return mapearSensor(fila);
};

export const obtenerSensorPorIdServicio = async (sensorId: number): Promise<Sensor> => {
    await asegurarEsquemaInicializado();

    const resultado = await pool.query<FilaSensor>(
        `
            SELECT
                sensor_id,
                codigo,
                tipo_sensor_id,
                sala_id,
                nodo_red_id,
                pin,
                modelo,
                esta_activo,
                creado_en,
                actualizado_en
            FROM sensores
            WHERE sensor_id = $1
            LIMIT 1
        `,
        [sensorId],
    );

    const fila = resultado.rows[0];

    if (!fila) {
        throw crearErrorHttp("El sensor no existe.", 404);
    }

    return mapearSensor(fila);
};

export const registrarLecturaSensorServicio = async (
    datos: DatosRegistrarLecturaSensor,
): Promise<LecturaSensorRegistrada> => {
    await asegurarEsquemaInicializado();

    const sensorResultado = await pool.query<FilaSensorLectura>(
        `
            SELECT
                s.sensor_id,
                s.nodo_red_id,
                s.sala_id,
                s.esta_activo,
                ts.unidad_medida
            FROM sensores s
            INNER JOIN tipo_sensores ts
                ON ts.tipo_sensor_id = s.tipo_sensor_id
            WHERE s.sensor_id = $1
            LIMIT 1
        `,
        [datos.sensorId],
    );

    const sensor = sensorResultado.rows[0];

    if (!sensor) {
        throw crearErrorHttp("El sensor no existe.", 404);
    }

    if (!sensor.esta_activo) {
        throw crearErrorHttp("El sensor no esta activo.", 400);
    }

    const lecturaResultado = await pool.query<FilaLecturaSensorRegistrada>(
        `
            INSERT INTO lecturas (
                sensor_id,
                nodo_red_id,
                sala_id,
                valor,
                unidad_medida,
                calidad_dato
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING
                lectura_id,
                sensor_id,
                nodo_red_id,
                sala_id,
                valor,
                unidad_medida,
                calidad_dato,
                leido_en
        `,
        [
            sensor.sensor_id,
            sensor.nodo_red_id,
            sensor.sala_id,
            datos.valor,
            sensor.unidad_medida,
            "ok",
        ],
    );

    const lectura = lecturaResultado.rows[0];

    if (!lectura) {
        throw crearErrorHttp("No fue posible registrar la lectura del sensor.", 500);
    }

    return mapearLecturaSensorRegistrada(lectura);
};

export const obtenerSensoresServicio = async (): Promise<Sensor[]> => {
    await asegurarEsquemaInicializado();

    const resultado = await pool.query<FilaSensor>(
        `
            SELECT
                sensor_id,
                codigo,
                tipo_sensor_id,
                sala_id,
                nodo_red_id,
                pin,
                modelo,
                esta_activo,
                creado_en,
                actualizado_en
            FROM sensores
            ORDER BY sensor_id DESC
        `,
    );

    return resultado.rows.map(mapearSensor);
};

export const actualizarSensorServicio = async (
    sensorId: number,
    datos: DatosActualizarSensor,
): Promise<Sensor> => {
    await asegurarEsquemaInicializado();

    const columnas: string[] = [];
    const valores: Array<string | number | boolean | null> = [];

    if (datos.codigo !== undefined) {
        columnas.push(`codigo = $${columnas.length + 1}`);
        valores.push(datos.codigo.trim());
    }

    if (datos.tipoSensorId !== undefined) {
        columnas.push(`tipo_sensor_id = $${columnas.length + 1}`);
        valores.push(datos.tipoSensorId);
    }

    if (datos.salaId !== undefined) {
        columnas.push(`sala_id = $${columnas.length + 1}`);
        valores.push(datos.salaId);
    }

    if (datos.nodoRedId !== undefined) {
        columnas.push(`nodo_red_id = $${columnas.length + 1}`);
        valores.push(datos.nodoRedId);
    }

    if (datos.pin !== undefined) {
        columnas.push(`pin = $${columnas.length + 1}`);
        valores.push(datos.pin.trim() || null);
    }

    if (datos.modelo !== undefined) {
        columnas.push(`modelo = $${columnas.length + 1}`);
        valores.push(datos.modelo.trim() || null);
    }

    if (datos.estaActivo !== undefined) {
        columnas.push(`esta_activo = $${columnas.length + 1}`);
        valores.push(datos.estaActivo);
    }

    const resultado = await pool.query<FilaSensor>(
        `
            UPDATE sensores
            SET ${columnas.join(", ")}, actualizado_en = NOW()
            WHERE sensor_id = $${columnas.length + 1}
            RETURNING
                sensor_id,
                codigo,
                tipo_sensor_id,
                sala_id,
                nodo_red_id,
                pin,
                modelo,
                esta_activo,
                creado_en,
                actualizado_en
        `,
        [...valores, sensorId],
    );

    const fila = resultado.rows[0];

    if (!fila) {
        throw crearErrorHttp("El sensor no existe.", 404);
    }

    return mapearSensor(fila);
};

export const actualizarSensorComoUsuarioServicio = async (
    sensorId: number,
    datos: DatosActualizarSensor,
    contexto: ContextoAutorizacion,
): Promise<Sensor> => {
    await asegurarEsquemaInicializado();

    const columnas: string[] = [];
    const valores: Array<string | number | boolean | null> = [];

    if (datos.codigo !== undefined) {
        columnas.push(`codigo = $${columnas.length + 1}`);
        valores.push(datos.codigo.trim());
    }

    if (datos.tipoSensorId !== undefined) {
        columnas.push(`tipo_sensor_id = $${columnas.length + 1}`);
        valores.push(datos.tipoSensorId);
    }

    if (datos.salaId !== undefined) {
        columnas.push(`sala_id = $${columnas.length + 1}`);
        valores.push(datos.salaId);
    }

    if (datos.nodoRedId !== undefined) {
        columnas.push(`nodo_red_id = $${columnas.length + 1}`);
        valores.push(datos.nodoRedId);
    }

    if (datos.pin !== undefined) {
        columnas.push(`pin = $${columnas.length + 1}`);
        valores.push(datos.pin.trim() || null);
    }

    if (datos.modelo !== undefined) {
        columnas.push(`modelo = $${columnas.length + 1}`);
        valores.push(datos.modelo.trim() || null);
    }

    if (datos.estaActivo !== undefined) {
        columnas.push(`esta_activo = $${columnas.length + 1}`);
        valores.push(datos.estaActivo);
    }

    const restriccion = construirRestriccionPropietario(contexto, "creado_por_usuario_id", columnas.length + 2);
    const resultado = await pool.query<FilaSensor>(
        `
            UPDATE sensores
            SET ${columnas.join(", ")}, actualizado_en = NOW()
            WHERE sensor_id = $${columnas.length + 1}${restriccion.clausulaSql}
            RETURNING
                sensor_id,
                codigo,
                tipo_sensor_id,
                sala_id,
                nodo_red_id,
                pin,
                modelo,
                esta_activo,
                creado_en,
                actualizado_en
        `,
        [...valores, sensorId, ...restriccion.valores],
    );

    const fila = resultado.rows[0];

    if (!fila) {
        if (contexto.rol !== "admin") {
            throw crearErrorHttp("No puedes actualizar un sensor creado por otro usuario.", 403);
        }

        throw crearErrorHttp("El sensor no existe.", 404);
    }

    return mapearSensor(fila);
};

export const eliminarSensorServicio = async (sensorId: number): Promise<void> => {
    await asegurarEsquemaInicializado();

    const resultado = await pool.query<{ sensor_id: number }>(
        `
            DELETE FROM sensores
            WHERE sensor_id = $1
            RETURNING sensor_id
        `,
        [sensorId],
    );

    if (!resultado.rows[0]) {
        throw crearErrorHttp("El sensor no existe.", 404);
    }
};

export const eliminarSensorComoUsuarioServicio = async (
    sensorId: number,
    contexto: ContextoAutorizacion,
): Promise<void> => {
    await asegurarEsquemaInicializado();

    const restriccion = construirRestriccionPropietario(contexto, "creado_por_usuario_id", 2);
    const resultado = await pool.query<{ sensor_id: number }>(
        `
            DELETE FROM sensores
            WHERE sensor_id = $1${restriccion.clausulaSql}
            RETURNING sensor_id
        `,
        [sensorId, ...restriccion.valores],
    );

    validarResultadoEliminacion(
        resultado.rows[0],
        contexto,
        "El sensor no existe.",
        "No puedes eliminar un sensor creado por otro usuario.",
    );
};