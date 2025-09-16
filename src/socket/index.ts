// src/socket/index.ts
import type { TypedServer, TypedSocket } from "@/types/websocket";
import type http from "http";
import { socketProvider } from "./socketProvider";

export function initSocket(server: http.Server): TypedServer {
  const io = socketProvider.init(server);

  io.on("connection", (socket: TypedSocket) => {
    console.log(`[socket] connected: ${socket.id}`);

    socket.on("join_poll", (payload, ack) => {
      try {
        if (!payload?.pollId) {
          ack?.({ error: "pollId required" });
          return;
        }
        const room = `poll:${payload.pollId}`;
        socket.join(room);
        socket.emit("join_poll", { pollId: payload.pollId, message: "joined" });
        ack?.();
      } catch (err) {
        ack?.(err);
      }
    });

    socket.on("leave_poll", (payload, ack) => {
      try {
        if (!payload?.pollId) {
          ack?.({ error: "pollId required" });
          return;
        }
        const room = `poll:${payload.pollId}`;
        socket.leave(room);
        socket.emit("leave_poll", { pollId: payload.pollId, message: "left" });
        ack?.();
      } catch (err) {
        ack?.(err);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`[socket] disconnected: ${socket.id} reason: ${reason}`);
    });
  });

  return io;
}

export async function emitVoteUpdate(
  pollId: string,
  options: Array<{ id: string; text: string; votes: number }>
) {
  const io = socketProvider.getIfInitialized();
  if (!io) {
    console.warn("[socket] emitVoteUpdate: io not initialized");
    return;
  }
  io.to(`poll:${pollId}`).emit("vote_update", {
    pollId,
    options,
  });
}

export async function emitSocketError(
  target: { socketId?: string; room?: string },
  errorPayload: { code: string; message: string; details?: any }
) {
  const io = socketProvider.getIfInitialized();
  if (!io) {
    console.warn("[socket] emitSocketError: io not initialized");
    return;
  }

  if (target.socketId) {
    io.to(target.socketId).emit("socket_error", errorPayload);
    return;
  }
  if (target.room) {
    io.to(target.room).emit("socket_error", errorPayload);
    return;
  }

  io.emit("socket_error", errorPayload);
}
