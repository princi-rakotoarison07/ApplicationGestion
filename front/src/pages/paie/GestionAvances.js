import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const GestionAvances = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [periode] = useState(searchParams.get('periode'));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Gestion des avances</h1>
        <div style={styles.subtitle}>Employé #{id} • Période: {periode || '—'}</div>
      </div>
      <div style={styles.card}>
        Cette page sera dédiée à la gestion des avances pour la période sélectionnée.
        Vous pourrez y enregistrer des avances et les marquer comme remboursées.
      </div>
      <div style={{marginTop:12}}>
        <button style={styles.button} onClick={() => navigate(-1)}>Retour</button>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: 32, background: '#f1f5f9', minHeight: '100vh' },
  header: { marginBottom: 16 },
  title: { margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a' },
  subtitle: { color: '#475569', marginTop: 6 },
  card: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 },
  button: { background: '#1e40af', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }
};

export default GestionAvances;
