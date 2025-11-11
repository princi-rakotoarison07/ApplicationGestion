import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiPlus, 
  FiTrash2, 
  FiSave,
  FiArrowLeft,
  FiCheck,
  FiX
} from 'react-icons/fi';

const CreerTestQCM = () => {
  const navigate = useNavigate();
  const [profils, setProfils] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Données du test
  const [testData, setTestData] = useState({
    nom: '',
    idProfil: ''
  });

  // Questions du test
  const [questions, setQuestions] = useState([
    {
      numero: 1,
      question: '',
      points: 1,
      choix: [
        { texte: '', estCorrect: false },
        { texte: '', estCorrect: false },
        { texte: '', estCorrect: false },
        { texte: '', estCorrect: false }
      ]
    }
  ]);

  useEffect(() => {
    chargerProfils();
  }, []);

  const chargerProfils = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/qcm/profils', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setProfils(data.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des profils:', err);
    }
  };

  const ajouterQuestion = () => {
    const nouvelleQuestion = {
      numero: questions.length + 1,
      question: '',
      points: 1,
      choix: [
        { texte: '', estCorrect: false },
        { texte: '', estCorrect: false },
        { texte: '', estCorrect: false },
        { texte: '', estCorrect: false }
      ]
    };
    setQuestions([...questions, nouvelleQuestion]);
  };

  const supprimerQuestion = (index) => {
    if (questions.length > 1) {
      const nouvellesQuestions = questions.filter((_, i) => i !== index);
      // Réorganiser les numéros
      const questionsReorganisees = nouvellesQuestions.map((q, i) => ({
        ...q,
        numero: i + 1
      }));
      setQuestions(questionsReorganisees);
    }
  };

  const mettreAJourQuestion = (index, field, value) => {
    const nouvellesQuestions = [...questions];
    nouvellesQuestions[index][field] = value;
    setQuestions(nouvellesQuestions);
  };

  const mettreAJourChoix = (questionIndex, choixIndex, field, value) => {
    const nouvellesQuestions = [...questions];
    nouvellesQuestions[questionIndex].choix[choixIndex][field] = value;
    setQuestions(nouvellesQuestions);
  };

  const ajouterChoix = (questionIndex) => {
    const nouvellesQuestions = [...questions];
    nouvellesQuestions[questionIndex].choix.push({ texte: '', estCorrect: false });
    setQuestions(nouvellesQuestions);
  };

  const supprimerChoix = (questionIndex, choixIndex) => {
    const nouvellesQuestions = [...questions];
    if (nouvellesQuestions[questionIndex].choix.length > 2) {
      nouvellesQuestions[questionIndex].choix.splice(choixIndex, 1);
      setQuestions(nouvellesQuestions);
    }
  };

  const validerFormulaire = () => {
    if (!testData.nom || !testData.idProfil) {
      setError('Veuillez remplir le nom du test et sélectionner un profil');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      if (!question.question.trim()) {
        setError(`La question ${i + 1} ne peut pas être vide`);
        return false;
      }

      if (question.choix.some(c => !c.texte.trim())) {
        setError(`Tous les choix de la question ${i + 1} doivent être remplis`);
        return false;
      }

      if (!question.choix.some(c => c.estCorrect)) {
        setError(`La question ${i + 1} doit avoir au moins une réponse correcte`);
        return false;
      }
    }

    return true;
  };

  const sauvegarderTest = async () => {
    if (!validerFormulaire()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      // Créer le test
      const testResponse = await fetch('/api/qcm/tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testData)
      });

      const testResult = await testResponse.json();

      if (!testResult.success) {
        throw new Error(testResult.message);
      }

      const testId = testResult.data.id;

      // Ajouter chaque question
      for (const question of questions) {
        const questionResponse = await fetch(`/api/qcm/tests/${testId}/questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...question,
            idTest: testId
          })
        });

        const questionResult = await questionResponse.json();
        if (!questionResult.success) {
          throw new Error(`Erreur lors de l'ajout de la question ${question.numero}: ${questionResult.message}`);
        }
      }

      setSuccess('Test QCM créé avec succès !');
      setTimeout(() => {
        navigate('/qcm');
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button 
          onClick={() => navigate('/qcm')}
          style={styles.backButton}
        >
          <FiArrowLeft size={20} />
          <span>Retour</span>
        </button>
        <h1 style={styles.title}>Créer un Nouveau Test QCM</h1>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          {error}
          <button onClick={() => setError(null)} style={styles.closeError}>
            <FiX size={16} />
          </button>
        </div>
      )}

      {success && (
        <div style={styles.successBanner}>
          <FiCheck size={20} />
          {success}
        </div>
      )}

      {/* Informations du test */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Informations du Test</h2>
        <div style={styles.testInfoGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nom du Test *</label>
            <input
              type="text"
              value={testData.nom}
              onChange={(e) => setTestData({...testData, nom: e.target.value})}
              style={styles.input}
              placeholder="Ex: Test JavaScript Avancé"
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Profil Associé *</label>
            <select
              value={testData.idProfil}
              onChange={(e) => setTestData({...testData, idProfil: e.target.value})}
              style={styles.select}
            >
              <option value="">-- Sélectionner un profil --</option>
              {profils.map(profil => (
                <option key={profil.id} value={profil.id}>
                  {profil.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Questions ({questions.length})</h2>
          <button 
            onClick={ajouterQuestion}
            style={styles.addButton}
          >
            <FiPlus size={16} />
            <span>Ajouter Question</span>
          </button>
        </div>

        {questions.map((question, questionIndex) => (
          <div key={questionIndex} style={styles.questionCard}>
            <div style={styles.questionHeader}>
              <h3 style={styles.questionTitle}>Question {question.numero}</h3>
              {questions.length > 1 && (
                <button 
                  onClick={() => supprimerQuestion(questionIndex)}
                  style={styles.deleteQuestionButton}
                >
                  <FiTrash2 size={16} />
                </button>
              )}
            </div>

            <div style={styles.questionContent}>
              <div style={styles.questionRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Question *</label>
                  <textarea
                    value={question.question}
                    onChange={(e) => mettreAJourQuestion(questionIndex, 'question', e.target.value)}
                    style={styles.textarea}
                    placeholder="Saisissez votre question ici..."
                    rows="3"
                  />
                </div>
                <div style={styles.pointsGroup}>
                  <label style={styles.label}>Points</label>
                  <input
                    type="number"
                    value={question.points}
                    onChange={(e) => mettreAJourQuestion(questionIndex, 'points', parseInt(e.target.value) || 1)}
                    style={styles.pointsInput}
                    min="1"
                  />
                </div>
              </div>

              <div style={styles.choixSection}>
                <div style={styles.choixHeader}>
                  <label style={styles.label}>Choix de Réponses *</label>
                  <button 
                    onClick={() => ajouterChoix(questionIndex)}
                    style={styles.addChoixButton}
                  >
                    <FiPlus size={14} />
                  </button>
                </div>
                
                {question.choix.map((choix, choixIndex) => (
                  <div key={choixIndex} style={styles.choixRow}>
                    <input
                      type="text"
                      value={choix.texte}
                      onChange={(e) => mettreAJourChoix(questionIndex, choixIndex, 'texte', e.target.value)}
                      style={styles.choixInput}
                      placeholder={`Choix ${choixIndex + 1}`}
                    />
                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={choix.estCorrect}
                        onChange={(e) => mettreAJourChoix(questionIndex, choixIndex, 'estCorrect', e.target.checked)}
                        style={styles.checkbox}
                      />
                      <span>Correct</span>
                    </label>
                    {question.choix.length > 2 && (
                      <button 
                        onClick={() => supprimerChoix(questionIndex, choixIndex)}
                        style={styles.deleteChoixButton}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        <button 
          onClick={() => navigate('/qcm')}
          style={styles.cancelButton}
          disabled={loading}
        >
          Annuler
        </button>
        <button 
          onClick={sauvegarderTest}
          style={styles.saveButton}
          disabled={loading}
        >
          <FiSave size={16} />
          <span>{loading ? 'Sauvegarde...' : 'Sauvegarder le Test'}</span>
        </button>
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
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '32px'
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '10px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#64748b',
    transition: 'all 0.2s ease'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
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
  successBanner: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '24px',
    color: '#16a34a',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  closeError: {
    background: 'none',
    border: 'none',
    color: '#dc2626',
    cursor: 'pointer'
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 20px 0'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  testInfoGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '20px'
  },
  inputGroup: {
    marginBottom: '20px'
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
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#1e40af',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  questionCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    backgroundColor: '#f8fafc'
  },
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  questionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0
  },
  deleteQuestionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  questionContent: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '16px'
  },
  questionRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '16px',
    alignItems: 'start'
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
  pointsGroup: {
    width: '100px'
  },
  pointsInput: {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    textAlign: 'center',
    boxSizing: 'border-box'
  },
  choixSection: {
    marginTop: '16px'
  },
  choixHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  addChoixButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    backgroundColor: '#8b5cf6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
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
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  checkbox: {
    width: '16px',
    height: '16px'
  },
  deleteChoixButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  actions: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'flex-end',
    marginTop: '32px'
  },
  cancelButton: {
    padding: '12px 24px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    color: '#374151',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  }
};

export default CreerTestQCM;
