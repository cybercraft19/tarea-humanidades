import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { type LiveChatMessage, type LivePlayer } from "@/lib/liveRoom";
import { requestSessionStart, sendLiveChatMessage, subscribeLiveChat, subscribeLivePlayers, subscribeSessionStart } from "@/lib/liveRoomSocket";
import PlayerAvatar from "@/components/PlayerAvatar";
import ManualAvatarBuilder from "@/components/ManualAvatarBuilder";
import {
  createCartoonAvatar,
  createDefaultManualAvatarProfile,
  createAvatarFromFile,
  createManualAvatar,
  DEFAULT_TEAM_AVATAR,
} from "@/lib/avatarUtils";

type LobbyMode = "create" | "join";
type LobbySection = "profile" | "room" | "team";
type AvatarProfileMode = "builder" | "quick";
const ROOM_CODE_LENGTH = 6;

function generateRoomCode() {
  return Math.random().toString(36).slice(2, 2 + ROOM_CODE_LENGTH).toUpperCase();
}

export default function LobbyScreen() {
  const { state, setTeamInfo, setLobbyReady, setRoomSession, goToIntro } = useGame();
  const isSoftTheme = state.visualTheme !== "dark-lux";
  const [lobbyMode, setLobbyMode] = useState<LobbyMode>("create");
  const [activeSection, setActiveSection] = useState<LobbySection>("profile");
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(true);
  const [createdRoomCode, setCreatedRoomCode] = useState(state.roomRole === "host" ? state.roomCode : "");
  const [joinCode, setJoinCode] = useState(state.roomRole === "guest" ? state.roomCode : "");
  const [profileName, setProfileName] = useState(state.teamName);
  const [profileAvatar, setProfileAvatar] = useState(state.teamAvatar || DEFAULT_TEAM_AVATAR);
  const [manualAvatar, setManualAvatar] = useState(createDefaultManualAvatarProfile(state.teamName || ""));
  const [avatarProfileMode, setAvatarProfileMode] = useState<AvatarProfileMode>("quick");
  const [isAvatarBuilderOpen, setIsAvatarBuilderOpen] = useState(false);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [activeRoomCode, setActiveRoomCode] = useState(state.roomCode);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [connectedPlayers, setConnectedPlayers] = useState<LivePlayer[]>([]);
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);
  const [pendingStartAt, setPendingStartAt] = useState<number | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([]);
  const hasAutoStartedRef = useRef(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const sessionRoleLabel = state.roomRole === "host"
    ? "Anfitrión"
    : state.roomRole === "guest"
      ? "Invitado"
      : "Sin sesión";

  const playersInLobby = connectedPlayers.filter((p) => p.currentScreen === "lobby" || p.currentScreen === "intro");
  const allPlayersReady = playersInLobby.length > 0 && playersInLobby.every((p) => Boolean(p.lobbyReady));
  const hostCanContinue = state.roomRole === "host" ? allPlayersReady : true;
  const readyPlayersCount = playersInLobby.filter((p) => Boolean(p.lobbyReady)).length;
  const canOpenTeamSection = Boolean(activeRoomCode);
  const sectionOrder: LobbySection[] = ["profile", "room", "team"];
  const currentSectionIndex = sectionOrder.indexOf(activeSection);
  const progressPercent = ((currentSectionIndex + 1) / sectionOrder.length) * 100;
  const profileCompleted = Boolean(state.teamName.trim());
  const roomCompleted = Boolean(activeRoomCode);
  const teamCompleted = allPlayersReady;
  const sectionMeta: Array<{ key: LobbySection; title: string; completed: boolean; enabled: boolean }> = [
    { key: "profile", title: "Perfil", completed: profileCompleted, enabled: true },
    { key: "room", title: "Sala", completed: roomCompleted, enabled: true },
    { key: "team", title: "Equipo", completed: teamCompleted, enabled: canOpenTeamSection },
  ];

  useEffect(() => {
    const roomFromUrl = new URLSearchParams(window.location.search).get("sala");
    if (!roomFromUrl) return;

    const normalized = roomFromUrl.trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(normalized)) return;

    setLobbyMode("join");
    setActiveSection("room");
    setJoinCode(normalized);
    setActiveRoomCode(normalized);
    setRoomSession(normalized, "guest");
    setFeedback("Te uniste a la sala desde el enlace.");
  }, [setRoomSession]);

  useEffect(() => {
    if (!activeRoomCode) {
      setConnectedPlayers([]);
      return;
    }

    return subscribeLivePlayers((players) => {
      setConnectedPlayers(players);
    });
  }, [activeRoomCode]);

  useEffect(() => {
    if (!activeRoomCode) {
      setChatMessages([]);
      return;
    }

    return subscribeLiveChat((messages) => {
      setChatMessages(messages);
    });
  }, [activeRoomCode]);

  useEffect(() => {
    if (!chatScrollRef.current) return;
    chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [chatMessages]);

  useEffect(() => {
    if (!activeRoomCode) return;

    return subscribeSessionStart(({ startAt }) => {
      setPendingStartAt(startAt);
      setFeedback("Inicio sincronizado activado.");
      setError("");
    });
  }, [activeRoomCode]);

  useEffect(() => {
    if (!pendingStartAt) {
      setCountdownSeconds(null);
      hasAutoStartedRef.current = false;
      return;
    }

    const tick = () => {
      const remainingMs = pendingStartAt - Date.now();
      if (remainingMs <= 0) {
        setCountdownSeconds(0);
        if (!hasAutoStartedRef.current) {
          hasAutoStartedRef.current = true;
          goToIntro();
        }
        return;
      }
      setCountdownSeconds(Math.ceil(remainingMs / 1000));
    };

    tick();
    const intervalId = window.setInterval(tick, 200);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [pendingStartAt, goToIntro]);

  const inviteLink = useMemo(() => {
    if (!createdRoomCode) return "";
    const url = new URL(window.location.href);
    url.searchParams.set("sala", createdRoomCode);
    return url.toString();
  }, [createdRoomCode]);

  const handleCreateRoom = () => {
    const newCode = generateRoomCode();
    setLobbyMode("create");
    setCreatedRoomCode(newCode);
    setActiveRoomCode(newCode);
    setLobbyReady(false);
    setRoomSession(newCode, "host");
    if (autoAdvanceEnabled) setActiveSection("team");
    setError("");
    setFeedback("Sala creada. Comparte el código o el enlace.");
  };

  const handleJoinRoom = () => {
    const normalized = joinCode.trim().toUpperCase();
    if (!normalized) {
      setError("Escribe el código de la sala.");
      return;
    }
    if (!/^[A-Z0-9]{6}$/.test(normalized)) {
      setError("El código debe tener 6 caracteres (letras o números).");
      return;
    }

    setLobbyMode("join");
    setActiveRoomCode(normalized);
    setLobbyReady(false);
    setRoomSession(normalized, "guest");
    if (autoAdvanceEnabled) setActiveSection("team");
    setError("");
    setFeedback("Sesión unida. Ya puedes continuar.");
  };

  const copyRoomCode = async () => {
    if (!createdRoomCode) return;
    try {
      await navigator.clipboard.writeText(createdRoomCode);
      setFeedback("Código copiado.");
    } catch {
      setFeedback("No se pudo copiar automáticamente.");
    }
  };

  const copyInviteLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setFeedback("Enlace copiado.");
    } catch {
      setFeedback("No se pudo copiar automáticamente.");
    }
  };

  const shareInvite = async () => {
    if (!inviteLink || !navigator.share) {
      setFeedback("Compartir no está disponible. Usa Copiar enlace.");
      return;
    }
    try {
      await navigator.share({
        title: "Invitación a sala Escape Room",
        text: `Únete a mi sala con el código ${createdRoomCode}`,
        url: inviteLink,
      });
      setFeedback("Invitación enviada.");
    } catch {
      setFeedback("No se completó el envío.");
    }
  };

  const saveProfile = () => {
    const normalizedName = profileName.trim();
    if (!normalizedName) {
      setError("Escribe tu nombre para que te identifiquen en la sala.");
      return;
    }

    setTeamInfo(normalizedName, state.teamMembers, profileAvatar);
    if (autoAdvanceEnabled) setActiveSection("room");
    setError("");
    setFeedback("Perfil guardado. Tu nombre y avatar ya se comparten en tiempo real.");
  };

  const triggerSynchronizedStart = () => {
    if (state.roomRole !== "host") return;
    if (!hostCanContinue) {
      setError("Aún faltan jugadores por marcar listo.");
      return;
    }

    requestSessionStart(4000);
    setFeedback("Cuenta regresiva iniciada para todos.");
    setError("");
  };

  const handleSendChat = () => {
    const text = chatInput.trim();
    if (!text || !activeRoomCode) return;
    sendLiveChatMessage(text);
    setChatInput("");
  };

  const formatChatTime = (ts: number) => {
    try {
      return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "--:--";
    }
  };

  const handleAvatarFile = async (file?: File | null) => {
    if (!file) return;

    setIsAvatarLoading(true);
    try {
      const nextAvatar = await createAvatarFromFile(file);
      setProfileAvatar(nextAvatar);
      setError("");
    } catch {
      setError("No pudimos procesar la foto. Prueba con otra imagen.");
    } finally {
      setIsAvatarLoading(false);
    }
  };

  const applyManualAvatar = () => {
    setProfileAvatar(createManualAvatar(manualAvatar));
  };

  const applyManualAvatarAndClose = () => {
    applyManualAvatar();
    setIsAvatarBuilderOpen(false);
    setFeedback("Avatar manual aplicado.");
  };

  const applyRandomAvatar = () => {
    setProfileAvatar(
      createCartoonAvatar({
        style: "avataaars",
        seed: `${profileName.trim() || "jugador"}-${Date.now().toString(36)}`,
      }),
    );
    setFeedback("Avatar aleatorio aplicado.");
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${isSoftTheme ? "text-slate-900" : "text-white"} px-4 py-8 flex items-center justify-center`}>
      <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover opacity-16 saturate-[0.8]">
        <source src="/intro.mp4" type="video/mp4" />
      </video>
      <div className={`absolute inset-0 ${isSoftTheme ? "bg-white/42" : "bg-black/48"}`} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className={`relative z-10 w-full max-w-3xl rounded-[1.75rem] border backdrop-blur-lg p-5 md:p-8 ${isSoftTheme ? "border-slate-400/30 bg-white/72" : "border-white/15 bg-black/55"}`}
      >
        <div className="text-center mb-6">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/85 font-semibold">Sala cooperativa</p>
          <h1 className="lux-heading text-4xl md:text-5xl mt-3">Lobby de equipo</h1>
          <p className="text-sm text-slate-300 mt-2">Configura perfil, sala y equipo.</p>
        </div>

        <div className="mb-5 rounded-2xl border border-white/15 bg-black/30 p-3 md:p-4">
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-amber-400"
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wider text-slate-300">Autoavance de pasos</p>
            <button
              type="button"
              onClick={() => setAutoAdvanceEnabled((prev) => !prev)}
              className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                autoAdvanceEnabled
                  ? "bg-emerald-500/20 border border-emerald-400/60 text-emerald-300"
                  : "bg-white/10 border border-white/20 text-slate-300"
              }`}
            >
              {autoAdvanceEnabled ? "Activo" : "Manual"}
            </button>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {sectionMeta.map((section, index) => (
              <button
                key={section.key}
                onClick={() => section.enabled && setActiveSection(section.key)}
                disabled={!section.enabled}
                className={`rounded-xl px-2 py-2 text-xs md:text-sm font-bold transition-colors ${
                  activeSection === section.key
                    ? "bg-amber-400 text-black"
                    : "bg-white/10 border border-white/20 hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-current text-[10px]">
                    {section.completed ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  {section.title}
                </span>
                <span className={`mt-1 block text-[10px] uppercase tracking-wider ${section.completed ? "text-emerald-300" : "text-slate-400"}`}>
                  {section.completed ? "Completado" : "Pendiente"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs md:text-sm text-cyan-50">Estado: {activeRoomCode ? `Sala ${activeRoomCode}` : "Sin sala activa"}</span>
          <span className="rounded-full border border-cyan-200/40 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-100">Rol: {sessionRoleLabel}</span>
        </div>

        {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
        {feedback && <p className="mt-2 text-sm text-cyan-200">{feedback}</p>}

        <AnimatePresence mode="wait">
          {activeSection === "profile" && (
            <motion.div
              key="section-profile"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="mb-5 rounded-2xl border border-white/15 bg-black/30 p-4 md:p-5 space-y-3"
            >
              <p className="text-xs uppercase tracking-widest text-slate-400">Tu perfil en la sala</p>
              <div>
                <label className="text-xs text-slate-300 block mb-1.5">Nombre visible</label>
                <input
                  type="text"
                  value={profileName}
                  maxLength={24}
                  onChange={(e) => {
                    setProfileName(e.target.value);
                    setError("");
                  }}
                  placeholder="Ej: MairaYohanaPro777"
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-slate-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1.5">Avatar</label>
                <div className="mb-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarProfileMode("builder");
                      setIsAvatarBuilderOpen(true);
                    }}
                    className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                      isAvatarBuilderOpen || avatarProfileMode === "builder"
                        ? "bg-cyan-400 text-black"
                        : "bg-white/10 border border-white/20 text-white hover:bg-white/15"
                    }`}
                  >
                    Crear avatar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarProfileMode("quick");
                      setIsAvatarBuilderOpen(false);
                    }}
                    className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                      avatarProfileMode === "quick"
                        ? "bg-amber-400 text-black"
                        : "bg-white/10 border border-white/20 text-white hover:bg-white/15"
                    }`}
                  >
                    Rapido o foto
                  </button>
                </div>

                <div className="mb-3 flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 p-3">
                  <PlayerAvatar
                    avatar={profileAvatar}
                    alt="Avatar de perfil"
                    className="h-14 w-14"
                    emojiClassName="text-2xl"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-slate-300">
                      {avatarProfileMode === "builder"
                        ? "Seccion crear avatar: ajusta rasgos para que se parezca a ti."
                        : "Modo rapido: avatar al azar o foto de tu preferencia."}
                    </p>
                  </div>
                </div>

                {avatarProfileMode === "quick" && (
                  <div className="mt-3 rounded-xl border border-white/15 bg-black/20 p-3 space-y-2">
                    <p className="text-[11px] uppercase tracking-widest text-slate-300">Modo rapido</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={applyRandomAvatar}
                        className="rounded-lg border border-cyan-300/35 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-bold text-cyan-100"
                      >
                        Poner avatar al azar
                      </button>
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white"
                      >
                        Subir foto
                      </button>
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="rounded-lg border border-amber-300/35 bg-amber-300/10 px-3 py-1.5 text-[11px] font-bold text-amber-300"
                      >
                        Usar camara
                      </button>
                    </div>
                  </div>
                )}

                {isAvatarBuilderOpen && (
                  <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm p-4 md:p-8">
                    <div className="mx-auto h-full w-full max-w-5xl rounded-2xl border border-white/15 bg-slate-950/95 p-4 md:p-6 overflow-y-auto">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-widest text-cyan-300">Creador de avatar</p>
                          <h3 className="text-xl md:text-2xl font-black text-white">Editor en pantalla completa</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAvatarBuilderOpen(false);
                            setAvatarProfileMode("quick");
                          }}
                          className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/15"
                        >
                          Volver
                        </button>
                      </div>

                      <div className="rounded-xl border border-white/15 bg-white/5 p-3 flex items-center gap-3 mb-3">
                        <PlayerAvatar
                          avatar={profileAvatar}
                          alt="Vista previa avatar"
                          className="h-16 w-16"
                          emojiClassName="text-3xl"
                        />
                        <p className="text-xs text-slate-300">
                          Ajusta rasgos, aplica y vuelve al perfil cuando te quede parecido a ti.
                        </p>
                      </div>

                      <ManualAvatarBuilder
                        profile={manualAvatar}
                        onProfileChange={setManualAvatar}
                        onApply={applyManualAvatar}
                      />

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={applyManualAvatarAndClose}
                          className="rounded-lg bg-cyan-400 text-black px-4 py-2 text-xs md:text-sm font-extrabold transition-colors hover:bg-cyan-300"
                        >
                          Aplicar y volver al perfil
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAvatarBuilderOpen(false);
                            setAvatarProfileMode("quick");
                          }}
                          className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-xs md:text-sm font-bold text-white hover:bg-white/15"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    void handleAvatarFile(file);
                    e.target.value = "";
                  }}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    void handleAvatarFile(file);
                    e.target.value = "";
                  }}
                />
                {isAvatarLoading && <p className="mb-2 text-[11px] text-amber-300">Procesando imagen...</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveProfile}
                  className="rounded-lg bg-amber-400 text-black px-4 py-2 text-xs md:text-sm font-extrabold transition-colors hover:bg-amber-300"
                >
                  Guardar perfil
                </button>
                <button
                  onClick={() => setActiveSection("room")}
                  className="rounded-lg bg-white/10 border border-white/20 px-4 py-2 text-xs md:text-sm font-bold transition-colors hover:bg-white/15"
                >
                  Ir a sala
                </button>
              </div>
            </motion.div>
          )}

          {activeSection === "room" && (
            <motion.div
              key="section-room"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setLobbyMode("create")}
                  className={`rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                    lobbyMode === "create" ? "bg-amber-400 text-black" : "bg-white/10 border border-white/20 hover:bg-white/15"
                  }`}
                >
                  Crear sala
                </button>
                <button
                  onClick={() => setLobbyMode("join")}
                  className={`rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                    lobbyMode === "join" ? "bg-amber-400 text-black" : "bg-white/10 border border-white/20 hover:bg-white/15"
                  }`}
                >
                  Unirse con código
                </button>
              </div>

              {lobbyMode === "create" && (
                <div className="rounded-2xl border border-white/15 bg-black/30 p-4 md:p-5 space-y-3">
                  <button
                    onClick={handleCreateRoom}
                    className="rounded-xl bg-amber-400 text-black px-4 py-2.5 text-sm font-extrabold transition-colors hover:bg-amber-300"
                  >
                    Generar código de sala
                  </button>

                  {createdRoomCode && (
                    <>
                      <p className="text-sm text-slate-200">
                        Código: <span className="font-black tracking-[0.35em] text-cyan-200">{createdRoomCode}</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={copyRoomCode} className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-xs font-bold transition-colors hover:bg-white/15">Copiar código</button>
                        <button onClick={copyInviteLink} className="rounded-lg bg-amber-400 text-black px-3 py-2 text-xs font-bold transition-colors hover:bg-amber-300">Copiar enlace</button>
                        <button onClick={shareInvite} className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-xs font-bold transition-colors hover:bg-white/15">Compartir</button>
                      </div>
                      <input readOnly value={inviteLink} className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-slate-200" />
                    </>
                  )}
                </div>
              )}

              {lobbyMode === "join" && (
                <div className="rounded-2xl border border-white/15 bg-black/30 p-4 md:p-5 space-y-3">
                  <label className="text-xs text-slate-300 block">Ingresa el código de sala</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={joinCode}
                      maxLength={ROOM_CODE_LENGTH}
                      onChange={(e) => {
                        setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""));
                        setError("");
                      }}
                      placeholder="Ej: A1B2C3"
                      className="flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-slate-400"
                    />
                    <button onClick={handleJoinRoom} className="rounded-lg bg-amber-400 text-black px-4 py-2 text-sm font-extrabold transition-colors hover:bg-amber-300">Entrar</button>
                  </div>
                </div>
              )}

              {activeRoomCode && (
                <button
                  onClick={() => setActiveSection("team")}
                  className="rounded-lg bg-cyan-400 text-black px-4 py-2 text-xs md:text-sm font-extrabold transition-colors hover:bg-cyan-300"
                >
                  Continuar a equipo
                </button>
              )}
            </motion.div>
          )}

          {activeSection === "team" && (
            <motion.div
              key="section-team"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              {activeRoomCode && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setLobbyReady(!state.lobbyReady)}
                    className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                      state.lobbyReady
                        ? "bg-emerald-500/20 border border-emerald-400/60 text-emerald-300"
                        : "bg-white/10 border border-white/20 text-slate-200 hover:bg-white/15"
                    }`}
                  >
                    {state.lobbyReady ? "Estoy listo" : "Marcarme listo"}
                  </button>
                  <span className="text-xs text-slate-300">{readyPlayersCount}/{playersInLobby.length || 0} listos</span>
                  <span className="text-xs text-slate-300">
                    {allPlayersReady ? "Todos listos. El host puede iniciar sincronizado." : "Esperando confirmación de todos los jugadores..."}
                  </span>
                </div>
              )}

              {activeRoomCode && (
                <div className="rounded-2xl border border-white/15 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">Jugadores conectados</p>
                  {connectedPlayers.length === 0 ? (
                    <p className="text-xs text-slate-500">Aún no hay jugadores activos en esta sala.</p>
                  ) : (
                    <div className="space-y-2">
                      {connectedPlayers.map((player) => (
                        <div key={player.playerId} className={`grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded-lg px-3 py-2 ${isSoftTheme ? "bg-slate-900/5" : "bg-white/5"}`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <PlayerAvatar
                              avatar={player.teamAvatar || DEFAULT_TEAM_AVATAR}
                              alt={`Avatar de ${player.teamName || player.displayName}`}
                              className="h-8 w-8"
                              emojiClassName="text-base"
                            />
                            <div className="min-w-0">
                              <p className="text-sm text-white font-medium truncate">{player.teamName || player.displayName}</p>
                              <p className="text-[11px] text-slate-500">
                                {player.currentScreen === "lobby"
                                  ? "En lobby"
                                  : player.currentScreen === "intro"
                                    ? "En registro"
                                    : `Sala ${player.currentRoom} - ${player.keysCollectedCount}/4 claves`}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] uppercase tracking-wider text-slate-400">{player.playerId.slice(0, 6)}</span>
                          <div className="text-right">
                            <span className="block text-[10px] uppercase tracking-wider text-amber-400">{player.role ?? "jugador"}</span>
                            <span className={`block text-[10px] uppercase tracking-wider ${player.lobbyReady ? "text-emerald-400" : "text-slate-500"}`}>
                              {player.lobbyReady ? "listo" : "esperando"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeRoomCode && (
                <div className="rounded-2xl border border-white/15 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">Chat de sala</p>
                  <div ref={chatScrollRef} className="max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-black/25 p-3 space-y-2">
                    {chatMessages.length === 0 ? (
                      <p className="text-xs text-slate-500">Aún no hay mensajes.</p>
                    ) : (
                      chatMessages.map((msg) => (
                        <div key={msg.id} className="rounded-lg bg-white/5 px-3 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0 flex items-center gap-2">
                              <PlayerAvatar
                                avatar={msg.teamAvatar || DEFAULT_TEAM_AVATAR}
                                alt={`Avatar de ${msg.displayName}`}
                                className="h-6 w-6"
                                emojiClassName="text-xs"
                              />
                              <p className="text-xs text-amber-300 truncate">{msg.displayName}</p>
                            </div>
                            <span className="text-[10px] text-slate-500">{formatChatTime(msg.createdAt)}</span>
                          </div>
                          <p className="text-sm text-slate-200 mt-1 break-words">{msg.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      maxLength={280}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSendChat();
                        }
                      }}
                      placeholder="Escribe un mensaje rapido para tu equipo..."
                      className="flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-slate-400"
                    />
                    <button
                      onClick={handleSendChat}
                      disabled={!chatInput.trim()}
                      className="rounded-lg bg-cyan-400 text-black disabled:bg-slate-700 disabled:text-slate-400 px-4 py-2 text-sm font-extrabold transition-colors hover:bg-cyan-300"
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              )}

              {state.roomRole === "host" && activeRoomCode && !hostCanContinue && (
                <p className="text-xs text-amber-300">Como anfitrión, debes esperar a que todos marquen "listo" para continuar.</p>
              )}

              {countdownSeconds !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-center"
                >
                  <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-200">Cuenta regresiva sincronizada</p>
                  <p className="mt-1 text-2xl font-black text-emerald-300">{countdownSeconds}</p>
                </motion.div>
              )}

              {state.roomRole === "host" ? (
                <button
                  onClick={triggerSynchronizedStart}
                  disabled={!activeRoomCode || !hostCanContinue || countdownSeconds !== null}
                  className="w-full rounded-xl bg-amber-400 text-black disabled:bg-slate-700 disabled:text-slate-400 py-3 text-sm font-extrabold transition-colors hover:bg-amber-300"
                >
                  {countdownSeconds !== null ? "Iniciando partida para todos..." : "Iniciar partida sincronizada"}
                </button>
              ) : (
                <button disabled className="w-full rounded-xl bg-slate-700 text-slate-300 py-3 text-sm font-extrabold">
                  Esperando al anfitrión para iniciar...
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
