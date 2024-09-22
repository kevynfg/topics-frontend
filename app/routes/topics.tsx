import { LoaderFunctionArgs } from "@remix-run/node";
import { Button } from "app/components/ui/button";
import Wrapper from "app/components/ui/wrapper";
import { useSocket } from "app/context";
import { getSession } from "app/lib/session";
import { useEffect } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookies = getSession(request);
  return cookies || null;
}

export default function Topics() {
  const socket = useSocket();
  const createRoom = async () => {
    if (socket) {
      socket.send(JSON.stringify({
        "type": "create-room",
        "data": {
          "topic": "galera",
          "gameMinutesDuration": 5,
          "roundSecondsDuration": 30,
          "maxPlayers": 5
        }
      }));
    }
  }

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      console.log("event", event);
      //read blob from event.data and convert it to string base64 to show image
      if (event.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement("img");
          img.src = e.target.result as string;
          document.body.appendChild(img);
        };
        reader.readAsDataURL(event.data);
        console.log("event.data", event.data);
      }
    }

  }, [socket]);

  return (
    <Wrapper>
      <div className="flex items-center justify-center flex-col gap-8">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">Start a game or join one</h1>
        <div className="flex flex-row gap-2">
          <Button onClick={createRoom}>Create room</Button>
          <Button>Join room</Button>
        </div>
      </div>
    </Wrapper>
  )
}