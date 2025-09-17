export interface SocketEventMap {
  join_poll: {
    clientToServer: { pollId: string };
    serverToClient: { pollId: string; message?: string };
  };

  leave_poll: {
    clientToServer: { pollId: string };
    serverToClient: { pollId: string; message?: string };
  };

  vote_update: {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    clientToServer: {};
    serverToClient: {
      pollId: string;
      options: Array<{ id: string; text: string; votes: number }>;
    };
  };

  poll_created: {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    clientToServer: {};
    serverToClient: {
      poll: {
        id: string;
        question: string;
        isPublished: boolean;
        createdAt: string;
        updatedAt: string;
        options: Array<{ id: string; text: string; votes: number }>;
      };
    };
  };

  socket_error: {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    clientToServer: {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    serverToClient: { code: string; message: string; details?: any };
  };
}

export type ClientToServerEvents = {
  [K in keyof SocketEventMap]: (
    payload: SocketEventMap[K]["clientToServer"],
    ack?: (err?: unknown) => void
  ) => void;
};

export type ServerToClientEvents = {
  [K in keyof SocketEventMap]: (
    payload: SocketEventMap[K]["serverToClient"]
  ) => void;
};

export type InterServerEvents = {
  ping: () => void;
};

export type SocketData = {
  userId?: string;
};

import { Server as IOServer, Socket as IOSocket } from "socket.io";

export type TypedServer = IOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
export type TypedSocket = IOSocket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
