import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Box,
  Alert
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { apiService } from '../../services/realApiService';

const ProjectsManagement = () => {
  const [projects, setProjects] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [newProject, setNewProject] = useState({ 
    name: '', 
    description: '' 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar proyectos desde la API
  const loadData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProjects();
      
      if (response.data.success) {
        setProjects(response.data.projects);
      }
    } catch (error) {
      setError('Error cargando proyectos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProject = async () => {
    try {
      const response = await apiService.createProject(newProject);
      if (response.data.success) {
        await loadData();
        setOpenDialog(false);
        setNewProject({ name: '', description: '' });
      }
    } catch (error) {
      setError('Error creando proyecto: ' + error.message);
    }
  };

  const handleUpdateProject = async (id) => {
    try {
      const response = await apiService.updateProject(id, newProject);
      if (response.data.success) {
        await loadData();
        setOpenDialog(false);
        setEditingProject(null);
        setNewProject({ name: '', description: '' });
      }
    } catch (error) {
      setError('Error actualizando proyecto: ' + error.message);
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
      try {
        const response = await apiService.deleteProject(id);
        if (response.data.success) {
          await loadData();
        }
      } catch (error) {
        setError('Error eliminando proyecto: ' + error.message);
      }
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setNewProject({ 
      name: project.name, 
      description: project.description || '' 
    });
    setOpenDialog(true);
  };

  const handleSave = () => {
    if (editingProject) {
      handleUpdateProject(editingProject.id);
    } else {
      handleCreateProject();
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Gestión de Proyectos
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setEditingProject(null);
            setNewProject({ name: '', description: '' });
            setOpenDialog(true);
          }}
        >
          Nuevo Proyecto
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
                  Cargando proyectos...
                </TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No hay proyectos creados. Crea el primer proyecto.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.description}</TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary"
                      onClick={() => handleEditProject(project)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      color="error"
                      onClick={() => handleDeleteProject(project.id)}
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
          {editingProject ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del Proyecto"
            fullWidth
            value={newProject.name}
            onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            label="Descripción"
            fullWidth
            multiline
            rows={3}
            value={newProject.description}
            onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={!newProject.name.trim()}
          >
            {editingProject ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectsManagement;