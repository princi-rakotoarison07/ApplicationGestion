const { pool} = require('../config/database');

class CritereService {
    static async getAllCriteres() {
        const [rows] = await pool.execute('SELECT * FROM Critere');
        return rows;
    }

    static async getCritereById(id) {
        const [rows] = await pool.execute('SELECT * FROM Critere WHERE id = ?', [id]);
        return rows[0];
    }

    static async createCritere(nom) {
        const [result] = await pool.execute('INSERT INTO Critere (nom) VALUES (?)', [nom]);
        return { id: result.insertId, nom };
    }

    static async updateCritere(id, nom) {
        await pool.execute('UPDATE Critere SET nom = ? WHERE id = ?', [nom, id]);
        return { id, nom };
    }

    static async deleteCritere(id) {
        await pool.execute('DELETE FROM Critere WHERE id = ?', [id]);
        return { message: 'Critère supprimé avec succès' };
    }
}

module.exports = CritereService;