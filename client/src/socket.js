import { io } from "socket.io-client";
const { VITE_API_URL } = import.meta.env;
const socket = io(VITE_API_URL);

export default socket;
