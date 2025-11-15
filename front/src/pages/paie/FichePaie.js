import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiDollarSign, FiMinusCircle, FiPlusCircle } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

function formatYYYYMM(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

const FichePaie = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [periode, setPeriode] = useState(searchParams.get('periode') || formatYYYYMM(new Date()));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const contentRef = useRef(null);

  const apiUrl = useMemo(() => `/api/paie/employes/${id}/calcul?periode=${encodeURIComponent(periode)}`, [id, periode]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Erreur lors du calcul de paie');
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Réponse invalide');
      setData(json.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [apiUrl]);

  useEffect(() => {
    setSearchParams({ periode });
  }, [periode, setSearchParams]);

  // Export functions (inside component so they can access hooks/refs)
  const exportPDF = async () => {
    try {
      if (!contentRef.current) return;
      const canvas = await html2canvas(contentRef.current, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const canvasWidthMM = (canvas.width * 25.4) / 96;
      const canvasHeightMM = (canvas.height * 25.4) / 96;
      const ratio = pageWidth / canvasWidthMM;
      const imgHeightMM = canvasHeightMM * ratio;

      if (imgHeightMM <= pageHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeightMM);
      } else {
        let y = 0;
        const pageCanvas = document.createElement('canvas');
        const pageCtx = pageCanvas.getContext('2d');
        const pageHeightPx = Math.floor((pageHeight / 25.4) * 96 / ratio);
        pageCanvas.width = canvas.width;
        pageCanvas.height = pageHeightPx;

        while (y < canvas.height) {
          pageCtx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
          pageCtx.drawImage(canvas, 0, -y);
          const pageImg = pageCanvas.toDataURL('image/png');
          const pageImgHeightMM = (pageCanvas.height * 25.4) / 96 * ratio;
          if (y === 0) {
            pdf.addImage(pageImg, 'PNG', 0, 0, pageWidth, pageImgHeightMM);
          } else {
            pdf.addPage();
            pdf.addImage(pageImg, 'PNG', 0, 0, pageWidth, pageImgHeightMM);
          }
          y += pageHeightPx;
        }
      }

      const fileName = `Fiche_Paie_E${id}_${periode}.pdf`;
      pdf.save(fileName);
    } catch (e) {
      alert('Erreur export PDF: ' + e.message);
    }
  };

  const exportExcel = () => {
    try {
      if (!data) return;
      const wb = XLSX.utils.book_new();
      const resume = [
        ['Employé ID', id],
        ['Période', periode],
        ['Salaire de base', Number(data.salaireBase || 0)],
        ['Primes & Indemnités', Number(data.primesIndemnites || 0)],
        ['Retenues', Number(data.retenues || 0)],
        ['Salaire Brut', Number(data.salaireBrut || 0)],
        ['Net à payer', Number(data.netAPayer || 0)],
        ['Absences (jours)', data.details?.absences?.jours ?? 0],
        ['Taux journalier', Number(data.details?.absences?.dailyRate || 0)],
        ['Retenue absences', Number(data.details?.absences?.retenue || 0)],
        ['Avances du mois', Number(data.details?.avances?.total || 0)],
      ];
      const wsResume = XLSX.utils.aoa_to_sheet(resume);
      XLSX.utils.book_append_sheet(wb, wsResume, 'Résumé');

      const lignes = [['Code', 'Libellé', 'Sens', 'Montant']];
      (data.lignes || []).forEach(l => {
        lignes.push([l.code, l.libelle, l.sens, Number(l.montant || 0)]);
      });
      const wsLignes = XLSX.utils.aoa_to_sheet(lignes);
      XLSX.utils.book_append_sheet(wb, wsLignes, 'Détails');

      const fileName = `Fiche_Paie_E${id}_${periode}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (e) {
      alert('Erreur export Excel: ' + e.message);
    }
  };

  if (loading) return <div style={styles.center}>Calcul de la fiche de paie...</div>;
  if (error) return (
    <div style={styles.center}>
      <div style={styles.error}>Erreur: {error}</div>
      <button style={styles.button} onClick={load}>Réessayer</button>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={{...styles.button, ...styles.ghost}} onClick={() => navigate(-1)}>
          <FiArrowLeft size={16} /> Retour
        </button>
        <div style={styles.headerRight}>
          <div style={styles.periodeWrap}>
            <FiCalendar size={16} color="#64748b" />
            <input
              type="month"
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              style={styles.monthInput}
            />
          </div>
          <button style={styles.button} onClick={load}>Recalculer</button>
          <button style={styles.button} onClick={exportPDF}>Exporter PDF</button>
          <button style={styles.button} onClick={exportExcel}>Exporter Excel</button>
          <button style={styles.button} onClick={() => navigate('/paie/parametres')}>Paramètres de paie</button>
        </div>
      </div>

      <div ref={contentRef}>
      <div style={styles.cards}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Salaire de base</div>
          <div style={styles.amount}> {Number(data?.salaireBase || 0).toFixed(2)} Ar</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Primes & Indemnités</div>
          <div style={{...styles.amount, color: '#059669'}}>+ {Number(data?.primesIndemnites || 0).toFixed(2)} Ar</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Retenues</div>
          <div style={{...styles.amount, color: '#dc2626'}}>- {Number(data?.retenues || 0).toFixed(2)} Ar</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Net à payer</div>
          <div style={{...styles.amount, color: '#1e40af'}}>{Number(data?.netAPayer || 0).toFixed(2)} Ar</div>
        </div>
      </div>

      <div style={styles.detailCard}>
        <div style={styles.detailHeader}>Détail des éléments</div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Code</th>
              <th style={styles.th}>Libellé</th>
              <th style={styles.th}>Sens</th>
              <th style={{...styles.th, textAlign: 'right'}}>Montant</th>
            </tr>
          </thead>
          <tbody>
            {data?.lignes?.length ? data.lignes.map((l, idx) => (
              <tr key={idx}>
                <td style={styles.td}>{l.code}</td>
                <td style={styles.td}>{l.libelle}</td>
                <td style={styles.td}>
                  {l.sens === 'gain' ? (
                    <span style={styles.badgeGain}><FiPlusCircle /> Gain</span>
                  ) : (
                    <span style={styles.badgeRetenue}><FiMinusCircle /> Retenue</span>
                  )}
                </td>
                <td style={{...styles.td, textAlign: 'right'}}>{Number(l.montant).toFixed(2)} Ar</td>
              </tr>
            )) : (
              <tr>
                <td style={styles.td} colSpan={4}>Aucun élément configuré</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{...styles.detailCard, marginTop: 16}}>
        <div style={styles.detailHeader}>Absences</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap: 12}}>
          <div style={styles.infoItem}>Jours d'absence: <strong>{data?.details?.absences?.jours ?? 0}</strong></div>
          <div style={styles.infoItem}>Jours base mensuel: <strong>{data?.details?.absences?.joursBaseMensuel ?? 26}</strong></div>
          <div style={styles.infoItem}>Taux journalier: <strong>{Number(data?.details?.absences?.dailyRate || 0).toFixed(2)} Ar</strong></div>
          <div style={styles.infoItem}>Retenue pour absences: <strong style={{color:'#dc2626'}}>{Number(data?.details?.absences?.retenue || 0).toFixed(2)} Ar</strong></div>
        </div>
        <div style={{marginTop:12}}>
          <button style={styles.button} onClick={() => navigate(`/presences/employe/${id}?periode=${encodeURIComponent(periode)}`)}>Gérer les présences/absences</button>
        </div>
      </div>

      <div style={{...styles.detailCard, marginTop: 16}}>
        <div style={styles.detailHeader}>Avances</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap: 12}}>
          <div style={styles.infoItem}>Total avances du mois: <strong style={{color:'#dc2626'}}>{Number(data?.details?.avances?.total || 0).toFixed(2)} Ar</strong></div>
        </div>
        <div style={{marginTop:12}}>
          <button style={styles.button} onClick={() => navigate(`/avances/employe/${id}?periode=${encodeURIComponent(periode)}`)}>Gérer les avances</button>
        </div>
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
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    minHeight: '50vh'
  },
  error: { color: '#dc2626' },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  headerRight: { display: 'flex', gap: 12, alignItems: 'center' },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1e40af',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '8px 12px',
    cursor: 'pointer'
  },
  ghost: {
    background: 'transparent',
    color: '#1e40af',
    border: '1px solid #1e40af'
  },
  periodeWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    padding: '6px 10px',
    borderRadius: 8
  },
  monthInput: {
    border: 'none',
    outline: 'none',
    fontSize: 14
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
    marginBottom: 16
  },
  card: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: 16
  },
  cardTitle: { fontSize: 14, color: '#475569', marginBottom: 8 },
  amount: { fontSize: 22, fontWeight: 700, color: '#0f172a' },
  detailCard: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: 16
  },
  detailHeader: { fontWeight: 600, marginBottom: 12, color: '#0f172a' },
  table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0 },
  th: { textAlign: 'left', padding: '10px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: 12, color: '#475569' },
  td: { padding: '10px 12px', borderBottom: '1px solid #e2e8f0', fontSize: 14, color: '#0f172a' },
  badgeGain: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ecfdf5', color: '#059669', padding: '4px 8px', borderRadius: 999 },
  badgeRetenue: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fef2f2', color: '#dc2626', padding: '4px 8px', borderRadius: 999 },
  infoItem: { fontSize: 14, color: '#334155' }
};

export default FichePaie;
