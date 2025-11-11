const { pool } = require('../config/database');

class CritereProfilService {
	// Récupérer tous les CritereProfil
	static async getAll() {
		const [rows] = await pool.execute('SELECT * FROM CritereProfil');
		return rows;
	}

	// Récupérer les associations avec détails des profils et critères
	static async getAllWithDetails() {
		const query = `
			SELECT 
				cp.*,
				p.nom as profilNom,
				c.nom as critereNom
			FROM CritereProfil cp
			LEFT JOIN Profil p ON cp.idProfil = p.id
			LEFT JOIN Critere c ON cp.idCritere = c.id
			ORDER BY p.nom, c.nom
		`;
		const [rows] = await pool.execute(query);
		return rows;
	}

	// Récupérer les associations filtrées
	static async getFiltered(filters = {}) {
		let query = `
			SELECT 
				cp.*,
				p.nom as profilNom,
				c.nom as critereNom
			FROM CritereProfil cp
			LEFT JOIN Profil p ON cp.idProfil = p.id
			LEFT JOIN Critere c ON cp.idCritere = c.id
			WHERE 1=1
		`;
		
		const params = [];
		
		if (filters.idProfil) {
			query += ' AND cp.idProfil = ?';
			params.push(filters.idProfil);
		}
		
		if (filters.idCritere) {
			query += ' AND cp.idCritere = ?';
			params.push(filters.idCritere);
		}
		
		if (filters.estObligatoire !== undefined) {
			query += ' AND cp.estObligatoire = ?';
			params.push(filters.estObligatoire);
		}
		
		if (filters.hasValue) {
			query += ' AND (cp.valeurDouble IS NOT NULL OR cp.valeurVarchar IS NOT NULL OR cp.valeurBool IS NOT NULL)';
		}
		
		if (filters.search) {
			query += ' AND (p.nom LIKE ? OR c.nom LIKE ? OR cp.valeurVarchar LIKE ?)';
			const searchTerm = `%${filters.search}%`;
			params.push(searchTerm, searchTerm, searchTerm);
		}
		
		query += ' ORDER BY p.nom, c.nom';
		
		const [rows] = await pool.execute(query, params);
		return rows;
	}

	// Récupérer un CritereProfil par ID
	static async getById(id) {
		const [rows] = await pool.execute('SELECT * FROM CritereProfil WHERE id = ?', [id]);
		return rows[0];
	}

	// Créer un nouveau CritereProfil
	static async create(data) {
		let { idProfil, idCritere, valeurDouble, valeurVarchar, valeurBool, estObligatoire } = data;
		
		// Vérifier si l'association existe déjà
		const [existing] = await pool.execute(
			'SELECT id FROM CritereProfil WHERE idProfil = ? AND idCritere = ?',
			[idProfil, idCritere]
		);
		
		if (existing.length > 0) {
			throw new Error('Cette association profil-critère existe déjà. Utilisez la modification pour la mettre à jour.');
		}
		
		// Gestion des types et valeurs nulles
		// Si valeurDouble est vide, undefined ou 0, on met null
		if (valeurDouble === '' || valeurDouble === undefined || valeurDouble === null || 
		    valeurDouble === 0 || valeurDouble === '0' || Number(valeurDouble) === 0) {
			valeurDouble = null;
		} else {
			valeurDouble = Number(valeurDouble);
		}
		valeurVarchar = valeurVarchar === '' || valeurVarchar === undefined ? null : valeurVarchar;
		if (valeurBool === '' || valeurBool === undefined) valeurBool = null;
		else valeurBool = Boolean(valeurBool);
		if (estObligatoire === '' || estObligatoire === undefined) estObligatoire = true;
		else estObligatoire = Boolean(estObligatoire);
		
		const [result] = await pool.execute(
			'INSERT INTO CritereProfil (idProfil, idCritere, valeurDouble, valeurVarchar, valeurBool, estObligatoire) VALUES (?, ?, ?, ?, ?, ?)',
			[idProfil, idCritere, valeurDouble, valeurVarchar, valeurBool, estObligatoire]
		);
		return { id: result.insertId, idProfil, idCritere, valeurDouble, valeurVarchar, valeurBool, estObligatoire };
	}

	// Mettre à jour un CritereProfil
	static async update(id, data) {
		let { idProfil, idCritere, valeurDouble, valeurVarchar, valeurBool, estObligatoire } = data;
		// Si valeurDouble est vide, undefined ou 0, on met null
		if (valeurDouble === '' || valeurDouble === undefined || valeurDouble === null || 
		    valeurDouble === 0 || valeurDouble === '0' || Number(valeurDouble) === 0) {
			valeurDouble = null;
		} else {
			valeurDouble = Number(valeurDouble);
		}
		valeurVarchar = valeurVarchar === '' || valeurVarchar === undefined ? null : valeurVarchar;
		if (valeurBool === '' || valeurBool === undefined) valeurBool = null;
		else valeurBool = Boolean(valeurBool);
		if (estObligatoire === '' || estObligatoire === undefined) estObligatoire = true;
		else estObligatoire = Boolean(estObligatoire);
		await pool.execute(
			'UPDATE CritereProfil SET idProfil=?, idCritere=?, valeurDouble=?, valeurVarchar=?, valeurBool=?, estObligatoire=? WHERE id=?',
			[idProfil, idCritere, valeurDouble, valeurVarchar, valeurBool, estObligatoire, id]
		);
		return { id, idProfil, idCritere, valeurDouble, valeurVarchar, valeurBool, estObligatoire };
	}

	// Supprimer un CritereProfil
	static async delete(id) {
		await pool.execute('DELETE FROM CritereProfil WHERE id = ?', [id]);
		return { message: 'CritereProfil supprimé avec succès' };
	}

	// Nettoyer les doublons (garder seulement l'ID le plus récent)
	static async cleanupDuplicates() {
		try {
			// Supprimer les doublons en gardant seulement l'ID le plus grand (le plus récent)
			const [result] = await pool.execute(`
				DELETE cp1 FROM CritereProfil cp1
				INNER JOIN CritereProfil cp2 
				WHERE cp1.idProfil = cp2.idProfil 
				  AND cp1.idCritere = cp2.idCritere 
				  AND cp1.id < cp2.id
			`);
			
			return { 
				message: 'Doublons supprimés avec succès', 
				deletedCount: result.affectedRows 
			};
		} catch (error) {
			console.error('Erreur lors du nettoyage des doublons:', error);
			throw error;
		}
	}

	// Obtenir les statistiques des doublons
	static async getDuplicatesStats() {
		try {
			const [rows] = await pool.execute(`
				SELECT idProfil, idCritere, COUNT(*) as count_duplicates
				FROM CritereProfil 
				GROUP BY idProfil, idCritere 
				HAVING COUNT(*) > 1
				ORDER BY count_duplicates DESC
			`);
			
			return rows;
		} catch (error) {
			console.error('Erreur lors de la récupération des statistiques de doublons:', error);
			throw error;
		}
	}

	// Nettoyer les valeurs 0.00 en les convertissant en NULL
	static async fixZeroValues() {
		try {
			const [result] = await pool.execute(`
				UPDATE CritereProfil 
				SET valeurDouble = NULL 
				WHERE valeurDouble = 0.00
			`);
			
			return { 
				message: 'Valeurs 0.00 converties en NULL avec succès', 
				affectedRows: result.affectedRows 
			};
		} catch (error) {
			console.error('Erreur lors de la correction des valeurs 0:', error);
			throw error;
		}
	}
}

module.exports = CritereProfilService;