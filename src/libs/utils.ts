import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { RoomInfo } from "../types/RoomInfo"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function eventType<T extends string>(event: T) {
  return event
}

export const getPlayerNickname = (client: string, roomInfo: RoomInfo) => {
  console.log("getPlayerNickname", client, roomInfo);
  if (roomInfo && roomInfo.playersInfo) {
    const player = roomInfo.playersInfo.find((player) => player.client === client);
    if (player) {
      return player.nickname;
    }
  }
  return "Unknown";
}