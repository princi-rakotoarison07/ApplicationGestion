-- =========================
-- APPLICATION RH - SCHEMA COMPLET
-- Base de données pour gestion des ressources humaines et recrutement
-- =========================

-- Suppression des tables existantes (dans l'ordre inverse des dépendances)
DROP TABLE IF EXISTS CandidatureCritere;
DROP TABLE IF EXISTS HistoriqueCandidature;
DROP TABLE IF EXISTS HistoriqueEntretien;
DROP TABLE IF EXISTS Contrat;
DROP TABLE IF EXISTS QcmReponse;
DROP TABLE IF EXISTS QcmChoix;
DROP TABLE IF EXISTS QcmQuestion;
DROP TABLE IF EXISTS TestAnnonce;
DROP TABLE IF EXISTS QcmTest;
DROP TABLE IF EXISTS Entretien;
DROP TABLE IF EXISTS StatutEntretien;
DROP TABLE IF EXISTS Resultat;
DROP TABLE IF EXISTS CandidatEmploye;
DROP TABLE IF EXISTS Candidat;
DROP TABLE IF EXISTS CompteCandidat;
DROP TABLE IF EXISTS StatutCandidat;
DROP TABLE IF EXISTS Annonce;
DROP TABLE IF EXISTS TypeAnnonce;
DROP TABLE IF EXISTS CritereProfil;
DROP TABLE IF EXISTS Critere;
DROP TABLE IF EXISTS Profil;
DROP TABLE IF EXISTS Utilisateurs;
DROP TABLE IF EXISTS Employe;
DROP TABLE IF EXISTS Diplome;
DROP TABLE IF EXISTS Departement;

-- =========================
-- TABLES DE REFERENCE
-- =========================

-- Table Departement
CREATE TABLE Departement (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    dateCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE,
    INDEX idx_departement_nom (nom)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Diplome
CREATE TABLE Diplome (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    niveau VARCHAR(50),
    description TEXT,
    INDEX idx_diplome_nom (nom)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Profil (Postes/Métiers)
CREATE TABLE Profil (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    niveauExperience VARCHAR(50),
    dateCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE,
    INDEX idx_profil_nom (nom)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Critere (Critères de sélection)
CREATE TABLE Critere (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    typeDonnee ENUM('numerique', 'texte', 'booleen', 'date') DEFAULT 'texte',
    description TEXT,
    INDEX idx_critere_nom (nom)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table CritereProfil (Critères requis par profil)
CREATE TABLE CritereProfil (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idProfil INT NOT NULL,
    idCritere INT NOT NULL,
    valeurDouble DECIMAL(10,2) NULL,
    valeurVarchar VARCHAR(200) NULL,
    valeurBool BOOLEAN NULL,
    valeurDate DATE NULL,
    estObligatoire BOOLEAN DEFAULT TRUE,
    poids INT DEFAULT 1,
    FOREIGN KEY (idProfil) REFERENCES Profil(id) ON DELETE CASCADE,
    FOREIGN KEY (idCritere) REFERENCES Critere(id) ON DELETE CASCADE,
    UNIQUE KEY unique_profil_critere (idProfil, idCritere),
    INDEX idx_critere_profil (idProfil, idCritere)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table TypeAnnonce (CDI, CDD, Stage, Freelance, etc.)
CREATE TABLE TypeAnnonce (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    actif BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABLES EMPLOYES
-- =========================

-- Table Employe
CREATE TABLE Employe (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    dateNaissance DATE,
    adresse VARCHAR(200),
    telephone VARCHAR(20),
    email VARCHAR(150),
    dateEmbauche DATE,
    idDept INT,
    actif BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (idDept) REFERENCES Departement(id),
    INDEX idx_employe_nom (nom, prenom),
    INDEX idx_employe_dept (idDept)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Utilisateurs (Comptes système pour employés)
CREATE TABLE Utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    motDePasse VARCHAR(255) NOT NULL,
    role ENUM('admin', 'rh', 'manager', 'employe') DEFAULT 'employe',
    idEmploye INT,
    actif BOOLEAN DEFAULT TRUE,
    dernierAcces TIMESTAMP NULL,
    dateCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idEmploye) REFERENCES Employe(id) ON DELETE CASCADE,
    INDEX idx_utilisateur_email (email),
    INDEX idx_utilisateur_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Contrat
CREATE TABLE Contrat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idEmploye INT NOT NULL,
    typeContrat VARCHAR(50) NOT NULL,
    dateDebut DATE NOT NULL,
    dateFin DATE NULL,
    nombreMois INT NULL,
    salaire DECIMAL(10,2),
    poste VARCHAR(100),
    actif BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (idEmploye) REFERENCES Employe(id) ON DELETE CASCADE,
    INDEX idx_contrat_employe (idEmploye),
    INDEX idx_contrat_dates (dateDebut, dateFin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABLES RECRUTEMENT
-- =========================

-- Table Annonce
CREATE TABLE Annonce (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    description TEXT,
    dateDebut DATE NOT NULL,
    dateFin DATE NOT NULL,
    reference VARCHAR(50) NOT NULL UNIQUE,
    salaireProp DECIMAL(10,2),
    nombrePostes INT DEFAULT 1,
    idDepartement INT NOT NULL,
    idProfil INT NOT NULL,
    idTypeAnnonce INT NOT NULL,
    statut ENUM('brouillon', 'publiee', 'fermee', 'pourvue') DEFAULT 'brouillon',
    datePublication TIMESTAMP NULL,
    FOREIGN KEY (idDepartement) REFERENCES Departement(id),
    FOREIGN KEY (idProfil) REFERENCES Profil(id),
    FOREIGN KEY (idTypeAnnonce) REFERENCES TypeAnnonce(id),
    INDEX idx_annonce_ref (reference),
    INDEX idx_annonce_dates (dateDebut, dateFin),
    INDEX idx_annonce_statut (statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table StatutCandidat
CREATE TABLE StatutCandidat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL UNIQUE,
    ordre INT DEFAULT 0,
    couleur VARCHAR(20),
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table CompteCandidat (Espace candidat)
CREATE TABLE CompteCandidat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    motDePasse VARCHAR(255) NOT NULL,
    dateCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT TRUE,
    INDEX idx_compte_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Candidat
CREATE TABLE Candidat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    dateNaissance DATE,
    adresse VARCHAR(200),
    telephone VARCHAR(20),
    email VARCHAR(150) NOT NULL,
    cv TEXT,
    lettreMotivation TEXT,
    idAnnonce INT NOT NULL,
    idStatut INT NOT NULL,
    idCompteCandidat INT NULL,
    idDiplome INT NULL,
    dateCandidature TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idAnnonce) REFERENCES Annonce(id) ON DELETE CASCADE,
    FOREIGN KEY (idStatut) REFERENCES StatutCandidat(id),
    FOREIGN KEY (idCompteCandidat) REFERENCES CompteCandidat(id) ON DELETE SET NULL,
    FOREIGN KEY (idDiplome) REFERENCES Diplome(id) ON DELETE SET NULL,
    INDEX idx_candidat_annonce (idAnnonce),
    INDEX idx_candidat_statut (idStatut),
    INDEX idx_candidat_nom (nom, prenom)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table CandidatureCritere (Réponses aux critères)
CREATE TABLE CandidatureCritere (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idCandidat INT NOT NULL,
    idAnnonce INT NOT NULL,
    idCritere INT NOT NULL,
    valeurDouble DECIMAL(10,2) NULL,
    valeurVarchar VARCHAR(200) NULL,
    valeurBool BOOLEAN NULL,
    valeurDate DATE NULL,
    score INT DEFAULT 0,
    FOREIGN KEY (idCandidat) REFERENCES Candidat(id) ON DELETE CASCADE,
    FOREIGN KEY (idAnnonce) REFERENCES Annonce(id) ON DELETE CASCADE,
    FOREIGN KEY (idCritere) REFERENCES Critere(id) ON DELETE CASCADE,
    UNIQUE KEY unique_candidat_critere (idCandidat, idCritere),
    INDEX idx_candidature_critere (idCandidat, idAnnonce)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table HistoriqueCandidature
CREATE TABLE HistoriqueCandidature (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idCandidat INT NOT NULL,
    idStatut INT NOT NULL,
    commentaire TEXT,
    dateChangement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idCandidat) REFERENCES Candidat(id) ON DELETE CASCADE,
    FOREIGN KEY (idStatut) REFERENCES StatutCandidat(id),
    INDEX idx_historique_candidat (idCandidat),
    INDEX idx_historique_date (dateChangement)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABLES QCM/TESTS
-- =========================

-- Table QcmTest
CREATE TABLE QcmTest (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    description TEXT,
    dureeMinutes INT DEFAULT 30,
    notePassage DECIMAL(5,2) DEFAULT 50.00,
    idProfil INT NULL,
    actif BOOLEAN DEFAULT TRUE,
    dateCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idProfil) REFERENCES Profil(id) ON DELETE SET NULL,
    INDEX idx_test_profil (idProfil)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table TestAnnonce (Association test-annonce)
CREATE TABLE TestAnnonce (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idTest INT NOT NULL,
    idAnnonce INT NOT NULL,
    obligatoire BOOLEAN DEFAULT TRUE,
    ordre INT DEFAULT 0,
    FOREIGN KEY (idTest) REFERENCES QcmTest(id) ON DELETE CASCADE,
    FOREIGN KEY (idAnnonce) REFERENCES Annonce(id) ON DELETE CASCADE,
    UNIQUE KEY unique_test_annonce (idTest, idAnnonce)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table QcmQuestion
CREATE TABLE QcmQuestion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idTest INT NOT NULL,
    numero INT NOT NULL,
    question TEXT NOT NULL,
    points INT NOT NULL DEFAULT 1,
    typeQuestion ENUM('choix_unique', 'choix_multiple', 'texte') DEFAULT 'choix_unique',
    FOREIGN KEY (idTest) REFERENCES QcmTest(id) ON DELETE CASCADE,
    INDEX idx_question_test (idTest, numero)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table QcmChoix
CREATE TABLE QcmChoix (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idQuestion INT NOT NULL,
    texte VARCHAR(500) NOT NULL,
    estCorrect BOOLEAN DEFAULT FALSE,
    ordre INT DEFAULT 0,
    FOREIGN KEY (idQuestion) REFERENCES QcmQuestion(id) ON DELETE CASCADE,
    INDEX idx_choix_question (idQuestion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table QcmReponse
CREATE TABLE QcmReponse (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idCandidat INT NOT NULL,
    idTest INT NOT NULL,
    idQuestion INT NOT NULL,
    idChoix INT NULL,
    reponseTexte TEXT NULL,
    pointsObtenus INT DEFAULT 0,
    dateReponse TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idCandidat) REFERENCES Candidat(id) ON DELETE CASCADE,
    FOREIGN KEY (idTest) REFERENCES QcmTest(id) ON DELETE CASCADE,
    FOREIGN KEY (idQuestion) REFERENCES QcmQuestion(id) ON DELETE CASCADE,
    FOREIGN KEY (idChoix) REFERENCES QcmChoix(id) ON DELETE SET NULL,
    INDEX idx_reponse_candidat (idCandidat, idTest)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABLES ENTRETIENS
-- =========================

-- Table StatutEntretien
CREATE TABLE StatutEntretien (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL UNIQUE,
    ordre INT DEFAULT 0,
    couleur VARCHAR(20),
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Resultat
CREATE TABLE Resultat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    note INT,
    appreciation TEXT,
    commentaire TEXT,
    dateEvaluation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Entretien
CREATE TABLE Entretien (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idCandidat INT NOT NULL,
    dateHeure DATETIME NOT NULL,
    lieu VARCHAR(200),
    type ENUM('telephonique', 'visio', 'presentiel', 'technique') DEFAULT 'presentiel',
    idStatut INT NOT NULL,
    idResultat INT NULL,
    idResponsable INT NULL,
    dureeMinutes INT DEFAULT 60,
    FOREIGN KEY (idCandidat) REFERENCES Candidat(id) ON DELETE CASCADE,
    FOREIGN KEY (idStatut) REFERENCES StatutEntretien(id),
    FOREIGN KEY (idResultat) REFERENCES Resultat(id) ON DELETE SET NULL,
    FOREIGN KEY (idResponsable) REFERENCES Employe(id) ON DELETE SET NULL,
    INDEX idx_entretien_candidat (idCandidat),
    INDEX idx_entretien_date (dateHeure)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table HistoriqueEntretien
CREATE TABLE HistoriqueEntretien (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idEntretien INT NOT NULL,
    idStatut INT NOT NULL,
    commentaire TEXT,
    dateChangement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idEntretien) REFERENCES Entretien(id) ON DELETE CASCADE,
    FOREIGN KEY (idStatut) REFERENCES StatutEntretien(id),
    INDEX idx_historique_entretien (idEntretien),
    INDEX idx_historique_date (dateChangement)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABLE TRANSITION
-- =========================

-- Table CandidatEmploye (Passage candidat -> employé)
CREATE TABLE CandidatEmploye (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idCandidat INT NOT NULL,
    idEmploye INT NOT NULL,
    dateTransition TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idCandidat) REFERENCES Candidat(id) ON DELETE CASCADE,
    FOREIGN KEY (idEmploye) REFERENCES Employe(id) ON DELETE CASCADE,
    UNIQUE KEY unique_candidat_employe (idCandidat)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- VUES UTILES
-- =========================

-- Vue des candidatures actives avec informations complètes
CREATE OR REPLACE VIEW v_candidatures_actives AS
SELECT 
    c.id,
    c.nom,
    c.prenom,
    c.email,
    c.telephone,
    c.dateCandidature,
    a.reference AS referenceAnnonce,
    a.titre AS titreAnnonce,
    p.nom AS profil,
    d.nom AS departement,
    sc.nom AS statut,
    dip.nom AS diplome
FROM Candidat c
JOIN Annonce a ON c.idAnnonce = a.id
JOIN Profil p ON a.idProfil = p.id
JOIN Departement d ON a.idDepartement = d.id
JOIN StatutCandidat sc ON c.idStatut = sc.id
LEFT JOIN Diplome dip ON c.idDiplome = dip.id
WHERE a.statut = 'publiee';

-- Vue des annonces actives
CREATE OR REPLACE VIEW v_annonces_actives AS
SELECT 
    a.id,
    a.reference,
    a.titre,
    a.dateDebut,
    a.dateFin,
    a.nombrePostes,
    a.statut,
    p.nom AS profil,
    d.nom AS departement,
    ta.libelle AS typeContrat,
    COUNT(DISTINCT c.id) AS nombreCandidatures
FROM Annonce a
JOIN Profil p ON a.idProfil = p.id
JOIN Departement d ON a.idDepartement = d.id
JOIN TypeAnnonce ta ON a.idTypeAnnonce = ta.id
LEFT JOIN Candidat c ON a.id = c.idAnnonce
WHERE a.statut IN ('publiee', 'brouillon')
GROUP BY a.id;

-- Vue des entretiens à venir
CREATE OR REPLACE VIEW v_entretiens_planifies AS
SELECT 
    e.id,
    e.dateHeure,
    e.type,
    e.lieu,
    c.nom AS nomCandidat,
    c.prenom AS prenomCandidat,
    c.email AS emailCandidat,
    a.titre AS poste,
    se.nom AS statut,
    emp.nom AS responsableNom,
    emp.prenom AS responsablePrenom
FROM Entretien e
JOIN Candidat c ON e.idCandidat = c.id
JOIN Annonce a ON c.idAnnonce = a.id
JOIN StatutEntretien se ON e.idStatut = se.id
LEFT JOIN Employe emp ON e.idResponsable = emp.id
WHERE e.dateHeure >= CURDATE()
ORDER BY e.dateHeure;

-- =========================
-- INDEX SUPPLEMENTAIRES POUR PERFORMANCE
-- =========================

CREATE INDEX idx_candidat_date ON Candidat(dateCandidature);
CREATE INDEX idx_annonce_profil ON Annonce(idProfil, statut);
CREATE INDEX idx_entretien_responsable ON Entretien(idResponsable);
CREATE INDEX idx_utilisateur_actif ON Utilisateurs(actif);
CREATE INDEX idx_employe_actif ON Employe(actif);

-- =========================
-- FIN DU SCHEMA
-- =========================
