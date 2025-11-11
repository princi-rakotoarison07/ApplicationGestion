-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : ven. 07 nov. 2025 à 11:48
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `appgestion`
--

DELIMITER $$
--
-- Procédures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `EnvoyerInvitationQCM` (IN `p_idCandidat` INT, IN `p_idAnnonce` INT, IN `p_idQcmTest` INT, IN `p_dureeValidite` INT, IN `p_idExpediteur` INT)   BEGIN
    DECLARE v_idNotification INT;
    DECLARE v_token VARCHAR(100);
    DECLARE v_dateExpiration DATETIME;
    DECLARE v_idCompteCandidat INT;
    DECLARE v_annonceRef VARCHAR(100);
    DECLARE v_qcmTitre VARCHAR(200);
    
    -- Récupérer les informations nécessaires
    SELECT c.idCompteCandidat, a.reference, qt.nom
    INTO v_idCompteCandidat, v_annonceRef, v_qcmTitre
    FROM Candidat c
    JOIN Annonce a ON c.idAnnonce = a.id
    JOIN QcmTest qt ON qt.id = p_idQcmTest
    WHERE c.id = p_idCandidat AND a.id = p_idAnnonce;
    
    -- Calculer la date d'expiration
    SET v_dateExpiration = DATE_ADD(NOW(), INTERVAL p_dureeValidite HOUR);
    
    -- Générer le token
    SET v_token = GenererTokenQCM();
    
    -- Créer la notification
    INSERT INTO Notification (
        titre, 
        message, 
        idTypeNotification, 
        idDestinataire, 
        idExpediteur, 
        idAnnonce, 
        idQcmTest,
        dateExpiration,
        donnees
    ) VALUES (
        CONCAT('Test QCM - ', v_annonceRef),
        CONCAT('Vous êtes invité(e) à passer le test "', v_qcmTitre, '" pour l\'annonce ', v_annonceRef, '. Vous avez jusqu\'au ', DATE_FORMAT(v_dateExpiration, '%d/%m/%Y à %H:%i'), ' pour le compléter.'),
        1, -- Type 'test_qcm'
        v_idCompteCandidat,
        p_idExpediteur,
        p_idAnnonce,
        p_idQcmTest,
        v_dateExpiration,
        JSON_OBJECT('token', v_token, 'dureeValidite', p_dureeValidite)
    );
    
    SET v_idNotification = LAST_INSERT_ID();
    
    -- Créer l'invitation QCM
    INSERT INTO InvitationQCM (
        idCandidat,
        idAnnonce,
        idQcmTest,
        idNotification,
        dateExpiration,
        token
    ) VALUES (
        p_idCandidat,
        p_idAnnonce,
        p_idQcmTest,
        v_idNotification,
        v_dateExpiration,
        v_token
    );
    
    -- Enregistrer l'historique
    INSERT INTO HistoriqueNotification (idNotification, action) 
    VALUES (v_idNotification, 'creee');
    
    SELECT v_token as token, v_idNotification as idNotification;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `MarquerNotificationLue` (IN `p_idNotification` INT)   BEGIN
    UPDATE Notification 
    SET lue = TRUE 
    WHERE id = p_idNotification;
    
    INSERT INTO HistoriqueNotification (idNotification, action) 
    VALUES (p_idNotification, 'lue');
END$$

--
-- Fonctions
--
CREATE DEFINER=`root`@`localhost` FUNCTION `GenererTokenQCM` () RETURNS VARCHAR(100) CHARSET utf8mb4 COLLATE utf8mb4_general_ci DETERMINISTIC READS SQL DATA BEGIN
    DECLARE token VARCHAR(100);
    DECLARE done INT DEFAULT 0;
    
    REPEAT
        SET token = CONCAT(
            'qcm_',
            SUBSTRING(MD5(CONCAT(NOW(), RAND())), 1, 20),
            '_',
            UNIX_TIMESTAMP()
        );
        
        SELECT COUNT(*) INTO done FROM InvitationQCM WHERE token = token;
    UNTIL done = 0 END REPEAT;
    
    RETURN token;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `annonce`
--

CREATE TABLE `annonce` (
  `id` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `dateDebut` date DEFAULT NULL,
  `dateFin` date DEFAULT NULL,
  `idDepartement` int(11) DEFAULT NULL,
  `idProfil` int(11) DEFAULT NULL,
  `idTypeAnnonce` int(11) DEFAULT NULL,
  `reference` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `annonce`
--

INSERT INTO `annonce` (`id`, `description`, `dateDebut`, `dateFin`, `idDepartement`, `idProfil`, `idTypeAnnonce`, `reference`) VALUES
(1, 'Missions principales :\n\nAssurer la saisie, le suivi et le contrôle des opérations comptables courantes (achats, ventes, trésorerie, paie, immobilisations).\n\nÉtablir les rapprochements bancaires et suivre la trésorerie.\n\nPréparer les déclarations fiscales et sociales (TVA, IR, CNAPS, etc. selon la législation en vigueur).\n\nParticiper à l’élaboration des bilans et comptes de résultat.\n\nGarantir la conformité des enregistrements avec les normes comptables et fiscales.\n\nClasser et archiver les pièces comptables.\n\nCompétences requises :\n\nMaîtrise des principes et normes comptables.\n\nConnaissance des outils bureautiques (Excel, Word) et logiciels de comptabilité (ex : SAGE, Odoo, Dolibarr, etc.).\n\nBonne capacité d’analyse et de rigueur.\n\nSens de l’organisation et respect des délais.\n\nConfidentialité et intégrité professionnelle.', '2025-09-22', '2025-10-31', 4, 3, 1, 'REF-DEV-001002 COMPTA'),
(2, 'Missions principales :\n\nConcevoir, développer et maintenir des applications web en JavaScript.\n\nTravailler sur la partie front-end (interfaces utilisateurs avec frameworks comme React, Vue.js ou Angular) et/ou back-end (Node.js, Express, etc.).\n\nAssurer la qualité du code (tests unitaires, revues de code, bonnes pratiques).\n\nOptimiser les performances et l’accessibilité des applications.\n\nCollaborer avec les équipes design, produit et back-end pour livrer des fonctionnalités complètes.\n\nIntégrer des API et gérer les échanges de données (REST, GraphQL).\n\nParticiper à la veille technologique et proposer des améliorations.\n\nCompétences requises :\n\nMaîtrise du langage JavaScript ES6+.\n\nConnaissance d’au moins un framework front-end (React, Vue.js, Angular).\n\nConnaissance de Node.js et des outils associés (npm, Express, etc.).\n\nBonnes notions d’HTML5, CSS3 et responsive design.\n\nFamiliarité avec Git et les workflows collaboratifs.\n\nCompréhension des bases de données (SQL ou NoSQL).\n\nSensibilité à la sécurité et aux bonnes pratiques de développement.', '2025-09-22', '2025-11-30', 2, 1, 4, 'REF-DEV-001003 DEVJS'),
(3, 'Missions principales :\n\nAssurer le support technique auprès des utilisateurs (diagnostic, assistance, résolution des incidents matériels et logiciels).\n\nInstaller, configurer et maintenir les équipements informatiques (postes de travail, imprimantes, périphériques).\n\nGérer les comptes utilisateurs, droits d’accès et la sécurité des postes.\n\nEffectuer la maintenance préventive et corrective des systèmes informatiques.\n\nParticiper à l’installation et à la mise à jour des logiciels et systèmes d’exploitation.\n\nSuivre et documenter les incidents dans un outil de ticketing.\n\nCollaborer avec les équipes réseau et systèmes pour garantir la disponibilité des services.\n\nCompétences requises :\n\nBonnes connaissances en systèmes d’exploitation (Windows, Linux, macOS).\n\nConnaissance des réseaux locaux (TCP/IP, DHCP, DNS).\n\nMaîtrise de la bureautique (Suite Office, Google Workspace).\n\nCapacité à diagnostiquer et résoudre rapidement les pannes matérielles/logiciels.\n\nNotions de cybersécurité et bonnes pratiques informatiques.\n\nSens du service et bonnes qualités relationnelles.', '2025-09-23', '2025-12-07', 5, 5, 1, 'REF-DEV-001003 Technicien');

-- --------------------------------------------------------

--
-- Structure de la table `candidat`
--

CREATE TABLE `candidat` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `dateNaissance` date DEFAULT NULL,
  `adresse` varchar(200) DEFAULT NULL,
  `cv` text DEFAULT NULL,
  `idAnnonce` int(11) DEFAULT NULL,
  `idStatut` int(11) DEFAULT NULL,
  `idCompteCandidat` int(11) DEFAULT NULL,
  `idLieu` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `candidat`
--

INSERT INTO `candidat` (`id`, `nom`, `prenom`, `dateNaissance`, `adresse`, `cv`, `idAnnonce`, `idStatut`, `idCompteCandidat`, `idLieu`, `created_at`) VALUES
(1, 'Tendry', 'Nyavo', '2000-06-22', 'Ambohimangakely', 'Objet : Candidature au poste de Développeur JavaScript\n\nMadame, Monsieur,\n\nPassionné par le développement web et plus particulièrement par l’univers JavaScript, je souhaite vous proposer ma candidature au poste de Développeur JavaScript au sein de votre entreprise.\n\nMaîtrisant les bases solides du langage JavaScript ainsi que les outils modernes (ES6+, Node.js, React, etc.), je suis motivé à contribuer à la conception et à l’optimisation de vos applications. Rigoureux et curieux, je m’adapte rapidement aux nouvelles technologies et je suis prêt à m’investir pleinement dans les projets qui me seront confiés.\n\nIntégrer votre équipe serait pour moi une opportunité d’apprendre, d’évoluer et de mettre mes compétences au service d’objectifs concrets.\n\nJe serais heureux de pouvoir échanger avec vous lors d’un entretien afin de vous exposer plus en détail ma motivation et mes compétences.\n\nJe vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.\n\nTendry', 2, 1, 1, 8, '2025-09-22 11:26:24'),
(2, 'Rakotoarison', 'princi', '2003-07-22', 'Andoharanofoftsy', 'Objet : Candidature au poste de Développeur JavaScript\n\nMadame, Monsieur,\n\nPassionné par le développement web et plus particulièrement par l’univers JavaScript, je souhaite vous proposer ma candidature au poste de Développeur JavaScript au sein de votre entreprise.\n\nMaîtrisant les bases solides du langage JavaScript ainsi que les outils modernes (ES6+, Node.js, React, etc.), je suis motivé à contribuer à la conception et à l’optimisation de vos applications. Rigoureux et curieux, je m’adapte rapidement aux nouvelles technologies et je suis prêt à m’investir pleinement dans les projets qui me seront confiés.\n\nIntégrer votre équipe serait pour moi une opportunité d’apprendre, d’évoluer et de mettre mes compétences au service d’objectifs concrets.\n\nJe serais heureux de pouvoir échanger avec vous lors d’un entretien afin de vous exposer plus en détail ma motivation et mes compétences.\n\nJe vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.\n\nPrinci', 2, 1, 2, 1, '2025-09-22 11:31:16');

-- --------------------------------------------------------

--
-- Structure de la table `candidatemploye`
--

CREATE TABLE `candidatemploye` (
  `id` int(11) NOT NULL,
  `idCandidat` int(11) DEFAULT NULL,
  `idEmploye` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `candidaturecritere`
--

CREATE TABLE `candidaturecritere` (
  `id` int(11) NOT NULL,
  `idCandidat` int(11) DEFAULT NULL,
  `idAnnonce` int(11) DEFAULT NULL,
  `idCritere` int(11) DEFAULT NULL,
  `valeurDouble` decimal(10,2) DEFAULT NULL,
  `valeurVarchar` varchar(200) DEFAULT NULL,
  `valeurBool` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `candidaturecritere`
--

INSERT INTO `candidaturecritere` (`id`, `idCandidat`, `idAnnonce`, `idCritere`, `valeurDouble`, `valeurVarchar`, `valeurBool`) VALUES
(1, 1, 2, 1, 1.00, NULL, NULL),
(2, 1, 2, 6, NULL, 'Licence', NULL),
(3, 1, 2, 7, NULL, NULL, 1),
(4, 1, 2, 8, NULL, NULL, 0),
(5, 2, 2, 1, 5.00, NULL, NULL),
(6, 2, 2, 6, NULL, 'BACC', NULL),
(7, 2, 2, 7, NULL, NULL, 1),
(8, 2, 2, 8, NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Structure de la table `comptecandidat`
--

CREATE TABLE `comptecandidat` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `motDePasse` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `comptecandidat`
--

INSERT INTO `comptecandidat` (`id`, `email`, `motDePasse`) VALUES
(1, 'tendry@gmail.com', '$2a$10$AJsD1PK3c.WlfAOxNpifNOJSQu8dq12cJpdyc3IvFqg01e0yR4Ew6'),
(2, 'princi@gmail.com', '$2a$10$WKlfhyxhY8JywhN7sdWmeOAzmav.mqXTTpmcvWmahm6anYufKOl.2');

-- --------------------------------------------------------

--
-- Structure de la table `contrat`
--

CREATE TABLE `contrat` (
  `id` int(11) NOT NULL,
  `idEmploye` int(11) DEFAULT NULL,
  `dateDebut` date DEFAULT NULL,
  `nombreMois` int(11) DEFAULT NULL,
  `typeContrat` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `contrat`
--

INSERT INTO `contrat` (`id`, `idEmploye`, `dateDebut`, `nombreMois`, `typeContrat`) VALUES
(1, 1, '2025-10-14', 3, 'Essai');

-- --------------------------------------------------------

--
-- Structure de la table `critere`
--

CREATE TABLE `critere` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `critere`
--

INSERT INTO `critere` (`id`, `nom`) VALUES
(1, 'Expérience (années)'),
(2, 'Niveau d\'études'),
(3, 'Compétences techniques'),
(4, 'Langues parlées'),
(5, 'Disponibilité'),
(6, 'Diplome'),
(7, 'Francais'),
(8, 'Anglais'),
(9, 'React'),
(10, 'Express');

-- --------------------------------------------------------

--
-- Structure de la table `critereprofil`
--

CREATE TABLE `critereprofil` (
  `id` int(11) NOT NULL,
  `idProfil` int(11) DEFAULT NULL,
  `idCritere` int(11) DEFAULT NULL,
  `valeurDouble` decimal(10,2) DEFAULT NULL,
  `valeurVarchar` varchar(200) DEFAULT NULL,
  `valeurBool` tinyint(1) DEFAULT NULL,
  `estObligatoire` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `critereprofil`
--

INSERT INTO `critereprofil` (`id`, `idProfil`, `idCritere`, `valeurDouble`, `valeurVarchar`, `valeurBool`, `estObligatoire`) VALUES
(1, 1, 1, 2.00, NULL, 0, 1),
(2, 1, 6, NULL, 'Master', 0, 1),
(3, 1, 7, NULL, NULL, 1, 1),
(4, 1, 8, NULL, NULL, 1, 1),
(5, 3, 7, NULL, NULL, 1, 1),
(6, 3, 6, NULL, 'Licence', 0, 1),
(7, 3, 8, NULL, NULL, 1, 0),
(8, 5, 3, NULL, 'Maintenance Informatique', 0, 1),
(9, 5, 7, NULL, NULL, 1, 1),
(10, 5, 8, NULL, NULL, 1, 0);

-- --------------------------------------------------------

--
-- Structure de la table `departement`
--

CREATE TABLE `departement` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `departement`
--

INSERT INTO `departement` (`id`, `nom`) VALUES
(1, 'Ressources Humaines'),
(2, 'Informatique'),
(3, 'Marketing'),
(4, 'Finance'),
(5, 'Production');

-- --------------------------------------------------------

--
-- Structure de la table `diplome`
--

CREATE TABLE `diplome` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `diplome`
--

INSERT INTO `diplome` (`id`, `nom`) VALUES
(1, 'CPE'),
(2, 'BEPC'),
(3, 'BACC'),
(4, 'Licence'),
(5, 'Master'),
(6, 'Doctorat');

-- --------------------------------------------------------

--
-- Structure de la table `employe`
--

CREATE TABLE `employe` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `adresse` varchar(200) DEFAULT NULL,
  `idDept` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `employe`
--

INSERT INTO `employe` (`id`, `nom`, `prenom`, `adresse`, `idDept`) VALUES
(1, 'Dupont', 'Jean', '123 Rue de la Paix, Paris', 2),
(2, 'Martin', 'Marie', '456 Avenue des Champs, Lyon', 1),
(3, 'Bernard', 'Pierre', '789 Boulevard Saint-Germain, Marseille', 3),
(4, 'Leroy', 'Emma', '987 Rue du Faubourg, Bordeaux', 2),
(5, 'Roux', 'Thomas', '147 Place Vendôme, Strasbourg', 1),
(6, 'Fournier', 'Julie', '258 Rue de la République, Lille', 3);

-- --------------------------------------------------------

--
-- Structure de la table `entretien`
--

CREATE TABLE `entretien` (
  `id` int(11) NOT NULL,
  `idCandidat` int(11) DEFAULT NULL,
  `dateHeure` datetime DEFAULT NULL,
  `idStatut` int(11) DEFAULT NULL,
  `idResultat` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `entretien`
--

INSERT INTO `entretien` (`id`, `idCandidat`, `dateHeure`, `idStatut`, `idResultat`) VALUES
(1, 1, '2025-09-23 11:28:00', 2, 1);

-- --------------------------------------------------------

--
-- Structure de la table `historiquecandidature`
--

CREATE TABLE `historiquecandidature` (
  `id` int(11) NOT NULL,
  `idCandidat` int(11) DEFAULT NULL,
  `idStatut` int(11) DEFAULT NULL,
  `dateChangement` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `historiquecandidature`
--

INSERT INTO `historiquecandidature` (`id`, `idCandidat`, `idStatut`, `dateChangement`) VALUES
(1, 1, 1, '2025-09-22 11:26:24'),
(2, 2, 1, '2025-09-22 11:31:16');

-- --------------------------------------------------------

--
-- Structure de la table `historiqueentretien`
--

CREATE TABLE `historiqueentretien` (
  `id` int(11) NOT NULL,
  `idEntretien` int(11) DEFAULT NULL,
  `idStatut` int(11) DEFAULT NULL,
  `dateChangement` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `historiqueentretien`
--

INSERT INTO `historiqueentretien` (`id`, `idEntretien`, `idStatut`, `dateChangement`) VALUES
(1, 1, 1, '2025-09-22 11:29:01'),
(2, 1, 2, '2025-10-20 12:03:23');

-- --------------------------------------------------------

--
-- Structure de la table `historiquenotification`
--

CREATE TABLE `historiquenotification` (
  `id` int(11) NOT NULL,
  `idNotification` int(11) NOT NULL,
  `action` enum('creee','lue','cliquee','expiree') NOT NULL,
  `dateAction` timestamp NOT NULL DEFAULT current_timestamp(),
  `adresseIP` varchar(45) DEFAULT NULL,
  `userAgent` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `invitationqcm`
--

CREATE TABLE `invitationqcm` (
  `id` int(11) NOT NULL,
  `idCandidat` int(11) NOT NULL,
  `idAnnonce` int(11) NOT NULL,
  `idQcmTest` int(11) NOT NULL,
  `idNotification` int(11) NOT NULL,
  `statut` enum('envoyee','vue','commencee','terminee','expiree') DEFAULT 'envoyee',
  `dateEnvoi` timestamp NOT NULL DEFAULT current_timestamp(),
  `dateVue` datetime DEFAULT NULL,
  `dateCommencee` datetime DEFAULT NULL,
  `dateTerminee` datetime DEFAULT NULL,
  `dateExpiration` datetime NOT NULL,
  `score` decimal(5,2) DEFAULT NULL,
  `dureePassage` int(11) DEFAULT NULL,
  `token` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `invitationqcm`
--

INSERT INTO `invitationqcm` (`id`, `idCandidat`, `idAnnonce`, `idQcmTest`, `idNotification`, `statut`, `dateEnvoi`, `dateVue`, `dateCommencee`, `dateTerminee`, `dateExpiration`, `score`, `dureePassage`, `token`) VALUES
(1, 1, 2, 6, 1, 'terminee', '2025-09-22 11:27:35', '2025-09-22 14:27:50', NULL, '2025-09-22 14:28:07', '2025-09-25 14:27:35', 67.00, NULL, 'dff2ae7800f867ae7613e04d8f4ed3c4e4617bf5364d7240dd6ea2a059b4043e');

-- --------------------------------------------------------

--
-- Structure de la table `lieu`
--

CREATE TABLE `lieu` (
  `id` int(11) NOT NULL,
  `nom` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `lieu`
--

INSERT INTO `lieu` (`id`, `nom`) VALUES
(12, 'Andasibe'),
(1, 'Antananarivo'),
(8, 'Antsirabe'),
(6, 'Antsiranana'),
(4, 'Fianarantsoa'),
(11, 'Isalo'),
(3, 'Mahajanga'),
(14, 'Masoala'),
(15, 'Menabe'),
(7, 'Morondava'),
(9, 'Nosy Be'),
(13, 'Ranomafana'),
(10, 'Sainte-Marie'),
(2, 'Toamasina'),
(5, 'Toliara');

-- --------------------------------------------------------

--
-- Structure de la table `notification`
--

CREATE TABLE `notification` (
  `id` int(11) NOT NULL,
  `titre` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `idTypeNotification` int(11) NOT NULL,
  `idDestinataire` int(11) NOT NULL,
  `idExpediteur` int(11) DEFAULT NULL,
  `idAnnonce` int(11) DEFAULT NULL,
  `idQcmTest` int(11) DEFAULT NULL,
  `lue` tinyint(1) DEFAULT 0,
  `dateCreation` timestamp NOT NULL DEFAULT current_timestamp(),
  `dateExpiration` datetime DEFAULT NULL,
  `donnees` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`donnees`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `notification`
--

INSERT INTO `notification` (`id`, `titre`, `message`, `idTypeNotification`, `idDestinataire`, `idExpediteur`, `idAnnonce`, `idQcmTest`, `lue`, `dateCreation`, `dateExpiration`, `donnees`) VALUES
(1, 'Test QCM - REF-DEV-001003 DEVJS', 'Vous êtes invité(e) à passer le test \"Test developpeur JS\" pour l\'annonce REF-DEV-001003 DEVJS. Date limite: 25/09/2025', 1, 1, NULL, 2, 6, 1, '2025-09-22 11:27:35', '2025-09-25 14:27:35', '{\"token\":\"dff2ae7800f867ae7613e04d8f4ed3c4e4617bf5364d7240dd6ea2a059b4043e\",\"lienTest\":\"http://localhost:3000/test/dff2ae7800f867ae7613e04d8f4ed3c4e4617bf5364d7240dd6ea2a059b4043e\",\"dureeValidite\":72}');

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `notificationsnonlues`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `notificationsnonlues` (
`id` int(11)
,`titre` varchar(200)
,`message` text
,`dateCreation` timestamp
,`dateExpiration` datetime
,`idDestinataire` int(11)
,`typeNotification` varchar(50)
,`icone` varchar(50)
,`couleur` varchar(7)
,`annonceReference` varchar(50)
,`qcmTitre` varchar(150)
);

-- --------------------------------------------------------

--
-- Structure de la table `profil`
--

CREATE TABLE `profil` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `profil`
--

INSERT INTO `profil` (`id`, `nom`) VALUES
(1, 'Développeur JS Senior'),
(2, 'Manager'),
(3, 'Comptable'),
(4, 'Commercial'),
(5, 'Technicien');

-- --------------------------------------------------------

--
-- Structure de la table `qcmchoix`
--

CREATE TABLE `qcmchoix` (
  `id` int(11) NOT NULL,
  `idQuestion` int(11) NOT NULL,
  `texte` varchar(500) NOT NULL,
  `estCorrect` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `qcmchoix`
--

INSERT INTO `qcmchoix` (`id`, `idQuestion`, `texte`, `estCorrect`) VALUES
(1, 1, '\"undefined\"', 0),
(2, 1, '\"number\"', 0),
(3, 1, '\"object\"', 1),
(4, 2, 'forEach()', 0),
(5, 2, 'map()', 1),
(6, 2, 'filter()', 0),
(7, 3, '== compare uniquement les valeurs, === compare valeurs et types', 1),
(8, 3, '=== compare uniquement les valeurs, == compare valeurs et types', 0),
(9, 3, 'Aucune différence', 0);

-- --------------------------------------------------------

--
-- Structure de la table `qcmquestion`
--

CREATE TABLE `qcmquestion` (
  `id` int(11) NOT NULL,
  `idTest` int(11) NOT NULL,
  `numero` int(11) NOT NULL,
  `question` text NOT NULL,
  `points` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `qcmquestion`
--

INSERT INTO `qcmquestion` (`id`, `idTest`, `numero`, `question`, `points`) VALUES
(1, 6, 1, 'Quelle est la sortie du code suivant ?\n\nconsole.log(typeof NaN);\n', 1),
(2, 6, 2, 'Laquelle de ces méthodes permet de parcourir un tableau en JavaScript ?', 1),
(3, 6, 3, 'Quelle est la différence entre == et === en JavaScript ?', 1);

-- --------------------------------------------------------

--
-- Structure de la table `qcmreponse`
--

CREATE TABLE `qcmreponse` (
  `id` int(11) NOT NULL,
  `idCandidat` int(11) NOT NULL,
  `idTest` int(11) NOT NULL,
  `idQuestion` int(11) NOT NULL,
  `idChoix` int(11) DEFAULT NULL,
  `pointsObtenus` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `qcmreponse`
--

INSERT INTO `qcmreponse` (`id`, `idCandidat`, `idTest`, `idQuestion`, `idChoix`, `pointsObtenus`) VALUES
(1, 1, 6, 1, 2, 0),
(2, 1, 6, 2, 5, 1),
(3, 1, 6, 3, 7, 1);

-- --------------------------------------------------------

--
-- Structure de la table `qcmtest`
--

CREATE TABLE `qcmtest` (
  `id` int(11) NOT NULL,
  `nom` varchar(150) DEFAULT NULL,
  `idProfil` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `qcmtest`
--

INSERT INTO `qcmtest` (`id`, `nom`, `idProfil`) VALUES
(1, 'Test Technique Développeur', 1),
(2, 'Test de Logique', NULL),
(3, 'Test de Français', NULL),
(4, 'Test Comptabilité', 2),
(5, 'Test Marketing', 3),
(6, 'Test developpeur JS', 1);

-- --------------------------------------------------------

--
-- Structure de la table `resultat`
--

CREATE TABLE `resultat` (
  `id` int(11) NOT NULL,
  `note` int(11) DEFAULT NULL,
  `appreciation` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `resultat`
--

INSERT INTO `resultat` (`id`, `note`, `appreciation`) VALUES
(1, 0, 'Résultat de l\'entretien: moyen');

-- --------------------------------------------------------

--
-- Structure de la table `statutcandidat`
--

CREATE TABLE `statutcandidat` (
  `id` int(11) NOT NULL,
  `nom` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `statutcandidat`
--

INSERT INTO `statutcandidat` (`id`, `nom`) VALUES
(1, 'En attente'),
(2, 'Accepté'),
(3, 'Refusé'),
(4, 'En cours d\'évaluation'),
(5, 'Candidature reçue'),
(6, 'QCM en cours'),
(7, 'QCM terminé'),
(8, 'Entretien programmé'),
(9, 'Entretien terminé');

-- --------------------------------------------------------

--
-- Structure de la table `statutentretien`
--

CREATE TABLE `statutentretien` (
  `id` int(11) NOT NULL,
  `nom` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `statutentretien`
--

INSERT INTO `statutentretien` (`id`, `nom`) VALUES
(1, 'En attente'),
(2, 'Confirmé'),
(3, 'Reporté'),
(4, 'Annulé');

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `tableaubordqcm`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `tableaubordqcm` (
`id` int(11)
,`statut` enum('envoyee','vue','commencee','terminee','expiree')
,`dateEnvoi` timestamp
,`dateExpiration` datetime
,`score` decimal(5,2)
,`candidatNom` varchar(100)
,`candidatPrenom` varchar(100)
,`candidatEmail` varchar(100)
,`annonceReference` varchar(50)
,`qcmTitre` varchar(150)
,`joursRestants` int(7)
);

-- --------------------------------------------------------

--
-- Structure de la table `testannonce`
--

CREATE TABLE `testannonce` (
  `id` int(11) NOT NULL,
  `idTest` int(11) NOT NULL,
  `idAnnonce` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `typeannonce`
--

CREATE TABLE `typeannonce` (
  `id` int(11) NOT NULL,
  `libelle` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `typeannonce`
--

INSERT INTO `typeannonce` (`id`, `libelle`) VALUES
(5, 'Alternance'),
(2, 'CDD'),
(1, 'CDI'),
(4, 'Freelance'),
(3, 'Stage');

-- --------------------------------------------------------

--
-- Structure de la table `typenotification`
--

CREATE TABLE `typenotification` (
  `id` int(11) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `icone` varchar(50) DEFAULT 'bell',
  `couleur` varchar(7) DEFAULT '#3b82f6'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `typenotification`
--

INSERT INTO `typenotification` (`id`, `nom`, `description`, `icone`, `couleur`) VALUES
(1, 'test_qcm', 'Invitation à passer un test QCM', 'clipboard', '#3b82f6'),
(2, 'rappel_test', 'Rappel pour un test QCM non passé', 'clock', '#f59e0b'),
(3, 'resultat_test', 'Résultat d\'un test QCM', 'check-circle', '#10b981'),
(4, 'candidature_acceptee', 'Candidature acceptée', 'user-check', '#10b981'),
(5, 'candidature_refusee', 'Candidature refusée', 'user-x', '#ef4444');

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

CREATE TABLE `utilisateurs` (
  `id` int(11) NOT NULL,
  `email` varchar(150) NOT NULL,
  `motDePasse` varchar(200) NOT NULL,
  `idEmploye` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `email`, `motDePasse`, `idEmploye`) VALUES
(1, 'tsiory@gmail.com', '$2a$10$oqgz5J.d1VpS8Lnoth.J1.c6yxpW4f3B/1Xb7SxV.VgXeDjxIYduy', 2);

-- --------------------------------------------------------

--
-- Structure de la vue `notificationsnonlues`
--
DROP TABLE IF EXISTS `notificationsnonlues`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `notificationsnonlues`  AS SELECT `n`.`id` AS `id`, `n`.`titre` AS `titre`, `n`.`message` AS `message`, `n`.`dateCreation` AS `dateCreation`, `n`.`dateExpiration` AS `dateExpiration`, `n`.`idDestinataire` AS `idDestinataire`, `tn`.`nom` AS `typeNotification`, `tn`.`icone` AS `icone`, `tn`.`couleur` AS `couleur`, `a`.`reference` AS `annonceReference`, `qt`.`nom` AS `qcmTitre` FROM (((`notification` `n` join `typenotification` `tn` on(`n`.`idTypeNotification` = `tn`.`id`)) left join `annonce` `a` on(`n`.`idAnnonce` = `a`.`id`)) left join `qcmtest` `qt` on(`n`.`idQcmTest` = `qt`.`id`)) WHERE `n`.`lue` = 0 ORDER BY `n`.`dateCreation` DESC ;

-- --------------------------------------------------------

--
-- Structure de la vue `tableaubordqcm`
--
DROP TABLE IF EXISTS `tableaubordqcm`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `tableaubordqcm`  AS SELECT `iq`.`id` AS `id`, `iq`.`statut` AS `statut`, `iq`.`dateEnvoi` AS `dateEnvoi`, `iq`.`dateExpiration` AS `dateExpiration`, `iq`.`score` AS `score`, `c`.`nom` AS `candidatNom`, `c`.`prenom` AS `candidatPrenom`, `cc`.`email` AS `candidatEmail`, `a`.`reference` AS `annonceReference`, `qt`.`nom` AS `qcmTitre`, to_days(`iq`.`dateExpiration`) - to_days(current_timestamp()) AS `joursRestants` FROM ((((`invitationqcm` `iq` join `candidat` `c` on(`iq`.`idCandidat` = `c`.`id`)) join `comptecandidat` `cc` on(`c`.`idCompteCandidat` = `cc`.`id`)) join `annonce` `a` on(`iq`.`idAnnonce` = `a`.`id`)) join `qcmtest` `qt` on(`iq`.`idQcmTest` = `qt`.`id`)) ORDER BY `iq`.`dateEnvoi` DESC ;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `annonce`
--
ALTER TABLE `annonce`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reference` (`reference`),
  ADD KEY `idDepartement` (`idDepartement`),
  ADD KEY `idProfil` (`idProfil`),
  ADD KEY `fk_annonce_type` (`idTypeAnnonce`);

--
-- Index pour la table `candidat`
--
ALTER TABLE `candidat`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idAnnonce` (`idAnnonce`),
  ADD KEY `idStatut` (`idStatut`),
  ADD KEY `fk_candidat_comptecandidat` (`idCompteCandidat`),
  ADD KEY `fk_candidat_lieu` (`idLieu`);

--
-- Index pour la table `candidatemploye`
--
ALTER TABLE `candidatemploye`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idCandidat` (`idCandidat`),
  ADD KEY `idEmploye` (`idEmploye`);

--
-- Index pour la table `candidaturecritere`
--
ALTER TABLE `candidaturecritere`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idCandidat` (`idCandidat`),
  ADD KEY `idAnnonce` (`idAnnonce`),
  ADD KEY `idCritere` (`idCritere`);

--
-- Index pour la table `comptecandidat`
--
ALTER TABLE `comptecandidat`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Index pour la table `contrat`
--
ALTER TABLE `contrat`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idEmploye` (`idEmploye`);

--
-- Index pour la table `critere`
--
ALTER TABLE `critere`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `critereprofil`
--
ALTER TABLE `critereprofil`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idProfil` (`idProfil`),
  ADD KEY `idCritere` (`idCritere`);

--
-- Index pour la table `departement`
--
ALTER TABLE `departement`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `diplome`
--
ALTER TABLE `diplome`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `employe`
--
ALTER TABLE `employe`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idDept` (`idDept`);

--
-- Index pour la table `entretien`
--
ALTER TABLE `entretien`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idCandidat` (`idCandidat`),
  ADD KEY `idStatut` (`idStatut`),
  ADD KEY `idResultat` (`idResultat`);

--
-- Index pour la table `historiquecandidature`
--
ALTER TABLE `historiquecandidature`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idCandidat` (`idCandidat`),
  ADD KEY `idStatut` (`idStatut`);

--
-- Index pour la table `historiqueentretien`
--
ALTER TABLE `historiqueentretien`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idEntretien` (`idEntretien`),
  ADD KEY `idStatut` (`idStatut`);

--
-- Index pour la table `historiquenotification`
--
ALTER TABLE `historiquenotification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notification_date` (`idNotification`,`dateAction`);

--
-- Index pour la table `invitationqcm`
--
ALTER TABLE `invitationqcm`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `idx_candidat_annonce` (`idCandidat`,`idAnnonce`),
  ADD KEY `idx_token` (`token`),
  ADD KEY `idx_statut` (`statut`),
  ADD KEY `fk_invitation_annonce` (`idAnnonce`),
  ADD KEY `fk_invitation_qcmtest` (`idQcmTest`),
  ADD KEY `fk_invitation_notification` (`idNotification`);

--
-- Index pour la table `lieu`
--
ALTER TABLE `lieu`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nom` (`nom`);

--
-- Index pour la table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_destinataire_lue` (`idDestinataire`,`lue`),
  ADD KEY `idx_date_creation` (`dateCreation`),
  ADD KEY `fk_notification_type` (`idTypeNotification`),
  ADD KEY `fk_notification_annonce` (`idAnnonce`),
  ADD KEY `fk_notification_qcmtest` (`idQcmTest`);

--
-- Index pour la table `profil`
--
ALTER TABLE `profil`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `qcmchoix`
--
ALTER TABLE `qcmchoix`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idQuestion` (`idQuestion`);

--
-- Index pour la table `qcmquestion`
--
ALTER TABLE `qcmquestion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idTest` (`idTest`);

--
-- Index pour la table `qcmreponse`
--
ALTER TABLE `qcmreponse`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idCandidat` (`idCandidat`),
  ADD KEY `idTest` (`idTest`),
  ADD KEY `idQuestion` (`idQuestion`),
  ADD KEY `idChoix` (`idChoix`);

--
-- Index pour la table `qcmtest`
--
ALTER TABLE `qcmtest`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idProfil` (`idProfil`);

--
-- Index pour la table `resultat`
--
ALTER TABLE `resultat`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `statutcandidat`
--
ALTER TABLE `statutcandidat`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `statutentretien`
--
ALTER TABLE `statutentretien`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `testannonce`
--
ALTER TABLE `testannonce`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idTest` (`idTest`),
  ADD KEY `idAnnonce` (`idAnnonce`);

--
-- Index pour la table `typeannonce`
--
ALTER TABLE `typeannonce`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `libelle` (`libelle`);

--
-- Index pour la table `typenotification`
--
ALTER TABLE `typenotification`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nom` (`nom`);

--
-- Index pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idEmploye` (`idEmploye`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `annonce`
--
ALTER TABLE `annonce`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `candidat`
--
ALTER TABLE `candidat`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `candidatemploye`
--
ALTER TABLE `candidatemploye`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `candidaturecritere`
--
ALTER TABLE `candidaturecritere`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `comptecandidat`
--
ALTER TABLE `comptecandidat`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `contrat`
--
ALTER TABLE `contrat`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `critere`
--
ALTER TABLE `critere`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `critereprofil`
--
ALTER TABLE `critereprofil`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `departement`
--
ALTER TABLE `departement`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `diplome`
--
ALTER TABLE `diplome`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `employe`
--
ALTER TABLE `employe`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `entretien`
--
ALTER TABLE `entretien`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `historiquecandidature`
--
ALTER TABLE `historiquecandidature`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `historiqueentretien`
--
ALTER TABLE `historiqueentretien`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `historiquenotification`
--
ALTER TABLE `historiquenotification`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `invitationqcm`
--
ALTER TABLE `invitationqcm`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `lieu`
--
ALTER TABLE `lieu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT pour la table `notification`
--
ALTER TABLE `notification`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `profil`
--
ALTER TABLE `profil`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `qcmchoix`
--
ALTER TABLE `qcmchoix`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `qcmquestion`
--
ALTER TABLE `qcmquestion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `qcmreponse`
--
ALTER TABLE `qcmreponse`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `qcmtest`
--
ALTER TABLE `qcmtest`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `resultat`
--
ALTER TABLE `resultat`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `statutcandidat`
--
ALTER TABLE `statutcandidat`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `statutentretien`
--
ALTER TABLE `statutentretien`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `testannonce`
--
ALTER TABLE `testannonce`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `typeannonce`
--
ALTER TABLE `typeannonce`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `typenotification`
--
ALTER TABLE `typenotification`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `annonce`
--
ALTER TABLE `annonce`
  ADD CONSTRAINT `annonce_ibfk_1` FOREIGN KEY (`idDepartement`) REFERENCES `departement` (`id`),
  ADD CONSTRAINT `annonce_ibfk_2` FOREIGN KEY (`idProfil`) REFERENCES `profil` (`id`),
  ADD CONSTRAINT `fk_annonce_type` FOREIGN KEY (`idTypeAnnonce`) REFERENCES `typeannonce` (`id`);

--
-- Contraintes pour la table `candidat`
--
ALTER TABLE `candidat`
  ADD CONSTRAINT `candidat_ibfk_1` FOREIGN KEY (`idAnnonce`) REFERENCES `annonce` (`id`),
  ADD CONSTRAINT `candidat_ibfk_2` FOREIGN KEY (`idStatut`) REFERENCES `statutcandidat` (`id`),
  ADD CONSTRAINT `fk_candidat_comptecandidat` FOREIGN KEY (`idCompteCandidat`) REFERENCES `comptecandidat` (`id`),
  ADD CONSTRAINT `fk_candidat_lieu` FOREIGN KEY (`idLieu`) REFERENCES `lieu` (`id`);

--
-- Contraintes pour la table `candidatemploye`
--
ALTER TABLE `candidatemploye`
  ADD CONSTRAINT `candidatemploye_ibfk_1` FOREIGN KEY (`idCandidat`) REFERENCES `candidat` (`id`),
  ADD CONSTRAINT `candidatemploye_ibfk_2` FOREIGN KEY (`idEmploye`) REFERENCES `employe` (`id`);

--
-- Contraintes pour la table `candidaturecritere`
--
ALTER TABLE `candidaturecritere`
  ADD CONSTRAINT `candidaturecritere_ibfk_1` FOREIGN KEY (`idCandidat`) REFERENCES `candidat` (`id`),
  ADD CONSTRAINT `candidaturecritere_ibfk_2` FOREIGN KEY (`idAnnonce`) REFERENCES `annonce` (`id`),
  ADD CONSTRAINT `candidaturecritere_ibfk_3` FOREIGN KEY (`idCritere`) REFERENCES `critere` (`id`);

--
-- Contraintes pour la table `contrat`
--
ALTER TABLE `contrat`
  ADD CONSTRAINT `contrat_ibfk_1` FOREIGN KEY (`idEmploye`) REFERENCES `employe` (`id`);

--
-- Contraintes pour la table `critereprofil`
--
ALTER TABLE `critereprofil`
  ADD CONSTRAINT `critereprofil_ibfk_1` FOREIGN KEY (`idProfil`) REFERENCES `profil` (`id`),
  ADD CONSTRAINT `critereprofil_ibfk_2` FOREIGN KEY (`idCritere`) REFERENCES `critere` (`id`);

--
-- Contraintes pour la table `employe`
--
ALTER TABLE `employe`
  ADD CONSTRAINT `employe_ibfk_1` FOREIGN KEY (`idDept`) REFERENCES `departement` (`id`);

--
-- Contraintes pour la table `entretien`
--
ALTER TABLE `entretien`
  ADD CONSTRAINT `entretien_ibfk_1` FOREIGN KEY (`idCandidat`) REFERENCES `candidat` (`id`),
  ADD CONSTRAINT `entretien_ibfk_2` FOREIGN KEY (`idStatut`) REFERENCES `statutentretien` (`id`),
  ADD CONSTRAINT `entretien_ibfk_3` FOREIGN KEY (`idResultat`) REFERENCES `resultat` (`id`);

--
-- Contraintes pour la table `historiquecandidature`
--
ALTER TABLE `historiquecandidature`
  ADD CONSTRAINT `historiquecandidature_ibfk_1` FOREIGN KEY (`idCandidat`) REFERENCES `candidat` (`id`),
  ADD CONSTRAINT `historiquecandidature_ibfk_2` FOREIGN KEY (`idStatut`) REFERENCES `statutcandidat` (`id`);

--
-- Contraintes pour la table `historiqueentretien`
--
ALTER TABLE `historiqueentretien`
  ADD CONSTRAINT `historiqueentretien_ibfk_1` FOREIGN KEY (`idEntretien`) REFERENCES `entretien` (`id`),
  ADD CONSTRAINT `historiqueentretien_ibfk_2` FOREIGN KEY (`idStatut`) REFERENCES `statutentretien` (`id`);

--
-- Contraintes pour la table `historiquenotification`
--
ALTER TABLE `historiquenotification`
  ADD CONSTRAINT `fk_historique_notification` FOREIGN KEY (`idNotification`) REFERENCES `notification` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `invitationqcm`
--
ALTER TABLE `invitationqcm`
  ADD CONSTRAINT `fk_invitation_annonce` FOREIGN KEY (`idAnnonce`) REFERENCES `annonce` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_invitation_candidat` FOREIGN KEY (`idCandidat`) REFERENCES `candidat` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_invitation_notification` FOREIGN KEY (`idNotification`) REFERENCES `notification` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_invitation_qcmtest` FOREIGN KEY (`idQcmTest`) REFERENCES `qcmtest` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `fk_notification_annonce` FOREIGN KEY (`idAnnonce`) REFERENCES `annonce` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notification_destinataire` FOREIGN KEY (`idDestinataire`) REFERENCES `comptecandidat` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notification_qcmtest` FOREIGN KEY (`idQcmTest`) REFERENCES `qcmtest` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_notification_type` FOREIGN KEY (`idTypeNotification`) REFERENCES `typenotification` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `qcmchoix`
--
ALTER TABLE `qcmchoix`
  ADD CONSTRAINT `qcmchoix_ibfk_1` FOREIGN KEY (`idQuestion`) REFERENCES `qcmquestion` (`id`);

--
-- Contraintes pour la table `qcmquestion`
--
ALTER TABLE `qcmquestion`
  ADD CONSTRAINT `qcmquestion_ibfk_1` FOREIGN KEY (`idTest`) REFERENCES `qcmtest` (`id`);

--
-- Contraintes pour la table `qcmreponse`
--
ALTER TABLE `qcmreponse`
  ADD CONSTRAINT `qcmreponse_ibfk_1` FOREIGN KEY (`idCandidat`) REFERENCES `candidat` (`id`),
  ADD CONSTRAINT `qcmreponse_ibfk_2` FOREIGN KEY (`idTest`) REFERENCES `qcmtest` (`id`),
  ADD CONSTRAINT `qcmreponse_ibfk_3` FOREIGN KEY (`idQuestion`) REFERENCES `qcmquestion` (`id`),
  ADD CONSTRAINT `qcmreponse_ibfk_4` FOREIGN KEY (`idChoix`) REFERENCES `qcmchoix` (`id`);

--
-- Contraintes pour la table `qcmtest`
--
ALTER TABLE `qcmtest`
  ADD CONSTRAINT `qcmtest_ibfk_1` FOREIGN KEY (`idProfil`) REFERENCES `profil` (`id`);

--
-- Contraintes pour la table `testannonce`
--
ALTER TABLE `testannonce`
  ADD CONSTRAINT `testannonce_ibfk_1` FOREIGN KEY (`idTest`) REFERENCES `qcmtest` (`id`),
  ADD CONSTRAINT `testannonce_ibfk_2` FOREIGN KEY (`idAnnonce`) REFERENCES `annonce` (`id`);

--
-- Contraintes pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD CONSTRAINT `utilisateurs_ibfk_1` FOREIGN KEY (`idEmploye`) REFERENCES `employe` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
