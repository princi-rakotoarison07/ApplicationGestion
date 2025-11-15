import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiSearch, FiRefreshCw } from 'react-icons/fi';

const Employes = () => {
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const loadEmployes = () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');

    fetch('/api/employes', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => {
        if (!res.ok) throw new Error('Erreur lors du chargement des employés');
        return res.json();
      })
      .then(json => {
        if (json.success) {
          setEmployes(json.data || []);
        } else {
          throw new Error(json.message || 'Réponse invalide de l\'API');
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEmployes();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return employes;
    return employes.filter(e =>
      (e.prenom && e.prenom.toLowerCase().includes(q)) ||
      (e.nom && e.nom.toLowerCase().includes(q)) ||
      (e.nomDepartement && e.nomDepartement.toLowerCase().includes(q)) ||
      (e.adresse && e.adresse.toLowerCase().includes(q))
    );
  }, [query, employes]);

  if (loading) {
    return <div style={styles.center}>Chargement des employés...</div>;
  }

  if (error) {
    return (
      <div style={styles.center}>
        <div style={styles.error}>Erreur: {error}</div>
        <button style={styles.refreshBtn} onClick={loadEmployes}>
          <FiRefreshCw size={16} />
          <span>Réessayer</span>
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerTitleWrap}>
          <div style={styles.iconWrap}><FiUsers size={22} color="#1e40af" /></div>
          <h1 style={styles.title}>Liste des Employés</h1>
        </div>
        <div style={styles.searchWrap}>
          <FiSearch size={18} color="#64748b" />
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Rechercher par nom, prénom, département, adresse..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nom</th>
                <th style={styles.th}>Prénom</th>
                <th style={styles.th}>Département</th>
                <th style={styles.th}>Adresse</th>
                <th style={styles.th} align="right">ID</th>
                <th style={{...styles.th, textAlign: 'right'}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={styles.empty}>Aucun employé trouvé</td>
                </tr>
              ) : (
                filtered.map(e => (
                  <tr key={e.id} style={styles.tr}>
                    <td style={styles.td}>{e.nom}</td>
                    <td style={styles.td}>{e.prenom}</td>
                    <td style={styles.td}>{e.nomDepartement || '—'}</td>
                    <td style={styles.td}>{e.adresse || '—'}</td>
                    <td style={{...styles.td, textAlign: 'right'}}>{e.id}</td>
                    <td style={{...styles.td, textAlign: 'right'}}>
                      <button
                        style={styles.primaryBtn}
                        onClick={() => navigate(`/contrats/ajouter/${e.id}`, { state: { candidatNom: e.nom, candidatPrenom: e.prenom } })}
                      >
                        Créer contrat
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
    marginBottom: 16,
    display: 'flex',
    gap: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap'
  },
  headerTitleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    margin: 0,
    color: '#0f172a',
    fontSize: 24,
    fontWeight: 700
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: '8px 12px',
    minWidth: 320
  },
  searchInput: {
    outline: 'none',
    border: 'none',
    flex: 1,
    fontSize: 14
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
  },
  tableWrap: {
    width: '100%',
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0
  },
  th: {
    textAlign: 'left',
    fontSize: 12,
    color: '#475569',
    padding: '14px 16px',
    borderBottom: '1px solid #e2e8f0',
    background: '#f8fafc'
  },
  tr: {
    borderBottom: '1px solid #e2e8f0'
  },
  td: {
    padding: '14px 16px',
    fontSize: 14,
    color: '#0f172a',
    borderBottom: '1px solid #e2e8f0'
  },
  empty: {
    padding: '18px 16px',
    textAlign: 'center',
    color: '#64748b'
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    color: '#475569'
  },
  error: {
    color: '#ef4444',
    fontWeight: 500
  },
  refreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1e40af',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '8px 12px',
    cursor: 'pointer'
  }
};

styles.primaryBtn = {
  backgroundColor: '#1e40af',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '8px 12px',
  cursor: 'pointer',
  fontSize: 13
};

export default Employes;
