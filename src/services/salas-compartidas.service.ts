import pool from "../config/db";
import { asegurarEsquemaInicializado } from "../database/inicializar-esquema";
import type { ContextoAutorizacion } from "./autorizacion.service";

type TipoAccesoSala = "demo" | "compartido";

type DatosCompartirSala = {
    salaId: number;
    usuarioDestinoId: number;
    puedeVer?: boolean;
    puedeControlar?: boolean;
    tipoAcceso?: TipoAccesoSala;
    expiraEn?: string | null;
};

type AccesoSalaCompartida = {
    usuarioSalaId: number;
    usuarioId: number;
    salaId: number;
    compartidoPorUsuarioId: number | null;
    tipoAcceso: TipoAccesoSala;
    puedeVer: boolean;
    puedeControlar: boolean;
    expiraEn: string | null;
    creadoEn: string;
    actualizadoEn: string;
};

type FilaAccesoSalaCompartida = {
    usuario_sala_id: number;
    usuario_id: number;
    sala_id: number;
    compartido_por_usuario_id: number | null;
    tipo_acceso: TipoAccesoSala;
    puede_ver: boolean;
    puede_controlar: boolean;
    expira_en: Date | null;
    creado_en: Date;
    actualizado_en: Date;
};

type FilaSalaPropietario = {
    sala_id: number;
    creado_por_usuario_id: number | null;
};

type FilaUsuario = {
    usuario_id: number;
    esta_activo: boolean;
};

const crearErrorHttp = (mensaje: string, estado: number): Error & { status: number } => {
    const error = new Error(mensaje) as Error & { status: number };
    error.status = estado;
    return error;
};

const mapearAccesoSalaCompartida = (
    fila: FilaAccesoSalaCompartida,
): AccesoSalaCompartida => ({
    usuarioSalaId: fila.usuario_sala_id,
    usuarioId: fila.usuario_id,
    salaId: fila.sala_id,
    compartidoPorUsuarioId: fila.compartido_por_usuario_id,
    tipoAcceso: fila.tipo_acceso,
    puedeVer: fila.puede_ver,
    puedeControlar: fila.puede_controlar,
    expiraEn: fila.expira_en ? fila.expira_en.toISOString() : null,
    creadoEn: fila.creado_en.toISOString(),
    actualizadoEn: fila.actualizado_en.toISOString(),
});

const obtenerSalaParaAutorizacion = async (salaId: number): Promise<FilaSalaPropietario> => {
    const resultado = await pool.query<FilaSalaPropietario>(
        `
            SELECT sala_id, creado_por_usuario_id
            FROM salas
            WHERE sala_id = $1
            LIMIT 1
        `,
        [salaId],
    );

    const sala = resultado.rows[0];

    if (!sala) {
        throw crearErrorHttp("La sala no existe.", 404);
    }

    return sala;
};

const validarDestinoComparticion = async (usuarioDestinoId: number): Promise<void> => {
    const resultado = await pool.query<FilaUsuario>(
        `
            SELECT usuario_id, esta_activo
            FROM usuarios
            WHERE usuario_id = $1
            LIMIT 1
        `,
        [usuarioDestinoId],
    );

    const usuario = resultado.rows[0];

    if (!usuario) {
        throw crearErrorHttp("El usuario destino no existe.", 404);
    }

    if (!usuario.esta_activo) {
        throw crearErrorHttp("No puedes compartir con un usuario inactivo.", 400);
    }
};

const validarPermisoCompartirSala = (
    sala: FilaSalaPropietario,
    contexto: ContextoAutorizacion,
): void => {
    if (contexto.rol === "admin") {
        return;
    }

    if (sala.creado_por_usuario_id !== contexto.usuarioId) {
        throw crearErrorHttp("Solo el propietario o un admin pueden compartir esta sala.", 403);
    }
};

const normalizarExpiracion = (expiraEn?: string | null): Date | null => {
    if (!expiraEn) {
        return null;
    }

    const fecha = new Date(expiraEn);

    if (Number.isNaN(fecha.getTime())) {
        throw crearErrorHttp("La fecha de expiracion no es valida.", 400);
    }

    return fecha;
};

// Uso futuro: llamar este servicio desde POST /salas/:id/compartir.
// Reglas: el propietario comparte; admin puede compartir cualquier sala.
export const compartirSalaServicio = async (
    datos: DatosCompartirSala,
    contexto: ContextoAutorizacion,
): Promise<AccesoSalaCompartida> => {
    await asegurarEsquemaInicializado();

    if (datos.usuarioDestinoId === contexto.usuarioId && contexto.rol !== "admin") {
        throw crearErrorHttp("No necesitas compartir contigo mismo una sala propia.", 400);
    }

    const sala = await obtenerSalaParaAutorizacion(datos.salaId);
    validarPermisoCompartirSala(sala, contexto);
    await validarDestinoComparticion(datos.usuarioDestinoId);

    const expiraEn = normalizarExpiracion(datos.expiraEn);
    const puedeVer = datos.puedeVer ?? true;
    const puedeControlar = datos.puedeControlar ?? false;

    if (!puedeVer && puedeControlar) {
        throw crearErrorHttp("No puedes otorgar control sin permiso de visualizacion.", 400);
    }

    const resultado = await pool.query<FilaAccesoSalaCompartida>(
        `
            INSERT INTO usuarios_salas (
                usuario_id,
                sala_id,
                compartido_por_usuario_id,
                tipo_acceso,
                puede_ver,
                puede_controlar,
                expira_en,
                actualizado_en
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
            ON CONFLICT (usuario_id, sala_id)
            DO UPDATE SET
                compartido_por_usuario_id = EXCLUDED.compartido_por_usuario_id,
                tipo_acceso = EXCLUDED.tipo_acceso,
                puede_ver = EXCLUDED.puede_ver,
                puede_controlar = EXCLUDED.puede_controlar,
                expira_en = EXCLUDED.expira_en,
                actualizado_en = NOW()
            RETURNING
                usuario_sala_id,
                usuario_id,
                sala_id,
                compartido_por_usuario_id,
                tipo_acceso,
                puede_ver,
                puede_controlar,
                expira_en,
                creado_en,
                actualizado_en
        `,
        [
            datos.usuarioDestinoId,
            datos.salaId,
            contexto.usuarioId,
            datos.tipoAcceso ?? "compartido",
            puedeVer,
            puedeControlar,
            expiraEn,
        ],
    );

    const acceso = resultado.rows[0];

    if (!acceso) {
        throw crearErrorHttp("No fue posible compartir la sala.", 500);
    }

    return mapearAccesoSalaCompartida(acceso);
};

// Uso futuro: llamar este servicio desde GET /salas/:id/compartidos.
export const listarAccesosSalaServicio = async (
    salaId: number,
    contexto: ContextoAutorizacion,
): Promise<AccesoSalaCompartida[]> => {
    await asegurarEsquemaInicializado();

    const sala = await obtenerSalaParaAutorizacion(salaId);
    validarPermisoCompartirSala(sala, contexto);

    const resultado = await pool.query<FilaAccesoSalaCompartida>(
        `
            SELECT
                usuario_sala_id,
                usuario_id,
                sala_id,
                compartido_por_usuario_id,
                tipo_acceso,
                puede_ver,
                puede_controlar,
                expira_en,
                creado_en,
                actualizado_en
            FROM usuarios_salas
            WHERE sala_id = $1
            ORDER BY creado_en DESC
        `,
        [salaId],
    );

    return resultado.rows.map(mapearAccesoSalaCompartida);
};

// Uso futuro: este helper sirve para decidir si un usuario puede ver/controlar una sala compartida.
export const verificarAccesoSalaServicio = async (
    salaId: number,
    contexto: ContextoAutorizacion,
    accion: "ver" | "controlar",
): Promise<void> => {
    await asegurarEsquemaInicializado();

    const sala = await obtenerSalaParaAutorizacion(salaId);

    if (contexto.rol === "admin" || sala.creado_por_usuario_id === contexto.usuarioId) {
        return;
    }

    const resultado = await pool.query<
        Pick<FilaAccesoSalaCompartida, "puede_ver" | "puede_controlar" | "expira_en">
    >(
        `
            SELECT puede_ver, puede_controlar, expira_en
            FROM usuarios_salas
            WHERE sala_id = $1
              AND usuario_id = $2
            LIMIT 1
        `,
        [salaId, contexto.usuarioId],
    );

    const acceso = resultado.rows[0];

    if (!acceso) {
        throw crearErrorHttp("No tienes acceso a esta sala.", 403);
    }

    if (acceso.expira_en && acceso.expira_en.getTime() <= Date.now()) {
        throw crearErrorHttp("El acceso compartido ya expiro.", 403);
    }

    if (accion === "controlar" && !acceso.puede_controlar) {
        throw crearErrorHttp("No tienes permiso para controlar esta sala.", 403);
    }

    if (accion === "ver" && !acceso.puede_ver) {
        throw crearErrorHttp("No tienes permiso para ver esta sala.", 403);
    }
};

// Uso futuro: llamar este servicio desde DELETE /salas/:id/compartidos/:usuarioId.
export const revocarAccesoSalaServicio = async (
    salaId: number,
    usuarioDestinoId: number,
    contexto: ContextoAutorizacion,
): Promise<void> => {
    await asegurarEsquemaInicializado();

    const sala = await obtenerSalaParaAutorizacion(salaId);
    validarPermisoCompartirSala(sala, contexto);

    const resultado = await pool.query<{ usuario_sala_id: number }>(
        `
            DELETE FROM usuarios_salas
            WHERE sala_id = $1
              AND usuario_id = $2
            RETURNING usuario_sala_id
        `,
        [salaId, usuarioDestinoId],
    );

    if (!resultado.rows[0]) {
        throw crearErrorHttp("Ese acceso compartido no existe.", 404);
    }
};