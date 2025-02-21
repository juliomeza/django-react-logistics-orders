import React, { useState, useContext } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Container,
  Tabs,
  Tab,
  Box,
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { Logout, Settings, Person } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../../features/auth/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  // Datos del usuario (nombre y compañía, de ejemplo)
  const fullName = user
    ? `${user.first_name} ${user.last_name}`
    : 'Usuario Invitado';
  const companyName = 'ABC Logistics';

  // Determinar la pestaña activa según la ruta
  const currentTab =
    location.pathname === '/dashboard'
      ? 0
      : location.pathname === '/create-order'
      ? 1
      : 0;

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleProfile = () => {
    handleMenuClose();
    // Lógica para ir a "Mi Perfil"
  };

  const handleSettings = () => {
    handleMenuClose();
    // Lógica para ir a "Configuración"
  };

  const handleTabChange = (event, newValue) => {
    if (newValue === 0) {
      navigate('/dashboard');
    } else if (newValue === 1) {
      navigate('/create-order');
    }
  };

  return (
    <AppBar position="fixed" color="default" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar>
          {/* Puedes mantener el título o logo aquí */}
          <Typography variant="h6" sx={{ mr: 4 }}>
            Granules Pharma
          </Typography>

          {/* Menú de navegación con Tabs */}
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{ flexGrow: 1 }}
          >
            <Tab label="Dashboard" />
            <Tab label="Create Order" />
          </Tabs>

          {/* Avatar y menú de usuario */}
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <Avatar>
              {user && user.first_name
                ? user.first_name.charAt(0).toUpperCase()
                : 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle1">{fullName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {companyName}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText>Mi Perfil</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleSettings}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText>Configuración</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <ListItemIcon sx={{ color: 'error.main' }}>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText>Cerrar Sesión</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
