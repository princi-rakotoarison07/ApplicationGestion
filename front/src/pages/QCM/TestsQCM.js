import { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiTrash2, 
  FiEye, 
  FiBookOpen,
  FiUsers,
  FiCheckCircle,
  FiX
} from 'react-icons/fi';

const TestsQCM = () => {
  const [tests, setTests] = useState([]);
  const [profils, setProfils] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    idProfil: ''
  });
  const [questionData, setQuestionData] = useState({
    numero: 1,
    question: '',
    points: 1,
    choix: [
      { texte: '', estCorrect: false },
      { texte: '', estCorrect: false },
      { texte: '', estCorrect: false },
      { texte: '', estCorrect: false }
    ]
  });

  useEffect(() => {
    chargerTests();
    chargerProfils();
  }, []);

  const chargerTests = async () => {
    try {
      console.log('Chargement des tests...');
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'présent' : 'absent');
      
      const response = await fetch('/api/qcm/tests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setTests(data.data);
        console.log('Tests chargés:', data.data);
      } else {
        setError('Erreur lors du chargement des tests: ' + data.message);
        console.error('Erreur API:', data.message);
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError('Erreur de connexion au serveur: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const chargerProfils = async () => {
    try {
      console.log('Chargement des profils...');
      const token = localStorage.getItem('token');
      const response = await fetch('/api/qcm/profils', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Profils response status:', response.status);
      const data = await response.json();
      console.log('Profils data:', data);
      
      if (data.success) {
        setProfils(data.data);
        console.log('Profils chargés:', data.data);
      } else {
        console.error('Erreur profils:', data.message);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des profils:', err);
    }
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.idProfil) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/qcm/tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setShowCreateModal(false);
        setFormData({ nom: '', idProfil: '' });
        chargerTests();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erreur lors de la création du test');
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!questionData.question || questionData.choix.some(c => !c.texte)) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    const hasCorrectAnswer = questionData.choix.some(c => c.estCorrect);
    if (!hasCorrectAnswer) {
      setError('Au moins un choix doit être marqué comme correct');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/qcm/tests/${selectedTest.id}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(questionData)
      });

      const data = await response.json();

      if (data.success) {
        setShowQuestionModal(false);
        setQuestionData({
          numero: questionData.numero + 1,
          question: '',
          points: 1,
          choix: [
            { texte: '', estCorrect: false },
            { texte: '', estCorrect: false },
            { texte: '', estCorrect: false },
            { texte: '', estCorrect: false }
          ]
        });
        chargerTests();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erreur lors de l\'ajout de la question');
    }
  };

  const handleDeleteTest = async (testId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce test ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/qcm/tests/${testId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        chargerTests();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erreur lors de la suppression du test');
    }
  };

  const updateChoix = (index, field, value) => {
    const newChoix = [...questionData.choix];
    newChoix[index][field] = value;
    setQuestionData({ ...questionData, choix: newChoix });
  };

  console.log('Render - loading:', loading, 'tests:', tests, 'error:', error);
  
  if (loading) return <div style={styles.loading}>Chargement des tests QCM...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Gestion des Tests QCM</h1>
        <p style={styles.subtitle}>
          Créez et gérez vos questionnaires à choix multiples
        </p>
        <button 
          onClick={() => window.location.href = '/qcm/creer'}
          style={styles.createButton}
        >
          <FiPlus size={20} />
          <span>Nouveau Test</span>
        </button>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          {error}
          <button onClick={() => setError(null)} style={styles.closeError}>
            <FiX size={16} />
          </button>
        </div>
      )}

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <FiBookOpen size={24} color="#1e40af" />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>{tests.length}</div>
            <div style={styles.statLabel}>Tests Créés</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <FiUsers size={24} color="#059669" />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>{profils.length}</div>
            <div style={styles.statLabel}>Profils Disponibles</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            <FiCheckCircle size={24} color="#dc2626" />
          </div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>
              {tests.reduce((total, test) => total + (test.nombreQuestions || 0), 0)}
            </div>
            <div style={styles.statLabel}>Questions Totales</div>
          </div>
        </div>
      </div>

      <div style={styles.testsGrid}>
        {tests.map(test => (
          <div key={test.id} style={styles.testCard}>
            <div style={styles.testHeader}>
              <h3 style={styles.testName}>{test.nom}</h3>
              <span style={styles.testProfil}>{test.nomProfil}</span>
            </div>
            
            <div style={styles.testStats}>
              <div style={styles.testStat}>
                <FiBookOpen size={16} color="#64748b" />
                <span>{test.nombreQuestions || 0} questions</span>
              </div>
            </div>

            <div style={styles.testActions}>
              <button 
                onClick={() => window.open(`/test/${test.id}`, '_blank')}
                style={styles.viewTestButton}
              >
                <FiEye size={16} />
                <span>Répondre au Test</span>
              </button>
              <button 
                onClick={() => {
                  setSelectedTest(test);
                  setQuestionData({
                    ...questionData,
                    numero: (test.nombreQuestions || 0) + 1
                  });
                  setShowQuestionModal(true);
                }}
                style={styles.addQuestionButton}
              >
                <FiPlus size={16} />
                <span>Ajouter Question</span>
              </button>
              <button 
                onClick={() => handleDeleteTest(test.id)}
                style={styles.deleteButton}
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Création Test */}
      {showCreateModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Créer un Nouveau Test</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                style={styles.closeButton}
              >
                <FiX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateTest} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Nom du Test</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  style={styles.input}
                  placeholder="Ex: Test JavaScript Avancé"
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Profil Associé</label>
                <select
                  value={formData.idProfil}
                  onChange={(e) => setFormData({...formData, idProfil: e.target.value})}
                  style={styles.select}
                  required
                >
                  <option value="">-- Sélectionner un profil --</option>
                  {profils.map(profil => (
                    <option key={profil.id} value={profil.id}>
                      {profil.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.modalActions}>
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={styles.cancelButton}
                >
                  Annuler
                </button>
                <button type="submit" style={styles.submitButton}>
                  Créer le Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajout Question */}
      {showQuestionModal && (
        <div style={styles.modalOverlay}>
          <div style={{...styles.modal, maxWidth: '600px'}}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                Ajouter une Question - {selectedTest?.nom}
              </h2>
              <button 
                onClick={() => setShowQuestionModal(false)}
                style={styles.closeButton}
              >
                <FiX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddQuestion} style={styles.form}>
              <div style={styles.questionRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Numéro</label>
                  <input
                    type="number"
                    value={questionData.numero}
                    onChange={(e) => setQuestionData({...questionData, numero: parseInt(e.target.value)})}
                    style={styles.input}
                    min="1"
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Points</label>
                  <input
                    type="number"
                    value={questionData.points}
                    onChange={(e) => setQuestionData({...questionData, points: parseInt(e.target.value)})}
                    style={styles.input}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Question</label>
                <textarea
                  value={questionData.question}
                  onChange={(e) => setQuestionData({...questionData, question: e.target.value})}
                  style={styles.textarea}
                  placeholder="Saisissez votre question ici..."
                  rows="3"
                  required
                />
              </div>

              <div style={styles.choixSection}>
                <label style={styles.label}>Choix de Réponses</label>
                {questionData.choix.map((choix, index) => (
                  <div key={index} style={styles.choixRow}>
                    <input
                      type="text"
                      value={choix.texte}
                      onChange={(e) => updateChoix(index, 'texte', e.target.value)}
                      style={styles.choixInput}
                      placeholder={`Choix ${index + 1}`}
                      required
                    />
                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={choix.estCorrect}
                        onChange={(e) => updateChoix(index, 'estCorrect', e.target.checked)}
                        style={styles.checkbox}
                      />
                      <span>Correct</span>
                    </label>
                  </div>
                ))}
              </div>

              <div style={styles.modalActions}>
                <button 
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  style={styles.cancelButton}
                >
                  Annuler
                </button>
                <button type="submit" style={styles.submitButton}>
                  Ajouter la Question
                </button>
              </div>
            </form>
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
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px'
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
  createButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#1e40af',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '24px',
    color: '#dc2626',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeError: {
    background: 'none',
    border: 'none',
    color: '#dc2626',
    cursor: 'pointer'
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
    gap: '16px'
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
  testsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '24px'
  },
  testCard: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s ease'
  },
  testHeader: {
    marginBottom: '16px'
  },
  testName: {
    margin: '0 0 8px 0',
    color: '#1e293b',
    fontSize: '18px',
    fontWeight: '600'
  },
  testProfil: {
    color: '#8b5cf6',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: '#f3f4f6',
    padding: '4px 8px',
    borderRadius: '6px'
  },
  testStats: {
    marginBottom: '20px'
  },
  testStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#475569'
  },
  testActions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'space-between'
  },
  viewTestButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#059669',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    flex: 1
  },
  addQuestionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#8b5cf6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    flex: 1
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
    cursor: 'pointer'
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
    overflow: 'auto'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 24px 0 24px',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '24px'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
    paddingBottom: '16px'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '4px'
  },
  form: {
    padding: '0 24px 24px 24px'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  questionRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    resize: 'vertical',
    boxSizing: 'border-box'
  },
  choixSection: {
    marginBottom: '24px'
  },
  choixRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px'
  },
  choixInput: {
    flex: 1,
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer'
  },
  checkbox: {
    width: '16px',
    height: '16px'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  },
  cancelButton: {
    padding: '10px 20px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    color: '#374151',
    cursor: 'pointer',
    fontSize: '14px'
  },
  submitButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#1e40af',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
    fontSize: '16px',
    color: '#64748b'
  }
};

export default TestsQCM;
