import React, { createContext, useContext, useState, ReactNode } from "react";

export type GameScreen =
  | "welcome"
  | "loading"
  | "lobby"
  | "intro"
  | "text"
  | "room"
  | "challenge"
  | "victory"
  | "document";

export type VisualTheme = "dark-lux" | "light-lux" | "editorial";

export type RoomStatus = "locked" | "active" | "completed";

export interface GameState {
  currentScreen: GameScreen;
  playerId: string;
  currentRoom: number;
  roomStatuses: RoomStatus[];
  keysCollected: string[];
  essayAnswers: Record<number, string>;
  hintsUsedByRoom: Record<number, boolean>;
  totalPenaltySeconds: number;
  teamName: string;
  teamMembers: string;
  teamAvatar: string;
  roomCode: string;
  roomRole: "host" | "guest" | null;
  musicEnabled: boolean | null;
  visualTheme: VisualTheme;
  startTime: number | null;
  endTime: number | null;
}

interface GameContextValue {
  state: GameState;
  setTeamInfo: (name: string, members: string, avatar: string) => void;
  setRoomSession: (roomCode: string, role: "host" | "guest" | null) => void;
  setMusicPreference: (enabled: boolean) => void;
  setVisualTheme: (theme: VisualTheme) => void;
  useHint: (roomId: number, penaltySeconds?: number) => void;
  goToWelcome: () => void;
  goToLoading: () => void;
  goToLobby: () => void;
  goToIntro: () => void;
  startGame: () => void;
  goToText: () => void;
  goToRoom: (roomId: number) => void;
  goToChallenge: (roomId: number) => void;
  completeRoom: (roomId: number, key: string) => void;
  setEssayAnswer: (roomId: number, answer: string) => void;
  goToVictory: () => void;
  goToDocument: () => void;
  resetGame: () => void;
}

function createPlayerId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `p-${Math.random().toString(36).slice(2, 10)}`;
}

const initialState: GameState = {
  currentScreen: "welcome",
  playerId: createPlayerId(),
  currentRoom: 1,
  roomStatuses: ["active", "locked", "locked", "locked"],
  keysCollected: [],
  essayAnswers: {},
  hintsUsedByRoom: {},
  totalPenaltySeconds: 0,
  teamName: "",
  teamMembers: "",
  teamAvatar: "🦉",
  roomCode: "",
  roomRole: null,
  musicEnabled: null,
  visualTheme: "dark-lux",
  startTime: null,
  endTime: null,
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(initialState);

  const setTeamInfo = (name: string, members: string, avatar: string) => {
    setState((prev) => ({ ...prev, teamName: name, teamMembers: members, teamAvatar: avatar }));
  };

  const setRoomSession = (roomCode: string, role: "host" | "guest" | null) => {
    setState((prev) => ({ ...prev, roomCode, roomRole: role }));
  };

  const setMusicPreference = (enabled: boolean) => {
    setState((prev) => ({ ...prev, musicEnabled: enabled }));
  };

  const setVisualTheme = (theme: VisualTheme) => {
    setState((prev) => ({ ...prev, visualTheme: theme }));
    localStorage.setItem('escape-room-theme', theme);
  };

  const useHint = (roomId: number, penaltySeconds = 30) => {
    setState((prev) => {
      if (prev.hintsUsedByRoom[roomId]) return prev;
      return {
        ...prev,
        hintsUsedByRoom: { ...prev.hintsUsedByRoom, [roomId]: true },
        totalPenaltySeconds: prev.totalPenaltySeconds + penaltySeconds,
      };
    });
  };

  const goToWelcome = () => {
    setState((prev) => ({ ...prev, currentScreen: "welcome" }));
  };

  const goToLoading = () => {
    setState((prev) => ({ ...prev, currentScreen: "loading" }));
  };

  const goToLobby = () => {
    setState((prev) => ({ ...prev, currentScreen: "lobby" }));
  };

  const goToIntro = () => {
    setState((prev) => ({ ...prev, currentScreen: "intro" }));
  };

  const startGame = () => {
    setState((prev) => ({
      ...prev,
      currentScreen: "text",
      startTime: Date.now(),
    }));
  };

  const goToText = () => {
    setState((prev) => ({ ...prev, currentScreen: "text" }));
  };

  const goToRoom = (roomId: number) => {
    setState((prev) => ({
      ...prev,
      currentScreen: "room",
      currentRoom: roomId,
    }));
  };

  const goToChallenge = (roomId: number) => {
    setState((prev) => ({
      ...prev,
      currentScreen: "challenge",
      currentRoom: roomId,
    }));
  };

  const completeRoom = (roomId: number, key: string) => {
    setState((prev) => {
      const newStatuses = [...prev.roomStatuses] as RoomStatus[];
      newStatuses[roomId - 1] = "completed";
      if (roomId < 4) {
        newStatuses[roomId] = "active";
      }
      return {
        ...prev,
        roomStatuses: newStatuses,
        keysCollected: [...prev.keysCollected, key],
      };
    });
  };

  const setEssayAnswer = (roomId: number, answer: string) => {
    setState((prev) => ({
      ...prev,
      essayAnswers: { ...prev.essayAnswers, [roomId]: answer },
    }));
  };

  const goToVictory = () => {
    setState((prev) => ({
      ...prev,
      currentScreen: "victory",
      endTime: Date.now(),
    }));
  };

  const goToDocument = () => {
    setState((prev) => ({ ...prev, currentScreen: "document" }));
  };

  const resetGame = () => {
    setState(initialState);
  };

  return (
    <GameContext.Provider
      value={{
        state,
        setTeamInfo,
        setRoomSession,
        setMusicPreference,
        setVisualTheme,
        useHint,
        goToWelcome,
        goToLoading,
        goToLobby,
        goToIntro,
        startGame,
        goToText,
        goToRoom,
        goToChallenge,
        completeRoom,
        setEssayAnswer,
        goToVictory,
        goToDocument,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
