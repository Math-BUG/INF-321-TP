"use client";

import React from "react";
import { Modal, Button, Space, Typography } from "antd";

const { Text } = Typography;

type OngoingMatchData = {
  userId: number;
  challengeId: number;
  levelId: number;
  challengeName: string;
  currentRound: number;
  totalRounds: number;
  totalCorrect: number;
  totalIncorrect: number;
  timestamp: number;
};

type OngoingMatchModalProps = {
  matchData: OngoingMatchData | null;
  visible: boolean;
  onResume: () => void;
  onDiscard: () => void;
};

export default function OngoingMatchModal({
  matchData,
  visible,
  onResume,
  onDiscard,
}: OngoingMatchModalProps) {
  if (!matchData) return null;

  return (
    <Modal
      title="Partida em Progresso"
      open={visible}
      footer={null}
      closable={false}
      centered
    >
      <div style={{ marginBottom: 24 }}>
        <Text>
          Você tem uma partida em progresso de <strong>{matchData.challengeName}</strong>.
        </Text>
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">
            Rodada {matchData.currentRound} de {matchData.totalRounds}
          </Text>
          <br />
          <Text type="secondary">
            Acertos: {matchData.totalCorrect} | Erros: {matchData.totalIncorrect}
          </Text>
        </div>
      </div>
      <Space style={{ width: "100%", justifyContent: "flex-end" }}>
        <Button onClick={onDiscard}>
          Descartar Partida
        </Button>
        <Button type="primary" onClick={onResume}>
          Retomar Partida
        </Button>
      </Space>
    </Modal>
  );
}

export function getOngoingMatch(): OngoingMatchData | null {
  if (typeof window === "undefined") return null;
  
  const cookies = document.cookie.split(";");
  console.log(cookies);
  const matchCookie = cookies.find((c) => c.trim().startsWith("ongoingMatch="));
  
  if (!matchCookie) return null;
  
  try {
    const value = matchCookie.split("=")[1];
    const matchData = JSON.parse(decodeURIComponent(value));
    
    const now = Date.now();
    const age = now - matchData.timestamp;
    const maxAge = 24 * 60 * 60 * 1000;
    
    if (age > maxAge) {
      document.cookie = 'ongoingMatch=; path=/; max-age=0';
      return null;
    }
    
    return matchData;
  } catch (error) {
    console.error("Error parsing ongoing match cookie:", error);
    return null;
  }
}

export function clearOngoingMatch() {
  if (typeof window === "undefined") return;
  document.cookie = 'ongoingMatch=; path=/; max-age=0';
}
