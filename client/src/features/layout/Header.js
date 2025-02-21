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
  Box,
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { Logout, Settings, Person } from '@mui/icons-material'; // Iconos de MUI
import AuthContext from '../../features/auth/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);

  // Ejemplo: Nombre completo y compañía (placeholder)
  const fullName = user
    ? `${user.first_name} ${user.last_name}`
    : 'Usuario Invitado';
  const companyName = 'ABC Logistics'; // Podrías obtenerlo de otra API

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

  // Ejemplo: si quisieras un link a "Mi Perfil" o "Configuración"
  const handleProfile = () => {
    handleMenuClose();
    // Lógica para ir a la página de perfil
  };

  const handleSettings = () => {
    handleMenuClose();
    // Lógica para ir a la página de configuración
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Crear Orden
          </Typography>

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
            {/* Encabezado dentro del menú (nombre + compañía) */}
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle1">{fullName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {companyName}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />

            {/* Opciones de menú (Perfil, Configuración, etc.) */}
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

            {/* Logout en rojo con ícono */}
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
