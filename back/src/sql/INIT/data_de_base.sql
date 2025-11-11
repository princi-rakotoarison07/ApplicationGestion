-- =========================
-- DONNEES DE BASE - APPLICATION RH
-- Données de référence essentielles pour le fonctionnement de l'application
-- Ces données sont nécessaires au métier et ne sont pas créées via l'interface
-- =========================

SET FOREIGN_KEY_CHECKS = 0;

-- =========================
-- STATUTS (Données fixes métier)
-- =========================

-- Statuts candidat (workflow de candidature)
INSERT INTO StatutCandidat (nom, ordre, couleur, description) VALUES
('Nouveau', 1, '#3498db', 'Candidature reçue, non examinée'),
('En cours d\'examen', 2, '#f39c12', 'Dossier en cours d\'analyse'),
('Présélectionné', 3, '#9b59b6', 'Candidat présélectionné pour tests'),
('Tests réussis', 4, '#1abc9c', 'A passé les tests avec succès'),
('Entretien planifié', 5, '#e67e22', 'Entretien programmé'),
('Entretien réalisé', 6, '#34495e', 'Entretien effectué, en attente décision'),
('Accepté', 7, '#27ae60', 'Candidature acceptée'),
('Refusé', 8, '#e74c3c', 'Candidature refusée'),
('En attente', 9, '#95a5a6', 'Candidat en liste d\'attente');

-- Statuts entretien (workflow d'entretien)
INSERT INTO StatutEntretien (nom, ordre, couleur, description) VALUES
('Planifié', 1, '#3498db', 'Entretien programmé'),
('Confirmé', 2, '#1abc9c', 'Candidat a confirmé sa présence'),
('En cours', 3, '#f39c12', 'Entretien en cours'),
('Terminé', 4, '#27ae60', 'Entretien effectué'),
('Reporté', 5, '#e67e22', 'Entretien reporté'),
('Annulé', 6, '#e74c3c', 'Entretien annulé'),
('Absent', 7, '#95a5a6', 'Candidat absent');

-- =========================
-- TYPES DE CONTRAT (Données de référence)
-- =========================

-- Types d'annonce/contrat
INSERT INTO TypeAnnonce (libelle, description, actif) VALUES
('CDI', 'Contrat à Durée Indéterminée', TRUE),
('CDD', 'Contrat à Durée Déterminée', TRUE),
('Stage', 'Stage conventionné', TRUE),
('Alternance', 'Contrat d\'apprentissage ou professionnalisation', TRUE),
('Freelance', 'Mission en freelance/prestation', TRUE),
('Intérim', 'Contrat de travail temporaire', TRUE),
('VIE', 'Volontariat International en Entreprise', TRUE);

-- =========================
-- DIPLOMES (Référentiel)
-- =========================

-- Diplômes standards français
INSERT INTO Diplome (nom, niveau, description) VALUES
('Sans diplôme', 'Niveau 1', 'Aucun diplôme'),
('CAP/BEP', 'Niveau 3', 'Certificat d\'Aptitude Professionnelle'),
('Baccalauréat', 'Niveau 4', 'Diplôme de fin d\'études secondaires'),
('BTS', 'Niveau 5', 'Brevet de Technicien Supérieur (Bac+2)'),
('DUT', 'Niveau 5', 'Diplôme Universitaire de Technologie (Bac+2)'),
('Licence', 'Niveau 6', 'Licence universitaire (Bac+3)'),
('Licence Professionnelle', 'Niveau 6', 'Licence Pro (Bac+3)'),
('Master', 'Niveau 7', 'Master universitaire (Bac+5)'),
('Ingénieur', 'Niveau 7', 'Diplôme d\'ingénieur (Bac+5)'),
('MBA', 'Niveau 7', 'Master of Business Administration'),
('Doctorat', 'Niveau 8', 'Doctorat/PhD (Bac+8)');

-- =========================
-- DEPARTEMENTS DE BASE (Optionnel - peut être vide si créé via interface)
-- =========================

-- Départements standards d'une entreprise
-- NOTE: Ces données peuvent être commentées si vous préférez créer les départements via l'interface
INSERT INTO Departement (nom, description, actif) VALUES
('Direction Générale', 'Direction et stratégie', TRUE),
('Ressources Humaines', 'Gestion du personnel et recrutement', TRUE),
('Informatique', 'Système d\'information et développement', TRUE),
('Commercial', 'Ventes et développement commercial', TRUE),
('Marketing', 'Communication et marketing', TRUE),
('Finance', 'Comptabilité et contrôle de gestion', TRUE),
('Production', 'Fabrication et opérations', TRUE),
('Logistique', 'Supply chain et transport', TRUE),
('Juridique', 'Affaires juridiques et conformité', TRUE),
('Qualité', 'Contrôle qualité et normes', TRUE);

-- =========================
-- CRITERES DE BASE (Optionnel)
-- =========================

-- Critères de sélection couramment utilisés
-- NOTE: Ces données peuvent être commentées si vous préférez créer les critères via l'interface
INSERT INTO Critere (nom, typeDonnee, description) VALUES
('Années d\'expérience', 'numerique', 'Nombre d\'années d\'expérience professionnelle'),
('Niveau d\'études', 'texte', 'Niveau de diplôme obtenu'),
('Maîtrise de l\'anglais', 'booleen', 'Capacité à travailler en anglais'),
('Permis de conduire', 'booleen', 'Possession du permis B'),
('Disponibilité', 'date', 'Date de disponibilité du candidat'),
('Prétention salariale', 'numerique', 'Salaire souhaité en euros'),
('Mobilité géographique', 'booleen', 'Accepte les déplacements/mutations'),
('Travail en équipe', 'numerique', 'Capacité à travailler en équipe (1-10)'),
('Leadership', 'numerique', 'Capacité de leadership (1-10)'),
('Autonomie', 'numerique', 'Niveau d\'autonomie (1-10)');

SET FOREIGN_KEY_CHECKS = 1;


INSERT INTO Employe (nom, prenom, dateNaissance, adresse, telephone, email, dateEmbauche, idDept, actif) VALUES
('Dupont', 'Marie', '1985-03-15', '12 Rue Paix, Paris', '0612345678', 'marie.dupont@entreprise.com', '2018-01-10', 1, TRUE),
('Martin', 'Pierre', '1982-07-22', '45 Av Champs, Lyon', '0623456789', 'pierre.martin@entreprise.com', '2017-05-15', 2, TRUE),
('Bernard', 'Sophie', '1990-11-08', '78 Bd Hugo, Marseille', '0634567890', 'sophie.bernard@entreprise.com', '2019-09-01', 2, TRUE),
('Dubois', 'Luc', '1988-04-30', '23 Rue Commerce', '0645678901', 'luc.dubois@entreprise.com', '2020-02-20', 3, TRUE),
('Thomas', 'Julie', '1992-09-12', '56 Allée Lilas', '0656789012', 'julie.thomas@entreprise.com', '2021-06-15', 4, TRUE);

INSERT INTO `profil` (`id`, `nom`) VALUES
(1, 'Développeur JS Senior'),
(2, 'Manager'),
(3, 'Comptable'),
(4, 'Commercial'),
(5, 'Technicien');
-- =========================
-- FIN DONNEES DE BASE
-- =========================

-- =========================
-- ANNONCES ET CANDIDATS (Données de test)
-- =========================

-- Insertion de 2 annonces
INSERT INTO Annonce (titre, description, dateDebut, dateFin, reference, salaireProp, nombrePostes, idDepartement, idProfil, idTypeAnnonce, statut, datePublication) VALUES
('Développeur Full Stack', 'Nous recherchons un développeur Full Stack expérimenté pour rejoindre notre équipe de développement. Vous travaillerez sur des projets innovants utilisant React, Node.js et MongoDB.', '2024-01-15', '2024-03-31', 'REF-DEV-2024-001', 45000.00, 2, 3, 1, 1, 'publiee', '2024-01-15 09:00:00'),
('Chef de Projet Marketing Digital', 'Rejoignez notre département Marketing en tant que Chef de Projet. Vous piloterez des campagnes digitales et coordonnerez une équipe dynamique. Expérience en SEO/SEA requise.', '2024-02-01', '2024-04-30', 'REF-MKT-2024-002', 38000.00, 1, 5, 2, 1, 'publiee', '2024-02-01 10:30:00');

-- Insertion de 2 candidats pour la première annonce (Développeur Full Stack)
INSERT INTO Candidat (nom, prenom, dateNaissance, adresse, telephone, email, cv, lettreMotivation, idAnnonce, idStatut, idDiplome, dateCandidature) VALUES
('Rakoto', 'Jean', '1995-06-12', '15 Avenue de l''Indépendance, Antananarivo', '0341234567', 'jean.rakoto@email.com', 'Développeur Full Stack avec 5 ans d''expérience. Maîtrise de React, Node.js, MongoDB, PostgreSQL. Diplômé en Informatique.', 'Je suis très intéressé par ce poste car il correspond parfaitement à mon profil. Mon expérience en développement web me permettra de contribuer efficacement à vos projets.', 1, 3, 8, '2024-01-20 14:30:00'),
('Rasolofo', 'Marie', '1997-09-25', '42 Rue de la Liberté, Antananarivo', '0347654321', 'marie.rasolofo@email.com', 'Développeuse passionnée avec 3 ans d''expérience. Compétences: JavaScript, TypeScript, React, Vue.js, Express.js. Master en Génie Logiciel.', 'Votre annonce a retenu toute mon attention. Je souhaite mettre mes compétences techniques au service de votre entreprise et participer à des projets stimulants.', 1, 2, 8, '2024-01-22 10:15:00');

-- Insertion de 2 candidats pour la deuxième annonce (Chef de Projet Marketing)
INSERT INTO Candidat (nom, prenom, dateNaissance, adresse, telephone, email, cv, lettreMotivation, idAnnonce, idStatut, idDiplome, dateCandidature) VALUES
('Andrianina', 'Paul', '1992-03-18', '28 Boulevard Ratsimilaho, Antananarivo', '0349876543', 'paul.andrianina@email.com', 'Chef de Projet Marketing avec 6 ans d''expérience. Expert en SEO, SEA, Google Analytics. MBA Marketing Digital. Gestion d''équipe de 8 personnes.', 'Je suis enthousiaste à l''idée de rejoindre votre équipe Marketing. Mon expérience en gestion de projets digitaux et ma connaissance approfondie du SEO/SEA seront des atouts majeurs.', 2, 4, 10, '2024-02-05 16:45:00'),
('Raharison', 'Sophie', '1994-11-30', '67 Rue Rainibetsimisaraka, Antananarivo', '0342345678', 'sophie.raharison@email.com', 'Responsable Marketing Digital depuis 4 ans. Spécialiste des campagnes Google Ads et réseaux sociaux. Master en Marketing et Communication.', 'Votre poste de Chef de Projet Marketing correspond exactement à mes aspirations professionnelles. Je suis convaincue que mon expertise en marketing digital sera bénéfique pour votre entreprise.', 2, 3, 8, '2024-02-07 11:20:00');

-- =========================
-- TEST QCM ET REPONSES
-- =========================

-- Création d'un test QCM pour développeur Full Stack
INSERT INTO QcmTest (nom, description, dureeMinutes, notePassage, idProfil, actif) VALUES
('Test Technique Développeur Full Stack', 'Évaluation des compétences techniques en développement web (JavaScript, React, Node.js)', 45, 60.00, 1, TRUE);

-- Association du test avec l'annonce Développeur Full Stack
INSERT INTO TestAnnonce (idTest, idAnnonce, obligatoire, ordre) VALUES
(1, 1, TRUE, 1);

-- Questions du test
INSERT INTO QcmQuestion (idTest, numero, question, points, typeQuestion) VALUES
(1, 1, 'Quelle méthode JavaScript permet de créer un nouveau tableau en appliquant une fonction à chaque élément d''un tableau existant ?', 2, 'choix_unique'),
(1, 2, 'Quel hook React est utilisé pour gérer les effets secondaires (side effects) ?', 2, 'choix_unique'),
(1, 3, 'En Node.js, quel module permet de créer un serveur HTTP ?', 2, 'choix_unique'),
(1, 4, 'Quels sont les avantages de MongoDB ? (plusieurs réponses possibles)', 3, 'choix_multiple'),
(1, 5, 'Qu''est-ce que le middleware dans Express.js ?', 3, 'choix_unique');

-- Choix de réponses pour la Question 1 (map)
INSERT INTO QcmChoix (idQuestion, texte, estCorrect, ordre) VALUES
(1, 'map()', TRUE, 1),
(1, 'filter()', FALSE, 2),
(1, 'reduce()', FALSE, 3),
(1, 'forEach()', FALSE, 4);

-- Choix de réponses pour la Question 2 (useEffect)
INSERT INTO QcmChoix (idQuestion, texte, estCorrect, ordre) VALUES
(2, 'useState', FALSE, 1),
(2, 'useEffect', TRUE, 2),
(2, 'useContext', FALSE, 3),
(2, 'useMemo', FALSE, 4);

-- Choix de réponses pour la Question 3 (http)
INSERT INTO QcmChoix (idQuestion, texte, estCorrect, ordre) VALUES
(3, 'fs', FALSE, 1),
(3, 'http', TRUE, 2),
(3, 'path', FALSE, 3),
(3, 'express', FALSE, 4);

-- Choix de réponses pour la Question 4 (MongoDB avantages - choix multiples)
INSERT INTO QcmChoix (idQuestion, texte, estCorrect, ordre) VALUES
(4, 'Schéma flexible', TRUE, 1),
(4, 'Scalabilité horizontale', TRUE, 2),
(4, 'Format JSON/BSON', TRUE, 3),
(4, 'Requêtes SQL uniquement', FALSE, 4);

-- Choix de réponses pour la Question 5 (middleware)
INSERT INTO QcmChoix (idQuestion, texte, estCorrect, ordre) VALUES
(5, 'Une base de données intermédiaire', FALSE, 1),
(5, 'Une fonction qui a accès à l''objet requête, réponse et la fonction next', TRUE, 2),
(5, 'Un serveur proxy', FALSE, 3),
(5, 'Un composant React', FALSE, 4);

-- Réponses du candidat Jean Rakoto (id=1) qui termine le test
-- Question 1: Réponse correcte (map)
INSERT INTO QcmReponse (idCandidat, idTest, idQuestion, idChoix, pointsObtenus, dateReponse) VALUES
(1, 1, 1, 1, 2, '2024-01-21 10:15:00');

-- Question 2: Réponse correcte (useEffect)
INSERT INTO QcmReponse (idCandidat, idTest, idQuestion, idChoix, pointsObtenus, dateReponse) VALUES
(1, 1, 2, 6, 2, '2024-01-21 10:16:30');

-- Question 3: Réponse correcte (http)
INSERT INTO QcmReponse (idCandidat, idTest, idQuestion, idChoix, pointsObtenus, dateReponse) VALUES
(1, 1, 3, 10, 2, '2024-01-21 10:18:00');

-- Question 4: Réponses partiellement correctes (2/3 bonnes réponses)
INSERT INTO QcmReponse (idCandidat, idTest, idQuestion, idChoix, pointsObtenus, dateReponse) VALUES
(1, 1, 4, 13, 2, '2024-01-21 10:20:00'),
(1, 1, 4, 15, 0, '2024-01-21 10:20:00');

-- Question 5: Réponse correcte (middleware)
INSERT INTO QcmReponse (idCandidat, idTest, idQuestion, idChoix, pointsObtenus, dateReponse) VALUES
(1, 1, 5, 18, 3, '2024-01-21 10:22:00');

-- Score total pour Jean Rakoto: 11/12 points (91.67%) - Test réussi

-- NOTE IMPORTANTE:
-- Les données suivantes DOIVENT être créées via l'interface de l'application:
-- - Utilisateurs (admin, RH, managers, employés)
-- - Entretiens
-- - Contrats
