const ParametrePaieService = require('../services/parametrePaieService');

class ParametrePaieController {
  static async getAll(req, res) {
    try {
      const actifsOnly = req.query.actifs === 'true';
      const data = await ParametrePaieService.getAll({ actifsOnly });
      res.json({ success: true, data });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }

  static async getById(req, res) {
    try {
      const data = await ParametrePaieService.getById(req.params.id);
      res.json({ success: true, data });
    } catch (e) {
      res.status(404).json({ success: false, message: e.message });
    }
  }

  static async create(req, res) {
    try {
      const data = await ParametrePaieService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (e) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  static async update(req, res) {
    try {
      const data = await ParametrePaieService.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (e) {
      res.status(400).json({ success: false, message: e.message });
    }
  }

  static async toggleActif(req, res) {
    try {
      const { actif } = req.body;
      const data = await ParametrePaieService.toggleActif(req.params.id, actif);
      res.json({ success: true, data });
    } catch (e) {
      res.status(400).json({ success: false, message: e.message });
    }
  }
}

module.exports = ParametrePaieController;
