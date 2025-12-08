"use client";

import React from "react";
import { Card, Table, Tag } from "antd";
import type { MatchHistory } from "../app/actions/user";

type MatchHistoryTableProps = {
  matches: MatchHistory[];
};

export default function MatchHistoryTable({ matches }: MatchHistoryTableProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("pt-BR");
  };

  const calculateAccuracy = (correct: number | null, total: number | null) => {
    if (!correct || !total || total === 0) return 0;
    return Math.round((correct / total) * 100);
  };

  const columns = [
    {
      title: "Data",
      dataIndex: "finishedAt",
      key: "finishedAt",
      render: (date: Date | null) => formatDate(date),
      width: 180,
    },
    {
      title: "Desafio",
      key: "challenge",
      render: (_: any, record: MatchHistory) => record.level.challenge.name,
    },
    {
      title: "Nível",
      key: "level",
      render: (_: any, record: MatchHistory) => (
        <span>
          {record.level.name}
          {record.level.difficulty && (
            <Tag
              color={
                record.level.difficulty === "Iniciante"
                  ? "green"
                  : record.level.difficulty === "Intermediário"
                  ? "orange"
                  : record.level.difficulty === "Avançado" ? "red" : "purple"
              }
              style={{ marginLeft: 8 }}
            >
              {record.level.difficulty}
            </Tag>
          )}
        </span>
      ),
    },
    {
      title: "Rodadas",
      dataIndex: "totalRounds",
      key: "totalRounds",
      width: 100,
      align: "center" as const,
    },
    {
      title: "Acertos",
      dataIndex: "totalCorrect",
      key: "totalCorrect",
      width: 100,
      align: "center" as const,
      render: (correct: number | null, record: MatchHistory) => (
        <span style={{ color: "#10b981", fontWeight: "bold" }}>
          {correct ?? 0}/{record.totalRounds ?? 0}
        </span>
      ),
    },
    {
      title: "Erros",
      dataIndex: "totalIncorrect",
      key: "totalIncorrect",
      width: 100,
      align: "center" as const,
      render: (incorrect: number | null) => (
        <span style={{ color: "#ef4444", fontWeight: "bold" }}>
          {incorrect ?? 0}
        </span>
      ),
    },
    {
      title: "Acurácia",
      key: "accuracy",
      width: 100,
      align: "center" as const,
      render: (_: any, record: MatchHistory) => {
        const accuracy = calculateAccuracy(record.totalCorrect, record.totalRounds);
        return (
          <Tag
            color={
              accuracy >= 80 ? "green" : accuracy >= 60 ? "orange" : "red"
            }
          >
            {accuracy}%
          </Tag>
        );
      },
    },
  ];

  return (
    <Card title="Histórico de Partidas">
      <Table
        dataSource={matches}
        columns={columns}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Total de ${total} partidas`,
        }}
      />
    </Card>
  );
}
