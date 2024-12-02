import React, { createContext, useContext, useEffect } from 'react';
import { useWebSocketService } from '../hooks/socket';
const SERVER_URL = 'http://localhost:8080/ws';

type WebSocketContextType = {
  socket: WebSocket | null;
  send: (message: any) => void;
  user: string;
  setUser: (user: string) => void;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { send, close, connect, getSocket } = useWebSocketService;
  const [currentSocket, setCurrentSocket] = React.useState<WebSocket | null>(null);
  const [user, setUser] = React.useState<string>('');
  useEffect(() => {
    connect(SERVER_URL);
    const socket = getSocket();
    if (socket) {
      socket.onopen = () => {
        console.log('Socket conectado', socket);
      }

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Mensagem recebida:context', data);
        if (data.type === 'client-login') {
          setUser(data.client);
        }
      }
    }
    setCurrentSocket(socket);
    return () => {
      console.log('Socket desconectado');
      close();
    };
  }, [connect, close, getSocket]);

  return (
    <WebSocketContext.Provider value={{ socket: currentSocket, send, user, setUser }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket deve ser usado dentro de WebSocketProvider');
  }
  return context;
};
