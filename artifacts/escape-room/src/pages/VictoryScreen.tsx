import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { ROOMS } from "@/data/gameData";
import { formatDuration, type RankingEntry } from "@/lib/liveRoom";
import { publishRanking, subscribeRoomRanking } from "@/lib/liveRoomSocket";

export default function VictoryScreen() {
  const { state, resetGame } = useGame();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const isSoftTheme = state.visualTheme !== "dark-lux";

  useEffect(() => {
    // Play victory sound
    const audio = new Audio('/fondo.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  }, []);

  const elapsed = state.endTime && state.startTime
    ? Math.floor((state.endTime - state.startTime) / 1000)
    : 0;
  const totalSeconds = elapsed + state.totalPenaltySeconds;

  const myEntry = useMemo<RankingEntry | null>(() => {
    if (!state.roomCode || !state.startTime || !state.endTime) return null;
    return {
      playerId: state.playerId,
      teamName: state.teamName || `Jugador-${state.playerId.slice(0, 4)}`,
      teamAvatar: state.teamAvatar || "🦉",
      role: state.roomRole,
      finishedAt: state.endTime,
      baseSeconds: elapsed,
      penaltySeconds: state.totalPenaltySeconds,
      totalSeconds,
    };
  }, [state.roomCode, state.startTime, state.endTime, state.playerId, state.teamName, state.teamAvatar, state.roomRole, elapsed, state.totalPenaltySeconds, totalSeconds]);

  useEffect(() => {
    if (!state.roomCode || !myEntry) return;

    publishRanking(myEntry);
    const unsubscribe = subscribeRoomRanking((entries) => {
      setRanking(entries);
    });

    return () => {
      unsubscribe();
    };
  }, [state.roomCode, myEntry]);

  return (
    <div className={`min-h-screen ${
      isSoftTheme ? "bg-white text-slate-900" : "bg-gray-950 text-white"
    } flex flex-col items-center justify-center relative overflow-hidden px-4`}>
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center">
        {/* Trophy */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
          className="text-8xl mb-6"
        >
          🏆
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            ¡Misión cumplida!
          </h1>
          <p className="text-amber-400 font-semibold text-lg mb-1">
            Has liberado el conocimiento de la Biblioteca del Tiempo
          </p>
          {state.teamName && (
            <p className="text-gray-600 text-sm">
              Equipo: <span className="text-white font-medium">{state.teamAvatar} {state.teamName}</span>
            </p>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-4 my-8"
        >
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-3xl font-black text-amber-400">4/4</p>
            <p className="text-xs text-gray-600 mt-1">Salas completadas</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-3xl font-black text-amber-400">4</p>
            <p className="text-xs text-gray-600 mt-1">Claves obtenidas</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-3xl font-black text-indigo-400">{formatDuration(totalSeconds)}</p>
            <p className="text-xs text-gray-600 mt-1">Tiempo final</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8"
        >
          <p className="text-xs text-gray-600">
            Tiempo base: <span className="text-white font-semibold">{formatDuration(elapsed)}</span> · Penalización por pistas: <span className="text-rose-300 font-semibold">+{state.totalPenaltySeconds}s</span>
          </p>
        </motion.div>

        {state.roomCode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className={`w-full rounded-3xl p-8 mb-8 border ${
              isSoftTheme ? "bg-slate-100/80 border-slate-300/40" : "bg-white/5 border-white/10"
            }`}
          >
            <p className={`text-xs uppercase tracking-widest mb-6 text-center font-bold ${
              isSoftTheme ? "text-slate-600" : "text-gray-300"
            }`}>🏆 Podio de Honor - Sala {state.roomCode}</p>
            
            {ranking.length === 0 ? (
              <p className={`text-sm text-center ${isSoftTheme ? "text-slate-500" : "text-gray-500"}`}>
                Aún no hay resultados registrados.
              </p>
            ) : (
              <div>
                {/* Top 3 Podium */}
                {ranking.length > 0 && (
                  <div className="flex items-end justify-center gap-4 mb-8 px-2">
                    {/* 2nd Place */}
                    {ranking[1] && (
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className={`flex flex-col items-center flex-1 ${
                          isSoftTheme ? "bg-slate-50 border-slate-400/30" : "bg-white/10 border-white/15"
                        } border rounded-2xl p-4 h-48 justify-end`}
                      >
                        <p className="text-3xl mb-2">🥈</p>
                        <p className={`font-bold text-sm ${isSoftTheme ? "text-slate-900" : "text-white"}`}>
                          {ranking[1].teamAvatar} {ranking[1].teamName}
                        </p>
                        <p className={`text-xs ${isSoftTheme ? "text-slate-600" : "text-gray-600"} mt-1`}>
                          {formatDuration(ranking[1].totalSeconds)}
                        </p>
                        <p className={`text-xs ${isSoftTheme ? "text-slate-500" : "text-gray-500"}`}>
                          -${ranking[1].penaltySeconds}s
                        </p>
                      </motion.div>
                    )}

                    {/* 1st Place */}
                    {ranking[0] && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.6, type: "spring" }}
                        className={`flex flex-col items-center flex-1 ${
                          isSoftTheme ? "bg-amber-100 border-amber-400/50" : "bg-amber-400/20 border-amber-400/50"
                        } border-2 rounded-2xl p-4 h-56 justify-end shadow-lg scale-105`}
                      >
                        <motion.p
                          animate={{ rotate: [0, -5, 5, -5, 0] }}
                          transition={{ duration: 0.5, delay: 0.8 }}
                          className="text-4xl mb-2"
                        >
                          🥇
                        </motion.p>
                        <p className={`font-black text-lg ${isSoftTheme ? "text-amber-900" : "text-amber-700"}`}>
                          {ranking[0].teamAvatar} {ranking[0].teamName}
                        </p>
                        <p className={`text-sm font-bold mt-1 ${isSoftTheme ? "text-amber-600" : "text-amber-300"}`}>
                          {formatDuration(ranking[0].totalSeconds)}
                        </p>
                        <p className={`text-xs ${isSoftTheme ? "text-amber-600" : "text-amber-300"}`}>
                          -{ranking[0].penaltySeconds}s
                        </p>
                        <p className={`text-xs ${isSoftTheme ? "text-amber-600" : "text-amber-300"} mt-2 font-semibold`}>
                          CAMPEÓN
                        </p>
                      </motion.div>
                    )}

                    {/* 3rd Place */}
                    {ranking[2] && (
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65, duration: 0.5 }}
                        className={`flex flex-col items-center flex-1 ${
                          isSoftTheme ? "bg-slate-50 border-slate-400/30" : "bg-white/10 border-white/15"
                        } border rounded-2xl p-4 h-40 justify-end`}
                      >
                        <p className="text-3xl mb-2">🥉</p>
                        <p className={`font-bold text-sm ${isSoftTheme ? "text-slate-900" : "text-white"}`}>
                          {ranking[2].teamAvatar} {ranking[2].teamName}
                        </p>
                        <p className={`text-xs ${isSoftTheme ? "text-slate-600" : "text-gray-600"} mt-1`}>
                          {formatDuration(ranking[2].totalSeconds)}
                        </p>
                        <p className={`text-xs ${isSoftTheme ? "text-slate-500" : "text-gray-500"}`}>
                          -{ranking[2].penaltySeconds}s
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Full Ranking List */}
                {ranking.length > 3 && (
                  <div className={`border-t ${isSoftTheme ? "border-slate-300/30" : "border-white/10"} pt-6 mt-6`}>
                    <p className={`text-xs uppercase tracking-widest mb-3 ${
                      isSoftTheme ? "text-slate-600" : "text-gray-600"
                    }`}>Ranking completo</p>
                    <div className="space-y-2">
                      {ranking.slice(3, 10).map((entry, index) => (
                        <div key={entry.playerId} className={`flex items-center justify-between rounded-lg p-3 ${
                          isSoftTheme ? "bg-slate-200/40" : "bg-white/5"
                        }`}>
                          <div>
                            <p className={`text-sm font-semibold ${isSoftTheme ? "text-slate-900" : "text-white"}`}>
                              #{index + 4} {entry.teamAvatar || "🦉"} {entry.teamName}
                            </p>
                          </div>
                          <span className={`font-mono text-sm font-bold ${isSoftTheme ? "text-amber-600" : "text-amber-300"}`}>
                            {formatDuration(entry.totalSeconds)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Keys */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8"
        >
          <h3 className="text-xs text-gray-600 uppercase tracking-widest mb-4">Claves obtenidas — Código final</h3>
          <div className="flex flex-wrap gap-3 justify-center mb-4">
            {state.keysCollected.map((key, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="bg-amber-400/20 border border-amber-400/40 text-amber-400 px-4 py-2 rounded-xl font-mono font-bold text-sm"
              >
                🔑 {key}
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Clave maestra: <span className="font-mono text-white font-bold">
              {state.keysCollected.join(" + ")}
            </span>
          </p>
        </motion.div>

        {/* Levels mastered */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-2 gap-3 mb-8"
        >
          {ROOMS.map((room) => (
            <div key={room.id} className={`${room.bgCard} border ${room.borderColor} rounded-xl p-4 text-left`}>
              <div className="flex items-center gap-2 mb-1">
                <span>{room.icon}</span>
                <span className={`text-xs font-bold ${room.accentColor}`}>{room.subtitle}</span>
              </div>
              <p className="text-xs text-gray-600">{room.challenge.name}</p>
              <p className="text-xs text-gray-500 mt-1">✓ Clave: <span className="font-mono text-xs text-amber-400">{room.challenge.keyUnlocked}</span></p>
            </div>
          ))}
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-white/10 rounded-2xl p-6 mb-8"
        >
          <p className="text-gray-200 text-sm leading-relaxed">
            Has demostrado los <strong>cuatro niveles de comprensión lectora</strong>: recuperaste información literal,
            realizaste inferencias, argumentaste críticamente y aplicaste el conocimiento a nuevas situaciones. 
            Como Don Heliodoro enseñó a Valentina: <em className="text-amber-400">"El que cuida el agua, cuida la vida"</em>... 
            y el que comprende un texto, cuida el conocimiento.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="space-y-3"
        >
          <button
            onClick={resetGame}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/15 text-gray-300 font-medium py-3 rounded-xl transition-all text-sm"
          >
            Jugar de nuevo
          </button>
        </motion.div>
      </div>
    </div>
  );
}
