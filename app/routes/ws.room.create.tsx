import { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  console.log("WebSocket route is ready", request);
  return new Response("WebSocket route is ready", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
};

export default function WsRoomCreate() {
  return (
    <div>
      <h1>WebSocket Room Create</h1>
      <p>This route is used for WebSocket connections.</p>
    </div>
  );
}