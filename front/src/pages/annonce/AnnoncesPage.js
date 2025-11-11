import { useState } from 'react';
import ListeAnnonces from './ListeAnnonces';
import CreerAnnonce from './CreerAnnonce';

const AnnoncesPage = () => {
  const [currentView, setCurrentView] = useState('liste');

  const handleNavigateToCreate = () => {
    setCurrentView('creer');
  };

  const handleNavigateToList = () => {
    setCurrentView('liste');
  };

  return (
    <div>
      {currentView === 'liste' && (
        <ListeAnnonces onCreerAnnonce={handleNavigateToCreate} />
      )}
      {currentView === 'creer' && (
        <CreerAnnonce onRetour={handleNavigateToList} />
      )}
    </div>
  );
};

export default AnnoncesPage;
