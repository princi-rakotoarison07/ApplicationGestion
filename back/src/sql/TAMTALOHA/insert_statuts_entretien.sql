-- Insertion des statuts d'entretien
INSERT INTO StatutEntretien (id, nom) VALUES 
(1, 'En attente'),
(2, 'Confirmé'),
(3, 'Reporté'),
(4, 'Annulé')
ON DUPLICATE KEY UPDATE nom = VALUES(nom);
