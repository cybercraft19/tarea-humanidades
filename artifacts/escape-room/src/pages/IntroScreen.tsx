import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { GAME_INTRO } from "@/data/gameData";

const AVATARS = ["🦉", "🦊", "🐺", "🐯", "🐙", "🦁", "🐼", "🐉"];

export default function IntroScreen() {
  const { state, setTeamInfo, setMusicPreference, startGame } = useGame();
  const isSoftTheme = state.visualTheme !== "dark-lux";
  const [name, setName] = useState(state.teamName);
  const [members, setMembers] = useState(state.teamMembers);
  const [avatar, setAvatar] = useState(state.teamAvatar || "🦉");
  const [error, setError] = useState("");
  const [isNarrating, setIsNarrating] = useState(false);

  const narrationText = useMemo(
    () => `${GAME_INTRO.title}. ${GAME_INTRO.subtitle}. ${GAME_INTRO.description}`,
    [],
  );

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const toggleNarration = () => {
    if (!("speechSynthesis" in window)) return;

    if (isNarrating) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(narrationText);
    utterance.lang = "es-ES";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setIsNarrating(false);
    utterance.onerror = () => setIsNarrating(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsNarrating(true);
  };

  const handleStart = () => {
    if (!state.roomCode) {
      setError("Primero crea o unete a una sala desde el lobby.");
      return;
    }
    if (!name.trim()) {
      setError("Por favor, escribe el nombre de tu equipo.");
      return;
    }

    setTeamInfo(name.trim(), members.trim(), avatar);
    startGame();
  };

  return (
    <div className={`min-h-screen ${isSoftTheme ? "text-slate-900" : "text-white"} flex flex-col items-center justify-start py-12 relative overflow-x-hidden px-4`}>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover opacity-18 saturate-[0.85]"
      >
        <source src="/intro.mp4" type="video/mp4" />
      </video>

      <div className={`absolute inset-0 ${isSoftTheme ? "bg-white/30" : "bg-black/35"}`} />

      {state.musicEnabled === null && (
        <div className="absolute inset-0 z-30 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 text-center backdrop-blur-lg ${isSoftTheme ? "border-slate-400/30 bg-white/78" : "border-white/15 bg-black/60"}`}>
            <h2 className="lux-heading text-3xl text-white">Musica ambiental</h2>
            <p className="mt-2 text-sm text-gray-300">Quieren jugar con musica de fondo?</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => setMusicPreference(true)}
                className="rounded-xl bg-amber-400 text-black px-4 py-3 text-sm font-bold transition-colors hover:bg-amber-300"
              >
                Si, con musica
              </button>
              <button
                onClick={() => setMusicPreference(false)}
                className="rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm font-bold transition-colors hover:bg-white/15"
              >
                No, en silencio
              </button>
            </div>
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-2xl w-full"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-6"
        >
          <span className="text-xs font-semibold px-4 py-1.5 rounded-full tracking-widest uppercase border border-amber-300/30 bg-amber-300/10 text-amber-700">
            Escape Room Educativo
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="lux-heading text-5xl md:text-6xl tracking-tight text-white leading-none">
            {GAME_INTRO.title}
          </h1>
          <p className="mt-3 text-amber-400 font-medium tracking-widest text-sm uppercase">
            {GAME_INTRO.subtitle}
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <button
              onClick={toggleNarration}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide transition-colors hover:bg-white/15"
            >
              {isNarrating ? "Detener narrador" : "Escuchar narrador"}
            </button>
            <button
              onClick={() => setMusicPreference(state.musicEnabled !== true)}
              className="rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-semibold tracking-wide text-amber-700 transition-colors hover:bg-amber-300/15"
            >
              {state.musicEnabled === true ? "Musica: activa" : "Musica: desactivada"}
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`rounded-2xl border p-6 mb-6 backdrop-blur-md ${isSoftTheme ? "border-slate-400/30 bg-white/72" : "border-white/15 bg-black/45"}`}
        >
          <p className="text-gray-300 text-sm leading-relaxed text-center">
            {GAME_INTRO.description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`rounded-2xl border p-6 backdrop-blur-md ${isSoftTheme ? "border-slate-400/30 bg-white/72" : "border-white/15 bg-black/45"}`}
        >
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Identificacion del equipo</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-600 mb-2 block">Avatar del equipo</label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {AVATARS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setAvatar(item)}
                    className={`rounded-lg border p-2 text-xl transition-colors ${
                      avatar === item
                        ? "amber-400/20 border-amber-400 text-amber-400"
                        : "bg-white/5 border-white/15 hover:bg-white/10"
                    }`}
                    aria-label={`Seleccionar avatar ${item}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1.5 block">Nombre del equipo *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                placeholder="Ej: los tilines insanos 🤪"
                className="w-full rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm transition-colors bg-white/10 border border-white/20 focus:outline-none focus:border-amber-400/70"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1.5 block">Integrantes del grupo (opcional)</label>
              <textarea
                value={members}
                onChange={(e) => setMembers(e.target.value)}
                placeholder="Ej: el pepe, carlitos, ozuna 🙈"
                rows={2}
                className="w-full rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm transition-colors resize-none bg-white/10 border border-white/20 focus:outline-none focus:border-amber-400/70"
              />
            </div>
            {error && <p className="text-rose-400 text-xs">{error}</p>}
            <button
              onClick={handleStart}
              className="w-full rounded-xl bg-amber-400 text-black font-bold py-4 transition-all duration-200 text-sm tracking-wide hover:bg-amber-300"
            >
              Entrar a la Biblioteca del Tiempo {avatar}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
