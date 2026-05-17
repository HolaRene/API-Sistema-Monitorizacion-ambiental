import pool from "../config/db";
import { asegurarEsquemaInicializado } from "../database/inicializar-esquema";
import {
    construirRestriccionPropietario,
    type ContextoAutorizacion,
    validarResultadoEliminacion,
} from "./autorizacion.service";

type TipoActuador = "led" | "buzzer" | "ventilador";

type DatosCrearActuador = {
    codigo: string;
    tipoActuador: TipoActuador;
    salaId?: number;
    nodoRedId?: number;
    pin?: string;
    modelo?: string;
    estaActivo?: boolean;
};

type DatosActualizarActuador = {
    codigo?: string;
    tipoActuador?: TipoActuador;
    salaId?: number;
    nodoRedId?: number;
    pin?: string;
    modelo?: string;
    estaActivo?: boolean;
};

type ActuadorCreado = {
    actuadorId: number;
    codigo: string;
    tipoActuador: TipoActuador;
    salaId: number | null;
    nodoRedId: number | null;
    pin: string | null;
    modelo: string | null;
    estaActivo: boolean;
    creadoEn: string;
    actualizadoEn: string;
};

type FilaActuadorCreado = {
    actuador_id: number;
    codigo: string;
    tipo_actuador: TipoActuador;
    sala_id: number | null;
    nodo_red_id: number | null;
    pin: string | null;
    modelo: string | null;
    esta_activo: boolean;
    creado_en: Date;
    actualizado_en: Date;
};

const mapearActuadorCreado = (fila: FilaActuadorCreado): ActuadorCreado => ({
    actuadorId: fila.actuador_id,
    codigo: fila.codigo,
    tipoActuador: fila.tipo_actuador,
    salaId: fila.sala_id,
    nodoRedId: fila.nodo_red_id,
    pin: fila.pin,
    modelo: fila.modelo,
    estaActivo: fila.esta_activo,
    creadoEn: fila.creado_en.toISOString(),
    actualizadoEn: fila.actualizado_en.toISOString(),
});

const crearErrorHttp = (mensaje: string, estado: number): Error & { status: number } => {
    const error = new Error(mensaje) as Error & { status: number };
    error.status = estado;
    return error;
};

export const crearActuadorServicio = async (
    datos: DatosCrearActuador,
): Promise<ActuadorCreado> => {
    await asegurarEsquemaInicializado();

    const resultado = await pool.query<FilaActuadorCreado>(
        `
            INSERT INTO actuadores (codigo, tipo_actuador, sala_id, nodo_red_id, pin, modelo, esta_activo, creado_por_usuario_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING actuador_id, codigo, tipo_actuador, sala_id, nodo_red_id, pin, modelo, esta_activo, creado_en, actualizado_en
        `,
        [
            datos.codigo.trim(),
            datos.tipoActuador,
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
        throw new Error("No fue posible crear el actuador.");
    }

    return mapearActuadorCreado(fila);
};

export const obtenerActuadorPorIdServicio = async (
    actuadorId: number,
): Promise<ActuadorCreado> => {
    await asegurarEsquemaInicializado();

    const resultado = await pool.query<FilaActuadorCreado>(
        `
            SELECT actuador_id, codigo, tipo_actuador, sala_id, nodo_red_id, pin, modelo, esta_activo, creado_en, actualizado_en
            FROM actuadores
            WHERE actuador_id = $1
            LIMIT 1
        `,
        [actuadorId],
    );

    const fila = resultado.rows[0];

    if (!fila) {
        throw crearErrorHttp("El actuador no existe.", 404);
    }

    return mapearActuadorCreado(fila);
};

export const actualizarActuadorServicio = async (
    actuadorId: number,
    datos: DatosActualizarActuador,
): Promise<ActuadorCreado> => {
    await asegurarEsquemaInicializado();

    const columnas: string[] = [];
    const valores: Array<string | number | boolean | null> = [];

    if (datos.codigo !== undefined) {
        columnas.push(`codigo = $${columnas.length + 1}`);
        valores.push(datos.codigo.trim());
    }

    if (datos.tipoActuador !== undefined) {
        columnas.push(`tipo_actuador = $${columnas.length + 1}`);
        valores.push(datos.tipoActuador);
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

    const resultado = await pool.query<FilaActuadorCreado>(
        `
            UPDATE actuadores
            SET ${columnas.join(", ")}, actualizado_en = NOW()
            WHERE actuador_id = $${columnas.length + 1}
            RETURNING actuador_id, codigo, tipo_actuador, sala_id, nodo_red_id, pin, modelo, esta_activo, creado_en, actualizado_en
        `,
        [...valores, actuadorId],
    );

    const fila = resultado.rows[0];

    if (!fila) {
        throw crearErrorHttp("El actuador no existe.", 404);
    }

    return mapearActuadorCreado(fila);
};

export const crearActuadorComoUsuarioServicio = async (
    datos: DatosCrearActuador,
    contexto: ContextoAutorizacion,
): Promise<ActuadorCreado> => {
    await asegurarEsquemaInicializado();

    const resultado = await pool.query<FilaActuadorCreado>(
        `
            INSERT INTO actuadores (codigo, tipo_actuador, sala_id, nodo_red_id, pin, modelo, esta_activo, creado_por_usuario_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING actuador_id, codigo, tipo_actuador, sala_id, nodo_red_id, pin, modelo, esta_activo, creado_en, actualizado_en
        `,
        [
            datos.codigo.trim(),
            datos.tipoActuador,
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
        throw new Error("No fue posible crear el actuador.");
    }

    return mapearActuadorCreado(fila);
};

export const eliminarActuadorServicio = async (actuadorId: number): Promise<void> => {
    await asegurarEsquemaInicializado();

    const resultado = await pool.query<{ actuador_id: number }>(
        `
            DELETE FROM actuadores
            WHERE actuador_id = $1
            RETURNING actuador_id
        `,
        [actuadorId],
    );

    if (!resultado.rows[0]) {
        throw crearErrorHttp("El actuador no existe.", 404);
    }
};

export const eliminarActuadorComoUsuarioServicio = async (
    actuadorId: number,
    contexto: ContextoAutorizacion,
): Promise<void> => {
    await asegurarEsquemaInicializado();

    const restriccion = construirRestriccionPropietario(contexto, "creado_por_usuario_id", 2);
    const resultado = await pool.query<{ actuador_id: number }>(
        `
            DELETE FROM actuadores
            WHERE actuador_id = $1${restriccion.clausulaSql}
            RETURNING actuador_id
        `,
        [actuadorId, ...restriccion.valores],
    );

    validarResultadoEliminacion(
        resultado.rows[0],
        contexto,
        "El actuador no existe.",
        "No puedes eliminar un actuador creado por otro usuario.",
    );
};