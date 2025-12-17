import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Box,
  Alert, FormControl, InputLabel, Select, MenuItem, Chip,
  Grid, Checkbox, List, ListItem, ListItemText, Divider
} from '@mui/material';
import { Add, Edit, Delete, People, SupervisorAccount, Engineering, Refresh } from '@mui/icons-material';
import { apiService } from '../../services/realApiService';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSupervisorDialog, setOpenSupervisorDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [newUser, setNewUser] = useState({ 
    username: '', 
    password: '',
    name: '', 
    role: 'operator', 
    is_active: true
  });
  const [availableOperators, setAvailableOperators] = useState([]);
  const [selectedOperators, setSelectedOperators] = useState([]);
  const [assignedOperators, setAssignedOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar usuarios
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers();
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      setError('Error cargando usuarios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Cargar operadores del supervisor
  const loadSupervisorData = async (supervisorId) => {
    try {
      console.log(`🔍 Cargando datos para supervisor ID: ${supervisorId}`);
      
      // Cargar operadores asignados
      const assignedResponse = await apiService.getSupervisorOperators(supervisorId);
      console.log('📋 Respuesta de operadores asignados:', assignedResponse.data);
      
      if (assignedResponse.data.success) {
        setAssignedOperators(assignedResponse.data.operators || []);
        setSelectedOperators(assignedResponse.data.operators.map(op => op.id) || []);
      }

      // Cargar operadores disponibles
      const availableResponse = await apiService.getAvailableOperators(supervisorId);
      console.log('📋 Respuesta de operadores disponibles:', availableResponse.data);
      
      if (availableResponse.data.success) {
        setAvailableOperators(availableResponse.data.operators || []);
      }

    } catch (error) {
      console.error('❌ Error cargando datos del supervisor:', error);
      setAssignedOperators([]);
      setAvailableOperators([]);
      setSelectedOperators([]);
    }
  };

  const handleCreateUser = async () => {
    try {
      if (!newUser.username || !newUser.password || !newUser.name) {
        setError('Usuario, contraseña y nombre son obligatorios');
        return;
      }

      const response = await apiService.createUser(newUser);
      if (response.data.success) {
        await loadUsers();
        setOpenDialog(false);
        resetForm();
      }
    } catch (error) {
      setError('Error creando usuario: ' + error.message);
    }
  };

  const handleUpdateUser = async () => {
    try {
      const userData = {
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
        is_active: newUser.is_active
      };

      if (newUser.password) {
        userData.password = newUser.password;
      }

      const response = await apiService.updateUser(editingUser.id, userData);
      if (response.data.success) {
        await loadUsers();
        setOpenDialog(false);
        resetForm();
      }
    } catch (error) {
      setError('Error actualizando usuario: ' + error.message);
    }
  };

  const handleManageSupervisor = async (user) => {
    setSelectedSupervisor(user);
    setOpenSupervisorDialog(true);
    await loadSupervisorData(user.id);
  };

  const handleAssignOperators = async () => {
    try {
      const response = await apiService.assignOperators(selectedSupervisor.id, selectedOperators);
      
      if (response.data.success) {
        alert(`${response.data.assignedCount} operadores asignados a ${selectedSupervisor.name}`);
        await loadSupervisorData(selectedSupervisor.id);
      }
    } catch (error) {
      setError('Error asignando operadores: ' + error.message);
    }
  };

  const handleRefresh = async () => {
    if (selectedSupervisor) {
      await loadSupervisorData(selectedSupervisor.id);
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setSelectedSupervisor(null);
    setNewUser({ username: '', password: '', name: '', role: 'operator', is_active: true });
    setSelectedOperators([]);
    setAssignedOperators([]);
    setAvailableOperators([]);
    setError('');
  };

  const roles = [
    { value: 'admin', label: 'Administrador', icon: <People /> },
    { value: 'supervisor', label: 'Supervisor', icon: <SupervisorAccount /> },
    { value: 'operator', label: 'Operador', icon: <Engineering /> }
  ];

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return 'error';
      case 'supervisor': return 'warning';
      case 'operator': return 'success';
      default: return 'default';
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`¿Eliminar usuario ${userName}?`)) {
      try {
        const response = await apiService.deleteUser(userId);
        if (response.data.success) {
          await loadUsers();
        }
      } catch (error) {
        setError('Error eliminando usuario: ' + error.message);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Gestión de Usuarios</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => {
          resetForm();
          setOpenDialog(true);
        }}>
          Nuevo Usuario
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Usuario</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Cargando usuarios...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No hay usuarios creados
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role === 'admin' ? 'Administrador' : 
                             user.role === 'supervisor' ? 'Supervisor' : 'Operador'} 
                      color={getRoleColor(user.role)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.is_active ? 'Activo' : 'Inactivo'} 
                      color={user.is_active ? 'success' : 'error'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        setEditingUser(user);
                        setNewUser({...user, password: ''});
                        setOpenDialog(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    
                    {user.role === 'supervisor' && (
                      <IconButton 
                        size="small" 
                        color="secondary" 
                        onClick={() => handleManageSupervisor(user)}
                      >
                        <People />
                      </IconButton>
                    )}
                    
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => handleDeleteUser(user.id, user.name)}
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

      {/* Diálogo Usuario */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Usuario" 
                value={newUser.username} 
                onChange={(e) => setNewUser({...newUser, username: e.target.value})} 
                disabled={!!editingUser} 
                required 
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label={editingUser ? 'Nueva Contraseña (dejar en blanco para no cambiar)' : 'Contraseña'} 
                type="password" 
                value={newUser.password} 
                onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                required={!editingUser} 
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Nombre" 
                value={newUser.name} 
                onChange={(e) => setNewUser({...newUser, name: e.target.value})} 
                required 
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select 
                  value={newUser.role} 
                  label="Rol" 
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  {roles.map(r => (
                    <MenuItem key={r.value} value={r.value}>
                      {r.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {editingUser && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select 
                    value={newUser.is_active} 
                    label="Estado" 
                    onChange={(e) => setNewUser({...newUser, is_active: e.target.value})}
                  >
                    <MenuItem value={true}>Activo</MenuItem>
                    <MenuItem value={false}>Inactivo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={editingUser ? handleUpdateUser : handleCreateUser}
            disabled={!newUser.username || !newUser.name || (!editingUser && !newUser.password)}
          >
            {editingUser ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo Supervisor */}
      <Dialog open={openSupervisorDialog} onClose={() => setOpenSupervisorDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SupervisorAccount />
            Operadores de {selectedSupervisor?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Selecciona los operadores que serán supervisados por {selectedSupervisor?.name}
          </Typography>
            
          {availableOperators.length === 0 && assignedOperators.length === 0 ? (
            <Alert severity="info" sx={{ my: 2 }}>
              No hay operadores disponibles en el sistema. Crea usuarios con rol "Operador".
            </Alert>
          ) : (
            <>
              {availableOperators.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                    Operadores Disponibles ({availableOperators.length}):
                  </Typography>
                  <List dense sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    {availableOperators.map((operator) => (
                      <ListItem key={operator.id} divider dense>
                        <Checkbox
                          size="small"
                          checked={selectedOperators.includes(operator.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOperators([...selectedOperators, operator.id]);
                            } else {
                              setSelectedOperators(selectedOperators.filter(id => id !== operator.id));
                            }
                          }}
                        />
                        <ListItemText
                          primary={operator.name}
                          secondary={`Usuario: ${operator.username}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
                
              {assignedOperators.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                    Operadores Actualmente Asignados ({assignedOperators.length}):
                  </Typography>
                  <List dense sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    {assignedOperators.map((operator) => (
                      <ListItem key={operator.id} divider dense>
                        <Checkbox
                          size="small"
                          checked={selectedOperators.includes(operator.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOperators([...selectedOperators, operator.id]);
                            } else {
                              setSelectedOperators(selectedOperators.filter(id => id !== operator.id));
                            }
                          }}
                        />
                        <ListItemText
                          primary={operator.name}
                          secondary={`Usuario: ${operator.username}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </>
          )}
            
          <Divider sx={{ my: 2 }} />
            
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">
              Total seleccionados: <strong>{selectedOperators.length}</strong> operadores
            </Typography>
            <Button 
              size="small" 
              onClick={() => setSelectedOperators([])}
              disabled={selectedOperators.length === 0}
            >
              Limpiar selección
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSupervisorDialog(false)}>Cancelar</Button>
          <Button startIcon={<Refresh />} onClick={handleRefresh}>
            Refrescar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAssignOperators}
            disabled={selectedOperators.length === 0}
          >
            Guardar Asignaciones
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersManagement;