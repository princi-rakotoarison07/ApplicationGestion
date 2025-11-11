import { useEffect, useState, useCallback } from "react";
import { FiEdit3, FiTrash2, FiPlus, FiUsers, FiUserCheck, FiSearch, FiFilter, FiX, FiRefreshCw } from "react-icons/fi";

const GestionCritereProfils = () => {
  const [associations, setAssociations] = useState([]);
  const [profils, setProfils] = useState([]);
  const [criteres, setCriteres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    idProfil: '',
    idCritere: '',
    estObligatoire: '',
    hasValue: false
  });
  const [formData, setFormData] = useState({
    idProfil: '',
    idCritere: '',
    valeurDouble: '',
    valeurVarchar: '',
    valeurBool: false,
    estObligatoire: true
  });

  const fetchAll = useCallback(async (useFilters = false) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Build query parameters for filtering
      let queryParams = '';
      if (useFilters) {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.idProfil) params.append('idProfil', filters.idProfil);
        if (filters.idCritere) params.append('idCritere', filters.idCritere);
        if (filters.estObligatoire !== '') params.append('estObligatoire', filters.estObligatoire);
        if (filters.hasValue) params.append('hasValue', 'true');
        queryParams = params.toString() ? `?${params.toString()}` : '';
      }
      
      // Fetch associations with or without filters
      const endpoint = useFilters ? `/api/critereprofils/filter${queryParams}` : '/api/critereprofils/details';
      const resAssoc = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resAssoc.ok) throw new Error('Erreur chargement associations');
      const dataAssoc = await resAssoc.json();
      
      // Fetch profils and criteres only if not using detailed endpoint
      if (!useFilters) {
        const resProfils = await fetch('/api/profils', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resProfils.ok) throw new Error('Erreur chargement profils');
        const dataProfils = await resProfils.json();
        
        const resCriteres = await fetch('/api/criteres', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resCriteres.ok) throw new Error('Erreur chargement criteres');
        const dataCriteres = await resCriteres.json();
        
        setProfils(Array.isArray(dataProfils.data) ? dataProfils.data : []);
        setCriteres(Array.isArray(dataCriteres.data) ? dataCriteres.data : []);
      }

      setAssociations(Array.isArray(dataAssoc.data) ? dataAssoc.data : []);
      setError(null);
    } catch (err) {
      setError('Erreur: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAll(false);
  }, [fetchAll]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingItem ? `/api/critereprofils/${editingItem.id}` : '/api/critereprofils';
      const method = editingItem ? 'PUT' : 'POST';
      // Préparer les données à envoyer (convertir les types si besoin)
      const dataToSend = {
        idProfil: formData.idProfil,
        idCritere: formData.idCritere,
        valeurDouble: !formData.valeurDouble || formData.valeurDouble === '' || formData.valeurDouble === '0' || parseFloat(formData.valeurDouble) === 0 || isNaN(parseFloat(formData.valeurDouble)) ? null : parseFloat(formData.valeurDouble),
        valeurVarchar: formData.valeurVarchar === '' ? null : formData.valeurVarchar,
        valeurBool: !!formData.valeurBool,
        estObligatoire: !!formData.estObligatoire
      };
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });
      if (!response.ok) throw new Error(editingItem ? 'Erreur modification' : 'Erreur création');
      setShowModal(false);
      setEditingItem(null);
      setFormData({
        idProfil: '',
        idCritere: '',
        valeurDouble: '',
        valeurVarchar: '',
        valeurBool: false,
        estObligatoire: true
      });
      fetchAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette association ?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/critereprofils/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur suppression');
      fetchAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCleanupDuplicates = async () => {
    if (!window.confirm('Nettoyer les doublons ? Cette action supprimera les critères en double en gardant les plus récents.')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/critereprofils/duplicates/cleanup', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur nettoyage');
      const result = await response.json();
      alert(`${result.deletedCount} doublons supprimés avec succès !`);
      fetchAll();
    } catch (err) {
      setError(err.message);
      alert('Erreur lors du nettoyage : ' + err.message);
    }
  };

  const handleFixZeroValues = async () => {
    if (!window.confirm('Corriger les valeurs 0.00 ? Cette action convertira toutes les valeurs 0.00 en NULL.')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/critereprofils/fix-zero-values', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur correction');
      const result = await response.json();
      alert(`${result.affectedRows} valeurs 0.00 corrigées avec succès !`);
      fetchAll();
    } catch (err) {
      setError(err.message);
      alert('Erreur lors de la correction : ' + err.message);
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      idProfil: item.idProfil,
      idCritere: item.idCritere,
      valeurDouble: item.valeurDouble ?? '',
      valeurVarchar: item.valeurVarchar ?? '',
      valeurBool: !!item.valeurBool,
      estObligatoire: item.estObligatoire === undefined ? true : !!item.estObligatoire
    });
    setShowModal(true);
    setError(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      idProfil: '',
      idCritere: '',
      valeurDouble: '',
      valeurVarchar: '',
      valeurBool: false,
      estObligatoire: true
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchAll(true);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      idProfil: '',
      idCritere: '',
      estObligatoire: '',
      hasValue: false
    });
    fetchAll(false);
  };

  const renderValueDisplay = (association) => {
    const values = [];
    
    if (association.valeurDouble !== null && association.valeurDouble !== undefined && association.valeurDouble !== 0) {
      values.push(`Valeur Double: ${association.valeurDouble}`);
    }
    
    if (association.valeurVarchar && association.valeurVarchar !== 'N/A') {
      values.push(`Valeur Varchar: ${association.valeurVarchar}`);
    }
    
    if (association.valeurBool !== null && association.valeurBool !== undefined) {
      values.push(`Booléen: ${association.valeurBool ? 'Oui' : 'Non'}`);
    }
    
    if (values.length === 0) {
      return <span style={{color:'#b6bcc8', fontStyle: 'italic'}}>Aucune valeur définie</span>;
    }
    
    return values.join(' | ');
  };

  if (loading) return <div style={styles.loading}>Chargement des associations...</div>;
  if (error) return <div style={styles.error}>Erreur: {error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Gestion des Associations Critère-Profil</h1>
        <p style={styles.subtitle}>Associez des critères à des profils</p>
      </div>
      
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><FiUsers size={24} color="#1e40af" /></div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>{associations.length}</div>
            <div style={styles.statLabel}>Total Associations</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}><FiUserCheck size={24} color="#059669" /></div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>{profils.length}</div>
            <div style={styles.statLabel}>Profils</div>
          </div>
        </div>
      </div>

      <div style={styles.actionsBar}>
        <div style={styles.filtersContainer}>
          <button 
            style={{...styles.filterButton, ...(showFilters ? styles.filterButtonActive : {})}} 
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter size={16} />
            <span>Filtres</span>
          </button>
          <button style={styles.refreshButton} onClick={() => fetchAll(false)}>
            <FiRefreshCw size={16} />
            <span>Actualiser</span>
          </button>
          <button style={styles.cleanupButton} onClick={handleCleanupDuplicates}>
            <FiTrash2 size={16} />
            <span>Nettoyer Doublons</span>
          </button>
          <button style={styles.fixButton} onClick={handleFixZeroValues}>
            <FiRefreshCw size={16} />
            <span>Corriger Valeurs 0</span>
          </button>
        </div>
        <button style={styles.addButton} onClick={() => setShowModal(true)}>
          <FiPlus size={18} />
          <span>Nouvelle Association</span>
        </button>
      </div>

      {showFilters && (
        <div style={styles.filtersPanel}>
          <div style={styles.filtersGrid}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Recherche</label>
              <div style={styles.searchContainer}>
                <FiSearch size={16} style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Rechercher par nom de profil, critère ou valeur..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  style={styles.searchInput}
                />
              </div>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Profil</label>
              <select
                value={filters.idProfil}
                onChange={(e) => handleFilterChange('idProfil', e.target.value)}
                style={styles.filterSelect}
              >
                <option value="">Tous les profils</option>
                {profils.map(p => (
                  <option key={p.id} value={p.id}>{p.nom}</option>
                ))}
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Critère</label>
              <select
                value={filters.idCritere}
                onChange={(e) => handleFilterChange('idCritere', e.target.value)}
                style={styles.filterSelect}
              >
                <option value="">Tous les critères</option>
                {criteres.map(c => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Obligatoire</label>
              <select
                value={filters.estObligatoire}
                onChange={(e) => handleFilterChange('estObligatoire', e.target.value)}
                style={styles.filterSelect}
              >
                <option value="">Tous</option>
                <option value="true">Oui</option>
                <option value="false">Non</option>
              </select>
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterCheckbox}>
                <input
                  type="checkbox"
                  checked={filters.hasValue}
                  onChange={(e) => handleFilterChange('hasValue', e.target.checked)}
                  style={styles.checkbox}
                />
                Seulement avec valeurs
              </label>
            </div>
          </div>
          <div style={styles.filterActions}>
            <button style={styles.clearButton} onClick={clearFilters}>
              <FiX size={16} />
              Effacer
            </button>
            <button style={styles.applyButton} onClick={applyFilters}>
              <FiSearch size={16} />
              Appliquer
            </button>
          </div>
        </div>
      )}

      <div style={styles.cardGrid}>
        {/* Regrouper les associations par profil */}
        {(() => {
          // Group associations by profile
          const groupedAssociations = associations.reduce((acc, association) => {
            const profilNom = association.profilNom || profils.find(p => p.id === association.idProfil)?.nom || 'Profil inconnu';
            if (!acc[profilNom]) {
              acc[profilNom] = [];
            }
            acc[profilNom].push(association);
            return acc;
          }, {});

          return Object.entries(groupedAssociations).map(([profilNom, assocProfil]) => (
            <div key={profilNom} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardTitle}>{profilNom}</div>
                <div style={styles.cardBadge}>{assocProfil.length} critère{assocProfil.length > 1 ? 's' : ''}</div>
              </div>
              <div style={styles.cardBody}>
                {assocProfil.map(a => {
                  const critereNom = a.critereNom || criteres.find(c => c.id === a.idCritere)?.nom || 'Critère inconnu';
                  return (
                    <div key={a.id} style={styles.critereRow}>
                      <div style={styles.critereInfo}>
                        <div style={styles.critereName}>{critereNom}</div>
                        <div style={styles.critereValues}>
                          {renderValueDisplay(a)}
                        </div>
                        <div style={styles.critereStatus}>
                          <span style={{
                            ...styles.statusBadge,
                            ...(a.estObligatoire ? styles.requiredBadge : styles.optionalBadge)
                          }}>
                            {a.estObligatoire ? 'Obligatoire' : 'Optionnel'}
                          </span>
                        </div>
                      </div>
                      <div style={styles.cardActions}>
                        <button style={styles.editButton} onClick={() => openEditModal(a)}>
                          <FiEdit3 size={16} />
                        </button>
                        <button style={styles.deleteButton} onClick={() => handleDelete(a.id)}>
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ));
        })()}
      </div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>{editingItem ? 'Modifier l\'association' : 'Créer une association'}</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Profil</label>
                <select
                  value={formData.idProfil}
                  onChange={e => setFormData({ ...formData, idProfil: e.target.value })}
                  style={styles.input}
                  required
                >
                  <option value="">-- Sélectionner --</option>
                  {profils.map(p => (
                    <option key={p.id} value={p.id}>{p.nom}</option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Critère</label>
                <select
                  value={formData.idCritere}
                  onChange={e => setFormData({ ...formData, idCritere: e.target.value })}
                  style={styles.input}
                  required
                >
                  <option value="">-- Sélectionner --</option>
                  {criteres.map(c => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Valeur Double</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valeurDouble}
                  onChange={e => setFormData({ ...formData, valeurDouble: e.target.value })}
                  style={styles.input}
                  placeholder="Ex: 12.34 (0 = pas de valeur)"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Valeur Varchar</label>
                <input
                  type="text"
                  value={formData.valeurVarchar}
                  onChange={e => setFormData({ ...formData, valeurVarchar: e.target.value })}
                  style={styles.input}
                  placeholder="Texte libre"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Valeur Booléenne</label>
                <select
                  value={formData.valeurBool ? 'true' : 'false'}
                  onChange={e => setFormData({ ...formData, valeurBool: e.target.value === 'true' })}
                  style={styles.input}
                >
                  <option value="false">Non</option>
                  <option value="true">Oui</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Est Obligatoire</label>
                <select
                  value={formData.estObligatoire ? 'true' : 'false'}
                  onChange={e => setFormData({ ...formData, estObligatoire: e.target.value === 'true' })}
                  style={styles.input}
                >
                  <option value="true">Oui</option>
                  <option value="false">Non</option>
                </select>
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={closeModal} style={styles.cancelButton}>Annuler</button>
                <button type="submit" style={styles.saveButton}>{editingItem ? 'Modifier' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '32px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh'
  },
  header: {
    marginBottom: '32px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b',
    lineHeight: '1.6'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '32px'
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'all 0.2s ease'
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statContent: {
    flex: 1
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '4px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500'
  },
  actionsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  filtersContainer: {
    display: 'flex',
    gap: '12px'
  },
  filterButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#f8fafc',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    borderColor: '#3b82f6'
  },
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#f8fafc',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  cleanupButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  fixButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#fff7ed',
    color: '#ea580c',
    border: '1px solid #fed7aa',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  filtersPanel: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '20px'
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },
  filterCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer'
  },
  checkbox: {
    width: '16px',
    height: '16px'
  },
  searchContainer: {
    position: 'relative'
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af'
  },
  searchInput: {
    width: '100%',
    padding: '10px 12px 10px 40px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none'
  },
  filterSelect: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#ffffff'
  },
  filterActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px'
  },
  clearButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  applyButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '24px',
    marginBottom: '32px'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    minHeight: '180px',
    position: 'relative'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #f1f5f9'
  },
  cardBadge: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#6366f1',
    backgroundColor: '#eef2ff',
    padding: '4px 8px',
    borderRadius: '12px'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b'
  },
  cardSubTitle: {
    fontSize: '15px',
    color: '#64748b',
    fontWeight: '400',
    marginLeft: '8px'
  },
  cardActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flexShrink: 0
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    fontSize: '15px',
    color: '#334155',
    marginTop: '8px'
  },
  critereRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '16px',
    background: '#f8fafc',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    border: '1px solid #f1f5f9',
    transition: 'all 0.2s ease'
  },
  critereInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  critereName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b'
  },
  critereValues: {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.5'
  },
  critereStatus: {
    display: 'flex',
    alignItems: 'center'
  },
  statusBadge: {
    fontSize: '12px',
    fontWeight: '500',
    padding: '4px 8px',
    borderRadius: '12px'
  },
  requiredBadge: {
    color: '#dc2626',
    backgroundColor: '#fee2e2'
  },
  optionalBadge: {
    color: '#059669',
    backgroundColor: '#d1fae5'
  },
  actions: {
    display: 'flex',
    gap: '8px'
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  deleteButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '20px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    '&:focus': {
      outline: 'none',
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    }
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '16px'
  },
  cancelButton: {
    padding: '10px 16px',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  saveButton: {
    padding: '10px 16px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
    fontSize: '16px',
    color: '#64748b'
  },
  error: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
    fontSize: '16px',
    color: '#ef4444'
  }
};

export default GestionCritereProfils;