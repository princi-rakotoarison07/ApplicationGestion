-- =========================
-- SCRIPT MYSQL RECRUTEMENT (VERSION SIMPLIFIEE QCM AVEC MODIFICATIONS)
-- =========================

-- Table Departement
CREATE TABLE Departement (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL
);

-- Table Profil
CREATE TABLE Profil (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL
);

-- Table Critere
CREATE TABLE Critere (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL
);

-- Table CritereProfil
CREATE TABLE CritereProfil (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idProfil INT,
    idCritere INT,
    valeurDouble DECIMAL(10,2) NULL,
    valeurVarchar VARCHAR(200) NULL,
    valeurBool BOOLEAN NULL,
    estObligatoire BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (idProfil) REFERENCES Profil(id),
    FOREIGN KEY (idCritere) REFERENCES Critere(id)
);

-- Table des types d'annonce (CDI, Freelance, CDD, etc.)
CREATE TABLE TypeAnnonce (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL UNIQUE
);

-- Table Annonce
CREATE TABLE Annonce (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description TEXT,
    dateDebut DATE,
    dateFin DATE,
    reference VARCHAR(50) NOT NULL UNIQUE,
    idDepartement INT,
    idProfil INT,
    idTypeAnnonce INT,
    FOREIGN KEY (idDepartement) REFERENCES Departement(id),
    FOREIGN KEY (idProfil) REFERENCES Profil(id),
    FOREIGN KEY (idTypeAnnonce) REFERENCES TypeAnnonce(id)
);

-- Table StatutCandidat
CREATE TABLE StatutCandidat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL
);

-- Table CompteCandidat
CREATE TABLE CompteCandidat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    motDePasse VARCHAR(255) NOT NULL
);

-- Table Candidat
CREATE TABLE Candidat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    dateNaissance DATE,
    adresse VARCHAR(200),
    cv TEXT,
    idAnnonce INT,
    idStatut INT,
    idCompteCandidat INT,
    FOREIGN KEY (idAnnonce) REFERENCES Annonce(id),
    FOREIGN KEY (idStatut) REFERENCES StatutCandidat(id),
    FOREIGN KEY (idCompteCandidat) REFERENCES CompteCandidat(id)
);

-- Table Employe
CREATE TABLE Employe (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    adresse VARCHAR(200),
    idDept INT,
    FOREIGN KEY (idDept) REFERENCES Departement(id)
);

-- Table CandidatEmploye
CREATE TABLE CandidatEmploye (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idCandidat INT,
    idEmploye INT,
    FOREIGN KEY (idCandidat) REFERENCES Candidat(id),
    FOREIGN KEY (idEmploye) REFERENCES Employe(id)
);

-- Table Utilisateur
CREATE TABLE Utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    motDePasse VARCHAR(200) NOT NULL,
    idEmploye INT,
    FOREIGN KEY (idEmploye) REFERENCES Employe(id)
);

-- Table Diplome
CREATE TABLE Diplome (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL
);

-- Table QcmTest
CREATE TABLE QcmTest (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(150),
    idProfil INT NULL,
    FOREIGN KEY (idProfil) REFERENCES Profil(id)
);

-- Table TestAnnonce
CREATE TABLE TestAnnonce (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idTest INT NOT NULL,
    idAnnonce INT NOT NULL,
    FOREIGN KEY (idTest) REFERENCES QcmTest(id),
    FOREIGN KEY (idAnnonce) REFERENCES Annonce(id)
);

-- Table QcmQuestion
CREATE TABLE QcmQuestion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idTest INT NOT NULL,
    numero INT NOT NULL,
    question TEXT NOT NULL,
    points INT NOT NULL DEFAULT 1,
    FOREIGN KEY (idTest) REFERENCES QcmTest(id)
);

-- Table QcmChoix
CREATE TABLE QcmChoix (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idQuestion INT NOT NULL,
    texte VARCHAR(500) NOT NULL,
    estCorrect BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (idQuestion) REFERENCES QcmQuestion(id)
);

-- Table QcmReponse
CREATE TABLE QcmReponse (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idCandidat INT NOT NULL,
    idTest INT NOT NULL,
    idQuestion INT NOT NULL,
    idChoix INT NULL,
    pointsObtenus INT DEFAULT 0,
    FOREIGN KEY (idCandidat) REFERENCES Candidat(id),
    FOREIGN KEY (idTest) REFERENCES QcmTest(id),
    FOREIGN KEY (idQuestion) REFERENCES QcmQuestion(id),
    FOREIGN KEY (idChoix) REFERENCES QcmChoix(id)
);

-- Table Resultat
CREATE TABLE Resultat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    note INT,
    appreciation VARCHAR(200)
);

-- Table StatutEntretien
CREATE TABLE StatutEntretien (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL
);

-- Table Entretien
CREATE TABLE Entretien (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idCandidat INT,
    dateHeure DATETIME,
    idStatut INT,
    idResultat INT,
    FOREIGN KEY (idCandidat) REFERENCES Candidat(id),
    FOREIGN KEY (idStatut) REFERENCES StatutEntretien(id),
    FOREIGN KEY (idResultat) REFERENCES Resultat(id)
);

-- Table HistoriqueEntretien
CREATE TABLE HistoriqueEntretien (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idEntretien INT,
    idStatut INT,
    dateChangement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idEntretien) REFERENCES Entretien(id),
    FOREIGN KEY (idStatut) REFERENCES StatutEntretien(id)
);

-- Table HistoriqueCandidature
CREATE TABLE HistoriqueCandidature (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idCandidat INT,
    idStatut INT,
    dateChangement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idCandidat) REFERENCES Candidat(id),
    FOREIGN KEY (idStatut) REFERENCES StatutCandidat(id)
);

-- Table Contrat
CREATE TABLE Contrat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idEmploye INT,
    dateDebut DATE,
    nombreMois INT,
    typeContrat VARCHAR(50),
    FOREIGN KEY (idEmploye) REFERENCES Employe(id)
);

-- Table CandidatureCritere
CREATE TABLE CandidatureCritere (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idCandidat INT,
    idAnnonce INT,
    idCritere INT,
    valeurDouble DECIMAL(10,2) NULL,
    valeurVarchar VARCHAR(200) NULL,
    valeurBool BOOLEAN NULL,
    FOREIGN KEY (idCandidat) REFERENCES Candidat(id),
    FOREIGN KEY (idAnnonce) REFERENCES Annonce(id),
    FOREIGN KEY (idCritere) REFERENCES Critere(id)
);
