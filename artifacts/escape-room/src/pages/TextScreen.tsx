import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { BASE_TEXT, ROOMS } from "@/data/gameData";
import { formatDuration } from "@/lib/liveRoom";
import { subscribeLivePlayers } from "@/lib/liveRoomSocket";

function VictoryButton() {
  const { goToVictory } = useGame();
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={goToVictory}
      className="w-full mt-6 bg-gradient-to-r from-amber-500 to-emerald-500 text-black font-black py-5 rounded-xl text-lg shadow-xl hover:brightness-110 transition-all"
    >
      ¡Ver el Final del Juego! ✨
    </motion.button>
  );
}

export default function TextScreen() {
  const { state, goToRoom } = useGame();
  const [now, setNow] = useState(Date.now());
  const [liveCount, setLiveCount] = useState(0);
  const isSoftTheme = state.visualTheme !== "dark-lux";

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!state.roomCode) {
      setLiveCount(0);
      return;
    }

    return subscribeLivePlayers((players) => {
      setLiveCount(players.length);
    });
  }, [state.roomCode]);

  const nextRoom = state.roomStatuses.findIndex((s) => s === "active") + 1 || 1;
  const baseSeconds = state.startTime ? Math.max(0, Math.floor((now - state.startTime) / 1000)) : 0;
  const totalSeconds = baseSeconds + state.totalPenaltySeconds;

  const paragraphs = BASE_TEXT.trim().split("\n\n").filter(Boolean);

  return (
    <div className={`min-h-screen ${
      isSoftTheme ? "bg-white text-slate-900" : "bg-gray-950 text-white"
    }`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 backdrop-blur-sm border-b px-4 py-3 ${
        isSoftTheme ? "bg-white/90 border-slate-300/30" : "bg-gray-950/90 border-white/10"
      }`}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-amber-400 text-xl">📖</span>
            <div>
              <p className={`text-xs uppercase tracking-widest ${isSoftTheme ? "text-slate-500" : "text-gray-400"}`}>Texto Base</p>
              <p className={`font-semibold text-sm ${isSoftTheme ? "text-slate-900" : "text-white"}`}>El Guardián del Río</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-[11px] uppercase tracking-widest ${isSoftTheme ? "text-slate-500" : "text-gray-500"}`}>Cronómetro</p>
            <p className="text-sm font-bold text-amber-400">{formatDuration(totalSeconds)}</p>
            <p className="text-[11px] text-amber-400">Conectados: {liveCount}</p>
          </div>
          {/* Keys collected */}
          {state.keysCollected.length > 0 && (
            <div className="flex gap-2 flex-wrap justify-end">
              {state.keysCollected.map((key, i) => (
                <span key={i} className="bg-amber-400/20 border border-amber-400/40 text-amber-400 text-xs px-2 py-1 rounded-full font-mono">
                  🔑 {key}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs ${isSoftTheme ? "text-slate-500" : "text-gray-400"}`}>Progreso del juego</span>
            <span className={`text-xs ${isSoftTheme ? "text-slate-500" : "text-gray-400"}`}>{state.keysCollected.length}/4 claves · Penalización: {state.totalPenaltySeconds}s</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(state.keysCollected.length / 4) * 100}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>

        {/* Rooms status */}
        <div className="grid grid-cols-4 gap-2 mb-8">
          {ROOMS.map((room) => {
            const status = state.roomStatuses[room.id - 1];
            return (
              <div
                key={room.id}
                className={`rounded-xl p-2 text-center text-xs transition-all ${
                  status === "completed"
                    ? "bg-amber-400/20 border border-amber-400/40 text-amber-400"
                    : status === "active"
                    ? "bg-amber-400/20 border border-amber-400/40 text-amber-400"
                    : isSoftTheme
                    ? "bg-slate-200/50 border border-slate-300/40 text-slate-500"
                    : "bg-white/5 border border-white/10 text-gray-500"
                }`}
              >
                <div className="text-base mb-0.5">
                  {status === "completed" ? "✅" : status === "active" ? room.icon : "🔒"}
                </div>
                <div className="font-medium leading-tight">{room.subtitle}</div>
              </div>
            );
          })}
        </div>

        {/* Instructions box */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-4 mb-8"
        >
          <p className="text-amber-400 text-sm leading-relaxed">
            <span className="font-semibold">Instrucción:</span> Lee el texto completo con atención antes de intentar responder los retos.
            No podrás avanzar sin comprender lo que dice. Puedes regresar a releerlo cuantas veces necesites.
          </p>
        </motion.div>

        {/* Text Content */}
        <motion.article
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-10 mb-8"
        >
          {paragraphs.map((para, i) => (
            i === 0 ? (
              <h2 key={i} className="text-2xl font-black text-center text-amber-400 mb-8 tracking-wide">
                {para}
              </h2>
            ) : (
              <p key={i} className={`leading-8 text-base mb-6 last:mb-0 ${isSoftTheme ? "text-slate-700" : "text-slate-200"}`}>
                {para}
              </p>
            )
          ))}
        </motion.article>

        {/* Action buttons */}
        <div className="space-y-4">
          {state.roomStatuses.map((status, i) => {
            const room = ROOMS[i];
            return (
              <motion.button
                key={room.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                disabled={status === "locked"}
                onClick={() => goToRoom(room.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
                  status === "completed"
                  ? "bg-amber-400/15 border border-amber-400/30 text-amber-400 hover:bg-amber-400/25"
                  : status === "active"
                  ? "bg-amber-400/15 border border-amber-400/40 text-slate-900 hover:bg-amber-400/25 cursor-pointer"
                  : isSoftTheme
                  ? "bg-slate-200/50 border-slate-300/40 text-slate-500 cursor-not-allowed opacity-60"
                  : "bg-white/5 border-white/10 text-gray-500 cursor-not-allowed opacity-60"
                }`}
              >
                <span className="text-2xl">{status === "completed" ? "✅" : status === "active" ? room.icon : "🔒"}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{room.name}</p>
                  <p className="text-xs opacity-70">{room.subtitle}</p>
                </div>
                {status === "completed" && (
                  <span className="text-xs font-mono bg-amber-400/20 px-2 py-1 rounded-full text-amber-400">
                    ✓ Completada
                  </span>
                )}
                {status === "active" && (
                  <span className="text-xs font-semibold text-amber-400">Entrar →</span>
                )}
                {status === "locked" && (
                  <span className={`text-xs ${isSoftTheme ? "text-slate-500" : "text-gray-500"}`}>Bloqueada</span>
                )}
              </motion.button>
            );
          })}
        </div>

        {state.keysCollected.length === 4 && (
          <VictoryButton />
        )}
      </div>
    </div>
  );
}
