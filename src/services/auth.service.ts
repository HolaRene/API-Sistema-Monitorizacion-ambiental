import { createHmac } from "node:crypto";
import bcrypt from "bcryptjs";
import pool from "../config/db";
import { asegurarEsquemaInicializado } from "../database/inicializar-esquema";

type RolUsuario = "admin" | "operador" | "visor";

type DatosRegistroUsuario = {
    nombres: string;
    apellidos: string;
    email: string;
    password: string;
    rol?: RolUsuario;
};

type DatosInicioSesion = {
    email: string;
    password: string;
};

type UsuarioAutenticacion = {
    usuarioId: number;
    nombres: string;
    apellidos: string;
    email: string;
    rol: RolUsuario;
    estaActivo: boolean;
};

type FilaUsuarioAutenticacion = {
    usuario_id: number;
    nombres: string;
    apellidos: string;
    email: string;
    password_hash: string;
    rol: RolUsuario;
    esta_activo: boolean;
};

type RespuestaAutenticacion = {
    usuario: UsuarioAutenticacion;
    token: string;
};

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

const obtenerSecretoJwt = (): string => {
    const secretoJwt = process.env.JWT_SECRET;

    if (!secretoJwt) {
        throw crearErrorHttp("La autenticacion no esta configurada correctamente.", 500);
    }

    return secretoJwt;
};

const obtenerRondasBcrypt = (): number => {
    const rondasConfiguradas = process.env.BCRYPT_SALT_ROUNDS;

    if (!rondasConfiguradas) {
        return 10;
    }

    const rondas = Number(rondasConfiguradas);

    if (!Number.isInteger(rondas) || rondas < 4 || rondas > 15) {
        throw crearErrorHttp("La autenticacion no esta configurada correctamente.", 500);
    }

    return rondas;
};

const obtenerExpiracionJwtEnSegundos = (): number => {
    const expiracionConfigurada = process.env.JWT_EXPIRES_IN;

    if (!expiracionConfigurada) {
        return 60 * 60 * 24;
    }

    const coincidencia = expiracionConfigurada.trim().match(/^(\d+)(s|m|h|d)?$/i);

    if (!coincidencia) {
        throw crearErrorHttp("La autenticacion no esta configurada correctamente.", 500);
    }

    const valor = Number(coincidencia[1]);
    const unidad = coincidencia[2]?.toLowerCase() ?? "s";

    if (!Number.isFinite(valor) || valor <= 0) {
        throw crearErrorHttp("La autenticacion no esta configurada correctamente.", 500);
    }

    const factores: Record<string, number> = {
        s: 1,
        m: 60,
        h: 60 * 60,
        d: 60 * 60 * 24,
    };

    return valor * factores[unidad];
};

const codificarBase64Url = (valor: string): string => {
    return Buffer.from(valor)
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
};

const generarTokenJwt = (usuario: UsuarioAutenticacion): string => {
    const secretoJwt = obtenerSecretoJwt();
    const emitidoEn = Math.floor(Date.now() / 1000);
    const expiracion = emitidoEn + obtenerExpiracionJwtEnSegundos();
    const encabezado = codificarBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const carga: CargaJwt = {
        sub: String(usuario.usuarioId),
        email: usuario.email,
        rol: usuario.rol,
        iat: emitidoEn,
        exp: expiracion,
    };
    const cargaCodificada = codificarBase64Url(JSON.stringify(carga));
    const firma = createHmac("sha256", secretoJwt)
        .update(`${encabezado}.${cargaCodificada}`)
        .digest("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

    return `${encabezado}.${cargaCodificada}.${firma}`;
};

const mapearUsuarioAutenticacion = (fila: FilaUsuarioAutenticacion): UsuarioAutenticacion => {
    return {
        usuarioId: fila.usuario_id,
        nombres: fila.nombres,
        apellidos: fila.apellidos,
        email: fila.email,
        rol: fila.rol,
        estaActivo: fila.esta_activo,
    };
};

const obtenerUsuarioPorEmail = async (email: string): Promise<FilaUsuarioAutenticacion | null> => {
    await asegurarEsquemaInicializado();

    const consulta = await pool.query<FilaUsuarioAutenticacion>(
        `
            SELECT usuario_id, nombres, apellidos, email, password_hash, rol, esta_activo
            FROM usuarios
            WHERE email = $1
            LIMIT 1
        `,
        [email],
    );

    return consulta.rows[0] ?? null;
};

export const registrarUsuarioServicio = async (
    datos: DatosRegistroUsuario,
): Promise<RespuestaAutenticacion> => {
    await asegurarEsquemaInicializado();

    const usuarioExistente = await obtenerUsuarioPorEmail(datos.email);

    if (usuarioExistente) {
        throw crearErrorHttp("Ya existe un usuario con ese correo.", 409);
    }

    const passwordHash = await bcrypt.hash(datos.password, obtenerRondasBcrypt());
    const insercion = await pool.query<FilaUsuarioAutenticacion>(
        `
            INSERT INTO usuarios (nombres, apellidos, email, password_hash, rol)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING usuario_id, nombres, apellidos, email, password_hash, rol, esta_activo
        `,
        [
            datos.nombres.trim(),
            datos.apellidos.trim(),
            datos.email,
            passwordHash,
            datos.rol ?? "operador",
        ],
    );

    const filaUsuario = insercion.rows[0];

    if (!filaUsuario) {
        throw crearErrorHttp("No fue posible registrar el usuario.", 500);
    }

    const usuario = mapearUsuarioAutenticacion(filaUsuario);

    return {
        usuario,
        token: generarTokenJwt(usuario),
    };
};

export const iniciarSesionServicio = async (
    datos: DatosInicioSesion,
): Promise<RespuestaAutenticacion> => {
    const filaUsuario = await obtenerUsuarioPorEmail(datos.email);

    if (!filaUsuario) {
        throw crearErrorHttp("Credenciales invalidas.", 401);
    }

    if (!filaUsuario.esta_activo) {
        throw crearErrorHttp("Tu cuenta no esta activa.", 403);
    }

    const passwordValida = await bcrypt.compare(datos.password, filaUsuario.password_hash);

    if (!passwordValida) {
        throw crearErrorHttp("Credenciales invalidas.", 401);
    }

    await pool.query(
        `
            UPDATE usuarios
            SET ultimo_acceso_en = NOW(), actualizado_en = NOW()
            WHERE usuario_id = $1
        `,
        [filaUsuario.usuario_id],
    );

    const usuario = mapearUsuarioAutenticacion(filaUsuario);

    return {
        usuario,
        token: generarTokenJwt(usuario),
    };
};
