const { pool } = require('../config/database');

class QcmService {
  
  // Récupérer tous les tests QCM
  static async obtenirTousLesTests() {
    try {
      const [rows] = await pool.execute(
        `SELECT q.id, q.nom, q.idProfil,
                p.nom as nomProfil,
                COUNT(qq.id) as nombreQuestions
         FROM QcmTest q 
         LEFT JOIN Profil p ON q.idProfil = p.id 
         LEFT JOIN QcmQuestion qq ON q.id = qq.idTest
         GROUP BY q.id, q.nom, q.idProfil, p.nom
         ORDER BY q.nom`
      );
      return rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des tests QCM:', error);
      throw error;
    }
  }

  // Récupérer un test QCM par ID avec ses questions
  static async obtenirTestParId(id) {
    try {
      // Récupérer le test
      const [testRows] = await pool.execute(
        `SELECT q.id, q.nom, q.idProfil, p.nom as nomProfil
         FROM QcmTest q 
         LEFT JOIN Profil p ON q.idProfil = p.id 
         WHERE q.id = ?`,
        [id]
      );

      if (testRows.length === 0) {
        return null;
      }

      const test = testRows[0];

      // Récupérer les questions du test
      const [questionRows] = await pool.execute(
        `SELECT qq.id, qq.numero, qq.question, qq.points
         FROM QcmQuestion qq 
         WHERE qq.idTest = ?
         ORDER BY qq.numero`,
        [id]
      );

      // Récupérer les choix pour chaque question
      for (let question of questionRows) {
        const [choixRows] = await pool.execute(
          `SELECT qc.id, qc.texte, qc.estCorrect
           FROM QcmChoix qc 
           WHERE qc.idQuestion = ?
           ORDER BY qc.id`,
          [question.id]
        );
        question.choix = choixRows;
      }

      test.questions = questionRows;
      return test;
    } catch (error) {
      console.error('Erreur lors de la récupération du test QCM:', error);
      throw error;
    }
  }

  // Créer un nouveau test QCM
  static async creerTest(testData) {
    try {
      const { nom, idProfil } = testData;
      
      const [result] = await pool.execute(
        'INSERT INTO QcmTest (nom, idProfil) VALUES (?, ?)',
        [nom, idProfil]
      );
      
      return await this.obtenirTestParId(result.insertId);
    } catch (error) {
      console.error('Erreur lors de la création du test QCM:', error);
      throw error;
    }
  }

  // Ajouter une question à un test
  static async ajouterQuestion(questionData) {
    try {
      const { idTest, numero, question, points, choix } = questionData;
      
      // Insérer la question
      const [result] = await pool.execute(
        'INSERT INTO QcmQuestion (idTest, numero, question, points) VALUES (?, ?, ?, ?)',
        [idTest, numero, question, points]
      );
      
      const questionId = result.insertId;

      // Insérer les choix
      if (choix && choix.length > 0) {
        for (let choixItem of choix) {
          await pool.execute(
            'INSERT INTO QcmChoix (idQuestion, texte, estCorrect) VALUES (?, ?, ?)',
            [questionId, choixItem.texte, choixItem.estCorrect]
          );
        }
      }

      return questionId;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la question:', error);
      throw error;
    }
  }

  // Récupérer tous les profils pour la sélection
  static async obtenirTousLesProfils() {
    try {
      const [rows] = await pool.execute(
        'SELECT id, nom FROM Profil ORDER BY nom'
      );
      return rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des profils:', error);
      throw error;
    }
  }

  // Supprimer un test QCM
  static async supprimerTest(id) {
    try {
      // Supprimer d'abord les choix des questions
      await pool.execute(
        `DELETE qc FROM QcmChoix qc 
         INNER JOIN QcmQuestion qq ON qc.idQuestion = qq.id 
         WHERE qq.idTest = ?`,
        [id]
      );

      // Supprimer les questions
      await pool.execute(
        'DELETE FROM QcmQuestion WHERE idTest = ?',
        [id]
      );

      // Supprimer le test
      const [result] = await pool.execute(
        'DELETE FROM QcmTest WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erreur lors de la suppression du test QCM:', error);
      throw error;
    }
  }
}

module.exports = QcmService;
