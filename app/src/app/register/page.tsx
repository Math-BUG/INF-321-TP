"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Form, Input, Button, Typography, Space, notification, Select, DatePicker } from "antd";
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, HomeOutlined } from "@ant-design/icons";
import { registerUser } from "../actions/register";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function RegisterPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  async function onFinish(values: any) {
    setLoading(true);
    try {
      // Convert dayjs to Date if birthdate exists
      const data = {
        ...values,
        birthdate: values.birthdate ? values.birthdate.toDate() : undefined,
      };

      const result = await registerUser(data);

      if (result.success) {
        notification.success({
          message: "Conta criada com sucesso!",
          description: `Bem-vindo, ${result.user?.name}!`,
        });
        router.push("/");
      } else {
        notification.error({
          message: "Erro no cadastro",
          description: result.error || "Não foi possível criar sua conta.",
        });
      }
    } catch (err) {
      console.error(err);
      notification.error({
        message: "Erro ao criar conta",
        description: "Ocorreu um erro inesperado. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh", padding: 24 }}>
      <Card style={{ width: 520, borderRadius: 8, boxShadow: "0 4px 18px rgba(0,0,0,0.06)" }}>
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <Title level={3} style={{ margin: 0 }}>Criar Conta</Title>
          <Text type="secondary">Preencha seus dados para começar nos Desafios Musicais.</Text>

          <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 16 }}>
            <Form.Item
              name="name"
              label="Nome Completo"
              rules={[{ required: true, message: "Informe seu nome" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Seu nome completo" />
            </Form.Item>

            <Form.Item
              name="email"
              label="E-mail"
              rules={[
                { required: true, message: "Informe seu e-mail" },
                { type: "email", message: "E-mail inválido" },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="seu@exemplo.com" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Senha"
              rules={[
                { required: true, message: "Informe sua senha" },
                { min: 6, message: "A senha deve ter no mínimo 6 caracteres" },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Mínimo 6 caracteres" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirmar Senha"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Confirme sua senha" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("As senhas não coincidem"));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Digite a senha novamente" />
            </Form.Item>

            <Form.Item name="sex" label="Sexo">
              <Select placeholder="Selecione (opcional)">
                <Select.Option value="Masculino">Masculino</Select.Option>
                <Select.Option value="Feminino">Feminino</Select.Option>
                <Select.Option value="Outro">Outro</Select.Option>
                <Select.Option value="Prefiro não informar">Prefiro não informar</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="birthdate" label="Data de Nascimento">
              <DatePicker
                format="DD/MM/YYYY"
                placeholder="Selecione (opcional)"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item name="phone" label="Telefone">
              <Input prefix={<PhoneOutlined />} placeholder="(00) 00000-0000 (opcional)" />
            </Form.Item>

            <Form.Item name="address" label="Endereço">
              <Input.TextArea
                placeholder="Seu endereço (opcional)"
                rows={2}
              />
            </Form.Item>

            <Form.Item name="musicExperience" label="Experiência Musical">
              <Select placeholder="Selecione (opcional)">
                <Select.Option value="Nenhuma">Nenhuma</Select.Option>
                <Select.Option value="Básica">Básica</Select.Option>
                <Select.Option value="Intermediária">Intermediária</Select.Option>
                <Select.Option value="Avançada">Avançada</Select.Option>
                <Select.Option value="Profissional">Profissional</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Criar Conta
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center" }}>
            <Text>Já tem uma conta? </Text>
            <Link href="/login">Fazer login</Link>
          </div>
        </Space>
      </Card>
    </div>
  );
}