import React, { useState } from 'react';
import {
  Typography, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Chip, Box
} from '@mui/material';
import { Assignment, Edit } from '@mui/icons-material';

const ChecklistAssignment = () => {
  const [assignments] = useState([
    { id: '1', checklist: 'Arranque Máquina ABC', operator: 'Carlos López', frequency: 'Cada hora', status: 'Activo' },
    { id: '2', checklist: 'Checklist Seguridad', operator: 'Ana Martínez', frequency: 'Diario', status: 'Activo' }
  ]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Asignación de Checklists
        </Typography>
        <Button variant="contained" startIcon={<Assignment />}>
          Asignar Checklist
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Checklist</TableCell>
              <TableCell>Operador</TableCell>
              <TableCell>Frecuencia</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell>{assignment.checklist}</TableCell>
                <TableCell>{assignment.operator}</TableCell>
                <TableCell>
                  <Chip label={assignment.frequency} size="small" />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={assignment.status} 
                    color={assignment.status === 'Activo' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton color="primary">
                    <Edit />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ChecklistAssignment;