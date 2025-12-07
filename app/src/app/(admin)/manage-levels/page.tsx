import { Breadcrumb, Empty } from "antd";

export default function ManageLevelsPage() {
  return (
    <div>
      <Breadcrumb items={[{ title: "Gerenciar Níveis" }]} style={{ marginBottom: 16 }} />
      <h1>Gerenciamento de Níveis</h1>
      <Empty description="Conteúdo de gerenciamento será implementado em breve" style={{ marginTop: 48 }} />
    </div>
  );
}
