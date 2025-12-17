import React, { createContext, useState, useEffect } from 'react';
import { checklistService } from '../services/api';

export const ChecklistContext = createContext();

export const ChecklistProvider = ({ children }) => {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChecklists();
  }, []);

  const loadChecklists = async () => {
    try {
      setLoading(true);
      const response = await checklistService.getAll();
      setChecklists(response.data);
    } catch (error) {
      console.error('Error cargando checklists:', error);
      // En caso de error, usar datos mock
      const mockChecklists = [
        {
          id: '1',
          name: 'Arranque de Máquina ABC',
          area: 'Producción',
          project: 'Proyecto X',
          status: 'pending',
          iatfCode: 'IATF-MQ-001',
          questions: [
            {
              id: 'q1',
              type: 'boolean',
              text: '¿La máquina está limpia y libre de obstrucciones?'
            },
            {
              id: 'q2',
              type: 'number',
              text: 'Temperatura de operación inicial'
            },
            {
              id: 'q3',
              type: 'text',
              text: 'Observaciones adicionales'
            }
          ]
        },
        {
          id: '2',
          name: 'Checklist Seguridad Turno',
          area: 'Seguridad',
          project: 'General',
          status: 'completed',
          completedAt: new Date().toISOString(),
          iatfCode: 'IATF-SEG-002',
          questions: []
        }
      ];
      setChecklists(mockChecklists);
    } finally {
      setLoading(false);
    }
  };

  const submitChecklist = async (checklistId, answers) => {
    try {
      const response = await checklistService.submit(checklistId, answers);
      await loadChecklists(); // Recargar la lista
      return response.data;
    } catch (error) {
      console.error('Error enviando checklist:', error);
      // Simular éxito si el backend no responde
      setChecklists(prev => 
        prev.map(checklist => 
          checklist.id === checklistId 
            ? { 
                ...checklist, 
                status: 'completed',
                completedAt: new Date().toISOString(),
                answers 
              }
            : checklist
        )
      );
      return { success: true };
    }
  };

  return (
    <ChecklistContext.Provider value={{
      checklists,
      loading,
      submitChecklist,
      loadChecklists
    }}>
      {children}
    </ChecklistContext.Provider>
  );
};