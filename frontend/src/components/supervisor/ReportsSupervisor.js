import React from 'react';
import { Typography, Paper, Grid, Box } from '@mui/material';

const ReportsSupervisor = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reportes de Supervisor
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cumplimiento de Mi Equipo
            </Typography>
            <Typography>
              Reporte de cumplimiento de checklists por operador...
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tendencias Semanales
            </Typography>
            <Typography>
              Análisis de tendencias de cumplimiento...
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportsSupervisor;