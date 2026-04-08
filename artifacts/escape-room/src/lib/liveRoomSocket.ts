import type { LiveChatMessage, LivePlayer, RankingEntry } from "@/lib/liveRoom";

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

type ChatHistoryMessage = {
  type: "chat-history";
  messages: LiveChatMessage[];
};

type ChatMessage = {
  type: "chat";
  message: LiveChatMessage;
};

type SessionStartMessage = {
  type: "session-start";
  startAt: number;
  initiatedBy: string;
};

type ErrorMessage = {
  type: "error";
  message: string;
};

type IncomingMessage = RoomSnapshotMessage | RankingMessage | ChatHistoryMessage | ChatMessage | SessionStartMessage | ErrorMessage;

type PresenceListener = (players: LivePlayer[]) => void;
type RankingListener = (ranking: RankingEntry[]) => void;
type SessionStartListener = (payload: { startAt: number; initiatedBy: string }) => void;
type ChatListener = (messages: LiveChatMessage[]) => void;

class LiveRoomSocketClient {
  private socket: WebSocket | null = null;
  private reconnectTimeout: number | null = null;
  private shouldReconnect = false;
  private roomCode = "";
  private playerId = "";
  private latestPresence: Omit<LivePlayer, "lastSeen"> | null = null;
  private players: LivePlayer[] = [];
  private ranking: RankingEntry[] = [];
  private chatMessages: LiveChatMessage[] = [];
  private sessionStartListeners = new Set<SessionStartListener>();
  private chatListeners = new Set<ChatListener>();
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

  sendChat(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    this.send({ type: "chat", text: trimmed.slice(0, 280) });
  }

  requestSessionStart(startAt: number) {
    this.send({ type: "start-session", startAt });
  }

  subscribePresence(listener: PresenceListener) {
    this.presenceListeners.add(listener);
    listener(this.players);
    return () => {
      this.presenceListeners.delete(listener);
    };
  }

  subscribeRanking(listener: RankingListener) {
    this.rankingListeners.add(listener);
    listener(this.ranking);
    return () => {
      this.rankingListeners.delete(listener);
    };
  }

  subscribeSessionStart(listener: SessionStartListener) {
    this.sessionStartListeners.add(listener);
    return () => {
      this.sessionStartListeners.delete(listener);
    };
  }

  subscribeChat(listener: ChatListener) {
    this.chatListeners.add(listener);
    listener(this.chatMessages);
    return () => {
      this.chatListeners.delete(listener);
    };
  }

  getPlayers() {
    return this.players;
  }

  getRanking() {
    return this.ranking;
  }

  getChatMessages() {
    return this.chatMessages;
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

  private notifySessionStart(payload: { startAt: number; initiatedBy: string }) {
    for (const listener of this.sessionStartListeners) {
      listener(payload);
    }
  }

  private notifyChat() {
    for (const listener of this.chatListeners) {
      listener(this.chatMessages);
    }
  }

  private handleMessage(raw: unknown) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(String(raw));
    } catch {
      return;
    }

    if (!parsed || typeof parsed !== "object" || !("type" in parsed)) {
      return;
    }

    const message = parsed as IncomingMessage;

    if (message.type === "snapshot") {
      this.players = message.players || [];
      this.ranking = message.ranking || [];
      this.notifyPlayers();
      this.notifyRanking();
      return;
    }

    if (message.type === "ranking") {
      this.ranking = message.ranking || [];
      this.notifyRanking();
      return;
    }

    if (message.type === "chat-history") {
      this.chatMessages = message.messages || [];
      this.notifyChat();
      return;
    }

    if (message.type === "chat") {
      this.chatMessages = [...this.chatMessages, message.message].slice(-80);
      this.notifyChat();
      return;
    }

    if (message.type === "session-start") {
      this.notifySessionStart({ startAt: message.startAt, initiatedBy: message.initiatedBy });
      return;
    }

    if (message.type === "error") {
      console.warn("[live-room]", message.message);
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

export function sendLiveChatMessage(text: string) {
  client.sendChat(text);
}

export function requestSessionStart(startAt: number) {
  client.requestSessionStart(startAt);
}

export function subscribeLivePlayers(listener: PresenceListener) {
  return client.subscribePresence(listener);
}

export function subscribeRoomRanking(listener: RankingListener) {
  return client.subscribeRanking(listener);
}

export function subscribeSessionStart(listener: SessionStartListener) {
  return client.subscribeSessionStart(listener);
}

export function subscribeLiveChat(listener: ChatListener) {
  return client.subscribeChat(listener);
}

export function getLivePlayersSnapshot() {
  return client.getPlayers();
}

export function getRoomRankingSnapshot() {
  return client.getRanking();
}

export function getLiveChatSnapshot() {
  return client.getChatMessages();
}
