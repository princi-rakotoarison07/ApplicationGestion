import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiArrowLeft, FiHome } from 'react-icons/fi';

const CandidatureConfirmee = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { message, annonce } = location.state || {};

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <FiCheckCircle size={64} color="#059669" />
        </div>
        
        <h1 style={styles.title}>Candidature envoyée !</h1>
        
        <p style={styles.message}>
          {message || 'Votre candidature a été soumise avec succès.'}
        </p>
        
        {annonce && (
          <div style={styles.annonceInfo}>
            <h3 style={styles.annonceTitle}>Poste : {annonce.reference}</h3>
            <p style={styles.annonceDept}>Département : {annonce.nomDepartement}</p>
          </div>
        )}
        
        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            Nous avons bien reçu votre candidature. Notre équipe RH l'examinera dans les plus brefs délais.
            Vous recevrez une réponse par email à l'adresse associée à votre compte.
          </p>
        </div>
        
        <div style={styles.actions}>
          <button 
            onClick={() => navigate('/offres')} 
            style={styles.primaryBtn}
          >
            <FiHome size={16} />
            Retour aux offres
          </button>
          
          <button 
            onClick={() => navigate(-2)} 
            style={styles.secondaryBtn}
          >
            <FiArrowLeft size={16} />
            Retour
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'Inter, sans-serif'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '40px',
    textAlign: 'center',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  },
  iconContainer: {
    marginBottom: '24px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '16px'
  },
  message: {
    fontSize: '16px',
    color: '#64748b',
    marginBottom: '24px',
    lineHeight: '1.6'
  },
  annonceInfo: {
    backgroundColor: '#f1f5f9',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px'
  },
  annonceTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 8px 0'
  },
  annonceDept: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '32px'
  },
  infoText: {
    fontSize: '14px',
    color: '#1e40af',
    margin: 0,
    lineHeight: '1.5'
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#059669',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  secondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'transparent',
    color: '#64748b',
    border: '1px solid #d1d5db',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }
};

export default CandidatureConfirmee;
