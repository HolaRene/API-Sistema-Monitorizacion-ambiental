import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { registrarUsuarioServicio } from "../../services/auth.service";

const esquemaRegistroUsuario = z.object({
	nombres: z.string().trim().min(1, "Los nombres son obligatorios.").max(120, "Los nombres exceden el limite permitido."),
	apellidos: z.string().trim().min(1, "Los apellidos son obligatorios.").max(120, "Los apellidos exceden el limite permitido."),
	email: z.email("Debes enviar un correo valido.").trim(),
	password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres.").max(72, "La contrasena excede el limite permitido."),
	rol: z.enum(["admin", "operador", "visor"]).optional(),
});

export const registrarUsuarioControlador = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const resultadoValidacion = esquemaRegistroUsuario.safeParse(req.body);

	if (!resultadoValidacion.success) {
		res.status(400).json({
			success: false,
			message: resultadoValidacion.error.issues[0]?.message ?? "Datos invalidos.",
		});
		return;
	}

	try {
		const respuesta = await registrarUsuarioServicio(resultadoValidacion.data);

		res.status(201).json({
			success: true,
			message: "Usuario registrado exitosamente.",
			data: respuesta,
		});
	} catch (error) {
		next(error);
	}
};
