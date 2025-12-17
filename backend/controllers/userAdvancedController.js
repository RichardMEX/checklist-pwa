const db = require('../config/database');

const UserAdvancedController = {
  // Obtener usuario con áreas y operadores asignados
  async getUserWithDetails(req, res) {
    try {
      const { id } = req.params;
      
      // Obtener usuario básico
      const userResult = await db.query(
        'SELECT id, username, name, role, created_at, is_active FROM users WHERE id = $1',
        [id]
      );
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }
      
      const user = userResult.rows[0];
      
      // Obtener áreas del usuario
      const areasResult = await db.query(
        'SELECT area_name FROM user_areas WHERE user_id = $1 ORDER BY area_name',
        [id]
      );
      user.areas = areasResult.rows.map(row => row.area_name);
      
      // Si es supervisor, obtener sus operadores
      if (user.role === 'supervisor') {
        const operatorsResult = await db.query(`
          SELECT u.id, u.username, u.name, u.area 
          FROM users u
          JOIN supervisor_operators so ON u.id = so.operator_id
          WHERE so.supervisor_id = $1 AND u.is_active = true
          ORDER BY u.name
        `, [id]);
        user.operators = operatorsResult.rows;
      }
      
      // Si es operador, obtener sus supervisores
      if (user.role === 'operator') {
        const supervisorsResult = await db.query(`
          SELECT u.id, u.username, u.name 
          FROM users u
          JOIN supervisor_operators so ON u.id = so.supervisor_id
          WHERE so.operator_id = $1 AND u.is_active = true
          ORDER BY u.name
        `, [id]);
        user.supervisors = supervisorsResult.rows;
      }
      
      res.json({ success: true, user });
    } catch (error) {
      console.error('Error obteniendo detalles de usuario:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Actualizar áreas de un usuario
  async updateUserAreas(req, res) {
    try {
      const { id } = req.params;
      const { areas } = req.body; // Array de nombres de áreas
      
      // Verificar que el usuario existe
      const userCheck = await db.query(
        'SELECT id FROM users WHERE id = $1',
        [id]
      );
      
      if (userCheck.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }
      
      // Eliminar áreas actuales
      await db.query('DELETE FROM user_areas WHERE user_id = $1', [id]);
      
      // Insertar nuevas áreas
      for (const area of areas) {
        await db.query(
          'INSERT INTO user_areas (user_id, area_name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [id, area]
        );
      }
      
      res.json({ 
        success: true, 
        message: 'Áreas actualizadas correctamente',
        areas 
      });
    } catch (error) {
      console.error('Error actualizando áreas de usuario:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Asignar operadores a supervisor
  async assignOperatorsToSupervisor(req, res) {
    try {
      const { supervisorId } = req.params;
      const { operatorIds } = req.body; // Array de IDs de operadores
      
      // Verificar que el supervisor existe y es supervisor
      const supervisorCheck = await db.query(
        'SELECT id, role FROM users WHERE id = $1 AND role = $2',
        [supervisorId, 'supervisor']
      );
      
      if (supervisorCheck.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Supervisor no encontrado o no tiene rol supervisor' 
        });
      }
      
      // Verificar que todos los operadores existen y son operadores
      const operatorsCheck = await db.query(
        'SELECT id FROM users WHERE id = ANY($1) AND role = $2',
        [operatorIds, 'operator']
      );
      
      if (operatorsCheck.rows.length !== operatorIds.length) {
        return res.status(400).json({ 
          success: false, 
          error: 'Uno o más operadores no existen o no tienen rol operador' 
        });
      }
      
      // Eliminar asignaciones actuales
      await db.query('DELETE FROM supervisor_operators WHERE supervisor_id = $1', [supervisorId]);
      
      // Insertar nuevas asignaciones
      for (const operatorId of operatorIds) {
        await db.query(
          'INSERT INTO supervisor_operators (supervisor_id, operator_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [supervisorId, operatorId]
        );
      }
      
      res.json({ 
        success: true, 
        message: 'Operadores asignados correctamente',
        assignedCount: operatorIds.length
      });
    } catch (error) {
      console.error('Error asignando operadores:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Obtener operadores disponibles para supervisor
  async getAvailableOperators(req, res) {
    try {
      const { supervisorId } = req.params;
      
      // Operadores que NO están asignados a este supervisor y tienen rol operator
      const result = await db.query(`
        SELECT u.id, u.username, u.name, u.is_active,
               array_agg(ua.area_name) as areas
        FROM users u
        LEFT JOIN user_areas ua ON u.id = ua.user_id
        WHERE u.role = 'operator' 
          AND u.is_active = true
          AND u.id NOT IN (
            SELECT operator_id 
            FROM supervisor_operators 
            WHERE supervisor_id = $1
          )
        GROUP BY u.id, u.username, u.name, u.is_active
        ORDER BY u.name
      `, [supervisorId]);
      
      res.json({ success: true, operators: result.rows });
    } catch (error) {
      console.error('Error obteniendo operadores disponibles:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Obtener supervisores disponibles para operador
  async getAvailableSupervisors(req, res) {
    try {
      const { operatorId } = req.params;
      
      const result = await db.query(`
        SELECT u.id, u.username, u.name, u.is_active
        FROM users u
        WHERE u.role = 'supervisor' 
          AND u.is_active = true
          AND u.id NOT IN (
            SELECT supervisor_id 
            FROM supervisor_operators 
            WHERE operator_id = $1
          )
        ORDER BY u.name
      `, [operatorId]);
      
      res.json({ success: true, supervisors: result.rows });
    } catch (error) {
      console.error('Error obteniendo supervisores disponibles:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = UserAdvancedController;