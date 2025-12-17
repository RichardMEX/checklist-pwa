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
  Checklist,
  Dashboard,
  Category,
  Assignment,
  Assessment,
  Notifications,
  People
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

// Componentes de Admin
import AdminDashboard from '../admin/AdminDashboard';
import AreasManagement from '../admin/AreasManagement';
import ProjectsManagement from '../admin/ProjectsManagement';
import UsersManagement from '../admin/UsersManagement'; // ← Ahora maneja todos los usuarios
import ChecklistsManagement from '../admin/ChecklistsManagement';
import ReportsAdmin from '../admin/ReportsAdmin';
import NotificationsAdmin from '../admin/NotificationsAdmin';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminApp = () => {
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

  // 🎯 TABS ACTUALIZADAS - SIN REDUNDANCIAS
  const tabs = [
    { 
      label: 'Dashboard', 
      icon: <Dashboard />, 
      component: <AdminDashboard /> 
    },
    { 
      label: 'Áreas', 
      icon: <Category />, 
      component: <AreasManagement /> 
    },
    { 
      label: 'Proyectos', 
      icon: <Assignment />, 
      component: <ProjectsManagement /> 
    },
    { 
      label: 'Usuarios', 
      icon: <People />, 
      component: <UsersManagement /> // ← ÚNICA gestión de usuarios
    },
    { 
      label: 'Checklists', 
      icon: <Checklist />, 
      component: <ChecklistsManagement /> 
    },
    { 
      label: 'Reportes', 
      icon: <Assessment />, 
      component: <ReportsAdmin /> 
    },
    { 
      label: 'Notificaciones', 
      icon: <Notifications />, 
      component: <NotificationsAdmin /> 
    }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={3}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
            <Checklist sx={{ fontSize: 32, mr: 1 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              Minth Checklists
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Typography variant="body2" sx={{ mr: 2 }}>
            {currentUser?.name} | {currentUser?.role}
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
            <MenuItem onClick={handleClose}>Mi Perfil</MenuItem>
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} />
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Toolbar>

        {/* TABS SIMPLIFICADAS */}
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          textColor="inherit"
        >
          {tabs.map((tab, index) => (
            <Tab 
              key={index} 
              label={tab.label} 
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 2 }}>
        {tabs.map((tab, index) => (
          <TabPanel key={index} value={currentTab} index={index}>
            {tab.component}
          </TabPanel>
        ))}
      </Container>
    </Box>
  );
};

export default AdminApp;