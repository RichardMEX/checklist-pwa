class IATFHistory {
  constructor(db) {
    this.db = db;
  }

  logChange(checklistId, changeData) {
    const logEntry = {
      id: Date.now().toString(),
      checklistId,
      iatfCode: changeData.iatfCode,
      version: changeData.version,
      changeType: changeData.changeType, // 'created', 'updated', 'approved'
      changedBy: changeData.changedBy,
      changes: changeData.changes,
      timestamp: new Date().toISOString(),
      auditTrail: `IATF-${Date.now()}`
    };

    this.db.get('iatfHistory').push(logEntry).write();
    return logEntry;
  }

  getChecklistHistory(checklistId) {
    return this.db.get('iatfHistory')
      .value()
      .filter(entry => entry.checklistId === checklistId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
}

module.exports = IATFHistory;