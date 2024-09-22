import type { ReactNode } from "react";
import { createContext, useContext } from "react";

type ProviderProps = {
  socket: WebSocket | undefined;
  children: ReactNode;
};

export const wsContext = createContext<WebSocket | undefined>(undefined);

export function useSocket() {
  return useContext(wsContext);
}

export function SocketProvider({ socket, children }: ProviderProps) {
  return <wsContext.Provider value={socket}>{children}</wsContext.Provider>;
}