const CritereProfilService = require('../services/critereProfilService');

class CritereProfilController {

        static async getAll(req, res) {
                try {
                        const associations = await CritereProfilService.getAll();
                        res.status(200).json({
                                success: true,
                                message: "Liste des associations Critere-Profil récupérée avec succès",
                                data: associations,
                                total: associations.length
                        });
                } catch (error) {
                        res.status(500).json({
                                success: false,
                                message: "Erreur interne du serveur",
                                error: error.message
                        });
                }
        }

        static async getAllWithDetails(req, res) {
                try {
                        const associations = await CritereProfilService.getAllWithDetails();
                        res.status(200).json({
                                success: true,
                                message: "Liste détaillée des associations Critere-Profil récupérée avec succès",
                                data: associations,
                                total: associations.length
                        });
                } catch (error) {
                        res.status(500).json({
                                success: false,
                                message: "Erreur interne du serveur",
                                error: error.message
                        });
                }
        }

        static async getFiltered(req, res) {
                try {
                        const filters = {
                                idProfil: req.query.idProfil,
                                idCritere: req.query.idCritere,
                                estObligatoire: req.query.estObligatoire === 'true' ? true : req.query.estObligatoire === 'false' ? false : undefined,
                                hasValue: req.query.hasValue === 'true',
                                search: req.query.search
                        };
                        
                        const associations = await CritereProfilService.getFiltered(filters);
                        res.status(200).json({
                                success: true,
                                message: "Associations filtrées récupérées avec succès",
                                data: associations,
                                total: associations.length,
                                filters: filters
                        });
                } catch (error) {
                        res.status(500).json({
                                success: false,
                                message: "Erreur interne du serveur",
                                error: error.message
                        });
                }
        }

        static async getById(req, res) {
                try {
                        const { id } = req.params;
                        const association = await CritereProfilService.getById(id);
                        if (!association) {
                                return res.status(404).json({
                                        success: false,
                                        message: "Association non trouvée"
                                });
                        }
                        res.status(200).json({
                                success: true,
                                message: "Association récupérée avec succès",
                                data: association
                        });
                } catch (error) {
                        res.status(500).json({
                                success: false,
                                message: "Erreur interne du serveur",
                                error: error.message
                        });
                }
        }

        static async create(req, res) {
                try {
                        const { idProfil, idCritere, valeurDouble, valeurVarchar, valeurBool, estObligatoire } = req.body;
                        if (!idProfil || !idCritere) {
                                return res.status(400).json({
                                        success: false,
                                        message: "idProfil et idCritere sont requis"
                                });
                        }
                        const newAssociation = await CritereProfilService.create({
                                idProfil,
                                idCritere,
                                valeurDouble,
                                valeurVarchar,
                                valeurBool,
                                estObligatoire
                        });
                        res.status(201).json({
                                success: true,
                                message: "Association créée avec succès",
                                data: newAssociation
                        });
                } catch (error) {
                        res.status(500).json({
                                success: false,
                                message: "Erreur interne du serveur",
                                error: error.message
                        });
                }
        }

        static async update(req, res) {
                try {
                        const { id } = req.params;
                        const { idProfil, idCritere, valeurDouble, valeurVarchar, valeurBool, estObligatoire } = req.body;
                        if (!idProfil || !idCritere) {
                                return res.status(400).json({
                                        success: false,
                                        message: "idProfil et idCritere sont requis"
                                });
                        }
                        const updated = await CritereProfilService.update(id, {
                                idProfil,
                                idCritere,
                                valeurDouble,
                                valeurVarchar,
                                valeurBool,
                                estObligatoire
                        });
                        res.status(200).json({
                                success: true,
                                message: "Association mise à jour avec succès",
                                data: updated
                        });
                } catch (error) {
                        res.status(500).json({
                                success: false,
                                message: "Erreur interne du serveur",
                                error: error.message
                        });
                }
        }

        static async delete(req, res) {
                try {
                        const { id } = req.params;
                        await CritereProfilService.delete(id);
                        res.status(200).json({
                                success: true,
                                message: "Association supprimée avec succès"
                        });
                } catch (error) {
                        res.status(500).json({
                                success: false,
                                message: "Erreur interne du serveur",
                                error: error.message
                        });
                }
        }

        // Nettoyer les doublons
        static async cleanupDuplicates(req, res) {
                try {
                        const result = await CritereProfilService.cleanupDuplicates();
                        res.status(200).json({
                                success: true,
                                message: result.message,
                                deletedCount: result.deletedCount
                        });
                } catch (error) {
                        res.status(500).json({
                                success: false,
                                message: "Erreur lors du nettoyage des doublons",
                                error: error.message
                        });
                }
        }

        // Obtenir les statistiques des doublons
        static async getDuplicatesStats(req, res) {
                try {
                        const duplicates = await CritereProfilService.getDuplicatesStats();
                        res.status(200).json({
                                success: true,
                                message: "Statistiques des doublons récupérées avec succès",
                                data: duplicates,
                                total: duplicates.length
                        });
                } catch (error) {
                        res.status(500).json({
                                success: false,
                                message: "Erreur lors de la récupération des statistiques",
                                error: error.message
                        });
                }
        }

        // Corriger les valeurs 0.00 en NULL
        static async fixZeroValues(req, res) {
                try {
                        const result = await CritereProfilService.fixZeroValues();
                        res.status(200).json({
                                success: true,
                                message: result.message,
                                affectedRows: result.affectedRows
                        });
                } catch (error) {
                        res.status(500).json({
                                success: false,
                                message: "Erreur lors de la correction des valeurs 0",
                                error: error.message
                        });
                }
        }
}

module.exports = CritereProfilController;