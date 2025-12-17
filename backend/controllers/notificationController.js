const db = require('../config/database');

const NotificationController = {
  // Obtener notificaciones del usuario
  async getUserNotifications(req, res) {
    try {
      const { userId } = req.params;
      
      const result = await db.query(
        `SELECT * FROM notifications 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 50`,
        [userId]
      );
      
      res.json({ success: true, notifications: result.rows });
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Marcar notificación como leída
  async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      
      await db.query(
        'UPDATE notifications SET is_read = true WHERE id = $1',
        [notificationId]
      );
      
      res.json({ success: true, message: 'Notificación marcada como leída' });
    } catch (error) {
      console.error('Error marcando notificación:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Crear notificación del sistema
  async createSystemNotification(req, res) {
    try {
      const { userId, title, message, type, relatedEntity, relatedId } = req.body;
      
      const result = await db.query(
        `INSERT INTO notifications (user_id, title, message, type, related_entity, related_id)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [userId, title, message, type, relatedEntity, relatedId]
      );
      
      res.status(201).json({ success: true, notification: result.rows[0] });
    } catch (error) {
      console.error('Error creando notificación:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Notificación para checklists pendientes
  async checkPendingChecklists() {
    try {
      // Encontrar checklists pendientes de hoy
      const result = await db.query(`
        SELECT u.id as user_id, u.name as user_name, COUNT(ca.id) as pending_count
        FROM users u
        JOIN checklist_assignments ca ON u.id = ca.assigned_to
        LEFT JOIN checklist_submissions cs ON ca.id = cs.assignment_id 
          AND DATE(cs.submitted_at) = CURRENT_DATE
        WHERE ca.is_active = true 
          AND cs.id IS NULL
        GROUP BY u.id, u.name
        HAVING COUNT(ca.id) > 0
      `);
      
      // Crear notificaciones para usuarios con pendientes
      for (const row of result.rows) {
        await db.query(
          `INSERT INTO notifications (user_id, title, message, type)
           VALUES ($1, 'Checklists Pendientes', 
                   'Tienes ' || $2 || ' checklists pendientes para hoy', 'warning')`,
          [row.user_id, row.pending_count]
        );
      }
      
      console.log(`📋 Notificaciones de recordatorio enviadas: ${result.rows.length}`);
    } catch (error) {
      console.error('Error verificando checklists pendientes:', error);
    }
  }
};

module.exports = NotificationController;