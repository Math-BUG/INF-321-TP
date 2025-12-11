"use client";

import React from "react";
import { Form, Input, Select, DatePicker } from "antd";
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined } from "@ant-design/icons";
import type { FormInstance } from "antd";
import locale from "antd/es/date-picker/locale/pt_BR";
import "dayjs/locale/pt-br";

type UserFormProps = {
  form: FormInstance;
  isEdit?: boolean;
  requirePassword?: boolean;
};

export default function UserForm({ form, isEdit = false, requirePassword = false }: UserFormProps) {
  return (
    <>
      <Form.Item
        name="name"
        label="Nome Completo"
        rules={[{ required: true, message: "Informe o nome" }]}
      >
        <Input prefix={<UserOutlined />} placeholder="Nome completo" />
      </Form.Item>

      <Form.Item
        name="email"
        label="E-mail"
        rules={[
          { required: true, message: "Informe o e-mail" },
          { type: "email", message: "E-mail inválido" },
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder="email@exemplo.com" />
      </Form.Item>

      {requirePassword && (
        <>
          <Form.Item
            name="password"
            label="Senha"
            rules={[
              { required: true, message: "Informe a senha" },
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
              { required: true, message: "Confirme a senha" },
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
        </>
      )}

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
          locale={locale}
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
          placeholder="Endereço (opcional)"
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
    </>
  );
}
