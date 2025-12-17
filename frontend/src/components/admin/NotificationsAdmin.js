import React from 'react';
import { Typography, Paper, List, ListItem, ListItemText, Chip, Box } from '@mui/material';

const NotificationsAdmin = () => {
  const notifications = [
    { id: 1, message: 'Nuevo checklist creado', type: 'info', time: 'Hace 2 horas' },
    { id: 2, message: 'Operador asignado a nueva área', type: 'success', time: 'Hace 1 día' },
    { id: 3, message: 'Checklist vencido en Producción', type: 'warning', time: 'Hace 2 días' }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Notificaciones del Sistema
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

export default NotificationsAdmin;