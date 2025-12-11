"use client";

import React from "react";
import { Card, Descriptions, Button, Modal, Form, Input, message, Select, DatePicker, Space } from "antd";
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import locale from "antd/es/date-picker/locale/pt_BR";
import "dayjs/locale/pt-br";
import { updateUserProfile, type UserProfile } from "../app/actions/user";
import { deleteAccount } from "../app/actions/deleteAccount";

dayjs.locale("pt-br");

type UserInfoCardProps = {
  user: UserProfile;
  onUpdate: () => void;
};

export default function UserInfoCard({ user, onUpdate }: UserInfoCardProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [form] = Form.useForm();
  const [deleteForm] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const handleEdit = () => {
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      sex: user.sex || undefined,
      birthdate: user.birthdate ? dayjs(user.birthdate) : undefined,
      phone: user.phone || "",
      address: user.address || "",
      musicExperience: user.musicExperience || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const dataToUpdate = {
        ...values,
        birthdate: values.birthdate ? values.birthdate.toDate() : undefined,
      };
      
      const success = await updateUserProfile(user.id, dataToUpdate);
      
      if (success) {
        message.success("Perfil atualizado com sucesso!");
        setIsModalOpen(false);
        onUpdate();
      } else {
        message.error("Erro ao atualizar perfil");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleteLoading(true);
      const values = await deleteForm.validateFields();
      
      const result = await deleteAccount(user.id, values.password);
      
      if (result.success) {
        message.success("Conta excluída com sucesso");
        setIsDeleteModalOpen(false);
        router.push("/login");
      } else {
        message.error(result.error || "Erro ao excluir conta");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      message.error("Erro ao excluir conta");
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Não informado";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <>
      <Card
        title="Informações do Usuário"
        extra={
          <Space>
            <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
              Editar Perfil
            </Button>
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Excluir Conta
            </Button>
          </Space>
        }
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Nome">{user.name}</Descriptions.Item>
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="Sexo">
            {user.sex || "Não informado"}
          </Descriptions.Item>
          <Descriptions.Item label="Data de Nascimento">
            {formatDate(user.birthdate)}
          </Descriptions.Item>
          <Descriptions.Item label="Telefone">
            {user.phone || "Não informado"}
          </Descriptions.Item>
          <Descriptions.Item label="Endereço">
            {user.address || "Não informado"}
          </Descriptions.Item>
          <Descriptions.Item label="Experiência Musical" span={2}>
            {user.musicExperience || "Não informado"}
          </Descriptions.Item>
          <Descriptions.Item label="Membro desde" span={2}>
            {formatDate(user.createdAt)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Modal
        title="Editar Perfil"
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={loading}
        okText="Salvar"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Nome"
            name="name"
            rules={[{ required: true, message: "Nome é obrigatório" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email é obrigatório" },
              { type: "email", message: "Email inválido" }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Sexo" name="sex">
            <Select placeholder="Selecione">
              <Select.Option value="Masculino">Masculino</Select.Option>
              <Select.Option value="Feminino">Feminino</Select.Option>
              <Select.Option value="Outro">Outro</Select.Option>
              <Select.Option value="Prefiro não informar">Prefiro não informar</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Data de Nascimento" name="birthdate">
            <DatePicker
              locale={locale}
              format="DD/MM/YYYY" 
              placeholder="Selecione a data"
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item label="Telefone" name="phone">
            <Input />
          </Form.Item>
          <Form.Item label="Endereço" name="address">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="Experiência Musical" name="musicExperience">
            <Select placeholder="Selecione">
              <Select.Option value="Nenhuma">Nenhuma</Select.Option>
              <Select.Option value="Básica">Básica</Select.Option>
              <Select.Option value="Intermediária">Intermediária</Select.Option>
              <Select.Option value="Avançada">Avançada</Select.Option>
              <Select.Option value="Profissional">Profissional</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
            <span>Excluir Conta</span>
          </Space>
        }
        open={isDeleteModalOpen}
        onOk={handleDeleteAccount}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          deleteForm.resetFields();
        }}
        confirmLoading={deleteLoading}
        okText="Confirmar Exclusão"
        cancelText="Cancelar"
        okButtonProps={{ danger: true }}
      >
        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <p style={{ marginBottom: 12, fontWeight: 500 }}>
            ⚠️ Esta ação é irreversível!
          </p>
          <p style={{ marginBottom: 12 }}>
            Ao excluir sua conta:
          </p>
          <ul style={{ marginBottom: 16, paddingLeft: 20 }}>
            <li>Você não poderá mais acessar o sistema com este e-mail</li>
            <li>Não será possível utilizar o mesmo e-mail para criar uma nova conta</li>
            <li>Você será desconectado imediatamente</li>
          </ul>
          <p style={{ marginBottom: 16, color: "#ff4d4f", fontWeight: 500 }}>
            Para prosseguir, informe sua senha:
          </p>
        </div>
        
        <Form form={deleteForm} layout="vertical">
          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Por favor, informe sua senha" }
            ]}
          >
            <Input.Password 
              placeholder="Digite sua senha para confirmar"
              autoComplete="current-password"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
