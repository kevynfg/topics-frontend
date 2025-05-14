import { Crown, Send, Spade, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useWebSocket } from "../context/websocket";

const quizMock = {
  "id": 8016,
  "question": "How do you securely copy a file over SSH?",
  "description": "Understanding secure file transfer using SSH.",
  "answers": {
      "answer_a": "scp file username@host:/path/to/destination",
      "answer_b": "ssh_copy file username@host:/path/to/destination",
      "answer_c": "rsync file username@host:/path/to/destination",
      "answer_d": "copy file username@host:/path/to/destination"
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
  "explanation": "Using `scp` securely copies files over SSH.",
  "tags": [
      {
          "name": "BASH"
      }
  ],
  "category": "bash",
  "difficulty": "Hard"
}

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
  // topicData: any;
  currentRound: number;
}

export default function Room() {
  const { id } = useParams();
  const roomId = id || null;
  const navigate = useNavigate();
  const { socket, send, user } = useWebSocket();

  const [gameState, setGameState] = useState<any | null>({
    started: false,
    ended: false,
  });
  const [timer, setTimer] = useState<any | null>(null);
  const [timerInterval, setTimerInterval] = useState<any | null>(null);
  const [timerDuration, setTimerDuration] = useState<any | null>(null);
  const [currentRound, setCurrentRound] = useState(0);

  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [roomMessage, setRoomMessage] = useState<string | null>(null);
  const [roomMessages, setRoomMessages] = useState<RoomMessage[]>([]);
  const [roomQuiz, setRoomQuiz] = useState<any | null>(null);
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
    console.log("RoomId not found")
    navigate("/");
  }
  const location = useLocation();
  console.log("Room:location", location);
  const { roomData } = location.state || {};

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
        }],
        currentRound: roomData.currentRound,
      })
      if (roomData.isJoining && user === roomData.client) {
        for (let player of roomData.playersInfo) {
          if (player.client === user) {
            console.log("Welcome to the room: ", player.nickname);
          }
        }
      }

      if (roomData.topicData) {
        setRoomQuiz(roomData.topicData);
      }
    }
    console.log("Room:info 1", roomInfo);
  }, [roomData, user, socket]);

  useEffect(() => {
    console.log("Room:info 2", roomInfo);
    console.log("Room:info 2:topicData", roomQuiz);
    setCurrentRound(roomInfo?.currentRound || 0);
  }, [roomInfo]);

  const renderName = useCallback((host: string) => {
    if (host === user) {
      return "yourself";
    }
    return "John doe";
  }, [user]);

  const getPlayerNickname = (client: string) => {
    if (roomInfo && roomInfo.playersInfo) {
      const player = roomInfo.playersInfo.find((player) => player.client === client);
      if (player) {
        return player.nickname;
      }
    }
    return "Unknown";
  }

  const showQuestion = useCallback((rounds: number | undefined) => {
      if (timer === 10) {
        setTimer(0);
        clearInterval(timerInterval);
        clearInterval(timerDuration);
      };
      console.log("Executando...", { currentRound, rounds });
      if (currentRound > rounds!) {
        return <div className="flex justify-center items-center h-full">
          <p className="text-white">No more questions</p>
        </div>
      }
      const currentQuestion = roomQuiz[currentRound - 1];
      if (!currentQuestion) {
        return <div className="flex justify-center items-center h-full">
          <p className="text-white">No question found</p>
        </div>
      }
      return <div className="w-full flex flex-col gap-4">
        <div key={currentRound - 1} className="p-4 rounded-lg shadow-lg">
          <p className="text-white text-xl">{currentQuestion.question}</p>
          <br/>
          <p className="text-gray-400 text-sm">{currentQuestion.description}</p>
        </div>
      </div>
  }, [currentRound, roomQuiz]);

  const showAnswers = useCallback((rounds: number | undefined) => {
    if (currentRound > rounds!) {
      return <div className="flex justify-center items-center h-full">
        <p className="text-white">No more questions</p>
      </div>
    }

    const currentQuestion = roomQuiz[currentRound - 1];
    if (!currentQuestion) {
      return <div className="flex justify-center items-center h-full">
        <p className="text-white">No question found</p>
      </div>
    }
    const answers = Object.entries(currentQuestion.answers).map(([key, value]) => {
      if (value) {
        return (
          <div key={key} className="bg-gray-900 p-4 rounded-lg shadow-lg hover:bg-gray-800 cursor-pointer"
          onClick={() => {
            console.log("Answer clicked", key);
          }}>
            <p className="text-white">{String(value)}</p>
          </div>
        );
      }
      return null;
    }
    );
    return (
      <div className="w-full h-full flex flex-col gap-4">
        {answers}
      </div>
    );
  }, [currentRound, roomQuiz]);

  useEffect(() => {
    if (roomInfo?.topic && roomInfo?.rounds) {
      const fetchRoomData = async () => {
        try {
          // const response = await fetch(`https://quizapi.io/api/v1/questions?limit=${roomInfo.rounds}&apiKey=sEw4NrqsQvolaZE8T815FIjSINBdGVoLEvFbNEnX`);
          // const data = await response.json();
          const data = [quizMock];
          console.log("Data fetched from API:", data);
          send({
            type: "save-topic", data: {
              topic: roomInfo.topic,
              roomId: roomId,
              topicData: data,
            }
          })
          // setRoomQuiz(data);
          console.log("Data sent to server:", {
            topic: roomInfo.topic,
            roomId: roomId,
            topicData: data,
          })
          // setCurrentRound(1);
          return {};
        } catch (error) {
          console.error("Error fetching data from API:", error);
        }
      };
      if (!roomQuiz) {
        fetchRoomData();
      }
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
                    playersInfo: roomDataNewMember.playersInfo,
                    // topicData: roomDataNewMember.topicData || null,
                    currentRound: roomDataNewMember.currentRound,
                  })
                  setRoomQuiz(roomDataNewMember.topicData);
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

          if (type === "game-started") {
            console.log("Game started", data);
            if (roomId === data.roomId) {
              console.log("Game started:room", data);
              setGameState({ started: true, ended: false });
              setRoomQuiz(data.topicData);
              setCurrentRound(1);
              // setTimerDuration(setInterval(() => {
              //   setCurrentRound((prev: number) => prev + 1);
              // }, 10000));
              // setTimerInterval(setInterval(() => {
              //   setTimer((prev: number) => prev + 1);
              // }
              // , 1000));
              // setTimer(0);
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

  const startGame = () => {
    console.log("Starting game", roomId);
    if (roomId) {
      send({
        type: "start-game", data: {
          roomId: roomId,
          rounds: roomInfo?.rounds,
          topic: roomInfo?.topic,
          topicData: roomQuiz,
        }
      })
      setGameState({ started: true, ended: false });
    }
  }

  return (
    <div className="all-[unset] bg-slate-900 flex h-[80vh] w-screen">
      {/* Main content */}
      <div className="w-screen p-4 flex flex-col gap-4 items-center">
        <p className="text-white break-words w-full text-center">
          {roomInfo && roomInfo.topic ? `Topic: ${String(roomInfo.topic).toUpperCase()}` : "No topic selected"}
        </p>

        <div className="bg-slate-800 w-full max-w-md h-[70vh] flex flex-col gap-4 p-4 rounded-lg shadow-lg">
          <p className="text-white text-lg flex justify-center underline">Quiz</p>
          {roomQuiz && roomQuiz.length > 0 ? showQuestion(roomInfo?.rounds) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-white">No quiz started</p>
            </div>
          )}

          {roomQuiz && roomQuiz.length > 0 && (
            <div className="flex justify-center items-center gap-2">
              {showAnswers(roomInfo?.rounds)}
            </div>
          )}

        </div>


        {/* Bottom buttons */}
        <footer className="w-full max-w-md flex justify-between gap-4 p-4 mt-auto">
          <Button className="bg-slate-800" onClick={() => toggleOverlay('left')}>Chat</Button>
          <Button className="bg-green-800 w-[20%] hover:bg-green-500" onClick={startGame}>Start</Button>
          {timer && (
            <div className="bg-slate-800 p-2 rounded-lg shadow-lg">
              <p className="text-white text-lg">{`Timer: ${String(timer)}`}</p>
            </div>
          )}
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
                  {/* Chat header */}
                  <div className="bg-gray-900 text-lg font-bold text-center rounded-tr-sm rounded-tl-sm">
                    Chat
                  </div>

                  {/* Messages */}
                  <div className="overflow-y-scroll w-[100%] !max-h-[70vh] h-[250px] flex items-start flex-col gap-4 bg-gray-900 pr-2 pl-2">
                    {roomMessages.map((message: any, index: any) => (
                      <div ref={messageRef} key={index} className={
                        `bg-gray-800 mr-1 ml-1
                          flex ${renderName(message.sender) === "yourself" ? "justify-end ml-auto" : "justify-start"}
                          flex-col gap-1
                          items-start
                          max-w-xs rounded-lg px-4 py-1 shadow ${renderName(message.sender) === "yourself" ? "bg-blue-500 text-white rounded-tr-none" : "bg-gray-400 text-white rounded-tl-none"}
                        `}>
                        {renderName(message.sender) === "yourself" ? (
                          ''
                        ) : <p className="text-white text-sm">{getPlayerNickname(message.sender)}:</p>}
                        {message.message}
                      </div>
                    ))}
                  </div>

                  {/* Input field */}
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
            <Button className="bg-slate-900 mt-auto" onClick={toggleAllOverlays}>Fechar</Button>
          </div>
        </div>
      )
      }
    </div >
  );
};
