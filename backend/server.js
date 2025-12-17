const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' })); // Aumentar de 10mb a 50mb
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CONFIGURACIÓN CORRECTA DE ARCHIVOS ESTÁTICOS
const frontendBuildPath = path.join(__dirname, '../frontend/build');

console.log('📁 Ruta del frontend:', frontendBuildPath);

// Verificar que existe la carpeta build
if (fs.existsSync(frontendBuildPath)) {
  console.log('✅ Carpeta build encontrada');
  
  // Servir TODOS los archivos estáticos de la carpeta build
  app.use(express.static(frontendBuildPath));
  
  console.log('✅ Archivos estáticos configurados');
} else {
  console.log('❌ ERROR: No se encuentra la carpeta build en:', frontendBuildPath);
  console.log('💡 Ejecuta: npm run build');
}

// ==================== IMPORTAR RUTAS API ====================
// SOLO UNA VEZ cada importación - eliminar duplicados
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const checklistRoutes = require('./routes/checklists');
const areaRoutes = require('./routes/areas');
const userRoutes = require('./routes/users'); // ← SOLO UNA VEZ
const projectRoutes = require('./routes/projects');
const userAdvancedRoutes = require('./routes/userAdvanced');
const supervisorRoutes = require('./routes/supervisors');

// ==================== CONFIGURAR RUTAS ====================
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/areas', areaRoutes);
app.use('/api/users', userRoutes); // ← SOLO UNA VEZ
app.use('/api/projects', projectRoutes);
app.use('/api/user-advanced', userAdvancedRoutes);
app.use('/api/supervisors', supervisorRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Sistema de Checklists funcionando',
    mode: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Ruta para verificar conexión a PostgreSQL
app.get('/api/db-status', async (req, res) => {
  try {
    const db = require('./config/database');
    const result = await db.query('SELECT NOW() as time, version() as version');
    res.json({ 
      success: true, 
      database: 'Conectado a PostgreSQL',
      time: result.rows[0].time,
      version: result.rows[0].version
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Error conectando a PostgreSQL: ' + error.message 
    });
  }
});

// Ruta para probar las nuevas funciones
app.get('/api/test-data', async (req, res) => {
  try {
    const db = require('./config/database');
    
    // Contar registros en cada tabla
    const usersCount = await db.query('SELECT COUNT(*) FROM users');
    const areasCount = await db.query('SELECT COUNT(*) FROM areas');
    const checklistsCount = await db.query('SELECT COUNT(*) FROM checklist_templates');
    
    res.json({
      success: true,
      counts: {
        users: parseInt(usersCount.rows[0].count),
        areas: parseInt(areasCount.rows[0].count),
        checklists: parseInt(checklistsCount.rows[0].count)
      },
      message: 'Base de datos funcionando correctamente'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Error accediendo a la base de datos: ' + error.message 
    });
  }
});

// EN PRODUCCIÓN: Servir React para todas las rutas que no sean API
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    // Si la ruta empieza con /api, continuar
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'Ruta API no encontrada' });
    }
    
    // Para todas las demás rutas, servir index.html
    const indexPath = path.join(__dirname, '../frontend/build', 'index.html');
    
    if (!fs.existsSync(indexPath)) {
      return res.status(500).json({
        error: 'Archivo index.html no encontrado',
        solution: 'Ejecuta: npm run build'
      });
    }
    
    res.sendFile(indexPath);
  });
}

// EN DESARROLLO
else {
  app.get('/', (req, res) => {
    res.json({
      message: 'API de Checklists Backend - Modo Desarrollo',
      frontend: 'http://localhost:3000',
      api: 'http://localhost:5000/api',
      health: 'http://localhost:5000/api/health',
      dbStatus: 'http://localhost:5000/api/db-status',
      testData: 'http://localhost:5000/api/test-data'
    });
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('🚀 SISTEMA DE CHECKLISTS INICIADO');
  console.log(`📍 Puerto: ${PORT}`);
  console.log(`🌍 Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💻 URL Local: http://localhost:${PORT}`);
  console.log(`📱 URL Celular: http://192.168.0.7:${PORT}`);
  console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
  console.log(`🗄️  DB Status: http://localhost:${PORT}/api/db-status`);
  console.log(`🧪 Test Data: http://localhost:${PORT}/api/test-data`);
});