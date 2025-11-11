import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUserPlus, FiFileText } from 'react-icons/fi';

const ListeCandidats = () => {
  const [candidats, setCandidats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch("/api/candidats", {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Erreur réseau ou serveur');
        }
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setCandidats(data.data);
        } else {
          throw new Error(data.message || 'Erreur lors du chargement');
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleAjouterContrat = (candidatId) => {
    navigate(`/contrats/ajouter/${candidatId}`);
  };

  const handleVoirContrats = () => {
    navigate('/contrats');
  };

  if (loading) return <div style={styles.loading}>Chargement des candidats...</div>;
  if (error) return <div style={styles.error}>Erreur : {error}</div>;

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Liste des Candidats</h1>
          <p style={styles.subtitle}>
            Gérez les candidatures soumises pour vos annonces avec efficacité
          </p>
        </div>
      </div>

      {/* Candidates Table */}
      {candidats.length === 0 ? (
        <div style={styles.emptyMessage}>Aucun candidat trouvé.</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.tableHeaderCell}>ID</th>
                <th style={styles.tableHeaderCell}>Nom</th>
                <th style={styles.tableHeaderCell}>Prénom</th>
                <th style={styles.tableHeaderCell}>Date de Naissance</th>
                <th style={styles.tableHeaderCell}>Adresse</th>
                <th style={styles.tableHeaderCell}>Poste</th>
                <th style={styles.tableHeaderCell}>Statut</th>
                <th style={styles.tableHeaderCell}>Action</th>
              </tr>
            </thead>
            <tbody>
              {candidats.map((candidat, index) => (
                <tr key={candidat.id} style={index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
                  <td style={styles.tableCell}>{candidat.id}</td>
                  <td style={styles.tableCell}>{candidat.nom}</td>
                  <td style={styles.tableCell}>{candidat.prenom}</td>
                  <td style={styles.tableCell}>
                    {candidat.dateNaissance
                      ? new Date(candidat.dateNaissance).toLocaleDateString()
                      : 'Non défini'}
                  </td>
                  <td style={styles.tableCell}>{candidat.adresse || 'Non défini'}</td>
                  <td style={styles.tableCell}>{candidat.nomPoste || 'Non défini'}</td>
                  <td style={styles.tableCell}>{candidat.statut || 'Non défini'}</td>
                  <td style={styles.tableCell}>
                    <button
                      onClick={() => handleAjouterContrat(candidat.id)}
                      style={styles.actionButton}
                    >
                      <FiUserPlus size={16} style={{ marginRight: '8px' }} />
                      Ajouter Contrat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={styles.buttonContainer}>
            <button onClick={handleVoirContrats} style={styles.viewContractsButton}>
              <FiFileText size={16} style={{ marginRight: '8px' }} />
              Voir la liste des contrats
            </button>
          </div>
        </div>
      )}
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
  loading: {
    fontSize: '18px',
    color: '#1e293b',
    textAlign: 'center',
    padding: '20px',
  },
  error: {
    fontSize: '18px',
    color: '#dc2626',
    textAlign: 'center',
    padding: '20px',
  },
  emptyMessage: {
    fontSize: '16px',
    color: '#64748b',
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
  },
  tableContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    padding: '24px',
    overflowX: 'auto', // Permet le défilement horizontal sur petits écrans
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
    color: '#1e293b',
  },
  tableHeader: {
    backgroundColor: '#1e40af',
  },
  tableHeaderCell: {
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#ffffff',
    borderBottom: '2px solid #e2e8f0',
  },
  tableRowEven: {
    backgroundColor: '#ffffff',
  },
  tableRowOdd: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    padding: '12px 16px',
    borderBottom: '1px solid #e2e8f0',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#1e40af',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#1e3a8a',
    },
  },
  buttonContainer: {
    marginTop: '24px',
    textAlign: 'right',
  },
  viewContractsButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#059669',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#047857',
    },
  },
};

export default ListeCandidats;