import React from 'react';
import { Typography, Paper, Grid, Card, CardContent, Box } from '@mui/material';
import { Assessment, People, Checklist, Schedule } from '@mui/icons-material';

const SupervisorDashboard = () => {
  const stats = [
    { title: 'Checklists Pendientes', value: '8', icon: <Checklist />, color: 'warning' },
    { title: 'Operadores Activos', value: '5', icon: <People />, color: 'success' },
    { title: 'Completados Hoy', value: '12', icon: <Assessment />, color: 'primary' },
    { title: 'Vencidos', value: '2', icon: <Schedule />, color: 'error' }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard de Supervisor
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
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
          Resumen de Mi Área
        </Typography>
        <Typography>
          Bienvenido al panel de supervisor. Aquí puedes gestionar los checklists de tus operadores.
        </Typography>
      </Paper>
    </Box>
  );
};

export default SupervisorDashboard;