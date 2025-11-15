const { pool } = require('../config/database');

class ContratService {
  
  // Récupérer tous les contrats avec informations employé
  static async obtenirTousLesContrats() {
    try {
      const [rows] = await pool.execute(
        `SELECT c.id, c.idEmploye, c.dateDebut, c.nombreMois, c.typeContrat,
                e.nom, e.prenom, e.adresse,
                d.nom as nomDepartement,
                DATE_ADD(c.dateDebut, INTERVAL c.nombreMois MONTH) as dateFin,
                CASE 
                  WHEN DATE_ADD(c.dateDebut, INTERVAL c.nombreMois MONTH) < CURDATE() THEN 'Expiré'
                  WHEN DATE_ADD(c.dateDebut, INTERVAL c.nombreMois MONTH) <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'Expire bientôt'
                  ELSE 'Actif'
                END as statut
         FROM Contrat c 
         LEFT JOIN Employe e ON c.idEmploye = e.id
         LEFT JOIN Departement d ON e.idDept = d.id 
         ORDER BY c.dateDebut DESC`
      );
      return rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des contrats:', error);
      throw error;
    }
  }

  // Récupérer les contrats d'un employé
  static async obtenirContratsParEmploye(idEmploye) {
    try {
      const [rows] = await pool.execute(
        `SELECT c.id, c.idEmploye, c.dateDebut, c.nombreMois, c.typeContrat,
                DATE_ADD(c.dateDebut, INTERVAL c.nombreMois MONTH) as dateFin,
                CASE 
                  WHEN DATE_ADD(c.dateDebut, INTERVAL c.nombreMois MONTH) < CURDATE() THEN 'Expiré'
                  WHEN DATE_ADD(c.dateDebut, INTERVAL c.nombreMois MONTH) <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'Expire bientôt'
                  ELSE 'Actif'
                END as statut
         FROM Contrat c 
         WHERE c.idEmploye = ?
         ORDER BY c.dateDebut DESC`,
        [idEmploye]
      );
      return rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des contrats de l\'employé:', error);
      throw error;
    }
  }

  // Récupérer un contrat par ID
  static async obtenirContratParId(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT c.id, c.idEmploye, c.dateDebut, c.nombreMois, c.typeContrat,
                e.nom, e.prenom, e.adresse,
                d.nom as nomDepartement,
                DATE_ADD(c.dateDebut, INTERVAL c.nombreMois MONTH) as dateFin,
                CASE 
                  WHEN DATE_ADD(c.dateDebut, INTERVAL c.nombreMois MONTH) < CURDATE() THEN 'Expiré'
                  WHEN DATE_ADD(c.dateDebut, INTERVAL c.nombreMois MONTH) <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'Expire bientôt'
                  ELSE 'Actif'
                END as statut
         FROM Contrat c 
         LEFT JOIN Employe e ON c.idEmploye = e.id
         LEFT JOIN Departement d ON e.idDept = d.id 
         WHERE c.id = ?`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du contrat:', error);
      throw error;
    }
  }

  // Créer un nouveau contrat
  static async creerContrat(contratData) {
    try {
      const { idEmploye, dateDebut, nombreMois, typeContrat } = contratData;
      
      const [result] = await pool.execute(
        'INSERT INTO Contrat (idEmploye, dateDebut, nombreMois, typeContrat) VALUES (?, ?, ?, ?)',
        [idEmploye, dateDebut, nombreMois, typeContrat]
      );
      
      return await this.obtenirContratParId(result.insertId);
    } catch (error) {
      console.error('Erreur lors de la création du contrat:', error);
      throw error;
    }
  }

  // Mettre à jour un contrat
  static async mettreAJourContrat(id, contratData) {
    try {
      const { idEmploye, dateDebut, nombreMois, typeContrat } = contratData;
      
      const [result] = await pool.execute(
        'UPDATE Contrat SET idEmploye = ?, dateDebut = ?, nombreMois = ?, typeContrat = ? WHERE id = ?',
        [idEmploye, dateDebut, nombreMois, typeContrat, id]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return await this.obtenirContratParId(id);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du contrat:', error);
      throw error;
    }
  }

  // Supprimer un contrat
  static async supprimerContrat(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM Contrat WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erreur lors de la suppression du contrat:', error);
      throw error;
    }
  }

  // Renouveler un contrat (créer un nouveau contrat basé sur l'ancien)
  static async renouvellerContrat(id, nouvellesDonnees) {
    try {
      const contratActuel = await this.obtenirContratParId(id);
      if (!contratActuel) {
        throw new Error('Contrat non trouvé');
      }

      const { nombreMois, typeContrat, dateDebut } = nouvellesDonnees;
      
      const nouveauContrat = {
        idEmploye: contratActuel.idEmploye,
        dateDebut: dateDebut || contratActuel.dateFin, // Commence à la fin de l'ancien contrat
        nombreMois: nombreMois || contratActuel.nombreMois,
        typeContrat: typeContrat || contratActuel.typeContrat
      };
      
      return await this.creerContrat(nouveauContrat);
    } catch (error) {
      console.error('Erreur lors du renouvellement du contrat:', error);
      throw error;
    }
  }

  // Obtenir les statistiques des contrats
  static async obtenirStatistiquesContrats() {
    try {
      const [stats] = await pool.execute(
        `SELECT 
          COUNT(*) as totalContrats,
          SUM(CASE WHEN DATE_ADD(dateDebut, INTERVAL nombreMois MONTH) >= CURDATE() THEN 1 ELSE 0 END) as contratsActifs,
          SUM(CASE WHEN DATE_ADD(dateDebut, INTERVAL nombreMois MONTH) < CURDATE() THEN 1 ELSE 0 END) as contratsExpires,
          SUM(CASE WHEN DATE_ADD(dateDebut, INTERVAL nombreMois MONTH) <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) 
                   AND DATE_ADD(dateDebut, INTERVAL nombreMois MONTH) >= CURDATE() THEN 1 ELSE 0 END) as contratsExpirentBientot,
          SUM(CASE WHEN typeContrat = 'CDI' THEN 1 ELSE 0 END) as cdi,
          SUM(CASE WHEN typeContrat = 'CDD' THEN 1 ELSE 0 END) as cdd,
          SUM(CASE WHEN typeContrat = 'Essai' THEN 1 ELSE 0 END) as essai,
          SUM(CASE WHEN typeContrat = 'Stage' THEN 1 ELSE 0 END) as stage
         FROM Contrat`
      );
      return stats[0];
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
}

module.exports = ContratService;
