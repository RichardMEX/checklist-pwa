import React, { useState } from 'react';
import {
  Typography, Paper, Button, Card, CardContent, Grid, Box, Chip
} from '@mui/material';
import { PlayArrow, CheckCircle, Schedule } from '@mui/icons-material';

const OperatorChecklists = () => {
  const [checklists] = useState([
    { id: '1', name: 'Arranque de Máquina ABC', area: 'Producción', status: 'pending', due: 'En 30 min' },
    { id: '2', name: 'Checklist Seguridad', area: 'Seguridad', status: 'completed', due: 'Completado' },
    { id: '3', name: 'Control Calidad', area: 'Calidad', status: 'pending', due: 'En 2 horas' }
  ]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mis Checklists
      </Typography>
      
      <Grid container spacing={3}>
        {checklists.map((checklist) => (
          <Grid item xs={12} key={checklist.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6">{checklist.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {checklist.area}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        icon={checklist.status === 'pending' ? <Schedule /> : <CheckCircle />}
                        label={checklist.status === 'pending' ? 'Pendiente' : 'Completado'}
                        color={checklist.status === 'pending' ? 'warning' : 'success'}
                        size="small"
                      />
                      <Chip 
                        label={checklist.due}
                        variant="outlined"
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </Box>
                  {checklist.status === 'pending' && (
                    <Button
                      variant="contained"
                      startIcon={<PlayArrow />}
                    >
                      Comenzar
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default OperatorChecklists;