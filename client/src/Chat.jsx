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
  const [conversations, setConversations] = useState([]);
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
    socket.on("receive_message", (data) => {
      const { payload } = data;
      setConversations((prevMessages) => [...prevMessages, payload]);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (receiver) {
      axios
        .get(`/conversations/receivers/${receiver}`, {
          baseURL: import.meta.env.VITE_API_URL,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },

          params: {
            page: 1,
            limit: 10,
          },
        })
        .then((res) => {
          setConversations(res.data.result.conversations);
        });
    }
  }, [receiver]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const conversation = {
      content: value,
      sender_id: profile._id, // user_id
      receiver_id: receiver, // user_id
    };
    socket.emit("send_message", {
      payload: conversation,
    });

    setValue("");

    setConversations((conversations) => [
      ...conversations,
      { ...conversation, _id: new Date().getTime() },
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
        {conversations.map((conversation) => (
          <div key={conversation._id}>
            <div className="message-container">
              <div
                className={
                  "message " +
                  (conversation.sender_id === profile._id
                    ? "message-right"
                    : "")
                }
              >
                {conversation.content}
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
