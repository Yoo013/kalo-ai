import React, { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import ScenarioPanel from "@/components/roleplay/ScenarioPanel";
import ChatPanel from "@/components/roleplay/ChatPanel";
import CoachingPanel from "@/components/roleplay/CoachingPanel";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const DEFAULT_SCENARIOS = [
  {
    id: "debt_relief",
    name: "Debt Relief Prospect",
    description: "A skeptical homeowner with $45k in credit card debt. They've heard too many scams.",
    difficulty: "medium",
    prompt: "You are a skeptical homeowner named Mike with $45,000 in credit card debt. You're worried about scams and have been burned before. You're hesitant but secretly desperate for a solution. Ask lots of questions. Don't commit easily.",
  },
  {
    id: "mortgage_refi",
    name: "Mortgage Refinance",
    description: "A busy professional interested in refinancing but doesn't have much time.",
    difficulty: "easy",
    prompt: "You are a busy professional named Sarah considering refinancing your mortgage. You don't have much time and get easily distracted. You need to be convinced it's worth your time. You're polite but dismissive.",
  },
  {
    id: "insurance_cold",
    name: "Cold Insurance Lead",
    description: "A cold call prospect who didn't ask to be called. Hard to engage.",
    difficulty: "hard",
    prompt: "You are a grumpy person named Dave who did NOT ask to be called. You're annoyed from the start. You think insurance is a waste of money. You will hang up if the agent doesn't quickly say something interesting. Be very resistant.",
  },
];

const DEFAULT_COMPANY_PROMPT =
  "You are roleplaying as a realistic customer for a sales training simulation. Stay in character at all times. Be human — show emotion, doubt, and occasional interest. Never admit you are an AI.";

async function callOpenAI(messages, jsonMode = false) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages,
      max_tokens: jsonMode ? 600 : 200,
      temperature: jsonMode ? 0.3 : 0.8,
      ...(jsonMode && { response_format: { type: "json_object" } }),
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export default function Roleplay() {
  const { user } = useOutletContext() || {};

  const [scenarios] = useState(DEFAULT_SCENARIOS);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [difficulty, setDifficulty] = useState("medium");

  const [sessionActive, setSessionActive] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [sessionDuration, setSessionDuration] = useState(0);

  const timerRef = useRef(null);
  const conversationHistory = useRef([]);
  const systemMessages = useRef([]);

  const handleStart = async () => {
    if (!selectedScenario) return;

    conversationHistory.current = [];
    systemMessages.current = [
      { role: "system", content: DEFAULT_COMPANY_PROMPT },
      { role: "system", content: selectedScenario.prompt },
      { role: "system", content: `Difficulty level: ${difficulty}. ${difficulty === "hard" ? "Be very resistant and difficult." : difficulty === "easy" ? "Be somewhat open and receptive." : "Be moderately skeptical."}` },
      { role: "system", content: "You are the CUSTOMER. Never break character. Never say you are an AI." },
    ];

    setMessages([]);
    setEvaluation(null);
    setSessionEnded(false);
    setSessionDuration(0);
    setSessionActive(true);

    timerRef.current = setInterval(() => setSessionDuration((d) => d + 1), 1000);

    setIsLoading(true);
    try {
      const openingPrompt = [
        ...systemMessages.current,
        { role: "user", content: "[Session started. Begin the scene — you just answered the phone.]" },
      ];
      const aiReply = await callOpenAI(openingPrompt);
      const aiMsg = { role: "assistant", content: aiReply, timestamp: new Date().toISOString() };
      conversationHistory.current.push(aiMsg);
      setMessages([aiMsg]);
    } catch {}
    setIsLoading(false);
  };

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isLoading || !sessionActive) return;
    setInputValue("");

    const userMsg = { role: "user", content: text, timestamp: new Date().toISOString() };
    conversationHistory.current.push(userMsg);
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const aiReply = await callOpenAI([
        ...systemMessages.current,
        ...conversationHistory.current,
      ]);
      const aiMsg = { role: "assistant", content: aiReply, timestamp: new Date().toISOString() };
      conversationHistory.current.push(aiMsg);
      setMessages((prev) => [...prev, aiMsg]);
    } catch {}
    setIsLoading(false);
  };

  const handleEnd = async () => {
    clearInterval(timerRef.current);
    setSessionActive(false);
    setSessionEnded(true);
    setIsEvaluating(true);

    try {
      const transcriptText = conversationHistory.current
        .map((m) => `${m.role === "user" ? "Agent" : "Customer"}: ${m.content}`)
        .join("\n");

      const content = await callOpenAI([
        {
          role: "user",
          content: `You are a sales coach. Evaluate this roleplay transcript and return JSON only:

${transcriptText}

Return this exact JSON:
{
  "score": 0-100,
  "rapport": 0-10,
  "objectionHandling": 0-10,
  "scriptAdherence": 0-10,
  "closeAttempt": true or false,
  "feedback": {
    "whatWentWell": ["..."],
    "whatWentWrong": ["..."],
    "betterResponses": ["..."]
  }
}`,
        },
      ], true);

      const eval_ = JSON.parse(content);
      setEvaluation(eval_);
    } catch {}
    setIsEvaluating(false);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  return (
    <div className="fixed inset-0 lg:left-64 bg-slate-900 flex flex-col">
      <div className="shrink-0 px-6 py-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-900/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
            <span className="text-sm">🎭</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-none">AI Roleplay Trainer</h1>
            <p className="text-xs text-slate-400 mt-0.5">Practice with a realistic AI customer</p>
          </div>
        </div>
        {sessionActive && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-red-400 font-semibold uppercase tracking-wider">Live Session</span>
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="w-64 shrink-0 border-r border-slate-700/50 bg-slate-900 p-5 flex flex-col">
          <ScenarioPanel
            scenarios={scenarios}
            selectedScenario={selectedScenario}
            setSelectedScenario={setSelectedScenario}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            sessionActive={sessionActive}
            onStart={handleStart}
            onEnd={handleEnd}
            sessionDuration={sessionDuration}
          />
        </div>

        <div className="flex-1 flex flex-col min-w-0 bg-slate-950 px-6 py-4">
          <ChatPanel
            messages={messages}
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSend={handleSend}
            isLoading={isLoading}
            sessionActive={sessionActive}
            sessionEnded={sessionEnded}
          />
        </div>

        <div className="w-72 shrink-0 border-l border-slate-700/50 bg-slate-900 p-5 flex flex-col">
          <CoachingPanel
            sessionActive={sessionActive}
            sessionEnded={sessionEnded}
            evaluation={evaluation}
            isEvaluating={isEvaluating}
          />
        </div>
      </div>
    </div>
  );
}
