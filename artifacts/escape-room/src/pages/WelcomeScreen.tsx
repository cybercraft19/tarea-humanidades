import { motion } from "framer-motion";
import { useGame } from "@/context/GameContext";

export default function WelcomeScreen() {
  const { state, goToLoading } = useGame();
  const isSoftTheme = state.visualTheme !== "dark-lux";

  return (
    <div className={`min-h-screen relative overflow-hidden ${isSoftTheme ? "text-slate-900" : "text-white"} flex items-center justify-center px-4 py-8`}>
      <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover opacity-16 saturate-[0.8]">
        <source src="/intro.mp4" type="video/mp4" />
      </video>
      <div className={`absolute inset-0 ${isSoftTheme ? "bg-white/35" : "bg-black/45"}`} />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`relative z-10 max-w-2xl w-full rounded-[1.75rem] border backdrop-blur-lg p-8 md:p-12 text-center ${isSoftTheme ? "border-slate-400/30 bg-white/70" : "border-white/15 bg-black/55"}`}
      >
        <p className="text-[11px] uppercase tracking-[0.28em] text-amber-700/85 font-semibold">Bienvenida</p>
        <h1 className="lux-heading text-5xl md:text-7xl mt-4">Biblioteca del Tiempo</h1>
        <p className={`mt-5 text-sm md:text-lg leading-relaxed max-w-xl mx-auto ${isSoftTheme ? "text-slate-700" : "text-slate-200/95"}`}>
          Un viaje narrativo de comprension lectora, diseno inmersivo y desafios cooperativos en tiempo real.
        </p>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={goToLoading}
          className="mt-8 w-full md:w-auto md:px-14 rounded-2xl bg-amber-400 text-black font-extrabold py-4 text-sm tracking-[0.08em] transition-all hover:bg-amber-300"
        >
          Ingresar a la experiencia
        </motion.button>
      </motion.div>
    </div>
  );
}
