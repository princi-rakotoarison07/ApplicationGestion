const ProfilService = require('../services/profilService');

class ProfilController {

    // Récupérer tous les profils
    static async getAll(req, res) {
        try {
            const profils = await ProfilService.getAllProfils();
            res.status(200).json({
                success: true,
                message: "Liste des profils récupérée avec succès",
                data: profils,
                total: profils.length
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

    // Récupérer un profil par ID
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const profil = await ProfilService.getProfilById(id);
            if (!profil) {
                return res.status(404).json({
                    success: false,
                    message: "Profil non trouvé"
                });
            }
            res.status(200).json({
                success: true,
                message: "Profil récupéré avec succès",
                data: profil
            });
        }
        catch (error) {
            console.error('Erreur lors de la récupération du profil:', error);
            res.status(500).json({
                success: false,
                message: "Erreur interne du serveur",
                error: error.message
            });
        }
    }
    // Créer un nouveau profil
    static async create(req, res) {
        try {
            const { nom } = req.body;

            // Validation basique
            if (!nom || nom.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: "Le nom du profil est requis"
                });
            }

            const newProfil = await ProfilService.createProfil(nom.trim());
            res.status(201).json({
                success: true,
                message: "Profil créé avec succès",
                data: newProfil
            });
        } catch (error) {
            console.error('Erreur lors de la création du profil:', error);
            res.status(500).json({
                success: false,
                message: "Erreur interne du serveur",
                error: error.message
            });
        }
    }

    // Mettre à jour un profil
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { nom } = req.body;

            if (!nom || nom.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: "Le nom du profil est requis"
                });
            }

            // Vérifier l'existence du profil
            const existingProfil = await ProfilService.getProfilById(id);
            if (!existingProfil) {
                return res.status(404).json({
                    success: false,
                    message: "Profil non trouvé"
                });
            }

            const updatedProfil = await ProfilService.updateProfil(id, nom.trim());
            res.status(200).json({
                success: true,
                message: "Profil mis à jour avec succès",
                data: updatedProfil
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du profil:', error);
            res.status(500).json({
                success: false,
                message: "Erreur interne du serveur",
                error: error.message
            });
        }
    }

    // Supprimer un profil
    static async delete(req, res) {
        try {
            const { id } = req.params;

            // Vérifier l'existence du profil
            const existingProfil = await ProfilService.getProfilById(id);
            if (!existingProfil) {
                return res.status(404).json({
                    success: false,
                    message: "Profil non trouvé"
                });
            }

            await ProfilService.deleteProfil(id);
            res.status(200).json({
                success: true,
                message: "Profil supprimé avec succès"
            });
        } catch (error) {
            console.error('Erreur lors de la suppression du profil:', error);
            res.status(500).json({
                success: false,
                message: "Erreur interne du serveur",
                error: error.message
            });
        }
    }
}

module.exports = ProfilController;
