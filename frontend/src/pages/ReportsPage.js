import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Box
} from '@mui/material';
import { Assessment, CheckCircle, Pending } from '@mui/icons-material';

const ReportsPage = () => {
  const reportData = {
    weekly: {
      period: 'Semana 45 - 2023',
      total: 15,
      completed: 12,
      pending: 3,
      rate: 80
    },
    monthly: {
      period: 'Noviembre 2023',
      total: 60,
      completed: 48,
      pending: 12,
      rate: 80
    }
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Reportes y Estadísticas
      </Typography>

      <Grid container spacing={3}>
        {/* Reporte Semanal */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Reporte Semanal
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {reportData.weekly.period}
              </Typography>
              
              <Box display="flex" alignItems="center" mb={2}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Completados: {reportData.weekly.completed}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" mb={2}>
                <Pending color="warning" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Pendientes: {reportData.weekly.pending}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" gutterBottom>
                  Tasa de completado: {reportData.weekly.rate}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={reportData.weekly.rate} 
                  color="success"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Reporte Mensual */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Reporte Mensual
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {reportData.monthly.period}
              </Typography>
              
              <Box display="flex" alignItems="center" mb={2}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Completados: {reportData.monthly.completed}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" mb={2}>
                <Pending color="warning" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Pendientes: {reportData.monthly.pending}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" gutterBottom>
                  Tasa de completado: {reportData.monthly.rate}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={reportData.monthly.rate} 
                  color="success"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default ReportsPage;