BEGIN;

ALTER TABLE usuarios_salas
  ADD COLUMN IF NOT EXISTS compartido_por_usuario_id BIGINT REFERENCES usuarios(usuario_id) ON DELETE SET NULL;

ALTER TABLE usuarios_salas
  ADD COLUMN IF NOT EXISTS tipo_acceso VARCHAR(20) NOT NULL DEFAULT 'compartido';

ALTER TABLE usuarios_salas
  ADD COLUMN IF NOT EXISTS expira_en TIMESTAMPTZ;

ALTER TABLE usuarios_salas
  DROP CONSTRAINT IF EXISTS usuarios_salas_tipo_acceso_check;

ALTER TABLE usuarios_salas
  ADD CONSTRAINT usuarios_salas_tipo_acceso_check
  CHECK (tipo_acceso IN ('demo', 'compartido'));

CREATE INDEX IF NOT EXISTS idx_usuarios_salas_compartido_por_usuario_id
  ON usuarios_salas(compartido_por_usuario_id);

CREATE INDEX IF NOT EXISTS idx_usuarios_salas_expira_en
  ON usuarios_salas(expira_en);

COMMIT;