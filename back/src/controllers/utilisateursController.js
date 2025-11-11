const UtilisateursService = require('../services/utilisateursService');

// Contrôleur pour la gestion des utilisateurs
class UtilisateursController {
  
  // Récupérer tous les utilisateurs
  static async obtenirTousLesUtilisateurs(req, res) {
    try {
      const utilisateurs = await UtilisateursService.obtenirTousLesUtilisateurs();

      res.status(200).json({
        success: true,
        message: "Liste des utilisateurs récupérée avec succès",
        data: utilisateurs,
        total: utilisateurs.length
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }

  // Récupérer un utilisateur par ID
  static async obtenirUtilisateurParId(req, res) {
    try {
      const { id } = req.params;
      
      const utilisateur = await UtilisateursService.obtenirUtilisateurParId(id);
      
      if (!utilisateur) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé"
        });
      }

      res.status(200).json({
        success: true,
        message: "Utilisateur trouvé",
        data: utilisateur
      });

    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }

  // Créer un nouvel utilisateur
  static async creerUtilisateur(req, res) {
    try {
      const { nom, prenom, email, role } = req.body;

      // Validation des données
      if (!nom || !prenom || !email) {
        return res.status(400).json({
          success: false,
          message: "Les champs nom, prénom et email sont obligatoires"
        });
      }

      // Vérifier si l'email existe déjà
      const emailExiste = await UtilisateursService.emailExiste(email);
      if (emailExiste) {
        return res.status(409).json({
          success: false,
          message: "Cet email est déjà utilisé"
        });
      }

      const nouvelUtilisateur = await UtilisateursService.creerUtilisateur({
        nom,
        prenom,
        email,
        role: role || "Utilisateur"
      });

      res.status(201).json({
        success: true,
        message: "Utilisateur créé avec succès",
        data: nouvelUtilisateur
      });

    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }
}

module.exports = UtilisateursController;