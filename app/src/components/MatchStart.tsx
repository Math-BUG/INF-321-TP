"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchLevelDetails, createMatch, updateMatchResults } from "../app/actions/match";
import RoundUI from "./RoundUI";
import MatchResults from "./MatchResults";
import { getOngoingMatch } from "./OngoingMatchModal";

type Props = {
  challengeId?: number | null;
  levelId?: number | null;
  name: string;
  instructions?: string | null;
  levels?: Array<{ id: number; name: string }>;
  userId?: number;
};

type GameState = "start" | "playing" | "finished";

export default function MatchStart({ 
  challengeId, 
  levelId: initialLevelId, 
  name, 
  instructions, 
  levels = [],
  userId = 1 // TODO: get from session/context
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldResume = searchParams?.get("resume") === "true";
  
  const [selectedLevelId, setSelectedLevelId] = React.useState<number | null>(initialLevelId || null);
  const [gameState, setGameState] = useState<GameState>("start");
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(0);
  const [timePerRound, setTimePerRound] = useState(30);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalIncorrect, setTotalIncorrect] = useState(0);
  const [numOptions, setNumOptions] = useState(2);
  const [canReplayTarget, setCanReplayTarget] = useState(false);
  const [canReplayOptions, setCanReplayOptions] = useState(false);
  const [canPause, setCanPause] = useState(false);
  const [challengeIdentifier, setChallengeIdentifier] = useState("notes-differentiation");
  const [isLoading, setIsLoading] = useState(false);

  // Check if we should resume from cookie
  useEffect(() => {
    if (shouldResume) {
      const ongoingMatch = getOngoingMatch();
      if (ongoingMatch && 
          ongoingMatch.challengeId === challengeId && 
          ongoingMatch.levelId === initialLevelId) {
        // Resume match from cookie
        resumeMatch(ongoingMatch);
      }
    }
  }, [shouldResume, challengeId, initialLevelId]);

  const resumeMatch = async (matchData: any) => {
    setIsLoading(true);
    try {
      const levelDetails = await fetchLevelDetails(matchData.levelId);
      if (!levelDetails) {
        alert("Nível não encontrado!");
        return;
      }

      setSelectedLevelId(matchData.levelId);
      setTotalRounds(matchData.totalRounds);
      setCurrentRound(matchData.currentRound);
      setTotalCorrect(matchData.totalCorrect);
      setTotalIncorrect(matchData.totalIncorrect);
      setTimePerRound(levelDetails.timePerRound);
      setChallengeIdentifier(levelDetails.challenge?.identifier || "notes-differentiation");

      // Parse parameters
      const paramMap: Record<string, string> = {};
      levelDetails.parameterVals.forEach((pv) => {
        if (pv.parameter?.identifier) {
          paramMap[pv.parameter.identifier] = pv.value || "false";
        }
      });

      setNumOptions(parseInt(paramMap["numero-de-opcoes"] || "2", 10));
      setCanReplayTarget(paramMap["replay-nota-alvo"] === "true");
      setCanReplayOptions(paramMap["replay-de-opcoes"] === "true");
      setCanPause(paramMap["pode-pausar"] === "true");

      setGameState("playing");
    } catch (error) {
      console.error("Error resuming match:", error);
      alert("Erro ao retomar a partida!");
    } finally {
      setIsLoading(false);
    }
  };

  // Save match state to cookie
  const saveMatchToCookie = (round?: number, correct?: number, incorrect?: number) => {
    const matchData = {
      userId,
      challengeId,
      levelId: selectedLevelId,
      challengeName: name,
      currentRound: round ?? currentRound,
      totalRounds,
      totalCorrect: correct ?? totalCorrect,
      totalIncorrect: incorrect ?? totalIncorrect,
      timestamp: Date.now()
    };
    const cookieString = `ongoingMatch=${JSON.stringify(matchData)}; path=/; max-age=${60 * 60 * 24}`;
    console.log("Setting cookie:", cookieString);
    document.cookie = cookieString;
    
    // Verify cookie was set
    setTimeout(() => {
      const cookies = document.cookie;
      console.log("All cookies after setting:", cookies);
      const match = cookies.split(";").find((c) => c.trim().startsWith("ongoingMatch="));
      console.log("Found ongoingMatch cookie:", match);
    }, 100);
  };

  // Clear match cookie
  const clearMatchCookie = () => {
    document.cookie = 'ongoingMatch=; path=/; max-age=0';
    console.log("Cleared match cookie");
  };

  const handleClose = () => {
    const ok = window.confirm("Tem certeza que deseja fechar? A partida pode ser perdida!");
    if (ok) {
      router.push('/');
    }
  };

  const handleStart = async () => {
    if (!selectedLevelId) {
      alert("Por favor, selecione um nível!");
      return;
    }

    setIsLoading(true);
    try {
      // Fetch level details
      const levelDetails = await fetchLevelDetails(selectedLevelId);
      if (!levelDetails) {
        alert("N\u00edvel n\u00e3o encontrado!");
        return;
      }

      setTotalRounds(levelDetails.numRounds);
      setTimePerRound(levelDetails.timePerRound);
      setChallengeIdentifier(levelDetails.challenge?.identifier || "notes-differentiation");

      // Parse parameters
      const paramMap: Record<string, string> = {};
      levelDetails.parameterVals.forEach((pv) => {
        if (pv.parameter?.identifier) {
          paramMap[pv.parameter.identifier] = pv.value || "false";
        }
      });

      setNumOptions(parseInt(paramMap["numero-de-opcoes"] || "2", 10));
      setCanReplayTarget(paramMap["replay-nota-alvo"] === "true");
      setCanReplayOptions(paramMap["replay-de-opcoes"] === "true");
      setCanPause(paramMap["pode-pausar"] === "true");

      setGameState("playing");
      setCurrentRound(1);
    } catch (error) {
      console.error("Error starting match:", error);
      alert("Erro ao iniciar a partida!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoundComplete = (selectedOption: number, isCorrect: boolean) => {
    const newCorrect = isCorrect ? totalCorrect + 1 : totalCorrect;
    const newIncorrect = !isCorrect ? totalIncorrect + 1 : totalIncorrect;
    
    setTotalCorrect(newCorrect);
    setTotalIncorrect(newIncorrect);

    if (currentRound < totalRounds) {
      const nextRound = currentRound + 1;
      setCurrentRound(nextRound);
      // Save progress to cookie with updated values
      console.log("Saving cookie - Round:", nextRound, "Correct:", newCorrect, "Incorrect:", newIncorrect, "Total rounds:", totalRounds);
      saveMatchToCookie(nextRound, newCorrect, newIncorrect);
    } else {
      // Match finished - persist to database
      handleMatchFinish(newCorrect, newIncorrect);
    }
  };

  const handleMatchFinish = async (finalCorrect: number, finalIncorrect: number) => {
    if (!selectedLevelId) return;

    try {
      // Create match in database only when complete
      const newMatch = await createMatch(userId, selectedLevelId);
      
      // Immediately update it with final results
      await updateMatchResults(
        newMatch.id,
        finalCorrect,
        finalIncorrect,
        totalRounds
      );
      
      // Clear cookie since match is now persisted
      clearMatchCookie();
      
      setGameState("finished");
    } catch (error) {
      console.error("Error finishing match:", error);
      alert("Erro ao salvar resultados da partida!");
    }
  };

  if (gameState === "playing") {
    return (
      <RoundUI
        roundNumber={currentRound}
        totalRounds={totalRounds}
        timePerRound={timePerRound}
        numOptions={numOptions}
        canReplayTarget={canReplayTarget}
        canReplayOptions={canReplayOptions}
        canPause={canPause}
        onRoundComplete={handleRoundComplete}
        onClose={handleClose}
        challengeIdentifier={challengeIdentifier}
      />
    );
  }

  if (gameState === "finished") {
    return (
      <MatchResults
        totalRounds={totalRounds}
        totalCorrect={totalCorrect}
        totalIncorrect={totalIncorrect}
        challengeName={name}
      />
    );
  }

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f172a',
      color: 'white',
      padding: 24,
      boxSizing: 'border-box'
    }}>
      <div style={{ position: 'absolute', top: 16, right: 16 }}>
        <button onClick={handleClose} aria-label="Fechar" style={{
          background: 'transparent',
          border: 'none',
          color: 'white',
          fontSize: 24,
          cursor: 'pointer'
        }}>✕</button>
      </div>

      <div style={{ maxWidth: 900, textAlign: 'center' }}>
        <h1 style={{ fontSize: 48, marginBottom: 16 }}>{name}</h1>
        <p style={{ fontSize: 18, marginBottom: 32, whiteSpace: 'pre-wrap', color: '#cbd5e1' }}>{instructions || 'Sem instruções disponíveis.'}</p>

        {levels.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <label style={{ fontSize: 16, marginRight: 12, color: '#cbd5e1' }}>Nível de dificuldade:</label>
            <select
              value={selectedLevelId || ''}
              onChange={(e) => setSelectedLevelId(e.target.value ? parseInt(e.target.value, 10) : null)}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #475569',
                background: '#1e293b',
                color: 'white',
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              <option value='' disabled>Selecionar nível...</option>
              {levels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button 
          onClick={handleStart} 
          disabled={isLoading || !selectedLevelId}
          style={{
            background: isLoading || !selectedLevelId ? "#64748b" : "#10b981",
            border: "none",
            color: "white",
            padding: "12px 24px",
            borderRadius: 8,
            fontSize: 16,
            cursor: isLoading || !selectedLevelId ? "not-allowed" : "pointer"
          }}
        >
          {isLoading ? "Carregando..." : "Pronto? Vamos lá!"}
        </button>
      </div>
    </div>
  );
}
