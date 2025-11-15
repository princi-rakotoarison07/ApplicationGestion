import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Navbar';
import Home from './pages/Home';
import ListeUtilisateurs from './pages/ListeUtilisateurs';
import TestsQCM from './pages/QCM/TestsQCM';
import CreerTestQCM from './pages/QCM/CreerTestQCM';
import RepondreTestQCM from './pages/QCM/RepondreTestQCM';
import AnnoncesPage from './pages/annonce/AnnoncesPage';
import DetailsAnnonce from './pages/annonce/DetailsAnnonce';
import ModifierAnnonce from './pages/annonce/ModifierAnnonce';
import CalendrierEntretiens from './pages/calendrier/CalendrierEntretiens';
import Login from './pages/Login';
import Inscription from './pages/Inscription';
import Profils from './pages/Profils';
import Criteres from './pages/Criteres';
import CritereProfils from './pages/CritereProfils';
import OffresClient from './pages/client/OffresClient';
import FormulaireCandidature from './pages/client/FormulaireCandidature';
import CandidatureConfirmee from './pages/client/CandidatureConfirmee';
import HireHubHome from './pages/client/HireHubHome';
import DetailsAnnonceClient from './pages/client/DetailsAnnonceClient';
import TestQCM from './pages/client/TestQCM';
import ListeCandidats from './pages/Contrat/ListeCandidats';
import CandidatsFormulaire from './pages/Contrat/CandidatsFormulaire';
import ListeContrats from './pages/Contrat/ListeContrats';
import DetailsCandidatContrat from './pages/Contrat/DetailsCandidatContrat';
import Employes from './pages/employe/Employes';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (loginData) => {
    setIsAuthenticated(true);
    setUser(loginData.user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleRegister = () => {
    // Rediriger vers la page de connexion après inscription
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingText}>⏳ Chargement...</div>
      </div>
    );
  }

  return (
    <Router>
      <div style={styles.app}>
        <Routes>
          {/* Routes publiques - toujours sans sidebar */}
          <Route path="/test/:id" element={<RepondreTestQCM />} />
          <Route path="/offres" element={<OffresClient />} />
          <Route path="/candidature/:annonceId" element={<FormulaireCandidature />} />
          <Route path="/candidature-confirmee" element={<CandidatureConfirmee />} />
          
          {/* Routes client HireHub - publiques */}
          <Route path="/HireHub" element={<HireHubHome />} />
          <Route path="/HireHub/annonces" element={<OffresClient />} />
          <Route path="/HireHub/annonces/:id" element={<DetailsAnnonceClient />} />
          <Route path="/HireHub/test/:token" element={<TestQCM />} />
          
          {/* Routes conditionnelles selon l'authentification */}
          <Route path="/*" element={
            isAuthenticated ? (
              <>
                <Sidebar user={user} onLogout={handleLogout} />
                <div style={styles.mainContent}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/utilisateurs" element={<ListeUtilisateurs />} />
                    <Route path="/qcm" element={<TestsQCM />} />
                    <Route path="/qcm/creer" element={<CreerTestQCM />} />
                    <Route path="/profils" element={<Profils />} />
                <Route path="/criteres" element={<Criteres />} />
                <Route path="/critereprofils" element={<CritereProfils />} />
                    <Route path="/annonces" element={<AnnoncesPage />} />
            <Route path="/annonces/:id/details" element={<DetailsAnnonce />} />
            <Route path="/annonces/:id/modifier" element={<ModifierAnnonce />} />
                    <Route path="/calendrier" element={<CalendrierEntretiens />} />
                    <Route path="/login" element={<Navigate to="/" replace />} />
                    <Route path="/inscription" element={<Navigate to="/" replace />} />
                    <Route path="/candidats" element={<ListeCandidats />} />
                    <Route path="/contrats/ajouter/:id" element={<CandidatsFormulaire />} />
                    <Route path="/contrats" element={<ListeContrats />}/>
                    <Route path="/contrats/details/:id" element={<DetailsCandidatContrat />} />
                    <Route path="/employes" element={<Employes />} />
                  </Routes> 
                </div>
              </>
            ) : (
              <Routes>
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/inscription" element={<Inscription onRegister={handleRegister} />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            )
          } />
        </Routes>
      </div>
    </Router>
  );
}

const styles = {
  app: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    backgroundColor: '#f1f5f9',
    minHeight: '100vh'
  },
  mainContent: {
    marginLeft: '280px',
    transition: 'margin-left 0.3s ease',
    minHeight: '100vh',
    backgroundColor: '#f1f5f9'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f1f5f9'
  },
  loadingText: {
    fontSize: '1.5rem',
    color: '#64748b'
  }
};

export default App;
