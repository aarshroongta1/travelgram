import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Hero() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <div data-aos="fade-up">
      <div className="text-white text-center">
        {isAuthenticated ? (
          <>
            <p className="text-5xl font-extrabold pt-3">
              View your saved reels
            </p>
            <div className="mt-5 text-2xl">
              <button
                onClick={() => navigate("/saved")}
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-colors duration-200"
              >
                Saved Reels
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-6xl font-extrabold">Travel Like A Local</p>
            <p className="text-xl text-gray-300 pt-3">
              <button
                onClick={() => navigate("/auth")}
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-1.5 mr-1 rounded-lg shadow-md transition-colors duration-200"
              >
                Log in
              </button>{" "}
              to save your favorite reels to plan your trip.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
