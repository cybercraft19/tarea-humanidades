import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { ROOMS } from "@/data/gameData";
import { formatDuration, type RankingEntry } from "@/lib/liveRoom";
import { publishRanking, subscribeRoomRanking } from "@/lib/liveRoomSocket";
import PlayerAvatar from "@/components/PlayerAvatar";
import { DEFAULT_TEAM_AVATAR } from "@/lib/avatarUtils";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { buildCertificateFileName, buildCertificateSvg } from "@/lib/certificate";

export default function VictoryScreen() {
  const { state, resetGame } = useGame();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [teamPhotoDataUrl, setTeamPhotoDataUrl] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraBusy, setCameraBusy] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const isSoftTheme = state.visualTheme !== "dark-lux";
  const supportsCamera = typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);

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
  const completionDateLabel = new Date(state.endTime || Date.now()).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const achievementTitles = state.achievementsUnlocked.map((id) => ACHIEVEMENTS[id].title);

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

  const certificateSvg = useMemo(() => {
    return buildCertificateSvg({
      teamName: state.teamName || `Jugador-${state.playerId.slice(0, 4)}`,
      teamMembers: state.teamMembers || "Sin integrantes registrados",
      roomCode: state.roomCode || "—",
      durationLabel: formatDuration(totalSeconds),
      completedAtLabel: completionDateLabel,
      achievementIds: state.achievementsUnlocked,
      photoDataUrl: teamPhotoDataUrl,
    });
  }, [completionDateLabel, state.achievementsUnlocked, state.playerId, state.roomCode, state.teamMembers, state.teamName, teamPhotoDataUrl, totalSeconds]);

  const certificateFileName = useMemo(
    () => buildCertificateFileName(state.teamName || `Jugador-${state.playerId.slice(0, 4)}`),
    [state.playerId, state.teamName],
  );

  const stopCamera = () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;

    if (videoRef.current) {
      (videoRef.current as HTMLVideoElement & { srcObject: MediaStream | null }).srcObject = null;
    }

    setCameraActive(false);
  };

  const startCamera = async () => {
    if (!supportsCamera) {
      setCameraError("Este navegador no soporta la webcam.");
      return;
    }

    setCameraBusy(true);
    setCameraError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      cameraStreamRef.current = stream;
      setCameraActive(true);
    } catch {
      setCameraError("No pudimos abrir la cámara. Puedes continuar sin foto.");
    } finally {
      setCameraBusy(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError("La cámara todavía no está lista.");
      return;
    }

    const size = 1200;
    canvas.width = size;
    canvas.height = size;

    const side = Math.min(video.videoWidth, video.videoHeight);
    const offsetX = (video.videoWidth - side) / 2;
    const offsetY = (video.videoHeight - side) / 2;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, offsetX, offsetY, side, side, 0, 0, size, size);
    setTeamPhotoDataUrl(canvas.toDataURL("image/jpeg", 0.92));
    stopCamera();
  };

  const handleDownloadCertificate = () => {
    const blob = new Blob([certificateSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = certificateFileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  useEffect(() => {
    if (!cameraActive || !videoRef.current || !cameraStreamRef.current) return undefined;

    (videoRef.current as HTMLVideoElement & { srcObject: MediaStream | null }).srcObject = cameraStreamRef.current;

    return () => {
      stopCamera();
    };
  }, [cameraActive]);

  useEffect(() => () => {
    stopCamera();
  }, []);

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
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5">
              <PlayerAvatar
                avatar={state.teamAvatar || DEFAULT_TEAM_AVATAR}
                alt={`Avatar de ${state.teamName}`}
                className="h-6 w-6"
                emojiClassName="text-sm"
              />
              <p className="text-gray-300 text-sm">
                Equipo: <span className="text-white font-medium">{state.teamName}</span>
              </p>
            </div>
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="grid xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] gap-6 mb-8 text-left"
        >
          <div className={`rounded-3xl p-6 border ${isSoftTheme ? "bg-slate-100/80 border-slate-300/40" : "bg-white/5 border-white/10"}`}>
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
              <div>
                <p className={`text-xs uppercase tracking-[0.3em] font-bold ${isSoftTheme ? "text-slate-500" : "text-gray-400"}`}>
                  Certificado automático
                </p>
                <h3 className={`text-2xl font-black mt-1 ${isSoftTheme ? "text-slate-900" : "text-white"}`}>
                  Reconocimiento final para {state.teamName || "tu equipo"}
                </h3>
                <p className={`text-sm mt-2 ${isSoftTheme ? "text-slate-600" : "text-gray-300"}`}>
                  Se genera con el tiempo real, las claves obtenidas y los logros desbloqueados.
                </p>
              </div>

              <button
                onClick={handleDownloadCertificate}
                className="rounded-2xl bg-amber-400 px-5 py-3 font-black text-black transition-all hover:brightness-110 shadow-lg shadow-amber-400/20 w-full sm:w-auto"
              >
                Descargar certificado
              </button>
            </div>

            <div className={`rounded-[28px] p-5 border ${isSoftTheme ? "bg-white border-slate-200" : "bg-slate-950/70 border-white/10"} shadow-2xl shadow-black/20`}>
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-amber-400 font-bold">La Biblioteca del Tiempo</p>
                  <p className={`text-sm mt-2 ${isSoftTheme ? "text-slate-500" : "text-gray-400"}`}>
                    Certificado emitido el {completionDateLabel}
                  </p>
                </div>
                <div className="rounded-full border border-amber-400/25 bg-amber-400/10 px-4 py-2 text-xs font-bold text-amber-300">
                  {state.achievementsUnlocked.length}/{Object.keys(ACHIEVEMENTS).length} logros
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(220px,0.85fr)_1.15fr]">
                <div className={`rounded-3xl p-4 ${isSoftTheme ? "bg-slate-50" : "bg-white/5"} border ${isSoftTheme ? "border-slate-200" : "border-white/10"}`}>
                  <div className="mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-amber-400/40 bg-slate-950 shadow-lg shadow-amber-400/10">
                    {teamPhotoDataUrl ? (
                      <img src={teamPhotoDataUrl} alt="Foto de equipo capturada" className="h-full w-full object-cover" />
                    ) : (
                      <PlayerAvatar
                        avatar={state.teamAvatar || DEFAULT_TEAM_AVATAR}
                        alt={`Avatar de ${state.teamName || "equipo"}`}
                        className="h-full w-full"
                        emojiClassName="text-6xl"
                      />
                    )}
                  </div>

                  <div className="mt-4 text-center">
                    <p className={`text-lg font-black break-words ${isSoftTheme ? "text-slate-900" : "text-white"}`}>
                      {state.teamName || "Equipo explorador"}
                    </p>
                    <p className={`text-xs mt-1 ${isSoftTheme ? "text-slate-500" : "text-gray-400"}`}>
                      Foto opcional para el cierre final
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 grid-cols-2 md:grid-cols-2">
                  <div className={`rounded-2xl p-4 ${isSoftTheme ? "bg-slate-50" : "bg-white/5"} border ${isSoftTheme ? "border-slate-200" : "border-white/10"}`}>
                    <p className={`text-xs uppercase tracking-widest ${isSoftTheme ? "text-slate-500" : "text-gray-400"}`}>Tiempo final</p>
                    <p className={`text-xl md:text-2xl font-black mt-2 leading-none ${isSoftTheme ? "text-slate-900" : "text-white"}`}>{formatDuration(totalSeconds)}</p>
                  </div>
                  <div className={`rounded-2xl p-4 ${isSoftTheme ? "bg-slate-50" : "bg-white/5"} border ${isSoftTheme ? "border-slate-200" : "border-white/10"}`}>
                    <p className={`text-xs uppercase tracking-widest ${isSoftTheme ? "text-slate-500" : "text-gray-400"}`}>Claves</p>
                    <p className={`text-xl md:text-2xl font-black mt-2 leading-none ${isSoftTheme ? "text-slate-900" : "text-white"}`}>{state.keysCollected.length}/4</p>
                  </div>
                  <div className={`rounded-2xl p-4 ${isSoftTheme ? "bg-slate-50" : "bg-white/5"} border ${isSoftTheme ? "border-slate-200" : "border-white/10"}`}>
                    <p className={`text-xs uppercase tracking-widest ${isSoftTheme ? "text-slate-500" : "text-gray-400"}`}>Logros</p>
                    <p className={`text-xl md:text-2xl font-black mt-2 leading-none ${isSoftTheme ? "text-slate-900" : "text-white"}`}>{state.achievementsUnlocked.length}</p>
                  </div>
                  <div className={`rounded-2xl p-4 ${isSoftTheme ? "bg-slate-50" : "bg-white/5"} border ${isSoftTheme ? "border-slate-200" : "border-white/10"}`}>
                    <p className={`text-xs uppercase tracking-widest ${isSoftTheme ? "text-slate-500" : "text-gray-400"}`}>Sala</p>
                    <p className={`text-xl md:text-2xl font-black mt-2 leading-none break-all ${isSoftTheme ? "text-slate-900" : "text-white"}`}>{state.roomCode || "—"}</p>
                  </div>
                </div>
              </div>

              <div className={`mt-5 rounded-3xl p-4 ${isSoftTheme ? "bg-slate-50" : "bg-white/5"} border ${isSoftTheme ? "border-slate-200" : "border-white/10"}`}>
                <p className={`text-xs uppercase tracking-widest mb-3 ${isSoftTheme ? "text-slate-500" : "text-gray-400"}`}>Logros visibles</p>
                <div className="flex flex-wrap gap-2">
                  {achievementTitles.length > 0 ? achievementTitles.map((title) => (
                    <span key={title} className="rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
                      {title}
                    </span>
                  )) : (
                    <span className={`text-sm ${isSoftTheme ? "text-slate-500" : "text-gray-400"}`}>Aún no hay logros desbloqueados.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={`rounded-3xl p-6 border ${isSoftTheme ? "bg-slate-100/80 border-slate-300/40" : "bg-white/5 border-white/10"}`}>
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className={`text-xs uppercase tracking-[0.16em] font-bold ${isSoftTheme ? "text-slate-500" : "text-gray-400"}`}>
                  Foto de equipo opcional
                </p>
                <h3 className={`text-xl font-black mt-1 ${isSoftTheme ? "text-slate-900" : "text-white"}`}>
                  Usa webcam para el cierre
                </h3>
                <p className={`text-sm mt-2 ${isSoftTheme ? "text-slate-600" : "text-gray-300"}`}>
                  Si el navegador lo permite, puedes tomar una foto y meterla en el certificado.
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-gray-300">
                Opcional
              </span>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/80 shadow-2xl shadow-black/20">
              <div className="relative aspect-square">
                {teamPhotoDataUrl ? (
                  <img src={teamPhotoDataUrl} alt="Foto de equipo tomada" className="h-full w-full object-cover" />
                ) : cameraActive ? (
                  <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
                    <div className="mb-4 text-6xl">📸</div>
                    <p className="text-lg font-black text-white">Captura un recuerdo final</p>
                    <p className="mt-2 text-sm text-gray-300">
                      La foto no es obligatoria. Si no la usan, el certificado toma el avatar del equipo.
                    </p>
                    {cameraError && (
                      <p className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                        {cameraError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={cameraActive ? capturePhoto : startCamera}
                disabled={cameraBusy}
                className="rounded-2xl bg-amber-400 px-4 py-3 text-sm font-black text-black transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cameraBusy ? "Abriendo cámara..." : cameraActive ? "Tomar foto" : (supportsCamera ? "Activar webcam" : "Webcam no disponible")}
              </button>
              <button
                onClick={() => {
                  setTeamPhotoDataUrl(null);
                  setCameraError(null);
                  stopCamera();
                }}
                className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-gray-300 transition-all hover:bg-white/10"
              >
                Quitar foto
              </button>
            </div>

            <p className={`mt-3 text-xs ${isSoftTheme ? "text-slate-500" : "text-gray-500"}`}>
              La webcam solo se activa cuando la pides. Si no hay permiso, el juego sigue igual.
            </p>
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
                          <span className="inline-flex items-center gap-1.5">
                            <PlayerAvatar
                              avatar={ranking[1].teamAvatar || DEFAULT_TEAM_AVATAR}
                              alt={`Avatar de ${ranking[1].teamName}`}
                              className="h-5 w-5"
                              emojiClassName="text-[11px]"
                            />
                            {ranking[1].teamName}
                          </span>
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
                          <span className="inline-flex items-center gap-1.5">
                            <PlayerAvatar
                              avatar={ranking[0].teamAvatar || DEFAULT_TEAM_AVATAR}
                              alt={`Avatar de ${ranking[0].teamName}`}
                              className="h-6 w-6"
                              emojiClassName="text-xs"
                            />
                            {ranking[0].teamName}
                          </span>
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
                          <span className="inline-flex items-center gap-1.5">
                            <PlayerAvatar
                              avatar={ranking[2].teamAvatar || DEFAULT_TEAM_AVATAR}
                              alt={`Avatar de ${ranking[2].teamName}`}
                              className="h-5 w-5"
                              emojiClassName="text-[11px]"
                            />
                            {ranking[2].teamName}
                          </span>
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
                              <span className="inline-flex items-center gap-1.5">
                                <span>#{index + 4}</span>
                                <PlayerAvatar
                                  avatar={entry.teamAvatar || DEFAULT_TEAM_AVATAR}
                                  alt={`Avatar de ${entry.teamName}`}
                                  className="h-5 w-5"
                                  emojiClassName="text-[11px]"
                                />
                                {entry.teamName}
                              </span>
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

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-xs text-gray-600 uppercase tracking-widest mb-1">Logros desbloqueados</h3>
              <p className="text-sm text-gray-300">Tu progreso deja medallas visibles al final.</p>
            </div>
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300">
              {state.achievementsUnlocked.length}/{Object.keys(ACHIEVEMENTS).length}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
              {state.achievementsUnlocked.length === 0 ? (
              <p className="text-sm text-gray-500">Aún no hay logros desbloqueados.</p>
            ) : (
              state.achievementsUnlocked.map((id, index) => {
                const achievement = ACHIEVEMENTS[id];
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.75 + index * 0.05 }}
                    className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-4 flex items-start gap-3"
                  >
                    <div className="text-2xl">{achievement.icon}</div>
                    <div>
                      <p className="font-bold text-white text-sm">{achievement.title}</p>
                      <p className="text-xs text-amber-100/80 mt-1">{achievement.description}</p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
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
