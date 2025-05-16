export type PlayerInfo = {
  nickname: string;
  client: string;
}

export type RoomInfo = {
  roomId: string;
  clients: string[];
  host: string;
  topic: string;
  rounds: number;
  type: string;
  playersInfo: PlayerInfo[]
  currentRound: number;
}