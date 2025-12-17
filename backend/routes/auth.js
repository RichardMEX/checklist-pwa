const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Convertir username a minúsculas para búsqueda case-insensitive
    const usernameLower = username.toLowerCase();
    
    // IMPORTANTE: Buscar usuario SIN comparar contraseña en la query
    const result = await db.query(
      'SELECT id, username, password, name, role, is_active FROM users WHERE LOWER(username) = $1 AND is_active = true',
      [usernameLower]
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      
      // 🔥 COMPARACIÓN SIMPLE - Si la contraseña coincide (texto plano)
      if (user.password === password) {
        // Eliminar password del objeto user antes de enviarlo
        const { password, ...userWithoutPassword } = user;
        
        res.json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
            area: 'Todos' // Temporal hasta que cargue áreas reales
          },
          token: `minth-token-${user.id}`
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Usuario o contraseña incorrectos'
        });
      }
    } else {
      res.status(401).json({
        success: false,
        message: 'Usuario o contraseña incorrectos'
      });
    }
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor: ' + error.message
    });
  }
});

router.get('/me', async (req, res) => {
  const token = req.headers.authorization;
  
  if (token && token.startsWith('minth-token-')) {
    try {
      const userId = token.replace('minth-token-', '');
      const result = await db.query(
        'SELECT id, username, name, role FROM users WHERE id = $1 AND is_active = true',
        [userId]
      );
        
      if (result.rows.length > 0) {
        return res.json({ user: result.rows[0] });
      }
    } catch (error) {
      console.error('Error verificando token:', error);
    }
  }
  
  res.status(401).json({ error: 'No autorizado' });
});

module.exports = router;