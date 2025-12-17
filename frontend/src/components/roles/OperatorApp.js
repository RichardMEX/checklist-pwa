import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Tabs,
  Tab,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Badge
} from '@mui/material';
import {
  AccountCircle,
  ExitToApp,
  Checklist,
  Notifications
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

// Componentes de Operador
import OperatorChecklists from '../operator/OperatorChecklists';
import NotificationsOperator from '../operator/NotificationsOperator';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`operator-tabpanel-${index}`}
      aria-labelledby={`operator-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const OperatorApp = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentUser, logout } = useAuth();

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const tabs = [
    { 
      label: 'Mis Checklists', 
      icon: <Checklist />, 
      component: <OperatorChecklists />,
      badge: 3 // Número de checklists pendientes
    },
    { 
      label: 'Notificaciones', 
      icon: <Notifications />, 
      component: <NotificationsOperator />,
      badge: 5 // Número de notificaciones
    }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Panel de Operador
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {currentUser?.name}
          </Typography>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>Perfil</MenuItem>
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} />
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Toolbar>
        
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          variant="fullWidth"
        >
          {tabs.map((tab, index) => (
            <Tab 
              key={index} 
              label={
                <Badge badgeContent={tab.badge} color="error">
                  {tab.label}
                </Badge>
              } 
              icon={tab.icon} 
            />
          ))}
        </Tabs>
      </AppBar>

      <Container maxWidth="lg">
        {tabs.map((tab, index) => (
          <TabPanel key={index} value={currentTab} index={index}>
            {tab.component}
          </TabPanel>
        ))}
      </Container>
    </Box>
  );
};

export default OperatorApp;