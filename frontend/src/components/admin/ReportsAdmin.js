import React from 'react';
import { Typography, Paper, Grid, Box } from '@mui/material';

const ReportsAdmin = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reportes de Administración
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cumplimiento por Área
            </Typography>
            <Typography>
              Gráfico de cumplimiento de checklists por área...
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Estadísticas de Uso
            </Typography>
            <Typography>
              Estadísticas generales del sistema...
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportsAdmin;