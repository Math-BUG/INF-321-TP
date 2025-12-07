import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("auth");

  if (!authCookie) {
    redirect("/login");
  }

  let authData;
  try {
    authData = JSON.parse(decodeURIComponent(authCookie.value));
  } catch (e) {
    redirect("/login");
  }
  if (authData?.isAdmin) {
    redirect("/manage-levels");
  }
  redirect("/challenges");
}
