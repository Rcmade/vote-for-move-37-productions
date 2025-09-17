// import { socket } from "@/lib/websockets/socket";
import { createContext, useContext, useEffect } from "react";
import { socket } from "../lib/websockets/socket";

const SocketContext = createContext(socket);

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
