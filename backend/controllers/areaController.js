const db = require('../config/database');

const AreaController = {
  // Obtener todas las áreas
  async getAreas(req, res) {
    try {
      const result = await db.query('SELECT * FROM areas ORDER BY name');
      res.json({ success: true, areas: result.rows });
    } catch (error) {
      console.error('Error obteniendo áreas:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Crear nueva área
  async createArea(req, res) {
    try {
      const { name, description } = req.body;
      
      const result = await db.query(
        'INSERT INTO areas (name, description) VALUES ($1, $2) RETURNING *',
        [name, description]
      );
      
      res.status(201).json({ success: true, area: result.rows[0] });
    } catch (error) {
      console.error('Error creando área:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Actualizar área
  async updateArea(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      
      const result = await db.query(
        'UPDATE areas SET name = $1, description = $2 WHERE id = $3 RETURNING *',
        [name, description, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Área no encontrada' });
      }
      
      res.json({ success: true, area: result.rows[0] });
    } catch (error) {
      console.error('Error actualizando área:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Eliminar área
  async deleteArea(req, res) {
    try {
      const { id } = req.params;
      
      const result = await db.query(
        'DELETE FROM areas WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Área no encontrada' });
      }
      
      res.json({ success: true, message: 'Área eliminada correctamente' });
    } catch (error) {
      console.error('Error eliminando área:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = AreaController;