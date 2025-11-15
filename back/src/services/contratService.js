const { pool } = require('../config/database');

class ContratService {
  
  // Récupérer tous les contrats avec informations employé
  static async obtenirTousLesContrats() {
    try {
      const [rows] = await pool.execute(
        `SELECT c.id, c.idEmploye, c.dateDebut, c.dateFin, c.nombreMois, c.typeContrat,
                c.salaire, c.poste, c.actif, c.periodeEssaiMois, c.dateFinEssai, 
                c.estRenouvele, c.commentaire,
                e.nom, e.prenom, e.adresse,
                d.nom as nomDepartement,
                CASE 
                  WHEN c.typeContrat = 'CDI' THEN 
                    CASE WHEN c.actif = TRUE THEN 'Actif' ELSE 'Inactif' END
                  WHEN c.dateFin IS NULL THEN 'Actif'
                  WHEN c.dateFin < CURDATE() THEN 'Expiré'
                  WHEN c.dateFin <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'Expire bientôt'
                  ELSE 'Actif'
                END as statut
         FROM Contrat c 
         LEFT JOIN Employe e ON c.idEmploye = e.id
         LEFT JOIN Departement d ON e.idDept = d.id 
         ORDER BY c.dateDebut DESC`
      );
      return rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des contrats:', error);
      throw error;
    }
  }

  // Récupérer un contrat par ID
  static async obtenirContratParId(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT c.id, c.idEmploye, c.dateDebut, c.dateFin, c.nombreMois, c.typeContrat,
                c.salaire, c.poste, c.actif, c.periodeEssaiMois, c.dateFinEssai, 
                c.estRenouvele, c.commentaire,
                e.nom, e.prenom, e.adresse,
                d.nom as nomDepartement,
                CASE 
                  WHEN c.typeContrat = 'CDI' THEN 
                    CASE WHEN c.actif = TRUE THEN 'Actif' ELSE 'Inactif' END
                  WHEN c.dateFin IS NULL THEN 'Actif'
                  WHEN c.dateFin < CURDATE() THEN 'Expiré'
                  WHEN c.dateFin <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'Expire bientôt'
                  ELSE 'Actif'
                END as statut
         FROM Contrat c 
         LEFT JOIN Employe e ON c.idEmploye = e.id
         LEFT JOIN Departement d ON e.idDept = d.id 
         WHERE c.id = ?`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du contrat:', error);
      throw error;
    }
  }

  // Récupérer les contrats d'un employé
  static async obtenirContratsParEmploye(idEmploye) {
    try {
      const [rows] = await pool.execute(
        `SELECT c.id, c.idEmploye, c.dateDebut, c.dateFin, c.nombreMois, c.typeContrat,
                c.salaire, c.poste, c.actif, c.periodeEssaiMois, c.dateFinEssai, 
                c.estRenouvele, c.commentaire,
                CASE 
                  WHEN c.typeContrat = 'CDI' THEN 
                    CASE WHEN c.actif = TRUE THEN 'Actif' ELSE 'Inactif' END
                  WHEN c.dateFin IS NULL THEN 'Actif'
                  WHEN c.dateFin < CURDATE() THEN 'Expiré'
                  WHEN c.dateFin <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'Expire bientôt'
                  ELSE 'Actif'
                END as statut
         FROM Contrat c 
         WHERE c.idEmploye = ?
         ORDER BY c.dateDebut DESC`,
        [idEmploye]
      );
      return rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des contrats de l\'employé:', error);
      throw error;
    }
  }

  // Récupérer un contrat par ID
  static async obtenirContratParId(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT c.id, c.idEmploye, c.dateDebut, c.nombreMois, c.typeContrat,
                e.nom, e.prenom, e.adresse,
                d.nom as nomDepartement,
                DATE_ADD(c.dateDebut, INTERVAL c.nombreMois MONTH) as dateFin,
                CASE 
                  WHEN DATE_ADD(c.dateDebut, INTERVAL c.nombreMois MONTH) < CURDATE() THEN 'Expiré'
                  WHEN DATE_ADD(c.dateDebut, INTERVAL c.nombreMois MONTH) <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'Expire bientôt'
                  ELSE 'Actif'
                END as statut
         FROM Contrat c 
         LEFT JOIN Employe e ON c.idEmploye = e.id
         LEFT JOIN Departement d ON e.idDept = d.id 
         WHERE c.id = ?`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du contrat:', error);
      throw error;
    }
  }

  // Déterminer la période d'essai selon la catégorie (règles Madagascar)
  static determinerPeriodeEssai(categoriePersonnel) {
    const periodes = {
      'Ouvrier': 1,      // 1 mois
      'Employé': 1,      // 1 mois  
      'TAM': 2,          // 2 mois
      'Cadre': 3,        // 3 mois
      'Dirigeant': 6     // 6 mois
    };
    return periodes[categoriePersonnel] || 1; // Par défaut 1 mois
  }

  // Appliquer les règles de gestion selon le type de contrat
  static appliquerReglesContrat(contratData) {
    const { typeContrat, dateDebut, nombreMois, periodeEssaiMois, categoriePersonnel } = contratData;
    let dateFin = null;
    let nombreMoisFinal = null;
    let dateFinEssai = null;
    let periodeEssaiMoisFinal = null;
    
    // Déterminer la période d'essai selon la catégorie si non spécifiée
    if (!periodeEssaiMois || periodeEssaiMois === '' || periodeEssaiMois === '0') {
      periodeEssaiMoisFinal = this.determinerPeriodeEssai(categoriePersonnel || 'Employé');
    } else {
      periodeEssaiMoisFinal = parseInt(periodeEssaiMois);
    }
    
    // Calculer la date de fin d'essai
    if (periodeEssaiMoisFinal && periodeEssaiMoisFinal > 0) {
      const dateDebutEssai = new Date(dateDebut);
      dateDebutEssai.setMonth(dateDebutEssai.getMonth() + periodeEssaiMoisFinal);
      dateFinEssai = dateDebutEssai.toISOString().split('T')[0];
    }
    
    switch (typeContrat) {
      case 'CDI':
        // CDI : dateFin = NULL, nombreMois = NULL
        dateFin = null;
        nombreMoisFinal = null;
        break;
        
      case 'CDD':
        // CDD : dateFin obligatoire, nombreMois calculé automatiquement
        if (nombreMois && nombreMois !== '' && nombreMois !== '0') {
          const dateDebutObj = new Date(dateDebut);
          dateDebutObj.setMonth(dateDebutObj.getMonth() + parseInt(nombreMois));
          dateFin = dateDebutObj.toISOString().split('T')[0];
          nombreMoisFinal = parseInt(nombreMois);
        }
        break;
        
      case 'Stage':
        // Stage : durée limitée (généralement 6 mois max)
        if (nombreMois && nombreMois !== '' && nombreMois !== '0') {
          const nombreMoisInt = parseInt(nombreMois);
          if (nombreMoisInt > 6) {
            throw new Error('La durée d\'un stage ne peut pas dépasser 6 mois');
          }
          const dateDebutStage = new Date(dateDebut);
          dateDebutStage.setMonth(dateDebutStage.getMonth() + nombreMoisInt);
          dateFin = dateDebutStage.toISOString().split('T')[0];
          nombreMoisFinal = nombreMoisInt;
        }
        break;
        
      case 'Intérim':
        // Intérim : CDD de courte durée (18 mois max)
        if (nombreMois && nombreMois !== '' && nombreMois !== '0') {
          const nombreMoisInt = parseInt(nombreMois);
          if (nombreMoisInt > 18) {
            throw new Error('La durée d\'un contrat intérim ne peut pas dépasser 18 mois');
          }
          const dateDebutInterim = new Date(dateDebut);
          dateDebutInterim.setMonth(dateDebutInterim.getMonth() + nombreMoisInt);
          dateFin = dateDebutInterim.toISOString().split('T')[0];
          nombreMoisFinal = nombreMoisInt;
        }
        break;
        
      case 'Apprentissage':
        // Apprentissage : dateFin obligatoire, durée selon formation
        if (nombreMois && nombreMois !== '' && nombreMois !== '0') {
          const dateDebutApprentissage = new Date(dateDebut);
          dateDebutApprentissage.setMonth(dateDebutApprentissage.getMonth() + parseInt(nombreMois));
          dateFin = dateDebutApprentissage.toISOString().split('T')[0];
          nombreMoisFinal = parseInt(nombreMois);
        }
        break;
        
      default:
        // Par défaut, traiter comme un CDD
        if (nombreMois && nombreMois !== '' && nombreMois !== '0') {
          const dateDebutDefault = new Date(dateDebut);
          dateDebutDefault.setMonth(dateDebutDefault.getMonth() + parseInt(nombreMois));
          dateFin = dateDebutDefault.toISOString().split('T')[0];
          nombreMoisFinal = parseInt(nombreMois);
        }
    }
    
    return { dateFin, nombreMois: nombreMoisFinal, dateFinEssai, periodeEssaiMois: periodeEssaiMoisFinal };
  }

  // Créer un nouveau contrat
  static async creerContrat(contratData) {
    try {
      const { idEmploye, dateDebut, nombreMois, typeContrat, salaire, poste, periodeEssaiMois, commentaire } = contratData;
      
      // Appliquer les règles de gestion
      const { dateFin, nombreMois: nombreMoisFinal, dateFinEssai, periodeEssaiMois: periodeEssaiMoisFinal } = this.appliquerReglesContrat(contratData);
      
      const [result] = await pool.execute(
        'INSERT INTO Contrat (idEmploye, typeContrat, dateDebut, dateFin, nombreMois, salaire, poste, actif, periodeEssaiMois, dateFinEssai, estRenouvele, commentaire) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          idEmploye, 
          typeContrat, 
          dateDebut, 
          dateFin, 
          nombreMoisFinal, 
          salaire || null, 
          poste || null, 
          true, 
          periodeEssaiMoisFinal, 
          dateFinEssai, 
          false, 
          commentaire || null
        ]
      );
      
      return await this.obtenirContratParId(result.insertId);
    } catch (error) {
      console.error('Erreur lors de la création du contrat:', error);
      throw error;
    }
  }

  // Mettre à jour un contrat
  static async mettreAJourContrat(id, contratData) {
    try {
      const { idEmploye, dateDebut, nombreMois, typeContrat, salaire, poste, periodeEssaiMois, commentaire } = contratData;
      
      // Appliquer les règles de gestion
      const { dateFin, nombreMois: nombreMoisFinal, dateFinEssai, periodeEssaiMois: periodeEssaiMoisFinal } = this.appliquerReglesContrat(contratData);
      
      const [result] = await pool.execute(
        'UPDATE Contrat SET idEmploye = ?, typeContrat = ?, dateDebut = ?, dateFin = ?, nombreMois = ?, salaire = ?, poste = ?, periodeEssaiMois = ?, dateFinEssai = ?, commentaire = ? WHERE id = ?',
        [
          idEmploye, 
          typeContrat, 
          dateDebut, 
          dateFin, 
          nombreMoisFinal, 
          salaire || null, 
          poste || null, 
          periodeEssaiMoisFinal, 
          dateFinEssai, 
          commentaire || null, 
          id
        ]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return await this.obtenirContratParId(id);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du contrat:', error);
      throw error;
    }
  }

  // Méthode pour renouveler un contrat
  static async renouvellerContrat(id, nouvellesDonnees) {
    try {
      // Récupérer le contrat existant
      const contratExistant = await this.obtenirContratParId(id);
      if (!contratExistant) {
        throw new Error('Contrat non trouvé');
      }

      // Vérifier les règles de renouvellement
      if (contratExistant.typeContrat === 'CDD') {
        // Compter le nombre de renouvellements existants pour cet employé
        const [renewalCount] = await pool.execute(
          'SELECT COUNT(*) as count FROM Contrat WHERE idEmploye = ? AND estRenouvele = TRUE AND typeContrat = "CDD"',
          [contratExistant.idEmploye]
        );
        
        if (renewalCount[0].count >= 2) {
          throw new Error('Un contrat CDD ne peut être renouvelé que 2 fois maximum');
        }
      }

      if (contratExistant.typeContrat === 'CDI') {
        throw new Error('Un contrat CDI ne peut pas être renouvelé. Créez un nouveau contrat ou un avenant.');
      }

      // Appliquer les règles de gestion pour le renouvellement
      const { dateFin, nombreMois: nombreMoisFinal, dateFinEssai, periodeEssaiMois: periodeEssaiMoisFinal } = this.appliquerReglesContrat(nouvellesDonnees);

      const [result] = await pool.execute(
        `UPDATE Contrat SET 
         dateDebut = ?, dateFin = ?, nombreMois = ?, typeContrat = ?, 
         salaire = ?, poste = ?, periodeEssaiMois = ?, dateFinEssai = ?, 
         estRenouvele = ?, commentaire = ?
         WHERE id = ?`,
        [
          nouvellesDonnees.dateDebut,
          dateFin,
          nombreMoisFinal,
          nouvellesDonnees.typeContrat,
          nouvellesDonnees.salaire || null,
          nouvellesDonnees.poste || null,
          periodeEssaiMoisFinal,
          dateFinEssai,
          true,
          nouvellesDonnees.commentaire || null,
          id
        ]
      );

      return await this.obtenirContratParId(id);
    } catch (error) {
      console.error('Erreur lors du renouvellement du contrat:', error);
      throw error;
    }
  }

  // Supprimer un contrat
  static async supprimerContrat(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM Contrat WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erreur lors de la suppression du contrat:', error);
      throw error;
    }
  }

  // Renouveler un contrat (créer un nouveau contrat basé sur l'ancien)
  static async renouvellerContrat(id, nouvellesDonnees) {
    try {
      const contratActuel = await this.obtenirContratParId(id);
      if (!contratActuel) {
        throw new Error('Contrat non trouvé');
      }

      const { nombreMois, typeContrat, dateDebut } = nouvellesDonnees;
      
      const nouveauContrat = {
        idEmploye: contratActuel.idEmploye,
        dateDebut: dateDebut || contratActuel.dateFin, // Commence à la fin de l'ancien contrat
        nombreMois: nombreMois || contratActuel.nombreMois,
        typeContrat: typeContrat || contratActuel.typeContrat
      };
      
      return await this.creerContrat(nouveauContrat);
    } catch (error) {
      console.error('Erreur lors du renouvellement du contrat:', error);
      throw error;
    }
  }

  // Obtenir les statistiques des contrats
  static async obtenirStatistiquesContrats() {
    try {
      const [stats] = await pool.execute(
        `SELECT 
          COUNT(*) as totalContrats,
          SUM(CASE 
            WHEN typeContrat = 'CDI' AND actif = TRUE THEN 1
            WHEN dateFin IS NULL AND actif = TRUE THEN 1
            WHEN dateFin >= CURDATE() AND actif = TRUE THEN 1
            ELSE 0 
          END) as contratsActifs,
          SUM(CASE 
            WHEN typeContrat != 'CDI' AND dateFin < CURDATE() THEN 1
            WHEN actif = FALSE THEN 1
            ELSE 0 
          END) as contratsExpires,
          SUM(CASE 
            WHEN typeContrat != 'CDI' AND dateFin <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) 
                 AND dateFin >= CURDATE() AND actif = TRUE THEN 1 
            ELSE 0 
          END) as contratsExpirentBientot,
          SUM(CASE WHEN typeContrat = 'CDI' THEN 1 ELSE 0 END) as cdi,
          SUM(CASE WHEN typeContrat = 'CDD' THEN 1 ELSE 0 END) as cdd,
          SUM(CASE WHEN typeContrat = 'Stage' THEN 1 ELSE 0 END) as stage,
          SUM(CASE WHEN typeContrat = 'Intérim' THEN 1 ELSE 0 END) as interim,
          SUM(CASE WHEN typeContrat = 'Apprentissage' THEN 1 ELSE 0 END) as apprentissage
         FROM Contrat`
      );
      return stats[0];
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
}

module.exports = ContratService;
