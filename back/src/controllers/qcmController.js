const QcmService = require('../services/qcmService');

class QcmController {
  
  // Récupérer tous les tests QCM
  static async obtenirTousLesTests(req, res) {
    try {
      const tests = await QcmService.obtenirTousLesTests();

      res.status(200).json({
        success: true,
        message: "Liste des tests QCM récupérée avec succès",
        data: tests,
        total: tests.length
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des tests QCM:', error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }

  // Récupérer un test QCM par ID
  static async obtenirTestParId(req, res) {
    try {
      const { id } = req.params;
      
      const test = await QcmService.obtenirTestParId(id);
      
      if (!test) {
        return res.status(404).json({
          success: false,
          message: "Test QCM non trouvé"
        });
      }

      res.status(200).json({
        success: true,
        message: "Test QCM trouvé",
        data: test
      });

    } catch (error) {
      console.error('Erreur lors de la récupération du test QCM:', error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }

  // Créer un nouveau test QCM
  static async creerTest(req, res) {
    try {
      const { nom, idProfil } = req.body;

      if (!nom || !idProfil) {
        return res.status(400).json({
          success: false,
          message: "Le nom du test et le profil sont requis"
        });
      }

      const nouveauTest = await QcmService.creerTest({ nom, idProfil });

      res.status(201).json({
        success: true,
        message: "Test QCM créé avec succès",
        data: nouveauTest
      });

    } catch (error) {
      console.error('Erreur lors de la création du test QCM:', error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }

  // Ajouter une question à un test
  static async ajouterQuestion(req, res) {
    try {
      const { idTest, numero, question, points, choix } = req.body;

      if (!idTest || !numero || !question || !points || !choix || choix.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Tous les champs sont requis (idTest, numero, question, points, choix)"
        });
      }

      // Vérifier qu'au moins un choix est correct
      const hasCorrectAnswer = choix.some(c => c.estCorrect === true);
      if (!hasCorrectAnswer) {
        return res.status(400).json({
          success: false,
          message: "Au moins un choix doit être marqué comme correct"
        });
      }

      const questionId = await QcmService.ajouterQuestion({
        idTest, numero, question, points, choix
      });

      res.status(201).json({
        success: true,
        message: "Question ajoutée avec succès",
        data: { questionId }
      });

    } catch (error) {
      console.error('Erreur lors de l\'ajout de la question:', error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }

  // Récupérer tous les profils
  static async obtenirTousLesProfils(req, res) {
    try {
      const profils = await QcmService.obtenirTousLesProfils();

      res.status(200).json({
        success: true,
        message: "Liste des profils récupérée avec succès",
        data: profils
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des profils:', error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }

  // Supprimer un test QCM
  static async supprimerTest(req, res) {
    try {
      const { id } = req.params;
      
      const supprime = await QcmService.supprimerTest(id);
      
      if (!supprime) {
        return res.status(404).json({
          success: false,
          message: "Test QCM non trouvé"
        });
      }

      res.status(200).json({
        success: true,
        message: "Test QCM supprimé avec succès"
      });

    } catch (error) {
      console.error('Erreur lors de la suppression du test QCM:', error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }
}

module.exports = QcmController;
