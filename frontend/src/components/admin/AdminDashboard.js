import React, { useState, useEffect } from 'react';
import { Typography, Paper, Grid, Card, CardContent, Box, CircularProgress } from '@mui/material';
import { Assessment, People, Checklist, Notifications, Category, Assignment } from '@mui/icons-material';
import { apiService } from '../../services/realApiService'; // Cambiar esta línea

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAreas: 0,
    totalProjects: 0,
    totalChecklists: 0,
    activeUsers: 0,
    pendingChecklists: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos en paralelo - USAR LOS NUEVOS NOMBRES DE MÉTODOS
      const [usersResponse, areasResponse, projectsResponse, checklistsResponse] = await Promise.all([
        apiService.getUsers(), // Cambiado de getUsers()
        apiService.getAreas(), // Cambiado de getAreas()
        apiService.getProjects(), // Cambiado de getProjects()
        apiService.getAllChecklists() // ¡IMPORTANTE! Cambiado de getAll()
      ]);
  
      const users = usersResponse.data.success ? usersResponse.data.users : [];
      const areas = areasResponse.data.success ? areasResponse.data.areas : [];
      const projects = projectsResponse.data.success ? projectsResponse.data.projects : [];
      //const checklists = checklistsResponse.data.success ? checklistsResponse.data.checklists : [];
    // Manejar error de checklists específicamente
    let checklists = [];
    if (checklistsResponse.data.success) {
      checklists = checklistsResponse.data.checklists || [];
    } else {
      console.warn('⚠️ No se pudieron cargar checklists:', checklistsResponse.data.error);
      // Puedes mostrar un mensaje al usuario si quieres
    }
  
      setStats({
        totalUsers: users.length,
        totalAreas: areas.length,
        totalProjects: projects.length,
        totalChecklists: checklists.length,
        activeUsers: users.filter(u => u.is_active).length,
        pendingChecklists: 0
      });
  
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    { title: 'Total Usuarios', value: stats.totalUsers, icon: <People />, color: 'primary' },
    { title: 'Usuarios Activos', value: stats.activeUsers, icon: <People />, color: 'success' },
    { title: 'Áreas', value: stats.totalAreas, icon: <Category />, color: 'secondary' },
    { title: 'Proyectos', value: stats.totalProjects, icon: <Assignment />, color: 'info' },
    { title: 'Checklists', value: stats.totalChecklists, icon: <Checklist />, color: 'warning' },
    { title: 'Pendientes', value: stats.pendingChecklists, icon: <Assessment />, color: 'error' }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard de Administración
      </Typography>
        
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {dashboardStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ mr: 2, color: `${stat.color}.main` }}>
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resumen General
        </Typography>
        <Typography paragraph>
          Bienvenido al panel de administración. Desde aquí puedes gestionar todas las áreas del sistema.
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Usuarios registrados: {stats.totalUsers} | Áreas activas: {stats.totalAreas} | 
          Proyectos: {stats.totalProjects} | Checklists: {stats.totalChecklists}
        </Typography>
      </Paper>
    </Box>
  );
};

export default AdminDashboard;