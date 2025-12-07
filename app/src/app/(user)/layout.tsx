import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Navigation } from "@/components/Navigation";

interface UserLayoutProps {
  children: ReactNode;
}

export default async function UserLayout({ children }: UserLayoutProps) {
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

  // Check if user is NOT an admin (this is a user-only route)
  if (user && user.isAdmin) {
    redirect("/manage-levels");
  }

  const menuItems = [
    { key: "challenges", label: "Desafios", href: "/challenges" },
    { key: "profile", label: "Perfil", href: "/profile" },
  ];

  return (
    <Navigation
      userName={user?.name || "Usuário"}
      userEmail={user?.email || ""}
      isAdmin={false}
      items={menuItems}
    >
      {children}
    </Navigation>
  );
}
