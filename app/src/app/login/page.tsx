"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Form, Input, Button, Typography, Space, notification } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { setAuthCookie } from "../actions/auth";

const { Title, Text } = Typography;

export default function LoginPage() {
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState(false);

    async function onFinish(values: { email: string; password: string }) {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            const body = await res.json();
            if (!res.ok) {
                notification.error({
                    title: "Falha no login", 
                    description: body.error || "Credenciais inválidas"
                });
                return;
            }

            // Set auth cookie with user data
            await setAuthCookie({
                id: body.id,
                name: body.name,
                email: body.email,
                isAdmin: body.isAdmin,
            });

            notification.success({
                title: `Bem-vindo, ${body.name}`
            });
            // Redirect to home page after successful login
            router.push("/");
        } catch (err) {
            console.error(err);
            notification.error({ 
                title: "Erro ao realizar o login!"
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh", padding: 24 }}>
            <Card style={{ width: 420, borderRadius: 8, boxShadow: "0 4px 18px rgba(0,0,0,0.06)" }}>
                <Space orientation="vertical" size="small" style={{ width: "100%" }}>
                    <Title level={3} style={{ margin: 0 }}>Entrar</Title>
                    <Text type="secondary">Acesse sua conta para continuar nos Desafios Musicais.</Text>

                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        <Form.Item name="email" label="E‑mail" rules={[{ required: true, message: "Informe seu e‑mail" }] }>
                            <Input prefix={<MailOutlined />} placeholder="seu@exemplo.com" />
                        </Form.Item>

                        <Form.Item name="password" label="Senha" rules={[{ required: true, message: "Informe sua senha" }] }>
                            <Input.Password prefix={<LockOutlined />} placeholder="Senha" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block loading={loading}>
                                Entrar
                            </Button>
                        </Form.Item>
                    </Form>

                    <div style={{ textAlign: "center" }}>
                        <Text>Não tem uma conta? </Text>
                        <Link href="/register">Criar conta</Link>
                    </div>
                </Space>
            </Card>
        </div>
    );
}