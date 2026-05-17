export type RolUsuario = "admin" | "user";

export type ContextoAutorizacion = {
    usuarioId: number;
    rol: RolUsuario;
};

const crearErrorHttp = (mensaje: string, estado: number): Error & { status: number } => {
    const error = new Error(mensaje) as Error & { status: number };
    error.status = estado;
    return error;
};

type RestriccionPropietario = {
    clausulaSql: string;
    valores: number[];
};

export const construirRestriccionPropietario = (
    contexto: ContextoAutorizacion | undefined,
    nombreColumna: string,
    posicionParametro: number,
): RestriccionPropietario => {
    if (!contexto || contexto.rol === "admin") {
        return {
            clausulaSql: "",
            valores: [],
        };
    }

    return {
        clausulaSql: ` AND ${nombreColumna} = $${posicionParametro}`,
        valores: [contexto.usuarioId],
    };
};

export const validarResultadoEliminacion = (
    filaEliminada: { [clave: string]: number } | undefined,
    contexto: ContextoAutorizacion | undefined,
    mensajeNoExiste: string,
    mensajeSinPermiso: string,
): void => {
    if (filaEliminada) {
        return;
    }

    if (contexto && contexto.rol !== "admin") {
        throw crearErrorHttp(mensajeSinPermiso, 403);
    }

    throw crearErrorHttp(mensajeNoExiste, 404);
};