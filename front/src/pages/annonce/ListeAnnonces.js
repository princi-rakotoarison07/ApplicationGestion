import { useEffect, useState } from "react";
import { 
  FiBriefcase, 
  FiMapPin, 
  FiClock, 
  FiDollarSign, 
  FiEye, 
  FiEdit3, 
  FiTrash2,
  FiPlus,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiUsers
} from 'react-icons/fi';

const ListeAnnonces = ({ onCreerAnnonce }) => {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const chargerAnnonces = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch("/api/annonces", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des annonces');
        }

        const data = await response.json();
        
        if (data.success) {
          // Transformer les données de la base pour correspondre au format attendu
          const annoncesTransformees = data.data.map(annonce => ({
            id: annonce.id,
            titre: annonce.reference || `Annonce ${annonce.id}`,
            reference: annonce.reference,
            entreprise: annonce.nomDepartement || "Département non spécifié",
            lieu: "Antananarivo, Madagascar", // Valeur par défaut
            type: annonce.typeAnnonce || "CDI", // Utiliser le type de la base
            salaire: "À négocier", // Valeur par défaut, peut être ajoutée à la base plus tard
            datePublication: annonce.dateDebut,
            dateExpiration: annonce.dateFin,
            description: annonce.description || "Description non disponible",
            competences: [], // Peut être ajouté plus tard
            statut: new Date(annonce.dateFin) >= new Date() ? "active" : "expired"
          }));
          
          setAnnonces(annoncesTransformees);
        } else {
          throw new Error(data.message || 'Erreur lors du chargement');
        }
      } catch (err) {
        console.error('Erreur:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    chargerAnnonces();
  }, []);

  const filteredAnnonces = annonces.filter(annonce => {
    const matchesSearch = annonce.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         annonce.entreprise.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         annonce.lieu.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || annonce.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const getTypeColor = (type) => {
    switch(type) {
      case 'CDI': return '#059669';
      case 'CDD': return '#dc2626';
      case 'Stage': return '#7c3aed';
      case 'Freelance': return '#ea580c';
      default: return '#64748b';
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

  const handleModifierAnnonce = (annonceId) => {
    window.location.href = `/annonces/${annonceId}/modifier`;
  };

  const handleSupprimerAnnonce = async (annonceId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/annonces/${annonceId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        
        if (data.success) {
          // Recharger la liste des annonces
          setAnnonces(prev => prev.filter(a => a.id !== annonceId));
          alert('Annonce supprimée avec succès');
        } else {
          alert('Erreur lors de la suppression: ' + data.message);
        }
      } catch (err) {
        console.error('Erreur:', err);
        alert('Erreur lors de la suppression de l\'annonce');
      }
    }
  };

  if (loading) return <div style={styles.loading}>Chargement des annonces...</div>;
  if (error) return <div style={styles.error}>Erreur: {error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Offres d'Emploi</h1>
          <p style={styles.subtitle}>
            Découvrez les dernières opportunités de carrière disponibles
          </p>
        </div>
        <button onClick={onCreerAnnonce} style={styles.addButton}>
          <FiPlus size={20} />
          <span>Nouvelle Annonce</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <FiBriefcase size={24} color="#1e40af" />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>{annonces.length}</div>
            <div style={styles.statLabel}>Annonces Actives</div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <FiUsers size={24} color="#059669" />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>{annonces.filter(a => a.type === 'CDI').length}</div>
            <div style={styles.statLabel}>Postes CDI</div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <FiClock size={24} color="#dc2626" />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>{annonces.filter(a => a.type === 'CDD').length}</div>
            <div style={styles.statLabel}>Postes CDD</div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <FiCalendar size={24} color="#7c3aed" />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>12</div>
            <div style={styles.statLabel}>Candidatures Reçues</div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div style={styles.searchSection}>
        <div style={styles.searchContainer}>
          <FiSearch size={20} color="#64748b" />
          <input
            type="text"
            placeholder="Rechercher par titre, entreprise ou lieu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.filterContainer}>
          <FiFilter size={20} color="#64748b" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">Tous les types</option>
            <option value="CDI">CDI</option>
            <option value="CDD">CDD</option>
            <option value="Stage">Stage</option>
            <option value="Freelance">Freelance</option>
          </select>
        </div>
      </div>

      {/* Announcements Grid */}
      <div style={styles.annoncesGrid}>
        {filteredAnnonces.map(annonce => (
          <div key={annonce.id} style={styles.annonceCard}>
            <div style={styles.annonceHeader}>
              <div style={styles.annonceTitle}>
                <h3 style={styles.titre}>{annonce.titre}</h3>
                <span 
                  style={{
                    ...styles.typeTag,
                    backgroundColor: getTypeColor(annonce.type),
                  }}
                >
                  {annonce.type}
                </span>
              </div>
              <div style={styles.entreprise}>{annonce.entreprise}</div>
            </div>

            <div style={styles.annonceDetails}>
              <div style={styles.detailItem}>
                <FiMapPin size={16} color="#64748b" />
                <span>{annonce.lieu}</span>
              </div>
              <div style={styles.detailItem}>
                <FiDollarSign size={16} color="#64748b" />
                <span>{annonce.salaire}</span>
              </div>
              <div style={styles.detailItem}>
                <FiCalendar size={16} color="#64748b" />
                <span>Publié le {formatDate(annonce.datePublication)}</span>
              </div>
            </div>

            <div style={styles.description}>
              {annonce.description}
            </div>

            <div style={styles.competences}>
              {annonce.competences.map((competence, index) => (
                <span key={index} style={styles.competenceTag}>
                  {competence}
                </span>
              ))}
            </div>

            <div style={styles.annonceActions}>
              <button 
                onClick={() => window.location.href = `/annonces/${annonce.id}/details`}
                style={styles.viewButton}
              >
                <FiEye size={16} />
                <span>Voir Détails</span>
              </button>
              <button 
                onClick={() => handleModifierAnnonce(annonce.id)}
                style={styles.editButton}
              >
                <FiEdit3 size={16} />
              </button>
              <button 
                onClick={() => handleSupprimerAnnonce(annonce.id)}
                style={styles.deleteButton}
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredAnnonces.length === 0 && (
        <div style={styles.emptyState}>
          <FiBriefcase size={48} color="#94a3b8" />
          <h3 style={styles.emptyTitle}>Aucune annonce trouvée</h3>
          <p style={styles.emptyDescription}>
            Aucune annonce ne correspond à vos critères de recherche.
          </p>
        </div>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px'
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
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#1e40af',
    color: '#ffffff',
    padding: '12px 20px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '32px'
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
  searchSection: {
    display: 'flex',
    gap: '16px',
    marginBottom: '32px',
    flexWrap: 'wrap'
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#ffffff',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    flex: 1,
    minWidth: '300px'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    flex: 1,
    fontSize: '14px',
    color: '#1e293b'
  },
  filterContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#ffffff',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },
  filterSelect: {
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    color: '#1e293b',
    backgroundColor: 'transparent'
  },
  annoncesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '24px'
  },
  annonceCard: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s ease'
  },
  annonceHeader: {
    marginBottom: '16px'
  },
  annonceTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px'
  },
  titre: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
    flex: 1,
    marginRight: '12px'
  },
  typeTag: {
    color: '#ffffff',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500'
  },
  entreprise: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500'
  },
  annonceDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px'
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#475569'
  },
  description: {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.5',
    marginBottom: '16px'
  },
  competences: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '20px'
  },
  competenceTag: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500'
  },
  annonceActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  },
  viewButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#1e40af',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    backgroundColor: '#059669',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  deleteButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center'
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#475569',
    margin: '16px 0 8px 0'
  },
  emptyDescription: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
    fontSize: '16px',
    color: '#64748b'
  },
  error: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
    fontSize: '16px',
    color: '#ef4444'
  }
};

export default ListeAnnonces;