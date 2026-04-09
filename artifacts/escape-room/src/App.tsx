import { useEffect, useRef, useState } from "react";
import { GameProvider, useGame } from "@/context/GameContext";
import WelcomeScreen from "@/pages/WelcomeScreen";
import MagicLoadingScreen from "@/pages/MagicLoadingScreen";
import LobbyScreen from "@/pages/LobbyScreen";
import IntroScreen from "@/pages/IntroScreen";
import TextScreen from "@/pages/TextScreen";
import RoomScreen from "@/pages/RoomScreen";
import ChallengeScreen from "@/pages/ChallengeScreen";
import VictoryScreen from "@/pages/VictoryScreen";
import DocumentScreen from "@/pages/DocumentScreen";
import { connectLiveRoom, disconnectLiveRoom, publishPresence } from "@/lib/liveRoomSocket";

function PersistentAudioPlayer() {
  const { state } = useGame();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;

    if (state.musicEnabled) {
      void audioRef.current.play().catch(() => {
        // Ignore autoplay errors until user interacts again.
      });
      return;
    }

    audioRef.current.pause();
  }, [state.musicEnabled]);

  return (
    <audio ref={audioRef} loop preload="auto">
      <source src="/fondo.mp3" type="audio/mpeg" />
    </audio>
  );
}

function LivePresenceBridge() {
  const { state } = useGame();

  useEffect(() => {
    if (!state.roomCode) {
      disconnectLiveRoom();
      return;
    }

    connectLiveRoom(state.roomCode, state.playerId);

    const publish = () => {
      publishPresence({
        playerId: state.playerId,
        displayName: state.teamName || `Jugador-${state.playerId.slice(0, 4)}`,
        teamName: state.teamName || undefined,
        teamAvatar: state.teamAvatar,
        lobbyReady: state.lobbyReady,
        role: state.roomRole,
        currentScreen: state.currentScreen,
        currentRoom: state.currentRoom,
        keysCollectedCount: state.keysCollected.length,
      });
    };

    publish();
    const intervalId = window.setInterval(publish, 5000);

    const onBeforeUnload = () => {
      disconnectLiveRoom();
    };

    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [state.roomCode, state.playerId, state.teamName, state.teamAvatar, state.lobbyReady, state.roomRole, state.currentScreen, state.currentRoom, state.keysCollected.length]);

  return null;
}

function VisualThemeBridge() {
  const { state, setVisualTheme } = useGame();

  // Auto-detect theme from system preference on first render
  useEffect(() => {
    const savedTheme = localStorage.getItem('escape-room-theme');
    if (savedTheme === 'dark-lux' || savedTheme === 'light-lux' || savedTheme === 'editorial') {
      setVisualTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const detectedTheme = prefersDark ? "dark-lux" : "light-lux";
      setVisualTheme(detectedTheme);
    }
  }, []); // Run only once on mount

  // Apply theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute("data-lux-theme", state.visualTheme);
  }, [state.visualTheme]);

  return null;
}

function ConnectionIndicator() {
  const { state } = useGame();
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    if (!state.roomCode) return;

    const checkConnection = () => {
      setIsConnected(navigator.onLine);
    };

    window.addEventListener('online', () => setIsConnected(true));
    window.addEventListener('offline', () => setIsConnected(false));

    return () => {
      window.removeEventListener('online', () => setIsConnected(true));
      window.removeEventListener('offline', () => setIsConnected(false));
    };
  }, [state.roomCode]);

  if (!state.roomCode) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-full border border-white/20">
      <div className={`w-2 h-2 rounded-full ${
        isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
      }`} />
      <p className="text-xs text-gray-300">{isConnected ? 'Conectado' : 'Desconectado'}</p>
    </div>
  );
}

function AppLayout() {
  return (
    <>
      <VisualThemeBridge />
      <LivePresenceBridge />
      <PersistentAudioPlayer />
      <ConnectionIndicator />
      <GameRouter />
    </>
  );
}

function GameRouter() {
  const { state } = useGame();

  switch (state.currentScreen) {
    case "welcome":
      return <WelcomeScreen />;
    case "loading":
      return <MagicLoadingScreen />;
    case "lobby":
      return <LobbyScreen />;
    case "intro":
      return <IntroScreen />;
    case "text":
      return <TextScreen />;
    case "room":
      return <RoomScreen />;
    case "challenge":
      return <ChallengeScreen />;
    case "victory":
      return <VictoryScreen />;
    case "document":
      return <DocumentScreen />;
    default:
      return <WelcomeScreen />;
  }
}

function App() {
  return (
    <GameProvider>
      <VisualThemeBridge />
      <PersistentAudioPlayer />
      <LivePresenceBridge />
      <GameRouter />
    </GameProvider>
  );
}

export default App;
