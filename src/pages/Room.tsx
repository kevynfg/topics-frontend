import { Crown, Send, Spade, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useWebSocket } from "../context/websocket";

interface PlayerInfo {
  nickname: string;
  client: string;
}

interface RoomData {
  host: string;
  roomId: string;
  topic: string;
  totalRounds: number;
  playersInfo: PlayerInfo[];
  client: string;
  clients: string[];
  isJoining: boolean;
}

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
  playersInfo: PlayerInfo[]
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
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [rightOverlay, setRightOverlay] = useState(false);
  const [leftOverlay, setLeftOverlay] = useState(false);
  const [whichOverlayIsVisible, setWhichOverlayIsVisible] = useState("");

  const toggleOverlay = (direction: "left" | "right") => {
    console.log("Toggling overlay");
    if (direction === "right") {
      setRightOverlay(!rightOverlay);
      setLeftOverlay(false);
      setWhichOverlayIsVisible("right");
    } else {
      setLeftOverlay(!leftOverlay);
      setRightOverlay(false);
      setWhichOverlayIsVisible("left");
    }
    setIsOverlayVisible(!isOverlayVisible);
  }

  const toggleAllOverlays = () => {
    console.log("Toggling all overlays");
    switch (whichOverlayIsVisible) {
      case "left":
        setLeftOverlay(false);
        break;
      case "right":
        setRightOverlay(false);
        break;
      default:
        setLeftOverlay(false);
        setRightOverlay(false);
        break;
    }
    setIsOverlayVisible(false);
  }

  const icons = [
    <Send color="white" size={24} />,
    <Sparkles color="white" size={24} />,
    <Spade color="white" size={24} />
  ];
  const messageRef = useRef<HTMLDivElement>(null);

  if (!roomId) {
    console.log("RoomId não encontrado")
    navigate("/");
  }
  const location = useLocation();
  const { roomData }  = location.state || {};

  useEffect(() => {
    console.log("Room:state", roomData);
    console.log("Room:user", user);
    console.log("Room:socket", socket);
    if (roomData) {
      console.log("Setting room data...")
      setRoomInfo({
        roomId: roomData.roomId,
        clients: roomData.clients,
        host: roomData.host,
        topic: roomData.topic,
        rounds: roomData.rounds,
        type: roomData.type || "Default",
        playersInfo: roomData.playersInfo ? roomData.playersInfo : [{
          nickname: roomData.nickname,
          client: roomData.host
        }]
      })
      if (roomData.isJoining && user === roomData.client) {
        for (let player of roomData.playersInfo) {
          if (player.client === user) {
            console.log("Bem vindo a sala: ", player.nickname);
          }
        }
      }
    }
    console.log("Room:info", roomInfo);
  }, [roomData, user, socket]);

  useEffect(() => {
    console.log("Room:info", roomInfo);
  }, [roomInfo]);

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
                console.log("Novo membro na sala", roomInfo)
                if (data.roomData?.length) {
                  const roomDataNewMember = data.roomData.pop();
                  setRoomInfo({
                    roomId: roomDataNewMember.roomId,
                    clients: data.clients,
                    host: roomDataNewMember.host,
                    topic: roomDataNewMember.topic,
                    rounds: roomDataNewMember.totalRounds,
                    type,
                    playersInfo: roomDataNewMember.playersInfo
                  })
                }
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
    <div className="all-[unset] bg-slate-900 flex h-screen w-screen">
      {/* Conteúdo Principal */}
      <div className="w-screen p-4 flex flex-col gap-4 items-center">
        <p className="text-white text-lg">Game Screen</p>
        <p className="text-white break-words w-full text-center">
          Conteúdo principal aqui.
        </p>
        {/* Rodapé com Botões */}
        <footer className="w-full max-w-md flex justify-between gap-4 p-4">
          <Button className="bg-slate-800" onClick={() => toggleOverlay('left')}>Chat</Button>
          <Button className="bg-slate-800" onClick={() => toggleOverlay('right')}>Players</Button>
        </footer>
      </div>

      {/* Overlay */}
      {isOverlayVisible && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg text-center max-w-sm w-full h-[70vh] flex flex-col gap-4 items-center">
            {leftOverlay && (
              <div className="p-1 flex flex-col gap-2 items-center">
                <p className="text-white text-pretty">Room Config</p>
                <p className="text-white text-pretty">Room ID</p>
                <p className="text-white break-words">{String(roomId)}</p>
                <button className="bg-white text-black w-[100px] h-[30px] rounded" onClick={() => {
                  navigator.clipboard.writeText(roomId || "");
                }}>Copy room id</button>

                <div className="mt-10 text-white shadow-lg max-h-[90%] w-[90vw] flex flex-col bg-gray-900">
                  {/* Cabeçalho do Chat */}
                  <div className="bg-gray-900 text-lg font-bold text-center rounded-tr-sm rounded-tl-sm">
                    Chat
                  </div>

                  {/* Área de Mensagens */}
                  <div className="overflow-y-scroll w-[100%] !max-h-[70vh] h-[250px] flex items-start flex-col gap-4 bg-gray-900 pr-2 pl-2">
                    {roomMessages.map((message: any, index: any) => (
                      <div ref={messageRef} key={index} className={
                        `bg-gray-800 mr-1 ml-1
                          flex ${renderName(message.sender) === "Você" ? "justify-end ml-auto" : "justify-start"}
                          max-w-xs rounded-lg px-4 py-1 shadow ${renderName(message.sender) === "Você" ? "bg-blue-500 text-white rounded-tr-none" : "bg-gray-400 text-white rounded-tl-none"}
                        `}>
                        {message.message}
                      </div>
                    ))}
                  </div>

                  {/* Campo de Entrada */}
                  <div className="bg-gray-900">
                    <div className="flex justify-center items-center gap-2 mb-4">
                      <input
                        type="text"
                        value={roomMessage || ""}
                        onChange={(e) => setRoomMessage(String(e.target.value))}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Start typing your message..."
                        className="w-[85%] h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      />
                      <Send
                        onClick={() => {
                          console.log("Sending message", roomId);
                          sendMessage();
                        }}
                        size={26}
                        alignmentBaseline="middle"
                        enableBackground="true"
                        className={`cursor-pointer ${roomMessage ? 'text-white' : 'text-gray-500'} ${!roomMessage ? 'pointer-events-none' : ''}`}
                      >
                        Enviar
                      </Send>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {rightOverlay && (
              <div className="p-1 flex flex-col gap-4 items-center">
                <p className="text-white">Players</p>
                {roomInfo && roomInfo.playersInfo?.length && roomInfo.playersInfo.map((player, index) => {
                  console.log("ROOM INFO BOY", roomInfo)
                  console.log("Client:", player, "index", index);
                  return <div key={index} className="flex items-center gap-2">
                    {roomInfo.host === player.client ? <Crown color="white" size={24} /> : icons[index]}
                    <p className="text-white">{player.nickname}</p>
                  </div>
                })}
              </div>
            )}
            <Button className="bg-slate-900" onClick={toggleAllOverlays}>Fechar</Button>
          </div>
        </div>
      )
      }
    </div >
  );
};
