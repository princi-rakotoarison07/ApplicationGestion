-- =========================
-- DONNÉES DE TEST
-- =========================

-- Insertion des départements
INSERT INTO Departement (nom) VALUES 
('Ressources Humaines'),
('Informatique'),
('Marketing'),
('Finance'),
('Production');

-- Insertion des employés
INSERT INTO Employe (nom, prenom, adresse, idDept) VALUES 
('Dupont', 'Jean', '123 Rue de la Paix, Paris', 2),
('Martin', 'Marie', '456 Avenue des Champs, Lyon', 1),
('Bernard', 'Pierre', '789 Boulevard Saint-Germain, Marseille', 3),
('Leroy', 'Emma', '987 Rue du Faubourg, Bordeaux', 2),
('Roux', 'Thomas', '147 Place Vendôme, Strasbourg', 1),
('Fournier', 'Julie', '258 Rue de la République, Lille', 3);

-- Insertion des profils
INSERT INTO Profil (nom) VALUES 
('Développeur'),
('Manager'),
('Comptable'),
('Commercial'),
('Technicien');

-- Insertion des critères
INSERT INTO Critere (nom) VALUES 
('Expérience (années)'),
('Niveau d\'études'),
('Compétences techniques'),
('Langues parlées'),
('Disponibilité');

-- Insertion des statuts candidat
INSERT INTO StatutCandidat (nom) VALUES 
('En attente'),
('Accepté'),
('Refusé'),
('En cours d\'évaluation'),
('Candidature reçue'),
('QCM en cours'),
('QCM terminé'),
('Entretien programmé'),
('Entretien terminé');

-- Insertion des statuts entretien
INSERT INTO StatutEntretien (nom) VALUES 
('En attente'),
('Confirmé'),
('Reporté'),
('Annulé');

-- Insertion des diplômes
INSERT INTO Diplome (nom) VALUES 
('Baccalauréat'),
('BTS/DUT'),
('Licence'),
('Master'),
('Doctorat'),
('École d\'ingénieur'),
('École de commerce');

-- Insertion des types d'annonce
INSERT INTO TypeAnnonce (libelle) VALUES 
('CDI'),
('CDD'),
('Stage'),
('Freelance'),
('Alternance');

-- Insertion des candidats de test
INSERT INTO Candidat (nom, prenom, dateNaissance, adresse, cv, idAnnonce, idStatut) VALUES 
-- Candidats pour l'annonce 1 (Développeur Full-Stack)
('Martin', 'Pierre', '1995-03-15', '15 rue de la Paix, 75001 Paris', 'Développeur Full-Stack avec 5 ans d\'expérience. Compétences: React, Node.js, MongoDB, PostgreSQL. Expérience en startup et méthodes agiles. Passionné par les nouvelles technologies et l\'innovation.', 1, 1),

('Dubois', 'Marie', '1992-07-22', '42 avenue des Champs, 69000 Lyon', 'Ingénieure logiciel spécialisée JavaScript/Python. 6 ans d\'expérience en développement web. Leadership technique sur projets de digitalisation. Expertise en architecture microservices et DevOps.', 1, 2),

('Leroy', 'Thomas', '1990-11-08', '8 place du Marché, 33000 Bordeaux', 'Expert en développement full-stack et architecture système. 8 ans d\'expérience. Spécialités: React, Vue.js, Node.js, Docker, Kubernetes. Certifié AWS Solutions Architect.', 1, 4),

-- Candidats pour l'annonce 2 (Manager Commercial)
('Moreau', 'Sophie', '1988-05-12', '23 boulevard Saint-Germain, 75006 Paris', 'Manager commerciale senior avec 8 ans d\'expérience dans la tech B2B. Expertise en développement d\'équipes commerciales et stratégies de croissance. Résultats: +150% CA sur 3 ans.', 2, 1),

('Bernard', 'Julien', '1985-09-30', '67 rue de la République, 13000 Marseille', 'Commercial B2B expérimenté. 10 ans dans la vente de solutions technologiques. Gestion de portefeuilles clients grands comptes. Expertise en négociation et développement commercial.', 2, 3),

-- Candidats pour l'annonce 3 (Comptable Senior)
('Petit', 'Camille', '1987-12-03', '91 rue Victor Hugo, 59000 Lille', 'Comptable senior spécialisée en consolidation et reporting financier. 7 ans d\'expérience. Maîtrise des normes IFRS, SAP, et outils de contrôle de gestion. Expertise en audit interne.', 3, 1),

('Roux', 'Antoine', '1983-04-18', '34 avenue de la Liberté, 67000 Strasbourg', 'Expert-comptable avec 12 ans d\'expérience cabinet/entreprise. Spécialités: fiscalité, consolidation, contrôle de gestion. Diplômé DSCG. Expérience en management d\'équipe comptable.', 3, 2),

-- Candidats pour l'annonce 4 (Responsable Marketing Digital)
('Fournier', 'Laura', '1991-08-25', '56 place Bellecour, 69002 Lyon', 'Spécialiste marketing digital avec 6 ans d\'expérience. Expertise SEO/SEA, social media, analytics. Résultats: +200% trafic organique, ROI campagnes publicitaires >300%. Certifiée Google Ads.', 4, 4),

('Girard', 'Maxime', '1989-01-14', '78 cours Mirabeau, 13100 Aix-en-Provence', 'Growth hacker et responsable acquisition. 7 ans d\'expérience en marketing digital. Spécialités: funnel optimization, A/B testing, marketing automation. Doublé le trafic en 18 mois.', 4, 1),

-- Candidats pour l'annonce 5 (Technicien Maintenance)
('Michel', 'David', '1986-06-07', '12 rue de l\'Industrie, 38000 Grenoble', 'Technicien maintenance industrielle avec 10 ans d\'expérience. Spécialités: électromécanique, automatismes, maintenance préventive. Habilitations électriques. Autonome et polyvalent.', 5, 1),

('Garcia', 'Nicolas', '1993-10-19', '45 avenue de la Gare, 31000 Toulouse', 'Technicien maintenance junior avec 3 ans d\'expérience. Formation BTS Maintenance Industrielle. Compétences: mécanique, hydraulique, pneumatique. Motivé et adaptable aux nouveaux équipements.', 5, 3);

-- Mise à jour des annonces avec les types
UPDATE Annonce SET idTypeAnnonce = 1 WHERE id = 1; -- CDI
UPDATE Annonce SET idTypeAnnonce = 1 WHERE id = 2; -- CDI  
UPDATE Annonce SET idTypeAnnonce = 2 WHERE id = 3; -- CDD
UPDATE Annonce SET idTypeAnnonce = 1 WHERE id = 4; -- CDI
UPDATE Annonce SET idTypeAnnonce = 2 WHERE id = 5; -- CDD;

-- Insertion des critères supplémentaires pour les annonces
INSERT INTO CritereProfil (idProfil, idCritere, valeurVarchar, estObligatoire) VALUES 
-- Pour le profil Développeur (id=1)
(1, 3, 'React, Node.js, MySQL', TRUE),
(1, 4, 'Français, Anglais technique', TRUE),
(1, 1, '2-5 ans', TRUE),

-- Pour le profil Manager (id=2)  
(2, 1, '5+ ans', TRUE),
(2, 4, 'Français, Anglais', TRUE),
(2, 2, 'Master en Management', FALSE),

-- Pour le profil Comptable (id=3)
(3, 3, 'Sage, Excel avancé', TRUE),
(3, 1, '3+ ans', TRUE),
(3, 2, 'BTS/DUT Comptabilité', TRUE),

-- Pour le profil Commercial (id=4)
(4, 1, '1-3 ans', TRUE),
(4, 4, 'Français, Malgache', TRUE),
(4, 5, 'Disponible pour déplacements', TRUE),

-- Pour le profil Technicien (id=5)
(5, 3, 'Électromécanique, Maintenance préventive', TRUE),
(5, 1, '2+ ans', TRUE),
(5, 2, 'CAP/BEP Électromécanique', TRUE);

-- Insertion des tests QCM
INSERT INTO QcmTest (nom, idProfil) VALUES 
('Test Développement Web', 1),
('Test Management', 2),
('Test Comptabilité', 3),
('Test Commercial', 4),
('Test Technique', 5);

-- Insertion des questions QCM (exemple pour le test développement)
INSERT INTO QcmQuestion (idTest, numero, question, points) VALUES 
(1, 1, 'Qu\'est-ce que React ?', 2),
(1, 2, 'Comment déclarer une variable en JavaScript ?', 1),
(1, 3, 'Quelle est la différence entre let et const ?', 2);

-- Insertion des choix pour les questions
INSERT INTO QcmChoix (idQuestion, texte, estCorrect) VALUES 
-- Question 1
(1, 'Une librairie JavaScript pour créer des interfaces utilisateur', true),
(1, 'Un langage de programmation', false),
(1, 'Un framework CSS', false),
(1, 'Un serveur web', false),
-- Question 2
(2, 'var nom = "valeur"', true),
(2, 'variable nom = "valeur"', false),
(2, 'declare nom = "valeur"', false),
(2, 'nom := "valeur"', false),
-- Question 3
(3, 'let permet la réassignation, const non', true),
(3, 'Aucune différence', false),
(3, 'const permet la réassignation, let non', false),
(3, 'let est pour les nombres, const pour les chaînes', false);

-- Insertion des annonces d'emploi (avec colonne reference)
INSERT INTO Annonce (description, dateDebut, dateFin, reference, idDepartement, idProfil) VALUES 
('Recherche développeur Full Stack avec 3 ans d\'expérience minimum en React, Node.js et bases de données', '2024-01-15', '2024-03-15', 'DEV-2024-001', 2, 1),
('Poste de manager pour équipe RH avec expérience en gestion d\'équipe et recrutement', '2024-02-01', '2024-04-01', 'MAN-2024-001', 1, 2),
('Comptable expérimenté pour département finance avec maîtrise des logiciels comptables', '2024-01-20', '2024-03-20', 'CPT-2024-001', 4, 3),
('Commercial terrain secteur Sud-Est avec permis B obligatoire', '2024-02-10', '2024-04-10', 'COM-2024-001', 3, 4),
('Technicien maintenance industrielle avec formation en électromécanique', '2024-01-25', '2024-03-25', 'TEC-2024-001', 5, 5);

-- Insertion des résultats
INSERT INTO Resultat (note, appreciation) VALUES 
(85, 'Très bon niveau technique'),
(92, 'Excellent profil management'),
(78, 'Compétences solides en comptabilité'),
(88, 'Très bon commercial'),
(82, 'Bonnes compétences techniques');

-- Insertion des entretiens
INSERT INTO Entretien (idCandidat, dateHeure, idStatut, idResultat) VALUES 
(1, '2024-02-15 14:00:00', 2, 1),
(2, '2024-02-20 10:30:00', 2, 2),
(3, '2024-02-18 16:00:00', 1, NULL),
(4, '2024-02-22 09:00:00', 2, 4),
(5, '2024-02-25 11:00:00', 1, NULL);

-- Insertion des statuts entretien
INSERT INTO StatutEntretien (nom) VALUES 
('En attente'),
('Confirmé'),
('Reporté'),
('Annulé');

-- Insertion des diplômes
INSERT INTO Diplome (nom) VALUES 
('Baccalauréat'),
('Licence'),
('Master'),
('Doctorat'),
('BTS'),
('DUT');

-- Insertion des départements
INSERT INTO Departement (nom) VALUES 
('Ressources Humaines'),
('Informatique'),
('Marketing'),
('Finance'),
('Production');

-- Insertion des statuts candidat
INSERT INTO StatutCandidat (nom) VALUES 
('Candidature reçue'),
('QCM en cours'),
('QCM terminé'),
('Entretien programmé'),
('Entretien terminé'),
('Accepté'),
('Refusé');

-- Insertion des annonces
INSERT INTO Annonce (reference, titre, description, datePublication, dateLimite, idDept) VALUES 
('DEV001', 'Développeur Full Stack', 'Recherche développeur expérimenté en React et Node.js', '2024-01-15', '2024-02-15', 2),
('MKT001', 'Chef de produit Marketing', 'Responsable marketing digital avec 3 ans d\'expérience', '2024-01-20', '2024-02-20', 3),
('RH001', 'Assistant RH', 'Assistant en ressources humaines pour gestion administrative', '2024-01-10', '2024-02-10', 1);

-- Insertion des candidats avec différents statuts
INSERT INTO Candidat (nom, prenom, dateNaissance, adresse, cv, idAnnonce, idStatut) VALUES 
('Dupont', 'Jean', '1990-05-15', '123 Rue de la Paix, Paris', 'Développeur avec 5 ans d\'expérience en JavaScript, React, Node.js. Diplômé d\'une école d\'ingénieur.', 1, 3),
('Martin', 'Sophie', '1988-03-22', '456 Avenue des Champs, Lyon', 'Marketing manager avec expertise en digital. Master en marketing, 4 ans d\'expérience.', 2, 3),
('Durand', 'Pierre', '1992-11-08', '789 Boulevard Saint-Michel, Marseille', 'Assistant administratif polyvalent, BTS Assistant de gestion, 2 ans d\'expérience.', 3, 3),
('Leroy', 'Marie', '1991-07-12', '321 Rue Victor Hugo, Toulouse', 'Développeuse frontend spécialisée React, portfolio impressionnant.', 1, 2),
('Bernard', 'Paul', '1989-09-30', '654 Place de la République, Nice', 'Expert en marketing digital et réseaux sociaux.', 2, 1);

-- Insertion des tests QCM
INSERT INTO QcmTest (nom, description, dureeMinutes, noteMinimale, idAnnonce) VALUES 
('Test Technique Développeur', 'Évaluation des compétences en programmation', 60, 12, 1),
('Test Marketing Digital', 'Connaissances en marketing et communication', 45, 10, 2),
('Test Compétences RH', 'Évaluation des connaissances RH de base', 30, 8, 3);

-- Insertion des questions QCM
INSERT INTO QcmQuestion (idTest, numero, question, points) VALUES 
(1, 1, 'Quelle est la différence entre let et var en JavaScript ?', 2),
(1, 2, 'Comment créer un composant React fonctionnel ?', 3),
(1, 3, 'Qu\'est-ce qu\'une API REST ?', 2),
(2, 1, 'Qu\'est-ce que le SEO ?', 2),
(2, 2, 'Définissez le marketing mix (4P)', 3),
(3, 1, 'Qu\'est-ce que la GPEC ?', 2),
(3, 2, 'Citez 3 étapes du processus de recrutement', 3);

-- Insertion des choix de réponses
INSERT INTO QcmChoix (idQuestion, texte, estCorrect) VALUES 
-- Question 1 (let vs var)
(1, 'let a une portée de bloc, var a une portée de fonction', TRUE),
(1, 'let et var sont identiques', FALSE),
(1, 'var est plus récent que let', FALSE),
-- Question 2 (Composant React)
(2, 'function MonComposant() { return <div>Hello</div>; }', TRUE),
(2, 'class MonComposant extends Component', FALSE),
(2, 'const MonComposant = new React.Component()', FALSE),
-- Question 3 (API REST)
(3, 'Architecture pour services web utilisant HTTP', TRUE),
(3, 'Base de données relationnelle', FALSE),
-- Question 4 (SEO)
(4, 'Search Engine Optimization', TRUE),
(4, 'Social Engine Optimization', FALSE),
-- Question 5 (Marketing mix)
(5, 'Product, Price, Place, Promotion', TRUE),
(5, 'People, Process, Physical, Performance', FALSE),
-- Question 6 (GPEC)
(6, 'Gestion Prévisionnelle des Emplois et Compétences', TRUE),
(6, 'Gestion des Processus et Contrôles', FALSE),
-- Question 7 (Recrutement)
(7, 'Définition du poste, Sourcing, Entretiens', TRUE),
(7, 'Formation, Évaluation, Promotion', FALSE);

-- Insertion des réponses QCM (candidats ayant terminé)
INSERT INTO QcmReponse (idCandidat, idTest, idQuestion, idChoix, pointsObtenus) VALUES 
-- Jean Dupont (candidat 1) - Test développeur - Score: 15/20
(1, 1, 1, 1, 2), -- Bonne réponse
(1, 1, 2, 2, 3), -- Bonne réponse  
(1, 1, 3, 4, 2), -- Bonne réponse
-- Sophie Martin (candidat 2) - Test marketing - Score: 12/20
(2, 2, 4, 6, 2), -- Bonne réponse
(2, 2, 5, 8, 3), -- Bonne réponse
-- Pierre Durand (candidat 3) - Test RH - Score: 10/20
(3, 3, 6, 10, 2), -- Bonne réponse
(3, 3, 7, 12, 3); -- Bonne réponse

-- Insertion des résultats d'entretien
INSERT INTO Resultat (note, appreciation) VALUES 
(16, 'Excellent candidat, compétences techniques solides'),
(14, 'Bon profil, expérience intéressante'),
(12, 'Candidat correct, à former'),
(8, 'Profil insuffisant pour le poste');

-- Insertion des entretiens
INSERT INTO Entretien (idCandidat, dateHeure, idStatut, idResultat) VALUES 
(1, '2024-02-20 10:00:00', 2, 1), -- Jean Dupont - Confirmé
(2, '2024-02-21 14:30:00', 1, NULL), -- Sophie Martin - En attente
(3, '2024-02-22 09:00:00', 2, 2); -- Pierre Durand - Confirmé

-- Insertion de l'historique des entretiens
INSERT INTO HistoriqueEntretien (idEntretien, idStatut) VALUES 
(1, 1), -- Jean: En attente -> Confirmé
(1, 2), -- Jean: Confirmé
(2, 1), -- Sophie: En attente
(3, 1), -- Pierre: En attente -> Confirmé  
(3, 2); -- Pierre: Confirmé
