const { pool } = require('../config/database');

class EmployeService {
  
  // Récupérer tous les employés
  static async obtenirTousLesEmployes() {
    try {
      const [rows] = await pool.execute(
        `SELECT e.id, e.nom, e.prenom, e.adresse, e.idDept,
                d.nom as nomDepartement
         FROM Employe e 
         LEFT JOIN Departement d ON e.idDept = d.id 
         ORDER BY e.nom, e.prenom`
      );
      return rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des employés:', error);
      throw error;
    }
  }

  // Récupérer un employé par ID
  static async obtenirEmployeParId(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT e.id, e.nom, e.prenom, e.adresse, e.idDept,
                d.nom as nomDepartement
         FROM Employe e 
         LEFT JOIN Departement d ON e.idDept = d.id 
         WHERE e.id = ?`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'employé:', error);
      throw error;
    }
  }

  // Récupérer les employés sans compte utilisateur
  static async obtenirEmployesSansCompte() {
    try {
      const [rows] = await pool.execute(
        `SELECT e.id, e.nom, e.prenom, e.adresse, e.idDept,
                d.nom as nomDepartement
         FROM Employe e 
         LEFT JOIN Departement d ON e.idDept = d.id 
         LEFT JOIN Utilisateurs u ON e.id = u.idEmploye
         WHERE u.id IS NULL
         ORDER BY e.nom, e.prenom`
      );
      return rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des employés sans compte:', error);
      throw error;
    }
  }

  // Créer un nouvel employé
  static async creerEmploye(employeData) {
    try {
      const { nom, prenom, adresse, idDept } = employeData;
      
      const [result] = await pool.execute(
        'INSERT INTO Employe (nom, prenom, adresse, idDept) VALUES (?, ?, ?, ?)',
        [nom, prenom, adresse, idDept]
      );
      
      return await this.obtenirEmployeParId(result.insertId);
    } catch (error) {
      console.error('Erreur lors de la création de l\'employé:', error);
      throw error;
    }
  }

  // Mettre à jour un employé
  static async mettreAJourEmploye(id, employeData) {
    try {
      const { nom, prenom, adresse, idDept } = employeData;
      
      const [result] = await pool.execute(
        'UPDATE Employe SET nom = ?, prenom = ?, adresse = ?, idDept = ? WHERE id = ?',
        [nom, prenom, adresse, idDept, id]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return await this.obtenirEmployeParId(id);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'employé:', error);
      throw error;
    }
  }

  // Supprimer un employé
  static async supprimerEmploye(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM Employe WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'employé:', error);
      throw error;
    }
  }
}

module.exports = EmployeService;
