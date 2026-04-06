import { useEffect } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/context/GameContext";

export default function MagicLoadingScreen() {
  const { goToLobby } = useGame();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      goToLobby();
    }, 2400);

    return () => window.clearTimeout(timer);
  }, [goToLobby]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-black text-white flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,158,11,0.3),transparent_45%),radial-gradient(circle_at_80%_75%,rgba(45,212,191,0.25),transparent_48%)]" />

      <div className="lux-card relative z-10 w-full max-w-xl rounded-[2rem] p-8 md:p-10 text-center">
        <p className="lux-outline-title text-[11px]">Sincronizando Sala</p>
        <motion.img
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          src="/image.png"
          alt="Loading"
          className="mx-auto mt-4 w-32 h-32 object-contain"
        />

        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lux-heading mt-8 text-3xl md:text-4xl"
        >
          Activando magia de la biblioteca...
        </motion.h2>

        <div className="mt-6 h-2.5 w-full rounded-full bg-white/10 overflow-hidden border border-white/15">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.2, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-amber-400 to-cyan-400"
          />
        </div>

        <p className="mt-3 text-xs text-slate-300 tracking-wide">Preparando salas, pistas y desafios en tiempo real...</p>
      </div>
    </div>
  );
}
