-- ============================================
-- SCRIPT DE TEST POUR LES CRITÈRES DE CANDIDATURE
-- ============================================

-- 1. Voir tous les critères disponibles
SELECT 
    id,
    nom
FROM Critere
ORDER BY nom;

-- 2. Voir tous les candidats avec leurs critères
SELECT 
    c.id as candidatId,
    c.nom,
    c.prenom,
    a.reference as annonceReference,
    cr.nom as nomCritere,
    cc.valeurVarchar,
    cc.valeurDouble,
    cc.valeurBool
FROM Candidat c
LEFT JOIN Annonce a ON c.idAnnonce = a.id
LEFT JOIN CandidatureCritere cc ON c.id = cc.idCandidat
LEFT JOIN Critere cr ON cc.idCritere = cr.id
ORDER BY c.id, cr.nom;

-- 3. Compter les critères par candidat
SELECT 
    c.id as candidatId,
    c.nom,
    c.prenom,
    COUNT(cc.id) as nombreCriteres
FROM Candidat c
LEFT JOIN CandidatureCritere cc ON c.id = cc.idCandidat
GROUP BY c.id, c.nom, c.prenom
ORDER BY nombreCriteres DESC;

-- 4. Voir les critères par type de valeur
SELECT 
    cr.nom as nomCritere,
    COUNT(CASE WHEN cc.valeurBool IS NOT NULL THEN 1 END) as valeurs_bool,
    COUNT(CASE WHEN cc.valeurDouble IS NOT NULL THEN 1 END) as valeurs_double,
    COUNT(CASE WHEN cc.valeurVarchar IS NOT NULL THEN 1 END) as valeurs_varchar,
    COUNT(*) as total
FROM CandidatureCritere cc
LEFT JOIN Critere cr ON cc.idCritere = cr.id
GROUP BY cr.id, cr.nom
ORDER BY cr.nom;

-- 5. Exemples de critères booléens (comme "Anglais: Oui/Non")
SELECT 
    c.nom,
    c.prenom,
    cr.nom as critere,
    CASE 
        WHEN cc.valeurBool = 1 THEN 'Oui'
        WHEN cc.valeurBool = 0 THEN 'Non'
        ELSE 'Non renseigné'
    END as valeur
FROM Candidat c
JOIN CandidatureCritere cc ON c.id = cc.idCandidat
JOIN Critere cr ON cc.idCritere = cr.id
WHERE cc.valeurBool IS NOT NULL
ORDER BY c.nom, cr.nom;

-- 6. Insérer des exemples de critères si la table est vide
INSERT IGNORE INTO Critere (nom) VALUES 
('Anglais'),
('Français'),
('Expérience (années)'),
('Niveau d\'études'),
('Compétences techniques'),
('Disponibilité immédiate'),
('Permis de conduire'),
('Mobilité géographique');

-- 7. Exemple d'insertion de critères pour un candidat (à adapter selon vos IDs)
-- INSERT INTO CandidatureCritere (idCandidat, idAnnonce, idCritere, valeurBool) VALUES 
-- (1, 1, 1, TRUE),  -- Candidat 1, Annonce 1, Anglais: Oui
-- (1, 1, 6, TRUE),  -- Candidat 1, Annonce 1, Disponibilité immédiate: Oui
-- (1, 1, 7, FALSE); -- Candidat 1, Annonce 1, Permis de conduire: Non
