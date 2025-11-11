const CompteCandidatService = require('../services/compteCandidatService');

class CompteCandidatController {
  // Inscription d'un nouveau candidat
  static async inscription(req, res) {
    try {
      const { email, motDePasse } = req.body;

      // Validation des données
      if (!email || !motDePasse) {
        return res.status(400).json({
          success: false,
          message: 'Email et mot de passe sont requis'
        });
      }

      // Validation de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Format d\'email invalide'
        });
      }

      // Validation du mot de passe
      if (motDePasse.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Le mot de passe doit contenir au moins 6 caractères'
        });
      }

      const nouveauCompte = await CompteCandidatService.creerCompte(email, motDePasse);

      res.status(201).json({
        success: true,
        message: 'Compte créé avec succès. Veuillez vous connecter.',
        data: nouveauCompte,
        redirectToLogin: true
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Connexion d'un candidat
  static async connexion(req, res) {
    try {
      const { email, motDePasse } = req.body;

      // Validation des données
      if (!email || !motDePasse) {
        return res.status(400).json({
          success: false,
          message: 'Email et mot de passe sont requis'
        });
      }

      const authData = await CompteCandidatService.authentifier(email, motDePasse);

      res.json({
        success: true,
        message: 'Connexion réussie',
        token: authData.token,
        candidat: authData.candidat
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  // Obtenir le profil du candidat connecté
  static async obtenirProfil(req, res) {
    try {
      const candidat = await CompteCandidatService.obtenirParId(req.candidat.id);
      
      if (!candidat) {
        return res.status(404).json({
          success: false,
          message: 'Candidat non trouvé'
        });
      }

      res.json({
        success: true,
        data: candidat
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Mettre à jour le mot de passe
  static async mettreAJourMotDePasse(req, res) {
    try {
      const { motDePasseActuel, nouveauMotDePasse } = req.body;

      if (!motDePasseActuel || !nouveauMotDePasse) {
        return res.status(400).json({
          success: false,
          message: 'Mot de passe actuel et nouveau mot de passe sont requis'
        });
      }

      if (nouveauMotDePasse.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
        });
      }

      // Vérifier le mot de passe actuel
      const compte = await CompteCandidatService.obtenirParId(req.candidat.id);
      const authData = await CompteCandidatService.authentifier(compte.email, motDePasseActuel);

      // Mettre à jour le mot de passe
      const success = await CompteCandidatService.mettreAJourMotDePasse(req.candidat.id, nouveauMotDePasse);

      if (success) {
        res.json({
          success: true,
          message: 'Mot de passe mis à jour avec succès'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Erreur lors de la mise à jour du mot de passe'
        });
      }
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Supprimer le compte
  static async supprimerCompte(req, res) {
    try {
      const success = await CompteCandidatService.supprimerCompte(req.candidat.id);

      if (success) {
        res.json({
          success: true,
          message: 'Compte supprimé avec succès'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Erreur lors de la suppression du compte'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Middleware pour vérifier le token candidat
  static verifierTokenCandidat(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Token d\'authentification requis'
        });
      }

      const token = authHeader.substring(7);
      const decoded = CompteCandidatService.verifierToken(token);
      
      req.candidat = decoded;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Token invalide'
      });
    }
  }

  // Administration - Obtenir tous les comptes
  static async obtenirTousLesComptes(req, res) {
    try {
      const comptes = await CompteCandidatService.obtenirTousLesComptes();
      
      res.json({
        success: true,
        data: comptes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Administration - Statistiques
  static async obtenirStatistiques(req, res) {
    try {
      const stats = await CompteCandidatService.obtenirStatistiques();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Soumettre une candidature avec critères
  static async soumettreCandidat(req, res) {
    try {
      const { nom, prenom, dateNaissance, adresse, cv, idAnnonce, idLieu, criteres } = req.body;
      const idCompteCandidat = req.candidat.id;

      // Validation des données
      if (!nom || !prenom || !dateNaissance || !adresse || !cv || !idAnnonce) {
        return res.status(400).json({
          success: false,
          message: 'Tous les champs obligatoires doivent être remplis'
        });
      }

      // Créer le candidat
      const candidatData = {
        nom,
        prenom,
        dateNaissance,
        adresse,
        cv,
        idAnnonce,
        idLieu,
        idCompteCandidat,
        idStatut: 1 // Statut "En attente" par défaut
      };

      const nouveauCandidat = await CompteCandidatService.creerCandidatAvecCriteres(candidatData, criteres || []);

      res.status(201).json({
        success: true,
        message: 'Candidature soumise avec succès',
        data: nouveauCandidat
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = CompteCandidatController;
