import React from 'react';
import { Typography, Paper, List, ListItem, ListItemText, Chip, Box } from '@mui/material';

const NotificationsOperator = () => {
  const notifications = [
    { id: 1, message: 'Recordatorio: Checklist de arranque pendiente', type: 'warning', time: 'Hace 15 min' },
    { id: 2, message: 'Checklist de seguridad completado', type: 'success', time: 'Hace 2 horas' },
    { id: 3, message: 'Nuevo checklist asignado', type: 'info', time: 'Hace 1 día' }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mis Notificaciones
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

export default NotificationsOperator;