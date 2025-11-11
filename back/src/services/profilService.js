const { pool } = require('../config/database');

class ProfilService {
    // Récupérer tous les profils
    static async getAllProfils() {
      const [rows] = await pool.execute('SELECT * FROM Profil');
      return rows;
    }

    // Récupérer un profil par ID
    static async getProfilById(id) {
      const [rows] = await pool.execute('SELECT * FROM Profil WHERE id = ?', [id]);
      return rows[0];
    }

    // Créer un nouveau profil
    static async createProfil(nom) {
      const [result] = await pool.execute('INSERT INTO Profil (nom) VALUES (?)', [nom]);
      return { id: result.insertId, nom };
    }

    // Mettre à jour un profil
    static async updateProfil(id, nom) {
      await pool.execute('UPDATE Profil SET nom = ? WHERE id = ?', [nom, id]);
      return { id, nom };
    }

    // Supprimer un profil
    static async deleteProfil(id) {
      await pool.execute('DELETE FROM Profil WHERE id = ?', [id]);
      return { message: 'Profil supprimé avec succès' };
    }
}

module.exports = ProfilService;