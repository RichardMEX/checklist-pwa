const db = require('../config/database');

const UserController = {
  async getUsers(req, res) {
    try {
      const result = await db.query(`
        SELECT id, username, name, role, created_at, is_active 
        FROM users 
        ORDER BY name
      `);
      res.json({ success: true, users: result.rows });
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async createUser(req, res) {
    try {
      const { username, password, name, role, is_active = true } = req.body;
      
      const result = await db.query(
        'INSERT INTO users (username, password, name, role, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, name, role, created_at, is_active',
        [username, password, name, role, is_active]
      );

      res.status(201).json({ success: true, user: result.rows[0] });
    } catch (error) {
      console.error('Error creando usuario:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { username, name, role, is_active } = req.body;
      
      let query = 'UPDATE users SET username = $1, name = $2, role = $3, is_active = $4';
      let params = [username, name, role, is_active, id];
      let paramIndex = 5;
      
      if (req.body.password) {
        query += `, password = $${paramIndex}`;
        params.splice(paramIndex - 1, 0, req.body.password);
        paramIndex++;
      }
      
      query += ` WHERE id = $${paramIndex} RETURNING id, username, name, role, is_active`;
      
      const result = await db.query(query, params);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }

      res.json({ success: true, user: result.rows[0] });
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      const result = await db.query(
        'DELETE FROM users WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }
      
      res.json({ success: true, message: 'Usuario eliminado correctamente' });
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = UserController;