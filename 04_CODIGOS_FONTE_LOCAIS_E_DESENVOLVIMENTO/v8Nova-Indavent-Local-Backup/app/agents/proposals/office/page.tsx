'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { 
  ChevronLeft, 
  Maximize2, 
  Minimize2, 
  Settings, 
  Info, 
  MessageSquare,
  Activity,
  Zap,
  MousePointer2,
  Sparkles,
  X as CloseIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const squadAgents = [
  { id: 1, name: 'Ricardo Mendes', role: 'Mapeamento de Requisitos', task: 'Mapeando Tabela TAB20 (Ex: TAB20G70) para orçamento Drywall', char: '/assets/office/characters/char_0.png', x: 25, y: 35 },
  { id: 2, name: 'Camila Souza', role: 'Especialista em Soluções', task: 'Processando valores unitários e provisionando frete padrão de R$ 490,00', char: '/assets/office/characters/char_1.png', x: 45, y: 45 },
  { id: 3, name: 'Fernando Lima', role: 'Gerador de Propostas', task: 'Compilando PDF Final com regra 30/60/90 e validade de 10 dias', char: '/assets/office/characters/char_4.png', x: 70, y: 35 },
];

export default function DigitalOfficePage() {
  const [mounted, setMounted] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={cn("flex min-h-screen bg-slate-950", isFullScreen ? "p-0" : "")}>
      {!isFullScreen && <Sidebar />}
      <main className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-500",
        !isFullScreen ? "sidebar-offset" : "pl-0"
      )}>
        {!isFullScreen && <TopBar title="Escritório Digital (Squad Propostas)" />}
        
        <div className={cn(
          "flex-1 relative overflow-hidden flex flex-col",
          isFullScreen ? "h-screen w-screen" : "p-4 sm:p-8"
        )}>
          {/* Header Controls */}
          {!isFullScreen && (
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={() => window.location.href = '/agents/proposals'}
                className="flex items-center gap-2 text-slate-500 hover:text-blue-400 transition-all font-black uppercase text-[10px] tracking-widest"
              >
                <ChevronLeft size={16} /> Detalhes do Squad
              </button>
              <div className="flex items-center gap-3">
                 <button onClick={() => setIsFullScreen(true)} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white">
                    <Maximize2 size={18} />
                 </button>
              </div>
            </div>
          )}

          {/* Office Container */}
          <div className={cn(
             "flex-1 relative bg-[#1a1c2c] rounded-[40px] border-4 border-slate-900 shadow-2xl overflow-hidden group",
             isFullScreen ? "rounded-none border-0" : ""
          )}>
            {/* Floor Tiles (Pattern) */}
            <div 
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{ 
                backgroundImage: 'url("/assets/office/floors/floor_1.png")',
                backgroundSize: '32px',
                imageRendering: 'pixelated'
              }}
            />

            {/* Grid Helper (Optional) */}
            <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

            {/* Office Assets & Agents */}
            <div className="absolute inset-0 z-10 p-10">
               {/* Decorative Furniture (Simplified) */}
               <FurnitureItem icon="DESK" x={20} y={30} label="Workstation 01" />
               <FurnitureItem icon="DESK" x={45} y={40} label="Workstation 02" />
               <FurnitureItem icon="DESK" x={70} y={30} label="Workstation 03" />
               <FurnitureItem icon="PLANT" x={10} y={10} />
               <FurnitureItem icon="PLANT" x={85} y={15} />
               <FurnitureItem icon="COFFEE" x={48} y={10} />
               <FurnitureItem icon="WHITEBOARD" x={2} y={50} direction="side" />

               {/* Agents */}
               {squadAgents.map((agent) => (
                 <AgentSprite 
                    key={agent.id} 
                    agent={agent} 
                    isSelected={selectedAgent?.id === agent.id}
                    onClick={() => setSelectedAgent(agent)}
                 />
               ))}
            </div>

            {/* Overlay UI - HUD */}
            <div className="absolute top-6 left-6 z-20 space-y-2 pointer-events-none">
                <div className="bg-slate-950/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3 shadow-2xl">
                    <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-white tracking-widest leading-none">Indavent Digital Office - Live</span>
                </div>
            </div>

            {/* Agent Detail HUD */}
            <AnimatePresence>
               {selectedAgent && (
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-full max-w-lg"
                 >
                    <div className="bg-slate-950/90 backdrop-blur-xl border-2 border-blue-500/30 p-6 rounded-[32px] shadow-2xl flex items-center gap-6">
                        <div className="size-24 relative bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-inner overflow-hidden">
                             <SpriteCharacter char={selectedAgent.char} scale={3} />
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-start">
                              <div>
                                 <h4 className="text-xl font-black italic uppercase text-white tracking-tighter">{selectedAgent.name}</h4>
                                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">{selectedAgent.role}</p>
                              </div>
                              <button onClick={() => setSelectedAgent(null)} className="text-slate-500 hover:text-white transition-colors">
                                 <CloseIcon size={16} />
                              </button>
                           </div>
                           <div className="mt-4 flex items-center gap-3 bg-white/5 border border-white/5 p-3 rounded-xl">
                               <Activity className="text-blue-500 shrink-0" size={14} />
                               <p className="text-xs font-bold text-slate-300 italic truncate">
                                  "{selectedAgent.task}"
                               </p>
                           </div>
                        </div>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>

            {/* Floating Exit Fullscreen */}
            {isFullScreen && (
               <button 
                  onClick={() => setIsFullScreen(false)}
                  className="absolute top-6 right-6 z-50 p-3 bg-slate-950/80 border border-white/10 rounded-2xl text-white hover:bg-blue-600 transition-all shadow-2xl"
               >
                  <Minimize2 size={24} />
               </button>
            )}
          </div>

          {/* Instructions Modal (Small) */}
          {!isFullScreen && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: MousePointer2, label: 'Interativo', text: 'Clique nos agentes para ver detalhes da tarefa em execução.' },
                  { icon: Zap, label: 'Tempo Real', text: 'Visualização sincronizada com o backend da IA Indavent.' },
                  { icon: Sparkles, label: 'Pixel Art', text: 'Escritório digital estilizado para facilitar o monitoramento visual.' }
                ].map((item) => (
                  <div key={item.label} className="flex gap-4 p-4 bg-slate-100 rounded-2xl border border-slate-200">
                      <item.icon className="text-blue-600" size={24} />
                      <div>
                         <p className="text-[10px] font-black uppercase text-slate-900 tracking-widest mb-1">{item.label}</p>
                         <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{item.text}</p>
                      </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function FurnitureItem({ icon, x, y, label, direction = 'front' }: { icon: string, x: number, y: number, label?: string, direction?: string }) {
  const getAssetPath = () => {
     if (icon === 'DESK') return '/assets/office/furniture/DESK/DESK_FRONT.png';
     if (icon === 'PC') return '/assets/office/furniture/PC/PC_FRONT_ON_1.png';
     if (icon === 'PLANT') return '/assets/office/furniture/PLANT/PLANT.png';
     if (icon === 'COFFEE') return '/assets/office/furniture/COFFEE/COFFEE.png';
     if (icon === 'WHITEBOARD') return '/assets/office/furniture/WHITEBOARD/WHITEBOARD.png';
     return '/assets/office/furniture/DESK/DESK_FRONT.png';
  };

  return (
    <div 
       className="absolute select-none pointer-events-none group"
       style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
    >
       <div className="relative">
          <Image 
             src={getAssetPath()} 
             alt={icon} 
             width={80} 
             height={80} 
             className="object-contain" 
             style={{ imageRendering: 'pixelated', transform: 'scale(1.5)' }} 
          />
          {label && (
             <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-widest text-slate-600/50 whitespace-nowrap">
                {label}
             </span>
          )}
       </div>
    </div>
  );
}

function SpriteCharacter({ char, scale = 2 }: { char: string, scale?: number }) {
  // Real dimensions recorded: Width 112, Height 96
  // Verified Grid: 7 columns x 4 rows
  // Per frame base: 16px width, 24px height
  const frameWidth = 16;
  const frameHeight = 24;
  const sheetWidth = 112;
  const sheetHeight = 96;

  return (
    <div 
      className="relative overflow-hidden shrink-0"
      style={{ 
         width: `${frameWidth * scale}px`, 
         height: `${frameHeight * scale}px`,
         imageRendering: 'pixelated'
      }}
    >
      <div 
        className="absolute inset-0"
        style={{ 
           backgroundImage: `url(${char})`,
           backgroundSize: `${sheetWidth * scale}px ${sheetHeight * scale}px`,
           backgroundPosition: '0px 0px', // First character (Front Idle)
           backgroundRepeat: 'no-repeat',
           width: `${sheetWidth * scale}px`,
           height: `${sheetHeight * scale}px`
        }}
      />
    </div>
  );
}

function AgentSprite({ agent, isSelected, onClick }: { agent: any, isSelected: boolean, onClick: () => void }) {
  return (
    <motion.div 
       initial={{ scale: 0 }}
       animate={{ scale: 1 }}
       className="absolute z-20 cursor-pointer group"
       style={{ left: `${agent.x}%`, top: `${agent.y}%`, transform: 'translate(-50%, -100%)' }}
       onClick={onClick}
    >
       <div className="relative">
          {/* Label Above Agent */}
          <div className={cn(
             "absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-950/90 border border-white/10 rounded-lg shadow-2xl transition-all whitespace-nowrap z-50",
             isSelected ? "scale-100 opacity-100" : "scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100"
          )}>
             <p className="text-[10px] font-black text-white italic uppercase tracking-tight leading-none">{agent.name}</p>
             <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mt-1 leading-none">{agent.role}</p>
          </div>

          {/* Sprite shadow */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/30 blur-[2px] rounded-full" />

          {/* Animated Sprite */}
          <motion.div 
             animate={{ 
                y: [0, -2, 0],
             }}
             transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
             }}
          >
             <SpriteCharacter char={agent.char} scale={2} />
          </motion.div>
       </div>
    </motion.div>
  );
}
