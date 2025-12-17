const { Client } = require('pg');
require('dotenv').config();

const initDatabase = async () => {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'minth_checklists',
    password: 'admin',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');

    // 🔥 CONFIGURACIÓN CRÍTICA: Establecer zona horaria MÉXICO primero
    await client.query(`SET TIME ZONE 'America/Mexico_City'`);
    console.log('⏰ Zona horaria configurada: America/Mexico_City');

    // Crear tabla de usuarios CON ZONA HORARIA
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'supervisor', 'operator')),
        area VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `);
    console.log('✅ Tabla "users" creada (TIMESTAMPTZ)');

    // Crear tabla de áreas CON ZONA HORARIA
    await client.query(`
      CREATE TABLE IF NOT EXISTS areas (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla "areas" creada (TIMESTAMPTZ)');

    // 🎯 TABLA PROYECTOS CORREGIDA - ELIMINAR columna area_id
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla "projects" creada (TIMESTAMPTZ) - SIN area_id');

    // Crear tabla de plantillas de checklist CON ZONA HORARIA
    await client.query(`
      CREATE TABLE IF NOT EXISTS checklist_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        area_id INTEGER REFERENCES areas(id),
        project_id INTEGER REFERENCES projects(id),
        iatf_code VARCHAR(100) UNIQUE NOT NULL,
        version VARCHAR(20) DEFAULT '1.0',
        questions JSONB NOT NULL,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla "checklist_templates" creada (TIMESTAMPTZ)');

    // Crear tabla de asignaciones CON ZONA HORARIA
    await client.query(`
      CREATE TABLE IF NOT EXISTS checklist_assignments (
        id SERIAL PRIMARY KEY,
        template_id INTEGER REFERENCES checklist_templates(id),
        assigned_to INTEGER REFERENCES users(id),
        assigned_by INTEGER REFERENCES users(id),
        frequency VARCHAR(50) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE,
        is_active BOOLEAN DEFAULT true,
        assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla "checklist_assignments" creada (TIMESTAMPTZ)');

    // Crear tabla de envíos CON ZONA HORARIA
    await client.query(`
      CREATE TABLE IF NOT EXISTS checklist_submissions (
        id SERIAL PRIMARY KEY,
        assignment_id INTEGER REFERENCES checklist_assignments(id),
        submitted_by INTEGER REFERENCES users(id),
        answers JSONB NOT NULL,
        status VARCHAR(20) DEFAULT 'completed',
        submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla "checklist_submissions" creada (TIMESTAMPTZ)');

    // Crear tabla de notificaciones CON ZONA HORARIA
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        is_read BOOLEAN DEFAULT false,
        related_entity VARCHAR(50),
        related_id INTEGER,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla "notifications" creada (TIMESTAMPTZ)');

    // Insertar usuario admin por defecto
    await client.query(`
      INSERT INTO users (username, password, name, role, area) 
      VALUES ('admin', '0000', 'Administrador Principal', 'admin', 'Todos')
      ON CONFLICT (username) DO NOTHING
    `);

    // Insertar usuario supervisor por defecto
    await client.query(`
      INSERT INTO users (username, password, name, role, area) 
      VALUES ('supervisor', '1111', 'Supervisor de Producción', 'supervisor', 'Producción')
      ON CONFLICT (username) DO NOTHING
    `);

    // Insertar usuario operador por defecto
    await client.query(`
      INSERT INTO users (username, password, name, role, area) 
      VALUES ('operador', '2222', 'Operador Ejemplo', 'operator', 'Producción')
      ON CONFLICT (username) DO NOTHING
    `);

    // 🔥 INSERTAR PROYECTOS DE EJEMPLO
    await client.query(`
      INSERT INTO projects (name, description) 
      VALUES 
        ('Proyecto Mantenimiento Preventivo', 'Mantenimiento periódico de maquinaria'),
        ('Proyecto Seguridad Industrial', 'Checklists de seguridad en planta'),
        ('Proyecto Control de Calidad', 'Inspecciones de calidad de producto')
      ON CONFLICT DO NOTHING
    `);

    // 🔥 INSERTAR ÁREAS DE EJEMPLO
    await client.query(`
      INSERT INTO areas (name, description) 
      VALUES 
        ('Producción', 'Área de fabricación y producción'),
        ('Calidad', 'Control de calidad e inspecciones'),
        ('Seguridad', 'Seguridad industrial y prevención'),
        ('Mantenimiento', 'Mantenimiento de maquinaria'),
        ('Almacén', 'Control de inventario y almacenamiento')
      ON CONFLICT DO NOTHING
    `);
    

    console.log('✅ Usuarios, proyectos y áreas por defecto creados');
    
 // Crear tabla de relación usuario-áreas
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_areas (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        area_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, area_name)
      )
    `);
    console.log('✅ Tabla "user_areas" creada');

    // Crear tabla de relación supervisor-operadores
    await client.query(`
      CREATE TABLE IF NOT EXISTS supervisor_operators (
        id SERIAL PRIMARY KEY,
        supervisor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        operator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(supervisor_id, operator_id),
        CHECK (supervisor_id != operator_id)
      )
    `);
    console.log('✅ Tabla "supervisor_operators" creada');
    

    // 🔥 VERIFICACIÓN FINAL: Mostrar hora actual
    const verifyTime = await client.query('SELECT NOW() as hora_actual_mexico');
    console.log(`⏰ Hora actual en BD (México): ${verifyTime.rows[0].hora_actual_mexico}`);
    
    console.log('🎉 Base de datos inicializada correctamente con zona horaria México!');

  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
  } finally {
    await client.end();
  }
};

// Ejecutar solo si se llama directamente
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;