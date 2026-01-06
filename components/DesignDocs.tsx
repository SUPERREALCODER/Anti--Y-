
import React from 'react';

const DesignDocs: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="border-b border-zinc-800 pb-8">
        <h1 className="text-5xl font-extrabold tracking-tight mb-2">DeepFocus Architecture</h1>
        <p className="text-zinc-400 text-lg italic">Lead Architect's Blueprint v1.0</p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-cyan-400 flex items-center">
          <span className="mr-2">01.</span> The Game Loop Design
        </h2>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg space-y-4">
          <p className="text-zinc-300">The core loop follows a <strong>Friction-Mastery</strong> cycle designed to break the "Doomscrolling" circuit:</p>
          <ol className="list-decimal list-inside space-y-3 text-zinc-400">
            <li><span className="text-white">Intentionality:</span> User selects a node in the Skill Tree. Progress is blocked by prerequisites.</li>
            <li><span className="text-white">The Gate:</span> 60-second "Focus Calibrator" (n-back or sequence memory). This transitions the brain from a passive "scrolling" state to an active "working" state.</li>
            <li><span className="text-white">Active Consumption:</span> Video playback begins. All UI elements (related videos, comments) are hidden.</li>
            <li><span className="text-white">Active Recall:</span> Gemini-powered quizes pause the video at key intervals. Failure to answer correctly requires a 30-second "rewind and re-watch" penalty.</li>
            <li><span className="text-white">Validation:</span> Upon completion, the node is unlocked, and EXP is awarded.</li>
          </ol>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-amber-400 flex items-center">
          <span className="mr-2">02.</span> System Architecture
        </h2>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg space-y-6">
          <div className="space-y-2">
            <h3 className="font-bold text-white">The Wrapper Layer (YouTube Abstraction)</h3>
            <p className="text-zinc-400">We utilize the <strong>YouTube IFrame Player API</strong>. To ensure zero-distraction:</p>
            <ul className="list-disc list-inside text-zinc-400 ml-4 space-y-1">
              <li>Set <code>controls: 0</code>, <code>modestbranding: 1</code>, <code>rel: 0</code>, and <code>iv_load_policy: 3</code>.</li>
              <li>Inject an absolute-positioned <strong>Overlay Div</strong> that catches all click events, preventing interaction with the player's internal UI.</li>
              <li>Build a custom playback controller in React that talks to the IFrame via postMessage.</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-white">Frontend Engine</h3>
            <p className="text-zinc-400">Next.js + Tailwind. Persistence handled via localState (for this demo) or Supabase (for production).</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-purple-400 flex items-center">
          <span className="mr-2">03.</span> Data Schema (JSON)
        </h2>
        <div className="bg-black border border-zinc-800 p-6 rounded-lg overflow-x-auto">
          <pre className="text-sm text-zinc-400 mono">
{`{
  "skillTree": {
    "id": "phys-101",
    "nodes": [
      {
        "id": "v1",
        "ytId": "dQw4w9WgXcQ",
        "prerequisites": [],
        "unlockCost": 0
      }
    ],
    "edges": [
      { "from": "v1", "to": "v2", "type": "STRICT_PREREQ" }
    ]
  },
  "userProgress": {
    "uid": "user_001",
    "completedNodes": ["v1"],
    "focusLevel": 4,
    "currentSessionId": "sess_882"
  }
}`}
          </pre>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-emerald-400 flex items-center">
          <span className="mr-2">04.</span> AI Workflow
        </h2>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
          <p className="text-zinc-400 mb-4 font-mono text-sm">// Pseudo-code for Active Recall Pipeline</p>
          <pre className="text-xs text-zinc-500 mono leading-relaxed">
{`async function generateQuiz(videoId) {
  // 1. Fetch transcript from internal API or Scraping Proxy
  const transcript = await fetchYTTranscript(videoId); 

  // 2. Feed to Gemini with high reasoning (thinkingBudget: 1000)
  const prompt = \`Context: \${transcript}. 
    Task: Create 3 deep-learning questions. 
    Format: JSON Schema { timestamp, q, options, correctIndex }\`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });

  // 3. Cache results to prevent re-generation costs
  await db.quizzes.upsert(videoId, response.text);
  
  return JSON.parse(response.text);
}`}
          </pre>
        </div>
      </section>
    </div>
  );
};

export default DesignDocs;
