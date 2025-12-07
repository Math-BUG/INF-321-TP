import { Breadcrumb } from "antd";
import { fetchChallenges } from "../../actions/challenges";
import ChallengesList from "../../../components/ChallengesList";

export default async function ChallengesPage() {
  // Fetch initial challenges on server side
  const initialChallenges = await fetchChallenges();
  console.log(initialChallenges);

  return (
    <div>
      <Breadcrumb items={[{ title: "Desafios" }]} style={{ marginBottom: 16 }} />
      <h1>Desafios Musicais</h1>
      <ChallengesList initialChallenges={initialChallenges} />
    </div>
  );
}
