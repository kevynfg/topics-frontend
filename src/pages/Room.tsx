import { Crown, Send, Spade, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useWebSocket } from "../context/websocket";

const invalidData = {
  "id": "720",
  "question": "Cronjobs in kubernetes run in",
  "description": "",
  "answers": {
    "answer_a": "UTC only",
    "answer_b": "Based on NTP settings",
    "answer_c": "Master node local timezone",
    "answer_d": "GMT only",
    "answer_e": "",
    "answer_f": ""
  },
  "multiple_correct_answers": false,
  "correct_answers": {
    "answer_a_correct": true,
    "answer_b_correct": false,
    "answer_c_correct": false,
    "answer_d_correct": false,
    "answer_e_correct": false,
    "answer_f_correct": false
  },
  "correct_answer": "answer_a",
  "explanation": "",
  "tip": "",
  "tags": [
    {
      "name": "Kubernetes"
    }
  ],
  "category": "Linux",
  "difficulty": "Easy"
}

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
  type: string;
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
  const icons = [
    <Send color="white" size={24} />,
    <Sparkles color="white" size={24} />,
    <Spade color="white" size={24} />
  ]
  const messageRef = useRef<HTMLDivElement>(null);

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
        type: roomData.type || "Default"
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

          // setRoomQuiz({});
          return {};
        } catch (error) {
          console.error("Erro ao buscar dados da API:", error);
        }
      };
      fetchRoomData()
    }
  }, [roomId, roomInfo?.topic]);


  useEffect(() => {
    if (socket) {
      socket.onmessage = (event: MessageEvent) => {
        console.log('evento recebido', { event });
        if (event.data) {
          const eventData = JSON.parse(event.data);
          const { type, data } = eventData;
          console.log("entrada eventos: ", { type, data });

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
            console.log("Mensagem recebida e id da sala", data.message, roomId);
            if (roomId === data.roomId) {
              console.log("Mensagem recebida:salaCorreta", data);
              setRoomMessages((prev) => [...prev, { host: data.host, message: data.message, sender: data.sender }]);
            }
          }

          if (type === "topic-saved") {
            console.log("Tópico salvo:room:if", data);
            if (roomId === data.roomId) {
              console.log("Tópico salvo:room", data);
              setRoomQuiz(data.topicData);
            }
          }
        }
      }
    }
  }, [socket, roomId, user]);

  const sendMessage = () => {
    console.log("Sending message", roomId);
    send({
      type: "room-message", data: {
        roomId: roomId,
        message: roomMessage,
        sender: user || "",
      }
    })
    setRoomMessage("");
    if (messageRef.current !== null) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    // <div className="flex h-screen items-center justify-center flex-col gap-8">
    //   <p className="text-white">RoomID: {String(roomId)}</p>
    //   <button className="bg-white text-black w-[100px] h-[50px] rounded" onClick={() => {
    //     navigator.clipboard.writeText(roomId || "");
    //   }}>Copy</button>
    //   <button className="bg-orange-400 text-black w-[100px] h-[50px] rounded" onClick={() => {
    //     if (roomInfo && roomInfo.topic) {
    //       console.log("Iniciando jogo: ", roomQuiz);
    //       ;
    //       send({
    //         type: "save-topic", data: {
    //           roomId: roomId,
    //           topicData: [
    //             invalidData
    //           ],
    //           topic: roomInfo?.topic
    //         }
    //       });
    //     }
    //   }}>Start game?</button>
    //   <p>Send message</p>
    //   <input type="text" style={{ background: 'blue' }} onChange={(e) => setRoomMessage(String(e.target.value))} />
    //   <button style={{ 'background': 'blue' }} onClick={() => {
    //     console.log("Sending message", roomId);
    //     send({
    //       type: "room-message", data: {
    //         roomId: roomId,
    //         message: roomMessage,
    //         sender: user || "",
    //       }
    //     })
    //   }}>Send</button>
    //   <div className="flex items-center justify-center flex-col" style={{ 'border': 'black', 'width': '500px' }}>
    //     <h2 className="text-white">Chat</h2>
    //     {roomMessages.map((message: any, index: any) => (
    //       <p className="text-white" key={index}>{renderName(message.sender)}: {message.message}</p>
    //     ))}
    //   </div>
    // </div>
    <div className="all-[unset] bg-slate-900 flex h-screen w-full">
      {/* Coluna Esquerda */}
      <div className="w-1/4 p-1 flex flex-col gap-4 items-center">
        <p className="text-white text-pretty">Room Config</p>
        <p className="text-white text-pretty">Room ID</p>
        <p className="text-white break-words">{String(roomId)}</p>
        <button className="bg-white text-black w-[100px] h-[50px] rounded" onClick={() => {
          navigator.clipboard.writeText(roomId || "");
        }}>Copy</button>

        <div className="mt-10 bg-gray-900 text-white shadow-lg max-h-[90%] w-[100%] flex flex-col">
          {/* Cabeçalho do Chat */}
          <div className="bg-gray-900 text-lg font-bold text-center">
            Chat
          </div>

          {/* Área de Mensagens */}
          <div className="overflow-y-scroll w-[100%] !max-h-[50vh] h-[200px]">
            {roomMessages.map((message: any, index: any) => (
              <p ref={messageRef} className="text-white text-sm break-words py-1" key={index}>{renderName(message.sender)}: {message.message}</p>
            ))}
          </div>

          {/* Campo de Entrada */}
          <div className="bg-gray-900 flex gap-2 py-2 items-center justify-center">
            <input
              type="text"
              value={roomMessage || ""}
              onChange={(e) => setRoomMessage(String(e.target.value))}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Digite sua mensagem..."
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm flex-1"
            />

            <Send
              onClick={() => {
                console.log("Sending message", roomId);
                sendMessage();
              }}
              size={24}
              alignmentBaseline="middle"
              className={`cursor-pointer ${roomMessage ? 'text-white' : 'text-gray-500'} ${!roomMessage ? 'pointer-events-none' : ''}`}
            >
              Enviar
            </Send>
          </div>
        </div>
      </div>

      {/* Coluna Central */}
      <div className="w-2/4 p-4 flex flex-col gap-4 items-center">
        <p className="text-white">Game</p>
        <Send />
      </div>

      {/* Coluna Direita */}
      <div className="w-1/4 p-1 flex flex-col gap-4 items-center">
        <p className="text-white">Players</p>
        {roomInfo?.clients.map((client, index) => (
          <div key={index} className="flex items-center gap-2">
            {roomInfo.host === client ? <Crown color="white" size={24} /> : icons[index]}
            <p className="text-white">{client}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
