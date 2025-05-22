import { useLocation } from "react-router-dom";

export default function ResetPassword() {
  const location = useLocation();
  console.log(location.state);
  return (
    <div>
      <h1>Reset Password</h1>
      <form>
        <input type="password" name="new_password" placeholder="New Password" />
        <input
          type="password"
          name="confirm_password"
          placeholder="Confirm Password"
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
}
