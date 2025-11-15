import { useMemo, useState } from 'react';

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
    periodeEssaiMois: '',
    salaire: '',
    poste: '',
    commentaire: '',
    estRenouvele: false,
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const computedDateFin = useMemo(() => {
    try {
      if (!formData.dateDebut) return '';
      const months = parseInt(formData.nombreMois, 10);
      if (!months || months <= 0) return '';
      const d = new Date(formData.dateDebut);
      d.setMonth(d.getMonth() + months);
      // Format YYYY-MM-DD
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    } catch {
      return '';
    }
  }, [formData.dateDebut, formData.nombreMois]);

  const computedDateFinEssai = useMemo(() => {
    try {
      if (!formData.dateDebut) return '';
      const months = parseInt(formData.periodeEssaiMois, 10);
      if (!months || months <= 0) return '';
      const d = new Date(formData.dateDebut);
      d.setMonth(d.getMonth() + months);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    } catch {
      return '';
    }
  }, [formData.dateDebut, formData.periodeEssaiMois]);

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
        body: JSON.stringify({
          ...formData,
          // Envoyer les dates calculées côté client à titre indicatif; le serveur recalcule aussi
          dateFin: computedDateFin || null,
          dateFinEssai: computedDateFinEssai || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du contrat');
      }

      const data = await response.json();
      if (data.success) {
        alert('Contrat ajouté avec succès !');
        navigate('/contrats');
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
          <h1 style={styles.title}>Ajouter un Contrat</h1>
          <p style={styles.subtitle}>
            {location.state?.employeNom && location.state?.employePrenom ? (
              <>
                Employé: <strong>{location.state.employePrenom} {location.state.employeNom}</strong>
                {location.state?.annonceReference && (
                  <> • Annonce: <strong>{location.state.annonceReference}</strong></>
                )}
              </>
            ) : (
              `Remplissez les détails du contrat pour l'employé ID: ${id}`
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
          {computedDateFin && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Date de fin (calculée) :</label>
              <input type="text" value={computedDateFin} readOnly style={styles.inputReadOnly} />
            </div>
          )}
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
          {formData.typeContrat === 'Essai' && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>Période d'essai (mois) :</label>
                <input
                  type="number"
                  name="periodeEssaiMois"
                  value={formData.periodeEssaiMois}
                  onChange={handleChange}
                  min="1"
                  required
                  style={styles.input}
                />
              </div>
              {computedDateFinEssai && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Fin d'essai (calculée) :</label>
                  <input type="text" value={computedDateFinEssai} readOnly style={styles.inputReadOnly} />
                </div>
              )}
            </>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>Poste :</label>
            <input
              type="text"
              name="poste"
              value={formData.poste}
              onChange={handleChange}
              placeholder="Ex: Développeur Full-Stack"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Salaire :</label>
            <input
              type="number"
              name="salaire"
              value={formData.salaire}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="Ex: 1200.00"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Commentaire :</label>
            <textarea
              name="commentaire"
              value={formData.commentaire}
              onChange={handleChange}
              rows={3}
              style={styles.textarea}
              placeholder="Notes sur le contrat..."
            />
          </div>

          <div style={{...styles.formGroup, flexDirection: 'row', alignItems: 'center', gap: '8px'}}>
            <input
              type="checkbox"
              id="estRenouvele"
              name="estRenouvele"
              checked={formData.estRenouvele}
              onChange={handleChange}
            />
            <label htmlFor="estRenouvele" style={styles.label}>Renouvelable</label>
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