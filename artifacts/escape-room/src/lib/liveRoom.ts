export interface LivePlayer {
  playerId: string;
  displayName: string;
  teamName?: string;
  teamAvatar?: string;
  lobbyReady?: boolean;
  role: "host" | "guest" | null;
  currentScreen: string;
  currentRoom: number;
  keysCollectedCount: number;
  lastSeen: number;
}

export interface LiveChatMessage {
  id: string;
  roomCode: string;
  playerId: string;
  displayName: string;
  teamAvatar?: string;
  text: string;
  createdAt: number;
}

export interface RankingEntry {
  playerId: string;
  teamName: string;
  teamAvatar?: string;
  role: "host" | "guest" | null;
  finishedAt: number;
  baseSeconds: number;
  penaltySeconds: number;
  totalSeconds: number;
}

const PRESENCE_TTL_MS = 15000;

function roomPlayersKey(roomCode: string) {
  return `escape-room:presence:${roomCode}`;
}

function roomRankingKey(roomCode: string) {
  return `escape-room:ranking:${roomCode}`;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function pruneInactive(players: LivePlayer[]) {
  const now = Date.now();
  return players.filter((p) => now - p.lastSeen <= PRESENCE_TTL_MS);
}

export function getLivePlayers(roomCode: string): LivePlayer[] {
  if (!roomCode) return [];
  const key = roomPlayersKey(roomCode);
  const players = readJson<LivePlayer[]>(key, []);
  const active = pruneInactive(players);
  if (active.length !== players.length) {
    writeJson(key, active);
  }
  return active.sort((a, b) => b.lastSeen - a.lastSeen);
}

export function upsertLivePlayer(roomCode: string, player: LivePlayer) {
  if (!roomCode) return;
  const key = roomPlayersKey(roomCode);
  const players = pruneInactive(readJson<LivePlayer[]>(key, []));
  const next = [...players.filter((p) => p.playerId !== player.playerId), player];
  writeJson(key, next);
}

export function removeLivePlayer(roomCode: string, playerId: string) {
  if (!roomCode || !playerId) return;
  const key = roomPlayersKey(roomCode);
  const players = readJson<LivePlayer[]>(key, []);
  writeJson(
    key,
    players.filter((p) => p.playerId !== playerId),
  );
}

export function getRoomRanking(roomCode: string): RankingEntry[] {
  if (!roomCode) return [];
  const entries = readJson<RankingEntry[]>(roomRankingKey(roomCode), []);
  return entries.sort((a, b) => a.totalSeconds - b.totalSeconds);
}

export function upsertRoomRanking(roomCode: string, entry: RankingEntry) {
  if (!roomCode) return;
  const key = roomRankingKey(roomCode);
  const entries = readJson<RankingEntry[]>(key, []);
  const current = entries.find((e) => e.playerId === entry.playerId);

  let next = entries;
  if (!current) {
    next = [...entries, entry];
  } else if (entry.totalSeconds < current.totalSeconds) {
    next = [...entries.filter((e) => e.playerId !== entry.playerId), entry];
  }

  writeJson(
    key,
    next.sort((a, b) => a.totalSeconds - b.totalSeconds),
  );
}

export function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
