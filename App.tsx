import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { KidsDashboard } from './views/KidsDashboard';
import { Encyclopedia } from './views/Encyclopedia';
import { ParentsArea } from './views/ParentsArea';
import { AppView, Plant } from './types';
import { INITIAL_PLANT } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  
  // Lifting state up for the plant so changes persist across tabs
  const [plant, setPlant] = useState<Plant>(INITIAL_PLANT);

  const handleUpdatePlant = (updatedStats: Partial<Plant['stats']>) => {
    setPlant(prev => ({
      ...prev,
      stats: { ...prev.stats, ...updatedStats }
    }));
  };

  const handleAddDiaryEntry = (entry: Omit<Plant['diary'][number], 'id'>) => {
    setPlant(prev => ({
      ...prev,
      diary: [...prev.diary, { ...entry, id: Date.now().toString() }]
    }));
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return (
          <KidsDashboard 
            plant={plant} 
            onUpdatePlant={handleUpdatePlant} 
            onAddDiaryEntry={handleAddDiaryEntry}
          />
        );
      case AppView.ENCYCLOPEDIA:
        return <Encyclopedia />;
      case AppView.HEALTH:
        return <ParentsArea />;
      default:
        return <KidsDashboard plant={plant} onUpdatePlant={handleUpdatePlant} />;
    }
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto bg-white shadow-2xl relative overflow-hidden flex flex-col font-sans">
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {renderView()}
      </main>
      <Navigation currentView={currentView} onChangeView={setCurrentView} />
    </div>
  );
};

export default App;