const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/projectController');

// Obtener todos los proyectos
router.get('/', ProjectController.getProjects);

// Crear nuevo proyecto
router.post('/', ProjectController.createProject);

// Actualizar proyecto
router.put('/:id', ProjectController.updateProject);

// Eliminar proyecto
router.delete('/:id', ProjectController.deleteProject);

module.exports = router;