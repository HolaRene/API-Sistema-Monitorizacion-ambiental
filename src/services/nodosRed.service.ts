import pool from "../config/db";
import { asegurarEsquemaInicializado } from "../database/inicializar-esquema";
import {
    construirRestriccionPropietario,
    type ContextoAutorizacion,
    validarResultadoEliminacion,
} from "./autorizacion.service";

type DatosCrearNodoRed = {
    nodeId: string;
    salaId?: number;
    ip?: string;
    macAddress?: string;
    firmwareVersion?: string;
    ultimoPingEn?: string;
    estaActivo?: boolean;
};

type DatosActualizarNodoRed = {
    nodeId?: string;
    salaId?: number;
    ip?: string;
    macAddress?: string;
    firmwareVersion?: string;
    ultimoPingEn?: string;
    estaActivo?: boolean;
};

type NodoRed = {
    nodoRedId: number;
    nodeId: string;
    salaId: number | null;
    ip: string | null;
    macAddress: string | null;
    firmwareVersion: string | null;
    ultimoPingEn: string | null;
    estaActivo: boolean;
    creadoEn: string;
    actualizadoEn: string;
};

type FilaNodoRed = {
    nodo_red_id: number;
    node_id: string;
    sala_id: number | null;
    ip: string | null;
    mac_address: string | null;
    firmware_version: string | null;
    ultimo_ping_en: Date | null;
    esta_activo: boolean;
    creado_en: Date;
    actualizado_en: Date;
};

const crearErrorHttp = (mensaje: string, estado: number): Error & { status: number } => {
    const error = new Error(mensaje) as Error & { status: number };
    error.status = estado;
    return error;
};

const mapearNodoRed = (fila: FilaNodoRed): NodoRed => ({
    nodoRedId: fila.nodo_red_id,
    nodeId: fila.node_id,
    salaId: fila.sala_id,
    ip: fila.ip,
    macAddress: fila.mac_address,
    firmwareVersion: fila.firmware_version,
    ultimoPingEn: fila.ultimo_ping_en ? fila.ultimo_ping_en.toISOString() : null,
    estaActivo: fila.esta_activo,
    creadoEn: fila.creado_en.toISOString(),
    actualizadoEn: fila.actualizado_en.toISOString(),
});

export const crearNodoRedServicio = async (datos: DatosCrearNodoRed): Promise<NodoRed> => {
    await asegurarEsquemaInicializado();

    const resultado = await pool.query<FilaNodoRed>(
        `
            INSERT INTO nodos_red (node_id, sala_id, ip, mac_address, firmware_version, ultimo_ping_en, esta_activo, creado_por_usuario_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING nodo_red_id, node_id, sala_id, ip, mac_address, firmware_version, ultimo_ping_en, esta_activo, creado_en, actualizado_en
        `,
        [
            datos.nodeId.trim(),
            datos.salaId ?? null,
            datos.ip?.trim() || null,
            datos.macAddress?.trim() || null,
            datos.firmwareVersion?.trim() || null,
            datos.ultimoPingEn ?? null,
            datos.estaActivo ?? true,
            null,
        ],
    );

    const fila = resultado.rows[0];

    if (!fila) {
        throw new Error("No fue posible crear el nodo de red.");
    }

    return mapearNodoRed(fila);
};

export const crearNodoRedComoUsuarioServicio = async (
    datos: DatosCrearNodoRed,
    contexto: ContextoAutorizacion,
): Promise<NodoRed> => {
    await asegurarEsquemaInicializado();

    const resultado = await pool.query<FilaNodoRed>(
        `
            INSERT INTO nodos_red (node_id, sala_id, ip, mac_address, firmware_version, ultimo_ping_en, esta_activo, creado_por_usuario_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING nodo_red_id, node_id, sala_id, ip, mac_address, firmware_version, ultimo_ping_en, esta_activo, creado_en, actualizado_en
        `,
        [
            datos.nodeId.trim(),
            datos.salaId ?? null,
            datos.ip?.trim() || null,
            datos.macAddress?.trim() || null,
            datos.firmwareVersion?.trim() || null,
            datos.ultimoPingEn ?? null,
            datos.estaActivo ?? true,
            contexto.usuarioId,
        ],
    );

    const fila = resultado.rows[0];

    if (!fila) {
        throw new Error("No fue posible crear el nodo de red.");
    }

    return mapearNodoRed(fila);
};

export const obtenerNodoRedPorIdServicio = async (nodoRedId: number): Promise<NodoRed> => {
    await asegurarEsquemaInicializado();

    const resultado = await pool.query<FilaNodoRed>(
        `
            SELECT nodo_red_id, node_id, sala_id, ip, mac_address, firmware_version, ultimo_ping_en, esta_activo, creado_en, actualizado_en
            FROM nodos_red
            WHERE nodo_red_id = $1
            LIMIT 1
        `,
        [nodoRedId],
    );

    const fila = resultado.rows[0];

    if (!fila) {
        throw crearErrorHttp("El nodo de red no existe.", 404);
    }

    return mapearNodoRed(fila);
};

export const actualizarNodoRedServicio = async (
    nodoRedId: number,
    datos: DatosActualizarNodoRed,
): Promise<NodoRed> => {
    await asegurarEsquemaInicializado();

    const columnas: string[] = [];
    const valores: Array<string | number | boolean | null> = [];

    if (datos.nodeId !== undefined) {
        columnas.push(`node_id = $${columnas.length + 1}`);
        valores.push(datos.nodeId.trim());
    }

    if (datos.salaId !== undefined) {
        columnas.push(`sala_id = $${columnas.length + 1}`);
        valores.push(datos.salaId);
    }

    if (datos.ip !== undefined) {
        columnas.push(`ip = $${columnas.length + 1}`);
        valores.push(datos.ip.trim() || null);
    }

    if (datos.macAddress !== undefined) {
        columnas.push(`mac_address = $${columnas.length + 1}`);
        valores.push(datos.macAddress.trim() || null);
    }

    if (datos.firmwareVersion !== undefined) {
        columnas.push(`firmware_version = $${columnas.length + 1}`);
        valores.push(datos.firmwareVersion.trim() || null);
    }

    if (datos.ultimoPingEn !== undefined) {
        columnas.push(`ultimo_ping_en = $${columnas.length + 1}`);
        valores.push(datos.ultimoPingEn || null);
    }

    if (datos.estaActivo !== undefined) {
        columnas.push(`esta_activo = $${columnas.length + 1}`);
        valores.push(datos.estaActivo);
    }

    const resultado = await pool.query<FilaNodoRed>(
        `
            UPDATE nodos_red
            SET ${columnas.join(", ")}, actualizado_en = NOW()
            WHERE nodo_red_id = $${columnas.length + 1}
            RETURNING nodo_red_id, node_id, sala_id, ip, mac_address, firmware_version, ultimo_ping_en, esta_activo, creado_en, actualizado_en
        `,
        [...valores, nodoRedId],
    );

    const fila = resultado.rows[0];

    if (!fila) {
        throw crearErrorHttp("El nodo de red no existe.", 404);
    }

    return mapearNodoRed(fila);
};

export const eliminarNodoRedServicio = async (nodoRedId: number): Promise<void> => {
    await asegurarEsquemaInicializado();

    const resultado = await pool.query<{ nodo_red_id: number }>(
        `
            DELETE FROM nodos_red
            WHERE nodo_red_id = $1
            RETURNING nodo_red_id
        `,
        [nodoRedId],
    );

    if (!resultado.rows[0]) {
        throw crearErrorHttp("El nodo de red no existe.", 404);
    }
};

export const eliminarNodoRedComoUsuarioServicio = async (
    nodoRedId: number,
    contexto: ContextoAutorizacion,
): Promise<void> => {
    await asegurarEsquemaInicializado();

    const restriccion = construirRestriccionPropietario(contexto, "creado_por_usuario_id", 2);
    const resultado = await pool.query<{ nodo_red_id: number }>(
        `
            DELETE FROM nodos_red
            WHERE nodo_red_id = $1${restriccion.clausulaSql}
            RETURNING nodo_red_id
        `,
        [nodoRedId, ...restriccion.valores],
    );

    validarResultadoEliminacion(
        resultado.rows[0],
        contexto,
        "El nodo de red no existe.",
        "No puedes eliminar un nodo de red creado por otro usuario.",
    );
};