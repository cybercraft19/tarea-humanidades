import type { LivePlayer, RankingEntry } from "@/lib/liveRoom";

type RoomSnapshotMessage = {
  type: "snapshot";
  roomCode: string;
  players: LivePlayer[];
  ranking: RankingEntry[];
};

type RankingMessage = {
  type: "ranking";
  ranking: RankingEntry[];
};

type ErrorMessage = {
  type: "error";
  message: string;
};

type IncomingMessage = RoomSnapshotMessage | RankingMessage | ErrorMessage | { type: string };

type PresenceListener = (players: LivePlayer[]) => void;
type RankingListener = (ranking: RankingEntry[]) => void;

class LiveRoomSocketClient {
  private socket: WebSocket | null = null;
  private reconnectTimeout: number | null = null;
  private shouldReconnect = false;
  private roomCode = "";
  private playerId = "";
  private latestPresence: Omit<LivePlayer, "lastSeen"> | null = null;
  private players: LivePlayer[] = [];
  private ranking: RankingEntry[] = [];
  private presenceListeners = new Set<PresenceListener>();
  private rankingListeners = new Set<RankingListener>();

  connect(roomCode: string, playerId: string) {
    const normalizedRoom = roomCode.trim().toUpperCase();
    if (!normalizedRoom || !playerId) return;

    if (
      this.socket &&
      this.socket.readyState === WebSocket.OPEN &&
      this.roomCode === normalizedRoom &&
      this.playerId === playerId
    ) {
      return;
    }

    this.disconnect(false);

    this.roomCode = normalizedRoom;
    this.playerId = playerId;
    this.shouldReconnect = true;

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const fallbackUrl = `${protocol}://${window.location.hostname}:8787`;
    const baseUrl = (import.meta.env.VITE_LIVE_ROOM_WS_URL as string | undefined) || fallbackUrl;
    this.socket = new WebSocket(baseUrl);

    this.socket.onopen = () => {
      this.send({
        type: "join",
        roomCode: this.roomCode,
        player: {
          playerId: this.playerId,
          displayName: this.latestPresence?.displayName || `Jugador-${this.playerId.slice(0, 4)}`,
          role: this.latestPresence?.role || null,
          currentScreen: this.latestPresence?.currentScreen || "lobby",
          currentRoom: this.latestPresence?.currentRoom || 1,
          keysCollectedCount: this.latestPresence?.keysCollectedCount || 0,
        },
      });
    };

    this.socket.onmessage = (event) => {
      this.handleMessage(event.data);
    };

    this.socket.onclose = () => {
      this.socket = null;
      if (this.shouldReconnect) {
        this.reconnectTimeout = window.setTimeout(() => {
          this.connect(this.roomCode, this.playerId);
        }, 1500);
      }
    };

    this.socket.onerror = () => {
      // Keep silent and rely on reconnect loop.
    };
  }

  disconnect(sendLeave = true) {
    this.shouldReconnect = false;
    if (this.reconnectTimeout !== null) {
      window.clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket && this.socket.readyState === WebSocket.OPEN && sendLeave) {
      this.send({ type: "leave" });
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.players = [];
    this.ranking = [];
    this.notifyPlayers();
    this.notifyRanking();
  }

  publishPresence(player: Omit<LivePlayer, "lastSeen">) {
    this.latestPresence = player;
    this.send({ type: "heartbeat", player });
  }

  publishRanking(entry: RankingEntry) {
    this.send({ type: "ranking", entry });
  }

  subscribePresence(listener: PresenceListener) {
    this.presenceListeners.add(listener);
    listener(this.players);
    return () => this.presenceListeners.delete(listener);
  }

  subscribeRanking(listener: RankingListener) {
    this.rankingListeners.add(listener);
    listener(this.ranking);
    return () => this.rankingListeners.delete(listener);
  }

  getPlayers() {
    return this.players;
  }

  getRanking() {
    return this.ranking;
  }

  private notifyPlayers() {
    for (const listener of this.presenceListeners) {
      listener(this.players);
    }
  }

  private notifyRanking() {
    for (const listener of this.rankingListeners) {
      listener(this.ranking);
    }
  }

  private handleMessage(raw: unknown) {
    let parsed: IncomingMessage;
    try {
      parsed = JSON.parse(String(raw)) as IncomingMessage;
    } catch {
      return;
    }

    if (parsed.type === "snapshot") {
      this.players = parsed.players || [];
      this.ranking = parsed.ranking || [];
      this.notifyPlayers();
      this.notifyRanking();
      return;
    }

    if (parsed.type === "ranking") {
      this.ranking = parsed.ranking || [];
      this.notifyRanking();
      return;
    }

    if (parsed.type === "error") {
      console.warn("[live-room]", parsed.message);
    }
  }

  private send(payload: Record<string, unknown>) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify(payload));
  }
}

const client = new LiveRoomSocketClient();

export function connectLiveRoom(roomCode: string, playerId: string) {
  client.connect(roomCode, playerId);
}

export function disconnectLiveRoom() {
  client.disconnect();
}

export function publishPresence(player: Omit<LivePlayer, "lastSeen">) {
  client.publishPresence(player);
}

export function publishRanking(entry: RankingEntry) {
  client.publishRanking(entry);
}

export function subscribeLivePlayers(listener: PresenceListener) {
  return client.subscribePresence(listener);
}

export function subscribeRoomRanking(listener: RankingListener) {
  return client.subscribeRanking(listener);
}

export function getLivePlayersSnapshot() {
  return client.getPlayers();
}

export function getRoomRankingSnapshot() {
  return client.getRanking();
}
