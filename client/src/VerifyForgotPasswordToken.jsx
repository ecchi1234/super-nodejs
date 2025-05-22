import { useEffect, useState } from "react";
import axios from "axios";
import useQueryParams from "./useQueryParams";
import { useNavigate } from "react-router-dom";

export default function VerifyForgotPasswordToken() {
  const [message, setMessage] = useState("");
  const { token } = useQueryParams();
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    if (token) {
      axios
        .post(
          `/users/verify-forgot-password`,
          { forgot_password_token: token },
          {
            baseURL: import.meta.env.VITE_API_URL,
            signal: controller.signal,
          }
        )
        .then(() => {
          // Bên cái trang reset password của chúng ta nó cần cái forgot_password_token để gửi lên API
          // Ở đây chúng ta có 2 cách để cái trang Reset Password để nhận cái token này
          // 1. Tại đây chúng ta lưu nó vào localStorage
          // Và bên trang Reset Password chúng ta sẽ lấy nó ra

          // Cách 2: Dùng state của react router để truyền cái forgot_password_token này
          navigate("/reset-password", {
            state: { forgot_passowrd_token: token },
          });
        })
        .catch((err) => {
          setMessage(err.response.data.message);
        });
    }

    return () => {
      controller.abort();
    };
  }, [navigate, token]);
  return <div>{message}</div>;
}
