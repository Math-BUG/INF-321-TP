"use client";

import React from "react";
import { Card, Empty, Select } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { PerformanceData } from "../app/actions/user";

type PerformanceChartsProps = {
  performanceData: PerformanceData[];
};

const LEVEL_COLORS: Record<string, string> = {
  "Iniciante": "#10b981", // green
  "Intermediário": "#f59e0b", // orange/yellow
  "Avançado": "#ef4444", // red
};

const FALLBACK_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

function getLevelColor(levelName: string, index: number): string {
  // Check if level name contains difficulty keywords
  if (levelName.includes("Iniciante")) {
    return LEVEL_COLORS["Iniciante"];
  }
  if (levelName.includes("Intermediário")) {
    return LEVEL_COLORS["Intermediário"];
  }
  if (levelName.includes("Avançado")) {
    return LEVEL_COLORS["Avançado"];
  }
  // Use fallback colors for other levels
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

export default function PerformanceCharts({ performanceData }: PerformanceChartsProps) {
  const [selectedChallenge, setSelectedChallenge] = React.useState<number | null>(
    performanceData.length > 0 ? performanceData[0].challengeId : null
  );

  if (performanceData.length === 0) {
    return (
      <Card title="Gráficos de Desempenho">
        <Empty description="Nenhum dado de desempenho disponível. Complete partidas para ver seus gráficos!" />
      </Card>
    );
  }

  const currentChallenge = performanceData.find(
    (d) => d.challengeId === selectedChallenge
  );

  // Sort levels: Iniciante first, then Intermediário, then Avançado, then others
  const sortedLevels = currentChallenge ? [...currentChallenge.levels].sort((a, b) => {
    const getDifficultyOrder = (name: string) => {
      if (name.includes("Iniciante")) return 0;
      if (name.includes("Intermediário")) return 1;
      if (name.includes("Avançado")) return 2;
      return 3;
    };
    return getDifficultyOrder(a.levelName) - getDifficultyOrder(b.levelName);
  }) : [];

  // Prepare chart data
  const chartData: any[] = [];
  if (currentChallenge && sortedLevels.length > 0) {
    // Find the maximum number of matches across all levels
    const maxMatches = Math.max(
      ...sortedLevels.map((level) => level.matches.length)
    );

    // Create data points for each match number
    for (let i = 0; i < maxMatches; i++) {
      const dataPoint: any = {
        matchNumber: i + 1,
      };

      sortedLevels.forEach((level) => {
        if (level.matches[i]) {
          const match = level.matches[i];
          dataPoint[level.levelName] = match.totalCorrect;
        }
      });

      chartData.push(dataPoint);
    }
  }

  return (
    <Card
      title="Gráficos de Desempenho"
      extra={
        performanceData.length > 0 && (
          <Select
            value={selectedChallenge}
            onChange={setSelectedChallenge}
            style={{ width: 250 }}
          >
            {performanceData.map((challenge) => (
              <Select.Option key={challenge.challengeId} value={challenge.challengeId}>
                {challenge.challengeName}
              </Select.Option>
            ))}
          </Select>
        )
      }
    >
      {currentChallenge && chartData.length > 0 ? (
        <>
          <p style={{ marginBottom: 16, color: "#64748b" }}>
            Este gráfico mostra sua evolução em <strong>{currentChallenge.challengeName}</strong>.
            Cada linha representa um nível de dificuldade, e cada ponto é uma partida completa.
            O eixo Y mostra o número de acertos.
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="matchNumber"
                label={{ value: "Número da Partida", position: "insideBottom", offset: 0 }}
              />
              <YAxis
                label={{ value: "Número de Acertos", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: 8,
                  color: "white",
                }}
              />
              <Legend />
              {sortedLevels.map((level, index) => (
                <Line
                  key={level.levelId}
                  type="monotone"
                  dataKey={level.levelName}
                  stroke={getLevelColor(level.levelName, index)}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </>
      ) : (
        <Empty description="Nenhum dado para exibir neste desafio" />
      )}
    </Card>
  );
}
