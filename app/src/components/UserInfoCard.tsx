"use client";

import React from "react";
import { Card, Descriptions, Button, Modal, Form, Input, message, Select, DatePicker } from "antd";
import { EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { updateUserProfile, type UserProfile } from "../app/actions/user";

type UserInfoCardProps = {
  user: UserProfile;
  onUpdate: () => void;
};

export default function UserInfoCard({ user, onUpdate }: UserInfoCardProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

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
      
      // Convert dayjs to Date if birthdate exists
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

  const formatDate = (date: Date | null) => {
    if (!date) return "Não informado";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <>
      <Card
        title="Informações do Usuário"
        extra={
          <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
            Editar Perfil
          </Button>
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
    </>
  );
}
