import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye } from 'react-icons/fi';

const ListeContrats = () => {
  const [contrats, setContrats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token utilisé pour GET /api/contrats:', token);
    if (!token) {
      setError('Aucun token trouvé. Veuillez vous connecter.');
      setLoading(false);
      return;
    }

    fetch('/api/contrats', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Erreur réseau ou serveur: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setContrats(data.data);
        } else {
          throw new Error(data.message || 'Erreur lors du chargement des contrats');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur complète:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleVoirDetails = (contratId) => {
    navigate(`/contrats/details/${contratId}`);
  };

  if (loading) return <div style={styles.loading}>Chargement des contrats...</div>;
  if (error) return <div style={styles.error}>Erreur : {error}</div>;

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Liste des Contrats</h1>
          <p style={styles.subtitle}>
            Consultez et gérez tous les contrats enregistrés
          </p>
        </div>
      </div>

      {/* Contracts Table */}
      {contrats.length === 0 ? (
        <div style={styles.emptyMessage}>Aucun contrat trouvé.</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.tableHeaderCell}>ID</th>
                <th style={styles.tableHeaderCell}>ID Employé</th>
                <th style={styles.tableHeaderCell}>Date de Début</th>
                <th style={styles.tableHeaderCell}>Nombre de Mois</th>
                <th style={styles.tableHeaderCell}>Type de Contrat</th>
                <th style={styles.tableHeaderCell}>Action</th>
              </tr>
            </thead>
            <tbody>
              {contrats.map((contrat, index) => (
                <tr key={contrat.id} style={index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
                  <td style={styles.tableCell}>{contrat.id}</td>
                  <td style={styles.tableCell}>{contrat.idEmploye}</td>
                  <td style={styles.tableCell}>
                    {contrat.dateDebut
                      ? new Date(contrat.dateDebut).toLocaleDateString()
                      : 'Non défini'}
                  </td>
                  <td style={styles.tableCell}>{contrat.nombreMois}</td>
                  <td style={styles.tableCell}>{contrat.typeContrat}</td>
                  <td style={styles.tableCell}>
                    <button
                      onClick={() => handleVoirDetails(contrat.id)}
                      style={styles.actionButton}
                    >
                      <FiEye size={16} style={{ marginRight: '8px' }} />
                      Voir détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    overflowX: 'auto',
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
    backgroundColor: '#059669',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
};

export default ListeContrats;