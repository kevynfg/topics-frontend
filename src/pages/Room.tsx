import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useWebSocket } from "../context/websocket";

type RoomMessage = {
  host: string;
  message: string;
  sender: string;
}

type RoomInfo = {
  roomId: string;
  clients: string[];
  host: string;
  topic: string;
  rounds: number;
}

export default function Room() {
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [roomMessage, setRoomMessage] = useState<string | null>(null);
  const [roomMessages, setRoomMessages] = useState<RoomMessage[]>([]);
  const { socket, send, user } = useWebSocket();
  const [roomQuiz, setRoomQuiz] = useState<any | null>(null);
  const { id } = useParams();
  const roomId = id || null;
  const navigate = useNavigate();
  if (!roomId) {
    console.log("RoomId não encontrado")
    navigate("/");
  }
  const location = useLocation();
  const { roomData } = location.state || {};

  useEffect(() => {
    console.log("Room:state", roomData);
    console.log("Room:user", user);
    console.log("Room:socket", socket);
    if (roomData) {
      setRoomInfo({
        roomId: roomData.roomId,
        clients: roomData.clients,
        host: roomData.host,
        topic: roomData.topic,
        rounds: roomData.rounds,
      })
      if (roomData.isJoining && user === roomData.client) {
        console.log("Bem vindo a sala: ", { roomData });
      }
    }
  }, [roomData, user, roomId, socket])

  const renderName = useCallback((host: string) => {
    if (host === user) {
      return "Você";
    }
    return "Fulano";
  }, [user]);

  useEffect(() => {
    if (roomInfo?.topic && roomInfo?.rounds) {
      const fetchRoomData = async () => {
        try {
          // const response = await fetch(`https://quizapi.io/api/v1/questions?limit=${roomInfo.rounds}&apiKey=sEw4NrqsQvolaZE8T815FIjSINBdGVoLEvFbNEnX`);
          // const data = await response.json();
          const data = [
            {
              "id": 720,
              "question": "Cronjobs in kubernetes run in",
              "description": null,
              "answers": {
                "answer_a": "UTC only",
                "answer_b": "Based on NTP settings",
                "answer_c": "Master node local timezone",
                "answer_d": "GMT only",
                "answer_e": null,
                "answer_f": null
              },
              "multiple_correct_answers": "false",
              "correct_answers": {
                "answer_a_correct": "true",
                "answer_b_correct": "false",
                "answer_c_correct": "false",
                "answer_d_correct": "false",
                "answer_e_correct": "false",
                "answer_f_correct": "false"
              },
              "correct_answer": "answer_a",
              "explanation": null,
              "tip": null,
              "tags": [
                {
                  "name": "Kubernetes"
                }
              ],
              "category": "Linux",
              "difficulty": "Easy"
            }
          ];
          console.log("Dados da API:", data);
          setRoomQuiz(data);
        } catch (error) {
          console.error("Erro ao buscar dados da API:", error);
        }
      };

      fetchRoomData();
    }
  }, [roomId, roomInfo?.topic]);


  useEffect(() => {
    if (socket) {
      socket.onmessage = (event: MessageEvent) => {
        console.log('evento recebido', { event });
        if (event.data) {
          const data = JSON.parse(event.data);
          const { type } = data;
          console.log({ type, data });

          if (type === "welcome-message") {
            console.log("Entrou", { user })
            if (roomId && roomId === data.roomId) {
              if (user === data.client) {
                console.log("Bem vindo a sala");
              } else {
                console.log("Novo membro na sala")
              }
            }
          }

          if (type === "room-message") {
            console.log("Mensagem recebida e id da sala", data, roomId);
            if (roomId === data.roomId) {
              setRoomMessages((prev) => [...prev, { host: data.host, message: data.message, sender: data.sender }]);
            }
          }
        }
      }
    }
  }, [socket, roomId, user]);

  return (
    <div className="flex h-screen items-center justify-center flex-col gap-8">
      <p className="text-white">RoomID: {String(roomId)}</p>
      <button className="bg-white text-black w-[100px] h-[50px] rounded" onClick={() => {
        navigator.clipboard.writeText(roomId || "");
      }}>Copy</button>
      <button style={{ 'background': 'blue' }} onClick={() => {
        console.log("Joining room", roomId);
        send({
          type: "join-room", data: {
            roomId: roomId
          }
        });
      }}>Join room</button>
      <p>Send message</p>
      <input type="text" style={{ background: 'blue' }} onChange={(e) => setRoomMessage(String(e.target.value))} />
      <button style={{ 'background': 'blue' }} onClick={() => {
        console.log("Sending message", roomId);
        send({
          type: "room-message", data: {
            roomId: roomId,
            message: roomMessage,
            sender: user || "",
          }
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
