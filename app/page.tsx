"use client";

import React from "react";

import { useState, useEffect, useRef } from "react";

export default function Page() {
  const [clicked, setClicked] = useState(false);
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });
  const [failAttempts, setFailAttempts] = useState(0);
  const [showCat, setShowCat] = useState(false);
  const [firstNoAttemptTime, setFirstNoAttemptTime] = useState<number | null>(
    null
  );
  const [hearts, setHearts] = useState<
    Array<{ id: number; left: number; top: number }>
  >([]);
  const [confetti, setConfetti] = useState<
    Array<{ id: number; left: number; top: number; delay: number }>
  >([]);
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const heartIdRef = useRef(0);
  const confettiIdRef = useRef(0);
  const lastMoveTimeRef = useRef(0);
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Initialize no button position inline with yes button
  useEffect(() => {
    setNoButtonPos({ x: 0, y: 0 });
  }, []);

  // 12-second timer for cat appearance starting from first No attempt
  useEffect(() => {
    if (clicked || showCat || !firstNoAttemptTime) return;

    const timer = setTimeout(() => {
      setShowCat(true);
    }, 6000);

    return () => clearTimeout(timer);
  }, [clicked, showCat, firstNoAttemptTime]);

  // Track mouse and touch position to move No button away
  useEffect(() => {
    const checkProximityAndMove = (
      clientX: number,
      clientY: number,
      detectionRadius: number
    ) => {
      if (clicked || showCat) return;

      if (noButtonRef.current) {
        const rect = noButtonRef.current.getBoundingClientRect();
        const buttonCenterX = rect.left + rect.width / 2;
        const buttonCenterY = rect.top + rect.height / 2;
        const distance = Math.sqrt(
          Math.pow(clientX - buttonCenterX, 2) +
            Math.pow(clientY - buttonCenterY, 2)
        );

        // Move button away if within detection radius (with debounce)
        if (
          distance < detectionRadius &&
          Date.now() - lastMoveTimeRef.current > 200
        ) {
          moveNoButton();
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      // 80px detection radius for mouse (more precise)
      checkProximityAndMove(e.clientX, e.clientY, 80);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      // 120px detection radius for touch (fingers are less precise)
      checkProximityAndMove(touch.clientX, touch.clientY, 120);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [clicked, showCat]);

  const moveNoButton = () => {
    lastMoveTimeRef.current = Date.now();
    // 20s timer is started on first try to click (handleNoMouseDown), not here
    // Calculate boundaries to keep button fully visible
    const buttonWidth = 140;
    const buttonHeight = 70;
    const padding = 20;

    const maxX = window.innerWidth - buttonWidth - padding;
    const maxY = window.innerHeight - buttonHeight - padding;

    const randomX = Math.max(padding, Math.random() * maxX);
    const randomY = Math.max(padding, Math.random() * maxY);

    setNoButtonPos({ x: randomX, y: randomY });
    setFailAttempts((prev) => prev + 1);
  };

  const handleYesClick = () => {
    setClicked(true);
    setShowCat(false);

    // Create floating hearts
    const newHearts = Array.from({ length: 20 }, (_, i) => ({
      id: heartIdRef.current++,
      left: Math.random() * 100,
      top: 100,
    }));
    setHearts(newHearts);

    // Create confetti
    const newConfetti = Array.from({ length: 50 }, (_, i) => ({
      id: confettiIdRef.current++,
      left: Math.random() * 100,
      top: -10,
      delay: Math.random() * 0.5,
    }));
    setConfetti(newConfetti);
  };

  // Start timer on first try to click/tap No, then move button away
  const handleNoInteraction = () => {
    // Start timer on first attempt
    if (!firstNoAttemptTime) {
      setFirstNoAttemptTime(Date.now());
    }
    // Move button away
    moveNoButton();
  };

  const handleNoMouseDown = () => {
    handleNoInteraction();
  };

  const handleNoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleNoInteraction();
  };

  // Touch handler for mobile - move button when finger touches it
  // Note: Don't call preventDefault() here as React touch events are passive
  // The touch-none CSS class on the button handles preventing default behavior
  const handleNoTouchStart = () => {
    handleNoInteraction();
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-white to-red-50 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-scale" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-scale animation-delay-2000" />
      </div>

      {/* Floating hearts animation container */}
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute text-4xl animate-float pointer-events-none"
          style={{
            left: `${heart.left}%`,
            top: `${heart.top}%`,
            animation: `float ${2 + Math.random() * 2}s ease-out forwards`,
            opacity: Math.random() * 0.7 + 0.3,
          }}
        >
          ❤️
        </div>
      ))}

      {/* Confetti animation */}
      {confetti.map((item) => (
        <div
          key={item.id}
          className="absolute pointer-events-none"
          style={{
            left: `${item.left}%`,
            top: `${item.top}%`,
            animation: `float ${3 + Math.random() * 2}s ease-in forwards`,
            animationDelay: `${item.delay}s`,
            fontSize: "1.5rem",
          }}
        >
          {"💕🎉✨💖💝".split("")[Math.floor(Math.random() * 5)]}
        </div>
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6">
        {!clicked ? (
          <>
            {/* Main question */}
            <div className="mb-16 text-center animate-fade-in-scale">
              <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-red-500 mb-2 animate-pulse-scale">
                Will you be my
              </h1>
              <h2 className="text-6xl md:text-8xl font-black text-red-500 mb-8 animate-bounce-in">
                Valentine?
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 font-medium max-w-2xl mx-auto">
                Be honest... your heart already knows
              </p>
            </div>

            {/* Buttons container - both start inline */}
            <div className="relative flex gap-6 md:gap-10 items-center justify-center h-20">
              {/* Yes button */}
              <button
                onClick={handleYesClick}
                className="px-8 md:px-12 py-4 md:py-5 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold text-lg md:text-xl rounded-full hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg hover:shadow-2xl cursor-pointer whitespace-nowrap"
              >
                Yes ❤️
              </button>

              {/* No button - runs away on mouse hover/click and touch */}
              <button
                ref={noButtonRef}
                onMouseDown={handleNoMouseDown}
                onMouseEnter={handleNoClick}
                onClick={handleNoClick}
                onTouchStart={handleNoTouchStart}
                className="px-8 md:px-12 py-4 md:py-5 bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold text-lg md:text-xl rounded-full transition-all duration-200 shadow-lg cursor-pointer whitespace-nowrap touch-none"
                style={
                  noButtonPos.x === 0 && noButtonPos.y === 0
                    ? {}
                    : {
                        position: "fixed",
                        left: `${noButtonPos.x}px`,
                        top: `${noButtonPos.y}px`,
                        zIndex: 40,
                      }
                }
              >
                No
              </button>
            </div>

            {/* Attempt counter */}
            {failAttempts > 0 && (
              <p className="mt-10 text-gray-500 font-semibold text-center text-sm md:text-base">
                You are persistent! {failAttempts} attempts so far
              </p>
            )}
          </>
        ) : (
          <>
            {/* Success state */}
            <div className="text-center animate-pop-in">
              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-red-500 mb-6 animate-pulse-scale">
                Best answer ever!
              </h1>
              <p className="text-3xl md:text-5xl font-bold text-pink-600 mb-8">
                You just made my day
              </p>
              <div className="inline-block text-7xl md:text-8xl animate-bounce-in">
                💕
              </div>
              <p className="text-lg md:text-xl text-red-500 mt-8 font-medium">
                This is going to be amazing
              </p>
            </div>
          </>
        )}

        {/* Cat overlay - appears after 12 seconds */}
        {showCat && !clicked && (
          <>
            {/* Dimmed background overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-80 z-40 animate-fade-in-scale" />

            {/* Cat modal - centered like first image */}
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="text-center px-6 max-w-3xl animate-slide-up-pop">
                {/* Cat image */}
                <div className="mb-8 inline-block relative">
                  <img
                    src="/cat.png"
                    alt="Cute cat saying click Yes"
                    className="w-64 h-64 md:w-80 md:h-80 rounded-lg object-cover"
                    style={{
                      filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))",
                    }}
                  />
                </div>

                {/* Text content - like first image */}
                <div className="mt-8">
                  <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight drop-shadow-lg">
                    Time's up, buddy!
                  </h2>
                  <p className="text-xl md:text-2xl text-pink-100 mb-2 font-bold drop-shadow-md">
                    You had your chance
                  </p>
                  <p className="text-lg md:text-xl text-pink-200 font-medium drop-shadow-md leading-relaxed mb-8">
                    Now just click YES already! The cat's getting impatient
                  </p>

                  {/* Clickable button to close overlay and go back */}
                  <button
                    onClick={() => setShowCat(false)}
                    className="px-10 md:px-14 py-4 md:py-5 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold text-xl md:text-2xl rounded-full hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg hover:shadow-2xl cursor-pointer animate-pulse-glow"
                  >
                    Go click Yes! 💖
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center text-sm text-gray-500">
        Made by{" "}
        <a
          href="https://www.linkedin.com/in/mohamed-zhioua/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-600 hover:text-red-500 font-medium underline underline-offset-2 transition-colors"
        >
          Zhioua Mohamed
        </a>
      </footer>
    </div>
  );
}
