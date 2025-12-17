const express = require('express');
const router = express.Router();
const UserAdvancedController = require('../controllers/userAdvancedController');

// Obtener usuario con detalles completos
router.get('/:id/details', UserAdvancedController.getUserWithDetails);

// Actualizar áreas de usuario
router.put('/:id/areas', UserAdvancedController.updateUserAreas);

// Asignar operadores a supervisor
router.put('/supervisor/:supervisorId/operators', UserAdvancedController.assignOperatorsToSupervisor);

// Obtener operadores disponibles para supervisor
router.get('/supervisor/:supervisorId/available-operators', UserAdvancedController.getAvailableOperators);

// Obtener supervisores disponibles para operador
router.get('/operator/:operatorId/available-supervisors', UserAdvancedController.getAvailableSupervisors);

module.exports = router;