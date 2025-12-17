const db = require('../config/database');

const SupervisorController = {
  async getSupervisorOperators(req, res) {
    try {
      const { supervisorId } = req.params;
      
      console.log(`📋 Obteniendo operadores del supervisor ID: ${supervisorId}`);
      
      const result = await db.query(`
        SELECT 
          o.id, 
          o.username, 
          o.name, 
          o.role,
          o.is_active
        FROM users o
        JOIN supervisor_operators so ON o.id = so.operator_id
        WHERE so.supervisor_id = $1
        ORDER BY o.name
      `, [supervisorId]);
      
      console.log(`✅ Operadores asignados encontrados: ${result.rows.length}`);
      
      res.json({ 
        success: true, 
        operators: result.rows,
        count: result.rows.length
      });
    } catch (error) {
      console.error('❌ Error obteniendo operadores:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getAvailableOperators(req, res) {
    try {
      const { supervisorId } = req.params;
      
      console.log(`🔍 Buscando operadores disponibles para supervisor ID: ${supervisorId}`);
      
      // PRIMERO: Ver todos los operadores en el sistema
      const allOperators = await db.query(`
        SELECT id, username, name, role, is_active
        FROM users 
        WHERE role = 'operator' AND is_active = true
        ORDER BY name
      `);
      
      console.log(`📊 Total operadores en sistema: ${allOperators.rows.length}`);
      allOperators.rows.forEach(op => {
        console.log(`   Operador: ${op.name} (ID: ${op.id})`);
      });
      
      // SEGUNDO: Ver operadores ya asignados a ESTE supervisor
      const assignedOperators = await db.query(`
        SELECT operator_id 
        FROM supervisor_operators 
        WHERE supervisor_id = $1
      `, [supervisorId]);
      
      console.log(`📌 Operadores ya asignados a este supervisor: ${assignedOperators.rows.length}`);
      assignedOperators.rows.forEach(ao => {
        console.log(`   Operador ID asignado: ${ao.operator_id}`);
      });
      
      // TERCERO: Filtrar operadores disponibles
      const assignedIds = assignedOperators.rows.map(row => row.operator_id);
      
      const availableOperators = allOperators.rows.filter(operator => 
        !assignedIds.includes(operator.id)
      );
      
      console.log(`🎯 Operadores disponibles: ${availableOperators.length}`);
      availableOperators.forEach(op => {
        console.log(`   Disponible: ${op.name} (ID: ${op.id})`);
      });
      
      res.json({ 
        success: true, 
        operators: availableOperators,
        totalInSystem: allOperators.rows.length,
        alreadyAssigned: assignedOperators.rows.length,
        available: availableOperators.length
      });
      
    } catch (error) {
      console.error('❌ Error obteniendo operadores disponibles:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async assignOperators(req, res) {
    try {
      const { supervisorId } = req.params;
      const { operatorIds } = req.body;
      
      console.log(`🔄 Asignando operadores al supervisor ${supervisorId}:`, operatorIds);
      
      // Validar que venga array
      if (!Array.isArray(operatorIds)) {
        return res.status(400).json({ 
          success: false, 
          error: 'operatorIds debe ser un array' 
        });
      }
      
      // Verificar supervisor
      const supervisor = await db.query(
        'SELECT id, name FROM users WHERE id = $1',
        [supervisorId]
      );
      
      if (supervisor.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Supervisor no encontrado' 
        });
      }
      
      console.log(`👨‍💼 Supervisor: ${supervisor.rows[0].name}`);
      
      // Si no hay operadores, limpiar asignaciones
      if (operatorIds.length === 0) {
        await db.query('DELETE FROM supervisor_operators WHERE supervisor_id = $1', [supervisorId]);
        console.log('🧹 Todas las asignaciones eliminadas');
        return res.json({ 
          success: true, 
          message: 'Todos los operadores removidos',
          assignedCount: 0
        });
      }
      
      // Verificar que los operadores existen y son operadores
      const operatorsCheck = await db.query(
        'SELECT id, name FROM users WHERE id = ANY($1)',
        [operatorIds]
      );
      
      console.log(`📋 Operadores encontrados: ${operatorsCheck.rows.length} de ${operatorIds.length} solicitados`);
      
      if (operatorsCheck.rows.length !== operatorIds.length) {
        return res.status(400).json({ 
          success: false, 
          error: 'Algunos operadores no existen' 
        });
      }
      
      // TRANSACCIÓN: Eliminar antiguos e insertar nuevos
      await db.query('BEGIN');
      
      try {
        // 1. Eliminar todas las asignaciones actuales
        const deleteResult = await db.query(
          'DELETE FROM supervisor_operators WHERE supervisor_id = $1 RETURNING *',
          [supervisorId]
        );
        console.log(`🗑️  Asignaciones eliminadas: ${deleteResult.rows.length}`);
        
        // 2. Insertar nuevas asignaciones
        for (const operatorId of operatorIds) {
          await db.query(
            'INSERT INTO supervisor_operators (supervisor_id, operator_id) VALUES ($1, $2)',
            [supervisorId, operatorId]
          );
          console.log(`   ✅ Asignado operador ID: ${operatorId}`);
        }
        
        await db.query('COMMIT');
        
        console.log(`🎉 Asignación completada: ${operatorIds.length} operadores`);
        
        res.json({ 
          success: true, 
          message: `Operadores asignados correctamente a ${supervisor.rows[0].name}`,
          assignedCount: operatorIds.length,
          supervisorName: supervisor.rows[0].name,
          operatorNames: operatorsCheck.rows.map(op => op.name)
        });
        
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
      
    } catch (error) {
      console.error('❌ Error asignando operadores:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message,
        details: 'Error en la asignación'
      });
    }
  },

  async removeOperator(req, res) {
    try {
      const { supervisorId, operatorId } = req.params;
      
      console.log(`❌ Removiendo operador ${operatorId} del supervisor ${supervisorId}`);
      
      const result = await db.query(
        'DELETE FROM supervisor_operators WHERE supervisor_id = $1 AND operator_id = $2 RETURNING *',
        [supervisorId, operatorId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Asignación no encontrada' 
        });
      }
      
      console.log('✅ Operador removido exitosamente');
      
      res.json({ 
        success: true, 
        message: 'Operador removido correctamente'
      });
    } catch (error) {
      console.error('Error removiendo operador:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = SupervisorController;