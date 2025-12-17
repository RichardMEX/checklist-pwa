const express = require('express');
const router = express.Router();
const SupervisorController = require('../controllers/supervisorController');

// Obtener operadores asignados a supervisor
router.get('/:supervisorId/operators', SupervisorController.getSupervisorOperators);

// Obtener operadores disponibles para asignar
router.get('/:supervisorId/available-operators', SupervisorController.getAvailableOperators);

// Asignar operadores a supervisor
router.post('/:supervisorId/operators', SupervisorController.assignOperators);

// Remover operador de supervisor
router.delete('/:supervisorId/operators/:operatorId', SupervisorController.removeOperator);

module.exports = router;