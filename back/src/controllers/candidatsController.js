const CandidatsService = require('../services/candidatsService');

class CandidatsController {
  static async obtenirTousLesCandidats(req, res) {
    try {
      const candidats = await CandidatsService.obtenirTousLesCandidats();
      res.status(200).json({
        success: true,
        message: 'Liste des candidats récupérée avec succès',
        data: candidats,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des candidats:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
        error: error.message,
      });
    }
  }

    static async obtenirCandidatParId(req, res) {
    try {
      const { id } = req.params;
      const candidat = await CandidatsService.obtenirCandidatParId(id);
      res.status(200).json({
        success: true,
        message: 'Candidat récupéré avec succès',
        data: candidat,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du candidat:', error);
      res.status(error.message === 'Candidat non trouvé' ? 404 : 500).json({
        success: false,
        message: error.message,
      });
    }
  }

    static async obtenirEmployeParId(req, res) {
    try {
      const { id } = req.params;
      const employe = await CandidatsService.obtenirEmployeParId(id);
      res.status(200).json({
        success: true,
        message: 'Employé récupéré avec succès',
        data: employe,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'employé:', error);
      res.status(error.message === 'Employé non trouvé' ? 404 : 500).json({
        success: false,
        message: error.message,
      });
    }
  }

    static async ajouterContrat(req, res) {
    try {
      const contratData = req.body;
      const nouveauContrat = await CandidatsService.ajouterContrat(contratData);
      res.status(201).json({
        success: true,
        message: 'Contrat ajouté avec succès',
        data: nouveauContrat,
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du contrat:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
        error: error.message,
      });
    }
  }

    static async obtenirTousLesContrats(req, res) {
    try {
      const contrats = await CandidatsService.obtenirTousLesContrats();
      res.status(200).json({
        success: true,
        message: 'Liste des contrats récupérée avec succès',
        data: contrats,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des contrats:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
        error: error.message,
      });
    }
  }

  static async obtenirContratParId(req, res) {
    try {
      const { id } = req.params;
      const contrat = await CandidatsService.obtenirContratParId(id);
      res.status(200).json({
        success: true,
        message: 'Contrat récupéré avec succès',
        data: contrat,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du contrat:', error);
      res.status(error.message === 'Contrat non trouvé' ? 404 : 500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = CandidatsController;