import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiUser, FiCalendar, FiMapPin, FiFileText, FiSend, FiArrowLeft, FiBriefcase } from 'react-icons/fi';
import ClientNavbar from '../../components/client/ClientNavbar';

const FormulaireCandidature = () => {
  const { annonceId } = useParams();
  const location = useLocation();
  const stateAnnonceId = location.state?.idAnnonce || location.state?.annonce?.idAnnonce;
  const effectiveAnnonceId = annonceId || stateAnnonceId;
  const navigate = useNavigate();
  
  const [annonce, setAnnonce] = useState(null);
  const [lieux, setLieux] = useState([]);
  const [diplomes, setDiplomes] = useState([]);
  const [criteres, setCriteres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [erreur, setErreur] = useState('');
  
  const [candidatData, setCandidatData] = useState({
    nom: '',
    prenom: '',
    dateNaissance: '',
    adresse: '',
    cv: '',
    idLieu: ''
  });
  
  const [criteresReponses, setCriteresReponses] = useState({});

  const chargerDonnees = useCallback(async () => {
    try {
      // Charger les détails de l'annonce
      const resAnnonce = await fetch(`/api/client/annonce/${effectiveAnnonceId}`);
      if (!resAnnonce.ok) throw new Error('Annonce non trouvée');
      const dataAnnonce = await resAnnonce.json();
      if (dataAnnonce.success === false) throw new Error(dataAnnonce.message || 'Annonce non trouvée');
      setAnnonce(dataAnnonce.data || dataAnnonce);

      // Charger les critères du profil de l'annonce
      const resCriteres = await fetch(`/api/annonces/profils/${(dataAnnonce.data || dataAnnonce).idProfil}/criteres`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('candidatToken')}`
        }
      });
      
      if (resCriteres.ok) {
        const dataCriteres = await resCriteres.json();
        const criteresData = dataCriteres.data || dataCriteres || [];
        
        // Debug: afficher les critères reçus
        console.log('Critères reçus:', criteresData);
        
        // Dédupliquer les critères basé sur l'ID
        const criteresUniques = criteresData.reduce((acc, critere) => {
          const critereId = critere.idCritere || critere.id || critere.idCritereProfil;
          if (!acc.find(c => (c.idCritere || c.id || c.idCritereProfil) === critereId)) {
            acc.push(critere);
          }
          return acc;
        }, []);
        
        console.log('Critères après déduplication:', criteresUniques);
        setCriteres(criteresUniques);
        
        // Initialiser les réponses des critères
        const initReponses = {};
        criteresUniques.forEach(critere => {
          const critereId = critere.idCritere || critere.id || critere.idCritereProfil;
          initReponses[critereId] = '';
        });
        setCriteresReponses(initReponses);
      }

      // Charger les lieux (public)
      try {
        const resLieux = await fetch('/api/client/lieux');
        if (resLieux.ok) {
          const dataLieux = await resLieux.json();
          setLieux(dataLieux.data || []);
        }
      } catch (_) { /* ignorer */ }

      // Charger les diplômes (public)
      try {
        const resDiplomes = await fetch('/api/client/diplomes');
        if (resDiplomes.ok) {
          const dataDiplomes = await resDiplomes.json();
          setDiplomes(dataDiplomes.data || []);
        }
      } catch (_) { /* ignorer */ }
    } catch (error) {
      setErreur(error.message);
    } finally {
      setLoading(false);
    }
  }, [effectiveAnnonceId]);

  useEffect(() => {
    const token = localStorage.getItem('candidatToken');
    if (!token) {
      navigate('/offres');
      return;
    }
    if (!effectiveAnnonceId) {
      setErreur("Identifiant d'annonce manquant");
      setLoading(false);
      return;
    }
    chargerDonnees();
  }, [effectiveAnnonceId, navigate, chargerDonnees]);

  const handleCandidatChange = (field, value) => {
    setCandidatData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCritereChange = (critereId, value) => {
    setCriteresReponses(prev => ({
      ...prev,
      [critereId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErreur('');

    try {
      if (!candidatData.idLieu) {
        throw new Error('Veuillez sélectionner un lieu');
      }
      const token = localStorage.getItem('candidatToken');
      
      const candidatureData = {
        ...candidatData,
        idAnnonce: parseInt(effectiveAnnonceId),
        idLieu: parseInt(candidatData.idLieu),
        criteres: Object.entries(criteresReponses).map(([critereId, valeur]) => ({
          idCritere: parseInt(critereId),
          valeur: valeur
        }))
      };

      const response = await fetch('/api/candidats/candidature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(candidatureData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la soumission');
      }

      // Rediriger vers une page de confirmation
      navigate('/candidature-confirmee', { 
        state: { 
          message: 'Votre candidature a été soumise avec succès !',
          annonce: annonce 
        }
      });

    } catch (error) {
      setErreur(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderCritereInput = (critere) => {
    const critereId = critere.idCritere || critere.id || critere.idCritereProfil;
    const value = criteresReponses[critereId] || '';
    const critereNom = critere.nom || critere.nomCritere || '';
    
    // Si le critère s'appelle "Diplôme", afficher une liste déroulante avec les diplômes
    if (critereNom.toLowerCase().includes('diplome') || critereNom.toLowerCase().includes('diplôme')) {
      return (
        <select
          value={value}
          onChange={(e) => handleCritereChange(critereId, e.target.value)}
          style={styles.input}
          required={critere.estObligatoire}
        >
          <option value="">Sélectionnez votre diplôme...</option>
          {diplomes.map(diplome => (
            <option key={diplome.id} value={diplome.nom}>{diplome.nom}</option>
          ))}
        </select>
      );
    }
    
    // Déterminer le type de champ basé sur les valeurs définies du critère
    // Si valeurDouble est définie (pas null et pas undefined), c'est un champ numérique
    if (critere.valeurDouble !== null && critere.valeurDouble !== undefined) {
      return (
        <input
          type="number"
          step="0.01"
          value={value}
          onChange={(e) => handleCritereChange(critereId, e.target.value)}
          style={styles.input}
          placeholder="Entrez une valeur numérique"
          required={critere.estObligatoire}
        />
      );
    }
    // Si valeurVarchar est définie, c'est un champ texte
    else if (critere.valeurVarchar !== null && critere.valeurVarchar !== undefined) {
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => handleCritereChange(critereId, e.target.value)}
          style={styles.input}
          placeholder="Entrez votre réponse"
          required={critere.estObligatoire}
        />
      );
    }
    // Sinon, c'est un champ booléen (par défaut)
    else {
      return (
        <select
          value={value}
          onChange={(e) => handleCritereChange(critereId, e.target.value)}
          style={styles.input}
          required={critere.estObligatoire}
        >
          <option value="">Sélectionnez...</option>
          <option value="true">Oui</option>
          <option value="false">Non</option>
        </select>
      );
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <ClientNavbar />
        <div style={styles.content}>
          <div style={styles.loading}>Chargement du formulaire...</div>
        </div>
      </div>
    );
  }

  if (erreur && !annonce) {
    return (
      <div style={styles.container}>
        <ClientNavbar />
        <div style={styles.content}>
          <div style={styles.erreur}>Erreur: {erreur}</div>
          <button onClick={() => navigate('/offres')} style={styles.backBtn}>
            <FiArrowLeft size={16} />
            Retour aux offres
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (d) => {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (_) {
      return d;
    }
  };

  return (
    <div style={styles.container}>
      <ClientNavbar />
      <div style={styles.content}>
        <div style={styles.header}>
        <button onClick={() => navigate('/offres')} style={styles.backBtn}>
          <FiArrowLeft size={16} />
          Retour aux offres
        </button>
        <h1 style={styles.title}>Candidature</h1>
        {annonce && (
          <div style={styles.annonceInfo}>
            <div style={styles.annonceHeaderRow}>
              <h2 style={styles.annonceTitle}>{annonce.reference || `Annonce #${annonce.idAnnonce}`}</h2>
              <span style={styles.profilTag}>{annonce.nomProfil || 'Profil non spécifié'}</span>
            </div>
            <div style={styles.metaRow}>
              <div style={styles.metaItem}>
                <FiBriefcase size={14} color="#475569" />
                <span>{annonce.typeAnnonce || 'Type non défini'}</span>
              </div>
              <div style={styles.metaItem}>
                <FiMapPin size={14} color="#475569" />
                <span>{annonce.nomDepartement || 'Département'}</span>
              </div>
              <div style={styles.metaItem}>
                <FiCalendar size={14} color="#475569" />
                <span>
                  {annonce.dateDebut ? `Du ${formatDate(annonce.dateDebut)} au ${formatDate(annonce.dateFin)}` : ''}
                </span>
              </div>
            </div>
            {annonce.description && (
              <p style={styles.annonceDesc}>{annonce.description}</p>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {erreur && (
          <div style={styles.erreurBox}>
            {erreur}
          </div>
        )}

        {/* Informations personnelles */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <FiUser size={20} />
            Informations personnelles
          </h3>
          
          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nom *</label>
              <input
                type="text"
                value={candidatData.nom}
                onChange={(e) => handleCandidatChange('nom', e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Prénom *</label>
              <input
                type="text"
                value={candidatData.prenom}
                onChange={(e) => handleCandidatChange('prenom', e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Date de naissance *</label>
              <input
                type="date"
                value={candidatData.dateNaissance}
                onChange={(e) => handleCandidatChange('dateNaissance', e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Adresse *</label>
              <input
                type="text"
                value={candidatData.adresse}
                onChange={(e) => handleCandidatChange('adresse', e.target.value)}
                style={styles.input}
                placeholder="Votre adresse complète"
                required
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Lieu *</label>
              <select
                value={candidatData.idLieu}
                onChange={(e) => handleCandidatChange('idLieu', e.target.value)}
                style={styles.input}
                required
              >
                <option value="">Sélectionnez un lieu</option>
                {lieux.map(l => (
                  <option key={l.id} value={l.id}>{l.nom}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>CV / Lettre de motivation *</label>
            <textarea
              value={candidatData.cv}
              onChange={(e) => handleCandidatChange('cv', e.target.value)}
              style={styles.textarea}
              placeholder="Décrivez votre parcours, vos compétences et votre motivation..."
              rows={6}
              required
            />
          </div>
        </div>

        {/* Critères du profil */}
        {criteres.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <FiFileText size={20} />
              Critères requis pour ce poste
            </h3>
            
            {criteres.map(critere => {
              const critereId = critere.idCritere || critere.id || critere.idCritereProfil;
              return (
              <div key={critereId} style={styles.inputGroup}>
                <label style={styles.label}>
                  {critere.nom || critere.nomCritere}
                  {critere.estObligatoire && <span style={styles.required}> *</span>}
                </label>
                {renderCritereInput(critere)}
              </div>
            );})}
          </div>
        )}

        <div style={styles.submitSection}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              ...styles.submitBtn,
              opacity: submitting ? 0.7 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            <FiSend size={16} />
            {submitting ? 'Envoi en cours...' : 'Soumettre ma candidature'}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: 'Inter, sans-serif'
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px'
  },
  loading: {
    textAlign: 'center',
    padding: '60px 20px',
    fontSize: '16px',
    color: '#64748b'
  },
  erreur: {
    color: '#dc2626',
    textAlign: 'center',
    padding: '20px',
    fontSize: '16px'
  },
  header: {
    marginBottom: '30px'
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: '1px solid #e2e8f0',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '20px',
    transition: 'all 0.2s'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 16px 0'
  },
  annonceInfo: {
    background: '#fff',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },
  annonceTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 8px 0'
  },
  annonceDept: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0
  },
  annonceHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '8px'
  },
  profilTag: {
    background: '#eff6ff',
    color: '#1e3a8a',
    fontSize: '12px',
    padding: '6px 10px',
    borderRadius: '8px',
    fontWeight: 600,
    whiteSpace: 'nowrap'
  },
  metaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '8px'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#475569',
    fontWeight: 500
  },
  annonceDesc: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
    whiteSpace: 'pre-line'
  },
  form: {
    background: '#fff',
    borderRadius: '16px',
    padding: '30px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  erreurBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '24px'
  },
  section: {
    marginBottom: '32px'
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '2px solid #e2e8f0'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '20px'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  },
  required: {
    color: '#dc2626'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  submitSection: {
    textAlign: 'center',
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0'
  },
  submitBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#059669',
    color: '#fff',
    border: 'none',
    padding: '14px 32px',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  }
};

export default FormulaireCandidature;
