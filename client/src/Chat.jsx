import { useEffect } from "react";
import { io } from "socket.io-client";

export default function Chat() {
  useEffect(() => {
    const { VITE_API_URL } = import.meta.env;
    const socket = io(VITE_API_URL);
    socket.on("connect", () => {
      console.log("Connected: ", socket.id);
      socket.emit("hello", "Hello from client!");
      socket.on("hi", (data) => {
        console.log(data);
      });
    });
    socket.on("disconnect", () => {
      console.log("Disconnected: ", socket.id);
    });

    return () => {
      socket.disconnect();
      console.log("Socket disconnected");
    };
  }, []);
  return <div>Chat</div>;
}
