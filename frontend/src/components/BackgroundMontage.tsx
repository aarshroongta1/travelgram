import { useState, useEffect } from "react";

const landmarks = [
  {
    id: 1,
    name: "Eiffel Tower, Paris",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 2,
    name: "The Colosseum, Rome",
    image:
      "https://images.pexels.com/photos/161858/rome-ancient-italy-landmark-161858.jpeg",
  },
  {
    id: 3,
    name: "Golden Gate Bridge, San Francisco",
    image: "https://images.pexels.com/photos/220765/pexels-photo-220765.jpeg",
  },
  {
    id: 4,
    name: "Taj Mahal, Agra",
    image:
      "https://images.unsplash.com/photo-1567255097545-018d2b9c414c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 5,
    name: "The Great Pyramid of Giza, Giza",
    image:
      "https://images.unsplash.com/photo-1708992485876-f193e746f6dd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },

  {
    id: 6,
    name: "The Statue of Liberty, New York",
    image: "https://images.pexels.com/photos/3615644/pexels-photo-3615644.jpeg",
  },
  {
    id: 7,
    name: "Big Ben, London",
    image:
      "https://cdn.pixabay.com/photo/2017/03/19/08/28/big-ben-2155828_1280.jpg",
  },
  {
    id: 8,
    name: "Sydney Opera House, Sydney",
    image:
      "https://images.unsplash.com/photo-1616128618694-96e9e896ecb7?q=80&w=2190&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 9,
    name: "Burj Khalifa, Dubai",
    image:
      "https://cdn.pixabay.com/photo/2020/03/11/14/32/burj-khalifa-4922315_1280.jpg",
  },
];

export function BackgroundMontage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % landmarks.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {landmarks.map((landmark, index) => (
        <div
          key={landmark.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={landmark.image}
            alt={landmark.name}
            className="w-full h-full object-cover scale-110 animate-[ken-burns_5s_ease-in-out_infinite_alternate]"
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-black/40"></div>

      <div className="absolute bottom-5 right-5 text-white/70 text-sm backdrop-blur-sm bg-black/20 px-3 py-1 rounded-full transition-opacity duration-1000">
        {landmarks[currentIndex].name}
      </div>
    </div>
  );
}

export default BackgroundMontage;
