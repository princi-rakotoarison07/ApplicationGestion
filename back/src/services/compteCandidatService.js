const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class CompteCandidatService {
  // Créer un nouveau compte candidat
  static async creerCompte(email, motDePasse) {
    try {
      // Vérifier si l'email existe déjà
      const existant = await this.obtenirParEmail(email);
      if (existant) {
        throw new Error('Un compte avec cet email existe déjà');
      }

      // Hasher le mot de passe
      const saltRounds = 10;
      const motDePasseHash = await bcrypt.hash(motDePasse, saltRounds);

      const query = `
        INSERT INTO CompteCandidat (email, motDePasse)
        VALUES (?, ?)
      `;
      
      const [result] = await pool.execute(query, [email, motDePasseHash]);
      
      return {
        id: result.insertId,
        email: email
      };
    } catch (error) {
      throw error;
    }
  }

  // Authentifier un candidat
  static async authentifier(email, motDePasse) {
    try {
      const compte = await this.obtenirParEmail(email);
      if (!compte) {
        throw new Error('Email ou mot de passe incorrect');
      }

      const motDePasseValide = await bcrypt.compare(motDePasse, compte.motDePasse);
      if (!motDePasseValide) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Générer un token JWT
      const token = jwt.sign(
        { id: compte.id, email: compte.email },
        process.env.JWT_SECRET || 'votre_secret_jwt',
        { expiresIn: '24h' }
      );

      return {
        token,
        candidat: {
          id: compte.id,
          email: compte.email
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtenir un compte par email
  static async obtenirParEmail(email) {
    try {
      const query = `
        SELECT id, email, motDePasse
        FROM CompteCandidat
        WHERE email = ?
      `;
      
      const [rows] = await pool.execute(query, [email]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Obtenir un compte par ID
  static async obtenirParId(id) {
    try {
      const query = `
        SELECT id, email
        FROM CompteCandidat
        WHERE id = ?
      `;
      
      const [rows] = await pool.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Mettre à jour le mot de passe
  static async mettreAJourMotDePasse(id, nouveauMotDePasse) {
    try {
      const saltRounds = 10;
      const motDePasseHash = await bcrypt.hash(nouveauMotDePasse, saltRounds);

      const query = `
        UPDATE CompteCandidat
        SET motDePasse = ?
        WHERE id = ?
      `;
      
      const [result] = await pool.execute(query, [motDePasseHash, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Supprimer un compte
  static async supprimerCompte(id) {
    try {
      const query = `
        DELETE FROM CompteCandidat
        WHERE id = ?
      `;
      
      const [result] = await pool.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Vérifier un token JWT
  static verifierToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_jwt');
    } catch (error) {
      throw new Error('Token invalide');
    }
  }

  // Obtenir tous les comptes (pour administration)
  static async obtenirTousLesComptes() {
    try {
      const query = `
        SELECT id, email, DATE_FORMAT(created_at, '%d/%m/%Y %H:%i') as dateCreation
        FROM CompteCandidat
        ORDER BY id DESC
      `;
      
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Statistiques des comptes candidats
  static async obtenirStatistiques() {
    try {
      const query = `
        SELECT 
          COUNT(*) as totalComptes,
          COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as nouveauxAujourdhui,
          COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as nouveauxCetteSemaine,
          COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as nouveauxCeMois
        FROM CompteCandidat
      `;
      
      const [rows] = await pool.execute(query);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Créer un candidat avec ses critères
  static async creerCandidatAvecCriteres(candidatData, criteres) {
    try {
      // Résoudre le statut initial de la candidature
      // Si aucun statut fourni, utiliser "En attente" (fallback: id = 1)
      let statutId = candidatData.idStatut;
      if (!statutId) {
        try {
          const [rows] = await pool.execute(
            "SELECT id FROM StatutCandidat WHERE LOWER(nom) = LOWER(?) LIMIT 1",
            ['En attente']
          );
          if (rows && rows.length > 0) {
            statutId = rows[0].id;
          } else {
            statutId = 1; // fallback si la ligne n'existe pas
          }
        } catch (e) {
          statutId = 1; // fallback en cas d'erreur d'accès
        }
      }

      // Créer le candidat
      const queryCandidatInsert = `
        INSERT INTO Candidat (nom, prenom, dateNaissance, adresse, cv, idAnnonce, idCompteCandidat, idStatut, idLieu)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [resultCandidat] = await pool.execute(queryCandidatInsert, [
        candidatData.nom,
        candidatData.prenom,
        candidatData.dateNaissance,
        candidatData.adresse,
        candidatData.cv,
        candidatData.idAnnonce,
        candidatData.idCompteCandidat,
        statutId,
        candidatData.idLieu ?? null
      ]);

      const idCandidat = resultCandidat.insertId;

      // Historiser le statut initial de la candidature
      try {
        await pool.execute(
          'INSERT INTO HistoriqueCandidature (idCandidat, idStatut) VALUES (?, ?)',
          [idCandidat, statutId]
        );
      } catch (e) {
        console.error('Erreur lors de l\'insertion dans HistoriqueCandidature:', e?.message || e);
      }

      // Insérer les critères si fournis
      if (criteres && criteres.length > 0) {
        for (const critere of criteres) {
          const queryCritereInsert = `
            INSERT INTO CandidatureCritere (idCandidat, idAnnonce, idCritere, valeurVarchar, valeurDouble, valeurBool)
            VALUES (?, ?, ?, ?, ?, ?)
          `;

          // Déterminer le type de valeur
          let valeurVarchar = null;
          let valeurDouble = null;
          let valeurBool = null;

          const valeur = critere.valeur;
          if (valeur === 'true' || valeur === 'false') {
            valeurBool = valeur === 'true';
          } else if (!isNaN(valeur) && valeur !== '') {
            valeurDouble = parseFloat(valeur);
          } else {
            valeurVarchar = valeur;
          }

          await pool.execute(queryCritereInsert, [
            idCandidat,
            candidatData.idAnnonce,
            critere.idCritere,
            valeurVarchar,
            valeurDouble,
            valeurBool
          ]);
        }
      }

      return {
        id: idCandidat,
        ...candidatData,
        idStatut: statutId
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CompteCandidatService;
