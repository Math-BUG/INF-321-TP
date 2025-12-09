"use client";

import React, { useEffect, useState, useRef } from "react";
import * as Tone from "tone";

type RoundUIProps = {
  roundNumber: number;
  totalRounds: number;
  timePerRound: number;
  numOptions: number;
  canReplayTarget: boolean;
  canReplayOptions: boolean;
  canPause: boolean;
  onRoundComplete: (selectedOption: number, isCorrect: boolean) => void;
  onClose: () => void;
  challengeIdentifier?: string;
};

type Phase = "animation" | "running" | "result";

// Notas musicais de C4 a B5
const NOTE_RANGE = [
  "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
  "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5"
];

export default function RoundUI({
  roundNumber,
  totalRounds,
  timePerRound,
  numOptions,
  canReplayTarget,
  canReplayOptions = false,
  canPause = false,
  onRoundComplete,
  onClose,
  challengeIdentifier = "notes-differentiation"
}: RoundUIProps) {
  const [phase, setPhase] = useState<Phase>("animation");
  const [timeRemaining, setTimeRemaining] = useState(timePerRound * 1000);
  const [correctOption, setCorrectOption] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [playedOptions, setPlayedOptions] = useState<Set<number>>(new Set());
  const [targetPlayed, setTargetPlayed] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [optionNotes, setOptionNotes] = useState<string[]>([]);
  const [targetNote, setTargetNote] = useState<string>("");
  const [isPaused, setIsPaused] = useState(false);
  const synthRef = useRef<Tone.Synth | null>(null);
  const successSoundRef = useRef<Tone.Player | null>(null);
  const errorSoundRef = useRef<Tone.Player | null>(null);
  const audioInitialized = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !synthRef.current) {
      synthRef.current = new Tone.Synth({
        oscillator: {
          type: "sine"
        },
        envelope: {
          attack: 0.05,
          decay: 0.2,
          sustain: 0,
          release: 1
        },
        volume: -10
      }).toDestination();
      
      const reverb = new Tone.Reverb({
        decay: 2,
        preDelay: 0.01
      }).toDestination();
      
      synthRef.current.connect(reverb);

      successSoundRef.current = new Tone.Player().toDestination();
      errorSoundRef.current = new Tone.Player().toDestination();
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
        synthRef.current = null;
      }
      if (successSoundRef.current) {
        successSoundRef.current.dispose();
        successSoundRef.current = null;
      }
      if (errorSoundRef.current) {
        errorSoundRef.current.dispose();
        errorSoundRef.current = null;
      }
    };
  }, []);

  const playNote = async (note: string, duration: string = "1n") => {
    if (!synthRef.current) return;
    
    if (!audioInitialized.current) {
      await Tone.start();
      audioInitialized.current = true;
    }
    
    synthRef.current.triggerAttackRelease(note, duration);
  };

  const playSuccessSound = async () => {
    if (!synthRef.current) return;
    
    if (!audioInitialized.current) {
      await Tone.start();
      audioInitialized.current = true;
    }

    const now = Tone.now();
    synthRef.current.triggerAttackRelease("C5", "8n", now);
    synthRef.current.triggerAttackRelease("E5", "8n", now + 0.1);
    synthRef.current.triggerAttackRelease("G5", "8n", now + 0.2);
    synthRef.current.triggerAttackRelease("C6", "4n", now + 0.3);
  };

  const playErrorSound = async () => {
    if (!synthRef.current) return;
    
    if (!audioInitialized.current) {
      await Tone.start();
      audioInitialized.current = true;
    }

    const now = Tone.now();
    synthRef.current.triggerAttackRelease("E4", "8n", now);
    synthRef.current.triggerAttackRelease("E4", "8n", now + 0.15);
    synthRef.current.triggerAttackRelease("C4", "4n", now + 0.3);
  };

  useEffect(() => {
    setPhase("animation");
    setAnimationStep(0);
    setTimeRemaining(timePerRound * 1000);
    setSelectedOption(null);
    setPlayedOptions(new Set());
    setTargetPlayed(false);

    const shuffled = [...NOTE_RANGE].sort(() => Math.random() - 0.5);
    const selectedNotes = shuffled.slice(0, numOptions);
    setOptionNotes(selectedNotes);


    const correctIdx = Math.floor(Math.random() * numOptions);
    setCorrectOption(correctIdx + 1);
    setTargetNote(selectedNotes[correctIdx]);
  }, [roundNumber, timePerRound, numOptions]);

  useEffect(() => {
    if (phase !== "animation") return;

    let animationDuration = 2000;
    
    const playSoundForStep = async () => {
      if (!audioInitialized.current && synthRef.current) {
        try {
          await Tone.start();
          audioInitialized.current = true;
        } catch (error) {
          console.error("Error starting Tone.js:", error);
        }
      }

      if (animationStep < numOptions) {
        await playNote(optionNotes[animationStep], "1n");
      } else if (animationStep === numOptions) {
        setTargetPlayed(true);
        await playNote(targetNote, "1n");
        setTimeout(() => setTargetPlayed(false), animationDuration/2);
        animationDuration = 0;
      }
    };

    playSoundForStep();

    const delay = setTimeout(() => {
      if (animationStep < numOptions) {
        setAnimationStep(animationStep + 1);
      } else if (animationStep === numOptions) {
        setAnimationStep(animationStep + 1);
      } else {
        setPhase("running");
        setTimeRemaining(timePerRound * 1000);
      }
    }, animationDuration);

    return () => clearTimeout(delay);
  }, [phase, animationStep, numOptions, timePerRound, optionNotes, targetNote]);

  useEffect(() => {
    if (phase !== "running" || isPaused) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 100;
        if (newTime <= 0) {
          clearInterval(interval);
          return 0;
        }
        return newTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [phase, isPaused]);

  useEffect(() => {
    if (phase === "running" && timeRemaining <= 0) {
      setPhase("result");
      setSelectedOption(0);
      playErrorSound();
      setTimeout(() => {
        onRoundComplete(0, false);
      }, 1500);
    }
  }, [timeRemaining, phase, onRoundComplete]);

  const handleTargetReplay = async () => {
    if (!canReplayTarget) return;
    setTargetPlayed(true);
    await playNote(targetNote, "1n");
    setTimeout(() => setTargetPlayed(false), 500);
  };

  const handleOptionPlay = async (optionNum: number) => {
    if (isPaused) return;
    const noteIndex = optionNum - 1;
    if (noteIndex >= 0 && noteIndex < optionNotes.length) {
      await playNote(optionNotes[noteIndex], "1n");
    }
    
    const newPlayed = new Set(playedOptions);
    newPlayed.add(optionNum);
    setPlayedOptions(newPlayed);
    setTimeout(() => {
      setPlayedOptions(new Set([...newPlayed].filter((x) => x !== optionNum)));
    }, 500);
  };

  const handleOptionSelect = async (optionNum: number) => {
    if (phase !== "running" || isPaused) return;

    setSelectedOption(optionNum);
    setPhase("result");
    const isCorrect = optionNum === correctOption;

    if (isCorrect) {
      await playSuccessSound();
    } else {
      await playErrorSound();
    }

    setTimeout(() => {
      onRoundComplete(optionNum, isCorrect);
    }, isCorrect ? 3000 : 1500);
  };

  const timePercentage = (timeRemaining / (timePerRound * 1000)) * 100;

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        background: "#0f172a",
        color: "white",
        padding: 24,
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Pause button (only during running phase and if enabled) */}
      {phase === "running" && canPause && (
        <div style={{ position: "absolute", top: 12, left: 24, zIndex: 10 }}>
          <button
            onClick={() => setIsPaused(!isPaused)}
            aria-label="Pausar"
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: 24,
              cursor: "pointer",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            ⏸
          </button>
        </div>
      )}

      {/* Close button */}
      <div style={{ position: "absolute", top: 16, right: 16 }}>
        <button
          onClick={onClose}
          aria-label="Fechar"
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            fontSize: 24,
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      {/* Time bar */}
      <div
        style={{
          height: 8,
          background: "#1e293b",
          borderRadius: 4,
          overflow: "hidden",
          marginBottom: 16,
          marginLeft: phase === "running" && canPause ? 64 : 0,
        }}
      >
        <div
          style={{
            height: "100%",
            background: phase === "running" ? "#f87171" : "#475569",
            width: `${timePercentage}%`,
            transition: phase === "running" ? "width 0.1s linear" : "none",
          }}
        />
      </div>

      {/* Round indicator */}
      <h2 style={{ marginBottom: 32, fontSize: 24, textAlign: "center" }}>
        Rodada {roundNumber} de {totalRounds}
      </h2>

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
        }}
      >
        {/* Target sound button */}
        <button
          onClick={handleTargetReplay}
          disabled={phase === "animation" || phase === "result" || !canReplayTarget || isPaused}
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: "3px solid " + (targetPlayed ? "#ec4899" : "#64748b"),
            background: "transparent",
            color: targetPlayed ? "#ec4899" : "#cbd5e1",
            fontSize: 32,
            cursor: phase === "running" && canReplayTarget && !isPaused ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: phase === "animation" || !canReplayTarget || isPaused ? 0.5 : 1,
          }}
        >
          ♪
        </button>

        {/* Options grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              numOptions <= 2
                ? "1fr 1fr"
                : numOptions <= 4
                  ? "1fr 1fr"
                  : "1fr 1fr 1fr",
            gap: 16,
            maxWidth: 600,
          }}
        >
          {Array.from({ length: numOptions }).map((_, i) => {
            const optionNum = i + 1;
            let buttonColor = "#475569";
            let borderColor = "#64748b";

            if (phase === "animation") {
              if (animationStep < numOptions && animationStep === i) {
                buttonColor = "#3b82f6";
                borderColor = "#1d4ed8";
              }
            } else if (phase === "running" && playedOptions.has(optionNum)) {
              buttonColor = "#3b82f6";
              borderColor = "#1d4ed8";
            } else if (selectedOption === optionNum && phase === "result") {
              if (optionNum === correctOption) {
                buttonColor = "#10b981";
                borderColor = "#059669";
              } else {
                buttonColor = "#ef4444";
                borderColor = "#dc2626";
              }
            }

            const isPlayButtonActive =
              playedOptions.has(optionNum) && phase === "animation" && animationStep === i;

            return (
              <div
                key={optionNum}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <button
                  onClick={() => handleOptionPlay(optionNum)}
                  disabled={phase !== "running" || !canReplayOptions || isPaused}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    border: "2px solid " + (isPlayButtonActive ? "#1d4ed8" : "#475569"),
                    background: isPlayButtonActive ? "#3b82f6" : "transparent",
                    color: isPlayButtonActive ? "white" : "#cbd5e1",
                    fontSize: 20,
                    cursor: phase === "running" && canReplayOptions && !isPaused ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: phase !== "running" || !canReplayOptions || isPaused ? 0.5 : 1,
                  }}
                >
                  ♪
                </button>

                <button
                  onClick={() => handleOptionSelect(optionNum)}
                  disabled={phase !== "running" || isPaused}
                  style={{
                    flex: 1,
                    padding: "16px 24px",
                    borderRadius: 8,
                    border: "2px solid #64748b",
                    background: buttonColor,
                    color: "white",
                    fontSize: 18,
                    fontWeight: "bold",
                    cursor: phase === "running" && !isPaused ? "pointer" : "not-allowed",
                    transition: "all 0.3s ease",
                    opacity: isPaused ? 0.5 : 1,
                  }}
                >
                  Opção {optionNum}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pause overlay */}
      {isPaused && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 32,
            zIndex: 1000,
          }}
        >
          <div
            style={{
              fontSize: 120,
              color: "white",
              textAlign: "center",
            }}
          >
            ⏸
          </div>
          <button
            onClick={() => setIsPaused(false)}
            style={{
              background: "#10b981",
              border: "none",
              color: "white",
              fontSize: 24,
              padding: "16px 32px",
              borderRadius: 12,
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
            }}
          >
            ▶ Continuar
          </button>
        </div>
      )}
    </div>
  );
}
