BEGIN;

ALTER TABLE usuarios
  DROP CONSTRAINT IF EXISTS usuarios_rol_check;

UPDATE usuarios
SET rol = 'user'
WHERE rol IN ('operador', 'visor');

ALTER TABLE usuarios
  ALTER COLUMN rol SET DEFAULT 'user';

ALTER TABLE usuarios
  ADD CONSTRAINT usuarios_rol_check
  CHECK (rol IN ('admin', 'user'));

ALTER TABLE salas
  ADD COLUMN IF NOT EXISTS creado_por_usuario_id BIGINT REFERENCES usuarios(usuario_id) ON DELETE SET NULL;

ALTER TABLE tipo_sensores
  ADD COLUMN IF NOT EXISTS creado_por_usuario_id BIGINT REFERENCES usuarios(usuario_id) ON DELETE SET NULL;

ALTER TABLE nodos_red
  ADD COLUMN IF NOT EXISTS creado_por_usuario_id BIGINT REFERENCES usuarios(usuario_id) ON DELETE SET NULL;

ALTER TABLE sensores
  ADD COLUMN IF NOT EXISTS creado_por_usuario_id BIGINT REFERENCES usuarios(usuario_id) ON DELETE SET NULL;

ALTER TABLE actuadores
  ADD COLUMN IF NOT EXISTS creado_por_usuario_id BIGINT REFERENCES usuarios(usuario_id) ON DELETE SET NULL;

ALTER TABLE asignaciones_sensor_actuador
  ADD COLUMN IF NOT EXISTS creado_por_usuario_id BIGINT REFERENCES usuarios(usuario_id) ON DELETE SET NULL;

ALTER TABLE lecturas
  ADD COLUMN IF NOT EXISTS creado_por_usuario_id BIGINT REFERENCES usuarios(usuario_id) ON DELETE SET NULL;

ALTER TABLE historial_actuadores
  ADD COLUMN IF NOT EXISTS creado_por_usuario_id BIGINT REFERENCES usuarios(usuario_id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_salas_creado_por_usuario_id
  ON salas(creado_por_usuario_id);

CREATE INDEX IF NOT EXISTS idx_tipo_sensores_creado_por_usuario_id
  ON tipo_sensores(creado_por_usuario_id);

CREATE INDEX IF NOT EXISTS idx_nodos_red_creado_por_usuario_id
  ON nodos_red(creado_por_usuario_id);

CREATE INDEX IF NOT EXISTS idx_sensores_creado_por_usuario_id
  ON sensores(creado_por_usuario_id);

CREATE INDEX IF NOT EXISTS idx_actuadores_creado_por_usuario_id
  ON actuadores(creado_por_usuario_id);

CREATE INDEX IF NOT EXISTS idx_asignaciones_sensor_actuador_creado_por_usuario_id
  ON asignaciones_sensor_actuador(creado_por_usuario_id);

CREATE INDEX IF NOT EXISTS idx_lecturas_creado_por_usuario_id
  ON lecturas(creado_por_usuario_id);

CREATE INDEX IF NOT EXISTS idx_historial_actuadores_creado_por_usuario_id
  ON historial_actuadores(creado_por_usuario_id);

COMMIT;