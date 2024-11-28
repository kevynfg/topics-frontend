import { useEffect, useState } from 'react';
// import { connect, Socket } from 'socket.io-client';

const SERVER_URL = 'http://localhost:8080/ws'; // Coloque aqui o URL do seu servidor WebSocket

export const useWebSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!socket) {
      const socket = new WebSocket(SERVER_URL);
      // const socket = connect(SERVER_URL, {
      //   transports: ['websocket'],
      //   path: '/ws',
      // })
      setSocket(socket);
    }
  }, [socket]);

  return socket;
};