import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Grid,
  Card,
  CardContent,
  Alert,
  Avatar,
  CardMedia,
  CircularProgress
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
  CloudUpload,
  Image as ImageIcon,
  Warning
} from '@mui/icons-material';
import { apiService } from '../../services/realApiService';

const compressImage = (base64String, maxWidth = 1200, quality = 0.8, compressThreshold = 3 * 1024 * 1024) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Calcular tamaño aproximado en bytes (base64 tiene ~33% overhead)
      const base64Size = base64String.length;
      const approxBytes = (base64Size * 3) / 4; // Aproximación del tamaño real
      
      console.log(`📊 Tamaño imagen: ${Math.round(approxBytes / 1024 / 1024 * 100) / 100}MB (${base64Size} chars base64)`);
      
      // Si la imagen es menor al threshold, devolverla sin comprimir
      if (approxBytes < compressThreshold) {
        console.log(`✅ Imagen menor a 3MB, sin compresión necesaria`);
        resolve(base64String);
        return;
      }
      
      console.log(`🔧 Comprimiendo imagen (${Math.round(approxBytes / 1024 / 1024 * 100) / 100}MB > 3MB)`);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calcular nuevo tamaño manteniendo relación de aspecto
      let width = img.width;
      let height = img.height;
      
      // Solo redimensionar si es más ancha que maxWidth
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
        console.log(`📏 Redimensionando: ${img.width}x${img.height} → ${width}x${height}`);
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height);
      
      // Determinar formato basado en el original
      const originalFormat = base64String.substring(11, 14); // "data:image/XXX"
      let format = 'image/jpeg';
      let finalQuality = quality;
      
      if (originalFormat.includes('png')) {
        format = 'image/png';
        finalQuality = undefined; // PNG no tiene parámetro de calidad
      } else if (originalFormat.includes('gif')) {
        format = 'image/gif';
        finalQuality = undefined;
      }
      
      // Convertir con el formato apropiado
      const compressedBase64 = canvas.toDataURL(format, finalQuality);
      const compressedSize = compressedBase64.length;
      const compressedBytes = (compressedSize * 3) / 4;
      
      console.log(`✅ Compresión: ${Math.round(approxBytes / 1024)}KB → ${Math.round(compressedBytes / 1024)}KB`);
      console.log(`📉 Reducción: ${Math.round((1 - compressedBytes / approxBytes) * 100)}%`);
      
      resolve(compressedBase64);
    };
    
    img.onerror = (error) => {
      console.error('❌ Error cargando imagen para compresión:', error);
      reject(error);
    };
    
    img.src = base64String;
  });
};

const ChecklistsManagement = () => {
  const [checklists, setChecklists] = useState([]);
  const [projects, setProjects] = useState([]);
  const [areas, setAreas] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState(null);
  const [newChecklist, setNewChecklist] = useState({
    name: '',
    description: '',
    area_id: '',
    project_id: '',
    iatf_code: '',
    questions: []
  });
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState({});

  // Cargar checklists, proyectos y áreas
  const loadData = async () => {
    try {
      setLoadingData(true);
      setError('');
      
      console.log('🔄 Cargando datos para checklist...');
      
      const [checklistsResponse, projectsResponse, areasResponse] = await Promise.all([
        apiService.getAllChecklists(),
        apiService.getProjects(),
        apiService.getAreas()
      ]);

      // Procesar checklists
      if (checklistsResponse.data.success) {
        const checklistsData = checklistsResponse.data.checklists || [];
        console.log(`📋 ${checklistsData.length} checklists cargados`);
        
        // Contar preguntas con imágenes
        const totalQuestionsWithImages = checklistsData.reduce((sum, checklist) => {
          return sum + (Array.isArray(checklist.questions) 
            ? checklist.questions.filter(q => q.hasImage).length 
            : 0);
        }, 0);
        
        console.log(`📸 Total preguntas con imágenes (metadata): ${totalQuestionsWithImages}`);
        
        setChecklists(checklistsData);
      }

      // ... resto del código para proyectos y áreas ...

    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      setError('Error cargando datos: ' + error.message);
      setChecklists([]);
      setProjects([]);
      setAreas([]);
    } finally {
      setLoading(false);
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Función para recargar proyectos y áreas
  const reloadProjectsAndAreas = async () => {
    try {
      console.log('🔄 Recargando proyectos y áreas...');
      
      const [projectsResponse, areasResponse] = await Promise.all([
        apiService.getProjects(),
        apiService.getAreas()
      ]);

      if (projectsResponse.data.success) {
        setProjects(projectsResponse.data.projects || []);
      }
      
      if (areasResponse.data.success) {
        setAreas(areasResponse.data.areas || []);
      }
      
      return { 
        projectsLoaded: projectsResponse.data.success, 
        areasLoaded: areasResponse.data.success 
      };
    } catch (error) {
      console.error('❌ Error recargando datos:', error);
      return { projectsLoaded: false, areasLoaded: false };
    }
  };

  // Manejar subida de imagen para pregunta
  const handleImageUpload = async (questionId, event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validar que sea una imagen
  if (!file.type.match('image.*')) {
    setError('Por favor selecciona solo archivos de imagen (JPEG, PNG, GIF)');
    return;
  }

  // Validar tamaño máximo (10MB ahora, ya que comprimiremos si es necesario)
  if (file.size > 10 * 1024 * 1024) {
    setError('La imagen no debe superar los 10MB');
    return;
  }

  try {
    // Crear URL para previsualización temporal
    const tempUrl = URL.createObjectURL(file);
    setImagePreview(prev => ({
      ...prev,
      [questionId]: tempUrl
    }));

    // Leer como base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const originalBase64 = e.target.result;
      
      try {
        // Comprimir solo si es mayor a 3MB
        const finalBase64 = await compressImage(originalBase64, 1200, 0.8, 3 * 1024 * 1024);
        
        // Calcular si se comprimió
        const wasCompressed = finalBase64 !== originalBase64;
        const originalSizeKB = Math.round(file.size / 1024);
        const finalSizeKB = Math.round(finalBase64.length / 1024 * 0.75); // Aproximación
        
        // Actualizar previsualización
        setImagePreview(prev => ({
          ...prev,
          [questionId]: finalBase64
        }));
        
        // Actualizar pregunta
        updateQuestion(questionId, 'image', finalBase64);
        updateQuestion(questionId, 'imageName', file.name);
        updateQuestion(questionId, 'originalSize', file.size);
        updateQuestion(questionId, 'wasCompressed', wasCompressed);
        
        if (wasCompressed) {
          updateQuestion(questionId, 'compressedSize', finalBase64.length);
          console.log(`✅ Imagen comprimida: ${file.name} (${originalSizeKB}KB → ${finalSizeKB}KB)`);
        } else {
          console.log(`✅ Imagen conservada sin compresión: ${file.name} (${originalSizeKB}KB)`);
        }
        
      } catch (compressionError) {
        console.error('❌ Error procesando imagen:', compressionError);
        // Usar imagen original si falla el procesamiento
        setImagePreview(prev => ({
          ...prev,
          [questionId]: originalBase64
        }));
        updateQuestion(questionId, 'image', originalBase64);
        updateQuestion(questionId, 'imageName', file.name);
        updateQuestion(questionId, 'originalSize', file.size);
        updateQuestion(questionId, 'wasCompressed', false);
      }
      
      // Liberar URL temporal
      URL.revokeObjectURL(tempUrl);
    };
    
    reader.readAsDataURL(file);
    
  } catch (error) {
    console.error('❌ Error procesando imagen:', error);
    setError('Error procesando la imagen: ' + error.message);
  }
};

  // Eliminar imagen de pregunta
  const handleRemoveImage = (questionId) => {
    setImagePreview(prev => {
      const newPreview = { ...prev };
      delete newPreview[questionId];
      return newPreview;
    });
    
    updateQuestion(questionId, 'image', null);
    updateQuestion(questionId, 'imageName', '');
  };

  const handleCreateChecklist = async () => {
    try {
      console.log('➕ Creando checklist:', newChecklist);
      
      // Validar campos obligatorios
      const errors = [];
      if (!newChecklist.name.trim()) errors.push('Nombre del checklist');
      if (!newChecklist.iatf_code.trim()) errors.push('Código IATF');
      if (!newChecklist.area_id) errors.push('Área');
      if (!newChecklist.project_id) errors.push('Proyecto');
      if (!newChecklist.description.trim()) errors.push('Descripción');
      
      if (errors.length > 0) {
        setError(`Los siguientes campos son obligatorios: ${errors.join(', ')}`);
        return;
      }

      // Validar preguntas
      if (newChecklist.questions.length === 0) {
        setError('Debes agregar al menos una pregunta');
        return;
      }

      // Validar cada pregunta
      const questionErrors = [];
      newChecklist.questions.forEach((q, index) => {
        if (!q.text.trim()) {
          questionErrors.push(`Pregunta ${index + 1} no tiene texto`);
        }
      });
      
      if (questionErrors.length > 0) {
        setError(questionErrors.join(', '));
        return;
      }

      // Preparar datos para enviar
      const checklistData = {
        name: newChecklist.name,
        description: newChecklist.description,
        area_id: newChecklist.area_id,
        project_id: newChecklist.project_id,
        iatf_code: newChecklist.iatf_code,
        questions: newChecklist.questions.map(q => ({
          id: q.id,
          type: q.type,
          text: q.text,
          image: q.image || null,
          imageName: q.imageName || ''
        }))
      };

      console.log('📤 Enviando checklist:', checklistData);
      const response = await apiService.createChecklist(checklistData);
      console.log('✅ Checklist creado:', response.data);

      if (response.data.success) {
        await loadData();
        setOpenDialog(false);
        resetForm();
      }
    } catch (error) {
      console.error('❌ Error creando checklist:', error);
      setError('Error creando checklist: ' + error.message);
    }
  };

const handleEditChecklist = async (checklist) => {
  try {
    console.log('✏️ Editando checklist ID:', checklist.id);
    
    // 1. Cargar el checklist COMPLETO con imágenes
    console.log('🔄 Cargando checklist completo...');
    const response = await apiService.getChecklistById(checklist.id);
    
    if (!response.data.success) {
      throw new Error('No se pudo cargar el checklist completo');
    }
    
    const fullChecklist = response.data.checklist;
    console.log('✅ Checklist completo cargado:', {
      id: fullChecklist.id,
      name: fullChecklist.name,
      questionsCount: fullChecklist.questions?.length || 0
    });
    
    // 2. Preparar previsualizaciones de imágenes
    const previews = {};
    const questions = Array.isArray(fullChecklist.questions) ? fullChecklist.questions : [];
    
    // Contar imágenes
    let imagesFound = 0;
    questions.forEach((q, index) => {
      if (q.image && q.image.startsWith('data:image/')) {
        previews[q.id] = q.image;
        imagesFound++;
        console.log(`📸 Imagen encontrada en pregunta ${index + 1}: ${q.imageName || 'sin nombre'}`);
      }
    });
    
    console.log(`📊 Total imágenes encontradas: ${imagesFound}`);
    setImagePreview(previews);
    
    // 3. Configurar el estado para edición
    setEditingChecklist(fullChecklist);
    setNewChecklist({ 
      ...fullChecklist,
      area_id: fullChecklist.area_id || '',
      project_id: fullChecklist.project_id || ''
    });
    setOpenDialog(true);
    
  } catch (error) {
    console.error('❌ Error cargando checklist para edición:', error);
    
    // Fallback: usar el checklist básico (sin imágenes)
    alert('No se pudieron cargar las imágenes del checklist. Puedes editar el texto pero las imágenes no estarán disponibles.');
    
    const previews = {};
    const questions = Array.isArray(checklist.questions) ? checklist.questions : [];
    
    questions.forEach(q => {
      // Solo mostrar imágenes si el checklist básico las tiene
      if (q.image && q.image.startsWith('data:image/')) {
        previews[q.id] = q.image;
      } else if (q.hasImage) {
        // Si tenía imagen pero no está en el objeto, mostrar mensaje
        console.warn(`⚠️ Pregunta ${q.id} tenía imagen pero no está disponible`);
      }
    });
    
    setImagePreview(previews);
    setEditingChecklist(checklist);
    
    // Asegurar que las preguntas tengan la estructura correcta
    const formattedQuestions = questions.map(q => ({
      id: q.id || `q${Date.now()}`,
      type: q.type || 'boolean',
      text: q.text || '',
      image: q.image || null,
      imageName: q.imageName || '',
      hasImage: q.hasImage || false
    }));
    
    setNewChecklist({ 
      ...checklist,
      questions: formattedQuestions,
      area_id: checklist.area_id || '',
      project_id: checklist.project_id || ''
    });
    setOpenDialog(true);
  }
};

  const handleUpdateChecklist = async () => {
    try {
      console.log('📝 Actualizando checklist:', editingChecklist.id);
      
      // Validar campos obligatorios
      const errors = [];
      if (!newChecklist.name.trim()) errors.push('Nombre del checklist');
      if (!newChecklist.iatf_code.trim()) errors.push('Código IATF');
      if (!newChecklist.area_id) errors.push('Área');
      if (!newChecklist.project_id) errors.push('Proyecto');
      if (!newChecklist.description.trim()) errors.push('Descripción');
      
      if (errors.length > 0) {
        setError(`Los siguientes campos son requeridos: ${errors.join(', ')}`);
        return;
      }

      // Validar preguntas
      if (newChecklist.questions.length === 0) {
        setError('Debes agregar al menos una pregunta');
        return;
      }

      const checklistData = {
        name: newChecklist.name,
        description: newChecklist.description,
        area_id: newChecklist.area_id,
        project_id: newChecklist.project_id,
        iatf_code: newChecklist.iatf_code,
        questions: newChecklist.questions.map(q => ({
          id: q.id,
          type: q.type,
          text: q.text,
          image: q.image || null,
          imageName: q.imageName || ''
        }))
      };

      const response = await apiService.updateChecklist(editingChecklist.id, checklistData);
      console.log('✅ Checklist actualizado:', response.data);

      if (response.data.success) {
        await loadData();
        setOpenDialog(false);
        setEditingChecklist(null);
        resetForm();
      }
    } catch (error) {
      console.error('❌ Error actualizando checklist:', error);
      setError('Error actualizando checklist: ' + error.message);
    }
  };

  const handleDeleteChecklist = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este checklist?')) {
      try {
        const response = await apiService.deleteChecklist(id);
        console.log('🗑️ Checklist eliminado:', response.data);

        if (response.data.success) {
          await loadData();
        }
      } catch (error) {
        console.error('❌ Error eliminando checklist:', error);
        setError('Error eliminando checklist: ' + error.message);
      }
    }
  };

  const handleSaveChecklist = () => {
    setError('');
    if (editingChecklist) {
      handleUpdateChecklist();
    } else {
      handleCreateChecklist();
    }
  };

  const addQuestion = () => {
    const questionId = `q${Date.now()}`;
    setNewChecklist(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: questionId,
          type: 'boolean',
          text: '',
          image: null,
          imageName: ''
        }
      ]
    }));
  };

  const updateQuestion = (questionId, field, value) => {
    setNewChecklist(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }));
  };

  const removeQuestion = (questionId) => {
    // Eliminar previsualización de imagen si existe
    if (imagePreview[questionId]) {
      setImagePreview(prev => {
        const newPreview = { ...prev };
        delete newPreview[questionId];
        return newPreview;
      });
    }
    
    setNewChecklist(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const resetForm = () => {
    setNewChecklist({
      name: '',
      description: '',
      area_id: '',
      project_id: '',
      iatf_code: '',
      questions: []
    });
    setImagePreview({});
    setError('');
  };

  // Función para verificar si todos los campos obligatorios están llenos
  const isFormValid = () => {
    return (
      newChecklist.name.trim() &&
      newChecklist.iatf_code.trim() &&
      newChecklist.area_id &&
      newChecklist.project_id &&
      newChecklist.description.trim() &&
      newChecklist.questions.length > 0 &&
      newChecklist.questions.every(q => q.text.trim())
    );
  };

  // Botón para recargar proyectos y áreas
  const RefreshDataButton = () => (
    <Button
      variant="outlined"
      size="small"
      onClick={async () => {
        const result = await reloadProjectsAndAreas();
        if (result.projectsLoaded && result.areasLoaded) {
          alert('Datos recargados correctamente');
        } else {
          alert('Error recargando datos');
        }
      }}
      sx={{ ml: 2 }}
    >
      Recargar Listas
    </Button>
  );

    // Función de tamaño de archivo
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Gestión de Checklists
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setEditingChecklist(null);
            resetForm();
            setOpenDialog(true);
          }}
          disabled={loadingData}
        >
          Nuevo Checklist
        </Button>
      </Box>

      {error && (
        <Alert 
          severity={error.includes('Error') ? "error" : "warning"} 
          sx={{ mb: 2 }} 
          onClose={() => setError('')}
          action={<RefreshDataButton />}
        >
          {error}
        </Alert>
      )}

      {loadingData && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CircularProgress size={20} sx={{ mr: 2 }} />
          <Typography>Cargando datos...</Typography>
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Área</TableCell>
              <TableCell>Proyecto</TableCell>
              <TableCell>Código IATF</TableCell>
              <TableCell>Preguntas</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                  <Typography sx={{ mt: 1 }}>Cargando checklists...</Typography>
                </TableCell>
              </TableRow>
            ) : checklists.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Warning color="warning" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography>No hay checklists creados.</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Crea el primer checklist
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              checklists.map((checklist) => (
                <TableRow key={checklist.id} hover>
                  <TableCell>
                    <Typography fontWeight="medium">{checklist.name}</Typography>
                    {checklist.description && (
                      <Typography variant="caption" color="textSecondary" display="block">
                        {checklist.description.length > 50 
                          ? `${checklist.description.substring(0, 50)}...` 
                          : checklist.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={checklist.area_name || 'Sin área'} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={checklist.project_name || 'Sin proyecto'} 
                      size="small" 
                      color="secondary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={checklist.iatf_code || 'N/A'}
                      size="small"
                      color="info"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={`${Array.isArray(checklist.questions) ? checklist.questions.length : 0} preguntas`}
                        size="small"
                      />
                      {Array.isArray(checklist.questions) && 
                      checklist.questions.some(q => q.hasImage) && (
                        <Tooltip title="Este checklist tiene imágenes">
                          <ImageIcon color="primary" fontSize="small" />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleEditChecklist(checklist)}
                      title="Editar"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteChecklist(checklist.id)}
                      title="Eliminar"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo para crear/editar checklist */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          {editingChecklist ? 'Editar Checklist' : 'Crear Nuevo Checklist'}
          <RefreshDataButton />
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre del Checklist *"
                value={newChecklist.name}
                onChange={(e) => setNewChecklist(prev => ({ ...prev, name: e.target.value }))}
                required
                error={!newChecklist.name.trim()}
                helperText={!newChecklist.name.trim() ? "Campo obligatorio" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Código IATF *"
                value={newChecklist.iatf_code}
                onChange={(e) => setNewChecklist(prev => ({ ...prev, iatf_code: e.target.value }))}
                placeholder="Ej: IATF-001"
                required
                error={!newChecklist.iatf_code.trim()}
                helperText={!newChecklist.iatf_code.trim() ? "Campo obligatorio" : ""}
              />
            </Grid>
            
            {/* Campo Área */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!newChecklist.area_id}>
                <InputLabel>Área *</InputLabel>
                <Select
                  value={newChecklist.area_id || ''}
                  label="Área *"
                  onChange={(e) => setNewChecklist(prev => ({ ...prev, area_id: e.target.value }))}
                  disabled={areas.length === 0}
                >
                  <MenuItem value="">
                    {areas.length === 0 ? "No hay áreas disponibles" : "Selecciona un área"}
                  </MenuItem>
                  {areas.map(area => (
                    <MenuItem key={area.id} value={area.id}>
                      {area.name} {area.description ? `- ${area.description}` : ''}
                    </MenuItem>
                  ))}
                </Select>
                {!newChecklist.area_id && (
                  <Typography variant="caption" color="error">
                    Campo obligatorio
                  </Typography>
                )}
                {areas.length === 0 && (
                  <Typography variant="caption" color="warning">
                    Ve a la pestaña "Áreas" para crear áreas primero
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            {/* Campo Proyecto */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!newChecklist.project_id}>
                <InputLabel>Proyecto *</InputLabel>
                <Select
                  value={newChecklist.project_id || ''}
                  label="Proyecto *"
                  onChange={(e) => setNewChecklist(prev => ({ ...prev, project_id: e.target.value }))}
                  disabled={projects.length === 0}
                >
                  <MenuItem value="">
                    {projects.length === 0 ? "No hay proyectos disponibles" : "Selecciona un proyecto"}
                  </MenuItem>
                  {projects.map(project => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name} {project.description ? `- ${project.description}` : ''}
                    </MenuItem>
                  ))}
                </Select>
                {!newChecklist.project_id && (
                  <Typography variant="caption" color="error">
                    Campo obligatorio
                  </Typography>
                )}
                {projects.length === 0 && (
                  <Typography variant="caption" color="warning">
                    Ve a la pestaña "Proyectos" para crear proyectos primero
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción *"
                multiline
                rows={3}
                value={newChecklist.description || ''}
                onChange={(e) => setNewChecklist(prev => ({ ...prev, description: e.target.value }))}
                required
                error={!newChecklist.description.trim()}
                helperText={!newChecklist.description.trim() ? "Campo obligatorio" : "Describe el propósito de este checklist"}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Preguntas *</Typography>
              <Button onClick={addQuestion} startIcon={<Add />} variant="outlined">
                Agregar Pregunta
              </Button>
            </Box>

          {newChecklist.questions.map((question, index) => (
            <Card key={question.id} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Grid container spacing={2} alignItems="flex-start">
                  {/* Número y texto de pregunta */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: 12, mr: 1 }}>
                        {index + 1}
                      </Avatar>
                      <Typography variant="subtitle2">
                        Pregunta {index + 1}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      label={`Texto de la pregunta *`}
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                      required
                      error={!question.text.trim()}
                      helperText={!question.text.trim() ? "Campo obligatorio" : ""}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Tipo de respuesta</InputLabel>
                      <Select
                        value={question.type}
                        label="Tipo de respuesta"
                        onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                      >
                        <MenuItem value="boolean">Sí/No</MenuItem>
                        <MenuItem value="number">Numérico</MenuItem>
                        <MenuItem value="text">Texto</MenuItem>
                        <MenuItem value="photo">Foto</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Mostrar advertencias de imágenes si existen */}
                  {question.imageError && (
                    <Grid item xs={12}>
                      <Alert 
                        severity="warning" 
                        sx={{ mt: 1 }}
                        action={
                          <Button 
                            size="small" 
                            color="inherit"
                            onClick={() => {
                              // Limpiar el error cuando el usuario haga clic
                              updateQuestion(question.id, 'imageError', '');
                              updateQuestion(question.id, 'image', null);
                              handleRemoveImage(question.id);
                            }}
                          >
                            OK
                          </Button>
                        }
                      >
                        <Typography variant="caption">
                          {question.imageError}
                        </Typography>
                      </Alert>
                    </Grid>
                  )}
                  
                  {/* Mostrar información de compresión si está disponible */}
                  {question.wasCompressed && question.originalSize && (
                    <Grid item xs={12}>
                      <Box sx={{ 
                        p: 1, 
                        bgcolor: '#e8f5e9', 
                        borderRadius: 1,
                        mt: 1,
                        border: '1px solid #c8e6c9'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 'medium' }}>
                            ⚡ Compresión aplicada automáticamente
                          </Typography>
                          <Chip 
                            label={`${Math.round((1 - (question.compressedSize * 0.75) / question.originalSize) * 100)}% reducido`}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="caption" color="textSecondary" display="block" mt={0.5}>
                          Tamaño original: {Math.round(question.originalSize / 1024)}KB → 
                          Comprimido: {Math.round((question.compressedSize * 0.75) / 1024)}KB
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  
                  {/* Si no se comprimió pero la imagen es grande, mostrar info */}
                  {!question.wasCompressed && question.originalSize && question.originalSize > 1024 * 1024 && (
                    <Grid item xs={12}>
                      <Box sx={{ 
                        p: 1, 
                        bgcolor: '#e3f2fd', 
                        borderRadius: 1,
                        mt: 1,
                        border: '1px solid #bbdefb'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" sx={{ color: '#1565c0', fontWeight: 'medium' }}>
                            ✅ Imagen optimizada
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="textSecondary" display="block" mt={0.5}>
                          Tamaño: {Math.round(question.originalSize / 1024)}KB (menor a 3MB, sin compresión necesaria)
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {/* Imagen de referencia */}
                  <Grid item xs={12}>
                    <Box sx={{ mt: 2, p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Imagen de referencia (opcional):
                      </Typography>
                      
                      {/* Si hay un error de imagen, mostrar mensaje especial */}
                      {question.imageError && question.imageError.includes('truncada') ? (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            ⚠️ La imagen anterior fue truncada por ser demasiado grande.
                          </Typography>
                          <Typography variant="caption" display="block" mt={1}>
                            Por favor, sube la imagen nuevamente.
                          </Typography>
                        </Alert>
                      ) : null}
                      
                      {imagePreview[question.id] ? (
                        <Box sx={{ position: 'relative', mt: 1 }}>
                          <CardMedia
                            component="img"
                            height="150"
                            image={imagePreview[question.id]}
                            alt="Previsualización"
                            sx={{ objectFit: 'contain', borderRadius: 1 }}
                            onError={(e) => {
                              // Si la imagen no se puede cargar (por truncamiento)
                              console.error('❌ Error cargando imagen:', question.id);
                              e.target.style.display = 'none';
                              
                              // Mostrar mensaje de error
                              updateQuestion(question.id, 'imageError', 'Error cargando imagen (posiblemente truncada)');
                              updateQuestion(question.id, 'image', null);
                            }}
                          />
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Button
                              size="small"
                              startIcon={<CloudUpload />}
                              component="label"
                              variant="outlined"
                            >
                              Cambiar imagen
                              <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={(e) => handleImageUpload(question.id, e)}
                              />
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              startIcon={<Delete />}
                              onClick={() => handleRemoveImage(question.id)}
                            >
                              Eliminar
                            </Button>
                          </Box>
                          {question.imageName && (
                            <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                              Archivo: {question.imageName}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Button
                          fullWidth
                          variant="outlined"
                          component="label"
                          startIcon={<CloudUpload />}
                          sx={{ 
                            height: 150, 
                            borderStyle: 'dashed',
                            borderColor: question.imageError ? 'error.main' : 'inherit'
                          }}
                        >
                          {question.imageError ? 'Re-subir imagen (anterior error)' : 'Subir imagen de referencia'}
                          <Typography variant="caption" display="block" mt={1}>
                            PNG, JPG (max 5MB)
                          </Typography>
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => handleImageUpload(question.id, e)}
                          />
                        </Button>
                      )}
                    </Box>
                  </Grid>
                  
                  {/* Botón eliminar pregunta */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <IconButton
                        color="error"
                        onClick={() => removeQuestion(question.id)}
                        size="small"
                      >
                        <Delete />
                        <Typography variant="caption" sx={{ ml: 0.5 }}>
                          Eliminar pregunta
                        </Typography>
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}

            {newChecklist.questions.length === 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Debes agregar al menos una pregunta al checklist.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} startIcon={<Cancel />}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveChecklist} 
            variant="contained" 
            startIcon={<Save />}
            disabled={!isFormValid()}
          >
            {editingChecklist ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChecklistsManagement;