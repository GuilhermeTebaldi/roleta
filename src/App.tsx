import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Settings, 
  RotateCw, 
  Trophy, 
  Palette, 
  Users,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import confetti from 'canvas-confetti';

import Background from './components/Background';
import RouletteCanvas from './components/RouletteCanvas';
import { THEMES } from './constants';
import { RouletteStyle, Participant, ThemeConfig } from './types';

const STYLE_OPTIONS: { id: RouletteStyle; name: string }[] = [
  { id: 'classic', name: 'Clássico' },
  { id: 'neon', name: 'Neon Glow' },
  { id: 'minimalist', name: 'Minimalista' },
  { id: 'crystal', name: 'Cristal' },
  { id: '3d', name: '3D Premium' },
  { id: 'solid', name: 'Sólido' },
  { id: 'gradient', name: 'Gradiente' },
];

type NavigatorWithMemory = Navigator & {
  deviceMemory?: number;
};

export default function App() {
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
    { id: '3', name: 'Charlie' },
    { id: '4', name: 'Diana' },
    { id: '5', name: 'Edward' },
    { id: '6', name: 'Fabiana' },
    { id: '7', name: 'Gabriel' },
    { id: '8', name: 'Helena' },
    { id: '9', name: 'Igor' },
    { id: '10', name: 'Julia' },
    { id: '11', name: 'Kevin' },
    { id: '12', name: 'Larissa' },
    { id: '13', name: 'Mateus' },
    { id: '14', name: 'Natália' },
    { id: '15', name: 'Otávio' },
    { id: '16', name: 'Patrícia' },
    { id: '17', name: 'Quirino' },
    { id: '18', name: 'Raquel' },
    { id: '19', name: 'Samuel' },
    { id: '20', name: 'Tatiane' },
    { id: '21', name: 'Uriel' },
    { id: '22', name: 'Vanessa' },
    { id: '23', name: 'Wagner' },
    { id: '24', name: 'Xavier' },
    { id: '25', name: 'Yara' },
    { id: '26', name: 'Zeca' },
    { id: '27', name: 'Adriano' },
    { id: '28', name: 'Beatriz' },
    { id: '29', name: 'Caio' },
    { id: '30', name: 'Daniela' },
    { id: '31', name: 'Emanuel' },
    { id: '32', name: 'Fernanda' },
    { id: '33', name: 'Guilherme' },
    { id: '34', name: 'Humberto' },
    { id: '35', name: 'Isabela' },
    { id: '36', name: 'João' },
    { id: '37', name: 'Kátia' },
    { id: '38', name: 'Leonardo' },
    { id: '39', name: 'Márcia' },
    { id: '40', name: 'Nuno' },
  ]);
  const [newName, setNewName] = useState('');
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(THEMES.pink);
  const [currentStyle, setCurrentStyle] = useState<RouletteStyle>('classic');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [targetWinnerId, setTargetWinnerId] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isWinnerReleased, setIsWinnerReleased] = useState(false);
  const lastConfettiAtRef = useRef(0);
  const rouletteSizeClass = showSettings
    ? 'relative w-full max-w-[min(92vw,450px)] lg:max-w-[450px]'
    : 'relative w-full max-w-[min(92vw,820px)] lg:max-w-[820px]';
  const activeForcedWinnerId = isWinnerReleased ? targetWinnerId : null;
  const activeBlockedWinnerId = !isWinnerReleased ? targetWinnerId : null;

  const addParticipant = useCallback(() => {
    if (newName.trim()) {
      const nextParticipant = { id: Date.now().toString(), name: newName.trim() };
      setParticipants((prevParticipants) => [...prevParticipants, nextParticipant]);
      setNewName('');
    }
  }, [newName]);

  const removeParticipant = useCallback((id: string) => {
    setParticipants((prevParticipants) => prevParticipants.filter((participant) => participant.id !== id));
    setTargetWinnerId((prevTarget) => (prevTarget === id ? null : prevTarget));
  }, []);

  const handleSpin = useCallback(() => {
    if (participants.length < 2 || isSpinning) return;
    setWinner(null);
    setIsSpinning(true);
  }, [isSpinning, participants.length]);

  const onSpinEnd = useCallback((winningParticipant: Participant) => {
    setIsSpinning(false);
    setWinner(winningParticipant);
    setIsWinnerReleased(false);

    if (typeof window === 'undefined') return;

    const now = Date.now();
    if (now - lastConfettiAtRef.current < 400) return;
    lastConfettiAtRef.current = now;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const memory = (navigator as NavigatorWithMemory).deviceMemory ?? 4;
    const cpu = navigator.hardwareConcurrency ?? 4;
    const lowEndDevice = memory <= 4 || cpu <= 4;

    confetti({
      particleCount: lowEndDevice ? 24 : 70,
      spread: lowEndDevice ? 45 : 60,
      startVelocity: lowEndDevice ? 18 : 28,
      ticks: lowEndDevice ? 80 : 130,
      scalar: lowEndDevice ? 0.7 : 0.9,
      origin: { y: 0.62 },
      colors: currentTheme.wheelColors,
      disableForReducedMotion: true
    });
  }, [currentTheme.wheelColors]);

  const releaseProgrammedWinner = useCallback(() => {
    if (!targetWinnerId || isSpinning || isWinnerReleased) return;
    setIsWinnerReleased(true);
  }, [isSpinning, isWinnerReleased, targetWinnerId]);

  const handleOrbTap = useCallback(() => {
    releaseProgrammedWinner();
  }, [releaseProgrammedWinner]);

  useEffect(() => {
    setIsWinnerReleased(false);
  }, [targetWinnerId]);

  useEffect(() => {
    const handleSpaceToReleaseWinner = (event: KeyboardEvent) => {
      const isReleaseKey =
        event.code === 'Space' ||
        event.key === ' ' ||
        event.code === 'ArrowRight' ||
        event.key === 'ArrowRight';
      if (!isReleaseKey || event.repeat) return;

      const activeElement = document.activeElement as HTMLElement | null;
      if (activeElement) {
        const tagName = activeElement.tagName;
        const isTypingElement =
          tagName === 'INPUT' ||
          tagName === 'TEXTAREA' ||
          tagName === 'SELECT' ||
          activeElement.isContentEditable;

        if (isTypingElement) return;
      }

      if (!targetWinnerId || isSpinning || isWinnerReleased) return;
      event.preventDefault();
      releaseProgrammedWinner();
    };

    window.addEventListener('keydown', handleSpaceToReleaseWinner);
    return () => window.removeEventListener('keydown', handleSpaceToReleaseWinner);
  }, [isSpinning, isWinnerReleased, releaseProgrammedWinner, targetWinnerId]);

  return (
    <div className="min-h-screen text-white font-sans selection:bg-white/30">
      <Background theme={currentTheme} />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 items-stretch lg:items-start justify-center min-h-[100dvh]">
        
        {/* Left Panel: Management */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="order-2 lg:order-1 w-full lg:w-1/3 bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 border border-white/20 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6" />
              Participantes
              <span className="text-xs sm:text-sm font-normal opacity-60 ml-2">({participants.length})</span>
            </h2>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <Palette className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2 mb-4 sm:mb-6">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addParticipant()}
              placeholder="Adicionar nome..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
            />
            <button 
              onClick={addParticipant}
              className="bg-white text-black p-2.5 sm:p-3 rounded-xl hover:bg-opacity-90 transition-all active:scale-95"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-2 max-h-[42vh] lg:max-h-[400px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {participants.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  layout
                  className="flex items-center justify-between gap-2 min-w-0 bg-white/5 p-2.5 sm:p-3 rounded-xl border border-white/5 hover:border-white/20 transition-all group"
                >
                  <span className="font-medium truncate pr-2">{p.name}</span>
                  <button 
                    onClick={() => removeParticipant(p.id)}
                    className="text-white/40 hover:text-red-400 p-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {participants.length === 0 && (
              <p className="text-center text-white/40 py-8 italic">Nenhum participante adicionado</p>
            )}
          </div>
        </motion.div>

        {/* Center Panel: Roulette */}
        <div className="order-1 lg:order-2 flex-1 w-full flex flex-col items-center justify-center gap-6 sm:gap-8 lg:gap-12 py-2 sm:py-4 lg:py-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 20 }}
            className={`${rouletteSizeClass} transition-all duration-500`}
          >
            <RouletteCanvas
              participants={participants}
              theme={currentTheme}
              style={currentStyle}
              isSpinning={isSpinning}
              onSpinEnd={onSpinEnd}
              forcedWinnerId={activeForcedWinnerId}
              blockedWinnerId={activeBlockedWinnerId}
            />
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSpin}
            disabled={participants.length < 2 || isSpinning}
            className={`
              px-8 sm:px-12 lg:px-16 py-4 sm:py-5 lg:py-6 rounded-2xl text-lg sm:text-xl lg:text-2xl font-black uppercase tracking-[0.16em] sm:tracking-[0.2em] lg:tracking-widest shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all
              ${isSpinning ? 'bg-white/10 cursor-not-allowed text-white/50' : 'bg-white text-black hover:shadow-white/10'}
            `}
          >
            {isSpinning ? (
              <div className="flex items-center gap-3 sm:gap-4">
                <RotateCw className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 animate-spin" />
                Girando...
              </div>
            ) : 'Sortear Agora'}
          </motion.button>
        </div>

        {/* Right Panel: Admin/Settings (Conditional) */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="order-3 w-full lg:w-1/3 bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 border border-white/20 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  Configurações
                </h2>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="text-xs sm:text-sm font-bold uppercase tracking-wider opacity-60 mb-3 block">Temas</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.values(THEMES).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setCurrentTheme(t)}
                        className={`
                          p-2 rounded-xl text-xs font-medium transition-all border
                          ${currentTheme.id === t.id ? 'border-white bg-white/20' : 'border-white/10 hover:bg-white/5'}
                        `}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-bold uppercase tracking-wider opacity-60 mb-3 block">Estilos da Roleta</label>
                  <div className="grid grid-cols-2 gap-2">
                    {STYLE_OPTIONS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setCurrentStyle(s.id)}
                        className={`
                          p-2 rounded-xl text-xs font-medium transition-all border
                          ${currentStyle === s.id ? 'border-white bg-white/20' : 'border-white/10 hover:bg-white/5'}
                        `}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <button 
                    onClick={() => setShowAdmin(!showAdmin)}
                    className="w-full flex items-center justify-between p-3 bg-black/20 rounded-xl hover:bg-black/40 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      Sorteio Programado
                    </span>
                    {showAdmin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>

                  <AnimatePresence>
                    {showAdmin && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-3 space-y-2"
                      >
                        <p className="text-xs opacity-60 mb-2">Selecione secretamente o próximo vencedor:</p>
                        <select
                          value={targetWinnerId || ''}
                          onChange={(e) => setTargetWinnerId(e.target.value || null)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm focus:outline-none"
                        >
                          <option value="">Aleatório</option>
                          {participants.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {targetWinnerId && (
          <motion.button
            type="button"
            onClick={handleOrbTap}
            initial={{ opacity: 0, scale: 0.6, y: -10 }}
            animate={
              isWinnerReleased
                ? {
                    opacity: 1,
                    scale: [1, 1.12, 1],
                    x: [0, -6, 8, 0],
                    y: [0, 6, -4, 0]
                  }
                : { opacity: 1, scale: 1, x: 0, y: 0 }
            }
            exit={{ opacity: 0, scale: 0.6, y: -10 }}
            transition={
              isWinnerReleased
                ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.35, ease: 'easeOut' }
            }
            className={`
              fixed top-4 right-4 sm:top-6 sm:right-6 z-40 h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-full
              ${isSpinning ? 'opacity-60' : 'opacity-100'}
              cursor-default
            `}
            aria-label="Orbi de liberação do vencedor"
          >
            <span className="sr-only">Orbi de liberação do vencedor</span>
            <span
              className="h-[12px] w-[12px] rounded-full"
              style={{
                backgroundColor: currentTheme.particles[0],
                opacity: 0.4
              }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Victory Modal */}
      <AnimatePresence>
        {winner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 100 }}
              className="bg-white text-black rounded-[28px] sm:rounded-[40px] p-6 sm:p-10 max-w-md w-full text-center shadow-[0_0_50px_rgba(255,255,255,0.3)]"
            >
              <motion.div
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 sm:w-24 sm:h-24 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg"
              >
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </motion.div>
              
              <h3 className="text-sm sm:text-xl font-bold opacity-60 uppercase tracking-widest mb-2">Temos um vencedor!</h3>
              <h2 className="text-3xl sm:text-5xl font-black mb-6 sm:mb-8 break-words">{winner.name}</h2>
              
              <button
                onClick={() => setWinner(null)}
                className="w-full py-3 sm:py-4 bg-black text-white rounded-2xl font-bold hover:scale-105 transition-transform active:scale-95"
              >
                Fechar e Continuar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
