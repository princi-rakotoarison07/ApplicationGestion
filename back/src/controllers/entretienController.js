const EntretienService = require('../services/entretienService');

class EntretienController {
  
  // Récupérer tous les entretiens
  static async obtenirTousLesEntretiens(req, res) {
    try {
      const entretiens = await EntretienService.obtenirTousLesEntretiens();
      res.json({
        success: true,
        data: entretiens
      });
    } catch (error) {
      console.error('Erreur dans obtenirTousLesEntretiens:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des entretiens'
      });
    }
  }

  // Récupérer un entretien par ID
  static async obtenirEntretienParId(req, res) {
    try {
      const { id } = req.params;
      const entretien = await EntretienService.obtenirEntretienParId(id);
      
      if (!entretien) {
        return res.status(404).json({
          success: false,
          message: 'Entretien non trouvé'
        });
      }
      
      res.json({
        success: true,
        data: entretien
      });
    } catch (error) {
      console.error('Erreur dans obtenirEntretienParId:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'entretien'
      });
    }
  }

  // Créer un nouvel entretien
  static async creerEntretien(req, res) {
    try {
      const entretienData = req.body;
      const nouvelEntretien = await EntretienService.creerEntretien(entretienData);
      
      res.status(201).json({
        success: true,
        data: nouvelEntretien,
        message: 'Entretien créé avec succès'
      });
    } catch (error) {
      console.error('Erreur dans creerEntretien:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de l\'entretien'
      });
    }
  }

  // Mettre à jour un entretien
  static async mettreAJourEntretien(req, res) {
    try {
      const { id } = req.params;
      const entretienData = req.body;
      
      const entretienMisAJour = await EntretienService.mettreAJourEntretien(id, entretienData);
      
      res.json({
        success: true,
        data: entretienMisAJour,
        message: 'Entretien mis à jour avec succès'
      });
    } catch (error) {
      console.error('Erreur dans mettreAJourEntretien:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de l\'entretien'
      });
    }
  }

  // Supprimer un entretien
  static async supprimerEntretien(req, res) {
    try {
      const { id } = req.params;
      const supprime = await EntretienService.supprimerEntretien(id);
      
      if (!supprime) {
        return res.status(404).json({
          success: false,
          message: 'Entretien non trouvé'
        });
      }
      
      res.json({
        success: true,
        message: 'Entretien supprimé avec succès'
      });
    } catch (error) {
      console.error('Erreur dans supprimerEntretien:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de l\'entretien'
      });
    }
  }

  // Récupérer les candidats disponibles
  static async obtenirCandidatsDisponibles(req, res) {
    try {
      const candidats = await EntretienService.obtenirCandidatsDisponibles();
      res.json({
        success: true,
        data: candidats
      });
    } catch (error) {
      console.error('Erreur dans obtenirCandidatsDisponibles:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des candidats disponibles'
      });
    }
  }

  // Récupérer tous les candidats
  static async obtenirTousLesCandidats(req, res) {
    try {
      const candidats = await EntretienService.obtenirTousLesCandidats();
      res.json({
        success: true,
        data: candidats
      });
    } catch (error) {
      console.error('Erreur dans obtenirTousLesCandidats:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des candidats'
      });
    }
  }

  // Récupérer les statuts d'entretien
  static async obtenirStatutsEntretien(req, res) {
    try {
      const statuts = await EntretienService.obtenirStatutsEntretien();
      res.json({
        success: true,
        data: statuts
      });
    } catch (error) {
      console.error('Erreur dans obtenirStatutsEntretien:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statuts'
      });
    }
  }

  // Récupérer les candidats éligibles pour entretien
  static async obtenirCandidatsEligiblesEntretien(req, res) {
    try {
      const candidats = await EntretienService.obtenirCandidatsEligiblesEntretien();
      res.json({
        success: true,
        data: candidats
      });
    } catch (error) {
      console.error('Erreur dans obtenirCandidatsEligiblesEntretien:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des candidats éligibles'
      });
    }
  }

  // Récupérer l'historique d'un entretien
  static async obtenirHistoriqueEntretien(req, res) {
    try {
      const { id } = req.params;
      const historique = await EntretienService.obtenirHistoriqueEntretien(id);
      
      res.json({
        success: true,
        data: historique
      });
    } catch (error) {
      console.error('Erreur dans obtenirHistoriqueEntretien:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'historique de l\'entretien'
      });
    }
  }

  // Récupérer les entretiens d'une annonce
  static async obtenirEntretiensParAnnonce(req, res) {
    try {
      const { annonceId } = req.params;
      const entretiens = await EntretienService.obtenirEntretiensParAnnonce(annonceId);
      
      res.json({
        success: true,
        data: entretiens
      });
    } catch (error) {
      console.error('Erreur dans obtenirEntretiensParAnnonce:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des entretiens de l\'annonce'
      });
    }
  }
}

module.exports = EntretienController;
