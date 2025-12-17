import React from 'react';
import { Typography, Paper, List, ListItem, ListItemText, Chip, Box } from '@mui/material';

const NotificationsSupervisor = () => {
  const notifications = [
    { id: 1, message: 'Carlos López tiene checklist pendiente', type: 'warning', time: 'Hace 1 hora' },
    { id: 2, message: 'Ana Martínez completó checklist', type: 'success', time: 'Hace 2 horas' },
    { id: 3, message: 'Recordatorio: Revisar reportes semanales', type: 'info', time: 'Hace 1 día' }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Notificaciones de Mi Área
      </Typography>
      
      <Paper>
        <List>
          {notifications.map((notification) => (
            <ListItem key={notification.id} divider>
              <ListItemText
                primary={notification.message}
                secondary={notification.time}
              />
              <Chip 
                label={notification.type} 
                color={
                  notification.type === 'info' ? 'info' :
                  notification.type === 'success' ? 'success' : 'warning'
                }
                size="small"
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default NotificationsSupervisor;