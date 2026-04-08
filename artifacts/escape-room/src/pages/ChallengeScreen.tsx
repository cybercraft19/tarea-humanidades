import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { ROOMS } from "@/data/gameData";

type FeedbackState = "idle" | "correct" | "wrong";
const HINT_PENALTY_SECONDS = 30;

export default function ChallengeScreen() {
  const { state, goToRoom, goToText, completeRoom, setEssayAnswer, goToVictory, useHint } = useGame();
  const room = ROOMS[state.currentRoom - 1];
  const challenge = room?.challenge;
  const isSoftTheme = state.visualTheme !== "dark-lux";

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [essayText, setEssayText] = useState(state.essayAnswers[state.currentRoom] || "");
  const [feedback, setFeedback] = useState<FeedbackState>("idle");
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);

  if (!room || !challenge) return null;

  const wordCount = essayText.trim().split(/\s+/).filter(Boolean).length;
  const alreadyCompleted = state.roomStatuses[state.currentRoom - 1] === "completed";
  const hintUsed = Boolean(state.hintsUsedByRoom[room.id]);

  const checkMultipleChoice = () => {
    if (selectedOption === null) return;
    setAttempts((a) => a + 1);
    if (selectedOption === challenge.correctIndex) {
      setFeedback("correct");
      completeRoom(room.id, challenge.keyUnlocked);
    } else {
      setFeedback("wrong");
    }
  };

  const checkEssay = () => {
    if (challenge.type !== "essay") return;
    setAttempts((a) => a + 1);
    setEssayAnswer(room.id, essayText);

    const lowerText = essayText.toLowerCase();
    const minMet = wordCount >= (challenge.minWords || 30);
    const keywordsFound = (challenge.correctKeywords || []).filter((kw) =>
      lowerText.includes(kw.toLowerCase())
    );
    const keywordMet = keywordsFound.length >= 2;

    if (minMet && keywordMet) {
      setFeedback("correct");
      completeRoom(room.id, challenge.keyUnlocked);
    } else {
      setFeedback("wrong");
    }
  };

  const handleUseHint = () => {
    setShowHint(true);
    if (!hintUsed) {
      useHint(room.id, HINT_PENALTY_SECONDS);
    }
  };

  const handleContinue = () => {
    if (state.keysCollected.length === 4 || state.roomStatuses.every((s) => s === "completed")) {
      goToVictory();
    } else {
      goToText();
    }
  };

  return (
    <div className={`min-h-screen ${
      isSoftTheme ? "bg-white text-slate-900" : "bg-gray-950 text-white"
    }`}>
      {/* Header */}
      <div className={`border-b ${
        isSoftTheme ? "border-slate-300/30" : "border-white/10"
      } px-4 py-3 flex items-center justify-between`}>
        <button
          onClick={() => goToRoom(room.id)}
          className={`${
            isSoftTheme ? "text-slate-600 hover:text-slate-900" : "text-gray-600 hover:text-white"
          } text-sm flex items-center gap-2 transition-colors`}
        >
          ← Volver a la sala
        </button>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${room.borderColor} ${room.accentColor} bg-white/5`}>
          {challenge.level}
        </span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Challenge Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${room.color} mb-4 shadow-xl`}>
            <span className="text-3xl">{room.icon}</span>
          </div>
          <h1 className="text-2xl font-black text-white">{challenge.name}</h1>
          <p className={`text-sm ${room.accentColor} font-medium mt-1`}>{challenge.level}</p>
        </motion.div>

        {/* Objective */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`${
            isSoftTheme ? "bg-slate-100 border-slate-300/40" : "bg-white/5 border-white/10"
          } border rounded-xl p-4 mb-6`}
        >
          <p className={`text-xs ${
            isSoftTheme ? "text-slate-500" : "text-gray-600"
          } uppercase tracking-widest mb-1`}>Objetivo</p>
          <p className={`text-sm ${
            isSoftTheme ? "text-slate-700" : "text-gray-300"
          }`}>{challenge.objective}</p>
        </motion.div>

        {/* Instruction */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className={`${room.bgCard} border ${room.borderColor} rounded-xl p-5 mb-6`}
        >
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-2">Instrucción</p>
          <p className="text-gray-200 text-sm leading-relaxed">{challenge.instruction}</p>
        </motion.div>

        {/* Question */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-white font-semibold text-base mb-5 leading-relaxed">{challenge.question}</p>

          {challenge.type === "multiple" && (
            <div className="space-y-3">
              {challenge.options?.map((opt, i) => (
                <button
                  key={i}
                  disabled={feedback === "correct" || alreadyCompleted}
                  onClick={() => { setSelectedOption(i); setFeedback("idle"); }}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 text-sm ${
                    feedback === "correct" && i === challenge.correctIndex
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-700"
                      : feedback === "wrong" && i === selectedOption
                      ? "bg-rose-500/20 border-rose-500/50 text-rose-600"
                      : selectedOption === i
                      ? `${room.bgCard} ${room.borderColor} text-white`
                      : "bg-white/5 border-white/15 text-gray-300 hover:bg-white/10 hover:border-white/25"
                  }`}
                >
                  <span className="font-bold mr-2 opacity-50">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {challenge.type === "essay" && (
            <div>
              <textarea
                value={essayText}
                onChange={(e) => { setEssayText(e.target.value); setFeedback("idle"); }}
                disabled={feedback === "correct" || alreadyCompleted}
                placeholder="Escribe tu respuesta aquí..."
                rows={6}
                className="w-full bg-white/5 border border-white/20 rounded-xl p-4 text-white placeholder-gray-600 text-sm leading-relaxed focus:outline-none focus:border-white/40 transition-colors resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs ${wordCount >= (challenge.minWords || 30) ? "amber-400" : "text-gray-500"}`}>
                  {wordCount} palabras {wordCount < (challenge.minWords || 30) ? `(mínimo ${challenge.minWords})` : "✓"}
                </span>
                {challenge.correctKeywords && (
                  <span className="text-xs text-gray-600">
                    Incluye evidencias del texto
                  </span>
                )}
              </div>
            </div>
          )}
        </motion.div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500">Pistas</p>
            <p className="text-xs text-gray-300">
              {hintUsed
                ? `Pista usada en esta sala (-${HINT_PENALTY_SECONDS}s)`
                : `Puedes usar 1 pista en esta sala (-${HINT_PENALTY_SECONDS}s)`}
            </p>
          </div>
          <button
            onClick={handleUseHint}
            disabled={showHint}
            className="rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-400 px-3 py-2 text-xs font-bold disabled:opacity-50"
          >
            {showHint ? "Pista mostrada" : "Usar pista"}
          </button>
        </div>

        {/* Hint */}
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-4 mb-4"
          >
            <p className="text-amber-400 text-xs font-semibold mb-1">💡 Pista</p>
            <p className="text-amber-700 text-xs">
              {challenge.type === "multiple"
                ? "Regresa al texto y busca la información específica. La respuesta correcta está escrita textualmente."
                : "Asegúrate de: 1) Responder con suficientes palabras, y 2) Mencionar elementos concretos del texto como el río, la aldea, los personajes o las acciones que tomaron."}
            </p>
          </motion.div>
        )}

        <p className="text-[11px] text-gray-500 mb-4">
          Penalización acumulada: {state.totalPenaltySeconds}s
        </p>

        {/* Feedback */}
        <AnimatePresence mode="wait">
          {feedback !== "idle" && (
            <motion.div
              key={feedback}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`rounded-xl p-5 mb-6 border ${
                feedback === "correct"
                  ? "bg-amber-400/15 border border-amber-400/30"
                  : "bg-rose-500/10 border-rose-500/25"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">
                  {feedback === "correct" ? "🎉" : "❌"}
                </span>
                <div>
                  <p className={`font-bold text-sm mb-2 ${feedback === "correct" ? "amber-400" : "text-rose-300"}`}>
                    {feedback === "correct" ? "¡Correcto!" : "No es correcto. Intenta de nuevo."}
                  </p>
                  <p className={`text-xs leading-relaxed ${feedback === "correct" ? "text-emerald-700" : "text-rose-600"}`}>
                    {feedback === "correct" ? challenge.feedbackCorrect : challenge.feedbackWrong}
                  </p>
                  {feedback === "correct" && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-gray-600">Clave obtenida:</span>
                      <span className="font-mono text-amber-400 bg-amber-400/20 px-3 py-1 rounded-full text-sm font-bold">
                        🔑 {challenge.keyUnlocked}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Button */}
        {alreadyCompleted ? (
          <button
            onClick={handleContinue}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all text-sm"
          >
            {state.keysCollected.length === 4 ? "Ver el final del juego ✨" : "Ir a la siguiente sala →"}
          </button>
        ) : feedback === "correct" ? (
          <button
            onClick={handleContinue}
            className="w-full bg-gradient-to-r from-amber-500 to-emerald-500 text-black font-bold py-4 rounded-xl transition-all shadow-lg text-sm hover:brightness-110"
          >
            {state.keysCollected.length >= 4 ? "¡Ver el final! ✨" : "Ir a la siguiente sala →"}
          </button>
        ) : (
          <button
            onClick={challenge.type === "multiple" ? checkMultipleChoice : checkEssay}
            disabled={
              (challenge.type === "multiple" && selectedOption === null) ||
              (challenge.type === "essay" && wordCount < (challenge.minWords || 30))
            }
            className={`w-full font-bold py-4 rounded-xl transition-all text-sm shadow-lg ${
              (challenge.type === "multiple" && selectedOption !== null) ||
              (challenge.type === "essay" && wordCount >= (challenge.minWords || 30))
                ? `bg-gradient-to-r ${room.color} text-white hover:brightness-110`
                : "bg-white/5 text-gray-600 cursor-not-allowed border border-white/10"
            }`}
          >
            Verificar respuesta
          </button>
        )}

        {/* Pedagogical note (footer) */}
        <div className="mt-8 bg-white/3 border border-white/8 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Fundamento pedagógico</p>
          <p className="text-gray-600 text-xs leading-relaxed">{challenge.pedagogicalNote}</p>
        </div>
      </div>
    </div>
  );
}
