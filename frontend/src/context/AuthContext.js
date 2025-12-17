import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiService } from '../services/realApiService'; // Cambiar esta importación

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('🔐 Verificando autenticación, token presente:', !!token);
      
      if (token) {
        const response = await apiService.getMe();
        console.log('✅ Usuario autenticado:', response.data.user);
        setCurrentUser(response.data.user);
      } else {
        console.log('🔓 No hay sesión activa');
      }
    } catch (error) {
      console.log('❌ Error verificando autenticación:', error);
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
      console.log('🏁 Carga de autenticación completada');
    }
  };

  const login = async (username, password) => {
    try {
      console.log('🔐 Intentando login para:', username);
      const response = await apiService.login(username, password);
      
      if (response.data.success) {
        console.log('✅ Login exitoso');
        setCurrentUser(response.data.user);
        localStorage.setItem('authToken', response.data.token);
        return { success: true };
      } else {
        console.log('❌ Login fallido:', response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.log('❌ Error de conexión en login:', error);
      return { success: false, message: 'Error de conexión' };
    }
  };

  const logout = () => {
    console.log('🚪 Cerrando sesión');
    setCurrentUser(null);
    localStorage.removeItem('authToken');
  };

  const value = {
    currentUser,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};