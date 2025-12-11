"use client";

import React, { useState, useEffect } from "react";
import { Table, Button, Input, Space, Card, Typography, Descriptions, Modal, message, Form } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { getUsers, type UserListItem } from "../../actions/adminUsers";
import { deleteUserByAdmin } from "../../actions/deleteUserByAdmin";
import { updateUserProfile } from "../../actions/user";
import { createUserByAdmin } from "../../actions/createUserByAdmin";
import UserForm from "@/components/UserForm";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";

dayjs.locale("pt-br");

const { Title } = Typography;
const { Search } = Input;

export default function ManageUsersPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editForm] = Form.useForm();
  const [createForm] = Form.useForm();

  const loadUsers = async (page: number = 1, search: string = "") => {
    setLoading(true);
    try {
      const result = await getUsers({
        page,
        pageSize: pagination.pageSize,
        search,
      });
      setUsers(result.users);
      setPagination({
        current: result.page,
        pageSize: result.pageSize,
        total: result.total,
      });
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(1, searchText);
  }, []);

  const handleTableChange = (newPagination: any) => {
    loadUsers(newPagination.current, searchText);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    loadUsers(1, value);
  };

  const handleEdit = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      editForm.setFieldsValue({
        name: user.name,
        email: user.email,
        sex: user.sex || undefined,
        birthdate: user.birthdate ? dayjs(user.birthdate) : undefined,
        phone: user.phone || "",
        address: user.address || "",
        musicExperience: user.musicExperience || "",
      });
      setSelectedUser(user);
      setEditModalVisible(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      setEditLoading(true);
      const values = await editForm.validateFields();
      
      const dataToUpdate = {
        ...values,
        birthdate: values.birthdate ? values.birthdate.toDate() : undefined,
      };
      
      const success = await updateUserProfile(selectedUser.id, dataToUpdate);
      
      if (success) {
        message.success("Usuário atualizado com sucesso!");
        setEditModalVisible(false);
        setSelectedUser(null);
        loadUsers(pagination.current, searchText);
      } else {
        message.error("Erro ao atualizar usuário");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      message.error("Erro ao atualizar usuário");
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    setSelectedUser(null);
    editForm.resetFields();
  };

  const handleDelete = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setDeleteModalVisible(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser || confirmText !== "Excluir") {
      return;
    }

    setDeleteLoading(true);
    try {
      const result = await deleteUserByAdmin(selectedUser.id);
      if (result.success) {
        message.success("Usuário excluído com sucesso");
        setDeleteModalVisible(false);
        setSelectedUser(null);
        setConfirmText("");
        loadUsers(pagination.current, searchText);
      } else {
        message.error(result.error || "Erro ao excluir usuário");
      }
    } catch (error) {
      message.error("Erro ao excluir usuário. Tente novamente.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setSelectedUser(null);
    setConfirmText("");
  };

  const handleCreateUser = () => {
    createForm.resetFields();
    setCreateModalVisible(true);
  };

  const handleSaveCreate = async () => {
    try {
      setCreateLoading(true);
      const values = await createForm.validateFields();
      
      const dataToCreate = {
        ...values,
        birthdate: values.birthdate ? values.birthdate.toDate() : undefined,
      };
      
      const result = await createUserByAdmin(dataToCreate);
      
      if (result.success) {
        message.success("Usuário criado com sucesso!");
        setCreateModalVisible(false);
        createForm.resetFields();
        loadUsers(1, searchText);
      } else {
        message.error(result.error || "Erro ao criar usuário");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      message.error("Erro ao criar usuário");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCancelCreate = () => {
    setCreateModalVisible(false);
    createForm.resetFields();
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Não informado";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const expandedRowRender = (record: UserListItem) => {
    return (
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Sexo">
          {record.sex || "Não informado"}
        </Descriptions.Item>
        <Descriptions.Item label="Telefone">
          {record.phone || "Não informado"}
        </Descriptions.Item>
        <Descriptions.Item label="Data de Nascimento">
          {formatDate(record.birthdate)}
        </Descriptions.Item>
        <Descriptions.Item label="Endereço">
          {record.address || "Não informado"}
        </Descriptions.Item>
        <Descriptions.Item label="Experiência Musical" span={2}>
          {record.musicExperience || "Não informado"}
        </Descriptions.Item>
        <Descriptions.Item label="Membro desde" span={2}>
          {formatDate(record.createdAt)}
        </Descriptions.Item>
      </Descriptions>
    );
  };

  const columns: ColumnsType<UserListItem> = [
    {
      title: "Nome",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "E-mail",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Gerenciar Usuários
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateUser}
          size="large"
        >
          Cadastrar Novo Usuário
        </Button>
      </div>

      <Card>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Search
            placeholder="Buscar por nome ou e-mail"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            style={{ maxWidth: 500 }}
          />

          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
            expandable={{
              expandedRowRender,
              expandRowByClick: false,
            }}
            bordered
          />
        </Space>
      </Card>

      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
            <span>Confirmar Exclusão de Conta</span>
          </Space>
        }
        open={deleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={handleCancelDelete}
        okText="Excluir Conta"
        cancelText="Cancelar"
        okButtonProps={{
          danger: true,
          disabled: confirmText !== "Excluir",
          loading: deleteLoading,
        }}
        width={600}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <p style={{ marginBottom: 16 }}>
              <strong>Atenção:</strong> Você está prestes a excluir a conta do usuário:
            </p>
            <Card size="small" style={{ backgroundColor: "#f5f5f5" }}>
              <p style={{ margin: 0 }}>
                <strong>Nome:</strong> {selectedUser?.name}
              </p>
              <p style={{ margin: 0 }}>
                <strong>E-mail:</strong> {selectedUser?.email}
              </p>
            </Card>
          </div>

          <div>
            <p style={{ color: "#ff4d4f", fontWeight: "bold" }}>
              ⚠️ Esta ação terá as seguintes consequências:
            </p>
            <ul style={{ color: "#595959" }}>
              <li>O usuário não poderá mais fazer login no sistema</li>
              <li>O e-mail não poderá ser reutilizado para novas contas</li>
              <li>Esta ação não pode ser desfeita</li>
            </ul>
          </div>

          <div>
            <p style={{ marginBottom: 8 }}>
              Para confirmar a exclusão, digite <strong>"Excluir"</strong> (sem aspas) no campo abaixo:
            </p>
            <Input
              placeholder="Digite: Excluir"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              size="large"
              status={confirmText && confirmText !== "Excluir" ? "error" : ""}
            />
            {confirmText && confirmText !== "Excluir" && (
              <p style={{ color: "#ff4d4f", marginTop: 8, marginBottom: 0 }}>
                O texto deve ser exatamente "Excluir"
              </p>
            )}
          </div>
        </Space>
      </Modal>

      <Modal
        title="Editar Usuário"
        open={editModalVisible}
        onOk={handleSaveEdit}
        onCancel={handleCancelEdit}
        okText="Salvar"
        cancelText="Cancelar"
        confirmLoading={editLoading}
        width={600}
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <UserForm form={editForm} isEdit={true} requirePassword={false} />
        </Form>
      </Modal>

      <Modal
        title="Cadastrar Novo Usuário"
        open={createModalVisible}
        onOk={handleSaveCreate}
        onCancel={handleCancelCreate}
        okText="Criar Usuário"
        cancelText="Cancelar"
        confirmLoading={createLoading}
        width={600}
      >
        <Form form={createForm} layout="vertical" style={{ marginTop: 16 }}>
          <UserForm form={createForm} isEdit={false} requirePassword={true} />
        </Form>
      </Modal>
    </div>
  );
}

