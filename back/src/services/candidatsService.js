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
      const {
        idEmploye,
        typeContrat,
        dateDebut,
        dateFin: dateFinInput,
        nombreMois,
        periodeEssaiMois,
        dateFinEssai: dateFinEssaiInput,
        salaire,
        poste,
        estRenouvele,
        commentaire,
      } = contratData;

      // Calcule dateFin si non fournie mais nombreMois présent
      let dateFin = dateFinInput || null;
      if (!dateFin && dateDebut && nombreMois) {
        const d = new Date(dateDebut);
        d.setMonth(d.getMonth() + parseInt(nombreMois, 10));
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dateFin = `${y}-${m}-${day}`;
      }

      // Calcule dateFinEssai si non fournie mais periodeEssaiMois présent
      let dateFinEssai = dateFinEssaiInput || null;
      if (!dateFinEssai && dateDebut && periodeEssaiMois) {
        const d = new Date(dateDebut);
        d.setMonth(d.getMonth() + parseInt(periodeEssaiMois, 10));
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dateFinEssai = `${y}-${m}-${day}`;
      }

      const [result] = await pool.execute(
        `INSERT INTO Contrat (
          idEmploye, typeContrat, dateDebut, dateFin, nombreMois,
          periodeEssaiMois, dateFinEssai, salaire, poste, estRenouvele, commentaire
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          idEmploye,
          typeContrat,
          dateDebut,
          dateFin,
          nombreMois || null,
          periodeEssaiMois || null,
          dateFinEssai,
          salaire || null,
          poste || null,
          !!estRenouvele,
          commentaire || null,
        ]
      );
      return { id: result.insertId, ...contratData, dateFin, dateFinEssai };
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