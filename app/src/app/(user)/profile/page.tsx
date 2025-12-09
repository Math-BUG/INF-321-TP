import { Breadcrumb } from "antd";
import { fetchUserProfile, fetchUserMatchHistory, fetchPerformanceData } from "../../actions/user";
import ProfileContent from "../../../components/ProfileContent";
import { redirect } from "next/navigation";
import { getAuthUser } from "../../actions/auth";

export default async function ProfilePage() {
  const authUser = await getAuthUser();
  
  if (!authUser) {
    redirect("/login");
  }

  const [user, matchHistory, performanceData] = await Promise.all([
    fetchUserProfile(authUser.id),
    fetchUserMatchHistory(authUser.id),
    fetchPerformanceData(authUser.id),
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
