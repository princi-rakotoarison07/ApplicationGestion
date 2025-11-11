const { pool } = require('../config/database');

class DiplomeService {
  
  // Récupérer tous les diplômes
  static async obtenirTousLesDiplomes() {
    try {
      const [rows] = await pool.execute(
        `SELECT id, nom FROM Diplome ORDER BY nom`
      );
      return rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des diplômes:', error);
      throw error;
    }
  }

  // Récupérer un diplôme par ID
  static async obtenirDiplomeParId(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT id, nom FROM Diplome WHERE id = ?`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du diplôme:', error);
      throw error;
    }
  }
}

module.exports = DiplomeService;
