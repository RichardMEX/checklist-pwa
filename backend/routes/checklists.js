const express = require('express');
const router = express.Router();
const ChecklistController = require('../controllers/checklistController');

// Obtener todos los checklists
router.get('/', ChecklistController.getAllChecklists);

// Obtener checklist por ID
router.get('/:id', ChecklistController.getChecklistById);

// Crear nuevo checklist
router.post('/', ChecklistController.createChecklist);

// Actualizar checklist
router.put('/:id', ChecklistController.updateChecklist);

// Eliminar checklist
router.delete('/:id', ChecklistController.deleteChecklist);

module.exports = router;