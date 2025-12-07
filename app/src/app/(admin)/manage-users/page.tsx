import { Breadcrumb, Empty } from "antd";

export default function ManageUsersPage() {
  return (
    <div>
      <Breadcrumb items={[{ title: "Gerenciar Usuários" }]} style={{ marginBottom: 16 }} />
      <h1>Gerenciamento de Usuários</h1>
      <Empty description="Conteúdo de gerenciamento será implementado em breve" style={{ marginTop: 48 }} />
    </div>
  );
}
