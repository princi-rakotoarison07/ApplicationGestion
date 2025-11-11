import { useState, useEffect } from 'react';
import { FiBell, FiX, FiClock, FiFileText, FiExternalLink } from 'react-icons/fi';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    chargerNotifications();
    // Actualiser les notifications toutes les 30 secondes
    const interval = setInterval(chargerNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Calculer le nombre de notifications non lues
    const count = notifications.filter(n => !n.lue).length;
    setUnreadCount(count);
  }, [notifications]);

  const chargerNotifications = async () => {
    try {
      setLoading(true);
      // Test temporaire avec API simple (sans authentification)
      const response = await fetch('/api/candidats/notifications/simple');
      
      if (!response.ok) {
        console.log(`🔔 API notifications non disponible (${response.status})`);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setNotifications(data.data);
        console.log(`🔔 ${data.data.length} notifications chargées`);
      } else {
        console.log('🔔 Erreur chargement notifications:', data.message);
      }
    } catch (error) {
      console.log('🔔 Erreur chargement notifications:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const marquerCommeLue = async (notificationId) => {
    try {
      // Route temporaire sans authentification
      const response = await fetch(`/api/candidats/notifications/${notificationId}/lue/simple`, {
        method: 'PUT'
      });

      if (response.ok) {
        // Mettre à jour localement
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, lue: true } : n
          )
        );
        console.log(`🔔 Notification ${notificationId} marquée comme lue`);
      }
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  };

  const ouvrirTestQCM = (notification) => {
    try {
      const donnees = JSON.parse(notification.donnees);
      if (donnees.token) {
        // Marquer comme lue
        marquerCommeLue(notification.id);
        // Construire l'URL de la page React avec le token
        const urlTest = `/HireHub/test/${donnees.token}`;
        console.log('🔔 Ouverture du test QCM:', urlTest);
        // Ouvrir le test dans un nouvel onglet
        window.open(urlTest, '_blank');
      }
    } catch (error) {
      console.error('Erreur ouverture test:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'test_qcm':
        return <FiFileText size={16} color="#3b82f6" />;
      case 'rappel_test':
        return <FiClock size={16} color="#f59e0b" />;
      default:
        return <FiBell size={16} color="#6b7280" />;
    }
  };

  return (
    <div style={styles.container}>
      <button
        style={styles.bellButton}
        onClick={() => setShowDropdown(!showDropdown)}
        title="Notifications"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span style={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <>
          <div style={styles.overlay} onClick={() => setShowDropdown(false)} />
          <div style={styles.dropdown}>
            <div style={styles.header}>
              <h3 style={styles.title}>Notifications</h3>
              <button
                style={styles.closeButton}
                onClick={() => setShowDropdown(false)}
              >
                <FiX size={16} />
              </button>
            </div>

            <div style={styles.content}>
              {loading ? (
                <div style={styles.loading}>Chargement...</div>
              ) : notifications.length === 0 ? (
                <div style={styles.empty}>
                  <FiBell size={32} color="#94a3b8" />
                  <p>Aucune notification</p>
                </div>
              ) : (
                <div style={styles.list}>
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      style={{
                        ...styles.item,
                        ...(notification.lue ? {} : styles.itemUnread)
                      }}
                      onClick={() => {
                        if (notification.typeNotification === 'test_qcm') {
                          ouvrirTestQCM(notification);
                        } else {
                          marquerCommeLue(notification.id);
                        }
                      }}
                    >
                      <div style={styles.itemIcon}>
                        {getNotificationIcon(notification.typeNotification)}
                      </div>
                      
                      <div style={styles.itemContent}>
                        <div style={styles.itemTitle}>
                          {notification.titre}
                          {!notification.lue && <span style={styles.unreadDot} />}
                        </div>
                        <div style={styles.itemMessage}>
                          {notification.message}
                        </div>
                        <div style={styles.itemMeta}>
                          <span style={styles.itemDate}>
                            {formatDate(notification.dateCreation)}
                          </span>
                          {notification.typeNotification === 'test_qcm' && (
                            <span style={styles.itemAction}>
                              <FiExternalLink size={12} />
                              Accéder au test
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div style={styles.footer}>
                <button
                  style={styles.markAllButton}
                  onClick={async () => {
                    // Marquer toutes les notifications comme lues
                    const unreadNotifications = notifications.filter(n => !n.lue);
                    for (const notification of unreadNotifications) {
                      await marquerCommeLue(notification.id);
                    }
                  }}
                >
                  Tout marquer comme lu
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    display: 'inline-block'
  },
  bellButton: {
    position: 'relative',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    color: '#6b7280',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  badge: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    backgroundColor: '#ef4444',
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold',
    borderRadius: '10px',
    padding: '2px 5px',
    minWidth: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 999
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    width: '380px',
    maxHeight: '500px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
    border: '1px solid #e5e7eb',
    zIndex: 1000,
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb'
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: '#6b7280',
    borderRadius: '4px'
  },
  content: {
    maxHeight: '350px',
    overflowY: 'auto'
  },
  loading: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#6b7280'
  },
  empty: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#6b7280',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },
  list: {
    padding: '8px 0'
  },
  item: {
    display: 'flex',
    padding: '12px 20px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    borderLeft: '3px solid transparent'
  },
  itemUnread: {
    backgroundColor: '#f0f9ff',
    borderLeftColor: '#3b82f6'
  },
  itemIcon: {
    marginRight: '12px',
    marginTop: '2px'
  },
  itemContent: {
    flex: 1,
    minWidth: 0
  },
  itemTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '4px'
  },
  unreadDot: {
    width: '6px',
    height: '6px',
    backgroundColor: '#3b82f6',
    borderRadius: '50%'
  },
  itemMessage: {
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: '1.4',
    marginBottom: '6px'
  },
  itemMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemDate: {
    fontSize: '11px',
    color: '#9ca3af'
  },
  itemAction: {
    fontSize: '11px',
    color: '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: '500'
  },
  footer: {
    padding: '12px 20px',
    borderTop: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb'
  },
  markAllButton: {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
};

export default NotificationBell;
