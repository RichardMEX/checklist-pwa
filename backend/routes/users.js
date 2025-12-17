const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

// Obtener todos los usuarios
router.get('/', UserController.getUsers);

// Crear nuevo usuario
router.post('/', UserController.createUser);

// Actualizar usuario
router.put('/:id', UserController.updateUser);

// Eliminar usuario ← AÑADIR ESTA LÍNEA
router.delete('/:id', UserController.deleteUser);

module.exports = router;