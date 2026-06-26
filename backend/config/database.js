const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'minth_checklists',
  password: process.env.DB_PASSWORD || 'admin',
  port: process.env.DB_PORT || 5432,
  // Configurar zona horaria
  timezone: 'America/Mexico_City',
  family: 4
});

// Verificar conexión
pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL (Zona: America/Mexico_City)');
});

pool.on('error', (err) => {
  console.error('❌ Error de PostgreSQL:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
