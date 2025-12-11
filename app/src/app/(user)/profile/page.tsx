import { fetchUserProfile, fetchUserMatchHistory, fetchPerformanceData } from "../../actions/user";
import ProfileContent from "../../../components/ProfileContent";
import { redirect } from "next/navigation";
import { getAuthUser } from "../../actions/auth";
import Title from "antd/es/typography/Title";

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
      <Title level={2} style={{ marginBottom: 24 }}>Meu Perfil</Title>
      
      <ProfileContent 
        user={user} 
        matchHistory={matchHistory} 
        performanceData={performanceData} 
      />
    </div>
  );
}
