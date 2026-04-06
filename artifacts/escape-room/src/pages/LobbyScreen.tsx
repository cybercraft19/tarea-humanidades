import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { type LivePlayer } from "@/lib/liveRoom";
import { subscribeLivePlayers } from "@/lib/liveRoomSocket";

type LobbyMode = "create" | "join";
const ROOM_CODE_LENGTH = 6;

function generateRoomCode() {
  return Math.random().toString(36).slice(2, 2 + ROOM_CODE_LENGTH).toUpperCase();
}

export default function LobbyScreen() {
  const { state, setRoomSession, goToIntro } = useGame();
  const isSoftTheme = state.visualTheme !== "dark-lux";
  const [lobbyMode, setLobbyMode] = useState<LobbyMode>("create");
  const [createdRoomCode, setCreatedRoomCode] = useState(state.roomRole === "host" ? state.roomCode : "");
  const [joinCode, setJoinCode] = useState(state.roomRole === "guest" ? state.roomCode : "");
  const [activeRoomCode, setActiveRoomCode] = useState(state.roomCode);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [connectedPlayers, setConnectedPlayers] = useState<LivePlayer[]>([]);

  const sessionRoleLabel = state.roomRole === "host"
    ? "Anfitrion"
    : state.roomRole === "guest"
      ? "Invitado"
      : "Sin sesion";

  useEffect(() => {
    const roomFromUrl = new URLSearchParams(window.location.search).get("sala");
    if (!roomFromUrl) return;

    const normalized = roomFromUrl.trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(normalized)) return;

    setLobbyMode("join");
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
    setRoomSession(newCode, "host");
    setError("");
    setFeedback("Sala creada. Comparte el codigo o el enlace.");
  };

  const handleJoinRoom = () => {
    const normalized = joinCode.trim().toUpperCase();
    if (!normalized) {
      setError("Escribe el codigo de la sala.");
      return;
    }
    if (!/^[A-Z0-9]{6}$/.test(normalized)) {
      setError("El codigo debe tener 6 caracteres (letras o numeros).");
      return;
    }

    setLobbyMode("join");
    setActiveRoomCode(normalized);
    setRoomSession(normalized, "guest");
    setError("");
    setFeedback("Sesion unida. Ya puedes continuar.");
  };

  const copyRoomCode = async () => {
    if (!createdRoomCode) return;
    try {
      await navigator.clipboard.writeText(createdRoomCode);
      setFeedback("Codigo copiado.");
    } catch {
      setFeedback("No se pudo copiar automaticamente.");
    }
  };

  const copyInviteLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setFeedback("Enlace copiado.");
    } catch {
      setFeedback("No se pudo copiar automaticamente.");
    }
  };

  const shareInvite = async () => {
    if (!inviteLink || !navigator.share) {
      setFeedback("Compartir no esta disponible. Usa Copiar enlace.");
      return;
    }
    try {
      await navigator.share({
        title: "Invitacion a sala Escape Room",
        text: `Unete a mi sala con el codigo ${createdRoomCode}`,
        url: inviteLink,
      });
      setFeedback("Invitacion enviada.");
    } catch {
      setFeedback("No se completo el envio.");
    }
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
          <h1 className="lux-heading text-4xl md:text-5xl mt-3">Crear sala o unirse</h1>
          <p className="text-sm text-slate-300 mt-2">Configura la sesion y continua al registro del equipo.</p>
        </div>

        <div className="mb-5 rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs md:text-sm text-cyan-50">Estado: {activeRoomCode ? `Sala ${activeRoomCode}` : "Sin sala activa"}</span>
          <span className="rounded-full border border-cyan-200/40 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-100">Rol: {sessionRoleLabel}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
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
            Unirse con codigo
          </button>
        </div>

        {lobbyMode === "create" && (
          <div className="rounded-2xl border border-white/15 bg-black/30 p-4 md:p-5 space-y-3">
            <button
              onClick={handleCreateRoom}
              className="rounded-xl bg-amber-400 text-black px-4 py-2.5 text-sm font-extrabold transition-colors hover:bg-amber-300"
            >
              Generar codigo de sala
            </button>

            {createdRoomCode && (
              <>
                <p className="text-sm text-slate-200">
                  Codigo: <span className="font-black tracking-[0.35em] text-cyan-200">{createdRoomCode}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={copyRoomCode} className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-xs font-bold transition-colors hover:bg-white/15">Copiar codigo</button>
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
            <label className="text-xs text-slate-300 block">Ingresa el codigo de sala</label>
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

        {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
        {feedback && <p className="mt-2 text-sm text-cyan-200">{feedback}</p>}

        {activeRoomCode && (
          <div className="mt-5 rounded-2xl border border-white/15 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-3">Jugadores conectados</p>
            {connectedPlayers.length === 0 ? (
              <p className="text-xs text-slate-500">Aun no hay jugadores activos en esta sala.</p>
            ) : (
              <div className="space-y-2">
                {connectedPlayers.map((player) => (
                  <div key={player.playerId} className={`flex items-center justify-between rounded-lg px-3 py-2 ${isSoftTheme ? "bg-slate-900/5" : "bg-white/5"}`}>
                    <div>
                      <p className="text-sm text-white font-medium">{player.displayName}</p>
                      <p className="text-[11px] text-slate-400">
                        {player.currentScreen === "lobby"
                          ? "En lobby"
                          : player.currentScreen === "intro"
                            ? "En registro"
                            : `Sala ${player.currentRoom} - ${player.keysCollectedCount}/4 claves`}
                      </p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-amber-400">{player.role ?? "jugador"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={goToIntro}
          disabled={!activeRoomCode}
          className="mt-6 w-full rounded-xl bg-amber-400 text-black disabled:bg-slate-700 disabled:text-slate-400 py-3 text-sm font-extrabold transition-colors hover:bg-amber-300"
        >
          Continuar al registro del equipo
        </button>
      </motion.div>
    </div>
  );
}
