-- Script pour corriger la table Candidat et ajouter la colonne created_at si elle n'existe pas

-- Vérifier et ajouter la colonne created_at si elle n'existe pas
ALTER TABLE Candidat 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Mettre à jour les enregistrements existants avec une date par défaut
UPDATE Candidat 
SET created_at = NOW() 
WHERE created_at IS NULL;

-- Vérifier la structure de la table
DESCRIBE Candidat;

-- Vérifier les données
SELECT 
    id, 
    nom, 
    prenom, 
    idStatut, 
    idLieu, 
    created_at,
    COALESCE(created_at, NOW()) as dateCandidature
FROM Candidat 
ORDER BY id DESC 
LIMIT 5;
