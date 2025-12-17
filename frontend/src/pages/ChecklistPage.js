import React, { useState, useContext, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  TextField,
  RadioGroup,
  Radio,
  FormLabel
} from '@mui/material';
import { PlayArrow, CheckCircle, Pending } from '@mui/icons-material';
import { ChecklistContext } from '../context/ChecklistContext';

const ChecklistPage = () => {
  const { checklists, submitChecklist } = useContext(ChecklistContext);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [answers, setAnswers] = useState({});
  const [openDialog, setOpenDialog] = useState(false);

  const pendingChecklists = checklists.filter(c => c.status === 'pending');
  const completedChecklists = checklists.filter(c => c.status === 'completed');

  const handleStartChecklist = (checklist) => {
    setSelectedChecklist(checklist);
    setAnswers({});
    setOpenDialog(true);
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      await submitChecklist(selectedChecklist.id, answers);
      setOpenDialog(false);
      setSelectedChecklist(null);
      setAnswers({});
    } catch (error) {
      console.error('Error al enviar checklist:', error);
    }
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case 'boolean':
        return (
          <RadioGroup
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          >
            <FormControlLabel value="si" control={<Radio />} label="Sí" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
        );
      case 'number':
        return (
          <TextField
            type="number"
            fullWidth
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            margin="normal"
          />
        );
      case 'text':
        return (
          <TextField
            fullWidth
            multiline
            rows={3}
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            margin="normal"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Mis Checklists
      </Typography>

      {/* Checklists Pendientes */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Pendientes ({pendingChecklists.length})
      </Typography>
      <Grid container spacing={2}>
        {pendingChecklists.map((checklist) => (
          <Grid item xs={12} key={checklist.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6">{checklist.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {checklist.area} - {checklist.project}
                    </Typography>
                    <Chip 
                      icon={<Pending />} 
                      label="Pendiente" 
                      color="warning" 
                      size="small" 
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrow />}
                    onClick={() => handleStartChecklist(checklist)}
                  >
                    Comenzar
                  </Button>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={0} 
                  sx={{ mt: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Checklists Completados */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Completados ({completedChecklists.length})
      </Typography>
      <Grid container spacing={2}>
        {completedChecklists.map((checklist) => (
          <Grid item xs={12} key={checklist.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6">{checklist.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {checklist.area} - {checklist.project}
                    </Typography>
                    <Chip 
                      icon={<CheckCircle />} 
                      label="Completado" 
                      color="success" 
                      size="small" 
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(checklist.completedAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Diálogo para llenar checklist */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {selectedChecklist?.name}
        </DialogTitle>
        <DialogContent>
          {selectedChecklist?.questions?.map((question, index) => (
            <Box key={question.id} sx={{ mb: 3 }}>
              <FormLabel component="legend">
                {index + 1}. {question.text}
              </FormLabel>
              {renderQuestion(question)}
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== selectedChecklist?.questions?.length}
          >
            Enviar Checklist
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ChecklistPage;