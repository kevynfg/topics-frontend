import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { useWebSocket } from "../context/websocket";

export default function Home() {
  const navigator = useNavigate();
  const { socket, send } = useWebSocket();
  return (
    <>
      <Card className="flex items-center justify-center flex-col w-[350px]">
        <CardHeader>
          <CardTitle>TopicS</CardTitle>
          <CardDescription>choose a topic, guess the answer</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Click "Start" to create or join a room</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => {
            navigator("/lobby");
          }} >Start</Button>
        </CardFooter>
      </Card>
    </>
  )
}