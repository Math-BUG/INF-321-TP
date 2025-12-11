"use client";

import React, { useState, useEffect } from "react";
import { Table, Button, Input, Space, Card, Typography, Modal, message, Form, Descriptions, Tag } from "antd";
import { EditOutlined, SearchOutlined, EyeOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import type { ColumnsType } from "antd/es/table";
import {
  getChallenges,
  getChallengeWithParameters,
  updateChallenge,
  type ChallengeListItem,
  type ChallengeWithParameters,
} from "../../actions/adminChallenges";

const { Title } = Typography;
const { Search } = Input;
const { TextArea } = Input;

export default function ManageChallengesPage() {
  const [challenges, setChallenges] = useState<ChallengeListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeWithParameters | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm] = Form.useForm();
  const router = useRouter();

  const handleViewLevels = (challengeId: number) => {
    router.push(`/manage-levels?challengeId=${challengeId}`);
  };

  const loadChallenges = async (page: number = 1, search: string = "") => {
    setLoading(true);
    try {
      const result = await getChallenges({
        page,
        pageSize: pagination.pageSize,
        search,
      });
      setChallenges(result.challenges);
      setPagination({
        current: result.page,
        pageSize: result.pageSize,
        total: result.total,
      });
    } catch (error) {
      console.error("Error loading challenges:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges(1, searchText);
  }, []);

  const handleTableChange = (newPagination: any) => {
    loadChallenges(newPagination.current, searchText);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    loadChallenges(1, value);
  };

  const handleView = async (challengeId: number) => {
    const challenge = await getChallengeWithParameters(challengeId);
    if (challenge) {
      setSelectedChallenge(challenge);
      setViewModalVisible(true);
    }
  };

  const handleEdit = async (challengeId: number) => {
    const challenge = await getChallengeWithParameters(challengeId);
    if (challenge) {
      editForm.setFieldsValue({
        name: challenge.name,
        identifier: challenge.identifier || "",
        description: challenge.description || "",
        requirements: challenge.requirements || "",
        instructions: challenge.instructions || "",
      });
      setSelectedChallenge(challenge);
      setEditModalVisible(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedChallenge) return;

    try {
      setEditLoading(true);
      const values = await editForm.validateFields();
      
      const result = await updateChallenge(selectedChallenge.id, {
        name: values.name,
        description: values.description,
        requirements: values.requirements,
        instructions: values.instructions,
      });
      
      if (result.success) {
        message.success("Desafio atualizado com sucesso!");
        setEditModalVisible(false);
        setSelectedChallenge(null);
        loadChallenges(pagination.current, searchText);
      } else {
        message.error(result.error || "Erro ao atualizar desafio");
      }
    } catch (error) {
      console.error("Error updating challenge:", error);
      message.error("Erro ao atualizar desafio");
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    setSelectedChallenge(null);
    editForm.resetFields();
  };

  const handleCloseView = () => {
    setViewModalVisible(false);
    setSelectedChallenge(null);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const columns: ColumnsType<ChallengeListItem> = [
    {
      title: "Nome",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Identificador",
      dataIndex: "identifier",
      key: "identifier",
      render: (text) => text || <span style={{ color: "#999" }}>-</span>,
    },
    {
      title: "Níveis",
      key: "levels",
      width: 100,
      align: "center",
      render: (_, record) => record._count?.levels || 0,
    },
    {
      title: "Parâmetros",
      key: "parameters",
      width: 120,
      align: "center",
      render: (_, record) => record._count?.parameters || 0,
    },
    {
      title: "Ações",
      key: "actions",
      width: 250,
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleView(record.id)}
          >
            Visualizar
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record.id)}
          >
            Editar
          </Button>
          <Button
            icon={<UnorderedListOutlined />}
            size="small"
            onClick={() => handleViewLevels(record.id)}
          >
            Ver Níveis
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Gerenciar Desafios
        </Title>
      </div>

      <Card>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Search
            placeholder="Buscar por nome ou identificador"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            style={{ maxWidth: 500 }}
          />

          <Table
            columns={columns}
            dataSource={challenges}
            rowKey="id"
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
            bordered
          />
        </Space>
      </Card>

      <Modal
        title="Visualizar Desafio"
        open={viewModalVisible}
        onCancel={handleCloseView}
        footer={[
          <Button key="close" onClick={handleCloseView}>
            Fechar
          </Button>,
        ]}
        width={700}
      >
        {selectedChallenge && (
          <div style={{ marginTop: 16 }}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Nome">{selectedChallenge.name}</Descriptions.Item>
              <Descriptions.Item label="Identificador">
                {selectedChallenge.identifier || <span style={{ color: "#999" }}>Não informado</span>}
              </Descriptions.Item>
              <Descriptions.Item label="Descrição">
                {selectedChallenge.description || <span style={{ color: "#999" }}>Não informado</span>}
              </Descriptions.Item>
              <Descriptions.Item label="Requisitos">
                {selectedChallenge.requirements || <span style={{ color: "#999" }}>Não informado</span>}
              </Descriptions.Item>
              <Descriptions.Item label="Instruções">
                {selectedChallenge.instructions || <span style={{ color: "#999" }}>Não informado</span>}
              </Descriptions.Item>
              <Descriptions.Item label="Parâmetros vinculados">
                <Space wrap>
                  {selectedChallenge.parameters.length > 0 ? (
                    selectedChallenge.parameters.map((cp) => (
                      <Tag key={cp.id} color="blue">
                        {cp.parameter.name}
                      </Tag>
                    ))
                  ) : (
                    <span style={{ color: "#999" }}>Nenhum parâmetro vinculado</span>
                  )}
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      <Modal
        title="Editar Desafio"
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
            label="Nome"
            name="name"
            rules={[{ required: true, message: "Por favor, informe o nome do desafio" }]}
          >
            <Input placeholder="Nome do desafio" />
          </Form.Item>
          <Form.Item
            label="Identificador"
            name="identifier"
            tooltip="O identificador não pode ser alterado"
          >
            <Input placeholder="identificador-do-desafio" disabled />
          </Form.Item>
          <Form.Item
            label="Descrição"
            name="description"
          >
            <TextArea
              rows={3}
              placeholder="Descrição do desafio (opcional)"
            />
          </Form.Item>
          <Form.Item
            label="Requisitos"
            name="requirements"
          >
            <TextArea
              rows={2}
              placeholder="Requisitos para participar do desafio (opcional)"
            />
          </Form.Item>
          <Form.Item
            label="Instruções"
            name="instructions"
          >
            <TextArea
              rows={3}
              placeholder="Instruções de como jogar (opcional)"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
