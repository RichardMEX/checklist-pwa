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
  MenuItem
} from '@mui/material';
import {
  AccountCircle,
  ExitToApp,
  Assignment,
  Assessment,
  Notifications
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

// Componentes de Supervisor
import SupervisorDashboard from '../supervisor/SupervisorDashboard';
import ChecklistAssignment from '../supervisor/ChecklistAssignment';
import ReportsSupervisor from '../supervisor/ReportsSupervisor';
import NotificationsSupervisor from '../supervisor/NotificationsSupervisor';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`supervisor-tabpanel-${index}`}
      aria-labelledby={`supervisor-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SupervisorApp = () => {
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
    { label: 'Dashboard', icon: <Assessment />, component: <SupervisorDashboard /> },
    { label: 'Asignar Checklists', icon: <Assignment />, component: <ChecklistAssignment /> },
    { label: 'Reportes', icon: <Assessment />, component: <ReportsSupervisor /> },
    { label: 'Notificaciones', icon: <Notifications />, component: <NotificationsSupervisor /> }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Panel de Supervisor
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
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab.label} icon={tab.icon} />
          ))}
        </Tabs>
      </AppBar>

      <Container maxWidth="xl">
        {tabs.map((tab, index) => (
          <TabPanel key={index} value={currentTab} index={index}>
            {tab.component}
          </TabPanel>
        ))}
      </Container>
    </Box>
  );
};

export default SupervisorApp;