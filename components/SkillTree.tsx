
import React from 'react';
import { VideoNode, UserProgress } from '../types';

interface SkillTreeProps {
  nodes: VideoNode[];
  progress: UserProgress;
  onSelectNode: (node: VideoNode) => void;
}

const SkillTree: React.FC<SkillTreeProps> = ({ nodes, progress, onSelectNode }) => {
  const subjects = Array.from(new Set(nodes.map(n => n.subject)));

  const isUnlocked = (node: VideoNode) => {
    return node.prerequisites.every(preId => progress.completedIds.includes(preId));
  };

  const isCompleted = (node: VideoNode) => {
    return progress.completedIds.includes(node.id);
  };

  return (
    <div className="relative py-12 px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
        {subjects.map((subject) => {
          const subjectNodes = nodes.filter(n => n.subject === subject).sort((a, b) => a.level - b.level);
          
          return (
            <div key={subject} className="space-y-12 relative">
              <div className="sticky top-24 z-20 bg-black/90 py-4 border-b border-zinc-800 mb-8 backdrop-blur-md">
                <h3 className="text-xs mono tracking-[0.4em] uppercase text-zinc-500 mb-1">Subject Branch</h3>
                <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">{subject}</h2>
              </div>

              <div className="space-y-16 pl-4 border-l border-zinc-900">
                {subjectNodes.map((node, idx) => {
                  const unlocked = isUnlocked(node);
                  const completed = isCompleted(node);

                  return (
                    <div key={node.id} className="relative">
                      {/* Connection line to next node */}
                      {idx < subjectNodes.length - 1 && (
                        <div className="absolute top-full left-[-17px] w-[1px] h-16 bg-zinc-800" />
                      )}
                      
                      <button
                        disabled={!unlocked}
                        onClick={() => onSelectNode(node)}
                        className={`
                          relative w-full p-6 text-left transition-all duration-500 group
                          ${completed 
                            ? 'bg-emerald-500/5 border-l-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.05)]' 
                            : unlocked 
                              ? 'bg-zinc-900/50 border-l-2 border-cyan-500 hover:bg-zinc-800 hover:translate-x-2' 
                              : 'opacity-30 border-l-2 border-zinc-800 grayscale cursor-not-allowed'}
                        `}
                      >
                        <div className="absolute left-[-21px] top-6 w-2 h-2 rounded-full border border-zinc-800 bg-black z-10 
                          group-hover:scale-150 transition-transform 
                          ${unlocked ? 'border-cyan-500' : ''}
                          ${completed ? 'border-emerald-500 bg-emerald-500' : ''}
                        " />
                        
                        <div className="flex justify-between items-center mb-3">
                          <span className={`text-[9px] mono tracking-widest uppercase ${completed ? 'text-emerald-500' : 'text-zinc-500'}`}>
                            LVL 0{node.level} • {completed ? 'MASTERED' : unlocked ? 'READY' : 'ENCRYPTED'}
                          </span>
                        </div>
                        
                        <h4 className={`text-md font-bold mb-1 ${unlocked ? 'text-zinc-100' : 'text-zinc-600'}`}>
                          {node.title}
                        </h4>
                        <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2">
                          {node.description}
                        </p>

                        {!unlocked && (
                          <div className="mt-4 text-[9px] mono text-zinc-700">
                            REQUIRED: {node.prerequisites.map(p => nodes.find(n => n.id === p)?.title).join(', ')}
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed inset-0 pointer-events-none opacity-[0.03] select-none text-[300px] font-black text-white leading-none whitespace-nowrap overflow-hidden z-[-1]">
        DEEPFOCUS DEEPFOCUS DEEPFOCUS
      </div>
    </div>
  );
};

export default SkillTree;
