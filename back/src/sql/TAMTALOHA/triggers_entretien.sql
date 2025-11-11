-- =========================
-- TRIGGERS POUR HISTORIQUE ENTRETIEN
-- =========================
-- Ces triggers enregistrent automatiquement toutes les actions sur la table Entretien
-- dans la table HistoriqueEntretien pour traçabilité complète

-- Suppression des triggers existants (si ils existent)
DROP TRIGGER IF EXISTS tr_entretien_insert;
DROP TRIGGER IF EXISTS tr_entretien_update;
DROP TRIGGER IF EXISTS tr_entretien_delete;

-- =========================
-- TRIGGER INSERT - Création d'un nouvel entretien
-- =========================
DELIMITER $$
CREATE TRIGGER tr_entretien_insert
    AFTER INSERT ON Entretien
    FOR EACH ROW
BEGIN
    -- Enregistrer la création de l'entretien avec son statut initial
    INSERT INTO HistoriqueEntretien (idEntretien, idStatut, dateChangement, action, ancienneValeur, nouvelleValeur)
    VALUES (
        NEW.id,
        NEW.idStatut,
        NOW(),
        'CREATE',
        NULL,
        CONCAT('Entretien créé - Candidat: ', NEW.idCandidat, ', Date: ', NEW.dateHeure, ', Statut: ', NEW.idStatut)
    );
END$$
DELIMITER ;

-- =========================
-- TRIGGER UPDATE - Modification d'un entretien existant
-- =========================
DELIMITER $$
CREATE TRIGGER tr_entretien_update
    AFTER UPDATE ON Entretien
    FOR EACH ROW
BEGIN
    -- Variables pour stocker les changements
    DECLARE changements TEXT DEFAULT '';
    
    -- Vérifier les changements de statut
    IF OLD.idStatut != NEW.idStatut THEN
        INSERT INTO HistoriqueEntretien (idEntretien, idStatut, dateChangement, action, ancienneValeur, nouvelleValeur)
        VALUES (
            NEW.id,
            NEW.idStatut,
            NOW(),
            'UPDATE_STATUT',
            CONCAT('Ancien statut: ', OLD.idStatut),
            CONCAT('Nouveau statut: ', NEW.idStatut)
        );
    END IF;
    
    -- Vérifier les changements de date/heure
    IF OLD.dateHeure != NEW.dateHeure THEN
        INSERT INTO HistoriqueEntretien (idEntretien, idStatut, dateChangement, action, ancienneValeur, nouvelleValeur)
        VALUES (
            NEW.id,
            NEW.idStatut,
            NOW(),
            'UPDATE_DATE',
            CONCAT('Ancienne date: ', OLD.dateHeure),
            CONCAT('Nouvelle date: ', NEW.dateHeure)
        );
    END IF;
    
    -- Vérifier les changements de candidat
    IF OLD.idCandidat != NEW.idCandidat THEN
        INSERT INTO HistoriqueEntretien (idEntretien, idStatut, dateChangement, action, ancienneValeur, nouvelleValeur)
        VALUES (
            NEW.id,
            NEW.idStatut,
            NOW(),
            'UPDATE_CANDIDAT',
            CONCAT('Ancien candidat: ', OLD.idCandidat),
            CONCAT('Nouveau candidat: ', NEW.idCandidat)
        );
    END IF;
    
    -- Vérifier les changements de résultat
    IF (OLD.idResultat IS NULL AND NEW.idResultat IS NOT NULL) OR 
       (OLD.idResultat IS NOT NULL AND NEW.idResultat IS NULL) OR
       (OLD.idResultat != NEW.idResultat) THEN
        INSERT INTO HistoriqueEntretien (idEntretien, idStatut, dateChangement, action, ancienneValeur, nouvelleValeur)
        VALUES (
            NEW.id,
            NEW.idStatut,
            NOW(),
            'UPDATE_RESULTAT',
            CONCAT('Ancien résultat: ', IFNULL(OLD.idResultat, 'NULL')),
            CONCAT('Nouveau résultat: ', IFNULL(NEW.idResultat, 'NULL'))
        );
    END IF;
END$$
DELIMITER ;

-- =========================
-- TRIGGER DELETE - Suppression d'un entretien
-- =========================
DELIMITER $$
CREATE TRIGGER tr_entretien_delete
    BEFORE DELETE ON Entretien
    FOR EACH ROW
BEGIN
    -- Enregistrer la suppression de l'entretien
    INSERT INTO HistoriqueEntretien (idEntretien, idStatut, dateChangement, action, ancienneValeur, nouvelleValeur)
    VALUES (
        OLD.id,
        OLD.idStatut,
        NOW(),
        'DELETE',
        CONCAT('Entretien supprimé - Candidat: ', OLD.idCandidat, ', Date: ', OLD.dateHeure, ', Statut: ', OLD.idStatut),
        NULL
    );
END$$
DELIMITER ;

-- =========================
-- MODIFICATION DE LA TABLE HistoriqueEntretien
-- =========================
-- Ajouter les colonnes nécessaires pour un historique détaillé
ALTER TABLE HistoriqueEntretien 
ADD COLUMN IF NOT EXISTS action VARCHAR(50) AFTER idStatut,
ADD COLUMN IF NOT EXISTS ancienneValeur TEXT AFTER action,
ADD COLUMN IF NOT EXISTS nouvelleValeur TEXT AFTER ancienneValeur;

-- =========================
-- VERIFICATION DES TRIGGERS
-- =========================
-- Afficher les triggers créés
SHOW TRIGGERS LIKE 'Entretien';

-- Message de confirmation
SELECT 'TRIGGERS CRÉÉS AVEC SUCCÈS' as Status,
       'tr_entretien_insert, tr_entretien_update, tr_entretien_delete' as Triggers_Créés;
