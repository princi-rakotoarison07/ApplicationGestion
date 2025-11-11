import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import './CalendrierEntretiens.css';
import { 
  FiCalendar, 
  FiClock, 
  FiUser, 
  FiX, 
  FiSave,
  FiEdit,
  FiTrash2,
  FiPlus
} from 'react-icons/fi';

const CalendrierEntretiens = () => {
  const [entretiens, setEntretiens] = useState([]);
  const [candidats, setCandidats] = useState([]);
  const [statuts, setStatuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEntretien, setEditingEntretien] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  const [formData, setFormData] = useState({
    idCandidat: '',
    dateHeure: '',
    idStatut: 1,
    idResultat: null
  });
  const [candidatDetails, setCandidatDetails] = useState(null);

  const calendarRef = useRef(null);
  const calendarInstance = useRef(null);

  useEffect(() => {
    chargerDonnees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (calendarRef.current && !calendarInstance.current && entretiens.length >= 0) {
      initCalendar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entretiens]);

  const chargerDonnees = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

  // Charger les entretiens, candidats éligibles et statuts en parallèle
  const [entretiensRes, candidatsData, statutsRes] = await Promise.all([
    fetch('/api/entretiens', { headers }),
    chargerCandidatsEligibles(headers),
    fetch('/api/entretiens/statuts/tous', { headers })
  ]);

  const [entretiensData, statutsData] = await Promise.all([
    entretiensRes.json(),
    statutsRes.json()
  ]);

      if (entretiensData.success) setEntretiens(entretiensData.data || []);
      if (candidatsData) setCandidats(candidatsData || []);
      if (statutsData.success) setStatuts(statutsData.data || []);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      showToast('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const chargerCandidatsEligibles = async (headers) => {
    try {
      const response = await fetch('/api/entretiens/candidats/eligibles', {
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      } else {
        console.error('Erreur lors du chargement des candidats éligibles');
        return [];
      }
    } catch (error) {
      console.error('Erreur:', error);
      return [];
    }
  };

  const initCalendar = () => {
    if (calendarInstance.current) {
      calendarInstance.current.destroy();
    }

    calendarInstance.current = new Calendar(calendarRef.current, {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      locale: frLocale,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      height: 'auto',
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      weekends: true,
      businessHours: {
        daysOfWeek: [1, 2, 3, 4, 5],
        startTime: '08:00',
        endTime: '18:00',
      },
      events: entretiens.map(entretien => ({
        id: entretien.id,
        title: `${entretien.candidatPrenom} ${entretien.candidatNom}`,
        start: entretien.dateHeure,
        backgroundColor: getStatutColor(entretien.idStatut),
        borderColor: getStatutColor(entretien.idStatut),
        extendedProps: {
          candidatNom: entretien.candidatNom,
          candidatPrenom: entretien.candidatPrenom,
          annonceReference: entretien.annonceReference,
          statutNom: entretien.statutNom,
          idCandidat: entretien.idCandidat,
          idStatut: entretien.idStatut
        }
      })),
      select: handleDateSelect,
      eventClick: handleEventClick,
      editable: true,
      eventDrop: handleEventDrop,
      eventResize: handleEventResize
    });

    calendarInstance.current.render();
  };

  const getStatutColor = (idStatut) => {
    const colors = {
      1: '#3b82f6', // En attente - Bleu
      2: '#10b981', // Confirmé - Vert
      3: '#f59e0b', // Reporté - Orange
      4: '#ef4444'  // Annulé - Rouge
    };
    return colors[idStatut] || '#6b7280';
  };

  const handleDateSelect = (selectInfo) => {
    setEditingEntretien(null);
    setFormData({
      idCandidat: '',
      dateHeure: selectInfo.start.toISOString().slice(0, 16),
      idStatut: 1
    });
    setShowModal(true);
  };

  const handleEventClick = async (clickInfo) => {
    const event = clickInfo.event;
    setEditingEntretien({
      id: event.id,
      ...event.extendedProps
    });
    setFormData({
      idCandidat: event.extendedProps.idCandidat,
      dateHeure: event.start.toISOString().slice(0, 16),
      idStatut: event.extendedProps.idStatut,
      idResultat: event.extendedProps.idResultat || null
    });
    
    // Charger les détails du candidat
    await chargerDetailsCandidatEntretien(event.extendedProps.idCandidat);
    
    setShowModal(true);
  };

  const chargerDetailsCandidatEntretien = async (idCandidat) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/candidats/${idCandidat}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCandidatDetails(data.data);
      } else {
        console.error('Erreur lors du chargement des détails du candidat');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleEventDrop = async (dropInfo) => {
    const event = dropInfo.event;
    try {
      await mettreAJourEntretien(event.id, {
        idCandidat: event.extendedProps.idCandidat,
        dateHeure: event.start.toISOString(),
        idStatut: event.extendedProps.idStatut
      });
      showToast('Entretien déplacé avec succès', 'success');
    } catch (error) {
      dropInfo.revert();
      showToast('Erreur lors du déplacement', 'error');
    }
  };

  const handleEventResize = async (resizeInfo) => {
    const event = resizeInfo.event;
    try {
      await mettreAJourEntretien(event.id, {
        idCandidat: event.extendedProps.idCandidat,
        dateHeure: event.start.toISOString(),
        idStatut: event.extendedProps.idStatut
      });
      showToast('Durée modifiée avec succès', 'success');
    } catch (error) {
      resizeInfo.revert();
      showToast('Erreur lors de la modification', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      if (editingEntretien) {
        // Modification
        await fetch(`/api/entretiens/${editingEntretien.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(formData)
        });
        showToast('Entretien modifié avec succès', 'success');
      } else {
        // Création
        await fetch('/api/entretiens', {
          method: 'POST',
          headers,
          body: JSON.stringify(formData)
        });
        showToast('Entretien créé avec succès', 'success');
      }

      setShowModal(false);
      await chargerDonnees();
      
      // Rafraîchir le calendrier
      setTimeout(() => {
        if (calendarInstance.current) {
          initCalendar();
        }
      }, 100);

    } catch (error) {
      console.error('Erreur:', error);
      showToast('Erreur lors de la sauvegarde', 'error');
    }
  };

  const mettreAJourEntretien = async (id, data) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/entretiens/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour');
    }

    return response.json();
  };

  const supprimerEntretien = async () => {
    if (!editingEntretien || !window.confirm('Êtes-vous sûr de vouloir supprimer cet entretien ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/entretiens/${editingEntretien.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setShowModal(false);
      await chargerDonnees();
      
      setTimeout(() => {
        if (calendarInstance.current) {
          initCalendar();
        }
      }, 100);
      
      showToast('Entretien supprimé avec succès', 'success');
    } catch (error) {
      console.error('Erreur:', error);
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <FiClock size={48} color="#3b82f6" />
        <p>Chargement du calendrier...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>
            <FiCalendar size={32} />
            Calendrier des Entretiens
          </h1>
          <p style={styles.subtitle}>
            Planifiez et gérez vos entretiens de recrutement
          </p>
        </div>
      </div>

      {/* Calendrier */}
      <div style={styles.calendarContainer}>
        <div ref={calendarRef}></div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingEntretien ? (
                  <>
                    <FiEdit size={20} />
                    Modifier l'entretien
                  </>
                ) : (
                  <>
                    <FiPlus size={20} />
                    Nouvel entretien
                  </>
                )}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={styles.closeButton}
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              {/* Informations du candidat pour entretien existant */}
              {editingEntretien && candidatDetails && (
                <div style={styles.candidatInfo}>
                  <h4 style={styles.candidatInfoTitle}>
                    <FiUser size={16} />
                    Informations du candidat
                  </h4>
                  <div style={styles.candidatInfoContent}>
                    <p><strong>Nom:</strong> {candidatDetails.prenom} {candidatDetails.nom}</p>
                    <p><strong>Email:</strong> {candidatDetails.email || 'Non renseigné'}</p>
                    <p><strong>Âge:</strong> {candidatDetails.dateNaissance ? 
                      Math.floor((new Date() - new Date(candidatDetails.dateNaissance)) / (365.25 * 24 * 60 * 60 * 1000)) + ' ans' 
                      : 'Non renseigné'}</p>
                    <p><strong>Adresse:</strong> {candidatDetails.adresse || 'Non renseignée'}</p>
                    <p><strong>Annonce:</strong> {editingEntretien.annonceReference || 'Non renseignée'}</p>
                    {candidatDetails.cv && (
                      <div style={styles.cvPreview}>
                        <strong>CV:</strong>
                        <div style={styles.cvContent}>
                          {candidatDetails.cv.substring(0, 200)}...
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sélection candidat pour nouvel entretien */}
              {!editingEntretien && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <FiUser size={16} />
                    Candidat
                  </label>
                  <select
                    name="idCandidat"
                    value={formData.idCandidat}
                    onChange={handleInputChange}
                    style={styles.select}
                    required
                  >
                    <option value="">Sélectionnez un candidat</option>
                    {candidats.map(candidat => (
                      <option key={candidat.id} value={candidat.id}>
                        {candidat.prenom} {candidat.nom} - {candidat.annonceReference}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <FiClock size={16} />
                  Date et heure
                </label>
                <input
                  type="datetime-local"
                  name="dateHeure"
                  value={formData.dateHeure}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Statut
                </label>
                <select
                  name="idStatut"
                  value={formData.idStatut}
                  onChange={handleInputChange}
                  style={styles.select}
                  required
                >
                  {statuts.map(statut => (
                    <option key={statut.id} value={statut.id}>
                      {statut.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Résultat de l'entretien (seulement pour modification) */}
              {editingEntretien && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Résultat de l'entretien
                  </label>
                  <select
                    name="idResultat"
                    value={formData.idResultat || ''}
                    onChange={handleInputChange}
                    style={styles.select}
                  >
                    <option value="">Pas encore évalué</option>
                    <option value="basse">Basse</option>
                    <option value="moyen">Moyen</option>
                    <option value="bon">Bon</option>
                  </select>
                </div>
              )}

              <div style={styles.modalActions}>
                {editingEntretien && (
                  <button
                    type="button"
                    onClick={supprimerEntretien}
                    style={styles.deleteButton}
                  >
                    <FiTrash2 size={16} />
                    Supprimer
                  </button>
                )}
                <div style={styles.actionButtons}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={styles.cancelButton}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    style={styles.saveButton}
                  >
                    <FiSave size={16} />
                    {editingEntretien ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div style={{
          ...styles.toast,
          backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444'
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '32px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    gap: '16px',
    color: '#64748b'
  },
  header: {
    marginBottom: '32px'
  },
  headerContent: {
    textAlign: 'center'
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b',
    margin: 0
  },
  calendarContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '0',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 24px 0 24px',
    marginBottom: '24px'
  },
  modalTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    color: '#64748b',
    transition: 'all 0.2s ease'
  },
  form: {
    padding: '0 24px 24px 24px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    boxSizing: 'border-box'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '32px'
  },
  deleteButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  actionButtons: {
    display: 'flex',
    gap: '12px'
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#f8fafc',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  toast: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '8px',
    color: '#ffffff',
    fontWeight: '500',
    zIndex: 1001,
    animation: 'slideIn 0.3s ease'
  },
  candidatInfo: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px'
  },
  candidatInfoTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '12px',
    margin: '0 0 12px 0'
  },
  candidatInfoContent: {
    display: 'grid',
    gap: '8px'
  },
  cvPreview: {
    marginTop: '8px'
  },
  cvContent: {
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    padding: '8px',
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
    maxHeight: '60px',
    overflow: 'hidden'
  }
};

export default CalendrierEntretiens;
