import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDownload } from 'react-icons/fi';
import jsPDF from 'jspdf';

const DetailsCandidatContrat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employe, setEmploye] = useState(null);
  const [contrat, setContrat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token utilisé pour GET /api/contrats/:id:', token);
    if (!token) {
      setError('Aucun token trouvé. Veuillez vous connecter.');
      setLoading(false);
      return;
    }

    fetch(`/api/contrats/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => {
        console.log('Réponse pour GET /api/contrats/:id:', res.status, res.statusText);
        if (!res.ok) {
          throw new Error(`Erreur réseau ou serveur: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setContrat(data.data);
          console.log('Contrat récupéré:', data.data);
          return fetch(`/api/employes/${data.data.idEmploye}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
        } else {
          throw new Error(data.message || 'Erreur lors du chargement du contrat');
        }
      })
      .then(res => {
        console.log('Réponse pour GET /api/employes/:id:', res.status, res.statusText);
        if (!res.ok) {
          throw new Error(`Erreur réseau ou serveur: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setEmploye(data.data);
          console.log('Employé récupéré:', data.data);
        } else {
          throw new Error(data.message || 'Erreur lors du chargement de l\'employé');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur complète:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const exportToPDF = () => {
    if (!employe || !contrat) return;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = margin;

    // Couleurs
    const primaryColor = '#1e40af'; // Bleu professionnel
    const secondaryColor = '#059669'; // Vert pour accents
    const textColor = '#1e293b'; // Noir pour texte
    const lightGray = '#f1f5f9'; // Fond clair
    const grayBorder = '#e2e8f0'; // Bordure grise

    // En-tête
    doc.setFillColor(lightGray);
    doc.rect(0, 0, pageWidth, 50, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(primaryColor);
    doc.text('Détails du Contrat', pageWidth / 2, 30, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(textColor);
    doc.text(`Système de Gestion RH`, pageWidth / 2, 40, { align: 'center' });

    // Ligne décorative
    doc.setDrawColor(secondaryColor);
    doc.setLineWidth(1);
    doc.line(margin, 55, pageWidth - margin, 55);
    y = 65;

    // Métadonnées
    doc.setFontSize(10);
    doc.setTextColor(textColor);
    doc.text(`ID du Contrat: ${id}`, margin, y);
    doc.text(`Date d'Émission: ${new Date().toLocaleDateString()}`, pageWidth - margin - 50, y);
    y += 15;

    // Tableau Employé
    doc.setFontSize(16);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(primaryColor);
    doc.text('Informations de l\'Employé', margin, y);
    y += 10;

    // Bordure du tableau
    doc.setDrawColor(grayBorder);
    doc.setLineWidth(0.5);
    doc.rect(margin, y - 5, pageWidth - 2 * margin, 40); // Hauteur ajustée pour contenu

    doc.setFontSize(12);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(textColor);
    doc.text(`Nom: ${employe.nom || 'Non défini'}`, margin + 5, y + 5);
    doc.text(`Prénom: ${employe.prenom || 'Non défini'}`, margin + 5, y + 15);
    doc.text(`Adresse: ${employe.adresse || 'Non défini'}`, margin + 5, y + 25);
    y += 50;

    // Tableau Contrat
    doc.setFontSize(16);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(primaryColor);
    doc.text('Informations du Contrat', margin, y);
    y += 10;

    // Bordure du tableau
    doc.setDrawColor(grayBorder);
    doc.rect(margin, y - 5, pageWidth - 2 * margin, 60); // Hauteur ajustée

    doc.setFontSize(12);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(textColor);
    doc.text(`ID Employé: ${contrat.idEmploye || 'Non défini'}`, margin + 5, y + 5);
    doc.text(`Date de Début: ${contrat.dateDebut ? new Date(contrat.dateDebut).toLocaleDateString() : 'Non défini'}`, margin + 5, y + 15);
    doc.text(`Nombre de Mois: ${contrat.nombreMois || 'Non défini'}`, margin + 5, y + 25);
    doc.text(`Type de Contrat: ${contrat.typeContrat || 'Non défini'}`, margin + 5, y + 35);
    doc.text(`Statut: ${contrat.statut || 'Actif'}`, margin + 5, y + 45); // Statut par défaut
    y += 70;

    // Signature
    doc.setFontSize(12);
    doc.setFont('Helvetica', 'italic');
    doc.setTextColor(primaryColor);
    doc.text('Signé par: Système de Gestion RH', margin, y);
    doc.setDrawColor(secondaryColor);
    doc.setLineWidth(0.5);
    doc.line(margin, y + 5, margin + 60, y + 5); // Ligne de signature

    // Footer
    doc.setFontSize(10);
    doc.setTextColor('#64748b');
    doc.text(`Généré automatiquement par le Système RH - Page 1`, pageWidth / 2, pageHeight - margin, { align: 'center' });

    // Bordure de page
    doc.setDrawColor(grayBorder);
    doc.setLineWidth(0.2);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    doc.save(`contrat_${id}.pdf`);
  };

  if (loading) return <div style={styles.loading}>Chargement des détails...</div>;
  if (error) return <div style={styles.error}>Erreur : {error}</div>;

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Détails du Contrat</h1>
          <p style={styles.subtitle}>
            Consultez les informations de l'employé et du contrat ID: {id}
          </p>
        </div>
      </div>

      {/* Details Section */}
      {employe ? (
        <div style={styles.detailsContainer}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Informations de l'Employé</h2>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Nom :</span>
                <span style={styles.infoValue}>{employe.nom}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Prénom :</span>
                <span style={styles.infoValue}>{employe.prenom}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Adresse :</span>
                <span style={styles.infoValue}>{employe.adresse || 'Non défini'}</span>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Informations du Contrat</h2>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Date de Début :</span>
                <span style={styles.infoValue}>
                  {contrat.dateDebut
                    ? new Date(contrat.dateDebut).toLocaleDateString()
                    : 'Non défini'}
                </span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Nombre de Mois :</span>
                <span style={styles.infoValue}>{contrat.nombreMois}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Type de Contrat :</span>
                <span style={styles.infoValue}>{contrat.typeContrat}</span>
              </div>
            </div>
          </div>

          <div style={styles.buttonContainer}>
            <button onClick={() => navigate('/contrats')} style={styles.button}>
              <FiArrowLeft size={16} style={{ marginRight: '8px' }} />
              Retour à la liste des contrats
            </button>
            <button onClick={exportToPDF} style={styles.button}>
              <FiDownload size={16} style={{ marginRight: '8px' }} />
              Exporter en PDF
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.emptyMessage}>Aucun employé trouvé pour ce contrat.</div>
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
  detailsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '16px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  infoLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#64748b',
    marginBottom: '4px',
  },
  infoValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '16px',
    marginTop: '24px',
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: '#1e40af',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
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
};

export default DetailsCandidatContrat;