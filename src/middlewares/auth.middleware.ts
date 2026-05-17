import { createHmac, timingSafeEqual } from "node:crypto";
import { NextFunction, Request, Response } from "express";

type RolUsuario = "admin" | "user";

type CargaJwt = {
    sub: string;
    email: string;
    rol: RolUsuario;
    iat: number;
    exp: number;
};

const crearErrorHttp = (mensaje: string, estado: number): Error & { status: number } => {
    const error = new Error(mensaje) as Error & { status: number };
    error.status = estado;
    return error;
};

const decodificarBase64Url = (valor: string): string => {
    const valorBase64 = valor.replace(/-/g, "+").replace(/_/g, "/");
    const padding = (4 - (valorBase64.length % 4 || 4)) % 4;
    return Buffer.from(valorBase64 + "=".repeat(padding), "base64").toString("utf-8");
};

const extraerTokenBearer = (req: Request): string => {
    const encabezadoAutorizacion = req.header("authorization") ?? "";
    const [tipo, token] = encabezadoAutorizacion.split(" ");

    if (tipo !== "Bearer" || !token) {
        throw crearErrorHttp("Debes enviar un token Bearer valido.", 401);
    }

    return token;
};

const verificarFirma = (encabezado: string, carga: string, firma: string, secreto: string): boolean => {
    const firmaEsperada = createHmac("sha256", secreto)
        .update(`${encabezado}.${carga}`)
        .digest("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

    const firmaBuffer = Buffer.from(firma);
    const firmaEsperadaBuffer = Buffer.from(firmaEsperada);

    if (firmaBuffer.length !== firmaEsperadaBuffer.length) {
        return false;
    }

    return timingSafeEqual(firmaBuffer, firmaEsperadaBuffer);
};

const validarCargaJwt = (carga: unknown): CargaJwt => {
    if (!carga || typeof carga !== "object") {
        throw crearErrorHttp("El token no es valido.", 401);
    }

    const cargaTipada = carga as Partial<CargaJwt>;

    if (
        typeof cargaTipada.sub !== "string" ||
        typeof cargaTipada.email !== "string" ||
        (cargaTipada.rol !== "admin" && cargaTipada.rol !== "user") ||
        typeof cargaTipada.iat !== "number" ||
        typeof cargaTipada.exp !== "number"
    ) {
        throw crearErrorHttp("El token no es valido.", 401);
    }

    if (cargaTipada.exp <= Math.floor(Date.now() / 1000)) {
        throw crearErrorHttp("El token ha expirado.", 401);
    }

    return cargaTipada as CargaJwt;
};

export const autenticarUsuario = (req: Request, _res: Response, next: NextFunction): void => {
    try {
        const secretoJwt = process.env.JWT_SECRET;

        if (!secretoJwt) {
            throw crearErrorHttp("La autenticacion no esta configurada correctamente.", 500);
        }

        const token = extraerTokenBearer(req);
        const partes = token.split(".");

        if (partes.length !== 3) {
            throw crearErrorHttp("El token no es valido.", 401);
        }

        const [encabezadoCodificado, cargaCodificada, firma] = partes;

        if (!verificarFirma(encabezadoCodificado, cargaCodificada, firma, secretoJwt)) {
            throw crearErrorHttp("El token no es valido.", 401);
        }

        const carga = validarCargaJwt(JSON.parse(decodificarBase64Url(cargaCodificada)));
        const usuarioId = Number(carga.sub);

        if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
            throw crearErrorHttp("El token no es valido.", 401);
        }

        req.usuarioAutenticado = {
            usuarioId,
            rol: carga.rol,
        };

        next();
    } catch (error) {
        next(error);
    }
};