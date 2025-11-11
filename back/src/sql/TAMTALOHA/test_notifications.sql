-- Script de test pour créer uniquement les tables de notifications
-- À exécuter après avoir créé les tables de base (QcmTest, Candidat, etc.)

-- Table pour les types de notifications
CREATE TABLE IF NOT EXISTS TypeNotification (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    icone VARCHAR(50) DEFAULT 'bell',
    couleur VARCHAR(7) DEFAULT '#3b82f6'
);

-- Table principale des notifications
CREATE TABLE IF NOT EXISTS Notification (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    idTypeNotification INT NOT NULL,
    idDestinataire INT NOT NULL,
    idExpediteur INT NULL,
    idAnnonce INT NULL,
    idQcmTest INT NULL,
    lue BOOLEAN DEFAULT FALSE,
    dateCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateExpiration DATETIME NULL,
    donnees JSON NULL,
    INDEX idx_destinataire_lue (idDestinataire, lue),
    INDEX idx_date_creation (dateCreation)
);

-- Table pour les invitations aux tests QCM
CREATE TABLE IF NOT EXISTS InvitationQCM (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idCandidat INT NOT NULL,
    idAnnonce INT NOT NULL,
    idQcmTest INT NOT NULL,
    idNotification INT NOT NULL,
    statut ENUM('envoyee', 'vue', 'commencee', 'terminee', 'expiree') DEFAULT 'envoyee',
    dateEnvoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateVue DATETIME NULL,
    dateCommencee DATETIME NULL,
    dateTerminee DATETIME NULL,
    dateExpiration DATETIME NOT NULL,
    score DECIMAL(5,2) NULL,
    dureePassage INT NULL,
    token VARCHAR(100) UNIQUE NOT NULL,
    INDEX idx_candidat_annonce (idCandidat, idAnnonce),
    INDEX idx_token (token),
    INDEX idx_statut (statut)
);

-- Table pour l'historique des actions sur les notifications
CREATE TABLE IF NOT EXISTS HistoriqueNotification (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idNotification INT NOT NULL,
    action ENUM('creee', 'lue', 'cliquee', 'expiree') NOT NULL,
    dateAction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    adresseIP VARCHAR(45),
    userAgent TEXT,
    INDEX idx_notification_date (idNotification, dateAction)
);

-- Données initiales
INSERT IGNORE INTO TypeNotification (nom, description, icone, couleur) VALUES
('test_qcm', 'Invitation à passer un test QCM', 'clipboard', '#3b82f6'),
('rappel_test', 'Rappel pour un test QCM non passé', 'clock', '#f59e0b'),
('resultat_test', 'Résultat d\'un test QCM', 'check-circle', '#10b981'),
('candidature_acceptee', 'Candidature acceptée', 'user-check', '#10b981'),
('candidature_refusee', 'Candidature refusée', 'user-x', '#ef4444');

-- Tests QCM de démonstration
INSERT IGNORE INTO QcmTest (nom, idProfil) VALUES
('Test Technique Développeur', 1),
('Test de Logique', NULL),
('Test de Français', NULL),
('Test Comptabilité', 2),
('Test Marketing', 3);
