BEGIN;

CREATE TABLE IF NOT EXISTS salas (
  sala_id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  area_fisica VARCHAR(160),
  nivel_criticidad SMALLINT NOT NULL DEFAULT 1 CHECK (nivel_criticidad BETWEEN 1 AND 5),
  descripcion TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tipo_sensores (
  tipo_sensor_id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  categoria VARCHAR(60) NOT NULL,
  unidad_medida VARCHAR(30) NOT NULL,
  descripcion TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nodos_red (
  nodo_red_id BIGSERIAL PRIMARY KEY,
  node_id VARCHAR(80) NOT NULL UNIQUE,
  sala_id BIGINT REFERENCES salas(sala_id) ON DELETE SET NULL,
  ip INET,
  mac_address VARCHAR(17) UNIQUE,
  firmware_version VARCHAR(40),
  ultimo_ping_en TIMESTAMPTZ,
  esta_activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sensores (
  sensor_id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(60) NOT NULL UNIQUE,
  tipo_sensor_id BIGINT NOT NULL REFERENCES tipo_sensores(tipo_sensor_id) ON DELETE RESTRICT,
  sala_id BIGINT REFERENCES salas(sala_id) ON DELETE SET NULL,
  nodo_red_id BIGINT REFERENCES nodos_red(nodo_red_id) ON DELETE SET NULL,
  pin VARCHAR(30),
  modelo VARCHAR(80),
  esta_activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS actuadores (
  actuador_id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(60) NOT NULL UNIQUE,
  tipo_actuador VARCHAR(30) NOT NULL CHECK (tipo_actuador IN ('led', 'buzzer', 'ventilador')),
  sala_id BIGINT REFERENCES salas(sala_id) ON DELETE SET NULL,
  nodo_red_id BIGINT REFERENCES nodos_red(nodo_red_id) ON DELETE SET NULL,
  pin VARCHAR(30),
  modelo VARCHAR(80),
  esta_activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS asignaciones_sensor_actuador (
  asignacion_id BIGSERIAL PRIMARY KEY,
  sensor_id BIGINT NOT NULL REFERENCES sensores(sensor_id) ON DELETE CASCADE,
  actuador_id BIGINT NOT NULL REFERENCES actuadores(actuador_id) ON DELETE CASCADE,
  regla JSONB,
  prioridad SMALLINT NOT NULL DEFAULT 1 CHECK (prioridad BETWEEN 1 AND 10),
  esta_activa BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (sensor_id, actuador_id)
);

CREATE TABLE IF NOT EXISTS lecturas (
  lectura_id BIGSERIAL PRIMARY KEY,
  sensor_id BIGINT NOT NULL REFERENCES sensores(sensor_id) ON DELETE CASCADE,
  nodo_red_id BIGINT REFERENCES nodos_red(nodo_red_id) ON DELETE SET NULL,
  sala_id BIGINT REFERENCES salas(sala_id) ON DELETE SET NULL,
  valor NUMERIC(12, 4) NOT NULL,
  unidad_medida VARCHAR(30),
  calidad_dato VARCHAR(20) NOT NULL DEFAULT 'ok',
  metadata JSONB,
  leido_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS historial_actuadores (
  historial_actuador_id BIGSERIAL PRIMARY KEY,
  actuador_id BIGINT NOT NULL REFERENCES actuadores(actuador_id) ON DELETE CASCADE,
  asignacion_id BIGINT REFERENCES asignaciones_sensor_actuador(asignacion_id) ON DELETE SET NULL,
  accion VARCHAR(30) NOT NULL CHECK (accion IN ('encender', 'apagar', 'toggle', 'set_nivel')),
  valor NUMERIC(12, 4),
  origen VARCHAR(20) NOT NULL CHECK (origen IN ('automatico', 'manual', 'sistema')),
  detalle JSONB,
  ejecutado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usuarios (
  usuario_id BIGSERIAL PRIMARY KEY,
  nombres VARCHAR(120) NOT NULL,
  apellidos VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  rol VARCHAR(30) NOT NULL DEFAULT 'user' CHECK (rol IN ('admin', 'user')),
  esta_activo BOOLEAN NOT NULL DEFAULT TRUE,
  ultimo_acceso_en TIMESTAMPTZ,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usuarios_salas (
  usuario_sala_id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
  sala_id BIGINT NOT NULL REFERENCES salas(sala_id) ON DELETE CASCADE,
  puede_ver BOOLEAN NOT NULL DEFAULT TRUE,
  puede_controlar BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (usuario_id, sala_id)
);

CREATE TABLE IF NOT EXISTS preferencias_usuarios (
  preferencia_usuario_id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL UNIQUE REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
  sala_id_default BIGINT REFERENCES salas(sala_id) ON DELETE SET NULL,
  sensor_id_default BIGINT REFERENCES sensores(sensor_id) ON DELETE SET NULL,
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nodos_red_sala_id
  ON nodos_red(sala_id);

CREATE INDEX IF NOT EXISTS idx_sensores_tipo_sensor_id
  ON sensores(tipo_sensor_id);

CREATE INDEX IF NOT EXISTS idx_sensores_sala_id
  ON sensores(sala_id);

CREATE INDEX IF NOT EXISTS idx_sensores_nodo_red_id
  ON sensores(nodo_red_id);

CREATE INDEX IF NOT EXISTS idx_actuadores_sala_id
  ON actuadores(sala_id);

CREATE INDEX IF NOT EXISTS idx_actuadores_nodo_red_id
  ON actuadores(nodo_red_id);

CREATE INDEX IF NOT EXISTS idx_asignaciones_sensor_actuador_sensor_id
  ON asignaciones_sensor_actuador(sensor_id);

CREATE INDEX IF NOT EXISTS idx_asignaciones_sensor_actuador_actuador_id
  ON asignaciones_sensor_actuador(actuador_id);

CREATE INDEX IF NOT EXISTS idx_lecturas_sensor_id
  ON lecturas(sensor_id);

CREATE INDEX IF NOT EXISTS idx_lecturas_nodo_red_id
  ON lecturas(nodo_red_id);

CREATE INDEX IF NOT EXISTS idx_lecturas_sala_id
  ON lecturas(sala_id);

CREATE INDEX IF NOT EXISTS idx_lecturas_leido_en
  ON lecturas(leido_en DESC);

CREATE INDEX IF NOT EXISTS idx_historial_actuadores_actuador_id
  ON historial_actuadores(actuador_id);

CREATE INDEX IF NOT EXISTS idx_historial_actuadores_ejecutado_en
  ON historial_actuadores(ejecutado_en DESC);

CREATE INDEX IF NOT EXISTS idx_usuarios_email
  ON usuarios(email);

CREATE INDEX IF NOT EXISTS idx_usuarios_salas_usuario_id
  ON usuarios_salas(usuario_id);

CREATE INDEX IF NOT EXISTS idx_usuarios_salas_sala_id
  ON usuarios_salas(sala_id);

CREATE INDEX IF NOT EXISTS idx_preferencias_usuarios_sensor_id_default
  ON preferencias_usuarios(sensor_id_default);

COMMIT;
