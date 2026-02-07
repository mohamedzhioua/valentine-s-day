"use client";

import React from "react";

import { useState, useEffect, useRef, useCallback } from "react";

const YES_STAGES = [
  { text: "Yes ❤️", color: "from-red-500 to-pink-500", hoverColor: "hover:from-red-600 hover:to-pink-600" },
  { text: "Are you sure? 👀", color: "from-pink-500 to-rose-500", hoverColor: "hover:from-pink-600 hover:to-rose-600" },
  { text: "OMG really?? 😳💖", color: "from-rose-500 to-red-500", hoverColor: "hover:from-rose-600 hover:to-red-600" },
  { text: "YAY!! My mom already likes you 🥰", color: "from-red-500 via-pink-500 to-rose-500", hoverColor: "hover:from-red-600 hover:via-pink-600 hover:to-rose-600" },
  { text: "Okay okay… this is happening 😍", color: "from-pink-600 via-red-500 to-pink-600", hoverColor: "hover:from-pink-700 hover:via-red-600 hover:to-pink-700" },
  { text: "We should stay friends 😬", color: "from-gray-400 to-gray-500", hoverColor: "hover:from-gray-500 hover:to-gray-600" },
] as const;

export default function Page() {
  const [yesStage, setYesStage] = useState(0);
  const [clicked, setClicked] = useState(false);
  const [friendzoned, setFriendzoned] = useState(false);
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
  const [miniParticles, setMiniParticles] = useState<
    Array<{ id: number; x: number; y: number; emoji: string }>
  >([]);
  const [yesAnim, setYesAnim] = useState("");
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const yesButtonRef = useRef<HTMLButtonElement>(null);
  const miniParticleIdRef = useRef(0);
  const lastMoveTimeRef = useRef(0);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch device on mount
  useEffect(() => {
    const touchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(touchDevice);
    setNoButtonPos({ x: 0, y: 0 });
  }, []);

  // Timer for cat appearance - shorter on mobile (users have less patience)
  useEffect(() => {
    if (clicked || showCat || !firstNoAttemptTime) return;

    // 8 seconds on mobile, 12 seconds on desktop
    const timeoutDuration = isTouchDevice ? 8000 : 12000;

    const timer = setTimeout(() => {
      setShowCat(true);
    }, timeoutDuration);

    return () => clearTimeout(timer);
  }, [clicked, showCat, firstNoAttemptTime, isTouchDevice]);

  // Track mouse position to move No button away (desktop only)
  // On mobile, we rely on tap-to-escape which is simpler and more intuitive
  useEffect(() => {
    // Skip proximity detection on touch devices - tap is enough
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (clicked || showCat) return;

      if (noButtonRef.current) {
        const rect = noButtonRef.current.getBoundingClientRect();
        const buttonCenterX = rect.left + rect.width / 2;
        const buttonCenterY = rect.top + rect.height / 2;
        const distance = Math.sqrt(
          Math.pow(e.clientX - buttonCenterX, 2) +
            Math.pow(e.clientY - buttonCenterY, 2)
        );

        // Move button away if cursor within 80px (with debounce)
        if (distance < 80 && Date.now() - lastMoveTimeRef.current > 200) {
          moveNoButton();
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [clicked, showCat, isTouchDevice]);

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

  // Spawn mini particles around the Yes button
  const spawnMiniParticles = useCallback(() => {
    if (!yesButtonRef.current) return;
    const rect = yesButtonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const emojis = ["💕", "💖", "✨", "💗", "🩷", "💘"];

    const particles = Array.from({ length: 8 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 40 + Math.random() * 60;
      return {
        id: miniParticleIdRef.current++,
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      };
    });
    setMiniParticles(particles);
    setTimeout(() => setMiniParticles([]), 800);
  }, []);

  const handleYesClick = () => {
    const nextStage = yesStage + 1;

    if (nextStage < YES_STAGES.length - 1) {
      // Stages 1-4: playful escalation
      setYesStage(nextStage);
      setYesAnim("animate-wiggle");
      spawnMiniParticles();
      setTimeout(() => setYesAnim(""), 500);
    } else if (nextStage === YES_STAGES.length - 1) {
      // Final stage: the twist
      setYesStage(nextStage);
      setHearts([]);
      setConfetti([]);
      setMiniParticles([]);
      setYesAnim("animate-awkward-shake");
      setTimeout(() => {
        setYesAnim("");
        setFriendzoned(true);
      }, 700);
    }
  };

  const handleRetry = () => {
    setYesStage(0);
    setFriendzoned(false);
    setClicked(false);
    setShowCat(false);
    setNoButtonPos({ x: 0, y: 0 });
    setFailAttempts(0);
    setFirstNoAttemptTime(null);
    setHearts([]);
    setConfetti([]);
    setYesAnim("");
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
                ref={yesButtonRef}
                onClick={handleYesClick}
                className={`px-8 md:px-12 py-4 md:py-5 bg-gradient-to-r ${YES_STAGES[yesStage].color} text-white font-bold text-lg md:text-xl rounded-full ${YES_STAGES[yesStage].hoverColor} transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg hover:shadow-2xl cursor-pointer whitespace-nowrap ${yesAnim}`}
              >
                {YES_STAGES[yesStage].text}
              </button>

              {/* Mini particles around Yes button */}
              {miniParticles.map((p) => (
                <div
                  key={p.id}
                  className="fixed pointer-events-none text-xl"
                  style={{
                    left: `${p.x}px`,
                    top: `${p.y}px`,
                    animation: "mini-heart-float 0.8s ease-out forwards",
                    zIndex: 60,
                  }}
                >
                  {p.emoji}
                </div>
              ))}

              {/* No button - runs away on mouse hover/click and touch tap */}
              {!friendzoned && (
                <button
                  ref={noButtonRef}
                  onMouseDown={handleNoMouseDown}
                  onMouseEnter={!isTouchDevice ? handleNoClick : undefined}
                  onClick={handleNoClick}
                  onTouchStart={handleNoTouchStart}
                  className="px-8 md:px-12 py-4 md:py-5 bg-gray-300 hover:bg-gray-400 active:bg-gray-500 active:scale-90 text-gray-700 font-bold text-lg md:text-xl rounded-full shadow-lg cursor-pointer whitespace-nowrap touch-none select-none"
                  style={
                    noButtonPos.x === 0 && noButtonPos.y === 0
                      ? { transition: "transform 0.1s ease-out" }
                      : {
                          position: "fixed",
                          left: `${noButtonPos.x}px`,
                          top: `${noButtonPos.y}px`,
                          zIndex: 40,
                          transition:
                            "left 0.15s ease-out, top 0.15s ease-out, transform 0.1s ease-out",
                        }
                  }
                >
                  No
                </button>
              )}
            </div>

            {/* Friendzoned overlay - full screen like cat overlay */}
            {friendzoned && (
              <>
                {/* Dimmed background overlay */}
                <div className="fixed inset-0 bg-black bg-opacity-80 z-40 animate-fade-in-scale" />

                {/* Friendzone modal - centered like cat */}
                <div className="fixed inset-0 flex items-center justify-center z-50">
                  <div className="text-center px-6 max-w-3xl animate-slide-up-pop">
                    {/* Friends GIF */}
                    <div className="mb-8 inline-block relative">
                      <img
                        src="/friends.gif"
                        alt="Just friends..."
                        className="w-64 h-64 md:w-80 md:h-80 rounded-lg object-cover"
                        style={{
                          filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))",
                        }}
                      />
                    </div>

                    {/* Text content - like cat overlay */}
                    <div className="mt-8">
                      <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight drop-shadow-lg">
                        Friendzoned! 😅
                      </h2>
                      <p className="text-xl md:text-2xl text-pink-100 mb-2 font-bold drop-shadow-md">
                        Well... at least we can still be friends?
                      </p>
                      <p className="text-lg md:text-xl text-pink-200 font-medium drop-shadow-md leading-relaxed mb-8">
                        But hey, maybe you want to reconsider? 💭
                      </p>

                      {/* Clickable button to retry */}
                      <button
                        onClick={handleRetry}
                        className="px-10 md:px-14 py-4 md:py-5 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold text-xl md:text-2xl rounded-full hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg hover:shadow-2xl cursor-pointer animate-pulse-glow"
                      >
                        Wait, let me reconsider... 💕
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Attempt counter */}
            {failAttempts > 0 && !friendzoned && (
              <p className="mt-10 text-gray-500 font-semibold text-center text-sm md:text-base">
                You are persistent! {failAttempts} attempts so far
              </p>
            )}
          </>
        ) : null}

        {/* Cat overlay - appears after timeout */}
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

      {/* Friends GIF overlay - appears when user clicks Yes (celebration!) */}
      {clicked && (
        <>
          {/* Dimmed background overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] animate-fade-in-scale" />

          {/* Friends modal - centered like first image */}
          <div className="fixed inset-0 flex items-center justify-center z-[70]">
            <div className="text-center px-6 max-w-3xl animate-slide-up-pop">
              {/* Friends GIF */}
              <div className="mb-8 inline-block relative">
                <img
                  src="/friends.gif"
                  alt="Excited celebration!"
                  className="w-64 h-64 md:w-80 md:h-80 rounded-lg object-cover"
                  style={{
                    filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))",
                  }}
                />
              </div>

              {/* Text content - like first image */}
              <div className="mt-8">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight drop-shadow-lg">
                  YAAAY! 🎉
                </h2>
                <p className="text-xl md:text-2xl text-pink-100 mb-2 font-bold drop-shadow-md">
                  Best answer ever!
                </p>
                <p className="text-lg md:text-xl text-pink-200 font-medium drop-shadow-md leading-relaxed mb-8">
                  You just made someone very happy 💕
                </p>

                {/* Clickable button to close overlay and go back */}
                <button
                  onClick={() => setClicked(false)}
                  className="px-10 md:px-14 py-4 md:py-5 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold text-xl md:text-2xl rounded-full hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg hover:shadow-2xl cursor-pointer animate-pulse-glow"
                >
                  Amazing! 💖
                </button>
              </div>
            </div>
          </div>
        </>
      )}

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
