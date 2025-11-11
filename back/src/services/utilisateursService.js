const { pool } = require('../config/database');

class UtilisateursService {
  
  // Récupérer tous les utilisateurs
  static async obtenirTousLesUtilisateurs() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM utilisateurs ORDER BY id DESC'
      );
      return rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  }

  // Récupérer un utilisateur par ID
  static async obtenirUtilisateurParId(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM utilisateurs WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }
  }

  // Créer un nouvel utilisateur
  static async creerUtilisateur(userData) {
    try {
      const { nom, prenom, email, role = 'Utilisateur' } = userData;
      
      const [result] = await pool.execute(
        'INSERT INTO utilisateurs (nom, prenom, email, role, dateCreation, statut) VALUES (?, ?, ?, ?, NOW(), ?)',
        [nom, prenom, email, role, 'Actif']
      );
      
      // Récupérer l'utilisateur créé
      return await this.obtenirUtilisateurParId(result.insertId);
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  }

  // Mettre à jour un utilisateur
  static async mettreAJourUtilisateur(id, userData) {
    try {
      const { nom, prenom, email, role, statut } = userData;
      
      const [result] = await pool.execute(
        'UPDATE utilisateurs SET nom = ?, prenom = ?, email = ?, role = ?, statut = ? WHERE id = ?',
        [nom, prenom, email, role, statut, id]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return await this.obtenirUtilisateurParId(id);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw error;
    }
  }

  // Supprimer un utilisateur
  static async supprimerUtilisateur(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM utilisateurs WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      throw error;
    }
  }

  // Vérifier si un email existe déjà
  static async emailExiste(email, excludeId = null) {
    try {
      let query = 'SELECT COUNT(*) as count FROM utilisateurs WHERE email = ?';
      let params = [email];
      
      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }
      
      const [rows] = await pool.execute(query, params);
      return rows[0].count > 0;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'email:', error);
      throw error;
    }
  }
}

module.exports = UtilisateursService;
