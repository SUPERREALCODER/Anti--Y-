
import React, { useEffect, useRef, useState } from 'react';
import { QuizQuestion, VideoNode } from '../types';
import { generateActiveRecallQuiz } from '../services/gemini';

interface VideoPlayerProps {
  video: VideoNode;
  onComplete: () => void;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, onComplete, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load YouTube API
  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Fix: Declared initPlayer before its usage to avoid TDZ errors
    const initPlayer = () => {
      playerRef.current = new (window as any).YT.Player('player-target', {
        height: '100%',
        width: '100%',
        videoId: video.ytId,
        playerVars: {
          controls: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          disablekb: 1,
          autoplay: 1
        },
        events: {
          onReady: (event: any) => {
            setIsLoading(false);
            event.target.playVideo();
          },
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.ENDED) {
              onComplete();
            }
          }
        }
      });
    };

    (window as any).onYouTubeIframeAPIReady = () => {
      initPlayer();
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [video.ytId, onComplete]);

  // Generate Quizzes via Gemini
  useEffect(() => {
    const fetchQuiz = async () => {
      const questions = await generateActiveRecallQuiz(video.title, video.description, video.duration);
      setQuizQuestions(questions);
    };
    fetchQuiz();
  }, [video]);

  // Monitor for timestamps
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime && !currentQuiz) {
        const currentTime = playerRef.current.getCurrentTime();
        const nextQuiz = quizQuestions.find(q => 
          Math.abs(q.timestamp - currentTime) < 0.5 && 
          !q.id.startsWith('answered_')
        );

        if (nextQuiz) {
          playerRef.current.pauseVideo();
          setCurrentQuiz(nextQuiz);
        }
      }
    }, 500);
    return () => clearInterval(interval);
  }, [quizQuestions, currentQuiz]);

  const handleAnswer = (index: number) => {
    if (!currentQuiz) return;
    
    if (index === currentQuiz.correctIndex) {
      setQuizQuestions(prev => prev.map(q => q.id === currentQuiz.id ? { ...q, id: `answered_${q.id}` } : q));
      setAnsweredCount(prev => prev + 1);
      setCurrentQuiz(null);
      playerRef.current.playVideo();
    } else {
      // Penalty: Rewind 15 seconds
      const current = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(Math.max(0, current - 30));
      setCurrentQuiz(null);
      playerRef.current.playVideo();
      alert("Incorrect. Reviewing context is required. Rewinding 30 seconds.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-40 flex flex-col">
      {/* HUD Header */}
      <div className="p-4 flex justify-between items-center bg-zinc-900/50 backdrop-blur-md border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="text-zinc-500 hover:text-white uppercase text-xs mono">
            [ESC] EXIT
          </button>
          <div className="h-4 w-px bg-zinc-700" />
          <h3 className="font-bold text-sm tracking-tight">{video.title}</h3>
        </div>
        <div className="text-xs mono text-zinc-400">
          MASTERY: {answeredCount} / {quizQuestions.length} MODULES
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
            <div className="text-cyan-500 mono animate-pulse">ESTABLISHING UPLINK...</div>
          </div>
        )}
        
        {/* The Player Wrapper */}
        <div className="w-full h-full max-w-6xl aspect-video bg-zinc-950 shadow-2xl relative">
          <div id="player-target" className="w-full h-full" />
          {/* Overlay to block YT interaction */}
          <div className="absolute inset-0 z-10 cursor-default" />
        </div>

        {/* Quiz Overlay */}
        {currentQuiz && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
            <div className="bg-zinc-900 border border-zinc-700 p-8 rounded-xl max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="mb-2 text-cyan-500 mono text-[10px] tracking-widest uppercase">Active Recall Prompt</div>
              <h2 className="text-2xl font-bold mb-8">{currentQuiz.question}</h2>
              <div className="space-y-3">
                {currentQuiz.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className="w-full text-left p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:bg-zinc-800 hover:border-cyan-500 transition-all text-sm group flex items-center"
                  >
                    <span className="w-6 h-6 rounded-full border border-zinc-600 flex items-center justify-center mr-4 text-zinc-500 group-hover:border-cyan-500 group-hover:text-cyan-500 transition-colors">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar HUD */}
      <div className="bg-zinc-900 p-2 flex gap-1">
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i} className="flex-1 h-1 bg-zinc-800" />
        ))}
      </div>
    </div>
  );
};

export default VideoPlayer;
