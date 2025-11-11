import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiClock, FiUser, FiFileText, FiCheck, FiAlertCircle } from 'react-icons/fi';
import './TestQCM.css';

const TestQCM = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reponses, setReponses] = useState({});
  const [testCommence, setTestCommence] = useState(false);
  const [tempsRestant, setTempsRestant] = useState(0);
  const [testTermine, setTestTermine] = useState(false);

  useEffect(() => {
    chargerTest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (testCommence && tempsRestant > 0) {
      const timer = setInterval(() => {
        setTempsRestant(prev => {
          if (prev <= 1) {
            terminerTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testCommence, tempsRestant]);

  const chargerTest = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/qcm/public/token/${token}`);
      const data = await response.json();

      if (data.success) {
        setTestData(data.data);
        setTempsRestant(data.data.test.dureeMinutes * 60); // Convertir en secondes
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Erreur lors du chargement du test');
      console.error('Erreur chargement test:', error);
    } finally {
      setLoading(false);
    }
  };

  const commencerTest = () => {
    setTestCommence(true);
  };

  const selectionnerReponse = (questionId, reponseIndex) => {
    setReponses(prev => ({
      ...prev,
      [questionId]: reponseIndex
    }));
  };

  const terminerTest = async () => {
    try {
      console.log('Soumission des réponses:', reponses);
      
      // Envoyer les réponses à l'API
      const response = await fetch(`/api/qcm/public/token/${token}/soumettre`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reponses })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Test soumis avec succès:', data.data);
        setTestData(prev => ({
          ...prev,
          resultat: data.data
        }));
        setTestTermine(true);
      } else {
        console.error('❌ Erreur soumission:', data.message);
        setError('Erreur lors de la soumission du test');
      }
      
    } catch (error) {
      console.error('Erreur soumission test:', error);
      setError('Erreur lors de la soumission du test');
    }
  };

  const formatTemps = (secondes) => {
    const minutes = Math.floor(secondes / 60);
    const secs = secondes % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Chargement du test...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <FiAlertCircle size={48} color="#ef4444" />
          <h2>Erreur</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/HireHub')} style={styles.button}>
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  if (!testCommence) {
    return (
      <div style={styles.container}>
        <div style={styles.welcome}>
          <div style={styles.header}>
            <FiFileText size={48} color="#3b82f6" />
            <h1>{testData.test.nom}</h1>
            <p style={styles.description}>{testData.test.description}</p>
          </div>

          <div style={styles.info}>
            <div style={styles.infoItem}>
              <FiUser size={20} />
              <span>Candidat: {testData.candidat.prenom} {testData.candidat.nom}</span>
            </div>
            <div style={styles.infoItem}>
              <FiClock size={20} />
              <span>Durée: {testData.test.dureeMinutes} minutes</span>
            </div>
            <div style={styles.infoItem}>
              <FiFileText size={20} />
              <span>Questions: {testData.questions.length}</span>
            </div>
          </div>

          <div style={styles.instructions}>
            <h3>Instructions:</h3>
            <ul>
              <li>Vous avez {testData.test.dureeMinutes} minutes pour compléter ce test</li>
              <li>Chaque question a une seule bonne réponse</li>
              <li>Vous pouvez revenir sur vos réponses avant de terminer</li>
              <li>Le test se termine automatiquement à la fin du temps imparti</li>
            </ul>
          </div>

          <button onClick={commencerTest} style={styles.startButton}>
            Commencer le test
          </button>
        </div>
      </div>
    );
  }

  if (testTermine) {
    const resultat = testData?.resultat;
    return (
      <div style={styles.container}>
        <div style={styles.finished}>
          <FiCheck size={48} color="#10b981" />
          <h2>Test terminé !</h2>
          <p>Vos réponses ont été enregistrées avec succès.</p>
          
          {resultat && (
            <div style={styles.scoreContainer}>
              <h3>Votre score :</h3>
              <div style={styles.scoreDisplay}>
                <span style={styles.scoreNumber}>{resultat.pourcentage}%</span>
                <span style={styles.scoreDetail}>
                  {resultat.scoreTotal} / {resultat.pointsMax} points
                </span>
              </div>
              <p style={styles.scoreMessage}>{resultat.message}</p>
            </div>
          )}
          
          <p>Vous recevrez les résultats détaillés par email.</p>
          <button onClick={() => navigate('/HireHub')} style={styles.button}>
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.testHeader}>
        <h1>{testData.test.nom}</h1>
        <div style={styles.timer}>
          <FiClock size={20} />
          <span style={{ color: tempsRestant < 300 ? '#ef4444' : '#10b981' }}>
            {formatTemps(tempsRestant)}
          </span>
        </div>
      </div>

      <div style={styles.progress}>
        <div style={styles.progressBar}>
          <div 
            style={{
              ...styles.progressFill,
              width: `${(Object.keys(reponses).length / testData.questions.length) * 100}%`
            }}
          />
        </div>
        <span>{Object.keys(reponses).length} / {testData.questions.length} répondues</span>
      </div>

      <div style={styles.questions}>
        {testData.questions.map((question, index) => (
          <div key={question.id} style={styles.question}>
            <h3>Question {index + 1}</h3>
            <p style={styles.questionText}>{question.question}</p>
            
            <div style={styles.reponses}>
              {question.reponses.map((reponse, repIndex) => (
                <label key={repIndex} style={styles.reponseLabel}>
                  <input
                    type="radio"
                    name={`question_${question.id}`}
                    checked={reponses[question.id] === repIndex}
                    onChange={() => selectionnerReponse(question.id, repIndex)}
                    style={styles.radio}
                  />
                  <span style={styles.reponseText}>{reponse.texte}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.actions}>
        <button onClick={terminerTest} style={styles.submitButton}>
          Terminer le test
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '20px'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
    gap: '20px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  error: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
    gap: '20px',
    textAlign: 'center'
  },
  welcome: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  description: {
    color: '#6b7280',
    fontSize: '16px',
    marginTop: '10px'
  },
  info: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px'
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#374151'
  },
  instructions: {
    marginBottom: '30px'
  },
  startButton: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  testHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '800px',
    margin: '0 auto 20px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  timer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '18px',
    fontWeight: '600'
  },
  progress: {
    maxWidth: '800px',
    margin: '0 auto 20px',
    padding: '15px 20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  progressBar: {
    flex: 1,
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    transition: 'width 0.3s ease'
  },
  questions: {
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  question: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  questionText: {
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '20px',
    color: '#374151'
  },
  reponses: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  reponseLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  radio: {
    width: '18px',
    height: '18px'
  },
  reponseText: {
    fontSize: '15px',
    color: '#374151'
  },
  actions: {
    maxWidth: '800px',
    margin: '30px auto',
    textAlign: 'center'
  },
  submitButton: {
    padding: '15px 40px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  finished: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
    gap: '20px',
    textAlign: 'center'
  },
  scoreContainer: {
    backgroundColor: '#f0f9ff',
    padding: '20px',
    borderRadius: '12px',
    border: '2px solid #3b82f6',
    margin: '20px 0'
  },
  scoreDisplay: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    margin: '15px 0'
  },
  scoreNumber: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#3b82f6'
  },
  scoreDetail: {
    fontSize: '16px',
    color: '#6b7280'
  },
  scoreMessage: {
    fontSize: '14px',
    color: '#374151',
    fontStyle: 'italic'
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer'
  }
};

export default TestQCM;
