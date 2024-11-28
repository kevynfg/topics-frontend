import { useCallback, useEffect, useRef, useState } from "react";
import './App.css';
import { useWebSocket } from "./hooks/socket";

type RoomMessage = {
  host: string;
  message: string;
  sender: string;
}

type RoomInfo = {
  roomId: string;
  clients: string[];
  host: string;
}

function App() {
  const socket = useWebSocket();

  const socketRef = useRef<WebSocket | null>(null);
  const roomIdRef = useRef<string | null>(null);
  const me = useRef<{ client: string } | null>(null);

  const [roomId, setRoomId] = useState<string>();
  const [, setRoomInfo] = useState<RoomInfo | null>(null);
  const [roomMessage, setRoomMessage] = useState<string | null>(null);
  const [roomMessages, setRoomMessages] = useState<RoomMessage[]>([]);

  const renderName = useCallback((host: string) => {
    if (host === me.current?.client) {
      return "Você";
    }
    return "Fulano";
  }, [me]);

  useEffect(() => {
    if (roomId) {
      console.log("Setou roomIdRef", roomId);
      roomIdRef.current = roomId;
    }
  }, [roomId]);

  const setMe = (data: { client: string }) => {
    me.current = data
  }

  useEffect(() => {
    if (!socketRef.current && socket) {
      socketRef.current = socket;
      console.log("Socket connected", socket);

      socket.onmessage = (event: MessageEvent) => {
        console.log('evento recebido', { event });
        if (event.data) {
          const { type, data } = JSON.parse(event.data);
          console.log({ type, data });

          if (type === "room-created") {
            if (data.roomId) {
              setRoomId(data.roomId);
              setRoomInfo({ roomId: data.roomId, clients: [data.host], host: data.host });
            };
            console.log("Nova sala criada com sucesso", { data });
          }

          if (type === "welcome-message") {
            console.log("Entrou", { me })
            if (roomIdRef.current === data.roomId) {
              if (me?.current?.client === data.host) {
                console.log("Bem vindo a sala");
              } else {
                console.log("Novo membro na sala")
              }
            }
            setRoomInfo({ roomId: data.roomId, clients: data.clients, host: data.host });
          }

          if (type === "room-message") {
            console.log("Mensagem recebida e id da sala", data, roomIdRef.current);
            if (roomIdRef.current === data.roomId) {
              setRoomMessages((prev) => [...prev, { host: data.host, message: data.message, sender: data.sender }]);
            }
          }

          if (type === "client-login") {
            console.log("Client login", { data });
            if (!me.current) {
              setMe({ client: data.client });
            }
          }

          console.log("RoomId", roomIdRef.current)
          console.log("Me", me.current)
        }
      }
    }
  }, [socket, roomId, me]);

  const sendSocketEvent = (event: string, data: any) => {
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify({ type: event, data }));
    }
  }

  return (
    <div className="flex h-screen items-center justify-center flex-col gap-8">
      <h1>First page</h1>
      <button style={{ 'background': 'red' }} onClick={() => socket?.send(JSON.stringify({ type: "ping", data: {} }))}>Ping</button>
      <button style={{ 'background': 'red' }} onClick={() => socket?.send(JSON.stringify({
        type: "create-room", data: {
          name: "Room 1",
          description: "This is a room",
        }
      }))}>Create room</button>
      <input type="text" style={{ background: 'red' }} onChange={(e) => setRoomId(String(e.target.value))} />
      <button style={{ 'background': 'blue' }} onClick={() => {
        console.log("Joining room", roomId);
        sendSocketEvent("join-room", {
          roomId: roomId,
        });
      }}>Join room</button>
      <p>Send message</p>
      <input type="text" style={{ background: 'blue' }} onChange={(e) => setRoomMessage(String(e.target.value))} />
      <button style={{ 'background': 'blue' }} onClick={() => {
        console.log("Sending message", roomId);
        sendSocketEvent("room-message", {
          roomId: roomId,
          message: roomMessage,
          sender: me.current?.client || "",
        })
      }}>Send</button>
      <div className="flex items-center justify-center flex-col" style={{ 'border': 'black', 'width': '500px' }}>
        <h2>Chat</h2>
        {roomMessages.map((message, index) => (
          <p key={index}>{renderName(message.sender)}: {message.message}</p>
        ))}
      </div>
    </div>
  );
}

export default App;
