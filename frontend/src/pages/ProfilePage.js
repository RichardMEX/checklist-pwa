import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Box
} from '@mui/material';
import {
  Person,
  Email,
  Business,
  Engineering
} from '@mui/icons-material';

const ProfilePage = () => {
  const user = {
    name: 'Operador Ejemplo',
    email: 'operador@empresa.com',
    role: 'Operador de Producción',
    area: 'Producción',
    employeeId: 'OP-001'
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Mi Perfil
      </Typography>

      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <Avatar sx={{ width: 64, height: 64, mr: 2 }}>
              {user.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6">{user.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {user.employeeId}
              </Typography>
            </Box>
          </Box>

          <List>
            <ListItem>
              <ListItemIcon>
                <Email />
              </ListItemIcon>
              <ListItemText 
                primary="Email" 
                secondary={user.email}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Business />
              </ListItemIcon>
              <ListItemText 
                primary="Área" 
                secondary={user.area}
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Engineering />
              </ListItemIcon>
              <ListItemText 
                primary="Puesto" 
                secondary={user.role}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;