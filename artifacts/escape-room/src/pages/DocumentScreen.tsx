import { useRef } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { ROOMS, BASE_TEXT, GAME_INTRO } from "@/data/gameData";

export default function DocumentScreen() {
  const { state, goToVictory } = useGame();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur-sm border-b border-white/10 px-4 py-3 no-print">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={goToVictory}
            className="text-gray-600 hover:text-white text-sm flex items-center gap-2 transition-colors"
          >
            ← Volver al inicio
          </button>
          <button
            onClick={handlePrint}
            className="text-amber-400 hover:bg-amber-400 text-black font-bold px-6 py-2 rounded-xl text-sm transition-all"
          >
            Imprimir / Guardar PDF 🖨️
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10" ref={printRef}>
        {/* Document Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-10 pb-8 border-b border-white/20"
        >
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-3">Documento de soporte pedagógico</p>
          <h1 className="text-4xl font-black text-white mb-2">
            LA BIBLIOTECA DEL TIEMPO
          </h1>
          <p className="text-amber-400 font-semibold text-lg">Escape Room de comprensión lectora</p>
          <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm text-gray-600">
            {state.teamName && (
              <span>Equipo: <strong className="text-white">{state.teamName}</strong></span>
            )}
            {state.teamMembers && (
              <span>Integrantes: <strong className="text-white">{state.teamMembers}</strong></span>
            )}
            <span>Fecha: <strong className="text-white">{new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}</strong></span>
          </div>
        </motion.div>

        {/* Section 1: Objetivo */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-amber-400 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-black text-xs font-bold">1</span>
            Objetivo pedagógico
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <p className="text-gray-200 leading-relaxed text-sm">
              Desarrollar y fortalecer los cuatro niveles de comprensión lectora (literal, inferencial, crítico y aplicado) 
              mediante la resolución de retos progresivos derivados del texto base "El Guardián del Río", en un entorno 
              gamificado de escape room virtual que exige interpretar, analizar, evaluar y aplicar la información textual 
              para avanzar hacia la solución.
            </p>
            <ul className="mt-4 space-y-2">
              {GAME_INTRO.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-amber-400 flex-shrink-0 mt-0.5">▸</span>
                  {obj}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Section 2: Público objetivo */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-indigo-400 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-black text-xs font-bold">2</span>
            Público objetivo
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Nivel educativo", value: "Secundaria y Media (grados 6° a 11°)" },
                { label: "Edad sugerida", value: "11 a 17 años" },
                { label: "Modalidad", value: "Individual o grupal (2-4 personas)" },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">{item.label}</p>
                  <p className="text-white font-medium text-sm">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Texto base */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-rose-400 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-black text-xs font-bold">3</span>
            Texto Base Utilizado
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            {BASE_TEXT.trim().split("\n\n").filter(Boolean).map((para, i) => (
              i === 0 ? (
                <h3 key={i} className="text-lg font-black text-center text-white mb-6">{para}</h3>
              ) : (
                <p key={i} className="text-gray-300 leading-8 text-sm mb-4 last:mb-0">{para}</p>
              )
            ))}
          </div>
        </section>

        {/* Section 4: Narrativa */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-amber-400 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-black text-xs font-bold">4</span>
            Narrativa del Escape Room
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-widest mb-2">Introducción</p>
              <p className="text-gray-300 text-sm leading-relaxed">{GAME_INTRO.description}</p>
            </div>
            <div className="border-t border-white/10 pt-4">
              <p className="text-xs text-gray-600 uppercase tracking-widest mb-3">Narrativa por sala</p>
              <div className="space-y-4">
                {ROOMS.map((room) => (
                  <div key={room.id} className="flex gap-3">
                    <span className="text-2xl flex-shrink-0">{room.icon}</span>
                    <div>
                      <p className="font-semibold text-white text-sm mb-1">Sala {room.id}: {room.name}</p>
                      <p className="text-gray-600 text-xs leading-relaxed">{room.narrative}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Sistema de claves */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-amber-400 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-black text-xs font-bold">5</span>
            Sistema general de claves y avance
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 pr-4 text-xs text-gray-600 font-semibold">Sala</th>
                    <th className="text-left py-2 pr-4 text-xs text-gray-600 font-semibold">Nivel</th>
                    <th className="text-left py-2 pr-4 text-xs text-gray-600 font-semibold">Reto</th>
                    <th className="text-left py-2 text-xs text-gray-600 font-semibold">Clave</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ROOMS.map((room) => (
                    <tr key={room.id}>
                      <td className="py-3 pr-4 text-white font-medium">{room.icon} {room.name}</td>
                      <td className="py-3 pr-4 text-gray-600">{room.challenge.levelCode}</td>
                      <td className="py-3 pr-4 text-gray-300">{room.challenge.name}</td>
                      <td className="py-3">
                        <span className="font-mono text-amber-400 bg-amber-400/15 px-2 py-0.5 rounded text-xs">
                          {room.challenge.keyUnlocked}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-gray-600 mb-1">Clave maestra final (todas las claves combinadas):</p>
              <p className="font-mono text-amber-400 font-bold text-sm">
                {ROOMS.map(r => r.challenge.keyUnlocked).join(" + ")}
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Retos detallados */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
            <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-black text-xs font-bold">6</span>
            Diseño detallado de los 4 retos
          </h2>
          <div className="space-y-8">
            {ROOMS.map((room) => {
              const ch = room.challenge;
              const playerAnswer = state.essayAnswers[room.id];
              return (
                <div key={room.id} className={`border ${room.borderColor} rounded-2xl overflow-hidden`}>
                  {/* Room header */}
                  <div className={`bg-gradient-to-r ${room.color} p-5`}>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{room.icon}</span>
                      <div>
                        <p className="font-black text-white text-lg">{ch.name}</p>
                        <p className="text-white/80 text-sm">{room.name} — {ch.level}</p>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className={`${room.bgCard} p-6 space-y-4`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Nivel de comprensión" value={ch.level} />
                      <Field label="Tipo de reto" value={ch.type === "multiple" ? "Selección múltiple" : "Respuesta abierta (ensayo)"} />
                    </div>
                    <Field label="Objetivo específico" value={ch.objective} />
                    <Field label="Instrucción para el jugador" value={ch.instruction} />
                    <Field label="Pregunta central" value={ch.question} />

                    {ch.type === "multiple" && ch.options && (
                      <div>
                        <p className="text-xs text-gray-600 uppercase tracking-widest mb-2">Opciones de respuesta</p>
                        <div className="space-y-2">
                          {ch.options.map((opt, i) => (
                            <div key={i} className={`flex items-start gap-2 text-xs p-2 rounded-lg ${i === ch.correctIndex ? "amber-400/10 border amber-400/20" : "bg-white/5"}`}>
                              <span className={`font-bold flex-shrink-0 ${i === ch.correctIndex ? "amber-400" : "text-gray-500"}`}>
                                {String.fromCharCode(65 + i)}.
                              </span>
                              <span className={i === ch.correctIndex ? "text-emerald-700" : "text-gray-600"}>{opt}</span>
                              {i === ch.correctIndex && <span className="ml-auto text-amber-400 flex-shrink-0">✓ Correcta</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {ch.type === "essay" && (
                      <Field label="Criterios de evaluación" value={`Mínimo ${ch.minWords} palabras. Debe incluir al menos 2 de estas referencias: ${(ch.correctKeywords || []).slice(0, 6).join(", ")}.`} />
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 uppercase tracking-widest mb-2">Retroalimentación si acierta</p>
                        <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg p-3">
                          <p className="text-emerald-700 text-xs leading-relaxed">{ch.feedbackCorrect}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 uppercase tracking-widest mb-2">Retroalimentación si falla</p>
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                          <p className="text-rose-600 text-xs leading-relaxed">{ch.feedbackWrong}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 uppercase tracking-widest mb-2">Clave que entrega</p>
                        <span className="font-mono text-amber-400 bg-amber-400/15 px-3 py-1 rounded text-sm font-bold">
                          🔑 {ch.keyUnlocked}
                        </span>
                      </div>
                    </div>

                    <Field label="Justificación pedagógica" value={ch.pedagogicalNote} />

                    {/* Player's actual answer */}
                    {playerAnswer && (
                      <div>
                        <p className="text-xs text-gray-600 uppercase tracking-widest mb-2">Respuesta del equipo</p>
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                          <p className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap">{playerAnswer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 7: How it strengthens reading */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-amber-400 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-black text-xs font-bold">7</span>
            Cómo fortalece la comprensión lectora
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
            {[
              {
                title: "Progresión cognitiva",
                desc: "Los retos siguen la taxonomía de Bloom de menor a mayor complejidad: recordar (literal) → comprender (inferencial) → evaluar (crítico) → crear/aplicar (aplicado). Esto garantiza que el aprendizaje sea gradual y consolidado."
              },
              {
                title: "Comprensión obligatoria",
                desc: "El diseño del juego impide avanzar copiando o adivinando: las preguntas exigen relacionar información específica del texto, y las respuestas abiertas requieren referencias textuales verificables."
              },
              {
                title: "Retroalimentación formativa",
                desc: "Cada respuesta correcta o incorrecta genera retroalimentación pedagógica inmediata que explica el razonamiento correcto, no solo indica si la respuesta fue bien o mal."
              },
              {
                title: "Motivación intrínseca",
                desc: "La narrativa y el sistema de claves crean un propósito emocional para leer: el jugador quiere avanzar, lo que genera una motivación genuina para comprender el texto."
              },
              {
                title: "Transferencia del conocimiento",
                desc: "El reto 4 (aplicado) garantiza que la comprensión vaya más allá del texto: el estudiante debe demostrar que puede usar las ideas leídas en un contexto propio y real."
              }
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-8 h-8 bg-amber-400/20 border border-amber-400/30 rounded-full flex items-center justify-center flex-shrink-0 text-amber-400 text-xs font-bold">
                  {i + 1}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm mb-1">{item.title}</p>
                  <p className="text-gray-600 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 8: Tool recommendation */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-indigo-400 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-black text-xs font-bold">8</span>
            Herramienta recomendada para publicación
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                tool: "Genially ⭐ RECOMENDADA",
                pros: "Diseño visual atractivo, objetos interactivos, navegación entre páginas, efectos de animación, estadísticas de uso, enlaces directos y plantillas de escape room.",
                cons: "Versión gratuita con funciones limitadas.",
                badge: "Mejor opción general",
                color: "amber-400/40 amber-400/10",
                textColor: "amber-400"
              },
              {
                tool: "Google Forms",
                pros: "Gratis, accesible, fácil de usar, respuestas automáticas, puede compartirse por enlace.",
                cons: "Sin narrativa visual ni gamificación real. Poco inmersivo.",
                badge: "Más sencillo",
                color: "border-indigo-500/30 bg-indigo-500/10",
                textColor: "text-indigo-300"
              },
              {
                tool: "Canva Interactivo",
                pros: "Atractivo visualmente, fácil de diseñar, botones de enlace entre páginas, se puede publicar como sitio web.",
                cons: "No tiene lógica de juego real ni condicionantes automáticos.",
                badge: "Más visual",
                color: "border-rose-500/30 bg-rose-500/10",
                textColor: "text-rose-300"
              },
              {
                tool: "PowerPoint Interactivo",
                pros: "Sin conexión a internet, familiar para docentes, hipervínculos entre diapositivas.",
                cons: "Necesita instalación de Office, difícil de compartir online.",
                badge: "Sin internet",
                color: "amber-400/30 amber-400/10",
                textColor: "amber-400"
              }
            ].map((item, i) => (
              <div key={i} className={`border ${item.color} rounded-xl p-5`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <p className={`font-bold text-sm ${item.textColor}`}>{item.tool}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${item.color} ${item.textColor} flex-shrink-0`}>
                    {item.badge}
                  </span>
                </div>
                <p className="text-gray-300 text-xs mb-2"><span className="text-amber-400 font-medium">Ventajas:</span> {item.pros}</p>
                <p className="text-gray-600 text-xs"><span className="text-rose-400 font-medium">Limitaciones:</span> {item.cons}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-amber-400/10 border border-amber-400/30 rounded-xl p-4">
            <p className="text-amber-700 text-sm leading-relaxed">
              <strong>Conclusión:</strong> Se recomienda <strong>Genially</strong> por ser la plataforma que mejor combina
              narrativa visual, interactividad real, facilidad de uso y opciones de gamificación. Permite crear 
              "rutas de aprendizaje" donde cada sala es una página con objetos clicables, temporizadores, 
              animaciones y condicionales de avance. Hay plantillas específicas de escape room listas para usar.
            </p>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-gray-600 text-xs">
            Escape Room "La Biblioteca del Tiempo" — Documento generado el {new Date().toLocaleDateString("es-ES")}
          </p>
          {state.teamName && (
            <p className="text-gray-700 text-xs mt-1">Equipo: {state.teamName}</p>
          )}
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-600 uppercase tracking-widest mb-1.5">{label}</p>
      <p className="text-gray-200 text-sm leading-relaxed bg-white/5 rounded-lg px-3 py-2">{value}</p>
    </div>
  );
}
