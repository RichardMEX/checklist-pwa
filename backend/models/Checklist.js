class Checklist {
  constructor(db) {
    this.db = db;
  }

  // Crear nuevo checklist
  create(checklistData) {
    const newChecklist = {
      id: Date.now().toString(),
      ...checklistData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0',
      iatfCode: checklistData.iatfCode || `IATF-${Date.now()}`,
      status: 'pending'
    };
    
    this.db.get('checklists').push(newChecklist).write();
    return newChecklist;
  }

  // Obtener todos los checklists
  getAll() {
    return this.db.get('checklists').value();
  }

  // Obtener checklist por ID
  getById(id) {
    return this.db.get('checklists').find({ id }).value();
  }

  // Actualizar checklist
  update(id, updateData) {
    updateData.updatedAt = new Date().toISOString();
    return this.db.get('checklists').find({ id }).assign(updateData);
  }

  // Eliminar checklist
  delete(id) {
    return this.db.get('checklists').remove({ id }).write();
  }

  // Obtener checklists por usuario
  getByUserId(userId) {
    return this.db.get('checklists').value().filter(checklist => 
      checklist.assignedTo === userId
    );
  }

  // Enviar respuestas de checklist
  submit(checklistId, answers, userId) {
    const submission = {
      id: Date.now().toString(),
      checklistId,
      userId,
      answers,
      submittedAt: new Date().toISOString(),
      status: 'completed'
    };
    
    this.db.get('submissions').push(submission).write();
    
    // Actualizar estado del checklist
    this.update(checklistId, {
      status: 'completed',
      completedAt: new Date().toISOString()
    });
    
    return submission;
  }
}

module.exports = Checklist;