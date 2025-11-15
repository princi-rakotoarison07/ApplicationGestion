-- =========================
-- DONNEES INITIALES - MODULE RH
-- Insertion des données de référence
-- =========================

-- =========================
-- 1. CATEGORIES DE PERSONNEL
-- =========================

INSERT INTO CategoriePersonnel (libelle, description, ordre, actif) VALUES
('Ouvrier', 'Personnel d''exécution affecté à des tâches manuelles ou de production', 1, TRUE),
('Employé', 'Personnel administratif ou commercial exécutant des tâches définies', 2, TRUE),
('TAM', 'Technicien, Agent de Maîtrise - Personnel d''encadrement intermédiaire', 3, TRUE),
('Cadre', 'Personnel d''encadrement avec responsabilités de management', 4, TRUE),
('Dirigeant', 'Direction générale et membres du comité de direction', 5, TRUE);

-- =========================
-- 2. TYPES DE CONGES
-- =========================

INSERT INTO TypeConge (libelle, description, estRemunere, impacteSolde, justificatifObligatoire, delaiMinimumJours, actif, couleur) VALUES
-- Congés légaux
('Congé annuel payé', 'Congé annuel légal rémunéré (2.5 jours par mois)', TRUE, TRUE, FALSE, 7, TRUE, '#4CAF50'),
('Congé maladie', 'Congé pour raison de santé avec certificat médical', TRUE, FALSE, TRUE, 0, TRUE, '#FF9800'),
('Congé maternité', 'Congé de maternité selon la législation du travail', TRUE, FALSE, TRUE, 30, TRUE, '#E91E63'),
('Congé paternité', 'Congé de paternité pour naissance ou adoption', TRUE, FALSE, TRUE, 7, TRUE, '#2196F3'),

-- Congés exceptionnels
('Congé exceptionnel mariage', 'Congé pour mariage du salarié (3 jours)', TRUE, FALSE, TRUE, 7, TRUE, '#9C27B0'),
('Congé exceptionnel décès', 'Congé pour décès d''un proche (2-5 jours selon lien)', TRUE, FALSE, TRUE, 0, TRUE, '#607D8B'),
('Congé exceptionnel naissance', 'Congé pour naissance d''un enfant', TRUE, FALSE, TRUE, 2, TRUE, '#00BCD4'),

-- Congés formation
('Congé formation', 'Congé pour formation professionnelle', TRUE, FALSE, TRUE, 15, TRUE, '#3F51B5'),
('Congé sans solde', 'Congé non rémunéré à la demande de l''employé', FALSE, FALSE, TRUE, 30, TRUE, '#9E9E9E'),

-- Absences
('Absence autorisée', 'Absence ponctuelle autorisée par la hiérarchie', FALSE, TRUE, FALSE, 1, TRUE, '#FFC107'),
('Absence maladie courte durée', 'Absence pour maladie de courte durée (1-3 jours)', FALSE, FALSE, TRUE, 0, TRUE, '#FF5722');

-- =========================
-- 3. STATUTS DE CONGE
-- =========================

INSERT INTO StatutConge (libelle, ordre, couleur, description) VALUES
('En attente', 1, '#FFC107', 'Demande en attente de validation'),
('Validé', 2, '#4CAF50', 'Demande validée par le responsable'),
('Refusé', 3, '#F44336', 'Demande refusée'),
('Annulé', 4, '#9E9E9E', 'Demande annulée par l''employé ou l''administration');

-- =========================
-- 4. TYPES DE DOCUMENTS RH
-- =========================

INSERT INTO TypeDocument (libelle, description, obligatoire, actif) VALUES
-- Documents d'identité
('CIN', 'Carte d''Identité Nationale', TRUE, TRUE),
('Passeport', 'Passeport en cours de validité', FALSE, TRUE),
('Acte de naissance', 'Acte de naissance original', TRUE, TRUE),
('Certificat de résidence', 'Justificatif de domicile', TRUE, TRUE),

-- Documents professionnels
('Diplôme', 'Diplôme universitaire ou professionnel', TRUE, TRUE),
('Certificat de travail', 'Certificat de travail des emplois précédents', FALSE, TRUE),
('Attestation formation', 'Attestation de formation professionnelle', FALSE, TRUE),
('CV', 'Curriculum Vitae', TRUE, TRUE),

-- Documents contractuels
('Contrat de travail', 'Contrat de travail signé', TRUE, TRUE),
('Avenant au contrat', 'Avenant ou modification du contrat', FALSE, TRUE),
('Lettre de démission', 'Lettre de démission', FALSE, TRUE),
('Certificat médical', 'Certificat médical d''aptitude', TRUE, TRUE),

-- Documents bancaires et fiscaux
('RIB', 'Relevé d''Identité Bancaire', TRUE, TRUE),
('NIF', 'Numéro d''Identification Fiscale', TRUE, TRUE),
('Attestation CNAPS', 'Attestation d''affiliation CNAPS', FALSE, TRUE);

-- =========================
-- 5. ELEMENTS DE SALAIRE
-- =========================

-- Primes
INSERT INTO ElementSalaire (code, libelle, type, natureCalcul, valeurDefaut, tauxDefaut, estImposable, estObligatoire, actif, description) VALUES
('PRIME_ANCIEN', 'Prime d''ancienneté', 'Prime', 'Pourcentage', NULL, 5.00, TRUE, FALSE, TRUE, 'Prime calculée selon l''ancienneté (5% du salaire de base)'),
('PRIME_REND', 'Prime de rendement', 'Prime', 'Variable', NULL, NULL, TRUE, FALSE, TRUE, 'Prime de performance mensuelle'),
('PRIME_RESP', 'Prime de responsabilité', 'Prime', 'Fixe', 50000.00, NULL, TRUE, FALSE, TRUE, 'Prime pour poste à responsabilité'),
('PRIME_TRANSP', 'Prime de transport', 'Prime', 'Fixe', 20000.00, NULL, FALSE, FALSE, TRUE, 'Indemnité de transport'),
('PRIME_13EME', '13ème mois', 'Prime', 'Pourcentage', NULL, 100.00, TRUE, FALSE, TRUE, 'Prime annuelle équivalente à un mois de salaire');

-- Indemnités
INSERT INTO ElementSalaire (code, libelle, type, natureCalcul, valeurDefaut, tauxDefaut, estImposable, estObligatoire, actif, description) VALUES
('IND_DEPLACEMENT', 'Indemnité de déplacement', 'Indemnité', 'Variable', NULL, NULL, FALSE, FALSE, TRUE, 'Remboursement frais de déplacement'),
('IND_LOGEMENT', 'Indemnité de logement', 'Indemnité', 'Fixe', 100000.00, NULL, TRUE, FALSE, TRUE, 'Participation au loyer'),
('IND_REPAS', 'Indemnité de repas', 'Indemnité', 'Fixe', 40000.00, NULL, FALSE, FALSE, TRUE, 'Ticket restaurant ou indemnité repas'),
('HEURE_SUP', 'Heures supplémentaires', 'Prime', 'Variable', NULL, NULL, TRUE, FALSE, TRUE, 'Majoration pour heures supplémentaires');

-- Cotisations patronales
INSERT INTO ElementSalaire (code, libelle, type, natureCalcul, valeurDefaut, tauxDefaut, estImposable, estObligatoire, actif, description) VALUES
('CNAPS_EMP', 'CNAPS part employé', 'Cotisation', 'Pourcentage', NULL, 1.00, FALSE, TRUE, TRUE, 'Cotisation CNAPS - part salarié (1%)'),
('OSTIE_EMP', 'OSTIE part employé', 'Cotisation', 'Pourcentage', NULL, 1.00, FALSE, TRUE, TRUE, 'Cotisation OSTIE - part salarié (1%)'),
('IRSA', 'IRSA', 'Cotisation', 'Variable', NULL, NULL, FALSE, TRUE, TRUE, 'Impôt sur les Revenus Salariaux et Assimilés');

-- Retenues
INSERT INTO ElementSalaire (code, libelle, type, natureCalcul, valeurDefaut, tauxDefaut, estImposable, estObligatoire, actif, description) VALUES
('AVANCE', 'Avance sur salaire', 'Retenue', 'Variable', NULL, NULL, FALSE, FALSE, TRUE, 'Remboursement d''avance'),
('ABSENCE', 'Retenue pour absence', 'Retenue', 'Variable', NULL, NULL, FALSE, FALSE, TRUE, 'Déduction pour absence non justifiée'),
('RET_PRET', 'Remboursement prêt', 'Retenue', 'Variable', NULL, NULL, FALSE, FALSE, TRUE, 'Remboursement de prêt accordé par l''entreprise');

-- =========================
-- 6. PARAMETRES DE PAIE
-- =========================

-- Taux de cotisations sociales (Madagascar - à adapter selon législation)
INSERT INTO ParametrePaie (code, libelle, type, valeur, tauxEmployeur, tauxEmploye, plafond, plancher, dateDebut, dateFin, actif, description) VALUES
-- CNAPS
('CNAPS_2025', 'Cotisation CNAPS 2025', 'TauxCotisation', NULL, 13.00, 1.00, NULL, NULL, '2025-01-01', NULL, TRUE, 'Caisse Nationale de Prévoyance Sociale - 13% employeur + 1% employé'),

-- OSTIE
('OSTIE_2025', 'Cotisation OSTIE 2025', 'TauxCotisation', NULL, 5.00, 1.00, NULL, NULL, '2025-01-01', NULL, TRUE, 'Organisme Sanitaire Tananarivien Inter-Entreprises - 5% employeur + 1% employé'),

-- Barème IRSA (exemple simplifié - à adapter)
('IRSA_TRANCHE1', 'IRSA Tranche 1', 'BaremeIRSA', NULL, 0.00, 0.00, 350000.00, 0.00, '2025-01-01', NULL, TRUE, 'Revenus jusqu''à 350 000 Ar : exonérés'),
('IRSA_TRANCHE2', 'IRSA Tranche 2', 'BaremeIRSA', NULL, 5.00, 5.00, 400000.00, 350001.00, '2025-01-01', NULL, TRUE, 'De 350 001 à 400 000 Ar : 5%'),
('IRSA_TRANCHE3', 'IRSA Tranche 3', 'BaremeIRSA', NULL, 10.00, 10.00, 500000.00, 400001.00, '2025-01-01', NULL, TRUE, 'De 400 001 à 500 000 Ar : 10%'),
('IRSA_TRANCHE4', 'IRSA Tranche 4', 'BaremeIRSA', NULL, 15.00, 15.00, 600000.00, 500001.00, '2025-01-01', NULL, TRUE, 'De 500 001 à 600 000 Ar : 15%'),
('IRSA_TRANCHE5', 'IRSA Tranche 5', 'BaremeIRSA', NULL, 20.00, 20.00, NULL, 600001.00, '2025-01-01', NULL, TRUE, 'Au-delà de 600 000 Ar : 20%'),

-- SMIG (Salaire Minimum)
('SMIG_2025', 'SMIG 2025', 'PlafondSalarial', 250000.00, NULL, NULL, NULL, 250000.00, '2025-01-01', NULL, TRUE, 'Salaire Minimum Interprofessionnel Garanti');

-- =========================
-- 7. TYPES D'ANNONCE (déjà existant - complément)
-- =========================

-- Vérifier si la table existe et insérer si nécessaire
INSERT IGNORE INTO TypeAnnonce (libelle, description, actif) VALUES
('CDI', 'Contrat à Durée Indéterminée', TRUE),
('CDD', 'Contrat à Durée Déterminée', TRUE),
('Stage', 'Convention de stage', TRUE),
('Alternance', 'Contrat en alternance', TRUE),
('Freelance', 'Prestation indépendante', TRUE),
('Intérim', 'Mission temporaire', TRUE),
('Apprentissage', 'Contrat d''apprentissage', TRUE);

-- =========================
-- LOGIQUE METIER - CONTRATS
-- =========================

/*
REGLES DE GESTION POUR LES CONTRATS :

1. TYPES DE CONTRAT ET DUREES :
   - CDI : dateFin = NULL, nombreMois = NULL
   - CDD : dateFin obligatoire, nombreMois calculé automatiquement
   - Stage : dateFin obligatoire, durée limitée (généralement 6 mois max)
   - Intérim : CDD de courte durée (18 mois max)
   - Apprentissage : dateFin obligatoire, durée selon formation

2. PERIODE D'ESSAI (selon législation Madagascar) :
   - Ouvrier/Employé : 1 mois (30 jours)
   - TAM : 2 mois (60 jours)
   - Cadre : 3 mois (90 jours)
   - Dirigeant : 6 mois (180 jours)
   
   Calcul : dateFinEssai = dateDebut + periodeEssaiMois
   
3. RENOUVELLEMENT :
   - CDD : possibilité de renouvellement (2 fois maximum)
   - CDI : pas de renouvellement (conversion ou nouveau contrat)
   - Stage : renouvellement possible selon convention
   
4. VALIDATION AUTOMATIQUE :
   - Si dateDebut < CURDATE() AND dateFin IS NULL => Contrat actif
   - Si dateFinEssai < CURDATE() AND actif = TRUE => Essai validé
   - Si dateFin < CURDATE() AND estRenouvele = FALSE => Contrat expiré
   
5. SALAIRE :
   - Doit être >= SMIG en vigueur
   - Salaire brut avant déductions
   - Variation selon catégorie personnel

6. HISTORIQUE :
   - Tout changement de contrat génère une ligne dans HistoriquePoste
   - Type de changement : "Nouveau contrat", "Renouvellement", "Avenant"
   
EXEMPLE D'INSERTION DE CONTRAT :
*/

-- Exemple : Contrat CDI pour un employé
/*
INSERT INTO Contrat (idEmploye, typeContrat, dateDebut, dateFin, nombreMois, salaire, poste, periodeEssaiMois, dateFinEssai, actif)
VALUES (
    1, 
    'CDI', 
    '2025-01-15', 
    NULL, 
    NULL, 
    500000.00, 
    'Assistant RH',
    1, -- 1 mois pour catégorie Employé
    DATE_ADD('2025-01-15', INTERVAL 1 MONTH),
    TRUE
);
*/

-- Exemple : Contrat CDD pour un cadre
/*
INSERT INTO Contrat (idEmploye, typeContrat, dateDebut, dateFin, nombreMois, salaire, poste, periodeEssaiMois, dateFinEssai, actif)
VALUES (
    2, 
    'CDD', 
    '2025-02-01', 
    '2025-08-01', 
    6, 
    800000.00, 
    'Chef de Projet',
    3, -- 3 mois pour catégorie Cadre
    DATE_ADD('2025-02-01', INTERVAL 3 MONTH),
    TRUE
);
*/

-- =========================
-- PROCEDURES UTILES (LOGIQUE)
-- =========================

/*
PROCEDURE 1 : Calcul automatique de la date fin d'essai
*/
DELIMITER $$
CREATE PROCEDURE sp_CalculDateFinEssai(
    IN p_idCategorie INT,
    IN p_dateDebut DATE,
    OUT p_periodeEssaiMois INT,
    OUT p_dateFinEssai DATE
)
BEGIN
    -- Déterminer la période d'essai selon catégorie
    SELECT 
        CASE libelle
            WHEN 'Ouvrier' THEN 1
            WHEN 'Employé' THEN 1
            WHEN 'TAM' THEN 2
            WHEN 'Cadre' THEN 3
            WHEN 'Dirigeant' THEN 6
            ELSE 1
        END INTO p_periodeEssaiMois
    FROM CategoriePersonnel
    WHERE id = p_idCategorie;
    
    -- Calculer la date de fin
    SET p_dateFinEssai = DATE_ADD(p_dateDebut, INTERVAL p_periodeEssaiMois MONTH);
END$$
DELIMITER ;

/*
PROCEDURE 2 : Initialisation des droits de congés pour un nouvel employé
*/
DELIMITER $$
CREATE PROCEDURE sp_InitialiserDroitsConges(
    IN p_idEmploye INT,
    IN p_dateEmbauche DATE
)
BEGIN
    DECLARE v_annee INT;
    DECLARE v_idTypeConge INT;
    
    SET v_annee = YEAR(p_dateEmbauche);
    
    -- Récupérer l'ID du type "Congé annuel payé"
    SELECT id INTO v_idTypeConge 
    FROM TypeConge 
    WHERE libelle = 'Congé annuel payé' 
    LIMIT 1;
    
    -- Calculer le solde initial prorata temporis
    -- 2.5 jours par mois travaillé
    INSERT INTO DroitConge (idEmploye, idTypeConge, annee, soldeInitial, soldePris, soldeRestant, dateDebut, dateFin, estCumulable)
    VALUES (
        p_idEmploye,
        v_idTypeConge,
        v_annee,
        2.5 * (12 - MONTH(p_dateEmbauche) + 1), -- Prorata
        0.00,
        2.5 * (12 - MONTH(p_dateEmbauche) + 1),
        p_dateEmbauche,
        CONCAT(v_annee, '-12-31'),
        TRUE
    );
END$$
DELIMITER ;

/*
PROCEDURE 3 : Vérification du salaire minimum
*/
DELIMITER $$
CREATE FUNCTION fn_VerifierSalaireMinimum(p_salaire DECIMAL(10,2))
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE v_smig DECIMAL(10,2);
    
    SELECT valeur INTO v_smig
    FROM ParametrePaie
    WHERE code = 'SMIG_2025' AND actif = TRUE
    LIMIT 1;
    
    RETURN p_salaire >= v_smig;
END$$
DELIMITER ;

-- =========================
-- FIN DES DONNEES INITIALES
-- =========================