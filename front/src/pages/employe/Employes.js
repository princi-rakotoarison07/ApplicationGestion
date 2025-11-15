import React, { useState, useEffect } from 'react';
import { FiUsers, FiPlus, FiEdit, FiTrash2, FiFileText, FiCalendar, FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi';
import './Employes.css';

const Employes = () => {
  const [employes, setEmployes] = useState([]);
  const [contrats, setContrats] = useState([]);
  const [statistiques, setStatistiques] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('employes');
  const [selectedEmploye, setSelectedEmploye] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'contrat', 'renouveler'
  const [formData, setFormData] = useState({
    idEmploye: '',
    dateDebut: '',
    nombreMois: '',
    typeContrat: 'CDD'
  });

  // Charger les données
  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Charger les employés
      const responseEmployes = await fetch('/api/employes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataEmployes = await responseEmployes.json();
      
      // Charger les contrats
      const responseContrats = await fetch('/api/contrats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataContrats = await responseContrats.json();
      
      // Charger les statistiques
      const responseStats = await fetch('/api/contrats/statistiques', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataStats = await responseStats.json();

      if (dataEmployes.success) setEmployes(dataEmployes.data);
      if (dataContrats.success) setContrats(dataContrats.data);
      if (dataStats.success) setStatistiques(dataStats.data);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const ouvrirModal = (type, employe = null, contrat = null) => {
    setModalType(type);
    setSelectedEmploye(employe);
    
    if (type === 'contrat' && employe) {
      setFormData({
        idEmploye: employe.id,
        dateDebut: new Date().toISOString().split('T')[0],
        nombreMois: '12',
        typeContrat: 'CDD'
      });
    } else if (type === 'renouveler' && contrat) {
      setFormData({
        idEmploye: contrat.idEmploye,
        dateDebut: contrat.dateFin,
        nombreMois: contrat.nombreMois.toString(),
        typeContrat: contrat.typeContrat
      });
    }
    
    setShowModal(true);
  };

  const fermerModal = () => {
    setShowModal(false);
    setSelectedEmploye(null);
    setFormData({
      idEmploye: '',
      dateDebut: '',
      nombreMois: '',
      typeContrat: 'CDD'
    });
  };

  const soumettreContrat = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = modalType === 'renouveler' 
        ? `/api/contrats/${contrats.find(c => c.idEmploye === formData.idEmploye)?.id}/renouveler`
        : '/api/contrats';
      
      const method = modalType === 'renouveler' ? 'POST' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        await chargerDonnees();
        fermerModal();
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Erreur lors de la création/renouvellement du contrat:', error);
      setError('Erreur lors de l\'opération');
    }
  };

  const getStatutBadge = (statut) => {
    const classes = {
      'Actif': 'badge status-active',
      'Expire bientôt': 'badge status-expiring',
      'Expiré': 'badge status-expired'
    };
    
    const icons = {
      'Actif': <FiCheckCircle className="w-3 h-3" />,
      'Expire bientôt': <FiClock className="w-3 h-3" />,
      'Expiré': <FiAlertCircle className="w-3 h-3" />
    };
    
    return (
      <span className={classes[statut]}>
        {icons[statut]}
        {statut}
      </span>
    );
  };

  const getTypeContratBadge = (type) => {
    const classes = {
      'CDI': 'badge contract-cdi',
      'CDD': 'badge contract-cdd',
      'Essai': 'badge contract-essai',
      'Stage': 'badge contract-stage'
    };
    
    return (
      <span className={classes[type] || 'badge contract-stage'}>
        {type}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* En-tête */}
      <div className="header">
        <h1 className="title">Gestion des Employés</h1>
        <p className="subtitle">Gérez les employés et leurs contrats de travail</p>
      </div>

      {/* Statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon blue">
              <FiUsers />
            </div>
            <div className="stat-details">
              <p className="stat-label">Total Employés</p>
              <p className="stat-value">{employes.length}</p>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon green">
              <FiFileText />
            </div>
            <div className="stat-details">
              <p className="stat-label">Contrats Actifs</p>
              <p className="stat-value">{statistiques.contratsActifs || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon yellow">
              <FiClock />
            </div>
            <div className="stat-details">
              <p className="stat-label">Expirent Bientôt</p>
              <p className="stat-value">{statistiques.contratsExpirentBientot || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-icon red">
              <FiAlertCircle />
            </div>
            <div className="stat-details">
              <p className="stat-label">Contrats Expirés</p>
              <p className="stat-value">{statistiques.contratsExpires || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="tabs-container">
        <div className="tabs-border">
          <nav className="tabs-nav">
            <button
              onClick={() => setActiveTab('employes')}
              className={`tab-button ${activeTab === 'employes' ? 'active' : ''}`}
            >
              <FiUsers />
              Employés ({employes.length})
            </button>
            <button
              onClick={() => setActiveTab('contrats')}
              className={`tab-button ${activeTab === 'contrats' ? 'active' : ''}`}
            >
              <FiFileText />
              Contrats ({contrats.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'employes' && (
        <div className="main-card">
          <div className="card-header">
            <h3 className="card-title">Liste des Employés</h3>
          </div>
          
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th>Employé</th>
                  <th>Département</th>
                  <th>Adresse</th>
                  <th>Contrat Actuel</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {employes.map((employe) => {
                  const contratActuel = contrats.find(c => c.idEmploye === employe.id && c.statut === 'Actif');
                  
                  return (
                    <tr key={employe.id}>
                      <td>
                        <div className="employee-info">
                          <div className="employee-name">
                            {employe.nom} {employe.prenom}
                          </div>
                          <div className="employee-id">ID: {employe.id}</div>
                        </div>
                      </td>
                      <td>{employe.nomDepartement || 'Non assigné'}</td>
                      <td>{employe.adresse || 'Non renseignée'}</td>
                      <td>
                        {contratActuel ? (
                          <div className="contract-badges">
                            {getTypeContratBadge(contratActuel.typeContrat)}
                            {getStatutBadge(contratActuel.statut)}
                          </div>
                        ) : (
                          <span style={{color: '#9ca3af', fontSize: '14px'}}>Aucun contrat</span>
                        )}
                      </td>
                      <td>
                        <div className="actions-container">
                          <button
                            onClick={() => ouvrirModal('contrat', employe)}
                            className="action-button primary"
                          >
                            <FiPlus />
                            Nouveau contrat
                          </button>
                          {contratActuel && (
                            <button
                              onClick={() => ouvrirModal('renouveler', employe, contratActuel)}
                              className="action-button success"
                            >
                              <FiCalendar />
                              Renouveler
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'contrats' && (
        <div className="main-card">
          <div className="card-header">
            <h3 className="card-title">Liste des Contrats</h3>
          </div>
          
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th>Employé</th>
                  <th>Type</th>
                  <th>Période</th>
                  <th>Durée</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {contrats.map((contrat) => (
                  <tr key={contrat.id}>
                    <td>
                      <div className="employee-info">
                        <div className="employee-name">
                          {contrat.nom} {contrat.prenom}
                        </div>
                        <div className="employee-id">{contrat.nomDepartement}</div>
                      </div>
                    </td>
                    <td>
                      {getTypeContratBadge(contrat.typeContrat)}
                    </td>
                    <td>
                      <div className="contract-period">
                        <div className="contract-date">Du {new Date(contrat.dateDebut).toLocaleDateString('fr-FR')}</div>
                        <div className="contract-date">Au {new Date(contrat.dateFin).toLocaleDateString('fr-FR')}</div>
                      </div>
                    </td>
                    <td>{contrat.nombreMois} mois</td>
                    <td>
                      {getStatutBadge(contrat.statut)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal pour créer/renouveler un contrat */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {modalType === 'renouveler' ? 'Renouveler le contrat' : 'Nouveau contrat'}
              </h3>
            </div>
            
            <form onSubmit={soumettreContrat}>
              {selectedEmploye && (
                <div className="form-group">
                  <label className="form-label">Employé</label>
                  <div className="form-readonly">
                    {selectedEmploye.nom} {selectedEmploye.prenom}
                  </div>
                </div>
              )}
              
              <div className="form-group">
                <label className="form-label">Date de début</label>
                <input
                  type="date"
                  value={formData.dateDebut}
                  onChange={(e) => setFormData({...formData, dateDebut: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Durée (mois)</label>
                <input
                  type="number"
                  value={formData.nombreMois}
                  onChange={(e) => setFormData({...formData, nombreMois: e.target.value})}
                  className="form-input"
                  min="1"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Type de contrat</label>
                <select
                  value={formData.typeContrat}
                  onChange={(e) => setFormData({...formData, typeContrat: e.target.value})}
                  className="form-select"
                  required
                >
                  <option value="CDD">CDD</option>
                  <option value="CDI">CDI</option>
                  <option value="Essai">Période d'essai</option>
                  <option value="Stage">Stage</option>
                </select>
              </div>
              
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={fermerModal}
                  className="button secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="button primary"
                >
                  {modalType === 'renouveler' ? 'Renouveler' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="error-message">
          {error}
          <button
            onClick={() => setError(null)}
            className="error-close"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default Employes;
