import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClientNavbar from '../../components/client/ClientNavbar';
import ModalConnexionCandidat from '../../components/ModalConnexionCandidat';
import { 
  FiArrowLeft,
  FiCalendar,
  FiMapPin,
  FiBriefcase,
  FiUser,
  FiClock,
  FiHome,
  FiTag,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';

const DetailsAnnonceClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchAnnonceDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAnnonceDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/client/annonce/${id}`);
      
      if (!response.ok) {
        throw new Error('Annonce non trouvée');
      }
      
      const data = await response.json();
      if (data.success) {
        setAnnonce(data.data);
      } else {
        throw new Error(data.message || 'Erreur lors du chargement');
      }
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handlePostuler = () => {
    // Vérifier si l'utilisateur est déjà connecté
    const candidatToken = localStorage.getItem('candidatToken');
    
    if (candidatToken) {
      // Si connecté, aller directement au formulaire de candidature
      navigate(`/candidature/${id}`, { 
        state: { 
          idAnnonce: id, 
          annonce: annonce 
        } 
      });
    } else {
      // Si pas connecté, ouvrir le modal de connexion
      setModalOpen(true);
    }
  };

  const handleLoginSuccess = (data) => {
    navigate(`/candidature/${id}`, { 
      state: { 
        idAnnonce: id, 
        annonce: annonce 
      } 
    });
  };

  const isActive = () => {
    if (!annonce) return false;
    return new Date(annonce.dateFin) >= new Date();
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <ClientNavbar />
        <div style={styles.loading}>
          <div style={styles.loadingSpinner}></div>
          <p>Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (error || !annonce) {
    return (
      <div style={styles.container}>
        <ClientNavbar />
        <div style={styles.error}>
          <FiAlertCircle size={48} color="#ef4444" />
          <h2>Erreur</h2>
          <p>{error || 'Annonce non trouvée'}</p>
          <button onClick={() => navigate('/HireHub/annonces')} style={styles.backButton}>
            Retour aux annonces
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <ClientNavbar />
      
      {/* Header */}
      <section style={styles.header}>
        <div style={styles.headerContent}>
          <button 
            onClick={() => navigate('/HireHub/annonces')} 
            style={styles.backBtn}
          >
            <FiArrowLeft size={20} />
            <span>Retour aux annonces</span>
          </button>
          
          <div style={styles.headerInfo}>
            <div style={styles.statusBadge}>
              {isActive() ? (
                <>
                  <FiCheckCircle size={16} />
                  <span>Annonce active</span>
                </>
              ) : (
                <>
                  <FiAlertCircle size={16} />
                  <span>Annonce expirée</span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section style={styles.mainSection}>
        <div style={styles.mainContent}>
          <div style={styles.contentGrid}>
            
            {/* Left Column - Main Info */}
            <div style={styles.leftColumn}>
              <div style={styles.mainCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.logoContainer}>
                    <FiBriefcase size={32} color="#1e3a8a" />
                  </div>
                  <div style={styles.typeTag}>
                    {annonce.typeAnnonce || 'CDI'}
                  </div>
                </div>
                
                <h1 style={styles.title}>
                  Référence: {annonce.reference}
                </h1>
                
                <div style={styles.metaInfo}>
                  <div style={styles.metaItem}>
                    <FiUser size={18} color="#6b7280" />
                    <span>Profil recherché: {annonce.nomProfil || 'Non spécifié'}</span>
                  </div>
                  <div style={styles.metaItem}>
                    <FiHome size={18} color="#6b7280" />
                    <span>Département: {annonce.nomDepartement || 'Non spécifié'}</span>
                  </div>
                  <div style={styles.metaItem}>
                    <FiCalendar size={18} color="#6b7280" />
                    <span>Date de début: {formatDate(annonce.dateDebut)}</span>
                  </div>
                  <div style={styles.metaItem}>
                    <FiClock size={18} color="#6b7280" />
                    <span>Date de fin: {formatDate(annonce.dateFin)}</span>
                  </div>
                </div>

                <div style={styles.descriptionSection}>
                  <h3 style={styles.sectionTitle}>Description du poste</h3>
                  <div style={styles.description}>
                    {annonce.description ? (
                      annonce.description.split('\n').map((paragraph, index) => (
                        <p key={index} style={styles.paragraph}>
                          {paragraph}
                        </p>
                      ))
                    ) : (
                      <p style={styles.noDescription}>
                        Aucune description détaillée disponible pour cette annonce.
                      </p>
                    )}
                  </div>
                </div>

                <div style={styles.actionSection}>
                  <button 
                    style={{
                      ...styles.applyButton,
                      ...(isActive() ? {} : styles.disabledButton)
                    }}
                    onClick={handlePostuler}
                    disabled={!isActive()}
                  >
                    <FiUser size={20} />
                    <span>
                      {!isActive() ? 'Annonce expirée' : 
                       localStorage.getItem('candidatToken') ? 'Candidater maintenant' : 'Postuler maintenant'}
                    </span>
                  </button>
                  
                  {isActive() && !localStorage.getItem('candidatToken') && (
                    <p style={styles.applyNote}>
                      Vous devrez vous connecter ou créer un compte pour postuler
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Additional Info */}
            <div style={styles.rightColumn}>
              <div style={styles.infoCard}>
                <h3 style={styles.cardTitle}>Informations complémentaires</h3>
                
                <div style={styles.infoList}>
                  <div style={styles.infoItem}>
                    <FiTag size={16} color="#1e3a8a" />
                    <div>
                      <strong>Type de contrat</strong>
                      <p>{annonce.typeAnnonce || 'CDI'}</p>
                    </div>
                  </div>
                  
                  <div style={styles.infoItem}>
                    <FiMapPin size={16} color="#1e3a8a" />
                    <div>
                      <strong>Localisation</strong>
                      <p>{annonce.nomDepartement || 'Non spécifié'}</p>
                    </div>
                  </div>
                  
                  <div style={styles.infoItem}>
                    <FiBriefcase size={16} color="#1e3a8a" />
                    <div>
                      <strong>Profil recherché</strong>
                      <p>{annonce.nomProfil || 'Non spécifié'}</p>
                    </div>
                  </div>
                  
                  <div style={styles.infoItem}>
                    <FiCalendar size={16} color="#1e3a8a" />
                    <div>
                      <strong>Période</strong>
                      <p>Du {formatDate(annonce.dateDebut)} au {formatDate(annonce.dateFin)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.tipsCard}>
                <h3 style={styles.cardTitle}>Conseils pour postuler</h3>
                <ul style={styles.tipsList}>
                  <li>Préparez un CV à jour</li>
                  <li>Rédigez une lettre de motivation personnalisée</li>
                  <li>Mettez en avant vos compétences pertinentes</li>
                  <li>Vérifiez que votre profil correspond aux exigences</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ModalConnexionCandidat
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleLoginSuccess}
        selectedAnnonce={annonce}
      />
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '20px'
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #1e3a8a',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  error: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '20px',
    textAlign: 'center'
  },
  backButton: {
    backgroundColor: '#1e3a8a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  header: {
    backgroundColor: '#1e3a8a',
    color: '#ffffff',
    padding: '30px 0'
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'transparent',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  headerInfo: {
    display: 'flex',
    alignItems: 'center'
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500'
  },
  mainSection: {
    padding: '40px 0'
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '40px',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr'
    }
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column'
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  mainCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e5e7eb'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  logoContainer: {
    width: '60px',
    height: '60px',
    backgroundColor: '#dbeafe',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  typeTag: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '24px',
    lineHeight: '1.3'
  },
  metaInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '32px'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '16px',
    color: '#4b5563'
  },
  descriptionSection: {
    marginBottom: '32px'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '16px'
  },
  description: {
    lineHeight: '1.7'
  },
  paragraph: {
    fontSize: '16px',
    color: '#4b5563',
    marginBottom: '12px',
    margin: '0 0 12px 0'
  },
  noDescription: {
    fontSize: '16px',
    color: '#9ca3af',
    fontStyle: 'italic'
  },
  actionSection: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '24px'
  },
  applyButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    backgroundColor: '#1e3a8a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '16px 32px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: '100%'
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed'
  },
  applyNote: {
    fontSize: '14px',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: '12px',
    margin: '12px 0 0 0'
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e5e7eb'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '20px'
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  infoItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  },
  tipsCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #0ea5e9'
  },
  tipsList: {
    fontSize: '14px',
    color: '#1e3a8a',
    paddingLeft: '20px',
    margin: 0
  }
};

export default DetailsAnnonceClient;
