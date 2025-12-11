import { fetchChallenges } from "../../actions/challenges";
import ChallengesList from "../../../components/ChallengesList";
import Title from "antd/es/typography/Title";

export default async function ChallengesPage() {
  const initialChallenges = await fetchChallenges();
  console.log(initialChallenges);

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>Desafios Musicais</Title>
      <ChallengesList initialChallenges={initialChallenges} />
    </div>
  );
}
