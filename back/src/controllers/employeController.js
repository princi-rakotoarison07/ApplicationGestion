const EmployeService = require('../services/employeService');

class EmployeController {
  
  // Récupérer tous les employés
  static async obtenirTousLesEmployes(req, res) {
    try {
      const employes = await EmployeService.obtenirTousLesEmployes();

      res.status(200).json({
        success: true,
        message: "Liste des employés récupérée avec succès",
        data: employes,
        total: employes.length
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des employés:', error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }

  // Récupérer les employés sans compte utilisateur
  static async obtenirEmployesSansCompte(req, res) {
    try {
      const employes = await EmployeService.obtenirEmployesSansCompte();

      res.status(200).json({
        success: true,
        message: "Liste des employés sans compte récupérée avec succès",
        data: employes,
        total: employes.length
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des employés sans compte:', error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }

  // Récupérer un employé par ID
  static async obtenirEmployeParId(req, res) {
    try {
      const { id } = req.params;
      
      const employe = await EmployeService.obtenirEmployeParId(id);
      
      if (!employe) {
        return res.status(404).json({
          success: false,
          message: "Employé non trouvé"
        });
      }

      res.status(200).json({
        success: true,
        message: "Employé trouvé",
        data: employe
      });

    } catch (error) {
      console.error('Erreur lors de la récupération de l\'employé:', error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }
}

module.exports = EmployeController;
