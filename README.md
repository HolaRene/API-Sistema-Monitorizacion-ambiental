# Sistema Centralizado de Monitorización Ambiental IoT

> **Diseño e implementación de un sistema centralizado de monitorización ambiental para áreas críticas de salud basado en IoT y tecnologías web**

## Descripción

API REST desarrollada en Node.js y TypeScript que actúa como núcleo del sistema de monitorización ambiental. Recibe, procesa y expone los datos capturados por sensores IoT (ESP32) instalados en áreas críticas de salud —como quirófanos, UCI, salas de aislamiento y laboratorios— permitiendo el monitoreo en tiempo real de variables ambientales como temperatura, humedad, CO₂ y calidad del aire.

## Arquitectura del sistema

```
[Sensores IoT / ESP32]
        │
        ▼
[API REST + WebSocket]  ◄──►  [Base de datos PostgreSQL]
        │
        ▼
[Aplicación Web / Dashboard]
```

- **Capa de dispositivos**: microcontroladores ESP32 con sensores ambientales
- **Capa de backend**: API REST con soporte para WebSockets (tiempo real)
- **Capa de datos**: PostgreSQL para almacenamiento persistente
- **Capa de presentación**: dashboard web para visualización y alertas

## Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | >= 18 | Runtime |
| TypeScript | latest | Lenguaje |
| Express | ^5.2.1 | Framework HTTP |
| PostgreSQL | latest | Base de datos |
| pg (node-postgres) | ^8.20.0 | Driver PostgreSQL |
| Helmet | ^8.1.0 | Seguridad HTTP |
| express-rate-limit | ^8.5.1 | Control de tasa |
| CORS | ^2.8.6 | Política de origen |
| Morgan | ^1.10.1 | Logging HTTP |
| pnpm | ^11.1.1 | Gestor de paquetes |

## Estructura del proyecto

```
src/
├── server.ts              # Punto de entrada
├── config/
│   ├── db.ts              # Conexión a PostgreSQL (pool)
│   └── env.ts             # Variables de entorno
├── controllers/
│   └── web/
│       └── sensors.controllers.ts
├── routes/
│   ├── backend/           # Rutas para dispositivos ESP32
│   └── web/
│       └── sensors.routes.ts
├── services/              # Lógica de negocio
├── modules/               # Módulos de dominio
├── websockets/            # Comunicación en tiempo real
├── database/              # Migraciones y esquemas
└── shared/                # Utilidades compartidas
```

## Endpoints disponibles

### Sensores — `/api/v1/sensors`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/v1/sensors` | Obtener todos los sensores registrados |
| `GET` | `/api/v1/sensors/:id` | Obtener sensor por ID |
| `POST` | `/api/v1/sensors` | Registrar un nuevo sensor |
| `DELETE` | `/api/v1/sensors/:id` | Eliminar un sensor |

## Instalación y uso

### Requisitos previos

- Node.js >= 18
- pnpm >= 11
- PostgreSQL en ejecución

### Configuración

1. Clonar el repositorio e instalar dependencias:

```bash
pnpm install
```

2. Crear el archivo `.env` en la raíz del proyecto:

```env
PORT=3000
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/nombre_db
```

3. Iniciar el servidor en modo desarrollo:

```bash
pnpm dev
```

El servidor estará disponible en `http://localhost:3000`.

## Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `3000` |
| `DATABASE_URL` | Cadena de conexión PostgreSQL | `postgresql://user:pass@host/db` |

## Contexto del proyecto

Este sistema está orientado a entornos hospitalarios donde el control ambiental es crítico para la seguridad del paciente. El monitoreo continuo de parámetros como temperatura y calidad del aire permite:

- Detectar desviaciones fuera del rango normativo (ISO 14644, ASHRAE 170)
- Generar alertas tempranas ante condiciones de riesgo
- Mantener trazabilidad histórica para auditorías y acreditaciones

## Licencia

ISC
