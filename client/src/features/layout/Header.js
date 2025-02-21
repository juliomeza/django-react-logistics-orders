import React, { useState, useContext } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import AuthContext from '../../features/auth/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);

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

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Nombre del Cliente */}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Nombre del Cliente
        </Typography>
        {/* Avatar del Usuario */}
        <IconButton color="inherit" onClick={handleMenuOpen}>
          <Avatar>
            {user && user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
          </Avatar>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
