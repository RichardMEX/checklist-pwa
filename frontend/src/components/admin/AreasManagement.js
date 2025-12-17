import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Box,
  Alert
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { apiService } from '../../services/realApiService';

const AreasManagement = () => {
  const [areas, setAreas] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [newArea, setNewArea] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar áreas reales desde la API
  const loadAreas = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAreas();
      if (response.data.success) {
        setAreas(response.data.areas);
      }
    } catch (error) {
      setError('Error cargando áreas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAreas();
  }, []);

  const handleCreateArea = async () => {
    try {
      const response = await apiService.createArea(newArea);
      if (response.data.success) {
        await loadAreas(); // Recargar áreas
        setOpenDialog(false);
        setNewArea({ name: '', description: '' });
      }
    } catch (error) {
      setError('Error creando área: ' + error.message);
    }
  };

  const handleUpdateArea = async (id) => {
    try {
      const response = await apiService.updateArea(id, newArea);
      if (response.data.success) {
        await loadAreas(); // Recargar áreas
        setOpenDialog(false);
        setEditingArea(null);
        setNewArea({ name: '', description: '' });
      }
    } catch (error) {
      setError('Error actualizando área: ' + error.message);
    }
  };

  const handleDeleteArea = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta área?')) {
      try {
        const response = await apiService.deleteArea(id);
        if (response.data.success) {
          await loadAreas(); // Recargar áreas
        }
      } catch (error) {
        setError('Error eliminando área: ' + error.message);
      }
    }
  };

  const handleEditArea = (area) => {
    setEditingArea(area);
    setNewArea({ name: area.name, description: area.description || '' });
    setOpenDialog(true);
  };

  const handleSave = () => {
    if (editingArea) {
      handleUpdateArea(editingArea.id);
    } else {
      handleCreateArea();
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Gestión de Áreas
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setEditingArea(null);
            setNewArea({ name: '', description: '' });
            setOpenDialog(true);
          }}
        >
          Nueva Área
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Cargando áreas...
                </TableCell>
              </TableRow>
            ) : areas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No hay áreas creadas. Crea la primera área.
                </TableCell>
              </TableRow>
            ) : (
              areas.map((area) => (
                <TableRow key={area.id}>
                  <TableCell>{area.name}</TableCell>
                  <TableCell>{area.description}</TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary"
                      onClick={() => handleEditArea(area)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      color="error"
                      onClick={() => handleDeleteArea(area.id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingArea ? 'Editar Área' : 'Crear Nueva Área'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del Área"
            fullWidth
            value={newArea.name}
            onChange={(e) => setNewArea(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Descripción"
            fullWidth
            multiline
            rows={3}
            value={newArea.description}
            onChange={(e) => setNewArea(prev => ({ ...prev, description: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            {editingArea ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AreasManagement;