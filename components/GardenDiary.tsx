import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Plus, BookOpen, Trash2 } from 'lucide-react';
import { DiaryEntry } from '../types';

interface GardenDiaryProps {
  isOpen: boolean;
  onClose: () => void;
  entries: DiaryEntry[];
  onAddEntry: (entry: Omit<DiaryEntry, 'id'>) => void;
  onDeleteEntry?: (id: string) => void;
}

export const GardenDiary: React.FC<GardenDiaryProps> = ({ 
  isOpen, 
  onClose, 
  entries, 
  onAddEntry,
  onDeleteEntry
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [note, setNote] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    onAddEntry({
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }),
      note,
      photoUrl: photoUrl || undefined
    });

    setNote('');
    setPhotoUrl('');
    setIsAdding(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 z-[60]"
          />

          {/* Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 h-[85%] bg-horta-light rounded-t-[32px] shadow-2xl z-[70] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-horta-main/20">
              <div className="flex items-center gap-3 text-horta-dark font-display font-bold text-xl">
                <BookOpen className="w-6 h-6 text-horta-main" />
                Diário da Horta
              </div>
              <button 
                onClick={onClose}
                className="p-2 bg-white rounded-full text-gray-400 hover:text-horta-accent transition-colors shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isAdding ? (
                <motion.form 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onSubmit={handleSubmit}
                  className="bg-white p-6 rounded-2xl shadow-md space-y-4"
                >
                  <h3 className="font-display font-bold text-horta-dark">Momento de Cultivo</h3>
                  
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Como estou me sentindo hoje? Registre meu crescimento, uma folhinha nova ou apenas como foi nosso momento de cuidado..."
                    className="w-full h-32 p-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-horta-main resize-none text-horta-dark placeholder:text-gray-400"
                    autoFocus
                  />

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Foto (Opcional)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        placeholder="Link da imagem..."
                        className="flex-1 p-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-horta-main text-sm"
                      />
                      <button 
                        type="button"
                        className="p-3 bg-horta-water/10 text-horta-water rounded-xl transition-colors"
                        title="Simular tirar foto"
                      >
                        <Camera className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="flex-1 p-4 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!note.trim()}
                      className="flex-1 p-4 rounded-xl font-bold text-white bg-horta-main hover:bg-horta-main/90 disabled:opacity-50 transition-all shadow-lg shadow-horta-main/20"
                    >
                      Salvar
                    </button>
                  </div>
                </motion.form>
              ) : (
                <>
                  <button
                    onClick={() => setIsAdding(true)}
                    className="w-full p-4 rounded-2xl border-2 border-dashed border-horta-main/40 text-horta-main font-bold flex items-center justify-center gap-2 hover:bg-horta-main/5 transition-colors group"
                  >
                    <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    Adicionar nova entrada
                  </button>

                  <div className="space-y-4 pb-10">
                    {entries.length === 0 ? (
                      <div className="text-center py-10">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                          <BookOpen className="w-10 h-10 text-gray-300" />
                        </div>
                        <p className="text-gray-500 text-sm">Seu diário de cultivo está começando agora.<br/>Registre as memórias e evoluções da sua horta aqui.</p>
                      </div>
                    ) : (
                      entries.map((entry) => (
                        <motion.div
                          key={entry.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-2xl overflow-hidden shadow-sm group"
                        >
                          {entry.photoUrl && (
                            <img 
                              src={entry.photoUrl} 
                              alt="Observation" 
                              className="w-full h-40 object-cover"
                              onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                          )}
                          <div className="p-4 relative">
                            <span className="text-[10px] font-bold text-horta-main uppercase tracking-widest">{entry.date}</span>
                            <p className="text-horta-dark mt-1 leading-relaxed">{entry.note}</p>
                            
                            {onDeleteEntry && (
                              <button
                                onClick={() => onDeleteEntry(entry.id)}
                                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-horta-accent opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )).reverse() // Most recent first
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
