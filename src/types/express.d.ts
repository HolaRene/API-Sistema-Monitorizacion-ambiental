export {};

declare global {
    namespace Express {
        interface Request {
            usuarioAutenticado?: {
                usuarioId: number;
                rol: "admin" | "user";
            };
        }
    }
}