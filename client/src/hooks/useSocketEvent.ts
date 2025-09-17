import { useEffect } from "react";
import { useSocket } from "../providers/SocketProvider";
import type { ServerToClientEvents } from "../types/websocket";

type ReservedEventCallbacks = {
  connect: () => void;
  disconnect: (reason: string) => void; // was DisconnectReason
  connect_error: (err: Error) => void;
};

// Overload 1: Reserved events
export function useSocketEvent<K extends keyof ReservedEventCallbacks>(
  event: K,
  callback: ReservedEventCallbacks[K]
): void;

export function useSocketEvent<K extends keyof ServerToClientEvents>(
  event: K,
  callback: ServerToClientEvents[K]
): void;

export function useSocketEvent(
  event: keyof ReservedEventCallbacks | keyof ServerToClientEvents,
  callback: (...args: unknown[]) => void
): void {
  const socket = useSocket();

  useEffect(() => {
    socket.on(event, callback);
    return () => {
      socket.off(event, callback);
    };
  }, [event, callback, socket]);
}
