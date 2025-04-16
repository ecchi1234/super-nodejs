/* eslint-disable no-unused-vars */
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Login() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  useEffect(() => {
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const new_user = params.get("new_user");
    const verify = params.get("verify");

    // test UI cho trường hợp login
    // trường hợp register tự custom thêm
    // Dựa vào new_user để biết user mới hay cũ
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    navigate("/");
  }, [navigate, params]);
  return <div>Login</div>;
}
