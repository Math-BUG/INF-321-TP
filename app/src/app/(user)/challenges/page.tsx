import { Breadcrumb, Empty } from "antd";

export default function ChallengesPage() {
  return (
    <div>
      <Breadcrumb items={[{ title: "Desafios" }]} style={{ marginBottom: 16 }} />
      <h1>Desafios Musicais</h1>
      <Empty description="Conteúdo de desafios será implementado em breve" style={{ marginTop: 48 }} />
    </div>
  );
}
