const { pool } = require('../config/database');

class PaieService {
  static async calculerFichePaie(employeId, periode) {
    // periode attendu format YYYY-MM (facultatif)
    // 1) Récupérer contrat actif de l'employé
    const [contrats] = await pool.execute(
      `SELECT * FROM Contrat 
       WHERE idEmploye = ? AND actif = TRUE 
       ORDER BY id DESC LIMIT 1`,
      [employeId]
    );

    if (!contrats || contrats.length === 0) {
      throw new Error("Aucun contrat actif pour cet employé");
    }

    const contrat = contrats[0];
    const salaireBase = Number(contrat.salaire || 0);

    // 1.b Déterminer période (mois début/fin) pour agrégations
    let startDate = null;
    let endDate = null;
    if (periode && /^(\d{4})-(\d{2})$/.test(periode)) {
      const [y, m] = periode.split('-').map(Number);
      startDate = new Date(y, m - 1, 1);
      endDate = new Date(y, m, 0); // dernier jour du mois
    }

    // 2) Charger les éléments salariaux par défaut
    // Hypothèse: ElementSalaire contient des lignes avec type: Prime, Indemnité, Retenue, Cotisation
    // - Prime/Indemnité: ajout au brut (valeurDefaut fixe ou pourcentage du salaire)
    // - Retenue/Cotisation: retenue sur le brut (tauxDefaut %) ou valeurDefaut fixe
    const [elements] = await pool.execute(`SELECT * FROM ElementSalaire WHERE actif = TRUE`);

    let totalPrimesIndemnites = 0;
    let totalRetenues = 0;

    const lignes = [];

    for (const el of elements) {
      const type = (el.type || '').toLowerCase();
      const nature = (el.natureCalcul || '').toLowerCase();
      let montant = 0;

      if (nature === 'pourcentage' && el.tauxDefaut != null) {
        montant = (Number(el.tauxDefaut) / 100) * salaireBase;
      } else if (nature === 'fixe' && el.valeurDefaut != null) {
        montant = Number(el.valeurDefaut);
      } else if (nature === 'variable') {
        // Sans paramétrage individuel, ignorer pour le calcul automatique
        montant = 0;
      }

      if (['prime', 'indemnité', 'indemnite'].includes(type)) {
        totalPrimesIndemnites += montant;
        if (montant !== 0) {
          lignes.push({ code: el.code, libelle: el.libelle, sens: 'gain', montant });
        }
      } else if (['retenue', 'cotisation'].includes(type)) {
        totalRetenues += montant;
        if (montant !== 0) {
          lignes.push({ code: el.code, libelle: el.libelle, sens: 'retenue', montant });
        }
      }
    }

    // 3) Absences (Presence)
    // Règle: retenue pour absence = (salaireBase / joursBaseMensuel) * nbJoursAbsence
    // joursBaseMensuel peut être paramétré via ParametrePaie (code: JOURS_BASE_MENSUEL), sinon 26
    let joursBaseMensuel = 26;
    try {
      const [param] = await pool.execute(
        `SELECT valeur FROM ParametrePaie WHERE code = 'JOURS_BASE_MENSUEL' AND actif = TRUE 
         ORDER BY dateDebut DESC LIMIT 1`
      );
      if (param && param.length && param[0].valeur) {
        joursBaseMensuel = Number(param[0].valeur) || 26;
      }
    } catch {}

    let joursAbsence = 0;
    let retenueAbsences = 0;
    let totalAvances = 0;

    if (startDate && endDate) {
      const startStr = startDate.toISOString().slice(0, 10);
      const endStr = endDate.toISOString().slice(0, 10);
      const [presenceAgg] = await pool.execute(
        `SELECT 
           SUM(CASE WHEN estAbsent = TRUE THEN 1 ELSE 0 END) AS joursAbsence,
           SUM(heuresSupplementaires) AS heuresSupp
         FROM Presence
         WHERE idEmploye = ? AND datePresence BETWEEN ? AND ?`,
        [employeId, startStr, endStr]
      );
      joursAbsence = Number(presenceAgg?.[0]?.joursAbsence || 0);
      if (joursAbsence > 0 && salaireBase > 0) {
        const dailyRate = salaireBase / (joursBaseMensuel || 26);
        retenueAbsences = dailyRate * joursAbsence;
        totalRetenues += retenueAbsences;
        lignes.push({ code: 'ABSENCE', libelle: `Retenue absences (${joursAbsence} j)`, sens: 'retenue', montant: retenueAbsences });
      }
      // Heures supp: non intégrées par défaut faute de paramétrage, peuvent être mappées à un ElementSalaire variable
    }

    // 4) Avances sur salaire (Avance)
    if (startDate && endDate) {
      const startStr = startDate.toISOString().slice(0, 10);
      const endStr = endDate.toISOString().slice(0, 10);
      const [avances] = await pool.execute(
        `SELECT SUM(montant) AS totalAvances
         FROM Avance 
         WHERE idEmploye = ? 
           AND dateAvance BETWEEN ? AND ?
           AND (estRembourse = FALSE OR estRembourse IS NULL)`,
        [employeId, startStr, endStr]
      );
      totalAvances = Number(avances?.[0]?.totalAvances || 0);
      if (totalAvances > 0) {
        totalRetenues += totalAvances;
        lignes.push({ code: 'AVANCE', libelle: 'Avances sur salaire', sens: 'retenue', montant: totalAvances });
      }
    }

    const salaireBrut = salaireBase + totalPrimesIndemnites;
    const netAPayer = salaireBrut - totalRetenues;

    return {
      success: true,
      periode: periode || null,
      employeId,
      contratId: contrat.id,
      salaireBase,
      primesIndemnites: totalPrimesIndemnites,
      retenues: totalRetenues,
      salaireBrut,
      netAPayer,
      lignes,
      // meta pour affichage détaillé côté front
      details: {
        absences: {
          jours: joursAbsence,
          joursBaseMensuel,
          dailyRate: joursBaseMensuel ? (salaireBase / joursBaseMensuel) : 0,
          retenue: retenueAbsences,
        },
        avances: {
          total: totalAvances,
        }
      }
    };
  }
}

module.exports = PaieService;
