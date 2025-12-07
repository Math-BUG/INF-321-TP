"use client"

import React, { useState, useEffect } from "react"
import { Card, Collapse, Select, Button, Space, Typography, Empty, Row, Col, Spin } from "antd"
import { useRouter } from "next/navigation"
import { fetchChallenges, type Challenge } from "../app/actions/challenges"

const { Paragraph, Text } = Typography

interface ChallengesListProps {
  initialChallenges: Challenge[]
}


async function loadChallenges(setLoading: any, setChallenges: any) {
    setLoading(true);
    try {
        const data = await fetchChallenges();
        console.log(data);
        setChallenges(data)
    } catch (error) {
        console.error("Erro ao buscar desafios:", error)
    } finally {
        setLoading(false)
    }
}

export default function ChallengesList({ initialChallenges }: ChallengesListProps) {
  const router = useRouter()
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges)
  const [selectedLevels, setSelectedLevels] = useState<{ [key: number]: number | null }>({})
  const [loading, setLoading] = useState(false);

  // Fetch challenges on mount and when component needs refresh
  useEffect(() => {
    console.log("Loading challenges...");
    loadChallenges(setLoading, setChallenges);
  }, [])

  const handleLevelChange = (challengeId: number, levelId: number) => {
    setSelectedLevels((prev) => ({
      ...prev,
      [challengeId]: levelId,
    }))
  }

  const handlePlay = (challengeId: number) => {
    const selectedLevel = selectedLevels[challengeId]
    if (!selectedLevel) return
    router.push(`/play?challengeId=${challengeId}&levelId=${selectedLevel}`)
  }

  if (loading && challenges.length === 0) {
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: 48 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (challenges.length === 0) {
    return (
      <Empty
        description="Nenhum desafio disponível"
        style={{ marginTop: 48 }}
      />
    )
  }

  return (
    <Spin spinning={loading}>
      <Row gutter={[24, 24]}>
        {challenges.map((challenge) => (
          <Col key={challenge.id} xs={24} sm={24} md={12} lg={12} xl={12}>
            <Card
              hoverable
              style={{
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                height: "100%",
              }}
            >
                <Collapse
                  items={[
                    {
                      key: String(challenge.id),
                      label: (
                        <div style={{ fontWeight: 600, fontSize: 16 }}>
                          {challenge.name}
                        </div>
                      ),
                      children: (
                        <div>
                          {challenge.description && (
                            <Paragraph>{challenge.description}</Paragraph>
                          )}

                          {challenge.requirements && (
                            <Paragraph>
                              <Text strong>Requisitos:</Text> {challenge.requirements}
                            </Paragraph>
                          )}

                          <Space
                            orientation="vertical"
                            style={{ marginTop: 16, width: "100%" }}
                          >
                            <Space style={{ width: "100%" }}>
                              <Select
                                value={selectedLevels[challenge.id] ?? undefined}
                                onChange={(v) =>
                                  handleLevelChange(challenge.id, Number(v))
                                }
                                style={{ minWidth: 250 }}
                                placeholder={
                                  challenge.levels.length
                                    ? "Selecione um nível"
                                    : "Sem níveis disponíveis"
                                }
                                disabled={!challenge.levels.length}
                              >
                                {challenge.levels.map((level) => (
                                  <Select.Option
                                    key={level.id}
                                    value={level.id}
                                  >
                                    {level.name}
                                    {level.difficulty
                                      ? ` — ${level.difficulty}`
                                      : ""}
                                  </Select.Option>
                                ))}
                              </Select>

                              <Button
                                type="primary"
                                size="large"
                                onClick={() => handlePlay(challenge.id)}
                                disabled={!selectedLevels[challenge.id]}
                              >
                                Jogar
                              </Button>
                            </Space>
                          </Space>
                        </div>
                      ),
                    },
                  ]}
                />
            </Card>
          </Col>
        ))}
      </Row>
    </Spin>
  )
}
