import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiClock, 
  FiUser, 
  FiCheckCircle,
  FiArrowRight,
  FiArrowLeft,
  FiSend,
  FiAward
} from 'react-icons/fi';

const RepondreTestQCM = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [reponses, setReponses] = useState({});
  const [questionActuelle, setQuestionActuelle] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [candidatInfo, setCandidatInfo] = useState({
    nom: '',
    prenom: '',
    email: ''
  });
  const [etape, setEtape] = useState('info'); // 'info', 'test', 'resultat'
  const [tempsRestant, setTempsRestant] = useState(null);
  const [testTermine, setTestTermine] = useState(false);

  useEffect(() => {
    chargerTest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (tempsRestant > 0 && etape === 'test' && !testTermine) {
      const timer = setTimeout(() => {
        setTempsRestant(tempsRestant - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (tempsRestant === 0 && !testTermine) {
      soumettreTest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempsRestant, etape, testTermine]);

  const chargerTest = async () => {
    try {
      const response = await fetch(`/api/qcm/public/tests/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setTest(data.data);
        setQuestions(data.data.questions || []);
        // Initialiser 30 minutes par défaut si pas de durée spécifiée
        setTempsRestant(30 * 60);
      } else {
        setError('Test non trouvé');
      }
    } catch (err) {
      setError('Erreur lors du chargement du test');
    } finally {
      setLoading(false);
    }
  };

  const demarrerTest = () => {
    if (!candidatInfo.nom || !candidatInfo.prenom || !candidatInfo.email) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    setError(null);
    setEtape('test');
  };

  const selectionnerReponse = (questionId, choixId) => {
    setReponses({
      ...reponses,
      [questionId]: choixId
    });
  };

  const questionSuivante = () => {
    if (questionActuelle < questions.length - 1) {
      setQuestionActuelle(questionActuelle + 1);
    }
  };

  const questionPrecedente = () => {
    if (questionActuelle > 0) {
      setQuestionActuelle(questionActuelle - 1);
    }
  };

  const soumettreTest = async () => {
    setTestTermine(true);
    try {
      const response = await fetch('/api/qcm/soumettre', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          testId: id,
          candidat: candidatInfo,
          reponses: reponses
        })
      });

      const data = await response.json();
      if (data.success) {
        setEtape('resultat');
      } else {
        setError('Erreur lors de la soumission');
      }
    } catch (err) {
      setError('Erreur lors de la soumission du test');
    }
  };

  const formatTemps = (secondes) => {
    const minutes = Math.floor(secondes / 60);
    const secs = secondes % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculerProgression = () => {
    const reponsesCount = Object.keys(reponses).length;
    return Math.round((reponsesCount / questions.length) * 100);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Chargement du test...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorCard}>
          <h2 style={styles.errorTitle}>Erreur</h2>
          <p style={styles.errorMessage}>{error}</p>
          <button 
            onClick={() => navigate('/')}
            style={styles.errorButton}
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  // Page d'informations candidat
  if (etape === 'info') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>QCM</div>
            <h1 style={styles.logoText}>Test en Ligne</h1>
          </div>
        </div>

        <div style={styles.welcomeCard}>
          <div style={styles.testInfo}>
            <h2 style={styles.testTitle}>{test?.nom}</h2>
            <p style={styles.testDescription}>Profil: {test?.nomProfil}</p>
            <div style={styles.testStats}>
              <div style={styles.statItem}>
                <FiClock size={20} color="#1e40af" />
                <span>30 minutes</span>
              </div>
              <div style={styles.statItem}>
                <FiCheckCircle size={20} color="#16a34a" />
                <span>{questions.length} questions</span>
              </div>
            </div>
          </div>

          <div style={styles.candidatForm}>
            <h3 style={styles.formTitle}>Vos informations</h3>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nom *</label>
              <input
                type="text"
                value={candidatInfo.nom}
                onChange={(e) => setCandidatInfo({...candidatInfo, nom: e.target.value})}
                style={styles.input}
                placeholder="Votre nom"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Prénom *</label>
              <input
                type="text"
                value={candidatInfo.prenom}
                onChange={(e) => setCandidatInfo({...candidatInfo, prenom: e.target.value})}
                style={styles.input}
                placeholder="Votre prénom"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email *</label>
              <input
                type="email"
                value={candidatInfo.email}
                onChange={(e) => setCandidatInfo({...candidatInfo, email: e.target.value})}
                style={styles.input}
                placeholder="votre.email@exemple.com"
              />
            </div>

            {error && (
              <div style={styles.errorMessage}>
                {error}
              </div>
            )}

            <button 
              onClick={demarrerTest}
              style={styles.startButton}
            >
              <FiArrowRight size={20} />
              <span>Commencer le Test</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Page du test
  if (etape === 'test') {
    const question = questions[questionActuelle];
    
    return (
      <div style={styles.container}>
        <div style={styles.testHeader}>
          <div style={styles.testHeaderLeft}>
            <h2 style={styles.testHeaderTitle}>{test?.nom}</h2>
            <div style={styles.candidatName}>
              <FiUser size={16} />
              <span>{candidatInfo.prenom} {candidatInfo.nom}</span>
            </div>
          </div>
          <div style={styles.testHeaderRight}>
            <div style={styles.timer}>
              <FiClock size={20} />
              <span style={{color: tempsRestant < 300 ? '#ef4444' : '#16a34a'}}>
                {formatTemps(tempsRestant)}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.progressBar}>
          <div 
            style={{
              ...styles.progressFill,
              width: `${((questionActuelle + 1) / questions.length) * 100}%`
            }}
          ></div>
        </div>

        <div style={styles.questionCard}>
          <div style={styles.questionHeader}>
            <span style={styles.questionNumber}>
              Question {questionActuelle + 1} sur {questions.length}
            </span>
            <span style={styles.questionPoints}>
              {question?.points} point{question?.points > 1 ? 's' : ''}
            </span>
          </div>

          <h3 style={styles.questionText}>{question?.question}</h3>

          <div style={styles.choixContainer}>
            {question?.choix?.map((choix, index) => (
              <div
                key={choix.id}
                onClick={() => selectionnerReponse(question.id, choix.id)}
                style={{
                  ...styles.choixItem,
                  ...(reponses[question.id] === choix.id ? styles.choixSelected : {})
                }}
              >
                <div style={styles.choixRadio}>
                  {reponses[question.id] === choix.id && (
                    <div style={styles.choixRadioSelected}></div>
                  )}
                </div>
                <span style={styles.choixText}>{choix.texte}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.navigationButtons}>
          <button 
            onClick={questionPrecedente}
            disabled={questionActuelle === 0}
            style={{
              ...styles.navButton,
              ...(questionActuelle === 0 ? styles.navButtonDisabled : {})
            }}
          >
            <FiArrowLeft size={16} />
            <span>Précédent</span>
          </button>

          {questionActuelle === questions.length - 1 ? (
            <button 
              onClick={soumettreTest}
              style={styles.submitButton}
            >
              <FiSend size={16} />
              <span>Terminer le Test</span>
            </button>
          ) : (
            <button 
              onClick={questionSuivante}
              style={styles.navButton}
            >
              <span>Suivant</span>
              <FiArrowRight size={16} />
            </button>
          )}
        </div>

        <div style={styles.progressInfo}>
          <span>Progression: {calculerProgression()}% complété</span>
          <span>{Object.keys(reponses).length}/{questions.length} réponses</span>
        </div>
      </div>
    );
  }

  // Page de résultat
  if (etape === 'resultat') {
    return (
      <div style={styles.container}>
        <div style={styles.resultCard}>
          <div style={styles.resultIcon}>
            <FiAward size={48} color="#16a34a" />
          </div>
          <h2 style={styles.resultTitle}>Test Terminé !</h2>
          <p style={styles.resultMessage}>
            Merci {candidatInfo.prenom} {candidatInfo.nom} d'avoir participé au test "{test?.nom}".
          </p>
          <div style={styles.resultStats}>
            <div style={styles.resultStat}>
              <span style={styles.resultStatLabel}>Questions répondues</span>
              <span style={styles.resultStatValue}>
                {Object.keys(reponses).length}/{questions.length}
              </span>
            </div>
            <div style={styles.resultStat}>
              <span style={styles.resultStatLabel}>Temps utilisé</span>
              <span style={styles.resultStatValue}>
                {formatTemps(30 * 60 - tempsRestant)}
              </span>
            </div>
          </div>
          <p style={styles.resultNote}>
            Vos réponses ont été enregistrées. Les résultats seront communiqués ultérieurement.
          </p>
        </div>
      </div>
    );
  }
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f1f5f9'
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #1e40af',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    marginTop: '16px',
    color: '#64748b',
    fontSize: '16px'
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    padding: '20px'
  },
  errorCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%'
  },
  errorTitle: {
    color: '#ef4444',
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '16px'
  },
  errorMessage: {
    color: '#64748b',
    marginBottom: '24px'
  },
  errorButton: {
    backgroundColor: '#1e40af',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  header: {
    backgroundColor: '#1e293b',
    padding: '24px 32px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  logoIcon: {
    width: '48px',
    height: '48px',
    backgroundColor: '#1e40af',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: '16px'
  },
  logoText: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: '600',
    margin: 0
  },
  welcomeCard: {
    maxWidth: '800px',
    margin: '40px auto',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    minHeight: '500px'
  },
  testInfo: {
    padding: '40px',
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  testTitle: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '12px',
    lineHeight: '1.2'
  },
  testDescription: {
    fontSize: '16px',
    opacity: 0.9,
    marginBottom: '32px'
  },
  testStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '16px',
    fontWeight: '500'
  },
  candidatForm: {
    padding: '40px'
  },
  formTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '24px'
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
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '16px',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  },
  startButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    marginTop: '24px',
    transition: 'background-color 0.2s'
  },
  testHeader: {
    backgroundColor: '#ffffff',
    padding: '20px 32px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  testHeaderLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  testHeaderTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0
  },
  candidatName: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#64748b',
    fontSize: '14px'
  },
  testHeaderRight: {
    display: 'flex',
    alignItems: 'center'
  },
  timer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f8fafc',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '18px',
    fontWeight: '600'
  },
  progressBar: {
    height: '6px',
    backgroundColor: '#e2e8f0',
    position: 'relative'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1e40af',
    transition: 'width 0.3s ease'
  },
  questionCard: {
    maxWidth: '800px',
    margin: '40px auto',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  questionNumber: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#64748b'
  },
  questionPoints: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1e40af',
    backgroundColor: '#eff6ff',
    padding: '4px 12px',
    borderRadius: '20px'
  },
  questionText: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: '1.5',
    marginBottom: '32px'
  },
  choixContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  choixItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  choixSelected: {
    borderColor: '#1e40af',
    backgroundColor: '#eff6ff'
  },
  choixRadio: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid #d1d5db',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  choixRadioSelected: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#1e40af'
  },
  choixText: {
    fontSize: '16px',
    color: '#1e293b',
    flex: 1
  },
  navigationButtons: {
    maxWidth: '800px',
    margin: '32px auto',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px'
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#ffffff',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    padding: '12px 20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    transition: 'all 0.2s ease'
  },
  navButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  progressInfo: {
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    color: '#64748b',
    padding: '0 20px'
  },
  resultCard: {
    maxWidth: '600px',
    margin: '80px auto',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '48px',
    textAlign: 'center',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
  },
  resultIcon: {
    marginBottom: '24px'
  },
  resultTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#16a34a',
    marginBottom: '16px'
  },
  resultMessage: {
    fontSize: '18px',
    color: '#64748b',
    marginBottom: '32px',
    lineHeight: '1.6'
  },
  resultStats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '32px'
  },
  resultStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  resultStatLabel: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500'
  },
  resultStatValue: {
    fontSize: '24px',
    color: '#1e293b',
    fontWeight: '700'
  },
  resultNote: {
    fontSize: '16px',
    color: '#64748b',
    fontStyle: 'italic'
  }
};

export default RepondreTestQCM;
