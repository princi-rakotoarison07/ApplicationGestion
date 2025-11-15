const express = require('express');
const router = express.Router();
const UtilisateursController = require('../controllers/utilisateursController');
const AuthController = require('../controllers/authController');
const EmployeController = require('../controllers/employeController');
const CandidatsController = require('../controllers/candidatsController');
const QcmController = require('../controllers/qcmController');
const QcmPublicController = require('../controllers/qcmPublicController');
const AnnonceController = require('../controllers/annonceController');
const ProfilController = require('../controllers/profilController');
const CritereController = require('../controllers/critereController');
const CritereProfilController = require('../controllers/critereProfilController');
const CandidatController = require('../controllers/candidatController');
const EntretienController = require('../controllers/entretienController');
const CompteCandidatController = require('../controllers/compteCandidatController');
const NotificationController = require('../controllers/notificationController');
const NotificationCandidatController = require('../controllers/notificationCandidatController');
const ContratController = require('../controllers/contratController');

// Routes d'authentification
router.post('/auth/inscription', AuthController.inscription);
router.post('/auth/connexion', AuthController.connexion);
router.get('/auth/profil', AuthController.verifierToken, AuthController.profil);

// Routes pour les employés
router.get('/employes', EmployeController.obtenirTousLesEmployes);
router.get('/employes/sans-compte', EmployeController.obtenirEmployesSansCompte);
router.get('/employes/:id', EmployeController.obtenirEmployeParId);

// Routes publiques pour les tests QCM (accès candidats)
router.get('/qcm/public/tests/:id', QcmController.obtenirTestParId);
router.post('/qcm/public/token/:token/soumettre', QcmPublicController.soumettreReponses);
router.get('/qcm/public/token/:token', QcmPublicController.obtenirTestParToken);

// Routes de debug QCM
router.get('/qcm/public/tests/:token/debug', QcmPublicController.debugToken);
router.get('/qcm/debug/test/:testId', QcmPublicController.debugTest);
router.get('/qcm/debug/reponses/:candidatId/:testId', QcmPublicController.debugReponses);

// Routes pour les résultats QCM (protégées - admin)
router.get('/qcm/resultats/annonce/:annonceId', AuthController.verifierToken, QcmPublicController.obtenirResultatsQcmAnnonce);

// Route de debug pour insérer les statuts d'entretien manquants
router.post('/debug/init-statuts-entretien', async (req, res) => {
  try {
    const { pool } = require('../config/database');
    
    // Insérer les statuts d'entretien
    await pool.execute(`
      INSERT IGNORE INTO StatutEntretien (id, nom) VALUES 
      (1, 'En attente'),
      (2, 'Confirmé'),
      (3, 'Reporté'),
      (4, 'Annulé')
    `);
    
    // Vérifier les statuts créés
    const [statuts] = await pool.execute('SELECT * FROM StatutEntretien ORDER BY id');
    
    res.json({
      success: true,
      message: 'Statuts d\'entretien initialisés avec succès',
      data: statuts
    });
  } catch (error) {
    console.error('Erreur initialisation statuts:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Routes pour les tests QCM (protégées)
router.get('/qcm/tests', AuthController.verifierToken, QcmController.obtenirTousLesTests);
router.get('/qcm/tests/:id', AuthController.verifierToken, QcmController.obtenirTestParId);
router.post('/qcm/tests', AuthController.verifierToken, QcmController.creerTest);
router.post('/qcm/tests/:id/questions', AuthController.verifierToken, QcmController.ajouterQuestion);
router.get('/qcm/profils', AuthController.verifierToken, QcmController.obtenirTousLesProfils);
router.delete('/qcm/tests/:id', AuthController.verifierToken, QcmController.supprimerTest);

// Routes pour les utilisateurs (protégées)
router.get('/utilisateurs', AuthController.verifierToken, UtilisateursController.obtenirTousLesUtilisateurs);
router.get('/utilisateurs/:id', AuthController.verifierToken, UtilisateursController.obtenirUtilisateurParId);
router.post('/utilisateurs', AuthController.verifierToken, UtilisateursController.creerUtilisateur);

// Routes publiques pour les clients (sans authentification)
router.get('/client/annonce', AnnonceController.obtenirAnnoncesActives);
router.get('/client/annonce/:id', AnnonceController.obtenirAnnonceParId);

// Routes pour les annonces (protégées)
router.get('/annonces', AuthController.verifierToken, AnnonceController.obtenirToutesLesAnnonces);
router.get('/annonces/actives', AuthController.verifierToken, AnnonceController.obtenirAnnoncesActives);
router.get('/annonces/avec-candidats', AuthController.verifierToken, AnnonceController.obtenirAnnoncesAvecCandidats);
router.get('/annonces/statistiques', AuthController.verifierToken, AnnonceController.obtenirStatistiques);
router.get('/annonces/recherche', AuthController.verifierToken, AnnonceController.rechercherAnnonces);
router.get('/annonces/profils', AuthController.verifierToken, AnnonceController.obtenirProfils);
router.get('/annonces/profils/:idProfil/criteres', AuthController.verifierToken, AnnonceController.obtenirCriteresProfil);
router.get('/annonces/criteres', AuthController.verifierToken, AnnonceController.obtenirTousLesCriteres);
router.get('/annonces/departements', AuthController.verifierToken, AnnonceController.obtenirDepartements);
router.get('/annonces/types', AuthController.verifierToken, AnnonceController.obtenirTypesAnnonce);

// Endpoints publics pour le côté client
router.get('/client/departements', AnnonceController.obtenirDepartements);
router.get('/client/types', AnnonceController.obtenirTypesAnnonce);
router.get('/client/lieux', AnnonceController.obtenirLieux);
router.get('/client/diplomes', AnnonceController.obtenirDiplomes);

// Test endpoint pour vérifier les données
router.get('/client/test-data', AnnonceController.obtenirTestData);
router.get('/annonces/departement/:idDepartement', AuthController.verifierToken, AnnonceController.obtenirAnnoncesParDepartement);
router.get('/annonces/:id', AuthController.verifierToken, AnnonceController.obtenirAnnonceParId);
router.get('/annonces/:id/candidats', AuthController.verifierToken, AnnonceController.obtenirNombreCandidats);
router.post('/annonces', AuthController.verifierToken, AnnonceController.creerAnnonce);
router.put('/annonces/:id', AuthController.verifierToken, AnnonceController.mettreAJourAnnonce);
router.delete('/annonces/:id', AuthController.verifierToken, AnnonceController.supprimerAnnonce);

// CRUD Profil
router.get('/profils', ProfilController.getAll);
router.get('/profils/:id', ProfilController.getById);
router.post('/profils', ProfilController.create);
router.put('/profils/:id', ProfilController.update);
router.delete('/profils/:id', ProfilController.delete);

// CRUD Critere
router.get('/criteres', CritereController.getAll);
router.get('/criteres/:id', CritereController.getById);
router.post('/criteres', CritereController.create);
router.put('/criteres/:id', CritereController.update);
router.delete('/criteres/:id', CritereController.delete);

// CRUD CritereProfil (association)
router.get('/critereprofils', CritereProfilController.getAll);
router.get('/critereprofils/details', CritereProfilController.getAllWithDetails);
router.get('/critereprofils/filter', CritereProfilController.getFiltered);
router.get('/critereprofils/duplicates/stats', AuthController.verifierToken, CritereProfilController.getDuplicatesStats);
router.post('/critereprofils/duplicates/cleanup', AuthController.verifierToken, CritereProfilController.cleanupDuplicates);
router.post('/critereprofils/fix-zero-values', AuthController.verifierToken, CritereProfilController.fixZeroValues);
router.get('/critereprofils/:id', CritereProfilController.getById);
router.post('/critereprofils', CritereProfilController.create);
router.put('/critereprofils/:id', CritereProfilController.update);
router.delete('/critereprofils/:id', CritereProfilController.delete);

// Routes pour les entretiens (ordre important : routes spécifiques avant routes avec paramètres)
router.get('/entretiens/candidats/eligibles', AuthController.verifierToken, EntretienController.obtenirCandidatsEligiblesEntretien);
router.get('/entretiens/candidats/disponibles', AuthController.verifierToken, EntretienController.obtenirCandidatsDisponibles);
router.get('/entretiens/candidats/tous', AuthController.verifierToken, EntretienController.obtenirTousLesCandidats);
router.get('/entretiens/statuts/tous', AuthController.verifierToken, EntretienController.obtenirStatutsEntretien);
router.get('/entretiens/annonce/:annonceId', AuthController.verifierToken, EntretienController.obtenirEntretiensParAnnonce);
router.get('/entretiens/:id/historique', AuthController.verifierToken, EntretienController.obtenirHistoriqueEntretien);
router.get('/entretiens', AuthController.verifierToken, EntretienController.obtenirTousLesEntretiens);
router.get('/entretiens/:id', AuthController.verifierToken, EntretienController.obtenirEntretienParId);
router.post('/entretiens', AuthController.verifierToken, EntretienController.creerEntretien);
router.put('/entretiens/:id', AuthController.verifierToken, EntretienController.mettreAJourEntretien);
router.delete('/entretiens/:id', AuthController.verifierToken, EntretienController.supprimerEntretien);

// Routes pour les candidats (protégées)
router.get('/candidats', AuthController.verifierToken, CandidatController.obtenirTousLesCandidats);
router.get('/candidats/annonce/:idAnnonce', AuthController.verifierToken, CandidatController.obtenirCandidatsParAnnonce);
router.get('/candidats/statistiques', AuthController.verifierToken, CandidatController.obtenirStatistiques);
router.get('/candidats/:id', AuthController.verifierToken, CandidatController.obtenirCandidatParId);
router.post('/candidats', AuthController.verifierToken, CandidatController.creerCandidat);
router.put('/candidats/:id/statut', AuthController.verifierToken, CandidatController.mettreAJourStatutCandidat);
router.delete('/candidats/:id', AuthController.verifierToken, CandidatController.supprimerCandidat);

// Routes pour les comptes candidats
router.post('/candidats/inscription', CompteCandidatController.inscription);
router.post('/candidats/connexion', CompteCandidatController.connexion);
router.get('/candidats/profil', CompteCandidatController.verifierTokenCandidat, CompteCandidatController.obtenirProfil);
router.put('/candidats/mot-de-passe', CompteCandidatController.verifierTokenCandidat, CompteCandidatController.mettreAJourMotDePasse);
router.delete('/candidats/compte', CompteCandidatController.verifierTokenCandidat, CompteCandidatController.supprimerCompte);
router.post('/candidats/candidature', CompteCandidatController.verifierTokenCandidat, CompteCandidatController.soumettreCandidat);

// Routes d'administration pour les comptes candidats
router.get('/candidats/admin/comptes', AuthController.verifierToken, CompteCandidatController.obtenirTousLesComptes);
router.get('/candidats/admin/statistiques', AuthController.verifierToken, CompteCandidatController.obtenirStatistiques);

// Routes pour les notifications QCM (protégées - admin)
router.post('/notifications/envoyer-qcm', AuthController.verifierToken, NotificationController.envoyerQcm);
router.get('/notifications/historique', AuthController.verifierToken, NotificationController.obtenirHistorique);

// Routes pour les notifications côté client (candidats)
router.get('/candidats/notifications', CompteCandidatController.verifierTokenCandidat, NotificationController.obtenirNotificationsCandidat);
router.put('/candidats/notifications/:id/lue', CompteCandidatController.verifierTokenCandidat, NotificationController.marquerCommeLue);

// Routes temporaires pour notifications (sans authentification)
router.get('/candidats/notifications/simple', NotificationCandidatController.obtenirNotificationsSimple);
router.put('/candidats/notifications/:id/lue/simple', NotificationCandidatController.marquerCommeLueSimple);

// Routes de debug pour notifications
router.get('/candidats/notifications/debug', NotificationCandidatController.debugNotifications);

// Routes pour les contrats (protégées)
router.get('/contrats', AuthController.verifierToken, ContratController.obtenirTousLesContrats);
router.get('/contrats/statistiques', AuthController.verifierToken, ContratController.obtenirStatistiquesContrats);
router.get('/contrats/employe/:idEmploye', AuthController.verifierToken, ContratController.obtenirContratsParEmploye);
router.get('/contrats/:id', AuthController.verifierToken, ContratController.obtenirContratParId);
router.post('/contrats', AuthController.verifierToken, ContratController.creerContrat);
router.put('/contrats/:id', AuthController.verifierToken, ContratController.mettreAJourContrat);
router.delete('/contrats/:id', AuthController.verifierToken, ContratController.supprimerContrat);
router.post('/contrats/:id/renouveler', AuthController.verifierToken, ContratController.renouvellerContrat);

// Routes existantes pour CandidatsController (à conserver)
router.get('/candidats', AuthController.verifierToken, CandidatsController.obtenirTousLesCandidats);
router.get('/employes/:id', AuthController.verifierToken, CandidatsController.obtenirEmployeParId);


module.exports = router;