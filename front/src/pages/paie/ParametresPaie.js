import { useEffect, useMemo, useState } from 'react';
import { FiPlus, FiEdit2, FiCheck, FiX } from 'react-icons/fi';

const emptyForm = {
  code: '', libelle: '', type: 'TauxCotisation', valeur: '', tauxEmployeur: '', tauxEmploye: '', plafond: '', plancher: '', dateDebut: '', dateFin: '', actif: true, description: ''
};

const ParametresPaie = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/paie/parametres', { headers: token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : {} });
      if (!res.ok) throw new Error('Erreur chargement paramètres');
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Réponse invalide');
      setList(json.data || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `/api/paie/parametres/${editing}` : '/api/paie/parametres';
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          valeur: form.valeur === '' ? null : Number(form.valeur),
          tauxEmployeur: form.tauxEmployeur === '' ? null : Number(form.tauxEmployeur),
          tauxEmploye: form.tauxEmploye === '' ? null : Number(form.tauxEmploye),
          plafond: form.plafond === '' ? null : Number(form.plafond),
          plancher: form.plancher === '' ? null : Number(form.plancher),
          dateFin: form.dateFin || null,
        })
      });
      if (!res.ok) throw new Error('Erreur sauvegarde');
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Erreur');
      setForm(emptyForm); setEditing(null); await load();
      alert('Paramètre sauvegardé');
    } catch (e) {
      alert(e.message);
    }
  };

  const edit = (p) => {
    setEditing(p.id);
    setForm({
      code: p.code, libelle: p.libelle, type: p.type, valeur: p.valeur ?? '', tauxEmployeur: p.tauxEmployeur ?? '', tauxEmploye: p.tauxEmploye ?? '', plafond: p.plafond ?? '', plancher: p.plancher ?? '', dateDebut: p.dateDebut?.slice(0,10) || '', dateFin: p.dateFin?.slice(0,10) || '', actif: !!p.actif, description: p.description || ''
    });
  };

  const toggleActif = async (p, actif) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/paie/parametres/${p.id}/actif`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ actif })
      });
      if (!res.ok) throw new Error('Erreur changement statut');
      await load();
    } catch (e) { alert(e.message); }
  };

  if (loading) return <div style={styles.center}>Chargement...</div>;
  if (error) return <div style={styles.center}>Erreur: {error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Paramétrage de paie</h1>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>{editing ? 'Modifier un paramètre' : 'Nouveau paramètre'}</h3>
          <form onSubmit={save} style={styles.form}>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Code</label>
                <input name="code" value={form.code} onChange={handleChange} required style={styles.input} placeholder="CNAPS_EMP, OSTIE_EMP, IRSA, JOURS_BASE_MENSUEL"/>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Libellé</label>
                <input name="libelle" value={form.libelle} onChange={handleChange} required style={styles.input}/>
              </div>
            </div>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Type</label>
                <select name="type" value={form.type} onChange={handleChange} style={styles.input}>
                  <option value="TauxCotisation">TauxCotisation</option>
                  <option value="BaremeIRSA">BaremeIRSA</option>
                  <option value="PlafondSalarial">PlafondSalarial</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Valeur</label>
                <input type="number" step="0.01" name="valeur" value={form.valeur} onChange={handleChange} style={styles.input} placeholder="Ex: 26 pour jours base"/>
              </div>
            </div>
            <div style={styles.row}>
              <div style={styles.field}><label style={styles.label}>Taux Employeur (%)</label><input type="number" step="0.01" name="tauxEmployeur" value={form.tauxEmployeur} onChange={handleChange} style={styles.input}/></div>
              <div style={styles.field}><label style={styles.label}>Taux Employé (%)</label><input type="number" step="0.01" name="tauxEmploye" value={form.tauxEmploye} onChange={handleChange} style={styles.input}/></div>
            </div>
            <div style={styles.row}>
              <div style={styles.field}><label style={styles.label}>Plafond</label><input type="number" step="0.01" name="plafond" value={form.plafond} onChange={handleChange} style={styles.input}/></div>
              <div style={styles.field}><label style={styles.label}>Plancher</label><input type="number" step="0.01" name="plancher" value={form.plancher} onChange={handleChange} style={styles.input}/></div>
            </div>
            <div style={styles.row}>
              <div style={styles.field}><label style={styles.label}>Date début</label><input type="date" name="dateDebut" value={form.dateDebut} onChange={handleChange} required style={styles.input}/></div>
              <div style={styles.field}><label style={styles.label}>Date fin</label><input type="date" name="dateFin" value={form.dateFin} onChange={handleChange} style={styles.input}/></div>
            </div>
            <div style={styles.row}>
              <label style={{display:'flex', alignItems:'center', gap:8}}>
                <input type="checkbox" name="actif" checked={form.actif} onChange={handleChange}/> Actif
              </label>
            </div>
            <div style={styles.row}>
              <div style={{width:'100%'}}>
                <label style={styles.label}>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} style={styles.textarea}/>
              </div>
            </div>
            <div>
              <button type="submit" style={styles.button}><FiCheck/> Enregistrer</button>
              {editing && <button type="button" style={{...styles.button, ...styles.ghost}} onClick={()=>{setEditing(null); setForm(emptyForm);}}><FiX/> Annuler</button>}
            </div>
          </form>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Liste des paramètres</h3>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Actif</th>
                  <th style={styles.th}>Code</th>
                  <th style={styles.th}>Libellé</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Valeur</th>
                  <th style={styles.th}>Taux Emp./Emp.</th>
                  <th style={styles.th}>Plafond/Plancher</th>
                  <th style={{...styles.th, textAlign:'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map(p => (
                  <tr key={p.id}>
                    <td style={styles.td}><input type="checkbox" checked={!!p.actif} onChange={(e)=>toggleActif(p, e.target.checked)}/></td>
                    <td style={styles.td}>{p.code}</td>
                    <td style={styles.td}>{p.libelle}</td>
                    <td style={styles.td}>{p.type}</td>
                    <td style={styles.td}>{p.valeur ?? '-'}</td>
                    <td style={styles.td}>{(p.tauxEmployeur ?? '-')}/{(p.tauxEmploye ?? '-')}</td>
                    <td style={styles.td}>{(p.plafond ?? '-')}/{(p.plancher ?? '-')}</td>
                    <td style={{...styles.td, textAlign:'right'}}>
                      <button style={{...styles.button, padding:'6px 10px'}} onClick={()=>edit(p)}><FiEdit2/> Modifier</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: 32, background: '#f1f5f9', minHeight: '100vh' },
  center: { display:'flex', alignItems:'center', justifyContent:'center', minHeight:'50vh' },
  header: { marginBottom: 16 },
  title: { margin: 0, fontSize: 28, fontWeight: 700, color: '#0f172a' },
  grid: { display:'grid', gridTemplateColumns:'1fr 2fr', gap: 16 },
  card: { background:'#fff', border:'1px solid #e2e8f0', borderRadius: 12, padding: 16 },
  cardTitle: { marginTop:0, color:'#0f172a' },
  form: { display:'flex', flexDirection:'column', gap: 12 },
  row: { display:'flex', gap: 12, alignItems:'center' },
  field: { flex: 1, display:'flex', flexDirection:'column', gap: 6 },
  label: { fontSize: 12, color: '#475569' },
  input: { padding: 8, border:'1px solid #e2e8f0', borderRadius: 8, background:'#f8fafc' },
  textarea: { width:'100%', padding: 8, border:'1px solid #e2e8f0', borderRadius: 8, background:'#f8fafc' },
  button: { display:'inline-flex', alignItems:'center', gap:6, background:'#1e40af', color:'#fff', border:'none', borderRadius: 8, padding:'8px 12px', cursor:'pointer' },
  ghost: { background:'transparent', color:'#1e40af', border:'1px solid #1e40af', marginLeft:8 },
  tableWrap: { width:'100%', overflowX:'auto' },
  table: { width:'100%', borderCollapse:'separate', borderSpacing:0 },
  th: { textAlign:'left', padding:'10px 12px', background:'#f8fafc', borderBottom:'1px solid #e2e8f0', fontSize:12, color:'#475569' },
  td: { padding:'10px 12px', borderBottom:'1px solid #e2e8f0', fontSize:14, color:'#0f172a' }
};

export default ParametresPaie;
