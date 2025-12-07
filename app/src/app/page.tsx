import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("auth");

  console.log(authCookie);

  if (!authCookie) {
    console.log("No auth cookie found");
    redirect("/login");
  }

  let authData;
  try {
    authData = JSON.parse(decodeURIComponent(authCookie.value));
  } catch (e) {
    console.log("Error parsing auth cookie:", e);
    redirect("/login");
  }
  if (authData?.isAdmin) {
    console.log("User is admin");
    redirect("/manage-levels");
  }
  redirect("/challenges");
}
