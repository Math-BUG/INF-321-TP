"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Form, Button, Typography, Space, notification } from "antd";
import { registerUser } from "../actions/register";
import UserForm from "@/components/UserForm";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";

dayjs.locale("pt-br");

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
          title: "Conta criada com sucesso!",
          description: `Bem-vindo, ${result.user?.name}!`,
        });
        router.push("/");
      } else {
        notification.error({
          title: "Erro no cadastro",
          description: result.error || "Não foi possível criar sua conta.",
        });
      }
    } catch (err) {
      console.error(err);
      notification.error({
        title: "Erro ao criar conta",
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
            <UserForm form={form} requirePassword={true} />

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