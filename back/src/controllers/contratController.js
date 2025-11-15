const ContratService = require('../services/contratService');

class ContratController {
  
  // Récupérer tous les contrats
  static async obtenirTousLesContrats(req, res) {
    try {
      const contrats = await ContratService.obtenirTousLesContrats();

      res.status(200).json({
        success: true,
        message: "Liste des contrats récupérée avec succès",
        data: contrats,
        total: contrats.length
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des contrats:', error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }

  // Récupérer les contrats d'un employé
  static async obtenirContratsParEmploye(req, res) {
    try {
      const { idEmploye } = req.params;
      const contrats = await ContratService.obtenirContratsParEmploye(idEmploye);

      res.status(200).json({
        success: true,
        message: "Contrats de l'employé récupérés avec succès",
        data: contrats,
        total: contrats.length
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des contrats de l\'employé:', error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }

  // Récupérer un contrat par ID
  static async obtenirContratParId(req, res) {
    try {
      const { id } = req.params;
      
      const contrat = await ContratService.obtenirContratParId(id);
      
      if (!contrat) {
        return res.status(404).json({
          success: false,
          message: "Contrat non trouvé"
        });
      }

      res.status(200).json({
        success: true,
        message: "Contrat trouvé",
        data: contrat
      });

    } catch (error) {
      console.error('Erreur lors de la récupération du contrat:', error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }

  // Créer un nouveau contrat
  static async creerContrat(req, res) {
    try {
      const contratData = req.body;
      
      // Validation des données requises
      const { idEmploye, dateDebut, nombreMois, typeContrat } = contratData;
      if (!idEmploye || !dateDebut || !nombreMois || !typeContrat) {
        return res.status(400).json({
          success: false,
          message: "Tous les champs sont requis (idEmploye, dateDebut, nombreMois, typeContrat)"
        });
      }

      const nouveauContrat = await ContratService.creerContrat(contratData);

      res.status(201).json({
        success: true,
        message: "Contrat créé avec succès",
        data: nouveauContrat
      });

    } catch (error) {
      console.error('Erreur lors de la création du contrat:', error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }

  // Mettre à jour un contrat
  static async mettreAJourContrat(req, res) {
    try {
      const { id } = req.params;
      const contratData = req.body;

      const contratMisAJour = await ContratService.mettreAJourContrat(id, contratData);
      
      if (!contratMisAJour) {
        return res.status(404).json({
          success: false,
          message: "Contrat non trouvé"
        });
      }

      res.status(200).json({
        success: true,
        message: "Contrat mis à jour avec succès",
        data: contratMisAJour
      });

    } catch (error) {
      console.error('Erreur lors de la mise à jour du contrat:', error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }

  // Supprimer un contrat
  static async supprimerContrat(req, res) {
    try {
      const { id } = req.params;
      
      const supprime = await ContratService.supprimerContrat(id);
      
      if (!supprime) {
        return res.status(404).json({
          success: false,
          message: "Contrat non trouvé"
        });
      }

      res.status(200).json({
        success: true,
        message: "Contrat supprimé avec succès"
      });

    } catch (error) {
      console.error('Erreur lors de la suppression du contrat:', error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }

  // Renouveler un contrat
  static async renouvellerContrat(req, res) {
    try {
      const { id } = req.params;
      const nouvellesDonnees = req.body;

      const nouveauContrat = await ContratService.renouvellerContrat(id, nouvellesDonnees);

      res.status(201).json({
        success: true,
        message: "Contrat renouvelé avec succès",
        data: nouveauContrat
      });

    } catch (error) {
      console.error('Erreur lors du renouvellement du contrat:', error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }

  // Obtenir les statistiques des contrats
  static async obtenirStatistiquesContrats(req, res) {
    try {
      const stats = await ContratService.obtenirStatistiquesContrats();

      res.status(200).json({
        success: true,
        message: "Statistiques des contrats récupérées avec succès",
        data: stats
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

module.exports = ContratController;
