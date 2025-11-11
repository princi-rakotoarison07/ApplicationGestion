import { useEffect, useState } from "react";
import { FiMail, FiCalendar, FiEdit3, FiTrash2, FiUsers, FiUserCheck, FiShield } from 'react-icons/fi';

const ListeUtilisateurs = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch("/api/utilisateurs", {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Erreur lors du chargement des utilisateurs');
        }
        return res.json();
      })
      .then(response => {
        if (response.success) {
          setUsers(response.data);
        } else {
          throw new Error(response.message || 'Erreur lors du chargement');
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={styles.loading}>Chargement des utilisateurs...</div>;
  if (error) return <div style={styles.error}>Erreur: {error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Gestion des Utilisateurs</h1>
        <p style={styles.subtitle}>
          Gérez les comptes utilisateurs et leurs accès à la plateforme
        </p>
      </div>
      
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <FiUsers size={24} color="#1e40af" />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>{users.length}</div>
            <div style={styles.statLabel}>Total Utilisateurs</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <FiUserCheck size={24} color="#059669" />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>
              {users.filter(u => u.email).length}
            </div>
            <div style={styles.statLabel}>Comptes Actifs</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <FiShield size={24} color="#dc2626" />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>
              {users.filter(u => u.nomDepartement === 'Ressources Humaines').length}
            </div>
            <div style={styles.statLabel}>Administrateurs RH</div>
          </div>
        </div>
      </div>

      <div style={styles.userGrid}>
        {users.map(user => (
          <div key={user.id} style={styles.userCard}>
            <div style={styles.userHeader}>
              <div style={styles.userAvatar}>
                {user.prenom?.[0]}{user.nom?.[0]}
              </div>
              <div style={styles.userInfo}>
                <h3 style={styles.userName}>{user.prenom} {user.nom}</h3>
                <span style={styles.userDepartment}>{user.nomDepartement}</span>
              </div>
            </div>
            
            <div style={styles.userDetails}>
              <div style={styles.userDetail}>
                <FiMail size={16} color="#64748b" />
                <span>{user.email}</span>
              </div>
              <div style={styles.userDetail}>
                <FiCalendar size={16} color="#64748b" />
                <span>ID: {user.id}</span>
              </div>
            </div>

            <div style={styles.userActions}>
              <button style={styles.editButton}>
                <FiEdit3 size={16} />
                <span>Modifier</span>
              </button>
              <button style={styles.deleteButton}>
                <FiTrash2 size={16} />
              </button>
            </div>
          </div>
        ))}
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
  userGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '24px'
  },
  userCard: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s ease'
  },
  userHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px'
  },
  userAvatar: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    backgroundColor: '#1e40af',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: '600'
  },
  userInfo: {
    flex: 1
  },
  userName: {
    margin: '0 0 4px 0',
    color: '#1e293b',
    fontSize: '18px',
    fontWeight: '600'
  },
  userDepartment: {
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500'
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px'
  },
  userDetail: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#475569'
  },
  userActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  },
  editButton: {
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

export default ListeUtilisateurs;
