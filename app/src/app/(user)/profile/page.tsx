import { Breadcrumb } from "antd";
import { fetchUserProfile, fetchUserMatchHistory, fetchPerformanceData } from "../../actions/user";
import ProfileContent from "../../../components/ProfileContent";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  // TODO: Get userId from session/context
  const userId = 1;

  const [user, matchHistory, performanceData] = await Promise.all([
    fetchUserProfile(userId),
    fetchUserMatchHistory(userId),
    fetchPerformanceData(userId),
  ]);

  if (!user) {
    redirect("/login");
  }

  return (
    <div>
      <Breadcrumb items={[{ title: "Perfil" }]} style={{ marginBottom: 16 }} />
      <h1>Meu Perfil</h1>
      
      <ProfileContent 
        user={user} 
        matchHistory={matchHistory} 
        performanceData={performanceData} 
      />
    </div>
  );
}
