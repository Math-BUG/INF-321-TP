"use client";

import React, { useState, useEffect } from "react";
import { Table, Button, Input, Space, Card, Typography, Modal, message, Form } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  getParameters,
  createParameter,
  updateParameter,
  deleteParameter,
  type ParameterListItem,
} from "../../actions/adminParameters";

const { Title } = Typography;
const { Search } = Input;
const { TextArea } = Input;

export default function ManageParametersPage() {
  const [parameters, setParameters] = useState<ParameterListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedParameter, setSelectedParameter] = useState<ParameterListItem | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editForm] = Form.useForm();
  const [createForm] = Form.useForm();

  const loadParameters = async (page: number = 1, search: string = "") => {
    setLoading(true);
    try {
      const result = await getParameters({
        page,
        pageSize: pagination.pageSize,
        search,
      });
      setParameters(result.parameters);
      setPagination({
        current: result.page,
        pageSize: result.pageSize,
        total: result.total,
      });
    } catch (error) {
      console.error("Error loading parameters:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParameters(1, searchText);
  }, []);

  const handleTableChange = (newPagination: any) => {
    loadParameters(newPagination.current, searchText);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    loadParameters(1, value);
  };

  const handleEdit = (parameter: ParameterListItem) => {
    editForm.setFieldsValue({
      name: parameter.name,
      identifier: parameter.identifier || "",
      description: parameter.description || "",
    });
    setSelectedParameter(parameter);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedParameter) return;

    try {
      setEditLoading(true);
      const values = await editForm.validateFields();
      
      const result = await updateParameter(selectedParameter.id, values);
      
      if (result.success) {
        message.success("Parâmetro atualizado com sucesso!");
        setEditModalVisible(false);
        setSelectedParameter(null);
        loadParameters(pagination.current, searchText);
      } else {
        message.error(result.error || "Erro ao atualizar parâmetro");
      }
    } catch (error) {
      console.error("Error updating parameter:", error);
      message.error("Erro ao atualizar parâmetro");
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    setSelectedParameter(null);
    editForm.resetFields();
  };

  const handleCreate = () => {
    createForm.resetFields();
    setCreateModalVisible(true);
  };

  const handleSaveCreate = async () => {
    try {
      setCreateLoading(true);
      const values = await createForm.validateFields();
      
      const result = await createParameter(values);
      
      if (result.success) {
        message.success("Parâmetro criado com sucesso!");
        setCreateModalVisible(false);
        createForm.resetFields();
        loadParameters(1, searchText);
      } else {
        message.error(result.error || "Erro ao criar parâmetro");
      }
    } catch (error) {
      console.error("Error creating parameter:", error);
      message.error("Erro ao criar parâmetro");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCancelCreate = () => {
    setCreateModalVisible(false);
    createForm.resetFields();
  };

  const handleDelete = (parameter: ParameterListItem) => {
    setSelectedParameter(parameter);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedParameter) return;

    setDeleteLoading(true);
    try {
      const result = await deleteParameter(selectedParameter.id);
      
      if (result.success) {
        message.success("Parâmetro excluído com sucesso");
        setDeleteModalVisible(false);
        setSelectedParameter(null);
        loadParameters(pagination.current, searchText);
      } else {
        message.error(result.error || "Erro ao excluir parâmetro");
      }
    } catch (error) {
      message.error("Erro ao excluir parâmetro. Tente novamente.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setSelectedParameter(null);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const columns: ColumnsType<ParameterListItem> = [
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
      title: "Descrição",
      dataIndex: "description",
      key: "description",
      render: (text) => text || <span style={{ color: "#999" }}>Sem descrição</span>,
    },
    {
      title: "Criado em",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
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
            onClick={() => handleEdit(record)}
          >
            Editar
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record)}
          >
            Excluir
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Gerenciar Parâmetros
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size="large"
        >
          Criar Novo Parâmetro
        </Button>
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
            dataSource={parameters}
            rowKey="id"
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
            bordered
          />
        </Space>
      </Card>

      <Modal
        title="Editar Parâmetro"
        open={editModalVisible}
        onOk={handleSaveEdit}
        onCancel={handleCancelEdit}
        okText="Salvar"
        cancelText="Cancelar"
        confirmLoading={editLoading}
        width={600}
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Nome"
            name="name"
            rules={[{ required: true, message: "Por favor, informe o nome do parâmetro" }]}
          >
            <Input placeholder="Ex: Tonalidade, Tempo, Instrumentos..." />
          </Form.Item>
          <Form.Item
            label="Identificador"
            name="identifier"
            tooltip="O identificador não pode ser alterado após a criação"
          >
            <Input placeholder="Ex: key, tempo, instruments" disabled />
          </Form.Item>
          <Form.Item
            label="Descrição"
            name="description"
          >
            <TextArea
              rows={3}
              placeholder="Descreva para que serve este parâmetro (opcional)"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Criar Novo Parâmetro"
        open={createModalVisible}
        onOk={handleSaveCreate}
        onCancel={handleCancelCreate}
        okText="Criar"
        cancelText="Cancelar"
        confirmLoading={createLoading}
        width={600}
      >
        <Form form={createForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Nome"
            name="name"
            rules={[{ required: true, message: "Por favor, informe o nome do parâmetro" }]}
          >
            <Input placeholder="Ex: Tonalidade, Tempo, Instrumentos..." />
          </Form.Item>
          <Form.Item
            label="Identificador"
            name="identifier"
          >
            <Input placeholder="Ex: key, tempo, instruments (opcional)" />
          </Form.Item>
          <Form.Item
            label="Descrição"
            name="description"
          >
            <TextArea
              rows={3}
              placeholder="Descreva para que serve este parâmetro (opcional)"
            />
          </Form.Item>
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
          Tem certeza que deseja excluir o parâmetro <strong>{selectedParameter?.name}</strong>?
        </p>
      </Modal>
    </div>
  );
}
