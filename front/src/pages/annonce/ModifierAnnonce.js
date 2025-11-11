import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiBriefcase, 
  FiSave, 
  FiArrowLeft,
  FiPlus,
  FiCheckCircle,
  FiX
} from 'react-icons/fi';

const ModifierAnnonce = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    reference: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    idDepartement: '',
    idProfil: ''
  });

  const [profils, setProfils] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [criteresDisponibles, setCriteresDisponibles] = useState([]);
  const [tousLesCriteres, setTousLesCriteres] = useState([]);
  const [criteresSelectionnes, setCriteresSelectionnes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    chargerDonneesInitiales();
    chargerAnnonce();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (formData.idProfil) {
      chargerCriteresProfil(formData.idProfil);
    }
  }, [formData.idProfil]);

  const chargerAnnonce = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/annonces/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        const annonce = data.data;
        setFormData({
          reference: annonce.reference || '',
          description: annonce.description || '',
          dateDebut: annonce.dateDebut ? annonce.dateDebut.split('T')[0] : '',
          dateFin: annonce.dateFin ? annonce.dateFin.split('T')[0] : '',
          idDepartement: annonce.idDepartement || '',
          idProfil: annonce.idProfil || ''
        });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erreur lors du chargement de l\'annonce');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chargerDonneesInitiales = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Charger les profils
      const profilsResponse = await fetch('/api/annonces/profils', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const profilsData = await profilsResponse.json();
      if (profilsData.success) {
        setProfils(profilsData.data);
      }

      // Charger les départements
      const deptsResponse = await fetch('/api/annonces/departements', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const deptsData = await deptsResponse.json();
      if (deptsData.success) {
        setDepartements(deptsData.data);
      }

      // Charger tous les critères disponibles
      const criteresResponse = await fetch('/api/annonces/criteres', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const criteresData = await criteresResponse.json();
      if (criteresData.success) {
        setTousLesCriteres(criteresData.data);
      }
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    }
  };

  const chargerCriteresProfil = async (idProfil) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/annonces/profils/${idProfil}/criteres`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setCriteresDisponibles(data.data);
        // Pré-remplir les critères obligatoires
        const criteresObligatoires = data.data
          .filter(critere => critere.estObligatoire)
          .map(critere => ({
            idCritere: critere.idCritere,
            nom: critere.nom,
            valeurDouble: critere.valeurDouble || '',
            valeurVarchar: critere.valeurVarchar || '',
            valeurBool: critere.valeurBool || false,
            estObligatoire: true
          }));
        setCriteresSelectionnes(criteresObligatoires);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des critères:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const ajouterCritere = (critere) => {
    if (!criteresSelectionnes.find(c => c.idCritere === critere.idCritere)) {
      setCriteresSelectionnes(prev => [...prev, {
        idCritere: critere.idCritere,
        nom: critere.nom,
        valeurDouble: critere.valeurDouble || '',
        valeurVarchar: critere.valeurVarchar || '',
        valeurBool: critere.valeurBool || false,
        estObligatoire: false
      }]);
    }
  };

  const supprimerCritere = (idCritere) => {
    setCriteresSelectionnes(prev => 
      prev.filter(c => c.idCritere !== idCritere || c.estObligatoire)
    );
  };

  const modifierValeurCritere = (idCritere, champ, valeur) => {
    setCriteresSelectionnes(prev => 
      prev.map(critere => 
        critere.idCritere === idCritere 
          ? { ...critere, [champ]: valeur }
          : critere
      )
    );
  };

  const renderChampCritere = (critere) => {
    const critereOriginal = criteresDisponibles.find(c => c.idCritere === critere.idCritere);
    
    if (critereOriginal?.valeurBool !== null) {
      return (
        <div style={styles.inputGroup}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={critere.valeurBool}
              onChange={(e) => modifierValeurCritere(critere.idCritere, 'valeurBool', e.target.checked)}
              style={styles.checkbox}
            />
            <span>{critere.nom}</span>
          </label>
        </div>
      );
    }
    
    if (critereOriginal?.valeurDouble !== null) {
      return (
        <div style={styles.inputGroup}>
          <label style={styles.label}>{critere.nom}</label>
          <input
            type="number"
            step="0.01"
            value={critere.valeurDouble}
            onChange={(e) => modifierValeurCritere(critere.idCritere, 'valeurDouble', e.target.value)}
            style={styles.input}
            placeholder="Entrez une valeur numérique"
          />
        </div>
      );
    }
    
    return (
      <div style={styles.inputGroup}>
        <label style={styles.label}>{critere.nom}</label>
        <input
          type="text"
          value={critere.valeurVarchar}
          onChange={(e) => modifierValeurCritere(critere.idCritere, 'valeurVarchar', e.target.value)}
          style={styles.input}
          placeholder="Entrez une valeur"
        />
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/annonces/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          criteres: criteresSelectionnes
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Annonce modifiée avec succès !');
        navigate('/annonces');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erreur lors de la modification de l\'annonce');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.loading}>Chargement...</div>;
  if (error) return <div style={styles.error}>Erreur: {error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/annonces')} style={styles.backButton}>
          <FiArrowLeft size={20} />
          <span>Retour aux annonces</span>
        </button>
        <h1 style={styles.title}>Modifier l'Annonce</h1>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formSection}>
          <h2 style={styles.sectionTitle}>
            <FiBriefcase size={20} />
            Informations Générales
          </h2>

          <div style={styles.inputRow}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Référence de l'annonce *</label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleInputChange}
                style={styles.input}
                required
                placeholder="Ex: REF-2024-001"
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              style={styles.textarea}
              rows={4}
              placeholder="Décrivez le poste et les responsabilités..."
            />
          </div>

          <div style={styles.inputRow}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Date de début *</label>
              <input
                type="date"
                name="dateDebut"
                value={formData.dateDebut}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Date de fin *</label>
              <input
                type="date"
                name="dateFin"
                value={formData.dateFin}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.inputRow}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Département *</label>
              <select
                name="idDepartement"
                value={formData.idDepartement}
                onChange={handleInputChange}
                style={styles.select}
                required
              >
                <option value="">Sélectionnez un département</option>
                {departements.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.nom}</option>
                ))}
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Profil recherché *</label>
              <select
                name="idProfil"
                value={formData.idProfil}
                onChange={handleInputChange}
                style={styles.select}
                required
              >
                <option value="">Sélectionnez un profil</option>
                {profils.map(profil => (
                  <option key={profil.id} value={profil.id}>{profil.nom}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section Critères */}
        <div style={styles.formSection}>
          <h2 style={styles.sectionTitle}>
            <FiCheckCircle size={20} />
            Critères de Sélection
          </h2>

          {formData.idProfil && (
            <div style={styles.criteresContainer}>
              {/* Critères sélectionnés */}
              <div style={styles.criteresSelectionnes}>
                <h3 style={styles.subTitle}>Critères configurés :</h3>
                {criteresSelectionnes.map(critere => (
                  <div key={critere.idCritere} style={styles.critereItem}>
                    <div style={styles.critereHeader}>
                      <span style={styles.critereNom}>{critere.nom}</span>
                      {!critere.estObligatoire && (
                        <button
                          type="button"
                          onClick={() => supprimerCritere(critere.idCritere)}
                          style={styles.removeCritereButton}
                        >
                          <FiX size={16} />
                        </button>
                      )}
                      {critere.estObligatoire && (
                        <span style={styles.obligatoireTag}>Obligatoire</span>
                      )}
                    </div>
                    {renderChampCritere(critere)}
                  </div>
                ))}
              </div>

              {/* Critères disponibles à ajouter */}
              <div style={styles.criteresDisponibles}>
                <h4 style={styles.subTitle}>Ajouter des critères supplémentaires :</h4>
                <div style={styles.criteresGrid}>
                  {tousLesCriteres
                    .filter(critere => !criteresSelectionnes.find(c => c.idCritere === critere.idCritere))
                    .map(critere => (
                      <button
                        key={critere.idCritere}
                        type="button"
                        onClick={() => ajouterCritere(critere)}
                        style={styles.addCritereButton}
                      >
                        <FiPlus size={16} />
                        <span>{critere.nom}</span>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={styles.formActions}>
          <button
            type="button"
            onClick={() => navigate('/annonces')}
            style={styles.cancelButton}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            style={styles.submitButton}
          >
            <FiSave size={16} />
            <span>{loading ? 'Modification...' : 'Modifier l\'Annonce'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1000px',
    margin: '0 auto',
    backgroundColor: '#f8fafc'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '30px',
    gap: '20px'
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#475569',
    transition: 'all 0.2s ease'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  formSection: {
    marginBottom: '32px'
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '2px solid #e2e8f0'
  },
  inputRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
  },
  inputGroup: {
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
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'border-color 0.2s ease',
    ':focus': {
      outline: 'none',
      borderColor: '#3b82f6'
    }
  },
  textarea: {
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    resize: 'vertical',
    minHeight: '100px',
    transition: 'border-color 0.2s ease'
  },
  select: {
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: '#fff',
    cursor: 'pointer'
  },
  criteresContainer: {
    display: 'grid',
    gap: '24px'
  },
  criteresSelectionnes: {
    display: 'grid',
    gap: '16px'
  },
  subTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '12px'
  },
  critereItem: {
    padding: '16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: '#f9fafb'
  },
  critereHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  critereNom: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },
  removeCritereButton: {
    padding: '4px',
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#dc2626'
  },
  obligatoireTag: {
    fontSize: '12px',
    padding: '4px 8px',
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    borderRadius: '12px',
    fontWeight: '500'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer'
  },
  checkbox: {
    width: '16px',
    height: '16px'
  },
  criteresDisponibles: {
    marginTop: '20px'
  },
  criteresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px'
  },
  addCritereButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#0369a1',
    transition: 'all 0.2s ease'
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    paddingTop: '24px',
    borderTop: '1px solid #e2e8f0'
  },
  cancelButton: {
    padding: '12px 24px',
    backgroundColor: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#374151'
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#fff',
    fontWeight: '500'
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '16px',
    color: '#64748b'
  },
  error: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '16px',
    color: '#ef4444'
  }
};

export default ModifierAnnonce;
