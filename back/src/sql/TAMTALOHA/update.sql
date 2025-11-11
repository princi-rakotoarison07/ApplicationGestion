
-- Table des types d'annonce (CDI, Freelance, CDD, etc.)
CREATE TABLE TypeAnnonce (
    id INT AUTO_INCREMENT PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL UNIQUE
);

-- Modification de la table Annonce pour ajouter la FK vers TypeAnnonce
ALTER TABLE Annonce
ADD COLUMN idTypeAnnonce INT,
ADD CONSTRAINT fk_annonce_type
    FOREIGN KEY (idTypeAnnonce) REFERENCES TypeAnnonce(id);


CREATE TABLE CompteCandidat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    motDePasse VARCHAR(255) NOT NULL
);


ALTER TABLE Candidat
ADD COLUMN idCompteCandidat INT,
ADD CONSTRAINT fk_candidat_comptecandidat
    FOREIGN KEY (idCompteCandidat) REFERENCES CompteCandidat(id);

-- Supprimer la colonne nomPoste de la table Annonce
ALTER TABLE Annonce
DROP COLUMN nomPoste;

-- Ajouter la colonne reference à la table Annonce
ALTER TABLE Annonce
ADD COLUMN reference VARCHAR(50) NOT NULL UNIQUE;



-- Table des lieux
CREATE TABLE Lieu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL UNIQUE
);

-- Ajouter une colonne lieu dans la table Candidature
ALTER TABLE candidat
ADD COLUMN idLieu INT,
ADD CONSTRAINT fk_candidat_lieu
    FOREIGN KEY (idLieu) REFERENCES Lieu(id);

INSERT INTO StatutEntretien (nom) VALUES 
('En attente'),
('Confirmé'),
('Reporté'),
('Annulé');

INSERT INTO Lieu (nom) VALUES
('Antananarivo'),
('Toamasina'),
('Mahajanga'),
('Fianarantsoa'),
('Toliara'),
('Antsiranana'),
('Morondava'),
('Antsirabe'),
('Nosy Be'),
('Sainte-Marie'),
('Isalo'),
('Andasibe'),
('Ranomafana'),
('Masoala'),
('Menabe');

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
('Développeur JS Senior'),
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
('Disponibilité'),
('Diplome');



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



-- Insertion des types d'annonce
INSERT INTO TypeAnnonce (libelle) VALUES 
('CDI'),
('CDD'),
('Stage'),
('Freelance'),
('Alternance');


INSERT INTO Diplome (nom) VALUES
('CEPE'),       -- Certificat de Premier Etude
('BEPC'),      -- Brevet d’Études du Premier Cycle
('BACC'),      -- Baccalauréat
('Licence'),
('Master'),
('Doctorat');


-- Ajouter une colonne de date de création pour les candidats
ALTER TABLE Candidat 
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;


