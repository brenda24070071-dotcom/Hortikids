//rode primeiro npm run bridge (inicia a ponte de conexao entre celular e esp via ip)
//depois rode para rodar o codigo npm run dev -- --host
//definir porta com em server/serial-bridge.js

import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from './components/Navigation';
import { KidsDashboard } from './views/KidsDashboard';
import { Encyclopedia } from './views/Encyclopedia';
import { ParentsArea } from './views/ParentsArea';
import { AppView, Plant } from './types';
import { INITIAL_PLANT } from './constants';
import { serialService } from './services/serialService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [serialConnected, setSerialConnected] = useState(false);
  
  // Lifting state up for the plant so changes persist across tabs
  const [plant, setPlant] = useState<Plant>(INITIAL_PLANT);

  const handleUpdatePlant = useCallback((updatedStats: Partial<Plant['stats']>) => {
    setPlant(prev => ({
      ...prev,
      stats: { ...prev.stats, ...updatedStats }
    }));
  }, []);

  const handleAddDiaryEntry = useCallback((entry: Omit<Plant['diary'][number], 'id'>) => {
    setPlant(prev => ({
      ...prev,
      diary: [...prev.diary, { ...entry, id: Date.now().toString() }]
    }));
  }, []);

  useEffect(() => {
    const unsubscribe = serialService.onDataReceived((data) => {
      handleUpdatePlant({ water: data.moisture });
    });

    return unsubscribe;
  }, [handleUpdatePlant]);

  // Tenta conectar ao bridge websocket para permitir controle remoto (mobile)
  useEffect(() => {
    const connectBridge = () => {
      try {
        // porta padrão do bridge: 3001
        console.log('Tentando conectar ao WebSocket bridge na porta 3001...');
        serialService.connectWebSocketBridge(3001);
      } catch (err) {
        console.warn('Não foi possível conectar ao websocket bridge automaticamente', err);
      }
    };

    connectBridge();
    
    // Tenta reconectar a cada 10 segundos se falhar
    const retryInterval = setInterval(connectBridge, 10000);
    
    return () => clearInterval(retryInterval);
  }, []);

  const handleSerialConnection = async () => {
    if (serialConnected) {
      await serialService.disconnect();
      setSerialConnected(false);
      return;
    }

    const connected = await serialService.connect();
    setSerialConnected(connected);
    if (connected) {
      alert('✓ Conectado ao ESP32!\n\nO valor de umidade será atualizado automaticamente.');
    }
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return (
          <KidsDashboard 
            plant={plant} 
            onUpdatePlant={handleUpdatePlant} 
            onAddDiaryEntry={handleAddDiaryEntry}
            serialConnected={serialConnected}
            onSerialConnection={handleSerialConnection}
          />
        );
      case AppView.ENCYCLOPEDIA:
        return <Encyclopedia />;
      case AppView.HEALTH:
        return <ParentsArea moisture={plant.stats.water} />;
      default:
        return <KidsDashboard plant={plant} onUpdatePlant={handleUpdatePlant} serialConnected={serialConnected} onSerialConnection={handleSerialConnection} />;
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