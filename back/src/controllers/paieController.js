const PaieService = require('../services/paieService');

class PaieController {
  static async calculerFichePaie(req, res) {
    try {
      const { id } = req.params;
      const { periode } = req.query; // format attendu YYYY-MM (optionnel)

      const result = await PaieService.calculerFichePaie(id, periode);

      res.status(200).json({
        success: true,
        message: 'Fiche de paie calculée avec succès',
        data: result,
      });
    } catch (error) {
      console.error('Erreur calcul fiche de paie:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erreur interne du serveur',
      });
    }
  }
}

module.exports = PaieController;
