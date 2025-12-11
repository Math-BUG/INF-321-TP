"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Card,
  Typography,
  Modal,
  message,
  Form,
  Input,
  InputNumber,
  Select,
  Empty,
  Divider,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getChallengeOptions,
  getChallengeWithParameters,
  getLevelsByChallengeId,
  getLevelWithParameters,
  createLevel,
  updateLevel,
  deleteLevel,
  type LevelListItem,
  type ChallengeOption,
  type ChallengeWithParameters,
  type LevelWithParameters,
} from "../../actions/adminLevels";

const { Title } = Typography;

export default function ManageLevelsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [challenges, setChallenges] = useState<ChallengeOption[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<number | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeWithParameters | null>(null);
  const [levels, setLevels] = useState<LevelListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<LevelWithParameters | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editForm] = Form.useForm();
  const [createForm] = Form.useForm();

  useEffect(() => {
    loadChallenges();
  }, []);

  useEffect(() => {
    const challengeIdParam = searchParams.get("challengeId");
    if (challengeIdParam && !selectedChallengeId) {
      const id = parseInt(challengeIdParam);
      if (!isNaN(id)) {
        loadChallengeData(id);
      }
    }
  }, [searchParams, selectedChallengeId]);

  const loadChallenges = async () => {
    const challengeOptions = await getChallengeOptions();
    setChallenges(challengeOptions);
  };

  const loadChallengeData = async (challengeId: number) => {
    setSelectedChallengeId(challengeId);
    setLoading(true);
    try {
      const [challenge, levelsList] = await Promise.all([
        getChallengeWithParameters(challengeId),
        getLevelsByChallengeId(challengeId),
      ]);
      setSelectedChallenge(challenge);
      setLevels(levelsList);
    } catch (error) {
      console.error("Error loading challenge data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeChange = async (challengeId: number) => {
    router.push(`/manage-levels?challengeId=${challengeId}`);
    await loadChallengeData(challengeId);
  };

  const handleCreate = () => {
    if (!selectedChallenge) return;
    createForm.resetFields();
    setCreateModalVisible(true);
  };

  const handleSaveCreate = async () => {
    if (!selectedChallenge || !selectedChallengeId) return;

    try {
      setCreateLoading(true);
      const values = await createForm.validateFields();
      
      const parameterValues = selectedChallenge.parameters.map((cp) => ({
        parameterId: cp.parameter.id,
        value: values[`param_${cp.parameter.id}`] || "",
      }));

      const result = await createLevel({
        name: values.name,
        challengeId: selectedChallengeId,
        numRounds: values.numRounds,
        timePerRound: values.timePerRound,
        parameterValues,
      });
      
      if (result.success) {
        message.success("Nível criado com sucesso!");
        setCreateModalVisible(false);
        createForm.resetFields();
        loadChallengeData(selectedChallengeId);
      } else {
        message.error(result.error || "Erro ao criar nível");
      }
    } catch (error) {
      console.error("Error creating level:", error);
      message.error("Erro ao criar nível");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCancelCreate = () => {
    setCreateModalVisible(false);
    createForm.resetFields();
  };

  const handleEdit = async (levelId: number) => {
    const level = await getLevelWithParameters(levelId);
    if (level) {
      const formValues: any = {
        name: level.name,
        numRounds: level.numRounds,
        timePerRound: level.timePerRound,
      };
      
      level.parameterVals.forEach((pv) => {
        formValues[`param_${pv.parameter.id}`] = pv.value || "";
      });
      
      editForm.setFieldsValue(formValues);
      setSelectedLevel(level);
      setEditModalVisible(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedLevel) return;

    try {
      setEditLoading(true);
      const values = await editForm.validateFields();
      
      const parameterValues = selectedLevel.parameterVals.map((pv) => ({
        parameterId: pv.parameter.id,
        value: values[`param_${pv.parameter.id}`] || "",
      }));

      const result = await updateLevel(selectedLevel.id, {
        name: values.name,
        numRounds: values.numRounds,
        timePerRound: values.timePerRound,
        parameterValues,
      });
      
      if (result.success) {
        message.success("Nível atualizado com sucesso!");
        setEditModalVisible(false);
        setSelectedLevel(null);
        if (selectedChallengeId) {
          loadChallengeData(selectedChallengeId);
        }
      } else {
        message.error(result.error || "Erro ao atualizar nível");
      }
    } catch (error) {
      console.error("Error updating level:", error);
      message.error("Erro ao atualizar nível");
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    setSelectedLevel(null);
    editForm.resetFields();
  };

  const handleDelete = async (levelId: number) => {
    const level = await getLevelWithParameters(levelId);
    if (level) {
      setSelectedLevel(level);
      setDeleteModalVisible(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedLevel) return;

    setDeleteLoading(true);
    try {
      const result = await deleteLevel(selectedLevel.id);
      
      if (result.success) {
        message.success("Nível excluído com sucesso");
        setDeleteModalVisible(false);
        setSelectedLevel(null);
        if (selectedChallengeId) {
          loadChallengeData(selectedChallengeId);
        }
      } else {
        message.error(result.error || "Erro ao excluir nível");
      }
    } catch (error) {
      message.error("Erro ao excluir nível. Tente novamente.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setSelectedLevel(null);
  };

  const columns: ColumnsType<LevelListItem> = [
    {
      title: "Nome",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Rodadas",
      dataIndex: "numRounds",
      key: "numRounds",
      width: 100,
      align: "center",
    },
    {
      title: "Tempo/Rodada (s)",
      dataIndex: "timePerRound",
      key: "timePerRound",
      width: 150,
      align: "center",
    },
    {
      title: "Ações",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record.id)}
          >
            Editar
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.id)}
          >
            Excluir
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Gerenciar Níveis
        </Title>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <div>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
            Selecione o Desafio:
          </label>
          <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
            <Select
              size="large"
              placeholder="Escolha um desafio para gerenciar seus níveis"
              style={{ flex: 1, maxWidth: 500 }}
              value={selectedChallengeId}
              onChange={handleChallengeChange}
              options={challenges.map((c) => ({
                label: c.name,
                value: c.id,
              }))}
            />
            {selectedChallengeId && selectedChallenge && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
                size="large"
              >
                Criar Novo Nível
              </Button>
            )}
          </div>
        </div>
      </Card>

      {!selectedChallengeId ? (
        <Card>
          <Empty
            description="Selecione um desafio acima para gerenciar seus níveis"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        <Card>
          <Table
            columns={columns}
            dataSource={levels}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            bordered
          />
        </Card>
      )}

      <Modal
        title="Criar Novo Nível"
        open={createModalVisible}
        onOk={handleSaveCreate}
        onCancel={handleCancelCreate}
        okText="Criar"
        cancelText="Cancelar"
        confirmLoading={createLoading}
        width={700}
      >
        <Form form={createForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Nome do Nível"
            name="name"
            rules={[{ required: true, message: "Por favor, informe o nome do nível" }]}
          >
            <Input placeholder="Ex: Iniciante, Intermediário, Avançado" />
          </Form.Item>
          <Form.Item
            label="Número de Rodadas"
            name="numRounds"
            rules={[{ required: true, message: "Por favor, informe o número de rodadas" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Tempo por Rodada (segundos)"
            name="timePerRound"
            rules={[{ required: true, message: "Por favor, informe o tempo por rodada" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          {selectedChallenge && selectedChallenge.parameters.length > 0 && (
            <>
              <Divider>Parâmetros do Desafio</Divider>
              {selectedChallenge.parameters.map((cp) => (
                <Form.Item
                  key={cp.parameter.id}
                  label={cp.parameter.name}
                  name={`param_${cp.parameter.id}`}
                  rules={[{ required: true, message: `Por favor, informe ${cp.parameter.name}` }]}
                  tooltip={cp.parameter.description}
                >
                  <Input placeholder={`Valor para ${cp.parameter.name}`} />
                </Form.Item>
              ))}
            </>
          )}
        </Form>
      </Modal>

      <Modal
        title="Editar Nível"
        open={editModalVisible}
        onOk={handleSaveEdit}
        onCancel={handleCancelEdit}
        okText="Salvar"
        cancelText="Cancelar"
        confirmLoading={editLoading}
        width={700}
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Nome do Nível"
            name="name"
            rules={[{ required: true, message: "Por favor, informe o nome do nível" }]}
          >
            <Input placeholder="Ex: Iniciante, Intermediário, Avançado" />
          </Form.Item>
          <Form.Item
            label="Número de Rodadas"
            name="numRounds"
            rules={[{ required: true, message: "Por favor, informe o número de rodadas" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Tempo por Rodada (segundos)"
            name="timePerRound"
            rules={[{ required: true, message: "Por favor, informe o tempo por rodada" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          {selectedLevel && selectedLevel.parameterVals.length > 0 && (
            <>
              <Divider>Parâmetros do Desafio</Divider>
              {selectedLevel.parameterVals.map((pv) => (
                <Form.Item
                  key={pv.parameter.id}
                  label={pv.parameter.name}
                  name={`param_${pv.parameter.id}`}
                  rules={[{ required: true, message: `Por favor, informe ${pv.parameter.name}` }]}
                  tooltip={pv.parameter.description}
                >
                  <Input placeholder={`Valor para ${pv.parameter.name}`} />
                </Form.Item>
              ))}
            </>
          )}
        </Form>
      </Modal>

      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
            <span>Confirmar Exclusão</span>
          </Space>
        }
        open={deleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={handleCancelDelete}
        okText="Excluir"
        cancelText="Cancelar"
        okButtonProps={{
          danger: true,
          loading: deleteLoading,
        }}
      >
        <p style={{ marginTop: 16 }}>
          Tem certeza que deseja excluir o nível <strong>{selectedLevel?.name}</strong>?
        </p>
      </Modal>
    </div>
  );
}
