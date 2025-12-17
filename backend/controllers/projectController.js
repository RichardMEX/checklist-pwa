const db = require('../config/database');

const ProjectController = {
  // Obtener todos los proyectos
  async getProjects(req, res) {
    try {
      const result = await db.query(`
        SELECT * FROM projects ORDER BY name
      `);
      res.json({ success: true, projects: result.rows });
    } catch (error) {
      console.error('Error obteniendo proyectos:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Crear nuevo proyecto
  async createProject(req, res) {
    try {
      const { name, description } = req.body;
      
      console.log('Creando proyecto:', { name, description });
      
      const result = await db.query(
        'INSERT INTO projects (name, description) VALUES ($1, $2) RETURNING *',
        [name, description]
      );
      
      console.log('Proyecto creado:', result.rows[0]);
      
      res.status(201).json({ 
        success: true, 
        project: result.rows[0] 
      });
    } catch (error) {
      console.error('Error creando proyecto:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message
      });
    }
  },

  // Actualizar proyecto
  async updateProject(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      
      console.log('Actualizando proyecto:', { id, name, description });
      
      const result = await db.query(
        'UPDATE projects SET name = $1, description = $2 WHERE id = $3 RETURNING *',
        [name, description, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Proyecto no encontrado' });
      }
      
      res.json({ success: true, project: result.rows[0] });
    } catch (error) {
      console.error('Error actualizando proyecto:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Eliminar proyecto
  async deleteProject(req, res) {
    try {
      const { id } = req.params;
      
      const result = await db.query(
        'DELETE FROM projects WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Proyecto no encontrado' });
      }
      
      res.json({ success: true, message: 'Proyecto eliminado correctamente' });
    } catch (error) {
      console.error('Error eliminando proyecto:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = ProjectController;