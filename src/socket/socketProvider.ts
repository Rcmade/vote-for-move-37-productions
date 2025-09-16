import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
  TypedServer,
} from "@/types/websocket";
import type http from "http";
import { Server } from "socket.io";

/**
 * SocketProvider: initialize once and retrieve it anywhere.
 * This is a very small DI container for the io instance.
 */
class SocketProvider {
  private io?: TypedServer;

  init(server: http.Server): TypedServer {
    if (this.io) return this.io;

    // Create typed server
    const io = new Server<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    }) as TypedServer;

    // Save
    this.io = io;
    return io;
  }

  get(): TypedServer {
    if (!this.io) {
      throw new Error(
        "SocketProvider: io not initialized. Call init(server) first."
      );
    }
    return this.io;
  }

  /**
   * safe getter that returns undefined if not initialized
   */
  getIfInitialized(): TypedServer | undefined {
    return this.io;
  }
}

export const socketProvider = new SocketProvider();
