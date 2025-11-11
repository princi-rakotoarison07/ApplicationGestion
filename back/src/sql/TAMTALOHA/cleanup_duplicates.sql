-- Script pour nettoyer les doublons dans CritereProfil et ajouter une contrainte unique

-- 1. Identifier les doublons
SELECT idProfil, idCritere, COUNT(*) as count_duplicates
FROM CritereProfil 
GROUP BY idProfil, idCritere 
HAVING COUNT(*) > 1;

-- 2. Supprimer les doublons en gardant seulement l'ID le plus récent (le plus grand)
DELETE cp1 FROM CritereProfil cp1
INNER JOIN CritereProfil cp2 
WHERE cp1.idProfil = cp2.idProfil 
  AND cp1.idCritere = cp2.idCritere 
  AND cp1.id < cp2.id;

-- 3. Ajouter une contrainte unique pour éviter les doublons futurs
ALTER TABLE CritereProfil 
ADD CONSTRAINT unique_profil_critere 
UNIQUE KEY (idProfil, idCritere);

-- 4. Vérifier qu'il n'y a plus de doublons
SELECT idProfil, idCritere, COUNT(*) as count_after_cleanup
FROM CritereProfil 
GROUP BY idProfil, idCritere 
HAVING COUNT(*) > 1;
