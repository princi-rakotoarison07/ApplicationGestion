import { useState, useEffect } from 'react';
import { 
  FiBriefcase, 
  FiSave, 
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';

const CreerAnnonce = ({ onRetour }) => {
  const [formData, setFormData] = useState({
    reference: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    idDepartement: '',
    idProfil: '',
    idTypeAnnonce: ''
  });

  const [profils, setProfils] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [typesAnnonce, setTypesAnnonce] = useState([]);
  const [criteresSelectionnes, setCriteresSelectionnes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    chargerDonneesInitiales();
  }, []);

  useEffect(() => {
    if (formData.idProfil) {
      chargerCriteresProfil(formData.idProfil);
    }
  }, [formData.idProfil]);

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


      // Charger les types d'annonce
      const typesResponse = await fetch('/api/annonces/types', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const typesData = await typesResponse.json();
      if (typesData.success) {
        setTypesAnnonce(typesData.data);
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
        // Filtrer les critères qui ont des valeurs définies (pas N/A, null ou 0)
        const criteresAvecValeurs = data.data.filter(critere => {
          return (critere.valeurDouble !== null && critere.valeurDouble !== undefined && critere.valeurDouble !== 0) ||
                 (critere.valeurVarchar !== null && critere.valeurVarchar !== undefined && critere.valeurVarchar !== 'N/A') ||
                 (critere.valeurBool !== null && critere.valeurBool !== undefined);
        });
        
        // Afficher tous les critères avec valeurs (pas seulement les obligatoires)
        const criteresAffichage = criteresAvecValeurs.map(critere => ({
          idCritere: critere.idCritere,
          nom: critere.nom,
          valeurDouble: critere.valeurDouble,
          valeurVarchar: critere.valeurVarchar,
          valeurBool: critere.valeurBool,
          estObligatoire: critere.estObligatoire
        }));
        setCriteresSelectionnes(criteresAffichage);
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


  const renderChampCritere = (critere) => {
    // Afficher la valeur selon le type défini
    if (critere.valeurDouble !== null && critere.valeurDouble !== undefined && critere.valeurDouble !== 0) {
      return (
        <div style={styles.critereDisplay}>
          <span style={styles.critereLabel}>{critere.nom}:</span>
          <span style={styles.critereValue}>{critere.valeurDouble}</span>
        </div>
      );
    }
    
    if (critere.valeurVarchar !== null && critere.valeurVarchar !== undefined && critere.valeurVarchar !== 'N/A') {
      return (
        <div style={styles.critereDisplay}>
          <span style={styles.critereLabel}>{critere.nom}:</span>
          <span style={styles.critereValue}>{critere.valeurVarchar}</span>
        </div>
      );
    }
    
    if (critere.valeurBool !== null && critere.valeurBool !== undefined) {
      return (
        <div style={styles.critereDisplay}>
          <span style={styles.critereLabel}>{critere.nom}:</span>
          <span style={styles.critereValue}>{critere.valeurBool ? 'Oui' : 'Non'}</span>
        </div>
      );
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/annonces', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Annonce créée avec succès !');
        if (onRetour) onRetour();
      } else {
        setError(data.message || 'Erreur lors de la création');
      }
    } catch (err) {
      setError('Erreur lors de la création de l\'annonce');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={onRetour} style={styles.backButton}>
          <FiArrowLeft size={20} />
          <span>Retour</span>
        </button>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Créer une Nouvelle Annonce</h1>
          <p style={styles.subtitle}>
            Sélectionnez un profil et configurez les critères pour votre annonce
          </p>
        </div>
      </div>

      {error && (
        <div style={styles.errorAlert}>
          <FiAlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGrid}>
          {/* Informations de base */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <FiBriefcase size={20} />
              Informations de Base
            </h3>
            
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
                    <option key={dept.id} value={dept.id}>
                      {dept.nom}
                    </option>
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
                    <option key={profil.id} value={profil.id}>
                      {profil.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Type d'annonce *</label>
              <select
                name="idTypeAnnonce"
                value={formData.idTypeAnnonce}
                onChange={handleInputChange}
                style={styles.select}
                required
              >
                <option value="">Sélectionnez un type d'annonce</option>
                {typesAnnonce.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.libelle}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Critères dynamiques */}
          {formData.idProfil && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <FiCheckCircle size={20} />
                Critères Requis pour ce Profil
              </h3>

              {/* Critères du profil */}
              <div style={styles.criteresContainer}>
                {criteresSelectionnes.length > 0 ? (
                  criteresSelectionnes.map(critere => (
                    <div key={critere.idCritere} style={styles.critereCard}>
                      {renderChampCritere(critere)}
                      {critere.estObligatoire && (
                        <span style={styles.obligatoireTag}>Obligatoire</span>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={styles.noCriteres}>
                    <p>Aucun critère défini pour ce profil</p>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        <div style={styles.formActions}>
          <button
            type="button"
            onClick={onRetour}
            style={styles.cancelButton}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            style={styles.submitButton}
          >
            <FiSave size={20} />
            <span>{loading ? 'Création...' : 'Créer l\'Annonce'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: {
    padding: '32px',
    backgroundColor: '#f1f5f9',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20px',
    marginBottom: '32px'
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#475569',
    transition: 'all 0.2s ease'
  },
  headerContent: {
    flex: 1
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
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    color: '#dc2626',
    marginBottom: '24px'
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  },
  formGrid: {
    display: 'grid',
    gap: '32px'
  },
  section: {
    marginBottom: '24px'
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '24px',
    paddingBottom: '12px',
    borderBottom: '2px solid #e2e8f0'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  inputRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1f2937',
    backgroundColor: '#ffffff',
    transition: 'border-color 0.2s ease'
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1f2937',
    backgroundColor: '#ffffff',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1f2937',
    backgroundColor: '#ffffff'
  },
  criteresContainer: {
    display: 'grid',
    gap: '16px',
    marginBottom: '24px'
  },
  critereCard: {
    padding: '20px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    position: 'relative'
  },
  critereHeader: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '12px'
  },
  removeCritereButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  obligatoireTag: {
    padding: '4px 8px',
    backgroundColor: '#1e40af',
    color: '#ffffff',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500'
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  checkboxLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    cursor: 'pointer'
  },
  criteresDisponibles: {
    marginTop: '24px'
  },
  subTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '16px'
  },
  criteresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px'
  },
  critereDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    marginBottom: '8px'
  },
  critereLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    minWidth: '120px'
  },
  critereValue: {
    fontSize: '14px',
    color: '#1f2937',
    backgroundColor: '#ffffff',
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid #d1d5db'
  },
  noCriteres: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#6b7280',
    fontStyle: 'italic',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px dashed #d1d5db'
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '16px',
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #e2e8f0'
  },
  cancelButton: {
    padding: '12px 24px',
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    transition: 'all 0.2s ease'
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#1e40af',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  }
};

export default CreerAnnonce;
