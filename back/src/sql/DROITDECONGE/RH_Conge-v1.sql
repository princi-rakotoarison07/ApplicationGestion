-- =========================
-- MODULE GESTION DES CONGES ET PAIE
-- Ajout des tables pour la gestion des congés, absences et paie
-- =========================

-- =========================
-- TABLES DE REFERENCE CONGES
-- =========================

-- Table TypeConge (Congés payés, maladie, maternité, formation, etc.)
CREATE TABLE TypeConge (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    estRemunere BOOLEAN DEFAULT TRUE,
    impacteSolde BOOLEAN DEFAULT TRUE,
    justificatifObligatoire BOOLEAN DEFAULT FALSE,
    delaiMinimumJours INT DEFAULT 0,
    actif BOOLEAN DEFAULT TRUE,
    couleur VARCHAR(20),
    dateCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_typeconge_libelle (libelle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table CategoriePersonnel (Ouvrier, Employé, TAM, Cadre, Dirigeant)
CREATE TABLE CategoriePersonnel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    ordre INT DEFAULT 0,
    actif BOOLEAN DEFAULT TRUE,
    INDEX idx_categorie_libelle (libelle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table StatutConge (En attente, Validé, Refusé, Annulé)
CREATE TABLE StatutConge (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL UNIQUE,
    ordre INT DEFAULT 0,
    couleur VARCHAR(20),
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table TypeDocument (CIN, Diplômes, Attestations, Contrats, etc.)
CREATE TABLE TypeDocument (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    obligatoire BOOLEAN DEFAULT FALSE,
    actif BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABLES EMPLOYES ETENDUES
-- =========================

-- Modification de la table Employe (ALTER TABLE)
ALTER TABLE Employe 
ADD COLUMN idCategorie INT NULL AFTER idDept,
ADD COLUMN cin VARCHAR(50) NULL AFTER email,
ADD COLUMN lieuNaissance VARCHAR(100) NULL AFTER dateNaissance,
ADD COLUMN nationalite VARCHAR(50) NULL AFTER lieuNaissance,
ADD COLUMN situationFamiliale VARCHAR(50) NULL AFTER nationalite,
ADD COLUMN nombreEnfants INT DEFAULT 0 AFTER situationFamiliale,
ADD COLUMN posteActuel VARCHAR(100) NULL AFTER nombreEnfants,
ADD COLUMN matricule VARCHAR(50) NULL UNIQUE AFTER id,
ADD COLUMN photo TEXT NULL COMMENT 'Stockage base64 ou URL de la photo',
ADD CONSTRAINT fk_employe_categorie FOREIGN KEY (idCategorie) REFERENCES CategoriePersonnel(id);

CREATE INDEX idx_employe_matricule ON Employe(matricule);
CREATE INDEX idx_employe_categorie ON Employe(idCategorie);

-- Table DocumentRH (Documents attachés aux employés)
CREATE TABLE DocumentRH (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idEmploye INT NOT NULL,
    idTypeDocument INT NOT NULL,
    nomDocument VARCHAR(200) NOT NULL,
    numeroDocument VARCHAR(100) NULL,
    dateEmission DATE NULL,
    dateExpiration DATE NULL,
    contenuBase64 LONGTEXT NULL COMMENT 'Contenu du document encodé en base64',
    typeContenu VARCHAR(50) NULL COMMENT 'Type MIME: application/pdf, image/jpeg, etc.',
    tailleFichier INT NULL COMMENT 'Taille en octets',
    commentaire TEXT,
    dateAjout TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idEmploye) REFERENCES Employe(id) ON DELETE CASCADE,
    FOREIGN KEY (idTypeDocument) REFERENCES TypeDocument(id),
    INDEX idx_document_employe (idEmploye),
    INDEX idx_document_type (idTypeDocument)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table HistoriquePoste (Historique des postes, promotions, mobilités)
CREATE TABLE HistoriquePoste (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idEmploye INT NOT NULL,
    ancienPoste VARCHAR(100) NULL,
    nouveauPoste VARCHAR(100) NOT NULL,
    ancienDepartement INT NULL,
    nouveauDepartement INT NULL,
    typeChangement VARCHAR(50) NOT NULL COMMENT 'Promotion, Mutation, Reclassement',
    dateEffet DATE NOT NULL,
    ancienSalaire DECIMAL(10,2) NULL,
    nouveauSalaire DECIMAL(10,2) NULL,
    motif TEXT,
    dateEnregistrement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idEmploye) REFERENCES Employe(id) ON DELETE CASCADE,
    FOREIGN KEY (ancienDepartement) REFERENCES Departement(id),
    FOREIGN KEY (nouveauDepartement) REFERENCES Departement(id),
    INDEX idx_historique_employe (idEmploye),
    INDEX idx_historique_date (dateEffet)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABLES DROITS DE CONGES
-- =========================

-- Table DroitConge (Solde de congés par employé et par type)
CREATE TABLE DroitConge (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idEmploye INT NOT NULL,
    idTypeConge INT NOT NULL,
    annee INT NOT NULL,
    soldeInitial DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    soldePris DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    soldeRestant DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    soldeReporte DECIMAL(5,2) DEFAULT 0.00,
    dateDebut DATE NOT NULL,
    dateFin DATE NOT NULL,
    estCumulable BOOLEAN DEFAULT FALSE,
    commentaire TEXT,
    dateCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateModification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idEmploye) REFERENCES Employe(id) ON DELETE CASCADE,
    FOREIGN KEY (idTypeConge) REFERENCES TypeConge(id),
    UNIQUE KEY unique_employe_type_annee (idEmploye, idTypeConge, annee),
    INDEX idx_droit_employe (idEmploye),
    INDEX idx_droit_annee (annee)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABLES GESTION DES CONGES
-- =========================

-- Table DemandeConge
CREATE TABLE DemandeConge (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idEmploye INT NOT NULL,
    idTypeConge INT NOT NULL,
    dateDebut DATE NOT NULL,
    dateFin DATE NOT NULL,
    nombreJours DECIMAL(5,2) NOT NULL,
    motif TEXT,
    adresseConge VARCHAR(200) NULL,
    telephoneConge VARCHAR(20) NULL,
    idStatut INT NOT NULL,
    idValidateur INT NULL,
    dateValidation DATETIME NULL,
    commentaireValidation TEXT,
    documentJustificatif LONGTEXT NULL COMMENT 'Document encodé en base64',
    typeDocumentJustificatif VARCHAR(50) NULL,
    dateDemande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateModification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idEmploye) REFERENCES Employe(id) ON DELETE CASCADE,
    FOREIGN KEY (idTypeConge) REFERENCES TypeConge(id),
    FOREIGN KEY (idStatut) REFERENCES StatutConge(id),
    FOREIGN KEY (idValidateur) REFERENCES Employe(id) ON DELETE SET NULL,
    INDEX idx_demande_employe (idEmploye),
    INDEX idx_demande_dates (dateDebut, dateFin),
    INDEX idx_demande_statut (idStatut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table HistoriqueConge
CREATE TABLE HistoriqueConge (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idDemandeConge INT NOT NULL,
    idStatut INT NOT NULL,
    idUtilisateur INT NULL,
    commentaire TEXT,
    dateChangement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idDemandeConge) REFERENCES DemandeConge(id) ON DELETE CASCADE,
    FOREIGN KEY (idStatut) REFERENCES StatutConge(id),
    FOREIGN KEY (idUtilisateur) REFERENCES Utilisateurs(id) ON DELETE SET NULL,
    INDEX idx_historique_demande (idDemandeConge),
    INDEX idx_historique_date (dateChangement)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABLES TEMPS ET PRESENCES
-- =========================

-- Table Presence
CREATE TABLE Presence (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idEmploye INT NOT NULL,
    datePresence DATE NOT NULL,
    heureEntree TIME NULL,
    heureSortie TIME NULL,
    heuresPause DECIMAL(4,2) DEFAULT 0.00,
    heuresTravaillees DECIMAL(4,2) NULL,
    heuresSupplementaires DECIMAL(4,2) DEFAULT 0.00,
    estRetard BOOLEAN DEFAULT FALSE,
    minutesRetard INT DEFAULT 0,
    estAbsent BOOLEAN DEFAULT FALSE,
    motifAbsence VARCHAR(200) NULL,
    commentaire TEXT,
    dateEnregistrement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idEmploye) REFERENCES Employe(id) ON DELETE CASCADE,
    UNIQUE KEY unique_employe_date (idEmploye, datePresence),
    INDEX idx_presence_employe (idEmploye),
    INDEX idx_presence_date (datePresence)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABLES PAIE
-- =========================

-- Modification de la table Contrat (ALTER TABLE)
ALTER TABLE Contrat
ADD COLUMN periodeEssaiMois INT NULL AFTER nombreMois,
ADD COLUMN dateFinEssai DATE NULL AFTER periodeEssaiMois,
ADD COLUMN estRenouvele BOOLEAN DEFAULT FALSE AFTER actif,
ADD COLUMN commentaire TEXT AFTER estRenouvele;

-- Table ElementSalaire (Primes, Indemnités, Retenues)
CREATE TABLE ElementSalaire (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    libelle VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL COMMENT 'Prime, Indemnité, Retenue, Cotisation',
    natureCalcul VARCHAR(50) NOT NULL COMMENT 'Fixe, Pourcentage, Variable',
    valeurDefaut DECIMAL(10,2) NULL,
    tauxDefaut DECIMAL(5,2) NULL COMMENT 'Taux en pourcentage',
    estImposable BOOLEAN DEFAULT TRUE,
    estObligatoire BOOLEAN DEFAULT FALSE,
    actif BOOLEAN DEFAULT TRUE,
    description TEXT,
    INDEX idx_element_code (code),
    INDEX idx_element_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table EtatPaie (État mensuel de paie avant génération des fiches)
CREATE TABLE EtatPaie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mois INT NOT NULL COMMENT 'Mois (1-12)',
    annee INT NOT NULL,
    dateDebut DATE NOT NULL,
    dateFin DATE NOT NULL,
    statut VARCHAR(50) NOT NULL DEFAULT 'En cours' COMMENT 'En cours, Validé, Clôturé',
    nombreEmployes INT DEFAULT 0,
    masseSalarialeBrut DECIMAL(12,2) DEFAULT 0.00,
    totalCotisations DECIMAL(12,2) DEFAULT 0.00,
    masseSalarialeNet DECIMAL(12,2) DEFAULT 0.00,
    dateValidation DATETIME NULL,
    idValidateur INT NULL,
    commentaire TEXT,
    dateCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateModification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idValidateur) REFERENCES Utilisateurs(id) ON DELETE SET NULL,
    UNIQUE KEY unique_periode (mois, annee),
    INDEX idx_etat_periode (mois, annee)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table FichePaie
CREATE TABLE FichePaie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idEmploye INT NOT NULL,
    idEtatPaie INT NOT NULL,
    numeroFiche VARCHAR(50) NOT NULL UNIQUE,
    mois INT NOT NULL,
    annee INT NOT NULL,
    dateDebut DATE NOT NULL,
    dateFin DATE NOT NULL,
    joursOuvrables INT NOT NULL,
    joursPresence DECIMAL(5,2) DEFAULT 0.00,
    joursConge DECIMAL(5,2) DEFAULT 0.00,
    joursAbsence DECIMAL(5,2) DEFAULT 0.00,
    heuresSupplementaires DECIMAL(6,2) DEFAULT 0.00,
    salaireBase DECIMAL(10,2) NOT NULL,
    salaireBrut DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    totalPrimes DECIMAL(10,2) DEFAULT 0.00,
    totalIndemnites DECIMAL(10,2) DEFAULT 0.00,
    totalRetenues DECIMAL(10,2) DEFAULT 0.00,
    cnaps DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Cotisation CNAPS',
    ostie DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Cotisation OSTIE',
    irsa DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Impôt sur salaire',
    autresCotisations DECIMAL(10,2) DEFAULT 0.00,
    totalCotisations DECIMAL(10,2) DEFAULT 0.00,
    avances DECIMAL(10,2) DEFAULT 0.00,
    salaireNet DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    netAPayer DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    estValidee BOOLEAN DEFAULT FALSE,
    dateValidation DATETIME NULL,
    commentaire TEXT,
    dateGeneration TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idEmploye) REFERENCES Employe(id) ON DELETE CASCADE,
    FOREIGN KEY (idEtatPaie) REFERENCES EtatPaie(id) ON DELETE CASCADE,
    UNIQUE KEY unique_employe_periode (idEmploye, mois, annee),
    INDEX idx_fiche_employe (idEmploye),
    INDEX idx_fiche_periode (mois, annee),
    INDEX idx_fiche_etat (idEtatPaie)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table LigneFichePaie (Détail des éléments de salaire)
CREATE TABLE LigneFichePaie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idFichePaie INT NOT NULL,
    idElementSalaire INT NOT NULL,
    libelle VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL COMMENT 'Prime, Indemnité, Retenue, Cotisation',
    base DECIMAL(10,2) NULL,
    taux DECIMAL(5,2) NULL,
    nombreUnites DECIMAL(6,2) NULL,
    montant DECIMAL(10,2) NOT NULL,
    estImposable BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (idFichePaie) REFERENCES FichePaie(id) ON DELETE CASCADE,
    FOREIGN KEY (idElementSalaire) REFERENCES ElementSalaire(id),
    INDEX idx_ligne_fiche (idFichePaie),
    INDEX idx_ligne_element (idElementSalaire)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table Avance (Avances sur salaire)
CREATE TABLE Avance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idEmploye INT NOT NULL,
    montant DECIMAL(10,2) NOT NULL,
    motif TEXT,
    dateAvance DATE NOT NULL,
    estRembourse BOOLEAN DEFAULT FALSE,
    idFichePaieRemboursement INT NULL,
    dateRemboursement DATE NULL,
    commentaire TEXT,
    dateCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idEmploye) REFERENCES Employe(id) ON DELETE CASCADE,
    FOREIGN KEY (idFichePaieRemboursement) REFERENCES FichePaie(id) ON DELETE SET NULL,
    INDEX idx_avance_employe (idEmploye),
    INDEX idx_avance_date (dateAvance)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- TABLES PARAMETRAGE PAIE
-- =========================

-- Table ParametrePaie (CNAPS, OSTIE, IRSA, etc.)
CREATE TABLE ParametrePaie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    libelle VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL COMMENT 'TauxCotisation, BaremeIRSA, PlafondSalarial',
    valeur DECIMAL(10,2) NULL,
    tauxEmployeur DECIMAL(5,2) NULL,
    tauxEmploye DECIMAL(5,2) NULL,
    plafond DECIMAL(10,2) NULL,
    plancher DECIMAL(10,2) NULL,
    dateDebut DATE NOT NULL,
    dateFin DATE NULL,
    actif BOOLEAN DEFAULT TRUE,
    description TEXT,
    INDEX idx_parametre_code (code),
    INDEX idx_parametre_dates (dateDebut, dateFin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================
-- INDEX SUPPLEMENTAIRES
-- =========================

CREATE INDEX idx_conge_periode ON DemandeConge(dateDebut, dateFin, idStatut);
CREATE INDEX idx_presence_mois ON Presence(datePresence, idEmploye);
CREATE INDEX idx_fiche_validation ON FichePaie(estValidee, dateValidation);
CREATE INDEX idx_document_expiration ON DocumentRH(dateExpiration);

-- =========================
-- FIN DU SCHEMA MODULE CONGES ET PAIE
-- =========================