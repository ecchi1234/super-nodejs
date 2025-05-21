import useQueryParams from "./useQueryParams";
import axios from "axios";
import { useEffect, useState } from "react";

export default function VerifyEmail() {
  const [message, setMessage] = useState("");
  const { token } = useQueryParams();

  useEffect(() => {
    const controller = new AbortController();
    if (token) {
      axios
        .post(
          `/users/verify-email`,
          { email_verify_token: token },
          {
            baseURL: import.meta.env.VITE_API_URL,
            signal: controller.signal,
          }
        )
        .then((res) => {
          setMessage(res.data.message);
          if (res.data.result) {
            localStorage.setItem("access_token", res.data.result.access_token);
            localStorage.setItem(
              "refresh_token",
              res.data.result.refresh_token
            );
          }
        })
        .catch((err) => {
          setMessage(err.response.data.message);
        });
    }

    return () => {
      controller.abort();
    };
  }, [token]);
  return <div>{message}</div>;
}
