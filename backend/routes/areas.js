const express = require('express');
const router = express.Router();
const AreaController = require('../controllers/areaController');

// Obtener todas las áreas
router.get('/', AreaController.getAreas);

// Crear nueva área
router.post('/', AreaController.createArea);

// Actualizar área
router.put('/:id', AreaController.updateArea);

// Eliminar área
router.delete('/:id', AreaController.deleteArea);

module.exports = router;