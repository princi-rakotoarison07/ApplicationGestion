import React, { useState, useEffect } from 'react';
import ClientNavbar from '../../components/client/ClientNavbar';
import { 
  FiSearch, 
  FiMapPin
} from 'react-icons/fi';

const HireHubHome = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [jobStats, setJobStats] = useState({
    totalJobs: 0,
    companies: 0,
    candidates: 0
  });

  useEffect(() => {
    // Animation des statistiques
    const animateStats = () => {
      setTimeout(() => setJobStats({ totalJobs: 1247, companies: 89, candidates: 3456 }), 500);
    };
    animateStats();
  }, []);


  return (
    <div style={styles.container}>
      <ClientNavbar />
      
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroText}>
            <h1 style={styles.heroTitle}>
              Trouvez votre <span style={styles.highlight}>emploi idéal</span> à Madagascar
            </h1>
            <p style={styles.heroSubtitle}>
              Découvrez des milliers d'opportunités professionnelles et donnez un nouvel élan à votre carrière
            </p>
            
            {/* Search Bar */}
            <div style={styles.searchContainer}>
              <div style={styles.searchBar}>
                <div style={styles.searchInput}>
                  <FiSearch style={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Poste, mot-clé..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={styles.locationInput}>
                  <FiMapPin style={styles.locationIcon} />
                  <input
                    type="text"
                    placeholder="Ville, région..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={styles.input}
                  />
                </div>
                <button style={styles.searchButton}>
                  <FiSearch size={20} />
                  <span>Rechercher</span>
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div style={styles.quickStats}>
              <div style={styles.stat}>
                <span style={styles.statNumber}>{jobStats.totalJobs.toLocaleString()}</span>
                <span style={styles.statLabel}>Annonces actives</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statNumber}>{jobStats.companies}</span>
                <span style={styles.statLabel}>Entreprises</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statNumber}>{jobStats.candidates.toLocaleString()}</span>
                <span style={styles.statLabel}>Candidats</span>
              </div>
            </div>
          </div>
          
          <div style={styles.heroImage}>
            <div style={styles.heroImageContainer}>
              <img 
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=400&fit=crop" 
                alt="Professionnels au travail"
                style={styles.heroImg}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section style={styles.categoriesSection}>
        <div style={styles.sectionContent}>
          <h2 style={styles.sectionTitle}>Explorez par catégorie</h2>
          <p style={styles.sectionSubtitle}>Découvrez les opportunités dans différents secteurs</p>
          
          <div style={styles.categoriesGrid}>
            <div style={styles.categoryCard}>
              <div style={{...styles.categoryIcon, backgroundColor: '#dbeafe'}}>
                <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=80&h=80&fit=crop" alt="Tech" style={styles.categoryImg} />
              </div>
              <h3 style={styles.categoryName}>Technologie & IT</h3>
              <p style={styles.categoryCount}>245 postes disponibles</p>
            </div>
            
            <div style={styles.categoryCard}>
              <div style={{...styles.categoryIcon, backgroundColor: '#d1fae5'}}>
                <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=80&h=80&fit=crop" alt="Finance" style={styles.categoryImg} />
              </div>
              <h3 style={styles.categoryName}>Finance & Comptabilité</h3>
              <p style={styles.categoryCount}>189 postes disponibles</p>
            </div>
            
            <div style={styles.categoryCard}>
              <div style={{...styles.categoryIcon, backgroundColor: '#fef3c7'}}>
                <img src="https://images.unsplash.com/photo-1561070791-2526d30994b5?w=80&h=80&fit=crop" alt="Marketing" style={styles.categoryImg} />
              </div>
              <h3 style={styles.categoryName}>Marketing & Vente</h3>
              <p style={styles.categoryCount}>312 postes disponibles</p>
            </div>
            
            <div style={styles.categoryCard}>
              <div style={{...styles.categoryIcon, backgroundColor: '#fce7f3'}}>
                <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=80&h=80&fit=crop" alt="Medical" style={styles.categoryImg} />
              </div>
              <h3 style={styles.categoryName}>Santé & Médical</h3>
              <p style={styles.categoryCount}>156 postes disponibles</p>
            </div>
            
            <div style={styles.categoryCard}>
              <div style={{...styles.categoryIcon, backgroundColor: '#e0e7ff'}}>
                <img src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=80&h=80&fit=crop" alt="Education" style={styles.categoryImg} />
              </div>
              <h3 style={styles.categoryName}>Éducation & Formation</h3>
              <p style={styles.categoryCount}>98 postes disponibles</p>
            </div>
            
            <div style={styles.categoryCard}>
              <div style={{...styles.categoryIcon, backgroundColor: '#fef2f2'}}>
                <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=80&h=80&fit=crop" alt="Design" style={styles.categoryImg} />
              </div>
              <h3 style={styles.categoryName}>Design & Créatif</h3>
              <p style={styles.categoryCount}>134 postes disponibles</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section style={styles.featuredSection}>
        <div style={styles.sectionContent}>
          <div style={styles.featuredHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Offres en vedette</h2>
              <p style={styles.sectionSubtitle}>Les meilleures opportunités du moment</p>
            </div>
            <button style={styles.viewAllButton}>Voir tout →</button>
          </div>
          
          <div style={styles.featuredGrid}>
            <div style={styles.featuredCard}>
              <div style={styles.featuredImage}>
                <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop" alt="Bureau moderne" style={styles.featuredImg} />
                <div style={styles.featuredBadge}>CDI</div>
              </div>
              <div style={styles.featuredContent}>
                <div style={styles.featuredCompany}>
                  <div style={styles.companyLogo}>🏢</div>
                  <div>
                    <h4 style={styles.featuredJobTitle}>Développeur Full Stack Senior</h4>
                    <p style={styles.featuredCompanyName}>TechCorp Madagascar</p>
                  </div>
                </div>
                <p style={styles.featuredDescription}>Nous recherchons un développeur expérimenté pour rejoindre notre équipe dynamique...</p>
                <div style={styles.featuredMeta}>
                  <span style={styles.metaItem}>📍 Antananarivo</span>
                  <span style={styles.metaItem}>💰 2,500,000 - 4,000,000 Ar/mois</span>
                </div>
              </div>
            </div>
            
            <div style={styles.featuredCard}>
              <div style={styles.featuredImage}>
                <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop" alt="Équipe de travail" style={styles.featuredImg} />
                <div style={styles.featuredBadge}>CDI</div>
              </div>
              <div style={styles.featuredContent}>
                <div style={styles.featuredCompany}>
                  <div style={styles.companyLogo}>📊</div>
                  <div>
                    <h4 style={styles.featuredJobTitle}>Chef de Projet Marketing Digital</h4>
                    <p style={styles.featuredCompanyName}>Digital Agency Mada</p>
                  </div>
                </div>
                <p style={styles.featuredDescription}>Pilotez des campagnes marketing innovantes et gérez une équipe créative...</p>
                <div style={styles.featuredMeta}>
                  <span style={styles.metaItem}>📍 Antananarivo</span>
                  <span style={styles.metaItem}>💰 3,000,000 - 5,000,000 Ar/mois</span>
                </div>
              </div>
            </div>
            
            <div style={styles.featuredCard}>
              <div style={styles.featuredImage}>
                <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop" alt="Analyse de données" style={styles.featuredImg} />
                <div style={styles.featuredBadge}>CDD</div>
              </div>
              <div style={styles.featuredContent}>
                <div style={styles.featuredCompany}>
                  <div style={styles.companyLogo}>💼</div>
                  <div>
                    <h4 style={styles.featuredJobTitle}>Analyste Financier</h4>
                    <p style={styles.featuredCompanyName}>FinanceGroup Madagascar</p>
                  </div>
                </div>
                <p style={styles.featuredDescription}>Rejoignez notre équipe finance et contribuez aux analyses stratégiques...</p>
                <div style={styles.featuredMeta}>
                  <span style={styles.metaItem}>📍 Antananarivo</span>
                  <span style={styles.metaItem}>💰 2,000,000 - 3,500,000 Ar/mois</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={styles.howItWorksSection}>
        <div style={styles.sectionContent}>
          <h2 style={styles.sectionTitle}>Comment ça marche</h2>
          <p style={styles.sectionSubtitle}>Trouvez votre emploi idéal en 3 étapes simples</p>
          
          <div style={styles.stepsGrid}>
            <div style={styles.stepCard}>
              <img src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=300&h=200&fit=crop" alt="Créer un profil" style={styles.stepImage} />
              <div style={styles.stepNumber}>1</div>
              <h3 style={styles.stepTitle}>Créez votre profil</h3>
              <p style={styles.stepDescription}>Inscrivez-vous gratuitement et complétez votre profil professionnel en quelques minutes</p>
            </div>
            
            <div style={styles.stepCard}>
              <img src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=300&h=200&fit=crop" alt="Rechercher" style={styles.stepImage} />
              <div style={styles.stepNumber}>2</div>
              <h3 style={styles.stepTitle}>Recherchez des offres</h3>
              <p style={styles.stepDescription}>Parcourez des milliers d'offres d'emploi adaptées à votre profil et vos compétences</p>
            </div>
            
            <div style={styles.stepCard}>
              <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=300&h=200&fit=crop" alt="Postuler" style={styles.stepImage} />
              <div style={styles.stepNumber}>3</div>
              <h3 style={styles.stepTitle}>Postulez facilement</h3>
              <p style={styles.stepDescription}>Candidatez en un clic et suivez l'évolution de vos candidatures en temps réel</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>Prêt à démarrer votre nouvelle carrière ?</h2>
          <p style={styles.ctaSubtitle}>Rejoignez des milliers de professionnels qui ont trouvé leur emploi idéal avec HireHub</p>
          <div style={styles.ctaButtons}>
            <button style={styles.ctaPrimaryButton}>Créer mon compte</button>
            <button style={styles.ctaSecondaryButton}>Voir les offres</button>
          </div>
        </div>
      </section>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#ffffff'
  },
  hero: {
    background: 'linear-gradient(135deg, #1e3a8a 0%, #0ea5e9 100%)',
    padding: '100px 0',
    color: '#ffffff'
  },
  heroContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '60px'
  },
  heroText: {
    flex: 1
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: '700',
    lineHeight: '1.2',
    marginBottom: '20px'
  },
  highlight: {
    color: '#0ea5e9'
  },
  heroSubtitle: {
    fontSize: '20px',
    lineHeight: '1.6',
    marginBottom: '40px',
    opacity: 0.9
  },
  searchContainer: {
    marginBottom: '40px'
  },
  searchBar: {
    display: 'flex',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '8px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    gap: '8px'
  },
  searchInput: {
    flex: 2,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 16px'
  },
  locationInput: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 16px',
    borderLeft: '1px solid #e5e7eb'
  },
  searchIcon: {
    color: '#6b7280',
    fontSize: '20px'
  },
  locationIcon: {
    color: '#6b7280',
    fontSize: '20px'
  },
  input: {
    border: 'none',
    outline: 'none',
    fontSize: '16px',
    color: '#1f2937',
    backgroundColor: 'transparent',
    width: '100%'
  },
  searchButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#1e3a8a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '16px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  quickStats: {
    display: 'flex',
    gap: '40px'
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#0ea5e9'
  },
  statLabel: {
    fontSize: '14px',
    opacity: 0.8
  },
  heroImage: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center'
  },
  heroImageContainer: {
    width: '400px',
    height: '300px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
    overflow: 'hidden'
  },
  heroImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '20px'
  },
  categoryImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '12px'
  },
  categoriesSection: {
    padding: '80px 0',
    backgroundColor: '#f9fafb'
  },
  sectionContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  },
  sectionTitle: {
    fontSize: '36px',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '16px',
    color: '#1f2937'
  },
  sectionSubtitle: {
    fontSize: '18px',
    textAlign: 'center',
    marginBottom: '60px',
    color: '#6b7280'
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px'
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '16px',
    textAlign: 'center',
    border: '2px solid transparent',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
  },
  featuredSection: {
    padding: '80px 0',
    backgroundColor: '#ffffff'
  },
  featuredHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px'
  },
  featuredGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '32px'
  },
  featuredCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer'
  },
  featuredImage: {
    position: 'relative',
    height: '200px',
    overflow: 'hidden'
  },
  featuredImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease'
  },
  featuredBadge: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  featuredContent: {
    padding: '24px'
  },
  featuredCompany: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  },
  companyLogo: {
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px'
  },
  featuredJobTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '4px'
  },
  featuredCompanyName: {
    fontSize: '14px',
    color: '#6b7280'
  },
  featuredDescription: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.6',
    marginBottom: '16px'
  },
  featuredMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px'
  },
  metaItem: {
    fontSize: '13px',
    color: '#4b5563',
    fontWeight: '500'
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '32px'
  },
  stepCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    overflow: 'hidden',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    position: 'relative'
  },
  stepImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover'
  },
  stepNumber: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: '700',
    margin: '-25px auto 20px',
    border: '4px solid #ffffff',
    position: 'relative',
    zIndex: 1
  },
  stepTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#1f2937',
    padding: '0 24px'
  },
  stepDescription: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.6',
    padding: '0 24px 24px'
  },
  categoryIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px'
  },
  categoryEmoji: {
    fontSize: '32px'
  },
  categoryName: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#1f2937'
  },
  categoryCount: {
    fontSize: '16px',
    color: '#6b7280'
  },
  viewAllButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'transparent',
    color: '#3b82f6',
    border: '1px solid #3b82f6',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  howItWorksSection: {
    padding: '80px 0',
    backgroundColor: '#f9fafb'
  },
  ctaSection: {
    padding: '80px 0',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff'
  },
  ctaContent: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 20px',
    textAlign: 'center'
  },
  ctaTitle: {
    fontSize: '36px',
    fontWeight: '700',
    marginBottom: '20px'
  },
  ctaSubtitle: {
    fontSize: '18px',
    marginBottom: '40px',
    opacity: 0.9
  },
  ctaButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px'
  },
  ctaPrimaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#fbbf24',
    color: '#1f2937',
    border: 'none',
    borderRadius: '8px',
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  ctaSecondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'transparent',
    color: '#ffffff',
    border: '1px solid #ffffff',
    borderRadius: '8px',
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  footer: {
    backgroundColor: '#1f2937',
    color: '#ffffff',
    padding: '60px 0 20px'
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '60px'
  },
  footerSection: {
    display: 'flex',
    flexDirection: 'column'
  },
  footerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px'
  },
  footerDescription: {
    fontSize: '16px',
    color: '#9ca3af',
    lineHeight: '1.6'
  },
  footerLinks: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '40px'
  },
  footerColumn: {
    display: 'flex',
    flexDirection: 'column'
  },
  footerColumnTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '20px'
  },
  footerLink: {
    color: '#9ca3af',
    textDecoration: 'none',
    marginBottom: '12px',
    fontSize: '16px',
    transition: 'color 0.2s ease'
  },
  footerBottom: {
    maxWidth: '1200px',
    margin: '40px auto 0',
    padding: '20px 20px 0',
    borderTop: '1px solid #374151',
    textAlign: 'center'
  },
  footerCopyright: {
    color: '#9ca3af',
    fontSize: '14px'
  }
};

export default HireHubHome;
