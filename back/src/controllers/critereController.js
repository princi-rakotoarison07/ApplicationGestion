const CritereService = require('../services/critereService');

class CritereController {

    // Récupérer tous les critères
    static async getAll(req, res) {
        try {
            const criteres = await CritereService.getAllCriteres();
            res.status(200).json({
                success: true,
                message: "Liste des critères récupérée avec succès",
                data: criteres,
                total: criteres.length
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des profils:', error);
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
            const critere = await CritereService.getCritereById(id);
            if (!critere) {
                return res.status(404).json({
                    success: false,
                    message: "Critere non trouve"
                });
            }
            res.status(200).json({
                success: true,
                message: "Critere recupéré avec succes",
                data: critere
            });
        } catch (error) {
            console.error('Erreur lors de la recuperation du critere', error);
            res.status(500).json({
                success: false,
                message: "Erreur interne du serveur",
                error: error.message
            });
        }
    }

    static async create(req, res) {
        try {
            const { nom } = req.body;

            if (!nom || nom.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: "Le nom du critere est requis"
                });
            }

            const newCritere = await CritereService.createCritere(nom.trim());
            res.status(201).json({
                    success: true,
                    message: "Critere cree avec succes",
                    data: newCritere
            });
        } catch (error) {
            console.error('Erreur lors de le creation du critere', error);
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
            const { nom } = req.body;

            if (!nom || nom.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: "Le nom du critere est requis"
                })
            }

            const existingCritere = await CritereService.getCritereById(id);
            if (!existingCritere) {
                return res.status(404).json({
                    success: false,
                    message: "Critere non trouve"
                });
            }

            const updatedCritere = await CritereService.updateCritere(id, nom.trim());
            res.status(200).json({
                success: true,
                message: "Critere mis a jour avec succes",
                data: updatedCritere
            });
        } catch (error) {
            console.error('Erreur lors de la mis a jour du critere: ', error);
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

            const existingCritere = await CritereService.getCritereById(id);
            if (!existingCritere) {
                return res.status(404).json({
                    success: false,
                    message: "Critere non trouve"
                });
            }

            await CritereService.deleteCritere(id);
            res.status(200).json({
                success: true,
                message: "Critere supprime avec succes"
            });
        } catch (error) {
            console.error("Erreur lors de la suppression de critere:", error);
            res.status(500).json({
                success: false,
                message: "Erreur interne du serveur",
                error: error.message
            });
        }
    }
}

module.exports = CritereController; 