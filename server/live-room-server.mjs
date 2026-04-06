import { WebSocketServer } from "ws";
import { createServer } from "node:http";

const port = Number(process.env.PORT || process.env.LIVE_ROOM_PORT || 8787);

/** @type {Map<string, {players: Map<string, any>, ranking: Map<string, any>}>} */
const rooms = new Map();

function ensureRoom(roomCode) {
  if (!rooms.has(roomCode)) {
    rooms.set(roomCode, {
      players: new Map(),
      ranking: new Map(),
    });
  }
  return rooms.get(roomCode);
}

function getPlayers(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return [];
  return Array.from(room.players.values()).sort((a, b) => b.lastSeen - a.lastSeen);
}

function getRanking(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return [];
  return Array.from(room.ranking.values()).sort((a, b) => a.totalSeconds - b.totalSeconds);
}

function send(socket, payload) {
  if (socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
}

function broadcastToRoom(roomCode, payload) {
  for (const socket of wss.clients) {
    if (socket.roomCode === roomCode && socket.readyState === socket.OPEN) {
      socket.send(JSON.stringify(payload));
    }
  }
}

function broadcastSnapshot(roomCode) {
  const players = getPlayers(roomCode);
  const ranking = getRanking(roomCode);
  broadcastToRoom(roomCode, { type: "snapshot", roomCode, players, ranking });
}

function removePlayer(roomCode, playerId) {
  const room = rooms.get(roomCode);
  if (!room) return;

  room.players.delete(playerId);
  if (room.players.size === 0 && room.ranking.size === 0) {
    rooms.delete(roomCode);
    return;
  }
  broadcastSnapshot(roomCode);
}

const server = createServer((_, res) => {
  res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
  res.end("live-room-server ok");
});

const wss = new WebSocketServer({ server });

wss.on("connection", (socket) => {
  socket.roomCode = "";
  socket.playerId = "";

  send(socket, { type: "connected", serverTime: Date.now() });

  socket.on("message", (raw) => {
    let data;
    try {
      data = JSON.parse(String(raw));
    } catch {
      send(socket, { type: "error", message: "Invalid JSON" });
      return;
    }

    if (data.type === "join") {
      const roomCode = String(data.roomCode || "").trim().toUpperCase();
      const player = data.player;
      if (!roomCode || !player?.playerId) {
        send(socket, { type: "error", message: "join requires roomCode and player" });
        return;
      }

      socket.roomCode = roomCode;
      socket.playerId = player.playerId;

      const room = ensureRoom(roomCode);
      room.players.set(player.playerId, {
        ...player,
        lastSeen: Date.now(),
      });

      send(socket, {
        type: "snapshot",
        roomCode,
        players: getPlayers(roomCode),
        ranking: getRanking(roomCode),
      });
      broadcastSnapshot(roomCode);
      return;
    }

    if (!socket.roomCode || !socket.playerId) {
      send(socket, { type: "error", message: "Join a room first" });
      return;
    }

    if (data.type === "heartbeat") {
      const room = ensureRoom(socket.roomCode);
      const current = room.players.get(socket.playerId) || {};
      room.players.set(socket.playerId, {
        ...current,
        ...data.player,
        playerId: socket.playerId,
        lastSeen: Date.now(),
      });
      broadcastSnapshot(socket.roomCode);
      return;
    }

    if (data.type === "ranking") {
      const room = ensureRoom(socket.roomCode);
      const entry = data.entry;
      if (!entry?.playerId) {
        send(socket, { type: "error", message: "ranking entry invalid" });
        return;
      }

      const prev = room.ranking.get(entry.playerId);
      if (!prev || entry.totalSeconds < prev.totalSeconds) {
        room.ranking.set(entry.playerId, {
          ...entry,
          updatedAt: Date.now(),
        });
      }
      broadcastToRoom(socket.roomCode, { type: "ranking", ranking: getRanking(socket.roomCode) });
      return;
    }

    if (data.type === "leave") {
      removePlayer(socket.roomCode, socket.playerId);
      socket.roomCode = "";
      socket.playerId = "";
      return;
    }
  });

  socket.on("close", () => {
    if (socket.roomCode && socket.playerId) {
      removePlayer(socket.roomCode, socket.playerId);
    }
  });
});

setInterval(() => {
  const now = Date.now();
  for (const [roomCode, room] of rooms.entries()) {
    for (const [playerId, player] of room.players.entries()) {
      if (now - (player.lastSeen || 0) > 20000) {
        room.players.delete(playerId);
      }
    }
    if (room.players.size === 0 && room.ranking.size === 0) {
      rooms.delete(roomCode);
    } else {
      broadcastSnapshot(roomCode);
    }
  }
}, 5000);

server.listen(port, () => {
  console.log(`[live-room-server] listening on :${port}`);
});
