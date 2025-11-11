-- =========================
-- MODULE GESTION DES CONGES ET ABSENCES
-- Conception normalisée professionnelle (3FN)
-- =========================

-- Suppression des tables existantes (ordre inverse des dépendances)
DROP TABLE IF EXISTS AlerteConge;
DROP TABLE IF EXISTS HistoriqueDemandeConge;
DROP TABLE IF EXISTS ValidationConge;
DROP TABLE IF EXISTS PieceJustificative;
DROP TABLE IF EXISTS DemandeConge;
DROP TABLE IF EXISTS MouvementSolde;
DROP TABLE IF EXISTS SoldeConge;
DROP TABLE IF EXISTS RegleAcquisition;
DROP TABLE IF EXISTS ParametreTypeConge;
DROP TABLE IF EXISTS TypeConge;
DROP TABLE IF EXISTS PeriodeExercice;
DROP TABLE IF EXISTS CategoriePersonnel;
DROP TABLE IF EXISTS JourFerie;

-- =========================
-- TABLES DE REFERENCE
-- =========================

-- Table CategoriePersonnel
CREATE TABLE CategoriePersonnel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    libelle VARCHAR(100) NOT NULL,
    description TEXT,
    ordre INT DEFAULT 0,
    actif BOOLEAN DEFAULT TRUE,
    dateCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateModification TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_categorie_code (code),
    INDEX idx_categorie_actif (actif)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catégories du personnel: Ouvrier, Employé, TAM, Cadre, Dirigeant';

-- Table PeriodeExercice
CREATE TABLE PeriodeExercice (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(100) NOT NULL,
    dateDebut DATE NOT NULL,
    dateFin DATE NOT NULL,
    annee INT NOT NULL,
    estCloture BOOLEAN DEFAULT FALSE,
    dateCloture TIMESTAMP NULL,
    idUtilisateurCloture INT NULL,
    actif BOOLEAN DEFAULT TRUE,
    dateCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idUtilisateurCloture) REFERENCES Utilisateurs(id) ON DELETE SET NULL,
    UNIQUE KEY unique_periode_annee (annee),
    INDEX idx_exercice_dates (dateDebut, dateFin),
    INDEX idx_exercice_annee (annee),
    INDEX idx_exercice_cloture (estCloture),
    CONSTRAINT chk_dates_exercice CHECK (dateFin > dateDebut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Exercices annuels pour la gestion des droits à congés';

-- Table JourFerie
CREATE TABLE JourFerie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(100) NOT NULL,
    dateJour DATE NOT NULL,
    estFixe BOOLEAN DEFAULT TRUE,
    estRecurrent BOOLEAN DEFAULT TRUE,
    actif BOOLEAN DEFAULT TRUE,
    dateCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date_ferie (dateJour),
    INDEX idx_ferie_date (dateJour),
    INDEX idx_ferie_annee (YEAR(dateJour))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Jours fériés et jours chômés';

-- Table TypeConge
CREATE TABLE TypeConge (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    libelle VARCHAR(100) NOT NULL,
    description TEXT,
    couleur VARCHAR(20) DEFAULT '#3498db',
    icone VARCHAR(50) NULL,
    ordre INT DEFAULT 0,
    actif BOOLEAN DEFAULT TRUE,
    dateCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateModification TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type_code (code),
    INDEX idx_type_actif (actif),
    INDEX idx_type_ordre (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Types de congés: payés, maladie, maternité, formation, etc.';

-- Table ParametreTypeConge
CREATE TABLE ParametreTypeConge (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idTypeConge INT NOT NULL,
    
    -- Caractéristiques financières
    estPaye BOOLEAN DEFAULT TRUE,
    estDeductibleSalaire BOOLEAN DEFAULT TRUE,
    tauxDeduction DECIMAL(5,2) DEFAULT 100.00,
    
    -- Caractéristiques de gestion
    estCumulable BOOLEAN DEFAULT FALSE,
    estReportable BOOLEAN DEFAULT FALSE,
    estFractionnable BOOLEAN DEFAULT TRUE,
    
    -- Justificatifs
    necessiteJustificatif BOOLEAN DEFAULT FALSE,
    delaiJustificatifJours INT DEFAULT 0,
    typeJustificatifAttendu VARCHAR(200),
    
    -- Délais de demande
    delaiMinimumDemandeJours INT DEFAULT 0,
    delaiMaximumDemandeJours INT NULL,
    
    -- Durées
    dureeMinimaleJours DECIMAL(5,2) DEFAULT 0.5,
    dureeMaximaleJours DECIMAL(5,2) NULL,
    dureeMaximaleParAn DECIMAL(6,2) NULL,
    dureeMaximaleCumulee DECIMAL(6,2) NULL,
    
    -- Impact sur les jours ouvrés
    comptabiliseJoursOuvres BOOLEAN DEFAULT TRUE,
    comptabiliseWeekend BOOLEAN DEFAULT FALSE,
    comptabiliseJoursFeries BOOLEAN DEFAULT FALSE,
    
    actif BOOLEAN DEFAULT TRUE,
    dateCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateModification TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (idTypeConge) REFERENCES TypeConge(id) ON DELETE CASCADE,
    UNIQUE KEY unique_parametre_type (idTypeConge),
    INDEX idx_parametre_type (idTypeConge)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Paramètres et règles de gestion par type de congé';

-- Table RegleAcquisition
CREATE TABLE RegleAcquisition (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idTypeConge INT NOT NULL,
    idCategoriePersonnel INT NULL,
    
    -- Période d'application
    dateDebutApplication DATE NOT NULL,
    dateFinApplication DATE NULL,
    
    -- Règles d'acquisition
    modeAcquisition VARCHAR(50) DEFAULT 'annuel',
    joursParAn DECIMAL(5,2) NULL,
    joursParMois DECIMAL(5,2) NULL,
    joursParTrimestre DECIMAL(5,2) NULL,
    
    -- Ancienneté
    formuleAnciennete TEXT NULL,
    
    -- Conditions d'éligibilité
    ancienneteMinimumMois INT DEFAULT 0,
    dureeContratMinimumMois INT DEFAULT 0,
    tauxActiviteMinimum DECIMAL(5,2) DEFAULT 100.00,
    
    -- Plafonds
    plafondAnnuel DECIMAL(6,2) NULL,
    plafondCumule DECIMAL(6,2) NULL,
    plafondReport DECIMAL(6,2) NULL,
    
    -- Report
    reportAutorise BOOLEAN DEFAULT FALSE,
    dateLimiteUtilisationReport DATE NULL,
    moisLimiteUtilisationReport INT NULL,
    
    actif BOOLEAN DEFAULT TRUE,
    dateCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateModification TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (idTypeConge) REFERENCES TypeConge(id) ON DELETE CASCADE,
    FOREIGN KEY (idCategoriePersonnel) REFERENCES CategoriePersonnel(id) ON DELETE CASCADE,
    
    INDEX idx_regle_type (idTypeConge),
    INDEX idx_regle_categorie (idCategoriePersonnel),
    INDEX idx_regle_dates (dateDebutApplication, dateFinApplication),
    CONSTRAINT chk_dates_application CHECK (dateFinApplication IS NULL OR dateFinApplication >= dateDebutApplication)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Règles d\'acquisition des droits à congés';

-- =========================
-- TABLES DE GESTION DES SOLDES
-- =========================

-- Table SoldeConge
CREATE TABLE SoldeConge (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idEmploye INT NOT NULL,
    idTypeConge INT NOT NULL,
    idPeriodeExercice INT NOT NULL,
    
    -- Soldes (en jours)
    joursAcquis DECIMAL(6,2) DEFAULT 0.00,
    joursAcquisAnneePrecedente DECIMAL(6,2) DEFAULT 0.00,
    joursReportes DECIMAL(6,2) DEFAULT 0.00,
    joursConsommes DECIMAL(6,2) DEFAULT 0.00,
    joursEnCours DECIMAL(6,2) DEFAULT 0.00,
    joursPerdus DECIMAL(6,2) DEFAULT 0.00,
    
    -- Ajustements
    joursAjustement DECIMAL(6,2) DEFAULT 0.00,
    motifAjustement TEXT NULL,
    
    -- Dates
    dateCalcul TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateDerniereAcquisition TIMESTAMP NULL,
    dateLimiteUtilisation DATE NULL,
    
    actif BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (idEmploye) REFERENCES Employe(id) ON DELETE CASCADE,
    FOREIGN KEY (idTypeConge) REFERENCES TypeConge(id) ON DELETE RESTRICT,
    FOREIGN KEY (idPeriodeExercice) REFERENCES PeriodeExercice(id) ON DELETE RESTRICT,
    
    UNIQUE KEY unique_solde (idEmploye, idTypeConge, idPeriodeExercice),
    INDEX idx_solde_employe (idEmploye),
    INDEX idx_solde_type (idTypeConge),
    INDEX idx_solde_periode (idPeriodeExercice),
    INDEX idx_solde_composite (idEmploye, idPeriodeExercice)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Soldes de congés par employé, type et période';

-- Table MouvementSolde
CREATE TABLE MouvementSolde (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idSoldeConge INT NOT NULL,
    idEmploye INT NOT NULL,
    idTypeConge INT NOT NULL,
    
    -- Type de mouvement
    typeMouvement VARCHAR(50) NOT NULL,
    sens VARCHAR(20) NOT NULL,
    
    -- Montant
    nombreJours DECIMAL(6,2) NOT NULL,
    
    -- Origine
    idDemandeConge INT NULL,
    idUtilisateur INT NULL,
    
    -- Description
    libelle VARCHAR(200) NOT NULL,
    commentaire TEXT,
    
    -- Date
    dateEffet DATE NOT NULL,
    dateMouvement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (idSoldeConge) REFERENCES SoldeConge(id) ON DELETE CASCADE,
    FOREIGN KEY (idEmploye) REFERENCES Employe(id) ON DELETE CASCADE,
    FOREIGN KEY (idTypeConge) REFERENCES TypeConge(id) ON DELETE RESTRICT,
    FOREIGN KEY (idDemandeConge) REFERENCES DemandeConge(id) ON DELETE SET NULL,
    FOREIGN KEY (idUtilisateur) REFERENCES Utilisateurs(id) ON DELETE SET NULL,
    
    INDEX idx_mouvement_solde (idSoldeConge),
    INDEX idx_mouvement_employe (idEmploye, dateEffet),
    INDEX idx_mouvement_type (typeMouvement),
    INDEX idx_mouvement_demande (idDemandeConge),
    INDEX idx_mouvement_date (dateMouvement)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Historique des mouvements de soldes de congés';

-- =========================
-- TABLES DE DEMANDES
-- =========================

-- Table DemandeConge
CREATE TABLE DemandeConge (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(50) NOT NULL UNIQUE,
    
    -- Demandeur
    idEmploye INT NOT NULL,
    idDepartement INT NULL,
    
    -- Type de congé
    idTypeConge INT NOT NULL,
    
    -- Période demandée
    dateDebut DATE NOT NULL,
    dateFin DATE NOT NULL,
    dateReprise DATE,
    
    -- Calcul des jours
    nombreJours DECIMAL(5,2) NOT NULL,
    nombreJoursOuvres DECIMAL(5,2),
    nombreJoursCalendaires INT,
    
    -- Détails
    motif TEXT,
    commentaire TEXT,
    adressePendantConge VARCHAR(300),
    telephonePendantConge VARCHAR(20),
    
    -- Statut
    statut VARCHAR(50) NOT NULL DEFAULT 'brouillon',
    
    -- Dates du workflow
    dateDemande TIMESTAMP NULL,
    dateValidation TIMESTAMP NULL,
    dateRefus TIMESTAMP NULL,
    dateAnnulation TIMESTAMP NULL,
    
    -- Solde au moment de la demande
    soldeDisponibleAvant DECIMAL(6,2),
    
    -- Impact paie
    impactePaie BOOLEAN DEFAULT FALSE,
    idPeriodePaie INT NULL,
    
    actif BOOLEAN DEFAULT TRUE,
    dateCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateModification TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (idEmploye) REFERENCES Employe(id) ON DELETE CASCADE,
    FOREIGN KEY (idTypeConge) REFERENCES TypeConge(id) ON DELETE RESTRICT,
    FOREIGN KEY (idDepartement) REFERENCES Departement(id) ON DELETE SET NULL,
    
    INDEX idx_demande_ref (reference),
    INDEX idx_demande_employe (idEmploye),
    INDEX idx_demande_dates (dateDebut, dateFin),
    INDEX idx_demande_statut (statut),
    INDEX idx_demande_type (idTypeConge),
    INDEX idx_demande_departement (idDepartement),
    INDEX idx_demande_creation (dateCreation),
    INDEX idx_demande_composite (idEmploye, statut, dateDebut),
    
    CONSTRAINT chk_dates_demande CHECK (dateFin >= dateDebut),
    CONSTRAINT chk_jours_positifs CHECK (nombreJours > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Demandes de congés et absences';

-- Table PieceJustificative
CREATE TABLE PieceJustificative (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idDemandeConge INT NOT NULL,
    
    -- Fichier
    nomFichier VARCHAR(255) NOT NULL,
    cheminFichier VARCHAR(500) NOT NULL,
    typeFichier VARCHAR(100),
    tailleFichier INT,
    
    -- Type de pièce
    typePiece VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Validation
    estValide BOOLEAN DEFAULT FALSE,
    dateValidation TIMESTAMP NULL,
    idValidateur INT NULL,
    commentaireValidation TEXT,
    
    -- Dates
    dateReception TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateTelechargement TIMESTAMP NULL,
    
    actif BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (idDemandeConge) REFERENCES DemandeConge(id) ON DELETE CASCADE,
    FOREIGN KEY (idValidateur) REFERENCES Employe(id) ON DELETE SET NULL,
    
    INDEX idx_piece_demande (idDemandeConge),
    INDEX idx_piece_type (typePiece),
    INDEX idx_piece_validation (estValide)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Pièces justificatives des demandes de congés';

-- =========================
-- TABLES DE VALIDATION
-- =========================

-- Table ValidationConge
CREATE TABLE ValidationConge (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idDemandeConge INT NOT NULL,
    
    -- Niveau de validation
    niveau INT NOT NULL,
    ordre INT DEFAULT 1,
    estObligatoire BOOLEAN DEFAULT TRUE,
    
    -- Validateur
    idValidateur INT NOT NULL,
    roleValidateur VARCHAR(50),
    
    -- Statut
    statut VARCHAR(50) NOT NULL DEFAULT 'en_attente',
    dateValidation TIMESTAMP NULL,
    
    -- Commentaires
    commentaire TEXT,
    motifRefus TEXT,
    
    -- Notifications
    notificationEnvoyee BOOLEAN DEFAULT FALSE,
    dateNotification TIMESTAMP NULL,
    dateRelance TIMESTAMP NULL,
    nombreRelances INT DEFAULT 0,
    
    dateCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (idDemandeConge) REFERENCES DemandeConge(id) ON DELETE CASCADE,
    FOREIGN KEY (idValidateur) REFERENCES Employe(id) ON DELETE RESTRICT,
    
    UNIQUE KEY unique_validation_niveau (idDemandeConge, niveau),
    INDEX idx_validation_demande (idDemandeConge),
    INDEX idx_validation_validateur (idValidateur),
    INDEX idx_validation_statut (statut),
    INDEX idx_validation_niveau (niveau),
    INDEX idx_validation_composite (idValidateur, statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Workflow de validation hiérarchique des congés';

-- Table HistoriqueDemandeConge
CREATE TABLE HistoriqueDemandeConge (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idDemandeConge INT NOT NULL,
    
    -- Changement
    ancienStatut VARCHAR(50),
    nouveauStatut VARCHAR(50) NOT NULL,
    typeAction VARCHAR(50) NOT NULL,
    
    -- Auteur
    idUtilisateur INT NULL,
    idEmploye INT NULL,
    
    -- Détails
    commentaire TEXT,
    detailsChangement TEXT,
    champsModifies TEXT,
    
    -- Contexte technique
    adresseIP VARCHAR(45),
    userAgent VARCHAR(255),
    
    -- Date
    dateChangement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (idDemandeConge) REFERENCES DemandeConge(id) ON DELETE CASCADE,
    FOREIGN KEY (idUtilisateur) REFERENCES Utilisateurs(id) ON DELETE SET NULL,
    FOREIGN KEY (idEmploye) REFERENCES Employe(id) ON DELETE SET NULL,
    
    INDEX idx_historique_demande (idDemandeConge),
    INDEX idx_historique_date (dateChangement),
    INDEX idx_historique_utilisateur (idUtilisateur),
    INDEX idx_historique_action (typeAction)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Historique complet des modifications de demandes';

-- =========================
-- TABLE DES ALERTES
-- =========================

-- Table AlerteConge
CREATE TABLE AlerteConge (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Type d'alerte
    typeAlerte VARCHAR(50) NOT NULL,
    priorite VARCHAR(20) DEFAULT 'normale',
    
    -- Cible
    idDemandeConge INT NULL,
    idEmploye INT NULL,
    idSoldeConge INT NULL,
    
    -- Message
    titre VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    
    -- Statut
    estLue BOOLEAN DEFAULT FALSE,
    estTraitee BOOLEAN DEFAULT FALSE,
    dateTraitement TIMESTAMP NULL,
    
    -- Destinataires
    idDestinataire INT NULL,
    
    -- Dates
    dateAlerte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateExpiration TIMESTAMP NULL,
    
    actif BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (idDemandeConge) REFERENCES DemandeConge(id) ON DELETE CASCADE,
    FOREIGN KEY (idEmploye) REFERENCES Employe(id) ON DELETE CASCADE,
    FOREIGN KEY (idSoldeConge) REFERENCES SoldeConge(id) ON DELETE CASCADE,
    FOREIGN KEY (idDestinataire) REFERENCES Employe(id) ON DELETE SET NULL,
    
    INDEX idx_alerte_type (typeAlerte),
    INDEX idx_alerte_demande (idDemandeConge),
    INDEX idx_alerte_employe (idEmploye),
    INDEX idx_alerte_destinataire (idDestinataire, estLue),
    INDEX idx_alerte_date (dateAlerte),
    INDEX idx_alerte_statut (estTraitee)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Alertes et notifications pour la gestion des congés';

-- =========================
-- VUES METIER
-- =========================

-- Vue: Soldes actuels avec calcul dynamique
CREATE OR REPLACE VIEW v_soldes_conges_actuels AS
SELECT 
    s.id,
    s.idEmploye,
    e.nom AS employeNom,
    e.prenom AS employePrenom,
    e.email AS employeEmail,
    s.idTypeConge,
    t.code AS typeCongeCode,
    t.libelle AS typeCongeLibelle,
    t.couleur AS typeCongeColor,
    s.idPeriodeExercice,
    p.annee AS periodeAnnee,
    p.libelle AS periodeLibelle,
    s.joursAcquis,
    s.joursReportes,
    s.joursConsommes,
    s.joursEnCours,
    (s.joursAcquis + s.joursReportes - s.joursConsommes - s.joursEnCours) AS joursDisponibles,
    s.joursPerdus,
    s.dateLimiteUtilisation,
    s.dateCalcul,
    d.nom AS departement
FROM SoldeConge s
JOIN Employe e ON s.idEmploye = e.id
JOIN TypeConge t ON s.idTypeConge = t.id
JOIN PeriodeExercice p ON s.idPeriodeExercice = p.id
LEFT JOIN Departement d ON e.idDept = d.id
WHERE s.actif = TRUE 
  AND p.estCloture = FALSE
  AND t.actif = TRUE
  AND e.actif = TRUE;

-- Vue: Demandes en attente de validation
CREATE OR REPLACE VIEW v_demandes_en_attente AS
SELECT 
    d.id,
    d.reference,
    d.idEmploye,
    e.nom AS employeNom,
    e.prenom AS employePrenom,
    e.email AS employeEmail,
    dept.nom AS employeDepartement,
    d.idTypeConge,
    t.libelle AS typeCongeLibelle,
    t.code AS typeCongeCode,
    d.dateDebut,
    d.dateFin,
    d.nombreJours,
    d.dateDemande,
    d.statut,
    v.idValidateur,
    emp_val.nom AS validateurNom,
    emp_val.prenom AS validateurPrenom,
    v.niveau AS niveauValidation,
    v.statut AS statutValidation,
    DATEDIFF(d.dateDebut, CURDATE()) AS joursAvantDebut
FROM DemandeConge d
JOIN Employe e ON d.idEmploye = e.id
JOIN TypeConge t ON d.idTypeConge = t.id
LEFT JOIN Departement dept ON d.idDepartement = dept.id
LEFT JOIN ValidationConge v ON d.id = v.idDemandeConge AND v.statut = 'en_attente'
LEFT JOIN Employe emp_val ON v.idValidateur = emp_val.id
WHERE d.statut IN ('en_attente_validation', 'en_cours_validation')
  AND d.actif = TRUE
ORDER BY d.dateDebut ASC;

-- Vue: Calendrier des absences
CREATE OR REPLACE VIEW v_calendrier_absences AS
SELECT 
    d.id,
    d.reference,
    d.idEmploye,
    e.nom AS employeNom,
    e.prenom AS employePrenom,
    e.email AS employeEmail,
    dept.nom AS departement,
    d.idTypeConge,
    t.libelle AS typeCongeLibelle,
    t.code AS typeCongeCode,
    t.couleur,
    d.dateDebut,
    d.dateFin,
    d.dateReprise,
    d.nombreJours,
    d.statut
FROM DemandeConge d
JOIN Employe e ON d.idEmploye = e.id
JOIN TypeConge t ON d.idTypeConge = t.id
LEFT JOIN Departement dept ON e.idDept = dept.id
WHERE d.statut IN ('validee', 'en_cours')
  AND d.actif = TRUE
  AND d.dateFin >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
ORDER BY d.dateDebut;

-- Vue: Statistiques par département
CREATE OR REPLACE VIEW v_stats_conges_departement AS
SELECT 
    dept.id AS idDepartement,
    dept.nom AS departement,
    COUNT(DISTINCT e.id) AS nombreEmployes,
    COUNT(d.id) AS nombreDemandes,
    SUM(CASE WHEN d.statut = 'validee' THEN 1 ELSE 0 END) AS demandesValidees,
    SUM(CASE WHEN d.statut IN ('en_attente_validation', 'en_cours_validation') THEN 1 ELSE 0 END) AS demandesEnAttente,
    SUM(CASE WHEN d.statut = 'validee' THEN d.nombreJours ELSE 0 END) AS totalJoursValides,
    ROUND(AVG(CASE WHEN d.statut = 'validee' THEN d.nombreJours END), 2) AS moyenneJoursParDemande
FROM Departement dept
LEFT JOIN Employe e ON dept.id = e.idDept AND e.actif = TRUE
LEFT JOIN DemandeConge d ON e.id = d.idEmploye AND YEAR(d.dateDemande) = YEAR(CURDATE())
WHERE dept.actif = TRUE
GROUP BY dept.id, dept.nom;

-- Vue: Alertes congés actives
CREATE OR REPLACE VIEW v_alertes_conges_actives AS
SELECT 
    'demande_urgente' AS typeAlerte,
    d.id AS idDemande,
    d.reference,
    e.nom AS employeNom,
    e.prenom AS employePrenom,
    t.libelle AS typeCongeLibelle,
    d.dateDebut,
    DATEDIFF(d.dateDebut, CURDATE()) AS joursRestants,
    'Demande non validée proche de la date de début' AS message,
    'haute' AS priorite
FROM DemandeConge d
JOIN Employe e ON d.idEmploye = e.id
JOIN TypeConge t ON d.idTypeConge = t.id
WHERE d.statut IN ('en_attente_validation', 'brouillon')
  AND d.dateDebut BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
  AND d.actif = TRUE

UNION ALL

SELECT 
    'justificatif_manquant' AS typeAlerte,
    d.id AS idDemande,
    d.reference,
    e.nom AS employeNom,
    e.prenom AS employePrenom,
    t.libelle AS typeCongeLibelle,
    d.dateDebut,
    DATEDIFF(CURDATE(), d.dateFin) AS joursDepuisFin,
    'Justificatif non fourni' AS message,
    'normale' AS priorite
FROM DemandeConge d
JOIN Employe e ON d.idEmploye = e.id
JOIN TypeConge t ON d.idTypeConge = t.id
JOIN ParametreTypeConge p ON t.id = p.idTypeConge
WHERE p.necessiteJustificatif = TRUE
  AND NOT EXISTS (SELECT 1 FROM PieceJustificative pj WHERE pj.idDemandeConge = d.id AND pj.actif = TRUE)
  AND d.dateFin < CURDATE()
  AND d.statut = 'validee'
  AND d.actif = TRUE

UNION ALL

SELECT 
    'solde_faible' AS typeAlerte,
    NULL AS idDemande,
    NULL AS reference,
    e.nom AS employeNom,
    e.prenom AS employePrenom,
    t.libelle AS typeCongeLibelle,
    NULL AS dateDebut,
    ROUND(s.joursAcquis + s.joursReportes - s.joursConsommes - s.joursEnCours, 2) AS joursRestants,
    CONCAT('Solde faible: ', ROUND(s.joursAcquis + s.joursReportes - s.joursConsommes - s.joursEnCours, 2), ' jours restants') AS message,
    'basse' AS priorite
FROM SoldeConge s
JOIN Employe e ON s.idEmploye = e.id
JOIN TypeConge t ON s.idTypeConge = t.id
JOIN ParametreTypeConge p ON t.id = p.idTypeConge
WHERE (s.joursAcquis + s.joursReportes - s.joursConsommes - s.joursEnCours) > 0 
  AND (s.joursAcquis + s.joursReportes - s.joursConsommes - s.joursEnCours) <= 5
  AND p.estReportable = FALSE
  AND s.actif = TRUE;

-- =========================
-- INDEX SUPPLEMENTAIRES
-- =========================

CREATE INDEX idx_employe_categorie ON Employe(idDept, actif);
CREATE INDEX idx_demande_validation ON DemandeConge(statut, dateDebut);
CREATE INDEX idx_solde_calcul ON SoldeConge(dateCalcul);
CREATE INDEX idx_mouvement_effet ON MouvementSolde(dateEffet);

-- =========================
-- FIN DU SCHEMA MODULE CONGES
-- =========================