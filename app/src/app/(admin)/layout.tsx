import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Navigation } from "@/components/Navigation";

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("auth");

  // Check if user is authenticated
  if (!authCookie?.value) {
    redirect("/login");
  }

  let user: { id: number; name: string; email: string; isAdmin: boolean } | null = null;
  try {
    user = JSON.parse(authCookie.value);
  } catch (e) {
    redirect("/login");
  }

  // Check if user IS an admin (required for this route)
  if (!user || !user.isAdmin) {
    redirect("/user/challenges");
  }

  const menuItems = [
    { key: "manage-users", label: "Gerenciar Usuários", href: "/manage-users" },
    { key: "manage-levels", label: "Gerenciar Níveis", href: "/manage-levels" },
  ];

  return (
    <Navigation
      userName={user?.name || "Admin"}
      userEmail={user?.email || ""}
      isAdmin={true}
      items={menuItems}
    >
      {children}
    </Navigation>
  );
}
