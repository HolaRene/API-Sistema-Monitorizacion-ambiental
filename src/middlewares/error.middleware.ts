import { NextFunction, Request, Response } from "express";

type AppError = Error & {
    status?: number;
    code?: string;
    detail?: string;
};

const isProduction = process.env.NODE_ENV === "production";

const pgErrorMap: Record<string, { status: number; message: string }> = {
    "23505": { status: 409, message: "Ya existe un registro con ese valor unico." },
    "23503": { status: 400, message: "Referencia invalida: el registro relacionado no existe." },
    "23502": { status: 400, message: "Un campo obligatorio no puede estar vacio." },
    "23514": { status: 400, message: "El valor no cumple con las restricciones del campo." },
    "08001": { status: 503, message: "No se pudo establecer conexion con la base de datos." },
    "08006": { status: 503, message: "Error de conexion con la base de datos." },
    "53300": { status: 503, message: "Demasiadas conexiones a la base de datos." },
    "57014": { status: 408, message: "La consulta fue cancelada por timeout." },
    "40P01": { status: 409, message: "Deadlock detectado. Intenta nuevamente." },
    "40001": { status: 409, message: "Conflicto de transaccion. Intenta nuevamente." },
};

const errorMiddleware = (err: AppError, _req: Request, res: Response, _next: NextFunction) => {
    const error = err ?? new Error("Internal Server Error");

    console.error("Error:", {
        message: error.message,
        code: error.code,
        status: error.status,
    });

    if (error.code && pgErrorMap[error.code]) {
        const mapped = pgErrorMap[error.code];

        res.status(mapped.status).json({
            success: false,
            message: mapped.message,
            ...(isProduction
                ? {}
                : {
                        code: error.code,
                        detail: error.detail ?? error.message,
                    }),
        });

        return;
    }

    if (error.name === "ValidationError") {
        res.status(400).json({
            success: false,
            message: "Error de validacion",
            ...(isProduction ? {} : { detail: error.message }),
        });
        return;
    }

    const statusCode = error.status ?? 500;

    res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? "Internal Server Error" : error.message,
        ...(isProduction ? {} : { detail: error.message, stack: error.stack }),
    });
};

export default errorMiddleware;