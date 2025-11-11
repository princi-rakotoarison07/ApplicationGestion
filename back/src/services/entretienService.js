const { pool } = require('../config/database');

class EntretienService {
  
  // Récupérer tous les entretiens
  static async obtenirTousLesEntretiens() {
    try {
      const [rows] = await pool.execute(
        `SELECT e.id, e.dateHeure, e.idStatut, e.idResultat, e.idCandidat,
         c.nom as candidatNom, c.prenom as candidatPrenom,
         a.reference as annonceReference,
         s.nom as statutNom,
         r.note as resultatNote, r.appreciation as resultatAppreciation
         FROM Entretien e
         LEFT JOIN Candidat c ON e.idCandidat = c.id
         LEFT JOIN Annonce a ON c.idAnnonce = a.id
         LEFT JOIN StatutEntretien s ON e.idStatut = s.id
         LEFT JOIN Resultat r ON e.idResultat = r.id
         ORDER BY e.dateHeure ASC`
      );
      return rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des entretiens:', error);
      throw error;
    }
  }

  // Récupérer un entretien par ID
  static async obtenirEntretienParId(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT e.id, e.dateHeure, e.idCandidat, e.idStatut,
                c.nom as candidatNom, c.prenom as candidatPrenom,
                a.reference as annonceReference,
                s.nom as statutNom
         FROM Entretien e
         LEFT JOIN Candidat c ON e.idCandidat = c.id
         LEFT JOIN Annonce a ON c.idAnnonce = a.id
         LEFT JOIN StatutEntretien s ON e.idStatut = s.id
         WHERE e.id = ?`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'entretien:', error);
      throw error;
    }
  }

  // Créer un nouvel entretien
  static async creerEntretien(entretienData) {
    try {
      const { idCandidat, dateHeure, idStatut } = entretienData;
      const statutFinal = idStatut || 1; // Statut par défaut : 1 (En attente)
      
      // Insérer l'entretien
      const [result] = await pool.execute(
        'INSERT INTO Entretien (idCandidat, dateHeure, idStatut) VALUES (?, ?, ?)',
        [idCandidat, dateHeure, statutFinal]
      );
      
      const entretienId = result.insertId;
      
      // Insérer dans l'historique pour tracer la création
      await pool.execute(
        'INSERT INTO HistoriqueEntretien (idEntretien, idStatut, dateChangement) VALUES (?, ?, NOW())',
        [entretienId, statutFinal]
      );
      
      console.log(`✅ Entretien créé (ID: ${entretienId}) avec historique pour candidat ${idCandidat}`);
      
      return await this.obtenirEntretienParId(entretienId);
    } catch (error) {
      console.error('Erreur lors de la création de l\'entretien:', error);
      throw error;
    }
  }

  // Mettre à jour un entretien
  static async mettreAJourEntretien(id, entretienData) {
    try {
      const { idCandidat, dateHeure, idStatut, idResultat } = entretienData;
      
      // Récupérer l'ancien statut pour vérifier s'il a changé
      const [ancienEntretien] = await pool.execute(
        'SELECT idStatut, idResultat FROM Entretien WHERE id = ?',
        [id]
      );
      
      if (ancienEntretien.length === 0) {
        throw new Error('Entretien non trouvé');
      }
      
      const ancienStatut = ancienEntretien[0].idStatut;
      let idResultatFinal = ancienEntretien[0].idResultat;
      
      // Gérer le résultat de l'entretien
      if (idResultat && idResultat !== '') {
        if (idResultatFinal) {
          // Mettre à jour le résultat existant
          await pool.execute(
            'UPDATE Resultat SET note = ? WHERE id = ?',
            [idResultat, idResultatFinal]
          );
        } else {
          // Créer un nouveau résultat
          const [resultInsert] = await pool.execute(
            'INSERT INTO Resultat (note, appreciation) VALUES (?, ?)',
            [idResultat, `Résultat de l'entretien: ${idResultat}`]
          );
          idResultatFinal = resultInsert.insertId;
        }
      }
      
      // Mettre à jour l'entretien
      const [result] = await pool.execute(
        'UPDATE Entretien SET idCandidat = ?, dateHeure = ?, idStatut = ?, idResultat = ? WHERE id = ?',
        [idCandidat, dateHeure, idStatut, idResultatFinal, id]
      );
      
      // Si le statut a changé, ajouter une entrée dans l'historique
      if (idStatut !== ancienStatut) {
        await pool.execute(
          'INSERT INTO HistoriqueEntretien (idEntretien, idStatut, dateChangement) VALUES (?, ?, NOW())',
          [id, idStatut]
        );
        console.log(`📝 Historique ajouté: Entretien ${id} - Statut ${ancienStatut} → ${idStatut}`);
      }
      
      return await this.obtenirEntretienParId(id);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'entretien:', error);
      throw error;
    }
  }

  // Supprimer un entretien
  static async supprimerEntretien(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM Entretien WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'entretien:', error);
      throw error;
    }
  }

  // Récupérer les candidats disponibles pour planifier un entretien
  static async obtenirCandidatsDisponibles() {
    try {
      const [rows] = await pool.execute(
        `SELECT c.id, c.nom, c.prenom, a.reference as annonceReference
         FROM Candidat c
         LEFT JOIN Annonce a ON c.idAnnonce = a.id
         WHERE c.id NOT IN (
           SELECT DISTINCT idCandidat FROM Entretien WHERE idCandidat IS NOT NULL
         )
         ORDER BY c.nom, c.prenom`
      );
      return rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des candidats disponibles:', error);
      throw error;
    }
  }

  // Récupérer l'historique d'un entretien
  static async obtenirHistoriqueEntretien(idEntretien) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          he.id,
          he.idEntretien,
          he.idStatut,
          se.nom as statutNom,
          he.dateChangement
        FROM HistoriqueEntretien he
        JOIN StatutEntretien se ON he.idStatut = se.id
        WHERE he.idEntretien = ?
        ORDER BY he.dateChangement ASC
      `, [idEntretien]);
      
      return rows;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      throw error;
    }
  }

  // Récupérer les entretiens d'une annonce
  static async obtenirEntretiensParAnnonce(annonceId) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          e.id, 
          e.dateHeure, 
          e.idStatut, 
          e.idResultat, 
          e.idCandidat,
          c.nom as candidatNom, 
          c.prenom as candidatPrenom,
          a.reference as annonceReference,
          s.nom as statutNom,
          r.note as resultatNote, 
          r.appreciation as resultatAppreciation
        FROM Entretien e
        JOIN Candidat c ON e.idCandidat = c.id
        JOIN Annonce a ON c.idAnnonce = a.id
        LEFT JOIN StatutEntretien s ON e.idStatut = s.id
        LEFT JOIN Resultat r ON e.idResultat = r.id
        WHERE a.id = ?
        ORDER BY e.dateHeure DESC
      `, [annonceId]);
      
      return rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des entretiens par annonce:', error);
      throw error;
    }
  }

  // Récupérer les statuts d'entretien
  static async obtenirStatutsEntretien() {
    try {
      const [rows] = await pool.execute(
        'SELECT id, nom FROM StatutEntretien ORDER BY id'
      );
      return rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des statuts:', error);
      throw error;
    }
  }

  // Récupérer les candidats éligibles pour entretien (QCM terminé avec succès)
  static async obtenirCandidatsEligiblesEntretien() {
    try {
      // Debug: Vérifier les candidats et leurs statuts
      const debugQuery1 = `
        SELECT c.id, c.nom, c.prenom, sc.nom as statut
        FROM Candidat c
        INNER JOIN StatutCandidat sc ON c.idStatut = sc.id
        ORDER BY c.id
      `;
      
      console.log('🔍 Debug - Vérification des candidats et statuts...');
      const [debugRows1] = await pool.execute(debugQuery1);
      console.log('📊 Candidats dans la base:', debugRows1);
      
      // Debug: Vérifier les réponses QCM
      const debugQuery2 = `
        SELECT qr.idCandidat, c.nom, c.prenom, AVG(qr.pointsObtenus) as moyenne
        FROM QcmReponse qr
        INNER JOIN Candidat c ON qr.idCandidat = c.id
        GROUP BY qr.idCandidat, c.nom, c.prenom
        ORDER BY moyenne DESC
      `;
      
      console.log('🔍 Debug - Vérification des scores QCM...');
      const [debugRows2] = await pool.execute(debugQuery2);
      console.log('📊 Scores QCM:', debugRows2);

      const query = `
        SELECT DISTINCT 
          c.id,
          c.nom,
          c.prenom,
          c.dateNaissance,
          c.adresse,
          c.cv,
          c.idAnnonce,
          a.reference as annonceReference,
          a.description as annonceDescription,
          sc.nom as statutNom,
          AVG(qr.pointsObtenus) as moyenneQcm,
          COUNT(qr.id) as nombreReponses
        FROM Candidat c
        INNER JOIN StatutCandidat sc ON c.idStatut = sc.id
        INNER JOIN Annonce a ON c.idAnnonce = a.id
        INNER JOIN QcmReponse qr ON c.id = qr.idCandidat
        WHERE sc.nom = 'QCM terminé'
        GROUP BY c.id, c.nom, c.prenom, c.dateNaissance, c.adresse, c.cv, c.idAnnonce, a.reference, a.description, sc.nom
        ORDER BY moyenneQcm DESC
      `;
      
      console.log('🔍 Exécution de la requête candidats éligibles...');
      console.log('📝 Requête SQL:', query);
      
      const [rows] = await pool.execute(query);
      console.log('✅ Résultats trouvés:', rows.length);
      console.log('📊 Données:', rows);
      
      return rows;
    } catch (error) {
      console.error('Erreur dans obtenirCandidatsEligiblesEntretien:', error);
      throw error;
    }
  }

}

module.exports = EntretienService;
