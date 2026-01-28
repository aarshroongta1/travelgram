import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const toggleMode = () => setIsLogin(!isLogin);

  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!email || !password) return;

      if (isLogin) {
        await login(email, password);
        showMessage("Logged in successfully!", "success");
        navigate("/");
      } else {
        await signup(email, password);
        showMessage("Signed up successfully! Check your email to confirm.", "success");
        navigate("/");
      }
    } catch (err: any) {
      const message = err?.message || "Login or sign-up failed. Please try again.";
      showMessage(message, "error");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      {message && (
        <div
          className={`absolute top-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded text-white text-center transition-opacity duration-500 ${
            message.type === "success" ? "bg-green-700" : "bg-red-700"
          }`}
        >
          {message.text}
        </div>
      )}
      <div className="bg-slate-800 p-10 rounded shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">
          {isLogin ? "Log In to Travelgram" : "Create Your Travelgram Account"}
        </h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            required
            className="p-2 border border-gray-400 rounded-md text-gray-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="p-2 border border-gray-400 rounded-md text-gray-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded-lg shadow-md transition-colors duration-200"
          >
            {isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>

        <div className="text-center mt-4 text-sm text-gray-200">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            className="text-gray-400 font-medium underline"
            onClick={toggleMode}
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
