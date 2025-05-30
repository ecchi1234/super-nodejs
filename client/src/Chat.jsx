import { useEffect, useState } from "react";
import socket from "./socket";
import axios from "axios";

const profile = JSON.parse(localStorage.getItem("profile"));
const usernames = [
  {
    name: "user1",
    value: "user67ee5c34c762460f5c091c36",
  },
  {
    name: "user2",
    value: "user68189541e10ebf779e4d34a9",
  },
];
export default function Chat() {
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState("");
  const getProfile = (username) => {
    axios
      .get(`/users/${username}`, {
        baseURL: import.meta.env.VITE_API_URL,
      })
      .then((res) => {
        setReceiver(res.data.result._id);
        alert(`You are now chatting with ${res.data.result.name}`);
      });
  };
  useEffect(() => {
    socket.auth = {
      _id: profile._id,
    };
    socket.connect();
    socket.on("receive private message", (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          content: data.content,
          isSender: data.from === profile._id, // Check if the message is from the current user
        },
      ]);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    socket.emit("private message", {
      content: value,
      to: receiver, // user_id
      from: profile._id, // user_id
    });

    setValue("");

    setMessages((prevMessages) => [
      ...prevMessages,
      { content: value, isSender: true },
    ]);
  };

  return (
    <div>
      <h1>Chat</h1>
      <div>
        {usernames.map((username) => (
          <div key={username.name}>
            <button onClick={() => getProfile(username.value)}>
              {username.name}
            </button>
          </div>
        ))}
      </div>
      <div className="chat">
        {messages.map((message, index) => (
          <div key={index}>
            <div className="message-container">
              <div
                className={
                  "message " + (message.isSender ? "message-right" : "")
                }
              >
                {message.content}
              </div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
