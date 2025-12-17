import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Box
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Warning,
  Info,
  CheckCircle
} from '@mui/icons-material';

const NotificationsPage = () => {
  const [notifications] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'Checklist pendiente',
      message: 'El checklist de arranque de máquina está pendiente',
      time: 'Hace 2 horas',
      read: false
    },
    {
      id: 2,
      type: 'info',
      title: 'Nuevo checklist asignado',
      message: 'Se te ha asignado un nuevo checklist de seguridad',
      time: 'Hace 1 día',
      read: true
    },
    {
      id: 3,
      type: 'success',
      title: 'Checklist completado',
      message: 'Checklist de producción completado correctamente',
      time: 'Hace 2 días',
      read: true
    }
  ]);

  const getIcon = (type) => {
    switch (type) {
      case 'warning':
        return <Warning color="warning" />;
      case 'info':
        return <Info color="info" />;
      case 'success':
        return <CheckCircle color="success" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getChipColor = (type) => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'success':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Notificaciones
      </Typography>

      <Card>
        <CardContent>
          <List>
            {notifications.map((notification) => (
              <ListItem key={notification.id} divider>
                <ListItemIcon>
                  {getIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" mb={1}>
                      <Typography variant="subtitle1">
                        {notification.title}
                      </Typography>
                      <Chip 
                        label={notification.type} 
                        color={getChipColor(notification.type)}
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                      {!notification.read && (
                        <Chip 
                          label="Nuevo" 
                          color="primary" 
                          size="small" 
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {notification.time}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;