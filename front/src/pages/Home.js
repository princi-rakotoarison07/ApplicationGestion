import { Link } from 'react-router-dom';
import { 
  FiUsers, 
  FiBarChart2, 
  FiSettings, 
  FiTrendingUp,
  FiDatabase,
  FiArrowRight
} from 'react-icons/fi';

const Home = () => {
  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Tableau de Bord RH</h1>
          <p style={styles.subtitle}>
            Gérez efficacement vos ressources humaines avec notre plateforme moderne
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <FiUsers size={24} color="#1e40af" />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>156</div>
            <div style={styles.statLabel}>Employés Actifs</div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <FiTrendingUp size={24} color="#059669" />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>23</div>
            <div style={styles.statLabel}>Nouveaux Recrutements</div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <FiBarChart2 size={24} color="#dc2626" />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>8</div>
            <div style={styles.statLabel}>Entretiens Programmés</div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <FiDatabase size={24} color="#7c3aed" />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>5</div>
            <div style={styles.statLabel}>Départements</div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div style={styles.featuresGrid}>
        <div style={styles.featureCard}>
          <div style={styles.featureHeader}>
            <div style={styles.featureIcon}>
              <FiUsers size={32} color="#1e40af" />
            </div>
            <h3 style={styles.featureTitle}>Gestion des Employés</h3>
          </div>
          <p style={styles.featureDescription}>
            Gérez les profils, les départements et les informations de vos employés en temps réel
          </p>
          <Link to="/utilisateurs" style={styles.featureButton}>
            <span>Accéder</span>
            <FiArrowRight size={16} />
          </Link>
        </div>

                <div style={styles.featureCard}>
          <div style={styles.featureHeader}>
            <div style={styles.featureIcon}>
              <FiUsers size={32} color="#1e40af" />
            </div>
            <h3 style={styles.featureTitle}>Liste des candidats</h3>
          </div>
          <p style={styles.featureDescription}>
            Liste des candidats
          </p>
          <Link to="/candidats" style={styles.featureButton}>
            <span>Accéder</span>
            <FiArrowRight size={16} />
          </Link>
        </div>

        <div style={styles.featureCard}>
          <div style={styles.featureHeader}>
            <div style={styles.featureIcon}>
              <FiBarChart2 size={32} color="#059669" />
            </div>
            <h3 style={styles.featureTitle}>Rapports & Analytics</h3>
          </div>
          <p style={styles.featureDescription}>
            Analysez les tendances RH et générez des rapports détaillés sur vos équipes
          </p>
          <button style={{...styles.featureButton, ...styles.disabledButton}}>
            <span>Bientôt disponible</span>
          </button>
        </div>

        <div style={styles.featureCard}>
          <div style={styles.featureHeader}>
            <div style={styles.featureIcon}>
              <FiSettings size={32} color="#dc2626" />
            </div>
            <h3 style={styles.featureTitle}>Configuration</h3>
          </div>
          <p style={styles.featureDescription}>
            Personnalisez les paramètres système et configurez les workflows RH
          </p>
          <button style={{...styles.featureButton, ...styles.disabledButton}}>
            <span>Bientôt disponible</span>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.quickActions}>
        <h2 style={styles.sectionTitle}>Actions Rapides</h2>
        <div style={styles.actionsGrid}>
          <button style={styles.actionButton}>
            <FiUsers size={20} />
            <span>Nouvel Employé</span>
          </button>
          <button style={styles.actionButton}>
            <FiBarChart2 size={20} />
            <span>Générer Rapport</span>
          </button>
          <button style={styles.actionButton}>
            <FiSettings size={20} />
            <span>Paramètres</span>
          </button>
        </div>
      </div>
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
    marginBottom: '32px'
  },
  headerContent: {
    maxWidth: '1200px'
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
    marginBottom: '40px'
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '16px',
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
    backgroundColor: '#f8fafc',
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
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '24px',
    marginBottom: '40px'
  },
  featureCard: {
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s ease'
  },
  featureHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px'
  },
  featureIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  featureTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0
  },
  featureDescription: {
    color: '#64748b',
    lineHeight: '1.6',
    marginBottom: '24px',
    fontSize: '15px'
  },
  featureButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#1e40af',
    color: '#ffffff',
    padding: '12px 20px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '14px'
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
    cursor: 'not-allowed'
  },
  quickActions: {
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '20px'
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    fontWeight: '500',
    color: '#475569'
  }
};

export default Home;
