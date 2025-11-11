-- ============================================
-- SCRIPT DE CORRECTION DES NOTIFICATIONS
-- ============================================
-- Corrige les notifications avec idDestinataire NULL

-- 1. Afficher les notifications problématiques
SELECT 
    n.id,
    n.titre,
    n.idDestinataire,
    n.idAnnonce,
    n.idQcmTest,
    n.dateCreation,
    iq.idCandidat,
    c.idCompteCandidat
FROM Notification n
LEFT JOIN InvitationQCM iq ON n.idQcmTest = iq.idQcmTest AND n.idAnnonce = iq.idAnnonce
LEFT JOIN Candidat c ON iq.idCandidat = c.id
WHERE n.idDestinataire IS NULL;

-- 2. Corriger les notifications NULL en utilisant les données d'InvitationQCM
UPDATE Notification n
JOIN InvitationQCM iq ON n.idQcmTest = iq.idQcmTest AND n.idAnnonce = iq.idAnnonce
JOIN Candidat c ON iq.idCandidat = c.id
SET n.idDestinataire = c.idCompteCandidat
WHERE n.idDestinataire IS NULL 
  AND c.idCompteCandidat IS NOT NULL;

-- 3. Pour les notifications qui ne peuvent pas être corrigées automatiquement,
-- les assigner au compte candidat ID 1 (ou 2) par défaut
UPDATE Notification 
SET idDestinataire = 1 
WHERE idDestinataire IS NULL;

-- 4. Vérifier le résultat
SELECT 
    n.id,
    n.titre,
    n.idDestinataire,
    n.idAnnonce,
    n.idQcmTest,
    n.dateCreation
FROM Notification n
ORDER BY n.dateCreation DESC;

-- 5. Statistiques des notifications par destinataire
SELECT 
    idDestinataire,
    COUNT(*) as nombre_notifications,
    SUM(CASE WHEN lue = 1 THEN 1 ELSE 0 END) as lues,
    SUM(CASE WHEN lue = 0 THEN 1 ELSE 0 END) as non_lues
FROM Notification
GROUP BY idDestinataire
ORDER BY idDestinataire;
