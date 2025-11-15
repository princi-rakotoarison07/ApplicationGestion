const { pool } = require('../config/database');

class ParametrePaieService {
  static async getAll({ actifsOnly } = {}) {
    const sql = actifsOnly
      ? `SELECT * FROM ParametrePaie WHERE actif = TRUE ORDER BY dateDebut DESC, code`
      : `SELECT * FROM ParametrePaie ORDER BY actif DESC, dateDebut DESC, code`;
    const [rows] = await pool.execute(sql);
    return rows;
  }

  static async create(data) {
    const {
      code,
      libelle,
      type,
      valeur = null,
      tauxEmployeur = null,
      tauxEmploye = null,
      plafond = null,
      plancher = null,
      dateDebut,
      dateFin = null,
      actif = true,
      description = null,
    } = data;

    if (!code || !libelle || !type || !dateDebut) {
      throw new Error('Champs obligatoires manquants (code, libelle, type, dateDebut)');
    }

    const [result] = await pool.execute(
      `INSERT INTO ParametrePaie
       (code, libelle, type, valeur, tauxEmployeur, tauxEmploye, plafond, plancher, dateDebut, dateFin, actif, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, libelle, type, valeur, tauxEmployeur, tauxEmploye, plafond, plancher, dateDebut, dateFin, !!actif, description]
    );

    const [rows] = await pool.execute('SELECT * FROM ParametrePaie WHERE id = ?', [result.insertId]);
    return rows[0];
  }

  static async update(id, data) {
    const fields = [
      'code','libelle','type','valeur','tauxEmployeur','tauxEmploye','plafond','plancher','dateDebut','dateFin','actif','description'
    ];
    const setParts = [];
    const values = [];

    fields.forEach(f => {
      if (Object.prototype.hasOwnProperty.call(data, f)) {
        setParts.push(`${f} = ?`);
        values.push(data[f]);
      }
    });

    if (setParts.length === 0) return this.getById(id);

    values.push(id);
    await pool.execute(`UPDATE ParametrePaie SET ${setParts.join(', ')} WHERE id = ?`, values);
    return this.getById(id);
  }

  static async toggleActif(id, actif) {
    await pool.execute('UPDATE ParametrePaie SET actif = ? WHERE id = ?', [!!actif, id]);
    return this.getById(id);
  }

  static async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM ParametrePaie WHERE id = ?', [id]);
    if (!rows.length) throw new Error('Paramètre introuvable');
    return rows[0];
  }
}

module.exports = ParametrePaieService;
