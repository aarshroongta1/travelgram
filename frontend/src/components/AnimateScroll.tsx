import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import Reelui from "./ReelUI";
import Hero from "./Hero";

interface Reel {
  id: number;
  category: string;
  thumbnail: string;
}

const PhoneReelScroll: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const reels: Reel[] = [
    {
      id: 1,
      category: "Cafes",
      thumbnail:
        "https://images.unsplash.com/photo-1564327368633-151ef1d45021?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: 2,
      category: "Hotels",
      thumbnail:
        "https://images.pexels.com/photos/2873951/pexels-photo-2873951.jpeg",
    },
    {
      id: 3,
      category: "Nightlife",
      thumbnail:
        "https://images.unsplash.com/photo-1571872175163-354a582405a4?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fG5pZ2h0bGlmZXxlbnwwfDF8MHx8fDA%3D",
    },
    {
      id: 4,
      category: "Adventure",
      thumbnail:
        "https://images.unsplash.com/photo-1568454537842-d933259bb258?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Njd8fGFkdmVudHVyZXxlbnwwfDF8MHx8fDA%3D",
    },
    {
      id: 5,
      category: "Art",
      thumbnail:
        "https://plus.unsplash.com/premium_photo-1661896580759-c9c8f1a4862a?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8bXVzZXVtfGVufDB8MXwwfHx8MA%3D%3D",
    },
    {
      id: 5,
      category: "And more...",
      thumbnail:
        "https://images.pexels.com/photos/2074109/pexels-photo-2074109.jpeg",
    },
  ];

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const reelProgress = useTransform(
    scrollYProgress,
    [0, 1],
    [0, reels.length - 1]
  );

  useEffect(() => {
    const unsubscribe = reelProgress.on("change", (latest) => {
      const newIndex = Math.round(latest);
      if (
        newIndex !== currentReelIndex &&
        newIndex >= 0 &&
        newIndex < reels.length
      ) {
        setDirection(newIndex > currentReelIndex ? 1 : -1);
        setCurrentReelIndex(newIndex);
      }
    });

    return () => unsubscribe();
  }, [reelProgress, currentReelIndex, reels.length]);

  const slideVariants = {
    enter: (direction: number) => ({
      y: direction > 0 ? "100%" : "-100%",
    }),
    center: {
      y: "0%",
    },
    exit: (direction: number) => ({
      y: direction < 0 ? "100%" : "-100%",
    }),
  };

  return (
    <div className="bg-gray-900 pt-10">
      <Hero />
      <section
        ref={containerRef}
        className="relative bg-gradient-to-br from-slate-900 via-gray-900 to-black"
        style={{ height: `${reels.length * 100}vh` }}
      >
        <div className="sticky top-0 h-screen">
          {/* Phone Mockup */}
          <div className="absolute left-[40%] top-[57%] transform -translate-x-1/2 -translate-y-1/2">
            <Reelui />

            <div className="relative w-80 h-[700px]">
              <img
                src="/src/photos/phone-mockup.png"
                alt="Phone mockup"
                className="absolute inset-0 w-[90%] h-[90%] object-contain z-10"
              />

              {/* Thumbnails */}
              <div
                className="absolute top-8 left-3 right-10 bottom-26 overflow-hidden"
                style={{ borderRadius: "2.5rem" }}
              >
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={currentReelIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      duration: 0.25,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    className="absolute inset-0"
                  >
                    <img
                      src={reels[currentReelIndex]?.thumbnail}
                      alt={reels[currentReelIndex]?.category}
                      className="w-full h-full object-cover"
                      style={{ borderRadius: "2.5rem" }}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Category Text */}
          <div className="absolute left-[55%] top-1/2 transform -translate-y-1/2 max-w-lg z-10 text-center">
            <motion.h2
              className="text-6xl md:text-7xl font-black text-white"
              key={currentReelIndex}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              {reels[currentReelIndex]?.category}
            </motion.h2>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PhoneReelScroll;
