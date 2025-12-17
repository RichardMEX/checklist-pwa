const db = require('../config/database');

const ChecklistController = {
  // Obtener todos los checklists - VERSIÓN CORREGIDA
  async getAllChecklists(req, res) {
  try {
    console.log('📋 Obteniendo todos los checklists...');
    
    const result = await db.query(`
      SELECT 
        ct.*,
        a.name as area_name,
        p.name as project_name,
        u.name as created_by_name
      FROM checklist_templates ct
      LEFT JOIN areas a ON ct.area_id = a.id
      LEFT JOIN projects p ON ct.project_id = p.id
      LEFT JOIN users u ON ct.created_by = u.id
      ORDER BY ct.created_at DESC
    `);
    
    console.log(`✅ ${result.rows.length} checklists encontrados`);
    
    // Parsear questions pero LIMPIAR imágenes (solo mantener metadata)
    const checklists = result.rows.map(checklist => {
      try {
        let questions = [];
        if (checklist.questions) {
          if (typeof checklist.questions === 'string') {
            questions = JSON.parse(checklist.questions);
          } else if (typeof checklist.questions === 'object') {
            questions = checklist.questions;
          }
        }
        
        // Limpiar imágenes grandes, mantener solo metadata
        const cleanedQuestions = questions.map(q => {
          const cleaned = { ...q };
          
          if (cleaned.image) {
            // Guardar solo que tiene imagen, no la imagen completa
            cleaned.hasImage = true;
            cleaned.imageSize = cleaned.image.length;
            // Eliminar el base64 completo para reducir tamaño
            delete cleaned.image;
          } else {
            cleaned.hasImage = false;
          }
          
          return cleaned;
        });
        
        return {
          ...checklist,
          questions: Array.isArray(cleanedQuestions) ? cleanedQuestions : []
        };
      } catch (parseError) {
        console.error(`❌ Error parseando questions del checklist ${checklist.id}:`, parseError);
        return {
          ...checklist,
          questions: []
        };
      }
    });

    res.json({ 
      success: true, 
      checklists,
      metadata: {
        total: checklists.length,
        message: 'Las imágenes no están incluidas en esta lista. Usa getChecklistById para obtener imágenes completas.'
      }
    });
    
  } catch (error) {
    console.error('Error obteniendo checklists:', error);
    res.status(500).json({ success: false, error: error.message });
  }
},

  // Crear nuevo checklist - VERSIÓN CORREGIDA
  async createChecklist(req, res) {
    try {
      const { name, description, area_id, project_id, iatf_code, questions } = req.body;
      
      console.log('📝 Creando checklist con datos:', {
        name, 
        description: description?.substring(0, 50) + '...',
        area_id, 
        project_id, 
        iatf_code,
        questionsCount: questions ? questions.length : 0
      });

      // Validar campos obligatorios
      const requiredFields = { name, description, area_id, project_id, iatf_code };
      const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => !value)
        .map(([key]) => key);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Campos obligatorios faltantes: ${missingFields.join(', ')}`
        });
      }

      // Validar que haya preguntas
      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'El checklist debe contener al menos una pregunta'
        });
      }

      // Validar cada pregunta
      const invalidQuestions = questions
        .map((q, index) => ({ q, index }))
        .filter(({ q }) => !q.text || !q.text.trim());
      
      if (invalidQuestions.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Las siguientes preguntas no tienen texto: ${invalidQuestions.map(({ index }) => index + 1).join(', ')}`
        });
      }

      // Procesar preguntas - limitar tamaño de imágenes
      const processedQuestions = questions.map(q => {
        const processed = { ...q };
        
      // Si la imagen está truncada, elimínala
  if (q.image && q.image.includes('[TRUNCATED]')) {
    console.warn(`⚠️ Imagen truncada detectada, eliminando de pregunta: ${q.text?.substring(0, 30)}...`);
    processed.image = null;
    processed.imageError = 'Imagen fue truncada en edición anterior';
  }
  
  // Validar que sea base64 válida
  if (q.image && !q.image.startsWith('data:image/')) {
    console.warn(`⚠️ Imagen no es base64 válida: ${q.text?.substring(0, 30)}...`);
    processed.image = null;
  }
        
        return processed;
      });

      // Verificar si la columna area_id existe
      const tableInfo = await db.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'checklist_templates' 
        AND column_name IN ('area_id', 'project_id')
      `);
      
      const hasAreaId = tableInfo.rows.some(r => r.column_name === 'area_id');
      const hasProjectId = tableInfo.rows.some(r => r.column_name === 'project_id');
      
      // Construir query dinámicamente
      let columns = ['name', 'description', 'iatf_code', 'questions', 'created_by'];
      let values = [name, description, iatf_code, JSON.stringify(processedQuestions), 1];
      let placeholders = ['$1', '$2', '$3', '$4', '$5'];
      
      if (hasAreaId) {
        columns.push('area_id');
        values.push(area_id);
        placeholders.push(`$${values.length}`);
      }
      
      if (hasProjectId) {
        columns.push('project_id');
        values.push(project_id);
        placeholders.push(`$${values.length}`);
      }
      
      const query = `
        INSERT INTO checklist_templates (${columns.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING *
      `;
      
      console.log('📝 Query INSERT:', query);
      console.log('📦 Valores:', values);

      const result = await db.query(query, values);
      
      // Parsear questions para la respuesta
      const createdChecklist = {
        ...result.rows[0],
        questions: processedQuestions
      };

      res.status(201).json({
        success: true,
        checklist: createdChecklist,
        message: 'Checklist creado exitosamente'
      });
    } catch (error) {
      console.error('❌ Error detallado creando checklist:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message,
        hint: 'Verifica que las columnas area_id y project_id existan en la tabla'
      });
    }
  },

  // Actualizar checklist
  async updateChecklist(req, res) {
    try {
      const { id } = req.params;
      const { name, description, area_id, project_id, iatf_code, questions } = req.body;

      console.log('📝 Actualizando checklist ID:', id);
      console.log('📊 Datos recibidos para update:');
      console.log('- Nombre:', name);
      console.log('- Descripción:', description?.substring(0, 50) + '...');
      console.log('- Área ID:', area_id);
      console.log('- Proyecto ID:', project_id);
      console.log('- Código IATF:', iatf_code);
      console.log('- Número de preguntas:', questions?.length || 0);

      // DEBUG: Verificar imágenes en las preguntas recibidas
      if (questions && Array.isArray(questions)) {
        const imagesInfo = questions
          .map((q, index) => ({
            index,
            hasImage: !!q.image,
            imageLength: q.image ? q.image.length : 0,
            imageName: q.imageName || 'N/A'
          }))
          .filter(info => info.hasImage);
        
        console.log(`📸 ${imagesInfo.length} preguntas con imagen recibidas:`);
        imagesInfo.forEach(info => {
          console.log(`   Pregunta ${info.index}: ${info.imageLength} chars, nombre: ${info.imageName}`);
        });
      }

      // Validar campos obligatorios
      const requiredFields = { name, description, area_id, project_id, iatf_code };
      const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => !value)
        .map(([key]) => key);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Campos obligatorios faltantes: ${missingFields.join(', ')}`
        });
      }

      // Validar que haya preguntas
      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'El checklist debe contener al menos una pregunta'
        });
      }

      // Procesar preguntas
      const processedQuestions = questions.map(q => ({
        ...q,
        // Truncar imágenes grandes
        image: q.image && q.image.length > 50000 ? 
               q.image.substring(0, 50000) + '... [TRUNCATED]' : 
               q.image
      }));

      // Construir query dinámicamente
      const tableInfo = await db.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'checklist_templates' 
        AND column_name IN ('area_id', 'project_id')
      `);
      
      const hasAreaId = tableInfo.rows.some(r => r.column_name === 'area_id');
      const hasProjectId = tableInfo.rows.some(r => r.column_name === 'project_id');
      
      let setClauses = ['name = $1', 'description = $2', 'iatf_code = $3', 'questions = $4', 'updated_at = CURRENT_TIMESTAMP'];
      let values = [name, description, iatf_code, JSON.stringify(processedQuestions)];
      
      if (hasAreaId) {
        setClauses.push('area_id = $' + (values.length + 1));
        values.push(area_id);
      }
      
      if (hasProjectId) {
        setClauses.push('project_id = $' + (values.length + 1));
        values.push(project_id);
      }
      
      values.push(id); // Para el WHERE id = $n
      
      // Guardar en la base de datos
      const query = `
        UPDATE checklist_templates 
        SET name = $1, description = $2, area_id = $3, project_id = $4, 
            iatf_code = $5, questions = $6, updated_at = CURRENT_TIMESTAMP
        WHERE id = $7 
        RETURNING *
      `;
      
      const result = await db.query(query, [
        name, description, area_id, project_id, iatf_code, 
        JSON.stringify(questions), id
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Checklist no encontrado' });
      }

      // DEBUG: Verificar qué se guardó
      const savedChecklist = result.rows[0];
      let savedQuestions = [];
      if (savedChecklist.questions) {
        if (typeof savedChecklist.questions === 'string') {
          savedQuestions = JSON.parse(savedChecklist.questions);
        } else if (typeof savedChecklist.questions === 'object') {
          savedQuestions = savedChecklist.questions;
        }
      }
      
      const savedImages = savedQuestions.filter(q => q.image).length;
      console.log(`💾 Checklist ${id} guardado con ${savedImages} imágenes`);
      
      res.json({ 
        success: true, 
        checklist: {
          ...savedChecklist,
          questions: savedQuestions
        },
        message: 'Checklist actualizado exitosamente'
      });
      
    } catch (error) {
      console.error('❌ Error actualizando checklist:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message,
        hint: 'Verifica el tamaño del JSON de questions'
      });
    }
  },

  // Eliminar checklist (sin cambios)
  async deleteChecklist(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        'DELETE FROM checklist_templates WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Checklist no encontrado' });
      }

      res.json({ 
        success: true, 
        message: 'Checklist eliminado correctamente' 
      });
    } catch (error) {
      console.error('Error eliminando checklist:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Obtener checklist por ID
  async getChecklistById(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        `SELECT 
          ct.*,
          a.name as area_name,
          p.name as project_name
        FROM checklist_templates ct
        LEFT JOIN areas a ON ct.area_id = a.id
        LEFT JOIN projects p ON ct.project_id = p.id
        WHERE ct.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Checklist no encontrado' });
      }

      const checklist = result.rows[0];
      
      // Parsear questions - IMPORTANTE: mantener las imágenes
      let questions = [];
      if (checklist.questions) {
        try {
          if (typeof checklist.questions === 'string') {
            questions = JSON.parse(checklist.questions);
          } else if (typeof checklist.questions === 'object') {
            questions = checklist.questions;
          }
        } catch (parseError) {
          console.error('Error parseando questions:', parseError);
          questions = [];
        }
      }
      
      console.log(`✅ Checklist ${id} cargado con ${questions.length} preguntas`);
      console.log(`📸 Preguntas con imagen: ${questions.filter(q => q.image).length}`);

      res.json({ 
        success: true, 
        checklist: {
          ...checklist,
          questions: questions
        }
      });
    } catch (error) {
      console.error('Error obteniendo checklist:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = ChecklistController;