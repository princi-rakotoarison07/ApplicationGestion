-- Vérification des données pour les filtres

-- Vérifier les départements
SELECT 'DEPARTEMENTS' as table_name, COUNT(*) as count FROM Departement;
SELECT * FROM Departement ORDER BY nom;

-- Vérifier les types d'annonce
SELECT 'TYPES_ANNONCE' as table_name, COUNT(*) as count FROM TypeAnnonce;
SELECT * FROM TypeAnnonce ORDER BY libelle;

-- Vérifier les annonces avec leurs relations
SELECT 'ANNONCES' as table_name, COUNT(*) as count FROM Annonce;
SELECT 
    a.id,
    a.reference,
    a.description,
    d.nom as nomDepartement,
    ta.libelle as typeAnnonce
FROM Annonce a
LEFT JOIN Departement d ON a.idDepartement = d.id
LEFT JOIN TypeAnnonce ta ON a.idTypeAnnonce = ta.id
ORDER BY a.id;
