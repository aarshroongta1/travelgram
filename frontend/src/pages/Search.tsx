import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AutoComplete from "../components/AutoComplete";
import "../index.css";
import BackgroundMontage from "../components/BackgroundMontage";
import Navbar from "../components/Navbar";
import PhoneReelScroll from "../components/AnimateScroll";

interface City {
  id: string;
  name: string;
  region: string;
  country: string;
}

function Search() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const navigate = useNavigate();

  const handleClick = () => {
    if (selectedCity) {
      const query = selectedCity.name;
      navigate(`/results?city=${encodeURIComponent(query)}`);
    }
  };

  return (
    <>
      <div className="bg-gray-900 min-h-screen">
        <Navbar />
        <div className="absolute top-[7%] min-h-[88%] min-w-full bg-background overflow-hidden">
          <BackgroundMontage />
          <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4 text-white text-center">
            <span className="text-6xl mb-5 max-w-150 text-shadow-lg mt-15">
              Discover the World Through Reels
            </span>
            <div className="flex flex-col sm:flex-row items-center">
              <div className="w-90">
                <AutoComplete onSelect={setSelectedCity} />
              </div>
              <button
                onClick={handleClick}
                className="px-4 py-2 bg-black text-white shadow-inner shadow-white/10 rounded-2xl hover:bg-gray-900"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <PhoneReelScroll />
    </>
  );
}

export default Search;
