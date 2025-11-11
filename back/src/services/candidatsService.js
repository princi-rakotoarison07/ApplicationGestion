const { pool } = require('../config/database');

class CandidatsService {

    static async obtenirTousLesCandidats() {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM Candidat'
            );
            return rows;
        } catch (error) {
            console.error('Erreur lors de la recuperation des candidats')
            throw error;
        }
    }

      static async ajouterContrat(contratData) {
        try {
            const { idEmploye, dateDebut, nombreMois, typeContrat } = contratData;
            const [result] = await pool.execute(
                'INSERT INTO Contrat (idEmploye, dateDebut, nombreMois, typeContrat) VALUES (?, ?, ?, ?)',
                [idEmploye, dateDebut, nombreMois, typeContrat]
            );
            return { id: result.insertId, ...contratData };
    } catch (error) {
        console.error('Erreur lors de l\'ajout du contrat:', error.message, error.stack);
        throw error;
    }
  }
      static async obtenirCandidatParId(id) {
        try {
        const [rows] = await pool.execute('SELECT * FROM Candidat WHERE id = ?', [id]);
        if (rows.length === 0) {
            throw new Error('Candidat non trouvé');
        }
        return rows[0];
        } catch (error) {
        console.error('Erreur lors de la récupération du candidat:', error.message, error.stack);
        throw error;
        }
    }

      static async obtenirEmployeParId(id) {
        try {
        const [rows] = await pool.execute('SELECT * FROM Employe WHERE id = ?', [id]);
        if (rows.length === 0) {
            throw new Error('Employé non trouvé');
        }
        return rows[0];
        } catch (error) {
        console.error('Erreur lors de la récupération de l\'employé:', error.message, error.stack);
        throw error;
        }
    }

      static async obtenirTousLesContrats() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM Contrat'
    );
      return rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des contrats:', error.message, error.stack);
      throw error;
    }
  }
    
  static async obtenirContratParId(id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM Contrat WHERE id = ?', [id]);
      if (rows.length === 0) {
        throw new Error('Contrat non trouvé');
      }
      return rows[0];
    } catch (error) {
      console.error('Erreur lors de la récupération du contrat:', error.message, error.stack);
      throw error;
    }
  }

}

module.exports = CandidatsService;