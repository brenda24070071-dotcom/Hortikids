import React from 'react';
import { MOCK_SENSOR_DATA } from '../constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Settings, ShoppingBag, Activity, Droplets, Thermometer, FlaskConical, Zap, Leaf } from 'lucide-react';

export const ParentsArea: React.FC = () => {
  return (
    <div className="min-h-full bg-gray-50 pb-24 px-6 pt-10">
      <header className="mb-8">
        <h2 className="font-display text-2xl font-bold text-gray-800">Saúde da Horta</h2>
        <p className="text-gray-500 text-sm">Monitoramento vital e sinais de bem-estar</p>
      </header>

      {/* Main Status Cards */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2 text-blue-500">
                <Droplets size={18} />
                <span className="font-bold text-sm">Umidade</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">62%</p>
            <span className="text-xs text-green-500 font-semibold">Ideal</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2 text-purple-500">
                <FlaskConical size={18} />
                <span className="font-bold text-sm">pH do Solo</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">6.5</p>
            <span className="text-xs text-green-500 font-semibold">Levemente Ácido</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2 text-orange-500">
                <Zap size={18} />
                <span className="font-bold text-sm">NPK (Nutrientes)</span>
            </div>
            <div className="flex gap-2 items-baseline">
                <p className="text-xl font-bold text-gray-800">10-10-10</p>
            </div>
            <span className="text-xs text-gray-400">Equilibrado</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2 text-green-500">
                <Leaf size={18} />
                <span className="font-bold text-sm">Vigor</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">Forte</p>
            <span className="text-xs text-green-500">Bioestabilidade OK</span>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-3xl shadow-sm mb-6">
        <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wider">Sinais Vitais (Hoje)</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_SENSOR_DATA}>
              <defs>
                <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5BC0EB" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#5BC0EB" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="moisture" stroke="#5BC0EB" fillOpacity={1} fill="url(#colorMoisture)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Settings List */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg text-green-700">
                    <Droplets size={20} />
                </div>
                <span className="font-bold text-gray-700">Ciclo de Hidratação</span>
            </div>
            <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
        </div>
        
        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
                 <div className="bg-orange-100 p-2 rounded-lg text-orange-700">
                    <ShoppingBag size={20} />
                </div>
                <span className="font-bold text-gray-700">Loja de Insumos</span>
            </div>
             <span className="text-gray-400 text-sm">Abrir &rarr;</span>
        </div>

         <div className="p-4 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-3">
                <span className="font-bold text-gray-500 text-sm">Versão do App</span>
            </div>
             <span className="text-gray-400 text-xs">v1.0.0 (MVP)</span>
        </div>
      </div>
    </div>
  );
};