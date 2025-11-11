import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiLock, 
  FiMail, 
  FiUser,
  FiUserPlus,
  FiLoader,
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi';

const Inscription = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    motDePasse: '',
    confirmMotDePasse: '',
    idEmploye: ''
  });
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmployes, setLoadingEmployes] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Charger la liste des employés sans compte
    const chargerEmployes = async () => {
      try {
        const response = await fetch('/api/employes/sans-compte');
        const data = await response.json();
        
        if (data.success) {
          setEmployes(data.data);
        } else {
          setError('Erreur lors du chargement des employés');
        }
      } catch (err) {
        setError('Erreur de connexion au serveur');
      } finally {
        setLoadingEmployes(false);
      }
    };

    chargerEmployes();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation côté client
    if (formData.motDePasse !== formData.confirmMotDePasse) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (formData.motDePasse.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    if (!formData.idEmploye) {
      setError('Veuillez sélectionner un employé');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/inscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        setFormData({
          email: '',
          motDePasse: '',
          confirmMotDePasse: '',
          idEmploye: ''
        });
        
        // Optionnel: rediriger vers login après 2 secondes
        setTimeout(() => {
          if (onRegister) {
            onRegister();
          }
        }, 2000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.registerBox}>
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <FiUserPlus size={48} color="#1e40af" />
          </div>
          <h1 style={styles.title}>Inscription</h1>
          <p style={styles.subtitle}>Créez votre compte pour accéder à l'application</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <FiUser size={16} style={styles.labelIcon} />
              Employé à inscrire
            </label>
            {loadingEmployes ? (
              <div style={styles.loadingSelect}>
                <FiLoader size={18} style={styles.spinningIcon} />
                Chargement des employés...
              </div>
            ) : (
              <div style={styles.inputContainer}>
                <FiUser size={18} style={styles.inputIcon} />
                <select
                  name="idEmploye"
                  value={formData.idEmploye}
                  onChange={handleChange}
                  style={styles.select}
                  required
                >
                  <option value="">-- Sélectionner un employé --</option>
                  {employes.map(employe => (
                    <option key={employe.id} value={employe.id}>
                      {employe.prenom} {employe.nom} - {employe.nomDepartement}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <FiMail size={16} style={styles.labelIcon} />
              Email
            </label>
            <div style={styles.inputContainer}>
              <FiMail size={18} style={styles.inputIcon} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
                placeholder="votre.email@exemple.com"
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <FiLock size={16} style={styles.labelIcon} />
              Mot de passe
            </label>
            <div style={styles.inputContainer}>
              <FiLock size={18} style={styles.inputIcon} />
              <input
                type="password"
                name="motDePasse"
                value={formData.motDePasse}
                onChange={handleChange}
                style={styles.input}
                placeholder="Au moins 6 caractères"
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <FiLock size={16} style={styles.labelIcon} />
              Confirmer le mot de passe
            </label>
            <div style={styles.inputContainer}>
              <FiLock size={18} style={styles.inputIcon} />
              <input
                type="password"
                name="confirmMotDePasse"
                value={formData.confirmMotDePasse}
                onChange={handleChange}
                style={styles.input}
                placeholder="Répétez votre mot de passe"
                required
              />
            </div>
          </div>

          {error && (
            <div style={styles.error}>
              <FiAlertCircle size={16} style={styles.errorIcon} />
              {error}
            </div>
          )}

          {success && (
            <div style={styles.success}>
              <FiCheckCircle size={16} style={styles.successIcon} />
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              ...(loading ? styles.disabledButton : {})
            }}
          >
            {loading ? (
              <>
                <FiLoader size={18} style={styles.spinningIcon} />
                Inscription...
              </>
            ) : (
              <>
                <FiUserPlus size={18} />
                S'inscrire
              </>
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Déjà un compte ?{' '}
            <Link to="/login" style={styles.link}>
              Se connecter ici
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },
  registerBox: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    padding: '48px',
    width: '100%',
    maxWidth: '480px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  iconContainer: {
    width: '80px',
    height: '80px',
    borderRadius: '20px',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px auto'
  },
  title: {
    color: '#1e293b',
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '8px'
  },
  subtitle: {
    color: '#64748b',
    fontSize: '16px',
    lineHeight: '1.6',
    margin: 0
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    color: '#1e293b',
    fontWeight: '600',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  labelIcon: {
    color: '#64748b'
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    color: '#94a3b8',
    zIndex: 1
  },
  input: {
    padding: '16px 16px 16px 48px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    outline: 'none',
    width: '100%',
    backgroundColor: '#ffffff'
  },
  select: {
    padding: '16px 16px 16px 48px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    outline: 'none',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    width: '100%'
  },
  loadingSelect: {
    padding: '16px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '16px',
    color: '#64748b',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  submitButton: {
    backgroundColor: '#1e40af',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '16px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
    cursor: 'not-allowed'
  },
  spinningIcon: {
    animation: 'spin 1s linear infinite'
  },
  error: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    padding: '16px',
    borderRadius: '12px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  errorIcon: {
    flexShrink: 0
  },
  success: {
    backgroundColor: '#f0fdf4',
    color: '#059669',
    border: '1px solid #bbf7d0',
    padding: '16px',
    borderRadius: '12px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  successIcon: {
    flexShrink: 0
  },
  footer: {
    textAlign: 'center',
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #e2e8f0'
  },
  footerText: {
    color: '#64748b',
    fontSize: '14px',
    margin: 0
  },
  link: {
    color: '#1e40af',
    textDecoration: 'none',
    fontWeight: '600'
  }
};

export default Inscription;
