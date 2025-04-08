import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Link } from "react-router-dom";
import "@vidstack/react/player/styles/base.css";
import "@vidstack/react/player/styles/plyr/theme.css";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  PlyrLayout,
  plyrLayoutIcons,
} from "@vidstack/react/player/layouts/plyr";

const getGoogleOAuthUrl = () => {
  const { VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_REDIRECT_URI } = import.meta.env;
  const url = `https://accounts.google.com/o/oauth2/v2/auth`;
  const query = {
    client_id: VITE_GOOGLE_CLIENT_ID,
    redirect_uri: VITE_GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" "),
    prompt: "consent",
  };
  const queryString = new URLSearchParams(query).toString();
  return `${url}?${queryString}`;
};

const googleOathUrl = getGoogleOAuthUrl();

export default function Home() {
  return (
    <>
      <div>
        <span>
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </span>
        <span>
          <img src={reactLogo} className="logo react" alt="React logo" />
        </span>
      </div>
      <video controls width={500}>
        <source
          src="http://localhost:4000/static/video-stream/108db54f6f1edab3a40299100.mp4"
          type="video/mp4"
        />
      </video>
      <h2>HLS Streaming</h2>
      <MediaPlayer
        title="Sprite Fight"
        src={{
          src: "http://localhost:4000/static/video-hls/PspFDlyxkOKozrj5udPPA/master.m3u8",
        }}
        aspectRatio="16:9"
      >
        <MediaProvider />
        <PlyrLayout
          // thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt"
          icons={plyrLayoutIcons}
        />
      </MediaPlayer>

      <h1>Google OAuth 2.0</h1>

      <p className="read-the-docs">
        <Link to={googleOathUrl}>Login with Google</Link>
      </p>
    </>
  );
}
