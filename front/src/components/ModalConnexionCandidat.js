import React, { useState } from 'react';
import { FiX, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const ModalConnexionCandidat = ({ isOpen, onClose, onSuccess, selectedAnnonce }) => {
  const [mode, setMode] = useState('login'); // 'login' ou 'register'
  const [formData, setFormData] = useState({
    email: '',
    motDePasse: '',
    confirmMotDePasse: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const resetForm = () => {
    setFormData({
      email: '',
      motDePasse: '',
      confirmMotDePasse: ''
    });
    setErreur('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowSuccessMessage(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErreur('');

    try {
      if (mode === 'register') {
        if (formData.motDePasse !== formData.confirmMotDePasse) {
          throw new Error('Les mots de passe ne correspondent pas');
        }
        if (formData.motDePasse.length < 6) {
          throw new Error('Le mot de passe doit contenir au moins 6 caractères');
        }
      }

      const endpoint = mode === 'login' ? '/api/candidats/connexion' : '/api/candidats/inscription';
      const body = mode === 'login' 
        ? { email: formData.email, motDePasse: formData.motDePasse }
        : { email: formData.email, motDePasse: formData.motDePasse };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la connexion');
      }

      if (mode === 'register' && data.redirectToLogin) {
        // Après inscription réussie, basculer vers le mode connexion
        setMode('login');
        setErreur('');
        setFormData({ email: formData.email, motDePasse: '', confirmMotDePasse: '' });
        // Afficher un message de succès
        setShowSuccessMessage(true);
        // Masquer le message après 5 secondes
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 5000);
        return;
      }

      // Stocker le token dans localStorage (pour la connexion)
      if (data.token) {
        localStorage.setItem('candidatToken', data.token);
        localStorage.setItem('candidatData', JSON.stringify(data.candidat));
      }

      // Rediriger vers le formulaire de candidature après connexion réussie
      onSuccess(data);
      handleClose();
    } catch (error) {
      setErreur(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            {mode === 'login' ? 'Connexion' : 'Inscription'}
          </h2>
          <button onClick={handleClose} style={styles.closeBtn}>
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {erreur && (
            <div style={styles.erreur}>
              {erreur}
            </div>
          )}

          {showSuccessMessage && (
            <div style={styles.succes}>
              Inscription réussie ! Connectez-vous avec votre email.
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <FiMail size={16} />
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={styles.input}
              placeholder="votre.email@exemple.com"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <FiLock size={16} />
              Mot de passe
            </label>
            <div style={styles.passwordContainer}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.motDePasse}
                onChange={(e) => setFormData({...formData, motDePasse: e.target.value})}
                style={styles.passwordInput}
                placeholder="Votre mot de passe"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <FiLock size={16} />
                Confirmer le mot de passe
              </label>
              <div style={styles.passwordContainer}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmMotDePasse}
                  onChange={(e) => setFormData({...formData, confirmMotDePasse: e.target.value})}
                  style={styles.passwordInput}
                  placeholder="Confirmez votre mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeBtn}
                >
                  {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Chargement...' : (mode === 'login' ? 'Se connecter' : "S'inscrire")}
          </button>
        </form>

        <div style={styles.switchMode}>
          <p style={styles.switchText}>
            {mode === 'login' ? "Pas encore de compte ?" : "Déjà un compte ?"}
            <button
              type="button"
              onClick={switchMode}
              style={styles.switchBtn}
            >
              {mode === 'login' ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 24px 0 24px'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    color: '#64748b',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#f1f5f9',
      color: '#1e293b'
    }
  },
  form: {
    padding: '24px'
  },
  erreur: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px'
  },
  succes: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#166534',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
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
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    ':focus': {
      borderColor: '#3b82f6'
    }
  },
  passwordContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  passwordInput: {
    width: '100%',
    padding: '12px 16px',
    paddingRight: '48px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '4px'
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#2563eb'
    }
  },
  switchMode: {
    padding: '0 24px 24px 24px',
    borderTop: '1px solid #e5e7eb'
  },
  switchText: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#6b7280',
    margin: '16px 0 0 0'
  },
  switchBtn: {
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    cursor: 'pointer',
    fontWeight: '600',
    marginLeft: '8px',
    textDecoration: 'underline'
  }
};

export default ModalConnexionCandidat;
