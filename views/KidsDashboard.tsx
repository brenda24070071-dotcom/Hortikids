import React, { useState, useEffect } from 'react';
import { PlantCharacter } from '../components/PlantCharacter';
import { GardenDiary } from '../components/GardenDiary';
import { Plant, DiaryEntry } from '../types';
import { serialService } from '../services/serialService';
import { 
  Droplets, 
  Sun, 
  Heart, 
  BookOpen, 
  CloudSun, 
  CloudRain, 
  Cloud, 
  CloudLightning, 
  Snowflake, 
  MapPin, 
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';

interface KidsDashboardProps {
  plant: Plant;
  onUpdatePlant: (updatedStats: Partial<Plant['stats']>) => void;
  onAddDiaryEntry: (entry: Omit<DiaryEntry, 'id'>) => void;
}

export const KidsDashboard: React.FC<KidsDashboardProps> = ({ 
  plant, 
  onUpdatePlant,
  onAddDiaryEntry,
  serialConnected,
  onSerialConnection
}) => {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [isDiaryOpen, setIsDiaryOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);
  const [isIrrigationBlocked, setIsIrrigationBlocked] = useState(false);
  const [showBlockedMessage, setShowBlockedMessage] = useState(false);


  // Trigger satisfaction celebration when both Water and Love are 100%
  useEffect(() => {
    if (plant.stats.water === 100 && plant.stats.love === 100) {
      if (!hasCelebrated) {
        setShowCelebration(true);
        setHasCelebrated(true);
        
        const timer = setTimeout(() => {
          setShowCelebration(false);
        }, 5000);
        return () => clearTimeout(timer);
      }
    } else {
      // If either drops below 100%, reset celebration trigger so they can trigger again next time
      setHasCelebrated(false);
    }
  }, [plant.stats.water, plant.stats.love, hasCelebrated]);

  // Real-time clock and weather state
  const [time, setTime] = useState<string>('');
  const [weather, setWeather] = useState<{
    temp: number;
    description: string;
    icon: 'sun' | 'cloud-sun' | 'cloud' | 'cloud-rain' | 'cloud-lightning' | 'snowflake';
    city: string;
    loading: boolean;
  }>({
    temp: 24,
    description: 'Carregando...',
    icon: 'cloud-sun',
    city: 'Belém-PA',
    loading: true
  });

  // Ticking physical clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('pt-BR', { hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real-time weather using Open-Meteo
  useEffect(() => {
    let active = true;

    const fetchWeather = async (lat: number, lon: number, cityName: string) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        );
        const data = await response.json();
        
        if (!active) return;

        if (data && data.current_weather) {
          const temp = Math.round(data.current_weather.temperature);
          const weathercode = data.current_weather.weathercode;
          
          let description = 'Ensolarado';
          let icon: 'sun' | 'cloud-sun' | 'cloud' | 'cloud-rain' | 'cloud-lightning' | 'snowflake' = 'sun';

          if (weathercode === 0) {
            description = 'Céu Limpo';
            icon = 'sun';
          } else if ([1, 2, 3].includes(weathercode)) {
            description = 'Parcialmente Nublado';
            icon = 'cloud-sun';
          } else if ([45, 48].includes(weathercode)) {
            description = 'Nevoeiro';
            icon = 'cloud';
          } else if ([51, 53, 55, 56, 57, 80, 81, 82].includes(weathercode)) {
            description = 'Chuva Leve';
            icon = 'cloud-rain';
          } else if ([61, 63, 65, 66, 67].includes(weathercode)) {
            description = 'Chuvoso';
            icon = 'cloud-rain';
          } else if ([71, 73, 75, 77, 85, 86].includes(weathercode)) {
            description = 'Neve';
            icon = 'snowflake';
          } else if ([95, 96, 99].includes(weathercode)) {
            description = 'Tempestade';
            icon = 'cloud-lightning';
          }

          setWeather({
            temp,
            description,
            icon,
            city: cityName,
            loading: false
          });
        }
      } catch (err) {
        console.error('Error fetching weather code:', err);
        if (active) {
          setWeather(prev => ({ ...prev, loading: false, description: 'Estável' }));
        }
      }
    };

    const getPositionAndFetch = async () => {
      // Direct coordinates for Belém, Pará
      const belemLat = -1.455756;
      const belemLon = -48.490180;
      const belemCity = 'Belém-PA';

      fetchWeather(belemLat, belemLon, belemCity);
    };

    getPositionAndFetch();

    return () => {
      active = false;
    };
  }, []);

  const renderWeatherIcon = (iconName: string) => {
    switch (iconName) {
      case 'sun':
        return <Sun className="text-yellow-500 w-4 h-4 animate-spin-slow" />;
      case 'cloud-sun':
        return <CloudSun className="text-yellow-600 w-4 h-4" />;
      case 'cloud':
        return <Cloud className="text-gray-500 w-4 h-4" />;
      case 'cloud-rain':
        return <CloudRain className="text-blue-500 w-4 h-4" />;
      case 'cloud-lightning':
        return <CloudLightning className="text-purple-500 w-4 h-4" />;
      case 'snowflake':
        return <Snowflake className="text-blue-300 w-4 h-4" />;
      default:
        return <Sun className="text-yellow-500 w-4 h-4" />;
    }
  };

  const handleCare = async (type: 'water' | 'sun' | 'love') => {
    // Bloqueia rega se água está em 100% e não desceu para 40%
    if (type === 'water' && plant.stats.water >= 100) {
      setShowBlockedMessage(true);
      setTimeout(() => setShowBlockedMessage(false), 3000);
      return;
    }
    
    // Desbloqueia rega quando água desce para 40%
    if (type === 'water' && isIrrigationBlocked && plant.stats.water < 40) {
      setIsIrrigationBlocked(false);
    }
    
    setActiveAction(type);

    if (type === 'water') {
      try {
        // Se não está conectado, tenta conectar via handler pai
        if (!serialService.getIsConnected()) {
          await onSerialConnection();
        }

        if (serialService.getIsConnected()) {
          await serialService.sendCommand(JSON.stringify({ command: 'irrigate' }));
        } else {
          console.warn('Comando de irrigação não enviado: serial não conectado');
        }
      } catch (err) {
        console.error('Erro ao enviar comando de irrigação:', err);
      }
    }
    
    // Simulate action - 3 segundos para rega
    const actionDuration = type === 'water' ? 3000 : 1000;
    setTimeout(() => {
      let newStats = { ...plant.stats };
      if (type === 'water') {
        newStats.water = Math.min(100, newStats.water + 20);
        // Se atingiu 100%, marca como bloqueado
        if (newStats.water >= 100) {
          setIsIrrigationBlocked(true);
        }
      }
      if (type === 'sun') newStats.sun = Math.min(100, newStats.sun + 15);
      if (type === 'love') newStats.love = Math.min(100, newStats.love + 25);
      
      onUpdatePlant(newStats);
      setActiveAction(null);
    }, actionDuration);
  };

  // Conecta ou desconecta da porta serial
  const handleSerialConnection = async () => {
    await onSerialConnection();
  };

  const isThirsty = plant.stats.water < 30;
  const overallHappiness = (plant.stats.water + plant.stats.sun + plant.stats.love) / 3;

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-blue-200 via-blue-100 to-green-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute bottom-0 w-full h-32 bg-horta-main rounded-t-[50px] z-0"></div>

      {/* Header Stats */}
      <div className="pt-8 px-6 flex justify-between items-start z-20">
        <div className="flex flex-col gap-3">
            <button
                onClick={() => setIsDiaryOpen(true)}
                className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border-2 border-white flex items-center gap-2 text-horta-dark hover:bg-white transition-all hover:scale-105 active:scale-95 group"
            >
                <BookOpen className="text-horta-main w-5 h-5" />
                <span className="text-xs font-bold uppercase">Diário</span>
                {plant.diary.length > 0 && (
                  <span className="bg-horta-main text-white text-[10px] min-w-[20px] h-5 flex items-center justify-center rounded-full px-1 font-bold group-hover:scale-110 transition-transform">
                    {plant.diary.length}
                  </span>
                )}
            </button>
            
            {serialService.isSupported() && (
              <button
                onClick={handleSerialConnection}
                className={`px-4 py-2 rounded-2xl shadow-sm border-2 flex items-center gap-2 text-xs font-bold uppercase transition-all hover:scale-105 active:scale-95 ${
                  serialConnected 
                    ? 'bg-green-100 border-green-400 text-green-700 hover:bg-green-200' 
                    : 'bg-white/90 border-white text-horta-dark hover:bg-white'
                }`}
                title={serialConnected ? 'Desconectar ESP32' : 'Conectar ESP32'}
              >
                {serialConnected ? (
                  <Wifi className="w-4 h-4" />
                ) : (
                  <WifiOff className="w-4 h-4" />
                )}
                <span>{serialConnected ? 'ESP32' : 'Sensor'}</span>
              </button>
            )}
        </div>

        <div className="text-right flex flex-col items-end">
            <h1 className="font-display text-3xl font-black text-horta-dark tracking-tight leading-none drop-shadow-sm">
            {plant.name}
            </h1>
            <p className="text-[10px] font-bold text-horta-main uppercase tracking-widest mt-1">Estou feliz com você</p>
            
            {/* Weather & Clock Forecast Area */}
            <div className="flex flex-col items-end gap-1.5 mt-2">
              {/* Real-time Ticking Clock */}
              <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-md py-1 px-2.5 rounded-full border border-white shadow-sm">
                <Clock className="text-horta-main w-3.5 h-3.5 animate-pulse" />
                <span className="text-[10px] font-black text-gray-700 font-mono tracking-wider">
                  {time || '--:--:--'}
                </span>
              </div>
              
              {/* Dynamic Real-time Weather info */}
              <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-md py-1 px-2.5 rounded-full border border-white shadow-sm">
                <MapPin className="text-red-500 w-3 h-3" />
                <span className="text-[9px] font-black text-gray-600 truncate max-w-[90px]">
                  {weather.city}
                </span>
                <span className="text-gray-300">|</span>
                {renderWeatherIcon(weather.icon)}
                <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider">
                  {weather.loading ? 'Carregando...' : `${weather.description} • ${weather.temp}°C`}
                </span>
              </div>
            </div>
        </div>
      </div>

      {/* Main Character Area */}
      <div className="flex-1 flex flex-col justify-center items-center z-10 -mt-10">
        <PlantCharacter 
          stage={1} 
          stats={plant.stats} 
        />
      </div>

      {/* Controls & Progress Indicators */}
      <div className="absolute bottom-16 left-0 right-0 px-6 flex justify-center items-end gap-12 z-30 pb-4">
        {/* Water Control */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-3 bg-white/40 backdrop-blur-sm rounded-full overflow-hidden border-2 border-white shadow-sm p-0.5">
            <div 
              className="h-full bg-blue-400 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(96,165,250,0.5)]" 
              style={{ width: `${plant.stats.water}%` }} 
            />
          </div>
          <button
            onClick={() => handleCare('water')}
            disabled={!!activeAction || (plant.stats.water >= 100)}
            className={`
              w-18 h-18 rounded-[24px] flex flex-col items-center justify-center gap-0.5 shadow-xl border-b-6 transition-all active:border-b-0 active:translate-y-1.5 hover:scale-105
              ${plant.stats.water >= 100 ? 'bg-gray-400 border-gray-600 opacity-60 cursor-not-allowed' : activeAction === 'water' ? 'bg-blue-600 border-blue-800' : 'bg-horta-water border-blue-400'}
            `}
            title={plant.stats.water >= 100 ? 'Rega bloqueada - Umidade em 100%. Aguarde até 40%' : ''}
          >
            <Droplets className="text-white w-7 h-7" strokeWidth={3} />
            <span className="text-white font-black text-[9px] tracking-wider">REGAR</span>
          </button>
        </div>
        
        {/* Love Control */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-3 bg-white/40 backdrop-blur-sm rounded-full overflow-hidden border-2 border-white shadow-sm p-0.5">
            <div 
              className="h-full bg-pink-400 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(244,114,182,0.5)]" 
              style={{ width: `${plant.stats.love}%` }} 
            />
          </div>
          <button
            onClick={() => handleCare('love')}
            disabled={!!activeAction}
            className={`
              w-18 h-18 rounded-[24px] flex flex-col items-center justify-center gap-0.5 shadow-xl border-b-6 transition-all active:border-b-0 active:translate-y-1.5 hover:scale-105
              ${activeAction === 'love' ? 'bg-pink-600 border-pink-800' : 'bg-pink-400 border-pink-600'}
            `}
          >
            <Heart className="text-white w-7 h-7" strokeWidth={3} />
            <span className="text-white font-black text-[9px] tracking-wider uppercase">Amor</span>
          </button>
        </div>
      </div>

      {/* Interaction feedback handled silently (no emoji overlay) */}

      {/* Blocked Irrigation Message */}
      {showBlockedMessage && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-red-100 border-4 border-red-400 rounded-2xl px-6 py-4 shadow-2xl animate-bounce">
          <p className="text-sm font-bold text-red-700 text-center">⚠️ Rega Bloqueada!</p>
          <p className="text-xs text-red-600 text-center mt-1">Umidade em 100%</p>
          <p className="text-xs text-red-600 text-center">Aguarde até 40%</p>
        </div>
      )}

      {/* Garden Diary Component */}
      <GardenDiary
        isOpen={isDiaryOpen}
        onClose={() => setIsDiaryOpen(false)}
        entries={plant.diary}
        onAddEntry={onAddDiaryEntry}
      />

      {/* Satiety Celebration Overlay with Confetti */}
      {showCelebration && (
        <div 
          onClick={() => setShowCelebration(false)}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xs cursor-pointer transition-all duration-300 animate-fade-in"
          id="satiety-celebration-overlay"
        >
          {/* Confetti Spawner */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 45 }).map((_, i) => {
              const left = Math.random() * 100;
              const size = Math.random() * 12 + 6; // random size: 6px to 18px
              const delay = Math.random() * 2; // delay up to 2s
              const duration = Math.random() * 2 + 2.5; // fall duration: 2.5s to 4.5s
              const colors = [
                'bg-red-500', 'bg-yellow-400', 'bg-blue-400', 
                'bg-pink-400', 'bg-green-400', 'bg-orange-400', 
                'bg-purple-400', 'bg-teal-400'
              ];
              const color = colors[Math.floor(Math.random() * colors.length)];
              const shapeClass = Math.random() > 0.5 ? 'rounded-full' : 'rounded-sm';

              return (
                <div
                  key={i}
                  className={`absolute ${color} ${shapeClass} animate-confetti shadow-sm`}
                  style={{
                    left: `${left}%`,
                    top: `-20px`,
                    width: `${size}px`,
                    height: `${size}px`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`,
                    transform: `rotate(${Math.random() * 360}deg)`
                  }}
                />
              );
            })}
          </div>

          {/* Satiated Message Card */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="bg-white border-4 border-horta-main rounded-[32px] p-6 mx-6 shadow-2xl text-center max-w-[85%] transform scale-100 animate-bounce-slow flex flex-col items-center gap-4 z-50 relative"
          >
            {/* Cute bouncing tomato emoji icon */}
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-4xl shadow-inner border border-red-200">
              🍅
            </div>
            
            <div className="flex flex-col gap-1">
              <h3 className="font-display text-2xl font-black text-horta-dark leading-tight">
                Sr. Tomatinho tá Saciado!
              </h3>
              <p className="text-xs font-bold text-horta-main uppercase tracking-widest">
                Estou super feliz! 🎉
              </p>
            </div>

            <p className="text-xs font-semibold text-gray-700 leading-relaxed px-1">
              Incrível! Você cuidou de mim com muito amor e água fresquinha. Agora estou 100% satisfeito e me sentindo ótimo! 🌱💖
            </p>

            <div className="flex items-center gap-2 bg-horta-light/60 px-4 py-1.5 rounded-full border border-horta-main/20">
              <div className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase">
                💧 100% Rega
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1 text-[10px] font-black text-pink-600 uppercase">
                ❤️ 100% Amor
              </div>
            </div>

            <button 
              onClick={() => setShowCelebration(false)}
              className="mt-1 w-full bg-horta-main hover:bg-horta-main/90 text-white font-black text-xs py-2.5 px-6 rounded-2xl border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all"
            >
              Uau! Que legal!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};