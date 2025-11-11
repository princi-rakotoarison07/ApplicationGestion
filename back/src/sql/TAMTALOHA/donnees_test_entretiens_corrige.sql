-- =========================
-- DONNÉES DE TEST POUR ENTRETIENS (CORRIGÉES)
-- =========================
-- Script corrigé selon base.sql et Update.sql
-- - 3 annonces
-- - 5 candidats (2 qui ont terminé le QCM avec succès)
-- - Seuls les 2 candidats éligibles apparaîtront dans la section entretien

-- =========================
-- NETTOYAGE COMPLET DES TABLES
-- =========================
SET FOREIGN_KEY_CHECKS = 0;

-- Vider toutes les tables dans l'ordre des dépendances
DELETE FROM HistoriqueEntretien;
DELETE FROM Entretien;
DELETE FROM QcmReponse;
DELETE FROM QcmChoix;
DELETE FROM QcmQuestion;
DELETE FROM TestAnnonce;
DELETE FROM QcmTest;
DELETE FROM Candidat;
DELETE FROM CompteCandidat;
DELETE FROM Annonce;
DELETE FROM CritereProfil;
DELETE FROM Profil;
DELETE FROM Critere;
DELETE FROM StatutCandidat;
DELETE FROM StatutEntretien;
DELETE FROM Resultat;
DELETE FROM TypeAnnonce;
DELETE FROM Departement;
DELETE FROM Diplome;
-- Reset AUTO_INCREMENT
ALTER TABLE HistoriqueEntretien AUTO_INCREMENT = 1;
ALTER TABLE Entretien AUTO_INCREMENT = 1;
ALTER TABLE QcmReponse AUTO_INCREMENT = 1;
ALTER TABLE QcmChoix AUTO_INCREMENT = 1;
ALTER TABLE QcmQuestion AUTO_INCREMENT = 1;
ALTER TABLE TestAnnonce AUTO_INCREMENT = 1;
ALTER TABLE QcmTest AUTO_INCREMENT = 1;
ALTER TABLE Candidat AUTO_INCREMENT = 1;
ALTER TABLE CompteCandidat AUTO_INCREMENT = 1;
ALTER TABLE Annonce AUTO_INCREMENT = 1;
ALTER TABLE CritereProfil AUTO_INCREMENT = 1;
ALTER TABLE Profil AUTO_INCREMENT = 1;
ALTER TABLE Critere AUTO_INCREMENT = 1;
ALTER TABLE StatutCandidat AUTO_INCREMENT = 1;
ALTER TABLE StatutEntretien AUTO_INCREMENT = 1;
ALTER TABLE Resultat AUTO_INCREMENT = 1;
ALTER TABLE TypeAnnonce AUTO_INCREMENT = 1;
ALTER TABLE Departement AUTO_INCREMENT = 1;
ALTER TABLE Diplome AUTO_INCREMENT = 1;
ALTER TABLE Utilisateurs AUTO_INCREMENT = 1;
ALTER TABLE Employe AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================
-- DONNÉES DE BASE
-- =========================

-- Départements
INSERT INTO Departement (nom) VALUES 
('Informatique'),
('Marketing'),
('Ressources Humaines');

-- Profils
INSERT INTO Profil (nom) VALUES 
('Développeur Web'),
('Chef de Projet Marketing'),
('Assistant RH');

-- Statuts candidats
INSERT INTO StatutCandidat (nom) VALUES 
('Candidature reçue'),
('QCM terminé'),
('Rejeté');

-- Statuts entretiens
INSERT INTO StatutEntretien (nom) VALUES 
('En attente'),
('Confirmé'),
('Reporté'),
('Annulé');

-- Types d'annonces (selon Update.sql - colonne libelle)
INSERT INTO TypeAnnonce (libelle) VALUES 
('CDI'),
('CDD'),
('Stage');

-- =========================
-- 3 ANNONCES D'EMPLOI (Structure corrigée selon base.sql + Update.sql)
-- =========================
-- Colonnes disponibles : description, dateDebut, dateFin, idDepartement, idProfil, idTypeAnnonce, reference
-- PAS de colonnes : titre, nomPoste (supprimée dans Update.sql)

INSERT INTO Annonce (description, dateDebut, dateFin, reference, idDepartement, idProfil, idTypeAnnonce) VALUES 
(
    'Développeur Full-Stack Junior - Nous recherchons un développeur passionné pour rejoindre notre équipe. Compétences requises : JavaScript, React, Node.js, MySQL.',
    '2025-09-01',
    '2025-10-15',
    'DEV-2025-001',
    1, 1, 1
),
(
    'Chef de Projet Marketing Digital - Poste de chef de projet pour gérer nos campagnes marketing digital. Expérience en SEO, SEM et analytics requise.',
    '2025-09-05',
    '2025-10-20',
    'MKT-2025-002',
    2, 2, 1
),
(
    'Assistant Ressources Humaines - Assistant RH pour accompagner les processus de recrutement et la gestion administrative du personnel.',
    '2025-09-10',
    '2025-11-01',
    'RH-2025-003',
    3, 3, 1
);

-- =========================
-- COMPTES CANDIDATS (selon Update.sql)
-- =========================
INSERT INTO CompteCandidat (email, motDePasse) VALUES 
('alice.martin@email.com', '$2b$10$hashedpassword1'),
('thomas.dubois@email.com', '$2b$10$hashedpassword2'),
('sophie.leroy@email.com', '$2b$10$hashedpassword3'),
('lucas.bernard@email.com', '$2b$10$hashedpassword4'),
('emma.moreau@email.com', '$2b$10$hashedpassword5');

-- =========================
-- 5 CANDIDATS (Structure selon base.sql + Update.sql)
-- =========================
INSERT INTO Candidat (nom, prenom, dateNaissance, adresse, cv, idAnnonce, idStatut, idCompteCandidat) VALUES 
-- 2 candidats qui ont terminé le QCM avec succès (statut 2)
(
    'Martin',
    'Alice',
    '1995-03-15',
    '123 Rue de la République, 75001 Paris',
    'Développeuse junior avec 2 ans d\'expérience en JavaScript et React. Diplômée d\'une école d\'ingénieur informatique.',
    1, 2, 1  -- QCM terminé
),
(
    'Dubois',
    'Thomas',
    '1992-07-22',
    '456 Avenue des Champs, 69002 Lyon',
    'Chef de projet marketing avec 3 ans d\'expérience en digital. Spécialisé en SEO et campagnes Google Ads.',
    2, 2, 2  -- QCM terminé
),

-- 3 autres candidats qui n'ont pas terminé le QCM ou ont échoué
(
    'Leroy',
    'Sophie',
    '1994-11-08',
    '789 Boulevard Saint-Michel, 33000 Bordeaux',
    'Assistante administrative avec 1 an d\'expérience. Motivée pour évoluer vers les RH.',
    3, 1, 3  -- Candidature reçue seulement
),
(
    'Bernard',
    'Lucas',
    '1993-05-30',
    '321 Rue Victor Hugo, 13001 Marseille',
    'Développeur autodidacte avec quelques projets personnels. Cherche sa première expérience professionnelle.',
    1, 1, 4  -- Candidature reçue seulement
),
(
    'Moreau',
    'Emma',
    '1991-12-12',
    '654 Place de la Comédie, 34000 Montpellier',
    'Marketing manager avec 2 ans d\'expérience en marketing traditionnel. Souhaite se reconvertir au digital.',
    2, 3, 5  -- Rejeté
);

-- =========================
-- TESTS QCM
-- =========================
INSERT INTO QcmTest (nom, idProfil) VALUES 
('Test Technique Développeur Web', 1),
('Test Marketing Digital', 2),
('Test Compétences RH', 3);

-- Relations Test-Annonce
INSERT INTO TestAnnonce (idTest, idAnnonce) VALUES 
(1, 1), -- Test Développeur pour annonce Développeur
(2, 2), -- Test Marketing pour annonce Marketing
(3, 3); -- Test RH pour annonce RH

-- =========================
-- QUESTIONS QCM
-- =========================
INSERT INTO QcmQuestion (idTest, numero, question, points) VALUES 
-- Questions Développeur
(1, 1, 'Quelle est la différence entre let et var en JavaScript ?', 4),
(1, 2, 'Comment créer un composant React fonctionnel ?', 6),
(1, 3, 'Qu\'est-ce qu\'une API REST ?', 5),
(1, 4, 'Comment gérer l\'état dans React ?', 5),

-- Questions Marketing
(2, 1, 'Que signifie SEO ?', 3),
(2, 2, 'Qu\'est-ce que le taux de conversion ?', 4),
(2, 3, 'Citez 3 KPIs importants en marketing digital', 6),
(2, 4, 'Qu\'est-ce que Google Analytics ?', 7),

-- Questions RH
(3, 1, 'Qu\'est-ce que la GPEC ?', 5),
(3, 2, 'Citez les étapes du processus de recrutement', 6),
(3, 3, 'Qu\'est-ce que l\'entretien annuel d\'évaluation ?', 4),
(3, 4, 'Définissez le droit du travail', 5);

-- =========================
-- CHOIX DE RÉPONSES (exemples)
-- =========================
INSERT INTO QcmChoix (idQuestion, texte, estCorrect) VALUES 
-- Question 1 Développeur
(1, 'let a une portée de bloc, var a une portée de fonction', TRUE),
(1, 'let et var sont identiques', FALSE),
(1, 'var est plus récent que let', FALSE),

-- Question 2 Développeur
(2, 'function MonComposant() { return <div>Hello</div>; }', TRUE),
(2, 'class MonComposant extends Component', FALSE),
(2, 'React.createComponent("MonComposant")', FALSE),

-- Question 1 Marketing
(5, 'Search Engine Optimization', TRUE),
(5, 'Social Engine Optimization', FALSE),
(5, 'System Engine Optimization', FALSE);

-- =========================
-- RÉPONSES QCM - SEULS 2 CANDIDATS ONT RÉUSSI
-- =========================

-- Alice Martin (Développeuse) - Score: 16/20 ✅ SUCCÈS
INSERT INTO QcmReponse (idCandidat, idTest, idQuestion, idChoix, pointsObtenus) VALUES 
(1, 1, 1, 1, 4),  -- Bonne réponse
(1, 1, 2, 4, 6),  -- Bonne réponse
(1, 1, 3, NULL, 3),  -- Question ouverte - points partiels
(1, 1, 4, NULL, 3);  -- Question ouverte - points partiels

-- Thomas Dubois (Marketing) - Score: 12/20 ✅ SUCCÈS
INSERT INTO QcmReponse (idCandidat, idTest, idQuestion, idChoix, pointsObtenus) VALUES 
(2, 2, 5, 7, 3),  -- Bonne réponse
(2, 2, 6, NULL, 2),  -- Question ouverte - points partiels
(2, 2, 7, NULL, 4),  -- Question ouverte - points attribués
(2, 2, 8, NULL, 3);  -- Question ouverte - points partiels

-- Les 3 autres candidats n'ont pas de réponses QCM (pas terminé ou échoué)

-- =========================
-- EMPLOYÉS ET UTILISATEURS (pour les connexions)
-- =========================

-- =========================
-- VÉRIFICATION DES DONNÉES
-- =========================
SELECT 'RÉSUMÉ DES DONNÉES CRÉÉES' as Info;

SELECT 'ANNONCES:' as Type, COUNT(*) as Nombre FROM Annonce
UNION ALL
SELECT 'CANDIDATS TOTAL:', COUNT(*) FROM Candidat
UNION ALL
SELECT 'CANDIDATS QCM TERMINÉ:', COUNT(*) FROM Candidat WHERE idStatut = 2
UNION ALL
SELECT 'TESTS QCM:', COUNT(*) FROM QcmTest
UNION ALL
SELECT 'QUESTIONS:', COUNT(*) FROM QcmQuestion
UNION ALL
SELECT 'RÉPONSES QCM:', COUNT(*) FROM QcmReponse;

-- Afficher les candidats éligibles pour entretien
SELECT 'CANDIDATS ÉLIGIBLES POUR ENTRETIEN (Score >= 1):' as Info;
SELECT 
    c.id,
    c.prenom,
    c.nom,
    a.reference as annonce,
    AVG(qr.pointsObtenus) as scoreQCM,
    sc.nom as statut
FROM Candidat c
JOIN Annonce a ON c.idAnnonce = a.id
JOIN StatutCandidat sc ON c.idStatut = sc.id
LEFT JOIN QcmReponse qr ON c.id = qr.idCandidat
WHERE sc.nom = 'QCM terminé'
GROUP BY c.id, c.prenom, c.nom, a.reference, sc.nom
HAVING scoreQCM >= 10
ORDER BY scoreQCM DESC;

SELECT 'DONNÉES DE TEST CORRIGÉES CRÉÉES AVEC SUCCÈS!' as Status;
