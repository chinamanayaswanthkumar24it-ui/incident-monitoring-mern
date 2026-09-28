import { io } from "socket.io-client";

const socketURL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// One shared socket instance for the whole app, connected lazily.
let socket;

export function getSocket() {
  if (!socket) {
    socket = io(socketURL, { autoConnect: true, transports: ["websocket", "polling"] });
  }
  return socket;
}
