-- Script para crear tablas de usuarios con múltiples áreas y supervisores
-- Ejecutar en PostgreSQL: psql -U postgres -d minth_checklists -f create_user_tables.sql

-- 1. Eliminar columna 'area' simple de users si existe
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'area') THEN
        ALTER TABLE users DROP COLUMN area;
        RAISE NOTICE '✅ Columna "area" eliminada de tabla users';
    END IF;
END $$;

-- 2. Crear tabla de relación usuario-áreas
CREATE TABLE IF NOT EXISTS user_areas (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    area_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, area_name)
);

COMMENT ON TABLE user_areas IS 'Relación muchos-a-muchos entre usuarios y áreas';

-- 3. Crear tabla de relación supervisor-operadores
CREATE TABLE IF NOT EXISTS supervisor_operators (
    id SERIAL PRIMARY KEY,
    supervisor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    operator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(supervisor_id, operator_id),
    CHECK (supervisor_id != operator_id)
);

COMMENT ON TABLE supervisor_operators IS 'Relación supervisor-operadores (uno-a-muchos)';

-- 4. Agregar índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_user_areas_user_id ON user_areas(user_id);
CREATE INDEX IF NOT EXISTS idx_supervisor_operators_supervisor_id ON supervisor_operators(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_supervisor_operators_operator_id ON supervisor_operators(operator_id);

-- 5. Migrar datos existentes (si hay usuarios con área)
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT id, area FROM users WHERE area IS NOT NULL AND area != ''
    LOOP
        INSERT INTO user_areas (user_id, area_name) 
        VALUES (user_record.id, user_record.area)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE '✅ Usuario % migrado a área %', user_record.id, user_record.area;
    END LOOP;
END $$;

-- 6. Verificar tablas creadas
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('user_areas', 'supervisor_operators')
ORDER BY table_name;

-- 7. Verificar datos migrados
SELECT 'user_areas' as tabla, COUNT(*) as registros FROM user_areas
UNION ALL
SELECT 'supervisor_operators', COUNT(*) FROM supervisor_operators;

RAISE NOTICE '✅ Script completado exitosamente!';