import type { GameState } from "@/context/GameContext";

export type AchievementId =
  | "all-keys"
  | "no-hints"
  | "speedrunner"
  | "essay-master"
  | "perfect-finish";

export type AchievementDefinition = {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
};

export const ACHIEVEMENTS: Record<AchievementId, AchievementDefinition> = {
  "all-keys": {
    id: "all-keys",
    title: "Guardián completo",
    description: "Terminaste el escape room y reuniste las 4 claves.",
    icon: "🏅",
  },
  "no-hints": {
    id: "no-hints",
    title: "Lector autodidacta",
    description: "Completaste la partida sin usar pistas.",
    icon: "🧠",
  },
  speedrunner: {
    id: "speedrunner",
    title: "Velocidad de biblioteca",
    description: "Terminaste en menos de 15 minutos.",
    icon: "⚡",
  },
  "essay-master": {
    id: "essay-master",
    title: "Pluma crítica",
    description: "Respondiste con profundidad en los retos de escritura.",
    icon: "✍️",
  },
  "perfect-finish": {
    id: "perfect-finish",
    title: "Final perfecto",
    description: "Ganaste con lectura precisa, sin pistas y con gran ritmo.",
    icon: "🌟",
  },
};

function countWords(text?: string) {
  return (text || "").trim().split(/\s+/).filter(Boolean).length;
}

export function evaluateAchievements(state: GameState): AchievementId[] {
  const unlocked: AchievementId[] = [];
  const completedRooms = state.roomStatuses.filter((status) => status === "completed").length;
  const usedAnyHint = Object.values(state.hintsUsedByRoom).some(Boolean);
  const elapsedSeconds = state.startTime && state.endTime
    ? Math.floor((state.endTime - state.startTime) / 1000)
    : 0;
  const essay3Words = countWords(state.essayAnswers[3]);
  const essay4Words = countWords(state.essayAnswers[4]);

  if (completedRooms >= 4) unlocked.push("all-keys");
  if (!usedAnyHint && completedRooms >= 4) unlocked.push("no-hints");
  if (elapsedSeconds > 0 && elapsedSeconds <= 15 * 60) unlocked.push("speedrunner");
  if (essay3Words >= 30 && essay4Words >= 50) unlocked.push("essay-master");
  if (unlocked.includes("all-keys") && unlocked.includes("no-hints") && unlocked.includes("speedrunner")) {
    unlocked.push("perfect-finish");
  }

  return unlocked;
}
