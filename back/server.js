require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./src/routes/routes');
const { testConnection } = require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes API
app.use('/api', routes);

// Route par défaut
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "Serveur de gestion d'application démarré avec succès",
    version: "1.0.0",
    endpoints: {
      utilisateurs: "/api/utilisateurs",
      test: "/api/hello"
    }
  });
});

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err.stack);
  res.status(500).json({
    success: false,
    message: "Erreur interne du serveur",
    error: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// Middleware pour les routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route non trouvée",
    path: req.originalUrl
  });
});

app.listen(PORT, async () => {
  console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`);
  console.log(`📋 API disponible sur http://localhost:${PORT}/api`);
  console.log(`👥 Utilisateurs: http://localhost:${PORT}/api/utilisateurs`);
  
  // Test de la connexion à la base de données
  await testConnection();
});
