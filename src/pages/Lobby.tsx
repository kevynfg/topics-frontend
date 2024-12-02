import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useWebSocket } from "../context/websocket";

export default function Lobby() {
  const { socket, send, setUser, user } = useWebSocket();
  const [roomName, setRoomName] = useState<string | null>(null);
  const [roomTopic, setRoomTopic] = useState<string | null>(null);
  const [roomRounds, setRoomRounds] = useState<number | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const navigate = useNavigate();

  const onInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const min = input.min ? parseInt(input.min) : 1;
    const max = input.max ? parseInt(input.max) : 10;
    if (Number(input.value) < min) {
      input.value = min.toString();
    }
    if (Number(input.value) > max) {
      input.value = max.toString();
    }
    setRoomRounds(Number(input.value));
  }

  useEffect(() => {
    if (socket) {
      console.log("Lobby:socket", socket);
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Mensagem recebida:lobby", data);

        if (data.type === "client-login" && !user) {
          console.log("Client login:lobby", data);
          setUser(data.client);
        }

        if (data.type === "room-created") {
          console.log("Room created:lobby", data);
          navigate(`/room/${data.roomId}`, {
            state: {
              roomData: data
            }
          });
        }

        if (data.type === "welcome-message") {
          console.log("Welcome message:lobby", data);
          if (roomId === data.roomId) {
            const roomData = data.roomData.pop() || null;
            if (roomData) {
              roomData.client = data.client;
              roomData.isJoining = true;
              navigate(`/room/${data.roomId}`, {
                state: {
                  roomData
                }
              });
            }
          }
        }
      }
    }
  }, [socket, navigate, roomId, setUser, user]);

  return (
    <>
      <Tabs defaultValue="create-room" className="w-[400px] h-[450px] overflow-hidden">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger className="hover:bg-slate-300" value="create-room">Create Room</TabsTrigger>
          <TabsTrigger className="hover:bg-slate-300" value="join-room">Join Room</TabsTrigger>
        </TabsList>
        <TabsContent value="create-room">
          <Card>
            <CardHeader>
              <CardTitle>Create room</CardTitle>
              <CardDescription>Choose a topic to start a game</CardDescription>
            </CardHeader>
            <CardContent>
              <form >
                <div className="my-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your room name" onChange={(e) => setRoomName(String(e.target.value))} />
                </div>
                <div className="my-2">
                  <Label htmlFor="topic">Choose a topic</Label>
                  {/* <Input id="topic" placeholder="Your topic" onChange={(e) => setRoomTopic(String(e.target.value))} /> */}
                  <Select onValueChange={(value) => setRoomTopic(String(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Topics</SelectLabel>
                        <SelectItem value="programming">Programming</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="my-2">
                  <Label htmlFor="rounds">How many rounds?</Label>
                  <Input id="rounds" placeholder="Number of rounds" type="number" min={1} max={10} onInput={onInput} defaultValue={1} />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button onClick={() => send({
                type: "create-room", data: {
                  message: {
                    name: roomName || "Room Default",
                    topic: roomTopic || "Default Topic",
                    roundQtt: roomRounds || 1,
                  }
                }
              })}>
                Create room
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="join-room">
          <Card>
            <CardHeader>
              <CardTitle>Join room</CardTitle>
              <CardDescription>Enter a room code to join</CardDescription>
            </CardHeader>
            <CardContent>
              <form >
                <div className="my-2">
                  <Label htmlFor="room-code">Room Code</Label>
                  <Input id="room-code" placeholder="Enter room code" onChange={(e) => setRoomId(String(e.target.value))} />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button onClick={() => {
                console.log("Joining room", roomId);
                send({
                  type: "join-room", data: {
                    roomId
                  }
                });
              }}>
                Join room
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}