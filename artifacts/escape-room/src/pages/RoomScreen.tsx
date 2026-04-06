import { motion } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { ROOMS } from "@/data/gameData";

export default function RoomScreen() {
  const { state, goToText, goToChallenge } = useGame();
  const room = ROOMS[state.currentRoom - 1];
  const status = state.roomStatuses[state.currentRoom - 1];
  const isSoftTheme = state.visualTheme !== "dark-lux";

  if (!room) return null;

  return (
    <div className={`min-h-screen ${
      isSoftTheme ? "bg-white text-slate-900" : "bg-gray-950 text-white"
    } flex flex-col`}>
      {/* Top nav */}
      <div className={`border-b ${
        isSoftTheme ? "border-slate-300/30" : "border-white/10"
      } px-4 py-3 flex items-center justify-between`}>
        <button
          onClick={goToText}
          className={`${
            isSoftTheme ? "text-slate-600 hover:text-slate-900" : "text-gray-600 hover:text-white"
          } text-sm flex items-center gap-2 transition-colors`}
        >
          ← Volver al texto
        </button>
        <div className="flex gap-2">
          {state.keysCollected.map((key, i) => (
            <span key={i} className="bg-amber-400/20 border border-amber-400/40 text-amber-400 text-xs px-2 py-1 rounded-full font-mono hidden sm:block">
              🔑 {key}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="max-w-lg w-full">
          {/* Room Icon & Level Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${room.color} mb-4 shadow-2xl`}>
              <span className="text-5xl">{room.icon}</span>
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3 border ${room.borderColor} ${room.accentColor} bg-white/5`}>
              Sala {room.id} — {room.subtitle}
            </div>
            <h1 className="text-3xl font-black text-white">{room.name}</h1>
          </motion.div>

          {/* Narrative */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`${room.bgCard} border ${room.borderColor} rounded-2xl p-6 mb-6`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5 flex-shrink-0">📜</span>
              <p className="text-gray-200 text-sm leading-relaxed italic">
                {room.narrative}
              </p>
            </div>
          </motion.div>

          {/* Challenge preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6"
          >
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">Reto de esta sala</h3>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${room.color} flex items-center justify-center flex-shrink-0`}>
                <span className="text-xl">{room.icon}</span>
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{room.challenge.name}</p>
                <p className={`text-xs ${room.accentColor}`}>{room.challenge.level}</p>
              </div>
            </div>
          </motion.div>

          {/* Status or action */}
          {status === "completed" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <div className="bg-amber-400/15 border border-amber-400/30 rounded-2xl p-5 text-center">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-amber-400 font-semibold mb-1">Sala completada</p>
                <p className="text-gray-600 text-xs">Clave obtenida: <span className="font-mono text-amber-400">{state.keysCollected[state.currentRoom - 1]}</span></p>
              </div>
              <button
                onClick={goToText}
                className="w-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold py-3 rounded-xl transition-all text-sm"
              >
                Ir a la siguiente sala
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <button
                onClick={goToText}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/15 text-gray-300 font-medium py-3 rounded-xl transition-all text-sm"
              >
                📖 Releer el texto primero
              </button>
              <button
                onClick={() => goToChallenge(room.id)}
                className={`w-full bg-gradient-to-r ${room.color} text-white font-bold py-4 rounded-xl transition-all shadow-lg text-sm hover:brightness-110`}
              >
                Aceptar el reto {room.icon}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
