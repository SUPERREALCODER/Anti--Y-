
import React, { useState, useEffect } from 'react';
import { AppState, UserProgress, VideoNode } from './types';
import { INITIAL_SKILL_TREE } from './constants';
import SkillTree from './components/SkillTree';
import Gatekeeper from './components/Gatekeeper';
import VideoPlayer from './components/VideoPlayer';
import DesignDocs from './components/DesignDocs';

const App: React.FC = () => {
  const [view, setView] = useState<AppState>('DASHBOARD');
  const [selectedNode, setSelectedNode] = useState<VideoNode | null>(null);
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('deepfocus_progress');
    return saved ? JSON.parse(saved) : { completedIds: [], currentExp: 0, focusScore: 100 };
  });

  useEffect(() => {
    localStorage.setItem('deepfocus_progress', JSON.stringify(progress));
  }, [progress]);

  const handleNodeSelect = (node: VideoNode) => {
    setSelectedNode(node);
    setView('PRIMING');
  };

  const handlePrimingSuccess = () => {
    setView('WATCHING');
  };

  const handleVideoComplete = () => {
    if (selectedNode) {
      setProgress(prev => ({
        ...prev,
        completedIds: Array.from(new Set([...prev.completedIds, selectedNode.id])),
        currentExp: prev.currentExp + 100
      }));
    }
    setView('DASHBOARD');
    setSelectedNode(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black selection:bg-cyan-500/30">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-30 flex justify-between items-center px-8 py-4 bg-black/80 backdrop-blur-md border-b border-zinc-900">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => setView('DASHBOARD')}
        >
          <div className="w-8 h-8 bg-white flex items-center justify-center font-black text-black">DF</div>
          <span className="text-xl font-extrabold tracking-tighter uppercase">DeepFocus</span>
        </div>

        <div className="flex gap-8 items-center text-[10px] mono tracking-[0.2em] uppercase text-zinc-500">
          <button 
            onClick={() => setView('DASHBOARD')}
            className={`hover:text-white transition-colors ${view === 'DASHBOARD' ? 'text-cyan-400' : ''}`}
          >
            Library
          </button>
          <button 
            onClick={() => setView('DESIGN_DOCS')}
            className={`hover:text-white transition-colors ${view === 'DESIGN_DOCS' ? 'text-amber-400' : ''}`}
          >
            Blueprints
          </button>
          <div className="flex items-center gap-3 border-l border-zinc-800 pl-8 ml-4">
            <span>EXP: {progress.currentExp}</span>
            <span className="text-emerald-500">FOCUS: {progress.focusScore}%</span>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {view === 'DASHBOARD' && (
          <div className="animate-in fade-in duration-500">
            <header className="py-20 text-center max-w-2xl mx-auto px-6">
              <h1 className="text-4xl font-bold mb-4 tracking-tight">The Anti-Distraction Engine</h1>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Build high-density mental models through focus-gated learning. 
                Complete prerequisites to unlock advanced theories.
              </p>
            </header>
            <SkillTree 
              nodes={INITIAL_SKILL_TREE.nodes} 
              progress={progress} 
              onSelectNode={handleNodeSelect} 
            />
          </div>
        )}

        {view === 'DESIGN_DOCS' && <DesignDocs />}

        {view === 'PRIMING' && (
          <Gatekeeper 
            onSuccess={handlePrimingSuccess} 
            onCancel={() => setView('DASHBOARD')} 
          />
        )}

        {view === 'WATCHING' && selectedNode && (
          <VideoPlayer 
            video={selectedNode} 
            onComplete={handleVideoComplete} 
            onClose={() => setView('DASHBOARD')}
          />
        )}
      </main>

      {/* Footer Info */}
      <footer className="py-12 px-8 border-t border-zinc-900 text-center text-[10px] mono text-zinc-700 uppercase tracking-widest">
        &copy; 2024 DEEPFOCUS SYSTEM | OPTIMIZED FOR COGNITIVE DENSITY
      </footer>
    </div>
  );
};

export default App;
