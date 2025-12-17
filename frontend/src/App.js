import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import minthTheme from './theme/minthTheme';

// Importar componentes de roles
const AdminApp = React.lazy(() => import('./components/roles/AdminApp'));
const SupervisorApp = React.lazy(() => import('./components/roles/SupervisorApp'));
const OperatorApp = React.lazy(() => import('./components/roles/OperatorApp'));

// Componente de carga
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    flexDirection: 'column',
    backgroundColor: '#f8f9fa'
  }}>
    <div style={{ 
      width: '50px', 
      height: '50px', 
      border: '5px solid #f3f3f3',
      borderTop: '5px solid #0056b3',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '20px'
    }}></div>
    <h3 style={{ color: '#0056b3', margin: 0 }}>Minth Checklists</h3>
    <p style={{ color: '#666666', marginTop: '10px' }}>Cargando...</p>
    
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
);

function AppContent() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  // Renderizar aplicación según el rol
  const renderAppByRole = () => {
    switch (currentUser.role) {
      case 'admin':
        return (
          <React.Suspense fallback={<LoadingFallback />}>
            <AdminApp />
          </React.Suspense>
        );
      case 'supervisor':
        return (
          <React.Suspense fallback={<LoadingFallback />}>
            <SupervisorApp />
          </React.Suspense>
        );
      case 'operator':
        return (
          <React.Suspense fallback={<LoadingFallback />}>
            <OperatorApp />
          </React.Suspense>
        );
      default:
        return <LoginPage />;
    }
  };

  return renderAppByRole();
}

function App() {
  return (
    <ThemeProvider theme={minthTheme}>
      <CssBaseline />
      <div className="App" style={{ 
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        minHeight: '100vh'
      }}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </div>
    </ThemeProvider>
  );
}

export default App;