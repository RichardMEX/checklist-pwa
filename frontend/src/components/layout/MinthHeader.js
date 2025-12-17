import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  AccountCircle,
  ExitToApp,
  Checklist
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const MinthHeader = ({ onLogout, currentTab, onTabChange }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { currentUser } = useAuth();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        {/* Logo Minth */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
          <Checklist sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            Minth Checklists
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Información del usuario */}
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
    </AppBar>
  );
};

export default MinthHeader;