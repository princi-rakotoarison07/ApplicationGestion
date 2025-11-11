const { pool } = require('../config/database');

class QcmPublicController {
  
  // Soumettre les réponses d'un test QCM
  static async soumettreReponses(req, res) {
    try {
      const { token } = req.params;
      const { reponses } = req.body; // { questionId: choixIndex, ... }
      
      // Vérifier si le token existe et est valide
      const [invitations] = await pool.execute(`
        SELECT iq.*, qt.*, c.nom as candidatNom, c.prenom as candidatPrenom
        FROM InvitationQCM iq
        JOIN QcmTest qt ON iq.idQcmTest = qt.id
        JOIN Candidat c ON iq.idCandidat = c.id
        WHERE iq.token = ? AND iq.dateExpiration > NOW() AND iq.statut != 'terminee'
      `, [token]);
      
      if (invitations.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Token invalide, expiré ou test déjà terminé"
        });
      }
      
      const invitation = invitations[0];
      
      // Récupérer les questions avec leurs choix
      const [questions] = await pool.execute(`
        SELECT q.id, q.numero, q.question, q.points
        FROM QcmQuestion q
        WHERE q.idTest = ?
        ORDER BY q.numero
      `, [invitation.idQcmTest]);
      
      let scoreTotal = 0;
      let pointsMax = 0;
      
      // Traiter chaque réponse
      for (const question of questions) {
        pointsMax += question.points;
        
        if (reponses[question.id] !== undefined) {
          // Récupérer les choix pour cette question
          const [choix] = await pool.execute(`
            SELECT * FROM QcmChoix WHERE idQuestion = ? ORDER BY id
          `, [question.id]);
          
          const choixIndex = reponses[question.id];
          const choixSelectionne = choix[choixIndex];
          
          if (choixSelectionne) {
            const pointsObtenus = choixSelectionne.estCorrect ? question.points : 0;
            scoreTotal += pointsObtenus;
            
            // Enregistrer la réponse dans QcmReponse
            await pool.execute(`
              INSERT INTO QcmReponse (idCandidat, idTest, idQuestion, idChoix, pointsObtenus)
              VALUES (?, ?, ?, ?, ?)
            `, [
              invitation.idCandidat,
              invitation.idQcmTest,
              question.id,
              choixSelectionne.id,
              pointsObtenus
            ]);
          }
        }
      }
      
      // Calculer le pourcentage
      const pourcentage = pointsMax > 0 ? Math.round((scoreTotal / pointsMax) * 100) : 0;
      
      // Mettre à jour l'invitation comme terminée
      await pool.execute(`
        UPDATE InvitationQCM 
        SET statut = 'terminee', dateTerminee = NOW(), score = ?
        WHERE token = ?
      `, [pourcentage, token]);
      
      res.json({
        success: true,
        data: {
          scoreTotal: scoreTotal,
          pointsMax: pointsMax,
          pourcentage: pourcentage,
          message: `Test terminé ! Score: ${scoreTotal}/${pointsMax} (${pourcentage}%)`
        }
      });
      
    } catch (error) {
      console.error('Erreur soumission test:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Accéder au test QCM par token
  static async obtenirTestParToken(req, res) {
    try {
      const { token } = req.params;
      
      // Vérifier si le token existe et est valide
      const [invitations] = await pool.execute(`
        SELECT iq.*, qt.*, c.nom as candidatNom, c.prenom as candidatPrenom
        FROM InvitationQCM iq
        JOIN QcmTest qt ON iq.idQcmTest = qt.id
        JOIN Candidat c ON iq.idCandidat = c.id
        WHERE iq.token = ? AND iq.dateExpiration > NOW() AND iq.statut != 'terminee'
      `, [token]);
      
      if (invitations.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Token invalide ou expiré"
        });
      }
      
      const invitation = invitations[0];
      
      // Récupérer les questions du test
      const [questions] = await pool.execute(`
        SELECT q.*, GROUP_CONCAT(c.texte ORDER BY c.id SEPARATOR '|||') as reponses,
               GROUP_CONCAT(c.estCorrect ORDER BY c.id SEPARATOR '|||') as corrections
        FROM QcmQuestion q
        LEFT JOIN QcmChoix c ON q.id = c.idQuestion
        WHERE q.idTest = ?
        GROUP BY q.id
        ORDER BY q.numero
      `, [invitation.idQcmTest]);
      
      // Formater les questions avec leurs réponses
      const questionsFormatees = questions.map(q => ({
        ...q,
        reponses: q.reponses ? q.reponses.split('|||').map((texte, index) => ({
          texte,
          estCorrecte: q.corrections.split('|||')[index] === '1'
        })) : []
      }));
      
      // Marquer comme vue si pas encore vue
      if (!invitation.dateVue) {
        await pool.execute(`
          UPDATE InvitationQCM SET dateVue = NOW(), statut = 'vue' WHERE token = ?
        `, [token]);
      }
      
      res.json({
        success: true,
        data: {
          test: {
            id: invitation.idQcmTest,
            nom: invitation.nom,
            description: invitation.description || 'Test QCM',
            dureeMinutes: invitation.dureeMinutes || 30,
            notePassage: invitation.notePassage || 50
          },
          questions: questionsFormatees,
          candidat: {
            nom: invitation.candidatNom,
            prenom: invitation.candidatPrenom
          },
          invitation: {
            dateExpiration: invitation.dateExpiration,
            statut: invitation.statut
          }
        }
      });
      
    } catch (error) {
      console.error('Erreur accès test par token:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Debug - Vérifier les tokens QCM
  static async debugToken(req, res) {
    try {
      const { token } = req.params;
      
      // Chercher le token dans InvitationQCM
      const [invitations] = await pool.execute(`
        SELECT iq.*, qt.nom as testNom, c.nom as candidatNom, c.prenom as candidatPrenom
        FROM InvitationQCM iq
        LEFT JOIN QcmTest qt ON iq.idQcmTest = qt.id
        LEFT JOIN Candidat c ON iq.idCandidat = c.id
        WHERE iq.token = ?
      `, [token]);
      
      // Récupérer aussi les questions et choix
      let questions = [];
      let choix = [];
      if (invitations.length > 0) {
        const testId = invitations[0].idQcmTest;
        
        [questions] = await pool.execute(`
          SELECT * FROM QcmQuestion WHERE idTest = ? ORDER BY numero
        `, [testId]);
        
        [choix] = await pool.execute(`
          SELECT c.*, q.numero as questionNumero 
          FROM QcmChoix c 
          JOIN QcmQuestion q ON c.idQuestion = q.id 
          WHERE q.idTest = ?
          ORDER BY q.numero, c.id
        `, [testId]);
      }
      
      res.json({
        success: true,
        data: {
          token: token,
          invitations: invitations,
          questions: questions,
          choix: choix,
          found: invitations.length > 0
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Debug - Voir les questions et choix d'un test
  static async debugTest(req, res) {
    try {
      const { testId } = req.params;
      
      // Récupérer le test
      const [tests] = await pool.execute(`
        SELECT * FROM QcmTest WHERE id = ?
      `, [testId]);
      
      // Récupérer les questions
      const [questions] = await pool.execute(`
        SELECT * FROM QcmQuestion WHERE idTest = ? ORDER BY numero
      `, [testId]);
      
      // Récupérer tous les choix
      const [choix] = await pool.execute(`
        SELECT c.*, q.numero as questionNumero, q.question as questionTexte
        FROM QcmChoix c 
        JOIN QcmQuestion q ON c.idQuestion = q.id 
        WHERE q.idTest = ?
        ORDER BY q.numero, c.id
      `, [testId]);
      
      res.json({
        success: true,
        data: {
          test: tests[0] || null,
          questions: questions,
          choix: choix,
          totalQuestions: questions.length,
          totalChoix: choix.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Debug - Voir les réponses d'un candidat
  static async debugReponses(req, res) {
    try {
      const { candidatId, testId } = req.params;
      
      // Récupérer les réponses du candidat
      const [reponses] = await pool.execute(`
        SELECT 
          r.*,
          q.numero as questionNumero,
          q.question as questionTexte,
          c.texte as choixTexte,
          c.estCorrect as choixCorrect
        FROM QcmReponse r
        JOIN QcmQuestion q ON r.idQuestion = q.id
        JOIN QcmChoix c ON r.idChoix = c.id
        WHERE r.idCandidat = ? AND r.idTest = ?
        ORDER BY q.numero
      `, [candidatId, testId]);
      
      // Récupérer l'invitation
      const [invitations] = await pool.execute(`
        SELECT * FROM InvitationQCM 
        WHERE idCandidat = ? AND idQcmTest = ?
      `, [candidatId, testId]);
      
      res.json({
        success: true,
        data: {
          candidatId: candidatId,
          testId: testId,
          reponses: reponses,
          invitation: invitations[0] || null,
          totalReponses: reponses.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Récupérer les résultats QCM pour une annonce
  static async obtenirResultatsQcmAnnonce(req, res) {
    try {
      const { annonceId } = req.params;
      
      // Récupérer tous les résultats QCM pour cette annonce
      const [resultats] = await pool.execute(`
        SELECT 
          iq.id as invitationId,
          iq.score,
          iq.statut,
          iq.dateEnvoi,
          iq.dateVue,
          iq.dateCommencee,
          iq.dateTerminee,
          iq.dateExpiration,
          c.id as candidatId,
          c.nom as candidatNom,
          c.prenom as candidatPrenom,
          qt.id as testId,
          qt.nom as testNom,
          COUNT(qr.id) as nombreReponses,
          SUM(qr.pointsObtenus) as pointsObtenus,
          (SELECT COUNT(*) FROM QcmQuestion WHERE idTest = qt.id) as nombreQuestions,
          (SELECT SUM(points) FROM QcmQuestion WHERE idTest = qt.id) as pointsMax
        FROM InvitationQCM iq
        JOIN Candidat c ON iq.idCandidat = c.id
        JOIN QcmTest qt ON iq.idQcmTest = qt.id
        LEFT JOIN QcmReponse qr ON qr.idCandidat = c.id AND qr.idTest = qt.id
        WHERE iq.idAnnonce = ?
        GROUP BY iq.id, c.id, qt.id
        ORDER BY iq.dateEnvoi DESC
      `, [annonceId]);
      
      res.json({
        success: true,
        data: resultats,
        total: resultats.length
      });
    } catch (error) {
      console.error('Erreur récupération résultats QCM:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = QcmPublicController;
