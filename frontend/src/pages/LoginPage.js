import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import { Checklist } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(username, password);
    if (!result.success) {
      setError(result.message);
    }
  };

  const fillDemoCredentials = (role) => {
    switch(role) {
      case 'admin':
        setUsername('Admin');
        setPassword('0000');
        break;
      case 'supervisor':
        setUsername('Supervisor');
        setPassword('1111');
        break;
      case 'operator':
        setUsername('Operador');
        setPassword('2222');
        break;
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Card elevation={6} sx={{ width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Checklist sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography component="h1" variant="h4" gutterBottom>
                Sistema de Checklists
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Ingrese sus credenciales para acceder
              </Typography>
            </Box>
    
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
    
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </Box>
    
            <Box sx={{ mt: 3, borderTop: 1, borderColor: 'divider', pt: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Credenciales de demo:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => fillDemoCredentials('admin')}
                >
                  Admin (0000)
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => fillDemoCredentials('supervisor')}
                >
                  Supervisor (1111)
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => fillDemoCredentials('operator')}
                >
                  Operador (2222)
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginPage;