"use client";

import { Space } from "antd";
import { useRouter } from "next/navigation";
import UserInfoCard from "./UserInfoCard";
import MatchHistoryTable from "./MatchHistoryTable";
import PerformanceCharts from "./PerformanceCharts";
import type { UserProfile, MatchHistory, PerformanceData } from "../app/actions/user";

type ProfileContentProps = {
  user: UserProfile;
  matchHistory: MatchHistory[];
  performanceData: PerformanceData[];
};

export default function ProfileContent({ user, matchHistory, performanceData }: ProfileContentProps) {
  const router = useRouter();

  const handleUpdate = () => {
    router.refresh();
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%", marginTop: 24 }}>
      <UserInfoCard user={user} onUpdate={handleUpdate} />
      
      <PerformanceCharts performanceData={performanceData} />
      
      <MatchHistoryTable matches={matchHistory} />
    </Space>
  );
}
