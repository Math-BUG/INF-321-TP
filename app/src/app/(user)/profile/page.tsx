import { Breadcrumb, Empty } from "antd";

export default function ProfilePage() {
  return (
    <div>
      <Breadcrumb items={[{ title: "Perfil" }]} style={{ marginBottom: 16 }} />
      <h1>Meu Perfil</h1>
      <Empty description="Conteúdo de perfil será implementado em breve" style={{ marginTop: 48 }} />
    </div>
  );
}
