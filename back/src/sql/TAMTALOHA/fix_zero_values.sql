-- Script pour corriger les valeurs 0.00 en NULL dans CritereProfil

-- 1. Voir les valeurs 0.00 actuelles
SELECT id, idProfil, idCritere, valeurDouble, valeurVarchar, valeurBool, estObligatoire
FROM CritereProfil 
WHERE valeurDouble = 0.00;

-- 2. Mettre à jour les valeurs 0.00 en NULL
UPDATE CritereProfil 
SET valeurDouble = NULL 
WHERE valeurDouble = 0.00;

-- 3. Vérifier le résultat
SELECT id, idProfil, idCritere, valeurDouble, valeurVarchar, valeurBool, estObligatoire
FROM CritereProfil 
WHERE valeurDouble IS NULL OR valeurDouble = 0.00;

-- 4. Compter les enregistrements affectés
SELECT 
    COUNT(*) as total_criteres,
    COUNT(valeurDouble) as avec_valeur_double,
    COUNT(CASE WHEN valeurDouble IS NULL THEN 1 END) as valeur_double_null,
    COUNT(CASE WHEN valeurDouble = 0 THEN 1 END) as valeur_double_zero
FROM CritereProfil;
