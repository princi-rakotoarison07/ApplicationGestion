const { pool } = require('../config/database');

class NotificationCandidatController {
  
  // Récupérer les notifications d'un candidat (version simple sans auth)
  static async obtenirNotificationsSimple(req, res) {
    try {
      // Récupérer toutes les notifications pour le destinataire ID 1 ou 2, ou NULL (pour debug)
      const [notifications] = await pool.execute(`
        SELECT 
          n.*,
          tn.nom as typeNotification,
          tn.icone,
          tn.couleur,
          a.reference as annonceReference,
          qt.nom as qcmTitre
        FROM Notification n
        JOIN TypeNotification tn ON n.idTypeNotification = tn.id
        LEFT JOIN Annonce a ON n.idAnnonce = a.id
        LEFT JOIN QcmTest qt ON n.idQcmTest = qt.id
        WHERE n.idDestinataire IN (1, 2) OR n.idDestinataire IS NULL
        ORDER BY n.dateCreation DESC
      `);
      
      res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Marquer une notification comme lue (version simple sans auth)
  static async marquerCommeLueSimple(req, res) {
    try {
      const { id } = req.params;
      
      // Marquer comme lue
      await pool.execute(`
        UPDATE Notification SET lue = TRUE WHERE id = ?
      `, [id]);
      
      res.json({
        success: true,
        message: 'Notification marquée comme lue'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Debug - Voir toutes les notifications et comptes candidats
  static async debugNotifications(req, res) {
    try {
      // Récupérer toutes les notifications avec détails
      const [notifications] = await pool.execute(`
        SELECT 
          n.*,
          tn.nom as typeNotification,
          tn.icone,
          tn.couleur,
          a.reference as annonceReference,
          qt.nom as qcmTitre,
          cc.email as destinataireEmail,
          CASE 
            WHEN n.idDestinataire IS NULL THEN 'NULL - PROBLÈME!'
            ELSE CONCAT('ID: ', n.idDestinataire)
          END as statutDestinataire
        FROM Notification n
        JOIN TypeNotification tn ON n.idTypeNotification = tn.id
        LEFT JOIN Annonce a ON n.idAnnonce = a.id
        LEFT JOIN QcmTest qt ON n.idQcmTest = qt.id
        LEFT JOIN CompteCandidat cc ON n.idDestinataire = cc.id
        ORDER BY n.dateCreation DESC
      `);
      
      // Récupérer tous les comptes candidats
      const [comptes] = await pool.execute('SELECT * FROM CompteCandidat');
      
      // Statistiques des notifications
      const [stats] = await pool.execute(`
        SELECT 
          CASE 
            WHEN idDestinataire IS NULL THEN 'NULL (Problématique)'
            ELSE CONCAT('ID: ', idDestinataire)
          END as destinataire,
          COUNT(*) as nombre,
          SUM(CASE WHEN lue = 1 THEN 1 ELSE 0 END) as lues,
          SUM(CASE WHEN lue = 0 THEN 1 ELSE 0 END) as non_lues
        FROM Notification
        GROUP BY idDestinataire
        ORDER BY idDestinataire
      `);
      
      res.json({
        success: true,
        data: {
          notifications: notifications,
          comptes: comptes,
          statistiques: stats,
          message: `Total: ${notifications.length} notifications, ${comptes.length} comptes candidats`
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = NotificationCandidatController;
