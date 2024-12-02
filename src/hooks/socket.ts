let socket: WebSocket | null = null;

export const useWebSocketService = (() => {
  const connect = (url: string) => {
    if (!socket || socket.readyState === WebSocket.CLOSED) {
      socket = new WebSocket(url);
    }
  }

  const send = (data: any) => {
    console.log("Enviando mensagem:socketService", data);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    }
  }

  const close = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close();
      socket = null;
    }
  }

  const getSocket = () => socket;
  return { connect, send, close, getSocket, socket };
})();