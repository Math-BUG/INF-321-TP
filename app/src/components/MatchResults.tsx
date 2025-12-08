"use client";

import React from "react";
import { useRouter } from "next/navigation";

type MatchResultsProps = {
  totalRounds: number;
  totalCorrect: number;
  totalIncorrect: number;
  challengeName: string;
};

export default function MatchResults({
  totalRounds,
  totalCorrect,
  totalIncorrect,
  challengeName,
}: MatchResultsProps) {
  const router = useRouter();
  const percentage = totalRounds > 0 ? Math.round((totalCorrect / totalRounds) * 100) : 0;

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        color: "white",
        padding: "48px 24px",
        boxSizing: "border-box",
        overflow: "auto",
      }}
    >
      <div style={{ maxWidth: 600, textAlign: "center", width: "100%", paddingTop: 100 }}>
        <h1 style={{ fontSize: 48, marginBottom: 32, wordWrap: "break-word", lineHeight: 1.2 }}>Parabéns!</h1>

        <p style={{ fontSize: 20, marginBottom: 48, color: "#cbd5e1" }}>
          Você completou <strong>{challengeName}</strong>
        </p>

        <div
          style={{
            background: "#1e293b",
            padding: 32,
            borderRadius: 12,
            marginBottom: 32,
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 8 }}>Acertos</p>
            <p style={{ fontSize: 48, color: "#10b981", fontWeight: "bold" }}>
              {totalCorrect}/{totalRounds}
            </p>
          </div>

          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 8 }}>Erros</p>
            <p style={{ fontSize: 48, color: "#ef4444", fontWeight: "bold" }}>
              {totalIncorrect}
            </p>
          </div>

          <div>
            <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 8 }}>Acurácia</p>
            <p style={{ fontSize: 48, color: "#f59e0b", fontWeight: "bold" }}>
              {percentage}%
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push("/")}
          style={{
            background: "#10b981",
            border: "none",
            color: "white",
            padding: "12px 32px",
            borderRadius: 8,
            fontSize: 16,
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Voltar ao Início
        </button>
      </div>
    </div>
  );
}
