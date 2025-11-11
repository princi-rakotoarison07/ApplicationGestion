const AuthService = require('../services/authService');

class AuthController {
  
  // Inscription d'un nouvel utilisateur
  static async inscription(req, res) {
    try {
      const { email, motDePasse, confirmMotDePasse } = req.body;

      // Validation des données
      if (!email || !motDePasse) {
        return res.status(400).json({
          success: false,
          message: "L'email et le mot de passe sont obligatoires"
        });
      }

      if (motDePasse !== confirmMotDePasse) {
        return res.status(400).json({
          success: false,
          message: "Les mots de passe ne correspondent pas"
        });
      }

      if (motDePasse.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Le mot de passe doit contenir au moins 6 caractères"
        });
      }

      // Validation email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Format d'email invalide"
        });
      }

      const { idEmploye } = req.body;

      if (!idEmploye) {
        return res.status(400).json({
          success: false,
          message: "L'employé doit être sélectionné"
        });
      }

      const nouvelUtilisateur = await AuthService.inscription({
        email,
        motDePasse,
        idEmploye
      });

      res.status(201).json({
        success: true,
        message: "Inscription réussie",
        data: nouvelUtilisateur
      });

    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      
      if (error.message === 'Cet email est déjà utilisé') {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }

  // Connexion d'un utilisateur
  static async connexion(req, res) {
    try {
      const { email, motDePasse } = req.body;

      // Validation des données
      if (!email || !motDePasse) {
        return res.status(400).json({
          success: false,
          message: "L'email et le mot de passe sont obligatoires"
        });
      }

      const resultat = await AuthService.connexion(email, motDePasse);

      res.status(200).json({
        success: true,
        message: "Connexion réussie",
        data: resultat
      });

    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      
      if (error.message === 'Email ou mot de passe incorrect') {
        return res.status(401).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }

  // Vérification du token (middleware)
  static async verifierToken(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Token d'authentification manquant"
        });
      }

      const decoded = AuthService.verifierToken(token);
      req.user = decoded;
      next();

    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      res.status(401).json({
        success: false,
        message: "Token invalide"
      });
    }
  }

  // Récupérer le profil utilisateur connecté
  static async profil(req, res) {
    try {
      const utilisateur = await AuthService.obtenirUtilisateurParId(req.user.userId);

      if (!utilisateur) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé"
        });
      }

      res.status(200).json({
        success: true,
        message: "Profil récupéré avec succès",
        data: utilisateur
      });

    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      res.status(500).json({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      });
    }
  }
}

module.exports = AuthController;
