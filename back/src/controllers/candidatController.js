const CandidatService = require('../services/candidatService');

class CandidatController {
  
  // Récupérer tous les candidats
  static async obtenirTousLesCandidats(req, res) {
    try {
      const candidats = await CandidatService.obtenirTousLesCandidats();

      res.status(200).json({
        success: true,
        message: "Liste des candidats récupérée avec succès",
        data: candidats,
        total: candidats.length
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des candidats:', error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }

  // Récupérer les candidats d'une annonce spécifique
  static async obtenirCandidatsParAnnonce(req, res) {
    try {
      const { idAnnonce } = req.params;
      
      const candidats = await CandidatService.obtenirCandidatsParAnnonce(idAnnonce);

      res.status(200).json({
        success: true,
        message: "Liste des candidats de l'annonce récupérée avec succès",
        data: candidats,
        total: candidats.length
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des candidats de l\'annonce:', error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }

  // Récupérer un candidat par ID
  static async obtenirCandidatParId(req, res) {
    try {
      const { id } = req.params;
      
      const candidat = await CandidatService.obtenirCandidatParId(id);
      
      if (!candidat) {
        return res.status(404).json({
          success: false,
          message: "Candidat non trouvé"
        });
      }

      res.status(200).json({
        success: true,
        message: "Candidat trouvé",
        data: candidat
      });

    } catch (error) {
      console.error('Erreur lors de la récupération du candidat:', error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }

  // Créer un nouveau candidat
  static async creerCandidat(req, res) {
    try {
      const { nom, prenom, dateNaissance, adresse, cv, idAnnonce } = req.body;
      
      // Validation des données
      if (!nom || !prenom || !idAnnonce) {
        return res.status(400).json({
          success: false,
          message: "Les champs nom, prenom et idAnnonce sont requis"
        });
      }

      const nouveauCandidat = await CandidatService.creerCandidat({
        nom,
        prenom,
        dateNaissance,
        adresse,
        cv,
        idAnnonce
      });

      res.status(201).json({
        success: true,
        message: "Candidat créé avec succès",
        data: nouveauCandidat
      });

    } catch (error) {
      console.error('Erreur lors de la création du candidat:', error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }

  // Mettre à jour le statut d'un candidat
  static async mettreAJourStatutCandidat(req, res) {
    try {
      const { id } = req.params;
      const { idStatut } = req.body;
      
      if (!idStatut) {
        return res.status(400).json({
          success: false,
          message: "Le champ idStatut est requis"
        });
      }

      const candidatModifie = await CandidatService.mettreAJourStatutCandidat(id, idStatut);

      if (!candidatModifie) {
        return res.status(404).json({
          success: false,
          message: "Candidat non trouvé"
        });
      }

      res.status(200).json({
        success: true,
        message: "Statut du candidat mis à jour avec succès",
        data: candidatModifie
      });

    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }

  // Supprimer un candidat
  static async supprimerCandidat(req, res) {
    try {
      const { id } = req.params;
      
      const supprime = await CandidatService.supprimerCandidat(id);
      
      if (!supprime) {
        return res.status(404).json({
          success: false,
          message: "Candidat non trouvé"
        });
      }

      res.status(200).json({
        success: true,
        message: "Candidat supprimé avec succès"
      });

    } catch (error) {
      console.error('Erreur lors de la suppression du candidat:', error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }

  // Obtenir les statistiques des candidats
  static async obtenirStatistiques(req, res) {
    try {
      const statistiques = await CandidatService.obtenirStatistiques();

      res.status(200).json({
        success: true,
        message: "Statistiques récupérées avec succès",
        data: statistiques
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }
}

module.exports = CandidatController;
