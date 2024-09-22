

const url = process.env.BACKEND_URL || "ws://localhost:3000";
export function connectToWebSocket() {
  return new WebSocket(`${url}/ws/room/create`);
}