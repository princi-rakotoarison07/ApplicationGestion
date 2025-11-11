import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiSave } from 'react-icons/fi';

const CandidatsFormulaire = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    idEmploye: id,
    dateDebut: '',
    nombreMois: '',
    typeContrat: 'Essai',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/contrats', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du contrat');
      }

      const data = await response.json();
      if (data.success) {
        alert('Contrat d\'essai ajouté avec succès !');
        navigate('/candidats');
      } else {
        throw new Error(data.message || 'Erreur lors de la création');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Ajouter un Contrat d'Essai</h1>
          <p style={styles.subtitle}>
            {location.state?.candidatNom && location.state?.candidatPrenom ? (
              <>
                Candidat: <strong>{location.state.candidatPrenom} {location.state.candidatNom}</strong>
                {location.state?.annonceReference && (
                  <> • Annonce: <strong>{location.state.annonceReference}</strong></>
                )}
              </>
            ) : (
              `Remplissez les détails du contrat pour le candidat ID: ${id}`
            )}
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div style={styles.formContainer}>
        {error && <div style={styles.error}>Erreur : {error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Date de début :</label>
            <input
              type="date"
              name="dateDebut"
              value={formData.dateDebut}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nombre de mois :</label>
            <input
              type="number"
              name="nombreMois"
              value={formData.nombreMois}
              onChange={handleChange}
              min="1"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Type de contrat :</label>
            <select
              name="typeContrat"
              value={formData.typeContrat}
              onChange={handleChange}
              required
              style={styles.select}
            >
              <option value="Essai">Essai</option>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={loading ? { ...styles.submitButton, ...styles.disabledButton } : styles.submitButton}
          >
            <FiSave size={16} style={{ marginRight: '8px' }} />
            {loading ? 'Envoi en cours...' : 'Ajouter le contrat'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '32px',
    backgroundColor: '#f1f5f9',
    minHeight: '100vh',
  },
  header: {
    marginBottom: '32px',
  },
  headerContent: {
    maxWidth: '1200px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b',
    lineHeight: '1.6',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    maxWidth: '600px',
    margin: '0 auto',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1e293b',
  },
  input: {
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: '#f8fafc',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  select: {
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: '#f8fafc',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  submitButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#1e40af',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
    cursor: 'not-allowed',
  },
  error: {
    fontSize: '14px',
    color: '#dc2626',
    marginBottom: '16px',
    textAlign: 'center',
  },
};

export default CandidatsFormulaire;